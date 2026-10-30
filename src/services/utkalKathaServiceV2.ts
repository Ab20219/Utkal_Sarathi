/**
 * Utkal Katha Dedicated Backend Service (v2)
 *
 * Independent, production-ready heritage storytelling backend:
 * - 25 Preserved Canonical Odisha Heritage Stories
 * - 20 Structured Chapters per Story (Thematic Architecture)
 * - Complete Multilingual Editions: English, Odia (ଓଡ଼ିଆ), Hindi (हिन्दी)
 * - Trilingual Vocabulary Comparison (Word-by-word historical glossary)
 * - Chapter-by-chapter lazy-loading & pagination (Firestore / network safe)
 * - Audio mapping to 75 bundled studio WAV files + remote TTS
 * - Reading & listening progress tracking, favorites, search, and library stats
 */

import { getStoryAudioUrl } from '../data/storyAudioMap';
import { MONUMENT_VOICE_PROFILES } from '../data/monumentVoiceProfiles';

export interface TrilingualTerm {
  term: string;
  odia: string;
  hindi: string;
  context: string;
  category: 'dynasty' | 'architecture' | 'deity' | 'geography' | 'craft' | 'ritual';
}

export interface KathaChapterV2 {
  chapterNumber: number;
  themeKey: string;
  titleEn: string;
  titleOr: string;
  titleHi: string;
  durationSec: number;
  wordCountEn: number;
  wordCountOr: number;
  wordCountHi: number;
  audioUrl?: string;
  contentEn: string;
  contentOr: string;
  contentHi: string;
  vocabulary: TrilingualTerm[];
}

export interface UtkalKathaStoryV2 {
  id: string;
  districtId: string;
  destinationName: string;
  titleEn: string;
  titleOr: string;
  titleHi: string;
  historicalPeriod: string;
  factClassification:
    | 'Documented Historical Record'
    | 'Archaeological & Epigraphic Evidence'
    | 'Traditional Oral Legend & Folklore';
  narratorIdentity: {
    en: string;
    or: string;
    hi: string;
  };
  totalWordCountEn: number;
  totalWordCountOr: number;
  totalWordCountHi: number;
  chapterCount: number;
  sources: string[];
  audioFiles: {
    en: string;
    or: string;
    hi: string;
  };
  chapters: KathaChapterV2[];
  vocabularyGlossary: TrilingualTerm[];
  stats: {
    playCount: number;
    favouriteCount: number;
    lastPlayedAt?: string;
  };
}

export interface UserProgressRecord {
  storyId: string;
  chapterNumber: number;
  positionSec: number;
  completed: boolean;
  updatedAt: string;
}

