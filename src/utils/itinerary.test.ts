import test from 'node:test';
import assert from 'node:assert/strict';
import { filterDestinations, generateItinerary, ODISHA_DESTINATIONS } from './itinerary.ts';

test('filters destinations by spiritual category', () => {
  const result = filterDestinations(['spiritual']);
  assert.ok(result.length > 0);
  assert.equal(result.every(d => d.category === 'spiritual'), true);
  assert.equal(result.some(d => d.id === 'puri-jagannath-temple'), true);
});

test('falls back to all destinations when no category matches or list empty', () => {
  const resultEmpty = filterDestinations([]);
  assert.equal(resultEmpty.length, ODISHA_DESTINATIONS.length);
});

test('generates 3-day itinerary properly structured', () => {
  const plans = generateItinerary({
    startCity: 'Bhubaneswar',
    days: 3,
    interests: ['heritage', 'nature'],
    travelStyle: 'moderate',
  });

  assert.equal(plans.length, 3);
  assert.equal(plans[0].dayNumber, 1);
  assert.equal(plans[1].dayNumber, 2);
  assert.equal(plans[2].dayNumber, 3);
  assert.ok(plans[0].destinations.length >= 2);
  assert.ok(plans[0].totalDayCost > 0);
});

test('curates 10-15 destinations with eco-sensitivity and verified reliability', () => {
  assert.ok(ODISHA_DESTINATIONS.length >= 10 && ODISHA_DESTINATIONS.length <= 15);
  for (const d of ODISHA_DESTINATIONS) {
    assert.ok(d.ecoSensitivityTag && d.ecoSensitivityTag.length > 5);
    assert.ok(d.sourceReliability === 'verified_official' || d.sourceReliability === 'provider_confirmed');
  }
});

test('generates itinerary starting from any of the 30 districts of Odisha', () => {
  const sampleDistricts = ['Mayurbhanj', 'Koraput', 'Sambalpur', 'Ganjam', 'Kalahandi', 'Balasore'];
  for (const dist of sampleDistricts) {
    const plans = generateItinerary({
      startCity: dist,
      days: 3,
      interests: ['nature', 'heritage'],
      travelStyle: 'moderate',
    });
    assert.equal(plans.length, 3);
    assert.equal(plans[0].dayNumber, 1);
    // Day 1 should feature or relate to the starting district
    const day1Destinations = plans[0].destinations.map(s => s.destination.district.toLowerCase());
    assert.ok(
      day1Destinations.some(d => d.includes(dist.toLowerCase()) || dist.toLowerCase().includes(d)),
      `Day 1 should feature starting district ${dist}`
    );
  }
});

test('refineItineraryLocally updates theme, activities, and timings for relaxed mode', async () => {
  const initial = generateItinerary({
    startCity: 'Khordha',
    days: 2,
    interests: ['heritage'],
    travelStyle: 'moderate',
  });

  const { summary, refinedPlans } = (await import('./itinerary.ts')).refineItineraryLocally(
    initial,
    'Make it relaxed and leisure paced for seniors with fewer walking hours'
  );

  assert.ok(summary.toLowerCase().includes('relaxed'));
  assert.equal(refinedPlans.length, initial.length);
  assert.ok(refinedPlans[0].theme.includes('LEISURE'));
  assert.ok(refinedPlans[0].destinations[0].timeSlot.includes('09:30'));
});

test('calculatePlansTotalCost accurately computes itemized breakdown', async () => {
  const plans = generateItinerary({
    startCity: 'Puri',
    days: 3,
    interests: ['spiritual'],
    travelStyle: 'moderate',
  });

  const { calculatePlansTotalCost } = await import('./itinerary.ts');
  const budget = calculatePlansTotalCost(plans, 2, 'moderate');

  assert.ok(budget.accommodation > 0);
  assert.ok(budget.transport > 0);
  assert.ok(budget.food > 0);
  assert.ok(budget.entryAndBuffer > 0);
  assert.equal(
    budget.totalCost,
    budget.accommodation + budget.transport + budget.food + budget.entryAndBuffer
  );
  assert.equal(budget.perPersonCost, Math.round(budget.totalCost / 2));
});

test('when includeNearby is false, 100% of destinations across all days are strictly within the chosen district', () => {
  const testDistricts = ['Mayurbhanj', 'Koraput', 'Sambalpur', 'Kalahandi', 'Ganjam'];
  for (const dist of testDistricts) {
    const plans = generateItinerary({
      startCity: dist,
      days: 3,
      interests: ['nature', 'heritage'],
      travelStyle: 'moderate',
      includeNearby: false,
    });

    assert.equal(plans.length, 3);
    for (const day of plans) {
      for (const slot of day.destinations) {
        // District must strictly match the selected district
        assert.equal(
          slot.destination.district.toLowerCase(),
          dist.toLowerCase(),
          `Destination "${slot.destination.name}" must be in ${dist}, found in ${slot.destination.district}`
        );
        // Ensure BBSR/Puri/Konark are not leaked into non-Khordha/non-Puri districts
        assert.equal(
          slot.destination.name.toLowerCase().includes('lingaraj') ||
          slot.destination.name.toLowerCase().includes('dhauli') ||
          slot.destination.name.toLowerCase().includes('konark sun temple'),
          false,
          `Golden Triangle landmark should never leak into ${dist} itinerary`
        );
      }
    }
  }
});

