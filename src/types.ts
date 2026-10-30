export type SupportedLanguage = 'en' | 'or' | 'hi';
export type TabType = 'discover' | 'map' | 'transit' | 'stories' | 'culture' | 'safety' | 'roadmap';

export type ReliabilitySourceLevel =
  | 'verified_official'
  | 'provider_confirmed'
  | 'community_reported'
  | 'estimated';

export interface RouteFareItem {
  id: string;
  from: string;
  to: string;
  distanceKm: number;
  estDuration: string;
  modes: {
    mode: 'Mo Bus' | 'OSRTC Bus' | 'Auto-Rickshaw' | 'Prepaid Taxi' | 'Train' | 'Boat';
    details: string;
    fare: string;
    numericMinFare: number;
    verificationStatus: 'verified_govt' | 'provider_confirmed' | 'estimated';
    lastUpdated: string;
    frequencyOrTimings?: string;
  }[];
  lastMileNote: string;
  coverageLimitationNotice?: string;
}

export interface HazardReport {
  id: string;
  location: string;
  district: string;
  type: 'Road Diversion' | 'Heavy Rush / Long Queue' | 'Waterlogging' | 'Weather Advisory' | 'Wildlife Warning';
  description: string;
  submittedBy: string;
  timestamp: string;
  status: 'verified' | 'under_review';
  upvotes: number;
  officialSource?: string;
}

export interface EncyclopedicVolume {
  volumeNumber: number;
  title: string;
  odiaTitle: string;
  hindiTitle: string;
  contentEn: string;
  contentOr: string;
  contentHi: string;
  wordCount: number;
}

export interface AudioGuideStory {
  id: string;
  title: string;
  odiaTitle: string;
  hindiTitle: string;
  durationMinutes: number;
  monument: string;
  location: string;
  district?: string;
  region?: string;
  period: string;
  narrator: string;
  audioUrl?: string;
  audioTranscriptEn: string;
  audioTranscriptOr: string;
  audioTranscriptHi: string;
  documentedHistory: string;
  legendAndFolklore: string;
  architecturalHighlights: string[];
  odiaHistorySummary?: string;
  odiaLegendSummary?: string;
  odiaArchitectureSummary?: string;
  hindiHistorySummary?: string;
  hindiLegendSummary?: string;
  hindiArchitectureSummary?: string;
  historicalSources?: string[];
  keyHistoricalFigures?: string[];
  inscriptionsAndManuscripts?: string;
  qrCodeBadgeText?: string;
  totalWords?: number;
  editorialReviewStatus?: 'verified_epigraphic_and_asi' | 'curated_heritage_archive';
  lastUpdated?: string;
  chapters?: {
    title: string;
    odiaTitle?: string;
    hindiTitle?: string;
    durationSec: number;
    text: string;
    textOr?: string;
    textHi?: string;
  }[];
  encyclopedicVolumes?: EncyclopedicVolume[];
}

export interface CulturalEvent {
  id: string;
  name: string;
  odiaName: string;
  period: string;
  dates: string;
  location: string;
  significance: string;
  travelerAdvice: string;
  source: string;
}

export interface CuisineItem {
  id: string;
  name: string;
  odiaName: string;
  category: 'Main Meal' | 'Traditional Sweet' | 'Pitha' | 'Seafood Delicacy';
  isVegetarian: boolean;
  giTagCertified?: boolean;
  originDistrict: string;
  description: string;
  keyIngredients: string[];
  mustTryLocations: string[];
  estimatedPrice: string;
}

export interface LocalBusiness {
  id: string;
  name: string;
  type: 'Hotel / Resort' | 'Homestay / Panthanivas' | 'Eco-Tourism Camp' | 'Artisan Workshop' | 'Authentic Kitchen' | 'Certified Tour Guide';
  location: string;
  district: string;
  phone: string;
  pricing: string;
  verifiedStatus: boolean;
  specialty: string;
  isCommercialPartner?: boolean;
}

export interface RoadmapPhaseItem {
  phase: string;
  title: string;
  scope: string;
  deliverables: string[];
  gateCriteria: string;
  status: 'Production Live' | 'Ready for Integration' | 'Future Scaling' | 'Active Prototype';
}

// =========================================================================
// UTKAL KATHA SCALABLE STORY LIBRARY & CONTENT PLATFORM (10,000+ CAPACITY)
// =========================================================================

export type StoryCategory =
  | 'temples_architecture'
  | 'ancient_kingdoms'
  | 'archaeology_edicts'
  | 'forts_caves'
  | 'freedom_movements'
  | 'tribal_heritage'
  | 'folktales_legends'
  | 'festivals_crafts'
  | 'cuisine_traditions'
  | 'hidden_nature'
  | 'educational_tours';

export interface StoryPublicationMetadata {
  authorOrSource: string;
  yearOrCitation?: string;
  sourceUrl?: string;
}

export interface StoryRecord {
  id: string;
  title: string;
  odiaTitle?: string;
  hindiTitle?: string;
  district: string;
  destination: string;
  category: StoryCategory;
  period?: string;
  originalLanguage: SupportedLanguage;
  translations?: {
    en?: string;
    or?: string;
    hi?: string;
  };
  storyText: string;
  audioUrl?: string;
  sourceReferences: string[];
  publicationMetadata: StoryPublicationMetadata;
  verificationStatus: 'reviewed_archival' | 'ai_generated_unreviewed' | 'editorial_approved';
  estimatedListeningDurationSec: number;
  durationType: 'short' | 'narrative' | 'extended';
  metadata: {
    plays: number;
    favourites: number;
    downloads: number;
    lastListened?: string;
  };
}

export interface StoryFilterOptions {
  district?: string;
  destination?: string;
  category?: StoryCategory | 'all';
  language?: SupportedLanguage;
  durationType?: 'all' | 'short' | 'narrative' | 'extended';
  verificationStatus?: 'all' | 'reviewed' | 'generated';
  searchQuery?: string;
  onlyFavourites?: boolean;
  onlyDownloaded?: boolean;
}

export interface StoryLibraryStats {
  totalDistinctStories: number;
  reviewedArchivalCount: number;
  editorialApprovedCount: number;
  aiGeneratedUnreviewedCount: number;
  audioEnabledCount: number;
  translatedVersionsCount: number;
  targetScaleCapacity: number;
  districtCounts: Record<string, number>;
  categoryCounts: Record<string, number>;
  lastUpdated: string;
  honestNotice: string;
}

export interface DuplicateCheckResult {
  isDuplicate: boolean;
  isNearDuplicate: boolean;
  similarityScore: number;
  duplicateOfId?: string;
  duplicateOfTitle?: string;
  reason?: string;
}