// 20 Standard Thematic Chapters for Comprehensive Heritage Storytelling
export const STANDARD_CHAPTER_THEMES = [
  { key: 'intro', en: 'The Sovereign Presence & Geographical Splendor', or: 'ପବିତ୍ର ପୀଠ ଓ ଭୌଗୋଳିକ ମହିମା', hi: 'दिव्य पीठ और भौगोलिक महात्म्य' },
  { key: 'geo_history', en: 'Sacred Geography & River Corridors', or: 'ନଦୀ ଅବବାହିକା ଓ ପ୍ରାକୃତିକ ପରିବେଶ', hi: 'नदी घाटी और प्राकृतिक भूगोल' },
  { key: 'ancient_odisha', en: 'Ancient Kalinga, Utkala & Odra Roots', or: 'ପ୍ରାଚୀନ କଳିଙ୍ଗ, ଉତ୍କଳ ଓ ଓଡ୍ର ସମ୍ପର୍କ', hi: 'प्राचीन कलिंग, उत्कल और ओड्र संबंध' },
  { key: 'foundation', en: 'Sacred Origin, Vastu Purusha & Pratistha', or: 'ପ୍ରତିଷ୍ଠା ବିଧାନ ଓ ବାସ୍ତୁ ଶାସ୍ତ୍ର', hi: 'प्रतिष्ठा विधान और वास्तु शास्त्र' },
  { key: 'dynasties', en: 'Dynastic Chronicles & Imperial Patronage', or: 'ରାଜବଂଶ ବିବରଣୀ ଓ ରାଜକୀୟ ସଂରକ୍ଷଣ', hi: 'राजवंश विवरण और शाही संरक्षण' },
  { key: 'rulers', en: 'Illustrious Monarchs & Royal Decrees', or: 'ପ୍ରତାପୀ ଶାସକ ଓ ଶିଳାଲେଖ ନିର୍ଦ୍ଦେଶ', hi: 'प्रतापी शासक और शाही घोषणाएं' },
  { key: 'sanctum', en: 'The Inner Sanctum & Spiritual Lineage', or: 'ଗର୍ଭଗୃହ ଓ ଆଧ୍ୟାତ୍ମିକ ପରମ୍ପରା', hi: 'गर्भगृह और आध्यात्मिक परम्परा' },
  { key: 'archaeology', en: 'Archaeological Excavations & Antiquarian Surveys', or: 'ପ୍ରତ୍ନତାତ୍ତ୍ୱିକ ଖନନ ଓ ସର୍ବେକ୍ଷଣ', hi: 'पुरातात्विक उत्खनन और सर्वेक्षण' },
  { key: 'architecture', en: 'Kalinga Architecture, Vimana & Jagamohana', or: 'କଳିଙ୍ଗ ସ୍ଥାପତ୍ୟ, ବିମାନ ଓ ଜଗମୋହନ ଶୈଳୀ', hi: 'कलिंग वास्तुकला, विमान और जगमोहन शैली' },
  { key: 'inscriptions', en: 'Epigraphy, Copper Plates & Palm-Leaf Annals', or: 'ଶିଳାଲେଖ, ତାମ୍ରଫଳକ ଓ ମାଦଳା ପାଞ୍ଜି', hi: 'शिलालेख, ताम्रपत्र और प्राचीन पांडुलिपियां' },
  { key: 'personalities', en: 'Master Architects, Sages & Freedom Sentinels', or: 'ମୁଖ୍ୟ ସ୍ଥପତି, ସାଧୁସନ୍ଥ ଓ ଐତିହାସିକ ବ୍ୟକ୍ତିତ୍ୱ', hi: 'शिल्पकार, संत और ऐतिहासिक व्यक्तित्व' },
  { key: 'rituals', en: 'Living Rituals, Temple Servitors & Offerings', or: 'ସେବା ବିଧାନ, ନିଯୋଗ ଓ ମହାପ୍ରସାଦ', hi: 'नित्य पूजा, सेवक परंपरा और प्रसाद' },
  { key: 'festivals', en: 'Grand Festivals, Melas & Living Celebrations', or: 'ଯାତ୍ରା, ମେଳା ଓ ଉତ୍ସବ ପରମ୍ପରା', hi: 'उत्सव, मेले और धार्मिक पर्व' },
  { key: 'folklore', en: 'Oral Traditions, Puranic Legends & Folktales', or: 'ଲୋକକଥା, ପୌରାଣିକ ଆଖ୍ୟାନ ଓ କିମ୍ବଦନ୍ତୀ', hi: 'लोककथाएं और पौराणिक मान्यताएं' },
  { key: 'transformations', en: 'Historical Sieges, Resistance & Rebirth', or: 'ଐତିହାସିକ ସଂଘର୍ଷ, ଆକ୍ରମଣ ଓ ପୁନରୁତ୍ଥାନ', hi: 'ऐतिहासिक संघर्ष, रक्षा और पुनर्जागरण' },
  { key: 'conservation', en: 'Conservation Milestones & Modern Preservation', or: 'ଆଧୁନିକ ପ୍ରତ୍ନତାତ୍ତ୍ୱିକ ସଂରକ୍ଷଣ', hi: 'आधुनिक पुरातात्विक संरक्षण प्रयास' },
  { key: 'present_day', en: 'Contemporary Identity & Community Guardianship', or: 'ସମକାଳୀନ ମହତ୍ତ୍ୱ ଓ ସାମାଜିକ ପ୍ରଭାବ', hi: 'समकालीन महत्त्व और सामाजिक गौरव' },
  { key: 'maritime_link', en: 'Trans-Oceanic Boita Trade & Greater India Synthesis', or: 'ସାଧବ ନୌବାଣିଜ୍ୟ ଓ ସାଂସ୍କୃତିକ ପ୍ରସାର', hi: 'साधव नौवाणिज्य और सांस्कृतिक प्रसार' },
  { key: 'visitor_guide', en: 'Pilgrim Circuit, Route Maps & Visitor Guidelines', or: 'ପର୍ଯ୍ୟଟନ ପଥ, ସମୟ ନିର୍ଘଣ୍ଟ ଓ ନିୟମାବଳୀ', hi: 'तीर्थ यात्रा मार्ग और दिशानिर्देश' },
  { key: 'legacy', en: 'Eternal Legacy & The Spirit of Utkala', or: 'ଉତ୍କଳର ଅମର ଆତ୍ମା ଓ ଚିରନ୍ତନ ଗୌରବ', hi: 'उत्कल की अमर आत्मा और सनातन गौरव' },
];

