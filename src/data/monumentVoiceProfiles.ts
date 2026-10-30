export type GeminiPrebuiltVoice = 'Puck' | 'Charon' | 'Kore' | 'Fenrir' | 'Zephyr';

export type AcousticPreset =
  | 'stone-sanctum'
  | 'limestone-cavern'
  | 'ocean-breeze'
  | 'monastic-courtyard'
  | 'fortress-rampart'
  | 'highland-mist'
  | 'forest-canopy'
  | 'artisan-veranda';

export interface MonumentVoiceProfile {
  id: string;
  placeName: {
    en: string;
    or: string;
    hi: string;
  };
  narratorName: {
    en: string;
    or: string;
    hi: string;
  };
  voicePersonaTitle: {
    en: string;
    or: string;
    hi: string;
  };
  geminiVoiceName: GeminiPrebuiltVoice;
  voiceStylePrompt: {
    en: string;
    or: string;
    hi: string;
  };
  acousticPreset: AcousticPreset;
  timbreDescription: string;
  basePitch: number;
  rateMultiplier: number;
  droneRootFreqs: [number, number, number, number];
  preferredVoiceGender: 'male' | 'female';
  culturalGreeting: {
    or: string;
    hi: string;
    en: string;
  };
  curatedQuestions: {
    en: string;
    or: string;
    hi: string;
  }[];
}

