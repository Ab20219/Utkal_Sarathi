import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import {
  splitTranscriptIntoNarrationChunks,
  computeStoryTimelineState,
  resolveSeekPositionToChunk,
  estimateChunkDurationSec,
  type NarrationChunk,
  type StoryTimelineState,
} from '../utils/storyAudioTiming';
import { selectBestBrowserVoiceAndText } from '../utils/indicPhoneticBridge';
import { getMonumentVoiceProfile } from '../data/monumentVoiceProfiles';
import { getStoryAudioUrl } from '../data/storyAudioMap';
import { fetchApi } from '../utils/apiConfig';
import {
  wrapPcm16InWavHeader,
  unifiedVoicePipeline,
} from '../services/unifiedVoicePipeline';

export type PlaybackState =
  | 'Idle'
  | 'Loading'
  | 'Playing'
  | 'Paused'
  | 'Buffering'
  | 'Error'
  | 'Completed'
  | 'Cancelled';

export interface UseStoryAudioPlayerOptions {
  storyId: string;
  storyIndex: number;
  narrativeText: string;
  lang: 'en' | 'or' | 'hi';
  playbackSpeed: number;
  allowPhoneticFallback?: boolean;
  onAudioElementReady?: (audioEl: HTMLAudioElement) => void;
  onPlaybackStart?: () => void;
  onPlaybackStopOrComplete?: () => void;
}

export interface UseStoryAudioPlayerReturn {
  playbackState: PlaybackState;
  isPlaying: boolean;
  isPaused: boolean;
  isLoadingAudio: boolean;
  isStoryCompleted: boolean;
  errorMessage: string | null;
  voiceProviderLabel: string;
  chunks: NarrationChunk[];
  currentChunkIndex: number;
  currentChunkText: string;
  activeWordCharIndex: number;
  timeline: StoryTimelineState;
  togglePlayPause: () => void;
  startFromSegment: (segmentIndex: number, offsetSec?: number) => void;
  pausePlayback: () => void;
  resumePlayback: () => void;
  stopPlayback: () => void;
  replayStory: () => void;
  retryFailedSegment: () => void;
  seekByRatio: (ratio: number) => void;
}

interface PreloadedClip {
  dataUri: string;
  voiceName: string;
  narrator: string;
}

