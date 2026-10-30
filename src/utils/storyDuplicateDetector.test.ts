import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  checkStoryDuplicate,
  getDistinctOriginalStoriesCount,
  getTranslationCounts,
  levenshteinDistance,
  stringSimilarity,
  jaccardSimilarity,
  extractNgrams,
  calculateDurationType,
  estimateListeningDurationSec,
} from './storyDuplicateDetector';
import { StoryRecord } from '../types';

describe('Utkal Katha Story Duplicate & Translation Detection Suite', () => {
  const baseStory1: StoryRecord = {
    id: 'katha-puri-001',
    title: 'Neelachakra and the Patitapabana Flag of Shree Jagannath Temple',
    odiaTitle: 'ନୀଳଚକ୍ର ଏବଂ ପତିତପାବନ ବାନା',
    hindiTitle: 'नीलचक्र और पतितपावन ध्वज',
    district: 'Puri',
    destination: 'Shree Jagannath Temple',
    category: 'temples_architecture',
    period: '12th Century CE',
    originalLanguage: 'en',
    translations: {
      or: 'ନୀଳଚକ୍ର ହେଉଛି ଶ୍ରୀମନ୍ଦିର ଚୂଡ଼ାରେ ପ୍ରତିଷ୍ଠିତ ଅଷ୍ଟଧାତୁ ନିର୍ମିତ ପବିତ୍ର ଚକ୍ର...',
      hi: 'नीलचक्र श्री जगन्नाथ मंदिर के शिखर पर स्थापित अष्टधातु निर्मित पवित्र चक्र है...',
    },
    storyText:
      'High above the sacred Shreemandira of Puri, 214 feet in the sky, rests the divine Neelachakra. Cast from Ashtadhatu, an eight-metal alloy, it weighs over two tonnes and defies the coastal saline winds. Every afternoon, a fearless Chunara servitor scales the curved spire without ropes to change the Patitapabana Dhwaja fluttering against the sea breeze.',
    sourceReferences: ['Madala Panji', 'ASI Puri Architectural Survey Report 1982'],
    publicationMetadata: {
      authorOrSource: 'Shree Jagannath Temple Epigraphy Archive',
      yearOrCitation: '1982',
    },
    verificationStatus: 'reviewed_archival',
    estimatedListeningDurationSec: 180,
    durationType: 'short',
    metadata: {
      plays: 1420,
      favourites: 380,
      downloads: 95,
    },
  };

  const baseStory2: StoryRecord = {
    id: 'katha-mayur-002',
    title: 'The Royal Chhau Martial Dance Tradition of Baripada',
    odiaTitle: 'ମୟୂରଭଞ୍ଜର ରାଜକୀୟ ଛଉ ନୃତ୍ୟ',
    hindiTitle: 'मयूरभंज की राजसी छऊ नृत्य परंपरा',
    district: 'Mayurbhanj',
    destination: 'Baripada Chhau Grounds',
    category: 'festivals_crafts',
    period: '18th-19th Century CE - Bhanja Dynasty',
    originalLanguage: 'en',
    translations: {
      or: 'ମୟୂରଭଞ୍ଜ ଛଉ ଏକ ବିରଳ ଯୁଦ୍ଧକଳା ଭିତ୍ତିକ ଶାସ୍ତ୍ରୀୟ ନୃତ୍ୟ ଯାହା ଭଞ୍ଜ ରାଜାମାନଙ୍କ ପୃଷ୍ଠପୋଷକତାରେ ବିକଶିତ ହୋଇଥିଲା...',
    },
    storyText:
      'The Mayurbhanj Chhau is an ancient martial dance born under the royal patronage of the Bhanja rulers in Baripada. Unlike Seraikela and Purulia Chhau, the dancers of Mayurbhanj perform without facial masks, relying on expressive acrobatic footwork (Ufli) and vigorous leaps to portray mythological epics.',
    sourceReferences: ['Bhanja Royal Palace Archives', 'Sangeet Natak Akademi Monographs'],
    publicationMetadata: {
      authorOrSource: 'Odishan Folk & Martial Arts Trust',
      yearOrCitation: '1998',
    },
    verificationStatus: 'reviewed_archival',
    estimatedListeningDurationSec: 240,
    durationType: 'narrative',
    metadata: {
      plays: 890,
      favourites: 210,
      downloads: 45,
    },
  };

  const catalog: StoryRecord[] = [baseStory1, baseStory2];

  it('detects exact ID collision', () => {
    const candidate: StoryRecord = {
      ...baseStory1,
      title: 'Completely Different Title',
    };
    const result = checkStoryDuplicate(candidate, catalog);
    assert.strictEqual(result.isDuplicate, true);
    assert.strictEqual(result.duplicateOfId, 'katha-puri-001');
    assert.match(result.reason || '', /Exact Story ID collision/);
  });

  it('detects duplicate by closely matching title and same district', () => {
    const candidate: StoryRecord = {
      id: 'katha-puri-999',
      title: 'Neelachakra and the Patitapabana Flag of Jagannath Temple Puri',
      district: 'Puri',
      destination: 'Shree Jagannath Temple',
      category: 'temples_architecture',
      originalLanguage: 'en',
      storyText:
        'A different write-up about how servitors scale the spire daily to replace the flag fluttering in coastal winds.',
      sourceReferences: ['Temple Chronicle'],
      publicationMetadata: { authorOrSource: 'Local lore' },
      verificationStatus: 'ai_generated_unreviewed',
      estimatedListeningDurationSec: 150,
      durationType: 'short',
      metadata: { plays: 0, favourites: 0, downloads: 0 },
    };

    const result = checkStoryDuplicate(candidate, catalog);
    assert.strictEqual(result.isDuplicate, true);
    assert.strictEqual(result.duplicateOfId, 'katha-puri-001');
  });

  it('detects duplicate by high narrative text similarity (>78%)', () => {
    const candidate: StoryRecord = {
      id: 'katha-puri-888',
      title: 'Chunara Servitors of Shreemandira',
      district: 'Puri',
      destination: 'Jagannath Mandir Spire',
      category: 'temples_architecture',
      originalLanguage: 'en',
      storyText:
        'High above the sacred Shreemandira of Puri, 214 feet in the sky, rests the divine Neelachakra. Cast from Ashtadhatu, an eight-metal alloy, it weighs over two tonnes and defies coastal winds. Every afternoon, a fearless Chunara servitor scales the spire without ropes to change the Patitapabana Dhwaja fluttering against sea breeze.',
      sourceReferences: ['Local report'],
      publicationMetadata: { authorOrSource: 'Unknown' },
      verificationStatus: 'ai_generated_unreviewed',
      estimatedListeningDurationSec: 180,
      durationType: 'short',
      metadata: { plays: 0, favourites: 0, downloads: 0 },
    };

    const result = checkStoryDuplicate(candidate, catalog);
    assert.strictEqual(result.isDuplicate, true);
    assert.strictEqual(result.duplicateOfId, 'katha-puri-001');
  });

  it('accepts completely new genuine stories without false duplication', () => {
    const newStory: StoryRecord = {
      id: 'katha-koraput-001',
      title: 'The Sacred Gupteswar Cave Temple and Shabari River Sanctuary',
      district: 'Koraput',
      destination: 'Gupteswar Cave',
      category: 'temples_architecture',
      originalLanguage: 'en',
      storyText:
        'Hidden within the dense deciduous forests of Ramagiri hills in Koraput district, Gupteswar is a limestone cave shrine dedicated to Lord Shiva. Pilgrims trek alongside the sacred Kolab and Shabari rivers during Sravana and Shivaratri.',
      sourceReferences: ['Koraput District Gazetteer 1966'],
      publicationMetadata: { authorOrSource: 'Govt of Odisha' },
      verificationStatus: 'reviewed_archival',
      estimatedListeningDurationSec: 210,
      durationType: 'narrative',
      metadata: { plays: 0, favourites: 0, downloads: 0 },
    };

    const result = checkStoryDuplicate(newStory, catalog);
    assert.strictEqual(result.isDuplicate, false);
    assert.strictEqual(result.isNearDuplicate, false);
  });

  it('never counts translations of the same story as separate original stories', () => {
    // 2 original stories, both with Odia and Hindi translations
    const count = getDistinctOriginalStoriesCount(catalog);
    assert.strictEqual(count, 2, 'Distinct original story count must equal exactly 2 unique IDs');

    // If an incoming translation array is passed with duplicate IDs
    const extendedList: StoryRecord[] = [
      ...catalog,
      { ...baseStory1, originalLanguage: 'or' }, // translation entry
    ];
    const distinctCountAfterTranslation = getDistinctOriginalStoriesCount(extendedList);
    assert.strictEqual(
      distinctCountAfterTranslation,
      2,
      'Translations must not increment distinct original story counter'
    );
  });

  it('accurately counts translated versions across languages', () => {
    const counts = getTranslationCounts(catalog);
    assert.strictEqual(counts.englishCount, 2);
    assert.strictEqual(counts.odiaCount, 2);
    assert.strictEqual(counts.hindiCount, 2);
    assert.strictEqual(counts.totalTranslatedVersions, 3); // 2 translations in story1 (or, hi) + 1 in story2 (or)
  });

  it('calculates duration types and estimates seconds accurately', () => {
    assert.strictEqual(calculateDurationType(120), 'short');
    assert.strictEqual(calculateDurationType(180), 'short');
    assert.strictEqual(calculateDurationType(300), 'narrative');
    assert.strictEqual(calculateDurationType(480), 'narrative');
    assert.strictEqual(calculateDurationType(600), 'extended');

    const sampleText = 'Lord Jagannath is worshipped in Puri with ancient rituals.';
    const estSec = estimateListeningDurationSec(sampleText);
    assert.ok(estSec >= 30, 'Minimum duration is 30s');
  });

  it('computes Levenshtein and Jaccard metrics correctly', () => {
    const dist = levenshteinDistance('Konark', 'Konarka');
    assert.strictEqual(dist, 1);

    const sim = stringSimilarity('Jagannath', 'Jagannath');
    assert.strictEqual(sim, 1.0);

    const ngrams1 = extractNgrams('Shree Jagannath Puri');
    const ngrams2 = extractNgrams('Shree Jagannath Puri');
    assert.strictEqual(jaccardSimilarity(ngrams1, ngrams2), 1.0);
  });
});
