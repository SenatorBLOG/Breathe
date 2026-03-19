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
  onGlobeClick:       (lat: number, lng: number) => void;
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
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ts = useThemeStyles();

  const { hoveredPin, hoveredCity, hoveredPos, setAddPinMode } = useGlobe({
    canvasRef,
    pins,
    theme,
    filterTechnique,
    onPinClick,
    onGlobeClick,
  });

  // Propagate addPinMode changes upward
  React.useEffect(() => {
    // no-op: addPinMode is managed in useGlobe; parent controls it via prop
  }, []);

  return (
    <div style={{ position: 'absolute', inset: 0 }}>
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
            boxShadow:     '0 4px 20px rgba(0,0,0,0.4)',
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
