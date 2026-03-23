// src/components/Globe/MeditationGlobe.tsx
import React, { useRef } from 'react';
import { useGlobe } from './useGlobe';
import GlobePinMarker from './GlobePinMarker';
import { useThemeStyles } from '../../hooks/useThemeStyles';
import type { GlobePin, GlobeStyle } from './useGlobe';

interface MeditationGlobeProps {
  pins:               GlobePin[];
  theme:              'night' | 'day' | 'nature';
  style:              GlobeStyle;
  filterTechnique:    string;
  addPinMode:         boolean;
  onPinClick:         (pin: GlobePin | null) => void;
  onGlobeClick:       (lat: number, lng: number, country: string) => void;
  onAddPinModeChange: (v: boolean) => void;
}

export default function MeditationGlobe({
  pins,
  theme,
  style,
  filterTechnique,
  onPinClick,
  onGlobeClick,
  onAddPinModeChange,
}: MeditationGlobeProps) {
  const ts = useThemeStyles();
  const canvasRef = useRef<HTMLCanvasElement>(null!);

  const { hoveredPin, hoveredCity, hoveredPos, setAddPinMode, cityLabels } = useGlobe({
    canvasRef,
    pins,
    theme,
    style,
    filterTechnique,
    onPinClick,
    onGlobeClick,
  });

  // suppress unused warning — setAddPinMode is wired via ref internally
  void setAddPinMode;
  void onAddPinModeChange;

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      <canvas
        ref={canvasRef}
        style={{ width: '100%', height: '100%', display: 'block', cursor: 'grab' }}
      />

      {hoveredPin && hoveredPos && (
        <GlobePinMarker pin={hoveredPin} screenPos={hoveredPos} />
      )}

      {cityLabels.map(label => (
        <div
          key={label.name}
          style={{
            position:      'absolute',
            left:          label.x + 6,
            top:           label.y - 8,
            zIndex:        50,
            pointerEvents: 'none',
            display:       'flex',
            alignItems:    'center',
            gap:           4,
            fontSize:      label.tier === 1 ? 10 : 9,
            fontWeight:    label.tier === 1 ? 600 : 400,
            color:         label.tier === 1 ? 'rgba(255,237,213,0.95)' : 'rgba(253,217,160,0.75)',
            textShadow:    '0 1px 6px rgba(0,0,0,0.95)',
            whiteSpace:    'nowrap',
            letterSpacing: '0.05em',
          }}
        >
          <span style={{
            width:        label.tier === 1 ? 4 : 3,
            height:       label.tier === 1 ? 4 : 3,
            borderRadius: '50%',
            flexShrink:   0,
            background:   label.tier === 1 ? 'rgba(255,220,140,0.95)' : 'rgba(232,192,112,0.80)',
            boxShadow:    label.tier === 1 ? '0 0 5px rgba(255,210,100,0.9)' : 'none',
          }} />
          {label.name}
        </div>
      ))}

      {hoveredCity && hoveredPos && !hoveredPin && (
        <div
          style={{
            position:       'fixed',
            left:           hoveredPos.x + 14,
            top:            hoveredPos.y - 10,
            zIndex:         100,
            background:     ts.cardBg,
            border:         `1px solid ${ts.border}`,
            borderRadius:   8,
            padding:        '5px 9px',
            pointerEvents:  'none',
            backdropFilter: 'blur(12px)',
            boxShadow:      ts.btnShadow,
            fontSize:       12,
            color:          ts.textPrimary,
            whiteSpace:     'nowrap',
          }}
        >
          {hoveredCity.name}
        </div>
      )}
    </div>
  );
}
