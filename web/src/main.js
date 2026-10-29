import { UI_STRINGS, t } from './data/i18n.js';
import {
  DISTRICTS,
  ODISHA_REGIONS,
  CULTURAL_LISTINGS,
  EMERGENCY_AND_TRANSIT_HUBS
} from './data/districtsCatalog.js';
import { ALL_KATHA_STORIES, isNearDuplicateStory } from './data/kathaCatalog.js';
import {
  DEFAULT_SITE_URL,
  VEHICLE_MODES,
  calculateFairFareEstimate,
  generateDeterministicTripPlan,
  queryCuratedMitraKnowledge,
  buildWhatsAppShareUrl,
  formatWebsiteInviteShare,
  formatDistrictShare,
  formatTripShare
} from './services/domainLogic.js';
import {
  isFirebaseWebConfigured,
  subscribeToAuth,
  signInWithGoogleWeb,
  signOutWeb,
  syncTripToFirestore,
  syncContactToFirestore,
  submitModeratedHazardToFirestore,
  fetchCommunityHazardsFromFirestore
} from './services/firebaseClient.js';

const STORAGE_KEYS = {
  lang: 'utkal_web_lang_v2',
  trips: 'utkal_web_trips_v2',
  contacts: 'utkal_web_contacts_v2',
  hazards: 'utkal_web_hazards_v2',
  favStories: 'utkal_web_fav_stories_v2',
  customStories: 'utkal_web_custom_stories_v2'
};

function safeReadJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function safeWriteJson(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore storage quota errors gracefully
  }
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

const state = {
  lang: safeReadJson(STORAGE_KEYS.lang, 'en'),
  route: 'home',
  searchQuery: '',
  selectedRegion: 'ALL',
  onlyHiddenGems: false,
  kathaCategory: 'ALL',
  craftFilter: 'ALL',
  mitraHistory: [
    {
      role: 'assistant',
      badge: 'Verified Catalog Concierge',
      text: 'Namaskar! Ask me about any of the 30 districts of Odisha, UNESCO monuments, hidden waterfalls, GI-tagged handlooms (Pattachitra, Tarakasi, Sambalpuri Ikat, Kotpad), Odia cuisine, or emergency safety hubs.',
      citations: ['UtkalSarathi 30-District Verified Encyclopedia']
    }
  ],
  plannerDraft: {
    title: '',
    days: 4,
    travelers: 2,
    budgetStyle: 'Mid',
    pace: 'Balanced',
    selectedDistrictIds: ['khordha', 'puri', 'cuttack']
  },
  savedTrips: safeReadJson(STORAGE_KEYS.trips, []),
  fareForm: {
    originId: 'khordha',
    destId: 'puri',
    vehicleMode: 'sedan',
    selectedMapDistrictId: 'puri'
  },
  trustedContacts: safeReadJson(STORAGE_KEYS.contacts, []),
  localHazards: safeReadJson(STORAGE_KEYS.hazards, [
    {
      id: 'seed_advisory_1',
      districtId: 'puri',
      locationLabel: 'Coastal Beaches & Chilika Mouth',
      category: 'Coastal Tide Advisory',
      description: 'Swim only inside lifeguard-marked flags on Puri and Gopalpur beaches; verify IMD marine bulletins during monsoon depressions.',
      severity: 'Advisory',
      verificationStatus: 'Official Standing Guidance',
      reportedAt: Date.now() - 86400000
    }
  ]),
  favStories: new Set(safeReadJson(STORAGE_KEYS.favStories, [])),
  customStories: safeReadJson(STORAGE_KEYS.customStories, []),
  gpsStatus: { state: 'idle', lat: null, lon: null, accuracy: null, timestamp: null, message: '' },
  auth: { configured: isFirebaseWebConfigured(), user: null },
  audio: { playingId: null, paused: false, speed: 1.0 }
};

function getDistrictDisplayName(d) {
  if (state.lang === 'or') return `${d.nameOdia} (${d.nameEn})`;
  if (state.lang === 'hi') return `${d.nameHindi} (${d.nameEn})`;
  return `${d.nameEn} (${d.nameOdia})`;
}

function getStoryTitle(s) {
  if (state.lang === 'or' && s.titleOdia) return s.titleOdia;
  if (state.lang === 'hi' && s.titleHindi) return s.titleHindi;
  return s.titleEn;
}

function getStoryBody(s) {
  if (state.lang === 'or' && s.bodyOdia) return s.bodyOdia;
  if (state.lang === 'hi' && s.bodyHindi) return s.bodyHindi;
  return s.bodyEn;
}

function getAllStories() {
  return [...ALL_KATHA_STORIES, ...state.customStories];
}

let toastTimer = null;
function showToast(msg) {
  const el = document.getElementById('toast-box');
  if (!el) return;
  el.textContent = msg;
  el.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    el.hidden = true;
  }, 3400);
}

function getPublicSiteUrl() {
  if (typeof window !== 'undefined' && window.location && window.location.origin.startsWith('http')) {
    if (!window.location.origin.includes('localhost') && !window.location.origin.includes('127.0.0.1')) {
      return window.location.origin;
    }
  }
  return DEFAULT_SITE_URL;
}

function openWhatsAppShare(text) {
  const url = buildWhatsAppShareUrl(text);
  window.open(url, '_blank', 'noopener,noreferrer');
}

async function copyTextWithFeedback(text, label = 'Copied to clipboard!') {
  try {
    await navigator.clipboard.writeText(text);
    showToast(label);
  } catch {
    showToast('Copy unavailable in this browser context — use Share on WhatsApp.');
  }
}

/* ---------------- Web Speech Audio Narrator ---------------- */
function speakStory(story) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    showToast('Browser Speech Synthesis is not supported on this device. Full transcript is displayed on screen.');
    return;
  }
  window.speechSynthesis.cancel();
  const title = getStoryTitle(story);
  const body = getStoryBody(story);
  const utterance = new SpeechSynthesisUtterance(`${title}. ${body}`);
  utterance.rate = Number(state.audio.speed) || 1.0;
  utterance.lang = state.lang === 'or' ? 'or-IN' : state.lang === 'hi' ? 'hi-IN' : 'en-IN';

  utterance.onend = () => {
    state.audio.playingId = null;
    state.audio.paused = false;
    updateAudioBar();
  };
  utterance.onerror = () => {
    state.audio.playingId = null;
    state.audio.paused = false;
    updateAudioBar();
  };

  state.audio.playingId = story.id;
  state.audio.paused = false;
  window.speechSynthesis.speak(utterance);
  updateAudioBar(story);
}

function togglePauseAudio() {
  if (!('speechSynthesis' in window)) return;
  if (state.audio.paused) {
    window.speechSynthesis.resume();
    state.audio.paused = false;
  } else {
    window.speechSynthesis.pause();
    state.audio.paused = true;
  }
  updateAudioBar();
}

function stopAudio() {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
  state.audio.playingId = null;
  state.audio.paused = false;
  updateAudioBar();
}

function updateAudioBar(storyObj = null) {
  const bar = document.getElementById('audio-player-bar');
  const titleEl = document.getElementById('audio-now-title');
  const metaEl = document.getElementById('audio-now-meta');
  const pauseBtn = document.getElementById('audio-pause-btn');
  if (!bar) return;

  if (!state.audio.playingId) {
    bar.hidden = true;
    return;
  }
  const activeStory = storyObj || getAllStories().find((s) => s.id === state.audio.playingId);
  bar.hidden = false;
  if (activeStory && titleEl && metaEl) {
    titleEl.textContent = getStoryTitle(activeStory);
    metaEl.textContent = `${activeStory.destinationName} • ${activeStory.factClassification}`;
  }
  if (pauseBtn) {
    pauseBtn.textContent = state.audio.paused ? t(state.lang, 'resumeAudio') : t(state.lang, 'pauseAudio');
  }
}

/* ---------------- Navigation & Header ---------------- */
const NAV_ITEMS = [
  { id: 'home', icon: '🏛️', key: 'navHome', mobile: true },
  { id: 'districts', icon: '🗺️', key: 'navExplore', mobile: true },
  { id: 'katha', icon: '🎙️', key: 'navKatha', mobile: true },
  { id: 'mitra', icon: '🧭', key: 'navMitra', mobile: false },
  { id: 'planner', icon: '🎒', key: 'navPlanner', mobile: true },
  { id: 'geomap', icon: '🚕', key: 'navGeoMap', mobile: true },
  { id: 'crafts', icon: '🎨', key: 'navCrafts', mobile: false },
  { id: 'safety', icon: '🛡️', key: 'navSafety', mobile: true }
];

function navigateTo(routeId, pushHash = true) {
  const valid = NAV_ITEMS.some((n) => n.id === routeId) ? routeId : 'home';
  state.route = valid;
  if (pushHash && window.location.hash !== `#${valid}`) {
    history.replaceState(null, '', `#${valid}`);
  }
  renderChrome();
  renderMain();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function renderChrome() {
  document.documentElement.lang = state.lang;
  document.getElementById('hdr-brand-name').textContent = t(state.lang, 'brandName');
  document.getElementById('hdr-brand-tagline').textContent = t(state.lang, 'tagline');
  document.getElementById('hdr-share-label').textContent = t(state.lang, 'shareWhatsApp');
  document.getElementById('hdr-sos-label').textContent = t(state.lang, 'sosButton');
  document.getElementById('hdr-cloud-label').textContent = state.auth.user
    ? state.auth.user.displayName?.split(' ')[0] || 'Synced'
    : t(state.lang, 'cloudSyncBtn');

  document.querySelectorAll('.lang-btn').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.lang === state.lang);
  });

  const desktopNav = document.getElementById('desktop-nav');
  desktopNav.innerHTML = NAV_ITEMS.map(
    (item) => `
      <button type="button" class="nav-pill ${state.route === item.id ? 'active' : ''}" data-nav="${item.id}">
        <span>${item.icon}</span> ${escapeHtml(t(state.lang, item.key))}
      </button>
    `
  ).join('');

  const mobileNav = document.getElementById('mobile-bottom-nav');
  mobileNav.innerHTML = NAV_ITEMS.filter((i) => i.mobile)
    .map(
      (item) => `
      <button type="button" class="mob-nav-btn ${state.route === item.id ? 'active' : ''}" data-nav="${item.id}">
        <span class="mob-nav-icon">${item.icon}</span>
        <span>${escapeHtml(t(state.lang, item.key))}</span>
      </button>
    `
    )
    .join('');
}

/* ---------------- Epistemic Badge Helper ---------------- */
function renderFactBadge(classification) {
  const isLegend = /legend|folklore/i.test(classification);
  const isEstimate = /estimate|pending|advisory/i.test(classification);
  const cls = isLegend ? 'badge-legend' : isEstimate ? 'badge-estimate' : 'badge-verified';
  return `<span class="badge ${cls}">${escapeHtml(classification)}</span>`;
}

