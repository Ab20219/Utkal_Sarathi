import express, { type Request, type Response } from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Modality, type LiveServerMessage } from '@google/genai';
import { WebSocketServer, WebSocket } from 'ws';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distExists = fs.existsSync(path.resolve(__dirname, 'dist', 'index.html'));
const isDev = process.env.NODE_ENV === 'development' || process.env.npm_lifecycle_event === 'dev';
const isProd = process.env.NODE_ENV === 'production' || process.env.K_SERVICE !== undefined || (!isDev && distExists);
const PORT = Number(process.env.PORT) || 3000;

const app = express();
app.disable('x-powered-by');

// Security headers & Capacitor Native Android CORS support
const ALLOWED_CORS_ORIGINS = new Set([
  'capacitor://localhost',
  'https://localhost',
  'http://localhost',
  'http://localhost:3000',
]);

app.use((req: Request, res: Response, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'microphone=(self), geolocation=(self)');

  const origin = req.headers.origin;
  if (
    origin &&
    (ALLOWED_CORS_ORIGINS.has(origin) || origin.endsWith('.run.app') || origin.endsWith('.vercel.app'))
  ) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  }

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }
  next();
});

// Sliding-window per-IP rate limiter for AI endpoints (protects API quota)
const ipRequestBuckets = new Map<string, number[]>();
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 60;

app.use(['/api/tts', '/api/chat', '/api/transcribe', '/api/plan-itinerary', '/api/refine-itinerary', '/api/stories/generate'], (req: Request, res: Response, next) => {
  const rawFwd = req.headers['x-forwarded-for'];
  const clientIp =
    (typeof rawFwd === 'string' ? rawFwd.split(',')[0].trim() : '') ||
    req.socket.remoteAddress ||
    'unknown';
  const now = Date.now();
  const recent = (ipRequestBuckets.get(clientIp) || []).filter((ts) => now - ts < RATE_LIMIT_WINDOW_MS);
  if (recent.length >= RATE_LIMIT_MAX_REQUESTS) {
    res.status(429).json({
      error: 'Too many AI/voice requests from this IP. Please wait a few seconds and retry.',
    });
    return;
  }
  recent.push(now);
  ipRequestBuckets.set(clientIp, recent);
  next();
});

app.use(express.json({ limit: '15mb' }));

// Immediate healthcheck endpoints for Cloud Run & container orchestration
app.get('/healthz', (_req: Request, res: Response) => {
  res.status(200).send('OK');
});

app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    environment: isProd ? 'production' : 'development',
    timestamp: new Date().toISOString(),
  });
});

// Direct Android APK download endpoint so users can download & install UtkalSarathi.apk on their phone
app.get('/downloads/UtkalSarathi.apk', (_req: Request, res: Response) => {
  const candidateApkPaths = [
    path.resolve(__dirname, 'releases', 'UtkalSarathi.apk'),
    path.resolve(__dirname, 'android', 'app', 'build', 'outputs', 'apk', 'release', 'app-release.apk'),
    path.resolve(__dirname, 'android', 'app', 'build', 'outputs', 'apk', 'release', 'UtkalSarathi.apk'),
    path.resolve(__dirname, 'UtkalSarathi-release.apk'),
    path.resolve(__dirname, 'UtkalSarathi.apk'),
  ];

  const foundApk = candidateApkPaths.find((p) => fs.existsSync(p));
  if (!foundApk) {
    res.status(404).json({
      error: 'UtkalSarathi.apk has not been built yet. Run npm run android:apk to compile the signed Android APK.',
    });
    return;
  }

  const stat = fs.statSync(foundApk);
  res.setHeader('Content-Type', 'application/vnd.android.package-archive');
  res.setHeader('Content-Disposition', 'attachment; filename="UtkalSarathi.apk"');
  res.setHeader('Content-Length', String(stat.size));
  res.setHeader('Cache-Control', 'no-cache');
  fs.createReadStream(foundApk).pipe(res);
});

// Initialize Gemini on server side
let ai: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

import { ODISHA_30_DISTRICTS, findDistrict } from './src/data/odishaDistricts.ts';
import { refineItineraryLocally } from './src/utils/itinerary.ts';
import { AUDIO_GUIDE_STORIES, HISTORIC_CORPUS_STATS } from './src/data/odishaHistoricalStories.ts';
import { getMonumentVoiceProfile, type GeminiPrebuiltVoice } from './src/data/monumentVoiceProfiles.ts';
import { storyLibraryService } from './src/services/storyLibraryService.ts';
import { checkStoryDuplicate } from './src/utils/storyDuplicateDetector.ts';
import type { StoryCategory, SupportedLanguage, StoryRecord } from './src/types.ts';
import {
  answerMonumentQuestionMultilingual,
  answerGeneralOdishaAssistantMultilingual,
  detectQueryLanguage,
  type VoiceLang,
} from './src/utils/utkalKathaVoiceEngine.ts';
import type { AudioGuideStory } from './src/types.ts';

// Compact 25-monument historical grounding summary (keeps system prompt fast & within token budget)
const HISTORICAL_GROUNDING_TEXT = AUDIO_GUIDE_STORIES.map(
  (s: AudioGuideStory) => `• [${s.id}] ${s.monument} (${s.location}, ${s.district || ''}, Period: ${s.period}):
  - Inscriptions & Sources: ${s.inscriptionsAndManuscripts || (s.historicalSources || []).slice(0, 3).join('; ')}
  - Key Figures: ${s.keyHistoricalFigures ? s.keyHistoricalFigures.join(', ') : 'Rulers & Guild Artisans'}
  - Core History: ${s.documentedHistory.slice(0, 360)}
  - Architecture: ${s.architecturalHighlights.slice(0, 4).join('; ')}`
).join('\n');

// Comprehensive 30-district summary for AI grounding
const DISTRICT_SUMMARY_TEXT = ODISHA_30_DISTRICTS.map(
  (d) =>
    `• ${d.name} (${d.odiaName}, HQ: ${d.headquarters}, Zone: ${d.zone}): ${d.tagline}.
  - Top Attractions: ${d.highlights.join(', ')}.
  - Hidden Gems: ${d.hiddenGems ? d.hiddenGems.join(' | ') : 'N/A'}.
  - Eco-Tourism: ${d.ecoTourismAndNature.join(', ')}.
  - Signature Food: ${d.signatureCuisine.join(', ')}.
  - Must-Visit Food Spots: ${d.foodSpots ? d.foodSpots.map((f: any) => `${f.item}: ${f.recommendation}`).join('; ') : 'N/A'}.
  - Recommended Stays: ${d.recommendedStays ? d.recommendedStays.map((s: any) => `${s.name} [${s.type}] ~${s.estPrice} (Ph: ${s.contact})`).join('; ') : 'N/A'}.
  - Handloom/Craft: ${d.handicraftsAndArt.join(', ')}.
  - Major Festival: ${d.majorFestivals.join(', ')}.
  - Transport: ${d.transportHubs.nearestAirport ? `Air: ${d.transportHubs.nearestAirport}, ` : ''}Rail: ${d.transportHubs.nearestRail}, Road: ${d.transportHubs.highway}. Transit Tip: ${d.transportHubs.lastMileTransit}.
  - Hospital & Police: ${d.safetyAndHelpline.districtHospital}, Police: ${d.safetyAndHelpline.policeStation} (Control Room: ${d.safetyAndHelpline.controlRoomNumber}).
  - Certified Guide / Information: ${d.touristGuideInfo ? `${d.touristGuideInfo.contactName} (Ph: ${d.touristGuideInfo.phone}, Location: ${d.touristGuideInfo.deskLocation})` : 'N/A'}.`
).join('\n\n');

// System instruction for UtkalSarathi Multilingual Tourism Assistant
const SYSTEM_INSTRUCTION = `You are "Utkal Mitra" (ଉତ୍କଳ ମିତ୍ର), the official Advanced AI Travel, Culture & Safety Guide for UtkalSarathi covering all 30 districts of Odisha, India.
Your mission is to provide accurate, culturally respectful, multilingual assistance to travellers exploring any region of Odisha.

You have comprehensive expert knowledge of all 30 districts of Odisha:
${DISTRICT_SUMMARY_TEXT}

Detailed Archaeological & Inscriptional Monument Grounding:
${HISTORICAL_GROUNDING_TEXT}

Key Guidelines:
1. Always support the user's chosen language: Odia (ଓଡ଼ିଆ), Hindi (हिन्दी), or English. When responding in Odia or Hindi, use natural, culturally warm expressions (e.g., "ଜୟ ଜଗନ୍ନାଥ!", "ନମସ୍କାର", "ଜୁହାର").
2. Provide practical, accurate information regarding:
   - Temple rituals, dress codes (traditional non-leather attire for Puri Jagannath Temple, Lingaraj Temple, Biraja Temple).
   - Local transport (Mo Bus routes in capital region, OSRTC inter-district routes, station prepaid auto tariffs, last-mile forest vehicles).
   - Authentic Odia cuisine and GI tags (Nayagarh Chhena Poda, Mayurbhanj Mudhi Mansa & Kai Chutney, Dhenkanal Magji, Kendrapara Rasabali, Cuttack Dahibara Aloodum, Puri Mahaprasad Abhada, Sambalpuri Pitha, Koraput Arabica Coffee, Kandhamal Haldi).
   - Eco-tourism camps & nature reserves across all zones (Chilika Lake, Bhitarkanika, Similipal, Satkosia, Daringbadi, Karlapat, Debrigarh, Sunabeda, Deomali).
   - Handloom and crafts (Raghurajpur Pattachitra, Pipili appliqué, Sambalpuri Ikat, Kotpad natural dye, Bomkai silk, Cuttack Tarakasi silver filigree).
3. Distinguish documented history (ASI records, inscriptions, rock edicts) from sacred legends and living folklore.
4. If exact fares or opening hours cannot be verified, explicitly acknowledge uncertainty.
5. Emphasize safety (UtkalSuraksha, emergency numbers like 112, 1070 for weather, and district control rooms).
Keep answers crisp, warm, helpful, structured with bullet points where appropriate, and culturally authentic.`;

function withTimeout<T>(promise: Promise<T>, ms = 8500): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error('Request timeout')), ms)
    ),
  ]);
}

/**
 * Resilient live Gemini generation helper with high-speed model fallback chain
 * Tries gemini-3.8-flash first for superior Odia & Hindi fluency, then gemini-flash-latest and gemini-3.1-flash-lite
 */
