import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { UI_STRINGS, t } from '../src/data/i18n.js';
import { DISTRICTS, CULTURAL_LISTINGS, EMERGENCY_AND_TRANSIT_HUBS } from '../src/data/districtsCatalog.js';
import { ALL_KATHA_STORIES, isNearDuplicateStory } from '../src/data/kathaCatalog.js';
import {
  estimateRoadDistanceKm,
  calculateFairFareEstimate,
  generateDeterministicTripPlan,
  queryCuratedMitraKnowledge,
  buildWhatsAppShareUrl,
  formatWebsiteInviteShare
} from '../src/services/domainLogic.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

test('Catalog contains all 30 official Odisha districts with valid coordinates and multilingual names', () => {
  assert.equal(DISTRICTS.length, 30, 'Must have exactly 30 official Odisha districts');

  const numbers = DISTRICTS.map((d) => d.number).sort((a, b) => a - b);
  assert.deepEqual(
    numbers,
    Array.from({ length: 30 }, (_, i) => i + 1),
    'District numbers must span 1..30 without gaps'
  );

  const uniqueIds = new Set(DISTRICTS.map((d) => d.id));
  assert.equal(uniqueIds.size, 30, 'All 30 district IDs must be unique');

  let totalDestinations = 0;
  for (const d of DISTRICTS) {
    assert.ok(d.nameEn && d.nameOdia && d.nameHindi, `District ${d.id} missing multilingual name`);
    assert.ok(d.latitude >= 17.5 && d.latitude <= 22.8, `Latitude out of Odisha bounds for ${d.id}`);
    assert.ok(d.longitude >= 81.2 && d.longitude <= 87.8, `Longitude out of Odisha bounds for ${d.id}`);
    assert.ok(d.emergencyHospital.length > 5, `Emergency hospital missing for ${d.id}`);
    assert.ok(Array.isArray(d.destinations) && d.destinations.length >= 1, `Destinations missing for ${d.id}`);
    totalDestinations += d.destinations.length;
  }
  assert.ok(totalDestinations >= 55, `Expected 55+ curated destinations, found ${totalDestinations}`);
});

test('Utkal Katha covers all 30 districts with epistemic classifications and duplicate detection', () => {
  assert.ok(ALL_KATHA_STORIES.length >= 30, 'Expected at least 30 verified Katha stories');
  const coveredDistricts = new Set(ALL_KATHA_STORIES.map((s) => s.districtId));
  assert.equal(coveredDistricts.size, 30, 'Every one of the 30 districts must have a Katha story');

  for (const s of ALL_KATHA_STORIES) {
    assert.ok(s.titleEn && s.titleOdia && s.titleHindi, `Story ${s.id} missing localized titles`);
    assert.ok(s.factClassification && s.sources, `Story ${s.id} missing epistemic badge or sources`);
  }

  const sampleBody = ALL_KATHA_STORIES[0].bodyEn;
  assert.equal(isNearDuplicateStory(sampleBody, [sampleBody], 0.8), true);
  assert.equal(
    isNearDuplicateStory('Completely distinct note about Rourkela hockey heritage and Brahmani river.', [sampleBody], 0.8),
    false
  );
});

test('Multilingual UI dictionary has complete key parity across English, Odia, and Hindi', () => {
  const enKeys = Object.keys(UI_STRINGS.en).sort();
  const orKeys = Object.keys(UI_STRINGS.or).sort();
  const hiKeys = Object.keys(UI_STRINGS.hi).sort();
  assert.deepEqual(orKeys, enKeys, 'Odia UI keys must match English UI keys');
  assert.deepEqual(hiKeys, enKeys, 'Hindi UI keys must match English UI keys');
  assert.equal(t('or', 'brandName'), 'ଉତ୍କଳ ସାରଥୀ');
  assert.equal(t('hi', 'brandName'), 'उत्कल सारथी');
});

