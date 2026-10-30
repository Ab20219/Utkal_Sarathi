import test from 'node:test';
import assert from 'node:assert';
import { MONUMENT_VOICE_PROFILES, getMonumentVoiceProfile } from './monumentVoiceProfiles';
import { ODISHA_HISTORICAL_STORIES } from './odishaHistoricalStories';

test('verifies all 25 historic monuments have unique voice profiles, Gemini neural voices, and Hindi/Odia style prompts', () => {
  const storyIds = ODISHA_HISTORICAL_STORIES.map((s) => s.id);
  assert.strictEqual(storyIds.length, 25, 'All 25 Odisha historic monuments must be present');

  const pitches = new Set<number>();
  const narratorNames = new Set<string>();
  const geminiVoicesUsed = new Set<string>();
  const validGeminiVoices = new Set(['Charon', 'Puck', 'Kore', 'Fenrir', 'Zephyr']);

  for (const storyId of storyIds) {
    const profile = MONUMENT_VOICE_PROFILES[storyId];
    assert.ok(profile, `Voice profile must exist for monument story id: ${storyId}`);

    // Valid neural voice assignment
    assert.ok(
      validGeminiVoices.has(profile.geminiVoiceName),
      `Monument ${storyId} must have a valid Gemini TTS voice, got ${profile.geminiVoiceName}`
    );
    geminiVoicesUsed.add(profile.geminiVoiceName);

    // Distinct Hindi, Odia, and English voice style prompts
    assert.ok(profile.voiceStylePrompt.en.length > 15, `English voice style prompt required for ${storyId}`);
    assert.ok(profile.voiceStylePrompt.or.length > 15, `Odia voice style prompt required for ${storyId}`);
    assert.ok(profile.voiceStylePrompt.hi.length > 15, `Hindi voice style prompt required for ${storyId}`);

    // Multilingual names and titles must be present
    assert.ok(profile.placeName.en && profile.placeName.or && profile.placeName.hi);
    assert.ok(profile.narratorName.en && profile.narratorName.or && profile.narratorName.hi);
    assert.ok(profile.voicePersonaTitle.en && profile.voicePersonaTitle.or && profile.voicePersonaTitle.hi);

    // Timbre description must be defined
    assert.ok(profile.timbreDescription && profile.timbreDescription.length > 10);

    // Drone frequencies must contain 4 harmonic frequencies
    assert.strictEqual(profile.droneRootFreqs.length, 4);
    assert.ok(profile.droneRootFreqs[0] > 40 && profile.droneRootFreqs[0] < 220);

    // Multilingual cultural greetings in Odia and Devanagari scripts
    assert.ok(/[\u0B00-\u0B7F]/.test(profile.culturalGreeting.or), `Odia greeting must use Odia script for ${storyId}`);
    assert.ok(/[\u0900-\u097F]/.test(profile.culturalGreeting.hi), `Hindi greeting must use Devanagari script for ${storyId}`);
    assert.ok(profile.culturalGreeting.en.length > 5);

    // At least 3 curated questions in Odia, Hindi, and English
    assert.ok(profile.curatedQuestions.length >= 3);
    for (const q of profile.curatedQuestions) {
      assert.ok(/[\u0B00-\u0B7F]/.test(q.or), `Odia question must use Odia script for ${storyId}`);
      assert.ok(/[\u0900-\u097F]/.test(q.hi), `Hindi question must use Devanagari script for ${storyId}`);
      assert.ok(q.en.length > 5);
    }

    pitches.add(profile.basePitch);
    narratorNames.add(profile.narratorName.en);
  }

  assert.strictEqual(narratorNames.size, 25, 'Every one of the 25 monuments must have a distinct narrator identity');
  assert.strictEqual(geminiVoicesUsed.size, 5, 'All 5 Gemini TTS voice timbres must be utilized across monuments');
  assert.ok(pitches.size >= 12, 'Monuments must have diverse pitch calibrations');
});

test('getMonumentVoiceProfile returns profile for valid and fallback queries', () => {
  const konark = getMonumentVoiceProfile('story-konark');
  assert.strictEqual(konark.id, 'story-konark');
  assert.strictEqual(konark.placeName.en, 'Konark Sun Temple');

  const puri = getMonumentVoiceProfile('story-puri-jagannath');
  assert.strictEqual(puri.id, 'story-puri-jagannath');
  assert.ok(puri.narratorName.en.includes('Daitapati'));

  const taratarini = getMonumentVoiceProfile('story-jaugada-taratarini');
  assert.strictEqual(taratarini.id, 'story-jaugada-taratarini');

  // Fallback to Konark for unknown id
  const fallback = getMonumentVoiceProfile('unknown-random-id');
  assert.strictEqual(fallback.id, 'story-konark');
});
