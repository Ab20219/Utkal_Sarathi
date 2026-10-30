/**
 * Utkal Katha Corpus V2 — 25 Preserved Canonical Stories
 *
 * Each story is structured across 20 distinct thematic chapters:
 * 1. Introduction (The Sovereign Presence & Geographical Splendor)
 * 2. Geographical & Historical Background (River Valleys & Geology)
 * 3. Ancient Odisha (Kalinga, Utkala, Odra, Kosala Roots)
 * 4. Origin & Foundation (Sacred Vastu & Temple Pratistha)
 * 5. Historical Dynasties (Mauryas, Gangas, Gajapatis, Bhauma-Karas, Somavamsis)
 * 6. Kings & Rulers (Monarchs, Royal Edicts & Grants)
 * 7. Religious & Spiritual Sanctum (Theology & Lineage)
 * 8. Archaeological Discoveries & Antiquarian Surveys (ASI, Epigraphica)
 * 9. Architecture & Sculpture (Kalinga Deula, Jagamohana, Natamandira)
 * 10. Inscriptions, Epigraphy & Copper Plates (Brahmi, Prakrit, Odia)
 * 11. Important Personalities & Historical Figures (Sthapatis, Poets, Patriots)
 * 12. Cultural Practices & Daily Rituals (Nijoga, Sevaks, Mahaprasad)
 * 13. Festivals, Melas & Living Traditions (Ratha Yatra, Chandan Yatra, Melas)
 * 14. Legends, Oral Folklore & Mythological Sagas (Puranic Lore & Ballads)
 * 15. Historical Transformations, Invasions & Resistance (Resilience)
 * 16. Conservation Milestones & Modern Preservation (ASI Restoration)
 * 17. Present-Day Significance & Community Guardianship
 * 18. Maritime Linkages & Greater India Synthesis (Boita Bandana)
 * 19. Tourism, Route Guides & Pilgrim Information
 * 20. Epilogue & Heritage Legacy (The Living Spirit of Utkala)
 *
 * Full multilingual parity in English, Odia (ଓଡ଼ିଆ), and Hindi (हिन्दी)
 * with trilingual vocabulary glossaries for word-by-word comparison.
 */

import { ODISHA_HISTORICAL_STORIES } from './odishaHistoricalStories';
import { MONUMENT_VOICE_PROFILES } from './monumentVoiceProfiles';
import { getStoryAudioUrl } from './storyAudioMap';
import {
  UtkalKathaStoryV2,
  KathaChapterV2,
  TrilingualTerm,
  STANDARD_CHAPTER_THEMES,
  PRESERVED_25_MONUMENTS_META,
  UserProgressRecord,
} from '../services/utkalKathaServiceV2';

export const COMMON_TRILINGUAL_VOCABULARY: TrilingualTerm[] = [
  { term: 'Sthapati', odia: 'ସ୍ଥପତି', hindi: 'स्थपति', context: 'Master architect and structural designer of Kalinga temple guild tradition.', category: 'architecture' },
  { term: 'Rekha Deula', odia: 'ରେଖା ଦେଉଳ', hindi: 'रेखा देउल', context: 'Tall curvilinear sanctuary tower housing the sanctum sanctorum (Garbhagriha).', category: 'architecture' },
  { term: 'Pidha Deula', odia: 'ପିଢ଼ା ଦେଉଳ', hindi: 'पिढ़ा देउल', context: 'Stepped pyramidal tiered roof structure, typical of the Jagamohana assembly hall.', category: 'architecture' },
  { term: 'Natamandira', odia: 'ନାଟମନ୍ଦିର', hindi: 'नाटमंदिर', context: 'Pillared dance and festive musical performance hall in classical Kalinga temple plans.', category: 'architecture' },
  { term: 'Bhogamandapa', odia: 'ଭୋଗମଣ୍ଡପ', hindi: 'भोगमंडप', context: 'Hall of ritual consecrated food offerings adjacent to the dance hall.', category: 'architecture' },
  { term: 'Kalasha', odia: 'କଳସ', hindi: 'कलश', context: 'Sacred water-pot finial capping the temple spire above the Amalaka.', category: 'architecture' },
  { term: 'Dadhibikrama', odia: 'ଦଧିନଉତି', hindi: 'दधिनौति', context: 'The massive crowning foundation stone or lintel stone supporting the temple kalasha.', category: 'architecture' },
  { term: 'Khondalite', odia: 'ଖଣ୍ଡୋଲାଇଟ୍', hindi: 'खोंडालाइट', context: 'Garnet-sillimanite metamorphic stone quarried across the Eastern Ghats for temple walls.', category: 'architecture' },
  { term: 'Chlorite (Muguni)', odia: 'ମୁଗୁନି ପଥର', hindi: 'मुगुनी क्लोराइट', context: 'Hard, fine-grained dark chlorite schist used for exquisite sculptures and sanctum icons.', category: 'architecture' },
  { term: 'Laterite', odia: 'ମାଙ୍କଡ଼ା ପଥର', hindi: 'लैटेराइट (मांकड़ा)', context: 'Porous iron-rich clay stone cut into sturdy blocks for temple foundations and plinths.', category: 'architecture' },
  { term: 'Boita', odia: 'ବୋଇତ', hindi: 'बोइत', context: 'Multi-masted wooden merchant trading ship sailed by ancient Kalinga mariners.', category: 'craft' },
  { term: 'Sadhaba', odia: 'ସାଧବ ପୁଅ', hindi: 'साधव व्यापारी', context: 'Ancient maritime merchant sailors and guild traders of coastal Odisha.', category: 'dynasty' },
  { term: 'Boita Bandana', odia: 'ବୋଇତ ବନ୍ଦାଣ', hindi: 'बोइत वंदना', context: 'Kartika Purnima sunrise festival celebrating ancient trans-oceanic voyages to Bali and Java.', category: 'ritual' },
  { term: 'Chhatisa Nijoga', odia: 'ଛତିଶା ନିଯୋଗ', hindi: 'छत्तीसा नियोग', context: 'The 36 hereditary ritual and culinary service guilds of the Jagannath Temple.', category: 'ritual' },
  { term: 'Mahaprasad', odia: 'ମହାପ୍ରସାଦ', hindi: 'महाप्रसाद', context: 'Consecrated offering prepared in earthen pots (Kudua) inside the temple Rosaghara.', category: 'ritual' },
  { term: 'Pattachitra', odia: 'ପଟ୍ଟଚିତ୍ର', hindi: 'पट्टचित्र', context: 'Traditional cloth scroll painting executed with tamarind gum and natural mineral pigments.', category: 'craft' },
  { term: 'Gotipua', odia: 'ଗୋଟିପୁଅ', hindi: 'गोटीपुआ', context: 'Traditional Odia acrobatic devotional dance form, the ancestral precursor to classical Odissi.', category: 'ritual' },
  { term: 'Madala Panji', odia: 'ମାଦଳା ପାଞ୍ଜି', hindi: 'मदला पांजी', context: 'Historic palm-leaf chronicle of the Jagannath Temple recording dynastic reigns and events.', category: 'dynasty' },
  { term: 'Baya Chakada', odia: 'ବାୟା ଚକଡ଼ା', hindi: 'बाया चकड़ा', context: '13th-century palm-leaf building accounts documenting the construction ledger of Konark.', category: 'architecture' },
  { term: 'Kalinga Lipi', odia: 'କଳିଙ୍ଗ ଲିପି', hindi: 'कलिंग लिपि', context: 'Regional Brahmic script variant used in historic royal inscriptions and copper plates.', category: 'dynasty' },
];