/* ---------------- View Renderers ---------------- */
function renderHomeView() {
  const hiddenGems = DISTRICTS.flatMap((d) =>
    d.destinations.filter((p) => p.isHiddenGem).map((p) => ({ ...p, districtName: d.nameEn, districtOdia: d.nameOdia }))
  ).slice(0, 6);

  const featuredStories = ALL_KATHA_STORIES.slice(0, 3);

  return `
    <div class="epistemic-strip">
      <span>⚖️ ${escapeHtml(t(state.lang, 'epistemicBanner'))}</span>
      <button type="button" class="btn btn-teal btn-sm" data-action="download-offline-pack">
        📥 ${escapeHtml(t(state.lang, 'offlinePackBtn'))}
      </button>
    </div>

    <section class="hero-card" aria-label="UtkalSarathi Hero">
      <div class="hero-content">
        <span class="eyebrow-badge">${escapeHtml(t(state.lang, 'heroBadge'))}</span>
        <h1 class="hero-title">${escapeHtml(t(state.lang, 'heroTitle'))}</h1>
        <p class="hero-subtitle">${escapeHtml(t(state.lang, 'heroSubtitle'))}</p>

        <form class="hero-search-bar" id="hero-search-form">
          <input
            type="search"
            class="search-input"
            id="hero-search-input"
            value="${escapeHtml(state.searchQuery)}"
            placeholder="${escapeHtml(t(state.lang, 'heroSearchPlaceholder'))}"
            aria-label="Search Odisha districts and destinations"
          />
          <button type="submit" class="btn btn-primary">🔍 ${escapeHtml(t(state.lang, 'ctaExploreDistricts'))}</button>
        </form>

        <div class="hero-cta-row">
          <button type="button" class="btn btn-primary" data-nav="planner">🎒 ${escapeHtml(t(state.lang, 'ctaPlanTrip'))}</button>
          <button type="button" class="btn btn-outline" data-nav="katha">🎙️ ${escapeHtml(t(state.lang, 'ctaListenKatha'))}</button>
          <button type="button" class="btn btn-outline" data-nav="mitra">🧭 ${escapeHtml(t(state.lang, 'navMitra'))}</button>
          <button type="button" class="btn btn-teal" data-nav="safety">🛡️ ${escapeHtml(t(state.lang, 'ctaSafetyHub'))}</button>
        </div>
      </div>
      <div class="hero-visual">
        <img src="/images/hero-puri-konark.jpg" alt="Odisha Heritage — Konark Sun Wheel and Temple Horizon" loading="eager" />
      </div>
    </section>

    <section class="stats-grid" aria-label="Platform Highlights">
      <div class="stat-card"><span class="stat-num">30</span><span class="stat-label">${escapeHtml(t(state.lang, 'statDistricts'))}</span></div>
      <div class="stat-card"><span class="stat-num">61+</span><span class="stat-label">${escapeHtml(t(state.lang, 'statDestinations'))}</span></div>
      <div class="stat-card"><span class="stat-num">${getAllStories().length}</span><span class="stat-label">${escapeHtml(t(state.lang, 'statStories'))}</span></div>
      <div class="stat-card"><span class="stat-num">112 / 108</span><span class="stat-label">${escapeHtml(t(state.lang, 'statHelpline'))}</span></div>
    </section>

    <div class="section-header">
      <div>
        <h2 class="section-title">${escapeHtml(t(state.lang, 'sectionQuickModules'))}</h2>
        <p class="section-desc">Every module works responsively across mobile, tablet, and desktop with transparent source citations.</p>
      </div>
    </div>
    <div class="cards-grid">
      <article class="card">
        <div class="card-top">
          <img src="/images/nature-ecotourism.jpg" alt="Odisha Eastern Ghats Eco-Tourism and Waterfalls" class="feature-banner-img" loading="lazy" />
          <span class="badge badge-verified">Interactive SVG Map + Haversine Engine</span>
          <h3 class="card-title">30-District Geo-Map &amp; Fair Fares</h3>
          <p class="card-body">Click any district node across Odisha, compute highway &amp; ghat road distances, and compare non-binding reference fares for auto, cab, SUV, and OSRTC bus.</p>
        </div>
        <div class="card-actions">
          <button type="button" class="btn btn-primary btn-sm" data-nav="geomap">Open Geo-Map &amp; Fares</button>
          <button type="button" class="btn btn-outline btn-sm" data-nav="mitra">Ask Utkal Mitra</button>
        </div>
      </article>

      <article class="card">
        <div class="card-top">
          <img src="/images/crafts-cuisine.jpg" alt="Odisha GI Handlooms, Silver Filigree and Traditional Cuisine" class="feature-banner-img" loading="lazy" />
          <span class="badge badge-gem">GI Registry &amp; Eco-Tour Portals</span>
          <h3 class="card-title">GI Crafts, Handloom &amp; Odia Cuisine</h3>
          <p class="card-body">Discover authentic Raghurajpur Pattachitra, Cuttack Rupa Tarakasi, Sambalpuri Bandha, Kotpad natural dye, Pahala Rasagola, and Eco-Tour Odisha forest camps.</p>
        </div>
        <div class="card-actions">
          <button type="button" class="btn btn-primary btn-sm" data-nav="crafts">Explore GI &amp; Cuisine</button>
        </div>
      </article>

      <article class="card">
        <div class="card-top">
          <img src="/images/utkal-emblem.jpg" alt="UtkalSuraksha Traveller Safety" class="feature-banner-img" loading="lazy" />
          <span class="badge badge-estimate">SOS 112 • Live GPS • WhatsApp</span>
          <h3 class="card-title">UtkalSuraksha Traveller Safety</h3>
          <p class="card-body">Capture your live browser GPS coordinates for instant WhatsApp family check-ins, manage trusted emergency contacts, and view tertiary trauma hospitals.</p>
        </div>
        <div class="card-actions">
          <button type="button" class="btn btn-sos btn-sm" data-nav="safety">Open Safety Hub</button>
          <button type="button" class="btn btn-whatsapp btn-sm" data-action="share-website">Share Website</button>
        </div>
      </article>
    </div>

    <div class="section-header">
      <div>
        <h2 class="section-title">✨ ${escapeHtml(t(state.lang, 'sectionHiddenGems'))}</h2>
        <p class="section-desc">Curated offbeat archaeological marvels, silent gorges, and heritage craft villages across Odisha.</p>
      </div>
      <button type="button" class="btn btn-outline btn-sm" data-action="jump-hidden-gems">See All Hidden Gems →</button>
    </div>
    <div class="cards-grid">
      ${hiddenGems
        .map(
          (gem) => `
        <article class="card">
          <div class="card-top">
            <div class="card-meta-row">
              <span class="badge badge-gem">Hidden Gem • ${escapeHtml(gem.category)}</span>
              <span class="district-num-chip">${escapeHtml(gem.districtName)}</span>
            </div>
            <h3 class="card-title">${escapeHtml(gem.name)}</h3>
            <div class="card-subtitle">${escapeHtml(gem.odiaName)}</div>
            <p class="card-body">${escapeHtml(gem.shortSummary)}</p>
          </div>
          <div class="card-actions">
            <button type="button" class="btn btn-outline btn-sm" data-open-district="${escapeHtml(gem.districtId)}">District Guide</button>
            <a class="btn btn-teal btn-sm" href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
              gem.latitude + ',' + gem.longitude
            )}" target="_blank" rel="noopener noreferrer">📍 Map</a>
          </div>
        </article>
      `
        )
        .join('')}
    </div>

    <div class="section-header">
      <div>
        <h2 class="section-title">🎙️ ${escapeHtml(t(state.lang, 'sectionFeaturedStories'))}</h2>
        <p class="section-desc">Multilingual cultural storytelling with natural browser voice narration and clear historical vs. folklore badges.</p>
      </div>
      <button type="button" class="btn btn-outline btn-sm" data-nav="katha">All ${getAllStories().length} Stories →</button>
    </div>
    <div class="cards-grid">
      ${featuredStories.map((s) => renderStoryCardHtml(s)).join('')}
    </div>
  `;
}

function getFilteredDistricts() {
  const q = state.searchQuery.trim().toLowerCase();
  return DISTRICTS.filter((d) => {
    if (state.selectedRegion !== 'ALL' && d.region !== state.selectedRegion) return false;
    if (state.onlyHiddenGems && !d.destinations.some((p) => p.isHiddenGem)) return false;
    if (!q) return true;
    const hay = [
      d.nameEn,
      d.nameOdia,
      d.nameHindi,
      d.headquarters,
      d.tagline,
      d.historySummary,
      ...d.signatureFood,
      ...d.craftsAndHandloom,
      ...d.destinations.map((p) => `${p.name} ${p.odiaName} ${p.category} ${p.shortSummary}`)
    ]
      .join(' ')
      .toLowerCase();
    return hay.includes(q);
  });
}

