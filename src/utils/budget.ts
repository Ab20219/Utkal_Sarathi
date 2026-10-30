/**
 * UtkalSarathi Travel Budget Calculation Engine
 * Pure logic for estimating travel costs across accommodation, transport, food, and entry fees in Odisha.
 */

export type TravelStyle = 'budget' | 'moderate' | 'luxury';

export interface BudgetInput {
  days: number;
  travelers: number;
  style: TravelStyle;
  includeEntryTickets?: boolean;
  includeLocalShopping?: boolean;
}

export interface BudgetBreakdown {
  accommodation: number;
  transport: number;
  food: number;
  entryFees: number;
  shoppingAndBuffer: number;
  totalCost: number;
  perPersonCost: number;
  perDayCost: number;
  dailyRateByItem: {
    stayPerNight: number;
    transportPerDay: number;
    foodPerPersonDay: number;
  };
}

// Baseline rates for Odisha travel (in INR)
const RATES = {
  budget: {
    stayPerNight: 800, // Budget dharamsala / OTDC dorm / budget guest house
    transportPerDay: 400, // Mo Bus / shared autos / public buses
    foodPerPersonDay: 450, // Pakhala, Dalma thali, street snacks, tea
    entryFeesBase: 120, // Konark, Dhauli, Khandagiri ASI fees
    bufferPerDay: 200,
  },
  moderate: {
    stayPerNight: 2400, // OTDC Panthanivas / 3-star standard hotel / eco-cottage
    transportPerDay: 1200, // Dedicated auto-rickshaws, occasional AC Mo Bus / shared cab
    foodPerPersonDay: 950, // Authentic Odia restaurants, fresh seafood, Chhena Poda
    entryFeesBase: 250, // ASI monuments, boat safari at Chilika
    bufferPerDay: 600,
  },
  luxury: {
    stayPerNight: 6500, // Eco-Retreat luxury glamping, 4/5-star resorts in Puri/BBI
    transportPerDay: 3200, // Private AC sedan cab with chauffeur
    foodPerPersonDay: 2200, // Fine dining Odia heritage meals, Ananda Bazaar temple feast
    entryFeesBase: 600, // Guided tours, VIP fast darshan, private boat hire
    bufferPerDay: 1500,
  },
};

/**
 * Calculates itemized budget estimate
 */
export function calculateOdishaBudget(input: BudgetInput): BudgetBreakdown {
  const days = Math.max(1, Math.floor(input.days));
  const travelers = Math.max(1, Math.floor(input.travelers));
  const style = input.style || 'moderate';
  const rates = RATES[style] || RATES.moderate;

  // Stays are per room (assuming 2 persons per room)
  const roomsNeeded = Math.ceil(travelers / 2);
  const nights = Math.max(1, days - 1);
  const accommodation = roomsNeeded * rates.stayPerNight * nights;

  // Local transport covers the party
  const transport = rates.transportPerDay * days * (travelers > 3 ? 1.5 : 1);

  // Food is per person per day
  const food = rates.foodPerPersonDay * travelers * days;

  // Entry fees (ASI monuments & boat permits)
  const entryFees = (input.includeEntryTickets ?? true)
    ? rates.entryFeesBase * travelers * Math.min(days, 3)
    : 0;

  // Shopping / buffer for Sambalpuri handloom, Pipili craft, Rasagola
  const shoppingAndBuffer = (input.includeLocalShopping ?? true)
    ? rates.bufferPerDay * days
    : 0;

  const totalCost = Math.round(accommodation + transport + food + entryFees + shoppingAndBuffer);
  const perPersonCost = Math.round(totalCost / travelers);
  const perDayCost = Math.round(totalCost / days);

  return {
    accommodation,
    transport: Math.round(transport),
    food,
    entryFees,
    shoppingAndBuffer,
    totalCost,
    perPersonCost,
    perDayCost,
    dailyRateByItem: {
      stayPerNight: rates.stayPerNight,
      transportPerDay: rates.transportPerDay,
      foodPerPersonDay: rates.foodPerPersonDay,
    },
  };
}

/**
 * Format currency in Indian Rupee standard (₹ XX,XXX)
 */
export function formatINR(amount: number): string {
  if (isNaN(amount) || amount === null || amount === undefined) return '₹0';
  return '₹' + Math.round(amount).toLocaleString('en-IN');
}
