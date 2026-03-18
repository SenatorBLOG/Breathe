// src/contexts/ThemeContext.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';

export type Theme = 'night' | 'day' | 'nature';

export const THEME_META: Record<Theme, { icon: string; label: string }> = {
  night:  { icon: '🌙', label: 'Ocean' },
  day:    { icon: '☀️', label: 'Celestial' },
  nature: { icon: '🌿', label: 'Nature' },
};

const CYCLE: Theme[] = ['night', 'day', 'nature'];

interface ThemeContextType {
  theme:    Theme;
  setTheme: (t: Theme) => void;
  toggle:   () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'night', setTheme: () => {}, toggle: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    const s = localStorage.getItem('breathe_theme') as Theme;
    if (s && CYCLE.includes(s)) return s;
    return new Date().getHours() >= 6 && new Date().getHours() < 20 ? 'day' : 'night';
  });

  const setTheme = (t: Theme) => { setThemeState(t); localStorage.setItem('breathe_theme', t); };
  const toggle   = () => { const i = CYCLE.indexOf(theme); setTheme(CYCLE[(i + 1) % CYCLE.length]); };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    document.body.setAttribute('data-theme', theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);