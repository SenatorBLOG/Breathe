import React from 'react';
import { useThemeStyles } from '../../hooks/useThemeStyles';

// ─── Base skeleton block ──────────────────────────────────────────────────────
export function Skeleton({ className = '', style = {} }: { className?: string; style?: React.CSSProperties }) {
  const ts = useThemeStyles();
  return (
    <div
      className={`rounded-xl animate-pulse ${className}`}
      style={{ backgroundColor: ts.cardBg, ...style }}
    />
  );
}

// ─── Post card skeleton ───────────────────────────────────────────────────────
export function PostSkeleton() {
  const ts = useThemeStyles();
  return (
    <div className="flex flex-col gap-3 p-4 rounded-2xl border"
      style={{ background: ts.cardBg, borderColor: ts.border }}>
      <div className="flex items-center gap-2.5">
        <Skeleton className="w-8 h-8 rounded-full flex-shrink-0" style={{ opacity: 0.6 }} />
        <div className="flex flex-col gap-1.5 flex-1">
          <Skeleton className="h-2.5 w-24 rounded-full" style={{ opacity: 0.5 }} />
          <Skeleton className="h-2 w-14 rounded-full" style={{ opacity: 0.3 }} />
        </div>
        <Skeleton className="h-4 w-16 rounded-full" style={{ opacity: 0.25 }} />
      </div>
      <div className="flex flex-col gap-2 pt-1">
        <Skeleton className="h-2.5 w-full rounded-full" style={{ opacity: 0.35 }} />
        <Skeleton className="h-2.5 w-5/6 rounded-full" style={{ opacity: 0.25 }} />
        <Skeleton className="h-2.5 w-2/3 rounded-full" style={{ opacity: 0.18 }} />
      </div>
      <div className="flex gap-1.5 pt-0.5">
        <Skeleton className="h-4 w-12 rounded-full" style={{ opacity: 0.2 }} />
        <Skeleton className="h-4 w-16 rounded-full" style={{ opacity: 0.15 }} />
      </div>
      <div className="flex gap-4 pt-1 border-t" style={{ borderColor: ts.border }}>
        <Skeleton className="h-3 w-8 rounded-full" style={{ opacity: 0.2 }} />
        <Skeleton className="h-3 w-16 rounded-full" style={{ opacity: 0.15 }} />
      </div>
    </div>
  );
}

// ─── Session row skeleton ─────────────────────────────────────────────────────
export function SessionSkeleton() {
  const ts = useThemeStyles();
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl border"
      style={{ background: ts.cardBg, borderColor: ts.border }}>
      <Skeleton className="w-9 h-9 rounded-xl flex-shrink-0" style={{ opacity: 0.5 }} />
      <div className="flex flex-col gap-1.5 flex-1">
        <Skeleton className="h-2.5 w-32 rounded-full" style={{ opacity: 0.45 }} />
        <Skeleton className="h-2 w-20 rounded-full" style={{ opacity: 0.28 }} />
      </div>
      <Skeleton className="h-3 w-10 rounded-full" style={{ opacity: 0.25 }} />
    </div>
  );
}

// ─── Stat card skeleton ───────────────────────────────────────────────────────
export function StatCardSkeleton() {
  const ts = useThemeStyles();
  return (
    <div className="flex flex-col items-center gap-2 p-4 rounded-2xl border"
      style={{ background: ts.cardBg, borderColor: ts.border }}>
      <Skeleton className="h-7 w-14 rounded-lg" style={{ opacity: 0.5 }} />
      <Skeleton className="h-2 w-16 rounded-full" style={{ opacity: 0.3 }} />
    </div>
  );
}

// ─── Generic list of skeletons fading out ────────────────────────────────────
export function ListSkeleton({ count = 4, Item }: { count?: number; Item: React.ComponentType }) {
  return (
    <div className="flex flex-col gap-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} style={{ opacity: Math.max(1 - i * 0.18, 0.3) }}>
          <Item />
        </div>
      ))}
    </div>
  );
}
