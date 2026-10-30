import { fetchApi } from '../utils/apiConfig';
import {
  selectBestBrowserVoiceAndText,
  ensureBrowserVoicesReady,
  type BrowserVoiceSelection,
} from '../utils/indicPhoneticBridge';
import { getStoryAudioUrl } from '../data/storyAudioMap';

export type SupportedVoiceLang = 'en' | 'or' | 'hi';

export interface PlaySpeechRequest {
  text: string;
  lang: SupportedVoiceLang;
  storyId?: string;
  audioUrl?: string;
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
  engine: 'offline-bundled' | 'cloud-tts' | 'browser-speech' | 'none';
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
  private audioPreloadCache = new Map<string, HTMLAudioElement>();
  private speechQueue: string[] = [];
  private isSpeechQueueActive = false;

  public preloadAudio(url: string): void {
    if (typeof window === 'undefined' || !url || this.audioPreloadCache.has(url)) return;
    try {
      const audio = new Audio();
      audio.preload = 'auto';
      audio.src = url;
      this.audioPreloadCache.set(url, audio);
    } catch {}
  }

  public isSpeaking(): boolean {
    return this.isSpeakingInternal;
  }

  public seek(positionSec: number): void {
    if (this.currentAudio && Number.isFinite(positionSec)) {
      try {
        this.currentAudio.currentTime = Math.max(
          0,
          Math.min(this.currentAudio.duration || 0, positionSec)
        );
      } catch {}
    }
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

    this.isSpeechQueueActive = false;
    this.speechQueue = [];

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
   * Pauses currently active audio or speech synthesis
   */
  public pause(): void {
    if (this.currentAudio && !this.currentAudio.paused) {
      try {
        this.currentAudio.pause();
      } catch {}
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window && window.speechSynthesis.speaking) {
      try {
        window.speechSynthesis.pause();
      } catch {}
    }
    this.notify(false);
  }

  /**
   * Resumes paused audio playback or speech synthesis
   */
  public resume(): void {
    if (this.currentAudio && this.currentAudio.paused) {
      try {
        this.currentAudio.play().catch(() => {});
        this.notify(true);
      } catch {}
    } else if (typeof window !== 'undefined' && 'speechSynthesis' in window && window.speechSynthesis.paused) {
      try {
        window.speechSynthesis.resume();
        this.notify(true);
      } catch {}
    }
  }

  /**
   * Unified speech entry point used by all voice features in UtkalSarathi.
   * Priority order:
   * 1. High-fidelity bundled studio audio (.wav) if available (100% offline, crystal-clear human voice)
   * 2. Live neural Gemini TTS from backend (/api/tts)
   * 3. On-device Indic phonetic speech synthesis with Devanagari mapping and natural pitch 1.0
   */
  public async speak(request: PlaySpeechRequest): Promise<PlaySpeechResult> {
    const {
      text,
      lang,
      playbackSpeed = 1.0,
      onStart,
      onEnded,
      onTimeUpdate,
    } = request;

    if (!text || !text.trim()) {
      return { success: false, engine: 'none', voiceLabel: 'None', error: 'No text provided' };
    }

    // Synchronously prime speech synthesis and audio context within user touch gesture
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.resume();
      } catch {}
    }

    // 1. Immediately stop any previous audio or speech
    this.stopAll();

    // 2. Prepare network abort controller
    const abortController = new AbortController();
    this.activeAbortController = abortController;

    // Normal natural playback rate (constrained within sensible bounds 0.8x to 1.3x)
    const normalizedRate = Math.max(0.8, Math.min(1.3, Number(playbackSpeed) || 1.0));

    // 3. Priority 1: Check if pre-rendered studio WAV is available
    const bundledAudioUrl =
      request.audioUrl || (request.storyId ? getStoryAudioUrl(request.storyId, lang) : null);

