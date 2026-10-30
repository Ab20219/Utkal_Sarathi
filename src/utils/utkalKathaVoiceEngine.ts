import type { AudioGuideStory } from '../types.ts';
import { getMonumentVoiceProfile, type MonumentVoiceProfile } from '../data/monumentVoiceProfiles.ts';
import { ODISHA_HISTORICAL_STORIES } from '../data/odishaHistoricalStories.ts';
import { findDistrict } from '../data/odishaDistricts.ts';

export type VoiceLang = 'en' | 'or' | 'hi';

export type MonumentQuestionIntent =
  | 'architecture'
  | 'history'
  | 'legend'
  | 'epigraphy'
  | 'festivals'
  | 'conservation'
  | 'timing_rules'
  | 'overview';

const ODIA_SCRIPT_REGEX = /[\u0B00-\u0B7F]/;
const HINDI_SCRIPT_REGEX = /[\u0900-\u097F]/;

/**
 * Strips stray Latin words/acronyms inside Odia or Hindi scholarly paragraphs so
 * spoken TTS and native script readers receive 100% pure Odia or Devanagari prose.
 */
function ensurePureIndicProse(text: string, lang: 'or' | 'hi'): string {
  const replacements: Array<[RegExp, string]> =
    lang === 'or'
      ? [
          [/\bUNESCO\b/gi, 'ୟୁନେସ୍କୋ'],
          [/\bASI\b/gi, 'ଭାରତୀୟ ପ୍ରତ୍ନତତ୍ତ୍ୱ ସର୍ବେକ୍ଷଣ'],
          [/\bFAO\b/gi, 'ଜାତିସଂଘ ଖାଦ୍ୟ ଓ କୃଷି ସଂଗଠନ'],
          [/\bGIAHS\b/gi, 'ବିଶ୍ୱ କୃଷି ଐତିହ୍ୟ'],
          [/\bGI\b/g, 'ଜିଆଇ'],
          [/\bINTACH\b/gi, 'ଇନଟାକ୍'],
          [/\bCE\b/g, 'ଖ୍ରୀଷ୍ଟାବ୍ଦ'],
          [/\bBCE\b/g, 'ଖ୍ରୀଷ୍ଟପୂର୍ବ'],
          [/\bkm\b/gi, 'କି.ମି.'],
          [/\bm\b/g, 'ମିଟର'],
          [/\([A-Za-z0-9°.,\s–-]+\)/g, ''],
          [/[A-Za-z]+/g, ''],
        ]
      : [
          [/\bUNESCO\b/gi, 'यूनेस्को'],
          [/\bASI\b/gi, 'भारतीय पुरातत्व सर्वेक्षण'],
          [/\bFAO\b/gi, 'संयुक्त राष्ट्र खाद्य एवं कृषि संगठन'],
          [/\bGIAHS\b/gi, 'वैश्विक कृषि धरोहर'],
          [/\bGI\b/g, 'जीआई'],
          [/\bINTACH\b/gi, 'इनटैक'],
          [/\bCE\b/g, 'ईस्वी'],
          [/\bBCE\b/g, 'ईसा पूर्व'],
          [/\bkm\b/gi, 'कि.मी.'],
          [/\bm\b/g, 'मीटर'],
          [/\([A-Za-z0-9°.,\s–-]+\)/g, ''],
          [/[A-Za-z]+/g, ''],
        ];

  let cleaned = text;
  for (const [pattern, rep] of replacements) {
    cleaned = cleaned.replace(pattern, rep);
  }
  return cleaned
    .replace(/\(\s*\)/g, '')
    .replace(/[ \t]{2,}/g, ' ')
    .replace(/\s+([।,!?])/g, '$1')
    .trim();
}

export function detectQueryLanguage(query: string, preferredLang: VoiceLang = 'en'): VoiceLang {
  if (ODIA_SCRIPT_REGEX.test(query)) return 'or';
  if (HINDI_SCRIPT_REGEX.test(query)) return 'hi';
  return preferredLang;
}

export function classifyMonumentIntent(query: string): MonumentQuestionIntent {
  const q = query.toLowerCase();

  // Epigraphy, Copper plates, Palm-leaf manuscripts, Sources
  if (
    /inscri|epigraph|copper\s*plate|manuscript|palm\s*leaf|edict|brahmi|prakrit|pali|chronicle|madala\s*panji|baya\s*chakada|source|record|seal|ପ୍ରମାଣ|ଶିଳାଲେଖ|ଅଭିଲେଖ|ତାମ୍ରପଟା|ପୋଥି|ମାଦଳା|ଲିପି|शिलालेख|अभिलेख|ताम्रपत्र|पांडुलिपि|पोथी|साक्ष्य|स्रोत|ब्राह्मी/.test(
      q
    )
  ) {
    return 'epigraphy';
  }

  // Architecture, Stone, Wheels, Engineering, Sculpture, Carvings
  if (
    /architect|stone|carv|wheel|sundial|spoke|vimana|jagamohana|rekha|pidha|khakhara|khondalite|chlorite|muguni|iron|beam|magnet|lean|cave|height|dimension|design|sculpt|craft|pattachitra|ikat|ସ୍ଥାପତ୍ୟ|ନିର୍ମାଣ|ପଥର|ଚକ|ଚକ୍ର|ମୂର୍ତ୍ତି|କଳା|ଶିଳ୍ପ|ଉଚ୍ଚତା|ଖଣ୍ଡୋଲାଇଟ୍|ମୁଗୁନି|ସୂର୍ଯ୍ୟଘଣ୍ଟା|ଗୁମ୍ଫା|ବନ୍ଧ|वास्तुकला|स्थापत्य|निर्माण|पत्थर|चक्र|पहिया|धूपघड़ी|मूर्ति|शिल्प|ऊंचाई|ऊँचाई|गुफा|बांध|संरचना|डिजाइन/.test(
      q
    )
  ) {
    return 'architecture';
  }

  // Legend, Folklore, Mystery, Dharmapada, Kalijai, Myth, Sacred secret
  if (
    /legend|myth|folklore|story|tale|mystery|secret|dharmapada|kalapahada|kalijai|brahma\s*padartha|anasara|miracle|curse|ghost|shadow|why\s+did|କିମ୍ବଦନ୍ତୀ|ଲୋକକଥା|କାହାଣୀ|ରହସ୍ୟ|ଧର୍ମପଦ|କାଳିଜାଈ|ଅଲୌକିକ|ପୌରାଣିକ|ବ୍ରହ୍ମ|कथा|कहानी|किंवदंती|लोककथा|रहस्य|धर्मपद|कालिजाई|पौराणिक|चमत्कार|मान्यता/.test(
      q
    )
  ) {
    return 'legend';
  }

  // Festivals, Rituals, Worship, Dance, Pilgrimage
  if (
    /festival|ritual|ratha\s*yatra|mahaprasad|worship|puja|dance|odissi|chhau|gotipua|nuakhai|shivaratri|mela|parva|visit\s*time|ପର୍ବ|ଯାତ୍ରା|ରଥଯାତ୍ରା|ପୂଜା|ନୃତ୍ୟ|ମହାପ୍ରସାଦ|ନୂଆଖାଇ|ମେଳା|ଉତ୍ସବ|पर्व|त्योहार|उत्सव|रथयात्रा|पूजा|नृत्य|महाप्रसाद|नुआखाई|मेला|परंपरा/.test(
      q
    )
  ) {
    return 'festivals';
  }

  // Conservation, UNESCO, Ecology, Excavation, Protection
  if (
    /unesco|conserv|preserv|excavat|archaeolog|restor|ramsar|tiger|dolphin|biodiversity|protect|sand\s*fill|ୟୁନେସ୍କୋ|ସୁରକ୍ଷା|ସଂରକ୍ଷଣ|ଖନନ|ଜୈବ|ଅଭୟାରଣ୍ୟ|यूनेस्को|संरक्षण|उत्खनन|खुदाई|सुरक्षा|अभयारण्य|रामसर/.test(
      q
    )
  ) {
    return 'conservation';
  }

  // Timings, Tickets, Entry Rules, Dress Code, Leather, Photography
  if (
    /time|timing|ticket|fee|entry|darshan|open|close|dress|code|leather|camera|phone|rule|ସମୟ|ଟିକେଟ୍|ଖୋଲେ|ବନ୍ଦ|ପ୍ରବେଶ|ଦର୍ଶନ|ନିୟମ|ଚମଡ଼ା|ପୋଷାକ|समय|टिकट|दर्शन|प्रवेश|नियम|चमड़ा|वेशभूषा|ड्रेस/.test(
      q
    )
  ) {
    return 'timing_rules';
  }

  // History, Dynasty, King, Dates, Founder, Battle
  if (
    /histor|king|emperor|queen|dynast|built|when|who\s+built|century|ashoka|kharavela|narasimha|chodaganga|yayati|kapilendra|bhanja|chauhan|surendra\s*sai|laxman\s*nayak|war|battle|ଇତିହାସ|ରାଜା|ସମ୍ରାଟ|ବଂଶ|କେବେ|କିଏ|ଯୁଦ୍ଧ|ଶତାବ୍ଦୀ|ଅଶୋକ|ଖାରବେଳ|ନରସିଂହ|इतिहास|राजा|सम्राट|वंश|कब|किसने|युद्ध|शताब्दी|अशोक|खारवेल|नरसिंह/.test(
      q
    )
  ) {
    return 'history';
  }

  return 'overview';
}

