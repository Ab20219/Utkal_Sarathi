import test from 'node:test';
import assert from 'node:assert/strict';
import { ODISHA_30_DISTRICTS, getDistrictsByZone, findDistrict } from './odishaDistricts.ts';

test('verifies that exactly all 30 districts of Odisha are present', () => {
  assert.equal(ODISHA_30_DISTRICTS.length, 30);
  const districtIds = new Set(ODISHA_30_DISTRICTS.map((d) => d.id));
  assert.equal(districtIds.size, 30);
});

test('verifies that every district has essential tourism attributes', () => {
  for (const d of ODISHA_30_DISTRICTS) {
    assert.ok(d.name && d.name.length > 2, `District ${d.id} missing name`);
    assert.ok(d.odiaName, `District ${d.id} missing Odia name`);
    assert.ok(d.headquarters, `District ${d.id} missing HQ`);
    assert.ok(d.highlights.length >= 2, `District ${d.id} has insufficient highlights`);
    assert.ok(d.hiddenGems && d.hiddenGems.length >= 2, `District ${d.id} missing hidden gems`);
    assert.ok(d.recommendedStays && d.recommendedStays.length >= 2, `District ${d.id} missing stays`);
    assert.ok(d.foodSpots && d.foodSpots.length >= 1, `District ${d.id} missing food spots`);
    assert.ok(d.touristGuideInfo && d.touristGuideInfo.phone, `District ${d.id} missing guide info`);
    assert.ok(d.signatureCuisine.length >= 1, `District ${d.id} missing cuisine`);
    assert.ok(d.transportHubs.nearestRail, `District ${d.id} missing transport`);
    assert.ok(d.safetyAndHelpline.districtHospital, `District ${d.id} missing hospital`);
    assert.ok(d.safetyAndHelpline.controlRoomNumber, `District ${d.id} missing control room`);
  }
});

test('filters districts properly by zone', () => {
  const coastal = getDistrictsByZone('Coastal');
  assert.ok(coastal.length > 0);
  assert.ok(coastal.some((d) => d.id === 'puri'));
  assert.ok(coastal.some((d) => d.id === 'cuttack'));

  const western = getDistrictsByZone('Western');
  assert.ok(western.length > 0);
  assert.ok(western.some((d) => d.id === 'sambalpur'));
  assert.ok(western.some((d) => d.id === 'bargarh'));
});

test('findDistrict search works by ID, English name, and partial match', () => {
  assert.equal(findDistrict('nayagarh')?.id, 'nayagarh');
  assert.equal(findDistrict('Mayurbhanj')?.headquarters, 'Baripada');
  assert.equal(findDistrict('dhenkanal')?.tagline.includes('Mahima Dharma'), true);
  // Sentence embedded queries
  assert.equal(findDistrict('Tell me about the waterfalls in Koraput district')?.id, 'koraput');
  assert.equal(findDistrict('What are the attractions in Sambalpur?')?.id, 'sambalpur');
  assert.equal(findDistrict('କଳାହାଣ୍ଡି ଜିଲ୍ଲାର ଐତିହ୍ୟ')?.id, 'kalahandi');
});
