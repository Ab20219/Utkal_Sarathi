import test from 'node:test';
import assert from 'node:assert/strict';
import {
  splitTranscriptIntoNarrationChunks,
  computeStoryTimelineState,
  resolveSeekPositionToChunk,
  formatSecondsMMSS,
} from './storyAudioTiming';
import { selectBestBrowserVoiceAndText } from './indicPhoneticBridge';

test('splits Odia, Hindi, and English transcripts on natural sentence boundaries without truncation', () => {
  const odiaText =
    'କୋଣାର୍କ ସୂର୍ଯ୍ୟ ମନ୍ଦିର ତ୍ରୟୋଦଶ ଶତାବ୍ଦୀରେ ରାଜା ଲାଙ୍ଗୁଳା ନରସିଂହ ଦେବଙ୍କ ଦ୍ୱାରା ନିର୍ମିତ ହୋଇଥିଲା। ଏଥିରେ ଚଉବିଶଟି ବିଶାଳ ପଥର ଚକ ଅଛି। ଧର୍ମପଦଙ୍କ ତ୍ୟାଗ ଓଡ଼ିଆ ଇତିହାସରେ ଅମର ଅଟେ।';
  const odiaChunks = splitTranscriptIntoNarrationChunks(odiaText, 90);
  assert.ok(odiaChunks.length >= 2, 'Should split Odia sentences cleanly on Danda (।)');
  assert.equal(odiaChunks[0].index, 0);
  assert.ok(odiaChunks.reduce((sum, c) => sum + c.wordCount, 0) >= 20);

  const hindiText =
    'कोणार्क सूर्य मंदिर का निर्माण तेरहवीं शताब्दी में सम्राट नरसिंहदेव प्रथम ने करवाया था। इसके चौबीस पहिए समय के चक्र को दर्शाते हैं।';
  const hindiChunks = splitTranscriptIntoNarrationChunks(hindiText, 80);
  assert.ok(hindiChunks.length >= 2, 'Should split Hindi sentences cleanly on Purnavirama (।)');
});

test('never marks story or timer over prematurely before final audio segment completes', () => {
  const chunks = splitTranscriptIntoNarrationChunks(
    'First historical chapter of Kalinga architecture with sandstone carvings. ' +
      'Second chapter detailing maritime voyages to Bali and Java from Chilika ports. ' +
      'Third concluding chapter on temple preservation and living heritage.',
    80
  );
  assert.equal(chunks.length, 3);

  // Mid-playback on final chunk even with long elapsed time -> MUST NOT mark story over until audio ended!
  const midLastChunk = computeStoryTimelineState({
    chunks,
    measuredDurationsSec: { 0: 14.5, 1: 16.2 },
    currentChunkIndex: 2,
    currentChunkElapsedSec: 18.0,
    isFinished: false,
    lang: 'en',
    effectiveRate: 1.0,
  });
  assert.equal(midLastChunk.isStoryOver, false, 'Must not end while final audio chunk is still speaking');
  assert.equal(midLastChunk.isTimeOver, false, 'Timer must not expire while narration is active');
  assert.ok(midLastChunk.progressPercent < 100, 'Progress stays < 100% until final segment finishes');

  // Once final segment fires onended (isFinished === true) -> both story and time complete together at 100%
  const completedState = computeStoryTimelineState({
    chunks,
    measuredDurationsSec: { 0: 14.5, 1: 16.2, 2: 19.3 },
    currentChunkIndex: 2,
    currentChunkElapsedSec: 0,
    isFinished: true,
    lang: 'en',
    effectiveRate: 1.0,
  });
  assert.equal(completedState.isStoryOver, true);
  assert.equal(completedState.isTimeOver, true);
  assert.equal(completedState.progressPercent, 100);
  assert.equal(completedState.remainingSec, 0);
  assert.equal(completedState.elapsedSec, completedState.totalDurationSec);
  assert.equal(formatSecondsMMSS(50), '0:50');
});

test('maps timeline seek fraction accurately to narration chunk index and offset', () => {
  const chunks = splitTranscriptIntoNarrationChunks(
    'Sentence one has several historical words here. Sentence two has an equal amount of words here.',
    50
  );
  const startSeek = resolveSeekPositionToChunk(0, chunks, {}, 'en', 1.0);
  assert.equal(startSeek.chunkIndex, 0);

  const endSeek = resolveSeekPositionToChunk(0.75, chunks, { 0: 10, 1: 10 }, 'en', 1.0);
  assert.equal(endSeek.chunkIndex, 1);
  assert.ok(endSeek.chunkOffsetSec >= 4.5 && endSeek.chunkOffsetSec <= 5.5);
});

test('prevents silent Hindi voice substitution for Odia by exposing explicit voice selection mode', () => {
  const mockVoices = [
    {
      name: 'Google हिन्दी',
      lang: 'hi-IN',
      default: false,
      localService: true,
      voiceURI: 'Google हिन्दी',
    } as SpeechSynthesisVoice,
  ];

  const odiaSelection = selectBestBrowserVoiceAndText('ଜୟ ଜଗନ୍ନାଥ', 'or', mockVoices, 'male', 0);
  assert.notEqual(
    odiaSelection.mode,
    'native_odia',
    'Must NOT claim native_odia when only hi-IN voice is installed'
  );
  assert.equal(
    odiaSelection.mode,
    'hindi_phonetic_bridge',
    'Explicitly flags hindi_phonetic_bridge so Utkal Katha blocks silent substitution unless user opts in'
  );
});
