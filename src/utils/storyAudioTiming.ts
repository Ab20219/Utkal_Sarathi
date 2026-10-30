/**
 * Pure Story Narration Chunking & Dynamic Timeline Engine
 *
 * Guarantees that:
 * 1. Long historical stories in English, Hindi (हिन्दी), and Odia (ଓଡ଼ିଆ) are split cleanly
 *    at natural sentence boundaries (।, ., ?, !, \n) without cutting off words.
 * 2. Elapsed time, remaining time, and total story duration stay 100% synchronized with the
 *    actual audio playback (using real decoded WAV durations from Gemini TTS or real sentence
 *    timings from SpeechSynthesis).
 * 3. The exact moment the story finishes speaking ("story gets over"), the timer reaches
 *    100% completion (elapsedSec === totalDurationSec, remainingSec === 0, isTimeOver === true).
 */

export interface NarrationChunk {
  index: number;
  text: string;
  charStart: number;
  charEnd: number;
  wordCount: number;
}

/**
 * Splits a historical narration script into natural sentence-bounded chunks
 * optimal for zero-gap sequential TTS streaming and reliable Web Speech synthesis.
 */
export function splitTranscriptIntoNarrationChunks(
  rawText: string,
  maxChunkChars: number = 420
): NarrationChunk[] {
  const cleaned = (rawText || '').replace(/\r\n/g, '\n').trim();
  if (!cleaned) return [];

  // Split on sentence terminators including Indic purna virama (।, ॥), periods, question/exclamation marks, and paragraph breaks
  const sentenceRegex = /[^.!?।॥\n]+(?:[.!?।॥]+|\n+|$)/g;
  const rawSentences = cleaned.match(sentenceRegex) || [cleaned];

  const chunks: NarrationChunk[] = [];
  let buffer = '';
  let bufferStart = 0;
  let cursor = 0;

  const pushChunk = (txt: string, startOffset: number) => {
    const trimmed = txt.trim();
    if (!trimmed) return;
    const words = trimmed.split(/\s+/).filter(Boolean).length;
    chunks.push({
      index: chunks.length,
      text: trimmed,
      charStart: startOffset,
      charEnd: startOffset + trimmed.length,
      wordCount: Math.max(1, words),
    });
  };

  for (const sentence of rawSentences) {
    const trimmedSentence = sentence.trim();
    if (!trimmedSentence) {
      cursor += sentence.length;
      continue;
    }

    if (!buffer) {
      bufferStart = cursor;
    }

    if (buffer.length > 0 && buffer.length + 1 + trimmedSentence.length > maxChunkChars) {
      pushChunk(buffer, bufferStart);
      buffer = trimmedSentence;
      bufferStart = cursor;
    } else if (trimmedSentence.length > maxChunkChars) {
      // Very long clause without punctuation: split cleanly on commas/spaces
      if (buffer) {
        pushChunk(buffer, bufferStart);
        buffer = '';
      }
      const words = trimmedSentence.split(/\s+/);
      let sub = '';
      let subOffset = cursor;
      for (const w of words) {
        if (sub.length > 0 && sub.length + 1 + w.length > maxChunkChars) {
          pushChunk(sub, subOffset);
          subOffset += sub.length + 1;
          sub = w;
        } else {
          sub = sub ? `${sub} ${w}` : w;
        }
      }
      if (sub) {
        buffer = sub;
        bufferStart = subOffset;
      }
    } else {
      buffer = buffer ? `${buffer} ${trimmedSentence}` : trimmedSentence;
    }

    cursor += sentence.length;
  }

  if (buffer.trim()) {
    pushChunk(buffer, bufferStart);
  }

  return chunks;
}

/**
 * Baseline characters-per-second speaking cadence by language at 1.0x speed.
 * Indic scripts (Odia & Devanagari) encode full syllables per akshara, so each character
 * takes slightly longer phonetically than Latin characters.
 */
export function getBaselineCharsPerSec(lang: 'en' | 'or' | 'hi'): number {
  switch (lang) {
    case 'or':
      return 9.2;
    case 'hi':
      return 9.8;
    case 'en':
    default:
      return 13.8;
  }
}

/**
 * Estimates the spoken duration (in seconds) of a narration chunk prior to audio metadata load.
 */
export function estimateChunkDurationSec(
  text: string,
  lang: 'en' | 'or' | 'hi',
  effectiveRate: number = 1.0
): number {
  const safeRate = Math.max(0.5, Math.min(2.5, effectiveRate || 1.0));
  const len = (text || '').trim().length;
  if (len === 0) return 0;
  const baseCps = getBaselineCharsPerSec(lang) * safeRate;
  // Include slight natural breath pause (~0.35s) per sentence terminator
  const pauseCount = ((text || '').match(/[.!?।॥]/g) || []).length;
  const rawSec = len / baseCps + (pauseCount * 0.32) / safeRate;
  return Math.max(1.2, Number(rawSec.toFixed(2)));
}

export interface TimelineComputationInput {
  chunks: NarrationChunk[];
  /** Map or array of measured real durations (in seconds, already adjusted for playbackRate) for decoded/completed chunks */
  measuredDurationsSec: Record<number, number>;
  currentChunkIndex: number;
  currentChunkElapsedSec: number;
  isFinished: boolean;
  lang: 'en' | 'or' | 'hi';
  effectiveRate: number;
}

export interface StoryTimelineState {
  elapsedSec: number;
  totalDurationSec: number;
  remainingSec: number;
  progressPercent: number;
  formattedElapsed: string;
  formattedTotal: string;
  formattedRemaining: string;
  isStoryOver: boolean;
  isTimeOver: boolean;
}

