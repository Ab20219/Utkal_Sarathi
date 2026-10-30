/**
 * Utkal Katha V2 Dedicated Express API Router
 *
 * Versioned RESTful endpoints mounted at:
 * /api/v2/utkal-katha/*
 */

import { Router, type Request, type Response } from 'express';
import { utkalKathaRepositoryV2 } from '../data/utkalKathaCorpusV2';

export const utkalKathaV2Router = Router();

/**
 * GET /api/v2/utkal-katha/stories
 * Retrieve all preserved stories with optional filters & pagination
 */
utkalKathaV2Router.get('/stories', (req: Request, res: Response) => {
  const { district, search, limit = '50', offset = '0' } = req.query;

  const result = utkalKathaRepositoryV2.getAll({
    districtId: typeof district === 'string' ? district : undefined,
    search: typeof search === 'string' ? search : undefined,
    limit: parseInt(String(limit), 10) || 50,
    offset: parseInt(String(offset), 10) || 0,
  });

  res.json({
    success: true,
    total: result.total,
    count: result.stories.length,
    stories: result.stories.map((s) => ({
      id: s.id,
      districtId: s.districtId,
      destinationName: s.destinationName,
      titleEn: s.titleEn,
      titleOr: s.titleOr,
      titleHi: s.titleHi,
      historicalPeriod: s.historicalPeriod,
      factClassification: s.factClassification,
      narratorIdentity: s.narratorIdentity,
      totalWordCountEn: s.totalWordCountEn,
      chapterCount: s.chapterCount,
      audioFiles: s.audioFiles,
      stats: s.stats,
    })),
  });
});

/**
 * GET /api/v2/utkal-katha/stats
 * Complete corpus and listening analytics
 */
utkalKathaV2Router.get('/stats', (_req: Request, res: Response) => {
  const stats = utkalKathaRepositoryV2.getStats();
  res.json({
    success: true,
    stats,
  });
});

/**
 * GET /api/v2/utkal-katha/stories/:storyId
 * Full story overview
 */
utkalKathaV2Router.get('/stories/:storyId', (req: Request, res: Response) => {
  const story = utkalKathaRepositoryV2.getById(req.params.storyId);
  if (!story) {
    res.status(404).json({ success: false, error: 'Heritage story not found' });
    return;
  }
  res.json({
    success: true,
    story,
  });
});

/**
 * GET /api/v2/utkal-katha/stories/:storyId/chapters
 * Paginated chapter listing for a story
 */
utkalKathaV2Router.get('/stories/:storyId/chapters', (req: Request, res: Response) => {
  const { page = '1', limit = '20', lang } = req.query;
  const p = parseInt(String(page), 10) || 1;
  const lim = parseInt(String(limit), 10) || 20;

  const result = utkalKathaRepositoryV2.getChapters(
    req.params.storyId,
    p,
    lim,
    lang as any
  );

  if (!result) {
    res.status(404).json({ success: false, error: 'Heritage story not found' });
    return;
  }

  res.json({
    success: true,
    storyId: req.params.storyId,
    ...result,
  });
});

/**
 * GET /api/v2/utkal-katha/stories/:storyId/chapters/:chapterId
 * Full text of a single chapter in English, Odia, and Hindi with vocabulary
 */
utkalKathaV2Router.get('/stories/:storyId/chapters/:chapterId', (req: Request, res: Response) => {
  const chapterNum = parseInt(req.params.chapterId, 10);
  if (isNaN(chapterNum)) {
    res.status(400).json({ success: false, error: 'Invalid chapter number' });
    return;
  }

  const chapter = utkalKathaRepositoryV2.getChapter(req.params.storyId, chapterNum);
  if (!chapter) {
    res.status(404).json({ success: false, error: 'Chapter not found' });
    return;
  }

  res.json({
    success: true,
    storyId: req.params.storyId,
    chapter,
  });
});

/**
 * GET /api/v2/utkal-katha/stories/:storyId/vocabulary
 * Trilingual word-by-word glossary for the story
 */
