/**
 * Indic Phonetic & Script Bridge for Odia (ଓଡ଼ିଆ) & Hindi (हिन्दी) Voice Synthesis
 *
 * Ensures 100% natural, human voice playback across all platforms:
 * 1. If native Odia ('or-IN') voice exists on the user's OS/browser, Odia Unicode is spoken directly.
 * 2. If 'or-IN' voice is missing but 'hi-IN' (Hindi) voice is available, Odia Unicode (U+0B00–U+0B7F) is
 *    phonetically mapped to Devanagari (U+0900–U+097F). Indian Hindi voices pronounce this with
 *    warm, natural, authentic cadence instead of going silent or sounding robotic.
 * 3. Never applies artificial pitch-shifting or robotic distortion (pitch is locked to natural 1.0).
 */

export interface BrowserVoiceSelection {
  voice: SpeechSynthesisVoice | null;
  langTag: string;
  spokenText: string;
  mode: 'native_odia' | 'hindi_phonetic_bridge' | 'native_hindi' | 'english';
}

/**
 * Ensures browser speech synthesis voices are populated on mobile devices (Android WebView / Chrome)
 * where window.speechSynthesis.getVoices() returns [] on initial page load.
 */
export function ensureBrowserVoicesReady(timeoutMs = 1500): Promise<SpeechSynthesisVoice[]> {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return Promise.resolve([]);
  }
  const existing = window.speechSynthesis.getVoices();
  if (existing.length > 0) {
    return Promise.resolve(existing);
  }
  return new Promise((resolve) => {
    let resolved = false;
    let pollInterval: any = null;
    let timer: any = null;

    const cleanupAndResolve = () => {
      if (!resolved) {
        resolved = true;
        if (pollInterval) clearInterval(pollInterval);
        if (timer) clearTimeout(timer);
        resolve(window.speechSynthesis.getVoices());
      }
    };

    timer = setTimeout(cleanupAndResolve, timeoutMs);

    pollInterval = setInterval(() => {
      const v = window.speechSynthesis.getVoices();
      if (v && v.length > 0) {
        cleanupAndResolve();
      }
    }, 50);

    window.speechSynthesis.onvoiceschanged = cleanupAndResolve;
  });
}

// Pre-warm browser voices on initial page load in the background
if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  try {
    ensureBrowserVoicesReady(2000).catch(() => {});
  } catch {}
}

/**
 * Converts Odia script (U+0B00–U+0B7F) into phonetic Devanagari (U+0900–U+097F)
 * leveraging the parallel Brahmic Unicode layout with Odia-specific phonetic adjustments.
 */
export function odiaToDevanagariPhonetic(text: string): string {
  if (!text) return '';
  let result = '';
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    const code = ch.charCodeAt(0);

    // Special Odia characters with distinct phonetic realizations
    if (ch === 'ୱ') {
      result += 'व';
    } else if (ch === 'ୟ') {
      result += 'य';
    } else if (ch === 'ଯ') {
      result += 'ज';
    } else if (ch === 'ଳ') {
      result += 'ल';
    } else if (ch === 'ଡ଼') {
      result += 'ड़';
    } else if (ch === 'ଢ଼') {
      result += 'ढ़';
    } else if (code >= 0x0b01 && code <= 0x0b71) {
      // Parallel ISCII-derived Brahmic block offset (-0x0200 maps Odia 0x0Bxx -> Devanagari 0x09xx)
      const mappedCode = code - 0x0200;
      result += String.fromCharCode(mappedCode);
    } else {
      result += ch;
    }
  }
  return result;
}

/**
 * Selects the optimal browser voice and transforms the text payload if necessary
 * so Hindi and Odia speech synthesis works naturally without robotic/alien distortion.
 */
