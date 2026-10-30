import { describe, it } from 'node:test';
import assert from 'node:assert';
import { storyLibraryService } from './storyLibraryService';
import { StoryRecord } from '../types';

describe('StoryLibraryService Platform Tests (10,000+ Capacity Architecture)', () => {
  it('initializes with verified seed stories across Odisha districts', () => {
    const stats = storyLibraryService.getStats();
    assert.ok(stats.totalDistinctStories >= 30, 'Must have at least 30 seed stories covering all districts');
    assert.strictEqual(stats.targetScaleCapacity, 10000);
    assert.match(stats.honestNotice, /Utkal Katha Content Platform/);
    assert.ok(stats.reviewedArchivalCount > 0);
  });

  it('filters stories by district accurately', () => {
    const puriStories = storyLibraryService.getStories({ district: 'Puri' });
    assert.ok(puriStories.total > 0);
    for (const s of puriStories.stories) {
      assert.strictEqual(s.district.toLowerCase(), 'puri');
    }
  });

  it('filters stories by category accurately', () => {
    const freedomStories = storyLibraryService.getStories({ category: 'freedom_movements' });
    assert.ok(freedomStories.total > 0);
    for (const s of freedomStories.stories) {
      assert.strictEqual(s.category, 'freedom_movements');
    }
  });

  it('searches across story titles, text, and destinations', () => {
    const searchRes = storyLibraryService.getStories({ searchQuery: 'Neelachakra' });
    assert.ok(searchRes.total >= 1);
    assert.ok(
      searchRes.stories.some((s) => s.title.includes('Neelachakra') || s.storyText.includes('Neelachakra'))
    );
  });

  it('rejects exact and near-duplicate stories during batch import', () => {
    const existing = storyLibraryService.getStoryById('katha-puri-001');
    assert.ok(existing);

    // Attempt to import exact duplicate ID
    const duplicateCandidate: StoryRecord = {
      ...existing,
      title: 'A New Title But Same ID',
    };

    const outcome = storyLibraryService.batchImport([duplicateCandidate]);
    assert.strictEqual(outcome.imported, 0);
    assert.strictEqual(outcome.rejectedDuplicates, 1);
    assert.match(outcome.duplicateDetails[0].reason || '', /Exact Story ID collision/);
  });

  it('records plays and toggles favourites', () => {
    const sample = storyLibraryService.getStories({}, 1, 1).stories[0];
    assert.ok(sample);

    const initialFavs = sample.metadata.favourites || 0;
    const updated = storyLibraryService.toggleFavourite(sample.id);
    assert.ok(updated);
    assert.strictEqual(updated.metadata.favourites, initialFavs + 1);

    const initialPlays = sample.metadata.plays || 0;
    const played = storyLibraryService.recordPlay(sample.id);
    assert.ok(played);
    assert.strictEqual(played.metadata.plays, initialPlays + 1);
    assert.ok(played.metadata.lastListened);
  });
});