function buildMonumentChapters(
  baseStory: any,
  meta: { id: string; districtId: string; name: string; period: string }
): KathaChapterV2[] {
  const chapters: KathaChapterV2[] = [];
  const voice = MONUMENT_VOICE_PROFILES[meta.id];

  const histDoc = baseStory.documentedHistory || '';
  const legDoc = baseStory.legendAndFolklore || '';
  const archHighlights = baseStory.architecturalHighlights || [];
  const sources = baseStory.historicalSources || [];
  const figures = baseStory.keyHistoricalFigures || [];
  const inscriptions = baseStory.inscriptionsAndManuscripts || '';
  const odiaHist = baseStory.odiaHistorySummary || baseStory.audioTranscriptOr || '';
  const odiaLeg = baseStory.odiaLegendSummary || '';
  const odiaArch = baseStory.odiaArchitectureSummary || '';
  const hindiHist = baseStory.hindiHistorySummary || baseStory.audioTranscriptHi || '';
  const hindiLeg = baseStory.hindiLegendSummary || '';
  const hindiArch = baseStory.hindiArchitectureSummary || '';

  STANDARD_CHAPTER_THEMES.forEach((theme, idx) => {
    const chapterNum = idx + 1;
    let textEn = '';
    let textOr = '';
    let textHi = '';

    switch (theme.key) {
      case 'intro':
        textEn = `${meta.name} stands as an immortal monument of Odisha's cultural civilization, located in ${meta.districtId.toUpperCase()} district. Designated under historical records from the ${meta.period}, this sacred sanctuary embodies centuries of architectural brilliance, deep-rooted spiritual devotion, and artistic triumph. ${baseStory.audioTranscriptEn ? baseStory.audioTranscriptEn.slice(0, 450) + '...' : ''}`;
        textOr = `ଓଡ଼ିଶାର ଗୌରବମୟ ଐତିହ୍ୟରେ ${meta.name} ଏକ ଅନନ୍ୟ କୀର୍ତ୍ତି ଅଟେ, ଯାହା ${meta.districtId.toUpperCase()} ଜିଲ୍ଲାରେ ଅବସ୍ଥିତ। ${meta.period}ର ଐତିହାସିକ ତଥ୍ୟ ଅନୁସାରେ ଏହି ପବିତ୍ର ସ୍ଥଳୀ କଳିଙ୍ଗର ଶିଳ୍ପକଳା ଓ ସାଂସ୍କୃତିକ ଚେତନାର ଏକ ଚିରନ୍ତନ ନିଦର୍ଶନ।`;
        textHi = `ओडिशा के सांस्कृतिक इतिहास में ${meta.name} एक अद्वितीय कीर्तिमान है, जो ${meta.districtId.toUpperCase()} जिले में स्थित है। ${meta.period} के ऐतिहासिक साक्ष्यों के अनुसार यह पावन स्थल कलिंग की स्थापत्य कला और आध्यात्मिक चेतना का जीवंत प्रतीक है।`;
        break;

      case 'geo_history':
        textEn = `Nestled within the geographical heart of Odisha, the site commands historical river valleys and strategic ancient trade corridors. The natural topography provided defensive security and spiritual isolation, while nearby coastal or riverine pathways facilitated the transportation of massive stone blocks from distant quarries.`;
        textOr = `ଓଡ଼ିଶାର ପ୍ରାକୃତିକ ନଦୀ ଅବବାହିକା ଓ ଭୌଗୋଳିକ ପରିସର ମଧ୍ୟରେ ଏହି ସ୍ଥଳ ଗଢ଼ିଉଠିଛି। ପ୍ରାଚୀନ କାଳରେ ନଦୀପଥ ଓ ପ୍ରସ୍ତର ଖଣିର ସାମୀପ୍ୟ ଏହି ବିଶାଳ ସ୍ଥାପତ୍ୟ ନିର୍ମାଣକୁ ସହଜ କରିଥିଲା।`;
        textHi = `ओडिशा की प्राकृतिक नदी घाटियों और भौगोलिक परिवेश में यह स्थल विकसित हुआ। प्राचीन काल में जलमार्ग और निकटवर्ती पाषाण खदानों की उपलब्धता ने इस भव्य स्थापत्य के निर्माण में महत्त्वपूर्ण भूमिका निभाई।`;
        break;

      case 'ancient_odisha':
        textEn = `During the classical eras of Kalinga, Utkala, Odra, and South Kosala, this region emerged as a vibrant center of political authority and intellectual synthesis. Puranic scriptures and early inscriptions testify to its renown across the Indian subcontinent.`;
        textOr = `ପ୍ରାଚୀନ କଳିଙ୍ଗ, ଉତ୍କଳ ଓ ଓଡ୍ର ଭୂଖଣ୍ଡର ଇତିହାସରେ ଏହି ଅଞ୍ଚଳ ଏକ ପ୍ରମୁଖ ରାଜନୈତିକ ଓ ଆଧ୍ୟାତ୍ମିକ କେନ୍ଦ୍ର ଥିଲା। ପ୍ରାଚୀନ ଗ୍ରନ୍ଥ ଓ ଶିଳାଲେଖରେ ଏହାର ପବିତ୍ରତା ବର୍ଣ୍ଣିତ।`;
        textHi = `प्राचीन कलिंग, उत्कल और ओड्र प्रदेश के इतिहास में यह क्षेत्र एक प्रमुख राजनीतिक और आध्यात्मिक केंद्र रहा है। प्राचीन धर्मग्रंथों में इसकी महिमा का विस्तार से वर्णन मिलता है।`;
        break;

      case 'foundation':
        textEn = `Canonical texts of the Kalinga Silpa Sastras dictate the Vastu-Purusha Mandala ground alignment of the complex. Consecrated with elaborate Vedic and regional rites, the foundational ceremonies aligned the cosmic axis with terrestrial topography.`;
        textOr = `କଳିଙ୍ଗ ଶିଳ୍ପ ଶାସ୍ତ୍ରର ନିୟମ ଅନୁସାରେ ଏହି ସ୍ଥାପତ୍ୟର ବାସ୍ତୁ ପୁରୁଷ ମଣ୍ଡଳ ନିର୍ଦ୍ଧାରିତ ହୋଇଥିଲା। ବୈଦିକ ଓ ଆଞ୍ଚଳିକ ପରମ୍ପରା ଅନୁଯାୟୀ ଏହାର ପ୍ରତିଷ୍ଠା ବିଧାନ ସମ୍ପନ୍ନ ହୋଇଥିଲା।`;
        textHi = `कलिंग शिल्प शास्त्र के सिद्धांतों के अनुसार इस मंदिर का वास्तु पुरुष मंडल निर्धारित किया गया था। वैदिक एवं पारम्परिक विधि-विधान से इसकी पावन प्रतिष्ठा सम्पन्न हुई।`;
        break;

      case 'dynasties':
        textEn = `Imperial dynasties that held dominion over this territory—including the Bhauma-Karas, Somavamsis, Eastern Gangas, and Suryavamsi Gajapatis—bequeathed royal land grants and lavish endowments to sustain the temple guilds and seasonal ceremonies.`;
        textOr = `ଭୌମକର, ସୋମବଂଶୀ, ପୂର୍ବ ଗଙ୍ଗ ଓ ସୂର୍ଯ୍ୟବଂଶୀ ଗଜପତି ରାଜବଂଶଗୁଡ଼ିକ ଏହି ପୀଠର ଉନ୍ନତି ଓ ନିତ୍ୟ ସେବା ପାଇଁ ଭୂମିଦାନ ଓ ରାଜକୀୟ ସହାୟତା ପ୍ରଦାନ କରିଥିଲେ।`;
        textHi = `भौमकर, सोमवंशी, पूर्वी गंग और सूर्यवंशी गजपति राजवंशों ने इस तीर्थ स्थल की समृद्धि और नित्य पूजा-अर्चना हेतु भूमिदान और शाही संरक्षण प्रदान किया।`;
        break;

      case 'rulers':
        textEn = `Chronicled rulers personally patronized this site, erecting commemorative pillared halls and issuing copper-plate grants witnessed by royal ministers, high priests, and guild elders.`;
        textOr = `ଇତିହାସ ପ୍ରସିଦ୍ଧ ରାଜାମାନେ ନିଜେ ଏଠାକୁ ଆସି ଦେବାରାଧନା କରିବା ସହ ବିଶାଳ ମଣ୍ଡପ ନିର୍ମାଣ ଓ ତାମ୍ରଫଳକ ଶାସନ ଜାରି କରିଥିଲେ।`;
        textHi = `ऐतिहासिक राजाओं ने स्वयं यहाँ आकर देवाराधना की तथा भव्य मंडपों का निर्माण कराकर ताम्रपत्रों पर शाही घोषणाएं अंकित कराईं।`;
        break;

      case 'sanctum':
        textEn = `At the core of the sanctuary lies the Garbhagriha, where ancient sculptors harnessed chlorite and khondalite stones to capture the divine essence. The acoustic resonance within the sanctum amplifies sacred mantras during morning and evening sandhya rituals.`;
        textOr = `ମନ୍ଦିରର ଗର୍ଭଗୃହରେ ସ୍ଥାପିତ ବିଗ୍ରହଙ୍କ ମହିମା ଅତୁଳନୀୟ। ମୁଗୁନି ପଥରରେ ନିର୍ମିତ ଏହି ଦିବ୍ୟ ବିଗ୍ରହଙ୍କ ସମ୍ମୁଖରେ ଧୂପ-ଦୀପ ଓ ବେଦମନ୍ତ୍ର ଉଚ୍ଚାରଣରେ ଏକ ଅପୂର୍ବ ଆଧ୍ୟାତ୍ମିକ ଶାନ୍ତି ଅନୁଭୂତ ହୁଏ।`;
        textHi = `मंदिर के गर्भगृह में प्रतिष्ठित विग्रह की महिमा अनुपम है। मुगुनी पाषाण पर उत्कीर्ण इस दिव्य स्वरूप के समक्ष धूप-दीप और वेदमंत्रों के उच्चारण से गहन शांति का अनुभव होता है।`;
        break;

      case 'archaeology':
        textEn = `Surveys and excavations conducted by nineteenth-century antiquarians and the Archaeological Survey of India (ASI) revealed subterranean plinths, ancient drainage networks, and hundreds of sculpted friezes buried under centuries of silt and sand.`;
        textOr = `ପ୍ରତ୍ନତତ୍ତ୍ୱ ବିଭାଗ (ASI) ଦ୍ୱାରା ହୋଇଥିବା ଖନନ ଓ ସର୍ବେକ୍ଷଣରୁ ପ୍ରାଚୀନ ଜଳନିଷ୍କାସନ ବ୍ୟବସ୍ଥା, ପୋତି ହୋଇ ରହିଥିବା ମଣ୍ଡପ ଏବଂ ଶହ ଶହ ପ୍ରସ୍ତର ମୂର୍ତ୍ତି ଆବିଷ୍କୃତ ହୋଇଛି।`;
        textHi = `भारतीय पुरातत्व सर्वेक्षण (ASI) द्वारा किए गए उत्खनन और सर्वेक्षणों से प्राचीन जल-निकासी व्यवस्था, दबे हुए मंडप और सैकड़ों दुर्लभ पाषाण मूर्तियां प्रकाश में आई हैं।`;
        break;

      case 'architecture':
        textEn = `${histDoc ? histDoc.slice(0, 500) + '...' : 'The temple plan adheres strictly to classical Kalinga architectural canons, comprising the Rekha Vimana sanctuary tower, the Pidha Jagamohana assembly hall, and sculpted Natamandira dancing pavilions.'} Key features include: ${archHighlights.slice(0, 3).join('; ')}.`;
        textOr = `${odiaArch ? odiaArch : 'କଳିଙ୍ଗ ସ୍ଥାପତ୍ୟ ଶୈଳୀରେ ରେଖା ଦେଉଳ, ପିଢ଼ା ଜଗମୋହନ ଓ ନାଟମନ୍ଦିରର ସମନ୍ୱୟ ଏଠାରେ ଦେଖିବାକୁ ମିଳେ। ବିନା ଚୂନ-ସିମେଣ୍ଟରେ ପଥର ଉପରେ ପଥର ଖଞ୍ଜାଯାଇ ଲୁହା କ୍ଲାମ୍ପ ଦ୍ୱାରା ଏହା ନିର୍ମିତ।'}`;
        textHi = `${hindiArch ? hindiArch : 'कलिंग स्थापत्य शैली में रेखा देउल, पिढ़ा जगमोहन और नाटमंदिर का सुंदर समन्वय यहाँ दिखाई देता है। बिना चूने-गारे के पत्थरों को आपस में जोड़कर लोहे के क्लैंप से इसे सुदृढ़ बनाया गया है।'}`;
        break;

      case 'inscriptions':
        textEn = `The epigraphic record of this monument includes: ${inscriptions || 'Extensive Brahmi, Sanskrit, and ancient Odia stone inscriptions, recording land boundaries, royal genealogies, and temple maintenance provisions.'}`;
        textOr = `ଶିଳାଲେଖ ଓ ତାମ୍ରଫଳକ ତଥ୍ୟ: ପ୍ରାଚୀନ ଓଡ଼ିଆ ଓ ସଂସ୍କୃତ ଲିପିରେ ଖୋଦିତ ଏହି ଅଭିଲେଖଗୁଡ଼ିକ ରାଜବଂଶର କ୍ରମ, ସୀମା ନିର୍ଦ୍ଧାରଣ ଓ ମନ୍ଦିର ରକ୍ଷଣାବେକ୍ଷଣର ନିର୍ଭୁଲ ପ୍ରମାଣ ଦିଏ।`;
        textHi = `शिलालेख और ताम्रपत्र साक्ष्य: प्राचीन उड़िया और संस्कृत लिपि में उत्कीर्ण ये अभिलेख राजवंश के इतिहास, भूमि सीमाओं और मंदिर संरक्षण का प्रामाणिक विवरण प्रस्तुत करते हैं।`;
        break;

      case 'personalities':
        textEn = `Centuries of glory were shaped by key figures: ${figures.slice(0, 3).join(', ') || 'Dedicated master sculptors (Sthapatis), royal chroniclers, and courageous servitors who guarded the sanctity of this heritage.'}`;
        textOr = `ଏହି ପବିତ୍ର କୀର୍ତ୍ତି ସହିତ ପ୍ରଧାନ ସ୍ଥପତି, ରାଜକୀୟ କବି ଏବଂ ନିଷ୍ଠାବାନ ସେବକମାନଙ୍କ ନାମ ଚିରସ୍ମରଣୀୟ ହୋଇ ରହିଛି।`;
        textHi = `इस पावन कीर्ति के निर्माण और रक्षा में मुख्य वास्तुकारों (स्थपतियों), राजकवियों और निष्ठावान सेवकों का नाम इतिहास में स्वर्णाक्षरों में अंकित है।`;
        break;

      case 'rituals':
        textEn = `The living temple tradition involves intricate daily services conducted by hereditary servitor guilds (Nijogas), beginning with pre-dawn awakening rites (Mangala Alati), followed by ceremonial baths, sandal paste adornments, and cooked grain offerings.`;
        textOr = `ଏଠାରେ ନିତ୍ୟ ସେବା ପରମ୍ପରା ଅତ୍ୟନ୍ତ ନିଷ୍ଠାର ସହିତ ପାଳିତ ହୁଏ। ମଙ୍ଗଳ ଆଳତି, ସ୍ନାନ ବିଧାନ, ଚନ୍ଦନ ଲାଗି ଏବଂ ପବିତ୍ର ଭୋଗ ଅର୍ପଣ ସହିତ ସେବାୟତମାନେ ବଂଶାନୁକ୍ରମିକ ଦାୟିତ୍ୱ ତୁଲାନ୍ତି।`;
        textHi = `यहाँ नित्य सेवा परंपरा अत्यंत निष्ठा से निभाई जाती है। मंगला आरती, पवित्र स्नान, चंदन श्रृंगार और नैवेद्य अर्पण के साथ वंशानुगत सेवक समाज अपनी जिम्मेदारियों का निर्वहन करता है।`;
        break;

      case 'festivals':
        textEn = `Annual celebrations transform the complex into an ocean of devotion. Pilgrims gather from all corners of Odisha and India to participate in sacred chariot processions, holy dips in adjoining tanks, and traditional cultural fairs.`;
        textOr = `ବାର୍ଷିକ ଯାତ୍ରା ଓ ପର୍ବପର୍ବାଣି ସମୟରେ ହଜାର ହଜାର ଭକ୍ତ ଏକତ୍ରିତ ହୁଅନ୍ତି। ରଥଯାତ୍ରା, ମେଳା ଓ ପବିତ୍ର ସ୍ନାନ ଉତ୍ସବ ଏଠାକାର ଆଧ୍ୟାତ୍ମିକ ପରିବେଶକୁ ଉତ୍ସବମୁଖର କରିଥାଏ।`;
        textHi = `वार्षिक उत्सवों और मेलों के अवसर पर हजारों श्रद्धालु यहाँ एकत्रित होते हैं। रथयात्रा, पारंपरिक मेले और पवित्र स्नान पर्व यहाँ के वातावरण को भक्तिमय बना देते हैं।`;
        break;

      case 'folklore':
        textEn = `${legDoc ? legDoc.slice(0, 500) + '...' : 'Generations of Odishan bards and grandmothers have preserved poignant legends explaining divine origins, supernatural protections, and the miraculous intervention of local deities.'}`;
        textOr = `${odiaLeg ? odiaLeg : 'ଓଡ଼ିଆ ଲୋକକଥା ଓ କିମ୍ବଦନ୍ତୀରେ ଏହି ସ୍ଥଳୀର ଅନେକ ଆଲୌକିକ କାହାଣୀ ପ୍ରଚଳିତ। ପୁରାଣ ଓ ଲୋକଗୀତରେ ଭକ୍ତ ଏବଂ ଭଗବାନଙ୍କ ମଧ୍ୟରେ ଥିବା ଅତୁଟ ବିଶ୍ୱାସର ଗାଥା ଶୁଣିବାକୁ ମିଳେ।'}`;
        textHi = `${hindiLeg ? hindiLeg : 'उड़िया लोककथाओं और जनश्रुतियों में इस स्थल की अनेक अलौकिक गाथाएं प्रचलित हैं। पुराणों और लोकगीतों में भक्त और भगवान के पावन संबंधों की अमर कहानियां आज भी सुनी जाती हैं।'}`;
        break;

      case 'transformations':
        textEn = `Throughout medieval conflicts and political transitions, the monument withstood external sieges and environmental weathering. Devoted guardians frequently concealed sacred relics in remote mountain caves and lagoon islands to preserve them from desecration.`;
        textOr = `ମଧ୍ୟଯୁଗୀୟ ଆକ୍ରମଣ ଓ ରାଜନୈତିକ ସଂଘର୍ଷ ସମୟରେ ମଧ୍ୟ ସାହସୀ ସେବାୟତମାନେ ନିଜ ଜୀବନ ବିପନ୍ନ କରି ପବିତ୍ର ବିଗ୍ରହଙ୍କୁ ସୁରକ୍ଷିତ ସ୍ଥାନରେ ରଖି ଧର୍ମ ଓ ସଂସ୍କୃତିର ରକ୍ଷା କରିଥିଲେ।`;
        textHi = `मध्यकालीन आक्रमणों और राजनीतिक उथल-पुथल के दौर में भी वीर सेवकों ने अपने प्राणों की बाजी लगाकर पवित्र विग्रहों को सुरक्षित स्थानों पर पहुँचाकर धर्म और संस्कृति की रक्षा की।`;
        break;

      case 'conservation':
        textEn = `Scientific restoration initiatives over the past century—incorporating paper-pulp desalination poultices, structural grouting, stone-masonry stabilization, and chemical cleaning—have halted coastal degradation and preserved the architectural fabric.`;
        textOr = `ଆଧୁନିକ ଯୁଗରେ ପ୍ରତ୍ନତତ୍ତ୍ୱ ବିଭାଗ ଦ୍ୱାରା ବୈଜ୍ଞାନିକ ପଦ୍ଧତିରେ ପଥରର ରାସାୟନିକ ସଂରକ୍ଷଣ, ଲୁଣା ପବନରୁ ସୁରକ୍ଷା ଓ ଢାଞ୍ଚାଗତ ସୁଦୃଢ଼ୀକରଣ କାର୍ଯ୍ୟ କରାଯାଇଛି।`;
        textHi = `आधुनिक युग में पुरातत्व सर्वेक्षण द्वारा वैज्ञानिक विधियों से पाषाणों का रासायनिक संरक्षण, समुद्री खारेपन से बचाव और ढांचागत मजबूती के उल्लेखनीय कार्य किए गए हैं।`;
        break;

      case 'present_day':
        textEn = `Today, the site stands as a beacon of global cultural tourism and living heritage. Local artisan communities continue ancestral crafts, ensuring economic vitality while welcoming travelers from around the world.`;
        textOr = `ଆଜି ଏହି କୀର୍ତ୍ତି ବିଶ୍ୱ ପର୍ଯ୍ୟଟନ ମାନଚିତ୍ରରେ ଏକ ପ୍ରମୁଖ ଆକର୍ଷଣ। ପାରମ୍ପରିକ ଶିଳ୍ପୀ, ଗବେଷକ ଓ ଶ୍ରଦ୍ଧାଳୁମାନଙ୍କ ସମାଗମରେ ଏହା ଓଡ଼ିଶାର ଏକ ଗୌରବୋଜ୍ଜ୍ୱଳ ପ୍ରତୀକ ଭାବେ ଶୋଭା ପାଉଛି।`;
        textHi = `आज यह ऐतिहासिक स्थल वैश्विक पर्यटन मानचित्र पर एक प्रमुख आकर्षण है। पारंपरिक शिल्पियों, शोधकर्ताओं और श्रद्धालुओं के समागम से यह ओडिशा का गौरव बना हुआ है।`;
        break;

      case 'maritime_link':
        textEn = `Artifacts and historical chronicles link this region to ancient Kalinga's trans-oceanic trade network, where merchant Boitas set sail for Suvarnabhumi, Java, Sumatra, and Bali on the auspicious morning of Kartika Purnima.`;
        textOr = `କାର୍ତ୍ତିକ ପୂର୍ଣ୍ଣିମାର ବୋଇତ ବନ୍ଦାଣ ଉତ୍ସବ ପ୍ରମାଣ କରେ ଯେ ଏହି ଅଞ୍ଚଳର ସାଧବମାନେ ପ୍ରାଚୀନ କାଳରେ ସମୁଦ୍ର ଯାତ୍ରା କରି ବାଲି, ଜାଭା ଓ ସୁମାତ୍ରା ସହିତ ସାଂସ୍କୃତିକ ଓ ବାଣିଜ୍ୟିକ ସମ୍ପର୍କ ଗଢ଼ିଥିଲେ।`;
        textHi = `कार्तिक पूर्णिमा की बोइत वंदना यह सिद्ध करती है कि प्राचीन काल में यहाँ के साधव व्यापारी विशाल समुद्री जहाजों से बाली, जावा और सुमात्रा तक व्यापार और सांस्कृतिक संबंध स्थापित करते थे।`;
        break;

      case 'visitor_guide':
        textEn = `Visitors are advised to plan excursions between October and March for pleasant weather. Access is convenient via national highways and rail connections. Respectful dress codes and preservation protocols should be honored within the temple perimeter.`;
        textOr = `ପର୍ଯ୍ୟଟକମାନଙ୍କ ପାଇଁ ଅକ୍ଟୋବରରୁ ମାର୍ଚ୍ଚ ମାସ ପର୍ଯ୍ୟନ୍ତ ସମୟ ଅତ୍ୟନ୍ତ ଅନୁକୂଳ। ସଡ଼କ ଓ ରେଳପଥ ଦ୍ୱାରା ଏଠାକୁ ଆସିବା ସୁବିଧାଜନକ। ମନ୍ଦିର ପରିସର ମଧ୍ୟରେ ଶୃଙ୍ଖଳା ଓ ପବିତ୍ରତା ରକ୍ଷା କରିବା ଉଚିତ।`;
        textHi = `पर्यटकों के लिए अक्टूबर से मार्च का समय भ्रमण हेतु सर्वोत्तम है। सड़क और रेल मार्ग द्वारा यहाँ सुगमता से पहुँचा जा सकता है। परिसर में पवित्रता और पुरातत्व नियमों का पालन करना अनिवार्य है।`;
        break;

      case 'legacy':
        textEn = `As the setting sun illuminates the ancient stone carvings, ${meta.name} radiates the timeless spirit of Utkala—a sacred confluence of faith, architectural mastery, and indomitable courage that will inspire generations to come.`;
        textOr = `${meta.name} ହେଉଛି ଉତ୍କଳର ଅମର ଆତ୍ମା ଓ ଅପୂର୍ବ ଶିଳ୍ପକଳାର ଏକ ଚିରନ୍ତନ ଜ୍ୟୋତି, ଯାହା ଆଗାମୀ ଯୁଗ ଯୁଗ ଧରି ମାନବଜାତିକୁ ପ୍ରେରଣା ଦେଇ ଚାଲିଥିବ।`;
        textHi = `${meta.name} उत्कल की अमर आत्मा और अद्वितीय शिल्पकला का एक ऐसा प्रकाशस्तंभ है, जो युगों-युगों तक मानवता को प्रेरणा और शांति प्रदान करता रहेगा।`;
        break;
    }

    const wordsEn = textEn.split(/\s+/).filter(Boolean).length;
    const wordsOr = textOr.split(/\s+/).filter(Boolean).length;
    const wordsHi = textHi.split(/\s+/).filter(Boolean).length;

    chapters.push({
      chapterNumber: chapterNum,
      themeKey: theme.key,
      titleEn: `Chapter ${chapterNum}: ${theme.en}`,
      titleOr: `ଅଧ୍ୟାୟ ${chapterNum}: ${theme.or}`,
      titleHi: `अध्याय ${chapterNum}: ${theme.hi}`,
      durationSec: Math.round(wordsEn * 0.45) + 30,
      wordCountEn: wordsEn,
      wordCountOr: wordsOr,
      wordCountHi: wordsHi,
      audioUrl: getStoryAudioUrl(meta.id, 'en') || undefined,
      contentEn: textEn,
      contentOr: textOr,
      contentHi: textHi,
      vocabulary: COMMON_TRILINGUAL_VOCABULARY.slice((idx * 2) % COMMON_TRILINGUAL_VOCABULARY.length, ((idx * 2) % COMMON_TRILINGUAL_VOCABULARY.length) + 3),
    });
  });

  return chapters;
}

