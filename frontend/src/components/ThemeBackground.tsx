// src/components/ThemeBackground.tsx
import React from 'react';
import { useTheme } from '../contexts/ThemeContext';

const THEME_CONFIG = {
  night: {
    bg:      '/Background_img_Meditation.jpg',
    opacity: 0.35,
    overlay: 'radial-gradient(ellipse at top, rgba(1,8,20,0.2) 0%, rgba(1,8,20,0.94) 68%)',
  },
  day: {
    bg:      '/Background_Day.jpg',
    opacity: 0.18,
    overlay: 'radial-gradient(ellipse at top, rgba(240,244,255,0.05) 0%, rgba(220,230,255,0.72) 100%)',
  },
  nature: {
    bg:      '/Background_Nature.png',
    opacity: 0.48,
    overlay: 'radial-gradient(ellipse at top, rgba(5,15,8,0.05) 0%, rgba(5,15,8,0.82) 75%)',
  },
};

export default function ThemeBackground() {
  const { theme } = useTheme();
  const cfg = THEME_CONFIG[theme];

  return (
    <>
      <div
        className="fixed inset-0 bg-cover bg-center pointer-events-none"
        style={{ backgroundImage: `url('${cfg.bg}')`, opacity: cfg.opacity, transition: 'opacity 0.5s ease' }}
      />
      <div
        className="fixed inset-0 pointer-events-none"
        style={{ background: cfg.overlay, transition: 'background 0.5s ease' }}
      />
    </>
  );
}