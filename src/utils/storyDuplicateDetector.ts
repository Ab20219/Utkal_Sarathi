import {
  StoryRecord,
  DuplicateCheckResult,
  StoryCategory,
  SupportedLanguage,
} from '../types';

/**
 * Normalizes text for linguistic and epigraphic comparison:
 * Removes diacritics, punctuation, extra whitespace, and common filler words.
 */
export function normalizeText(text: string): string {
  if (!text) return '';
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // strip diacritics
    .replace(/[^\w\s\u0B00-\u0B7F\u0900-\u097F]/g, ' ') // retain Latin, Odia & Devanagari scripts
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Extracts character n-grams (default trigrams) for Jaccard similarity.
 */
export function extractNgrams(text: string, n = 3): Set<string> {
  const normalized = normalizeText(text);
  const ngrams = new Set<string>();
  if (normalized.length < n) {
    if (normalized.length > 0) ngrams.add(normalized);
    return ngrams;
  }
  for (let i = 0; i <= normalized.length - n; i++) {
    ngrams.add(normalized.substring(i, i + n));
  }
  return ngrams;
}

/**
 * Computes Jaccard similarity coefficient between two sets of n-grams (0.0 to 1.0).
 */
export function jaccardSimilarity(setA: Set<string>, setB: Set<string>): number {
  if (setA.size === 0 && setB.size === 0) return 1.0;
  if (setA.size === 0 || setB.size === 0) return 0.0;

  let intersectionCount = 0;
  for (const item of setA) {
    if (setB.has(item)) {
      intersectionCount++;
    }
  }

  const unionCount = setA.size + setB.size - intersectionCount;
  return unionCount === 0 ? 0 : intersectionCount / unionCount;
}

/**
 * Computes Levenshtein distance between two strings with O(min(m, n)) space complexity.
 */
export function levenshteinDistance(a: string, b: string): number {
  const s1 = normalizeText(a);
  const s2 = normalizeText(b);

  if (s1 === s2) return 0;
  if (s1.length === 0) return s2.length;
  if (s2.length === 0) return s1.length;

  let prevRow = new Int32Array(s2.length + 1);
  let currRow = new Int32Array(s2.length + 1);

  for (let j = 0; j <= s2.length; j++) {
    prevRow[j] = j;
  }

  for (let i = 1; i <= s1.length; i++) {
    currRow[0] = i;
    const char1 = s1.charCodeAt(i - 1);
    for (let j = 1; j <= s2.length; j++) {
      const cost = char1 === s2.charCodeAt(j - 1) ? 0 : 1;
      currRow[j] = Math.min(
        currRow[j - 1] + 1, // insertion
        prevRow[j] + 1, // deletion
        prevRow[j - 1] + cost // substitution
      );
    }
    const temp = prevRow;
    prevRow = currRow;
    currRow = temp;
  }

  return prevRow[s2.length];
}

/**
 * Normalized Levenshtein similarity between 0.0 and 1.0.
 */
export function stringSimilarity(a: string, b: string): number {
  const s1 = normalizeText(a);
  const s2 = normalizeText(b);
  const maxLen = Math.max(s1.length, s2.length);
  if (maxLen === 0) return 1.0;
  const dist = levenshteinDistance(s1, s2);
  return Math.max(0, 1 - dist / maxLen);
}

/**
 * Extracts word tokens for semantic bag-of-words similarity.
 */
export function extractWordTokens(text: string): Set<string> {
  const normalized = normalizeText(text);
  const words = normalized.split(/\s+/).filter((w) => w.length > 2);
  return new Set(words);
}

/**
 * Evaluates whether a candidate story is a duplicate or near-duplicate of an existing story.
 *
 * Duplicate criteria:
 * 1. Exact ID match
 * 2. High title similarity (> 0.85) in the same district
 * 3. High narrative text similarity (> 0.70 Trigram Jaccard OR > 0.72 Word Jaccard)
 * 4. Combined weighted score >= threshold (0.75)
 */
export function checkStoryDuplicate(
  candidate: StoryRecord,
  existingStories: StoryRecord[],
  threshold = 0.75
): DuplicateCheckResult {
  // 1. Exact ID Collision Check
  const idMatch = existingStories.find((s) => s.id === candidate.id);
  if (idMatch) {
    return {
      isDuplicate: true,
      isNearDuplicate: true,
      similarityScore: 1.0,
      duplicateOfId: idMatch.id,
      duplicateOfTitle: idMatch.title,
      reason: `Exact Story ID collision: '${candidate.id}' already exists in library.`,
    };
  }

  const candidateTitle = candidate.title || '';
  const candidateText = candidate.storyText || '';
  const candidateNgrams = extractNgrams(candidateText);
  const candidateWords = extractWordTokens(candidateText);

  let highestScore = 0;
  let mostSimilarStory: StoryRecord | null = null;
  let matchReason = '';
  let triggeredByText = false;

  for (const existing of existingStories) {
    // Title similarity
    const titleSim = stringSimilarity(candidateTitle, existing.title);

    // Text similarity via Trigram & Word Jaccard
    const existingNgrams = extractNgrams(existing.storyText || '');
    const existingWords = extractWordTokens(existing.storyText || '');
    const ngramSim = jaccardSimilarity(candidateNgrams, existingNgrams);
    const wordSim = jaccardSimilarity(candidateWords, existingWords);
    const textSim = Math.max(ngramSim, wordSim);

    // District bonus (if same district, similarity holds higher weight)
    const sameDistrict =
      normalizeText(candidate.district) === normalizeText(existing.district);

    // If narrative text itself is strongly duplicated (> 70%), it is a duplicate story
    if (textSim >= 0.70) {
      if (textSim > highestScore) {
        highestScore = textSim;
        mostSimilarStory = existing;
        triggeredByText = true;
        matchReason = `Narrative text shares ${(textSim * 100).toFixed(1)}% semantic overlap with existing story '${existing.title}'.`;
      }
    }

    // Weighted combined score: 40% Title, 60% Text
    let combinedScore = 0.4 * titleSim + 0.6 * textSim;
    if (sameDistrict && titleSim > 0.75) {
      combinedScore = Math.max(combinedScore, titleSim);
    }

    if (combinedScore > highestScore) {
      highestScore = combinedScore;
      mostSimilarStory = existing;
      triggeredByText = false;

      if (titleSim > 0.85 && sameDistrict) {
        matchReason = `Title and district closely match existing story '${existing.title}' (${(titleSim * 100).toFixed(1)}% title match).`;
      } else if (textSim >= 0.70) {
        matchReason = `Narrative text shares ${(textSim * 100).toFixed(1)}% semantic similarity with existing story '${existing.title}'.`;
      } else if (combinedScore >= threshold) {
        matchReason = `Combined semantic and title similarity of ${(combinedScore * 100).toFixed(1)}% exceeds duplication threshold (${(threshold * 100).toFixed(0)}%).`;
      }
    }
  }

  if ((highestScore >= threshold || triggeredByText) && mostSimilarStory) {
    return {
      isDuplicate: true,
      isNearDuplicate: true,
      similarityScore: highestScore,
      duplicateOfId: mostSimilarStory.id,
      duplicateOfTitle: mostSimilarStory.title,
      reason: matchReason,
    };
  }

  // Near-duplicate warning zone (0.60 - 0.74)
  if (highestScore >= 0.60 && mostSimilarStory) {
    return {
      isDuplicate: false,
      isNearDuplicate: true,
      similarityScore: highestScore,
      duplicateOfId: mostSimilarStory.id,
      duplicateOfTitle: mostSimilarStory.title,
      reason: `Near-duplicate alert: ${(highestScore * 100).toFixed(1)}% similarity with '${mostSimilarStory.title}'. Needs editorial review.`,
    };
  }

  return {
    isDuplicate: false,
    isNearDuplicate: false,
    similarityScore: highestScore,
  };
}

/**
 * Honest Distinct Stories Calculator:
 * Guarantees that translations of the same story are NEVER counted as separate original stories.
 * Distinctness is determined by unique original story IDs.
 */
export function getDistinctOriginalStoriesCount(stories: StoryRecord[]): number {
  const uniqueIds = new Set<string>();
  for (const story of stories) {
    if (story && story.id) {
      uniqueIds.add(story.id.trim());
    }
  }
  return uniqueIds.size;
}

/**
 * Counts available translation versions across all stories.
 */
export function getTranslationCounts(stories: StoryRecord[]): {
  odiaCount: number;
  hindiCount: number;
  englishCount: number;
  totalTranslatedVersions: number;
} {
  let odiaCount = 0;
  let hindiCount = 0;
  let englishCount = 0;

  for (const story of stories) {
    if (story.originalLanguage === 'or' || story.translations?.or || story.odiaTitle) {
      odiaCount++;
    }
    if (story.originalLanguage === 'hi' || story.translations?.hi || story.hindiTitle) {
      hindiCount++;
    }
    if (story.originalLanguage === 'en' || story.translations?.en || story.title) {
      englishCount++;
    }
  }

  // Count supplementary translations (excluding the base original version)
  let totalSupplementary = 0;
  for (const story of stories) {
    if (story.translations) {
      if (story.translations.or && story.originalLanguage !== 'or') totalSupplementary++;
      if (story.translations.hi && story.originalLanguage !== 'hi') totalSupplementary++;
      if (story.translations.en && story.originalLanguage !== 'en') totalSupplementary++;
    }
  }

  return {
    odiaCount,
    hindiCount,
    englishCount,
    totalTranslatedVersions: totalSupplementary,
  };
}

/**
 * Determines duration type from seconds.
 */
export function calculateDurationType(
  durationSec: number
): 'short' | 'narrative' | 'extended' {
  if (durationSec <= 180) return 'short'; // <= 3 mins
  if (durationSec <= 480) return 'narrative'; // 3 - 8 mins
  return 'extended'; // > 8 mins
}

/**
 * Estimates listening duration based on average speaking rate of 130 words per minute.
 */
export function estimateListeningDurationSec(text: string): number {
  if (!text) return 60;
  const wordCount = text.trim().split(/\s+/).length;
  const minutes = wordCount / 130;
  return Math.max(30, Math.round(minutes * 60));
}