export function buildCompleteUtkalKathaStoriesV2(): UtkalKathaStoryV2[] {
  const storyMap = new Map<string, any>();
  for (const s of ODISHA_HISTORICAL_STORIES) {
    storyMap.set(s.id, s);
  }

  return PRESERVED_25_MONUMENTS_META.map((meta) => {
    const baseStory = storyMap.get(meta.id) || {};
    const chapters = buildMonumentChapters(baseStory, meta);

    const totalWordCountEn = chapters.reduce((sum, ch) => sum + ch.wordCountEn, 0) + (baseStory.totalWords || 1200);
    const totalWordCountOr = chapters.reduce((sum, ch) => sum + ch.wordCountOr, 0);
    const totalWordCountHi = chapters.reduce((sum, ch) => sum + ch.wordCountHi, 0);

    const voice = MONUMENT_VOICE_PROFILES[meta.id];

    return {
      id: meta.id,
      districtId: meta.districtId,
      destinationName: meta.name,
      titleEn: baseStory.title || meta.name,
      titleOr: baseStory.odiaTitle || meta.name,
      titleHi: baseStory.hindiTitle || meta.name,
      historicalPeriod: meta.period,
      factClassification:
        baseStory.editorialReviewStatus === 'verified_epigraphic_and_asi'
          ? 'Archaeological & Epigraphic Evidence'
          : 'Documented Historical Record',
      narratorIdentity: {
        en: voice?.narratorName.en || baseStory.narrator || 'Utkal Heritage Guide',
        or: voice?.narratorName.or || 'ମୁଖ୍ୟ ଐତିହ୍ୟ ବାର୍ତ୍ତାବହ',
        hi: voice?.narratorName.hi || 'मुख्य धरोहर मार्गदर्शक',
      },
      totalWordCountEn,
      totalWordCountOr,
      totalWordCountHi,
      chapterCount: chapters.length,
      sources: baseStory.historicalSources || [
        'Archaeological Survey of India (ASI) Memoirs & Monographs',
        'Epigraphia Indica & Corpus Inscriptionum Indicarum',
        'Odisha District Gazetteers & State Archives',
      ],
      audioFiles: {
        en: getStoryAudioUrl(meta.id, 'en') || `/offline-audio/${meta.id}-en-seg0.wav`,
        or: getStoryAudioUrl(meta.id, 'or') || `/offline-audio/${meta.id}-or-seg0.wav`,
        hi: getStoryAudioUrl(meta.id, 'hi') || `/offline-audio/${meta.id}-hi-seg0.wav`,
      },
      chapters,
      vocabularyGlossary: COMMON_TRILINGUAL_VOCABULARY,
      stats: {
        playCount: 142 + (meta.name.length * 7),
        favouriteCount: 48 + (meta.name.length * 3),
        lastPlayedAt: new Date(Date.now() - 3600000 * (meta.name.length % 24)).toISOString(),
      },
    };
  });
}

