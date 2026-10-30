import test from 'node:test';
import assert from 'node:assert/strict';
import {
  ODISHA_HISTORICAL_STORIES,
  HISTORIC_CORPUS_STATS,
  getTotalHistoricCorpusWordCount,
} from '../data/odishaHistoricalStories';
import { getMonumentVoiceProfile } from '../data/monumentVoiceProfiles';
import {
  answerMonumentQuestionMultilingual,
  answerGeneralOdishaAssistantMultilingual,
} from './utkalKathaVoiceEngine';

test('verifies Utkal Katha historic corpus exceeds 100,000+ real words across 25 distinct Odisha monuments', () => {
  assert.equal(ODISHA_HISTORICAL_STORIES.length, 25, 'Must have 25 distinct Odisha historic monuments');
  const totalWords = getTotalHistoricCorpusWordCount();
  assert.ok(
    totalWords >= 100000,
    `Total historic corpus words (${totalWords}) must be >= 100,000`
  );
  assert.equal(HISTORIC_CORPUS_STATS.totalMonuments, 25);
  assert.equal(HISTORIC_CORPUS_STATS.totalVolumes, 150, '25 monuments x 6 volumes = 150 encyclopedic volumes');

  const seenIds = new Set<string>();
  const seenTitles = new Set<string>();
  const seenTranscripts = new Set<string>();

  for (const story of ODISHA_HISTORICAL_STORIES) {
    assert.equal(seenIds.has(story.id), false, `Duplicate story id: ${story.id}`);
    assert.equal(seenTitles.has(story.title), false, `Duplicate story title: ${story.title}`);
    assert.equal(seenTranscripts.has(story.audioTranscriptEn), false, `Duplicate transcript for: ${story.id}`);
    seenIds.add(story.id);
    seenTitles.add(story.title);
    seenTranscripts.add(story.audioTranscriptEn);

    // Documented history vs oral legend separation + editorial review metadata
    assert.ok(story.documentedHistory.length > 150, `Documented history required for ${story.id}`);
    assert.ok(story.legendAndFolklore.length > 80, `Oral legend/folklore required for ${story.id}`);
    assert.ok(story.architecturalHighlights.length >= 3, `Architectural highlights required for ${story.id}`);
    assert.ok((story.historicalSources || []).length >= 2, `Historical citations required for ${story.id}`);
    assert.equal(story.editorialReviewStatus, 'verified_epigraphic_and_asi');
    assert.ok(story.lastUpdated && story.lastUpdated.length >= 10);

    // Hindi (Devanagari) & Odia (Odia script) transcripts present
    assert.ok(/[\u0B00-\u0B7F]/.test(story.audioTranscriptOr), `Odia transcript must contain Odia script for ${story.id}`);
    assert.ok(/[\u0900-\u097F]/.test(story.audioTranscriptHi), `Hindi transcript must contain Devanagari script for ${story.id}`);

    // 6-volume encyclopedia attached
    assert.ok(Array.isArray(story.encyclopedicVolumes) && story.encyclopedicVolumes.length === 6);
  }
});

test('verifies Hindi and Odia monument Q&A maintains strict language script consistency with zero English boilerplate', () => {
  const konark = ODISHA_HISTORICAL_STORIES.find((s) => s.id === 'story-konark')!;
  assert.ok(konark);
  const konarkVoice = getMonumentVoiceProfile('story-konark');

  const odiaReply = answerMonumentQuestionMultilingual('ଧର୍ମପଦ କିମ୍ବଦନ୍ତୀ କଣ?', konark, konarkVoice, 'or');
  assert.ok(/[\u0B00-\u0B7F]/.test(odiaReply), 'Odia Q&A reply must be in Odia script');
  assert.equal(/[A-Za-z]/.test(odiaReply), false, 'Zero Latin/English characters allowed in Odia reply');

  const hindiReply = answerMonumentQuestionMultilingual('कोणार्क के पत्थर के पहियों का रहस्य क्या है?', konark, konarkVoice, 'hi');
  assert.ok(/[\u0900-\u097F]/.test(hindiReply), 'Hindi Q&A reply must be in Devanagari script');
  assert.equal(/[A-Za-z]/.test(hindiReply), false, 'Zero Latin/English characters allowed in Hindi reply');

  const generalOdia = answerGeneralOdishaAssistantMultilingual('ପୁରୀ ଯାତ୍ରା ବିଷୟରେ କୁହନ୍ତୁ', 'or');
  assert.ok(/[\u0B00-\u0B7F]/.test(generalOdia));
  assert.equal(/[A-Za-z]/.test(generalOdia), false);

  const generalHindi = answerGeneralOdishaAssistantMultilingual('पुरी यात्रा की जानकारी दें', 'hi');
  assert.ok(/[\u0900-\u097F]/.test(generalHindi));
  assert.equal(/[A-Za-z]/.test(generalHindi), false);
});

