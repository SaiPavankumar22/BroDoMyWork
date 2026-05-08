import React from 'react';
import { Sun, Moon } from 'lucide-react';

interface ThemeToggleProps {
  isDark: boolean;
  onToggle: () => void;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ isDark, onToggle }) => {
  return (
    <button
      onClick={onToggle}
      className="relative h-8 w-16 rounded-full border border-app bg-panel transition-all duration-300"
      aria-label="Toggle color theme"
    >
      <div
        className={`absolute top-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-accent text-accent-contrast transition-all duration-300 ${
          isDark ? 'left-[34px]' : 'left-0.5'
        }`}
      >
        {isDark ? <Moon className="w-3 h-3" /> : <Sun className="w-3 h-3" />}
      </div>
    </button>
  );
};
