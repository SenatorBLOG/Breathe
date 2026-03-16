// src/components/charts/MoodTrackingGrid.tsx
import React, { useEffect, useMemo, useState } from 'react';
import api from '../../api';

interface Session {
  moodBefore?: number;
  moodAfter?: number;
  mood?: number;
  sessionDate?: string;
}

// ─── Mini mood bar ─────────────────────────────────────────────────────────────
function MoodBar({ pct, color, bg }: { pct: number; color: string; bg: string }) {
  return (
    <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(30,51,88,0.4)' }}>
      <div className="h-full rounded-full transition-all duration-700"
        style={{ width: `${pct}%`, background: bg,
          boxShadow: pct > 20 ? `0 0 6px ${color}55` : 'none' }} />
    </div>
  );
}

// ─── Stat row inside card ─────────────────────────────────────────────────────
function StatRow({ label, pct, count, color, bg }: {
  label: string; pct: number; count: number; color: string; bg: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[9px] w-14 flex-shrink-0 uppercase tracking-wide" style={{ color }}>{label}</span>
      <MoodBar pct={pct} color={color} bg={bg} />
      <span className="text-[9px] tabular-nums w-7 text-right flex-shrink-0" style={{ color }}>{pct}%</span>
      <span className="text-[9px] text-[#1E3358] w-5 flex-shrink-0">({count})</span>
    </div>
  );
}

