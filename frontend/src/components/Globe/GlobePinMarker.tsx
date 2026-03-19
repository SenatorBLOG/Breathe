import React from 'react';
import { useThemeStyles } from '../../hooks/useThemeStyles';
import type { GlobePin } from './useGlobe';

const TECHNIQUE_LABELS: Record<string, string> = {
  'box':       'Box',
  '4-7-8':     '4-7-8',
  'wim-hof':   'Wim Hof',
  'coherent':  'Coherent',
  'belly':     'Belly',
  'alternate': 'Alternate',
  'other':     'Other',
};

const TECHNIQUE_COLORS: Record<string, string> = {
  'box':       '#3A82F7',
  '4-7-8':     '#7AC4FF',
  'wim-hof':   '#FF9A5C',
  'coherent':  '#4AE8A0',
  'belly':     '#FFD97D',
  'alternate': '#C084FC',
  'other':     '#94A3B8',
};

interface Props {
  pin: GlobePin;
  screenPos: { x: number; y: number };
}

export default function GlobePinMarker({ pin, screenPos }: Props) {
  const ts = useThemeStyles();

  const location = [pin.city, pin.country].filter(Boolean).join(', ') || 'Unknown location';
  const techniqueLabel = TECHNIQUE_LABELS[pin.technique] ?? 'Other';
  const techniqueColor = TECHNIQUE_COLORS[pin.technique] ?? TECHNIQUE_COLORS.other;

  return (
    <div
      style={{
        position:    'fixed',
        left:        screenPos.x + 14,
        top:         screenPos.y - 10,
        zIndex:      100,
        background:  ts.cardBg,
        border:      `1px solid ${ts.border}`,
        borderRadius: 10,
        padding:     '8px 10px',
        maxWidth:    160,
        pointerEvents: 'none',
        backdropFilter: 'blur(12px)',
        boxShadow:   '0 4px 20px rgba(0,0,0,0.4)',
      }}
    >
      {/* Location */}
      <div
        style={{
          fontSize:   11,
          color:      ts.textMuted,
          marginBottom: 2,
          whiteSpace: 'nowrap',
          overflow:   'hidden',
          textOverflow: 'ellipsis',
        }}
      >
        📍 {location}
      </div>

      {/* Title */}
      <div
        style={{
          fontSize:     13,
          fontWeight:   600,
          color:        ts.textPrimary,
          marginBottom: 4,
          overflow:     'hidden',
          display:      '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
        } as React.CSSProperties}
      >
        {pin.title}
      </div>

      {/* Technique badge */}
      <div
        style={{
          display:        'inline-flex',
          alignItems:     'center',
          gap:            4,
          fontSize:       10,
          color:          techniqueColor,
          background:     `${techniqueColor}22`,
          border:         `1px solid ${techniqueColor}44`,
          borderRadius:   20,
          padding:        '2px 7px',
        }}
      >
        <span
          style={{
            width:           6,
            height:          6,
            borderRadius:    '50%',
            background:      techniqueColor,
            display:         'inline-block',
            flexShrink:      0,
          }}
        />
        {techniqueLabel}
      </div>
    </div>
  );
}
