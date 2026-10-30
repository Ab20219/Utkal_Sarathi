/**
 * High-Fidelity Pre-Rendered Audio Mapping for Utkal Kathaa
 * Maps every story ID and Odisha district ID to authentic studio-recorded
 * neural narration files (.wav) bundled in /offline-audio/.
 *
 * Works 100% offline inside the Android APK (Capacitor assets) and on Vercel CDN.
 */

export const DISTRICT_TO_AUDIO_MAP: Record<string, string> = {
  puri: 'story-konark',
  khordha: 'story-dhauli',
  cuttack: 'story-cuttack-barabati',
  dhenkanal: 'story-kapilash-joranda',
  sambalpur: 'story-hirakud-sambalpur',
  koraput: 'story-sunabeda-koraput-sabara',
  mayurbhanj: 'story-similipal',
  nayagarh: 'story-puri-jagannath',
  balasore: 'story-balasore-chandipur',
  kendrapara: 'story-bhitarkanika-kanika',
  jajpur: 'story-jajpur-biraja',
  kandhamal: 'story-daringbadi',
  ganjam: 'story-jaugada-taratarini',
  gajapati: 'story-mahendragiri',
  bargarh: 'story-gandhamardan-nrusinghanath',
  subarnapur: 'story-sonepur-suvarnapura',
  balangir: 'story-ranipur-jharial',
  bhadrak: 'story-balasore-chandipur',
  angul: 'story-kapilash-joranda',
  keonjhar: 'story-similipal',
  sundargarh: 'story-hirakud-sambalpur',
  jharsuguda: 'story-hirakud-sambalpur',
  deogarh: 'story-hirakud-sambalpur',
  boudh: 'story-sonepur-suvarnapura',
  nuapada: 'story-gandhamardan-nrusinghanath',
  nabarangpur: 'story-gupteswar-koraput',
  malkangiri: 'story-sunabeda-koraput-sabara',
  rayagada: 'story-mahendragiri',
  kalahandi: 'story-ranipur-jharial',
  jagatsinghpur: 'story-cuttack-barabati',
};

