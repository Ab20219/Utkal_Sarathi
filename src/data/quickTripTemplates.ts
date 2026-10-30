import { TravelStyle } from '../utils/budget';
import { TripInterest } from '../utils/itinerary';

export interface QuickTripTemplate {
  id: string;
  name: string;
  tagline: string;
  days: number;
  startCity: string;
  travelers: number;
  style: TravelStyle;
  tripScope: 'single' | 'nearby' | 'multi';
  selectedMultiDistricts?: string[];
  selectedNearbyDistricts?: string[];
  interests: TripInterest[];
  badge: string;
  estCostPerPerson: number;
}

export const QUICK_TRIP_TEMPLATES: QuickTripTemplate[] = [
  {
    id: 'golden_triangle_3d',
    name: '🌟 Golden Triangle Classic',
    tagline: 'Puri Dham • Konark Sun Temple • Bhubaneswar Temples',
    days: 3,
    startCity: 'Khordha',
    travelers: 2,
    style: 'moderate',
    tripScope: 'multi',
    selectedMultiDistricts: ['khordha', 'puri', 'cuttack'],
    interests: ['heritage', 'spiritual', 'cuisine', 'photography'],
    badge: 'Most Popular',
    estCostPerPerson: 4200,
  },
  {
    id: 'coastal_marine_2d',
    name: '🏖️ Coastal Marine & Chilika',
    tagline: 'Puri Golden Beach • Chilika Dolphins • Marine Drive',
    days: 2,
    startCity: 'Puri',
    travelers: 2,
    style: 'moderate',
    tripScope: 'nearby',
    selectedNearbyDistricts: ['khordha', 'ganjam'],
    interests: ['beaches', 'nature', 'cuisine'],
    badge: 'Weekend Chill',
    estCostPerPerson: 2900,
  },
  {
    id: 'bhubaneswar_caves_1d',
    name: '🏛️ Temple City & Caves',
    tagline: 'Lingaraj • Udayagiri-Khandagiri Caves • Dhauli Peace Pagoda',
    days: 1,
    startCity: 'Khordha',
    travelers: 1,
    style: 'budget',
    tripScope: 'single',
    interests: ['heritage', 'spiritual', 'photography'],
    badge: 'Day Excursion',
    estCostPerPerson: 850,
  },
  {
    id: 'western_odisha_4d',
    name: '🌾 Western Odisha Handloom & Nature',
    tagline: 'Hirakud Dam • Samaleswari • Sambalpuri Weavers • Debrigarh',
    days: 4,
    startCity: 'Sambalpur',
    travelers: 2,
    style: 'moderate',
    tripScope: 'multi',
    selectedMultiDistricts: ['sambalpur', 'bargarh', 'bolangir', 'jharsuguda'],
    interests: ['nature', 'tribal_crafts', 'heritage', 'waterfalls'],
    badge: 'Eco & Crafts',
    estCostPerPerson: 5800,
  },
  {
    id: 'southern_highlands_5d',
    name: '⛰️ Southern Highlands & Deomali',
    tagline: 'Eastern Ghats Vistadome • Deomali Peaks • Gupteswar • Daringbadi',
    days: 5,
    startCity: 'Koraput',
    travelers: 2,
    style: 'moderate',
    tripScope: 'multi',
    selectedMultiDistricts: ['koraput', 'rayagada', 'kandhamal', 'gajapati'],
    interests: ['tribal_culture', 'waterfalls', 'nature', 'cuisine'],
    badge: 'Highland Adventure',
    estCostPerPerson: 7500,
  },
];
