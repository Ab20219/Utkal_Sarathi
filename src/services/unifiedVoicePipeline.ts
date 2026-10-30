import { fetchApi } from '../utils/apiConfig';
import {
  selectBestBrowserVoiceAndText,
  type BrowserVoiceSelection,
} from '../utils/indicPhoneticBridge';

export type SupportedVoiceLang = 'en' | 'or' | 'hi';

export interface PlaySpeechRequest {
  text: string;
  lang: SupportedVoiceLang;
  persona?: string;
  playbackSpeed?: number;
  allowPhoneticFallback?: boolean;
  onStart?: () => void;
  onEnded?: () => void;
  onError?: (err: Error) => void;
  onTimeUpdate?: (elapsedSec: number, durationSec: number) => void;
}

export interface PlaySpeechResult {
  success: boolean;
  engine: 'cloud-tts' | 'browser-speech' | 'none';
  voiceLabel: string;
  notice?: string;
  error?: string;
}

function writeAsciiString(view: DataView, offset: number, string: string): void {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}

/**
 * Checks if a base64 string or byte array starts with a valid RIFF...WAVE container header
 */
export function isRiffWavContainer(base64Payload: string): boolean {
  if (!base64Payload || base64Payload.length < 16) return false;
  try {
    const rawHead = atob(base64Payload.slice(0, 24));
    return (
      rawHead.length >= 12 &&
      rawHead.charCodeAt(0) === 0x52 && // 'R'
      rawHead.charCodeAt(1) === 0x49 && // 'I'
      rawHead.charCodeAt(2) === 0x46 && // 'F'
      rawHead.charCodeAt(3) === 0x46 && // 'F'
      rawHead.charCodeAt(8) === 0x57 && // 'W'
      rawHead.charCodeAt(9) === 0x41 && // 'A'
      rawHead.charCodeAt(10) === 0x56 && // 'V'
      rawHead.charCodeAt(11) === 0x45 // 'E'
    );
  } catch {
    return false;
  }
}

/**
 * Safely constructs a 44-byte standard RIFF/WAVE header for raw linear PCM (16-bit mono 24kHz)
 * without adding duplicate headers if the audio already has a WAV container.
 */
export function wrapPcm16InWavHeader(pcmBase64: string, sampleRate = 24000): string {
  if (isRiffWavContainer(pcmBase64)) {
    return `data:audio/wav;base64,${pcmBase64}`;
  }

  const binary = atob(pcmBase64);
  const numSamples = Math.floor(binary.length / 2);
  const pcmBytes = numSamples * 2;

  const buffer = new ArrayBuffer(44 + pcmBytes);
  const view = new DataView(buffer);

  // RIFF container descriptor
  writeAsciiString(view, 0, 'RIFF');
  view.setUint32(4, 36 + pcmBytes, true);
  writeAsciiString(view, 8, 'WAVE');

  // fmt sub-chunk
  writeAsciiString(view, 12, 'fmt ');
  view.setUint32(16, 16, true); // Subchunk1Size for PCM
  view.setUint16(20, 1, true); // AudioFormat 1 = PCM
  view.setUint16(22, 1, true); // 1 Channel (Mono)
  view.setUint32(24, sampleRate, true); // Sample rate (24000)
  view.setUint32(28, sampleRate * 2, true); // Byte rate (SampleRate * 1 * 16/8)
  view.setUint16(32, 2, true); // Block align (1 * 16/8)
  view.setUint16(34, 16, true); // Bits per sample (16-bit)

  // data sub-chunk
  writeAsciiString(view, 36, 'data');
  view.setUint32(40, pcmBytes, true);

  // Copy PCM samples
  const uint8 = new Uint8Array(buffer, 44);
  for (let i = 0; i < pcmBytes; i++) {
    uint8[i] = binary.charCodeAt(i);
  }

  // Base64 encode the complete container
  const fullBytes = new Uint8Array(buffer);
  let binaryStr = '';
  const chunkSize = 0x8000;
  for (let i = 0; i < fullBytes.length; i += chunkSize) {
    binaryStr += String.fromCharCode.apply(null, Array.from(fullBytes.subarray(i, i + chunkSize)));
  }

  return `data:audio/wav;base64,${btoa(binaryStr)}`;
}

/**
 * Log safe runtime diagnostics without exposing secrets, payload bodies, or personal speech text.
 */
