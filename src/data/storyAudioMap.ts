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
  katha_mayurbhanj_similipal_tigers: 'story-similipal',
  katha_nayagarh_kantilo_nilamadhaba: 'story-puri-jagannath',

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
 * Validates against available pre-rendered WAV files.
 */
export function getStoryAudioUrl(
  storyOrDistrictId: string,
  lang: 'en' | 'or' | 'hi'
): string | null {
  if (!storyOrDistrictId) return null;
  const key = storyOrDistrictId.toLowerCase().trim();

  // 1. Direct match on story ID
  let audioKey = STORY_ID_TO_AUDIO_MAP[key];

  // 2. Check if key is a district ID or contains a district name
  if (!audioKey) {
    if (DISTRICT_TO_AUDIO_MAP[key]) {
      audioKey = DISTRICT_TO_AUDIO_MAP[key];
    } else {
      for (const [dist, mappedKey] of Object.entries(DISTRICT_TO_AUDIO_MAP)) {
        if (key.includes(dist)) {
          audioKey = mappedKey;
          break;
        }
      }
    }
  }

  // 3. Check for destination keywords
  if (!audioKey) {
    if (key.includes('konark')) audioKey = 'story-konark';
    else if (key.includes('dhauli')) audioKey = 'story-dhauli';
    else if (key.includes('cuttack') || key.includes('barabati') || key.includes('bali'))
      audioKey = 'story-cuttack-barabati';
    else if (key.includes('puri') || key.includes('jagannath')) audioKey = 'story-puri-jagannath';
    else if (key.includes('chilika')) audioKey = 'story-chilika';
    else if (key.includes('hirakud') || key.includes('sambalpur'))
      audioKey = 'story-hirakud-sambalpur';
    else if (key.includes('similipal')) audioKey = 'story-similipal';
    else if (key.includes('koraput') || key.includes('sabara'))
      audioKey = 'story-sunabeda-koraput-sabara';
    else if (key.includes('raghurajpur')) audioKey = 'story-raghurajpur';
    else if (key.includes('lingaraj')) audioKey = 'story-lingaraj';
    else if (key.includes('khandagiri') || key.includes('udayagiri'))
      audioKey = 'story-khandagiri-udayagiri';
    else if (key.includes('mukteswar') || key.includes('rajarani'))
      audioKey = 'story-mukteswar-rajarani';
    else if (key.includes('yogini') || key.includes('hirapur'))
      audioKey = 'story-hirapur-yogini';
    else if (key.includes('biraja') || key.includes('jajpur')) audioKey = 'story-jajpur-biraja';
    else if (key.includes('bhitarkanika')) audioKey = 'story-bhitarkanika-kanika';
    else if (key.includes('daringbadi')) audioKey = 'story-daringbadi';
    else if (key.includes('chandipur')) audioKey = 'story-balasore-chandipur';
    else if (key.includes('taratarini') || key.includes('jaugada'))
      audioKey = 'story-jaugada-taratarini';
    else if (key.includes('kapilash') || key.includes('dhenkanal') || key.includes('baji'))
      audioKey = 'story-kapilash-joranda';
  }

  if (!audioKey) return null;

  const validLang = lang === 'or' ? 'or' : lang === 'hi' ? 'hi' : 'en';
  return `/offline-audio/${audioKey}-${validLang}-seg0.wav`;
}
