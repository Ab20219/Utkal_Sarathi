import React from 'react';
import {
  Compass,
  MapPin,
  Train,
  Headphones,
  UtensilsCrossed,
  ShieldAlert,
  Sparkles,
} from 'lucide-react';
import { TabType } from '../types';

interface MobileBottomNavProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  onOpenAssistant: () => void;
  isAudioPlaying?: boolean;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  setActiveTab,
  onOpenAssistant,
  isAudioPlaying,
}) => {
  const navItems: Array<{
    id: TabType;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string;
  }> = [
    { id: 'discover', label: 'Explore', icon: Compass },
    { id: 'map', label: 'Map', icon: MapPin },
    { id: 'transit', label: 'Transit', icon: Train },
    { id: 'stories', label: 'Utkal Katha', icon: Headphones },
    { id: 'culture', label: 'Cuisine', icon: UtensilsCrossed },
    { id: 'safety', label: 'SOS 112', icon: ShieldAlert, badge: 'SOS' },
  ];

  return (
    <nav
      aria-label="Mobile Navigation Bar"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-stone-950/95 border-t border-stone-850 backdrop-blur-xl px-2 py-1.5 pb-[max(0.375rem,env(safe-area-inset-bottom))] shadow-[0_-8px_20px_rgba(0,0,0,0.5)]"
    >
      <div className="grid grid-cols-6 gap-1 max-w-lg mx-auto items-center">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          const isStoriesTab = item.id === 'stories';
          const isSafety = item.id === 'safety';

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all relative ${
                isActive
                  ? isSafety
                    ? 'text-red-400 bg-red-950/50'
                    : 'text-amber-400 bg-amber-950/40 font-bold'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              <div className="relative">
                <Icon
                  className={`w-5 h-5 transition-transform ${
                    isActive ? 'scale-110' : 'scale-100'
                  }`}
                />
                {/* Playing audio animated sound waves on Utkal Katha */}
                {isStoriesTab && isAudioPlaying && (
                  <span className="absolute -top-1 -right-1 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
                  </span>
                )}
                {/* SOS Badge */}
                {isSafety && (
                  <span className="absolute -top-1 -right-2 px-1 py-0.2 rounded-full bg-red-600 text-white text-[8px] font-black uppercase">
                    SOS
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight truncate max-w-full">
                {item.label}
              </span>
              {isActive && (
                <span
                  className={`w-1 h-1 rounded-full mt-0.5 ${
                    isSafety ? 'bg-red-400' : 'bg-amber-400'
                  }`}
                />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
