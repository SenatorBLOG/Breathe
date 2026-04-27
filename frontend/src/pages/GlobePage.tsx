import { useState, useEffect, useCallback, useContext, lazy, Suspense, type CSSProperties } from 'react';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import { useThemeStyles } from '../hooks/useThemeStyles';
import { useTheme } from '../contexts/ThemeContext';
import { AuthContext } from '../components/contexts/AuthContext';
import ThemeBackground from '../components/ThemeBackground';
import PageSEO from '../components/PageSEO';
import api from '../api';
import { toast } from 'sonner';
import MeditationGlobe from '../components/Globe/MeditationGlobe';
const CesiumGlobe = lazy(() => import('../components/Globe/CesiumGlobe'));
import GlobeControls from '../components/Globe/GlobeControls';
import type { GlobePin, GlobeStyle } from '../components/Globe/useGlobe';

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

  const [style,           setStyle]           = useState<GlobeStyle>('neon');
  const [pins,            setPins]            = useState<GlobePin[]>([]);
  const [stats,           setStats]           = useState<GlobeStats | null>(null);
  const [selectedPin,     setSelectedPin]     = useState<GlobePin | null>(null);
  const [filterTechnique, setFilterTechnique] = useState('all');
  const [addPinMode,      setAddPinMode]      = useState(false);
  const [sidebarOpen,     setSidebarOpen]     = useState(false);
  const [loading,         setLoading]         = useState(true);
  const [pickedLatLng,    setPickedLatLng]    = useState<{ lat: number; lng: number; country: string } | null>(null);

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

  const handleGlobeClick = useCallback((lat: number, lng: number, country: string) => {
    setPickedLatLng({ lat, lng, country });
    setAddPinMode(true);
    setSidebarOpen(true);
  }, []);

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
    title: string; note: string; technique: string; sessionLink: string; photoUrl: string;
  }) => {
    try {
      const res = await api.post<GlobePin>('/globe', data);
      setPins(prev => [res.data, ...prev]);
      setAddPinMode(false);
      setPickedLatLng(null);
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
    if (!next) setPickedLatLng(null);
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
      pickedLatLng={pickedLatLng}
    />
  );

  return (
    <div style={{ color: ts.textPrimary }}>
      <PageSEO
        title="Breathe Together — Global Breathing Community Map"
        description="See breathers around the world in real time. Join the global breathing community and connect with people practicing mindfulness and breathwork."
        canonical="/globe"
      />
      <ThemeBackground />
    {/* ── Globe viewport: exactly one screen height ──────────────────────── */}
    <div
      style={{
        height:        '100vh',
        display:       'flex',
        flexDirection: 'column',
        position:      'relative',
        overflow:      'hidden',
      }}
    >
      <NavBar />

      {/* ── Globe page header ──────────────────────────────────────────────── */}
      <div
        style={{
          padding:        '0 28px',
          height:         68,
          display:        'flex',
          alignItems:     'center',
          justifyContent: 'space-between',
          flexShrink:     0,
          background:     ts.navBg,
          backdropFilter: 'blur(14px)',
          borderBottom:   `1px solid ${ts.border}`,
          zIndex:         5,
          position:       'relative',
        }}
      >
        {/* Left: title + subtitle */}
        <div>
          <div style={{
            fontSize:      18,
            fontWeight:    800,
            color:         ts.textPrimary,
            letterSpacing: '-0.01em',
            lineHeight:    1.1,
          }}>
            🌍 Global Meditation Map
          </div>
          <div style={{ fontSize: 12, color: ts.textMuted, marginTop: 3 }}>
            Explore where the world finds its calm
          </div>
        </div>

        {/* Right: live stats */}
        {stats && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 19, fontWeight: 800, color: ts.textPrimary, lineHeight: 1 }}>
                {stats.totalPins.toLocaleString()}
              </div>
              <div style={{ fontSize: 10, color: ts.textMuted, marginTop: 2 }}>spots pinned</div>
            </div>
            <div style={{ width: 1, height: 30, background: ts.border }} />
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 19, fontWeight: 800, color: ts.textPrimary, lineHeight: 1 }}>
                {stats.countries}
              </div>
              <div style={{ fontSize: 10, color: ts.textMuted, marginTop: 2 }}>countries</div>
            </div>
          </div>
        )}
      </div>

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

          {style === 'cesium' ? (
            <Suspense fallback={
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: ts.textMuted, fontSize: 14 }}>
                Loading Cesium…
              </div>
            }>
              <CesiumGlobe
                pins={pins}
                filterTechnique={filterTechnique}
                onPinClick={handlePinClick}
                onGlobeClick={handleGlobeClick}
              />
            </Suspense>
          ) : (
            <MeditationGlobe
              pins={pins}
              theme={theme}
              style={style}
              filterTechnique={filterTechnique}
              addPinMode={addPinMode}
              onPinClick={handlePinClick}
              onGlobeClick={handleGlobeClick}
              onAddPinModeChange={setAddPinMode}
            />
          )}

          {/* Style-cycle FAB — always visible */}
          <button
            onClick={() => setStyle(s => s === 'neon' ? 'terrain' : s === 'terrain' ? 'wire' : s === 'wire' ? 'cesium' : 'neon')}
            title={`Map style: ${style}`}
            style={{
              position:       'absolute',
              bottom:         20,
              right:          20,
              zIndex:         20,
              background:     ts.cardBg,
              border:         `1px solid ${ts.borderHover}`,
              borderRadius:   '50%',
              width:          48,
              height:         48,
              fontSize:       20,
              cursor:         'pointer',
              boxShadow:      '0 4px 20px rgba(0,0,0,0.5)',
              backdropFilter: 'blur(10px)',
              display:        'flex',
              alignItems:     'center',
              justifyContent: 'center',
            }}
            aria-label="Cycle map style"
          >
            {style === 'neon' ? '✦' : style === 'terrain' ? '▲' : style === 'wire' ? '◻' : '🌐'}
          </button>

          {/* Mobile sidebar toggle — small, top-right of globe area */}
          <button
            onClick={() => setSidebarOpen(v => !v)}
            className="lg:hidden"
            style={{
              position:       'absolute',
              top:            12,
              right:          12,
              zIndex:         20,
              background:     ts.cardBg,
              border:         `1px solid ${ts.border}`,
              borderRadius:   '50%',
              width:          36,
              height:         36,
              fontSize:       16,
              cursor:         'pointer',
              backdropFilter: 'blur(10px)',
              display:        'flex',
              alignItems:     'center',
              justifyContent: 'center',
            }}
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

    </div>{/* end globe 100vh section */}

    {/* ── Below fold: content ────────────────────────────────────────── */}
    <div style={{ position: 'relative', zIndex: 1 }}>

      {/* Hero strip */}
      <div style={{
        padding: '80px 24px 60px',
        textAlign: 'center',
        background: ts.cardBg,
        borderBottom: `1px solid ${ts.border}`,
      }}>
        <div style={{ fontSize: 42, marginBottom: 12 }}>🌍</div>
        <h1 style={{ fontSize: 32, fontWeight: 800, color: ts.textPrimary, margin: '0 0 12px' }}>
          Breathe Together, Anywhere
        </h1>
        <p style={{ fontSize: 16, color: ts.textSecondary, maxWidth: 520, margin: '0 auto 28px', lineHeight: 1.6 }}>
          Meditators from around the world are dropping pins on their favourite spots.
          Find your calm, share it, and discover new places to breathe.
        </p>
        {/* Stats pills */}
        {stats && (
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 32 }}>
            {[
              { label: 'Spots pinned', value: stats.totalPins.toLocaleString() },
              { label: 'Countries', value: stats.countries },
              { label: 'Top city', value: stats.topCities[0]?._id ?? '—' },
            ].map(s => (
              <div key={s.label} style={{
                background: ts.cardBgHover,
                border: `1px solid ${ts.border}`,
                borderRadius: 12,
                padding: '10px 20px',
                minWidth: 100,
              }}>
                <div style={{ fontSize: 22, fontWeight: 800, color: ts.textPrimary }}>{s.value}</div>
                <div style={{ fontSize: 11, color: ts.textMuted, marginTop: 2 }}>{s.label}</div>
              </div>
            ))}
          </div>
        )}
        {!isAuthenticated && (
          <a
            href="/login"
            style={{
              display: 'inline-block',
              background: ts.accent,
              color: '#fff',
              borderRadius: 10,
              padding: '12px 28px',
              fontSize: 15,
              fontWeight: 700,
              textDecoration: 'none',
            }}
          >
            Sign in to drop your pin →
          </a>
        )}
      </div>

      {/* Recent spots wall */}
      <div style={{ padding: '48px 24px 64px', maxWidth: 1100, margin: '0 auto' }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: ts.textPrimary, marginBottom: 24 }}>
          Recent meditation spots
        </h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
          gap: 16,
        }}>
          {pins.slice(0, 12).map(pin => {
            const TECHNIQUE_COLORS: Record<string, string> = {
              'box': '#3A82F7', '4-7-8': '#7AC4FF', 'wim-hof': '#FF9A5C',
              'coherent': '#4AE8A0', 'belly': '#FFD97D', 'alternate': '#C084FC', 'other': '#94A3B8',
            };
            const TECHNIQUE_LABELS: Record<string, string> = {
              'box': 'Box', '4-7-8': '4-7-8', 'wim-hof': 'Wim Hof',
              'coherent': 'Coherent', 'belly': 'Belly', 'alternate': 'Alternate', 'other': 'Other',
            };
            const color = TECHNIQUE_COLORS[pin.technique] ?? '#94A3B8';
            return (
              <div
                key={pin._id}
                onClick={() => { handlePinClick(pin); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                style={{
                  background: ts.cardBg,
                  border: `1px solid ${ts.border}`,
                  borderRadius: 14,
                  overflow: 'hidden',
                  cursor: 'pointer',
                  transition: 'transform 0.15s',
                  willChange: 'transform',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-3px)';
                  (e.currentTarget as HTMLDivElement).style.boxShadow = '0 8px 32px rgba(0,0,0,0.3)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLDivElement).style.transform = '';
                  (e.currentTarget as HTMLDivElement).style.boxShadow = '';
                }}
              >
                {pin.photoUrl ? (
                  <img
                    src={pin.photoUrl}
                    alt={pin.title}
                    style={{ width: '100%', height: 140, objectFit: 'cover', display: 'block' }}
                  />
                ) : (
                  <div style={{
                    width: '100%', height: 140,
                    background: `linear-gradient(135deg, ${color}22, ${color}11)`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 36,
                  }}>
                    🧘
                  </div>
                )}
                <div style={{ padding: '12px 14px' }}>
                  <div style={{ fontSize: 11, color: ts.textMuted, marginBottom: 4 }}>
                    📍 {[pin.city, pin.country].filter(Boolean).join(', ') || 'Unknown location'}
                  </div>
                  <div style={{
                    fontSize: 14, fontWeight: 700, color: ts.textPrimary,
                    marginBottom: 8, overflow: 'hidden', display: '-webkit-box',
                    WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                  } as CSSProperties}>
                    {pin.title}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{
                      fontSize: 10, color, background: `${color}22`,
                      border: `1px solid ${color}44`, borderRadius: 20, padding: '2px 8px',
                    }}>
                      {TECHNIQUE_LABELS[pin.technique] ?? 'Other'}
                    </span>
                    <span style={{ fontSize: 11, color: ts.textMuted }}>
                      ❤️ {pin.likeCount}
                    </span>
                  </div>
                  <div style={{ fontSize: 11, color: ts.textMuted, marginTop: 6 }}>
                    by {pin.username}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        {pins.length === 0 && !loading && (
          <div style={{ textAlign: 'center', color: ts.textMuted, fontSize: 14, padding: '40px 0' }}>
            No spots yet — be the first to add yours!
          </div>
        )}
      </div>

      {/* How it works */}
      <div style={{
        background: ts.cardBg,
        borderTop: `1px solid ${ts.border}`,
        padding: '48px 24px',
      }}>
        <div style={{ maxWidth: 860, margin: '0 auto' }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: ts.textPrimary, textAlign: 'center', marginBottom: 36 }}>
            How it works
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 24 }}>
            {[
              { icon: '🌐', title: 'Spin the globe', desc: 'Explore meditation spots pinned by people from every corner of the world.' },
              { icon: '📍', title: 'Drop your pin', desc: 'Click anywhere on the globe to mark where you found your calm. Add a photo.' },
              { icon: '🤝', title: 'Connect', desc: 'Like spots, discover new techniques, and be part of a global breathing community.' },
            ].map(s => (
              <div key={s.title} style={{ textAlign: 'center', padding: '0 12px' }}>
                <div style={{ fontSize: 36, marginBottom: 12 }}>{s.icon}</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: ts.textPrimary, marginBottom: 8 }}>{s.title}</div>
                <div style={{ fontSize: 13, color: ts.textSecondary, lineHeight: 1.6 }}>{s.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>

    {/* ── Footer: below the fold, revealed on scroll ──────────────────────── */}
    <Footer />

    </div>/* end outer wrapper */
  );
}
