// src/components/ThemeBackground.tsx
import React, { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';

const THEME_CONFIG = {
  night: {
    bg:      '/Background_img_Meditation.jpg',
    opacity: 0.38,
    overlay: 'radial-gradient(ellipse at top, rgba(1,8,20,0.15) 0%, rgba(1,8,20,0.92) 68%)',
  },
  day: {
    bg:      '/Background_Day.png',   // try PNG first
    bgFallback: '/Background_Day.jpg',
    opacity: 0.20,
    overlay: 'radial-gradient(ellipse at top, rgba(240,244,255,0.0) 0%, rgba(210,225,255,0.70) 100%)',
  },
  nature: {
    bg:      '/Background_Nature.png',
    opacity: 0.50,
    overlay: 'radial-gradient(ellipse at top, rgba(5,15,8,0.0) 0%, rgba(5,15,8,0.80) 72%)',
  },
};

function BgImage({ src, fallback, opacity, overlay }: {
  src: string; fallback?: string; opacity: number; overlay: string;
}) {
  const [imgSrc, setImgSrc] = useState(src);

  return (
    <>
      <div
        className="fixed inset-0 bg-cover bg-center bg-no-repeat pointer-events-none z-0"
        style={{
          backgroundImage: `url('${imgSrc}')`,
          opacity,
          transition: 'opacity 0.5s ease',
        }}
        onError={() => {
          if (fallback && imgSrc !== fallback) setImgSrc(fallback);
        }}
      />
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{ background: overlay, transition: 'background 0.5s ease' }}
      />
    </>
  );
}

export default function ThemeBackground() {
  const { theme } = useTheme();
  const cfg = THEME_CONFIG[theme] as any;
  return <BgImage src={cfg.bg} fallback={cfg.bgFallback} opacity={cfg.opacity} overlay={cfg.overlay} />;
}