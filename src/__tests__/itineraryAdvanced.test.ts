import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  filterDestinations,
  generateItinerary,
  calculatePlansTotalCost,
  SavedItineraryRecord,
  saveItineraryRecord,
  loadSavedItineraries,
  duplicateSavedItineraryRecord,
  deleteSavedItineraryRecord,
} from '../utils/itinerary';
import { QUICK_TRIP_TEMPLATES } from '../data/quickTripTemplates';

describe('Advanced Itinerary Planner Engine & Saved Itineraries Suite', () => {
  it('verifies all 5 Quick Trip Templates are populated with realistic routes and positive costs', () => {
    assert.strictEqual(QUICK_TRIP_TEMPLATES.length, 5);
    QUICK_TRIP_TEMPLATES.forEach((tpl) => {
      assert.ok(tpl.id, 'Template must have unique ID');
      assert.ok(tpl.name, 'Template must have a name');
      assert.ok(tpl.startCity, 'Template must specify startCity');
      assert.ok(tpl.days >= 1 && tpl.days <= 7, 'Days must be between 1 and 7');
      assert.ok(tpl.estCostPerPerson > 0, 'Estimated cost must be positive');
      assert.ok(tpl.interests.length > 0, 'Interests must not be empty');
    });
  });

  it('filters destinations accurately across new specialized interests (waterfalls, cuisine, tribal_culture)', () => {
    const waterfallPlaces = filterDestinations(['waterfalls']);
    assert.ok(waterfallPlaces.length > 0);

    const cuisinePlaces = filterDestinations(['cuisine']);
    assert.ok(cuisinePlaces.length > 0);
    assert.ok(cuisinePlaces.every((p) => Boolean(p.cuisineHighlight)));

    const tribalPlaces = filterDestinations(['tribal_culture']);
    assert.ok(tribalPlaces.length > 0);
  });

  it('handles multi-district circuit up to 7 days without throwing or empty days', () => {
    const plans = generateItinerary({
      startCity: 'Khordha',
      days: 7,
      interests: ['heritage', 'spiritual', 'nature'],
      travelStyle: 'moderate',
      tripScope: 'multi',
      selectedMultiDistrictIds: ['khordha', 'puri', 'cuttack', 'mayurbhanj'],
    });

    assert.strictEqual(plans.length, 7);
    plans.forEach((day, idx) => {
      assert.strictEqual(day.dayNumber, idx + 1);
      assert.ok(day.destinations.length >= 1, `Day ${idx + 1} must have destinations`);
      assert.ok(day.totalDayCost > 0, `Day ${idx + 1} must have positive cost`);
    });
  });

  it('calculates itemized budget and target budget variance accurately', () => {
    const plans = generateItinerary({
      startCity: 'Puri',
      days: 3,
      interests: ['beaches', 'spiritual'],
      travelStyle: 'moderate',
    });

    const budget = calculatePlansTotalCost(plans, 2, 'moderate');
    assert.ok(budget.totalCost > 0);
    assert.ok(budget.accommodation > 0);
    assert.ok(budget.food > 0);
    assert.ok(budget.transport > 0);
    assert.strictEqual(budget.perPersonCost, Math.round(budget.totalCost / 2));
  });

  it('simulates local storage itinerary save, duplicate, and delete operations', () => {
    // Mock local storage in test environment
    const storage: Record<string, string> = {};
    const mockLocalStorage = {
      getItem: (key: string) => storage[key] || null,
      setItem: (key: string, val: string) => { storage[key] = val; },
      removeItem: (key: string) => { delete storage[key]; },
    };
    (globalThis as any).window = { localStorage: mockLocalStorage };
    (globalThis as any).localStorage = mockLocalStorage;

    const sampleTrip: SavedItineraryRecord = {
      id: 'test_trip_1',
      title: '3-Day Golden Triangle Explorer',
      createdAt: Date.now(),
      startCity: 'Khordha',
      days: 3,
      travelers: 2,
      travelStyle: 'moderate',
      tripScope: 'multi',
      selectedInterests: ['heritage', 'spiritual'],
      totalCost: 8500,
      plans: [],
    };

    // 1. Save
    const savedList = saveItineraryRecord(sampleTrip);
    assert.strictEqual(savedList.length, 1);
    assert.strictEqual(savedList[0].id, 'test_trip_1');

    // 2. Load
    const loaded = loadSavedItineraries();
    assert.strictEqual(loaded.length, 1);
    assert.strictEqual(loaded[0].title, '3-Day Golden Triangle Explorer');

    // 3. Duplicate
    const duplicatedList = duplicateSavedItineraryRecord('test_trip_1');
    assert.strictEqual(duplicatedList.length, 2);
    assert.ok(duplicatedList.some((t) => t.title.includes('(Copy)')));

    // 4. Delete
    const afterDelete = deleteSavedItineraryRecord('test_trip_1');
    assert.strictEqual(afterDelete.length, 1);
    assert.ok(!afterDelete.some((t) => t.id === 'test_trip_1'));

    // Cleanup globals
    delete (globalThis as any).window;
    delete (globalThis as any).localStorage;
  });
});