test('verifies all 6 Utkal Mitra quick prompts return pure Indic script with zero Latin characters in Odia and Hindi', () => {
  // 1. Temple rules & dress code
  const dressOdia = answerGeneralOdishaAssistantMultilingual('ପୁରୀ ଶ୍ରୀମନ୍ଦିର ପ୍ରବେଶ ଓ ବେଶଭୂଷା ନିୟମ କ’ଣ?', 'or');
  assert.ok(/[\u0B00-\u0B7F]/.test(dressOdia), 'Odia dress code must have Odia script');
  assert.equal(/[A-Za-z]/.test(dressOdia), false, 'Zero Latin in Odia dress code');
  assert.ok(dressOdia.includes('ଚମଡ଼ା'), 'Must mention leather restrictions in Odia');

  const dressHindi = answerGeneralOdishaAssistantMultilingual('पुरी जगन्नाथ मंदिर दर्शन व वेशभूषा के क्या नियम हैं?', 'hi');
  assert.ok(/[\u0900-\u097F]/.test(dressHindi), 'Hindi dress code must have Devanagari');
  assert.equal(/[A-Za-z]/.test(dressHindi), false, 'Zero Latin in Hindi dress code');
  assert.ok(dressHindi.includes('चमड़े'), 'Must mention leather restrictions in Hindi');

  // 2. Mayurbhanj Similipal & Mudhi Mansa
  const mayurbhanjOdia = answerGeneralOdishaAssistantMultilingual('ମୟୂରଭଞ୍ଜ ଶିମିଳିପାଳ ସଫାରୀ ଓ ମୁଢ଼ି ମାଂସ ବିଷୟରେ କୁହନ୍ତୁ?', 'or');
  assert.ok(/[\u0B00-\u0B7F]/.test(mayurbhanjOdia));
  assert.equal(/[A-Za-z]/.test(mayurbhanjOdia), false);

  const mayurbhanjHindi = answerGeneralOdishaAssistantMultilingual('मयूरभंज: शिमिलिपाल सफारी, मुढ़ी मांसा और काई चटनी?', 'hi');
  assert.ok(/[\u0900-\u097F]/.test(mayurbhanjHindi));
  assert.equal(/[A-Za-z]/.test(mayurbhanjHindi), false);

  // 3. Koraput Coffee & Deomali Peak
  const koraputOdia = answerGeneralOdishaAssistantMultilingual('କୋରାପୁଟ କଫି, ଦେଓମାଳୀ ଏବଂ ଦୁଦୁମା ଜଳପ୍ରପାତ କିପରି ବୁଲିବି?', 'or');
  assert.ok(/[\u0B00-\u0B7F]/.test(koraputOdia));
  assert.equal(/[A-Za-z]/.test(koraputOdia), false);

  const koraputHindi = answerGeneralOdishaAssistantMultilingual('कोरापुट कॉफ़ी, देवमाली चोटी और दुदुमा झरना कैसे घूमें?', 'hi');
  assert.ok(/[\u0900-\u097F]/.test(koraputHindi));
  assert.equal(/[A-Za-z]/.test(koraputHindi), false);

  // 4. GI tags & Sweets (Dhenkanal Magji & Nayagarh Chhena Poda)
  const sweetsOdia = answerGeneralOdishaAssistantMultilingual('ଢେଙ୍କାନାଳ ମଗଜି ଓ ନୟାଗଡ଼ ଛେନାପୋଡ଼ ଜିଆଇ ଟ୍ୟାଗ୍ ମିଠା?', 'or');
  assert.ok(/[\u0B00-\u0B7F]/.test(sweetsOdia));
  assert.equal(/[A-Za-z]/.test(sweetsOdia), false);

  const sweetsHindi = answerGeneralOdishaAssistantMultilingual('ढेंकानाल मगजी और नयागढ़ छेना पोड़ जीआई टैग मिठाई?', 'hi');
  assert.ok(/[\u0900-\u097F]/.test(sweetsHindi));
  assert.equal(/[A-Za-z]/.test(sweetsHindi), false);

  // 5. Mo Bus route and fare
  const transitOdia = answerGeneralOdishaAssistantMultilingual('ଭୁବନେଶ୍ୱରରୁ ପୁରୀ ଓ କୋଣାର୍କ ମୋ ବସ୍ ଭଡ଼ା ଏବଂ ରୁଟ୍ କେତେ?', 'or');
  assert.ok(/[\u0B00-\u0B7F]/.test(transitOdia));
  assert.equal(/[A-Za-z]/.test(transitOdia), false);
  assert.ok(transitOdia.includes('୫୦') || transitOdia.includes('୭୦'), 'Must include Mo Bus fares in Odia');

  const transitHindi = answerGeneralOdishaAssistantMultilingual('भुवनेश्वर से पुरी और कोणार्क मो बस का किराया क्या है?', 'hi');
  assert.ok(/[\u0900-\u097F]/.test(transitHindi));
  assert.equal(/[A-Za-z]/.test(transitHindi), false);
  assert.ok(transitHindi.includes('50') || transitHindi.includes('70'), 'Must include Mo Bus fares in Hindi');

  // 6. Inscriptions & Epigraphy
  const epigraphyOdia = answerGeneralOdishaAssistantMultilingual('କୋଣାର୍କ, ଧଉଳି ଓ ଖାରବେଳଙ୍କ ହାତୀଗୁମ୍ଫା ଶିଳାଲେଖ ଇତିହାସ କ’ଣ?', 'or');
  assert.ok(/[\u0B00-\u0B7F]/.test(epigraphyOdia));
  assert.equal(/[A-Za-z]/.test(epigraphyOdia), false);

  const epigraphyHindi = answerGeneralOdishaAssistantMultilingual('कोणार्क, धौली और खारवेल के हाथीगुम्फा शिलालेखों का इतिहास क्या है?', 'hi');
  assert.ok(/[\u0900-\u097F]/.test(epigraphyHindi));
  assert.equal(/[A-Za-z]/.test(epigraphyHindi), false);
});