function renderDistrictsView() {
  const filtered = getFilteredDistricts();
  const regions = [
    { val: 'ALL', label: t(state.lang, 'filterAllRegions') },
    { val: ODISHA_REGIONS.COASTAL, label: t(state.lang, 'filterCoastal') },
    { val: ODISHA_REGIONS.NORTHERN_CENTRAL, label: t(state.lang, 'filterCentral') },
    { val: ODISHA_REGIONS.WESTERN, label: t(state.lang, 'filterWestern') },
    { val: ODISHA_REGIONS.SOUTHERN, label: t(state.lang, 'filterSouthern') }
  ];

  return `
    <div class="section-header" style="margin-top: 4px">
      <div>
        <h1 class="section-title">🗺️ All 30 Official Districts of Odisha</h1>
        <p class="section-desc">Showing ${filtered.length} of 30 districts — complete with destinations, hidden gems, GI crafts, cuisine, and emergency hubs.</p>
      </div>
    </div>

    <div class="filter-bar">
      <input
        type="search"
        class="search-input"
        id="districts-search-input"
        value="${escapeHtml(state.searchQuery)}"
        placeholder="${escapeHtml(t(state.lang, 'heroSearchPlaceholder'))}"
        aria-label="Filter districts"
      />
      ${regions
        .map(
          (r) => `
        <button type="button" class="chip-btn ${state.selectedRegion === r.val ? 'active' : ''}" data-region="${escapeHtml(r.val)}">
          ${escapeHtml(r.label)}
        </button>
      `
        )
        .join('')}
      <button type="button" class="chip-btn ${state.onlyHiddenGems ? 'active' : ''}" data-action="toggle-gems-filter">
        ✨ ${escapeHtml(t(state.lang, 'filterHiddenGemsOnly'))}
      </button>
    </div>

    ${
      filtered.length === 0
        ? `
      <div class="empty-state">
        <h3>${escapeHtml(t(state.lang, 'emptySearchTitle'))}</h3>
        <p style="color: var(--ivory-muted)">${escapeHtml(t(state.lang, 'emptySearchHint'))}</p>
        <button type="button" class="btn btn-primary" data-action="reset-district-filters">${escapeHtml(t(state.lang, 'resetFilters'))}</button>
      </div>
    `
        : `
      <div class="cards-grid">
        ${filtered
          .map(
            (d) => `
          <article class="card">
            <div class="card-top">
              <div class="card-meta-row">
                <span class="district-num-chip">#${d.number} • ${escapeHtml(d.region)}</span>
                <span class="badge badge-verified">HQ: ${escapeHtml(d.headquarters.split(' ')[0])}</span>
              </div>
              <h2 class="card-title">${escapeHtml(getDistrictDisplayName(d))}</h2>
              <div class="card-subtitle">${escapeHtml(d.tagline)}</div>
              <p class="card-body">${escapeHtml(d.historySummary)}</p>
              <div class="tag-list">
                ${d.destinations
                  .map(
                    (p) =>
                      `<span class="tag">${p.isHiddenGem ? '✨ ' : '📍 '}${escapeHtml(p.name)}</span>`
                  )
                  .join('')}
              </div>
            </div>
            <div class="card-actions">
              <button type="button" class="btn btn-primary btn-sm" data-open-district="${escapeHtml(d.id)}">
                ${escapeHtml(t(state.lang, 'viewDistrictDetails'))}
              </button>
              <button type="button" class="btn btn-outline btn-sm" data-play-district-story="${escapeHtml(d.id)}">
                🎙️ ${escapeHtml(t(state.lang, 'listenAudioGuide'))}
              </button>
              <button type="button" class="btn btn-whatsapp btn-sm" data-share-district="${escapeHtml(d.id)}">
                📲 ${escapeHtml(t(state.lang, 'shareDistrictWhatsApp'))}
              </button>
            </div>
          </article>
        `
          )
          .join('')}
      </div>
    `
    }
  `;
}

function renderStoryCardHtml(story) {
  const isPlaying = state.audio.playingId === story.id;
  const isFav = state.favStories.has(story.id);
  const mins = Math.max(1, Math.round((story.durationSec || 180) / 60));

  return `
    <article class="card">
      <div class="card-top">
        <div class="card-meta-row">
          ${renderFactBadge(story.factClassification)}
          <span class="district-num-chip">${escapeHtml(story.category)} • ~${mins} min</span>
        </div>
        <h3 class="card-title">${escapeHtml(getStoryTitle(story))}</h3>
        <div class="card-subtitle">${escapeHtml(story.destinationName)} • ${escapeHtml(story.period)}</div>
        <p class="card-body">${escapeHtml(getStoryBody(story))}</p>
        <small style="color: var(--ivory-muted); font-size: 0.74rem">📚 Sources: ${escapeHtml(story.sources)}</small>
      </div>
      <div class="card-actions">
        <button type="button" class="btn ${isPlaying ? 'btn-sos' : 'btn-primary'} btn-sm" data-speak-story="${escapeHtml(story.id)}">
          ${isPlaying ? '⏹ ' + escapeHtml(t(state.lang, 'stopAudio')) : '🔊 ' + escapeHtml(t(state.lang, 'listenAudioGuide'))}
        </button>
        <button type="button" class="btn btn-outline btn-sm" data-fav-story="${escapeHtml(story.id)}">
          ${isFav ? '★ Saved' : '☆ Save'}
        </button>
        <button type="button" class="btn btn-whatsapp btn-sm" data-share-story="${escapeHtml(story.id)}">
          📲 Share
        </button>
      </div>
    </article>
  `;
}

function renderKathaView() {
  const allStories = getAllStories();
  const categories = ['ALL', 'SAVED', ...new Set(allStories.map((s) => s.category))];
  const filtered = allStories.filter((s) => {
    if (state.kathaCategory === 'SAVED') return state.favStories.has(s.id);
    if (state.kathaCategory !== 'ALL' && s.category !== state.kathaCategory) return false;
    return true;
  });

  return `
    <div class="section-header" style="margin-top: 4px">
      <div>
        <h1 class="section-title">🎙️ Utkal Katha — Multilingual Cultural &amp; Historical Voice Library</h1>
        <p class="section-desc">Every district has a verified story in English, ଓଡ଼ିଆ, and हिन्दी. Documented archaeology and oral legends are strictly separated.</p>
      </div>
      <button type="button" class="btn btn-outline btn-sm" data-action="open-add-story-modal">➕ Contribute Field Note (Deduplicated)</button>
    </div>

    <div class="filter-bar">
      ${categories
        .map(
          (cat) => `
        <button type="button" class="chip-btn ${state.kathaCategory === cat ? 'active' : ''}" data-katha-cat="${escapeHtml(cat)}">
          ${cat === 'ALL' ? 'All Stories (' + allStories.length + ')' : cat === 'SAVED' ? '★ Saved (' + state.favStories.size + ')' : escapeHtml(cat)}
        </button>
      `
        )
        .join('')}
    </div>

    ${
      filtered.length === 0
        ? `<div class="empty-state"><h3>No stories in this filter yet</h3><p style="color: var(--ivory-muted)">Save favourite chronicles using ☆ Save or switch back to All Stories.</p></div>`
        : `<div class="cards-grid">${filtered.map((s) => renderStoryCardHtml(s)).join('')}</div>`
    }
  `;
}

function renderMitraView() {
  const samplePrompts = [
    'Tell me about Puri temples & Pattachitra',
    'Hidden gems in Odisha',
    'Koraput Deomali & Kalajeera rice',
    'Cuttack Silver Filigree Tarakasi',
    'Mayurbhanj Similipal & Chhau dance',
    'Emergency hospitals & SOS 112'
  ];

  return `
    <div class="section-header" style="margin-top: 4px">
      <div>
        <h1 class="section-title">🧭 ${escapeHtml(t(state.lang, 'mitraTitle'))}</h1>
        <p class="section-desc">${escapeHtml(t(state.lang, 'mitraSubtitle'))}</p>
      </div>
    </div>

    <div class="status-box status-info">
      <strong>Mode Disclosure:</strong> Utkal Mitra on Web operates as a deterministic, citation-backed retrieval concierge over UtkalSarathi's verified 30-district encyclopedia. It never fabricates live prices, unverified facts, or simulated AI hallucinations.
    </div>

    <div class="filter-bar">
      ${samplePrompts
        .map(
          (p) => `<button type="button" class="chip-btn" data-mitra-sample="${escapeHtml(p)}">💬 ${escapeHtml(p)}</button>`
        )
        .join('')}
    </div>

    <div class="panel" style="margin-bottom: 18px">
      <div style="display: flex; flex-direction: column; gap: 14px; max-height: 460px; overflow-y: auto; padding-right: 4px" id="mitra-chat-log">
        ${state.mitraHistory
          .map(
            (msg) => `
          <div style="align-self: ${msg.role === 'user' ? 'flex-end' : 'flex-start'}; max-width: 88%; background: ${
              msg.role === 'user' ? 'rgba(255,122,26,0.18)' : 'var(--charcoal-elevated)'
            }; border: 1px solid ${msg.role === 'user' ? 'var(--saffron)' : 'var(--border)'}; border-radius: 14px; padding: 14px 16px">
            ${msg.badge ? `<div style="margin-bottom: 6px">${renderFactBadge(msg.badge)}</div>` : ''}
            <div style="white-space: pre-line; font-size: 0.91rem">${escapeHtml(msg.text)}</div>
            ${
              msg.citations && msg.citations.length > 0
                ? `<div style="margin-top: 8px; font-size: 0.75rem; color: var(--gold)">📚 Citations: ${escapeHtml(
                    msg.citations.join(' • ')
                  )}</div>`
                : ''
            }
            ${
              msg.districtId
                ? `<div style="margin-top: 10px; display: flex; gap: 8px; flex-wrap: wrap">
                    <button type="button" class="btn btn-outline btn-sm" data-open-district="${escapeHtml(msg.districtId)}">Open District Guide</button>
                    ${
                      msg.storyId
                        ? `<button type="button" class="btn btn-primary btn-sm" data-speak-story="${escapeHtml(msg.storyId)}">🔊 Narrate Story</button>`
                        : ''
                    }
                   </div>`
                : ''
            }
          </div>
        `
          )
          .join('')}
      </div>

      <form id="mitra-form" style="display: flex; gap: 10px; margin-top: 16px; flex-wrap: wrap">
        <input
          type="text"
          id="mitra-input"
          class="search-input"
          placeholder="Ask about any Odisha district, monument, hidden gem, craft, or safety hub..."
          required
        />
        <button type="submit" class="btn btn-primary">Ask Utkal Mitra</button>
      </form>
    </div>
  `;
}

