import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useThemeStyles } from '../../hooks/useThemeStyles';
import type { GlobePin } from './useGlobe';

const TECHNIQUE_OPTIONS = [
  { value: 'all',       label: 'All' },
  { value: 'box',       label: 'Box' },
  { value: '4-7-8',     label: '4-7-8' },
  { value: 'wim-hof',   label: 'Wim Hof' },
  { value: 'coherent',  label: 'Coherent' },
  { value: 'belly',     label: 'Belly' },
  { value: 'alternate', label: 'Alternate' },
  { value: 'other',     label: 'Other' },
];

const TECHNIQUE_COLORS: Record<string, string> = {
  'box':       '#3A82F7',
  '4-7-8':     '#7AC4FF',
  'wim-hof':   '#FF9A5C',
  'coherent':  '#4AE8A0',
  'belly':     '#FFD97D',
  'alternate': '#C084FC',
  'other':     '#94A3B8',
};

interface GlobeStats {
  totalPins: number;
  countries: number;
  topCities: { _id: string; count: number }[];
  techniqueBreakdown: Record<string, number>;
}

interface GlobeControlsProps {
  selectedPin:     GlobePin | null;
  stats:           GlobeStats | null;
  filterTechnique: string;
  onFilterChange:  (t: string) => void;
  addPinMode:      boolean;
  onToggleAddPin:  () => void;
  onLike:          (id: string) => void;
  onDelete:        (id: string) => void;
  onAddPin:        (data: AddPinFormData) => void;
  onClose:         () => void;
  isAuthenticated: boolean;
  currentUserId?:  string;
  clickedLatLng:   { lat: number; lng: number } | null;
}

interface AddPinFormData {
  lat:         number;
  lng:         number;
  city:        string;
  country:     string;
  title:       string;
  note:        string;
  technique:   string;
  sessionLink: string;
}

const DEFAULT_FORM: Omit<AddPinFormData, 'lat' | 'lng'> = {
  city:        '',
  country:     '',
  title:       'Meditation spot',
  note:        '',
  technique:   'other',
  sessionLink: '',
};

