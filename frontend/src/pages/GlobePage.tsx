import React, { useState, useEffect, useCallback, useContext } from 'react';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import { useThemeStyles } from '../hooks/useThemeStyles';
import { useTheme } from '../contexts/ThemeContext';
import { AuthContext } from '../components/contexts/AuthContext';
import ThemeBackground from '../components/ThemeBackground';
import api from '../api';
import { toast } from 'sonner';
import MeditationGlobe from '../components/Globe/MeditationGlobe';
import GlobeControls from '../components/Globe/GlobeControls';
import type { GlobePin } from '../components/Globe/useGlobe';

interface GlobeStats {
  totalPins:          number;
  countries:          number;
  topCities:          { _id: string; count: number }[];
  techniqueBreakdown: Record<string, number>;
}

export default function GlobePage() {
  const ts                  = useThemeStyles();
  const { theme }           = useTheme();
  const { isAuthenticated, user } = useContext(AuthContext);

  const [pins,            setPins]            = useState<GlobePin[]>([]);
  const [stats,           setStats]           = useState<GlobeStats | null>(null);
  const [selectedPin,     setSelectedPin]     = useState<GlobePin | null>(null);
  const [filterTechnique, setFilterTechnique] = useState('all');
  const [addPinMode,      setAddPinMode]      = useState(false);
  const [sidebarOpen,     setSidebarOpen]     = useState(false);
  const [loading,         setLoading]         = useState(true);

  // ── Data fetch ───────────────────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      try {
        const [pinsRes, statsRes] = await Promise.all([
          api.get<GlobePin[]>('/globe'),
          api.get<GlobeStats>('/globe/stats'),
        ]);
        if (!cancelled) {
          setPins(pinsRes.data);
          setStats(statsRes.data);
        }
      } catch (err) {
        console.error('Failed to load globe data:', err);
        if (!cancelled) {
          toast.error('Failed to load globe data.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchData();
    return () => { cancelled = true; };
  }, []);

  // ── Handlers ─────────────────────────────────────────────────────────────────
  const handlePinClick = useCallback((pin: GlobePin | null) => {
    setSelectedPin(pin);
    if (pin) setSidebarOpen(true);
  }, []);

  const handleGlobeClick = useCallback(() => {}, []);

  const handleLike = useCallback(async (id: string) => {
    try {
      const res = await api.post<{ likeCount: number }>(`/globe/${id}/like`);
      setPins(prev =>
        prev.map(p => p._id === id ? { ...p, likeCount: res.data.likeCount } : p)
      );
      if (selectedPin?._id === id) {
        setSelectedPin(prev => prev ? { ...prev, likeCount: res.data.likeCount } : null);
      }
    } catch {
      toast.error('Failed to like pin.');
    }
  }, [selectedPin]);

  const handleDelete = useCallback(async (id: string) => {
    try {
      await api.delete(`/globe/${id}`);
      setPins(prev => prev.filter(p => p._id !== id));
      setSelectedPin(null);
      setStats(prev => prev ? { ...prev, totalPins: Math.max(0, prev.totalPins - 1) } : prev);
      toast.success('Pin deleted.');
    } catch {
      toast.error('Failed to delete pin.');
    }
  }, []);

  const handleAddPin = useCallback(async (data: {
    lat: number; lng: number; city: string; country: string;
    title: string; note: string; technique: string; sessionLink: string;
  }) => {
    try {
      const res = await api.post<GlobePin>('/globe', data);
      setPins(prev => [res.data, ...prev]);
      setAddPinMode(false);
      setStats(prev => prev ? { ...prev, totalPins: prev.totalPins + 1 } : prev);
      toast.success('Your meditation spot has been pinned!');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error
        ?? 'Failed to add pin.';
      toast.error(msg);
    }
  }, []);

  const handleToggleAddPin = useCallback(() => {
    const next = !addPinMode;
    setAddPinMode(next);
    if (next) setSidebarOpen(true);
  }, [addPinMode]);

  const handleClosePin = useCallback(() => {
    setSelectedPin(null);
  }, []);

  // ── Sidebar content ─────────────────────────────────────────────────────────
  const controls = (
    <GlobeControls
      selectedPin={selectedPin}
      stats={stats}
      filterTechnique={filterTechnique}
      onFilterChange={setFilterTechnique}
      addPinMode={addPinMode}
      onToggleAddPin={handleToggleAddPin}
      onLike={handleLike}
      onDelete={handleDelete}
      onAddPin={handleAddPin}
      onClose={handleClosePin}
      isAuthenticated={isAuthenticated}
      currentUserId={user?._id ?? user?.id}
    />
  );

  return (
    <div
      style={{
        height:      '100vh',
        display:     'flex',
        flexDirection: 'column',
        color:       ts.textPrimary,
        position:    'relative',
        overflow:    'hidden',
      }}
    >
      <ThemeBackground />
      <NavBar />

      {/* ── Main content ───────────────────────────────────────────────────── */}
      <main
        style={{
          flex:     1,
          minHeight: 0,
          display:  'flex',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        {/* ── Globe canvas area ─────────────────────────────────────────────── */}
        <div
          style={{
            flex:     1,
            minWidth:  0,
            position: 'relative',
          }}
        >
          {loading && (
            <div
              style={{
                position:      'absolute',
                inset:         0,
                display:       'flex',
                alignItems:    'center',
                justifyContent: 'center',
                zIndex:        10,
                color:         ts.textMuted,
                fontSize:      14,
              }}
            >
              Loading globe…
            </div>
          )}

          <MeditationGlobe
            pins={pins}
            theme={theme}
            filterTechnique={filterTechnique}
            addPinMode={addPinMode}
            onPinClick={handlePinClick}
            onGlobeClick={handleGlobeClick}
            onAddPinModeChange={setAddPinMode}
          />

          {/* Mobile: floating sidebar toggle */}
          <button
            onClick={() => setSidebarOpen(v => !v)}
            style={{
              position:     'absolute',
              bottom:       20,
              right:        20,
              zIndex:       20,
              background:   ts.accent,
              border:       'none',
              borderRadius: '50%',
              width:        48,
              height:       48,
              fontSize:     20,
              cursor:       'pointer',
              boxShadow:    '0 4px 16px rgba(0,0,0,0.4)',
              display:      'flex',
              alignItems:   'center',
              justifyContent: 'center',
            }}
            className="lg:hidden"
            aria-label="Toggle sidebar"
          >
            🗺️
          </button>
        </div>

        {/* ── Desktop sidebar ───────────────────────────────────────────────── */}
        <div
          className="hidden lg:flex"
          style={{
            width:      320,
            flexShrink: 0,
            borderLeft: `1px solid ${ts.border}`,
            overflowY:  'auto',
            background: ts.cardBg,
          }}
        >
          {controls}
        </div>

        {/* ── Mobile drawer ─────────────────────────────────────────────────── */}
        {sidebarOpen && (
          <>
            {/* Backdrop */}
            <div
              onClick={() => setSidebarOpen(false)}
              style={{
                position:   'fixed',
                inset:      0,
                background: 'rgba(0,0,0,0.5)',
                zIndex:     30,
              }}
              className="lg:hidden"
            />

            {/* Drawer */}
            <div
              className="lg:hidden"
              style={{
                position:    'fixed',
                bottom:      0,
                left:        0,
                right:       0,
                maxHeight:   '75vh',
                overflowY:   'auto',
                background:  ts.cardBg,
                borderTop:   `1px solid ${ts.border}`,
                borderRadius: '16px 16px 0 0',
                zIndex:      40,
                paddingBottom: 24,
              }}
            >
              {/* Drag handle */}
              <div
                style={{
                  width:        40,
                  height:       4,
                  background:   ts.border,
                  borderRadius: 2,
                  margin:       '10px auto 6px',
                }}
              />
              {controls}
            </div>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