function renderPlannerView() {
  const draft = state.plannerDraft;
  const previewPlan = generateDeterministicTripPlan({
    ...draft,
    districts: DISTRICTS
  });

  return `
    <div class="section-header" style="margin-top: 4px">
      <div>
        <h1 class="section-title">🎒 ${escapeHtml(t(state.lang, 'plannerTitle'))}</h1>
        <p class="section-desc">${escapeHtml(t(state.lang, 'plannerSubtitle'))}</p>
      </div>
    </div>

    <div class="split-layout">
      <form class="panel" id="planner-form">
        <h2 class="card-title" style="margin-bottom: 14px">Configure Your Odisha Odyssey</h2>

        <div class="form-group">
          <label class="form-label" for="plan-title">Custom Trip Title (Optional)</label>
          <input type="text" id="plan-title" class="form-input" value="${escapeHtml(draft.title)}" placeholder="e.g., Golden Triangle &amp; Chilika Heritage Trail" />
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px">
          <div class="form-group">
            <label class="form-label" for="plan-days">Duration (1–14 Days)</label>
            <input type="number" id="plan-days" class="form-input" min="1" max="14" value="${draft.days}" />
          </div>
          <div class="form-group">
            <label class="form-label" for="plan-travelers">Travellers (1–12)</label>
            <input type="number" id="plan-travelers" class="form-input" min="1" max="12" value="${draft.travelers}" />
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px">
          <div class="form-group">
            <label class="form-label" for="plan-budget">Comfort &amp; Budget Tier</label>
            <select id="plan-budget" class="form-select">
              <option value="Budget" ${draft.budgetStyle === 'Budget' ? 'selected' : ''}>Budget (Backpacker / Dharamshala / Bus)</option>
              <option value="Mid" ${draft.budgetStyle === 'Mid' ? 'selected' : ''}>Mid-Range (OTDC Panthanivas / AC Cab)</option>
              <option value="Premium" ${draft.budgetStyle === 'Premium' ? 'selected' : ''}>Premium (Heritage Resort / Eco-Camp / SUV)</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label" for="plan-pace">Travel Pace</label>
            <select id="plan-pace" class="form-select">
              <option value="Relaxed" ${draft.pace === 'Relaxed' ? 'selected' : ''}>Relaxed</option>
              <option value="Balanced" ${draft.pace === 'Balanced' ? 'selected' : ''}>Balanced</option>
              <option value="Packed" ${draft.pace === 'Packed' ? 'selected' : ''}>Packed Explorer</option>
            </select>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Select Districts (${draft.selectedDistrictIds.length} chosen)</label>
          <div class="district-selector-grid">
            ${DISTRICTS.map(
              (d) => `
              <label class="district-check">
                <input type="checkbox" name="plan-district" value="${escapeHtml(d.id)}" ${
                  draft.selectedDistrictIds.includes(d.id) ? 'checked' : ''
                } />
                <span>${escapeHtml(d.nameEn)}</span>
              </label>
            `
            ).join('')}
          </div>
        </div>

        <div style="display: flex; gap: 10px; flex-wrap: wrap; margin-top: 16px">
          <button type="submit" class="btn btn-primary">💾 Save Trip Plan (${state.auth.user ? 'Browser + Cloud' : 'Browser Vault'})</button>
          <button type="button" class="btn btn-whatsapp" data-action="share-preview-trip">📲 Share Estimate on WhatsApp</button>
        </div>
      </form>

      <div class="panel">
        <div class="card-meta-row">
          <span class="badge badge-estimate">${escapeHtml(previewPlan.classification)}</span>
          <span class="district-num-chip">${previewPlan.days} Days • ${previewPlan.travelers} Traveller(s)</span>
        </div>
        <h2 class="card-title" style="margin-top: 8px">${escapeHtml(previewPlan.title)}</h2>
        <p style="color: var(--ivory-muted); font-size: 0.85rem; margin: 4px 0 12px">
          Districts: ${escapeHtml(previewPlan.districtsCsv)}
        </p>

        <div class="budget-breakdown-grid">
          <div class="budget-tile"><strong>₹${previewPlan.totalInr.toLocaleString('en-IN')}</strong><span>Total Estimated INR</span></div>
          <div class="budget-tile"><strong>₹${previewPlan.stayInr.toLocaleString('en-IN')}</strong><span>Stay (${Math.ceil(previewPlan.travelers / 2)} Room/s)</span></div>
          <div class="budget-tile"><strong>₹${previewPlan.foodInr.toLocaleString('en-IN')}</strong><span>Meals &amp; Cuisine</span></div>
          <div class="budget-tile"><strong>₹${previewPlan.transitInr.toLocaleString('en-IN')}</strong><span>Local &amp; Intercity Transit</span></div>
          <div class="budget-tile"><strong>₹${previewPlan.entryInr.toLocaleString('en-IN')}</strong><span>Monument &amp; Eco Entry</span></div>
          <div class="budget-tile"><strong>₹${previewPlan.contingencyInr.toLocaleString('en-IN')}</strong><span>8% Safety Buffer</span></div>
        </div>

        <h3 class="card-title" style="font-size: 1.05rem; margin: 16px 0 10px">Day-by-Day Preview</h3>
        <div style="display: flex; flex-direction: column; gap: 10px; max-height: 360px; overflow-y: auto">
          ${previewPlan.dayPlans
            .map(
              (dp) => `
            <div style="background: var(--charcoal-elevated); border: 1px solid var(--border); border-radius: 12px; padding: 12px">
              <strong style="color: var(--gold)">Day ${dp.dayNumber} — ${escapeHtml(dp.districtName)}</strong>
              <p style="margin: 5px 0; font-size: 0.84rem">🌅 ${escapeHtml(dp.morning)}</p>
              <p style="margin: 5px 0; font-size: 0.84rem">☀️ ${escapeHtml(dp.afternoon)}</p>
              <p style="margin: 5px 0 0; font-size: 0.84rem; color: var(--ivory-muted)">🌆 ${escapeHtml(dp.evening)}</p>
            </div>
          `
            )
            .join('')}
        </div>
      </div>
    </div>

    <div class="section-header">
      <div>
        <h2 class="section-title">Saved Itineraries (${state.savedTrips.length})</h2>
        <p class="section-desc">Stored locally in your browser${state.auth.user ? ' and synced to your Firebase Cloud Vault' : ''}.</p>
      </div>
    </div>

    ${
      state.savedTrips.length === 0
        ? `<div class="empty-state"><p style="color: var(--ivory-muted); margin: 0">No saved itineraries yet. Click "Save Trip Plan" above to store itineraries for offline reference and WhatsApp sharing.</p></div>`
        : `<div class="cards-grid">
            ${state.savedTrips
              .map(
                (trip) => `
              <article class="card">
                <div class="card-top">
                  <div class="card-meta-row">
                    <span class="badge badge-estimate">₹${Number(trip.totalInr).toLocaleString('en-IN')} Est.</span>
                    <span class="district-num-chip">${trip.days}D • ${escapeHtml(trip.budgetStyle)}</span>
                  </div>
                  <h3 class="card-title">${escapeHtml(trip.title)}</h3>
                  <div class="card-subtitle">${escapeHtml(trip.districtsCsv)}</div>
                  <p class="card-body">${escapeHtml(trip.dayPlans?.[0]?.morning || '')}</p>
                </div>
                <div class="card-actions">
                  <button type="button" class="btn btn-whatsapp btn-sm" data-share-saved-trip="${escapeHtml(trip.id)}">📲 WhatsApp</button>
                  <button type="button" class="btn btn-sos btn-sm" data-delete-trip="${escapeHtml(trip.id)}">🗑 Delete</button>
                </div>
              </article>
            `
              )
              .join('')}
          </div>`
    }
  `;
}

function projectCoordToSvg(lat, lon) {
  // Odisha bounds: lon 81.4..87.5, lat 17.8..22.6
  const x = ((lon - 81.3) / (87.6 - 81.3)) * 540 + 30;
  const y = ((22.7 - lat) / (22.7 - 17.7)) * 380 + 25;
  return { x: Math.round(x * 10) / 10, y: Math.round(y * 10) / 10 };
}

function renderGeoMapView() {
  const origin = DISTRICTS.find((d) => d.id === state.fareForm.originId) || DISTRICTS[18];
  const dest = DISTRICTS.find((d) => d.id === state.fareForm.destId) || DISTRICTS[25];
  const selectedDistrict = DISTRICTS.find((d) => d.id === state.fareForm.selectedMapDistrictId) || dest;
  const fare = calculateFairFareEstimate(origin, dest, state.fareForm.vehicleMode);

  const pOrigin = projectCoordToSvg(origin.latitude, origin.longitude);
  const pDest = projectCoordToSvg(dest.latitude, dest.longitude);

  return `
    <div class="section-header" style="margin-top: 4px">
      <div>
        <h1 class="section-title">🚕 ${escapeHtml(t(state.lang, 'fareTitle'))}</h1>
        <p class="section-desc">Click any district node on the Odisha coordinate map or select Origin &amp; Destination below.</p>
      </div>
    </div>

    <div class="split-layout">
      <div class="panel">
        <div class="map-canvas-wrap">
          <svg viewBox="0 0 600 430" class="odisha-svg-map" role="img" aria-label="Interactive 30-District Coordinate Map of Odisha">
            <defs>
              <linearGradient id="routeLine" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stop-color="#FF7A1A" />
                <stop offset="100%" stop-color="#1CA39E" />
              </linearGradient>
            </defs>
            <!-- Subtle Grid -->
            <g stroke="rgba(255,255,255,0.05)" stroke-width="1">
              <line x1="0" y1="100" x2="600" y2="100" />
              <line x1="0" y1="215" x2="600" y2="215" />
              <line x1="0" y1="330" x2="600" y2="330" />
              <line x1="150" y1="0" x2="150" y2="430" />
              <line x1="300" y1="0" x2="300" y2="430" />
              <line x1="450" y1="0" x2="450" y2="430" />
            </g>

            <!-- Active Route Line -->
            <line
              x1="${pOrigin.x}"
              y1="${pOrigin.y}"
              x2="${pDest.x}"
              y2="${pDest.y}"
              stroke="url(#routeLine)"
              stroke-width="3"
              stroke-dasharray="6 4"
            />

            <!-- All 30 District Nodes -->
            ${DISTRICTS.map((d) => {
              const pt = projectCoordToSvg(d.latitude, d.longitude);
              const isSelected = d.id === selectedDistrict.id || d.id === origin.id || d.id === dest.id;
              const fill =
                d.id === origin.id ? '#FF7A1A' : d.id === dest.id ? '#1CA39E' : isSelected ? '#E5B85B' : '#94A3B8';
              return `
                <g class="map-node" data-map-district="${escapeHtml(d.id)}" tabindex="0" role="button" aria-label="${escapeHtml(d.nameEn)}">
                  <circle cx="${pt.x}" cy="${pt.y}" r="${isSelected ? 7.5 : 5}" fill="${fill}" stroke="#0B0D10" stroke-width="1.5" />
                  <text x="${pt.x + 8}" y="${pt.y + 4}" fill="${isSelected ? '#F7F3E8' : '#B6B1A6'}" font-size="${
                    isSelected ? '11' : '9.5'
                  }" font-weight="${isSelected ? '700' : '500'}">${escapeHtml(d.nameEn)}</text>
                </g>
              `;
            }).join('')}
          </svg>
        </div>

        <div style="margin-top: 14px; background: var(--charcoal-elevated); border: 1px solid var(--border); border-radius: 12px; padding: 14px">
          <div class="card-meta-row">
            <strong style="color: var(--gold)">📍 Selected Node: ${escapeHtml(getDistrictDisplayName(selectedDistrict))}</strong>
            <button type="button" class="btn btn-outline btn-sm" data-open-district="${escapeHtml(selectedDistrict.id)}">Full District Guide</button>
          </div>
          <p style="font-size: 0.84rem; color: var(--ivory-muted); margin: 6px 0">
            Transit: ${escapeHtml(selectedDistrict.transportHubs)}
          </p>
          <div style="display: flex; gap: 8px; flex-wrap: wrap">
            <button type="button" class="btn btn-sm btn-outline" data-set-origin="${escapeHtml(selectedDistrict.id)}">Set as Origin</button>
            <button type="button" class="btn btn-sm btn-teal" data-set-dest="${escapeHtml(selectedDistrict.id)}">Set as Destination</button>
          </div>
        </div>
      </div>

      <div class="panel">
        <span class="badge badge-estimate">${escapeHtml(fare.classification)}</span>
        <h2 class="card-title" style="margin: 10px 0 14px">Transit &amp; Fair Fare Calculator</h2>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px">
          <div class="form-group">
            <label class="form-label" for="fare-origin">Origin District</label>
            <select id="fare-origin" class="form-select">
              ${DISTRICTS.map(
                (d) => `<option value="${escapeHtml(d.id)}" ${d.id === origin.id ? 'selected' : ''}>${escapeHtml(d.nameEn)}</option>`
              ).join('')}
            </select>
          </div>
          <div class="form-group">
            <label class="form-label" for="fare-dest">Destination District</label>
            <select id="fare-dest" class="form-select">
              ${DISTRICTS.map(
                (d) => `<option value="${escapeHtml(d.id)}" ${d.id === dest.id ? 'selected' : ''}>${escapeHtml(d.nameEn)}</option>`
              ).join('')}
            </select>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label" for="fare-mode">Transit Mode</label>
          <select id="fare-mode" class="form-select">
            ${Object.values(VEHICLE_MODES)
              .map(
                (m) =>
                  `<option value="${escapeHtml(m.id)}" ${m.id === state.fareForm.vehicleMode ? 'selected' : ''}>${escapeHtml(
                    m.label
                  )}</option>`
              )
              .join('')}
          </select>
        </div>

        <div class="budget-breakdown-grid">
          <div class="budget-tile">
            <strong>₹${fare.lowInr.toLocaleString('en-IN')} – ₹${fare.highInr.toLocaleString('en-IN')}</strong>
            <span>Estimated Reference Range</span>
          </div>
          <div class="budget-tile">
            <strong>~${fare.distanceKm} km</strong>
            <span>Estimated Road Distance</span>
          </div>
          <div class="budget-tile">
            <strong>~${escapeHtml(fare.durationLabel)}</strong>
            <span>Typical Road Time</span>
          </div>
        </div>

        <div class="status-box status-info">
          <strong>Route &amp; Fair-Fare Note:</strong> ${escapeHtml(fare.suitabilityNote)}<br />
          <small>${escapeHtml(t(state.lang, 'fareDisclaimer'))}</small>
        </div>

        <div style="display: flex; gap: 10px; flex-wrap: wrap; margin-top: 14px">
          <a href="${escapeHtml(fare.googleMapsUrl)}" target="_blank" rel="noopener noreferrer" class="btn btn-primary">
            🗺️ Open Live Driving Route in Google Maps
          </a>
        </div>

        <h3 class="card-title" style="font-size: 1.05rem; margin: 22px 0 10px">Major Odisha Aviation, Rail &amp; Medical Gateways</h3>
        <div style="display: flex; flex-direction: column; gap: 8px; max-height: 240px; overflow-y: auto">
          ${EMERGENCY_AND_TRANSIT_HUBS.map(
            (h) => `
            <div style="background: var(--charcoal-elevated); border: 1px solid var(--border); border-radius: 10px; padding: 10px 12px; display: flex; justify-content: space-between; align-items: center; gap: 8px">
              <div>
                <strong style="font-size: 0.86rem; color: var(--ivory)">${escapeHtml(h.name)}</strong>
                <div style="font-size: 0.76rem; color: var(--ivory-muted)">${escapeHtml(h.type)} • ${escapeHtml(h.details)} (${escapeHtml(h.code)})</div>
              </div>
              <a class="btn btn-outline btn-sm" href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                h.latitude + ',' + h.longitude
              )}" target="_blank" rel="noopener noreferrer">Map</a>
            </div>
          `
          ).join('')}
        </div>
      </div>
    </div>
  `;
}