export default function GlobeControls({
  selectedPin,
  stats,
  filterTechnique,
  onFilterChange,
  addPinMode,
  onToggleAddPin,
  onLike,
  onDelete,
  onAddPin,
  onClose,
  isAuthenticated,
  currentUserId,
  clickedLatLng,
}: GlobeControlsProps) {
  const ts = useThemeStyles();
  const [form, setForm] = useState<typeof DEFAULT_FORM>(DEFAULT_FORM);

  function handleFormChange(field: keyof typeof DEFAULT_FORM, value: string) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!clickedLatLng) return;
    onAddPin({ ...form, lat: clickedLatLng.lat, lng: clickedLatLng.lng });
    setForm(DEFAULT_FORM);
  }

  const sectionStyle: React.CSSProperties = {
    background:   ts.cardBg,
    border:       `1px solid ${ts.border}`,
    borderRadius: 12,
    padding:      '12px 14px',
    marginBottom: 10,
  };

  const labelStyle: React.CSSProperties = {
    fontSize: 11,
    color:    ts.textMuted,
    marginBottom: 4,
    display:  'block',
  };

  const inputStyle: React.CSSProperties = {
    width:        '100%',
    background:   ts.cardBgHover,
    border:       `1px solid ${ts.border}`,
    borderRadius: 7,
    padding:      '6px 9px',
    color:        ts.textPrimary,
    fontSize:     13,
    outline:      'none',
    boxSizing:    'border-box',
  };

  const btnPrimary: React.CSSProperties = {
    background:   ts.accent,
    color:        '#fff',
    border:       'none',
    borderRadius: 8,
    padding:      '7px 14px',
    fontSize:     13,
    fontWeight:   600,
    cursor:       'pointer',
    width:        '100%',
    marginTop:    8,
  };

  const btnSecondary: React.CSSProperties = {
    background:   'transparent',
    color:        ts.textMuted,
    border:       `1px solid ${ts.border}`,
    borderRadius: 8,
    padding:      '6px 12px',
    fontSize:     12,
    cursor:       'pointer',
    width:        '100%',
    marginTop:    6,
  };

  return (
    <div
      style={{
        padding:    '14px 12px',
        color:      ts.textPrimary,
        height:     '100%',
        overflowY:  'auto',
      }}
    >
      {/* ── Stats strip ─────────────────────────────────────────────────── */}
      {stats && (
        <div style={{ ...sectionStyle, marginBottom: 12 }}>
          <div style={{ fontSize: 13, color: ts.textSecondary, fontWeight: 600 }}>
            🌍 {stats.totalPins.toLocaleString()} meditation spot{stats.totalPins !== 1 ? 's' : ''}
          </div>
          <div style={{ fontSize: 11, color: ts.textMuted, marginTop: 2 }}>
            across {stats.countries} countr{stats.countries !== 1 ? 'ies' : 'y'}
          </div>
        </div>
      )}

      {/* ── Technique filter pills ───────────────────────────────────────── */}
      <div
        style={{
          display:    'flex',
          gap:        6,
          overflowX:  'auto',
          paddingBottom: 4,
          marginBottom: 12,
          scrollbarWidth: 'none',
        }}
      >
        {TECHNIQUE_OPTIONS.map(opt => {
          const active = filterTechnique === opt.value;
          return (
            <button
              key={opt.value}
              onClick={() => onFilterChange(opt.value)}
              style={{
                flexShrink:   0,
                background:   active ? ts.cardBgHover : ts.cardBg,
                border:       `1px solid ${active ? ts.borderHover : ts.border}`,
                borderRadius: 20,
                padding:      '4px 10px',
                fontSize:     11,
                color:        active ? ts.textSecondary : ts.textMuted,
                cursor:       'pointer',
                whiteSpace:   'nowrap',
                fontWeight:   active ? 600 : 400,
                transition:   'all 0.15s',
              }}
            >
              {opt.label}
            </button>
          );
        })}
      </div>

      {/* ── Add pin section ──────────────────────────────────────────────── */}
      <div style={sectionStyle}>
        {!isAuthenticated && (
          <div style={{ fontSize: 12, color: ts.textMuted, textAlign: 'center' }}>
            <div style={{ marginBottom: 6 }}>🗺️ Want to pin your meditation spot?</div>
            <Link
              to="/login"
              style={{
                color:          ts.accentLight,
                fontWeight:     600,
                textDecoration: 'none',
              }}
            >
              Sign in to add your spot →
            </Link>
          </div>
        )}

        {isAuthenticated && !addPinMode && (
          <button onClick={onToggleAddPin} style={btnPrimary}>
            + Add your spot
          </button>
        )}

        {isAuthenticated && addPinMode && (
          <div>
            <div style={{ fontSize: 12, color: ts.textSecondary, marginBottom: 8, fontWeight: 500 }}>
              🎯 Click anywhere on the globe to pick your spot
            </div>

            {clickedLatLng && (
              <form onSubmit={handleSubmit}>
                {/* Lat / Lng display */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
                  <div>
                    <label style={labelStyle}>Lat</label>
                    <input
                      readOnly
                      value={clickedLatLng.lat.toFixed(4)}
                      style={{ ...inputStyle, color: ts.textMuted }}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Lng</label>
                    <input
                      readOnly
                      value={clickedLatLng.lng.toFixed(4)}
                      style={{ ...inputStyle, color: ts.textMuted }}
                    />
                  </div>
                </div>

                {/* City */}
                <div style={{ marginBottom: 8 }}>
                  <label style={labelStyle}>City</label>
                  <input
                    value={form.city}
                    onChange={e => handleFormChange('city', e.target.value)}
                    placeholder="e.g. Tokyo"
                    style={inputStyle}
                    maxLength={100}
                  />
                </div>

                {/* Country */}
                <div style={{ marginBottom: 8 }}>
                  <label style={labelStyle}>Country</label>
                  <input
                    value={form.country}
                    onChange={e => handleFormChange('country', e.target.value)}
                    placeholder="e.g. Japan"
                    style={inputStyle}
                    maxLength={100}
                  />
                </div>

                {/* Title */}
                <div style={{ marginBottom: 8 }}>
                  <label style={labelStyle}>Title (max 80 chars)</label>
                  <input
                    value={form.title}
                    onChange={e => handleFormChange('title', e.target.value)}
                    placeholder="Meditation spot"
                    style={inputStyle}
                    maxLength={80}
                  />
                </div>

                {/* Note */}
                <div style={{ marginBottom: 8 }}>
                  <label style={labelStyle}>Note (max 300 chars)</label>
                  <textarea
                    value={form.note}
                    onChange={e => handleFormChange('note', e.target.value)}
                    placeholder="Share your experience..."
                    style={{ ...inputStyle, resize: 'vertical', minHeight: 60 }}
                    maxLength={300}
                  />
                </div>

                {/* Technique */}
                <div style={{ marginBottom: 8 }}>
                  <label style={labelStyle}>Technique</label>
                  <select
                    value={form.technique}
                    onChange={e => handleFormChange('technique', e.target.value)}
                    style={inputStyle}
                  >
                    {TECHNIQUE_OPTIONS.filter(o => o.value !== 'all').map(o => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </div>

                {/* Session Link */}
                <div style={{ marginBottom: 8 }}>
                  <label style={labelStyle}>Session link (optional)</label>
                  <input
                    value={form.sessionLink}
                    onChange={e => handleFormChange('sessionLink', e.target.value)}
                    placeholder="https://..."
                    style={inputStyle}
                    maxLength={500}
                  />
                </div>

                <button type="submit" style={btnPrimary}>
                  📍 Drop pin
                </button>
                <button type="button" onClick={onToggleAddPin} style={btnSecondary}>
                  Cancel
                </button>
              </form>
            )}

            {!clickedLatLng && (
              <button type="button" onClick={onToggleAddPin} style={btnSecondary}>
                Cancel
              </button>
            )}
          </div>
        )}
      </div>

      {/* ── Selected pin panel ───────────────────────────────────────────── */}
      {selectedPin && (
        <div style={sectionStyle}>
          {/* Header */}
          <div
            style={{
              display:        'flex',
              justifyContent: 'space-between',
              alignItems:     'flex-start',
              marginBottom:   8,
            }}
          >
            <div style={{ fontSize: 12, color: ts.textMuted }}>
              📍 {[selectedPin.city, selectedPin.country].filter(Boolean).join(', ') || 'Unknown location'}
            </div>
            <button
              onClick={onClose}
              style={{
                background: 'transparent',
                border:     'none',
                color:      ts.textMuted,
                cursor:     'pointer',
                fontSize:   16,
                lineHeight: 1,
                padding:    0,
              }}
              aria-label="Close"
            >
              ×
            </button>
          </div>

          {/* Title */}
          <div
            style={{
              fontSize:     15,
              fontWeight:   700,
              color:        ts.textPrimary,
              marginBottom: 6,
              wordBreak:    'break-word',
            }}
          >
            {selectedPin.title}
          </div>

          {/* Note */}
          {selectedPin.note && (
            <div
              style={{
                fontSize:     12,
                color:        ts.textSecondary,
                marginBottom: 8,
                wordBreak:    'break-word',
                lineHeight:   1.5,
              }}
            >
              {selectedPin.note}
            </div>
          )}

          {/* Technique badge */}
          <div style={{ marginBottom: 10 }}>
            <span
              style={{
                display:      'inline-flex',
                alignItems:   'center',
                gap:          5,
                fontSize:     11,
                color:        TECHNIQUE_COLORS[selectedPin.technique] ?? '#94A3B8',
                background:   `${TECHNIQUE_COLORS[selectedPin.technique] ?? '#94A3B8'}22`,
                border:       `1px solid ${TECHNIQUE_COLORS[selectedPin.technique] ?? '#94A3B8'}44`,
                borderRadius: 20,
                padding:      '3px 9px',
              }}
            >
              <span
                style={{
                  width:        7,
                  height:       7,
                  borderRadius: '50%',
                  background:   TECHNIQUE_COLORS[selectedPin.technique] ?? '#94A3B8',
                  display:      'inline-block',
                }}
              />
              {TECHNIQUE_OPTIONS.find(o => o.value === selectedPin.technique)?.label ?? 'Other'}
            </span>
          </div>

          {/* Posted by */}
          <div style={{ fontSize: 11, color: ts.textMuted, marginBottom: 8 }}>
            by {selectedPin.username}
          </div>

          {/* Actions row */}
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            {/* Like */}
            <button
              onClick={() => onLike(selectedPin._id)}
              style={{
                display:      'flex',
                alignItems:   'center',
                gap:          4,
                background:   ts.cardBgHover,
                border:       `1px solid ${ts.border}`,
                borderRadius: 8,
                padding:      '5px 10px',
                fontSize:     12,
                color:        ts.textSecondary,
                cursor:       'pointer',
              }}
            >
              ❤️ {selectedPin.likeCount}
            </button>

            {/* Delete (owner only) */}
            {currentUserId && currentUserId === selectedPin.userId && (
              <button
                onClick={() => onDelete(selectedPin._id)}
                style={{
                  background:   'transparent',
                  border:       `1px solid rgba(239,68,68,0.4)`,
                  borderRadius: 8,
                  padding:      '5px 10px',
                  fontSize:     12,
                  color:        '#EF4444',
                  cursor:       'pointer',
                }}
              >
                🗑 Delete
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
