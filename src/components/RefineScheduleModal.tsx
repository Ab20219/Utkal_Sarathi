import React, { useState } from 'react';
import { DayPlan } from '../utils/itinerary';
import { formatINR } from '../utils/budget';
import {
  Sparkles,
  X,
  Check,
  RotateCcw,
  Clock,
  Compass,
  Bus,
  MapPin,
  ChevronRight,
  Loader2,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { refineItineraryLocally } from '../utils/itinerary';
import { fetchApi } from '../utils/apiConfig';

interface RefineScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPlans: DayPlan[];
  startDistrict: string;
  budgetStyle: 'budget' | 'moderate' | 'luxury';
  travelers: number;
  onApplyRefinedPlans: (newPlans: DayPlan[], summary: string) => void;
}

const QUICK_PROMPTS = [
  {
    icon: '🧘',
    label: 'Relaxed & Leisure Pace',
    prompt: 'Make the schedule relaxed and leisure-paced with fewer walking hours, later mornings, and shaded afternoon tea breaks.',
  },
  {
    icon: '🏛️',
    label: 'Deep Heritage & Temples',
    prompt: 'Focus heavily on ancient temples, ASI monument architecture, Mukhasala sculptures, and historic rock edicts.',
  },
  {
    icon: '🌿',
    label: 'Eco-Tourism & Nature Treks',
    prompt: 'Prioritize eco-tourism camps, mangrove cruises, waterfall trails, and peaceful nature reserves.',
  },
  {
    icon: '🍲',
    label: 'Foodie & GI Sweets Circuit',
    prompt: 'Integrate authentic Odia food stops, holy Mahaprasad at Ananda Bazaar, and famous GI-tagged sweets like Chhena Poda and Rasabali.',
  },
  {
    icon: '👨‍👩‍👧',
    label: 'Family & Senior Friendly',
    prompt: 'Make the plan family and senior friendly with comfortable transit, minimal steep stairs, and accessible rest stops.',
  },
  {
    icon: '💰',
    label: 'Budget & Public Transit',
    prompt: 'Optimize for maximum budget savings using Mo Bus and local train shuttles, and economical authentic dining.',
  },
];

