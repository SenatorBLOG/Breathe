// src/components/ThemeBackground.tsx
// Drop this into any page to get the correct background + overlay for the current theme
import React from 'react';
import { useTheme } from '../contexts/ThemeContext';

export default function ThemeBackground() {
  const { bg } = useTheme();

  return (
    <>
      {/* Background image — opacity controlled by CSS var */}
      <div
        className="fixed inset-0 bg-cover bg-center pointer-events-none theme-bg-img"
        style={{ backgroundImage: `url('${bg}')` }}
      />
      {/* Overlay — gradient controlled by CSS var */}
      <div
        className="fixed inset-0 pointer-events-none theme-overlay"
      />
    </>
  );
}