function getVolumeByNumber(story: AudioGuideStory, volNumber: number) {
  return story.encyclopedicVolumes?.[volNumber - 1];
}

export function answerMonumentQuestionMultilingual(
  query: string,
  story: AudioGuideStory,
  voiceProfile?: MonumentVoiceProfile,
  lang: VoiceLang = 'en'
): string {
  const profile = voiceProfile || getMonumentVoiceProfile(story.id);
  const activeLang = detectQueryLanguage(query, lang);
  const intent = classifyMonumentIntent(query);

  if (activeLang === 'or') {
    const narrator = profile.narratorName.or;
    const role = profile.voicePersonaTitle.or;
    const place = profile.placeName.or;
    const vol1 = getVolumeByNumber(story, 1)?.contentOr || '';
    const vol2 = getVolumeByNumber(story, 2)?.contentOr || '';
    const vol3 = getVolumeByNumber(story, 3)?.contentOr || '';
    const vol5 = getVolumeByNumber(story, 5)?.contentOr || '';
    const vol6 = getVolumeByNumber(story, 6)?.contentOr || '';

    let rawOdia = '';
    switch (intent) {
      case 'architecture':
        rawOdia = `ନମସ୍କାର, ମୁଁ ${narrator} (${role}) କହୁଛି। ${place}ର ସ୍ଥାପତ୍ୟ ଓ ଶିଳ୍ପକଳା ବିଷୟରେ ଶୁଣନ୍ତୁ:\n\n${
          story.odiaArchitectureSummary || ''
        }\n\n${vol2.split('\n\n').slice(0, 2).join('\n\n')}`;
        break;
      case 'legend':
        rawOdia = `ନମସ୍କାର, ମୁଁ ${narrator} (${role})। ${place}ର ପବିତ୍ର କିମ୍ବଦନ୍ତୀ ଓ ଲୋକସ୍ମୃତି:\n\n${
          story.odiaLegendSummary || ''
        }\n\n${vol5.split('\n\n').slice(0, 2).join('\n\n')}`;
        break;
      case 'epigraphy':
        rawOdia = `ନମସ୍କାର, ମୁଁ ${narrator}। ${place}ର ପ୍ରାମାଣିକ ଶିଳାଲେଖ, ତାମ୍ରପଟା ଓ ଐତିହାସିକ ପୋଥି ପ୍ରମାଣ:\n\n${
          vol3.split('\n\n').slice(0, 2).join('\n\n') || story.odiaHistorySummary || ''
        }`;
        break;
      case 'festivals':
        rawOdia = `ନମସ୍କାର, ମୁଁ ${narrator}। ${place}ର ଜୀବନ୍ତ ପର୍ବପର୍ବାଣୀ, ରୀତିନୀତି ଓ ସାଂସ୍କୃତିକ ପରମ୍ପରା:\n\n${
          vol5.split('\n\n').slice(-2).join('\n\n') || story.odiaLegendSummary || ''
        }`;
        break;
      case 'conservation':
        rawOdia = `ନମସ୍କାର, ମୁଁ ${narrator}। ${place}ର ପ୍ରତ୍ନତାତ୍ତ୍ୱିକ ଖନନ ଓ ଐତିହ୍ୟ ସଂରକ୍ଷଣ ଇତିହାସ:\n\n${
          vol6.split('\n\n').slice(0, 2).join('\n\n') || story.odiaHistorySummary || ''
        }`;
        break;
      case 'timing_rules':
        rawOdia = `ନମସ୍କାର, ମୁଁ ${narrator} (${role})। ${place}ର ପ୍ରବେଶ ନିୟମ, ଦର୍ଶନ ସମୟ ଓ ପୋଷାକ ବିଧି:\n\n• ଦର୍ଶନ ସମୟ: ସକାଳ ୬:୦୦ ରୁ ରାତି ୯:୦୦ ପର୍ଯ୍ୟନ୍ତ (ମଧ୍ୟାହ୍ନ ବିଶ୍ରାମ ସମୟକୁ ଛାଡ଼ି)।\n• ନିୟମ: ଚମଡ଼ା ବେଲ୍ଟ, ପର୍ସ କିମ୍ବା ଜୋତା ପ୍ରବେଶ ସମ୍ପୂର୍ଣ୍ଣ ନିଷେଧ। ଶ୍ରୀମନ୍ଦିର ଓ ଧର୍ମପୀଠ ଭିତରେ ଶାଳୀନ ପାରମ୍ପରିକ ପୋଷାକ (ଧୋତି-କୁର୍ତ୍ତା କିମ୍ବା ଶାଢ଼ୀ/ସାଲୱାର) ପରିଧାନ କରନ୍ତୁ। ମୋବାଇଲ୍ ଫୋନ୍ ବାହାରେ କାଉଣ୍ଟରରେ ଜମା ରଖିବା ବାଧ୍ୟତାମୂଳକ।`;
        break;
      case 'history':
        rawOdia = `ନମସ୍କାର, ମୁଁ ${narrator} (${role})। ${place}ର ପ୍ରାମାଣିକ ଐତିହାସିକ ବିବରଣୀ:\n\n${
          story.odiaHistorySummary || ''
        }\n\n${vol1.split('\n\n').slice(0, 2).join('\n\n')}`;
        break;
      default:
        rawOdia = `${profile.culturalGreeting.or}\n\n${story.odiaHistorySummary || ''}\n\nସ୍ଥାପତ୍ୟ ବୈଶିଷ୍ଟ୍ୟ: ${
          story.odiaArchitectureSummary || ''
        }\n\nକିମ୍ବଦନ୍ତୀ ଓ ପରମ୍ପରା: ${story.odiaLegendSummary || ''}`;
        break;
    }

    return ensurePureIndicProse(rawOdia, 'or');
  }

  if (activeLang === 'hi') {
    const narrator = profile.narratorName.hi;
    const role = profile.voicePersonaTitle.hi;
    const place = profile.placeName.hi;
    const vol1 = getVolumeByNumber(story, 1)?.contentHi || '';
    const vol2 = getVolumeByNumber(story, 2)?.contentHi || '';
    const vol3 = getVolumeByNumber(story, 3)?.contentHi || '';
    const vol5 = getVolumeByNumber(story, 5)?.contentHi || '';
    const vol6 = getVolumeByNumber(story, 6)?.contentHi || '';

    let rawHindi = '';
    switch (intent) {
      case 'architecture':
        rawHindi = `प्रणाम, मैं ${narrator} (${role}) बोल रहा हूँ। ${place} की वास्तुकला और पाषाण अभियांत्रिकी का विवरण सुनिए:\n\n${
          story.hindiArchitectureSummary || ''
        }\n\n${vol2.split('\n\n').slice(0, 2).join('\n\n')}`;
        break;
      case 'legend':
        rawHindi = `प्रणाम, मैं ${narrator} (${role}) हूँ। ${place} से जुड़ी अमर लोककथा और परंपरा:\n\n${
          story.hindiLegendSummary || ''
        }\n\n${vol5.split('\n\n').slice(0, 2).join('\n\n')}`;
        break;
      case 'epigraphy':
        rawHindi = `प्रणाम, मैं ${narrator} हूँ। ${place} के प्रामाणिक शिलालेख, ताम्रपत्र और ऐतिहासिक साक्ष्य:\n\n${
          vol3.split('\n\n').slice(0, 2).slice(0, 2).join('\n\n') || story.hindiHistorySummary || ''
        }`;
        break;
      case 'festivals':
        rawHindi = `प्रणाम, मैं ${narrator} हूँ। ${place} के प्रमुख पर्व, अनुष्ठान और सांस्कृतिक उत्सव:\n\n${
          vol5.split('\n\n').slice(-2).join('\n\n') || story.hindiLegendSummary || ''
        }`;
        break;
      case 'conservation':
        rawHindi = `प्रणाम, मैं ${narrator} हूँ। ${place} के पुरातात्विक उत्खनन और धरोहर संरक्षण का इतिहास:\n\n${
          vol6.split('\n\n').slice(0, 2).join('\n\n') || story.hindiHistorySummary || ''
        }`;
        break;
      case 'timing_rules':
        rawHindi = `प्रणाम, मैं ${narrator} (${role}) बोल रहा हूँ। ${place} के दर्शन नियम, समय व वेशभूषा संहिता:\n\n• दर्शन समय: प्रातः 6:00 से रात्रि 9:00 तक (पहुड़ विश्राम समय को छोड़कर)।\n• नियम: चमड़े की वस्तुएं (बेल्ट, पर्स आदि) पूर्णतः वर्जित हैं। मंदिर प्रांगण में शालीन पारंपरिक परिधान (धोती-कुर्ता या साड़ी/सूट) पहनें। मोबाइल फोन मुख्य द्वार पर क्लॉक रूम में जमा करें।`;
        break;
      case 'history':
        rawHindi = `प्रणाम, मैं ${narrator} (${role}) हूँ। ${place} का प्रामाणिक इतिहास:\n\n${
          story.hindiHistorySummary || ''
        }\n\n${vol1.split('\n\n').slice(0, 2).join('\n\n')}`;
        break;
      default:
        rawHindi = `${profile.culturalGreeting.hi}\n\n${story.hindiHistorySummary || ''}\n\nस्थापत्य विशेषताएँ: ${
          story.hindiArchitectureSummary || ''
        }\n\nलोककथा एवं परंपरा: ${story.hindiLegendSummary || ''}`;
        break;
    }

    return ensurePureIndicProse(rawHindi, 'hi');
  }

  // English ('en')
  const narratorEn = profile.narratorName.en;
  const roleEn = profile.voicePersonaTitle.en;
  const placeEn = profile.placeName.en;
  const highlights = (story.architecturalHighlights || []).slice(0, 4).join(' • ');
  const sources = (story.historicalSources || []).slice(0, 4).join('; ');
  const vol2En = getVolumeByNumber(story, 2)?.contentEn || '';
  const vol3En = getVolumeByNumber(story, 3)?.contentEn || '';
  const vol5En = getVolumeByNumber(story, 5)?.contentEn || '';
  const vol6En = getVolumeByNumber(story, 6)?.contentEn || '';

  switch (intent) {
    case 'architecture':
      return `Greetings, I am ${narratorEn} (${roleEn}). Speaking of the architectural and material mastery of ${placeEn} (${story.period}):\n\nKey Structural Highlights: ${highlights}.\n\n${
        vol2En.split('\n\n').slice(0, 2).join('\n\n') || story.documentedHistory
      }`;
    case 'legend':
      return `Greetings from ${placeEn}. As ${narratorEn}, let me share the sacred memory and oral chronicle preserved here:\n\n${story.legendAndFolklore}\n\n${
        vol5En.split('\n\n')[0] || ''
      }`;
    case 'epigraphy':
      return `As ${narratorEn}, I can confirm the primary epigraphic and manuscript evidence for ${placeEn}:\n\n${
        story.inscriptionsAndManuscripts || sources
      }\n\nVerified Sources: ${sources}.\n\n${vol3En.split('\n\n')[0] || ''}`;
    case 'festivals':
      return `Greetings, I am ${narratorEn}. Living ritual and seasonal festivals remain the heartbeat of ${placeEn}:\n\n${
        vol5En.split('\n\n').slice(0, 2).join('\n\n') || story.legendAndFolklore
      }`;
    case 'conservation':
      return `As ${narratorEn} (${roleEn}), here is the archaeological survey and conservation chronicle of ${placeEn}:\n\n${
        vol6En.split('\n\n').slice(0, 2).join('\n\n') || story.documentedHistory
      }`;
    case 'timing_rules':
      return `Greetings, I am ${narratorEn} (${roleEn}). Visiting guidelines, timings, and sanctum etiquette for ${placeEn}:\n\n• Visiting Timings: 6:00 AM to 9:00 PM (subject to temple ritual pahuda schedules).\n• Sanctum Etiquette: Non-leather items only (leather belts and wallets prohibited inside holy precincts). Modest traditional Indian attire recommended. Handheld phones should be safely deposited at entrance cloakrooms.`;
    case 'history':
      return `Greetings, I am ${narratorEn} (${roleEn}). Here is the verified historical chronicle of ${placeEn} (${story.period}, ${story.location}):\n\n${story.documentedHistory}\n\nPrimary Historical Figures: ${(
        story.keyHistoricalFigures || []
      ).join(', ')}.`;
    default:
      return `${profile.culturalGreeting.en}\n\nDocumented History (${story.period}): ${story.documentedHistory}\n\nArchitectural Highlights: ${highlights}.\n\nSacred Legend: ${story.legendAndFolklore}`;
  }
}

