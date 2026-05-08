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

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('night');
  const [isLoading, setIsLoading] = useState(true);

  // Load theme from user profile on mount
  useEffect(() => {
    const loadTheme = async () => {
      const token = localStorage.getItem('token');
      
      if (token) {
        try {
          // Try to get theme from user profile
          const response = await api.get('/users/me');
          const userTheme = response.data.theme as Theme;
          if (userTheme && CYCLE.includes(userTheme)) {
            setThemeState(userTheme);
            localStorage.setItem('breathe_theme', userTheme);
            setIsLoading(false);
            return;
          }
        } catch (err) {
          // Theme profile fetch failed — silently fall through to localStorage.
          // This is expected when user is not authenticated or API is slow.
        }
      }
      
      // Fallback to localStorage or time-based
      const savedTheme = localStorage.getItem('breathe_theme') as Theme;
      if (savedTheme && CYCLE.includes(savedTheme)) {
        setThemeState(savedTheme);
      } else {
        const hour = new Date().getHours();
        setThemeState(hour >= 6 && hour < 20 ? 'day' : 'night');
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