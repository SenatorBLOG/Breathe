/**
 * FilterBar — horizontal sticky technique-filter pill row.
 */
import { motion } from 'framer-motion';

const TECHNIQUES = [
  { value: 'all',       label: 'All'          },
  { value: 'box',       label: 'Box'          },
  { value: '4-7-8',     label: '4-7-8'        },
  { value: 'wim-hof',   label: 'Wim Hof'      },
  { value: 'coherent',  label: 'Coherent'     },
  { value: 'belly',     label: 'Belly'        },
  { value: 'alternate', label: 'Alt. Nostril' },
  { value: 'other',     label: 'Other'        },
];

const PIN_COLORS: Record<string, string> = {
  'all':       '#00d4ff',
  'box':       '#3A82F7',
  '4-7-8':     '#7AC4FF',
  'wim-hof':   '#FF9A5C',
  'coherent':  '#4AE8A0',
  'belly':     '#FFD97D',
  'alternate': '#C084FC',
  'other':     '#94A3B8',
};

interface Props {
  active:   string;
  onChange: (v: string) => void;
}

export default function FilterBar({ active, onChange }: Props) {
  return (
    <div
      style={{
        display:        'flex',
        gap:            6,
        overflowX:      'auto',
        padding:        '0 4px',
        scrollbarWidth: 'none',
      }}
    >
      {TECHNIQUES.map(t => {
        const isActive = active === t.value;
        const color    = PIN_COLORS[t.value];
        return (
          <motion.button
            key={t.value}
            whileTap={{ scale: 0.94 }}
            onClick={() => onChange(t.value)}
            style={{
              flexShrink:      0,
              padding:         '5px 13px',
              borderRadius:    20,
              border:          `1px solid ${isActive ? color : 'rgba(255,255,255,0.15)'}`,
              background:      isActive
                ? `${color}22`
                : 'rgba(255,255,255,0.05)',
              color:           isActive ? color : 'rgba(255,255,255,0.65)',
              fontSize:        12,
              fontWeight:      isActive ? 600 : 400,
              cursor:          'pointer',
              transition:      'all 0.18s',
              whiteSpace:      'nowrap',
              letterSpacing:   '0.02em',
            }}
          >
            {t.label}
          </motion.button>
        );
      })}
    </div>
  );
}