/**
 * Matches any of the 25 monuments from English, Odia, or Hindi text so general Utkal Mitra
 * queries in Hindi/Odia/English also return rich monument chronicles.
 */
export function findMatchingHistoricStory(query: string): AudioGuideStory | undefined {
  const q = query.toLowerCase();
  const keywordAliases: Array<[RegExp, string]> = [
    [/konark|surya|chandrabhaga|dharmapada|କୋଣାର୍କ|ସୂର୍ଯ୍ୟ|कोणार्क|सूर्य/, 'story-konark'],
    [/jagannath|puri|srimandir|mahaprasad|ratha\s*yatra|ଜଗନ୍ନାଥ|ପୁରୀ|ଶ୍ରୀମନ୍ଦିର|जगन्नाथ|पुरी|श्रीमंदिर/, 'story-puri-jagannath'],
    [/dhauli|ashoka|kalinga\s*war|daya\s*river|ଧଉଳି|ଅଶୋକ|धौली|अशोक|कलिंग\s*युद्ध/, 'story-dhauli'],
    [/khandagiri|udayagiri\s*cave|kharavela|hathigumpha|ଖଣ୍ଡଗିରି|ଖାରବେଳ|ହାତୀଗୁମ୍ଫା|खंडगिरि|खारवेल|हाथीगुम्फा/, 'story-khandagiri-udayagiri'],
    [/lingaraj|ekamra|yayati|ଲିଙ୍ଗରାଜ|ଏକାମ୍ର|लिंगराज|एकांम्र/, 'story-lingaraj'],
    [/barabati|cuttack|bali\s*yatra|tarkashi|ବାରବାଟୀ|କଟକ|बाराबती|कटक/, 'story-cuttack-barabati'],
    [/ratnagiri|lalitgiri|diamond\s*triangle|ରତ୍ନଗିରି|ଲଳିତଗିରି|रत्नगिरि|ललितगिरि/, 'story-diamond-triangle'],
    [/chilika|kalijai|nalabana|satapada|ଚିଲିକା|କାଳିଜାଈ|चिल्का|कालिजाई/, 'story-chilika'],
    [/similipal|khiching|baripada|chhau|ଶିମିଳିପାଳ|ଖିଚିଙ୍ଗ|सिमिलिपाल|खिचिंग/, 'story-similipal'],
    [/hirakud|sambalpur|samaleswari|huma|surendra\s*sai|ହୀରାକୁଦ|ସମ୍ବଲପୁର|ସମଲେଶ୍ୱରୀ|हीराकुद|संबलपुर|समलेश्वरी/, 'story-hirakud-sambalpur'],
    [/daringbadi|kandhamal|mandasuru|ଦାରିଙ୍ଗବାଡ଼ି|କନ୍ଧମାଳ|दारिंगबाड़ी|कंधमाल/, 'story-daringbadi'],
    [/gupteswar|deomali|laxman\s*nayak|ଗୁପ୍ତେଶ୍ୱର|ଦେଓମାଳି|गुप्तेश्वर|देवमाली/, 'story-gupteswar-koraput'],
    [/raghurajpur|pattachitra|gotipua|kelucharan|ରଘୁରାଜପୁର|ପଟ୍ଟଚିତ୍ର|रघुराजपुर|पट्टचित्र/, 'story-raghurajpur'],
    [/mukteswar|rajarani|ମୂକ୍ତେଶ୍ୱର|ରାଜାରାଣୀ|मुक्तेश्वर|राजारानी/, 'story-mukteswar-rajarani'],
    [/hirapur|yogini|chausathi|ହୀରାପୁର|ଯୋଗିନୀ|हीरापुर|योगिनी|चौसठ/, 'story-hirapur-yogini'],
    [/biraja|jajpur|viraja|ବିରଜା|ଯାଜପୁର|बिरजा|जाजपुर/, 'story-jajpur-biraja'],
    [/jaugada|tara\s*tarini|ganjam|ଜଉଗଡ଼|ତାରାତାରିଣୀ|जउगड़|तारातारिणी/, 'story-jaugada-taratarini'],
    [/kapilash|joranda|mahima|dhenkanal|କପିଳାସ|ଜୋରନ୍ଦା|ମହିମା|कपिलाश|जोरंदा|महिमा/, 'story-kapilash-joranda'],
    [/bhitarkanika|kanika|gahirmatha|ଭିତରକନିକା|କନିକା|भितरकनिका|कनिका/, 'story-bhitarkanika-kanika'],
    [/nrusinghanath|harishankar|gandhamardan|ନୃସିଂହନାଥ|ହରିଶଙ୍କର|ଗନ୍ଧମାର୍ଦ୍ଦନ|नृसिंहनाथ|हरिशंकर|गंधमार्दन/, 'story-gandhamardan-nrusinghanath'],
    [/ranipur|jharial|someswar|ରାଣୀପୁର|ଝରିଆଲ|रानीपुर|झरियाल/, 'story-ranipur-jharial'],
    [/mahendragiri|gajapati|parashurama|ମହେନ୍ଦ୍ରଗିରି|महेंद्रगिरि/, 'story-mahendragiri'],
    [/sonepur|subarnapur|suvarnapura|lankeswari|ସୋନପୁର|ସୁବର୍ଣ୍ଣପୁର|सोनपुर|सुवर्णपुर/, 'story-sonepur-suvarnapura'],
    [/chandipur|balasore|fakir\s*mohan|ଚାନ୍ଦିପୁର|ବାଲେଶ୍ୱର|चांदीपुर|बालेश्वर/, 'story-balasore-chandipur'],
    [/sunabeda|sabara\s*srikhetra|duduma|ସୁନାବେଡ଼ା|ଶବର\s*ଶ୍ରୀକ୍ଷେତ୍ର|सुनाबेड़ा|शबर\s*श्रीक्षेत्र/, 'story-sunabeda-koraput-sabara'],
  ];

  for (const [regex, id] of keywordAliases) {
    if (regex.test(q)) {
      return ODISHA_HISTORICAL_STORIES.find((s) => s.id === id);
    }
  }
  return undefined;
}

