import React from 'react';
import { Sun, Moon, Smartphone } from 'lucide-react';
import { useTheme, type ThemeMode } from '../context/ThemeContext';

interface ThemeToggleProps {
  compact?: boolean;
  showLabels?: boolean;
  className?: string;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  compact = false,
  showLabels = false,
  className = '',
}) => {
  const { themeMode, setThemeMode, resolvedTheme } = useTheme();

  const options: { mode: ThemeMode; label: string; icon: React.ReactNode }[] = [
    { mode: 'light', label: 'Light', icon: <Sun className="w-4 h-4" /> },
    { mode: 'dark', label: 'Dark', icon: <Moon className="w-4 h-4" /> },
    { mode: 'system', label: 'System', icon: <Smartphone className="w-4 h-4" /> },
  ];

  if (compact) {
    return (
      <div
        className={`inline-flex items-center bg-stone-100 dark:bg-stone-800 p-1 rounded-full border border-stone-200 dark:border-stone-700 ${className}`}
        role="group"
        aria-label="Appearance Theme Selection"
      >
        {options.map(({ mode, label, icon }) => {
          const isActive = themeMode === mode;
          return (
            <button
              key={mode}
              onClick={() => setThemeMode(mode)}
              title={`${label} Mode${mode === 'system' ? ' (Follows Phone OS)' : ''}`}
              className={`p-1.5 rounded-full transition-all duration-200 text-xs flex items-center gap-1 ${
                isActive
                  ? 'bg-white dark:bg-stone-700 text-amber-600 dark:text-amber-400 shadow-sm font-semibold'
                  : 'text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-200'
              }`}
              aria-pressed={isActive}
            >
              {icon}
              {showLabels && <span className="text-[11px] px-1">{label}</span>}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-1 bg-stone-100 dark:bg-stone-800 p-1 rounded-xl border border-stone-200 dark:border-stone-700 ${className}`}>
      {options.map(({ mode, label, icon }) => {
        const isActive = themeMode === mode;
        return (
          <button
            key={mode}
            onClick={() => setThemeMode(mode)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-medium transition-all ${
              isActive
                ? 'bg-white dark:bg-stone-700 text-amber-700 dark:text-amber-300 shadow-sm'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100'
            }`}
          >
            {icon}
            <span>{label}</span>
          </button>
        );
      })}
    </div>
  );
};