export const RefineScheduleModal: React.FC<RefineScheduleModalProps> = ({
  isOpen,
  onClose,
  currentPlans,
  startDistrict,
  budgetStyle,
  travelers,
  onApplyRefinedPlans,
}) => {
  const [instruction, setInstruction] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [refinedResult, setRefinedResult] = useState<{
    summary: string;
    refinedPlans: DayPlan[];
    source?: string;
  } | null>(null);

  if (!isOpen) return null;

  const handleRefine = async (customText?: string) => {
    const textToUse = customText || instruction;
    if (!textToUse.trim()) return;

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetchApi('/api/refine-itinerary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPlans,
          instruction: textToUse,
          startDistrict,
          budget: budgetStyle,
          travelers,
        }),
      });

      if (!res.ok) {
        throw new Error(`Server returned ${res.status}`);
      }

      const data = await res.json();
      if (data.refinedPlans && Array.isArray(data.refinedPlans)) {
        setRefinedResult({
          summary: data.summary,
          refinedPlans: data.refinedPlans,
          source: data.source,
        });
      } else {
        throw new Error('Invalid refined plans response');
      }
    } catch (err: any) {
      console.warn('Backend refine endpoint failed, using local fallback:', err?.message);
      // Seamless local optimizer fallback
      const local = refineItineraryLocally(currentPlans, textToUse, startDistrict, budgetStyle);
      setRefinedResult({
        summary: local.summary,
        refinedPlans: local.refinedPlans,
        source: 'UtkalSarathi Local Deterministic Optimizer',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleApply = () => {
    if (refinedResult) {
      onApplyRefinedPlans(refinedResult.refinedPlans, refinedResult.summary);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-stone-900 border border-stone-750 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-purple-950 via-stone-900 to-stone-900 border-b border-purple-800/40 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-600/30 text-purple-300 border border-purple-500/40">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-white flex items-center gap-2">
                <span>Ask AI to Refine Schedule</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-900/60 text-purple-300 border border-purple-500/30 font-mono">
                  Working AI Optimizer
                </span>
              </h3>
              <p className="text-xs text-stone-300">
                Starting from <strong className="text-amber-400">{startDistrict}</strong> • {currentPlans.length} Days • {travelers} Travelers
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-stone-800 text-stone-400 hover:text-white hover:bg-stone-700 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1">
          {/* Quick Refinement Prompt Chips */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-purple-300 mb-2">
              Select a Quick Refinement Goal
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {QUICK_PROMPTS.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setInstruction(item.prompt);
                    handleRefine(item.prompt);
                  }}
                  disabled={isLoading}
                  className="p-2.5 rounded-xl bg-stone-850 hover:bg-purple-950/60 border border-stone-750 hover:border-purple-500/50 text-left transition-all group disabled:opacity-50"
                >
                  <span className="text-base block mb-0.5">{item.icon}</span>
                  <strong className="text-xs text-stone-200 group-hover:text-purple-300 block line-clamp-1">
                    {item.label}
                  </strong>
                  <span className="text-[10px] text-stone-400 line-clamp-2 mt-0.5 leading-snug">
                    {item.prompt}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Custom Instruction Input */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-300">
              Or Describe Specific Adjustments You Want:
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={instruction}
                onChange={(e) => setInstruction(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !isLoading) handleRefine();
                }}
                placeholder="e.g. Add an evening Chilika boat ride on Day 2, and more handloom shopping..."
                className="flex-1 bg-stone-800 border border-stone-700 rounded-xl px-4 py-2.5 text-sm text-stone-100 placeholder-stone-400 focus:outline-none focus:border-purple-500 transition-colors"
              />
              <button
                onClick={() => handleRefine()}
                disabled={isLoading || !instruction.trim()}
                className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm shadow-md transition-all flex items-center gap-1.5 disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Optimizing...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Refine</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Loading state indicator */}
          {isLoading && (
            <div className="p-6 rounded-2xl bg-purple-950/30 border border-purple-500/20 text-center space-y-3">
              <Loader2 className="w-8 h-8 text-purple-400 animate-spin mx-auto" />
              <p className="text-sm font-semibold text-purple-200">
                UtkalSarathi AI is recalculating optimal routes, timings, and regional experiences...
              </p>
              <p className="text-xs text-stone-400">
                Grounding with 30-district connectivity, opening hours, and authentic Odia stops.
              </p>
            </div>
          )}

          {/* Error notice */}
          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-950/60 border border-red-500/40 text-red-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Refined Results Preview */}
          {refinedResult && !isLoading && (
            <div className="space-y-4 pt-2 border-t border-stone-800 animate-fade-in">
              {/* AI Summary Banner */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-purple-950/70 to-stone-850 border border-purple-500/30">
                <div className="flex items-center gap-2 text-xs font-bold text-purple-300 mb-1">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  <span>AI Refinement Summary:</span>
                  {refinedResult.source && (
                    <span className="text-[10px] text-stone-400 font-normal">
                      ({refinedResult.source})
                    </span>
                  )}
                </div>
                <p className="text-xs sm:text-sm text-stone-200 leading-relaxed font-medium">
                  {refinedResult.summary}
                </p>
              </div>

              {/* Day-by-Day Preview Cards */}
              <div className="space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-stone-400 block">
                  Refined Day-by-Day Schedule Preview:
                </span>
                {refinedResult.refinedPlans.map((day) => (
                  <div
                    key={day.dayNumber}
                    className="p-3.5 rounded-xl bg-stone-850 border border-stone-750 space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-md bg-purple-600 text-white font-bold text-xs flex items-center justify-center">
                          {day.dayNumber}
                        </span>
                        <strong className="text-sm text-white">{day.title}</strong>
                      </div>
                      <span className="text-xs text-amber-400 font-mono font-semibold">
                        Day Cost: {formatINR(day.totalDayCost)}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      {day.destinations.map((slot, sIdx) => (
                        <div
                          key={sIdx}
                          className="p-2.5 rounded-lg bg-stone-900 border border-stone-800 space-y-1"
                        >
                          <div className="flex items-center justify-between text-[11px] text-amber-300">
                            <span className="font-semibold">{slot.timeSlot.split(' ')[0]}</span>
                            <span className="text-stone-400">{slot.transportFromPrevious}</span>
                          </div>
                          <strong className="text-stone-200 block line-clamp-1">
                            {slot.destination.name}
                          </strong>
                          <p className="text-[11px] text-stone-400 line-clamp-2 leading-relaxed">
                            {slot.activity}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3.5 bg-stone-950 border-t border-stone-800 flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-semibold transition-colors"
          >
            Cancel / Keep Current
          </button>

          {refinedResult ? (
            <button
              onClick={handleApply}
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg transition-all flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              <span>Apply Refined Schedule to My Plan</span>
            </button>
          ) : (
            <span className="text-[11px] text-stone-400 flex items-center gap-1">
              <HelpCircle className="w-3.5 h-3.5 text-purple-400" />
              <span>Select an AI preset or type instructions above to preview</span>
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
