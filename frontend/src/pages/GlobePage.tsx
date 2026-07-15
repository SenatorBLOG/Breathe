/**
 * GlobePage — "Breathe Together" global meditation community map.
 * Uses Leaflet.js (CartoDB dark basemap, no API key required).
 */
import { useState, useEffect, useCallback, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import NavBar from '../components/NavBar';
import PageSEO from '../components/PageSEO';
import { useThemeStyles } from '../hooks/useThemeStyles';
import { AuthContext } from '../components/contexts/AuthContext';
import api from '../api';
import { toast } from 'sonner';
import type { GlobePin } from '../components/Globe/types';
import MapView    from '../components/Globe/MapView';
import Globe3D    from '../components/Globe/Globe3D';
import FilterBar  from '../components/Globe/FilterBar';
import SpotSidebar from '../components/Globe/SpotSidebar';
import AddSpotModal from '../components/Globe/AddSpotModal';

interface GlobeStats {
  totalPins:          number;
  countries:          number;
  topCities:          { _id: string; count: number }[];
  techniqueBreakdown: Record<string, number>;
}

export default function GlobePage() {
  const { t } = useTranslation();
  const ts = useThemeStyles();
  const { isAuthenticated, user } = useContext(AuthContext);

  const [pins,            setPins]            = useState<GlobePin[]>([]);
  const [stats,           setStats]           = useState<GlobeStats | null>(null);
  const [filterTechnique, setFilterTechnique] = useState('all');
  const [selectedPin,     setSelectedPin]     = useState<GlobePin | null>(null);
  const [sidebarOpen,     setSidebarOpen]     = useState(false);
  const [addPinMode,      setAddPinMode]      = useState(false);
  const [pickedLatLng,    setPickedLatLng]    = useState<{ lat: number; lng: number } | null>(null);
  const [loading,         setLoading]         = useState(true);
  // 3D globe by default; falls back to the 2D map when WebGL is missing.
  const [view3d,          setView3d]          = useState(() => localStorage.getItem('globeView') !== '2d');

  const switchView = useCallback((to3d: boolean) => {
    setView3d(to3d);
    localStorage.setItem('globeView', to3d ? '3d' : '2d');
  }, []);

  const webglFallback = useCallback(() => setView3d(false), []);

  // ── Fetch pins + stats ─────────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [pinsRes, statsRes] = await Promise.all([
          api.get<GlobePin[]>('/globe'),
          api.get<GlobeStats>('/globe/stats'),
        ]);
        if (!cancelled) {
          setPins(pinsRes.data);
          setStats(statsRes.data);
        }
      } catch {
        if (!cancelled) toast.error(t('globe.failedLoad'));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handlePinClick = useCallback((pin: GlobePin) => {
    setSelectedPin(pin);
    setSidebarOpen(true);
  }, []);

  const handleMapClick = useCallback((lat: number, lng: number) => {
    if (!addPinMode) return;
    setPickedLatLng({ lat, lng });
  }, [addPinMode]);

  const handleLike = useCallback(async (id: string) => {
    try {
      const res = await api.post<{ likeCount: number }>(`/globe/${id}/like`);
      setPins(prev => prev.map(p => p._id === id ? { ...p, likeCount: res.data.likeCount } : p));
      setSelectedPin(prev => prev?._id === id ? { ...prev, likeCount: res.data.likeCount } : prev);
    } catch { toast.error(t('globe.failedLike')); }
  }, []);

  const handleDelete = useCallback(async (id: string) => {
    try {
      await api.delete(`/globe/${id}`);
      setPins(prev => prev.filter(p => p._id !== id));
      setSelectedPin(null);
      setStats(prev => prev ? { ...prev, totalPins: Math.max(0, prev.totalPins - 1) } : prev);
      toast.success(t('globe.pinDeleted'));
    } catch { toast.error(t('globe.failedDelete')); }
  }, []);

  const handleAddPin = useCallback(async (data: {
    lat: number; lng: number; city: string; country: string;
    title: string; note: string; technique: string; sessionLink: string; photoUrl: string;
  }) => {
    try {
      const res = await api.post<GlobePin>('/globe', data);
      setPins(prev => [res.data, ...prev]);
      setPickedLatLng(null);
      setAddPinMode(false);
      setStats(prev => prev ? { ...prev, totalPins: prev.totalPins + 1 } : prev);
      toast.success(t('globe.pinned'));
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error ?? t('globe.failedAddPin');
      toast.error(msg);
    }
  }, []);

  const cancelAddPin = useCallback(() => {
    setPickedLatLng(null);
    setAddPinMode(false);
  }, []);

  const toggleAddPinMode = useCallback(() => {
    if (!isAuthenticated) { toast.error(t('globe.signInToPin')); return; }
    setAddPinMode(m => !m);
    setPickedLatLng(null);
  }, [isAuthenticated, t]);

  return (
    <div style={{
      height:          '100vh',
      background:      ts.pageBg,
      color:           ts.textPrimary,
      display:         'flex',
      flexDirection:   'column',
      position:        'relative',
      overflow:        'hidden',
    }}>
      <PageSEO
        title={t('globe.seoTitle')}
        description={t('globe.seoDescription')}
        canonical="/globe"
      />

      <NavBar />

      <h1 className="sr-only">{t('globe.h1', 'Breathe Together — Global Community Map')}</h1>

      {/* ── Top toolbar ─────────────────────────────────────────────────────── */}
      <div style={{
        position:       'relative',
        zIndex:         50,
        padding:        '10px 18px',
        display:        'flex',
        alignItems:     'center',
        gap:            12,
        flexWrap:       'wrap',
        background:     ts.navBg,
        backdropFilter: 'blur(12px)',
        borderBottom:   `1px solid ${ts.border}`,
      }}>
        {/* Page title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          <span style={{ fontSize: 18 }}>🌍</span>
          <span style={{ fontWeight: 700, fontSize: 15, color: ts.accent }}>{t('globe.brand')}</span>
          {stats && (
            <span style={{
              fontSize:     11,
              color:        ts.textMuted,
              fontWeight:   400,
              marginLeft:   2,
            }}>
              {stats.totalPins} spots · {stats.countries} countries
            </span>
          )}
        </div>

        {/* Filter pills */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <FilterBar active={filterTechnique} onChange={setFilterTechnique} />
        </div>

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
          <motion.button
            whileTap={{ scale: 0.94 }}
            onClick={() => switchView(!view3d)}
            aria-label={view3d ? 'Switch to 2D map' : 'Switch to 3D globe'}
            style={{
              padding:      '7px 14px',
              borderRadius: 20,
              border:       `1px solid ${ts.border}`,
              background:   ts.cardBg,
              color:        ts.textMuted,
              fontSize:     13,
              cursor:       'pointer',
              whiteSpace:   'nowrap',
              transition:   'all 0.18s',
            }}
          >
            {view3d ? '🗺 2D' : '🌐 3D'}
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.94 }}
            onClick={toggleAddPinMode}
            style={{
              padding:      '7px 14px',
              borderRadius: 20,
              border:       `1px solid ${addPinMode ? ts.accent : ts.accent + '59'}`,
              background:   addPinMode ? ts.accent + '2E' : ts.accent + '12',
              color:        addPinMode ? ts.accent : ts.accent + 'CC',
              fontSize:     13,
              fontWeight:   600,
              cursor:       'pointer',
              whiteSpace:   'nowrap',
              transition:   'all 0.18s',
            }}
          >
            {addPinMode ? `✕ ${t('globe.cancel')}` : `+ ${t('globe.pinSpot')}`}
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.94 }}
            onClick={() => setSidebarOpen(s => !s)}
            style={{
              padding:      '7px 14px',
              borderRadius: 20,
              border:       `1px solid ${ts.border}`,
              background:   sidebarOpen ? ts.cardBgHover : ts.cardBg,
              color:        ts.textMuted,
              fontSize:     13,
              cursor:       'pointer',
              whiteSpace:   'nowrap',
              transition:   'all 0.18s',
            }}
          >
            {sidebarOpen ? `→ ${t('globe.hide', 'Hide')}` : `☰ ${t('globe.spots', 'Spots')}`}
          </motion.button>
        </div>
      </div>

      {/* ── Add-pin instruction banner ───────────────────────────────────────── */}
      <AnimatePresence>
        {addPinMode && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            style={{
              position:      'relative',
              zIndex:        50,
              textAlign:     'center',
              padding:       '8px 16px',
              background:    ts.accent + '1F',
              borderBottom:  `1px solid ${ts.accent}40`,
              fontSize:      13,
              color:         ts.accent,
              fontWeight:    500,
            }}
          >
            {t('globe.clickToPin', 'Click anywhere on the map to pin your meditation spot 📍')}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Map + sidebar ────────────────────────────────────────────────────── */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>

        {/* Loading overlay */}
        <AnimatePresence>
          {loading && (
            <motion.div
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{
                position:       'absolute',
                inset:          0,
                zIndex:         200,
                background:     ts.pageBg,
                display:        'flex',
                flexDirection:  'column',
                alignItems:     'center',
                justifyContent: 'center',
                gap:            14,
              }}
            >
              <div style={{
                width:        48,
                height:       48,
                borderRadius: '50%',
                background:   `radial-gradient(circle at 35% 35%, ${ts.accentLight}, ${ts.accent})`,
                boxShadow:    `0 0 28px ${ts.accent}44`,
                animation:    'pageloader-pulse 1.6s ease-in-out infinite',
              }} />
              <div style={{ color: ts.textMuted, fontSize: 13 }}>{t('globe.loadingSpots')}</div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Map / Globe */}
        {view3d ? (
          <Globe3D
            pins={pins}
            filterTechnique={filterTechnique}
            selectedPin={selectedPin}
            addPinMode={addPinMode}
            onPinClick={handlePinClick}
            onMapClick={handleMapClick}
            onUnsupported={webglFallback}
          />
        ) : (
          <MapView
            pins={pins}
            filterTechnique={filterTechnique}
            selectedPin={selectedPin}
            addPinMode={addPinMode}
            onPinClick={handlePinClick}
            onMapClick={handleMapClick}
          />
        )}

        {/* Sidebar */}
        <SpotSidebar
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          pins={pins}
          selectedPin={selectedPin}
          stats={stats}
          currentUserId={user?._id ?? (user as { id?: string } | null)?.id}
          onPinClick={handlePinClick}
          onLike={handleLike}
          onDelete={handleDelete}
          onClosePin={() => setSelectedPin(null)}
        />
      </div>

      {/* ── Add-pin modal ────────────────────────────────────────────────────── */}
      <AddSpotModal
        open={!!pickedLatLng}
        lat={pickedLatLng?.lat ?? 0}
        lng={pickedLatLng?.lng ?? 0}
        onSubmit={handleAddPin}
        onCancel={cancelAddPin}
      />
    </div>
  );
}
