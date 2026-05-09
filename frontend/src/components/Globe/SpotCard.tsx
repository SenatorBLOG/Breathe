/**
 * SpotCard — sidebar card for a single meditation pin.
 * Shows pin details, like button, and owner delete.
 */
import { motion } from 'framer-motion';
import type { GlobePin } from './useGlobe';

const PIN_COLORS: Record<string, string> = {
  'box':       '#3A82F7',
  '4-7-8':     '#7AC4FF',
  'wim-hof':   '#FF9A5C',
  'coherent':  '#4AE8A0',
  'belly':     '#FFD97D',
  'alternate': '#C084FC',
  'other':     '#94A3B8',
};
function pinColor(t: string) { return PIN_COLORS[t.toLowerCase()] ?? PIN_COLORS.other; }

interface Props {
  pin:           GlobePin;
  currentUserId?: string;
  onLike:        (id: string) => void;
  onDelete:      (id: string) => void;
  onClose:       () => void;
}

export default function SpotCard({ pin, currentUserId, onLike, onDelete, onClose }: Props) {
  const color      = pinColor(pin.technique);
  const isOwner    = !!(currentUserId && (pin.userId === currentUserId));
  const dateString = new Date(pin.createdAt).toLocaleDateString(undefined, {
    month: 'short', day: 'numeric', year: 'numeric',
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      transition={{ duration: 0.22 }}
      style={{
        background:   'rgba(15, 22, 45, 0.92)',
        border:       `1px solid ${color}44`,
        borderRadius: 14,
        padding:      '16px 18px',
        color:        '#e8eaf0',
        position:     'relative',
      }}
    >
      {/* Close */}
      <button
        onClick={onClose}
        aria-label="Close spot"
        style={{
          position:   'absolute',
          top:        10,
          right:      10,
          background: 'none',
          border:     'none',
          color:      'rgba(255,255,255,0.4)',
          fontSize:   18,
          cursor:     'pointer',
          lineHeight: 1,
        }}
      >×</button>

      {/* Technique pill */}
      <span style={{
        display:      'inline-block',
        padding:      '2px 10px',
        borderRadius: 20,
        background:   `${color}22`,
        color,
        fontSize:     11,
        fontWeight:   600,
        letterSpacing: '0.06em',
        textTransform: 'uppercase',
        marginBottom:  8,
      }}>
        {pin.technique}
      </span>

      {/* Title */}
      <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 4, lineHeight: 1.3 }}>
        {pin.title || 'Meditation Spot'}
      </div>

      {/* Location */}
      <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginBottom: 10 }}>
        📍 {[pin.city, pin.country].filter(Boolean).join(', ')}
      </div>

      {/* Note */}
      {pin.note && (
        <div style={{
          fontSize:     13,
          color:        'rgba(255,255,255,0.72)',
          lineHeight:   1.55,
          marginBottom: 12,
          fontStyle:    'italic',
        }}>
          "{pin.note}"
        </div>
      )}

      {/* Photo */}
      {pin.photoUrl && (
        <img
          src={pin.photoUrl}
          alt="Meditation spot"
          style={{
            width:        '100%',
            borderRadius: 8,
            marginBottom: 12,
            objectFit:    'cover',
            maxHeight:    140,
          }}
        />
      )}

      {/* Footer row */}
      <div style={{
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'space-between',
        marginTop:      4,
      }}>
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>
          @{pin.username} · {dateString}
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button
            onClick={() => onLike(pin._id)}
            title="Like"
            style={{
              background:   'none',
              border:       '1px solid rgba(255,255,255,0.15)',
              borderRadius: 20,
              color:        'rgba(255,255,255,0.7)',
              fontSize:     12,
              padding:      '3px 10px',
              cursor:       'pointer',
              display:      'flex',
              alignItems:   'center',
              gap:          4,
            }}
          >
            ❤️ {pin.likeCount}
          </button>
          {isOwner && (
            <button
              onClick={() => onDelete(pin._id)}
              title="Delete"
              style={{
                background:   'none',
                border:       '1px solid rgba(255,80,80,0.3)',
                borderRadius: 20,
                color:        'rgba(255,100,100,0.8)',
                fontSize:     12,
                padding:      '3px 10px',
                cursor:       'pointer',
              }}
            >
              🗑
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
