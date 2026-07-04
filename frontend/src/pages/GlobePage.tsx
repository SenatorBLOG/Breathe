/**
 * GlobePage — "Breathe Together" global meditation community map.
 * Uses Leaflet.js (CartoDB dark basemap, no API key required).
 */
import { useState, useEffect, useCallback, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import NavBar from '../components/NavBar';
import PageSEO from '../components/PageSEO';
import { AuthContext } from '../components/contexts/AuthContext';
import api from '../api';
import { toast } from 'sonner';
import type { GlobePin } from '../components/Globe/types';
import MapView    from '../components/Globe/MapView';
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
  const { isAuthenticated, user } = useContext(AuthContext);

  const [pins,            setPins]            = useState<GlobePin[]>([]);
  const [stats,           setStats]           = useState<GlobeStats | null>(null);
  const [filterTechnique, setFilterTechnique] = useState('all');
  const [selectedPin,     setSelectedPin]     = useState<GlobePin | null>(null);
  const [sidebarOpen,     setSidebarOpen]     = useState(false);
  const [addPinMode,      setAddPinMode]      = useState(false);
  const [pickedLatLng,    setPickedLatLng]    = useState<{ lat: number; lng: number } | null>(null);
  const [loading,         setLoading]         = useState(true);

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
      background:      '#080c1e',
      color:           '#e8eaf0',
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
        background:     'rgba(8,12,30,0.85)',
        backdropFilter: 'blur(12px)',
        borderBottom:   '1px solid rgba(255,255,255,0.06)',
      }}>
        {/* Page title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          <span style={{ fontSize: 18 }}>🌍</span>
          <span style={{ fontWeight: 700, fontSize: 15, color: '#00d4ff' }}>{t('globe.brand')}</span>
          {stats && (
            <span style={{
              fontSize:     11,
              color:        'rgba(255,255,255,0.38)',
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
            onClick={toggleAddPinMode}
            style={{
              padding:      '7px 14px',
              borderRadius: 20,
              border:       `1px solid ${addPinMode ? '#00d4ff' : 'rgba(0,212,255,0.35)'}`,
              background:   addPinMode ? 'rgba(0,212,255,0.18)' : 'rgba(0,212,255,0.07)',
              color:        addPinMode ? '#00d4ff' : 'rgba(0,212,255,0.7)',
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
              border:       '1px solid rgba(255,255,255,0.15)',
              background:   sidebarOpen ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.05)',
              color:        'rgba(255,255,255,0.7)',
              fontSize:     13,
              cursor:       'pointer',
              whiteSpace:   'nowrap',
              transition:   'all 0.18s',
            }}
          >
            {sidebarOpen ? '→ Hide' : '☰ Spots'}
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
              background:    'rgba(0,212,255,0.12)',
              borderBottom:  '1px solid rgba(0,212,255,0.25)',
              fontSize:      13,
              color:         '#00d4ff',
              fontWeight:    500,
            }}
          >
            Click anywhere on the map to pin your meditation spot 📍
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
                background:     '#080c1e',
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
                background:   'radial-gradient(circle at 35% 35%, #00d4ff, #0070aa)',
                boxShadow:    '0 0 28px #00d4ff44',
                animation:    'pageloader-pulse 1.6s ease-in-out infinite',
              }} />
              <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>{t('globe.loadingSpots')}</div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Map */}
        <MapView
          pins={pins}
          filterTechnique={filterTechnique}
          selectedPin={selectedPin}
          addPinMode={addPinMode}
          onPinClick={handlePinClick}
          onMapClick={handleMapClick}
        />

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
