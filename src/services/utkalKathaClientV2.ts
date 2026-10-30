/**
 * Utkal Katha V2 Client Service
 *
 * Resilient, Android-ready client for the dedicated Utkal Katha v2 backend.
 * Provides caching, offline fallback to in-memory corpus, and trilingual support.
 */

import { fetchApi } from '../utils/apiConfig';
import {
  UtkalKathaStoryV2,
  KathaChapterV2,
  TrilingualTerm,
} from './utkalKathaServiceV2';
import { utkalKathaRepositoryV2 } from '../data/utkalKathaCorpusV2';

class UtkalKathaClientV2 {
  public async getStories(options?: {
    districtId?: string;
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ stories: Partial<UtkalKathaStoryV2>[]; total: number }> {
    try {
      const params = new URLSearchParams();
      if (options?.districtId) params.append('district', options.districtId);
      if (options?.search) params.append('search', options.search);
      if (options?.limit) params.append('limit', String(options.limit));
      if (options?.offset) params.append('offset', String(options.offset));

      const res = await fetchApi(`/api/v2/utkal-katha/stories?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        return { stories: data.stories, total: data.total };
      }
    } catch {
      // Offline fallback
    }

    const local = utkalKathaRepositoryV2.getAll(options);
    return { stories: local.stories, total: local.total };
  }

  public async getStory(storyId: string): Promise<UtkalKathaStoryV2 | null> {
    try {
      const res = await fetchApi(`/api/v2/utkal-katha/stories/${storyId}`);
      if (res.ok) {
        const data = await res.json();
        return data.story;
      }
    } catch {
      // Offline fallback
    }

    return utkalKathaRepositoryV2.getById(storyId) || null;
  }

  public async getChapters(
    storyId: string,
    page: number = 1,
    limit: number = 20
  ): Promise<{ chapters: KathaChapterV2[]; total: number; page: number; totalPages: number } | null> {
    try {
      const res = await fetchApi(`/api/v2/utkal-katha/stories/${storyId}/chapters?page=${page}&limit=${limit}`);
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Offline fallback
    }

    return utkalKathaRepositoryV2.getChapters(storyId, page, limit);
  }

  public async getChapter(storyId: string, chapterNumber: number): Promise<KathaChapterV2 | null> {
    try {
      const res = await fetchApi(`/api/v2/utkal-katha/stories/${storyId}/chapters/${chapterNumber}`);
      if (res.ok) {
        const data = await res.json();
        return data.chapter;
      }
    } catch {
      // Offline fallback
    }

    return utkalKathaRepositoryV2.getChapter(storyId, chapterNumber);
  }

  public async getVocabulary(storyId: string): Promise<TrilingualTerm[] | null> {
    try {
      const res = await fetchApi(`/api/v2/utkal-katha/stories/${storyId}/vocabulary`);
      if (res.ok) {
        const data = await res.json();
        return data.vocabulary;
      }
    } catch {
      // Offline fallback
    }

    return utkalKathaRepositoryV2.getVocabulary(storyId);
  }

  public async toggleFavourite(storyId: string): Promise<boolean> {
    try {
      const res = await fetchApi(`/api/v2/utkal-katha/stories/${storyId}/favourite`, {
        method: 'POST',
      });
      if (res.ok) {
        const data = await res.json();
        return data.isFavourited;
      }
    } catch {
      // Offline fallback
    }

    const local = utkalKathaRepositoryV2.toggleFavourite(storyId);
    return local?.isFavourited || true;
  }

  public async recordPlay(storyId: string, chapterNumber?: number): Promise<void> {
    try {
      await fetchApi(`/api/v2/utkal-katha/stories/${storyId}/play`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chapterNumber }),
      });
    } catch {
      utkalKathaRepositoryV2.recordPlay(storyId, chapterNumber);
    }
  }

  public async getProgress(userId: string, storyId: string) {
    try {
      const res = await fetchApi(`/api/v2/utkal-katha/progress?userId=${userId}&storyId=${storyId}`);
      if (res.ok) {
        const data = await res.json();
        return data.progress;
      }
    } catch {
      // Offline fallback
    }

    return utkalKathaRepositoryV2.getProgress(userId, storyId);
  }

  public async saveProgress(
    userId: string,
    storyId: string,
    chapterNumber: number,
    positionSec: number,
    completed: boolean = false
  ) {
    try {
      await fetchApi('/api/v2/utkal-katha/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, storyId, chapterNumber, positionSec, completed }),
      });
    } catch {
      utkalKathaRepositoryV2.saveProgress(userId, storyId, chapterNumber, positionSec, completed);
    }
  }

  public async getStats() {
    try {
      const res = await fetchApi('/api/v2/utkal-katha/stats');
      if (res.ok) {
        const data = await res.json();
        return data.stats;
      }
    } catch {
      // Offline fallback
    }

    return utkalKathaRepositoryV2.getStats();
  }
}

export const utkalKathaClientV2 = new UtkalKathaClientV2();
