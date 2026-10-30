import React, { useState } from 'react';
import { RoadmapPhaseItem } from '../types';
import {
  Compass,
  Milestone,
  CheckCircle2,
  Clock,
  Sparkles,
  TreePine,
  ShieldCheck,
  TrendingUp,
  Award,
  Layers,
  HeartHandshake,
  ExternalLink,
  ChevronRight,
  Eye,
} from 'lucide-react';

const ROADMAP_PHASES: RoadmapPhaseItem[] = [
  {
    phase: 'Phase 0',
    title: 'Define, Prepare & Curate Foundation Data',
    scope: 'Confirm the MVP scope and user journey; identify authentic official data sources; curate initial baseline records for 10–15 destinations across Odisha.',
    deliverables: [
      '12 curated multi-district destination records (Heritage, Nature, Spiritual, Tribal Crafts)',
      'Deterministic itinerary planner with time, budget & party constraints',
      'Historical sources audited against ASI epigraphy and temple chronicles',
      'Initial automated unit tests for budget math, itinerary routing, and offline storage',
    ],
    gateCriteria: 'Data integrity and seed destination scope reviewed before development expands.',
    status: 'Production Live',
  },
  {
    phase: 'Phase 1',
    title: 'Initial Functional MVP',
    scope: 'Connect end-to-end traveller journeys: enter preferences, generate tailored itineraries, review transport options with labeled cost estimates, explore cultural audio stories, and access emergency contacts.',
    deliverables: [
      'Dynamic multi-day itinerary planner with morning/afternoon/evening slots',
      'Regulated fare matrix (CRUT Mo Bus Route 70/71, train tariffs, prepaid taxi booths)',
      'Utkal Mitra multilingual conversational assistant (Odia, Hindi, English) with voice synthesis',
      '4 reviewed cultural audio guide chronicles with documented history vs legend separation',
      'Saved guides plus critical 24x7 emergency SOS hotlines (112, 100, 181, Tourist Police)',
    ],
    gateCriteria: 'One complete traveller journey functions seamlessly with verifiable local data.',
    status: 'Production Live',
  },
  {
    phase: 'Phase 2',
    title: 'Trusted Integrations & Citizen Workflows',
    scope: 'Incorporate official meteorological warnings, citizen hazard reporting, local business listing management, and downloadable offline emergency packs.',
    deliverables: [
      'IMD Bhubaneswar weather bulletin integration (coastal storm & heatwave alerts)',
      'Community-reported travel hazard and disruption workflow with moderation badges',
      'Local artisan, homestay, and tour operator self-registration portal',
      'Zero-connectivity offline pack caching in device storage with printable emergency card',
    ],
    gateCriteria: 'Source freshness, moderation protocols, and permissions verified under simulated network loss.',
    status: 'Ready for Integration',
  },
  {
    phase: 'Phase 3',
    title: 'Statewide Scaling & Ecosystem Partnerships',
    scope: 'Scale coverage across all 30 districts of Odisha with live GPS tracking, booking APIs, community partnerships, and expanded regional dialects.',
    deliverables: [
      'Real-time authorized GPS live bus tracking for CRUT Mo Bus and OSRTC corridors',
      'Direct booking API integration for OTDC Panthanivas and Eco Tour Odisha camps',
      'Expanded dialect support including Sambalpuri/Koshali and tribal language paths',
      'Feasible WhatsApp-based conversational bot interface for low-bandwidth rural travelers',
    ],
    gateCriteria: 'Expansion driven by traveler pilot feedback, validated transport feeds, and partner readiness.',
    status: 'Future Scaling',
  },
];

