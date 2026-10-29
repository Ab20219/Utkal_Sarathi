package com.example.data.voice

import android.content.Context
import android.media.AudioAttributes
import android.media.AudioFocusRequest
import android.media.AudioManager
import android.media.MediaPlayer
import android.media.PlaybackParams
import android.os.Build
import android.speech.tts.TextToSpeech
import android.speech.tts.UtteranceProgressListener
import android.util.Log
import com.example.data.ai.GeminiServiceClient
import com.example.data.model.AppLanguage
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import java.io.File
import java.security.MessageDigest
import java.util.Locale

data class NarratorVoiceProfile(
    val id: String,
    val displayName: String,
    val subtitle: String
)

data class NarrationUiState(
    val isSynthesizing: Boolean = false,
    val isPlaying: Boolean = false,
    val isPaused: Boolean = false,
    val activeTitle: String = "",
    val activeTranscript: String = "",
    val activeLanguage: AppLanguage = AppLanguage.ENGLISH,
    val activeVoiceProfile: String = "Charon",
    val playbackSpeed: Float = 1.0f,
    val activeEngineLabel: String = "Ready",
    val cachedFilePath: String? = null,
    val errorNote: String? = null
)

/**
 * End-to-end voice narration pipeline for Utkal Mitra AI and Utkal Katha:
 * 1. Checks offline/cached WAV file in `filesDir/narration_cache/` first for instant zero-network playback.
 * 2. Synthesizes rich natural narration via `gemini-3.8-flash-tts` (voices: Charon, Orus, Kore) without artificial pitch distortion.
 * 3. Manages Android AudioFocus so incoming calls or notifications cleanly pause/duck narration.
 * 4. Provides transparent Android `TextToSpeech` or text-transcript fallback if offline or API key is absent,
 *    explicitly checking Odia (`or-IN`) locale availability rather than faking support.
 */
