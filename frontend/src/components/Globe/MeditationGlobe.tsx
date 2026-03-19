import React, { useRef } from 'react';
import { useGlobe } from './useGlobe';
import GlobePinMarker from './GlobePinMarker';
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

  const { hoveredPin, hoveredPos, setAddPinMode } = useGlobe({
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
    </div>
  );
}
