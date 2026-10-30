import test from 'node:test';
import assert from 'node:assert/strict';
import { ODISHA_30_DISTRICTS } from './odishaDistricts.ts';
import { DISTRICT_MAP_POINTS } from './odishaDistrictGeoPoints.ts';

test('verifies all 30 districts have valid GeoMap GIS points and attributes', () => {
  assert.equal(ODISHA_30_DISTRICTS.length, 30, 'Must have exactly 30 districts');
  
  for (const d of ODISHA_30_DISTRICTS) {
    const geo = DISTRICT_MAP_POINTS[d.id];
    assert.ok(geo, `District ${d.id} must have a GIS map point`);
    assert.ok(geo.x >= 10 && geo.x <= 95, `District ${d.id} x coordinate must be in valid SVG range`);
    assert.ok(geo.y >= 10 && geo.y <= 95, `District ${d.id} y coordinate must be in valid SVG range`);
    assert.ok(geo.famousTemples.length >= 2, `District ${d.id} must list at least 2 temples`);
    assert.ok(geo.famousBeachesOrWater.length >= 1, `District ${d.id} must list at least 1 beach or waterway`);
  }
});

test('verifies every district has complete transport and safety infrastructure', () => {
  for (const d of ODISHA_30_DISTRICTS) {
    // Transport
    assert.ok(d.transportHubs.nearestRail, `District ${d.id} must have a nearest rail hub`);
    assert.ok(d.transportHubs.highway, `District ${d.id} must have a highway`);
    assert.ok(d.transportHubs.lastMileTransit, `District ${d.id} must have last-mile transit advice`);

    // Safety
    assert.ok(d.safetyAndHelpline.districtHospital, `District ${d.id} must have a district hospital`);
    assert.ok(d.safetyAndHelpline.policeStation, `District ${d.id} must have a police station`);
    assert.ok(d.safetyAndHelpline.hospitalContact, `District ${d.id} must have hospital contact details`);

    // Food & Cuisine
    assert.ok(d.signatureCuisine.length >= 2, `District ${d.id} must have signature cuisine items`);
    assert.ok(d.handicraftsAndArt.length >= 1, `District ${d.id} must have handicrafts`);
  }
});

test('verifies coastal districts with marine beaches are properly identified', () => {
  const coastalWithBeaches = ODISHA_30_DISTRICTS.filter((d) => DISTRICT_MAP_POINTS[d.id]?.hasBeaches);
  const coastalIds = coastalWithBeaches.map((d) => d.id);
  
  assert.ok(coastalIds.includes('puri'), 'Puri must have beaches');
  assert.ok(coastalIds.includes('ganjam'), 'Ganjam (Gopalpur) must have beaches');
  assert.ok(coastalIds.includes('balasore'), 'Balasore (Chandipur, Talsari) must have beaches');
  assert.ok(coastalIds.includes('bhadrak'), 'Bhadrak (Dhamra) must have beaches');
  assert.ok(coastalIds.includes('kendrapara'), 'Kendrapara (Pentha, Hukitola) must have beaches');
  assert.ok(coastalIds.includes('jagatsinghpur'), 'Jagatsinghpur (Paradeep, Siali) must have beaches');
});