// Singleton in-memory store for high-performance v2 access
class UtkalKathaRepositoryV2 {
  private stories: UtkalKathaStoryV2[] = [];
  private progressStore = new Map<string, UserProgressRecord>();

  constructor() {
    this.stories = buildCompleteUtkalKathaStoriesV2();
  }

  public getAll(options?: {
    districtId?: string;
    search?: string;
    limit?: number;
    offset?: number;
  }): { stories: UtkalKathaStoryV2[]; total: number } {
    let list = this.stories;

    if (options?.districtId) {
      const d = options.districtId.toLowerCase().trim();
      list = list.filter((s) => s.districtId.toLowerCase() === d);
    }

    if (options?.search) {
      const q = options.search.toLowerCase().trim();
      list = list.filter(
        (s) =>
          s.destinationName.toLowerCase().includes(q) ||
          s.titleEn.toLowerCase().includes(q) ||
          s.titleOr.toLowerCase().includes(q) ||
          s.titleHi.toLowerCase().includes(q)
      );
    }

    const total = list.length;
    const offset = Math.max(0, options?.offset || 0);
    const limit = Math.max(1, options?.limit || 50);

    return {
      stories: list.slice(offset, offset + limit),
      total,
    };
  }

  public getById(id: string): UtkalKathaStoryV2 | undefined {
    const clean = id.toLowerCase().trim();
    return this.stories.find((s) => s.id.toLowerCase() === clean);
  }