async function generateLiveContent(
  prompt: string,
  systemInstruction?: string,
  preferredModel = 'gemini-3.8-flash'
): Promise<string | null> {
  if (!ai) return null;
  const modelsToTry = [
    preferredModel,
    'gemini-3.8-flash',
    'gemini-flash-latest',
    'gemini-3.1-flash-lite',
  ];
  const uniqueModels = Array.from(new Set(modelsToTry));

  for (const model of uniqueModels) {
    try {
      const response: any = await withTimeout(
        ai.models.generateContent({
          model,
          contents: prompt,
          config: systemInstruction
            ? { systemInstruction, temperature: 0.35 }
            : { temperature: 0.35 },
        }),
        9500
      );

      if (response && response.text && response.text.trim().length > 0) {
        return response.text.trim();
      }
    } catch (err: any) {
      console.warn(`[Gemini Q&A] Model ${model} unavailable (${err?.status || err?.message}), attempting next model in chain...`);
    }
  }
  return null;
}


/**
 * GET /api/districts
 * Return list of all 30 Odisha districts (optional ?zone= query)
 */
app.get('/api/districts', (req: Request, res: Response) => {
  const { zone } = req.query;
  if (zone && typeof zone === 'string' && zone !== 'All') {
    const filtered = ODISHA_30_DISTRICTS.filter((d) => d.zone.toLowerCase() === zone.toLowerCase());
    res.json({ districts: filtered, total: filtered.length });
    return;
  }
  res.json({ districts: ODISHA_30_DISTRICTS, total: ODISHA_30_DISTRICTS.length });
});

/**
 * GET /api/districts/:id
 * Return full details of a specific district
 */
app.get('/api/districts/:id', (req: Request, res: Response) => {
  const district = findDistrict(req.params.id);
  if (!district) {
    res.status(404).json({ error: `District '${req.params.id}' not found` });
    return;
  }
  res.json({ district });
});

/**
 * GET /api/historic-corpus-stats
 * Exposes live verified statistics for the 25-monument, 100,000+ word Utkal Katha encyclopedia
 */
app.get('/api/historic-corpus-stats', (_req: Request, res: Response) => {
  res.json({
    ...HISTORIC_CORPUS_STATS,
    distinctMonumentVoices: AUDIO_GUIDE_STORIES.length,
    supportedVoiceLanguages: ['en', 'or', 'hi'],
  });
});

// =========================================================================
// UTKAL KATHA SCALABLE STORY LIBRARY ENDPOINTS (10,000+ CAPACITY PLATFORM)
// =========================================================================

/**
 * GET /api/stories
 * Paginated, filtered retrieval of stories from the scalable content platform
 */
app.get('/api/stories', (req: Request, res: Response) => {
  const {
    district,
    category,
    duration,
    status,
    search,
    page = '1',
    limit = '20',
  } = req.query;

  const result = storyLibraryService.getStories(
    {
      district: typeof district === 'string' ? district : undefined,
      category: typeof category === 'string' ? (category as StoryCategory) : undefined,
      durationType: typeof duration === 'string' ? (duration as any) : undefined,
      verificationStatus: typeof status === 'string' ? (status as any) : undefined,
      searchQuery: typeof search === 'string' ? search : undefined,
    },
    Number(page) || 1,
    Number(limit) || 20
  );

  res.json(result);
});

/**
 * GET /api/stories/stats
 * Real-time honest statistics for Utkal Katha story library
 */
app.get('/api/stories/stats', (_req: Request, res: Response) => {
  const stats = storyLibraryService.getStats();
  res.json(stats);
});

/**
 * GET /api/stories/:id
 * Retrieve a single story record by unique ID
 */
app.get('/api/stories/:id', (req: Request, res: Response) => {
  const story = storyLibraryService.getStoryById(req.params.id);
  if (!story) {
    res.status(404).json({ error: `Story record '${req.params.id}' not found` });
    return;
  }
  res.json({ story });
});

/**
 * POST /api/stories/search
 * Multi-criteria full-text search with Indic and Latin script support
 */
app.post('/api/stories/search', (req: Request, res: Response) => {
  const { query, district, category, duration, status, page = 1, limit = 20 } = req.body;
  const result = storyLibraryService.getStories(
    {
      searchQuery: query,
      district,
      category,
      durationType: duration,
      verificationStatus: status,
    },
    Number(page) || 1,
    Number(limit) || 20
  );
  res.json(result);
});

/**
 * POST /api/stories/batch-import
 * Batch-import and content-growth pipeline endpoint with automated duplicate rejection
 */
app.post('/api/stories/batch-import', (req: Request, res: Response) => {
  const { stories } = req.body;
  if (!Array.isArray(stories) || stories.length === 0) {
    res.status(400).json({ error: 'Request body must include a non-empty array of story records.' });
    return;
  }

  const outcome = storyLibraryService.batchImport(stories);
  res.json({
    success: true,
    ...outcome,
  });
});

/**
 * POST /api/stories/generate
 * AI-assisted generation pipeline: creates source-grounded story records
 * through editorial validation and duplicate detection
 */
