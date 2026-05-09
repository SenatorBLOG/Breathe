/**
 * SpotSidebar — collapsible right-side panel.
 * Shows selected pin detail OR a recent-spots feed.
 */
import { AnimatePresence, motion } from 'framer-motion';
import type { GlobePin } from './useGlobe';
import SpotCard from './SpotCard';

interface GlobeStats {
  totalPins:          number;
  countries:          number;
  topCities:          { _id: string; count: number }[];
  techniqueBreakdown: Record<string, number>;
}

interface Props {
  open:           boolean;
  onClose:        () => void;
  pins:           GlobePin[];
  selectedPin:    GlobePin | null;
  stats:          GlobeStats | null;
  currentUserId?: string;
  onPinClick:     (pin: GlobePin) => void;
  onLike:         (id: string) => void;
  onDelete:       (id: string) => void;
  onClosePin:     () => void;
}

export default function SpotSidebar({
  open, onClose, pins, selectedPin, stats,
  currentUserId, onPinClick, onLike, onDelete, onClosePin,
}: Props) {
  const recentPins = [...pins].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  ).slice(0, 20);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', stiffness: 300, damping: 32 }}
          style={{
            position:      'absolute',
            top:           0,
            right:         0,
            bottom:        0,
            width:         'min(340px, 90vw)',
            background:    'rgba(8, 12, 30, 0.95)',
            backdropFilter: 'blur(16px)',
            borderLeft:    '1px solid rgba(0, 212, 255, 0.15)',
            display:       'flex',
            flexDirection: 'column',
            zIndex:        100,
            overflowY:     'auto',
          }}
        >
          {/* Header */}
          <div style={{
            display:        'flex',
            alignItems:     'center',
            justifyContent: 'space-between',
            padding:        '16px 18px 12px',
            borderBottom:   '1px solid rgba(255,255,255,0.06)',
            flexShrink:     0,
          }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#e8eaf0' }}>
              {selectedPin ? 'Meditation Spot' : 'Recent Spots'}
            </div>
            <button
              onClick={onClose}
              aria-label="Close sidebar"
              style={{
                background: 'none',
                border:     'none',
                color:      'rgba(255,255,255,0.45)',
                fontSize:   20,
                cursor:     'pointer',
                lineHeight: 1,
                padding:    0,
              }}
            >
              ×
            </button>
          </div>

          {/* Stats strip */}
          {stats && (
            <div style={{
              display:       'flex',
              gap:           0,
              borderBottom:  '1px solid rgba(255,255,255,0.06)',
              flexShrink:    0,
            }}>
              {[
                { label: 'Spots',     value: stats.totalPins },
                { label: 'Countries', value: stats.countries },
              ].map(s => (
                <div key={s.label} style={{
                  flex:           1,
                  textAlign:      'center',
                  padding:        '10px 0',
                  borderRight:    '1px solid rgba(255,255,255,0.06)',
                }}>
                  <div style={{ fontSize: 18, fontWeight: 700, color: '#00d4ff' }}>{s.value}</div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{s.label}</div>
                </div>
              ))}
            </div>
          )}

          {/* Content */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '14px 14px' }}>
            {selectedPin ? (
              <SpotCard
                pin={selectedPin}
                currentUserId={currentUserId}
                onLike={onLike}
                onDelete={onDelete}
                onClose={onClosePin}
              />
            ) : recentPins.length === 0 ? (
              <div style={{
                textAlign:  'center',
                color:      'rgba(255,255,255,0.35)',
                fontSize:   13,
                marginTop:  40,
                lineHeight: 1.7,
              }}>
                <div style={{ fontSize: 28, marginBottom: 10 }}>🌍</div>
                No spots yet.<br />Be the first to pin your practice!
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {recentPins.map(pin => (
                  <div
                    key={pin._id}
                    onClick={() => onPinClick(pin)}
                    style={{
                      background:   'rgba(255,255,255,0.04)',
                      border:       '1px solid rgba(255,255,255,0.09)',
                      borderRadius: 10,
                      padding:      '10px 12px',
                      cursor:       'pointer',
                      transition:   'background 0.15s',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(0,212,255,0.07)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.04)')}
                  >
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#e8eaf0', marginBottom: 2 }}>
                      {pin.title || 'Meditation Spot'}
                    </div>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>
                      @{pin.username} · {[pin.city, pin.country].filter(Boolean).join(', ')}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