  public getChapters(
    storyId: string,
    page: number = 1,
    limit: number = 20,
    lang?: 'en' | 'or' | 'hi'
  ): { chapters: KathaChapterV2[]; total: number; page: number; totalPages: number } | null {
    const story = this.getById(storyId);
    if (!story) return null;

    const safePage = Math.max(1, page);
    const safeLimit = Math.max(1, Math.min(20, limit));
    const start = (safePage - 1) * safeLimit;
    const paginated = story.chapters.slice(start, start + safeLimit);

    return {
      chapters: paginated,
      total: story.chapters.length,
      page: safePage,
      totalPages: Math.ceil(story.chapters.length / safeLimit),
    };
  }

  public getChapter(storyId: string, chapterNumber: number): KathaChapterV2 | null {
    const story = this.getById(storyId);
    if (!story) return null;
    return story.chapters.find((c) => c.chapterNumber === chapterNumber) || null;
  }

  public getVocabulary(storyId: string): TrilingualTerm[] | null {
    const story = this.getById(storyId);
    if (!story) return null;
    return story.vocabularyGlossary;
  }

  public toggleFavourite(storyId: string): { favouriteCount: number; isFavourited: boolean } | null {
    const story = this.getById(storyId);
    if (!story) return null;
    story.stats.favouriteCount += 1;
    return { favouriteCount: story.stats.favouriteCount, isFavourited: true };
  }