function logSafeVoiceDiagnostic(
  context: string,
  details: {
    engine: string;
    lang: string;
    mimeType?: string;
    payloadLength?: number;
    startsWithRIFF?: boolean;
    voiceName?: string;
    mode?: string;
  }
): void {
  console.log(
    `[UnifiedVoicePipeline] [${context}] engine=${details.engine} lang=${details.lang} mime=${details.mimeType || 'n/a'} bytes=${details.payloadLength ?? 'n/a'} startsWithRIFF=${details.startsWithRIFF ?? 'n/a'} voice=${details.voiceName || 'n/a'} mode=${details.mode || 'standard'}`
  );
}

class UnifiedVoicePipelineService {
  private currentAudio: HTMLAudioElement | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private activeAbortController: AbortController | null = null;
  private isSpeakingInternal = false;
  private listeners = new Set<(isSpeaking: boolean) => void>();

  public isSpeaking(): boolean {
    return this.isSpeakingInternal;
  }

  public subscribe(listener: (isSpeaking: boolean) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(isSpeaking: boolean): void {
    this.isSpeakingInternal = isSpeaking;
    this.listeners.forEach((l) => {
      try {
        l(isSpeaking);
      } catch {}
    });
  }

  /**
   * Completely stops any currently playing voice from any engine (HTML5 Audio or Web Speech API),
   * aborts in-flight network requests, and resets state.
   * Guarantees no two voices can ever play simultaneously.
   */
  public stopAll(): void {
    if (this.activeAbortController) {
      try {
        this.activeAbortController.abort();
      } catch {}
      this.activeAbortController = null;
    }

    if (this.currentAudio) {
      try {
        this.currentAudio.pause();
        this.currentAudio.currentTime = 0;
        this.currentAudio.src = '';
        this.currentAudio.onplay = null;
        this.currentAudio.onplaying = null;
        this.currentAudio.onended = null;
        this.currentAudio.onerror = null;
        this.currentAudio.ontimeupdate = null;
      } catch {}
      this.currentAudio = null;
    }

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {}
      this.currentUtterance = null;
    }

    this.notify(false);
  }

