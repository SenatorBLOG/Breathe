import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useThemeStyles } from '../../hooks/useThemeStyles';
import type { GlobePin } from './useGlobe';
import { resolveMapUrl, type ResolvedPlace } from '../../utils/resolveMapUrl';

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
  pickedLatLng?:   { lat: number; lng: number; country: string } | null;
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
  photoUrl:    string;
}

const DEFAULT_FORM: Omit<AddPinFormData, 'lat' | 'lng'> = {
  city:        '',
  country:     '',
  title:       'Meditation spot',
  note:        '',
  technique:   'other',
  sessionLink: '',
  photoUrl:    '',
};

function compressImage(file: File, maxPx = 800, quality = 0.72): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = ev => {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, maxPx / Math.max(img.width, img.height));
        const w = Math.round(img.width * scale);
        const h = Math.round(img.height * scale);
        const canvas = document.createElement('canvas');
        canvas.width  = w;
        canvas.height = h;
        canvas.getContext('2d')!.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = reject;
      img.src = ev.target!.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

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
  pickedLatLng,
}: GlobeControlsProps) {
  const ts = useThemeStyles();
  const [form, setForm] = useState<typeof DEFAULT_FORM>(DEFAULT_FORM);
  const [latInput, setLatInput] = useState('');
  const [lngInput, setLngInput] = useState('');
  const [photoLoading, setPhotoLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Map URL import
  const [mapUrl,       setMapUrl]       = useState('');
  const [urlLoading,   setUrlLoading]   = useState(false);
  const [urlError,     setUrlError]     = useState('');
  const [urlPreview,   setUrlPreview]   = useState<ResolvedPlace | null>(null);

  // Pre-fill coordinates + country when user clicks on the globe
  useEffect(() => {
    if (pickedLatLng) {
      setLatInput(pickedLatLng.lat.toFixed(4));
      setLngInput(pickedLatLng.lng.toFixed(4));
      if (pickedLatLng.country) {
        setForm(prev => ({ ...prev, country: pickedLatLng.country }));
      }
    }
  }, [pickedLatLng]);

  function handleFormChange(field: keyof typeof DEFAULT_FORM, value: string) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const lat = parseFloat(latInput);
    const lng = parseFloat(lngInput);
    if (isNaN(lat) || lat < -90 || lat > 90) return;
    if (isNaN(lng) || lng < -180 || lng > 180) return;
    onAddPin({ ...form, lat, lng });
    setForm(DEFAULT_FORM);
    setLatInput('');
    setLngInput('');
    setMapUrl('');
    setUrlPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  async function handleResolveUrl() {
    if (!mapUrl.trim()) return;
    setUrlLoading(true);
    setUrlError('');
    setUrlPreview(null);
    try {
      const place = await resolveMapUrl(mapUrl.trim());
      setUrlPreview(place);
      setLatInput(place.lat.toFixed(6));
      setLngInput(place.lng.toFixed(6));
      setForm(prev => ({
        ...prev,
        title:    place.name   || prev.title,
        city:     place.city   || prev.city,
        country:  place.country || prev.country,
        photoUrl: place.photoUrl || prev.photoUrl,
      }));
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error
        ?? 'Could not extract location from this URL';
      setUrlError(msg);
    } finally {
      setUrlLoading(false);
    }
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
            <form onSubmit={handleSubmit}>

              {/* ── Map URL import ─────────────────────────────────────────── */}
              <div style={{ marginBottom: 12 }}>
                <label style={labelStyle}>🔗 Import from Google Maps (optional)</label>
                <div style={{ display: 'flex', gap: 6 }}>
                  <input
                    value={mapUrl}
                    onChange={e => { setMapUrl(e.target.value); setUrlError(''); setUrlPreview(null); }}
                    onPaste={e => {
                      const pasted = e.clipboardData.getData('text');
                      if (pasted.includes('maps')) {
                        setMapUrl(pasted);
                        setUrlError('');
                        setUrlPreview(null);
                        setTimeout(() => {
                          resolveMapUrl(pasted.trim()).then(place => {
                            setUrlPreview(place);
                            setLatInput(place.lat.toFixed(6));
                            setLngInput(place.lng.toFixed(6));
                            setForm(prev => ({
                              ...prev,
                              title:    place.name    || prev.title,
                              city:     place.city    || prev.city,
                              country:  place.country || prev.country,
                              photoUrl: place.photoUrl || prev.photoUrl,
                            }));
                          }).catch(err => {
                            const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error ?? 'Could not extract location';
                            setUrlError(msg);
                          }).finally(() => setUrlLoading(false));
                          setUrlLoading(true);
                        }, 0);
                      }
                    }}
                    placeholder="Paste Google Maps link…"
                    style={{ ...inputStyle, flex: 1, fontSize: 11 }}
                  />
                  <button
                    type="button"
                    onClick={handleResolveUrl}
                    disabled={urlLoading || !mapUrl.trim()}
                    style={{
                      flexShrink:   0,
                      padding:      '0 10px',
                      borderRadius: 8,
                      border:       `1px solid ${ts.borderHover}`,
                      background:   ts.cardBgHover,
                      color:        ts.textSecondary,
                      fontSize:     11,
                      cursor:       urlLoading ? 'wait' : 'pointer',
                      opacity:      urlLoading || !mapUrl.trim() ? 0.5 : 1,
                      whiteSpace:   'nowrap',
                    }}
                  >
                    {urlLoading ? '…' : 'Go'}
                  </button>
                </div>

                {/* Error */}
                {urlError && (
                  <p style={{ fontSize: 10, color: '#F87171', marginTop: 4 }}>{urlError}</p>
                )}

                {/* Preview card */}
                {urlPreview && (
                  <div style={{
                    marginTop:    8,
                    borderRadius: 10,
                    border:       `1px solid ${ts.borderHover}`,
                    overflow:     'hidden',
                    background:   ts.cardBgHover,
                  }}>
                    {urlPreview.photoUrl && (
                      <img
                        src={urlPreview.photoUrl}
                        alt={urlPreview.name}
                        style={{ width: '100%', height: 90, objectFit: 'cover', display: 'block' }}
                      />
                    )}
                    <div style={{ padding: '8px 10px' }}>
                      <p style={{ fontSize: 12, fontWeight: 600, color: ts.textPrimary, margin: 0 }}>
                        {urlPreview.name}
                      </p>
                      {urlPreview.address && (
                        <p style={{ fontSize: 10, color: ts.textMuted, margin: '2px 0 0' }}>
                          {urlPreview.address}
                        </p>
                      )}
                      <p style={{ fontSize: 10, color: ts.textSecondary, margin: '3px 0 0' }}>
                        ✓ Fields pre-filled below
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* ── Divider ───────────────────────────────────────────────── */}
              <div style={{ height: 1, background: ts.border, marginBottom: 10 }} />

              {/* Lat / Lng editable inputs */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
                <div>
                  <label style={labelStyle}>Latitude (-90 to 90)</label>
                  <input
                    type="number"
                    value={latInput}
                    onChange={e => setLatInput(e.target.value)}
                    placeholder="e.g. 48.86"
                    step="0.0001"
                    min="-90"
                    max="90"
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Longitude (-180 to 180)</label>
                  <input
                    type="number"
                    value={lngInput}
                    onChange={e => setLngInput(e.target.value)}
                    placeholder="e.g. 2.35"
                    step="0.0001"
                    min="-180"
                    max="180"
                    style={inputStyle}
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

              {/* Photo upload */}
              <div style={{ marginBottom: 8 }}>
                <label style={labelStyle}>Photo (optional)</label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={async e => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    setPhotoLoading(true);
                    try {
                      const dataUrl = await compressImage(file);
                      setForm(prev => ({ ...prev, photoUrl: dataUrl }));
                    } catch {
                      // ignore
                    } finally {
                      setPhotoLoading(false);
                    }
                  }}
                />
                {form.photoUrl ? (
                  <div style={{ position: 'relative' }}>
                    <img
                      src={form.photoUrl}
                      alt="preview"
                      style={{
                        width:        '100%',
                        maxHeight:    140,
                        objectFit:    'cover',
                        borderRadius: 7,
                        border:       `1px solid ${ts.border}`,
                        display:      'block',
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setForm(prev => ({ ...prev, photoUrl: '' }));
                        if (fileInputRef.current) fileInputRef.current.value = '';
                      }}
                      style={{
                        position:     'absolute',
                        top:          4,
                        right:        4,
                        background:   'rgba(0,0,0,0.55)',
                        border:       'none',
                        borderRadius: '50%',
                        width:        22,
                        height:       22,
                        color:        '#fff',
                        fontSize:     13,
                        cursor:       'pointer',
                        lineHeight:   '22px',
                        textAlign:    'center',
                        padding:      0,
                      }}
                    >
                      ×
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={photoLoading}
                    style={{
                      ...inputStyle,
                      cursor:     'pointer',
                      textAlign:  'center',
                      color:      ts.textMuted,
                      background: ts.cardBgHover,
                    }}
                  >
                    {photoLoading ? 'Processing…' : '+ Upload photo'}
                  </button>
                )}
              </div>

              <button type="submit" style={btnPrimary}>
                📍 Drop pin
              </button>
              <button type="button" onClick={onToggleAddPin} style={btnSecondary}>
                Cancel
              </button>
            </form>
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

          {/* Photo */}
          {selectedPin.photoUrl && (
            <img
              src={selectedPin.photoUrl}
              alt={selectedPin.title}
              onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
              style={{
                width:        '100%',
                maxHeight:    140,
                objectFit:    'cover',
                borderRadius: 8,
                marginBottom: 8,
                border:       `1px solid ${ts.border}`,
              }}
            />
          )}

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