function renderCraftsView() {
  const types = ['ALL', ...new Set(CULTURAL_LISTINGS.map((c) => c.type))];
  const filtered =
    state.craftFilter === 'ALL'
      ? CULTURAL_LISTINGS
      : CULTURAL_LISTINGS.filter((c) => c.type === state.craftFilter);

  return `
    <div class="section-header" style="margin-top: 4px">
      <div>
        <h1 class="section-title">🎨 Odisha GI-Tagged Handlooms, Crafts, Cuisine &amp; Official Eco-Camps</h1>
        <p class="section-desc">Direct cooperative references (Boyanika, Utkalika, ORMAS, OTDC, Eco-Tour Odisha) so travellers support authentic artisans.</p>
      </div>
    </div>

    <div class="filter-bar">
      ${types
        .map(
          (tp) => `
        <button type="button" class="chip-btn ${state.craftFilter === tp ? 'active' : ''}" data-craft-type="${escapeHtml(tp)}">
          ${tp === 'ALL' ? 'All Verified Listings (' + CULTURAL_LISTINGS.length + ')' : escapeHtml(tp)}
        </button>
      `
        )
        .join('')}
    </div>

    <div class="cards-grid">
      ${filtered
        .map(
          (item) => `
        <article class="card">
          <div class="card-top">
            <div class="card-meta-row">
              <span class="badge badge-verified">${escapeHtml(item.verificationLabel)}</span>
              <span class="district-num-chip">${escapeHtml(item.type)}</span>
            </div>
            <h2 class="card-title">${escapeHtml(item.title)}</h2>
            <div class="card-subtitle">${escapeHtml(item.odiaTitle)} • ${escapeHtml(item.giTagStatus)}</div>
            <p class="card-body">${escapeHtml(item.description)}</p>
            <div style="font-size: 0.82rem; color: var(--ivory)">
              <strong>📍 Authentic Cluster:</strong> ${escapeHtml(item.authenticLocation)}<br />
              <strong>💰 Reference Price Guide:</strong> ${escapeHtml(item.priceGuide)}
            </div>
          </div>
          <div class="card-actions">
            <a href="${escapeHtml(item.officialEnquiryUrl)}" target="_blank" rel="noopener noreferrer" class="btn btn-primary btn-sm">
              🌐 Official Portal
            </a>
            <button type="button" class="btn btn-outline btn-sm" data-open-district="${escapeHtml(item.districtId)}">
              District Guide
            </button>
          </div>
        </article>
      `
        )
        .join('')}
    </div>
  `;
}

function renderSafetyView() {
  const gps = state.gpsStatus;

  return `
    <div class="section-header" style="margin-top: 4px">
      <div>
        <h1 class="section-title">🛡️ ${escapeHtml(t(state.lang, 'safetyTitle'))}</h1>
        <p class="section-desc">${escapeHtml(t(state.lang, 'safetySubtitle'))}</p>
      </div>
    </div>

    <div class="stats-grid">
      <div class="stat-card" style="border-color: rgba(239,68,68,0.5)">
        <span class="stat-num" style="color: var(--crimson)">112</span>
        <span class="stat-label">National Police / Fire / SOS</span>
        <div style="margin-top: 8px"><a href="tel:112" class="btn btn-sos btn-sm">📞 Dial 112 Now</a></div>
      </div>
      <div class="stat-card" style="border-color: rgba(28,163,158,0.5)">
        <span class="stat-num" style="color: var(--teal)">108</span>
        <span class="stat-label">24x7 Emergency Ambulance</span>
        <div style="margin-top: 8px"><a href="tel:108" class="btn btn-teal btn-sm">🚑 Dial 108</a></div>
      </div>
      <div class="stat-card">
        <span class="stat-num">181</span>
        <span class="stat-label">Women Helpline Odisha</span>
        <div style="margin-top: 8px"><a href="tel:181" class="btn btn-outline btn-sm">📞 Dial 181</a></div>
      </div>
      <div class="stat-card">
        <span class="stat-num">1363</span>
        <span class="stat-label">24x7 Tourist Info Helpline</span>
        <div style="margin-top: 8px"><a href="tel:1363" class="btn btn-outline btn-sm">📞 Dial 1363</a></div>
      </div>
    </div>

    <div class="split-layout">
      <!-- Live GPS Check-In & Trusted Contacts -->
      <div class="panel">
        <h2 class="card-title">📍 Live Browser GPS Check-In &amp; Family Share</h2>
        <p class="card-body" style="margin: 6px 0 14px">
          Uses your device's real HTML5 Geolocation sensor (never simulated coordinates). Requires your explicit browser permission.
        </p>

        <div style="display: flex; gap: 10px; flex-wrap: wrap">
          <button type="button" class="btn btn-primary" data-action="capture-gps" ${gps.state === 'loading' ? 'disabled' : ''}>
            🛰️ ${gps.state === 'loading' ? escapeHtml(t(state.lang, 'gpsLocating')) : escapeHtml(t(state.lang, 'gpsCheckInBtn'))}
          </button>
          ${
            gps.state === 'success'
              ? `<button type="button" class="btn btn-whatsapp" data-action="share-gps-whatsapp">
                  📲 ${escapeHtml(t(state.lang, 'gpsShareWhatsApp'))}
                 </button>`
              : ''
          }
        </div>

        ${
          gps.state === 'loading'
            ? `<div class="status-box status-info">⏳ ${escapeHtml(t(state.lang, 'gpsLocating'))}</div>`
            : gps.state === 'error'
              ? `<div class="status-box status-error">⚠️ ${escapeHtml(gps.message)}</div>`
              : gps.state === 'success'
                ? `<div class="status-box status-success">
                    ✅ <strong>Live Coordinates Acquired:</strong> ${gps.lat.toFixed(5)}, ${gps.lon.toFixed(5)} (±${Math.round(
                      gps.accuracy
                    )}m) at ${escapeHtml(gps.timestamp)} —
                    <a href="https://maps.google.com/?q=${gps.lat},${gps.lon}" target="_blank" rel="noopener noreferrer">Verify on Google Maps</a>
                   </div>`
                : ''
        }

        <hr style="border: none; border-top: 1px solid var(--border); margin: 20px 0" />

        <h3 class="card-title" style="font-size: 1.08rem">👥 Trusted Emergency Contacts (${state.trustedContacts.length})</h3>
        <form id="contact-form" style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin: 12px 0">
          <input type="text" id="contact-name" class="form-input" placeholder="Contact Full Name" required />
          <input type="tel" id="contact-phone" class="form-input" placeholder="+91 Phone Number" required />
          <input type="text" id="contact-relation" class="form-input" placeholder="Relation (e.g., Family)" value="Family" />
          <button type="submit" class="btn btn-outline">➕ Save Contact</button>
        </form>

        ${
          state.trustedContacts.length === 0
            ? `<p style="font-size: 0.83rem; color: var(--ivory-muted)">No trusted contacts added yet. Saved contacts stay private in your browser (or private Firestore vault when signed in).</p>`
            : `<div style="display: flex; flex-direction: column; gap: 8px">
                ${state.trustedContacts
                  .map(
                    (c) => `
                  <div style="background: var(--charcoal-elevated); border: 1px solid var(--border); border-radius: 10px; padding: 10px 12px; display: flex; justify-content: space-between; align-items: center; gap: 8px; flex-wrap: wrap">
                    <div>
                      <strong>${escapeHtml(c.name)}</strong> <span style="color: var(--gold); font-size: 0.78rem">(${escapeHtml(c.relation)})</span>
                      <div style="font-size: 0.8rem; color: var(--ivory-muted)">${escapeHtml(c.phone)}</div>
                    </div>
                    <div style="display: flex; gap: 6px">
                      <a href="tel:${encodeURIComponent(c.phone)}" class="btn btn-outline btn-sm">📞 Call</a>
                      <button type="button" class="btn btn-sos btn-sm" data-delete-contact="${escapeHtml(c.id)}">✕</button>
                    </div>
                  </div>
                `
                  )
                  .join('')}
               </div>`
        }
      </div>

      <!-- Moderated Community Hazard Reports -->
      <div class="panel">
        <h2 class="card-title">⚠️ Travel Advisories &amp; Moderated Hazard Log</h2>
        <p class="card-body" style="margin: 6px 0 12px">
          For official cyclone/flood bulletins, always check <a href="https://mausam.imd.gov.in" target="_blank" rel="noopener noreferrer">IMD</a> &amp; <a href="https://osdma.org" target="_blank" rel="noopener noreferrer">OSDMA</a>. Traveller-submitted reports are labeled <strong>Pending Moderation</strong>.
        </p>

        <form id="hazard-form" style="margin-bottom: 18px">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 8px">
            <select id="hazard-district" class="form-select">
              ${DISTRICTS.map((d) => `<option value="${escapeHtml(d.id)}">${escapeHtml(d.nameEn)}</option>`).join('')}
            </select>
            <select id="hazard-category" class="form-select">
              <option value="Road Disruption">Road / Ghat Disruption</option>
              <option value="Weather / Fog">Heavy Rain / Ghat Fog</option>
              <option value="Coastal Tide">High Coastal Swell</option>
              <option value="Wildlife Crossing">Elephant / Wildlife Corridor</option>
            </select>
          </div>
          <input type="text" id="hazard-location" class="form-input" placeholder="Specific highway, beach, or ghat stretch" required style="margin-bottom: 8px" />
          <textarea id="hazard-desc" class="form-textarea" placeholder="Describe observed condition factually..." required style="margin-bottom: 8px"></textarea>
          <button type="submit" class="btn btn-outline btn-sm">Submit Community Report (Marked Pending Moderation)</button>
        </form>

        <div style="display: flex; flex-direction: column; gap: 10px; max-height: 330px; overflow-y: auto">
          ${state.localHazards
            .map(
              (h) => `
            <div style="background: var(--charcoal-elevated); border: 1px solid var(--border); border-radius: 12px; padding: 12px">
              <div class="card-meta-row">
                ${renderFactBadge(h.verificationStatus)}
                <span style="font-size: 0.74rem; color: var(--ivory-muted)">${new Date(h.reportedAt).toLocaleDateString()}</span>
              </div>
              <strong style="display: block; margin-top: 6px; color: var(--ivory)">${escapeHtml(h.category)} — ${escapeHtml(h.locationLabel)}</strong>
              <p style="margin: 4px 0 0; font-size: 0.84rem; color: var(--ivory-muted)">${escapeHtml(h.description)}</p>
            </div>
          `
            )
            .join('')}
        </div>
      </div>
    </div>
  `;
}

