import React from 'react';
import { Volume2, Play, Pause, Square } from 'lucide-react';
import type { AppLanguage } from '../data/i18n';
import { t } from '../data/i18n';

export interface FloatingAudioBarProps {
  isPlaying: boolean;
  isPaused: boolean;
  title: string;
  destination: string;
  classification?: string;
  speed: number;
  onSpeedChange: (speed: number) => void;
  onTogglePlayPause: () => void;
  onStop: () => void;
  language: AppLanguage;
}

export const FloatingAudioBar: React.FC<FloatingAudioBarProps> = ({
  isPlaying,
  isPaused,
  title,
  destination,
  classification,
  speed,
  onSpeedChange,
  onTogglePlayPause,
  onStop,
  language,
}) => {
  if (!isPlaying && !isPaused) return null;

  return (
    <aside
      className="fixed bottom-0 left-0 right-0 z-50 bg-[#13161c]/95 backdrop-blur-md border-t border-[#e5b85b]/40 shadow-2xl px-4 py-3 sm:py-3.5 transition-all"
      aria-label="Utkal Katha Audio Player"
    >
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Story Info */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="w-9 h-9 rounded-full bg-[#ff7a1a]/20 border border-[#ff7a1a]/40 flex items-center justify-center shrink-0">
            <Volume2 className="w-5 h-5 text-[#e5b85b] animate-pulse" />
          </div>
          <div className="min-w-0">
            <h4 className="text-sm sm:text-base font-bold text-[#e5b85b] truncate">
              {title || 'Utkal Katha Narration'}
            </h4>
            <p className="text-xs text-[#b6b1a6] truncate">
              {destination} {classification ? `• ${classification}` : ''}
            </p>
          </div>
        </div>

        {/* Player Controls */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Speed Selector */}
          <div className="flex items-center gap-1.5">
            <label htmlFor="katha-speed" className="text-xs text-[#b6b1a6] hidden sm:inline">
              Speed:
            </label>
            <select
              id="katha-speed"
              value={speed}
              onChange={(e) => onSpeedChange(Number(e.target.value))}
              className="bg-[#1b2029] border border-[#2a3140] text-[#f7f3e8] text-xs rounded-lg px-2 py-1.5 focus:border-[#e5b85b] outline-none"
            >
              <option value={0.85}>0.85x</option>
              <option value={1}>1.0x</option>
              <option value={1.15}>1.15x</option>
              <option value={1.3}>1.3x</option>
            </select>
          </div>

          {/* Pause / Resume Button */}
          <button
            type="button"
            onClick={onTogglePlayPause}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#e5b85b]/20 hover:bg-[#e5b85b]/30 border border-[#e5b85b]/50 text-[#e5b85b] text-xs font-bold transition-all active:scale-95"
          >
            {isPaused ? (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>{t(language, 'resumeAudio')}</span>
              </>
            ) : (
              <>
                <Pause className="w-3.5 h-3.5 fill-current" />
                <span>{t(language, 'pauseAudio')}</span>
              </>
            )}
          </button>

          {/* Stop Button */}
          <button
            type="button"
            onClick={onStop}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600/20 hover:bg-red-600/30 border border-red-500/50 text-red-400 text-xs font-bold transition-all active:scale-95"
          >
            <Square className="w-3.5 h-3.5 fill-current" />
            <span>{t(language, 'stopAudio')}</span>
          </button>
        </div>
      </div>
    </aside>
  );
};