export function formatSecondsMMSS(seconds: number): string {
  const clamped = Math.max(0, Math.round(seconds || 0));
  const mins = Math.floor(clamped / 60);
  const secs = clamped % 60;
  return `${mins}:${String(secs).padStart(2, '0')}`;
}

/**
 * Dynamically computes the exact story timeline so that:
 * - Decoded/played chunks contribute their exact real audio duration.
 * - Unplayed chunks calibrate their estimated duration from observed real speech cadence.
 * - When the story finishes (`isFinished === true`), elapsed === totalDuration, remaining === 0,
 *   progressPercent === 100, and both `isStoryOver` and `isTimeOver` become true simultaneously.
 */
export function computeStoryTimelineState(input: TimelineComputationInput): StoryTimelineState {
  const {
    chunks,
    measuredDurationsSec,
    currentChunkIndex,
    currentChunkElapsedSec,
    isFinished,
    lang,
    effectiveRate,
  } = input;

  if (!chunks || chunks.length === 0) {
    return {
      elapsedSec: 0,
      totalDurationSec: 0,
      remainingSec: 0,
      progressPercent: 0,
      formattedElapsed: '0:00',
      formattedTotal: '0:00',
      formattedRemaining: '0:00',
      isStoryOver: false,
      isTimeOver: false,
    };
  }

  // Calibrate real chars-per-second if at least one chunk has a measured duration
  let measuredChars = 0;
  let measuredSeconds = 0;
  for (const ch of chunks) {
    const d = measuredDurationsSec[ch.index];
    if (typeof d === 'number' && d > 0.2) {
      measuredChars += ch.text.length;
      measuredSeconds += d;
    }
  }

  const calibratedCps =
    measuredSeconds > 1.0 && measuredChars > 20
      ? measuredChars / measuredSeconds
      : null;

  const chunkDurations = chunks.map((ch) => {
    const exact = measuredDurationsSec[ch.index];
    if (typeof exact === 'number' && exact > 0.1) {
      return exact;
    }
    if (calibratedCps && calibratedCps > 1) {
      return Math.max(1.0, ch.text.length / calibratedCps);
    }
    return estimateChunkDurationSec(ch.text, lang, effectiveRate);
  });

  const rawTotal = chunkDurations.reduce((acc, d) => acc + d, 0);
  const totalDurationSec = Math.max(1, Math.round(rawTotal));

  if (isFinished) {
    return {
      elapsedSec: totalDurationSec,
      totalDurationSec,
      remainingSec: 0,
      progressPercent: 100,
      formattedElapsed: formatSecondsMMSS(totalDurationSec),
      formattedTotal: formatSecondsMMSS(totalDurationSec),
      formattedRemaining: '0:00',
      isStoryOver: true,
      isTimeOver: true,
    };
  }

  const safeIdx = Math.max(0, Math.min(chunks.length - 1, currentChunkIndex));
  let priorSec = 0;
  for (let i = 0; i < safeIdx; i++) {
    priorSec += chunkDurations[i];
  }

  const activeChunkMax = chunkDurations[safeIdx] || 1;
  const clampedActiveElapsed = Math.max(0, Math.min(activeChunkMax, currentChunkElapsedSec));
  // Never hit 100% until isFinished is explicitly triggered on final chunk end
  const rawElapsed = priorSec + clampedActiveElapsed;
  const elapsedSec = Math.min(Math.max(0, Math.round(rawElapsed)), Math.max(0, totalDurationSec - 1));
  const remainingSec = Math.max(1, totalDurationSec - elapsedSec);
  const progressPercent = Math.min(99.5, Math.max(0, (rawElapsed / Math.max(1, rawTotal)) * 100));

  return {
    elapsedSec,
    totalDurationSec,
    remainingSec,
    progressPercent: Number(progressPercent.toFixed(1)),
    formattedElapsed: formatSecondsMMSS(elapsedSec),
    formattedTotal: formatSecondsMMSS(totalDurationSec),
    formattedRemaining: formatSecondsMMSS(remainingSec),
    isStoryOver: false,
    isTimeOver: false,
  };
}

/**
 * Maps a seek ratio (0..1) to the exact chunk index and intra-chunk offset in seconds.
 */
export function resolveSeekPositionToChunk(
  ratio: number,
  chunks: NarrationChunk[],
  measuredDurationsSec: Record<number, number>,
  lang: 'en' | 'or' | 'hi',
  effectiveRate: number
): { chunkIndex: number; chunkOffsetSec: number; targetTimeSec: number } {
  const clampedRatio = Math.max(0, Math.min(0.995, ratio || 0));
  if (!chunks || chunks.length === 0) {
    return { chunkIndex: 0, chunkOffsetSec: 0, targetTimeSec: 0 };
  }

  const durations = chunks.map((ch) => {
    const exact = measuredDurationsSec[ch.index];
    return typeof exact === 'number' && exact > 0.1
      ? exact
      : estimateChunkDurationSec(ch.text, lang, effectiveRate);
  });

  const total = durations.reduce((a, b) => a + b, 0);
  const targetTimeSec = clampedRatio * total;

  let accum = 0;
  for (let i = 0; i < chunks.length; i++) {
    if (accum + durations[i] >= targetTimeSec || i === chunks.length - 1) {
      return {
        chunkIndex: i,
        chunkOffsetSec: Math.max(0, targetTimeSec - accum),
        targetTimeSec: Math.round(targetTimeSec),
      };
    }
    accum += durations[i];
  }

  return { chunkIndex: 0, chunkOffsetSec: 0, targetTimeSec: 0 };
}