export const MONUMENT_VOICE_PROFILES: Record<string, MonumentVoiceProfile> = {
  'story-konark': {
    id: 'story-konark',
    placeName: {
      en: 'Konark Sun Temple',
      or: 'କୋଣାର୍କ ସୂର୍ଯ୍ୟ ମନ୍ଦିର',
      hi: 'कोणार्क सूर्य मंदिर',
    },
    narratorName: {
      en: 'Master Sthapati Bisu Maharana',
      or: 'ମୁଖ୍ୟ ସ୍ଥପତି ବିଶୁ ମହାରଣା',
      hi: 'मुख्य वास्तुकार बिशु महाराणा',
    },
    voicePersonaTitle: {
      en: 'Imperial Sthapati & Master Guild Architect',
      or: 'କଳିଙ୍ଗର ପ୍ରଧାନ ଶିଳ୍ପୀ ଓ ସ୍ଥାପତ୍ୟ ଗୁରୁ',
      hi: 'कलिंग के मुख्य वास्तुकार व शिल्पी गुरु',
    },
    geminiVoiceName: 'Charon',
    voiceStylePrompt: {
      en: 'Deep, majestic architectural baritone of an elderly master stone sculptor, solemn imperial pride and measured cadence',
      or: 'ଗମ୍ଭୀର, ରାଜକୀୟ ଓ ଅଭିଜ୍ଞ ଓଡ଼ିଆ ପ୍ରଧାନ ଶିଳ୍ପୀଙ୍କ ସ୍ୱର, ସ୍ପଷ୍ଟ ଓ ଶୁଦ୍ଧ ଓଡ଼ିଆ ଉଚ୍ଚାରଣ ସହିତ',
      hi: 'गंभीर, राजसी और अनुभवी मुख्य वास्तुकार की प्रभावशाली आवाज़, शुद्ध और स्पष्ट हिन्दी उच्चारण',
    },
    acousticPreset: 'stone-sanctum',
    timbreDescription: 'Deep, resonant architectural baritone with majestic imperial gravitas (Charon • D2/A2 Raga Bhairav resonance).',
    basePitch: 0.88,
    rateMultiplier: 0.94,
    droneRootFreqs: [73.42, 110.0, 146.83, 220.0],
    preferredVoiceGender: 'male',
    culturalGreeting: {
      or: 'ନମସ୍କାର! ମୁଁ ମୁଖ୍ୟ ସ୍ଥପତି ବିଶୁ ମହାରଣା, କୋଣାର୍କ ସୂର୍ଯ୍ୟ ରଥର ଅମର ଶିଳ୍ପୀ।',
      hi: 'नमस्कार! मैं मुख्य वास्तुकार बिशु महाराणा, कोणार्क सूर्य रथ का अमर शिल्पी।',
      en: 'Namaskar! I am Master Sthapati Bisu Maharana, chief architect of the Konark Solar Chariot.',
    },
    curatedQuestions: [
      {
        or: '୧୨୦୦ ବଢ଼େଇ କାହିଁକି ଦଧିନଉତି ବସାଇ ପାରିନଥିଲେ ଏବଂ ଧର୍ମପଦ କିପରି ସଫଳ ହେଲେ?',
        hi: '1200 शिल्पकार कलश क्यों नहीं बैठा पाए और धर्मपद ने इसे कैसे संभव किया?',
        en: 'Why did the 1,200 sculptors struggle with the crown, and how did 12-year-old Dharmapada solve it?',
      },
      {
        or: 'କୋଣାର୍କର ୨୪ଟି ଚକ୍ର କିପରି ସୂର୍ଯ୍ୟଘଣ୍ଟା ଭାବରେ ପ୍ରତି ମିନିଟର ସମୟ କୁହେ?',
        hi: 'कोणार्क के 24 चक्र किस प्रकार धूपघड़ी बनकर मिनट-दर-मिनट समय बताते हैं?',
        en: 'How do the 24 stone wheels of Konark function as precise astronomical sundials?',
      },
      {
        or: '୧୯୦୧ ମସିହାରେ ବ୍ରିଟିଶ ସରକାର ଜଗମୋହନ ଭିତରେ ବାଲି କାହିଁକି ଭର୍ତ୍ତି କରିଥିଲେ?',
        hi: '1901 में ब्रिटिश प्रशासन ने जगमोहन के अंदर रेत भरकर इसे सील क्यों किया था?',
        en: 'Why did British conservators backfill and seal the Jagamohana with sand in 1901?',
      },
    ],
  },

  'story-puri-jagannath': {
    id: 'story-puri-jagannath',
    placeName: {
      en: 'Shree Jagannath Temple, Puri',
      or: 'ଶ୍ରୀ ଜଗନ୍ନାଥ ମନ୍ଦିର, ପୁରୀ',
      hi: 'श्री जगन्नाथ मंदिर, पुरी',
    },
    narratorName: {
      en: 'Daitapati Sevayat & Temple Chronicler',
      or: 'ଦଇତାପତି ସେବାୟତ ଓ ମାଦଳା ପାଞ୍ଜି ଗବେଷକ',
      hi: 'दैतापति सेवायत एवं मदला पांजी शोधकर्ता',
    },
    voicePersonaTitle: {
      en: 'Sacred Temple Chronicler & Daru Brahma Guardian',
      or: 'ଶ୍ରୀମନ୍ଦିର ଗୁପ୍ତ ଲୀଳା ଓ ଦାରୁବ୍ରହ୍ମ ସୁରକ୍ଷାକାରୀ',
      hi: 'श्रीमंदिर गुप्त लीला व दारू ब्रह्म संरक्षक',
    },
    geminiVoiceName: 'Puck',
    voiceStylePrompt: {
      en: 'Devotional, warm, lyrical temple chronicler tenor with reverent spiritual warmth and palm-leaf chant cadence',
      or: 'ଭକ୍ତିପୂର୍ଣ୍ଣ, ମଧୁର ଓ ଶ୍ରଦ୍ଧାଳୁ ପୁରୀ ଶ୍ରୀମନ୍ଦିର ସେବାୟତଙ୍କ ସ୍ୱର, ସ୍ପଷ୍ଟ ଓଡ଼ିଆ ଉଚ୍ଚାରଣ',
      hi: 'भक्तिपूर्ण, मधुर और श्रद्धावान श्रीमंदिर सेवायत की आवाज़, स्पष्ट व शुद्ध हिन्दी उच्चारण',
    },
    acousticPreset: 'stone-sanctum',
    timbreDescription: 'Devotional, lyrical, reverent tenor echoing ancient Madala Panji palm-leaf chants (Puck • F#2/C#3 Bhairavi drone).',
    basePitch: 1.08,
    rateMultiplier: 0.95,
    droneRootFreqs: [92.5, 138.6, 185.0, 277.2],
    preferredVoiceGender: 'male',
    culturalGreeting: {
      or: 'ଜୟ ଜଗନ୍ନାଥ! ମୁଁ ଶ୍ରୀମନ୍ଦିରର ଦଇତାପତି ସେବାୟତ, ପୁରୁଷୋତ୍ତମ କ୍ଷେତ୍ରର ଚିରନ୍ତନ ସେବକ।',
      hi: 'जय जगन्नाथ! मैं श्रीमंदिर का दैतापति सेवायत, पुरुषोत्तम क्षेत्र का चिरंतन सेवक।',
      en: 'Jay Jagannath! I am the Daitapati Sevayat and chronicler of Purushottama Kshetra.',
    },
    curatedQuestions: [
      {
        or: 'ଶ୍ରୀମନ୍ଦିର ଉପରେ ହୋଇଥିବା ୧୮ ଥର ଆକ୍ରମଣ ସମୟରେ ଦାରୁବ୍ରହ୍ମଙ୍କୁ କିପରି ସୁରକ୍ଷିତ ରଖାଯାଇଥିଲା?',
        hi: 'श्रीमंदिर पर हुए 18 हमलों के दौरान दारू ब्रह्म को किस प्रकार सुरक्षित रखा गया?',
        en: 'How did the Sevayats protect Daru Brahma across Chilika and hills during the 18 invasions?',
      },
      {
        or: 'ନବକଳେବର ଓ ବ୍ରହ୍ମ ପରିବର୍ତ୍ତନର ଗୂଢ଼ ରହସ୍ୟ କ’ଣ?',
        hi: 'नवकलेवर और ब्रह्म परिवर्तन का गूढ़ रहस्य क्या है?',
        en: 'What is the sacred mystery and ritual of Nabakalebara and Brahma Paribartan?',
      },
      {
        or: 'ଶ୍ରୀମନ୍ଦିର ରୋଷଘରେ ୫୬ ଭୋଗ କିପରି ମାଟି ପାତ୍ରରେ ପାକ ହୁଏ?',
        hi: 'श्रीमंदिर रसोई में मिट्टी के 7 बर्तनों में छप्पन भोग कैसे पकाया जाता है?',
        en: 'How does the world-largest traditional earthen kitchen prepare Mahaprasad on 240 hearths?',
      },
    ],
  },

  'story-dhauli': {
    id: 'story-dhauli',
    placeName: {
      en: 'Dhauli Shanti Stupa & Ashokan Edicts',
      or: 'ଧଉଳି ଶାନ୍ତି ସ୍ତୂପ ଓ ଅଶୋକୀୟ ଶିଳାଲେଖ',
      hi: 'धौली शांति स्तूप एवं अशोक शिलालेख',
    },
    narratorName: {
      en: 'Buddhist Monk Elder Upagupta',
      or: 'ସ୍ଥବିର ବୌଦ୍ଧ ଭିକ୍ଷୁ ଉପଗୁପ୍ତ',
      hi: 'स्थविर बौद्ध भिक्षु उपगुप्त',
    },
    voicePersonaTitle: {
      en: 'Enlightened Buddhist Hermit & Peace Sage',
      or: 'ଅହିଂସା ଓ ଧର୍ମବିଜୟର ମାର୍ଗଦର୍ଶକ ସନ୍ନ୍ୟାସୀ',
      hi: 'अहिंसा व धर्म-विजय के मार्गदर्शक संन्यासी',
    },
    geminiVoiceName: 'Zephyr',
    voiceStylePrompt: {
      en: 'Serene, meditative, compassionate Buddhist monk elder speaking softly with peaceful philosophical clarity',
      or: 'ଶାନ୍ତ, କରୁଣାମୟ ଓ ଧ୍ୟାନମଗ୍ନ ବୌଦ୍ଧ ଭିକ୍ଷୁଙ୍କ ସ୍ୱର, ଅତ୍ୟନ୍ତ ସ୍ପଷ୍ଟ ଓଡ଼ିଆ ଉଚ୍ଚାରଣ',
      hi: 'शांत, करुणामय और ध्यानमग्न बौद्ध भिक्षु की सौम्य आवाज़, शुद्ध हिन्दी उच्चारण',
    },
    acousticPreset: 'monastic-courtyard',
    timbreDescription: 'Whispered serenity, meditative calm, and solemn philosophical warmth (Zephyr • E2/B2 singing bowl resonance).',
    basePitch: 0.94,
    rateMultiplier: 0.90,
    droneRootFreqs: [82.41, 123.47, 164.81, 246.94],
    preferredVoiceGender: 'male',
    culturalGreeting: {
      or: 'ନମୋ ବୁଦ୍ଧାୟ! ମୁଁ ଭିକ୍ଷୁ ଉପଗୁପ୍ତ, ଦୟା ନଦୀ ତଟରେ ସମ୍ରାଟ ଅଶୋକଙ୍କ ହୃଦୟ ପରିବର୍ତ୍ତନର ସାକ୍ଷୀ।',
      hi: 'नमो बुद्धाय! मैं भिक्षु उपगुप्त, दया नदी तट पर सम्राट अशोक के हृदय परिवर्तन का साक्षी।',
      en: 'Namo Buddhaya! I am Monk Upagupta, witness to Emperor Ashoka’s conversion at Daya River.',
    },
    curatedQuestions: [
      {
        or: 'ଖ୍ରୀଷ୍ଟପୂର୍ବ ୨୬୧ କଳିଙ୍ଗ ଯୁଦ୍ଧ କିପରି ସମ୍ରାଟ ଅଶୋକଙ୍କୁ ଚଣ୍ଡାଶୋକରୁ ଧର୍ମାଶୋକ କଲା?',
        hi: 'ईसा पूर्व 261 के कलिंग युद्ध ने सम्राट अशोक को चंडाशोक से धर्माशोक कैसे बनाया?',
        en: 'How did the Kalinga War of 261 BCE transform Ashoka from conqueror to apostle of peace?',
      },
      {
        or: 'ଧଉଳିର ପଥର-ଖୋଦିତ ପ୍ରାଚୀନ ହାତୀ ମୂର୍ତ୍ତିର ଐତିହାସିକ ଗୁରୁତ୍ୱ କ’ଣ?',
        hi: 'धौली की चट्टान से तराशी गई प्राचीन हाथी प्रतिमा का ऐतिहासिक महत्व क्या है?',
        en: 'What is the significance of the 3rd century BCE rock-cut elephant at Dhauli?',
      },
      {
        or: '୧୯୭୨ ମସିହାରେ ନିର୍ମିତ ଭାରତ-ଜାପାନ ଶାନ୍ତି ସ୍ତୂପର ବାର୍ତ୍ତା କ’ଣ?',
        hi: '1972 में बने भारत-जापान शांति स्तूप का विश्व शांति संदेश क्या है?',
        en: 'What is the history of the 1972 Indo-Japanese White Peace Pagoda atop Dhauli?',
      },
    ],
  },

  'story-khandagiri-udayagiri': {
    id: 'story-khandagiri-udayagiri',
    placeName: {
      en: 'Udayagiri & Khandagiri Caves',
      or: 'ଉଦୟଗିରି ଓ ଖଣ୍ଡଗିରି ପ୍ରାଚୀନ ଗୁମ୍ଫା',
      hi: 'उदयगिरि एवं खंडगिरि प्राचीन गुफाएं',
    },
    narratorName: {
      en: 'Imperial Herald of Emperor Kharavela',
      or: 'ମହାମେଘବାହନ ସମ୍ରାଟ ଖାରବେଳଙ୍କ ରାଜଦୂତ',
      hi: 'महामेघवाहन सम्राट खारवेल के राजघोषक',
    },
    voicePersonaTitle: {
      en: 'Imperial Royal Herald & Hathigumpha Epigraphist',
      or: 'କଳିଙ୍ଗର ବିଜୟୀ ରାଜଦୂତ ଓ ଶିଳାଲେଖ ପ୍ରବକ୍ତା',
      hi: 'कलिंग के विजयी राजघोषक व शिलालेख प्रवक्ता',
    },
    geminiVoiceName: 'Fenrir',
    voiceStylePrompt: {
      en: 'Commanding, triumphant royal herald proclaiming ancient Hathigumpha edicts with bold imperial energy',
      or: 'ତେଜସ୍ୱୀ, ବୀରତ୍ୱପୂର୍ଣ୍ଣ କଳିଙ୍ଗ ରାଜଦୂତଙ୍କ ଉଦ୍‌ଘୋଷଣା ସ୍ୱର, ସ୍ପଷ୍ଟ ଓଡ଼ିଆ ଉଚ୍ଚାରଣ',
      hi: 'तेजस्वी, वीरतापूर्ण कलिंग राजघोषक की प्रभावशाली आवाज़, स्पष्ट हिन्दी उच्चारण',
    },
    acousticPreset: 'limestone-cavern',
    timbreDescription: 'Commanding, triumphant martial herald reciting Hathigumpha Prakrit edicts with brass resonance (Fenrir • G2/D3).',
    basePitch: 0.86,
    rateMultiplier: 1.04,
    droneRootFreqs: [98.0, 146.83, 196.0, 293.66],
    preferredVoiceGender: 'male',
    culturalGreeting: {
      or: 'ଜୟତୁ କଳିଙ୍ଗ! ମୁଁ ମହାମେଘବାହନ ସମ୍ରାଟ ଖାରବେଳଙ୍କ ରାଜଦୂତ, କଳିଙ୍ଗର ଗୌରବ ଗାଥାର ଉଦ୍‌ଘୋଷକ।',
      hi: 'जयतु कलिंग! मैं महामेघवाहन सम्राट खारवेल का राजघोषक, कलिंग के शौर्य का उद्घोषक।',
      en: 'Jayatu Kalinga! I am the Imperial Herald of Emperor Kharavela of the Mahameghavahanas.',
    },
    curatedQuestions: [
      {
        or: 'ହାତୀଗୁମ୍ଫା ଶିଳାଲେଖର ୧୭ ଧାଡ଼ିରେ ସମ୍ରାଟ ଖାରବେଳଙ୍କ କେଉଁ ବିଜୟ ବର୍ଣ୍ଣନା ଅଛି?',
        hi: 'हाथीगुम्फा शिलालेख की 17 पंक्तियों में सम्राट खारवेल के किन अभियानों का वर्णन है?',
        en: 'What do the 17 lines of the Hathigumpha Brahmi inscription reveal about Kharavela’s reign?',
      },
      {
        or: 'ରାଣୀ ଗୁମ୍ଫା ଦ୍ୱିତଳ ନାଟ୍ୟଶାଳାର ସ୍ଥାପତ୍ୟ ଏବଂ ଧ୍ୱନି ବିଜ୍ଞାନ କିପରି କାର୍ଯ୍ୟ କରୁଥିଲା?',
        hi: 'रानी गुम्फा की दो-मंजिला रंगशाला का ध्वनिशास्त्र (Acoustics) कैसे काम करता था?',
        en: 'How was the double-storied Rani Gumpha engineered as an acoustic royal amphitheatre?',
      },
      {
        or: 'ଖଣ୍ଡଗିରିର ବାରଭୁଜୀ ଓ ନବମୁନି ଗୁମ୍ଫାରେ ଜୈନ ତୀର୍ଥଙ୍କର ମୂର୍ତ୍ତିଗୁଡ଼ିକର ବିଶେଷତା କ’ଣ?',
        hi: 'खंडगिरि की गुफाओं में 24 जैन तीर्थंकरों की मूर्तियों की क्या विशेषता है?',
        en: 'What is the significance of the 24 Jain Tirthankara relief carvings in Khandagiri?',
      },
    ],
  },

  'story-lingaraj': {
    id: 'story-lingaraj',
    placeName: {
      en: 'Lingaraj Temple, Bhubaneswar',
      or: 'ଶ୍ରୀ ଲିଙ୍ଗରାଜ ମହାପ୍ରଭୁ ମନ୍ଦିର, ଭୁବନେଶ୍ୱର',
      hi: 'श्री लिंगराज मंदिर, भुवनेश्वर',
    },
    narratorName: {
      en: 'Somavamshi Shaiva Rajaguru',
      or: 'ସୋମବଂଶୀ ଶୈବ ରାଜଗୁରୁ',
      hi: 'सोमवंशी शैव राजगुरु',
    },
    voicePersonaTitle: {
      en: 'Vedic Shaivite High Priest & Ekamra Kshetra Sage',
      or: 'ଏକାମ୍ର କ୍ଷେତ୍ରର ବେଦଜ୍ଞ ପ୍ରଧାନ ପୂଜକ',
      hi: 'एकाम्र क्षेत्र के वेदज्ञ मुख्य पुजारी',
    },
    geminiVoiceName: 'Charon',
    voiceStylePrompt: {
      en: 'Sacred Vedic Rajaguru chanting with resonant temple bell dignity and scholarly poise',
      or: 'ପବିତ୍ର ବେଦଜ୍ଞ ଏକାମ୍ର କ୍ଷେତ୍ର ରାଜଗୁରୁଙ୍କ ଗମ୍ଭୀର ଓ ଭକ୍ତିମୟ ଓଡ଼ିଆ ସ୍ୱର',
      hi: 'पवित्र वेदज्ञ एकाम्र क्षेत्र राजगुरु की गंभीर और आध्यात्मिक हिन्दी आवाज़',
    },
    acousticPreset: 'stone-sanctum',
    timbreDescription: 'Deep, reverberating incantation cadence with bell and conch echoes of Hari-Hara (Charon • C2/G2).',
    basePitch: 1.02,
    rateMultiplier: 0.93,
    droneRootFreqs: [65.41, 98.0, 130.81, 196.0],
    preferredVoiceGender: 'male',
    culturalGreeting: {
      or: 'ଓଁ ନମଃ ଶିବାୟ! ମୁଁ ଏକାମ୍ର କ୍ଷେତ୍ରର ସୋମବଂଶୀ ରାଜଗୁରୁ, ହରି-ହର ଉପାସନାର ସେବକ।',
      hi: 'ॐ नमः शिवाय! मैं एकाम्र क्षेत्र का सोमवंशी राजगुरु, हरि-हर उपासना का सेवक।',
      en: 'Om Namah Shivaya! I am the Somavamshi Shaiva Rajaguru of Ekamra Kshetra Bhubaneswar.',
    },
    curatedQuestions: [
      {
        or: 'ଲିଙ୍ଗରାଜ ମନ୍ଦିରରେ ହରି (ବିଷ୍ଣୁ) ଓ ହର (ଶିବ)ଙ୍କ ସମନ୍ୱିତ ପୂଜାର ରହସ୍ୟ କ’ଣ?',
        hi: 'लिंगराज मंदिर में हरि (विष्णु) और हर (शिव) की समन्वित पूजा का क्या रहस्य है?',
        en: 'Why is the deity of Lingaraj worshipped as both Hari (Vishnu) and Hara (Shiva)?',
      },
      {
        or: 'ସୋମବଂଶୀ ରାଜା ଯଯାତି କେଶରୀ ଓ ଲଲାଟେନ୍ଦୁ କେଶରୀଙ୍କ ନିର୍ମାଣ ଇତିହାସ କ’ଣ?',
        hi: 'राजा ययाति केशरी और ललाटेंदु केशरी द्वारा लिंगराज निर्माण का इतिहास क्या है?',
        en: 'What is the documented 11th century building history by Jajati and Lalatendu Keshari?',
      },
      {
        or: 'ବିନ୍ଦୁସାଗର ହ୍ରଦରେ ଭାରତର ସମସ୍ତ ପବିତ୍ର ତୀର୍ଥ ଜଳ କିପରି ସଂରକ୍ଷିତ ହୋଇଛି?',
        hi: 'बिंदुसागर सरोवर में भारत के सभी पवित्र तीर्थों का जल कैसे समाहित है?',
        en: 'How was the sacred Bindusagar Lake sanctified with waters from every holy tirtha of India?',
      },
    ],
  },

  'story-cuttack-barabati': {
    id: 'story-cuttack-barabati',
    placeName: {
      en: 'Barabati Fort & Cuttack Millennial City',
      or: 'ବାରବାଟୀ ଦୁର୍ଗ ଓ କଟକ ହଜାର ବର୍ଷର ଐତିହ୍ୟ',
      hi: 'बारबाटी किला एवं कटक सहस्राब्दी नगर',
    },
    narratorName: {
      en: 'Buxi Jagabandhu & Gajapati Paika General',
      or: 'ବକ୍ସି ଜଗବନ୍ଧୁ ଓ ପାଇକ ସେନାପତି',
      hi: 'बक्सी जगबंधु व पाइक सेनापति',
    },
    voicePersonaTitle: {
      en: 'Paika Martial Commander & Fortress Defender',
      or: 'ବୀର ପାଇକ ସେନାଧ୍ୟକ୍ଷ ଓ ଗଜପତି ଦୁର୍ଗରକ୍ଷକ',
      hi: 'वीर पाइक सेनाध्यक्ष व गजपति दुर्ग रक्षक',
    },
    geminiVoiceName: 'Fenrir',
    voiceStylePrompt: {
      en: 'Heroic, courageous Paika fortress general speaking with crisp martial authority and pride',
      or: 'ବୀର ପାଇକ ସେନାପତିଙ୍କ ଓଜସ୍ୱୀ ଓ ଦୃଢ଼ ଓଡ଼ିଆ କণ্ଠସ୍ୱର',
      hi: 'वीर पाइक सेनापति की ओजस्वी और शौर्यपूर्ण हिन्दी आवाज़',
    },
    acousticPreset: 'fortress-rampart',
    timbreDescription: 'Fierce, heroic, urgent martial resonance echoing the 9-storey fortress defense (Fenrir • D#2/A#2).',
    basePitch: 0.84,
    rateMultiplier: 1.06,
    droneRootFreqs: [77.78, 116.54, 155.56, 233.08],
    preferredVoiceGender: 'male',
    culturalGreeting: {
      or: 'ବନ୍ଦେ ଉତ୍କଳ ଜନନୀ! ମୁଁ ବାରବାଟୀର ପାଇକ ସେନାପତି, ମହାନଦୀ କୂଳର ବୀର ପ୍ରହରୀ।',
      hi: 'वंदे उत्कल जननी! मैं बारबाटी का पाइक सेनापति, महानदी तट का वीर प्रहरी।',
      en: 'Vande Utkala Janani! I am the Paika Commander of Barabati Fort on the Mahanadi.',
    },
    curatedQuestions: [
      {
        or: 'ଅନଙ୍ଗଭୀମ ଦେବ ତୃତୀୟ କିପରି ୧୨୨୯ ମସିହାରେ ବାରବାଟୀ ଦୁର୍ଗ ନିର୍ମାଣ କରିଥିଲେ?',
        hi: 'अनंगभीम देव तृतीय ने 1229 ईस्वी में बारबाटी किले की नींव कैसे रखी?',
        en: 'How did King Anangabhima Deva III construct Barabati Fort in 1229 CE?',
      },
      {
        or: 'ନବତଳ ପ୍ରାସାଦ ଓ ଗଡ଼ଖାଇର ପ୍ରତିରକ୍ଷା ରଣନୀତି କିପରି ବିଦେଶୀ ସେନାକୁ ଅଟକାଉଥିଲା?',
        hi: 'बारबाटी के 9-मंजिला महल और गहरी खाई की सैन्य सुरक्षा प्रणाली कैसी थी?',
        en: 'How did the nine-storey citadel and all-surrounding moat repel invaders?',
      },
      {
        or: 'କଟକର ତାରକସି ରୂପା କାମ ଏବଂ ବାଲିଯାତ୍ରାର ସାଂସ୍କୃତିକ ପରମ୍ପରା କ’ଣ?',
        hi: 'कटक की चांदी की तारकशी (फिलिग्री) और बाली यात्रा का इतिहास क्या है?',
        en: 'What is the millennium-old tradition of Cuttack Tarakasi silver filigree and Bali Yatra?',
      },
    ],
  },

  'story-diamond-triangle': {
    id: 'story-diamond-triangle',
    placeName: {
      en: 'Diamond Triangle (Lalitgiri, Ratnagiri, Udayagiri)',
      or: 'ବୌଦ୍ଧ ହୀରକ ତ୍ରିଭୁଜ (ଲଳିତଗିରି, ରତ୍ନଗିରି, ଉଦୟଗିରି)',
      hi: 'डायमंड ट्राएंगल (ललितगिरि, रत्नगिरि, उदयगिरि)',
    },
    narratorName: {
      en: 'Mahayana Abbot of Ratnagiri Mahavihara',
      or: 'ରତ୍ନଗିରି ମହାବିହାରର ମହାଯାନ ଆଚାର୍ଯ୍ୟ',
      hi: 'रत्नगिरि महाविहार के महायान आचार्य',
    },
    voicePersonaTitle: {
      en: 'Vajrayana Buddhist Abbot & Nalanda Contemporary Scholar',
      or: 'ବଜ୍ରଯାନ ବୌଦ୍ଧ ଆଚାର୍ଯ୍ୟ ଓ ପ୍ରାଚୀନ ବିଶ୍ୱବିଦ୍ୟାଳୟ ମୁଖ୍ୟ',
      hi: 'वज्रयान बौद्ध आचार्य व प्राचीन विश्वविद्यालय प्रमुख',
    },
    geminiVoiceName: 'Zephyr',
    voiceStylePrompt: {
      en: 'Erudite, gentle ancient Buddhist university scholar speaking with contemplative intellectual grace',
      or: 'ଜ୍ଞାନୀ ଓ ଶାନ୍ତ ରତ୍ନଗିରି ମହାବିହାର ଆଚାର୍ଯ୍ୟଙ୍କ ବିଦ୍ୱାନ ଓଡ଼ିଆ ସ୍ୱର',
      hi: 'विद्वान और शांत रत्नगिरि महाविहार आचार्य की सौम्य हिन्दी आवाज़',
    },
    acousticPreset: 'monastic-courtyard',
    timbreDescription: 'Gentle, erudite philosophical cadence analyzing Tantric Vajrayana manuscripts (Zephyr • A2/E3).',
    basePitch: 0.98,
    rateMultiplier: 0.92,
    droneRootFreqs: [110.0, 164.81, 220.0, 329.63],
    preferredVoiceGender: 'male',
    culturalGreeting: {
      or: 'ଓଁ ମଣିପଦ୍ମେ ହୁଁ! ମୁଁ ରତ୍ନଗିରି ମହାବିହାରର ବୌଦ୍ଧ ଆଚାର୍ଯ୍ୟ, ପୁଷ୍ପଗିରି ଜ୍ଞାନପୀଠର ଗବେଷକ।',
      hi: 'ॐ मणिपद्मे हूँ! मैं रत्नगिरि महाविहार का बौद्ध आचार्य, पुष्पगिरि ज्ञानपीठ का शोधकर्ता।',
      en: 'Om Mani Padme Hum! I am the Abbot of Ratnagiri Mahavihara in the sacred Diamond Triangle.',
    },
    curatedQuestions: [
      {
        or: 'ଲଳିତଗିରି ସ୍ତୂପ ଖନନରୁ ମିଳିଥିବା ସ୍ୱର୍ଣ୍ଣ ପେଟିକା ଭିତରେ ବୁଦ୍ଧଙ୍କ ଅସ୍ଥିଧାତୁ କିପରି ସୁରକ୍ଷିତ ଥିଲା?',
        hi: 'ललितगिरि स्तूप की खुदाई में मिली स्वर्ण मंजूषा में तथागत बुद्ध की अस्थियां कैसे मिलीं?',
        en: 'How were the authentic bone relics of Lord Buddha discovered inside the gold casket at Lalitgiri?',
      },
      {
        or: 'ରତ୍ନଗିରିର ସୁନ୍ଦର କ୍ଲୋରାଇଟ୍ ପ୍ରବେଶ ଦ୍ୱାର ଓ ତନ୍ତ୍ର ବଜ୍ରଯାନର ପ୍ରମୁଖ କେନ୍ଦ୍ର ବିଷୟରେ କୁହନ୍ତୁ?',
        hi: 'रत्नगिरि का अद्भुत नक्काशीदार द्वार और तिब्बती बौद्ध धर्म (कालचक्र तंत्र) का संबंध क्या है?',
        en: 'Why was Ratnagiri the supreme cradle of Kalachakra Tantra and Tibetan Buddhist learning?',
      },
      {
        or: 'ଚୀନ ପରିବ୍ରାଜକ ହୁଏନସାଂ ପୁଷ୍ପଗିରି ବିଶ୍ୱବିଦ୍ୟାଳୟ ବିଷୟରେ କ’ଣ ଲେଖିଛନ୍ତି?',
        hi: 'चीनी यात्री ह्वेनसांग ने ओडिशा के पुष्पगिरि महाविहार के बारे में क्या लिखा था?',
        en: 'What did 7th-century Chinese pilgrim Xuanzang record about the glory of Pushpagiri?',
      },
    ],
  },

  'story-chilika': {
    id: 'story-chilika',
    placeName: {
      en: 'Chilika Lake & Ancient Maritime Ports',
      or: 'ଚିଲିକା ହ୍ରଦ, ପାଲୁର ବନ୍ଦର ଓ ସାଧବପୁଅଙ୍କ ନୌବାଣିଜ୍ୟ',
      hi: 'चिलिका झील, पालुर बंदरगाह व कलिंग का समुद्री व्यापार',
    },
    narratorName: {
      en: 'Sadhabapua Sea Captain of Palur Port',
      or: 'ପାଲୁର ବନ୍ଦରର ପ୍ରଧାନ ସାଧବ ନାବିକ',
      hi: 'पालुर बंदरगाह के प्रधान साधव नाविक',
    },
    voicePersonaTitle: {
      en: 'Ancient Maritime Merchant & Indian Ocean Navigator',
      or: 'ପ୍ରାଚୀନ କଳିଙ୍ଗର ବୋଇତ ନାବିକ ଓ ଦରିଆପାରି ବଣିକ',
      hi: 'प्राचीन कलिंग के बोइत नाविक व समुद्री व्यापारी',
    },
    geminiVoiceName: 'Puck',
    voiceStylePrompt: {
      en: 'Adventurous, weathered seafaring Kalinga navigator recounting ocean voyages with rhythmic maritime warmth',
      or: 'ଉତ୍ସାହୀ ଓ ଅଭିଜ୍ଞ ଓଡ଼ିଆ ସାଧବପୁଅ ନାବିକଙ୍କ ସୁମଧୁର ସ୍ୱର',
      hi: 'साहसी और अनुभवी कलिंग समुद्री नाविक की जीवंत हिन्दी आवाज़',
    },
    acousticPreset: 'ocean-breeze',
    timbreDescription: 'Weathered oceanic baritone, rhythmic like tidal waves of Boita Bandana (Puck • C#2/G#2).',
    basePitch: 0.92,
    rateMultiplier: 1.00,
    droneRootFreqs: [69.3, 103.83, 138.59, 207.65],
    preferredVoiceGender: 'male',
    culturalGreeting: {
      or: 'ଆ କା ମା ବୈ, ପାନ ଗୁଆ ଥୋଇ! ମୁଁ ଚିଲିକାର ସାଧବପୁଅ, ଜାଭା, ବାଲି, ସୁମାତ୍ରା ଯାତ୍ରାର ନାବିକ।',
      hi: 'आ का मा बै! मैं चिलिका का प्राचीन साधव नाविक, जावा, बाली, सुमात्रा व्यापार का अनुभवी कैप्टन।',
      en: 'Aa Kaa Maa Bai! I am the Sadhabapua sea captain who sailed Boitas to Java, Bali, and Sumatra.',
    },
    curatedQuestions: [
      {
        or: 'କାର୍ତ୍ତିକ ପୂର୍ଣ୍ଣିମାର ବୋଇତ ବନ୍ଦାଣ ଉତ୍ସବ ଏବଂ ପ୍ରାଚୀନ ଓଡ଼ିଶାର ସମୁଦ୍ର ବାଣିଜ୍ୟ ଇତିହାସ କ’ଣ?',
        hi: 'कार्तिक पूर्णिमा का "बोइत बंदाण" और प्राचीन ओडिशा के समुद्री व्यापार का क्या महत्व है?',
        en: 'What is the history behind Boita Bandana and Kalinga’s maritime voyages across Southeast Asia?',
      },
      {
        or: 'ଗ୍ରୀକ୍ ଭୂଗୋଳବିତ୍ ଟଲେମି ଚିଲିକାର ପାଲୁର ବନ୍ଦର ବିଷୟରେ କ’ଣ କହିଥିଲେ?',
        hi: 'ग्रीक भूगोलवेत्ता टॉलेमी ने चिलिका के पालुर बंदरगाह का क्या वर्णन किया था?',
        en: 'What did Greco-Roman geographer Ptolemy in 150 CE record about the international port of Palur?',
      },
      {
        or: 'ମା’ କାଳିଜାଈଙ୍କ କରୁଣ କିମ୍ବଦନ୍ତୀ ଓ ଇରାୱାଡ଼ି ଡଲଫିନଙ୍କ ବିଷୟରେ କୁହନ୍ତୁ?',
        hi: 'माँ कालिकाई की पावन कथा और इरावदी डॉल्फ़िन संरक्षण के बारे में बताएं?',
        en: 'What is the legend of Maa Kalijai and how does Chilika protect Irrawaddy dolphins?',
      },
    ],
  },

  'story-similipal': {
    id: 'story-similipal',
    placeName: {
      en: 'Similipal Biosphere & Khiching Maa Kichakeswari',
      or: 'ଶିମିଳିପାଳ ଜୈବମଣ୍ଡଳ ଓ ଖିଚିଂ କୀଚକେଶ୍ୱରୀ ମନ୍ଦିର',
      hi: 'शिमिलिपाल बायोस्फीयर रिजर्व व खिचिंग कीचकेश्वरी मंदिर',
    },
    narratorName: {
      en: 'Santhal Forest Elder & Bhanja Royal Chronicler',
      or: 'ସାନ୍ତାଳ ଅରଣ୍ୟ ପ୍ରହରୀ ଓ ଭଞ୍ଜ ରାଜବଂଶ ଗବେଷକ',
      hi: 'संथाल वन संरक्षक व भंज राजवंश इतिहासकार',
    },
    voicePersonaTitle: {
      en: 'Ancient Forest Elder & UNESCO Biosphere Guardian',
      or: 'ପ୍ରାଚୀନ ଶାଳ ବନର ରକ୍ଷକ ଓ ଆଦିବାସୀ ମୁଖିଆ',
      hi: 'प्राचीन शाल वन संरक्षक व आदिवासी मुखिया',
    },
    geminiVoiceName: 'Charon',
    voiceStylePrompt: {
      en: 'Earthy, grounded indigenous forest elder with deep tranquil reverence for nature and ancient chlorite shrines',
      or: 'ଶାନ୍ତ, ଗଭୀର ଓ ମାଟିର ବାସ୍ନା ଭରା ସାନ୍ତାଳ ଅରଣ୍ୟ ପ୍ରହରୀଙ୍କ ଓଡ଼ିଆ ସ୍ୱର',
      hi: 'शांत, गहरी और प्रकृति से जुड़ी संथाल वन संरक्षक की सौम्य हिन्दी आवाज़',
    },
    acousticPreset: 'forest-canopy',
    timbreDescription: 'Earthy, deep, resonant voice whispering like the Sal canopy and barefoot trackers (Charon • B1/F#2).',
    basePitch: 0.90,
    rateMultiplier: 0.90,
    droneRootFreqs: [61.74, 92.5, 123.47, 185.0],
    preferredVoiceGender: 'male',
    culturalGreeting: {
      or: 'ଜୋହାର! ମୁଁ ଶିମିଳିପାଳର ସାନ୍ତାଳ ଅରଣ୍ୟ ପ୍ରହରୀ, ମେଘାସନୀ ଶୃଙ୍ଗ ଓ ଖିଚିଂ ମନ୍ଦିରର ସାକ୍ଷୀ।',
      hi: 'जोहार! मैं शिमिलिपाल का वन संरक्षक, मेघासनी पर्वत और खिचिंग मंदिर की पावन भूमि का पहरेदार।',
      en: 'Johar! I am the Santhal Elder and guardian of Similipal and ancient Khiching.',
    },
    curatedQuestions: [
      {
        or: 'ଖିଚିଂର କଳା ମୁଗୁନି ପଥରର ମା’ କୀଚକେଶ୍ୱରୀ ମନ୍ଦିର କିପରି ବିନା ସିମେଣ୍ଟରେ ପୁନଃନିର୍ମିତ ହେଲା?',
        hi: 'खिचिंग का काले क्लोराइट पत्थर वाला माँ कीचकेश्वरी मंदिर बिना सीमेंट कैसे पुनर्निर्मित हुआ?',
        en: 'How was the black chlorite Maa Kichakeswari Temple reconstructed stone-by-stone without mortar?',
      },
      {
        or: 'ମେଲାନିଷ୍ଟିକ (କଳା) ବାଘ ବିଶ୍ୱରେ କେବଳ ଶିମିଳିପାଳରେ କାହିଁକି ଦେଖାଯାଆନ୍ତି?',
        hi: 'काले (मेलानिस्टिक) रॉयल बंगाल टाइगर दुनिया में केवल शिमिलिपाल में ही क्यों पाए जाते हैं?',
        en: 'Why is Similipal the exclusive natural habitat of pseudo-melanistic black tigers in the world?',
      },
      {
        or: 'ବରେହିପାଣି (୩୯୯ ମି.) ଜଳପ୍ରପାତ ଓ କୁଳିଅଣା ପ୍ରସ୍ତର ଯୁଗ ସଭ୍ୟତା ବିଷୟରେ କୁହନ୍ତୁ?',
        hi: 'बारेहीपानी (399 मीटर) जलप्रपात और कुलियाणा के पाषाणकालीन औजारों का इतिहास क्या है?',
        en: 'What is the significance of the 399m Barehipani waterfall and Kuliana Paleolithic excavations?',
      },
    ],
  },

  'story-hirakud-sambalpur': {
    id: 'story-hirakud-sambalpur',
    placeName: {
      en: 'Hirakud Dam & Maa Samaleswari Temple, Sambalpur',
      or: 'ହୀରାକୁଦ ମହାବନ୍ଧ ଓ ମା’ ସମଲେଶ୍ୱରୀ ପୀଠ, ସମ୍ବଲପୁର',
      hi: 'हीराकुड बांध एवं माँ समलेश्वरी मंदिर, संबलपुर',
    },
    narratorName: {
      en: 'Chief Hydrological Engineer & Sambalpuri Balladeer',
      or: 'ମୁଖ୍ୟ ଜଳସମ୍ପଦ ଯନ୍ତ୍ରୀ ଓ ସମ୍ବଲପୁରୀ ଲୋକକବି',
      hi: 'मुख्य जल अभियंता व संबलपुरी लोक कवि',
    },
    voicePersonaTitle: {
      en: 'Visionary Builder & Kosala Cultural Balladeer',
      or: 'ହୀରାକୁଦର ମୁଖ୍ୟ ଯନ୍ତ୍ରୀ ଓ ସମ୍ବଲପୁରୀ ସଂସ୍କୃତି ରକ୍ଷକ',
      hi: 'हीराकुड के मुख्य अभियंता व संबलपुरी संस्कृति संरक्षक',
    },
    geminiVoiceName: 'Puck',
    voiceStylePrompt: {
      en: 'Inspiring, articulate engineer and folk poet blending nation-building pride with warm Kosala rhythm',
      or: 'ଉତ୍ସାହୀ ଓ ଗୌରବମୟ ସମ୍ବଲପୁରୀ-ଓଡ଼ିଆ କଥାକାରଙ୍କ ସ୍ପଷ୍ଟ କণ্ଠସ୍ୱର',
      hi: 'प्रेरणादायक और गौरवपूर्ण संबलपुरी इतिहासकार व अभियंता की स्पष्ट हिन्दी आवाज़',
    },
    acousticPreset: 'ocean-breeze',
    timbreDescription: 'Inspiring, clear voice blending modern engineering marvel with Sambalpuri folk pride (Puck • E2/A2).',
    basePitch: 1.04,
    rateMultiplier: 1.02,
    droneRootFreqs: [82.41, 110.0, 164.81, 220.0],
    preferredVoiceGender: 'male',
    culturalGreeting: {
      or: 'ଜୁହାର! ମୁଁ ମହାନଦୀ ବକ୍ଷରେ ବିଶ୍ୱର ଦୀର୍ଘତମ ମାଟିବନ୍ଧ ହୀରାକୁଦ ଓ ମା’ ସମଲେଶ୍ୱରୀଙ୍କ କାହାଣୀକାର।',
      hi: 'जुहार! मैं महानदी पर बने विश्व के सबसे लंबे मिट्टी के बांध हीराकुड व माँ समलेश्वरी का कथाकार।',
      en: 'Juhar! I bring you the saga of Hirakud Dam and sacred Maa Samaleswari of Sambalpur.',
    },
    curatedQuestions: [
      {
        or: '୧୯୪୮-୧୯୫୭ ମସିହାରେ ୨୫.୮ କିଲୋମିଟର ଦୀର୍ଘ ହୀରାକୁଦ ବନ୍ଧ କିପରି ନିର୍ମିତ ହୋଇଥିଲା?',
        hi: '1948 से 1957 के बीच 25.8 किमी लंबे हीराकुड बांध का निर्माण कैसे संभव हुआ?',
        en: 'How was the 25.8 km Hirakud Dam engineered as the longest earthen dam in the world?',
      },
      {
        or: 'ମା’ ସମଲେଶ୍ୱରୀ ମନ୍ଦିର ପ୍ରତିଷ୍ଠା ଓ ରାଜା ବଳରାମ ଦେବଙ୍କ ଇତିହାସ କ’ଣ?',
        hi: 'माँ समलेश्वरी मंदिर की स्थापना और राजा बलराम देव का इतिहास क्या है?',
        en: 'What is the 16th-century Chauhan history of King Balarama Deva and Maa Samaleswari Temple?',
      },
      {
        or: 'ଜଳମଗ୍ନ ପଦ୍ମପୁର ମନ୍ଦିର ସମୂହ ଓ ନୂଆଁଖାଇ ପର୍ବର ମହତ୍ତ୍ୱ କ’ଣ?',
        hi: 'हीराकुड जलाशय में डूबे 200 प्राचीन मंदिरों और नुआंखाई पर्व का क्या महत्व है?',
        en: 'What are the submerged temples of Hirakud reservoir and the tradition of Nuakhai Juhar?',
      },
    ],
  },

  'story-daringbadi': {
    id: 'story-daringbadi',
    placeName: {
      en: 'Daringbadi: Kashmir of Odisha & Eastern Ghats',
      or: 'ଦାରିଙ୍ଗବାଡ଼ି: ଓଡ଼ିଶାର କାଶ୍ମୀର ଓ ପୂର୍ବଘାଟ ଉପତ୍ୟକା',
      hi: 'दारिंगबाड़ी: ओडिशा का कश्मीर एवं पूर्वी घाट',
    },
    narratorName: {
      en: 'Kutia Kondh Highland Poetess & Valley Chronicler',
      or: 'କୁଟିଆ କନ୍ଧ ପର୍ବତ କବୟିତ୍ରୀ ଓ ଉପତ୍ୟକା କଥାକାର',
      hi: 'कुटिया कोंध पर्वत कवयित्री एवं घाटी कथाकार',
    },
    voicePersonaTitle: {
      en: 'Highland Pine & Coffee Valley Storyteller',
      or: 'ଶୀତଳ ପାଇନ ବନ ଓ କଫି ବଗିଚାର କଥାକାର',
      hi: 'शीतल पाइन वन व कॉफी बगानों की कथाकार',
    },
    geminiVoiceName: 'Kore',
    voiceStylePrompt: {
      en: 'Crisp, poetic, gentle female mountain storyteller voice carrying highland pine breeze serenity',
      or: 'ସୁମଧୁର, କାବ୍ୟିକ ଓ ଶୀତଳ ପର୍ବତ ଉପତ୍ୟକାର ନାରୀ କଣ୍ଠସ୍ୱର, ସ୍ପଷ୍ଟ ଓଡ଼ିଆ ଉଚ୍ଚାରଣ',
      hi: 'मधुर, काव्यात्मक और शांत पर्वतीय महिला कथाकार की आवाज़, स्पष्ट हिन्दी उच्चारण',
    },
    acousticPreset: 'highland-mist',
    timbreDescription: 'Crisp, airy, poetic female cadence carrying pine breeze and hill mist (Kore • F2/C3).',
    basePitch: 1.06,
    rateMultiplier: 0.96,
    droneRootFreqs: [87.31, 130.81, 174.61, 261.63],
    preferredVoiceGender: 'female',
    culturalGreeting: {
      or: 'ନମସ୍କାର! ୩୦୦୦ ଫୁଟ ଉଚ୍ଚତା ବିଶିଷ୍ଟ ଦାରିଙ୍ଗବାଡ଼ିର କୁହୁଡ଼ି ଘେରା ପାଇନ ବଣରୁ ସ୍ୱାଗତ।',
      hi: 'नमस्कार! 3000 फीट की ऊंचाई पर स्थित दारिंगबाड़ी के पाइन वनों से आपका स्वागत है।',
      en: 'Greetings from the misty pine highlands of Daringbadi, 3000 feet above the Eastern Ghats.',
    },
    curatedQuestions: [
      {
        or: 'ଦାରିଙ୍ଗବାଡ଼ିକୁ କାହିଁକି ‘ଓଡ଼ିଶାର କାଶ୍ମୀର’ କୁହାଯାଏ ଏବଂ ଶୀତଦିନେ କାକର ବରଫ କିପରି ଜମେ?',
        hi: 'दारिंगबाड़ी को ‘ओडिशा का कश्मीर’ क्यों कहा जाता है और यहाँ पाला कैसे जमता है?',
        en: 'Why is Daringbadi nicknamed the Kashmir of Odisha, and how does winter frost form here?',
      },
      {
        or: 'କୁଟିଆ କନ୍ଧ ଜନଜାତିଙ୍କ ଧରଣୀ ପେନୁ ଉପାସନା ଓ ପ୍ରାଚୀନ ସଂସ୍କୃତି କ’ଣ?',
        hi: 'कुटिया कोंध जनजाति की धरणी पेनु उपासना और प्राचीन संस्कृति क्या है?',
        en: 'What is the sacred Dharani Penu earth-goddess heritage of the indigenous Kutia Kondhs?',
      },
      {
        or: 'କନ୍ଧମାଳ ହଳଦୀ (GI Tag) ଏବଂ ଛାଇ-ଉତ୍ପାଦିତ କଫି ବଗିଚାର ବିଶେଷତା କ’ଣ?',
        hi: 'कंधमाल हल्दी (GI टैग) और छायादार कॉफी बागानों की क्या विशेषताएं हैं?',
        en: 'What gives Kandhamal organic turmeric its GI tag and high curcumin richness?',
      },
    ],
  },

  'story-gupteswar-koraput': {
    id: 'story-gupteswar-koraput',
    placeName: {
      en: 'Gupteswar Cave Temple & Deomali Peaks, Koraput',
      or: 'ଗୁପ୍ତେଶ୍ୱର ଗୁମ୍ଫା ମନ୍ଦିର ଓ ଦେଓମାଳୀ ଶୃଙ୍ଗ, କୋରାପୁଟ',
      hi: 'गुप्तेश्वर गुफा मंदिर एवं देवमाली शिखर, कोरापुट',
    },
    narratorName: {
      en: 'Dhurwa Cave Hermit & Jeypore Royal Chronicler',
      or: 'ଧୁରୁଆ ଗୁମ୍ଫା ସାଧକ ଓ ଜୟପୁର ରାଜବଂଶ ଐତିହାସିକ',
      hi: 'धुरुवा गुफा साधक एवं जयपुर राजवंश इतिहासकार',
    },
    voicePersonaTitle: {
      en: 'Mystic Cavern Hermit & Dandakaranya Guardian',
      or: 'ଚୁନପଥର ଗୁମ୍ଫାର ରହସ୍ୟମୟ ଶୈବ ସାଧକ',
      hi: 'चूना पत्थर गुफा के रहस्यमय शैव साधक',
    },
    geminiVoiceName: 'Fenrir',
    voiceStylePrompt: {
      en: 'Deep, mystical subterranean cave ascetic speaking slowly with ancient echoic reverence',
      or: 'ରହସ୍ୟମୟ, ଗଭୀର ଓ ଗୁମ୍ଫା-ପ୍ରତିଧ୍ୱନି ଭରା ଶୈବ ସାଧକଙ୍କ ସ୍ପଷ୍ଟ ଓଡ଼ିଆ ସ୍ୱର',
      hi: 'रहस्यमय, गहरी और शांत गुफा साधक की आध्यात्मिक हिन्दी आवाज़',
    },
    acousticPreset: 'limestone-cavern',
    timbreDescription: 'Deep, hollow, cavernous echo resonance evoking subterranean stalagmites (Fenrir • Eb2/Bb2).',
    basePitch: 0.82,
    rateMultiplier: 0.88,
    droneRootFreqs: [77.78, 116.54, 155.56, 233.08],
    preferredVoiceGender: 'male',
    culturalGreeting: {
      or: 'ଓଁ ନମୋ ଗୁପ୍ତେଶ୍ୱରାୟ! ମୁଁ କୋରାପୁଟର ରାମଗିରି ଚୁନପଥର ଗୁମ୍ଫାର ପ୍ରାଚୀନ ପ୍ରହରୀ।',
      hi: 'ॐ नमो गुप्तेश्वराय! मैं कोरापुट के रामगिरि चूना-पत्थर गुफा का प्राचीन साधक।',
      en: 'Om Namo Gupteshwaraya! I speak from the sacred limestone cavern of Lord Gupteswar.',
    },
    curatedQuestions: [
      {
        or: 'ଗୁପ୍ତେଶ୍ୱରର ପ୍ରାକୃତିକ ଶିବଲିଙ୍ଗ ଚୁନପଥର ଗୁମ୍ଫାରେ କିପରି ଆବିଷ୍କୃତ ହେଲା?',
        hi: 'गुप्तेश्वर का विशाल प्राकृतिक शिवलिंग चूना-पत्थर गुफा में कैसे खोजा गया?',
        en: 'How did King Vikramaditya I of Jeypore discover the subterranean stalagmite Shiva Lingam?',
      },
      {
        or: 'ଭଗବାନ ଶ୍ରୀରାମ ଦଣ୍ଡକାରଣ୍ୟ ବନବାସ ସମୟରେ ଏଠାରେ ପୂଜା କରିଥିବା ଲୋକକଥା କ’ଣ?',
        hi: 'भगवान श्रीराम द्वारा दंडकारण्य वनवास के दौरान गुप्तेश्वर में पूजा करने की कथा क्या है?',
        en: 'What is the Treta Yuga Ramayana legend of Lord Rama worshipping Gupteswar in secret?',
      },
      {
        or: 'ଦେଓମାଳୀ ଶୃଙ୍ଗ (୧୬୭୨ ମି.) ଏବଂ ଜାତିସଂଘ ସ୍ୱୀକୃତ କୋରାପୁଟ ଧାନ ସଂରକ୍ଷଣ ବିଷୟରେ କୁହନ୍ତୁ?',
        hi: 'देवमाली शिखर (1672 मी) और संयुक्त राष्ट्र द्वारा मान्यता प्राप्त कोरापुट धान विरासत क्या है?',
        en: 'Why did UN FAO recognize Koraput beside Deomali Peak as a Global Agricultural Heritage System?',
      },
    ],
  },

  'story-raghurajpur': {
    id: 'story-raghurajpur',
    placeName: {
      en: 'Raghurajpur Heritage Crafts Village',
      or: 'ରଘୁରାଜପୁର ଐତିହ୍ୟ ଶିଳ୍ପ ଗ୍ରାମ',
      hi: 'रघुराजपुर धरोहर शिल्प ग्राम',
    },
    narratorName: {
      en: 'Master Pattachitra Chitrakarini & Odissi Scholar',
      or: 'ମୁଖ୍ୟ ପଟ୍ଟଚିତ୍ର ଶିଳ୍ପୀ ଓ ଓଡ଼ିଶୀ ନୃତ୍ୟ ବିଦୁଷୀ',
      hi: 'मुख्य पट्टचित्र शिल्पी व ओडिसी नृत्य विदुषी',
    },
    voicePersonaTitle: {
      en: 'Living Heritage Artisan & Gotipua Dance Matriarch',
      or: 'ରଘୁରାଜପୁରର ଅମର ପଟ୍ଟଚିତ୍ର କାରିଗର',
      hi: 'रघुराजपुर की अमर पट्टचित्र कलाकार',
    },
    geminiVoiceName: 'Kore',
    voiceStylePrompt: {
      en: 'Melodic, expressive female Pattachitra artist speaking with graceful classical Odissi rhythm',
      or: 'ସୁଲଳିତ, ଛନ୍ଦମୟ ଓ କଳାତ୍ମକ ପଟ୍ଟଚିତ୍ର ଶିଳ୍ପୀଙ୍କ ମଧୁର ଓଡ଼ିଆ ନାରୀ କণ্ଠସ୍ୱର',
      hi: 'सुरीली, लयबद्ध और कलात्मक पट्टचित्र कलाकार की मधुर हिन्दी आवाज़',
    },
    acousticPreset: 'artisan-veranda',
    timbreDescription: 'Melodic, rhythmic, lyrical female artisan cadence timed to Odissi Mardala beats (Kore • A2/D3).',
    basePitch: 1.12,
    rateMultiplier: 0.98,
    droneRootFreqs: [110.0, 146.83, 220.0, 293.66],
    preferredVoiceGender: 'female',
    culturalGreeting: {
      or: 'ନମସ୍କାର! ମୁଁ ରଘୁରାଜପୁରର ପଟ୍ଟଚିତ୍ର କାରିଗର, ତାଳପତ୍ର ଓ କପଡ଼ାରେ ରଙ୍ଗ ଭରୁଥିବା ଶିଳ୍ପୀ।',
      hi: 'नमस्कार! मैं रघुराजपुर की पट्टचित्र शिल्पी, ताड़पत्र और वस्त्रों पर अमर रंग भरने वाली कलाकार।',
      en: 'Namaskar! I am the Master Pattachitra Chitrakar of Raghurajpur living heritage crafts village.',
    },
    curatedQuestions: [
      {
        or: 'ଶ୍ରୀମନ୍ଦିର ଅଣସର ସମୟରେ ରଘୁରାଜପୁରର ଚିତ୍ରକାରମାନେ କିପରି ଅଣସର ପଟି ଆଙ୍କନ୍ତି?',
        hi: 'श्रीमंदिर के अणसर काल में रघुराजपुर के चित्रकार अणसर पट्टी कैसे बनाते हैं?',
        en: 'How do Raghurajpur Chitrakaras paint the sacred Anavasara Pattis for Puri Jagannath Temple?',
      },
      {
        or: 'ପଟ୍ଟଚିତ୍ର ନିର୍ମାଣ ପାଇଁ ପ୍ରାକୃତିକ ପଥର, ଶଙ୍ଖ ଓ ତେନ୍ତୁଳି ମଞ୍ଜି ଅଠା କିପରି ପ୍ରସ୍ତୁତ ହୁଏ?',
        hi: 'पट्टचित्र के लिए शंख, समुद्री पत्थर और इमली के बीज से प्राकृतिक रंग कैसे बनते हैं?',
        en: 'How are natural mineral pigments and tamarind-seed canvas prepared in Pattachitra?',
      },
      {
        or: 'ଗୁରୁ କେଳୁଚରଣ ମହାପାତ୍ର ଓ ଗୋଟିପୁଅ ନୃତ୍ୟ କିପରି ଓଡ଼ିଶୀ ନୃତ୍ୟକୁ ବିଶ୍ୱପ୍ରସିଦ୍ଧ କଲେ?',
        hi: 'गुरु केलुचरण महापात्र और गोटीपुआ नृत्य ने शास्त्रीय ओडिसी को विश्वप्रसिद्ध कैसे बनाया?',
        en: 'How did Guru Kelucharan Mahapatra and Gotipua dance revive classical Odissi from Raghurajpur?',
      },
    ],
  },

  'story-mukteswar-rajarani': {
    id: 'story-mukteswar-rajarani',
    placeName: {
      en: 'Mukteswar Gem & Rajarani Symphony Temple',
      or: 'ମୁକ୍ତେଶ୍ୱର ତୋରଣ ଓ ରାଜରାଣୀ ମନ୍ଦିର, ଭୁବନେଶ୍ୱର',
      hi: 'मुक्तेश्वर तोरण एवं राजरानी मंदिर, भुवनेश्वर',
    },
    narratorName: {
      en: 'Acharya Silparatna of Somavamshi Atelier',
      or: 'ସୋମବଂଶୀ ଶିଳ୍ପଶାଳାର ଆଚାର୍ଯ୍ୟ ଶିଳ୍ପରତ୍ନ',
      hi: 'सोमवंशी शिल्पशाला के आचार्य शिल्परत्न',
    },
    voicePersonaTitle: {
      en: 'Master Torana Sculptor & Silpa-Prakasa Theorist',
      or: 'କଳିଙ୍ଗ ତୋରଣ ଭାସ୍କର୍ଯ୍ୟ ଓ ଶିଳ୍ପ-ପ୍ରକାଶ ଆଚାର୍ଯ୍ୟ',
      hi: 'कलिंग तोरण भास्कर्य व शिल्प-प्रकाश आचार्य',
    },
    geminiVoiceName: 'Zephyr',
    voiceStylePrompt: {
      en: 'Refined, aesthetic art historian and classical sculptor savoring delicate floral arabesques and poetry in stone',
      or: 'କଳାତ୍ମକ, ସୁସଂସ୍କୃତ ଓ ସୌନ୍ଦର୍ଯ୍ୟବୋଧ ପୂର୍ଣ୍ଣ ଶିଳ୍ପ ଆଚାର୍ଯ୍ୟଙ୍କ ଓଡ଼ିଆ ସ୍ୱର',
      hi: 'कलात्मक, सुसंस्कृत और सौंदर्यबोध से परिपूर्ण शिल्प आचार्य की हिन्दी आवाज़',
    },
    acousticPreset: 'stone-sanctum',
    timbreDescription: 'Refined, chamber-music tenor evoking Indradyumna Rajarani sandstone acoustics (Zephyr • F#2/B2).',
    basePitch: 1.01,
    rateMultiplier: 0.95,
    droneRootFreqs: [92.5, 123.47, 185.0, 246.94],
    preferredVoiceGender: 'male',
    culturalGreeting: {
      or: 'ନମସ୍କାର! ମୁଁ ଆଚାର୍ଯ୍ୟ ଶିଳ୍ପରତ୍ନ, ଓଡ଼ିଶା ସ୍ଥାପତ୍ୟର ରତ୍ନ ‘ମୁକ୍ତେଶ୍ୱର’ ଓ ‘ରାଜରାଣୀ’ର ଶିଳ୍ପକାର।',
      hi: 'नमस्कार! मैं आचार्य शिल्परत्न, ओडिशा स्थापत्य के रत्न ‘मुक्तेश्वर’ व ‘राजरानी’ का शिल्पकार।',
      en: 'Namaskar! I am Acharya Silparatna, chronicler of the Gem of Odisha Architecture, Mukteswar and Rajarani.',
    },
    curatedQuestions: [
      {
        or: 'ମୁକ୍ତେଶ୍ୱର ମନ୍ଦିରର ଧନୁଷାକୃତି ମକର ତୋରଣକୁ ଓଡ଼ିଶା ସ୍ଥାପତ୍ୟର ରତ୍ନ କାହିଁକି କୁହାଯାଏ?',
        hi: 'मुक्तेश्वर मंदिर के धनुषाकार मकर तोरण को ओडिशा वास्तुकला का रत्न क्यों कहा जाता है?',
        en: 'Why did architectural historian James Fergusson hail Mukteswar and its Makara Torana as the Gem of Odisha?',
      },
      {
        or: 'ରାଜରାଣୀ ମନ୍ଦିରରେ କୌଣସି ମୁଖ୍ୟ ଦେବତା କାହିଁକି ନାହାନ୍ତି ଏବଂ ‘ରାଜରାଣୀ’ ପଥର କ’ଣ?',
        hi: 'राजरानी मंदिर के गर्भगृह में कोई प्रतिमा क्यों नहीं है और ‘राजरानी’ पत्थर क्या है?',
        en: 'Why has Rajarani Temple no sanctum deity, and what is the amber-gold Rajarani sandstone?',
      },
      {
        or: 'ଅଷ୍ଟଦିକପାଳ ମୂର୍ତ୍ତି ଓ ନାୟିକା ଶିଳ୍ପକଳାରେ ଖଜୁରାହୋ ସହିତ କେଉଁ ସାମଞ୍ଜସ୍ୟ ରହିଛି?',
        hi: 'राजरानी की अष्टदिकपाल मूर्तियों और शालभंजिका नायिकाओं की विशेषता क्या है?',
        en: 'What makes the Ashtadikpala guardians and Nayika sculptures of Rajarani masterpieces of Indian art?',
      },
    ],
  },

  'story-hirapur-yogini': {
    id: 'story-hirapur-yogini',
    placeName: {
      en: 'Chausathi Yogini Hypaethral Temple, Hirapur',
      or: 'ଚଉଷଠି ଯୋଗିନୀ ମୁକ୍ତାକାଶ ତନ୍ତ୍ର ପୀଠ, ହୀରାପୁର',
      hi: 'चौसठ योगिनी मुक्ताकाश तंत्र पीठ, हीरापुर',
    },
    narratorName: {
      en: 'Bhairavi Yogini Mahadevi of Bhauma-Kara Court',
      or: 'ଭୌମକର ରାଜସଭାର ଭୈରବୀ ଯୋଗିନୀ ମହାଦେବୀ',
      hi: 'भौमकर राजसभा की भैरवी योगिनी महादेवी',
    },
    voicePersonaTitle: {
      en: 'Kaula Tantric High Priestess & Queen Hiradevi’s Consecrator',
      or: 'କୌଳ ତନ୍ତ୍ର ସାଧିକା ଓ ରାଣୀ ହୀରାଦେବୀଙ୍କ ପୁରୋହିତା',
      hi: 'कौल तंत्र साधिका व रानी हीरादेवी की राजपुरोहिता',
    },
    geminiVoiceName: 'Kore',
    voiceStylePrompt: {
      en: 'Mystical, luminous female Tantric high priestess speaking with sacred nocturnal starlight gravitas',
      or: 'ଆଧ୍ୟାତ୍ମିକ, ଗମ୍ଭୀର ଓ ତେଜସ୍ୱିନୀ ତନ୍ତ୍ର ସାଧିକାଙ୍କ ପବିତ୍ର ଓଡ଼ିଆ ନାରୀ ସ୍ୱର',
      hi: 'आध्यात्मिक, गंभीर और तेजस्विनी योगिनी साधिका की रहस्यमयी हिन्दी आवाज़',
    },
    acousticPreset: 'stone-sanctum',
    timbreDescription: 'Luminous, mystical female alto resonating under the roofless circular sky mandala (Kore • G#2/D#3).',
    basePitch: 0.96,
    rateMultiplier: 0.91,
    droneRootFreqs: [103.83, 155.56, 207.65, 311.13],
    preferredVoiceGender: 'female',
    culturalGreeting: {
      or: 'ଜୟ ମହାମାୟା! ମୁଁ ହୀରାପୁର ଚଉଷଠି ଯୋଗିନୀ ଚକ୍ରର ତନ୍ତ୍ର ସାଧିକା, ରାଣୀ ହୀରାଦେବୀଙ୍କ ପୀଠ ରକ୍ଷିକା।',
      hi: 'जय महामाया! मैं हीरापुर चौसठ योगिनी चक्र की साधिका, रानी हीरादेवी के मुक्ताकाश मंदिर की संरक्षिका।',
      en: 'Jaya Mahamaya! I am the Kaula High Priestess of the roofless 64-Yogini Mandala of Hirapur.',
    },
    curatedQuestions: [
      {
        or: 'ହୀରାପୁରର ଚଉଷଠି ଯୋଗିନୀ ମନ୍ଦିରରେ ଛାତ (Roof) କାହିଁକି ନାହିଁ ଏବଂ ଏହାର ଆକୃତି ଗୋଲାକାର କାହିଁକି?',
        hi: 'हीरापुर के चौसठ योगिनी मंदिर में छत क्यों नहीं है और इसका आकार गोलाकार क्यों है?',
        en: 'Why was the 9th-century Chausathi Yogini temple built completely roofless (hypaethral) and circular?',
      },
      {
        or: 'ଭୌମକର ରାଣୀ ହୀରାଦେବୀ ଓ ୬୪ଟି କଳା ମୁଗୁନି ଯୋଗିନୀ ମୂର୍ତ୍ତିଙ୍କର ରହସ୍ୟ କ’ଣ?',
        hi: 'भौमकर महारानी हीरादेवी और 64 काले क्लोराइट योगिनी प्रतिमाओं का रहस्य क्या है?',
        en: 'Who was Queen Hiradevi, and how is each of the 64 black chlorite Yogini statues uniquely carved?',
      },
      {
        or: '୧୯୫୩ ମସିହାରେ କେଦାରନାଥ ମହାପାତ୍ର ଏହି ଲୁକ୍କାୟିତ ତନ୍ତ୍ର ମନ୍ଦିରକୁ କିପରି ଆବିଷ୍କାର କରିଥିଲେ?',
        hi: '1953 में इतिहासकार केदारनाथ महापात्र ने इस गुप्त मंदिर की खोज कैसे की थी?',
        en: 'How did scholar Kedarnath Mahapatra rediscover Hirapur in 1953 after centuries of obscurity?',
      },
    ],
  },

  'story-jajpur-biraja': {
    id: 'story-jajpur-biraja',
    placeName: {
      en: 'Biraja Shakti Peetha & Ancient Capital Jajpur',
      or: 'ମା’ ବିରଜା ଶକ୍ତିପୀଠ ଓ ପ୍ରାଚୀନ ରାଜଧାନୀ ଯାଜପୁର',
      hi: 'माँ बिरजा शक्तिपीठ एवं प्राचीन राजधानी जाजपुर',
    },
    narratorName: {
      en: 'Queen Tribhuvana Mahadevi’s Royal Purohit',
      or: 'ମହାରାଣୀ ତ୍ରିଭୁବନ ମହାଦେବୀଙ୍କ ରାଜପୁରୋହିତ',
      hi: 'महारानी त्रिभुवन महादेवी के राजपुरोहित',
    },
    voicePersonaTitle: {
      en: 'Nabhi-Gaya Vedic Scholar & Baitarani Chronicler',
      or: 'ନାଭିଗୟା ତୀର୍ଥ ଓ ବୈତରଣୀ ଶାସ୍ତ୍ରଜ୍ଞ ପଣ୍ଡିତ',
      hi: 'नाभिगया तीर्थ व वैतरणी शास्त्रज्ञ पंडित',
    },
    geminiVoiceName: 'Kore',
    voiceStylePrompt: {
      en: 'Regal, matriarchal Shakta chronicler honoring Odisha’s six ruling Bhauma-Kara queens and Adi Shakti',
      or: 'ଭକ୍ତିମୟ ଓ ଗାରିମାମୟ ମା’ ବିରଜା କ୍ଷେତ୍ରର ଶାସ୍ତ୍ରଜ୍ଞା ଓଡ଼ିଆ କণ্ଠସ୍ୱର',
      hi: 'भक्तिमय और गरिमामयी माँ बिरजा शक्तिपीठ की शास्त्रज्ञ हिन्दी आवाज़',
    },
    acousticPreset: 'stone-sanctum',
    timbreDescription: 'Regal Shakta soprano honoring six sovereign Bhauma-Kara queens on the Baitarani river (Kore • C3/G3).',
    basePitch: 1.09,
    rateMultiplier: 0.96,
    droneRootFreqs: [130.81, 196.0, 261.63, 392.0],
    preferredVoiceGender: 'female',
    culturalGreeting: {
      or: 'ଜୟ ମା’ ବିରଜା! ପବିତ୍ର ବୈତରଣୀ ତୀରସ୍ଥ ପ୍ରାଚୀନ ରାଜଧାନୀ ଗୁହଦେବପାଟକ-ଯାଜପୁରରୁ ସ୍ୱାଗତ।',
      hi: 'जय माँ बिरजा! पवित्र वैतरणी नदी तट पर स्थित प्राचीन राजधानी जाजपुर से आपका स्वागत है।',
      en: 'Jaya Maa Biraja! Welcome to Jajpur, ancient Guhadevapataka capital on the holy Baitarani River.',
    },
    curatedQuestions: [
      {
        or: 'ଯାଜପୁରରେ କିପରି ଛଅ ଜଣ ଭୌମକର ମହାରାଣୀ ସିଂହାସନ ଆରୋହଣ କରି ଓଡ଼ିଶା ଶାସନ କରିଥିଲେ?',
        hi: 'जाजपुर से भौमकर राजवंश की छह रानियों ने संप्रभु सम्राज्ञी बनकर कैसे शासन किया?',
        en: 'How did six sovereign queens of the Bhauma-Kara dynasty rule Odisha from Jajpur in the 9th–10th centuries?',
      },
      {
        or: 'ମା’ ବିରଜାଙ୍କ ଦ୍ୱିଭୁଜା ମହିଷାମର୍ଦ୍ଦିନୀ ମୂର୍ତ୍ତି ଏବଂ ‘ନାଭିଗୟା’ ପିଣ୍ଡଦାନର ପୌରାଣିକ ମହତ୍ତ୍ୱ କ’ଣ?',
        hi: 'माँ बिरजा की द्विभुजा महिषासुरमर्दिनी प्रतिमा और ‘नाभिगया’ तीर्थ का महत्व क्या है?',
        en: 'Why is Maa Biraja uniquely two-armed, and what is the sacred significance of Nabhi Gaya?',
      },
      {
        or: 'ଯଯାତି କେଶରୀଙ୍କ ଦଶାଶ୍ୱମେଧ ଘାଟ ଓ ସପ୍ତମାତୃକା ମନ୍ଦିରର ଇତିହାସ କ’ଣ?',
        hi: 'ययाति केसरी के दशाश्वमेध घाट और सप्तमातृका प्रतिमाओं का इतिहास क्या है?',
        en: 'What is the history of Jajati Keshari’s Dashashwamedha Ghat and the colossal Saptamatrika icons?',
      },
    ],
  },

  'story-jaugada-taratarini': {
    id: 'story-jaugada-taratarini',
    placeName: {
      en: 'Jaugada Mauryan Rock Edicts & Tara Tarini Peetha',
      or: 'ଜଉଗଡ଼ ଅଶୋକ ଶିଳାଲେଖ ଓ ମା’ ତାରାତାରିଣୀ ଶକ୍ତିପୀଠ, ଗଞ୍ଜାମ',
      hi: 'जउगड़ अशोक शिलालेख एवं माँ तारातारिणी शक्तिपीठ, गंजाम',
    },
    narratorName: {
      en: 'Mahamatra of Samapa & Rushikulya Scholar',
      or: 'ସମାପା ନଗରୀର ମୌର୍ଯ୍ୟ ମହାମାତ୍ର ଓ ଋଷିକୁଲ୍ୟା ଗବେଷକ',
      hi: 'समापा नगरी के मौर्य महामात्र व ऋषिकुल्या इतिहासकार',
    },
    voicePersonaTitle: {
      en: 'Mauryan Provincial Magistrate & Adi Shakti Historian',
      or: 'ପ୍ରାଚୀନ ସମାପା ଦୁର୍ଗର ଶିଳାଲେଖ ଅଧିକାରୀ',
      hi: 'प्राचीन समापा दुर्ग के शिलालेख अधिकारी',
    },
    geminiVoiceName: 'Charon',
    voiceStylePrompt: {
      en: 'Measured, statesmanlike Mauryan magistrate reading royal Prakrit edicts overlooking the Rushikulya valley',
      or: 'ଗମ୍ଭୀର, ନୀତିନିଷ୍ଠ ଓ ପ୍ରାଚୀନ ସମାପା ମହାମାତ୍ରଙ୍କ ଶୁଦ୍ଧ ଓଡ଼ିଆ ସ୍ୱର',
      hi: 'गंभीर, नीतिनिष्ठ और प्राचीन समापा महामात्र की शुद्ध हिन्दी आवाज़',
    },
    acousticPreset: 'fortress-rampart',
    timbreDescription: 'Measured Mauryan statesman baritone echoing over Rushikulya and Kumari hills (Charon • D2/G2).',
    basePitch: 0.87,
    rateMultiplier: 0.93,
    droneRootFreqs: [73.42, 98.0, 146.83, 196.0],
    preferredVoiceGender: 'male',
    culturalGreeting: {
      or: 'ନମସ୍କାର! ପବିତ୍ର ଋଷିକୁଲ୍ୟା ନଦୀ ଉପତ୍ୟକାର ଜଉଗଡ଼ ଶିଳାଲେଖ ଓ ମା’ ତାରାତାରିଣୀ ପୀଠରୁ ସ୍ୱାଗତ।',
      hi: 'नमस्कार! पवित्र ऋषिकुल्या नदी घाटी के जउगड़ शिलालेख और माँ तारातारिणी पीठ से स्वागत है।',
      en: 'Namaskar from the Rushikulya valley—home to Ashoka’s Jaugada Rock Edicts and Maa Tara Tarini!',
    },
    curatedQuestions: [
      {
        or: 'ଜଉଗଡ଼ (ପ୍ରାଚୀନ ସମାପା) ଶିଳାଲେଖରେ ସମ୍ରାଟ ଅଶୋକ କଳିଙ୍ଗ ପ୍ରଜାଙ୍କ ପାଇଁ କ’ଣ ଆଦେଶ ଦେଇଥିଲେ?',
        hi: 'जउगड़ (प्राचीन समापा) शिलालेख में सम्राट अशोक ने कलिंगवासियों के लिए क्या संदेश उत्कीर्ण कराया?',
        en: 'What did Emperor Ashoka proclaim in the Jaugada (ancient Samapa) granite rock edicts?',
      },
      {
        or: 'କୁମାରୀ ପାହାଡ଼ର ମା’ ତାରାତାରିଣୀ କାହିଁକି ଚାରି ଆଦି ଶକ୍ତିପୀଠ ମଧ୍ୟରୁ ଅନ୍ୟତମ?',
        hi: 'कुमारी पहाड़ी पर स्थित माँ तारातारिणी चार प्रमुख आदि शक्तिपीठों में क्यों गिनी जाती हैं?',
        en: 'Why is the twin-goddess shrine of Tara Tarini revered among the four primordial Adi Shakti Peethas?',
      },
      {
        or: 'ଋଷିକୁଲ୍ୟା ମୁହାଣରେ ଅଲିଭ୍ ରିଡଲେ କଇଁଛଙ୍କ ସମୂହ ଅଣ୍ଡାଦାନ (Arribada) ଓ ପ୍ରାଚୀନ ବନ୍ଦର ଇତିହାସ କ’ଣ?',
        hi: 'ऋषिकुल्या मुहाने पर ऑलिव रिडले कछुओं के आगमन और गंजाम के समुद्री इतिहास की क्या विशेषता है?',
        en: 'How does the Rushikulya estuary link ancient Kalinga maritime trade with ecological heritage?',
      },
    ],
  },

  'story-kapilash-joranda': {
    id: 'story-kapilash-joranda',
    placeName: {
      en: 'Kapilash Kailash Shikhar & Joranda Mahima Gadi',
      or: 'କପିଳାସ ଚନ୍ଦ୍ରଶେଖର ପୀଠ ଓ ଯୋରନ୍ଦା ମହିମା ଗାଦି, ଢେଙ୍କାନାଳ',
      hi: 'कपिलाश चंद्रशेखर पीठ एवं जोरंदा महिमा गादी, ढेंकानाल',
    },
    narratorName: {
      en: 'Alekh Mahima Bhima Bhoi Philosopher-Poet',
      or: 'ସନ୍ଥକବି ଭୀମ ଭୋଇ ଓ ଶୂନ୍ୟ-ବ୍ରହ୍ମ ଦାର୍ଶନିକ',
      hi: 'संतकवि भीम भोई परंपरा के शून्य-ब्रह्म दार्शनिक',
    },
    voicePersonaTitle: {
      en: 'Mahima Dharma Mystic Poet & Kapilash Chronicler',
      or: 'ଅଲେଖ ମହିମା ଧର୍ମ ଦାର୍ଶନିକ ଓ କପିଳାସ ଗବେଷକ',
      hi: 'अलेख महिमा धर्म दार्शनिक व कपिलाश इतिहासकार',
    },
    geminiVoiceName: 'Zephyr',
    voiceStylePrompt: {
      en: 'Soulful, deeply compassionate philosophical poet reciting universal humanism and mountain Shaiva lore',
      or: 'କରୁଣାମୟ, ଦାର୍ଶନିକ ଓ ହୃଦୟସ୍ପର୍ଶୀ ସନ୍ଥକବି ପରମ୍ପରାର ଓଡ଼ିଆ କণ্ଠସ୍ୱର',
      hi: 'करुणामय, दार्शनिक और हृदयस्पर्शी संतकवि परंपरा की हिन्दी आवाज़',
    },
    acousticPreset: 'highland-mist',
    timbreDescription: 'Soulful philosophical baritone echoing Bhima Bhoi’s Stuti Chintamani khanjani hymns (Zephyr • E2/C#3).',
    basePitch: 0.95,
    rateMultiplier: 0.91,
    droneRootFreqs: [82.41, 138.59, 164.81, 277.18],
    preferredVoiceGender: 'male',
    culturalGreeting: {
      or: 'ଅଲେଖ ନିରଞ୍ଜନ! ୧୩୫୨ ପାହାଚର କପିଳାସ ପୀଠ ଓ ଯୋରନ୍ଦା ଶୂନ୍ୟ ମନ୍ଦିର ଭୂମିରୁ ପ୍ରଣାମ।',
      hi: 'अलेख निरंजन! 1352 सीढ़ियों वाले कपिलाश कैलाश और जोरंदा शून्य मंदिर की पावन भूमि से प्रणाम।',
      en: 'Alekh Niranjan! Salutations from the 1,352 stone steps of Kapilash and Joranda Mahima Gadi.',
    },
    curatedQuestions: [
      {
        or: '“ମୋ ଜୀବନ ପଛେ ନର୍କେ ପଡ଼ିଥାଉ, ଜଗତ ଉଦ୍ଧାର ହେଉ” — ମହିମା ଧର୍ମ ଓ ଯୋରନ୍ଦା ଗାଦିର ଦର୍ଶନ କ’ଣ?',
        hi: '“मो जीवन पछे नर्के पडिथाउ, जगत उद्धार हेउ” — जोरंदा महिमा गादी और भीम भोई का दर्शन क्या है?',
        en: 'What is the egalitarian Shunya-Brahma philosophy of Mahima Gosain and Bhima Bhoi at Joranda?',
      },
      {
        or: 'ନରସିଂହଦେବ ପ୍ରଥମ ୧୨୪୬ ମସିହାରେ କପିଳାସ ଚନ୍ଦ୍ରଶେଖର ମନ୍ଦିର କିପରି ନିର୍ମାଣ କରିଥିଲେ?',
        hi: 'सम्राट नरसिंहदेव प्रथम ने 1246 ईस्वी में कपिलाश चंद्रशेखर मंदिर का निर्माण कैसे कराया?',
        en: 'What does the 1246 CE Kapilash inscription reveal about Langula Narasimhadeva I and Odisha’s Kailash?',
      },
      {
        or: 'ଢେଙ୍କାନାଳ ପ୍ରଜାମଣ୍ଡଳ ଆନ୍ଦୋଳନ ଓ ୧୨ ବର୍ଷର ଶହୀଦ ବାଜି ରାଉତଙ୍କ ବୀରତ୍ୱ ଗାଥା କ’ଣ?',
        hi: 'ढेंकानाल प्रजामंडल आंदोलन और 12 वर्षीय अमर शहीद बाजी राउत की वीरता की कहानी क्या है?',
        en: 'How did 12-year-old boatman Baji Rout become India’s youngest freedom martyr on the Brahmani river?',
      },
    ],
  },

  'story-bhitarkanika-kanika': {
    id: 'story-bhitarkanika-kanika',
    placeName: {
      en: 'Bhitarkanika Mangroves, Gahirmatha & Kanika Rajbari',
      or: 'ଭିତରକନିକା ହେନ୍ତାଳ ବଣ, ଗହୀରମଥା ଓ କନିକା ରାଜବାଟୀ, କେନ୍ଦ୍ରାପଡ଼ା',
      hi: 'भितरकनिका मैंग्रोव, गहीरमथा एवं कनिका राजबाड़ी, केंद्रपाड़ा',
    },
    narratorName: {
      en: 'Kanika Maritime Admiral & Estuarine Naturalist',
      or: 'କନିକା ନୌସେନାଧ୍ୟକ୍ଷ ଓ ହେନ୍ତାଳ ବଣ ଗବେଷକ',
      hi: 'कनिका नौसेनाध्यक्ष एवं मैंग्रोव पारिस्थितिकीविद',
    },
    voicePersonaTitle: {
      en: 'Brahmani-Baitarani Delta Navigator & Conservationist',
      or: 'ବ୍ରାହ୍ମଣୀ-ବୈତରଣୀ ମୁହାଣ ରକ୍ଷକ ଓ ତୁଳସୀ କ୍ଷେତ୍ର ଐତିହାସିକ',
      hi: 'ब्राह्मणी-वैतरणी डेल्टा संरक्षक व तुलसी क्षेत्र इतिहासकार',
    },
    geminiVoiceName: 'Puck',
    voiceStylePrompt: {
      en: 'Crisp, observant estuarine explorer and royal chronicler describing tidal creeks and medieval shrines',
      or: 'ସ୍ପଷ୍ଟ, ଜୀବନ୍ତ ଓ ରୋମାଞ୍ଚକର ଭିତରକନିକା-କେନ୍ଦ୍ରାପଡ଼ା ଐତିହାସିକଙ୍କ ଓଡ଼ିଆ ସ୍ୱର',
      hi: 'स्पष्ट, जीवंत और रोचक भितरकनिका व केंद्रपाड़ा इतिहासकार की हिन्दी आवाज़',
    },
    acousticPreset: 'ocean-breeze',
    timbreDescription: 'Tidal estuarine tenor echoing Brahmani mangrove creeks and Baladevjew conchs (Puck • F2/A#2).',
    basePitch: 0.99,
    rateMultiplier: 1.01,
    droneRootFreqs: [87.31, 116.54, 174.61, 233.08],
    preferredVoiceGender: 'male',
    culturalGreeting: {
      or: 'ନମସ୍କାର! ତୁଳସୀ କ୍ଷେତ୍ର କେନ୍ଦ୍ରାପଡ଼ା ଓ ଭିତରକନିକାର ସବୁଜ ହେନ୍ତାଳ ବନାନୀରୁ ସ୍ୱାଗତ।',
      hi: 'नमस्कार! तुलसी क्षेत्र केंद्रपाड़ा और भितरकनिका के सघन मैंग्रोव वनों से आपका स्वागत है।',
      en: 'Namaskar from Tulasi Kshetra Kendrapara and the tidal mangrove labyrinth of Bhitarkanika!',
    },
    curatedQuestions: [
      {
        or: 'ଭିତରକନିକା ଭିତରେ ଥିବା ପ୍ରାଚୀନ ବନଦୁର୍ଗା ଓ ଶିବ ମନ୍ଦିର ଏବଂ କନିକା ରାଜବଂଶର ଇତିହାସ କ’ଣ?',
        hi: 'भितरकनिका के भीतर स्थित प्राचीन मंदिरों और कनिका राजवंश के नौसैनिक दुर्गों का इतिहास क्या है?',
        en: 'What is the history of the Kanika Royal Estate, Dangamal hunting towers, and ancient mangrove shrines?',
      },
      {
        or: 'ଗହୀରମଥା ବେଳାଭୂମିରେ ଲକ୍ଷ ଲକ୍ଷ ଅଲିଭ୍ ରିଡଲେ କଇଁଛ ଓ ବଉଳା କୁମ୍ଭୀର କିପରି ସଂରକ୍ଷିତ?',
        hi: 'गहीरमथा तट पर लाखों ऑलिव रिडले कछुओं और विशाल खारे पानी के मगरमच्छों का संरक्षण कैसे हुआ?',
        en: 'How did Bhitarkanika and Gahirmatha become global sanctuaries for saltwater crocodiles and Olive Ridleys?',
      },
      {
        or: 'ତୁଳସୀ କ୍ଷେତ୍ର ଶ୍ରୀ ବଳଦେବଜୀଉ ମନ୍ଦିର ଓ କେନ୍ଦ୍ରାପଡ଼ା ରସାବଳି (GI Tag) ର ପରମ୍ପରା କ’ଣ?',
        hi: 'तुलसी क्षेत्र श्री बलदेवजीउ मंदिर और केंद्रपाड़ा रसाबली (GI टैग) भोग की परंपरा क्या है?',
        en: 'What is the Maratha-era heritage of Sri Baladevjew Temple and GI-tagged Kendrapara Rasabali?',
      },
    ],
  },

  'story-gandhamardan-nrusinghanath': {
    id: 'story-gandhamardan-nrusinghanath',
    placeName: {
      en: 'Gandhamardan: Nrusinghanath, Harishankar & Parimalagiri',
      or: 'ଗନ୍ଧମାର୍ଦ୍ଦନ ପର୍ବତ: ନୃସିଂହନାଥ, ହରିଶଙ୍କର ଓ ପରିମଳଗିରି ବିହାର',
      hi: 'गंधमार्दन पर्वत: नृसिंहनाथ, हरिशंकर एवं परिमलगिरि महाविहार',
    },
    narratorName: {
      en: 'Acharya Nagarjuna’s Ayurvedic & Buddhist Successor',
      or: 'ଆଚାର୍ଯ୍ୟ ନାଗାର୍ଜୁନଙ୍କ ଆୟୁର୍ବେଦ ଓ ବୌଦ୍ଧ ଉତ୍ତରାଧିକାରୀ',
      hi: 'आचार्य नागार्जुन परंपरा के आयुर्वेद व बौद्ध विद्वान',
    },
    voicePersonaTitle: {
      en: 'Parimalagiri Scholar & Gandhamardan Vaidya-Historian',
      or: 'ପରିମଳଗିରି ମହାବିହାର ଆଚାର୍ଯ୍ୟ ଓ ଔଷଧୀୟ ପର୍ବତ ରକ୍ଷକ',
      hi: 'परिमलगिरि महाविहार आचार्य व औषधीय पर्वत संरक्षक',
    },
    geminiVoiceName: 'Zephyr',
    voiceStylePrompt: {
      en: 'Wise, soothing ancient Ayurvedic sage and philosopher speaking beside mountain waterfalls',
      or: 'ପ୍ରଜ୍ଞାବାନ, ଶାନ୍ତ ଓ ଗନ୍ଧମାର୍ଦ୍ଦନ ଔଷଧୀୟ ଋଷି ପରମ୍ପରାର ଓଡ଼ିଆ ସ୍ୱର',
      hi: 'प्रज्ञावान, शांत और गंधमार्दन औषधीय ऋषि परंपरा की सौम्य हिन्दी आवाज़',
    },
    acousticPreset: 'forest-canopy',
    timbreDescription: 'Soothing, scholarly baritone resonating with Kapildhara streams and Ayurvedic wisdom (Zephyr • D2/F#2).',
    basePitch: 0.93,
    rateMultiplier: 0.92,
    droneRootFreqs: [73.42, 92.5, 146.83, 185.0],
    preferredVoiceGender: 'male',
    culturalGreeting: {
      or: 'ନମସ୍କାର! ପବିତ୍ର ଔଷଧୀୟ ପର୍ବତ ଗନ୍ଧମାର୍ଦ୍ଦନର ନୃସିଂହନାଥ ଓ ହରିଶଙ୍କର ତୀର୍ଥରୁ ସ୍ୱାଗତ।',
      hi: 'नमस्कार! पवित्र औषधीय पर्वत गंधमार्दन के नृसिंहनाथ और हरिशंकर तीर्थ से आपका स्वागत है।',
      en: 'Namaskar from sacred Gandhamardan Hill—twin home of Nrusinghanath, Harishankar, and Parimalagiri!',
    },
    curatedQuestions: [
      {
        or: 'ନୃସିଂହନାଥରେ ମହାପ୍ରଭୁ ‘ମାର୍ଜାର କେଶରୀ’ (ବିରାଡ଼ି-ସିଂହ ରୂପ) ଭାବେ କାହିଁକି ପୂଜା ପାଆନ୍ତି?',
        hi: 'नृसिंहनाथ मंदिर में भगवान ‘मार्जार केसरी’ (बिल्ली-सिंह रूप) में क्यों पूजे जाते हैं?',
        en: 'Why is Lord Vishnu worshipped in the unique Marjara-Keshari (feline-lion) form at Nrusinghanath?',
      },
      {
        or: 'ହୁଏନସାଂ ବର୍ଣ୍ଣିତ ‘ପୋ-ଲୋ-ମୋ-ଲୋ-କି-ଲି’ (ପରିମଳଗିରି) ଓ ଆଚାର୍ଯ୍ୟ ନାଗାର୍ଜୁନଙ୍କ ସମ୍ପର୍କ କ’ଣ?',
        hi: 'ह्वेनसांग द्वारा वर्णित ‘परिमलगिरि’ विश्वविद्यालय और आचार्य नागार्जुन का क्या संबंध था?',
        en: 'What is the connection between Xuanzang’s Po-lo-mo-lo-ki-li (Parimalagiri) and philosopher Nagarjuna?',
      },
      {
        or: 'ଗନ୍ଧମାର୍ଦ୍ଦନ ପର୍ବତକୁ ୨୦୨୩ରେ କାହିଁକି ଜୈବବିବିଧତା ଐତିହ୍ୟ ସ୍ଥଳ ଘୋଷଣା କରାଗଲା?',
        hi: 'गंधमार्दन पर्वत को आयुर्वेद का स्वर्ग और जैवविविधता विरासत स्थल क्यों घोषित किया गया?',
        en: 'Why is Gandhamardan celebrated as an Ayurvedic treasury and Biodiversity Heritage Site?',
      },
    ],
  },

  'story-ranipur-jharial': {
    id: 'story-ranipur-jharial',
    placeName: {
      en: 'Ranipur-Jharial Soma Tirtha & Indralath Brick Temple',
      or: 'ରାଣୀପୁର-ଝରିଆଲ ସୋମତୀର୍ଥ, ୬୪ ଯୋଗିନୀ ଓ ଇନ୍ଦ୍ରଲାଠ ଇଟା ମନ୍ଦିର, ବଲାଙ୍ଗୀର',
      hi: 'रानीपुर-झरियाल सोमतीर्थ, 64 योगिनी एवं इंद्रलाठ ईंट मंदिर, बलांगीर',
    },
    narratorName: {
      en: 'Mattamayura Shaiva Siddha Acharya Gaganasiva',
      or: 'ମତ୍ତମୟୂର ଶୈବ ସିଦ୍ଧ ଆଚାର୍ଯ୍ୟ ଗଗନଶିବ',
      hi: 'मत्तमयूर शैव सिद्ध आचार्य गगनशिव',
    },
    voicePersonaTitle: {
      en: '9th-Century Somavamshi Tantric Architect & Epigraphist',
      or: 'ସୋମତୀର୍ଥର ଶିଳାଲେଖ ରଚୟିତା ଓ ତନ୍ତ୍ର-ଶୈବ ଆଚାର୍ଯ୍ୟ',
      hi: 'सोमतीर्थ के शिलालेख रचयिता व तंत्र-शैव आचार्य',
    },
    geminiVoiceName: 'Fenrir',
    voiceStylePrompt: {
      en: 'Solemn, authoritative medieval Shaiva Siddha master standing atop monolithic granite domes',
      or: 'ଗମ୍ଭୀର, ତପସ୍ୱୀ ଓ ପ୍ରାଚୀନ କୋଶଳ ଶୈବ ଆଚାର୍ଯ୍ୟଙ୍କ ସ୍ପଷ୍ଟ ଓଡ଼ିଆ ସ୍ୱର',
      hi: 'गंभीर, तपस्वी और प्राचीन कोसल शैव आचार्य की प्रभावशाली हिन्दी आवाज़',
    },
    acousticPreset: 'stone-sanctum',
    timbreDescription: 'Solemn monolithic granite resonance of Soma Tirtha’s 64 Yoginis and Indralath (Fenrir • C2/F2).',
    basePitch: 0.85,
    rateMultiplier: 0.94,
    droneRootFreqs: [65.41, 87.31, 130.81, 174.61],
    preferredVoiceGender: 'male',
    culturalGreeting: {
      or: 'ଓଁ ନମଃ ଶିବାୟ! ମୁଁ ଆଚାର୍ଯ୍ୟ ଗଗନଶିବ, ବଲାଙ୍ଗୀରର ପ୍ରାଚୀନ ସୋମତୀର୍ଥ ରାଣୀପୁର-ଝରିଆଲର ସାଧକ।',
      hi: 'ॐ नमः शिवाय! मैं आचार्य गगनशिव, बलांगीर के प्राचीन सोमतीर्थ रानीपुर-झरियाल का साधक।',
      en: 'Om Namah Shivaya! I am Acharya Gaganasiva of the 9th-century Soma Tirtha at Ranipur-Jharial.',
    },
    curatedQuestions: [
      {
        or: 'ରାଣୀପୁର-ଝରିଆଲରେ ଶୈବ, ବୈଷ୍ଣବ, ବୌଦ୍ଧ ଓ ୬୪ ଯୋଗିନୀ ତନ୍ତ୍ର କିପରି ଏକାଠି ମିଳିତ ହୋଇଛି?',
        hi: 'रानीपुर-झरियाल में शैव, वैष्णव, बौद्ध और 64 योगिनी तंत्र एक ही चट्टान पर कैसे संगमित हुए?',
        en: 'How did Shaivism, Vaishnavism, Buddhism, and 64-Yogini Tantra converge at Ranipur-Jharial?',
      },
      {
        or: '୭୫ ଫୁଟ ଉଚ୍ଚ ‘ଇନ୍ଦ୍ରଲାଠ’ ପ୍ରାଚୀନ ପୋଡ଼ା-ଇଟା ମନ୍ଦିରର ନିର୍ମାଣ କୌଶଳ କ’ଣ?',
        hi: '75 फीट ऊंचे ‘इंद्रलाठ’ प्राचीन पकी-ईंट मंदिर की स्थापत्य विशेषता क्या है?',
        en: 'What makes the 75-foot Indralath Temple one of India’s tallest surviving medieval brick temples?',
      },
      {
        or: 'ସୋମେଶ୍ୱର ମନ୍ଦିର ଶିଳାଲେଖରେ ଆଚାର୍ଯ୍ୟ ଗଗନଶିବଙ୍କ ବିଷୟରେ କ’ଣ ଉଲ୍ଲେଖ ଅଛି?',
        hi: 'सोमेश्वर मंदिर के संस्कृत शिलालेख में आचार्य गगनशिव के बारे में क्या लिखा है?',
        en: 'What does the Someshwara stone inscription record about Mattamayura sage Acharya Gaganasiva?',
      },
    ],
  },

  'story-mahendragiri': {
    id: 'story-mahendragiri',
    placeName: {
      en: 'Mahendragiri Kunti-Yudhishthira Megalithic Shrines',
      or: 'ମହେନ୍ଦ୍ରଗିରି କୁନ୍ତୀ-ଯୁଧିଷ୍ଠିର ପ୍ରାଚୀନ ମନ୍ଦିର ଓ କୁଳପର୍ବତ, ଗଜପତି',
      hi: 'महेंद्रगिरि कुंती-युधिष्ठिर प्राचीन मंदिर एवं कुलपर्वत, गजपति',
    },
    narratorName: {
      en: 'Sailodbhava Sage & Kula-Parvata Chronicler',
      or: 'ଶୈଳୋଦ୍ଭବ ଋଷି ଓ ମହେନ୍ଦ୍ର କୁଳପର୍ବତ ଗବେଷକ',
      hi: 'शैलोद्भव ऋषि एवं महेंद्र कुलपर्वत इतिहासकार',
    },
    voicePersonaTitle: {
      en: '6th-Century Early Kalinga Megalithic Temple Guardian',
      or: 'ଷଷ୍ଠ ଶତାବ୍ଦୀର ପ୍ରାରମ୍ଭିକ କଳିଙ୍ଗ ପ୍ରସ୍ତର ଦେଉଳ ରକ୍ଷକ',
      hi: 'छठी शताब्दी के प्रारंभिक कलिंग पाषाण मंदिर संरक्षक',
    },
    geminiVoiceName: 'Charon',
    voiceStylePrompt: {
      en: 'Ancient, windswept epic mountain sage recounting Parashurama, Pandavas, and early megalithic masonry',
      or: 'ପୌରାଣିକ ଓ ଗମ୍ଭୀର ମହେନ୍ଦ୍ରଗିରି ପର୍ବତ ଋଷିଙ୍କ ସ୍ପଷ୍ଟ ଓଡ଼ିଆ କণ্ଠସ୍ୱର',
      hi: 'पौराणिक और गंभीर महेंद्रगिरि पर्वत ऋषि की स्पष्ट हिन्दी आवाज़',
    },
    acousticPreset: 'highland-mist',
    timbreDescription: 'Epic wind-swept mountain baritone from 1,501m Mahendragiri Kula-Parvata (Charon • A1/E2).',
    basePitch: 0.83,
    rateMultiplier: 0.91,
    droneRootFreqs: [55.0, 82.41, 110.0, 164.81],
    preferredVoiceGender: 'male',
    culturalGreeting: {
      or: 'ନମସ୍କାର! ସପ୍ତ କୁଳପର୍ବତ ମଧ୍ୟରୁ ଅନ୍ୟତମ ପବିତ୍ର ମହେନ୍ଦ୍ରଗିରି ଶୃଙ୍ଗରୁ ଆପଣଙ୍କୁ ସ୍ୱାଗତ।',
      hi: 'नमस्कार! भारत के सप्त कुलपर्वतों में से एक पावन महेंद्रगिरि शिखर से आपका स्वागत है।',
      en: 'Namaskar from the 1,501-meter summit of Mahendragiri, one of Bharatavarsha’s seven Kula-Parvatas!',
    },
    curatedQuestions: [
      {
        or: 'ମହେନ୍ଦ୍ରଗିରିର ଭୀମ ଓ ଯୁଧିଷ୍ଠିର ମନ୍ଦିର କିପରି ବିଶାଳ ଏକଶିଳା ପଥର ଖଣ୍ଡରେ ନିର୍ମିତ ହୋଇଛି?',
        hi: 'महेंद्रगिरि के भीम और युधिष्ठिर मंदिर विशाल एकाश्म पत्थरों से कैसे निर्मित हैं?',
        en: 'Why are the 6th-century Yudhishthira, Bhima, and Kunti shrines considered the earliest proto-Kalinga temples?',
      },
      {
        or: 'ରାମାୟଣ, ମହାଭାରତ ଓ ଭଗବାନ ପରଶୁରାମଙ୍କ ତପସ୍ୟା ସହିତ ମହେନ୍ଦ୍ରଗିରିର ସମ୍ପର୍କ କ’ଣ?',
        hi: 'रामायण, महाभारत और भगवान परशुराम की तपस्या से महेंद्रगिरि का क्या संबंध है?',
        en: 'How do the Ramayana, Mahabharata, and Kalidasa’s Raghuvamsa celebrate Mount Mahendragiri?',
      },
      {
        or: 'ମହେନ୍ଦ୍ରଗିରିରେ ସମୁଦ୍ରଗୁପ୍ତ, ଚୋଳ ରାଜେନ୍ଦ୍ର ପ୍ରଥମ ଓ ଗଙ୍ଗ ରାଜାଙ୍କ କେଉଁ ଶିଳାଲେଖ ରହିଛି?',
        hi: 'महेंद्रगिरि पर राजेंद्र चोल प्रथम और पूर्वी गंग सम्राटों के कौन से शिलालेख मिले हैं?',
        en: 'What do the Chola victory pillar inscriptions and Ganga epigraphs atop Mahendragiri record?',
      },
    ],
  },

  'story-sonepur-suvarnapura': {
    id: 'story-sonepur-suvarnapura',
    placeName: {
      en: 'Suvarnapura (Sonepur): Lankeswari Gorge & Kosala Temples',
      or: 'ସୁବର୍ଣ୍ଣପୁର (ସୋନପୁର): ମା’ ଲଙ୍କେଶ୍ୱରୀ ଦରହ ଓ ପଶ୍ଚିମ ଲଙ୍କା ଐତିହ୍ୟ',
      hi: 'सुवर्णपुर (सोनपुर): माँ लंकेश्वरी दरह एवं पश्चिम लंका धरोहर',
    },
    narratorName: {
      en: 'Charyapada Tantric Poetess & Mahanadi-Tel Chronicler',
      or: 'ଚର୍ଯ୍ୟାପଦ ତାନ୍ତ୍ରିକ କବୟିତ୍ରୀ ଓ ସୁବର୍ଣ୍ଣପୁର ଐତିହାସିକା',
      hi: 'चर्यापद तांत्रिक कवयित्री एवं सुवर्णपुर इतिहासकार',
    },
    voicePersonaTitle: {
      en: 'Somavamshi Capital Chronicler & Paschima-Lanka Scholar',
      or: 'ମହାନଦୀ-ତେଲ ସଙ୍ଗମ ଓ ସୋମବଂଶୀ ରାଜଧାନୀ ଗବେଷିକା',
      hi: 'महानदी-तेल संगम व सोमवंशी राजधानी शोधकर्ता',
    },
    geminiVoiceName: 'Kore',
    voiceStylePrompt: {
      en: 'Poetic, articulate female chronicler speaking from the sacred confluence of the Mahanadi and Tel rivers',
      or: 'ସୁମଧୁର, ପ୍ରାଞ୍ଜଳ ଓ ଐତିହାସିକ ଗାରିମା ପୂର୍ଣ୍ଣ ସୁବର୍ଣ୍ଣପୁରର ଓଡ଼ିଆ ନାରୀ ସ୍ୱର',
      hi: 'मधुर, प्रांजल और ऐतिहासिक गरिमा से पूर्ण सुवर्णपुर की हिन्दी आवाज़',
    },
    acousticPreset: 'ocean-breeze',
    timbreDescription: 'Lyrical river-confluence soprano honoring Paschima-Lanka copper plates and Bomkai looms (Kore • D3/A3).',
    basePitch: 1.10,
    rateMultiplier: 0.99,
    droneRootFreqs: [146.83, 220.0, 293.66, 440.0],
    preferredVoiceGender: 'female',
    culturalGreeting: {
      or: 'ଜୁହାର! ମହାନଦୀ ଓ ତେଲ ନଦୀର ପବିତ୍ର ସଙ୍ଗମସ୍ଥଳୀ ମନ୍ଦିରମାଳିନୀ ସୁବର୍ଣ୍ଣପୁରରୁ ସ୍ୱାଗତ।',
      hi: 'जुहार! महानदी और तेल नदी के पावन संगम पर स्थित मंदिरों की नगरी सुवर्णपुर से स्वागत है।',
      en: 'Juhar! Welcome to Suvarnapura at the Mahanadi-Tel confluence, ancient capital of the Somavamshis.',
    },
    curatedQuestions: [
      {
        or: 'ତାମ୍ବ୍ରଶାସନରେ ସୁବର୍ଣ୍ଣପୁରକୁ ‘ପଶ୍ଚିମ ଲଙ୍କା’ କାହିଁକି କୁହାଯାଇଛି ଏବଂ ମା’ ଲଙ୍କେଶ୍ୱରୀ ଦରହ କ’ଣ?',
        hi: 'ताम्रपत्रों में सुवर्णपुर को ‘पश्चिम लंका’ क्यों कहा गया है और माँ लंकेश्वरी शिला का महत्व क्या है?',
        en: 'Why do medieval copper plates call Sonepur Paschima-Lanka, and what is the Lankeswari river rock shrine?',
      },
      {
        or: 'ପାତାଳୀ ଶ୍ରୀକ୍ଷେତ୍ର (କୋଟସମଲାଇ) ଗୁମ୍ଫାରେ ମହାପ୍ରଭୁ ଜଗନ୍ନାଥ ୧୪୪ ବର୍ଷ କିପରି ଗୁପ୍ତ ଥିଲେ?',
        hi: 'पाताली श्रीक्षेत्र (कोटसमलाई) की गुफा में महाप्रभु जगन्नाथ 144 वर्षों तक गुप्त रूप से कैसे रहे?',
        en: 'How were the Puri Jagannath deities hidden for 144 years at Patali Srikhetra in Subarnapur?',
      },
      {
        or: 'ସନ୍ଥକବି ଭୀମ ଭୋଇଙ୍କ ଖଲିଆପାଲି ସମାଧି ଓ ସୁବର୍ଣ୍ଣପୁରୀ ବୋମକାଇ ପାଟର ବିଶେଷତା କ’ଣ?',
        hi: 'संतकवि भीम भोई की खलियापाली समाधि और सोनपुर बोमकाई रेशम बुनाई की विशेषता क्या है?',
        en: 'What is the cultural legacy of Bhima Bhoi’s Khaliapali Peetha and Sonepur Bomkai silk?',
      },
    ],
  },

  'story-balasore-chandipur': {
    id: 'story-balasore-chandipur',
    placeName: {
      en: 'Raibania Colossal Fort, Panchalingeswar & Maritime Balasore',
      or: 'ରାଇବଣିଆ ମହାଦୁର୍ଗ, ପଞ୍ଚଲିଙ୍ଗେଶ୍ୱର ଓ ପ୍ରାଚୀନ ବନ୍ଦର ବାଲେଶ୍ୱର',
      hi: 'राइबनिया महादुर्ग, पंचलिंगेश्वर एवं प्राचीन समुद्री बंदरगाह बालेश्वर',
    },
    narratorName: {
      en: 'Fakir Mohan Senapati Literary-Historical Chronicler',
      or: 'ବ୍ୟାସକବି ପରମ୍ପରାର ବାଲେଶ୍ୱର ଐତିହାସିକ କଥାକାର',
      hi: 'व्यासकवि फकीर मोहन सेनापति परंपरा के बालेश्वर इतिहासकार',
    },
    voicePersonaTitle: {
      en: 'Northern Frontier Fort Strategist & Maritime Historian',
      or: 'ଉତ୍ତର କଳିଙ୍ଗ ସୀମାନ୍ତ ଦୁର୍ଗ ଓ ବନ୍ଦର ଗବେଷକ',
      hi: 'उत्तरी कलिंग सीमांत दुर्ग व समुद्री व्यापार इतिहासकार',
    },
    geminiVoiceName: 'Puck',
    voiceStylePrompt: {
      en: 'Witty, vivid literary chronicler describing receding seas, frontier laterite fortresses, and European trade ports',
      or: 'ଜୀବନ୍ତ, ସାହିତ୍ୟିକ ଓ ଓଜସ୍ୱୀ ବାଲେଶ୍ୱରୀ-ଓଡ଼ିଆ ଐତିହାସିକଙ୍କ ସ୍ୱର',
      hi: 'जीवंत, साहित्यिक और प्रभावशाली बालेश्वर इतिहासकार की स्पष्ट हिन्दी आवाज़',
    },
    acousticPreset: 'fortress-rampart',
    timbreDescription: 'Literary baritone-tenor echoing Chandipur’s vanishing tide and Raibania’s laterite bastions (Puck • G2/C3).',
    basePitch: 0.97,
    rateMultiplier: 1.03,
    droneRootFreqs: [98.0, 130.81, 196.0, 261.63],
    preferredVoiceGender: 'male',
    culturalGreeting: {
      or: 'ନମସ୍କାର! ବ୍ୟାସକବି ଫକୀରମୋହନଙ୍କ ଜନ୍ମମାଟି, ରାଇବଣିଆ ଦୁର୍ଗ ଓ ଚାନ୍ଦିପୁର ବେଳାଭୂମିରୁ ସ୍ୱାଗତ।',
      hi: 'नमस्कार! व्यासकवि फकीर मोहन सेनापति की जन्मभूमि, राइबनिया दुर्ग और चांदीपुर तट से स्वागत है।',
      en: 'Namaskar from Balasore—land of Fakir Mohan Senapati, Raibania Fort, and Chandipur’s vanishing sea!',
    },
    curatedQuestions: [
      {
        or: 'ଲାଙ୍ଗୁଳା ନରସିଂହଦେବଙ୍କ ଦ୍ୱାରା ନିର୍ମିତ ପୂର୍ବ ଭାରତର ବୃହତ୍ତମ ‘ରାଇବଣିଆ ଦୁର୍ଗ’ର ଇତିହାସ କ’ଣ?',
        hi: 'लांगुला नरसिंहदेव द्वारा निर्मित पूर्वी भारत के विशालतम ‘राइबनिया किले’ का सैन्य इतिहास क्या है?',
        en: 'How did Raibania Fort guard Kalinga’s northern frontier as Eastern India’s largest medieval fort complex?',
      },
      {
        or: 'ଚାନ୍ଦିପୁର ସମୁଦ୍ର ଦିନକୁ ଦୁଇଥର ୫ କିଲୋମିଟର ପଛକୁ କାହିଁକି ଘୁଞ୍ଚିଯାଏ?',
        hi: 'चांदीपुर का समुद्र प्रतिदिन दो बार 5 किलोमीटर पीछे क्यों हट जाता है?',
        en: 'What geological phenomenon causes the Bay of Bengal at Chandipur to recede 5 kilometers twice daily?',
      },
      {
        or: '୧୭ଶ ଶତାବ୍ଦୀରେ ବାଲେଶ୍ୱରରେ ଡଚ୍, ଫରାସୀ, ଡେନିସ୍ ଓ ଇଂରେଜ ବାଣିଜ୍ୟ କୋଠି ଏବଂ ଫକୀରମୋହନଙ୍କ ଅବଦାନ କ’ଣ?',
        hi: '17वीं शताब्दी में बालेश्वर के यूरोपीय बंदरगाहों और फकीर मोहन सेनापति द्वारा ओड़िया भाषा रक्षा का इतिहास क्या है?',
        en: 'How did 17th-century European maritime factories and Fakir Mohan Senapati shape modern Odisha?',
      },
    ],
  },

  'story-sunabeda-koraput-sabara': {
    id: 'story-sunabeda-koraput-sabara',
    placeName: {
      en: 'Sabara Srikhetra, Nandapur 32-Step Throne & Duduma Falls',
      or: 'ଶବର ଶ୍ରୀକ୍ଷେତ୍ର କୋରାପୁଟ, ନନ୍ଦପୁର ବତିଶ ସିଂହାସନ ଓ ଦୁଦୁମା ଜଳପ୍ରପାତ',
      hi: 'शबर श्रीक्षेत्र कोरापुट, नंदपुर बत्तीस सिंहासन एवं दुदुमा जलप्रपात',
    },
    narratorName: {
      en: 'Sabara Elder & Nandapur Silavamsi Chronicler',
      or: 'ଶବର କୁଳବୃଦ୍ଧ ଓ ନନ୍ଦପୁର ଶିଳବଂଶୀ ଐତିହାସିକ',
      hi: 'शबर कुलवृद्ध एवं नंदपुर शिलवंशी इतिहासकार',
    },
    voicePersonaTitle: {
      en: 'Egalitarian Jagannath Guardian & Machkund Historian',
      or: 'ଆଦିବାସୀ ଜଗନ୍ନାଥ ସଂସ୍କୃତି ଓ ନନ୍ଦପୁର ରାଜଧାନୀ ଗବେଷକ',
      hi: 'जनजातीय जगन्नाथ संस्कृति व नंदपुर राजधानी शोधकर्ता',
    },
    geminiVoiceName: 'Kore',
    voiceStylePrompt: {
      en: 'Warm, inclusive, dignified indigenous matriarch voice celebrating Sabara devotion and waterfall grandeur',
      or: 'ଆତ୍ମୀୟତାପୂର୍ଣ୍ଣ, ସରଳ ଓ ଶ୍ରଦ୍ଧାମୟ ଶବର ଶ୍ରୀକ୍ଷେତ୍ରର ଓଡ଼ିଆ ନାରୀ କণ্ଠସ୍ୱର',
      hi: 'आत्मीयतापूर्ण, सरल और श्रद्धामय शबर श्रीक्षेत्र की मधुर हिन्दी आवाज़',
    },
    acousticPreset: 'highland-mist',
    timbreDescription: 'Warm, inclusive matriarchal voice resonating with Duduma’s 175m cascade and Sabara hymns (Kore • E3/B3).',
    basePitch: 1.05,
    rateMultiplier: 0.97,
    droneRootFreqs: [164.81, 246.94, 329.63, 493.88],
    preferredVoiceGender: 'female',
    culturalGreeting: {
      or: 'ଜୟ ଶବର ନୀଳମାଧବ! କୋରାପୁଟର ଶବର ଶ୍ରୀକ୍ଷେତ୍ର, ନନ୍ଦପୁର ସିଂହାସନ ଓ ଦୁଦୁମା ତୀରରୁ ସ୍ୱାଗତ।',
      hi: 'जय शबर नीलमाधव! कोरापुट के शबर श्रीक्षेत्र, नंदपुर बत्तीस सिंहासन और दुदुमा से स्वागत है।',
      en: 'Jaya Sabara Nilamadhava! Welcome to Sabara Srikhetra, Nandapur’s 32-Step Throne, and Duduma!',
    },
    curatedQuestions: [
      {
        or: 'କୋରାପୁଟର ‘ଶବର ଶ୍ରୀକ୍ଷେତ୍ର’ରେ ଜାତି-ଧର୍ମ ନିର୍ବିଶେଷରେ ସମସ୍ତେ କିପରି ମନ୍ଦିର ପ୍ରବେଶ ଓ ପୂଜା କରନ୍ତି?',
        hi: 'कोरापुट के ‘शबर श्रीक्षेत्र’ में बिना किसी भेदभाव के सर्वधर्म प्रवेश और आदिवासी परंपरा कैसे जीवित है?',
        en: 'How does Sabara Srikhetra honor the primordial tribal Sabara origin of Lord Jagannath with universal entry?',
      },
      {
        or: 'ନନ୍ଦପୁରର ପ୍ରାଚୀନ ‘ବତିଶ ସିଂହାସନ’ (୩୨ ପାହାଚ) ଓ ଜୟପୁର ରାଜ୍ୟର ପୂର୍ବତନ ରାଜଧାନୀ ଇତିହାସ କ’ଣ?',
        hi: 'नंदपुर के प्राचीन ‘बत्तीस सिंहासन’ और शिलवंशी-सूर्यवंशी राजधानी का इतिहास क्या है?',
        en: 'What is the history of the 32-step Batisa Simhasana at Nandapur, ancient capital before Jeypore?',
      },
      {
        or: '୫୭୪ ଫୁଟ ଉଚ୍ଚ ଦୁଦୁମା ଜଳପ୍ରପାତ (ମତ୍ସ୍ୟତୀର୍ଥ) ଏବଂ ବଣ୍ଡା ଜନଜାତିଙ୍କ ପରମ୍ପରା କ’ଣ?',
        hi: '574 फीट ऊंचे दुदुमा जलप्रपात (मत्स्यतीर्थ) और प्राचीन बोंडा जनजाति की विरासत क्या है?',
        en: 'What is the legend of Matsya Tirtha at 175m Duduma Falls and the ancient Austroasiatic Bonda highlanders?',
      },
    ],
  },
};

export function getMonumentVoiceProfile(storyId: string): MonumentVoiceProfile {
  return MONUMENT_VOICE_PROFILES[storyId] || MONUMENT_VOICE_PROFILES['story-konark'];
}
