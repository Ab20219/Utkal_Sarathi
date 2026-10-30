import test from 'node:test';
import assert from 'node:assert';
import { utkalKathaRepositoryV2, COMMON_TRILINGUAL_VOCABULARY } from '../data/utkalKathaCorpusV2';
import { PRESERVED_25_MONUMENTS_META, STANDARD_CHAPTER_THEMES } from './utkalKathaServiceV2';

test('verifies all 25 canonical Odisha heritage monuments are preserved in Utkal Katha V2', () => {
  const result = utkalKathaRepositoryV2.getAll({ limit: 100 });
  assert.strictEqual(result.total, 25, 'Total preserved monuments must be exactly 25');
  assert.strictEqual(result.stories.length, 25, 'Returned stories count must be 25');

  for (const meta of PRESERVED_25_MONUMENTS_META) {
    const story = utkalKathaRepositoryV2.getById(meta.id);
    assert.ok(story, `Story must exist for ${meta.id} (${meta.name})`);
    assert.strictEqual(story.districtId, meta.districtId);
    assert.ok(story.titleEn.length > 5);
    assert.ok(story.titleOr.length > 5);
    assert.ok(story.titleHi.length > 5);
  }
});

test('verifies every one of the 25 stories has 20 structured chapters in EN, Odia and Hindi', () => {
  const result = utkalKathaRepositoryV2.getAll({ limit: 100 });

  for (const story of result.stories) {
    assert.strictEqual(story.chapters.length, 20, `Story ${story.id} must have exactly 20 chapters`);
    assert.strictEqual(story.chapterCount, 20);

    // Verify all 20 standard themes are covered in order
    story.chapters.forEach((ch, idx) => {
      assert.strictEqual(ch.chapterNumber, idx + 1);
      assert.strictEqual(ch.themeKey, STANDARD_CHAPTER_THEMES[idx].key);

      // Verify content length in all 3 languages
      assert.ok(ch.contentEn.length > 30, `English content missing in ${story.id} ch ${ch.chapterNumber}`);
      assert.ok(ch.contentOr.length > 30, `Odia content missing in ${story.id} ch ${ch.chapterNumber}`);
      assert.ok(ch.contentHi.length > 30, `Hindi content missing in ${story.id} ch ${ch.chapterNumber}`);

      // Verify authentic Indic scripts
      assert.ok(/[\u0B00-\u0B7F]/.test(ch.contentOr), `Odia script missing in ${story.id} ch ${ch.chapterNumber}`);
      assert.ok(/[\u0900-\u097F]/.test(ch.contentHi), `Devanagari script missing in ${story.id} ch ${ch.chapterNumber}`);
    });
  }
});

test('verifies trilingual vocabulary comparison glossary is present for word-by-word feature', () => {
  const vocab = utkalKathaRepositoryV2.getVocabulary('story-konark');
  assert.ok(vocab, 'Vocabulary must exist for Konark');
  assert.ok(vocab.length >= 10, 'Vocabulary glossary must contain multiple terms');

  for (const term of vocab) {
    assert.ok(term.term.length > 0, 'English term must be present');
    assert.ok(/[\u0B00-\u0B7F]/.test(term.odia), 'Odia term must use Odia script');
    assert.ok(/[\u0900-\u097F]/.test(term.hindi), 'Hindi term must use Devanagari script');
    assert.ok(term.context.length > 10, 'Context explanation must be comprehensive');
  }
});

test('verifies pagination and chapter-by-chapter lazy loading prevents heavy payload overhead', () => {
  // Page 1 (first 10 chapters)
  const page1 = utkalKathaRepositoryV2.getChapters('story-konark', 1, 10);
  assert.ok(page1);
  assert.strictEqual(page1.chapters.length, 10);
  assert.strictEqual(page1.page, 1);
  assert.strictEqual(page1.totalPages, 2);

  // Page 2 (next 10 chapters)
  const page2 = utkalKathaRepositoryV2.getChapters('story-konark', 2, 10);
  assert.ok(page2);
  assert.strictEqual(page2.chapters.length, 10);
  assert.strictEqual(page2.page, 2);
  assert.strictEqual(page2.chapters[0].chapterNumber, 11);
});

test('verifies audio mapping resolves bundled WAV files across English, Odia, and Hindi', () => {
  const konark = utkalKathaRepositoryV2.getById('story-konark');
  assert.ok(konark);
  assert.ok(konark.audioFiles.en.includes('story-konark-en-seg0.wav'));
  assert.ok(konark.audioFiles.or.includes('story-konark-or-seg0.wav'));
  assert.ok(konark.audioFiles.hi.includes('story-konark-hi-seg0.wav'));
});

test('verifies user progress tracking and favourites functionality', () => {
  const favResult = utkalKathaRepositoryV2.toggleFavourite('story-konark');
  assert.ok(favResult);
  assert.ok(favResult.favouriteCount > 0);

  const prog = utkalKathaRepositoryV2.saveProgress('test-user', 'story-konark', 5, 120, false);
  assert.strictEqual(prog.storyId, 'story-konark');
  assert.strictEqual(prog.chapterNumber, 5);
  assert.strictEqual(prog.positionSec, 120);

  const retrieved = utkalKathaRepositoryV2.getProgress('test-user', 'story-konark');
  assert.ok(retrieved);
  assert.strictEqual(retrieved.chapterNumber, 5);
});