export function answerGeneralOdishaAssistantMultilingual(query: string, lang: VoiceLang = 'en'): string {
  const activeLang = detectQueryLanguage(query, lang);
  const q = query.toLowerCase();

  const isSafety =
    /sos|police|emergency|help|safe|hospital|helpline|control\s*room|ସୁରକ୍ଷା|ପୋଲିସ|ଜରୁରୀ|ସହାୟତା|ଡାକ୍ତରଖାନା|सुरक्षा|पुलिस|आपातकाल|हेल्पलाइन|अस्पताल|मदद/.test(
      q
    );
  const isTransit =
    /bus|train|cab|auto|fare|price|airport|mo\s*bus|route|ବସ୍|ଟ୍ରେନ୍|ଭଡ଼ା|ଯାତାୟାତ|ରୁଟ୍|बस|ट्रेन|किराया|ऑटो|एयरपोर्ट|मार्ग/.test(
      q
    );
  const isFood =
    /food|cuisine|pakhala|rasagola|chhena\s*poda|magji|mudhi\s*mansa|kai\s*chutney|coffee|craft|handloom|sweet|gi\s*tag|ମିଠା|ଜିଆଇ|ଖାଦ୍ୟ|ପଖାଳ|ରସଗୋଲା|ଛେନାପୋଡ଼|ମଗଜି|ମୁଢ଼ି|କାଈ|କଫି|ଭୋଜନ|भोजन|व्यंजन|पखाल|रसगुल्ला|छेनापोड़|मगजी|मुढ़ी|कॉफ़ी|मिठाई|जीआई/.test(
      q
    );
  const isInscriptions =
    /inscri|epigraph|edict|hatigumpha|kharavela|brahmi|ashoka\s*rock|baya\s*chakada|ଶିଳାଲେଖ|ଅଭିଲେଖ|ହାତୀଗୁମ୍ଫା|ଖାରବେଳ|ବ୍ରାହ୍ମୀ|शिलालेख|अभिलेख|हाथीगुम्फा|खारवेल|ब्राह्मी/.test(
      q
    );

  // 1. High-priority transit and fare queries (prevents 'Puri Mo Bus' from returning temple history)
  if (isTransit) {
    if (activeLang === 'or') {
      return ensurePureIndicProse(
        'ନମସ୍କାର! ଓଡ଼ିଶା ଯାତାୟାତ ଓ ମୋ ବସ୍ ସରକାରୀ ଭଡ଼ା ସୂଚନା:\n\n' +
        '• ରୁଟ୍ ୫୦ (ଭୁବନେଶ୍ୱର ରେଳ ଷ୍ଟେସନ୍ରୁ ପୁରୀ): ଶୀତତାପ ନିୟନ୍ତ୍ରିତ (ଏସି) ଭଡ଼ା ₹୭୦, ଅଣ-ଏସି ₹୫୦ (ପ୍ରତି ୨୦ ମିନିଟରେ ଉପଲବ୍ଧ)।\n' +
        '• ରୁଟ୍ ୭୦ (ଭୁବନେଶ୍ୱର ବିମାନବନ୍ଦରରୁ କୋଣାର୍କ): ଶୀତତାପ ନିୟନ୍ତ୍ରିତ ଭଡ଼ା ₹୭୦।\n' +
        '• କଟକ-ଭୁବନେଶ୍ୱର ରୁଟ୍: ଭଡ଼ା ₹୩୦ ରୁ ₹୪୫।\n' +
        '• ଟ୍ୟାକ୍ସି ବେଞ୍ଚମାର୍କ: ଭୁବନେଶ୍ୱରରୁ ପୁରୀ କିମ୍ବା କୋଣାର୍କ ପ୍ରାୟ ₹୧୪୦୦ ରୁ ₹୧୮୦୦। ବିମାନବନ୍ଦର ଓ ଷ୍ଟେସନ୍ରେ ପ୍ରି-ପେଇଡ୍ ଅଟୋ/ଟ୍ୟାକ୍ସି କାଉଣ୍ଟର ଉପଲବ୍ଧ। ସମସ୍ତ ୩୦ ଜିଲ୍ଲାର ବସ୍-ଟ୍ରେନ୍ ବିବରଣୀ ପାଇଁ ଆପ୍‌ର ‘ଯାତାୟାତ ଓ ଭଡ଼ା’ ବିଭାଗ ଦେଖନ୍ତୁ।',
        'or'
      );
    }
    if (activeLang === 'hi') {
      return ensurePureIndicProse(
        'नमस्ते! ओडिशा परिवहन व ‘मो बस’ (Mo Bus) सरकारी किराया विवरण:\n\n' +
        '• रूट 50 (भुवनेश्वर रेलवे स्टेशन से पुरी): वातानुकूलित (एसी) किराया ₹70, नॉन-एसी ₹50 (प्रत्येक 20 मिनट पर उपलब्ध)।\n' +
        '• रूट 70 (भुवनेश्वर एयरपोर्ट से कोणार्क): एसी किराया ₹70।\n' +
        '• कटक-भुवनेश्वर रूट: किराया ₹30 से ₹45।\n' +
        '• टैक्सी मानक: भुवनेश्वर से पुरी अथवा कोणार्क लगभग ₹1400 से ₹1800। एयरपोर्ट व स्टेशन पर प्री-पेड ऑटो/टैक्सी बूथ उपलब्ध हैं। विस्तृत दरों हेतु ऐप का ‘ट्रांजिट व किराया’ टैब देखें।',
        'hi'
      );
    }
    return (
      'Greetings! Odisha Transit & CRUT Mo Bus Official Route & Fare Guide:\n\n' +
      '• Route 50 (Bhubaneswar Railway Station to Puri via NH-316): AC fare ₹70, Non-AC ₹50 (runs every 20 mins).\n' +
      '• Route 70 (Bhubaneswar Airport to Konark via Pipili): AC fare ₹70.\n' +
      '• Cuttack - Bhubaneswar inter-city routes: Fare ₹30–₹45.\n' +
      '• Taxi/Cab Benchmark: Bhubaneswar to Puri/Konark approx ₹1,400–₹1,800. Auto-rickshaw prepaid booths available at airport and stations. Check the Transit & Fares tab for complete route matrices.'
    );
  }

  // 2. High-priority emergency safety and hospital queries
  if (isSafety) {
    if (activeLang === 'or') {
      return ensurePureIndicProse(
        'ନମସ୍କାର! ଉତ୍କଳ ସୁରକ୍ଷା ଜରୁରୀକାଳୀନ ସହାୟତା ଓ ହେଲ୍ପଲାଇନ୍:\n\n' +
        '• ଜାତୀୟ ଜରୁରୀ ସେବା (ERSS): ୧୧୨ (ପୋଲିସ, ଆମ୍ବୁଲାନ୍ସ ଓ ଅଗ୍ନିଶମ)\n' +
        '• ଓଡ଼ିଶା ପର୍ଯ୍ୟଟନ ୨୪x୭ ହେଲ୍ପଲାଇନ୍: ୧୮୦୦-୨୦୮-୧୪୧୪\n' +
        '• ମହିଳା ସୁରକ୍ଷା ହେଲ୍ପଲାଇନ୍: ୧୮୧ | ସାଇବର ଅପରାଧ: ୧୯୩୦\n' +
        '• ଆପ୍‌ର ‘ଉତ୍କଳ ସୁରକ୍ଷା’ ବିଭାଗରୁ ଆପଣ ଗୋଟିଏ କ୍ଲିକ୍ରେ ନିଜର ଲାଇଭ୍ ଜିପିଏସ୍ କୋଅର୍ଡିନେଟ୍ସ କପି କରି ପରିବାର କିମ୍ବା ପୋଲିସକୁ ପଠାଇପାରିବେ ଏବଂ ସମସ୍ତ ୩୦ ଜିଲ୍ଲାର ମୁଖ୍ୟ ଡାକ୍ତରଖାନା ନମ୍ବର ପାଇପାରିବେ।',
        'or'
      );
    }
    if (activeLang === 'hi') {
      return ensurePureIndicProse(
        'नमस्ते! उत्कल सुरक्षा आपातकालीन सहायता व हेल्पलाइन:\n\n' +
        '• राष्ट्रीय आपात सेवा (ERSS): 112 (पुलिस, एम्बुलेंस व अग्निशमन)\n' +
        '• ओडिशा पर्यटन 24x7 हेल्पलाइन: 1800-208-1414\n' +
        '• महिला सुरक्षा हेल्पलाइन: 181 | साइबर अपराध: 1930\n' +
        '• ऐप के ‘उत्कल सुरक्षा’ टैब से आप एक क्लिक में अपना लाइव जीपीएस लोकेशन कॉपी कर पुलिस या परिजनों को भेज सकते हैं और सभी 30 ज़िलों के मुख्य सरकारी अस्पताल व कंट्रोल रूम नंबर देख सकते हैं।',
        'hi'
      );
    }
    return (
      'UtkalSuraksha Emergency Support & Helplines:\n\n' +
      '• National Emergency Response (ERSS): 112 (Police, Ambulance, Fire)\n' +
      '• Odisha Tourism 24x7 Helpline: 1800-208-1414\n' +
      '• Women Safety Helpline: 181 | Cyber Crime: 1930\n' +
      '• The UtkalSuraksha tab provides direct contact numbers for District Headquarters Hospitals (DHH) and Police Control Rooms across all 30 districts, with one-tap live GPS coordinates sharing.'
    );
  }

  // 3. High-priority GI tags and iconic regional cuisine queries
  if (isFood && !findDistrict(query)) {
    if (activeLang === 'or') {
      return ensurePureIndicProse(
        'ନମସ୍କାର! ଓଡ଼ିଶାର ବିଶ୍ୱପ୍ରସିଦ୍ଧ ଜିଆଇ ଟ୍ୟାଗ୍ ମିଠା ଓ ପାରମ୍ପରିକ ଖାଦ୍ୟ:\n\n' +
        '• ଢେଙ୍କାନାଳ ମଗଜି (Dhenkanal Magji): ମଇଁଷି କ୍ଷୀର ଛେନାରୁ ପ୍ରସ୍ତୁତ ଢେଙ୍କାନାଳର ପ୍ରସିଦ୍ଧ ଜିଆଇ ଟ୍ୟାଗ୍ ମିଠା।\n' +
        '• ନୟାଗଡ଼ ଛେନାପୋଡ଼ (Nayagarh Chhena Poda): ଶାଳପତ୍ରରେ ଗୁଡ଼ାଇ ପୋଡ଼ା ଯାଇଥିବା ଭାରତର ଅନନ୍ୟ ବେକ୍ଡ୍ ମିଠା (ଜିଆଇ ଟ୍ୟାଗ୍)।\n' +
        '• ଓଡ଼ିଶା ରସଗୋଲା: ଶତାବ୍ଦୀ ଶତାବ୍ଦୀ ଧରି ରଥଯାତ୍ରା ନୀଳାଦ୍ରି ବିଜେରେ ମହାପ୍ରଭୁ ଶ୍ରୀଜଗନ୍ନାଥଙ୍କୁ ସମର୍ପିତ ସ୍ୱାଦିଷ୍ଟ ରସଗୋଲା (ଜିଆଇ ଟ୍ୟାଗ୍)।\n' +
        '• ମୟୂରଭଞ୍ଜ ମୁଢ଼ି ମାଂସ ଓ କାଈ ଚଟଣୀ: ଶିମିଳିପାଳ ଜଙ୍ଗଲର ଲାଲ୍ ପିମ୍ପୁଡ଼ିରୁ ପ୍ରସ୍ତୁତ ପୁଷ୍ଟିକର କାଈ ଚଟଣୀ (ଜିଆଇ ଟ୍ୟାଗ୍) ଓ ଖାସି ମାଂସ ମୁଢ଼ି।\n' +
        '• କୋରାପୁଟ ଜୈବିକ କଫି: ପୂର୍ବଘାଟ ପର୍ବତମାଳାରେ ଆଦିବାସୀ ଚାଷୀଙ୍କ ଦ୍ୱାରା ଉତ୍ପାଦିତ ଉଚ୍ଚ ମାନର ଜୈବିକ କଫି।',
        'or'
      );
    }
    if (activeLang === 'hi') {
      return ensurePureIndicProse(
        'नमस्ते! ओडिशा के विश्वप्रसिद्ध जीआई टैग मिष्ठान व पारंपरिक व्यंजन:\n\n' +
        '• ढेंकानाल मगजी (Dhenkanal Magji): भैंस के दूध के ताज़ा छेने से निर्मित ढेंकानाल की प्रसिद्ध जीआई-टैग प्राप्त मिठाई।\n' +
        '• नयागढ़ छेना पोड़ (Nayagarh Chhena Poda): साल के पत्तों में लपेटकर धीमी आंच पर पकाई गई भारत की अनूठी मिठाई (जीआई टैग)।\n' +
        '• ओडिशा रसगुल्ला: रथयात्रा नीलाद्रि बिजे पर महाप्रभु जगन्नाथ को अर्पित सदियों पुराना रसीला मिष्ठान (जीआई टैग)।\n' +
        '• मयूरभंज मुढ़ी मांसा व काई चटनी: मयूरभंज का मटन मुढ़ी तथा शिमिलिपाल की लाल बुनकर चींटियों से निर्मित पौष्टिक काई चटनी (जीआई टैग)।\n' +
        '• कोरापुट जैविक कॉफ़ी: पूर्वी घाट के आदिवासियों द्वारा उगाई जाने वाली उच्च गुणवत्ता वाली ऑर्गेनिक अरेबिका कॉफ़ी।',
        'hi'
      );
    }
    return (
      'Greetings! Odisha GI Tag Delicacies & Culinary Heritage:\n\n' +
      '• Dhenkanal Magji: Certified GI Tag sweet crafted from condensed buffalo milk chhena, unique to Dhenkanal.\n' +
      '• Nayagarh Chhena Poda: The legendary caramelized baked cottage cheese sweet slow-cooked in sal leaves (GI Tag).\n' +
      '• Odisha Rasagola: Authentic soft, brown-tinted sweet with centuries of Jagannath temple Niladri Bije ritual tradition (GI Tag).\n' +
      '• Mayurbhanj Mudhi Mansa & Kai Chutney: Traditional puffed rice with mutton, and Similipal’s red weaver ant Kai Chutney (GI Tag).\n' +
      '• Koraput Organic Coffee: High-altitude shade-grown Arabica coffee cultivated by tribal farmers in Koraput hills (GI Tag).'
    );
  }

  // 4. Master Inscriptions and Epigraphy queries (Konark, Dhauli, Kharavela Hathigumpha)
  if (isInscriptions) {
    if (activeLang === 'or') {
      return ensurePureIndicProse(
        'ନମସ୍କାର! ଓଡ଼ିଶାର ପ୍ରମୁଖ ତିନୋଟି ଐତିହାସିକ ଶିଳାଲେଖ ଓ ପୋଥି ପ୍ରମାଣ:\n\n' +
        '୧. ଖାରବେଳଙ୍କ ହାତୀଗୁମ୍ଫା ଶିଳାଲେଖ (ଉଦୟଗିରି, ଭୁବନେଶ୍ୱର): ଖ୍ରୀଷ୍ଟପୂର୍ବ ପ୍ରଥମ ଶତାବ୍ଦୀର ମହାମେଘବାହନ ସମ୍ରାଟ ଖାରବେଳଙ୍କ ୧୭ ଧାଡ଼ି ବିଶିଷ୍ଟ ବ୍ରାହ୍ମୀ ଲିପି ଓ ପ୍ରାକୃତ ଭାଷାର ଶିଳାଲେଖ, ଯେଉଁଥିରେ ‘ଭାରତବର୍ଷ’ ନାମର ସର୍ବପ୍ରଥମ ପ୍ରାମାଣିକ ଉଲ୍ଲେଖ ରହିଛି।\n' +
        '୨. ସମ୍ରାଟ ଅଶୋକଙ୍କ ଧଉଳି ଶିଳାଲେଖ: ଖ୍ରୀଷ୍ଟପୂର୍ବ ୨୬୧ର କଳିଙ୍ଗ ଯୁଦ୍ଧ ପରେ ଅଶୋକଙ୍କ କଳିଙ୍ଗ ଶିଳାଲେଖ, ଯେଉଁଥିରେ ସେ ଘୋଷଣା କରିଥିଲେ: ‘ସବେ ମୁନିସେ ପଜା ମମା’ (ସମସ୍ତ ମଣିଷ ମୋର ସନ୍ତାନ)।\n' +
        '୩. କୋଣାର୍କ ବାୟା ଚକଡ଼ା ତାଳପତ୍ର ପୋଥି: ରାଜା ଲାଙ୍ଗୁଳା ନରସିଂହଦେବ ଓ ପ୍ରଧାନ ସ୍ଥପତି ବିଶୁ ମହାରଣାଙ୍କ ଦ୍ୱାରା କୋଣାର୍କ ସୂର୍ଯ୍ୟ ମନ୍ଦିର ନିର୍ମାଣର ଦୈନିକ ହିସାବ ଓ ବାସ୍ତୁ ବିବରଣୀ।',
        'or'
      );
    }
    if (activeLang === 'hi') {
      return ensurePureIndicProse(
        'नमस्ते! ओडिशा के प्रमुख तीन ऐतिहासिक शिलालेख व अभिलेख साक्ष्य:\n\n' +
        '1. सम्राट खारवेल का हाथीगुम्फा शिलालेख (उदयगिरि, भुवनेश्वर): ईसा पूर्व पहली सदी का महामेघवाहन सम्राट खारवेल का 17 पंक्तियों का ब्राह्मी लिपि व प्राकृत भाषा का शिलालेख, जिसमें ‘भारतवर्ष’ का प्राचीनतम अभिलेखीय उल्लेख मिलता है।\n' +
        '2. सम्राट अशोक का धौली शिलालेख: 261 ईसा पूर्व कलिंग युद्ध के उपरांत उत्कीर्ण अशोक का विशेष कलिंग शिलालेख, जिसमें अमर संदेश है: ‘सबे मुनिसे पजा ममा’ (सभी मनुष्य मेरी संतान हैं)।\n' +
        '3. कोणार्क बाया चकड़ा ताड़पत्र पांडुलिपि: राजा लांगुला नरसिंहदेव और मुख्य वास्तुकार बिशु महाराणा द्वारा कोणार्क सूर्य मंदिर निर्माण का प्रामाणिक दैनिक वास्तुशिल्प व लेखा-जोखा अभिलेख।',
        'hi'
      );
    }
    return (
      'Greetings! Odisha Master Epigraphic & Manuscript Chronicles:\n\n' +
      '1. Kharavela’s Hathigumpha Inscription (Udayagiri, Bhubaneswar): 17-line Brahmi script, Prakrit inscription from the 1st century BCE by Mahameghavahana Emperor Kharavela, containing the earliest documented epigraphic mention of "Bharatavarsha".\n' +
      '2. Ashoka’s Dhauli Rock Edicts: Carved following the Kalinga War (261 BCE), where Emperor Ashoka renounced violence and declared: "Savve Munisse Paja Mama" ("All men are my children").\n' +
      '3. Konark Baya Chakada Palm-Leaf Manuscript: The documented daily architectural logbook and accounts of King Narasimhadeva I and chief architect Bishu Maharana detailing 12 years of temple construction.'
    );
  }

  // 5. Match by Monument (Puri Jagannath, Konark, Dhauli, Lingaraj, etc.)
  const matchedStory = findMatchingHistoricStory(query);
  if (matchedStory) {
    return answerMonumentQuestionMultilingual(query, matchedStory, undefined, activeLang);
  }

  // 6. Match by District (Mayurbhanj, Koraput, Dhenkanal, Sambalpur, etc.)
  const matchedDistrict = findDistrict(query);
  if (matchedDistrict) {
    if (activeLang === 'or') {
      return ensurePureIndicProse(
        `ନମସ୍କାର! ${matchedDistrict.name} (${matchedDistrict.odiaName}) ଜିଲ୍ଲା ଦର୍ଶନ ଓ ଯାତ୍ରା ସୂଚନା:\n\n` +
        `• ମୁଖ୍ୟ ଆକର୍ଷଣ: ${matchedDistrict.highlights.join(', ')}\n` +
        `• ପ୍ରସିଦ୍ଧ ଖାଦ୍ୟ: ${matchedDistrict.signatureCuisine.join(', ')}\n` +
        `• ଇକୋ-ଟୁରିଜିମ୍ ଓ ପ୍ରକୃତି: ${matchedDistrict.ecoTourismAndNature.join(', ')}\n` +
        `• ହସ୍ତତନ୍ତ ଓ ଶିଳ୍ପ: ${matchedDistrict.handicraftsAndArt.join(', ')}\n` +
        `• ଯାତାୟାତ: ରେଳ: ${matchedDistrict.transportHubs.nearestRail} | ରାଜପଥ: ${matchedDistrict.transportHubs.highway}\n` +
        `• ସୁରକ୍ଷା ଓ ହସ୍ପିଟାଲ: ${matchedDistrict.safetyAndHelpline.districtHospital} | ପୋଲିସ ନିୟନ୍ତ୍ରଣ କକ୍ଷ: ${matchedDistrict.safetyAndHelpline.controlRoomNumber} | ଜରୁରୀକାଳୀନ: ୧୧୨।`,
        'or'
      );
    }
    if (activeLang === 'hi') {
      return ensurePureIndicProse(
        `नमस्ते! ${matchedDistrict.name} (${matchedDistrict.odiaName}) ज़िला यात्रा विवरण:\n\n` +
        `• प्रमुख दर्शनीय स्थल: ${matchedDistrict.highlights.join(', ')}\n` +
        `• प्रसिद्ध खानपान: ${matchedDistrict.signatureCuisine.join(', ')}\n` +
        `• ईको-टूरिज्म व प्रकृति: ${matchedDistrict.ecoTourismAndNature.join(', ')}\n` +
        `• हस्तशिल्प व संस्कृति: ${matchedDistrict.handicraftsAndArt.join(', ')}\n` +
        `• परिवहन: निकटतम रेलवे: ${matchedDistrict.transportHubs.nearestRail} | राजमार्ग: ${matchedDistrict.transportHubs.highway}\n` +
        `• सुरक्षा व चिकित्सा: ${matchedDistrict.safetyAndHelpline.districtHospital} | पुलिस कंट्रोल रूम: ${matchedDistrict.safetyAndHelpline.controlRoomNumber} | आपातकाल: 112।`,
        'hi'
      );
    }
    return (
      `Greetings! Travel guide for ${matchedDistrict.name} (${matchedDistrict.odiaName}, HQ: ${matchedDistrict.headquarters}):\n\n` +
      `• Top Attractions: ${matchedDistrict.highlights.join(', ')}\n` +
      `• Signature Cuisine: ${matchedDistrict.signatureCuisine.join(', ')}\n` +
      `• Eco-Tourism: ${matchedDistrict.ecoTourismAndNature.join(', ')}\n` +
      `• Crafts & Handloom: ${matchedDistrict.handicraftsAndArt.join(', ')}\n` +
      `• Transit: Rail: ${matchedDistrict.transportHubs.nearestRail} | Highway: ${matchedDistrict.transportHubs.highway}\n` +
      `• Hospital & Emergency: ${matchedDistrict.safetyAndHelpline.districtHospital} | Police Control: ${matchedDistrict.safetyAndHelpline.controlRoomNumber} | SOS: 112.`
    );
  }

  // 7. General Multilingual Welcoming Assistant Fallback
  if (activeLang === 'or') {
    return ensurePureIndicProse(
      'ଜୟ ଜଗନ୍ନାଥ! ମୁଁ ‘ଉତ୍କଳ ମିତ୍ର’—ଆପଣଙ୍କର ଓଡ଼ିଆ ଭଏସ୍ ଆସିଷ୍ଟାଣ୍ଟ। ଆପଣ ମତେ ଓଡ଼ିଶାର ୨୫ଟି ଐତିହାସିକ ସ୍ଥାନ (କୋଣାର୍କ, ଶ୍ରୀମନ୍ଦିର, ଧଉଳି, ଲିଙ୍ଗରାଜ, ଚିଲିକା, ହୀରାକୁଦ, ଶିମିଳିପାଳ), ୩୦ଟି ଜିଲ୍ଲାର ଯାତ୍ରା ଯୋଜନା, ବସ୍-ଟ୍ୟାକ୍ସି ଭଡ଼ା କିମ୍ବା ପର୍ଯ୍ୟଟକ ସୁରକ୍ଷା ବିଷୟରେ ଓଡ଼ିଆରେ ପଚାରିପାରିବେ।',
      'or'
    );
  }

  if (activeLang === 'hi') {
    return ensurePureIndicProse(
      'जय जगन्नाथ! मैं ‘उत्कल मित्र’ हूँ—आपका हिंदी वॉइस असिस्टेंट। आप मुझसे ओडिशा के २५ ऐतिहासिक स्थलों (कोणार्क, पुरी जगन्नाथ, धौली, लिंगराज, चिल्का, हीराकुद, सिमिलिपाल), ३० ज़िलों की यात्रा योजना, किराया या पर्यटक सुरक्षा के बारे में हिंदी में पूछ सकते हैं।',
      'hi'
    );
  }

  return 'Jay Jagannath! I am Utkal Mitra, your multilingual Odisha Heritage & Travel Voice Assistant (English, ଓଡ଼ିଆ, and हिन्दी). Ask me about any of Odisha’s 25 historic monuments, custom itineraries across all 30 districts, fair transit rates, or UtkalSuraksha emergency support.';
}
