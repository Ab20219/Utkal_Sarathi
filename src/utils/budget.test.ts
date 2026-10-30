import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateOdishaBudget, formatINR } from './budget.ts';

test('calculates budget trip for 1 traveler for 3 days', () => {
  const result = calculateOdishaBudget({
    days: 3,
    travelers: 1,
    style: 'budget',
    includeEntryTickets: true,
    includeLocalShopping: true,
  });

  assert.ok(result.totalCost > 0);
  assert.equal(result.totalCost, result.perPersonCost);
  // 1 room * 800 * 2 nights = 1600
  assert.equal(result.accommodation, 1600);
  // Transport = 400 * 3 = 1200
  assert.equal(result.transport, 1200);
  // Food = 450 * 1 * 3 = 1350
  assert.equal(result.food, 1350);
  // Entry fees = 120 * 1 * 3 = 360
  assert.equal(result.entryFees, 360);
  // Buffer = 200 * 3 = 600
  assert.equal(result.shoppingAndBuffer, 600);
  assert.equal(result.totalCost, 1600 + 1200 + 1350 + 360 + 600);
});

test('handles larger groups and room scaling', () => {
  const result = calculateOdishaBudget({
    days: 2,
    travelers: 4,
    style: 'moderate',
  });

  // 4 travelers = 2 rooms; 1 night = 2 * 2400 = 4800
  assert.equal(result.accommodation, 4800);
  // Per person cost should be roughly 1/4th of total
  assert.equal(result.perPersonCost, Math.round(result.totalCost / 4));
});

test('formats INR currency properly', () => {
  assert.equal(formatINR(0), '₹0');
  assert.equal(formatINR(1250), '₹1,250');
  assert.equal(formatINR(50000), '₹50,000');
});
