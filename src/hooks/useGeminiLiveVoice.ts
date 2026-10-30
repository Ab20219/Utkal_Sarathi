import { useState, useRef, useCallback, useEffect } from 'react';
import {
  getApiBaseUrl,
  getNativeBackendCandidates,
  isCapacitorNative,
} from '../utils/apiConfig';

export interface UseGeminiLiveVoiceOptions {
  lang: 'en' | 'or' | 'hi';
  persona?: string;
  greetOnConnect?: boolean;
  onTurnCompleted?: (userTranscript: string, assistantTranscript: string) => void;
}

export interface UseGeminiLiveVoiceReturn {
  isLiveActive: boolean;
  isConnecting: boolean;
  isModelSpeaking: boolean;
  isMicMuted: boolean;
  micLevel: number;
  liveUserTranscript: string;
  liveAssistantTranscript: string;
  liveVoiceLabel: string;
  liveError: string | null;
  startLiveSession: (overrideLang?: 'en' | 'or' | 'hi') => Promise<void>;
  stopLiveSession: () => void;
  toggleMicMute: () => void;
  sendLiveTextPrompt: (text: string) => void;
}

function float32ToPcm16Base64(float32: Float32Array): string {
  const int16 = new Int16Array(float32.length);
  for (let i = 0; i < float32.length; i++) {
    const clamped = Math.max(-1, Math.min(1, float32[i]));
    int16[i] = clamped < 0 ? clamped * 0x8000 : clamped * 0x7fff;
  }
  const bytes = new Uint8Array(int16.buffer);
  let binary = '';
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const slice = bytes.subarray(i, i + chunkSize);
    binary += String.fromCharCode.apply(null, Array.from(slice));
  }
  return btoa(binary);
}

function pcm16Base64ToFloat32(base64: string): Float32Array {
  const binary = atob(base64);
  let startOffset = 0;

  // If this audio chunk contains a WAV/RIFF header, skip the container header so header bytes aren't played as noise
  if (
    binary.length >= 44 &&
    binary.charCodeAt(0) === 0x52 && // 'R'
    binary.charCodeAt(1) === 0x49 && // 'I'
    binary.charCodeAt(2) === 0x46 && // 'F'
    binary.charCodeAt(3) === 0x46 && // 'F'
    binary.charCodeAt(8) === 0x57 && // 'W'
    binary.charCodeAt(9) === 0x41 && // 'A'
    binary.charCodeAt(10) === 0x56 && // 'V'
    binary.charCodeAt(11) === 0x45    // 'E'
  ) {
    const dataIdx = binary.indexOf('data');
    if (dataIdx !== -1 && dataIdx + 8 <= binary.length) {
      startOffset = dataIdx + 8;
    } else {
      startOffset = 44;
    }
  }

  const payloadLen = binary.length - startOffset;
  const validByteLen = payloadLen - (payloadLen % 2);
  const sampleCount = validByteLen / 2;
  const float32 = new Float32Array(sampleCount);

  for (let i = 0; i < sampleCount; i++) {
    const bytePos = startOffset + i * 2;
    const lo = binary.charCodeAt(bytePos);
    const hi = binary.charCodeAt(bytePos + 1);
    let sample = (hi << 8) | lo;
    if (sample >= 0x8000) {
      sample -= 0x10000;
    }
    float32[i] = sample / 32768.0;
  }
  return float32;
}

function resolveLiveWebSocketCandidates(
  lang: 'en' | 'or' | 'hi',
  persona: string,
  greetOnConnect: boolean
): string[] {
  const params = new URLSearchParams({
    lang,
    persona,
    greet: greetOnConnect ? '1' : '0',
  });

  if (isCapacitorNative()) {
    return getNativeBackendCandidates().map((origin) => {
      const wsBase = origin.replace(/^http:/i, 'ws:').replace(/^https:/i, 'wss:');
      return `${wsBase}/api/live-voice?${params.toString()}`;
    });
  }

  const configuredBase = getApiBaseUrl();
  if (configuredBase) {
    const wsBase = configuredBase.replace(/^http:/i, 'ws:').replace(/^https:/i, 'wss:');
    return [`${wsBase}/api/live-voice?${params.toString()}`];
  }

  const proto =
    typeof window !== 'undefined' && window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const host = typeof window !== 'undefined' ? window.location.host : 'localhost:3000';
  return [`${proto}//${host}/api/live-voice?${params.toString()}`];
}