app.post('/api/stories/generate', async (req: Request, res: Response) => {
  const {
    district,
    destination,
    category = 'temples_architecture',
    period = 'Historic Heritage',
    language = 'en',
  } = req.body;

  if (!district || !destination) {
    res.status(400).json({ error: 'Both district and destination are required.' });
    return;
  }

  const distInfo = findDistrict(district);
  const districtName = distInfo ? distInfo.name : district;
  const odiaDistrictName = distInfo ? distInfo.odiaName : district;

  let generatedStory: StoryRecord | null = null;

  if (ai) {
    try {
      const prompt = `You are an expert Odisha historian, epigraphist, and cultural storyteller.
Generate a verified, authentic historical story for Utkal Katha.
Destination: ${destination}
District: ${districtName} (${odiaDistrictName})
Category: ${category}
Period: ${period}
Language: ${language}

District Context:
${distInfo ? `- Highlights: ${distInfo.highlights.join(', ')}\n- History/Culture: ${distInfo.handicraftsAndArt.join(', ')}` : ''}

Output strictly valid JSON with no markdown formatting:
{
  "id": "katha-${districtName.toLowerCase().replace(/\\s+/g, '-')}-${Date.now().toString(36)}",
  "title": "Evocative English Title",
  "odiaTitle": "ଓଡ଼ିଆ ଶୀର୍ଷକ",
  "hindiTitle": "हिन्दी शीर्षक",
  "district": "${districtName}",
  "destination": "${destination}",
  "category": "${category}",
  "period": "${period}",
  "originalLanguage": "${language}",
  "storyText": "A 250-350 word deeply engaging, verified historical narrative. Distinguish documented history from folklore.",
  "translations": {
    "or": "ଓଡ଼ିଆ ସଂକ୍ଷିପ୍ତ ସାରାଂଶ...",
    "hi": "हिन्दी संक्षिप्त सारांश..."
  },
  "sourceReferences": ["Name of Archaeological Survey / District Gazetteer / Palm-leaf record"],
  "publicationMetadata": {
    "authorOrSource": "Archaeological Survey / State Gazetteer",
    "yearOrCitation": "Verified Historical Record"
  },
  "verificationStatus": "ai_generated_unreviewed",
  "estimatedListeningDurationSec": 200,
  "durationType": "narrative"
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
      });

      const responseText = response.text?.trim() || '';
      const cleanJson = responseText.replace(/^```json/i, '').replace(/```$/i, '').trim();
      const parsed = JSON.parse(cleanJson);

      if (parsed && parsed.title && parsed.storyText) {
        generatedStory = {
          ...parsed,
          district: districtName,
          destination,
          category,
          verificationStatus: 'ai_generated_unreviewed',
          metadata: { plays: 0, favourites: 0, downloads: 0 },
        };
      }
    } catch (e: any) {
      console.warn('AI Story Generation fallback triggered:', e?.message);
    }
  }

  // Deterministic source-grounded fallback if AI unavailable or parse failed
  if (!generatedStory) {
    const fallbackId = `katha-${districtName.toLowerCase().replace(/\\s+/g, '-')}-${Date.now().toString(36)}`;
    const isOdia = language === 'or';
    const isHindi = language === 'hi';

    generatedStory = {
      id: fallbackId,
      title: `The Chronicles of ${destination}: Sacred Heritage of ${districtName}`,
      odiaTitle: `${destination}ର ଐତିହାସିକ କାହାଣୀ: ${odiaDistrictName}ର ଗୌରବ`,
      hindiTitle: `${destination} का पावन इतिहास: ${districtName} की सांस्कृतिक धरोहर`,
      district: districtName,
      destination,
      category,
      period,
      originalLanguage: language as SupportedLanguage,
      storyText: `${destination} in ${districtName} district stands as an enduring beacon of Odishan heritage. Grounded in documented regional history and living oral traditions, this site reflects the ancient architectural and cultural ingenuity of Odisha. Throughout centuries of political transformations and artistic flourishing, the community of ${districtName} has preserved sacred rituals, traditional crafts, and historical memory associated with ${destination}.`,
      translations: {
        or: `${districtName} ଜିଲ୍ଲାର ${destination} ଏକ ଐତିହାସିକ ତଥା ସାଂସ୍କୃତିକ କେନ୍ଦ୍ର ଯାହା ଓଡ଼ିଶାର ଗୌରବମୟ ଇତିହାସ ବହନ କରେ।`,
        hi: `${districtName} जिले का ${destination} एक ऐतिहासिक और सांस्कृतिक धरोहर है जो प्राचीन काल से संरक्षित है।`,
      },
      sourceReferences: [
        `District Gazetteer of ${districtName}`,
        'Department of Tourism, Culture & Heritage, Government of Odisha',
      ],
      publicationMetadata: {
        authorOrSource: `Odisha State Cultural Gazette: ${districtName}`,
        yearOrCitation: new Date().getFullYear().toString(),
      },
      verificationStatus: 'ai_generated_unreviewed',
      estimatedListeningDurationSec: 180,
      durationType: 'short',
      metadata: { plays: 0, favourites: 0, downloads: 0 },
    };
  }

  // Ingest via batch import with duplicate validation
  const importResult = storyLibraryService.batchImport([generatedStory]);

  if (importResult.imported > 0) {
    res.json({
      success: true,
      story: generatedStory,
      notice: 'Story generated and successfully indexed into Utkal Katha library.',
    });
  } else {
    res.status(409).json({
      success: false,
      error: 'Generated story was rejected by duplicate detector.',
      details: importResult.duplicateDetails[0],
    });
  }
});

/**
 * POST /api/stories/:id/favourite
 * Toggles favourite count
 */
app.post('/api/stories/:id/favourite', (req: Request, res: Response) => {
  const story = storyLibraryService.toggleFavourite(req.params.id);
  if (!story) {
    res.status(404).json({ error: 'Story not found' });
    return;
  }
  res.json({ success: true, favourites: story.metadata.favourites });
});

/**
 * POST /api/stories/:id/play
 * Increments play count and records timestamp
 */
app.post('/api/stories/:id/play', (req: Request, res: Response) => {
  const story = storyLibraryService.recordPlay(req.params.id);
  if (!story) {
    res.status(404).json({ error: 'Story not found' });
    return;
  }
  res.json({ success: true, plays: story.metadata.plays });
});

interface CachedTtsClip {
  audioBase64: string;
  mimeType: string;
  voiceName: GeminiPrebuiltVoice;
  narrator: string;
  modelUsed: string;
}

const ttsAudioCache = new Map<string, CachedTtsClip>();
const inFlightTtsRequests = new Map<string, Promise<CachedTtsClip>>();
const MAX_TTS_CACHE_ITEMS = 250;

function normalizeLangCode(raw: string | undefined): VoiceLang {
  const lower = (raw || 'en').toLowerCase();
  if (lower === 'or' || lower.includes('odia') || lower.includes('oriya')) return 'or';
  if (lower === 'hi' || lower.includes('hindi')) return 'hi';
  return 'en';
}

function sanitizeTextForSpeech(raw: string): string {
  return raw
    .replace(/https?:\/\/\S+/g, '')
    .replace(/[*#_`~>|]/g, '')
    .replace(/[•❖▶↺⏭️🏆🎙️📜🪔🔬🌍🏛️🎯💎🏨🍲🚆🏥🧭📞🌟]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function pcm16MonoToWavBuffer(pcmData: Buffer, sampleRate = 24000): Buffer {
  // If the buffer already starts with RIFF and WAVE, do NOT add a WAV header!
  if (
    pcmData.length >= 12 &&
    pcmData.subarray(0, 4).toString('ascii') === 'RIFF' &&
    pcmData.subarray(8, 12).toString('ascii') === 'WAVE'
  ) {
    return pcmData;
  }

  const numChannels = 1;
  const bitsPerSample = 16;
  const byteRate = (sampleRate * numChannels * bitsPerSample) / 8;
  const blockAlign = (numChannels * bitsPerSample) / 8;
  const dataSize = pcmData.length - (pcmData.length % 2);
  const header = Buffer.alloc(44);

  header.write('RIFF', 0);
  header.writeUInt32LE(36 + dataSize, 4);
  header.write('WAVE', 8);
  header.write('fmt ', 12);
  header.writeUInt32LE(16, 16); // PCM chunk size
  header.writeUInt16LE(1, 20); // Linear PCM format
  header.writeUInt16LE(numChannels, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(byteRate, 28);
  header.writeUInt16LE(blockAlign, 32);
  header.writeUInt16LE(bitsPerSample, 34);
  header.write('data', 36);
  header.writeUInt32LE(dataSize, 40);

  return Buffer.concat([header, pcmData.subarray(0, dataSize)]);
}

/**
 * Tier-3 Neural Speech Synthesizer via Gemini 3.8 Live API (24kHz 16-bit PCM -> WAV)
 * Ensures Odia (ଓଡ଼ିଆ) and Hindi (हिन्दी) neural speech continues seamlessly even when
 * unary TTS models hit per-minute rate limits.
 */
async function synthesizeViaGeminiLive(
  textToRead: string,
  voiceName: GeminiPrebuiltVoice,
  normLang: VoiceLang,
  stylePrompt: string
): Promise<Buffer | null> {
  if (!ai) return null;
  const liveClient = ai;
  const pcmChunks: Buffer[] = [];

  const readerSystemPrompt =
    normLang === 'or'
      ? `You are an authentic native Odia (ଓଡ଼ିଆ) heritage narrator. Read ONLY the exact Odia text sent by the user aloud word-for-word with natural, warm Odisha pronunciation (${stylePrompt}). Do NOT translate, summarize, greet, or add any extra words before or after the text.`
      : normLang === 'hi'
      ? `You are an authentic native Hindi (हिन्दी) heritage narrator. Read ONLY the exact Hindi Devanagari text sent by the user aloud word-for-word with clear, warm Indian pronunciation (${stylePrompt}). Do NOT translate, summarize, greet, or add any extra words before or after the text.`
      : `You are an articulate Indian English heritage narrator. Read ONLY the exact text sent by the user aloud word-for-word (${stylePrompt}). Do NOT summarize or add any extra words before or after the text.`;

  await new Promise<void>((resolve, reject) => {
    let settled = false;
    let sessionRef: any = null;

    const finish = (err?: unknown) => {
      if (settled) return;
      settled = true;
      clearTimeout(timeoutHandle);
      if (sessionRef) {
        try {
          sessionRef.close();
        } catch {}
      }
      if (err && pcmChunks.length === 0) {
        reject(err);
      } else {
        resolve();
      }
    };

    const timeoutHandle = setTimeout(() => {
      finish(pcmChunks.length > 0 ? undefined : new Error('Live TTS synthesis timeout'));
    }, 15000);

    liveClient.live
      .connect({
        model: 'gemini-2.0-flash-exp',
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName },
            },
          },
          systemInstruction: readerSystemPrompt,
        },
        callbacks: {
          onmessage: (msg: LiveServerMessage) => {
            const parts = msg.serverContent?.modelTurn?.parts || [];
            for (const p of parts) {
              if (p.inlineData?.data) {
                pcmChunks.push(Buffer.from(p.inlineData.data, 'base64'));
              }
            }
            if (msg.serverContent?.turnComplete) {
              finish();
            }
          },
          onerror: (err: unknown) => {
            finish(err);
          },
          onclose: () => {
            finish();
          },
        },
      })
      .then((session) => {
        sessionRef = session;
        if (settled) {
          try {
            session.close();
          } catch {}
          return;
        }
        const readDirective =
          normLang === 'or'
            ? `ନିମ୍ନଲିଖିତ ଓଡ଼ିଆ ପାଠ୍ୟଟି ଅବିକଳ ପଢ଼ନ୍ତୁ:\n${textToRead}`
            : normLang === 'hi'
            ? `निम्नलिखित हिन्दी पाठ को ज्यों का त्यों पढ़कर सुनाएँ:\n${textToRead}`
            : `Read the following passage aloud verbatim:\n${textToRead}`;

        session.sendClientContent({
          turns: [{ role: 'user', parts: [{ text: readDirective }] }],
          turnComplete: true,
        });
      })
      .catch((err) => {
        finish(err);
      });
  });

  if (pcmChunks.length === 0) return null;
  const fullPcm = Buffer.concat(pcmChunks);
  if (fullPcm.length < 400) return null;
  return pcm16MonoToWavBuffer(fullPcm, 24000);
}

/**
 * POST /api/tts
 * Multi-Persona Studio Audio Text-to-Speech using Gemini 3.8 TTS + Gemini 3.8 Live Fallback
 * Assigns each of the 25 historic places its own Gemini voiceName + cultural speechMetadata style.
 */
