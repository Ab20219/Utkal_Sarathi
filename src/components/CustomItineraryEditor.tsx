import React, { useState } from 'react';
import {
  DayPlan,
  Destination,
  ODISHA_DESTINATIONS,
  createDestinationFromDistrict,
} from '../utils/itinerary';
import { ODISHA_30_DISTRICTS, findDistrict, DistrictInfo } from '../data/odishaDistricts';
import { formatINR } from '../utils/budget';
import {
  Plus,
  Trash2,
  MoveUp,
  MoveDown,
  Clock,
  MapPin,
  Bus,
  IndianRupee,
  Save,
  RotateCcw,
  CheckCircle2,
  ChevronDown,
  Sparkles,
  Info,
} from 'lucide-react';

interface CustomItineraryEditorProps {
  plans: DayPlan[];
  onPlansChange: (updated: DayPlan[]) => void;
  travelers: number;
  travelStyle: 'budget' | 'moderate' | 'luxury';
  startDistrict: string;
  onSaveOffline: () => void;
  onResetToRecommended: () => void;
}

export const CustomItineraryEditor: React.FC<CustomItineraryEditorProps> = ({
  plans,
  onPlansChange,
  travelers,
  travelStyle,
  startDistrict,
  onSaveOffline,
  onResetToRecommended,
}) => {
  const [saveBanner, setSaveBanner] = useState<string | null>(null);

  // Update a specific day title or theme
  const handleUpdateDayMeta = (dayIdx: number, field: 'title' | 'theme', value: string) => {
    const updated = [...plans];
    updated[dayIdx] = {
      ...updated[dayIdx],
      [field]: value,
    };
    onPlansChange(updated);
  };

  // Add a new Day (up to 7 days)
  const handleAddDay = () => {
    if (plans.length >= 7) return;
    const nextDayNum = plans.length + 1;
    const sampleDest1 = ODISHA_DESTINATIONS[(nextDayNum * 2) % ODISHA_DESTINATIONS.length];
    const sampleDest2 = ODISHA_DESTINATIONS[(nextDayNum * 2 + 1) % ODISHA_DESTINATIONS.length];

    const isBudget = travelStyle === 'budget';
    const newDay: DayPlan = {
      dayNumber: nextDayNum,
      title: `Day ${nextDayNum}: Custom Exploration`,
      theme: 'CUSTOM EXPERIENCES',
      totalDayCost: isBudget ? 850 : travelStyle === 'luxury' ? 3800 : 1800,
      destinations: [
        {
          timeSlot: 'Morning (08:00 - 12:00)',
          destination: sampleDest1,
          activity: `Explore ${sampleDest1.name} and surrounding landmarks.`,
          transportFromPrevious: 'Mo Bus (₹25)',
          estimatedCost: 150,
        },
        {
          timeSlot: 'Afternoon (13:00 - 16:30)',
          destination: sampleDest2,
          activity: `Visit ${sampleDest2.name}. Savor regional delicacies.`,
          transportFromPrevious: 'Auto-Rickshaw (₹120)',
          estimatedCost: 200,
        },
      ],
    };

    onPlansChange([...plans, newDay]);
    setSaveBanner(`Added Day ${nextDayNum} to your itinerary!`);
    setTimeout(() => setSaveBanner(null), 3000);
  };

  // Delete a Day
  const handleDeleteDay = (dayIdx: number) => {
    if (plans.length <= 1) return;
    const updated = plans
      .filter((_, idx) => idx !== dayIdx)
      .map((day, idx) => ({
        ...day,
        dayNumber: idx + 1,
        title: day.title.replace(/Day \d+/, `Day ${idx + 1}`),
      }));
    onPlansChange(updated);
    setSaveBanner('Removed day and re-sequenced itinerary.');
    setTimeout(() => setSaveBanner(null), 3000);
  };

  // Add a visit slot to a day
  const handleAddSlot = (dayIdx: number) => {
    const updated = [...plans];
    const currentSlots = updated[dayIdx].destinations;
    const fallbackDest = ODISHA_DESTINATIONS[currentSlots.length % ODISHA_DESTINATIONS.length];

    const newSlot = {
      timeSlot: (currentSlots.length === 0
        ? 'Morning (08:00 - 12:00)'
        : currentSlots.length === 1
        ? 'Afternoon (13:00 - 16:30)'
        : 'Evening (17:00 - 20:30)') as any,
      destination: fallbackDest,
      activity: `Visit ${fallbackDest.name} and local craft market.`,
      transportFromPrevious: 'Mo Bus / Auto (₹30)',
      estimatedCost: 150,
    };

    updated[dayIdx] = {
      ...updated[dayIdx],
      destinations: [...currentSlots, newSlot],
    };

    // Recalculate day cost
    updated[dayIdx].totalDayCost = recalculateDayCost(updated[dayIdx]);
    onPlansChange(updated);
  };

  // Delete a visit slot
  const handleDeleteSlot = (dayIdx: number, slotIdx: number) => {
    const updated = [...plans];
    if (updated[dayIdx].destinations.length <= 1) return;

    updated[dayIdx].destinations = updated[dayIdx].destinations.filter((_, idx) => idx !== slotIdx);
    updated[dayIdx].totalDayCost = recalculateDayCost(updated[dayIdx]);
    onPlansChange(updated);
  };

  // Move slot up or down
  const handleMoveSlot = (dayIdx: number, slotIdx: number, direction: 'up' | 'down') => {
    const updated = [...plans];
    const slots = [...updated[dayIdx].destinations];
    const targetIdx = direction === 'up' ? slotIdx - 1 : slotIdx + 1;
    if (targetIdx < 0 || targetIdx >= slots.length) return;

    const temp = slots[slotIdx];
    slots[slotIdx] = slots[targetIdx];
    slots[targetIdx] = temp;

    updated[dayIdx].destinations = slots;
    onPlansChange(updated);
  };

  // Update specific slot field
  const handleUpdateSlotField = (
    dayIdx: number,
    slotIdx: number,
    field: string,
    value: any
  ) => {
    const updated = [...plans];
    const slot = { ...updated[dayIdx].destinations[slotIdx] };

    if (field === 'destinationSelection') {
      // Find destination or district
      const foundCurated = ODISHA_DESTINATIONS.find((d) => d.id === value);
      if (foundCurated) {
        slot.destination = foundCurated;
      } else {
        const foundDistrict = findDistrict(value);
        if (foundDistrict) {
          slot.destination = createDestinationFromDistrict(foundDistrict);
        }
      }
    } else {
      (slot as any)[field] = value;
    }

    updated[dayIdx].destinations[slotIdx] = slot;
    updated[dayIdx].totalDayCost = recalculateDayCost(updated[dayIdx]);
    onPlansChange(updated);
  };

  // Recalculate a single day cost
  const recalculateDayCost = (day: DayPlan): number => {
    const baseDayCost = travelStyle === 'budget' ? 500 : travelStyle === 'luxury' ? 2200 : 1100;
    const slotsCost = day.destinations.reduce((acc, slot) => {
      const fareMatch = slot.transportFromPrevious.match(/₹\s*(\d+)/);
      const fare = fareMatch ? parseInt(fareMatch[1], 10) : 50;
      return acc + fare + (slot.estimatedCost || 100);
    }, 0);
    return baseDayCost + slotsCost;
  };

  // Save custom plan to localStorage
  const handleSaveToLocalStorage = () => {
    try {
      localStorage.setItem('utkalsarathi_custom_plan', JSON.stringify(plans));
      setSaveBanner('Custom plan saved to your browser! It will be remembered on reload.');
      setTimeout(() => setSaveBanner(null), 3500);
    } catch {
      setSaveBanner('Saved custom plan to active session.');
      setTimeout(() => setSaveBanner(null), 3500);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Editor Control Header */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-950/60 via-stone-900 to-stone-900 border border-amber-500/40 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30">
              ✏️
            </span>
            <h3 className="text-base sm:text-lg font-bold text-white">
              Custom Itinerary Builder & Visit Editor
            </h3>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800/40 font-mono font-bold">
              Live Accurate Math
            </span>
          </div>
          <p className="text-xs text-stone-300 mt-1">
            Build your itinerary from scratch or customize every stop. Add days, edit visits from any of Odisha's 30 districts, change transport, and fine-tune costs.
          </p>
        </div>

        {/* Global Editor Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleAddDay}
            disabled={plans.length >= 7}
            className="px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow transition-all flex items-center gap-1.5 disabled:opacity-50"
            title="Add a new day up to 7 days"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Day ({plans.length}/7)</span>
          </button>

          <button
            onClick={handleSaveToLocalStorage}
            className="px-3.5 py-2 rounded-xl bg-stone-800 hover:bg-stone-750 text-stone-200 border border-stone-700 text-xs font-semibold transition-all flex items-center gap-1.5"
          >
            <Save className="w-3.5 h-3.5 text-amber-400" />
            <span>Save Plan</span>
          </button>

          <button
            onClick={onResetToRecommended}
            className="px-3 py-2 rounded-xl bg-stone-850 hover:bg-stone-800 text-stone-400 hover:text-stone-200 border border-stone-750 text-xs font-medium transition-all flex items-center gap-1"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Save Notification Banner */}
      {saveBanner && (
        <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>{saveBanner}</span>
        </div>
      )}

      {/* Editable Day Cards */}
      <div className="space-y-5">
        {plans.map((day, dayIdx) => (
          <div
            key={day.dayNumber}
            className="rounded-2xl bg-stone-900 border border-stone-800 overflow-hidden shadow-md"
          >
            {/* Day Header with Editable Title & Theme */}
            <div className="bg-gradient-to-r from-stone-850 to-stone-900 px-4 sm:px-5 py-3.5 border-b border-stone-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3 flex-1">
                <span className="w-8 h-8 rounded-lg bg-amber-600 text-white font-extrabold flex items-center justify-center text-sm shadow-sm flex-shrink-0">
                  {day.dayNumber}
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 flex-1">
                  <input
                    type="text"
                    value={day.title}
                    onChange={(e) => handleUpdateDayMeta(dayIdx, 'title', e.target.value)}
                    placeholder="Day Title (e.g. Day 1: Jagannath Dham & Coastal Drive)"
                    className="bg-stone-800 border border-stone-700 rounded-lg px-2.5 py-1 text-xs sm:text-sm text-stone-100 font-bold focus:outline-none focus:border-amber-500"
                  />
                  <input
                    type="text"
                    value={day.theme}
                    onChange={(e) => handleUpdateDayMeta(dayIdx, 'theme', e.target.value)}
                    placeholder="Theme (e.g. SACRED HERITAGE & FOOD)"
                    className="bg-stone-800 border border-stone-700 rounded-lg px-2.5 py-1 text-xs text-amber-300 font-semibold focus:outline-none focus:border-amber-500 uppercase"
                  />
                </div>
              </div>

              {/* Day Cost & Delete Button */}
              <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-stone-850">
                <div className="text-right">
                  <span className="text-[10px] text-stone-400 block font-medium">Estimated Day Cost</span>
                  <strong className="text-xs sm:text-sm text-amber-400 font-mono">
                    {formatINR(day.totalDayCost)}
                  </strong>
                </div>

                {plans.length > 1 && (
                  <button
                    onClick={() => handleDeleteDay(dayIdx)}
                    className="p-1.5 rounded-lg bg-stone-800 hover:bg-red-950 text-stone-400 hover:text-red-300 border border-stone-700 hover:border-red-800/50 transition-colors"
                    title={`Delete Day ${day.dayNumber}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Visit Slots Editor List */}
            <div className="p-4 sm:p-5 space-y-4 divide-y divide-stone-800/60">
              {day.destinations.map((slot, slotIdx) => (
                <div
                  key={slotIdx}
                  className="pt-4 first:pt-0 grid grid-cols-1 lg:grid-cols-12 gap-3.5 items-start"
                >
                  {/* Time Slot & Move Controls */}
                  <div className="lg:col-span-3 space-y-2">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-400">
                      Time Slot
                    </label>
                    <select
                      value={slot.timeSlot}
                      onChange={(e) =>
                        handleUpdateSlotField(dayIdx, slotIdx, 'timeSlot', e.target.value)
                      }
                      className="w-full bg-stone-800 border border-stone-700 rounded-xl px-2.5 py-1.5 text-xs text-stone-200 focus:outline-none focus:border-amber-500 font-medium"
                    >
                      <option value="Morning (08:00 - 12:00)">Morning (08:00 - 12:00)</option>
                      <option value="Afternoon (13:00 - 16:30)">Afternoon (13:00 - 16:30)</option>
                      <option value="Evening (17:00 - 20:30)">Evening (17:00 - 20:30)</option>
                      <option value="Full Day (09:00 - 18:00)">Full Day (09:00 - 18:00)</option>
                    </select>

                    {/* Move Up/Down & Delete Slot */}
                    <div className="flex items-center gap-1.5 pt-1">
                      <button
                        onClick={() => handleMoveSlot(dayIdx, slotIdx, 'up')}
                        disabled={slotIdx === 0}
                        className="p-1 rounded bg-stone-800 hover:bg-stone-700 text-stone-300 disabled:opacity-30 transition-colors"
                        title="Move Visit Earlier"
                      >
                        <MoveUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleMoveSlot(dayIdx, slotIdx, 'down')}
                        disabled={slotIdx === day.destinations.length - 1}
                        className="p-1 rounded bg-stone-800 hover:bg-stone-700 text-stone-300 disabled:opacity-30 transition-colors"
                        title="Move Visit Later"
                      >
                        <MoveDown className="w-3.5 h-3.5" />
                      </button>
                      {day.destinations.length > 1 && (
                        <button
                          onClick={() => handleDeleteSlot(dayIdx, slotIdx)}
                          className="p-1 rounded bg-stone-800 hover:bg-red-950 text-stone-400 hover:text-red-300 transition-colors ml-auto"
                          title="Delete this visit"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Destination & Activity Details */}
                  <div className="lg:col-span-6 space-y-2">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-400">
                      Destination / Place
                    </label>

                    {/* Destination dropdown */}
                    <select
                      value={slot.destination.id}
                      onChange={(e) =>
                        handleUpdateSlotField(dayIdx, slotIdx, 'destinationSelection', e.target.value)
                      }
                      className="w-full bg-stone-800 border border-stone-700 rounded-xl px-2.5 py-1.5 text-xs text-amber-300 font-bold focus:outline-none focus:border-amber-500"
                    >
                      <optgroup label="🌟 Curated Famous Destinations">
                        {ODISHA_DESTINATIONS.map((d) => (
                          <option key={d.id} value={d.id}>
                            📍 {d.name} ({d.district})
                          </option>
                        ))}
                      </optgroup>
                      <optgroup label="🏛️ All 30 Districts of Odisha">
                        {ODISHA_30_DISTRICTS.map((dist) => (
                          <option key={dist.id} value={dist.id}>
                            🏛️ {dist.name} ({dist.headquarters}) — {dist.tagline}
                          </option>
                        ))}
                      </optgroup>
                    </select>

                    <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-400 pt-1">
                      Custom Activity & Visit Details:
                    </label>
                    <textarea
                      rows={2}
                      value={slot.activity}
                      onChange={(e) =>
                        handleUpdateSlotField(dayIdx, slotIdx, 'activity', e.target.value)
                      }
                      placeholder="Describe what to do, see, or eat at this stop..."
                      className="w-full bg-stone-800 border border-stone-700 rounded-xl p-2.5 text-xs text-stone-200 leading-relaxed focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  {/* Transport & Cost */}
                  <div className="lg:col-span-3 space-y-2">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-400">
                      Transport Mode & Fare
                    </label>
                    <select
                      value={slot.transportFromPrevious}
                      onChange={(e) =>
                        handleUpdateSlotField(dayIdx, slotIdx, 'transportFromPrevious', e.target.value)
                      }
                      className="w-full bg-stone-800 border border-stone-700 rounded-xl px-2.5 py-1.5 text-xs text-stone-200 focus:outline-none focus:border-amber-500"
                    >
                      <option value="Mo Bus (₹20)">Mo Bus (₹20)</option>
                      <option value="Mo Bus Route 70/71 (₹50)">Mo Bus Route 70/71 (₹50)</option>
                      <option value="Auto-Rickshaw (₹120)">Auto-Rickshaw (₹120)</option>
                      <option value="Prepaid Cab / Taxi (₹600)">Prepaid Cab / Taxi (₹600)</option>
                      <option value="OSRTC AC Bus (₹180)">OSRTC AC Bus (₹180)</option>
                      <option value="Indian Railways Train (₹50)">Indian Railways Train (₹50)</option>
                      <option value="Walking / Local Ferry (₹10)">Walking / Local Ferry (₹10)</option>
                    </select>

                    <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-400 pt-1">
                      Estimated Cost (₹ per person)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-stone-400 text-xs">₹</span>
                      <input
                        type="number"
                        min="0"
                        step="50"
                        value={slot.estimatedCost}
                        onChange={(e) =>
                          handleUpdateSlotField(
                            dayIdx,
                            slotIdx,
                            'estimatedCost',
                            Math.max(0, parseInt(e.target.value, 10) || 0)
                          )
                        }
                        className="w-full bg-stone-800 border border-stone-700 rounded-xl pl-6 pr-3 py-1.5 text-xs text-amber-300 font-mono font-bold focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>
                </div>
              ))}

              {/* Add Activity Button inside Day */}
              <div className="pt-3">
                <button
                  onClick={() => handleAddSlot(dayIdx)}
                  className="px-3.5 py-2 rounded-xl bg-stone-800 hover:bg-stone-750 text-amber-400 border border-dashed border-stone-700 hover:border-amber-500/50 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Another Visit / Activity to Day {day.dayNumber}</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