test('Deterministic Trip Planner & INR Budget Calculator produces exact arithmetic', () => {
  const plan = generateDeterministicTripPlan({
    title: 'Golden Triangle Test',
    days: 4,
    travelers: 3,
    budgetStyle: 'Mid',
    pace: 'Balanced',
    selectedDistrictIds: ['khordha', 'puri', 'cuttack'],
    districts: DISTRICTS
  });

  assert.equal(plan.days, 4);
  assert.equal(plan.dayPlans.length, 4);
  const expectedSum =
    plan.stayInr + plan.foodInr + plan.transitInr + plan.entryInr + plan.contingencyInr;
  assert.equal(plan.totalInr, expectedSum, 'Total INR must equal exact sum of itemized budget components');
  assert.ok(plan.totalInr > 10000);
});

test('Haversine road distance and non-binding Fair Fare estimator produce realistic figures', () => {
  const khordha = DISTRICTS.find((d) => d.id === 'khordha');
  const puri = DISTRICTS.find((d) => d.id === 'puri');
  const distKm = estimateRoadDistanceKm(khordha.latitude, khordha.longitude, puri.latitude, puri.longitude, false);
  assert.ok(distKm >= 55 && distKm <= 85, `Expected Bhubaneswar/Khordha -> Puri ~60-80km, got ${distKm}km`);

  const fare = calculateFairFareEstimate(khordha, puri, 'sedan');
  assert.ok(fare.lowInr > 0 && fare.highInr > fare.lowInr);
  assert.match(fare.classification, /Estimated Reference Range/i);
  assert.match(fare.googleMapsUrl, /google\.com\/maps\/dir/);
});

test('Utkal Mitra retrieval answers verified queries with citations and declines unverified queries honestly', () => {
  const konarkRes = queryCuratedMitraKnowledge('Tell me about Konark in Puri', DISTRICTS, ALL_KATHA_STORIES, CULTURAL_LISTINGS);
  assert.equal(konarkRes.found, true);
  assert.equal(konarkRes.districtId, 'puri');
  assert.ok(konarkRes.citations.length > 0);

  const unknownRes = queryCuratedMitraKnowledge('zxqvbnm mars colony flights', DISTRICTS, ALL_KATHA_STORIES, CULTURAL_LISTINGS);
  assert.equal(unknownRes.found, false);
  assert.match(unknownRes.answer, /does not fabricate/i);
});

test('WhatsApp share builder encodes URLs and Vercel configuration matches Vite dist output', () => {
  const invite = formatWebsiteInviteShare('https://utkalsarathi.vercel.app');
  const waUrl = buildWhatsAppShareUrl(invite);
  assert.ok(waUrl.startsWith('https://wa.me/?text='));
  assert.ok(waUrl.includes(encodeURIComponent('https://utkalsarathi.vercel.app')));

  const vercelJsonPath = resolve(__dirname, '../vercel.json');
  assert.equal(existsSync(vercelJsonPath), true, 'web/vercel.json must exist');
  const vercelCfg = JSON.parse(readFileSync(vercelJsonPath, 'utf8'));
  assert.equal(vercelCfg.outputDirectory, 'dist');
  assert.equal(vercelCfg.buildCommand, 'npm run build');

  assert.ok(EMERGENCY_AND_TRANSIT_HUBS.length >= 10);
});

test('Synced visual assets and production build artifacts are present without broken paths', () => {
  const requiredImages = [
    'utkal-emblem.jpg',
    'hero-puri-konark.jpg',
    'crafts-cuisine.jpg',
    'nature-ecotourism.jpg'
  ];
  for (const img of requiredImages) {
    assert.equal(
      existsSync(resolve(__dirname, '../public/images', img)),
      true,
      `Missing public image asset: ${img}`
    );
  }
  assert.equal(existsSync(resolve(__dirname, '../public/favicon.svg')), true, 'Missing favicon.svg');

  const distIndex = resolve(__dirname, '../dist/index.html');
  if (existsSync(distIndex)) {
    const html = readFileSync(distIndex, 'utf8');
    assert.match(html, /UtkalSarathi/);
    assert.match(html, /\/assets\/index-/);
  }
});