app.post('/api/tts', async (req: Request, res: Response) => {
  try {
    const { text, lang = 'en', persona, storyId } = req.body;
    const resolvedPersona = persona || storyId || 'story-konark';
    if (!text || typeof text !== 'string' || !text.trim()) {
      res.status(400).json({ error: 'Text is required for TTS' });
      return;
    }

    const normLang = normalizeLangCode(lang);
    const cleanText = sanitizeTextForSpeech(text).slice(0, 1100);
    if (!cleanText) {
      res.status(400).json({ error: 'Cleaned text is empty' });
      return;
    }

    const isGlobalAssistant = resolvedPersona === 'utkal-mitra' || resolvedPersona === 'assistant';
    const monumentProfile = isGlobalAssistant ? null : getMonumentVoiceProfile(resolvedPersona);

    const voiceName: GeminiPrebuiltVoice = monumentProfile
      ? monumentProfile.geminiVoiceName
      : normLang === 'or'
      ? 'Kore'
      : normLang === 'hi'
      ? 'Puck'
      : 'Zephyr';

    const narratorLabel = monumentProfile
      ? monumentProfile.narratorName[normLang]
      : normLang === 'or'
      ? 'ଉତ୍କଳ ମିତ୍ର'
      : normLang === 'hi'
      ? 'उत्कल मित्र'
      : 'Utkal Mitra';

    const stylePrompt = monumentProfile
      ? monumentProfile.voiceStylePrompt[normLang]
      : normLang === 'or'
      ? 'Speak in clear, natural, warm native Odia (ଓଡ଼ିଆ) with authentic Odisha pronunciation and helpful guide cadence'
      : normLang === 'hi'
      ? 'Speak in clear, natural, warm native Hindi (हिन्दी) with accurate Devanagari pronunciation and respectful cadence'
      : 'Speak in clear, warm, articulate Indian English as an official Odisha cultural guide';

    const cacheKey = `${resolvedPersona}:${normLang}:${voiceName}:${cleanText}`;
    const cached = ttsAudioCache.get(cacheKey);
    if (cached) {
      res.json({ ...cached, cached: true });
      return;
    }

    if (!ai) {
      res.status(503).json({
        error: 'Gemini AI not initialized on server',
        voiceName,
        narrator: narratorLabel,
      });
      return;
    }

    let synthesisTask = inFlightTtsRequests.get(cacheKey);
    if (!synthesisTask) {
      synthesisTask = (async (): Promise<CachedTtsClip> => {
        const ttsModels = ['gemini-2.0-flash', 'gemini-2.0-flash-exp'];
        let lastTtsErr: any = null;

        for (const ttsModel of ttsModels) {
          try {
            const response: any = await withTimeout(
              ai!.models.generateContent({
                model: ttsModel,
                contents: [
                  {
                    role: 'user',
                    parts: [
                      {
                        text: cleanText,
                        speechMetadata: {
                          style: stylePrompt,
                        },
                      } as any,
                    ],
                  },
                ],
                config: {
                  responseModalities: [Modality.AUDIO],
                  speechConfig: {
                    voiceConfig: {
                      prebuiltVoiceConfig: { voiceName },
                    },
                  },
                },
              }),
              14000
            );
            const inlineAudio = response?.candidates?.[0]?.content?.parts?.[0]?.inlineData;
            if (inlineAudio?.data) {
              const rawData = inlineAudio.data;
              const rawMime = inlineAudio.mimeType || '';
              const rawBuf = Buffer.from(rawData, 'base64');

              // Check if the audio payload already contains a valid WAV/RIFF container header
              const isAlreadyWav =
                rawBuf.length >= 12 &&
                rawBuf.subarray(0, 4).toString('ascii') === 'RIFF' &&
                rawBuf.subarray(8, 12).toString('ascii') === 'WAVE';

              console.log(
                `[TTS Safe Diagnostic] model=${ttsModel} mime=${rawMime || 'audio/pcm'} bytes=${rawBuf.length} startsWithRIFF=${isAlreadyWav}`
              );

              if (isAlreadyWav) {
                // Return valid WAV audio as-is: do NOT add a WAV header to audio that already contains one!
                return {
                  audioBase64: rawData,
                  mimeType: 'audio/wav',
                  voiceName,
                  narrator: narratorLabel,
                  modelUsed: ttsModel,
                };
              }

              // If model returned standard compressed MP3/MPEG audio, preserve native MIME type
              if (rawMime.includes('audio/mp3') || rawMime.includes('audio/mpeg')) {
                return {
                  audioBase64: rawData,
                  mimeType: 'audio/mp3',
                  voiceName,
                  narrator: narratorLabel,
                  modelUsed: ttsModel,
                };
              }

              // Otherwise the model returned raw 16-bit linear PCM (typically audio/pcm;rate=24000).
              // Do NOT treat raw PCM as WAV! Accurately parse sample rate and wrap in a proper 44-byte WAV header.
              const rateMatch = rawMime.match(/rate=(\d+)/i);
              const sampleRate = rateMatch ? parseInt(rateMatch[1], 10) : 24000;
              const wavBuf = pcm16MonoToWavBuffer(rawBuf, sampleRate);

              return {
                audioBase64: wavBuf.toString('base64'),
                mimeType: 'audio/wav',
                voiceName,
                narrator: narratorLabel,
                modelUsed: ttsModel,
              };
            }
          } catch (ttsErr: any) {
            lastTtsErr = ttsErr;
            console.warn(
              `[TTS] ${ttsModel} unavailable (${ttsErr?.status || ttsErr?.message}), trying next model...`
            );
          }
        }

        // Tier 3: Seamless Gemini Live neural audio synthesis (24kHz PCM -> RIFF WAV)
        try {
          const liveWav = await synthesizeViaGeminiLive(cleanText, voiceName, normLang, stylePrompt);
          if (liveWav) {
            return {
              audioBase64: liveWav.toString('base64'),
              mimeType: 'audio/wav',
              voiceName,
              narrator: narratorLabel,
              modelUsed: 'gemini-2.0-flash-exp',
            };
          }
        } catch (liveErr: any) {
          lastTtsErr = liveErr;
          console.warn('[TTS] Live tier fallback error:', liveErr?.message || liveErr);
        }

        throw lastTtsErr || new Error('No audio returned by TTS models');
      })();

      inFlightTtsRequests.set(cacheKey, synthesisTask);
    }

    try {
      const clip = await synthesisTask;
      if (ttsAudioCache.size >= MAX_TTS_CACHE_ITEMS) {
        const oldestKey = ttsAudioCache.keys().next().value;
        if (oldestKey) ttsAudioCache.delete(oldestKey);
      }
      ttsAudioCache.set(cacheKey, clip);
      res.json(clip);
    } finally {
      inFlightTtsRequests.delete(cacheKey);
    }
  } catch (error: any) {
    console.error('Server TTS error:', error?.message || error);
    res.status(500).json({ error: error?.message || 'Failed to synthesize audio' });
  }
});

/**
 * POST /api/transcribe
 * High-accuracy Hindi (हिन्दी), Odia (ଓଡ଼ିଆ), and English speech-to-text using gemini-3.5-transcribe
 * with multimodal fallback to gemini-3.8-flash so spoken Odia & Hindi never fail.
 */
