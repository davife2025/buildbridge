'use client';

import { useTheme } from '@/context/theme-context';

export function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      onClick={toggle}
      title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      className={[
        'relative flex h-8 w-14 items-center rounded-full border transition-all duration-300',
        isDark
          ? 'border-gray-600 bg-gray-700'
          : 'border-gray-200 bg-gray-100',
      ].join(' ')}
    >
      {/* Track icons */}
      <span className="absolute left-1.5 text-[11px]">☀️</span>
      <span className="absolute right-1.5 text-[11px]">🌙</span>

      {/* Sliding thumb */}
      <span
        className={[
          'absolute flex h-6 w-6 items-center justify-center rounded-full shadow-sm transition-all duration-300',
          isDark
            ? 'translate-x-6 bg-gray-900'
            : 'translate-x-0.5 bg-white',
        ].join(' ')}
      />
    </button>
  );
}
