// src/components/charts/Chart3StyleComponents.tsx
import React, { useEffect, useRef, useState } from 'react';

// ─── Color palette — matches full app design system ───────────────────────────
export const Chart3Colors = {
  primary:       '#3A82F7',
  primaryDark:   '#1A5FCC',
  accent:        '#7AC4FF',
  accentDim:     '#4A9EFF',
  positive:      '#4AE8A0',
  negative:      '#FF8A8A',
  textPrimary:   '#B8D9FF',
  textSecondary: '#4A7AAA',
  textMuted:     '#2A4060',
  border:        'rgba(30,51,88,0.5)',
  borderHover:   'rgba(42,84,153,0.6)',
  bg:            'rgba(11,22,40,0.7)',
  gridLine:      'rgba(30,51,88,0.4)',
  hover:         '#7AC4FF',
  shadow:        '0 0 60px rgba(74,158,255,0.06), 0 20px 50px rgba(0,0,0,0.5)',
};

// ─── Container ────────────────────────────────────────────────────────────────
interface ContainerProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  className?: string;
  action?: React.ReactNode; // slot for dropdown / toggle on the right
}

export const Chart3BlueContainer = ({
  children,
  title,
  subtitle,
  className = '',
  action,
}: ContainerProps) => (
  <div
    className={`flex flex-col gap-3 rounded-2xl border p-5 ${className}`}
    style={{
      background: Chart3Colors.bg,
      border: `1px solid ${Chart3Colors.border}`,
      boxShadow: Chart3Colors.shadow,
      backdropFilter: 'blur(8px)',
    }}
  >
    {(title || subtitle || action) && (
      <div className="flex items-start justify-between gap-3">
        <div>
          {subtitle && (
            <p className="text-[10px] uppercase tracking-[0.25em]" style={{ color: Chart3Colors.textMuted }}>
              {subtitle}
            </p>
          )}
          {title && (
            <h3 className="text-sm font-medium mt-0.5" style={{ color: Chart3Colors.textPrimary }}>
              {title}
            </h3>
          )}
        </div>
        {action && <div className="flex-shrink-0">{action}</div>}
      </div>
    )}
    <div className="w-full min-w-0">{children}</div>
  </div>
);

// ─── Tooltip ──────────────────────────────────────────────────────────────────
interface TooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
  unit?: string;
}

export const Chart3Tooltip = ({ active, payload, label, unit = 'min' }: TooltipProps) => {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="rounded-xl px-3 py-2 text-xs border"
      style={{
        background: 'rgba(6,12,26,0.96)',
        border: `1px solid ${Chart3Colors.borderHover}`,
        backdropFilter: 'blur(12px)',
        boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
      }}
    >
      {label && <p className="mb-1" style={{ color: Chart3Colors.textMuted }}>{label}</p>}
      <p style={{ color: Chart3Colors.accent }} className="font-medium">
        {payload[0].value} {unit}
      </p>
    </div>
  );
};

// ─── Dropdown ─────────────────────────────────────────────────────────────────
interface DropdownProps {
  value: string;
  onChange: (v: string) => void;
  options: string[];
  className?: string;
}

export const Chart3Dropdown = ({ value, onChange, options, className = '' }: DropdownProps) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-[10px] uppercase tracking-widest border transition-all"
        style={{
          background: open ? 'rgba(13,27,51,0.9)' : 'transparent',
          border: `1px solid ${open ? Chart3Colors.borderHover : Chart3Colors.border}`,
          color: Chart3Colors.accent,
        }}
      >
        {value}
        <svg
          width="8" height="5" viewBox="0 0 8 5" fill="none"
          className="transition-transform duration-200"
          style={{ transform: open ? 'rotate(180deg)' : 'none' }}
        >
          <path d="M1 1l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>

      {open && (
        <div
          className="absolute right-0 mt-1.5 min-w-full rounded-xl overflow-hidden z-50 border"
          style={{
            background: 'rgba(6,12,26,0.97)',
            border: `1px solid ${Chart3Colors.borderHover}`,
            backdropFilter: 'blur(16px)',
            boxShadow: '0 12px 32px rgba(0,0,0,0.6)',
          }}
        >
          {options.map(opt => (
            <button
              key={opt}
              onClick={() => { onChange(opt); setOpen(false); }}
              className="w-full text-left px-4 py-2 text-[10px] uppercase tracking-widest transition-colors"
              style={{
                color: opt === value ? Chart3Colors.accent : Chart3Colors.textMuted,
                background: opt === value ? 'rgba(42,84,153,0.2)' : 'transparent',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(30,51,88,0.5)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = opt === value ? 'rgba(42,84,153,0.2)' : 'transparent'; }}
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Mini bar (reusable score visualiser) ─────────────────────────────────────
export const Chart3MiniBar = ({
  value, max = 10, color = Chart3Colors.primary,
}: { value: number; max?: number; color?: string }) => (
  <div className="flex items-center gap-2 flex-1">
    <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ background: 'rgba(30,51,88,0.4)' }}>
      <div
        className="h-full rounded-full"
        style={{ width: `${(value / max) * 100}%`, background: color, transition: 'width 0.4s ease' }}
      />
    </div>
    <span className="text-[10px] tabular-nums w-5 text-right" style={{ color }}>{value}</span>
  </div>
);