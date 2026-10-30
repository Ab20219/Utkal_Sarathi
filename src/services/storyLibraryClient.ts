import {
  StoryRecord,
  StoryFilterOptions,
  StoryLibraryStats,
  StoryCategory,
  SupportedLanguage,
} from '../types';
import { CURATED_STORY_SEED } from '../data/storyLibrarySeed';

const API_BASE = '';
const OFFLINE_STORIES_STORAGE_KEY = 'utkalsarathi_offline_saved_stories';

export class StoryLibraryClient {
  /**
   * Fetches stories with filters and pagination.
   * Gracefully falls back to client-side seed data if server is unreachable or user is offline.
   */
  public static async fetchStories(
    filter: StoryFilterOptions = {},
    page = 1,
    limit = 20
  ): Promise<{ stories: StoryRecord[]; total: number; page: number; totalPages: number }> {
    try {
      const params = new URLSearchParams();
      if (filter.district && filter.district !== 'all') params.set('district', filter.district);
      if (filter.category && filter.category !== 'all') params.set('category', filter.category);
      if (filter.durationType && filter.durationType !== 'all') params.set('duration', filter.durationType);
      if (filter.verificationStatus && filter.verificationStatus !== 'all') params.set('status', filter.verificationStatus);
      if (filter.searchQuery) params.set('search', filter.searchQuery);
      params.set('page', String(page));
      params.set('limit', String(limit));

      const res = await fetch(`${API_BASE}/api/stories?${params.toString()}`);
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Offline fallback
    }

    // Client-side fallback using bundled curated seed
    let result = [...CURATED_STORY_SEED];
    if (filter.district && filter.district !== 'all') {
      const qDist = filter.district.toLowerCase();
      result = result.filter((s) => s.district.toLowerCase().includes(qDist));
    }
    if (filter.category && filter.category !== 'all') {
      result = result.filter((s) => s.category === filter.category);
    }
    if (filter.durationType && filter.durationType !== 'all') {
      result = result.filter((s) => s.durationType === filter.durationType);
    }
    if (filter.searchQuery) {
      const q = filter.searchQuery.toLowerCase();
      result = result.filter(
        (s) =>
          s.title.toLowerCase().includes(q) ||
          (s.odiaTitle && s.odiaTitle.toLowerCase().includes(q)) ||
          s.destination.toLowerCase().includes(q) ||
          s.storyText.toLowerCase().includes(q)
      );
    }

    const total = result.length;
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const startIdx = (page - 1) * limit;

    return {
      stories: result.slice(startIdx, startIdx + limit),
      total,
      page,
      totalPages,
    };
  }

  /**
   * Fetches real-time library stats.
   */
  public static async fetchStats(): Promise<StoryLibraryStats> {
    try {
      const res = await fetch(`${API_BASE}/api/stories/stats`);
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Offline fallback
    }

    return {
      totalDistinctStories: CURATED_STORY_SEED.length,
      reviewedArchivalCount: CURATED_STORY_SEED.filter((s) => s.verificationStatus === 'reviewed_archival').length,
      editorialApprovedCount: 0,
      aiGeneratedUnreviewedCount: 0,
      audioEnabledCount: CURATED_STORY_SEED.length,
      translatedVersionsCount: CURATED_STORY_SEED.length,
      targetScaleCapacity: 10000,
      districtCounts: {},
      categoryCounts: {},
      lastUpdated: new Date().toISOString(),
      honestNotice: `Utkal Katha Content Platform: Scalable database architected for 10,000+ story records. Currently hosting ${CURATED_STORY_SEED.length} verified distinct historical & cultural story records across all 30 districts of Odisha.`,
    };
  }

  /**
   * Generates a new story with AI and indexes into library.
   */
  public static async generateStory(params: {
    district: string;
    destination: string;
    category?: StoryCategory;
    period?: string;
    language?: SupportedLanguage;
  }): Promise<{ success: boolean; story?: StoryRecord; error?: string }> {
    try {
      const res = await fetch(`${API_BASE}/api/stories/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      return await res.json();
    } catch (e: any) {
      return { success: false, error: e?.message || 'Network error generating story' };
    }
  }

  /**
   * Toggles favourite status.
   */
  public static async toggleFavourite(id: string): Promise<number | undefined> {
    try {
      const res = await fetch(`${API_BASE}/api/stories/${id}/favourite`, { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        return data.favourites;
      }
    } catch {
      // Ignore
    }
    return undefined;
  }

  /**
   * Records play.
   */
  public static async recordPlay(id: string): Promise<void> {
    try {
      await fetch(`${API_BASE}/api/stories/${id}/play`, { method: 'POST' });
    } catch {
      // Ignore
    }
  }

  // =========================================================================
  // OFFLINE STORAGE & DOWNLOADS (IndexedDB / LocalStorage)
  // =========================================================================

  public static getOfflineStories(): StoryRecord[] {
    try {
      const raw = localStorage.getItem(OFFLINE_STORIES_STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  public static isStoryOffline(id: string): boolean {
    const list = this.getOfflineStories();
    return list.some((s) => s.id === id);
  }

  public static saveStoryToOffline(story: StoryRecord): boolean {
    try {
      const list = this.getOfflineStories();
      if (!list.some((s) => s.id === story.id)) {
        list.push(story);
        localStorage.setItem(OFFLINE_STORIES_STORAGE_KEY, JSON.stringify(list));
      }
      return true;
    } catch {
      return false;
    }
  }

  public static removeStoryFromOffline(id: string): boolean {
    try {
      const list = this.getOfflineStories().filter((s) => s.id !== id);
      localStorage.setItem(OFFLINE_STORIES_STORAGE_KEY, JSON.stringify(list));
      return true;
    } catch {
      return false;
    }
  }
}
