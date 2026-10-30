/**
 * Indic Phonetic & Script Bridge for Odia (ଓଡ଼ିଆ) & Hindi (हिन्दी) Voice Synthesis
 *
 * Ensures 100% reliable voice playback across all operating systems and browsers:
 * - When Studio HD Gemini TTS (/api/tts) is active, raw Odia/Hindi Unicode is spoken natively.
 * - When offline or falling back to browser SpeechSynthesis:
 *   1. If an 'or-IN' voice exists on the device, Odia Unicode is spoken directly.
 *   2. If no 'or-IN' voice exists on the device, Odia Unicode (U+0B00–U+0B7F) is
 *      phonetically mapped via ISCII Brahmic codepoint alignment to Devanagari (U+0900–U+097F)
 *      so Indian 'hi-IN' voices pronounce Odia words naturally instead of going silent.
 *   3. If neither 'or-IN' nor 'hi-IN' voices exist (e.g. English-only OS), Odia and Devanagari
 *      are phonetically transliterated into readable Indic Roman phonetics so speech never fails.
 */

const ODIA_TO_ROMAN_MAP: Record<string, string> = {
  'ଅ': 'a', 'ଆ': 'aa', 'ଇ': 'i', 'ଈ': 'ee', 'ଉ': 'u', 'ଊ': 'oo',
  'ଋ': 'ru', 'ଏ': 'e', 'ଐ': 'ai', 'ଓ': 'o', 'ୌ': 'au', 'ଔ': 'au',
  'କ': 'ka', 'ଖ': 'kha', 'ଗ': 'ga', 'ଘ': 'gha', 'ଙ': 'nga',
  'ଚ': 'cha', 'ଛ': 'chha', 'ଜ': 'ja', 'ଝ': 'jha', 'ଞ': 'nya',
  'ଟ': 'ta', 'ଠ': 'tha', 'ଡ': 'da', 'ଢ': 'dha', 'ଣ': 'na',
  'ତ': 'ta', 'ଥ': 'tha', 'ଦ': 'da', 'ଧ': 'dha', 'ନ': 'na',
  'ପ': 'pa', 'ଫ': 'pha', 'ବ': 'ba', 'ଭ': 'bha', 'ମ': 'ma',
  'ଯ': 'ja', 'ୟ': 'ya', 'ର': 'ra', 'ଲ': 'la', 'ଳ': 'la', 'ୱ': 'wa',
  'ଶ': 'sha', 'ଷ': 'sha', 'ସ': 'sa', 'ହ': 'ha',
  'ଡ଼': 'ra', 'ଢ଼': 'rha',
  'ା': 'aa', 'ି': 'i', 'ୀ': 'ee', 'ୁ': 'u', 'ୂ': 'oo', 'ୃ': 'ru',
  'େ': 'e', 'ୈ': 'ai', 'ୋ': 'o',
  'ଂ': 'n', 'ଃ': 'h', 'ଁ': 'n', '୍': '', '଼': '',
  '୦': '0', '୧': '1', '୨': '2', '୩': '3', '୪': '4',
  '୫': '5', '୬': '6', '୭': '7', '୮': '8', '୯': '9',
  '।': '.', '॥': '.',
};

const DEVANAGARI_TO_ROMAN_MAP: Record<string, string> = {
  'अ': 'a', 'आ': 'aa', 'इ': 'i', 'ई': 'ee', 'उ': 'u', 'ऊ': 'oo',
  'ऋ': 'ri', 'ए': 'e', 'ऐ': 'ai', 'ओ': 'o', 'औ': 'au',
  'क': 'ka', 'ख': 'kha', 'ग': 'ga', 'घ': 'gha', 'ङ': 'nga',
  'च': 'cha', 'छ': 'chha', 'ज': 'ja', 'झ': 'jha', 'ञ': 'nya',
  'ट': 'ta', 'ठ': 'tha', 'ड': 'da', 'ढ': 'dha', 'ण': 'na',
  'त': 'ta', 'थ': 'tha', 'द': 'da', 'ध': 'dha', 'न': 'na',
  'प': 'pa', 'फ': 'pha', 'ब': 'ba', 'भ': 'bha', 'म': 'ma',
  'य': 'ya', 'र': 'ra', 'ल': 'la', 'ळ': 'la', 'व': 'va',
  'श': 'sha', 'ष': 'sha', 'स': 'sa', 'ह': 'ha',
  'ड़': 'ra', 'ढ़': 'rha', 'क़': 'qa', 'ख़': 'kha', 'ग़': 'gha', 'ज़': 'za', 'फ़': 'fa',
  'ा': 'aa', 'ि': 'i', 'ी': 'ee', 'ु': 'u', 'ू': 'oo', 'ृ': 'ri',
  'े': 'e', 'ै': 'ai', 'ो': 'o', 'ौ': 'au', 'ॉ': 'o', 'ॅ': 'e',
  'ं': 'n', 'ः': 'h', 'ँ': 'n', '्': '', '़': '', 'ऽ': '',
  '०': '0', '१': '1', '२': '2', '३': '3', '४': '4',
  '५': '5', '६': '6', '७': '7', '८': '8', '९': '9',
  '।': '.', '॥': '.',
};