export function useGeminiLiveVoice({
  lang,
  persona = 'utkal-mitra',
  greetOnConnect = true,
  onTurnCompleted,
}: UseGeminiLiveVoiceOptions): UseGeminiLiveVoiceReturn {
  const [isLiveActive, setIsLiveActive] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isModelSpeaking, setIsModelSpeaking] = useState(false);
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [micLevel, setMicLevel] = useState(0);
  const [liveUserTranscript, setLiveUserTranscript] = useState('');
  const [liveAssistantTranscript, setLiveAssistantTranscript] = useState('');
  const [liveVoiceLabel, setLiveVoiceLabel] = useState('');
  const [liveError, setLiveError] = useState<string | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const inputAudioCtxRef = useRef<AudioContext | null>(null);
  const outputAudioCtxRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const sourceNodeRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const activeSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const isMicMutedRef = useRef<boolean>(false);
  const userTurnBufferRef = useRef<string>('');
  const assistantTurnBufferRef = useRef<string>('');
  const onTurnCompletedRef = useRef(onTurnCompleted);
  onTurnCompletedRef.current = onTurnCompleted;

  const clearScheduledPlayback = useCallback(() => {
    for (const src of activeSourcesRef.current) {
      try {
        src.onended = null;
        src.stop();
        src.disconnect();
      } catch {
        // ignore stopped nodes
      }
    }
    activeSourcesRef.current.clear();
    nextStartTimeRef.current = 0;
    setIsModelSpeaking(false);
  }, []);

  const stopLiveSession = useCallback(() => {
    clearScheduledPlayback();

    if (processorRef.current) {
      try {
        processorRef.current.onaudioprocess = null;
        processorRef.current.disconnect();
      } catch {}
      processorRef.current = null;
    }

    if (sourceNodeRef.current) {
      try {
        sourceNodeRef.current.disconnect();
      } catch {}
      sourceNodeRef.current = null;
    }

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      mediaStreamRef.current = null;
    }

    if (inputAudioCtxRef.current) {
      inputAudioCtxRef.current.close().catch(() => {});
      inputAudioCtxRef.current = null;
    }

    if (outputAudioCtxRef.current) {
      outputAudioCtxRef.current.close().catch(() => {});
      outputAudioCtxRef.current = null;
    }

    if (wsRef.current) {
      try {
        wsRef.current.onopen = null;
        wsRef.current.onmessage = null;
        wsRef.current.onerror = null;
        wsRef.current.onclose = null;
        if (
          wsRef.current.readyState === WebSocket.OPEN ||
          wsRef.current.readyState === WebSocket.CONNECTING
        ) {
          wsRef.current.close();
        }
      } catch {}
      wsRef.current = null;
    }

    userTurnBufferRef.current = '';
    assistantTurnBufferRef.current = '';
    isMicMutedRef.current = false;
    setIsMicMuted(false);
    setMicLevel(0);
    setIsConnecting(false);
    setIsLiveActive(false);
    setIsModelSpeaking(false);
  }, [clearScheduledPlayback]);

  // Release microphone cleanly when Android app enters background
  useEffect(() => {
    const handleAppLifecycle = (ev: Event) => {
      const detail = (ev as CustomEvent<{ isActive: boolean }>).detail;
      if (detail && !detail.isActive && wsRef.current) {
        stopLiveSession();
      }
    };
    window.addEventListener('utkalsarathi:app-lifecycle', handleAppLifecycle);
    return () => {
      window.removeEventListener('utkalsarathi:app-lifecycle', handleAppLifecycle);
      stopLiveSession();
    };
  }, [stopLiveSession]);

  const scheduleAudioChunk = useCallback((base64Pcm24k: string) => {
    const outCtx = outputAudioCtxRef.current;
    if (!outCtx) return;
    if (outCtx.state === 'suspended') {
      outCtx.resume().catch(() => {});
    }

    const float32 = pcm16Base64ToFloat32(base64Pcm24k);
    if (float32.length === 0) return;

    const audioBuffer = outCtx.createBuffer(1, float32.length, 24000);
    audioBuffer.getChannelData(0).set(float32);

    const src = outCtx.createBufferSource();
    src.buffer = audioBuffer;
    src.connect(outCtx.destination);

    const now = outCtx.currentTime;
    // Seamless continuous playback scheduling without gaps
    const startAt = Math.max(now, nextStartTimeRef.current);
    nextStartTimeRef.current = startAt + audioBuffer.duration;

    activeSourcesRef.current.add(src);
    setIsModelSpeaking(true);

    src.onended = () => {
      activeSourcesRef.current.delete(src);
      if (activeSourcesRef.current.size === 0) {
        setIsModelSpeaking(false);
      }
    };

    src.start(startAt);
  }, []);

  const startLiveSession = useCallback(
    async (overrideLang?: 'en' | 'or' | 'hi') => {
      const targetLang = overrideLang || lang;
      stopLiveSession();
      setLiveError(null);
      setLiveUserTranscript('');
      setLiveAssistantTranscript('');
      setIsConnecting(true);

      try {
        if (typeof navigator !== 'undefined' && navigator.onLine === false) {
          throw new Error(
            targetLang === 'or'
              ? 'ଇଣ୍ଟରନେଟ୍ ସଂଯୋଗ ନାହିଁ। ଲାଇଭ୍ ସ୍ୱର ପାଇଁ ନେଟୱର୍କ ଅନ କରନ୍ତୁ।'
              : targetLang === 'hi'
              ? 'इंटरनेट कनेक्शन उपलब्ध नहीं है। लाइव वॉइस के लिए नेटवर्क चालू करें।'
              : 'No internet connection. Connect to Wi-Fi or mobile data for Live Voice.'
          );
        }

        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioCtx) {
          throw new Error('Web Audio API is not supported on this device.');
        }

        // Request microphone permission up front (if unavailable, allow text+listen live mode)
        let micStream: MediaStream | null = null;
        if (navigator.mediaDevices && typeof navigator.mediaDevices.getUserMedia === 'function') {
          try {
            micStream = await navigator.mediaDevices.getUserMedia({
              audio: {
                echoCancellation: true,
                noiseSuppression: true,
                autoGainControl: true,
                channelCount: 1,
                sampleRate: 16000,
              },
            });
          } catch {
            micStream = null;
          }
        }

        // Run output AudioContext at native hardware sample rate for high-fidelity resampling
        const outCtx = new AudioCtx();
        if (outCtx.state === 'suspended') {
          await outCtx.resume().catch(() => {});
        }
        outputAudioCtxRef.current = outCtx;

        const wsCandidates = resolveLiveWebSocketCandidates(targetLang, persona, greetOnConnect);

        const connectCandidate = (idx: number) => {
          const ws = new WebSocket(wsCandidates[idx]);
          wsRef.current = ws;
          let opened = false;

          ws.onopen = () => {
            opened = true;
            setIsConnecting(false);
            setIsLiveActive(true);

            if (micStream) {
              mediaStreamRef.current = micStream;
              const inCtx = new AudioCtx({ sampleRate: 16000 });
              if (inCtx.state === 'suspended') {
                inCtx.resume().catch(() => {});
              }
              inputAudioCtxRef.current = inCtx;

              const source = inCtx.createMediaStreamSource(micStream);
              sourceNodeRef.current = source;

              const processor = inCtx.createScriptProcessor(4096, 1, 1);
              processorRef.current = processor;

              const silentGain = inCtx.createGain();
              silentGain.gain.value = 0;
              source.connect(processor);
              processor.connect(silentGain);
              silentGain.connect(inCtx.destination);

              processor.onaudioprocess = (ev) => {
                if (isMicMutedRef.current) {
                  setMicLevel(0);
                  return;
                }
                const socket = wsRef.current;
                if (!socket || socket.readyState !== WebSocket.OPEN) return;

                const inputData = ev.inputBuffer.getChannelData(0);
                let sumSq = 0;
                for (let i = 0; i < inputData.length; i += 4) {
                  sumSq += inputData[i] * inputData[i];
                }
                const rms = Math.sqrt(sumSq / (inputData.length / 4));
                setMicLevel(Math.min(100, Math.round(rms * 350)));

                let pcmSamples = inputData;
                if (inCtx.sampleRate !== 16000) {
                  const ratio = inCtx.sampleRate / 16000;
                  const newLen = Math.round(inputData.length / ratio);
                  const resampled = new Float32Array(newLen);
                  for (let i = 0; i < newLen; i++) {
                    const srcIdx = Math.min(inputData.length - 1, Math.floor(i * ratio));
                    resampled[i] = inputData[srcIdx];
                  }
                  pcmSamples = resampled;
                }

                const base64Audio = float32ToPcm16Base64(pcmSamples);
                socket.send(JSON.stringify({ type: 'audio', audio: base64Audio }));
              };
            } else {
              isMicMutedRef.current = true;
              setIsMicMuted(true);
              setLiveError(
                targetLang === 'or'
                  ? 'ମାଇକ୍ରୋଫୋନ୍ ଅନୁମତି ମିଳିନାହିଁ — ଆପଣ ତଳେ ଟାଇପ୍ କରି କିମ୍ବା ପ୍ରଶ୍ନ ବଟନ୍ ଦବାଇ ଓଡ଼ିଆ ସ୍ୱରରେ ଉତ୍ତର ଶୁଣିପାରିବେ।'
                  : targetLang === 'hi'
                  ? 'माइक्रोफ़ोन अनुमति उपलब्ध नहीं है — आप नीचे प्रश्न चुनकर या टाइप करके सीधा हिन्दी आवाज़ में उत्तर सुन सकते हैं।'
                  : 'Microphone permission not granted — allow Microphone in Android App Settings or tap any prompt to listen.'
              );
            }
          };

          ws.onmessage = (event) => {
            try {
              const msg = JSON.parse(String(event.data));
              if (msg.ready) {
                setLiveVoiceLabel(
                  msg.narrator ? `${msg.narrator} (${msg.voiceName})` : msg.voiceName || 'Live HD'
                );
              }
              if (msg.audio) {
                scheduleAudioChunk(msg.audio);
              }
              if (msg.inputTranscript) {
                userTurnBufferRef.current += msg.inputTranscript;
                setLiveUserTranscript(userTurnBufferRef.current.trim());
              }
              if (msg.outputTranscript) {
                assistantTurnBufferRef.current += msg.outputTranscript;
                setLiveAssistantTranscript(assistantTurnBufferRef.current.trim());
              }
              if (msg.interrupted) {
                clearScheduledPlayback();
              }
              if (msg.turnComplete) {
                const finalUser = userTurnBufferRef.current.trim();
                const finalAssistant = assistantTurnBufferRef.current.trim();
                if (finalUser || finalAssistant) {
                  onTurnCompletedRef.current?.(finalUser, finalAssistant);
                }
                userTurnBufferRef.current = '';
                assistantTurnBufferRef.current = '';
              }
              if (msg.error) {
                setLiveError(msg.error);
              }
            } catch {
              // ignore malformed frame
            }
          };

          ws.onerror = () => {
            if (!opened && idx + 1 < wsCandidates.length) {
              try {
                ws.onclose = null;
                ws.close();
              } catch {}
              connectCandidate(idx + 1);
              return;
            }
            setLiveError(
              targetLang === 'or'
                ? 'ଲାଇଭ୍ ଭଏସ୍ ସଂଯୋଗ ବିଚ୍ଛିନ୍ନ ହେଲା। ଦୟାକରି ପୁଣି ଚେଷ୍ଟା କରନ୍ତୁ।'
                : targetLang === 'hi'
                ? 'लाइव वॉइस कनेक्शन बाधित हुआ। कृपया पुनः प्रयास करें।'
                : 'Live voice stream disconnected. Please check network and reconnect.'
            );
            stopLiveSession();
          };

          ws.onclose = () => {
            setIsConnecting(false);
            setIsLiveActive(false);
            setIsModelSpeaking(false);
          };
        };

        connectCandidate(0);
      } catch (err: any) {
        setLiveError(err?.message || 'Could not start live voice session.');
        stopLiveSession();
      }
    },
    [lang, persona, greetOnConnect, stopLiveSession, scheduleAudioChunk, clearScheduledPlayback]
  );

  const toggleMicMute = useCallback(() => {
    const next = !isMicMutedRef.current;
    isMicMutedRef.current = next;
    setIsMicMuted(next);
    if (next) setMicLevel(0);
  }, []);

  const sendLiveTextPrompt = useCallback(
    (text: string) => {
      const trimmed = text.trim();
      if (!trimmed) return;
      const socket = wsRef.current;
      if (!socket || socket.readyState !== WebSocket.OPEN) return;
      clearScheduledPlayback();
      userTurnBufferRef.current = trimmed;
      assistantTurnBufferRef.current = '';
      setLiveUserTranscript(trimmed);
      setLiveAssistantTranscript('');
      socket.send(JSON.stringify({ type: 'text', text: trimmed }));
    },
    [clearScheduledPlayback]
  );

  return {
    isLiveActive,
    isConnecting,
    isModelSpeaking,
    isMicMuted,
    micLevel,
    liveUserTranscript,
    liveAssistantTranscript,
    liveVoiceLabel,
    liveError,
    startLiveSession,
    stopLiveSession,
    toggleMicMute,
    sendLiveTextPrompt,
  };
}
