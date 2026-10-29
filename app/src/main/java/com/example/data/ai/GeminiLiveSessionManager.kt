package com.example.data.ai

import android.annotation.SuppressLint
import android.util.Log
import com.example.data.model.AppLanguage
import com.google.firebase.Firebase
import com.google.firebase.ai.ai
import com.google.firebase.ai.type.AudioTranscriptionConfig
import com.google.firebase.ai.type.GenerativeBackend
import com.google.firebase.ai.type.LiveSession
import com.google.firebase.ai.type.PublicPreviewAPI
import com.google.firebase.ai.type.ResponseModality
import com.google.firebase.ai.type.SpeechConfig
import com.google.firebase.ai.type.Transcription
import com.google.firebase.ai.type.Voice
import com.google.firebase.ai.type.content
import com.google.firebase.ai.type.liveGenerationConfig
import kotlinx.coroutines.CancellationException
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

data class LiveSessionUiState(
    val isConnected: Boolean = false,
    val isConnecting: Boolean = false,
    val isMicStreaming: Boolean = false,
    val isModelSpeaking: Boolean = false,
    val statusMessage: String = "Tap Connect to start real-time Live Voice conversation (gemini-3.8-live via Firebase AI Logic)",
    val transcriptLog: List<Pair<String, String>> = emptyList(),
    val errorBanner: String? = null
)

/**
 * Real-time bidirectional Live Voice manager built on Firebase AI Logic (`Firebase.ai.liveModel`).
 * Protected automatically by Firebase App Check without client-side API keys.
 */
@OptIn(PublicPreviewAPI::class)
class GeminiLiveSessionManager(
    private val scope: CoroutineScope
) {
    companion object {
        private const val TAG = "GeminiLiveSession"
        const val LIVE_MODEL_ID = "gemini-3.8-live"
        private const val LIVE_MODEL_FALLBACK = "gemini-2.5-flash-live-preview"
    }

    private var liveSession: LiveSession? = null
    private var connectJob: Job? = null
    private var audioConversationJob: Job? = null

    private val _state = MutableStateFlow(LiveSessionUiState())
    val state: StateFlow<LiveSessionUiState> = _state.asStateFlow()

    fun connect(language: AppLanguage, voiceName: String, districtName: String?) {
        disconnect()
        _state.value = LiveSessionUiState(
            isConnecting = true,
            statusMessage = "Connecting to Firebase AI Live ($LIVE_MODEL_ID)…"
        )

        connectJob = scope.launch(Dispatchers.IO) {
            val contextHint = districtName?.let { " Current focus district: $it." }.orEmpty()
            val systemText = "You are Utkal Mitra Live, a warm, authoritative Odisha cultural & travel guide speaking in ${language.label} (${language.nativeLabel}). Pronounce Odisha names naturally and distinguish established history from traditional legend.$contextHint"

            val aiService = Firebase.ai(backend = GenerativeBackend.googleAI())
            var connectedSession: LiveSession? = null
            var activeModel = LIVE_MODEL_ID
            var lastError: Exception? = null

            for (candidate in listOf(LIVE_MODEL_ID, LIVE_MODEL_FALLBACK)) {
                try {
                    val liveModel = aiService.liveModel(
                        modelName = candidate,
                        generationConfig = liveGenerationConfig {
                            responseModality = ResponseModality.AUDIO
                            speechConfig = SpeechConfig(voice = Voice(voiceName))
                            inputAudioTranscription = AudioTranscriptionConfig()
                            outputAudioTranscription = AudioTranscriptionConfig()
                        },
                        systemInstruction = content { text(systemText) }
                    )
                    connectedSession = liveModel.connect()
                    activeModel = candidate
                    break
                } catch (ce: CancellationException) {
                    throw ce
                } catch (e: Exception) {
                    lastError = e
                    Log.w(TAG, "Live model connect attempt ($candidate) failed: ${e.message}")
                }
            }

            if (connectedSession != null) {
                liveSession = connectedSession
                _state.value = _state.value.copy(
                    isConnected = true,
                    isConnecting = false,
                    statusMessage = "Live connected ($activeModel • $voiceName). Tap Start Mic or send a text turn.",
                    errorBanner = null
                )
            } else {
                _state.value = _state.value.copy(
                    isConnected = false,
                    isConnecting = false,
                    statusMessage = "Live session unavailable.",
                    errorBanner = "Could not connect to Live Voice API: ${lastError?.localizedMessage ?: "Check network connectivity"}"
                )
            }
        }
    }

    fun sendLiveTextTurn(prompt: String) {
        val session = liveSession ?: return
        val trimmed = prompt.trim()
        if (trimmed.isBlank()) return
        appendTranscript("You", trimmed)
        scope.launch(Dispatchers.IO) {
            try {
                session.send(trimmed)
            } catch (ce: CancellationException) {
                throw ce
            } catch (e: Exception) {
                Log.w(TAG, "Live text turn send failed", e)
                _state.value = _state.value.copy(errorBanner = "Send failed: ${e.localizedMessage}")
            }
        }
    }

    @SuppressLint("MissingPermission")
    fun startMicStreaming() {
        val session = liveSession ?: return
        if (_state.value.isMicStreaming) return

        _state.value = _state.value.copy(
            isMicStreaming = true,
            statusMessage = "Listening live… speak naturally in Odia, Hindi, or English.",
            errorBanner = null
        )

        audioConversationJob = scope.launch(Dispatchers.IO) {
            try {
                session.startAudioConversation(
                    functionCallHandler = null,
                    transcriptHandler = ::handleTranscription
                )
            } catch (ce: CancellationException) {
                throw ce
            } catch (e: Exception) {
                Log.e(TAG, "Live audio conversation error", e)
                _state.value = _state.value.copy(
                    isMicStreaming = false,
                    isModelSpeaking = false,
                    errorBanner = "Live audio error: ${e.localizedMessage}"
                )
            }
        }
    }

    private fun handleTranscription(input: Transcription?, output: Transcription?) {
        input?.text?.takeIf { it.isNotBlank() }?.let { userSpeech ->
            appendTranscript("You (Voice)", userSpeech)
        }
        output?.text?.takeIf { it.isNotBlank() }?.let { modelSpeech ->
            _state.value = _state.value.copy(isModelSpeaking = true)
            appendTranscript("Utkal Mitra Live", modelSpeech)
        }
    }

    fun stopMicStreaming() {
        audioConversationJob?.cancel()
        audioConversationJob = null
        val session = liveSession
        if (session != null) {
            scope.launch(Dispatchers.IO) {
                runCatching { session.stopAudioConversation() }
            }
        }
        if (_state.value.isMicStreaming) {
            _state.value = _state.value.copy(
                isMicStreaming = false,
                isModelSpeaking = false,
                statusMessage = if (_state.value.isConnected) "Mic muted. Live session ready." else "Disconnected."
            )
        }
    }

    fun disconnect() {
        connectJob?.cancel()
        connectJob = null
        stopMicStreaming()
        val session = liveSession
        liveSession = null
        if (session != null) {
            scope.launch(Dispatchers.IO) {
                runCatching { session.stopReceiving() }
                runCatching { session.close() }
            }
        }
        _state.value = LiveSessionUiState()
    }

    private fun appendTranscript(speaker: String, text: String) {
        val current = _state.value.transcriptLog.toMutableList()
        current.add(speaker to text.trim())
        _state.value = _state.value.copy(transcriptLog = current.takeLast(24))
    }
}
