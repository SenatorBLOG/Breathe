// src/components/Globe/MeditationGlobe.tsx
import React, { useRef } from 'react';
import { useGlobe } from './useGlobe';
import GlobePinMarker from './GlobePinMarker';
import { useThemeStyles } from '../../hooks/useThemeStyles';
import type { GlobePin } from './useGlobe';

interface MeditationGlobeProps {
  pins:               GlobePin[];
  theme:              'night' | 'day' | 'nature';
  filterTechnique:    string;
  addPinMode:         boolean;
  onPinClick:         (pin: GlobePin | null) => void;
  onGlobeClick:       (lat: number, lng: number, country: string) => void;
  onAddPinModeChange: (v: boolean) => void;
}

export default function MeditationGlobe({
  pins,
  theme,
  filterTechnique,
  onPinClick,
  onGlobeClick,
  onAddPinModeChange,
}: MeditationGlobeProps) {
  const ts = useThemeStyles();
  const canvasRef = useRef<HTMLCanvasElement>(null!);  // ← non-null assertion (null! — говорим TS: "доверься, null не будет после монтирования")

  const { hoveredPin, hoveredCity, hoveredPos, setAddPinMode, cityLabels } = useGlobe({
    canvasRef,
    pins,
    theme,
    filterTechnique,
    onPinClick,
    onGlobeClick,
  });

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      <canvas
        ref={canvasRef}
        style={{
          width:   '100%',
          height:  '100%',
          display: 'block',
          cursor:  'grab',
        }}
      />

      {hoveredPin && hoveredPos && (
        <GlobePinMarker pin={hoveredPin} screenPos={hoveredPos} />
      )}

      {cityLabels.map(label => (
        <div
          key={label.name}
          style={{
            position:      'absolute',
            left:          label.x + 8,
            top:           label.y - 10,
            zIndex:        50,
            pointerEvents: 'none',
            fontSize:      label.tier === 1 ? 11 : 10,
            fontWeight:    label.tier === 1 ? 600 : 400,
            color:         label.tier === 1 ? 'rgba(232,232,255,0.95)' : 'rgba(192,200,224,0.85)',
            textShadow:    '0 1px 4px rgba(0,0,0,0.8)',
            whiteSpace:    'nowrap',
            letterSpacing: '0.02em',
          }}
        >
          {label.name}
        </div>
      ))}

      {hoveredCity && hoveredPos && !hoveredPin && (
        <div
          style={{
            position:      'fixed',
            left:          hoveredPos.x + 14,
            top:           hoveredPos.y - 10,
            zIndex:        100,
            background:    ts.cardBg,
            border:        `1px solid ${ts.border}`,
            borderRadius:  8,
            padding:       '5px 9px',
            pointerEvents: 'none',
            backdropFilter: 'blur(12px)',
            boxShadow:     ts.btnShadow,           // ← в теме
            fontSize:      12,
            color:         ts.textPrimary,
            whiteSpace:    'nowrap',
          }}
        >
          {hoveredCity.name}
        </div>
      )}
    </div>
  );
}