function renderMain() {
  const main = document.getElementById('app-main');
  if (!main) return;

  switch (state.route) {
    case 'districts':
      main.innerHTML = renderDistrictsView();
      break;
    case 'katha':
      main.innerHTML = renderKathaView();
      break;
    case 'mitra':
      main.innerHTML = renderMitraView();
      break;
    case 'planner':
      main.innerHTML = renderPlannerView();
      break;
    case 'geomap':
      main.innerHTML = renderGeoMapView();
      break;
    case 'crafts':
      main.innerHTML = renderCraftsView();
      break;
    case 'safety':
      main.innerHTML = renderSafetyView();
      break;
    case 'home':
    default:
      main.innerHTML = renderHomeView();
      break;
  }
}

/* ---------------- Modals ---------------- */
function openModal(innerHtml) {
  const backdrop = document.getElementById('modal-backdrop');
  const content = document.getElementById('modal-content');
  content.innerHTML = innerHtml;
  backdrop.hidden = false;
}

function closeModal() {
  const backdrop = document.getElementById('modal-backdrop');
  if (backdrop) backdrop.hidden = true;
}

function showDistrictModal(districtId) {
  const d = DISTRICTS.find((item) => item.id === districtId);
  if (!d) return;
  const story = getAllStories().find((s) => s.districtId === d.id);

  openModal(`
    <div class="card-meta-row">
      <span class="district-num-chip">District #${d.number} • ${escapeHtml(d.region)}</span>
      <button type="button" class="btn btn-outline btn-sm" data-action="close-modal">✕ Close</button>
    </div>
    <h2 id="modal-title" class="section-title" style="margin-top: 8px">${escapeHtml(d.nameEn)} • ${escapeHtml(d.nameOdia)} • ${escapeHtml(d.nameHindi)}</h2>
    <p style="color: var(--gold); font-weight: 600; margin: 4px 0 12px">Headquarters: ${escapeHtml(d.headquarters)} — ${escapeHtml(d.tagline)}</p>
    <p style="color: var(--ivory-muted); font-size: 0.92rem">${escapeHtml(d.historySummary)}</p>

    <h3 class="card-title" style="font-size: 1.05rem; margin: 18px 0 10px">🏛️ Curated Destinations &amp; Hidden Gems</h3>
    <div style="display: flex; flex-direction: column; gap: 10px">
      ${d.destinations
        .map(
          (p) => `
        <div style="background: var(--charcoal-elevated); border: 1px solid var(--border); border-radius: 12px; padding: 14px">
          <div class="card-meta-row">
            <strong>${escapeHtml(p.name)} (${escapeHtml(p.odiaName)})</strong>
            <span class="badge ${p.isHiddenGem ? 'badge-gem' : 'badge-verified'}">${
              p.isHiddenGem ? '✨ Hidden Gem' : escapeHtml(p.category)
            }</span>
          </div>
          <p style="font-size: 0.86rem; color: var(--ivory-muted); margin: 6px 0">${escapeHtml(p.shortSummary)} ${escapeHtml(
            p.historicalSignificance
          )}</p>
          <div style="font-size: 0.78rem; color: var(--gold)">
            🗓 Best Season: ${escapeHtml(p.bestSeason)} • 🚉 Nearest Hub: ${escapeHtml(p.nearestHub)} • 📚 ${escapeHtml(p.sourceCitation)}
          </div>
          <div style="margin-top: 8px">
            <a class="btn btn-teal btn-sm" href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
              p.latitude + ',' + p.longitude
            )}" target="_blank" rel="noopener noreferrer">📍 Open in Google Maps</a>
          </div>
        </div>
      `
        )
        .join('')}
    </div>

    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 12px; margin-top: 16px">
      <div class="budget-tile">
        <span style="color: var(--gold); font-weight: 700">🎭 Festivals &amp; Culture</span>
        <p style="margin: 4px 0 0; font-size: 0.83rem">${escapeHtml(d.cultureAndFestivals)}</p>
      </div>
      <div class="budget-tile">
        <span style="color: var(--gold); font-weight: 700">🍲 Signature Cuisine</span>
        <p style="margin: 4px 0 0; font-size: 0.83rem">${escapeHtml(d.signatureFood.join(', '))}</p>
      </div>
      <div class="budget-tile">
        <span style="color: var(--gold); font-weight: 700">🎨 GI Crafts &amp; Handloom</span>
        <p style="margin: 4px 0 0; font-size: 0.83rem">${escapeHtml(d.craftsAndHandloom.join(', '))}</p>
      </div>
      <div class="budget-tile">
        <span style="color: var(--crimson); font-weight: 700">🏥 Emergency &amp; Police</span>
        <p style="margin: 4px 0 0; font-size: 0.83rem">${escapeHtml(d.emergencyHospital)}<br/>${escapeHtml(d.policeControlInfo)}</p>
      </div>
    </div>

    <div style="display: flex; gap: 10px; flex-wrap: wrap; margin-top: 20px">
      ${
        story
          ? `<button type="button" class="btn btn-primary" data-speak-story="${escapeHtml(story.id)}">🔊 Narrate District Katha</button>`
          : ''
      }
      <button type="button" class="btn btn-whatsapp" data-share-district="${escapeHtml(d.id)}">📲 Share District on WhatsApp</button>
      <button type="button" class="btn btn-outline" data-add-district-to-trip="${escapeHtml(d.id)}">🎒 Add to Trip Planner</button>
    </div>
  `);
}

function showCloudVaultModal() {
  const configured = state.auth.configured;
  const user = state.auth.user;

  openModal(`
    <div class="card-meta-row">
      <span class="badge ${configured ? 'badge-verified' : 'badge-estimate'}">
        ${configured ? 'Firebase Web Configured' : 'Local Browser Vault Active'}
      </span>
      <button type="button" class="btn btn-outline btn-sm" data-action="close-modal">✕ Close</button>
    </div>
    <h2 id="modal-title" class="section-title" style="margin-top: 8px">☁️ UtkalSarathi Storage &amp; Cloud Sync</h2>
    ${
      !configured
        ? `
      <div class="status-box status-info" style="margin-top: 12px">
        <strong>Local Browser Mode Active:</strong> Your saved itineraries (${state.savedTrips.length}), trusted contacts (${state.trustedContacts.length}), and favourite Katha stories (${state.favStories.size}) are automatically persisted in this browser's local storage.<br/><br/>
        To enable optional cross-device Google Sign-In &amp; Cloud Firestore sync on Vercel, register a Web App in your Firebase Console (<code>gen-lang-client-0544007391</code>), add <code>utkalsarathi.vercel.app</code> to Authorized Domains, and set <code>VITE_FIREBASE_API_KEY</code> &amp; <code>VITE_FIREBASE_APP_ID</code> in Vercel Environment Variables.
      </div>
    `
        : user
          ? `
      <div class="status-box status-success" style="margin-top: 12px">
        ✅ Signed in as <strong>${escapeHtml(user.displayName || user.email)}</strong>.<br/>
        Your new trip plans, trusted contacts, and moderated safety reports sync with Cloud Firestore (<code>ai-studio-android-utkalsar-47b70c34-5223-4df1-8532-ae48353675b2</code>).
      </div>
      <button type="button" class="btn btn-sos" data-action="firebase-signout" style="margin-top: 12px">Sign Out</button>
    `
          : `
      <p style="color: var(--ivory-muted)">Sign in with Google to sync your Odisha itineraries and emergency contacts across Web and Android.</p>
      <button type="button" class="btn btn-primary" data-action="firebase-signin">🔐 Sign in with Google</button>
    `
    }
  `);
}

