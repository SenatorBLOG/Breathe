// src/contexts/ThemeContext.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';

export type Theme = 'night' | 'day' | 'nature';

export const THEME_BG: Record<Theme, string> = {
  night:  '/Background_Night.jpg',
  day:    '/Background_Day.jpg',
  nature: '/Background_Nature.jpg',
};

export const THEME_META: Record<Theme, { icon: string; label: string }> = {
  night:  { icon: '🌙', label: 'Ocean Night' },
  day:    { icon: '☀️', label: 'Celestial Day' },
  nature: { icon: '🌿', label: 'Nature' },
};

const CYCLE: Theme[] = ['night', 'day', 'nature'];

interface ThemeContextType {
  theme:     Theme;
  setTheme:  (t: Theme) => void;
  toggle:    () => void;
  bg:        string;
}

const ThemeContext = createContext<ThemeContextType>({
  theme:    'night',
  setTheme: () => {},
  toggle:   () => {},
  bg:       '/Background_Night.jpg',
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    const saved = localStorage.getItem('breathe_theme') as Theme;
    if (saved && CYCLE.includes(saved)) return saved;
    const h = new Date().getHours();
    return h >= 6 && h < 20 ? 'day' : 'night';
  });

  const setTheme = (t: Theme) => {
    setThemeState(t);
    localStorage.setItem('breathe_theme', t);
  };

  const toggle = () => {
    const idx = CYCLE.indexOf(theme);
    setTheme(CYCLE[(idx + 1) % CYCLE.length]);
  };

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', theme);
    document.body.setAttribute('data-theme', theme);

    if (theme === 'day') {
      root.style.setProperty('--bg-primary',    '#F0F4FF');
      root.style.setProperty('--bg-secondary',  '#E8EEFF');
      root.style.setProperty('--bg-card',       'rgba(255,255,255,0.85)');
      root.style.setProperty('--bg-card-hover', 'rgba(255,255,255,0.95)');
      root.style.setProperty('--border',        'rgba(180,200,255,0.6)');
      root.style.setProperty('--border-hover',  'rgba(100,150,255,0.8)');
      root.style.setProperty('--text-primary',  '#1A2A5E');
      root.style.setProperty('--text-secondary','#3A5080');
      root.style.setProperty('--text-muted',    '#6080B0');
      root.style.setProperty('--text-dim',      '#8AAAD0');
      root.style.setProperty('--accent',        '#2B6FD4');
      root.style.setProperty('--accent-light',  '#5090F0');
      root.style.setProperty('--accent-glow',   'rgba(43,111,212,0.25)');
      root.style.setProperty('--nav-bg',        'rgba(240,244,255,0.92)');
      root.style.setProperty('--orb-from',      '#90C0FF');
      root.style.setProperty('--orb-to',        '#2B6FD4');
      root.style.setProperty('--glow',          'rgba(43,111,212,0.3)');
      root.style.setProperty('--overlay',       'radial-gradient(ellipse at top, rgba(240,244,255,0.1) 0%, rgba(220,230,255,0.75) 100%)');
      root.style.setProperty('--bg-opacity',    '0.15');

    } else if (theme === 'nature') {
      root.style.setProperty('--bg-primary',    '#0A1A0E');
      root.style.setProperty('--bg-secondary',  '#0D2012');
      root.style.setProperty('--bg-card',       'rgba(10,28,14,0.82)');
      root.style.setProperty('--bg-card-hover', 'rgba(12,34,16,0.92)');
      root.style.setProperty('--border',        'rgba(40,100,55,0.5)');
      root.style.setProperty('--border-hover',  'rgba(60,140,80,0.7)');
      root.style.setProperty('--text-primary',  '#C8F0D8');
      root.style.setProperty('--text-secondary','#7ADFA0');
      root.style.setProperty('--text-muted',    '#4A9060');
      root.style.setProperty('--text-dim',      '#2A5038');
      root.style.setProperty('--accent',        '#1A7A40');
      root.style.setProperty('--accent-light',  '#2ECC71');
      root.style.setProperty('--accent-glow',   'rgba(46,204,113,0.35)');
      root.style.setProperty('--nav-bg',        'rgba(8,20,10,0.95)');
      root.style.setProperty('--orb-from',      '#7ADFA0');
      root.style.setProperty('--orb-to',        '#1A7A40');
      root.style.setProperty('--glow',          'rgba(46,204,113,0.4)');
      root.style.setProperty('--overlay',       'radial-gradient(ellipse at top, rgba(10,28,14,0.1) 0%, rgba(5,15,8,0.88) 75%)');
      root.style.setProperty('--bg-opacity',    '0.45');

    } else {
      // night
      root.style.setProperty('--bg-primary',    '#010814');
      root.style.setProperty('--bg-secondary',  '#040A14');
      root.style.setProperty('--bg-card',       'rgba(11,22,40,0.85)');
      root.style.setProperty('--bg-card-hover', 'rgba(13,27,51,0.9)');
      root.style.setProperty('--border',        'rgba(30,51,88,0.5)');
      root.style.setProperty('--border-hover',  'rgba(42,84,153,0.7)');
      root.style.setProperty('--text-primary',  '#B8D9FF');
      root.style.setProperty('--text-secondary','#7AC4FF');
      root.style.setProperty('--text-muted',    '#4A7AAA');
      root.style.setProperty('--text-dim',      '#2A4060');
      root.style.setProperty('--accent',        '#1A5FCC');
      root.style.setProperty('--accent-light',  '#3A82F7');
      root.style.setProperty('--accent-glow',   'rgba(58,130,247,0.35)');
      root.style.setProperty('--nav-bg',        'rgba(6,12,26,0.95)');
      root.style.setProperty('--orb-from',      '#7AC4FF');
      root.style.setProperty('--orb-to',        '#1A5FCC');
      root.style.setProperty('--glow',          'rgba(74,158,255,0.4)');
      root.style.setProperty('--overlay',       'radial-gradient(ellipse at top, rgba(1,8,20,0.2) 0%, rgba(1,8,20,0.94) 68%)');
      root.style.setProperty('--bg-opacity',    '0.35');
    }
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggle, bg: THEME_BG[theme] }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);