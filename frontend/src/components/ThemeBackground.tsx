// src/components/ThemeBackground.tsx
import React from 'react';
import { useTheme } from '../contexts/ThemeContext';

const CFG = {
  night: {
    src:     '/Background_Night.jpg',
    opacity: 0.55,   // was 0.38 — now visible
    overlay: 'radial-gradient(ellipse at 50% 0%, rgba(1,8,20,0.05) 0%, rgba(1,8,20,0.78) 80%)',
  },
  day: {
    src:     '/Background_Day.jpg',
    opacity: 0.45,
    overlay: 'radial-gradient(ellipse at 50% 0%, rgba(255,248,230,0.0) 0%, rgba(240,235,210,0.60) 100%)',
  },
  nature: {
    src:     '/Background_Nature.jpg',
    opacity: 0.60,
    overlay: 'radial-gradient(ellipse at 50% 0%, rgba(5,15,8,0.0) 0%, rgba(5,15,8,0.72) 80%)',
  },
};

export default function ThemeBackground() {
  const { theme } = useTheme();
  const { src, opacity, overlay } = CFG[theme] ?? CFG.night;
  return (
    <>
      <img src={src} alt="" aria-hidden="true"
        className="fixed inset-0 w-full h-full pointer-events-none select-none"
        style={{ objectFit: 'cover', objectPosition: 'center', opacity, zIndex: 0, transition: 'opacity 0.6s ease' }}
      />
      <div aria-hidden="true" className="fixed inset-0 pointer-events-none"
        style={{ background: overlay, zIndex: 1, transition: 'background 0.6s ease' }}
      />
    </>
  );
}