const ODIA_MATRAS = new Set(['ା', 'ି', 'ୀ', 'ୁ', 'ୂ', 'ୃ', 'େ', 'ୈ', 'ୋ', 'ୌ', '୍']);
const DEVA_MATRAS = new Set(['ा', 'ि', 'ी', 'ु', 'ू', 'ृ', 'े', 'ै', 'ो', 'ौ', 'ॉ', 'ॅ', '्']);

/**
 * Converts Odia script (U+0B00–U+0B7F) into phonetic Devanagari (U+0900–U+097F)
 * leveraging the parallel Brahmic Unicode layout with Odia-specific phonetic adjustments
 * (e.g. Odia 'ୱ' -> 'व', 'ୟ' -> 'य', 'ଳ' -> 'ल', 'ଯ' -> 'ज').
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
 * Converts Odia or Hindi Devanagari text into clean phonetic Roman script
 * for English-only speech synthesizers so audio never fails silently.
 */
export function indicToRomanPhonetic(text: string): string {
  if (!text) return '';
  const chars = Array.from(text);
  let out = '';

  for (let i = 0; i < chars.length; i++) {
    const ch = chars[i];
    const next = chars[i + 1] || '';

    if (ch in ODIA_TO_ROMAN_MAP) {
      let piece = ODIA_TO_ROMAN_MAP[ch];
      // Strip inherent 'a' when followed by a vowel matra or halant
      if (piece.length > 1 && piece.endsWith('a') && piece !== 'aa' && ODIA_MATRAS.has(next)) {
        piece = piece.slice(0, -1);
      }
      out += piece;
    } else if (ch in DEVANAGARI_TO_ROMAN_MAP) {
      let piece = DEVANAGARI_TO_ROMAN_MAP[ch];
      if (piece.length > 1 && piece.endsWith('a') && piece !== 'aa' && DEVA_MATRAS.has(next)) {
        piece = piece.slice(0, -1);
      }
      out += piece;
    } else {
      out += ch;
    }
  }

  return out.replace(/\s+/g, ' ').trim();
}

export interface BrowserVoiceSelection {
  voice: SpeechSynthesisVoice | null;
  langTag: string;
  spokenText: string;
  mode: 'native_odia' | 'hindi_phonetic_bridge' | 'native_hindi' | 'indic_roman_bridge' | 'english';
}

/**
 * Selects the optimal browser voice and transforms the text payload if necessary
 * so Hindi and Odia speech synthesis works on 100% of browsers and operating systems.
 */
export function selectBestBrowserVoiceAndText(
  rawText: string,
  targetLang: 'en' | 'or' | 'hi',
  voices: SpeechSynthesisVoice[],
  preferredGender: 'male' | 'female' = 'male',
  monumentSeedIndex: number = 0
): BrowserVoiceSelection {
  const cleanRaw = rawText
    .replace(/[*#_`~]/g, '')
    .replace(/[•❖▶↺⏭️🏆🎙️📜🪔🔬🌍🏛️🎯]/gu, '')
    .replace(/\s+/g, ' ')
    .trim();

  const pickByGenderOrSeed = (candidates: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null => {
    if (candidates.length === 0) return null;

    // Prioritize natural, neural, and high-clarity voices over legacy robotic synthesizers
    const sorted = [...candidates].sort((a, b) => {
      const aName = a.name.toLowerCase();
      const bName = b.name.toLowerCase();

      const aScore =
        (aName.includes('natural') ? 12 : 0) +
        (aName.includes('neural') ? 12 : 0) +
        (aName.includes('google') ? 8 : 0) +
        (aName.includes('online') ? 6 : 0) -
        (aName.includes('desktop') ? 8 : 0);

      const bScore =
        (bName.includes('natural') ? 12 : 0) +
        (bName.includes('neural') ? 12 : 0) +
        (bName.includes('google') ? 8 : 0) +
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

    // Bridge Odia -> Devanagari for Indian Hindi voices
    const hindiVoices = voices.filter(
      (v) => v.lang.toLowerCase().startsWith('hi') || v.name.toLowerCase().includes('hindi')
    );
    if (hindiVoices.length > 0) {
      const chosen = pickByGenderOrSeed(hindiVoices);
      return {
        voice: chosen,
        langTag: chosen?.lang || 'hi-IN',
        spokenText: odiaToDevanagariPhonetic(cleanRaw),
        mode: 'hindi_phonetic_bridge',
      };
    }

    // Bridge Odia -> Roman Indic for English voices
    const indianEnVoices = voices.filter((v) => v.lang.toLowerCase() === 'en-in');
    const enVoices = indianEnVoices.length > 0 ? indianEnVoices : voices.filter((v) => v.lang.toLowerCase().startsWith('en'));
    const chosen = pickByGenderOrSeed(enVoices);
    return {
      voice: chosen,
      langTag: chosen?.lang || 'en-IN',
      spokenText: indicToRomanPhonetic(cleanRaw),
      mode: 'indic_roman_bridge',
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
      spokenText: indicToRomanPhonetic(cleanRaw),
      mode: 'indic_roman_bridge',
    };
  }

  // English: prefer en-IN first for authentic Indian monument names, then general en
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