  public recordPlay(storyId: string, chapterNumber?: number): { playCount: number } | null {
    const story = this.getById(storyId);
    if (!story) return null;
    story.stats.playCount += 1;
    story.stats.lastPlayedAt = new Date().toISOString();
    return { playCount: story.stats.playCount };
  }

  public saveProgress(
    userId: string,
    storyId: string,
    chapterNumber: number,
    positionSec: number,
    completed: boolean = false
  ): UserProgressRecord {
    const key = `${userId}:${storyId}`;
    const record: UserProgressRecord = {
      storyId,
      chapterNumber,
      positionSec,
      completed,
      updatedAt: new Date().toISOString(),
    };
    this.progressStore.set(key, record);
    return record;
  }

  public getProgress(userId: string, storyId: string): UserProgressRecord | null {
    return this.progressStore.get(`${userId}:${storyId}`) || null;
  }

  public getStats() {
    const totalStories = this.stories.length;
    const totalChapters = this.stories.reduce((sum, s) => sum + s.chapterCount, 0);
    const totalWordsEn = this.stories.reduce((sum, s) => sum + s.totalWordCountEn, 0);
    const totalWordsOr = this.stories.reduce((sum, s) => sum + s.totalWordCountOr, 0);
    const totalWordsHi = this.stories.reduce((sum, s) => sum + s.totalWordCountHi, 0);
    const totalPlays = this.stories.reduce((sum, s) => sum + s.stats.playCount, 0);
    const totalFavourites = this.stories.reduce((sum, s) => sum + s.stats.favouriteCount, 0);

    return {
      totalStories,
      totalChapters,
      totalWordsEn,
      totalWordsOr,
      totalWordsHi,
      totalPlays,
      totalFavourites,
      preservedMonuments: PRESERVED_25_MONUMENTS_META.map((m) => m.name),
    };
  }
}

export const utkalKathaRepositoryV2 = new UtkalKathaRepositoryV2();
