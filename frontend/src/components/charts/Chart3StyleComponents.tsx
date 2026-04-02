// src/components/charts/Chart3StyleComponents.tsx
import React, { useEffect, useRef, useState } from 'react';
import { useThemeStyles } from "../../hooks/useThemeStyles";

// ─── Контейнер с поддержкой тем ───────────────────────────────────────────────
interface ContainerProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  className?: string;
  action?: React.ReactNode;
}

export const Chart3BlueContainer = ({
  children,
  title,
  subtitle,
  className = '',
  action,
}: ContainerProps) => {
  const ts = useThemeStyles();
  
  return (
    <div
      className={`flex flex-col gap-3 rounded-2xl border p-5 transition-all duration-500 ${className}`}
      style={{
        background: ts.cardBg,
        borderColor: ts.border,
        boxShadow: `0 20px 50px rgba(0,0,0,0.15), inset 0 1px 0 ${ts.border}20`,
        backdropFilter: 'blur(10px)',
      }}
    >
      {(title || subtitle || action) && (
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            {subtitle && (
              <p className="t-label uppercase tracking-[0.2em] font-bold opacity-60 mb-0.5" 
                 style={{ color: ts.textDim }}>
                {subtitle}
              </p>
            )}
            {title && (
              <h3 className="t-body font-bold truncate" style={{ color: ts.textPrimary }}>
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
};

// ─── Адаптивный Тултип ────────────────────────────────────────────────────────
export const Chart3Tooltip = ({ active, payload, label, unit = 'min' }: any) => {
  const ts = useThemeStyles();
  if (!active || !payload?.length) return null;
  
  return (
    <div
      className="rounded-xl px-3 py-2 t-label border shadow-2xl backdrop-blur-md"
      style={{
        background: `${ts.navBg}EE`,
        borderColor: ts.border,
        color: ts.textPrimary,
      }}
    >
      {label && <p className="mb-1 font-bold opacity-50" style={{ color: ts.textDim }}>{label}</p>}
      <p style={{ color: ts.accent }} className="font-bold tabular-nums">
        {payload[0].value} {unit}
      </p>
    </div>
  );
};

// ─── Выпадающий список (Dropdown) ─────────────────────────────────────────────
export const Chart3Dropdown = ({ value, onChange, options, className = '' }: any) => {
  const ts = useThemeStyles();
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
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg t-label font-bold uppercase tracking-wider border transition-all active:scale-95"
        style={{
          background: open ? `${ts.accent}15` : 'transparent',
          borderColor: open ? ts.accent : ts.border,
          color: open ? ts.textPrimary : ts.textDim,
        }}
      >
        {value}
        <svg
          width="8" height="5" viewBox="0 0 8 5" fill="none"
          className="transition-transform duration-300"
          style={{ transform: open ? 'rotate(180deg)' : 'none', color: ts.accent }}
        >
          <path d="M1 1l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>

      {open && (
        <div
          className="absolute right-0 mt-2 min-w-[120px] rounded-xl overflow-hidden z-50 border shadow-2xl animate-in fade-in zoom-in-95 duration-200"
          style={{
            background: ts.cardBg,
            borderColor: ts.border,
            backdropFilter: 'blur(20px)',
          }}
        >
          {options.map((opt: string) => (
            <button
              key={opt}
              onClick={() => { onChange(opt); setOpen(false); }}
              className="w-full text-left px-4 py-2.5 t-label font-bold uppercase tracking-widest transition-colors border-b last:border-none"
              style={{
                color: opt === value ? ts.accent : ts.textSecondary,
                backgroundColor: opt === value ? `${ts.accent}10` : 'transparent',
                borderColor: `${ts.border}40`,
              }}
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Универсальный MiniBar ────────────────────────────────────────────────────
export const Chart3MiniBar = ({
  value, max = 10, color
}: { value: number; max?: number; color?: string }) => {
  const ts = useThemeStyles();
  const barColor = color || ts.accent;

  return (
    <div className="flex items-center gap-2 flex-1 group">
      <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: `${ts.border}40` }}>
        <div
          className="h-full rounded-full transition-all duration-700 ease-out shadow-sm"
          style={{ 
            width: `${(value / max) * 100}%`, 
            background: barColor,
            boxShadow: `0 0 8px ${barColor}40`
          }}
        />
      </div>
      <span className="t-label font-bold tabular-nums w-5 text-right transition-colors" 
            style={{ color: barColor }}>
        {value}
      </span>
    </div>
  );
};