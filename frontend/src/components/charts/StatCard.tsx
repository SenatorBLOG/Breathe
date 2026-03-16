// src/components/charts/StatCard.tsx
import React from 'react';

interface StatCardProps {
  value: string;
  subValue?: React.ReactNode;
  label: string;
  className?: string;
  children?: React.ReactNode;
  accent?: string; // optional glow color override
}

const StatCard = ({ value, subValue, label, className = '', children, accent = 'rgba(74,158,255,0.12)' }: StatCardProps) => {
  return (
    <div
      className={`relative flex flex-col gap-3 rounded-2xl p-4 overflow-hidden transition-all duration-300 hover:scale-[1.015] hover:shadow-[0_0_28px_rgba(74,158,255,0.1)] ${className}`}
      style={{
        background: 'linear-gradient(145deg, rgba(11,22,40,0.85) 0%, rgba(6,12,26,0.9) 100%)',
        border: '1px solid rgba(30,51,88,0.55)',
        backdropFilter: 'blur(10px)',
        boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
      }}
    >
      {/* Top glow accent line */}
      <div className="absolute top-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-[#4A9EFF]/25 to-transparent" />

      {/* Corner glow */}
      <div className="absolute -top-6 -right-6 w-20 h-20 rounded-full pointer-events-none"
        style={{ background: accent, filter: 'blur(20px)' }} />

      {/* Main value */}
      <div>
        <p className="text-[#B8D9FF] text-xl font-semibold leading-none tabular-nums">{value}</p>
        {subValue != null && (
          <div className="mt-1 text-[10px] font-medium">{subValue}</div>
        )}
        <p className="mt-1.5 text-[#3D6080] text-[10px] uppercase tracking-widest leading-tight">{label}</p>
      </div>

      {/* Chart / content slot */}
      {children && (
        <div className="h-[100px]">{children}</div>
      )}

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-6 pointer-events-none"
        style={{ background: 'linear-gradient(to top, rgba(6,12,26,0.6), transparent)' }} />
    </div>
  );
};

export default StatCard;