export const VisionAndRoadmap: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'vision' | 'roadmap' | 'sustainability' | 'business'>('vision');

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-stone-900 via-amber-950/80 to-stone-900 border border-amber-800/40 p-6 sm:p-8 shadow-xl">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/30 text-amber-300 text-xs font-semibold mb-3">
            <Compass className="w-3.5 h-3.5 text-amber-400" />
            OSFIC Tourism & Culture Challenge • Project Blueprint
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            UtkalSarathi: Innovation, Roadmap & Vision
          </h1>
          <p className="mt-2 text-stone-300 text-sm leading-relaxed">
            Our vision is to make Odisha easier to explore through a trusted, intelligent,
            multilingual, and culturally responsible digital travel companion. Discover our phased
            MVP milestones, sustainable tourism principles, and transparent business architecture.
          </p>
        </div>
      </div>

      {/* Navigation Pills */}
      <div className="flex items-center gap-2 border-b border-stone-800 pb-2 overflow-x-auto no-scrollbar">
        {[
          { id: 'vision', label: '1. Vision & Differentiation', icon: Sparkles },
          { id: 'roadmap', label: '2. Phased Implementation Roadmap', icon: Milestone },
          { id: 'sustainability', label: '3. Sustainable & Responsible Tourism', icon: TreePine },
          { id: 'business', label: '4. Business Model & Ethics', icon: HeartHandshake },
        ].map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
                activeTab === t.id
                  ? 'bg-amber-600 text-white shadow-md'
                  : 'bg-stone-900 text-stone-400 hover:text-stone-200 border border-stone-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Vision & Innovation */}
      {activeTab === 'vision' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl bg-stone-900 border border-stone-800 shadow-lg space-y-4">
              <div className="flex items-center gap-2 text-amber-400 font-extrabold text-base">
                <Sparkles className="w-5 h-5" />
                <h2>The UtkalSarathi Innovation</h2>
              </div>
              <p className="text-stone-300 text-xs sm:text-sm leading-relaxed">
                Rather than functioning solely as a static destination directory or generic map navigation tool,
                UtkalSarathi bridges personalized journey planning, transparent local transit costs, source-grounded
                cultural storytelling, offline resilience, and community safety into one connected ecosystem.
              </p>
              <div className="space-y-2 pt-2 text-xs">
                <div className="p-3 rounded-xl bg-stone-850 border border-stone-750 flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-stone-100 block">Connecting Unknown & Offbeat Odisha</span>
                    <span className="text-stone-400">
                      Guides travellers beyond prominent centers like Puri to eco-camps (Satkosia, Daringbadi),
                      tribal heritage (Koraput), and artisan hamlets (Raghurajpur).
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-stone-850 border border-stone-750 flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-stone-100 block">Honest Transparency Over Illusion</span>
                    <span className="text-stone-400">
                      Explicitly labels verified government fares, provider quotes, and market estimates; communicates
                      practical limitations where data or public transport is sparse.
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-stone-850 border border-stone-750 flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-stone-100 block">Epigraphy vs Living Folklore</span>
                    <span className="text-stone-400">
                      Strictly separates peer-reviewed archaeological history (ASI inscriptions, King Narasimhadeva I)
                      from sacred living legends and oral lore (Dharmapada, Daru Brahma).
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-gradient-to-br from-stone-900 to-amber-950/40 border border-stone-800 shadow-lg space-y-4">
              <div className="flex items-center gap-2 text-amber-400 font-extrabold text-base">
                <Eye className="w-5 h-5" />
                <h2>Core Architecture & Pillars</h2>
              </div>
              <p className="text-stone-300 text-xs sm:text-sm leading-relaxed">
                UtkalSarathi harmonizes AI language models with deterministic logic to guarantee arithmetic accuracy,
                rule enforcement, and source reliability.
              </p>

              <div className="grid grid-cols-2 gap-3 text-xs pt-1">
                <div className="p-3 rounded-xl bg-stone-850/80 border border-stone-700/80">
                  <span className="font-bold text-amber-300 block mb-1">🤖 Conversational AI</span>
                  <span className="text-stone-400">
                    Multilingual reasoning in Odia, Hindi, and English using Gemini 3.8 Flash.
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-stone-850/80 border border-stone-700/80">
                  <span className="font-bold text-emerald-300 block mb-1">📐 Deterministic Logic</span>
                  <span className="text-stone-400">
                    Exact budget arithmetic, schedule bounds, and itinerary constraint validation.
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-stone-850/80 border border-stone-700/80">
                  <span className="font-bold text-cyan-300 block mb-1">🛡️ UtkalSuraksha</span>
                  <span className="text-stone-400">
                    24x7 emergency SOS shortcuts, verified trauma hospitals, and IMD advisories.
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-stone-850/80 border border-stone-700/80">
                  <span className="font-bold text-purple-300 block mb-1">📥 Offline Storage</span>
                  <span className="text-stone-400">
                    Local device caching ensuring travelers have emergency cards with zero network.
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Phased Implementation Roadmap */}
      {activeTab === 'roadmap' && (
        <div className="space-y-6">
          <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 sm:p-6 shadow-md space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-stone-800 gap-2">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Milestone className="w-5 h-5 text-amber-400" />
                  Phased Implementation Roadmap & Gates
                </h2>
                <p className="text-xs text-stone-400 mt-0.5">
                  Proposed stages are rigorous deliverables with explicit review gates before scaling.
                </p>
              </div>
              <span className="text-xs text-emerald-400 font-semibold px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30">
                Production V2.4 Deployed
              </span>
            </div>

            <div className="space-y-4 pt-2">
              {ROADMAP_PHASES.map((p, idx) => (
                <div
                  key={idx}
                  className="p-5 rounded-xl bg-stone-850 border border-stone-800 transition-all hover:border-stone-700 space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <span className="px-2.5 py-1 rounded-lg text-xs font-extrabold bg-amber-600 text-white">
                        {p.phase}
                      </span>
                      <h3 className="text-sm sm:text-base font-bold text-white">{p.title}</h3>
                    </div>

                    <span
                      className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${
                        p.status === 'Production Live' || p.status === 'Active Prototype'
                          ? 'bg-emerald-950 text-emerald-300 border-emerald-500/40'
                          : p.status === 'Ready for Integration'
                          ? 'bg-cyan-950 text-cyan-300 border-cyan-500/40'
                          : 'bg-stone-800 text-stone-400 border-stone-700'
                      }`}
                    >
                      {p.status}
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">{p.scope}</p>

                  <div className="pt-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400 block mb-1">
                      Key Deliverables:
                    </span>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-1.5 text-xs text-stone-300">
                      {p.deliverables.map((d, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                          <span>{d}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-2 p-2.5 rounded-lg bg-stone-900 border border-stone-800 text-xs text-stone-400 flex items-center gap-2">
                    <span className="font-bold text-amber-400">Review Gate:</span>
                    <span>{p.gateCriteria}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Sustainable Tourism */}
      {activeTab === 'sustainability' && (
        <div className="space-y-6">
          <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 sm:p-6 shadow-md space-y-4">
            <div className="pb-3 border-b border-stone-800">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <TreePine className="w-5 h-5 text-emerald-400" />
                Social Impact & Sustainable Tourism Charter
              </h2>
              <p className="text-xs text-stone-400 mt-0.5">
                UtkalSarathi promotes culturally respectful and environmentally responsible exploration.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-stone-850 border border-emerald-800/40 text-xs space-y-2">
                <span className="font-bold text-emerald-300 text-sm block">
                  1. Ecologically Fragile Sanctuaries
                </span>
                <p className="text-stone-300 leading-relaxed">
                  Chilika Lake Ramsar wetlands, Gahirmatha turtle sanctuaries, and Similipal core zones require
                  unwavering conservation. UtkalSarathi advises silent wooden country boats over motorized engines
                  in birding zones and highlights strict plastic bans.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-stone-850 border border-amber-800/40 text-xs space-y-2">
                <span className="font-bold text-amber-300 text-sm block">
                  2. Community-Sensitive Tribal Heritage
                </span>
                <p className="text-stone-300 leading-relaxed">
                  In regions like Koraput, Daringbadi, and Kandhamal, indigenous tribes preserve centuries-old agro-heritage.
                  We instruct travelers to request permission before photography in weekly tribal haats and to avoid intrusive
                  commercial tours into sacred groves (Jahera).
                </p>
              </div>

              <div className="p-4 rounded-xl bg-stone-850 border border-orange-800/40 text-xs space-y-2">
                <span className="font-bold text-orange-300 text-sm block">
                  3. Fair Trade Artisan Empowerment
                </span>
                <p className="text-stone-300 leading-relaxed">
                  By directing travelers directly to the master painters of Raghurajpur, appliqué artists of Pipili,
                  and weavers of Sambalpur, we bypass middleman exploitation so revenue directly empowers rural Odia creators.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Business Model & Ethics */}
      {activeTab === 'business' && (
        <div className="space-y-6">
          <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 sm:p-6 shadow-md space-y-4">
            <div className="pb-3 border-b border-stone-800">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <HeartHandshake className="w-5 h-5 text-amber-400" />
                Business Model, Commercial Ethics & Future Scalability
              </h2>
              <p className="text-xs text-stone-400 mt-0.5">
                Transparent revenue architecture built on trust, independence, and safety integrity.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 text-xs">
              <div className="p-4 rounded-xl bg-stone-850 border border-stone-800 space-y-2">
                <span className="font-bold text-amber-400 text-sm block">
                  Transparent Revenue Pillars
                </span>
                <ul className="space-y-2 text-stone-300 leading-relaxed">
                  <li>
                    <strong className="text-stone-100">Booking Commissions:</strong> Modest facilitation fees for participating
                    homestays, eco-camps, and verified local guides through verified tourism platforms.
                  </li>
                  <li>
                    <strong className="text-stone-100">Premium Artisan Showcase:</strong> Verified producer profiles allowing direct
                    inquiries and orders without unfair markups.
                  </li>
                  <li>
                    <strong className="text-stone-100">Institutional Partnerships:</strong> Collaborations with tourism boards (OTDC)
                    and urban transit operators (CRUT) for verified data exchange.
                  </li>
                </ul>
              </div>

              <div className="p-4 rounded-xl bg-stone-850 border border-red-800/40 space-y-2">
                <span className="font-bold text-red-400 text-sm block">
                  Uncompromising Separation of Safety & Promotion
                </span>
                <ul className="space-y-2 text-stone-300 leading-relaxed">
                  <li>
                    <strong className="text-stone-100">Zero Sponsored Safety:</strong> Emergency hotlines (112, 100, 181),
                    trauma centers, and weather warnings are strictly non-commercial and permanently free from advertising.
                  </li>
                  <li>
                    <strong className="text-stone-100">Independent Travel Advice:</strong> Commercial recommendations are always
                    clearly labeled <span className="text-amber-300 font-bold">[Participating Partner]</span> vs independent
                    editorial guidance.
                  </li>
                  <li>
                    <strong className="text-stone-100">Transparent Pricing:</strong> Always shows official benchmarks to prevent
                    unregulated tourist inflation.
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