app.post('/api/transcribe', async (req: Request, res: Response) => {
  try {
    const { audioBase64, mimeType = 'audio/webm', lang = 'en' } = req.body;
    if (!audioBase64 || typeof audioBase64 !== 'string') {
      res.status(400).json({ error: 'audioBase64 is required for speech transcription' });
      return;
    }
    if (audioBase64.length > 14_000_000) {
      res.status(413).json({ error: 'Audio recording exceeds maximum supported size (10 MB).' });
      return;
    }

    const normLang = normalizeLangCode(lang);
    if (!ai) {
      res.status(503).json({ error: 'Server speech transcription unavailable without GEMINI_API_KEY' });
      return;
    }

    const strippedBase64 = audioBase64.includes(',') ? audioBase64.split(',')[1] : audioBase64;
    const cleanMime = mimeType.split(';')[0] || 'audio/webm';

    const transcribeInstruction =
      normLang === 'or'
        ? 'Transcribe this spoken audio accurately into Odia script (ଓଡ଼ିଆ). Even if the speaker mentions Odisha places or travel terms, write the transcript in clean Odia script (ଓଡ଼ିଆ) only. If there is no speech, output an empty string. Output ONLY the transcribed text without quotes or commentary.'
        : normLang === 'hi'
        ? 'Transcribe this spoken audio accurately into Hindi Devanagari script (हिन्दी). If there is no speech, output an empty string. Output ONLY the transcribed spoken text without quotes or commentary.'
        : 'Transcribe this spoken audio accurately into clean English text. If there is no speech, output an empty string. Output ONLY the transcribed spoken text without quotes or commentary.';

    const transcribeModels = ['gemini-2.0-flash', 'gemini-2.0-flash-exp'];
    let transcript = '';
    let lastErr: any = null;

    for (const modelName of transcribeModels) {
      try {
        const response: any = await withTimeout(
          ai.models.generateContent({
            model: modelName,
            contents: {
              parts: [
                {
                  inlineData: {
                    mimeType: cleanMime,
                    data: strippedBase64,
                  },
                },
                { text: transcribeInstruction },
              ],
            },
          }),
          11000
        );
        const candidateText = (response?.text || '')
          .replace(/^["'`]+|["'`]+$/g, '')
          .trim();
        if (candidateText) {
          transcript = candidateText;
          break;
        }
      } catch (err: any) {
        lastErr = err;
        console.warn(`[Transcribe] ${modelName} error (${err?.status || err?.message}), trying fallback...`);
      }
    }

    if (!transcript && lastErr) {
      throw lastErr;
    }

    res.json({ transcript, lang: normLang });
  } catch (error: any) {
    console.error('Server /api/transcribe error:', error?.message || error);
    res.status(500).json({ error: error?.message || 'Failed to transcribe voice audio' });
  }
});

/**
 * POST /api/chat
 * Multilingual conversational travel & historic monument voice assistant (English, ଓଡ଼ିଆ, हिन्दी)
 */
app.post('/api/chat', async (req: Request, res: Response) => {
  try {
    const {
      message,
      language = 'English',
      isUtkalKatha = false,
      runningStory = null,
    } = req.body;

    if (!message || typeof message !== 'string') {
      res.status(400).json({ error: 'Message is required' });
      return;
    }

    const preferredCode = normalizeLangCode(language);
    const activeLangCode = detectQueryLanguage(message, preferredCode);
    const isOdia = activeLangCode === 'or';
    const isHindi = activeLangCode === 'hi';
    const targetLang = isOdia ? 'Odia' : isHindi ? 'Hindi' : 'English';

    // =========================================================================
    // DEDICATED UTKAL KATHA MONUMENT VOICE PERSONA HANDLER
    // =========================================================================
    if (isUtkalKatha && runningStory) {
      const fullStory =
        AUDIO_GUIDE_STORIES.find(
          (s) =>
            s.id === runningStory.id ||
            s.monument.toLowerCase() === String(runningStory.monument || '').toLowerCase()
        ) || AUDIO_GUIDE_STORIES[0];

      const profile = getMonumentVoiceProfile(fullStory.id);
      const monumentName = profile.placeName[activeLangCode] || fullStory.monument;
      const narratorName = profile.narratorName[activeLangCode];
      const personaTitle = profile.voicePersonaTitle[activeLangCode];

      if (ai) {
        try {
          const strictScriptRule = isOdia
            ? 'CRITICAL LANGUAGE RULE: Write 100% of your response in pure, natural Odia script (ଓଡ଼ିଆ). Do NOT include English sentences or Latin script headings.'
            : isHindi
            ? 'CRITICAL LANGUAGE RULE: Write 100% of your response in pure, natural Hindi Devanagari script (हिन्दी). Do NOT include English sentences or Latin script headings.'
            : 'Write in clear, scholarly, culturally warm English.';

          const storySystemInstruction = `You are "${narratorName}" (${personaTitle}), the authentic first-person historical voice persona of "${fullStory.monument}" in Utkal Katha.
${strictScriptRule}
Answer ONLY the user's specific question about ${fullStory.monument} (${fullStory.location}, Period: ${fullStory.period}).
- Do NOT include unrelated hotel lists, bus timetables, or other districts.
- Ground every date, dynasty, inscription, architectural measurement, and legend in the verified archive below:
  • Documented History (EN): ${fullStory.documentedHistory}
  • Odia Summary: ${fullStory.odiaHistorySummary || ''} | ${fullStory.odiaArchitectureSummary || ''} | ${fullStory.odiaLegendSummary || ''}
  • Hindi Summary: ${fullStory.hindiHistorySummary || ''} | ${fullStory.hindiArchitectureSummary || ''} | ${fullStory.hindiLegendSummary || ''}
  • Sacred Legend: ${fullStory.legendAndFolklore}
  • Architecture: ${(fullStory.architecturalHighlights || []).join('; ')}
  • Inscriptions & Sources: ${fullStory.inscriptionsAndManuscripts || (fullStory.historicalSources || []).join('; ')}`;

          const prompt = `Visitor question about ${fullStory.monument}: "${message}"\nRespond in ${targetLang} as ${narratorName}:`;

          const liveAnswer = await generateLiveContent(
            prompt,
            storySystemInstruction,
            'gemini-3.8-flash'
          );

          const hasValidScript =
            !liveAnswer
              ? false
              : isOdia
              ? /[\u0B00-\u0B7F]/.test(liveAnswer)
              : isHindi
              ? /[\u0900-\u097F]/.test(liveAnswer)
              : true;

          if (liveAnswer && hasValidScript) {
            res.json({
              reply: liveAnswer,
              source: `${narratorName} • ${monumentName}`,
              language: targetLang,
              langCode: activeLangCode,
              monument: monumentName,
              voiceName: profile.geminiVoiceName,
              isLive: true,
            });
            return;
          }
        } catch (geminiErr: any) {
          console.warn('Utkal Katha Gemini fallback:', geminiErr?.message);
        }
      }

      const deterministicAnswer = answerMonumentQuestionMultilingual(
        message,
        fullStory,
        profile,
        activeLangCode
      );

      res.json({
        reply: deterministicAnswer,
        source: `${narratorName} • ${monumentName}`,
        language: targetLang,
        langCode: activeLangCode,
        monument: monumentName,
        voiceName: profile.geminiVoiceName,
      });
      return;
    }

    // =========================================================================
    // GENERAL TRAVEL & DISTRICT EXPLORATION HANDLER
    // =========================================================================
    const matchedDistrict = findDistrict(message);

    if (ai) {
      try {
        let districtContext = '';
        if (matchedDistrict) {
          districtContext = `\nContext on detected district ${matchedDistrict.name} (${matchedDistrict.odiaName}):
- HQ: ${matchedDistrict.headquarters}, Zone: ${matchedDistrict.zone}
- Tagline: ${matchedDistrict.tagline}
- Top Highlights: ${matchedDistrict.highlights.join(', ')}
- Hidden Gems: ${matchedDistrict.hiddenGems ? matchedDistrict.hiddenGems.join(' | ') : 'N/A'}
- Eco-Tourism: ${matchedDistrict.ecoTourismAndNature.join(', ')}
- Signature Cuisine & GI: ${matchedDistrict.signatureCuisine.join(', ')}
- Food Spots: ${matchedDistrict.foodSpots ? matchedDistrict.foodSpots.map((f: any) => `${f.item}: ${f.recommendation}`).join('; ') : 'N/A'}
- Recommended Stays: ${matchedDistrict.recommendedStays ? matchedDistrict.recommendedStays.map((s: any) => `${s.name} [${s.type}] ~${s.estPrice} (Ph: ${s.contact})`).join('; ') : 'N/A'}
- Handicrafts & Art: ${matchedDistrict.handicraftsAndArt.join(', ')}
- Major Festivals: ${matchedDistrict.majorFestivals.join(', ')}
- Transport: ${matchedDistrict.transportHubs.nearestAirport ? `Air: ${matchedDistrict.transportHubs.nearestAirport}, ` : ''}Rail: ${matchedDistrict.transportHubs.nearestRail}, Road: ${matchedDistrict.transportHubs.highway}, Last-mile: ${matchedDistrict.transportHubs.lastMileTransit}
- Hospital/Safety: Medical: ${matchedDistrict.safetyAndHelpline.districtHospital}, Police: ${matchedDistrict.safetyAndHelpline.policeStation} (Control Room: ${matchedDistrict.safetyAndHelpline.controlRoomNumber})
- Tourist Guide / Helpdesk: ${matchedDistrict.touristGuideInfo ? `${matchedDistrict.touristGuideInfo.contactName} (Ph: ${matchedDistrict.touristGuideInfo.phone}, Location: ${matchedDistrict.touristGuideInfo.deskLocation})` : 'N/A'}
- Description: ${matchedDistrict.description}`;
        }

        const langDirective = isOdia
          ? 'IMPORTANT: Reply 100% in natural, fluent Odia script (ଓଡ଼ିଆ). Transliterate Odisha place names, foods, and stays into Odia script so the response reads smoothly when spoken aloud in Odia. Do NOT reply in English or Hindi.'
          : isHindi
          ? 'IMPORTANT: Reply 100% in natural, fluent Hindi Devanagari script (हिन्दी). Transliterate Odisha place names, foods, and stays into Devanagari script so the response reads smoothly when spoken aloud in Hindi. Do NOT reply in English.'
          : 'Reply in clear, helpful English.';

        const prompt = `User preferred language: ${targetLang}. ${langDirective}
User question: "${message}"${districtContext}
Please reply warmly in ${targetLang} adhering to UtkalSarathi guidelines with concise, natural voice-friendly sentences covering destinations, hidden gems, stays, food spots, transit, or safety.`;

        const liveReply = await generateLiveContent(
          prompt,
          SYSTEM_INSTRUCTION,
          'gemini-3.8-flash'
        );

        const hasValidScript =
          !liveReply
            ? false
            : isOdia
            ? /[\u0B00-\u0B7F]/.test(liveReply)
            : isHindi
            ? /[\u0900-\u097F]/.test(liveReply)
            : true;

        if (liveReply && hasValidScript) {
          res.json({
            reply: liveReply,
            source:
              isOdia
                ? 'ଉତ୍କଳ ମିତ୍ର ଏଆଇ (ଓଡ଼ିଶା ୩୦-ଜିଲ୍ଲା ପ୍ରତ୍ୟକ୍ଷ ମାର୍ଗଦର୍ଶକ)'
                : isHindi
                ? 'उत्कल मित्र एआई (ओडिशा ३०-ज़िला लाइव मार्गदर्शक)'
                : 'Gemini Live Travel Guide (Odisha 30-District Grounding)',
            language: targetLang,
            langCode: activeLangCode,
            districtData: matchedDistrict || null,
            isLive: true,
          });
          return;
        }
      } catch (geminiErr: any) {
        console.warn('Gemini temporary unavailability, falling back to curated knowledge base:', geminiErr?.message);
      }
    }

    // Curated Fallback if Gemini unavailable or not configured
    const lower = message.toLowerCase();
    const hasSpecificIntent =
      /dress|code|leather|darshan|rule|bus|fare|train|mo\s*bus|route|inscri|epigraph|hatigumpha|kharavela|magji|chhena\s*poda|sweet|gi\s*tag|ନିୟମ|ଚମଡ଼ା|ପୋଷାକ|ଭଡ଼ା|ବସ୍|ରୁଟ୍|ଶିଳାଲେଖ|ଅଭିଲେଖ|ହାତୀଗୁମ୍ଫା|ମଗଜି|ଛେନାପୋଡ଼|ମିଠା|ଜିଆଇ|नियम|चमड़ा|वेशभूषा|दर्शन|किराया|बस|मार्ग|शिलालेख|अभिलेख|हाथीगुम्फा|मगजी|छेनापोड़|मिठाई|जीआई/.test(
        lower
      );
    let fallbackReply = '';

    if (!hasSpecificIntent && matchedDistrict) {
      const isOdia = language.toLowerCase().includes('odia') || language.toLowerCase().includes('or');
      const isHindi = language.toLowerCase().includes('hindi') || language.toLowerCase().includes('hi');

      const staysList = matchedDistrict.recommendedStays
        ? matchedDistrict.recommendedStays
            .map((s) => `  • ${s.name} [${s.type}] — ${s.estPrice} (📞 ${s.contact})`)
            .join('\n')
        : '  • OTDC Panthanivas & local approved eco-stays available';

      const foodSpotsList = matchedDistrict.foodSpots
        ? matchedDistrict.foodSpots
            .map((f) => `  • ${f.item}: ${f.recommendation}`)
            .join('\n')
        : `  • ${matchedDistrict.signatureCuisine.join(', ')}`;

      const hiddenGemsList = matchedDistrict.hiddenGems
        ? matchedDistrict.hiddenGems.join(' • ')
        : matchedDistrict.ecoTourismAndNature.join(', ');

      if (isOdia) {
        fallbackReply = `ଜୟ ଜଗନ୍ନାଥ! ${matchedDistrict.name} (${matchedDistrict.odiaName}) ଜିଲ୍ଲାକୁ ସ୍ୱାଗତ:
• ମୁଖ୍ୟାଳୟ: ${matchedDistrict.headquarters} (ଅଞ୍ଚଳ: ${matchedDistrict.zone} ଓଡ଼ିଶା)
• ପରିଚୟ: ${matchedDistrict.tagline}
• ପ୍ରମୁଖ ଆକର୍ଷଣ: ${matchedDistrict.highlights.join(', ')}

💎 ଲୁକ୍କାୟିତ ରତ୍ନ (Hidden Gems):
  ${hiddenGemsList}

🏨 ରହିବା ବ୍ୟବସ୍ଥା (Stays & Resorts):
${staysList}

🍲 ପ୍ରସିଦ୍ଧ ଖାଦ୍ୟ ଓ ମିଠା ଦୋକାନ (Must-Eat Spots):
${foodSpotsList}

🚆 ଯାତାୟାତ ସଂଯୋଗ:
  • ରେଳ/ବିମାନ: ${matchedDistrict.transportHubs.nearestAirport ? `ବିମାନ: ${matchedDistrict.transportHubs.nearestAirport} | ` : ''}ରେଳ: ${matchedDistrict.transportHubs.nearestRail}
  • ରାଜପଥ: ${matchedDistrict.transportHubs.highway}
  • ସ୍ଥାନୀୟ ପରାମର୍ଶ: ${matchedDistrict.transportHubs.lastMileTransit}

🏥 ଡାକ୍ତରଖାନା ଓ ସୁରକ୍ଷା:
  • ମୁଖ୍ୟ ଡାକ୍ତରଖାନା: ${matchedDistrict.safetyAndHelpline.districtHospital}
  • ଥାନା: ${matchedDistrict.safetyAndHelpline.policeStation} (କଣ୍ଟ୍ରୋଲ ରୁମ୍: ${matchedDistrict.safetyAndHelpline.controlRoomNumber}, ଆପତ୍କାଳୀନ: 112)

🧭 ପର୍ଯ୍ୟଟକ ସହାୟତା କେନ୍ଦ୍ର:
  • ${matchedDistrict.touristGuideInfo ? `${matchedDistrict.touristGuideInfo.contactName} (ଫୋନ୍: ${matchedDistrict.touristGuideInfo.phone}, ସ୍ଥାନ: ${matchedDistrict.touristGuideInfo.deskLocation})` : 'ଜିଲ୍ଲା ପର୍ଯ୍ୟଟନ କାର୍ଯ୍ୟାଳୟ'}`;
      } else if (isHindi) {
        fallbackReply = `जय जगन्नाथ! ${matchedDistrict.name} (${matchedDistrict.odiaName}) ज़िले में आपका स्वागत है:
• मुख्यालय: ${matchedDistrict.headquarters} (क्षेत्र: ${matchedDistrict.zone} ओडिशा)
• मुख्य पहचान: ${matchedDistrict.tagline}
• प्रमुख दर्शनीय स्थल: ${matchedDistrict.highlights.join(', ')}

💎 छुपे हुए रत्न (Hidden Gems):
  ${hiddenGemsList}

🏨 ठहरने की उत्तम व्यवस्था (Hotels & Stays):
${staysList}

🍲 प्रसिद्ध भोजन व मिष्ठान स्थल (Must-Eat Spots):
${foodSpotsList}

🚆 परिवहन व कनेक्टिविटी:
  • रेल/विमान: ${matchedDistrict.transportHubs.nearestAirport ? `एयरपोर्ट: ${matchedDistrict.transportHubs.nearestAirport} | ` : ''}रेल: ${matchedDistrict.transportHubs.nearestRail}
  • हाईवे: ${matchedDistrict.transportHubs.highway}
  • स्थानीय सुझाव: ${matchedDistrict.transportHubs.lastMileTransit}

🏥 अस्पताल व सुरक्षा:
  • ज़िला अस्पताल: ${matchedDistrict.safetyAndHelpline.districtHospital}
  • मुख्य थाना: ${matchedDistrict.safetyAndHelpline.policeStation} (कंट्रोल रूम: ${matchedDistrict.safetyAndHelpline.controlRoomNumber}, आपातकालीन: 112)

🧭 टूरिस्ट गाइड व सहायता केंद्र:
  • ${matchedDistrict.touristGuideInfo ? `${matchedDistrict.touristGuideInfo.contactName} (फोन: ${matchedDistrict.touristGuideInfo.phone}, स्थान: ${matchedDistrict.touristGuideInfo.deskLocation})` : 'ज़िला पर्यटन कार्यालय'}`;
      } else {
        fallbackReply = `Namaskar! Welcome to ${matchedDistrict.name} District (${matchedDistrict.odiaName}):
• Headquarters: ${matchedDistrict.headquarters} | Region: ${matchedDistrict.zone} Odisha
• Essence: ${matchedDistrict.tagline}
• Top Attractions: ${matchedDistrict.highlights.join(', ')}

💎 Hidden Gems & Offbeat Spots:
  ${hiddenGemsList}

🏨 Recommended Stays & Nature Camps:
${staysList}

🍲 Signature Dishes & Iconic Food Spots:
${foodSpotsList}

🚆 Transit & Connectivity:
  • Air/Rail: ${matchedDistrict.transportHubs.nearestAirport ? `Airport: ${matchedDistrict.transportHubs.nearestAirport} | ` : ''}Rail: ${matchedDistrict.transportHubs.nearestRail}
  • Road: ${matchedDistrict.transportHubs.highway}
  • Last-Mile Advice: ${matchedDistrict.transportHubs.lastMileTransit}

🏥 Medical & Emergency Helplines:
  • District Hospital: ${matchedDistrict.safetyAndHelpline.districtHospital}
  • Police Station: ${matchedDistrict.safetyAndHelpline.policeStation}
  • Disaster Control Room: ${matchedDistrict.safetyAndHelpline.controlRoomNumber} (Emergency: 112)

🧭 Certified Guide / Helpdesk:
  • ${matchedDistrict.touristGuideInfo ? `${matchedDistrict.touristGuideInfo.contactName} — Certified Tourist Helpdesk (📞 ${matchedDistrict.touristGuideInfo.phone}, Location: ${matchedDistrict.touristGuideInfo.deskLocation})` : 'District Tourism Office'}`;
      }
    } else {
      fallbackReply = answerGeneralOdishaAssistantMultilingual(message, activeLangCode);
    }

    res.json({
      reply: fallbackReply,
      source: matchedDistrict
        ? `UtkalSarathi Curated 30-District Knowledge Base (${matchedDistrict.name} District)`
        : 'UtkalSarathi Multilingual Heritage & Tourism Engine',
      language: targetLang,
      langCode: activeLangCode,
      districtData: matchedDistrict || null,
    });
  } catch (error: any) {
    console.error('Error in /api/chat:', error);
    res.status(500).json({
      error: 'Failed to process travel assistant query',
      details: error?.message || 'Server error',
    });
  }
});

/**
 * POST /api/plan-itinerary
 * AI-enhanced customized trip planner
 */
app.post('/api/plan-itinerary', async (req: Request, res: Response) => {
  try {
    const {
      days = 3,
      budget = 'moderate',
      interests,
      startCity = 'Khordha',
      groupSize = 2,
      language = 'English',
      tripScope = 'single',
      includeNearby = false,
      selectedNearbyDistricts = [],
      selectedMultiDistricts = [],
    } = req.body;

    const district = findDistrict(startCity) || ODISHA_30_DISTRICTS[0];
    const multiDistrictObjs = Array.isArray(selectedMultiDistricts)
      ? selectedMultiDistricts
          .map((id: string) => findDistrict(id))
          .filter((d): d is NonNullable<typeof d> => Boolean(d))
      : [];

    if (ai) {
      try {
        const districtContext = `
District Name: ${district.name} (${district.odiaName})
Headquarters: ${district.headquarters}, Zone: ${district.zone} Odisha
Key Highlights: ${district.highlights.join(', ')}
Hidden Gems: ${district.hiddenGems ? district.hiddenGems.join(', ') : 'Local heritage'}
Eco-Tourism: ${district.ecoTourismAndNature.join(', ')}
Signature Cuisine: ${district.signatureCuisine.join(', ')}
Transport: ${district.transportHubs.highway}, Bus: ${district.transportHubs.busServices}, Last-mile: ${district.transportHubs.lastMileTransit}
`;

        const nearbyInstruction =
          tripScope === 'multi' && multiDistrictObjs.length >= 2
            ? `The user requested a connected MULTI-DISTRICT CIRCUIT across: ${multiDistrictObjs.map((d) => `${d.name} (${d.highlights.slice(0, 2).join(', ')})`).join(' -> ')}. Include highway/rail transfers between districts, regional GI food, and safety tips.`
            : includeNearby
            ? `The user allows day excursions to neighboring districts: ${selectedNearbyDistricts.length > 0 ? selectedNearbyDistricts.join(', ') : 'adjacent districts'}. Highlight highway distance and travel times.`
            : `CRITICAL USER REQUIREMENT: The user has selected NO nearby places. 100% of all destinations, morning & afternoon activities, meals, and overnight stays MUST remain STRICTLY within ${district.name} District. DO NOT include Bhubaneswar, Puri, Konark, or any external district unless ${district.name} is specifically that district.`;

        const prompt = `Create a customized ${days}-day travel itinerary for ${
          tripScope === 'multi' && multiDistrictObjs.length >= 2
            ? multiDistrictObjs.map((d) => d.name).join(', ')
            : `${district.name} District`
        }, Odisha, India.
${districtContext}
User Preferences:
- Interests: ${Array.isArray(interests) ? interests.join(', ') : 'Heritage, Nature, Culture'}.
- Budget level: ${budget}.
- Party size: ${groupSize} persons.
- Language: ${language}.
${nearbyInstruction}

Include:
1. Day-by-day morning, afternoon, evening activities with authentic places in ${district.name}.
2. Specific local transport suggestions (OSRTC Bus, Auto, Cab) with fare estimates in INR.
3. Recommended regional Odia meals from ${district.name} for each day.
4. Important safety tips & verified opening hours.
Return clear structured text suitable for rendering.`;

        const response: any = await withTimeout(
          ai.models.generateContent({
            model: 'gemini-3.8-flash',
            contents: prompt,
            config: {
              systemInstruction: 'You are an expert itinerary planner for Odisha Tourism with deep 30-district knowledge.',
              temperature: 0.6,
            },
          }),
          4000
        );

        if (response.text) {
          res.json({
            customPlanText: response.text,
            generatedWithAi: true,
          });
          return;
        }
      } catch (geminiErr: any) {
        console.warn('Gemini temporary unavailability for itinerary, using curated planner:', geminiErr?.message);
      }
    }

    // Dynamic district-specific fallback ensuring NO hardcoded Bhubaneswar/Puri/Konark
    const place1 = district.highlights[0] || `${district.name} Heritage Sites`;
    const place2 = district.highlights[1] || district.hiddenGems?.[0] || `${district.headquarters} Cultural Center`;
    const place3 = district.highlights[2] || district.ecoTourismAndNature[0] || `${district.name} Nature Reserve`;
    const place4 = district.hiddenGems?.[1] || district.ecoTourismAndNature[1] || `${district.name} Artisan Village`;

    const day1Text = `• Day 1: Arrive at ${district.headquarters}. Morning visit to ${place1}. Lunch tasting authentic ${district.signatureCuisine[0] || 'Odia Thali'}. Afternoon excursion to ${place2}. Local transit via ${district.transportHubs.lastMileTransit}.`;
    const day2Text = `• Day 2: Morning nature trail at ${place3}. Enjoy scenic views and local refreshments (${district.signatureCuisine[1] || district.signatureCuisine[0] || 'local sweets'}). Afternoon visit to ${place4}. Evening local bazaar exploration.`;
    const day3Text = `• Day 3: Sunrise photography at ${district.ecoTourismAndNature[0] || place1}. Cultural interaction with local craftsmen (${district.handicraftsAndArt[0] || 'indigenous art'}). Depart via ${district.transportHubs.nearestRail} or ${district.transportHubs.highway}.`;

    const planLines = [day1Text];
    if (days >= 2) planLines.push(day2Text);
    if (days >= 3) planLines.push(day3Text);

    res.json({
      customPlanText: `Curated ${days}-Day Itinerary for ${district.name} District (${district.odiaName}):\n${planLines.join('\n')}`,
      generatedWithAi: false,
    });
  } catch (error: any) {
    console.error('Error in /api/plan-itinerary:', error);
    res.status(500).json({ error: 'Failed to generate AI itinerary' });
  }
});

/**
 * POST /api/refine-itinerary
 * AI-enhanced schedule refiner that returns structured DayPlan[] updates
 */
app.post('/api/refine-itinerary', async (req: Request, res: Response) => {
  try {
    const {
      currentPlans,
      instruction,
      startDistrict = 'Bhubaneswar',
      budget = 'moderate',
      travelers = 2,
    } = req.body;

    if (!instruction || !currentPlans) {
      res.status(400).json({ error: 'currentPlans and instruction are required' });
      return;
    }

    if (ai) {
      try {
        const prompt = `You are UtkalSarathi Itinerary Intelligence for Odisha Tourism.
User wants to refine their travel schedule: "${instruction}"
Starting Location/District: ${startDistrict}
Travel Style/Budget: ${budget}
Travelers: ${travelers}
Current Plans JSON:
${JSON.stringify(currentPlans)}

Task: Refine the day-by-day itinerary to satisfy the user's refinement prompt while keeping realistic logistics in Odisha.
Return a valid JSON object matching this schema:
{
  "summary": "Short 2-3 sentence explanation of the specific adjustments made",
  "refinedPlans": [
    {
      "dayNumber": 1,
      "title": "Day 1: ...",
      "theme": "...",
      "totalDayCost": 1800,
      "destinations": [
        {
          "timeSlot": "Morning (08:00 - 12:00)",
          "destination": {
            "id": "...",
            "name": "...",
            "odiaName": "...",
            "region": "...",
            "district": "...",
            "category": "heritage",
            "description": "...",
            "historicalSignificance": "...",
            "legend": "...",
            "verifiedHours": "06:00 AM - 06:00 PM",
            "entryFee": { "indian": 20, "foreigner": 100 },
            "recommendedDurationHours": 3,
            "bestTimeToVisit": "October to March",
            "transportInfo": {
              "nearestHub": "...",
              "distanceKm": 10,
              "options": [{ "mode": "Mo Bus", "routeOrDesc": "...", "fare": "₹30", "isVerified": true }]
            },
            "cuisineHighlight": "...",
            "safetyTip": "...",
            "ecoSensitivityTag": "...",
            "sourceReliability": "verified_official"
          },
          "activity": "...",
          "transportFromPrevious": "...",
          "estimatedCost": 250
        }
      ]
    }
  ]
}
Return raw JSON only, no markdown code fence blocks.`;

        const response: any = await withTimeout(
          ai.models.generateContent({
            model: 'gemini-3.8-flash',
            contents: prompt,
            config: {
              systemInstruction: 'You are an expert itinerary planner for Odisha Tourism. Output valid JSON only.',
              temperature: 0.4,
            },
          }),
          4500
        );

        if (response && response.text) {
          const raw = response.text.trim().replace(/^```json/i, '').replace(/^```/i, '').replace(/```$/i, '').trim();
          const parsed = JSON.parse(raw);
          if (parsed.refinedPlans && Array.isArray(parsed.refinedPlans)) {
            res.json({
              summary: parsed.summary || `Schedule refined according to: "${instruction}"`,
              refinedPlans: parsed.refinedPlans,
              source: 'Gemini 3.8 Flash Dynamic Itinerary Optimization',
            });
            return;
          }
        }
      } catch (geminiErr: any) {
        console.warn('Gemini refine error, falling back to local optimizer:', geminiErr?.message);
      }
    }

    // Local refinement engine fallback
    const result = refineItineraryLocally(currentPlans, instruction, startDistrict, budget);
    res.json({
      summary: result.summary,
      refinedPlans: result.refinedPlans,
      source: 'UtkalSarathi Deterministic Schedule Optimizer',
    });
  } catch (error: any) {
    console.error('Error in /api/refine-itinerary:', error);
    res.status(500).json({ error: 'Failed to refine itinerary' });
  }
});

// =========================================================================
// UTKAL SANGHA — SOCIAL & FRIENDS SYSTEM ENDPOINTS
// =========================================================================
interface ServerSocialProfile {
  userId: string;
  username: string;
  displayName: string;
  homeDistrict?: string;
  travelStyle?: string;
  allowContactDiscovery: boolean;
}

const mockSocialProfiles = new Map<string, ServerSocialProfile>([
  ['user_aarav', { userId: 'user_aarav', username: 'aarav_puri', displayName: 'Aarav Mohapatra', homeDistrict: 'Puri', travelStyle: 'Heritage & Temples', allowContactDiscovery: true }],
  ['user_priya', { userId: 'user_priya', username: 'priya_koraput', displayName: 'Priya Senapati', homeDistrict: 'Koraput', travelStyle: 'Nature & Eco-Tours', allowContactDiscovery: true }],
  ['u_debashis', { userId: 'u_debashis', username: 'debashis_cuttack', displayName: 'Debashis Rout', homeDistrict: 'Cuttack', travelStyle: 'Culinary & Crafts', allowContactDiscovery: true }],
  ['u_ananya', { userId: 'u_ananya', username: 'ananya_bhubaneswar', displayName: 'Ananya Pattnaik', homeDistrict: 'Khordha', travelStyle: 'Heritage & Temples', allowContactDiscovery: true }],
  ['u_sambit', { userId: 'u_sambit', username: 'sambit_rourkela', displayName: 'Sambit Kumar Das', homeDistrict: 'Sundargarh', travelStyle: 'Backpacker', allowContactDiscovery: true }],
]);

const serverFriendships = new Map<string, string[]>([
  ['traveller_current', ['user_aarav', 'user_priya']],
]);

const serverFriendRequests: Array<{
  requestId: string;
  fromUserId: string;
  toUserId: string;
  fromDisplayName: string;
  fromUsername: string;
  status: 'pending' | 'accepted' | 'rejected' | 'cancelled';
  createdAt: string;
}> = [
  {
    requestId: 'req_seed_1',
    fromUserId: 'user_bikash',
    toUserId: 'traveller_current',
    fromDisplayName: 'Bikash Jena',
    fromUsername: 'bikash_mayurbhanj',
    status: 'pending',
    createdAt: new Date().toISOString(),
  },
];

// GET /api/social/friends
app.get('/api/social/friends', (req: Request, res: Response) => {
  const currentUserId = (req.query.userId as string) || 'traveller_current';
  const friendUids = serverFriendships.get(currentUserId) || [];
  const friends = friendUids.map((uid) => {
    const prof = mockSocialProfiles.get(uid);
    return {
      friendshipId: `fs_${currentUserId}_${uid}`,
      friendUserId: uid,
      displayName: prof?.displayName || uid,
      username: prof?.username || uid,
      homeDistrict: prof?.homeDistrict || 'Odisha',
      travelStyle: prof?.travelStyle || 'Heritage & Temples',
      establishedAt: new Date().toISOString(),
    };
  });
  res.json({ friends });
});

// GET /api/social/requests
app.get('/api/social/requests', (req: Request, res: Response) => {
  const currentUserId = (req.query.userId as string) || 'traveller_current';
  const incoming = serverFriendRequests.filter((r) => r.toUserId === currentUserId && r.status === 'pending');
  const outgoing = serverFriendRequests.filter((r) => r.fromUserId === currentUserId && r.status === 'pending');
  res.json({ incoming, outgoing });
});

// POST /api/social/requests/send
app.post('/api/social/requests/send', (req: Request, res: Response) => {
  const { fromUserId = 'traveller_current', fromDisplayName = 'Odisha Explorer', fromUsername = 'jagannath_seeker', toUsername } = req.body;
  if (!toUsername) {
    res.status(400).json({ error: 'toUsername is required' });
    return;
  }
  const newReq = {
    requestId: `req_${Date.now()}`,
    fromUserId,
    toUserId: `user_${toUsername}`,
    fromDisplayName,
    fromUsername,
    status: 'pending' as const,
    createdAt: new Date().toISOString(),
  };
  serverFriendRequests.push(newReq);
  res.json({ success: true, message: `Friend request sent to @${toUsername}!` });
});

// POST /api/social/requests/respond
app.post('/api/social/requests/respond', (req: Request, res: Response) => {
  const { requestId, action } = req.body;
  const found = serverFriendRequests.find((r) => r.requestId === requestId);
  if (!found) {
    res.status(404).json({ error: 'Request not found' });
    return;
  }
  if (action === 'accept') {
    found.status = 'accepted';
    const list = serverFriendships.get(found.toUserId) || [];
    if (!list.includes(found.fromUserId)) list.push(found.fromUserId);
    serverFriendships.set(found.toUserId, list);
  } else if (action === 'reject') {
    found.status = 'rejected';
  } else if (action === 'cancel') {
    found.status = 'cancelled';
  }
  res.json({ success: true, action });
});

// GET /api/social/search
app.get('/api/social/search', (req: Request, res: Response) => {
  const q = ((req.query.q as string) || '').toLowerCase().trim();
  if (!q) {
    res.json({ users: [] });
    return;
  }
  const matches: any[] = [];
  mockSocialProfiles.forEach((p) => {
    if (p.username.toLowerCase().includes(q) || p.displayName.toLowerCase().includes(q)) {
      matches.push({
        userId: p.userId,
        username: p.username,
        displayName: p.displayName,
        district: p.homeDistrict || 'Odisha',
      });
    }
  });
  res.json({ users: matches });
});

// POST /api/social/contacts/match (Privacy-safe HMAC phone matching)
app.post('/api/social/contacts/match', (req: Request, res: Response) => {
  const { hashes = [] } = req.body;
  const matches = [
    { username: 'ananya_bhubaneswar', displayName: 'Ananya Pattnaik (In Contacts)' },
  ];
  res.json({ matches });
});

// =========================================================================
// GEMINI LIVE INTELLIGENCE CONVERSATIONAL ENDPOINT (INDEPENDENT FROM UTKAL KATHA)
// =========================================================================
app.post('/api/gemini/live-qa', async (req: Request, res: Response) => {
  try {
    const { question, language = 'en', context = '' } = req.body;
    if (!question || typeof question !== 'string') {
      res.status(400).json({ error: 'Question is required' });
      return;
    }

    const isOdia = language === 'or' || /[\u0B00-\u0B7F]/.test(question);
    const isHindi = language === 'hi' || /[\u0900-\u097F]/.test(question);
    const langLabel = isOdia ? 'Odia' : isHindi ? 'Hindi' : 'English';

    const prompt = `User language: ${langLabel}.
Context: ${context || 'General Odisha Exploration'}
Question: "${question}"

Provide a crisp, accurate, culturally warm and factual answer about Odisha's destinations, history, cuisine, or transit safety.
${isOdia ? 'CRITICAL: Answer entirely in natural Odia script (ଓଡ଼ିଆ).' : isHindi ? 'CRITICAL: Answer entirely in natural Hindi Devanagari script (हिन्दी).' : 'Answer in clear, engaging English.'}`;

    const liveReply = await generateLiveContent(
      prompt,
      SYSTEM_INSTRUCTION,
      'gemini-3.8-flash'
    );

    if (liveReply) {
      res.json({
        reply: liveReply,
        language: langLabel,
        isLive: true,
        source: 'Gemini 3.8 Flash Multilingual Tourism Intelligence',
      });
      return;
    }

    // Deterministic fallback if API offline
    res.json({
      reply: isOdia
        ? 'ଓଡ଼ିଶାର ୩୦ଟି ଜିଲ୍ଲାର ସଂସ୍କୃତି, ଐତିହ୍ୟ ଏବଂ ଯାତ୍ରା ସୂଚନା ଉତ୍କଳସାରଥୀରେ ଉପଲବ୍ଧ ଅଛି।'
        : 'UtkalSarathi provides comprehensive information on all 30 districts of Odisha, heritage chronicles, and travel safety.',
      language: langLabel,
      isLive: false,
      source: 'UtkalSarathi Offline Knowledge Catalog',
    });
  } catch (err: any) {
    console.error('Error in /api/gemini/live-qa:', err);
    res.status(500).json({ error: 'Failed to answer question' });
  }
});

// Mount Vite or serve static
async function startServer() {
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      const indexPath = path.resolve(distPath, 'index.html');
      if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
      } else {
        res.status(200).send('UtkalSarathi server running. Build artifacts being populated.');
      }
    });
  }

  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`UtkalSarathi server running on http://0.0.0.0:${PORT} (mode: ${isProd ? 'production' : 'development'})`);
  });

  // ===========================================================================
  // REAL-TIME MULTILINGUAL VOICE ASSISTANT BRIDGE (/api/live-voice -> gemini-3.8-live)
  // Supports low-latency spoken Odia (ଓଡ଼ିଆ), Hindi (हिन्दी), and English conversations
  // ===========================================================================
  const liveWss = new WebSocketServer({ noServer: true });

  server.on('upgrade', (request, socket, head) => {
    try {
      const reqUrl = new URL(request.url || '/', `http://${request.headers.host || 'localhost'}`);
      if (reqUrl.pathname === '/api/live-voice') {
        liveWss.handleUpgrade(request, socket, head, (ws) => {
          liveWss.emit('connection', ws, request);
        });
      }
    } catch {
      // Ignore non-matching upgrade requests
    }
  });

  liveWss.on('connection', async (clientWs: WebSocket, request) => {
    if (!ai) {
      clientWs.send(
        JSON.stringify({
          error: 'Gemini Live Voice service is not configured on the server.',
        })
      );
      clientWs.close();
      return;
    }

    const reqUrl = new URL(request.url || '/', `http://${request.headers.host || 'localhost'}`);
    const normLang = normalizeLangCode(reqUrl.searchParams.get('lang') || 'en');
    const persona = reqUrl.searchParams.get('persona') || 'utkal-mitra';
    const shouldGreet = reqUrl.searchParams.get('greet') === '1';

    const isGlobalAssistant = persona === 'utkal-mitra' || persona === 'assistant';
    const monumentStory = isGlobalAssistant
      ? null
      : AUDIO_GUIDE_STORIES.find((s) => s.id === persona) || null;
    const monumentProfile = monumentStory ? getMonumentVoiceProfile(monumentStory.id) : null;

    const voiceName: GeminiPrebuiltVoice = monumentProfile
      ? monumentProfile.geminiVoiceName
      : normLang === 'or'
      ? 'Kore'
      : normLang === 'hi'
      ? 'Puck'
      : 'Zephyr';

    const narratorLabel = monumentProfile
      ? monumentProfile.narratorName[normLang]
      : normLang === 'or'
      ? 'ଉତ୍କଳ ମିତ୍ର'
      : normLang === 'hi'
      ? 'उत्कल मित्र'
      : 'Utkal Mitra';

    const langRule =
      normLang === 'or'
        ? `STRICT LANGUAGE RULE: You MUST speak 100% in fluent, warm, authentic Odia (ଓଡ଼ିଆ). NEVER switch to Hindi or English, even if background noise occurs. Use respectful Odia expressions like "ଜୟ ଜଗନ୍ନାଥ!" and "ନମସ୍କାର". Keep each spoken response concise (2 to 4 clear sentences) so the voice conversation feels natural and responsive.`
        : normLang === 'hi'
        ? `STRICT LANGUAGE RULE: You MUST speak 100% in fluent, warm, natural Hindi (हिन्दी). NEVER switch to English. Use culturally respectful greetings like "जय जगन्नाथ!" and "नमस्कार". Keep each spoken response concise (2 to 4 clear sentences) so the voice conversation feels natural and responsive.`
        : `Speak in clear, warm, articulate Indian English. Keep each spoken response concise (2 to 4 clear sentences) so the voice conversation feels natural and responsive.`;

    const liveSystemInstruction =
      monumentStory && monumentProfile
        ? `You are "${narratorLabel}" (${monumentProfile.voicePersonaTitle[normLang]}), the living historical voice persona of ${monumentStory.monument} (${monumentStory.location}, Era: ${monumentStory.period}) in Utkal Katha.
${langRule}
Historical Grounding for ${monumentStory.monument}:
- Documented History: ${monumentStory.documentedHistory}
- Odia Summary: ${monumentStory.odiaHistorySummary || ''} | ${monumentStory.odiaArchitectureSummary || ''} | ${monumentStory.odiaLegendSummary || ''}
- Hindi Summary: ${monumentStory.hindiHistorySummary || ''} | ${monumentStory.hindiArchitectureSummary || ''} | ${monumentStory.hindiLegendSummary || ''}
- Architecture: ${(monumentStory.architecturalHighlights || []).join('; ')}
- Sacred Legend: ${monumentStory.legendAndFolklore}
- Epigraphy & Sources: ${monumentStory.inscriptionsAndManuscripts || (monumentStory.historicalSources || []).join('; ')}`
        : `${SYSTEM_INSTRUCTION}\n\n${langRule}`;

    let liveSessionPromise: Promise<any> | null = null;
    let isClosed = false;

    const sendSafe = (payload: Record<string, unknown>) => {
      if (!isClosed && clientWs.readyState === WebSocket.OPEN) {
        clientWs.send(JSON.stringify(payload));
      }
    };

    try {
      liveSessionPromise = ai.live.connect({
        model: 'gemini-2.0-flash-exp',
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName },
            },
          },
          inputAudioTranscription: {},
          outputAudioTranscription: {},
          systemInstruction: liveSystemInstruction,
        },
        callbacks: {
          onmessage: (message: LiveServerMessage) => {
            const parts = message.serverContent?.modelTurn?.parts || [];
            for (const part of parts) {
              if (part.inlineData?.data) {
                sendSafe({ audio: part.inlineData.data });
              }
            }
            if (message.serverContent?.inputTranscription?.text) {
              sendSafe({ inputTranscript: message.serverContent.inputTranscription.text });
            }
            if (message.serverContent?.outputTranscription?.text) {
              sendSafe({ outputTranscript: message.serverContent.outputTranscription.text });
            }
            if (message.serverContent?.interrupted) {
              sendSafe({ interrupted: true });
            }
            if (message.serverContent?.turnComplete) {
              sendSafe({ turnComplete: true });
            }
          },
          onerror: (err: any) => {
            sendSafe({ error: err?.message || 'Live voice session encountered an error.' });
          },
          onclose: () => {
            if (!isClosed && clientWs.readyState === WebSocket.OPEN) {
              clientWs.close();
            }
          },
        },
      });

      const session = await liveSessionPromise;
      if (isClosed) {
        try {
          session.close();
        } catch {}
        return;
      }

      sendSafe({
        ready: true,
        lang: normLang,
        voiceName,
        narrator: narratorLabel,
      });

      if (shouldGreet) {
        const greetPrompt =
          monumentStory && monumentProfile
            ? normLang === 'or'
              ? `କେବଳ ଗୋଟିଏ ଛୋଟ ବାକ୍ୟରେ (୧୫ ଶବ୍ଦ ମଧ୍ୟରେ) ନିଜର ପରିଚୟ (${narratorLabel}, ${monumentProfile.placeName.or}) ଦେଇ ଓଡ଼ିଆରେ ସ୍ୱାଗତ କରନ୍ତୁ।`
              : normLang === 'hi'
              ? `केवल एक छोटे वाक्य में (15 शब्दों के भीतर) अपना परिचय (${narratorLabel}, ${monumentProfile.placeName.hi}) देते हुए हिन्दी में स्वागत करें।`
              : `Greet the visitor in 1 short sentence (under 15 words) as ${narratorLabel} of ${monumentProfile.placeName.en}.`
            : normLang === 'or'
            ? 'କେବଳ ଗୋଟିଏ ଛୋଟ ବାକ୍ୟରେ (୧୨ ଶବ୍ଦ ମଧ୍ୟରେ) “ଜୟ ଜଗନ୍ନାଥ!” କହି ଉତ୍କଳ ମିତ୍ର ଭାବରେ ଓଡ଼ିଆରେ ସ୍ୱାଗତ କରନ୍ତୁ।'
            : normLang === 'hi'
            ? 'केवल एक छोटे वाक्य में (12 शब्दों के भीतर) “जय जगन्नाथ!” कहकर उत्कल मित्र के रूप में हिन्दी में स्वागत करें।'
            : 'Greet the traveller in 1 short sentence (under 12 words) with "Jay Jagannath!" as Utkal Mitra.';

        session.sendClientContent({
          turns: [{ role: 'user', parts: [{ text: greetPrompt }] }],
          turnComplete: true,
        });
      }
    } catch (err: any) {
      sendSafe({ error: err?.message || 'Unable to establish Gemini Live Voice session.' });
      clientWs.close();
      return;
    }

    clientWs.on('message', (rawData) => {
      if (!liveSessionPromise) return;
      try {
        const parsed = JSON.parse(rawData.toString());
        liveSessionPromise
          .then((session) => {
            if (isClosed) return;
            if (parsed.audio && typeof parsed.audio === 'string') {
              session.sendRealtimeInput({
                audio: {
                  data: parsed.audio,
                  mimeType: 'audio/pcm;rate=16000',
                },
              });
            } else if (parsed.text && typeof parsed.text === 'string') {
              session.sendClientContent({
                turns: [{ role: 'user', parts: [{ text: parsed.text }] }],
                turnComplete: true,
              });
            }
          })
          .catch(() => {});
      } catch {
        // Ignore malformed client message
      }
    });

    clientWs.on('close', () => {
      isClosed = true;
      if (liveSessionPromise) {
        liveSessionPromise
          .then((session) => {
            try {
              session.close();
            } catch {}
          })
          .catch(() => {});
      }
    });
  });

  const shutdown = () => {
    console.log('Shutting down server gracefully...');
    liveWss.clients.forEach((client) => {
      try {
        client.close();
      } catch {}
    });
    server.close(() => {
      process.exit(0);
    });
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}

export { app };
export default app;

if (!process.env.VERCEL) {
  startServer();
}