function showAddStoryModal() {
  openModal(`
    <div class="card-meta-row">
      <span class="badge badge-estimate">Jaccard Duplicate Guard Enabled</span>
      <button type="button" class="btn btn-outline btn-sm" data-action="close-modal">✕ Close</button>
    </div>
    <h2 id="modal-title" class="section-title" style="margin-top: 8px">➕ Save Personal Cultural Field Note</h2>
    <p style="color: var(--ivory-muted); font-size: 0.86rem">Add a documented heritage note or local oral tradition to your personal Katha library. Duplicate or near-duplicate texts (&ge;80% overlap) are automatically blocked.</p>
    <form id="custom-story-form">
      <div class="form-group">
        <label class="form-label">District</label>
        <select id="cs-district" class="form-select">
          ${DISTRICTS.map((d) => `<option value="${escapeHtml(d.id)}">${escapeHtml(d.nameEn)}</option>`).join('')}
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">Classification (Epistemic Honesty)</label>
        <select id="cs-class" class="form-select">
          <option value="Traveller Field Note (User Authored)">Traveller Field Note (User Authored)</option>
          <option value="Traditional Oral Legend & Folklore">Traditional Oral Legend &amp; Folklore</option>
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">Story Title</label>
        <input type="text" id="cs-title" class="form-input" required placeholder="e.g., Evening Arati at Maa Samaleswari" />
      </div>
      <div class="form-group">
        <label class="form-label">Narrative Text</label>
        <textarea id="cs-body" class="form-textarea" required placeholder="Write at least 2 sentences describing the site, context, and source..."></textarea>
      </div>
      <div class="form-group">
        <label class="form-label">Source / Reference</label>
        <input type="text" id="cs-source" class="form-input" required placeholder="e.g., On-site ASI plaque / Local temple chronicle" />
      </div>
      <button type="submit" class="btn btn-primary">Save to Katha Library</button>
    </form>
  `);
}