class UtkalVoiceNarrator(
    context: Context,
    private val geminiClient: GeminiServiceClient,
    private val scope: CoroutineScope
) {
    companion object {
        private const val TAG = "UtkalVoiceNarrator"
        val VOICE_PROFILES = listOf(
            NarratorVoiceProfile("Charon", "Charon — Deep Heritage Narrator", "Warm, mature, authoritative male-presenting documentary tone"),
            NarratorVoiceProfile("Orus", "Orus — Resonant Baritone", "Calm, measured historical guide voice"),
            NarratorVoiceProfile("Kore", "Kore — Clear Expressive Guide", "Crisp, articulate cultural storyteller")
        )
    }

    private val appContext = context.applicationContext
    private val audioManager = appContext.getSystemService(Context.AUDIO_SERVICE) as AudioManager
    private val cacheDir = File(appContext.filesDir, "narration_cache").apply { mkdirs() }

    private var mediaPlayer: MediaPlayer? = null
    private var systemTts: TextToSpeech? = null
    private var systemTtsReady = false
    private var focusRequest: AudioFocusRequest? = null

    private val _state = MutableStateFlow(NarrationUiState())
    val state: StateFlow<NarrationUiState> = _state.asStateFlow()

    init {
        runCatching {
            systemTts = TextToSpeech(appContext) { status ->
                systemTtsReady = (status == TextToSpeech.SUCCESS)
            }
        }.onFailure {
            Log.w(TAG, "System TTS init unavailable in current environment", it)
        }
    }

    private val focusChangeListener = AudioManager.OnAudioFocusChangeListener { change ->
        when (change) {
            AudioManager.AUDIOFOCUS_LOSS,
            AudioManager.AUDIOFOCUS_LOSS_TRANSIENT -> pause()
            AudioManager.AUDIOFOCUS_LOSS_TRANSIENT_CAN_DUCK -> mediaPlayer?.setVolume(0.25f, 0.25f)
            AudioManager.AUDIOFOCUS_GAIN -> mediaPlayer?.setVolume(1.0f, 1.0f)
        }
    }

    fun speak(
        cacheKey: String,
        title: String,
        text: String,
        language: AppLanguage,
        voiceProfile: String,
        speed: Float,
        onCachedFileReady: ((File) -> Unit)? = null
    ) {
        if (text.isBlank()) return
        stop()

        val safeSpeed = speed.coerceIn(0.75f, 1.5f)
        val hashedKey = sha1Short("$cacheKey|$language|$voiceProfile|${text.hashCode()}")
        val targetWavFile = File(cacheDir, "utkal_${language.code}_${voiceProfile.lowercase()}_$hashedKey.wav")

        _state.value = NarrationUiState(
            isSynthesizing = true,
            activeTitle = title,
            activeTranscript = text,
            activeLanguage = language,
            activeVoiceProfile = voiceProfile,
            playbackSpeed = safeSpeed,
            activeEngineLabel = "Preparing ${language.label} narration…"
        )

        scope.launch {
            if (targetWavFile.exists() && targetWavFile.length() > 128) {
                playWavFile(targetWavFile, safeSpeed, "Offline Cached Neural Audio (${GeminiServiceClient.MODEL_TTS} • $voiceProfile)")
                onCachedFileReady?.invoke(targetWavFile)
                return@launch
            }

            val result = geminiClient.synthesizeDeepVoiceTtsToWav(
                textToSpeak = text,
                language = language,
                voiceName = voiceProfile,
                outputFile = targetWavFile
            )
            result.onSuccess { wav ->
                playWavFile(wav, safeSpeed, "Firebase AI Deep Voice (${GeminiServiceClient.MODEL_TTS} • $voiceProfile)")
                onCachedFileReady?.invoke(wav)
                return@launch
            }.onFailure { err ->
                Log.w(TAG, "Neural TTS unavailable, evaluating local fallback", err)
            }

            // Fallback to Android on-device TTS with honest Odia/Hindi language capability verification
            speakWithDeviceFallback(text, language, safeSpeed)
        }
    }

    private fun playWavFile(file: File, speed: Float, engineLabel: String) {
        try {
            requestAudioFocus()
            val player = MediaPlayer().apply {
                setAudioAttributes(
                    AudioAttributes.Builder()
                        .setUsage(AudioAttributes.USAGE_MEDIA)
                        .setContentType(AudioAttributes.CONTENT_TYPE_SPEECH)
                        .build()
                )
                setDataSource(file.absolutePath)
                prepare()
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                    runCatching {
                        playbackParams = PlaybackParams().setSpeed(speed).setPitch(1.0f) // Never distort pitch artificially
                    }
                }
                setOnCompletionListener {
                    _state.value = _state.value.copy(isPlaying = false, isPaused = false)
                    abandonAudioFocus()
                }
                start()
            }
            mediaPlayer = player
            _state.value = _state.value.copy(
                isSynthesizing = false,
                isPlaying = true,
                isPaused = false,
                activeEngineLabel = engineLabel,
                cachedFilePath = file.absolutePath,
                errorNote = null
            )
        } catch (e: Exception) {
            Log.e(TAG, "WAV MediaPlayer error", e)
            _state.value = _state.value.copy(
                isSynthesizing = false,
                isPlaying = false,
                errorNote = "Audio playback failed (${e.localizedMessage}). Full transcript displayed below."
            )
        }
    }

    private fun speakWithDeviceFallback(text: String, language: AppLanguage, speed: Float) {
        val tts = systemTts
        if (!systemTtsReady || tts == null) {
            _state.value = _state.value.copy(
                isSynthesizing = false,
                isPlaying = false,
                activeEngineLabel = "Transcript-Only Mode",
                errorNote = "Offline and device TTS engine is not installed; full transcript is displayed below."
            )
            return
        }

        val locale = Locale.forLanguageTag(language.localeTag)
        val availability = tts.isLanguageAvailable(locale)
        if (availability == TextToSpeech.LANG_MISSING_DATA || availability == TextToSpeech.LANG_NOT_SUPPORTED) {
            // Honest disclosure required by Master Prompt Section 7: never fake Odia pronunciation with wrong locale
            _state.value = _state.value.copy(
                isSynthesizing = false,
                isPlaying = false,
                activeEngineLabel = "Text Transcript Fallback (${language.label} voice pack missing)",
                errorNote = "High-quality ${language.label} (${language.localeTag}) voice requires internet connectivity (${GeminiServiceClient.MODEL_TTS}) or installing the ${language.label} Android TTS voice pack. Avoiding unnatural cross-language pronunciation."
            )
            return
        }

        requestAudioFocus()
        tts.language = locale
        tts.setSpeechRate(speed)
        tts.setPitch(1.0f) // Natural pitch without metallic bass distortion
        tts.setOnUtteranceProgressListener(object : UtteranceProgressListener() {
            override fun onStart(utteranceId: String?) {
                _state.value = _state.value.copy(isSynthesizing = false, isPlaying = true, isPaused = false)
            }

            override fun onDone(utteranceId: String?) {
                _state.value = _state.value.copy(isPlaying = false, isPaused = false)
                abandonAudioFocus()
            }

            @Deprecated("Deprecated in Java")
            override fun onError(utteranceId: String?) {
                _state.value = _state.value.copy(
                    isSynthesizing = false,
                    isPlaying = false,
                    errorNote = "Device speech synthesis interrupted; transcript remains readable."
                )
            }
        })

        _state.value = _state.value.copy(
            isSynthesizing = false,
            isPlaying = true,
            activeEngineLabel = "On-Device Android TTS (${language.localeTag} Offline Fallback)"
        )
        tts.speak(text.take(3800), TextToSpeech.QUEUE_FLUSH, null, "utkal_utt_${System.currentTimeMillis()}")
    }

    fun pause() {
        mediaPlayer?.let {
            if (it.isPlaying) {
                it.pause()
                _state.value = _state.value.copy(isPlaying = false, isPaused = true)
            }
        }
        if (systemTts?.isSpeaking == true) {
            systemTts?.stop()
            _state.value = _state.value.copy(isPlaying = false, isPaused = false)
        }
    }

    fun resume() {
        mediaPlayer?.let {
            if (_state.value.isPaused) {
                requestAudioFocus()
                it.start()
                _state.value = _state.value.copy(isPlaying = true, isPaused = false)
            }
        }
    }

    fun replay() {
        val current = _state.value
        val cached = current.cachedFilePath?.let { File(it) }
        if (cached != null && cached.exists()) {
            stop()
            _state.value = current
            playWavFile(cached, current.playbackSpeed, current.activeEngineLabel)
        } else if (current.activeTranscript.isNotBlank()) {
            speak(
                cacheKey = current.activeTitle,
                title = current.activeTitle,
                text = current.activeTranscript,
                language = current.activeLanguage,
                voiceProfile = current.activeVoiceProfile,
                speed = current.playbackSpeed
            )
        }
    }

    fun updateSpeed(newSpeed: Float) {
        val clamped = newSpeed.coerceIn(0.75f, 1.5f)
        _state.value = _state.value.copy(playbackSpeed = clamped)
        mediaPlayer?.let { player ->
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M && player.isPlaying) {
                runCatching {
                    player.playbackParams = PlaybackParams().setSpeed(clamped).setPitch(1.0f)
                }
            }
        }
    }

    fun stop() {
        runCatching {
            mediaPlayer?.stop()
            mediaPlayer?.release()
        }
        mediaPlayer = null
        runCatching { systemTts?.stop() }
        abandonAudioFocus()
        _state.value = _state.value.copy(isSynthesizing = false, isPlaying = false, isPaused = false)
    }

    fun release() {
        stop()
        runCatching { systemTts?.shutdown() }
    }

    private fun requestAudioFocus() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val req = AudioFocusRequest.Builder(AudioManager.AUDIOFOCUS_GAIN_TRANSIENT_MAY_DUCK)
                .setAudioAttributes(
                    AudioAttributes.Builder()
                        .setUsage(AudioAttributes.USAGE_MEDIA)
                        .setContentType(AudioAttributes.CONTENT_TYPE_SPEECH)
                        .build()
                )
                .setOnAudioFocusChangeListener(focusChangeListener)
                .build()
            focusRequest = req
            audioManager.requestAudioFocus(req)
        } else {
            @Suppress("DEPRECATION")
            audioManager.requestAudioFocus(
                focusChangeListener,
                AudioManager.STREAM_MUSIC,
                AudioManager.AUDIOFOCUS_GAIN_TRANSIENT_MAY_DUCK
            )
        }
    }

    private fun abandonAudioFocus() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            focusRequest?.let { audioManager.abandonAudioFocusRequest(it) }
        } else {
            @Suppress("DEPRECATION")
            audioManager.abandonAudioFocus(focusChangeListener)
        }
    }

    private fun sha1Short(input: String): String {
        val bytes = MessageDigest.getInstance("SHA-1").digest(input.toByteArray(Charsets.UTF_8))
        return bytes.take(8).joinToString("") { "%02x".format(it) }
    }
}
