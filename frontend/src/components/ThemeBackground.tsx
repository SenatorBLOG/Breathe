// src/components/ThemeBackground.tsx
import React from 'react';
import { useTheme } from '../contexts/ThemeContext';

// !! Rename your files in public/ to match exactly:
//    Background_Night.jpg   ← your original meditation background
//    Background_Day.jpg     ← light sky background  
//    Background_Nature.jpg  ← forest/waterfall background
//
// If your files have different names, change the strings below.

const BG: Record<string, { src: string; opacity: number; overlay: string }> = {
  night: {
    src:     '/Background_Night.jpg',
    opacity: 0.38,
    overlay: 'radial-gradient(ellipse at top, rgba(1,8,20,0.1) 0%, rgba(1,8,20,0.90) 65%)',
  },
  day: {
    src:     '/Background_Day.jpg',
    opacity: 0.22,
    overlay: 'radial-gradient(ellipse at top, rgba(240,244,255,0.0) 0%, rgba(210,225,255,0.68) 100%)',
  },
  nature: {
    src:     '/Background_Nature.jpg',
    opacity: 0.52,
    overlay: 'radial-gradient(ellipse at top, rgba(5,15,8,0.0) 0%, rgba(5,15,8,0.78) 70%)',
  },
};

export default function ThemeBackground() {
  const { theme } = useTheme();
  const { src, opacity, overlay } = BG[theme] ?? BG.night;

  return (
    <>
      {/* Actual <img> tag — most reliable cross-browser way to load images */}
      <img
        src={src}
        alt=""
        aria-hidden="true"
        className="fixed inset-0 w-full h-full pointer-events-none select-none"
        style={{
          objectFit:  'cover',
          objectPosition: 'center',
          opacity,
          zIndex: 0,
          transition: 'opacity 0.5s ease',
        }}
      />
      {/* Dark/light overlay */}
      <div
        aria-hidden="true"
        className="fixed inset-0 pointer-events-none"
        style={{
          background: overlay,
          zIndex: 1,
          transition: 'background 0.5s ease',
        }}
      />
    </>
  );
}