export const STORY_ID_TO_AUDIO_MAP: Record<string, string> = {
  // Flagship 8 stories
  katha_puri_konark_wheels: 'story-konark',
  katha_khordha_dhauli_ashoka: 'story-dhauli',
  katha_cuttack_boita_bali_jatra: 'story-cuttack-barabati',
  katha_dhenkanal_baji_rout: 'story-kapilash-joranda',
  katha_sambalpur_surendra_sai: 'story-hirakud-sambalpur',
  katha_koraput_sabara_srikhetra: 'story-sunabeda-koraput-sabara',
  katha_koraput_sabara_kalajeera: 'story-sunabeda-koraput-sabara',
  katha_mayurbhanj_similipal_tigers: 'story-similipal',
  katha_mayurbhanj_chhau_similipal: 'story-similipal',
  katha_nayagarh_kantilo_nilamadhaba: 'story-puri-jagannath',
  katha_nayagarh_kantilo_legend: 'story-puri-jagannath',

  // 22 District Overview Stories
  katha_district_angul_overview: 'story-kapilash-joranda',
  katha_district_balasore_overview: 'story-balasore-chandipur',
  katha_district_bargarh_overview: 'story-gandhamardan-nrusinghanath',
  katha_district_bhadrak_overview: 'story-balasore-chandipur',
  katha_district_bolangir_overview: 'story-ranipur-jharial',
  katha_district_boudh_overview: 'story-sonepur-suvarnapura',
  katha_district_deogarh_overview: 'story-hirakud-sambalpur',
  katha_district_gajapati_overview: 'story-mahendragiri',
  katha_district_ganjam_overview: 'story-jaugada-taratarini',
  katha_district_jagatsinghpur_overview: 'story-cuttack-barabati',
  katha_district_jajpur_overview: 'story-jajpur-biraja',
  katha_district_jharsuguda_overview: 'story-hirakud-sambalpur',
  katha_district_kalahandi_overview: 'story-ranipur-jharial',
  katha_district_kandhamal_overview: 'story-daringbadi',
  katha_district_kendrapara_overview: 'story-bhitarkanika-kanika',
  katha_district_keonjhar_overview: 'story-similipal',
  katha_district_malkangiri_overview: 'story-sunabeda-koraput-sabara',
  katha_district_nabarangpur_overview: 'story-gupteswar-koraput',
  katha_district_nuapada_overview: 'story-gandhamardan-nrusinghanath',
  katha_district_rayagada_overview: 'story-mahendragiri',
  katha_district_subarnapur_overview: 'story-sonepur-suvarnapura',
  katha_district_sundergarh_overview: 'story-hirakud-sambalpur',

  // 25 Monument story IDs
  'story-konark': 'story-konark',
  'story-dhauli': 'story-dhauli',
  'story-cuttack-barabati': 'story-cuttack-barabati',
  'story-puri-jagannath': 'story-puri-jagannath',
  'story-chilika': 'story-chilika',
  'story-hirakud-sambalpur': 'story-hirakud-sambalpur',
  'story-similipal': 'story-similipal',
  'story-sunabeda-koraput-sabara': 'story-sunabeda-koraput-sabara',
  'story-raghurajpur': 'story-raghurajpur',
  'story-lingaraj': 'story-lingaraj',
  'story-khandagiri-udayagiri': 'story-khandagiri-udayagiri',
  'story-mukteswar-rajarani': 'story-mukteswar-rajarani',
  'story-hirapur-yogini': 'story-hirapur-yogini',
  'story-jajpur-biraja': 'story-jajpur-biraja',
  'story-diamond-triangle': 'story-diamond-triangle',
  'story-balasore-chandipur': 'story-balasore-chandipur',
  'story-bhitarkanika-kanika': 'story-bhitarkanika-kanika',
  'story-kapilash-joranda': 'story-kapilash-joranda',
  'story-daringbadi': 'story-daringbadi',
  'story-jaugada-taratarini': 'story-jaugada-taratarini',
  'story-mahendragiri': 'story-mahendragiri',
  'story-gupteswar-koraput': 'story-gupteswar-koraput',
  'story-gandhamardan-nrusinghanath': 'story-gandhamardan-nrusinghanath',
  'story-sonepur-suvarnapura': 'story-sonepur-suvarnapura',
  'story-ranipur-jharial': 'story-ranipur-jharial',
};

/**
 * Resolves the URL of a bundled studio audio clip for a story or district.
 * Returns null unless verified, authentic studio voice narration is bundled.
 * Synthetic drone soundscapes are NOT used as voice narration to prevent metallic/alien distortion.
 */
export function getStoryAudioUrl(
  storyOrDistrictId: string,
  lang: 'en' | 'or' | 'hi'
): string | null {
  if (!storyOrDistrictId) return null;
  const cleanId = String(storyOrDistrictId).trim().toLowerCase();

  let normalizedKey =
    STORY_ID_TO_AUDIO_MAP[storyOrDistrictId] ||
    STORY_ID_TO_AUDIO_MAP[cleanId] ||
    DISTRICT_TO_AUDIO_MAP[cleanId];

  // If id is in format katha_district_<name>_overview or katha_<name>_*
  if (!normalizedKey) {
    const match = cleanId.match(/katha_(?:district_)?([a-z]+)/);
    if (match && match[1]) {
      const extractedDistrict = match[1];
      normalizedKey = DISTRICT_TO_AUDIO_MAP[extractedDistrict];
    }
  }

  if (!normalizedKey && cleanId.startsWith('story-')) {
    normalizedKey = cleanId;
  }

  if (!normalizedKey) return null;

  return `/offline-audio/${normalizedKey}-${lang}-seg0.mp3`;
}