// ─── Card shell ───────────────────────────────────────────────────────────────
function InfoCard({ title, value, sub, children, accent = 'rgba(74,158,255,0.08)' }: {
  title: string; value: string; sub?: string;
  children?: React.ReactNode; accent?: string;
}) {
  return (
    <div className="relative flex flex-col gap-2 p-4 rounded-2xl overflow-hidden transition-all duration-300 hover:scale-[1.015]"
      style={{
        background: 'linear-gradient(145deg,rgba(11,22,40,0.85),rgba(6,12,26,0.9))',
        border: '1px solid rgba(30,51,88,0.55)',
        backdropFilter: 'blur(10px)',
        boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
      }}>
      {/* Top glow line */}
      <div className="absolute top-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-[#4A9EFF]/20 to-transparent" />
      {/* Corner glow */}
      <div className="absolute -top-6 -right-6 w-16 h-16 rounded-full pointer-events-none"
        style={{ background: accent, filter: 'blur(18px)' }} />

      <div>
        <p className="text-[#B8D9FF] text-xl font-semibold tabular-nums leading-none">{value}</p>
        {sub && <p className="text-[#2A5499] text-[10px] mt-0.5 tabular-nums">{sub}</p>}
        <p className="text-[#3D6080] text-[9px] uppercase tracking-widest mt-1">{title}</p>
      </div>

      {children && <div className="flex flex-col gap-1.5 pt-1">{children}</div>}
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
const MoodTrackingGrid = () => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    let mounted = true;
    api.get('/sessions')
      .then(r => { if (mounted) setSessions(Array.isArray(r.data) ? r.data : []); })
      .catch(() => {})
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, []);

  const moodValues = useMemo(() =>
    sessions.map(s => s.moodAfter ?? s.mood ?? s.moodBefore ?? null)
      .filter((m): m is number => m !== null && m >= 1 && m <= 10),
  [sessions]);

  const stats = useMemo(() => {
    const total    = moodValues.length;
    const positive = moodValues.filter(m => m >= 8).length;
    const neutral  = moodValues.filter(m => m >= 4 && m < 8).length;
    const negative = moodValues.filter(m => m < 4).length;
    const pct = (n: number) => total ? Math.round((n / total) * 100) : 0;
    const avg = total ? Math.round((moodValues.reduce((a, b) => a + b, 0) / total) * 10) / 10 : null;
    return { total, positive, neutral, negative, positivePct: pct(positive), neutralPct: pct(neutral), negativePct: pct(negative), avg };
  }, [moodValues]);

  const topMood = useMemo(() => {
    const map = new Map<number, number>();
    moodValues.forEach(m => map.set(m, (map.get(m) ?? 0) + 1));
    let best = { value: 0, count: 0 };
    map.forEach((count, value) => { if (count > best.count) best = { value, count }; });
    return best;
  }, [moodValues]);

  const uniqueMoods = useMemo(() => new Set(moodValues).size, [moodValues]);

  // Distribution 1–10
  const distribution = useMemo(() => {
    const counts = Array(10).fill(0);
    moodValues.forEach(m => counts[m - 1]++);
    const max = Math.max(...counts, 1);
    return counts.map((c, i) => ({ score: i + 1, count: c, pct: Math.round((c / max) * 100) }));
  }, [moodValues]);

  const dash = '—';

  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

        {/* Breakdown */}
        <InfoCard title="Mood breakdown · all sessions"
          value={loading ? dash : stats.total > 0 ? `${stats.positivePct}%` : dash}
          sub={stats.total > 0 ? `${stats.total} entries` : undefined}
          accent="rgba(74,232,160,0.08)">
          <StatRow label="Positive" pct={stats.positivePct} count={stats.positive} color="#4AE8A0" bg="linear-gradient(90deg,#1A8F60,#4AE8A0)" />
          <StatRow label="Neutral"  pct={stats.neutralPct}  count={stats.neutral}  color="#4A9EFF" bg="linear-gradient(90deg,#1A5FCC,#4A9EFF)" />
          <StatRow label="Tough"    pct={stats.negativePct} count={stats.negative} color="#FF8A8A" bg="linear-gradient(90deg,#8A2020,#FF8A8A)" />
        </InfoCard>

        {/* Avg + most common */}
        <InfoCard title="Average mood score"
          value={loading ? dash : stats.avg !== null ? `${stats.avg}/10` : dash}
          sub={topMood.count ? `Most common: ${topMood.value}/10 (${topMood.count}×)` : undefined}
          accent="rgba(74,158,255,0.08)">
          {/* Score distribution 1–10 mini bars */}
          <div className="flex items-end gap-0.5 h-10">
            {distribution.map(({ score, pct, count }) => (
              <div key={score} className="flex-1 flex flex-col items-center gap-0.5" title={`${score}/10: ${count}×`}>
                <div className="w-full rounded-t-sm transition-all duration-500"
                  style={{
                    height: `${Math.max(pct, 4)}%`,
                    minHeight: 2,
                    background: score >= 8 ? '#4AE8A0' : score >= 4 ? '#3A82F7' : '#FF8A8A',
                    opacity: count === 0 ? 0.15 : 1,
                  }} />
              </div>
            ))}
          </div>
          <div className="flex justify-between text-[8px] text-[#1E3358] px-0.5">
            <span>1</span><span>5</span><span>10</span>
          </div>
        </InfoCard>

        {/* Unique / total */}
        <InfoCard title="Unique mood scores logged"
          value={loading ? dash : String(uniqueMoods)}
          sub={`of 10 possible`}
          accent="rgba(122,196,255,0.06)">
          {/* Score range dots */}
          <div className="flex gap-1 flex-wrap pt-1">
            {Array.from({ length: 10 }, (_, i) => {
              const score = i + 1;
              const has   = moodValues.includes(score);
              const color = score >= 8 ? '#4AE8A0' : score >= 4 ? '#3A82F7' : '#FF8A8A';
              return (
                <div key={score} className="flex flex-col items-center gap-0.5">
                  <div className="w-4 h-4 rounded-full flex items-center justify-center text-[7px]"
                    style={{
                      background: has ? color : 'rgba(30,51,88,0.3)',
                      color: has ? '#010814' : '#1E3358',
                      fontWeight: 700,
                      boxShadow: has ? `0 0 6px ${color}66` : 'none',
                    }}>
                    {score}
                  </div>
                </div>
              );
            })}
          </div>
        </InfoCard>
      </div>
    </div>
  );
};

export default MoodTrackingGrid;