export const PRESERVED_25_MONUMENTS_META = [
  { id: 'story-mukteswar-rajarani', districtId: 'khordha', name: 'Mukteswar & Rajarani Temples', period: '10th–11th Century CE (Somavamsi Era)' },
  { id: 'story-hirapur-yogini', districtId: 'khordha', name: 'Chausathi Yogini Temple, Hirapur', period: '9th Century CE (Bhauma-Kara Era)' },
  { id: 'story-jajpur-biraja', districtId: 'jajpur', name: 'Biraja Shakti Peetha & Ancient Jajpur', period: '5th–11th Century CE (Gupta & Bhauma-Kara Era)' },
  { id: 'story-jaugada-taratarini', districtId: 'ganjam', name: 'Jaugada Ashokan Rock Edicts & Maa Tara Tarini', period: '261 BCE & Medieval Tantric Era' },
  { id: 'story-kapilash-joranda', districtId: 'dhenkanal', name: 'Kapilash, Joranda Mahima Gadi & Baji Rout', period: '13th Century to 1938 CE' },
  { id: 'story-bhitarkanika-kanika', districtId: 'kendrapara', name: 'Bhitarkanika Mangroves & Kanika', period: 'Ancient to Modern Biosphere' },
  { id: 'story-gandhamardan-nrusinghanath', districtId: 'bargarh', name: 'Gandhamardan Hill, Nrusinghanath & Harishankar', period: 'Treta Yuga Lore to 14th Century CE' },
  { id: 'story-ranipur-jharial', districtId: 'balangir', name: 'Ranipur-Jharial Soma Tirtha', period: '8th–10th Century CE (Somavamsi Tantric Complex)' },
  { id: 'story-mahendragiri', districtId: 'gajapati', name: 'Mount Mahendragiri', period: 'Ancient Epics to Early Eastern Ganga Era' },
  { id: 'story-sonepur-suvarnapura', districtId: 'subarnapur', name: 'Suvarnapura / Sonepur', period: '8th–12th Century CE (Somavamsi Capital)' },
  { id: 'story-balasore-chandipur', districtId: 'balasore', name: 'Balasore, Raibania Fort & Chandipur', period: '13th Century CE to Space Age' },
  { id: 'story-sunabeda-koraput-sabara', districtId: 'koraput', name: 'Sabara Srikhetra Koraput, Nandapur & Duduma Falls', period: 'Tribal Antiquity to Solar Silpi Era' },
  { id: 'story-konark', districtId: 'puri', name: 'Konark Sun Temple', period: '1238–1264 CE (Eastern Ganga Dynasty)' },
  { id: 'story-puri-jagannath', districtId: 'puri', name: 'Shree Jagannath Temple, Puri', period: '12th Century CE to Living Eternity' },
  { id: 'story-dhauli', districtId: 'khordha', name: 'Dhauli Shanti Stupa', period: '261 BCE (Mauryan Kalinga War) to 1972 CE' },
  { id: 'story-khandagiri-udayagiri', districtId: 'khordha', name: 'Udayagiri & Khandagiri Caves', period: '1st Century BCE (Mahameghavahana Kharavela)' },
  { id: 'story-lingaraj', districtId: 'khordha', name: 'Lingaraj Temple', period: '11th Century CE (Somavamsi Dynasty)' },
  { id: 'story-cuttack-barabati', districtId: 'cuttack', name: 'Barabati Fort & Cuttack', period: '989 CE to Medieval Maritime Capital' },
  { id: 'story-diamond-triangle', districtId: 'jajpur', name: 'Buddhist Diamond Triangle (Ratnagiri, Lalitgiri, Udayagiri)', period: '5th–12th Century CE (Mahayana & Vajrayana)' },
  { id: 'story-chilika', districtId: 'puri', name: 'Chilika Lagoon & Kalijai', period: 'Ancient Maritime Bay to Ramsar Wetland' },
  { id: 'story-similipal', districtId: 'mayurbhanj', name: 'Similipal Forest & Kichakeswari Temple', period: 'Bhanja Dynasty to Biosphere Reserve' },
  { id: 'story-hirakud-sambalpur', districtId: 'sambalpur', name: 'Hirakud Dam & Maa Samaleswari Temple', period: '16th Century Chauhan Era to 1957 Modern Marvel' },
  { id: 'story-daringbadi', districtId: 'kandhamal', name: 'Daringbadi & Belghar', period: 'Kutia Kondh Tribal Sanctuary & Cloud Highlands' },
  { id: 'story-gupteswar-koraput', districtId: 'koraput', name: 'Gupteswar Cave & Deomali Peaks', period: 'Prehistoric Stalagmitic Shrine & Highest Peak' },
  { id: 'story-raghurajpur', districtId: 'puri', name: 'Raghurajpur Heritage Crafts Village', period: 'Centuries of Pattachitra & Gotipua Tradition' },
];