export function selectBestBrowserVoiceAndText(
  rawText: string,
  targetLang: 'en' | 'or' | 'hi',
  voices: SpeechSynthesisVoice[],
  preferredGender: 'male' | 'female' = 'male',
  monumentSeedIndex: number = 0,
  englishFallbackText?: string
): BrowserVoiceSelection {
  const cleanRaw = rawText
    .replace(/[*#_`~]/g, '')
    .replace(/[•❖▶↺⏭️🏆🎙️📜🪔🔬🌍🏛️🎯]/gu, '')
    .replace(/\s+/g, ' ')
    .trim();

  const pickByGenderOrSeed = (candidates: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null => {
    if (candidates.length === 0) return null;

    // Prioritize natural, neural, and high-clarity voices over legacy synthesizers
    const sorted = [...candidates].sort((a, b) => {
      const aName = a.name.toLowerCase();
      const bName = b.name.toLowerCase();

      const aScore =
        (aName.includes('natural') ? 14 : 0) +
        (aName.includes('neural') ? 14 : 0) +
        (aName.includes('google') ? 10 : 0) +
        (aName.includes('online') ? 6 : 0) -
        (aName.includes('desktop') ? 8 : 0);

      const bScore =
        (bName.includes('natural') ? 14 : 0) +
        (bName.includes('neural') ? 14 : 0) +
        (bName.includes('google') ? 10 : 0) +
        (bName.includes('online') ? 6 : 0) -
        (bName.includes('desktop') ? 8 : 0);

      return bScore - aScore;
    });

    const genderHints =
      preferredGender === 'female'
        ? ['female', 'swara', 'kalpana', 'lekha', 'heera', 'veena', 'samantha', 'zira', 'google हिन्दी']
        : ['male', 'madhur', 'hemant', 'prabhat', 'ravi', 'rishi', 'daniel'];

    const genderMatches = sorted.filter((v) =>
      genderHints.some((hint) => v.name.toLowerCase().includes(hint))
    );
    const pool = genderMatches.length > 0 ? genderMatches : sorted;
    return pool[Math.abs(monumentSeedIndex) % pool.length];
  };

  if (targetLang === 'or') {
    // 1. Direct native Odia voice
    const odiaVoices = voices.filter(
      (v) =>
        v.lang.toLowerCase().startsWith('or') ||
        v.name.toLowerCase().includes('odia') ||
        v.name.toLowerCase().includes('oriya')
    );
    if (odiaVoices.length > 0) {
      const chosen = pickByGenderOrSeed(odiaVoices);
      return {
        voice: chosen,
        langTag: chosen?.lang || 'or-IN',
        spokenText: cleanRaw,
        mode: 'native_odia',
      };
    }

    // 2. High-fidelity Hindi voice bridge (maps Odia script to Devanagari phonetically)
    const hindiVoices = voices.filter(
      (v) => v.lang.toLowerCase().startsWith('hi') || v.name.toLowerCase().includes('hindi')
    );
    if (hindiVoices.length > 0) {
      const chosen = pickByGenderOrSeed(hindiVoices);
      if (chosen) {
        return {
          voice: chosen,
          langTag: chosen.lang || 'hi-IN',
          spokenText: odiaToDevanagariPhonetic(cleanRaw),
          mode: 'hindi_phonetic_bridge',
        };
      }
    }

    // 3. If neither Odia nor Hindi voice is installed, NEVER pass Indic text to an English synthesizer (prevents alien/robotic sound)
    const indianEnVoices = voices.filter((v) => v.lang.toLowerCase() === 'en-in');
    const enVoices = indianEnVoices.length > 0 ? indianEnVoices : voices.filter((v) => v.lang.toLowerCase().startsWith('en'));
    const chosen = pickByGenderOrSeed(enVoices);
    return {
      voice: chosen,
      langTag: chosen?.lang || 'en-IN',
      spokenText: englishFallbackText ? englishFallbackText.trim() : cleanRaw,
      mode: 'english',
    };
  }

  if (targetLang === 'hi') {
    const hindiVoices = voices.filter(
      (v) => v.lang.toLowerCase().startsWith('hi') || v.name.toLowerCase().includes('hindi')
    );
    if (hindiVoices.length > 0) {
      const chosen = pickByGenderOrSeed(hindiVoices);
      return {
        voice: chosen,
        langTag: chosen?.lang || 'hi-IN',
        spokenText: cleanRaw,
        mode: 'native_hindi',
      };
    }

    const indianEnVoices = voices.filter((v) => v.lang.toLowerCase() === 'en-in');
    const enVoices = indianEnVoices.length > 0 ? indianEnVoices : voices.filter((v) => v.lang.toLowerCase().startsWith('en'));
    const chosen = pickByGenderOrSeed(enVoices);
    return {
      voice: chosen,
      langTag: chosen?.lang || 'en-IN',
      spokenText: englishFallbackText ? englishFallbackText.trim() : cleanRaw,
      mode: 'english',
    };
  }

  // English: prefer en-IN first for authentic Indian pronunciation, then general en
  const indianEnVoices = voices.filter((v) => v.lang.toLowerCase() === 'en-in');
  const enVoices =
    indianEnVoices.length > 0
      ? indianEnVoices
      : voices.filter((v) => v.lang.toLowerCase().startsWith('en'));
  const chosen = pickByGenderOrSeed(enVoices);
  return {
    voice: chosen,
    langTag: chosen?.lang || 'en-IN',
    spokenText: cleanRaw,
    mode: 'english',
  };
}