    if (bundledAudioUrl) {
      try {
        let audio = this.audioPreloadCache.get(bundledAudioUrl);
        if (!audio) {
          audio = new Audio(bundledAudioUrl);
          audio.preload = 'auto';
          this.audioPreloadCache.set(bundledAudioUrl, audio);
        } else {
          try {
            audio.currentTime = 0;
          } catch {}
        }
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
              engine: 'offline-bundled',
              voiceLabel: `Studio Heritage Voice (${lang.toUpperCase()})`,
            });
          };

          audio.onerror = () => {
            this.currentAudio = null;
            // Fall back to server TTS or device TTS if bundled file fails
            this.proceedWithServerOrBrowserSpeech(
              request,
              normalizedRate,
              abortController
            ).then(resolve);
          };

          const playPromise = audio.play();
          if (playPromise !== undefined) {
            playPromise.catch(() => {
              this.currentAudio = null;
              this.proceedWithServerOrBrowserSpeech(
                request,
                normalizedRate,
                abortController
              ).then(resolve);
            });
          }
        });
      } catch {
        // Fall through
      }
    }

    return this.proceedWithServerOrBrowserSpeech(request, normalizedRate, abortController);
  }

  private async proceedWithServerOrBrowserSpeech(
    request: PlaySpeechRequest,
    normalizedRate: number,
    abortController: AbortController
  ): Promise<PlaySpeechResult> {
    const {
      text,
      lang,
      persona = 'utkal-mitra',
      allowPhoneticFallback = false,
      onStart,
      onEnded,
      onError,
      onTimeUpdate,
    } = request;

    // Attempt Server TTS (Gemini Neural / High Definition voice) with strict 1500ms timeout
    let ttsTimeoutId: any = null;
    try {
      const fetchPromise = fetchApi('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: text.slice(0, 1200),
          lang,
          persona,
        }),
        signal: abortController.signal,
      });

      const timeoutPromise = new Promise<never>((_, reject) => {
        ttsTimeoutId = setTimeout(() => {
          try {
            abortController.abort();
          } catch {}
          reject(new Error('Cloud TTS timeout: gesture preserved'));
        }, 1500);
      });

      const response = await Promise.race([fetchPromise, timeoutPromise]);
      if (ttsTimeoutId) clearTimeout(ttsTimeoutId);

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
    } finally {
      if (ttsTimeoutId) {
        clearTimeout(ttsTimeoutId);
        ttsTimeoutId = null;
      }
    }

    // Fallback to Browser Speech Synthesis
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
   * Uses sentence chunking to completely prevent Android Chrome's 15s pause bug
   * without introducing artificial pause/resume interruptions.
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

    const voices = await ensureBrowserVoicesReady(1000);
    const selection: BrowserVoiceSelection = selectBestBrowserVoiceAndText(
      text,
      lang,
      voices,
      'male',
      0
    );

    // Natural cadence adjustment: Odia speech is crisper and slightly brisker
    const effectiveRate = lang === 'or' ? Math.min(1.25, rate * 1.08) : rate;

    // Split text into natural sentence units for smooth continuous flow on mobile
    const rawChunks = selection.spokenText
      .split(/([।\.!\?\n]+)/)
      .filter((s) => s.trim().length > 0);
    const sentences: string[] = [];
    for (let i = 0; i < rawChunks.length; i += 2) {
      const sentence = (rawChunks[i] + (rawChunks[i + 1] || '')).trim();
      if (sentence) sentences.push(sentence);
    }
    if (sentences.length === 0) {
      sentences.push(selection.spokenText);
    }

    this.speechQueue = [...sentences];
    this.isSpeechQueueActive = true;

    return new Promise<PlaySpeechResult>((resolve) => {
      let chunkIndex = 0;
      let hasStarted = false;

      const speakNextChunk = () => {
        if (!this.isSpeechQueueActive || chunkIndex >= this.speechQueue.length) {
          this.isSpeechQueueActive = false;
          this.notify(false);
          this.currentUtterance = null;
          onEnded?.();
          resolve({
            success: true,
            engine: 'browser-speech',
            voiceLabel: selection.voice?.name || selection.langTag,
          });
          return;
        }

        const currentText = this.speechQueue[chunkIndex];
        try {
          const utterance = new SpeechSynthesisUtterance(currentText);
          if (selection.voice) {
            utterance.voice = selection.voice;
          }
          utterance.lang = selection.langTag;
          utterance.pitch = 1.0;
          utterance.rate = effectiveRate;

          utterance.onstart = () => {
            if (!hasStarted) {
              hasStarted = true;
              this.notify(true);
              onStart?.();
            }
          };

          utterance.onend = () => {
            chunkIndex++;
            speakNextChunk();
          };

          utterance.onerror = (e) => {
            if (e.error === 'interrupted' || e.error === 'canceled') {
              // Expected when stopping or skipping
              this.isSpeechQueueActive = false;
              this.notify(false);
              this.currentUtterance = null;
              resolve({
                success: false,
                engine: 'browser-speech',
                voiceLabel: 'Cancelled',
                error: e.error,
              });
              return;
            }

            // Retry or proceed to next sentence
            chunkIndex++;
            if (chunkIndex < this.speechQueue.length) {
              speakNextChunk();
            } else {
              this.isSpeechQueueActive = false;
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
            }
          };

          this.currentUtterance = utterance;
          window.speechSynthesis.speak(utterance);
        } catch (err: any) {
          this.isSpeechQueueActive = false;
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
      };

      try {
        window.speechSynthesis.cancel();
        speakNextChunk();
      } catch (err: any) {
        this.isSpeechQueueActive = false;
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
