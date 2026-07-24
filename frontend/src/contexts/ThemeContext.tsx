// src/contexts/ThemeContext.tsx
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { Moon, Sun, Leaf } from 'lucide-react';
import api from '../api';

export type Theme = 'night' | 'day' | 'nature';

export const THEME_META: Record<Theme, { icon: React.ReactNode; label: string }> = {
  night:  { icon: <Moon size={16} color="#818CF8" />, label: 'Ocean' },
  day:    { icon: <Sun size={16} color="#FACC15" />, label: 'Celestial' },
  nature: { icon: <Leaf size={16} color="#4ADE80" />, label: 'Nature' },
};

const CYCLE: Theme[] = ['night', 'day', 'nature'];

interface ThemeContextType {
  theme:    Theme;
  setTheme: (t: Theme) => void;
  toggle:   () => void;
  isLoading: boolean;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'night', setTheme: () => {}, toggle: () => {}, isLoading: false,
});

// Resolve the theme SYNCHRONOUSLY, before the first render.
//
// This used to default to 'night' and correct itself in an effect, which meant
// a day-theme visitor rendered the night background first: a visible theme
// flash on every cold load AND a wasted background image download (both
// Background_Night.webp and Background_Day.webp were fetched).
function resolveInitialTheme(): Theme {
  if (typeof window === 'undefined') return 'night';
  try {
    const saved = localStorage.getItem('breathe_theme') as Theme | null;
    if (saved && CYCLE.includes(saved)) return saved;
  } catch {
    // localStorage can throw in private mode — fall through to time-of-day
  }
  const hour = new Date().getHours();
  return hour >= 6 && hour < 20 ? 'day' : 'night';
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(resolveInitialTheme);
  const [isLoading, setIsLoading] = useState(true);

  // The local theme is already correct at this point; this only reconciles it
  // with the signed-in user's saved preference, which requires a round trip.
  useEffect(() => {
    const loadTheme = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await api.get('/users/me');
          const userTheme = response.data.theme as Theme;
          if (userTheme && CYCLE.includes(userTheme)) {
            setThemeState(userTheme);
            localStorage.setItem('breathe_theme', userTheme);
          }
        } catch {
          // Not authenticated or API slow — the locally resolved theme stands.
        }
      }
      setIsLoading(false);
    };

    loadTheme();
  }, []);

  // Save theme to user profile when changed
  const saveThemeToProfile = useCallback(async (newTheme: Theme) => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        await api.patch('/users/me', { theme: newTheme });
      } catch {
        // PATCH may fail in dev due to CORS — theme is already saved to localStorage above
      }
    }
  }, []);

  const setTheme = (t: Theme) => {
    setThemeState(t);
    localStorage.setItem('breathe_theme', t);
    saveThemeToProfile(t);
  };

  const toggle = () => {
    const i = CYCLE.indexOf(theme);
    const newTheme = CYCLE[(i + 1) % CYCLE.length];
    setTheme(newTheme);
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    document.body.setAttribute('data-theme', theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggle, isLoading }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);