/* ---------------- Offline Pack Export ---------------- */
function downloadOfflineTravelPack() {
  const payload = {
    app: 'UtkalSarathi',
    exportedAt: new Date().toISOString(),
    website: getPublicSiteUrl(),
    emergencyHelplines: { policeFireSos: '112', ambulance: '108', womenHelpline: '181', touristHelpline: '1363' },
    savedTrips: state.savedTrips,
    trustedContacts: state.trustedContacts,
    districtsSummary: DISTRICTS.map((d) => ({
      number: d.number,
      nameEn: d.nameEn,
      nameOdia: d.nameOdia,
      headquarters: d.headquarters,
      emergencyHospital: d.emergencyHospital,
      policeControlInfo: d.policeControlInfo,
      destinations: d.destinations.map((p) => ({ name: p.name, bestSeason: p.bestSeason, nearestHub: p.nearestHub }))
    }))
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'UtkalSarathi-Odisha-Offline-Pack.json';
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
  showToast('Offline Odisha Travel Pack (.json) downloaded!');
}

/* ---------------- GPS Check-In ---------------- */
function captureLiveGps() {
  if (!('geolocation' in navigator)) {
    state.gpsStatus = {
      state: 'error',
      lat: null,
      lon: null,
      accuracy: null,
      timestamp: null,
      message: 'HTML5 Geolocation is not supported by this browser. Use emergency dialer 112 directly if needed.'
    };
    renderMain();
    return;
  }

  state.gpsStatus = { ...state.gpsStatus, state: 'loading', message: '' };
  renderMain();

  navigator.geolocation.getCurrentPosition(
    (pos) => {
      state.gpsStatus = {
        state: 'success',
        lat: pos.coords.latitude,
        lon: pos.coords.longitude,
        accuracy: pos.coords.accuracy || 25,
        timestamp: new Date().toLocaleTimeString(),
        message: ''
      };
      renderMain();
      showToast('Live GPS location acquired!');
    },
    (err) => {
      let friendly = 'Could not determine GPS location.';
      if (err.code === 1) {
        friendly =
          'Location permission was denied. Enable Location access in your browser site settings to capture live GPS check-ins.';
      } else if (err.code === 2) {
        friendly = 'Position unavailable — check device GPS/network signal.';
      } else if (err.code === 3) {
        friendly = 'GPS request timed out — move toward an open sky view and retry.';
      }
      state.gpsStatus = { state: 'error', lat: null, lon: null, accuracy: null, timestamp: null, message: friendly };
      renderMain();
    },
    { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 }
  );
}

/* ---------------- Global Event Delegation ---------------- */
function bindEvents() {
  document.getElementById('brand-home-btn')?.addEventListener('click', () => navigateTo('home'));
  document.getElementById('hdr-cloud-btn')?.addEventListener('click', () => showCloudVaultModal());
  document.getElementById('hdr-whatsapp-btn')?.addEventListener('click', () => {
    openWhatsAppShare(formatWebsiteInviteShare(getPublicSiteUrl()));
  });

  document.getElementById('audio-pause-btn')?.addEventListener('click', togglePauseAudio);
  document.getElementById('audio-stop-btn')?.addEventListener('click', stopAudio);
  document.getElementById('audio-speed-select')?.addEventListener('change', (e) => {
    state.audio.speed = Number(e.target.value) || 1.0;
    if (state.audio.playingId) {
      const current = getAllStories().find((s) => s.id === state.audio.playingId);
      if (current) speakStory(current);
    }
  });

  document.getElementById('modal-backdrop')?.addEventListener('click', (e) => {
    if (e.target.id === 'modal-backdrop') closeModal();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
  });

  document.addEventListener('click', async (e) => {
    const langBtn = e.target.closest('[data-lang]');
    if (langBtn) {
      state.lang = langBtn.dataset.lang;
      safeWriteJson(STORAGE_KEYS.lang, state.lang);
      renderChrome();
      renderMain();
      return;
    }

    const navBtn = e.target.closest('[data-nav]');
    if (navBtn) {
      navigateTo(navBtn.dataset.nav);
      return;
    }

    const openDistBtn = e.target.closest('[data-open-district]');
    if (openDistBtn) {
      showDistrictModal(openDistBtn.dataset.openDistrict);
      return;
    }

    const playDistBtn = e.target.closest('[data-play-district-story]');
    if (playDistBtn) {
      const story = getAllStories().find((s) => s.districtId === playDistBtn.dataset.playDistrictStory);
      if (story) speakStory(story);
      return;
    }

    const shareDistBtn = e.target.closest('[data-share-district]');
    if (shareDistBtn) {
      const dist = DISTRICTS.find((d) => d.id === shareDistBtn.dataset.shareDistrict);
      if (dist) openWhatsAppShare(formatDistrictShare(dist, getPublicSiteUrl()));
      return;
    }

    const addDistTripBtn = e.target.closest('[data-add-district-to-trip]');
    if (addDistTripBtn) {
      const id = addDistTripBtn.dataset.addDistrictToTrip;
      if (!state.plannerDraft.selectedDistrictIds.includes(id)) {
        state.plannerDraft.selectedDistrictIds.push(id);
      }
      closeModal();
      navigateTo('planner');
      showToast('District added to your Trip Planner!');
      return;
    }

    const speakBtn = e.target.closest('[data-speak-story]');
    if (speakBtn) {
      const storyId = speakBtn.dataset.speakStory;
      if (state.audio.playingId === storyId) {
        stopAudio();
      } else {
        const story = getAllStories().find((s) => s.id === storyId);
        if (story) speakStory(story);
      }
      renderMain();
      return;
    }

    const favBtn = e.target.closest('[data-fav-story]');
    if (favBtn) {
      const id = favBtn.dataset.favStory;
      if (state.favStories.has(id)) state.favStories.delete(id);
      else state.favStories.add(id);
      safeWriteJson(STORAGE_KEYS.favStories, [...state.favStories]);
      renderMain();
      return;
    }

    const shareStoryBtn = e.target.closest('[data-share-story]');
    if (shareStoryBtn) {
      const st = getAllStories().find((s) => s.id === shareStoryBtn.dataset.shareStory);
      if (st) {
        openWhatsAppShare(
          `🎙️ *${getStoryTitle(st)}*\n(${st.destinationName} — ${st.factClassification})\n\n${getStoryBody(st)}\n\n📚 ${st.sources}\nListen on UtkalSarathi: ${getPublicSiteUrl()}/#katha`
        );
      }
      return;
    }

    const regionBtn = e.target.closest('[data-region]');
    if (regionBtn) {
      state.selectedRegion = regionBtn.dataset.region;
      renderMain();
      return;
    }

    const kathaCatBtn = e.target.closest('[data-katha-cat]');
    if (kathaCatBtn) {
      state.kathaCategory = kathaCatBtn.dataset.kathaCat;
      renderMain();
      return;
    }

    const craftBtn = e.target.closest('[data-craft-type]');
    if (craftBtn) {
      state.craftFilter = craftBtn.dataset.craftType;
      renderMain();
      return;
    }

    const mitraSample = e.target.closest('[data-mitra-sample]');
    if (mitraSample) {
      runMitraQuery(mitraSample.dataset.mitraSample);
      return;
    }

    const mapNode = e.target.closest('[data-map-district]');
    if (mapNode) {
      state.fareForm.selectedMapDistrictId = mapNode.dataset.mapDistrict;
      state.fareForm.destId = mapNode.dataset.mapDistrict;
      renderMain();
      return;
    }

    const setOriginBtn = e.target.closest('[data-set-origin]');
    if (setOriginBtn) {
      state.fareForm.originId = setOriginBtn.dataset.setOrigin;
      renderMain();
      return;
    }

    const setDestBtn = e.target.closest('[data-set-dest]');
    if (setDestBtn) {
      state.fareForm.destId = setDestBtn.dataset.setDest;
      renderMain();
      return;
    }

    const shareSavedTripBtn = e.target.closest('[data-share-saved-trip]');
    if (shareSavedTripBtn) {
      const trip = state.savedTrips.find((tItem) => tItem.id === shareSavedTripBtn.dataset.shareSavedTrip);
      if (trip) openWhatsAppShare(formatTripShare(trip, getPublicSiteUrl()));
      return;
    }

    const deleteTripBtn = e.target.closest('[data-delete-trip]');
    if (deleteTripBtn) {
      state.savedTrips = state.savedTrips.filter((tItem) => tItem.id !== deleteTripBtn.dataset.deleteTrip);
      safeWriteJson(STORAGE_KEYS.trips, state.savedTrips);
      renderMain();
      showToast('Itinerary removed.');
      return;
    }

    const deleteContactBtn = e.target.closest('[data-delete-contact]');
    if (deleteContactBtn) {
      state.trustedContacts = state.trustedContacts.filter((c) => c.id !== deleteContactBtn.dataset.deleteContact);
      safeWriteJson(STORAGE_KEYS.contacts, state.trustedContacts);
      renderMain();
      return;
    }

    const actionEl = e.target.closest('[data-action]');
    if (actionEl) {
      const act = actionEl.dataset.action;
      if (act === 'close-modal') closeModal();
      else if (act === 'share-website') openWhatsAppShare(formatWebsiteInviteShare(getPublicSiteUrl()));
      else if (act === 'download-offline-pack') downloadOfflineTravelPack();
      else if (act === 'jump-hidden-gems') {
        state.onlyHiddenGems = true;
        state.selectedRegion = 'ALL';
        navigateTo('districts');
      } else if (act === 'toggle-gems-filter') {
        state.onlyHiddenGems = !state.onlyHiddenGems;
        renderMain();
      } else if (act === 'reset-district-filters') {
        state.searchQuery = '';
        state.selectedRegion = 'ALL';
        state.onlyHiddenGems = false;
        renderMain();
      } else if (act === 'share-preview-trip') {
        const plan = generateDeterministicTripPlan({ ...state.plannerDraft, districts: DISTRICTS });
        openWhatsAppShare(formatTripShare(plan, getPublicSiteUrl()));
      } else if (act === 'capture-gps') {
        captureLiveGps();
      } else if (act === 'share-gps-whatsapp' && state.gpsStatus.state === 'success') {
        const msg =
          `🆘 *UtkalSuraksha Live Traveller Check-In*\n` +
          `📍 Coordinates: ${state.gpsStatus.lat.toFixed(5)}, ${state.gpsStatus.lon.toFixed(5)} (±${Math.round(
            state.gpsStatus.accuracy
          )}m)\n` +
          `🕒 Time: ${state.gpsStatus.timestamp}\n` +
          `🗺️ Google Maps: https://maps.google.com/?q=${state.gpsStatus.lat},${state.gpsStatus.lon}\n` +
          `🚨 Odisha Emergency Helpline: 112`;
        openWhatsAppShare(msg);
      } else if (act === 'open-add-story-modal') {
        showAddStoryModal();
      } else if (act === 'firebase-signin') {
        try {
          await signInWithGoogleWeb();
          closeModal();
          showToast('Signed in with Google! Cloud Vault active.');
        } catch (err) {
          showToast(err.message || 'Sign-in failed.');
        }
      } else if (act === 'firebase-signout') {
        await signOutWeb();
        closeModal();
        showToast('Signed out of Cloud Vault.');
      }
    }
  });

  // Input changes for search & live calculators
  document.addEventListener('input', (e) => {
    if (e.target.id === 'districts-search-input') {
      state.searchQuery = e.target.value;
      const cursorPos = e.target.selectionStart;
      renderMain();
      const restored = document.getElementById('districts-search-input');
      if (restored) {
        restored.focus();
        restored.setSelectionRange(cursorPos, cursorPos);
      }
    } else if (
      ['plan-title', 'plan-days', 'plan-travelers', 'plan-budget', 'plan-pace'].includes(e.target.id) ||
      e.target.name === 'plan-district'
    ) {
      syncPlannerDraftFromDom();
      if (e.target.id !== 'plan-title') {
        renderMain();
      }
    } else if (['fare-origin', 'fare-dest', 'fare-mode'].includes(e.target.id)) {
      state.fareForm.originId = document.getElementById('fare-origin')?.value || state.fareForm.originId;
      state.fareForm.destId = document.getElementById('fare-dest')?.value || state.fareForm.destId;
      state.fareForm.vehicleMode = document.getElementById('fare-mode')?.value || state.fareForm.vehicleMode;
      state.fareForm.selectedMapDistrictId = state.fareForm.destId;
      renderMain();
    }
  });

  // Form submissions
  document.addEventListener('submit', async (e) => {
    if (e.target.id === 'hero-search-form') {
      e.preventDefault();
      state.searchQuery = document.getElementById('hero-search-input')?.value || '';
      navigateTo('districts');
    } else if (e.target.id === 'mitra-form') {
      e.preventDefault();
      const input = document.getElementById('mitra-input');
      if (input && input.value.trim()) {
        runMitraQuery(input.value.trim());
      }
    } else if (e.target.id === 'planner-form') {
      e.preventDefault();
      syncPlannerDraftFromDom();
      const newTrip = generateDeterministicTripPlan({ ...state.plannerDraft, districts: DISTRICTS });
      state.savedTrips = [newTrip, ...state.savedTrips];
      safeWriteJson(STORAGE_KEYS.trips, state.savedTrips);
      try {
        const synced = await syncTripToFirestore(newTrip);
        showToast(synced ? 'Trip saved locally & synced to Cloud Firestore!' : 'Trip saved in browser vault!');
      } catch {
        showToast('Trip saved locally (Cloud sync unavailable).');
      }
      renderMain();
    } else if (e.target.id === 'contact-form') {
      e.preventDefault();
      const name = document.getElementById('contact-name')?.value.trim();
      const phone = document.getElementById('contact-phone')?.value.trim();
      const relation = document.getElementById('contact-relation')?.value.trim() || 'Family';
      if (!name || !phone) return;
      const contact = { id: `cnt_${Date.now()}`, name, phone, relation };
      state.trustedContacts = [contact, ...state.trustedContacts];
      safeWriteJson(STORAGE_KEYS.contacts, state.trustedContacts);
      try {
        await syncContactToFirestore(contact);
      } catch {
        // Local persistence already succeeded
      }
      renderMain();
      showToast('Trusted emergency contact saved.');
    } else if (e.target.id === 'hazard-form') {
      e.preventDefault();
      const districtId = document.getElementById('hazard-district')?.value || 'khordha';
      const category = document.getElementById('hazard-category')?.value || 'Road Disruption';
      const locationLabel = document.getElementById('hazard-location')?.value.trim();
      const description = document.getElementById('hazard-desc')?.value.trim();
      if (!locationLabel || !description) return;
      const report = {
        id: `haz_${Date.now()}`,
        districtId,
        category,
        locationLabel,
        description,
        severity: 'Caution',
        verificationStatus: 'Pending Moderation',
        reportedAt: Date.now()
      };
      state.localHazards = [report, ...state.localHazards];
      safeWriteJson(STORAGE_KEYS.hazards, state.localHazards);
      try {
        await submitModeratedHazardToFirestore(report);
      } catch {
        // Local persistence already succeeded
      }
      renderMain();
      showToast('Hazard logged as Pending Moderation.');
    } else if (e.target.id === 'custom-story-form') {
      e.preventDefault();
      const districtId = document.getElementById('cs-district')?.value || 'puri';
      const factClassification = document.getElementById('cs-class')?.value || 'Traveller Field Note (User Authored)';
      const titleEn = document.getElementById('cs-title')?.value.trim();
      const bodyEn = document.getElementById('cs-body')?.value.trim();
      const sources = document.getElementById('cs-source')?.value.trim();
      if (!titleEn || !bodyEn) return;

      const existingBodies = getAllStories().map((s) => s.bodyEn);
      if (isNearDuplicateStory(bodyEn, existingBodies, 0.8)) {
        showToast('Duplicate Guard: A very similar story already exists in the Katha library!');
        return;
      }

      const dist = DISTRICTS.find((d) => d.id === districtId) || DISTRICTS[0];
      const newStory = {
        id: `custom_${Date.now()}`,
        districtId,
        destinationName: dist.nameEn,
        category: 'Field Notes',
        period: 'Contemporary Note',
        factClassification,
        sources,
        durationSec: 120,
        titleEn,
        titleOdia: titleEn,
        titleHindi: titleEn,
        bodyEn,
        bodyOdia: bodyEn,
        bodyHindi: bodyEn
      };
      state.customStories = [newStory, ...state.customStories];
      safeWriteJson(STORAGE_KEYS.customStories, state.customStories);
      closeModal();
      renderMain();
      showToast('Cultural field note added to Katha library!');
    }
  });

  window.addEventListener('hashchange', () => {
    const hashRoute = window.location.hash.replace(/^#/, '');
    if (hashRoute && hashRoute !== state.route) {
      navigateTo(hashRoute, false);
    }
  });
}

function syncPlannerDraftFromDom() {
  const titleEl = document.getElementById('plan-title');
  const daysEl = document.getElementById('plan-days');
  const travEl = document.getElementById('plan-travelers');
  const budgetEl = document.getElementById('plan-budget');
  const paceEl = document.getElementById('plan-pace');
  const checked = [...document.querySelectorAll('input[name="plan-district"]:checked')].map((c) => c.value);

  if (titleEl) state.plannerDraft.title = titleEl.value;
  if (daysEl) state.plannerDraft.days = Math.min(14, Math.max(1, Number(daysEl.value) || 1));
  if (travEl) state.plannerDraft.travelers = Math.min(12, Math.max(1, Number(travEl.value) || 1));
  if (budgetEl) state.plannerDraft.budgetStyle = budgetEl.value;
  if (paceEl) state.plannerDraft.pace = paceEl.value;
  if (checked.length > 0) state.plannerDraft.selectedDistrictIds = checked;
}

function runMitraQuery(queryText) {
  state.mitraHistory.push({ role: 'user', text: queryText });
  const res = queryCuratedMitraKnowledge(queryText, DISTRICTS, getAllStories(), CULTURAL_LISTINGS);
  state.mitraHistory.push({
    role: 'assistant',
    badge: res.badge,
    text: res.answer,
    citations: res.citations,
    districtId: res.districtId,
    storyId: res.storyId
  });
  renderMain();
  const chatLog = document.getElementById('mitra-chat-log');
  if (chatLog) chatLog.scrollTop = chatLog.scrollHeight;
}

/* ---------------- Bootstrap ---------------- */
function init() {
  const initialHash = window.location.hash.replace(/^#/, '');
  if (initialHash && NAV_ITEMS.some((n) => n.id === initialHash)) {
    state.route = initialHash;
  }

  subscribeToAuth(async (authSnapshot) => {
    state.auth = authSnapshot;
    renderChrome();
    if (authSnapshot.user) {
      try {
        const cloudHazards = await fetchCommunityHazardsFromFirestore();
        if (cloudHazards.length > 0) {
          const existingIds = new Set(state.localHazards.map((h) => h.id));
          for (const ch of cloudHazards) {
            if (!existingIds.has(ch.id)) state.localHazards.push(ch);
          }
          if (state.route === 'safety') renderMain();
        }
      } catch {
        // Ignore network errors cleanly
      }
    }
  });

  bindEvents();
  renderChrome();
  renderMain();
}

init();