export function useStoryAudioPlayer({
  storyId,
  storyIndex,
  narrativeText,
  lang,
  playbackSpeed,
  allowPhoneticFallback = false,
  onAudioElementReady,
  onPlaybackStart,
  onPlaybackStopOrComplete,
}: UseStoryAudioPlayerOptions): UseStoryAudioPlayerReturn {
  const [playbackState, setPlaybackState] = useState<PlaybackState>('Idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [voiceProviderLabel, setVoiceProviderLabel] = useState<string>('Ready');
  const [currentChunkIndex, setCurrentChunkIndex] = useState<number>(0);
  const [currentChunkElapsedSec, setCurrentChunkElapsedSec] = useState<number>(0);
  const [measuredDurationsSec, setMeasuredDurationsSec] = useState<Record<number, number>>({});
  const [activeWordCharIndex, setActiveWordCharIndex] = useState<number>(0);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);

  const monumentProfile = useMemo(() => getMonumentVoiceProfile(storyId), [storyId]);
  const effectiveRate = useMemo(
    () => Number(playbackSpeed.toFixed(2)),
    [playbackSpeed]
  );

  const chunks = useMemo(
    () => splitTranscriptIntoNarrationChunks(narrativeText, 680),
    [narrativeText]
  );

  const sessionCounterRef = useRef<number>(0);
  const abortControllersRef = useRef<Set<AbortController>>(new Set());
  const preloadCacheRef = useRef<Map<string, Promise<PreloadedClip>>>(new Map());
  const htmlAudioRef = useRef<HTMLAudioElement | null>(null);
  const speechSynthTimerRef = useRef<number | null>(null);
  const activeEngineRef = useRef<'cloud-wav' | 'browser-speech' | null>(null);
  const playbackSpeedRef = useRef<number>(playbackSpeed);
  playbackSpeedRef.current = playbackSpeed;

  // Load browser SpeechSynthesis voices safely
  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    const loadVoices = () => {
      const list = window.speechSynthesis.getVoices();
      if (list.length > 0) setAvailableVoices(list);
    };
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.onvoiceschanged = null;
      }
    };
  }, []);

  // Dynamically update speed on active HTMLAudioElement without restarting segment
  useEffect(() => {
    if (htmlAudioRef.current) {
      htmlAudioRef.current.playbackRate = Math.max(0.6, Math.min(2.0, playbackSpeed));
    }
  }, [playbackSpeed]);

  const releaseActiveResources = useCallback((cancelControllers: boolean = true) => {
    if (speechSynthTimerRef.current) {
      window.clearInterval(speechSynthTimerRef.current);
      speechSynthTimerRef.current = null;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    if (htmlAudioRef.current) {
      htmlAudioRef.current.onended = null;
      htmlAudioRef.current.onerror = null;
      htmlAudioRef.current.ontimeupdate = null;
      htmlAudioRef.current.onwaiting = null;
      htmlAudioRef.current.onplaying = null;
      htmlAudioRef.current.pause();
      htmlAudioRef.current.removeAttribute('src');
      htmlAudioRef.current = null;
    }
    activeEngineRef.current = null;

    if (cancelControllers) {
      for (const ctrl of abortControllersRef.current) {
        ctrl.abort();
      }
      abortControllersRef.current.clear();
    }
  }, []);

  // Cancel obsolete requests & reset timeline when destination, language, or text changes
  useEffect(() => {
    sessionCounterRef.current += 1;
    releaseActiveResources(true);
    setPlaybackState('Idle');
    setErrorMessage(null);
    setCurrentChunkIndex(0);
    setCurrentChunkElapsedSec(0);
    setMeasuredDurationsSec({});
    setActiveWordCharIndex(0);
    setVoiceProviderLabel('Ready');
    onPlaybackStopOrComplete?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storyId, lang, narrativeText]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      sessionCounterRef.current += 1;
      releaseActiveResources(true);
    };
  }, [releaseActiveResources]);

  const tryBundledOfflineClip = useCallback(
    async (segmentIdx: number, signal: AbortSignal): Promise<PreloadedClip | null> => {
      if (segmentIdx !== 0) return null;
      const localUrl = getStoryAudioUrl(storyId, lang) || `/offline-audio/${storyId}-${lang}-seg0.wav`;
      try {
        const res = await fetch(localUrl, { method: 'GET', signal });
        if (res.ok) {
          return {
            dataUri: localUrl,
            voiceName: `${monumentProfile.geminiVoiceName} (Utkal Studio Voice)`,
            narrator: monumentProfile.narratorName[lang],
          };
        }
      } catch {
        // Bundled offline asset not present in web build
      }
      return null;
    },
    [storyId, lang, monumentProfile]
  );

  const fetchSegmentClip = useCallback(
    (segmentText: string, segmentIdx: number = 0): Promise<PreloadedClip> => {
      const cacheKey = `${storyId}:${lang}:${segmentIdx}:${segmentText}`;
      const existing = preloadCacheRef.current.get(cacheKey);
      if (existing) return existing;

      const controller = new AbortController();
      abortControllersRef.current.add(controller);

      const reqPromise = (async (): Promise<PreloadedClip> => {
        // Always check for authentic bundled studio audio clip first (zero latency, studio quality)
        if (segmentIdx === 0) {
          const bundled = await tryBundledOfflineClip(segmentIdx, controller.signal);
          if (bundled) {
            abortControllersRef.current.delete(controller);
            return bundled;
          }
        }

        let lastFetchErr: unknown = null;
        for (let attempt = 0; attempt < 2; attempt++) {
          try {
            const res = await fetchApi('/api/tts', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                text: segmentText,
                lang,
                persona: storyId,
              }),
              signal: controller.signal,
            });
            if (!res.ok) {
              const errData = await res.json().catch(() => ({}));
              throw new Error(errData?.error || `TTS HTTP ${res.status}`);
            }
            const data = await res.json();
            if (!data?.audioBase64) {
              throw new Error('Empty audio stream returned by TTS service');
            }
            abortControllersRef.current.delete(controller);
            const mime = data.mimeType || 'audio/wav';
            const dataUri =
              mime.includes('audio/mp3') || mime.includes('audio/mpeg')
                ? `data:audio/mp3;base64,${data.audioBase64}`
                : wrapPcm16InWavHeader(data.audioBase64, 24000);
            return {
              dataUri,
              voiceName: data.voiceName || monumentProfile.geminiVoiceName,
              narrator: data.narrator || monumentProfile.narratorName[lang],
            };
          } catch (err: any) {
            lastFetchErr = err;
            if (err?.name === 'AbortError') break;
            if (attempt === 0) {
              await new Promise((r) => setTimeout(r, 700));
            }
          }
        }

        if (segmentIdx === 0) {
          const bundled = await tryBundledOfflineClip(segmentIdx, controller.signal);
          if (bundled) {
            abortControllersRef.current.delete(controller);
            return bundled;
          }
        }
        abortControllersRef.current.delete(controller);
        preloadCacheRef.current.delete(cacheKey);
        throw lastFetchErr || new Error('TTS request failed');
      })();

      preloadCacheRef.current.set(cacheKey, reqPromise);
      return reqPromise;
    },
    [storyId, lang, monumentProfile, tryBundledOfflineClip]
  );

  const playSegmentAt = useCallback(
    async (segmentIdx: number, startOffsetSec: number = 0, sessionToken?: number) => {
      const activeToken =
        typeof sessionToken === 'number' ? sessionToken : ++sessionCounterRef.current;

      if (!chunks.length) return;
      if (segmentIdx >= chunks.length) {
        releaseActiveResources(false);
        setPlaybackState('Completed');
        setErrorMessage(null);
        setCurrentChunkIndex(chunks.length - 1);
        setActiveWordCharIndex(narrativeText.length);
        onPlaybackStopOrComplete?.();
        return;
      }

      const chunk = chunks[segmentIdx];
      releaseActiveResources(false);
      setErrorMessage(null);
      setCurrentChunkIndex(segmentIdx);
      setCurrentChunkElapsedSec(startOffsetSec);
      setActiveWordCharIndex(chunk.charStart);
      setPlaybackState(segmentIdx === 0 && startOffsetSec === 0 ? 'Loading' : 'Buffering');

      try {
        const clip = await fetchSegmentClip(chunk.text, segmentIdx);
        if (activeToken !== sessionCounterRef.current) return;

        const audio = new Audio(clip.dataUri);
        const appliedRate = Math.max(0.6, Math.min(2.0, playbackSpeedRef.current));
        audio.playbackRate = appliedRate;
        htmlAudioRef.current = audio;
        activeEngineRef.current = 'cloud-wav';

        onAudioElementReady?.(audio);

        audio.onloadedmetadata = () => {
          if (activeToken !== sessionCounterRef.current) return;
          if (Number.isFinite(audio.duration) && audio.duration > 0.1) {
            const realAdjustedDuration = audio.duration / appliedRate;
            setMeasuredDurationsSec((prev) => ({
              ...prev,
              [segmentIdx]: realAdjustedDuration,
            }));
            if (startOffsetSec > 0 && startOffsetSec < audio.duration) {
              audio.currentTime = startOffsetSec;
            }
          }
        };

        audio.onplaying = () => {
          if (activeToken !== sessionCounterRef.current) return;
          setPlaybackState('Playing');
          const langLabel =
            lang === 'or' ? 'ଓଡ଼ିଆ Native HD' : lang === 'hi' ? 'हिन्दी Native HD' : 'English HD';
          setVoiceProviderLabel(`${langLabel} · ${clip.voiceName} (${clip.narrator})`);
          onPlaybackStart?.();

          // Staggered background prefetch of segment i + 1 once current segment is playing
          if (segmentIdx + 1 < chunks.length) {
            window.setTimeout(() => {
              if (activeToken !== sessionCounterRef.current) return;
              fetchSegmentClip(chunks[segmentIdx + 1].text, segmentIdx + 1).catch(() => {
                // Handled if/when segment i + 1 plays
              });
            }, 1800);
          }
        };

        audio.onwaiting = () => {
          if (activeToken !== sessionCounterRef.current) return;
          setPlaybackState('Buffering');
        };

        audio.ontimeupdate = () => {
          if (activeToken !== sessionCounterRef.current) return;
          const curRate = Math.max(0.6, audio.playbackRate || 1);
          const adjustedElapsed = audio.currentTime / curRate;
          setCurrentChunkElapsedSec(adjustedElapsed);

          if (Number.isFinite(audio.duration) && audio.duration > 0.1) {
            const ratio = Math.min(1, Math.max(0, audio.currentTime / audio.duration));
            const charPos =
              chunk.charStart + Math.floor(ratio * (chunk.charEnd - chunk.charStart));
            setActiveWordCharIndex(charPos);
          }
        };

        audio.onended = () => {
          if (activeToken !== sessionCounterRef.current) return;
          const curRate = Math.max(0.6, audio.playbackRate || 1);
          if (Number.isFinite(audio.duration) && audio.duration > 0.1) {
            setMeasuredDurationsSec((prev) => ({
              ...prev,
              [segmentIdx]: audio.duration / curRate,
            }));
          }
          if (segmentIdx + 1 < chunks.length) {
            void playSegmentAt(segmentIdx + 1, 0, activeToken);
          } else {
            // Final segment finished speaking -> mark story & timer Completed!
            releaseActiveResources(false);
            setPlaybackState('Completed');
            setActiveWordCharIndex(narrativeText.length);
            onPlaybackStopOrComplete?.();
          }
        };

        audio.onerror = () => {
          if (activeToken !== sessionCounterRef.current) return;
          setPlaybackState('Error');
          setErrorMessage(
            `Audio stream interrupted on segment ${segmentIdx + 1}/${chunks.length}. Click Retry Segment to continue.`
          );
          onPlaybackStopOrComplete?.();
        };

        await audio.play();
      } catch (err: any) {
        if (err?.name === 'AbortError' || activeToken !== sessionCounterRef.current) {
          return;
        }

        // Cloud TTS failed -> Check browser speech synthesis with strict language-integrity rules
        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
          const selection = selectBestBrowserVoiceAndText(
            chunk.text,
            lang,
            availableVoices,
            monumentProfile.preferredVoiceGender,
            storyIndex
          );

          // Clean speech synthesis with natural cadence (pitch strictly 1.0)
          window.speechSynthesis.cancel();
          const utterance = new SpeechSynthesisUtterance(selection.spokenText);
          if (selection.voice) utterance.voice = selection.voice;
          utterance.lang = selection.langTag;
          utterance.pitch = 1.0; // Natural, human speaking pitch (avoids robotic distortion)
          utterance.rate = Math.max(
            0.7,
            Math.min(1.5, playbackSpeedRef.current)
          ); // Natural human speaking speed (respects user speed control)

            activeEngineRef.current = 'browser-speech';
            const estDur = estimateChunkDurationSec(chunk.text, lang, utterance.rate);
            const startedAt = Date.now();

            utterance.onstart = () => {
              if (activeToken !== sessionCounterRef.current) return;
              setPlaybackState('Playing');
              const modeBadge =
                selection.mode === 'native_odia'
                  ? 'Browser Native Odia (or-IN)'
                  : selection.mode === 'native_hindi'
                  ? 'Browser Native Hindi (hi-IN)'
                  : selection.mode === 'hindi_phonetic_bridge'
                  ? 'Offline Phonetic Bridge (Explicit)'
                  : 'Browser Speech Fallback';
              setVoiceProviderLabel(modeBadge);
              onPlaybackStart?.();
            };

            utterance.onboundary = (ev) => {
              if (activeToken !== sessionCounterRef.current) return;
              if (typeof ev.charIndex === 'number') {
                setActiveWordCharIndex(chunk.charStart + ev.charIndex);
              }
            };

            speechSynthTimerRef.current = window.setInterval(() => {
              if (activeToken !== sessionCounterRef.current) return;
              const elapsed = (Date.now() - startedAt) / 1000;
              setCurrentChunkElapsedSec(Math.min(estDur, elapsed));
            }, 250);

            utterance.onend = () => {
              if (speechSynthTimerRef.current) {
                window.clearInterval(speechSynthTimerRef.current);
                speechSynthTimerRef.current = null;
              }
              if (activeToken !== sessionCounterRef.current) return;
              const realSec = Math.max(0.8, (Date.now() - startedAt) / 1000);
              setMeasuredDurationsSec((prev) => ({
                ...prev,
                [segmentIdx]: realSec,
              }));
              if (segmentIdx + 1 < chunks.length) {
                void playSegmentAt(segmentIdx + 1, 0, activeToken);
              } else {
                releaseActiveResources(false);
                setPlaybackState('Completed');
                setActiveWordCharIndex(narrativeText.length);
                onPlaybackStopOrComplete?.();
              }
            };

            utterance.onerror = () => {
              if (speechSynthTimerRef.current) {
                window.clearInterval(speechSynthTimerRef.current);
                speechSynthTimerRef.current = null;
              }
              if (activeToken !== sessionCounterRef.current) return;
              setPlaybackState('Error');
              setErrorMessage(
                `Voice synthesis unavailable for segment ${segmentIdx + 1}/${chunks.length}. Please retry or read the transcript below.`
              );
              onPlaybackStopOrComplete?.();
            };

            window.speechSynthesis.speak(utterance);
            return;
        }

        // Honest error state without restarting story or silently substituting Hindi for Odia
        setPlaybackState('Error');
        setErrorMessage(
          lang === 'or'
            ? `Odia HD voice service failed on segment ${segmentIdx + 1}/${chunks.length} and no native Odia (or-IN) device voice is installed. Retry segment or enable Offline Phonetic Reader.`
            : `Voice service unreachable on segment ${segmentIdx + 1}/${chunks.length} (${err?.message || 'network error'}). Click Retry Segment to resume.`
        );
        onPlaybackStopOrComplete?.();
      }
    },
    [
      chunks,
      narrativeText.length,
      releaseActiveResources,
      fetchSegmentClip,
      monumentProfile,
      onAudioElementReady,
      lang,
      onPlaybackStart,
      onPlaybackStopOrComplete,
      availableVoices,
      storyIndex,
      allowPhoneticFallback,
    ]
  );

  const pausePlayback = useCallback(() => {
    if (playbackState !== 'Playing' && playbackState !== 'Buffering') return;
    if (activeEngineRef.current === 'cloud-wav' && htmlAudioRef.current) {
      htmlAudioRef.current.pause();
    } else if (
      activeEngineRef.current === 'browser-speech' &&
      typeof window !== 'undefined' &&
      'speechSynthesis' in window
    ) {
      window.speechSynthesis.pause();
    }
    if (speechSynthTimerRef.current) {
      window.clearInterval(speechSynthTimerRef.current);
      speechSynthTimerRef.current = null;
    }
    setPlaybackState('Paused');
    onPlaybackStopOrComplete?.();
  }, [playbackState, onPlaybackStopOrComplete]);

  const resumePlayback = useCallback(() => {
    if (playbackState !== 'Paused') return;
    if (activeEngineRef.current === 'cloud-wav' && htmlAudioRef.current) {
      htmlAudioRef.current
        .play()
        .then(() => {
          setPlaybackState('Playing');
          onPlaybackStart?.();
        })
        .catch(() => {
          void playSegmentAt(currentChunkIndex, currentChunkElapsedSec);
        });
      return;
    }
    if (
      activeEngineRef.current === 'browser-speech' &&
      typeof window !== 'undefined' &&
      'speechSynthesis' in window &&
      window.speechSynthesis.paused
    ) {
      window.speechSynthesis.resume();
      setPlaybackState('Playing');
      onPlaybackStart?.();
      return;
    }
    void playSegmentAt(currentChunkIndex, currentChunkElapsedSec);
  }, [
    playbackState,
    currentChunkIndex,
    currentChunkElapsedSec,
    playSegmentAt,
    onPlaybackStart,
  ]);

  const stopPlayback = useCallback(() => {
    sessionCounterRef.current += 1;
    releaseActiveResources(true);
    setPlaybackState('Cancelled');
    setErrorMessage(null);
    setCurrentChunkIndex(0);
    setCurrentChunkElapsedSec(0);
    setActiveWordCharIndex(0);
    onPlaybackStopOrComplete?.();
  }, [releaseActiveResources, onPlaybackStopOrComplete]);

  const replayStory = useCallback(() => {
    setMeasuredDurationsSec({});
    setCurrentChunkIndex(0);
    setCurrentChunkElapsedSec(0);
    setActiveWordCharIndex(0);
    void playSegmentAt(0, 0);
  }, [playSegmentAt]);

  const retryFailedSegment = useCallback(() => {
    void playSegmentAt(currentChunkIndex, 0);
  }, [playSegmentAt, currentChunkIndex]);

  const startFromSegment = useCallback(
    (segmentIndex: number, offsetSec: number = 0) => {
      const clamped = Math.max(0, Math.min(Math.max(0, chunks.length - 1), segmentIndex));
      void playSegmentAt(clamped, offsetSec);
    },
    [chunks.length, playSegmentAt]
  );

  const togglePlayPause = useCallback(() => {
    if (playbackState === 'Playing' || playbackState === 'Buffering' || playbackState === 'Loading') {
      if (playbackState === 'Loading') {
        stopPlayback();
      } else {
        pausePlayback();
      }
      return;
    }
    if (playbackState === 'Paused') {
      resumePlayback();
      return;
    }
    if (playbackState === 'Error') {
      retryFailedSegment();
      return;
    }
    if (playbackState === 'Completed') {
      replayStory();
      return;
    }
    // Idle or Cancelled -> Start from currentChunkIndex (0)
    void playSegmentAt(currentChunkIndex, 0);
  }, [
    playbackState,
    stopPlayback,
    pausePlayback,
    resumePlayback,
    retryFailedSegment,
    replayStory,
    playSegmentAt,
    currentChunkIndex,
  ]);

  const seekByRatio = useCallback(
    (ratio: number) => {
      if (!chunks.length) return;
      const target = resolveSeekPositionToChunk(
        ratio,
        chunks,
        measuredDurationsSec,
        lang,
        effectiveRate
      );
      setCurrentChunkIndex(target.chunkIndex);
      setCurrentChunkElapsedSec(target.chunkOffsetSec);
      setActiveWordCharIndex(chunks[target.chunkIndex]?.charStart || 0);

      if (playbackState === 'Playing' || playbackState === 'Buffering' || playbackState === 'Completed') {
        void playSegmentAt(target.chunkIndex, target.chunkOffsetSec);
      } else if (playbackState === 'Paused') {
        // Release paused element so next resume starts cleanly from new seek target
        releaseActiveResources(false);
      }
    },
    [chunks, measuredDurationsSec, lang, effectiveRate, playbackState, playSegmentAt, releaseActiveResources]
  );

  const timeline = useMemo(
    () =>
      computeStoryTimelineState({
        chunks,
        measuredDurationsSec,
        currentChunkIndex,
        currentChunkElapsedSec,
        isFinished: playbackState === 'Completed',
        lang,
        effectiveRate,
      }),
    [
      chunks,
      measuredDurationsSec,
      currentChunkIndex,
      currentChunkElapsedSec,
      playbackState,
      lang,
      effectiveRate,
    ]
  );

  return {
    playbackState,
    isPlaying: playbackState === 'Playing' || playbackState === 'Buffering',
    isPaused: playbackState === 'Paused',
    isLoadingAudio: playbackState === 'Loading' || playbackState === 'Buffering',
    isStoryCompleted: playbackState === 'Completed',
    errorMessage,
    voiceProviderLabel,
    chunks,
    currentChunkIndex,
    currentChunkText: chunks[currentChunkIndex]?.text || '',
    activeWordCharIndex,
    timeline,
    togglePlayPause,
    startFromSegment,
    pausePlayback,
    resumePlayback,
    stopPlayback,
    replayStory,
    retryFailedSegment,
    seekByRatio,
  };
}
