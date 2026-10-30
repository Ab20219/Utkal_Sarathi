import React from 'react';
import {
  Compass,
  MapPin,
  Train,
  Headphones,
  UtensilsCrossed,
  ShieldAlert,
  Sparkles,
  Calendar,
  Bot,
} from 'lucide-react';

interface MobileBottomNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenAssistant: () => void;
  isAudioPlaying?: boolean;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  setActiveTab,
  onOpenAssistant,
  isAudioPlaying,
}) => {
  const navItems = [
    { id: 'districts', label: '30 Districts', icon: '🏛️' },
    { id: 'katha', label: 'Utkal Katha', icon: '🎙️' },
    { id: 'planner', label: 'Planner', icon: '🎒' },
    { id: 'geomap', label: 'Geo & Fares', icon: '🧭' },
    { id: 'mitra', label: 'Mitra AI', icon: '🤖' },
    { id: 'safety', label: 'SOS 112', icon: '🛡️', badge: 'SOS' },
  ];

  return (
    <nav
      aria-label="Mobile Navigation Bar"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0b0d10]/95 border-t border-[#2a3140] backdrop-blur-xl px-2 py-1.5 pb-[max(0.375rem,env(safe-area-inset-bottom))] shadow-2xl"
    >
      <div className="grid grid-cols-6 gap-1 max-w-lg mx-auto items-center">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          const isSafety = item.id === 'safety';

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center py-1.5 px-0.5 rounded-xl transition-all relative ${
                isActive
                  ? isSafety
                    ? 'text-red-400 bg-red-950/60 font-black'
                    : 'text-[#e5b85b] bg-[#e5b85b]/15 font-black scale-[1.03]'
                  : isSafety
                  ? 'text-red-400/80 hover:text-red-300'
                  : 'text-[#b6b1a6] hover:text-[#f7f3e8]'
              }`}
              aria-label={item.label}
              aria-current={isActive ? 'page' : undefined}
            >
              <span className="text-base leading-none mb-0.5">{item.icon}</span>
              <span className="text-[10px] truncate max-w-full font-semibold">{item.label}</span>
              {item.badge && (
                <span className="absolute -top-1 right-1 px-1 py-0.2 rounded-full bg-red-600 text-white font-black text-[8px] animate-pulse">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