  /**
   * Unified speech entry point used by all voice features in UtkalSarathi.
   */
  public async speak(request: PlaySpeechRequest): Promise<PlaySpeechResult> {
    const {
      text,
      lang,
      persona = 'utkal-mitra',
      playbackSpeed = 1.0,
      allowPhoneticFallback = false,
      onStart,
      onEnded,
      onError,
      onTimeUpdate,
    } = request;

    if (!text || !text.trim()) {
      return { success: false, engine: 'none', voiceLabel: 'None', error: 'No text provided' };
    }

    // 1. Immediately stop any previous audio or speech
    this.stopAll();

    // 2. Prepare network abort controller
    const abortController = new AbortController();
    this.activeAbortController = abortController;

    // Normal natural playback rate (constrained within sensible bounds 0.8x to 1.3x)
    const normalizedRate = Math.max(0.8, Math.min(1.3, Number(playbackSpeed) || 1.0));

    // 3. Attempt Server TTS (Gemini Neural / High Definition voice)
    try {
      const response = await fetchApi('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: text.slice(0, 1200),
          lang,
          persona,
        }),
        signal: abortController.signal,
      });

      if (response.ok) {
        const data = await response.json();
        if (data?.audioBase64) {
          const rawMime = data.mimeType || 'audio/wav';
          const isRiff = isRiffWavContainer(data.audioBase64);

          logSafeVoiceDiagnostic('CloudTTSReceived', {
            engine: 'cloud-tts',
            lang,
            mimeType: rawMime,
            payloadLength: data.audioBase64.length,
            startsWithRIFF: isRiff,
            voiceName: data.voiceName,
          });

          // Build proper container URL
          let audioSrc: string;
          if (rawMime.includes('audio/mp3') || rawMime.includes('audio/mpeg')) {
            audioSrc = `data:audio/mp3;base64,${data.audioBase64}`;
          } else {
            // Guarantee valid WAV container header with 24000Hz PCM
            audioSrc = wrapPcm16InWavHeader(data.audioBase64, 24000);
          }

          const audio = new Audio(audioSrc);
          audio.playbackRate = normalizedRate;
          this.currentAudio = audio;

          return new Promise<PlaySpeechResult>((resolve) => {
            let started = false;

            audio.onplay = () => {
              if (started) return;
              started = true;
              this.notify(true);
              onStart?.();
            };

            audio.ontimeupdate = () => {
              if (Number.isFinite(audio.duration) && audio.duration > 0) {
                onTimeUpdate?.(audio.currentTime, audio.duration);
              }
            };

            audio.onended = () => {
              this.notify(false);
              this.currentAudio = null;
              onEnded?.();
              resolve({
                success: true,
                engine: 'cloud-tts',
                voiceLabel: `${data.voiceName || 'Gemini'} (${data.narrator || 'UtkalSarathi'})`,
              });
            };

            audio.onerror = () => {
              logSafeVoiceDiagnostic('CloudPlaybackError', {
                engine: 'cloud-tts',
                lang,
                mimeType: rawMime,
              });
              this.currentAudio = null;
              // Fallback to browser speech on audio element decoding error
              this.fallbackBrowserSpeech(
                text,
                lang,
                normalizedRate,
                allowPhoneticFallback,
                onStart,
                onEnded,
                onError
              ).then(resolve);
            };

            audio.play().catch(() => {
              this.currentAudio = null;
              this.fallbackBrowserSpeech(
                text,
                lang,
                normalizedRate,
                allowPhoneticFallback,
                onStart,
                onEnded,
                onError
              ).then(resolve);
            });
          });
        }
      }
    } catch (err: any) {
      if (err?.name === 'AbortError') {
        return {
          success: false,
          engine: 'none',
          voiceLabel: 'Cancelled',
          error: 'Playback aborted',
        };
      }
      logSafeVoiceDiagnostic('CloudFetchFailed', {
        engine: 'cloud-tts',
        lang,
        mode: err?.message || 'NetworkError',
      });
    }

    // 4. Fallback to Browser Speech Synthesis
    return this.fallbackBrowserSpeech(
      text,
      lang,
      normalizedRate,
      allowPhoneticFallback,
      onStart,
      onEnded,
      onError
    );
  }

  /**
   * Browser Speech Synthesis Fallback with genuine language fidelity rules.
   */
  private async fallbackBrowserSpeech(
    text: string,
    lang: SupportedVoiceLang,
    rate: number,
    allowPhoneticFallback: boolean,
    onStart?: () => void,
    onEnded?: () => void,
    onError?: (err: Error) => void
  ): Promise<PlaySpeechResult> {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      const msg = 'Speech synthesis unavailable on this device.';
      onError?.(new Error(msg));
      return { success: false, engine: 'none', voiceLabel: 'Unavailable', notice: msg };
    }

    const voices = window.speechSynthesis.getVoices();
    const selection: BrowserVoiceSelection = selectBestBrowserVoiceAndText(
      text,
      lang,
      voices,
      'male',
      0
    );

    // If device doesn't have native Odia voice:
    // 1. Prefer Hindi voice with Devanagari phonetic conversion (sounds very close to Odia, warm & natural).
    // 2. If no Indian voice is installed at all, speak the clean text without pitch warping.
    return new Promise<PlaySpeechResult>((resolve) => {
      try {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(selection.spokenText);
        if (selection.voice) {
          utterance.voice = selection.voice;
        }
        utterance.lang = selection.langTag;
        // Pitch locked to natural human pitch (1.0) to eliminate squeaky alien distortion
        utterance.pitch = 1.0;
        utterance.rate = rate; // Natural normal reading speed

        utterance.onstart = () => {
          this.notify(true);
          onStart?.();
        };

        utterance.onend = () => {
          this.notify(false);
          this.currentUtterance = null;
          onEnded?.();
          resolve({
            success: true,
            engine: 'browser-speech',
            voiceLabel: selection.voice?.name || selection.langTag,
          });
        };

        utterance.onerror = (e) => {
          this.notify(false);
          this.currentUtterance = null;
          const err = new Error(`Speech synthesis error: ${e.error}`);
          onError?.(err);
          resolve({
            success: false,
            engine: 'browser-speech',
            voiceLabel: 'Error',
            error: e.error,
          });
        };

        this.currentUtterance = utterance;
        window.speechSynthesis.speak(utterance);
      } catch (err: any) {
        this.notify(false);
        this.currentUtterance = null;
        onError?.(err);
        resolve({
          success: false,
          engine: 'browser-speech',
          voiceLabel: 'Failed',
          error: err?.message || 'Speech synthesis failed',
        });
      }
    });
  }
}

export const unifiedVoicePipeline = new UnifiedVoicePipelineService();