utkalKathaV2Router.get('/stories/:storyId/vocabulary', (req: Request, res: Response) => {
  const vocab = utkalKathaRepositoryV2.getVocabulary(req.params.storyId);
  if (!vocab) {
    res.status(404).json({ success: false, error: 'Heritage story not found' });
    return;
  }

  res.json({
    success: true,
    storyId: req.params.storyId,
    vocabulary: vocab,
  });
});

/**
 * GET /api/v2/utkal-katha/stories/:storyId/audio
 * Resolves authentic audio URL (bundled WAV or neural cloud stream)
 */
utkalKathaV2Router.get('/stories/:storyId/audio', (req: Request, res: Response) => {
  const { lang = 'en' } = req.query;
  const story = utkalKathaRepositoryV2.getById(req.params.storyId);
  if (!story) {
    res.status(404).json({ success: false, error: 'Story not found' });
    return;
  }

  const validLang = lang === 'or' ? 'or' : lang === 'hi' ? 'hi' : 'en';
  const audioUrl = story.audioFiles[validLang];

  res.json({
    success: true,
    storyId: story.id,
    language: validLang,
    audioUrl,
    format: 'audio/wav',
    sampleRate: 24000,
    narrator: story.narratorIdentity[validLang],
    isBundled: true,
  });
});

/**
 * POST /api/v2/utkal-katha/stories/:storyId/favourite
 * Toggle favourite for a story
 */
utkalKathaV2Router.post('/stories/:storyId/favourite', (req: Request, res: Response) => {
  const result = utkalKathaRepositoryV2.toggleFavourite(req.params.storyId);
  if (!result) {
    res.status(404).json({ success: false, error: 'Story not found' });
    return;
  }
  res.json({ success: true, ...result });
});

/**
 * POST /api/v2/utkal-katha/stories/:storyId/play
 * Increment play count for a story
 */
utkalKathaV2Router.post('/stories/:storyId/play', (req: Request, res: Response) => {
  const { chapterNumber } = req.body || {};
  const result = utkalKathaRepositoryV2.recordPlay(req.params.storyId, chapterNumber);
  if (!result) {
    res.status(404).json({ success: false, error: 'Story not found' });
    return;
  }
  res.json({ success: true, ...result });
});

/**
 * GET & POST /api/v2/utkal-katha/progress
 * Track reading and audio listening progress
 */
utkalKathaV2Router.get('/progress', (req: Request, res: Response) => {
  const { userId = 'guest', storyId } = req.query;
  if (typeof storyId !== 'string') {
    res.status(400).json({ success: false, error: 'storyId is required' });
    return;
  }

  const record = utkalKathaRepositoryV2.getProgress(String(userId), storyId);
  res.json({
    success: true,
    progress: record || {
      storyId,
      chapterNumber: 1,
      positionSec: 0,
      completed: false,
      updatedAt: new Date().toISOString(),
    },
  });
});

utkalKathaV2Router.post('/progress', (req: Request, res: Response) => {
  const { userId = 'guest', storyId, chapterNumber = 1, positionSec = 0, completed = false } = req.body || {};
  if (!storyId) {
    res.status(400).json({ success: false, error: 'storyId is required' });
    return;
  }

  const record = utkalKathaRepositoryV2.saveProgress(
    String(userId),
    String(storyId),
    Number(chapterNumber),
    Number(positionSec),
    Boolean(completed)
  );

  res.json({
    success: true,
    progress: record,
  });
});

/**
 * POST /api/v2/utkal-katha/search
 * Multilingual search across all 25 stories, chapters and vocabulary
 */
utkalKathaV2Router.post('/search', (req: Request, res: Response) => {
  const { query = '' } = req.body || {};
  const result = utkalKathaRepositoryV2.getAll({ search: String(query) });
  res.json({
    success: true,
    query,
    count: result.stories.length,
    results: result.stories.map((s) => ({
      id: s.id,
      destinationName: s.destinationName,
      titleEn: s.titleEn,
      titleOr: s.titleOr,
      titleHi: s.titleHi,
      districtId: s.districtId,
    })),
  });
});