test('when includeNearby is true, excursions to selected bordering districts are included with transit and distance', () => {
  const plans = generateItinerary({
    startCity: 'Mayurbhanj',
    days: 3,
    interests: ['nature', 'heritage'],
    travelStyle: 'moderate',
    includeNearby: true,
    selectedNearbyDistrictIds: ['balasore', 'keonjhar'],
  });

  assert.equal(plans.length, 3);
  // At least one day should be an excursion day to Balasore or Keonjhar
  const excursionDay = plans.find(p => p.theme.includes('NEIGHBORING'));
  assert.ok(excursionDay, 'Should contain a neighboring excursion day');
  assert.ok(
    excursionDay.title.includes('Balasore') || excursionDay.title.includes('Keonjhar'),
    'Excursion day should feature one of the selected nearby districts'
  );
  assert.ok(excursionDay.title.includes('km via NH-'), 'Excursion day title should mention highway and distance');
});

test('getNearbyDistricts returns valid adjacency mappings for all 30 districts of Odisha', async () => {
  const { getNearbyDistricts, ODISHA_NEARBY_DISTRICTS } = await import('../data/odishaNearbyDistricts.ts');
  assert.equal(Object.keys(ODISHA_NEARBY_DISTRICTS).length, 30);

  const neighbors = getNearbyDistricts('Koraput');
  assert.ok(neighbors.length >= 3);
  for (const n of neighbors) {
    assert.ok(n.distanceKm > 0);
    assert.ok(n.travelTime.length > 0);
    assert.ok(n.highway.startsWith('NH-') || n.highway.startsWith('SH-'));
    assert.ok(n.topAttractions.length >= 2);
    assert.ok(n.foodHighlight.length > 0);
    assert.ok(n.whyVisit.length > 0);
  }
});

test('multi-district circuit mode rotates across selected districts with inter-district highway transfers', () => {
  const plans = generateItinerary({
    startCity: 'Khordha',
    days: 3,
    interests: ['heritage', 'nature'],
    travelStyle: 'moderate',
    tripScope: 'multi',
    selectedMultiDistrictIds: ['khordha', 'puri', 'sambalpur'],
  });

  assert.equal(plans.length, 3);
  assert.ok(plans[0].theme.includes('MULTI-DISTRICT CIRCUIT'));
  assert.ok(plans[0].destinations[0].destination.district.includes('Khordha'));
  assert.equal(plans[1].destinations[0].destination.district, 'Puri');
  assert.equal(plans[2].destinations[0].destination.district, 'Sambalpur');
  assert.ok(plans[1].title.includes('→ Puri'));
  assert.ok(plans[2].title.includes('→ Sambalpur'));
});

test('all 30 Odisha districts have valid WGS84 GPS coordinates and accurate nearest-district lookup', async () => {
  const { DISTRICT_MAP_POINTS, findNearestDistrictByGps } = await import(
    '../data/odishaDistrictGeoPoints.ts'
  );
  const points = Object.values(DISTRICT_MAP_POINTS);
  assert.equal(points.length, 30);

  for (const pt of points) {
    assert.ok(pt.lat >= 17.5 && pt.lat <= 23.0, `Invalid latitude for ${pt.id}: ${pt.lat}`);
    assert.ok(pt.lng >= 81.0 && pt.lng <= 88.0, `Invalid longitude for ${pt.id}: ${pt.lng}`);
  }

  // Test Puri Shree Jagannath Temple coordinates
  const nearPuri = findNearestDistrictByGps(19.8049, 85.8179);
  assert.equal(nearPuri.point.id, 'puri');
  assert.ok(nearPuri.distanceKm < 5);

  // Test Koraput coordinates
  const nearKoraput = findNearestDistrictByGps(18.812, 82.711);
  assert.equal(nearKoraput.point.id, 'koraput');
  assert.ok(nearKoraput.distanceKm < 3);
});

test('nativeAndroid directions helper and apiConfig backend candidates return valid HTTPS endpoints', async () => {
  const { buildGoogleMapsDirectionsUrl, calculateHaversineDistanceKm } = await import(
    './nativeAndroid.ts'
  );
  const { getNativeBackendCandidates } = await import('./apiConfig.ts');

  const dirUrl = buildGoogleMapsDirectionsUrl(19.8135, 85.8312, 'Puri');
  assert.ok(dirUrl.startsWith('https://www.google.com/maps/dir/?'));
  assert.ok(dirUrl.includes('19.81350%2C85.83120') || dirUrl.includes('19.81350,85.83120'));

  const bbsrToPuriKm = calculateHaversineDistanceKm(20.2961, 85.8245, 19.8135, 85.8312);
  assert.ok(bbsrToPuriKm > 45 && bbsrToPuriKm < 65);

  const candidates = getNativeBackendCandidates();
  assert.ok(candidates.length >= 1);
  assert.ok(candidates.every((u) => u.startsWith('https://')));
});
