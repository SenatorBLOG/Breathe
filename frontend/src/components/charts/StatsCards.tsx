// src/components/charts/StatsCards.tsx
import React, { useEffect, useMemo, useState } from 'react';
import api from '../../api';
import StatCard from './StatCard';
import { ResponsiveContainer, LineChart, Line, AreaChart, Area } from 'recharts';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const daysAgo = (n: number) => {
  const d = new Date(); d.setHours(0,0,0,0); d.setDate(d.getDate() - n); return d;
};
const buildDaysArray = (n: number) => {
  const arr = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = daysAgo(i);
    arr.push({ key: d.toISOString().slice(0, 10), dateObj: d });
  }
  return arr;
};
const formatDuration = (minutes: number) => {
  if (!minutes) return '0 min';
  if (minutes < 60) return `${minutes}m`;
  return `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
};
const safePct = (curr: number, prev: number) => {
  if (prev === 0 && curr === 0) return 0;
  if (prev === 0) return 100;
  return ((curr - prev) / Math.abs(prev)) * 100;
};
const WEEKDAY = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

interface RawSession {
  sessionDate?: string; date?: string; createdAt?: string;
  sessionLength?: number; minutes?: number; time?: number;
  moodAfter?: number; moodBefore?: number; mood?: number;
  cycles?: number;
}

const parseDate = (s: RawSession) => {
  const raw = s.sessionDate ?? s.date ?? s.createdAt ?? '';
  if (!raw) return null;
  const d = new Date(raw); if (isNaN(d.getTime())) return null;
  d.setHours(0,0,0,0); return d;
};
const parseMins = (s: RawSession) => {
  let v = Number(s.sessionLength ?? s.minutes ?? s.time ?? 0);
  if (v > 1_000_000) v /= 60000;
  else if (v > 720) v /= 60;
  return Math.round(v * 10) / 10;
};
const parseMood = (s: RawSession) => s.moodAfter ?? s.moodBefore ?? s.mood ?? null;

// ─── Delta badge ──────────────────────────────────────────────────────────────
function Delta({ pct }: { pct: number }) {
  const positive = pct >= 0;
  return (
    <span
      className="text-[10px] px-2 py-0.5 rounded-full border tabular-nums"
      style={{
        color:        positive ? '#4AE8A0' : '#FF8A8A',
        borderColor:  positive ? 'rgba(74,232,160,0.25)' : 'rgba(255,138,138,0.25)',
        background:   positive ? 'rgba(74,232,160,0.08)' : 'rgba(255,138,138,0.08)',
      }}
    >
      {positive ? '+' : ''}{Math.round(pct)}% vs prev 7d
    </span>
  );
}

// ─── Sparkline wrapper ────────────────────────────────────────────────────────
function Spark({ data, color, type = 'line' }: { data: {name:string;value:number}[]; color: string; type?: 'line'|'area' }) {
  if (type === 'area') return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id={`ag_${color.replace('#','')}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.35} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area type="monotone" dataKey="value" stroke={color} strokeWidth={2}
          fill={`url(#ag_${color.replace('#','')})`} dot={false} isAnimationActive />
      </AreaChart>
    </ResponsiveContainer>
  );
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
        <Line type="monotone" dataKey="value" stroke={color} strokeWidth={2.5}
          dot={false} isAnimationActive
          style={{ filter: `drop-shadow(0 0 6px ${color}88)` }} />
      </LineChart>
    </ResponsiveContainer>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
const StatsCards = () => {
  const [sessions, setSessions] = useState<RawSession[]>([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    let mounted = true;
    api.get('/sessions')
      .then(r => { if (mounted) setSessions(Array.isArray(r.data) ? r.data : []); })
      .catch(() => {})
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, []);

  // Day map
  const dayMap = useMemo(() => {
    const map: Record<string, { minutes: number; sessions: number; moods: number[] }> = {};
    sessions.forEach(s => {
      const d = parseDate(s); if (!d) return;
      const key = d.toISOString().slice(0, 10);
      if (!map[key]) map[key] = { minutes: 0, sessions: 0, moods: [] };
      map[key].minutes  += parseMins(s);
      map[key].sessions += 1;
      const m = parseMood(s); if (m !== null) map[key].moods.push(Number(m));
    });
    return map;
  }, [sessions]);

  const last14 = useMemo(() => buildDaysArray(14), []);
  const last7  = useMemo(() => last14.slice(7), [last14]);
  const last28 = useMemo(() => buildDaysArray(28), []);

  const last7Data = useMemo(() => last7.map(d => ({
    key: d.key, name: d.key,
    minutes:  dayMap[d.key]?.minutes  ?? 0,
    sessions: dayMap[d.key]?.sessions ?? 0,
  })), [last7, dayMap]);

  const prev7Data = useMemo(() => last14.slice(0, 7).map(d => ({
    minutes:  dayMap[d.key]?.minutes  ?? 0,
    sessions: dayMap[d.key]?.sessions ?? 0,
  })), [last14, dayMap]);

  // Aggregates
  const totalSess7  = last7Data.reduce((a, b) => a + b.sessions, 0);
  const totalSessP7 = prev7Data.reduce((a, b) => a + b.sessions, 0);
  const totalMins7  = last7Data.reduce((a, b) => a + b.minutes,  0);
  const totalMinsP7 = prev7Data.reduce((a, b) => a + b.minutes,  0);
  const avgSess7    = totalSess7 ? Math.round(totalMins7  / Math.max(1, totalSess7))  : 0;
  const avgSessP7   = totalSessP7? Math.round(totalMinsP7 / Math.max(1, totalSessP7)) : 0;

  const sessPct = safePct(totalSess7, totalSessP7);
  const avgPct  = safePct(avgSess7, avgSessP7);
  const consistency = Math.round((last7Data.filter(d => d.sessions > 0).length / 7) * 100);

  // Mini spark data
  const miniSessions    = last7Data.map(d => ({ name: d.key, value: d.sessions }));
  const miniConsistency = last7Data.map(d => ({ name: d.key, value: d.sessions > 0 ? 1 : 0 }));
  const miniAvg         = last7Data.map(d => ({ name: d.key, value: d.sessions ? Math.round(d.minutes / d.sessions) : 0 }));

  // Best weekday (last 28)
  const bestWeekday = useMemo(() => {
    const totals = Array(7).fill(0), counts = Array(7).fill(0);
    last28.forEach(d => {
      const wd = d.dateObj.getDay();
      const m  = dayMap[d.key]?.minutes ?? 0;
      totals[wd] += m; if (m > 0) counts[wd]++;
    });
    const avgs = totals.map((t, i) => counts[i] > 0 ? Math.round((t / counts[i]) * 10) / 10 : 0);
    const best = avgs.indexOf(Math.max(...avgs));
    return { idx: best, name: WEEKDAY[best], avg: avgs[best], averages: avgs };
  }, [last28, dayMap]);

  // Mood breakdown
  const moodStats = useMemo(() => {
    const vals = sessions.map(s => parseMood(s)).filter((m): m is number => m !== null && m >= 1 && m <= 10);
    const total    = vals.length;
    const positive = vals.filter(m => m >= 8).length;
    const neutral  = vals.filter(m => m >= 4 && m < 8).length;
    const negative = vals.filter(m => m < 4).length;
    const pct = (n: number) => total ? Math.round((n / total) * 100) : 0;
    return { total, positive, neutral, negative, positivePct: pct(positive), neutralPct: pct(neutral), negativePct: pct(negative) };
  }, [sessions]);

  // Heatmap (28 days)
  const heatmap = useMemo(() => {
    const days = buildDaysArray(28);
    const maxM  = Math.max(1, ...days.map(d => dayMap[d.key]?.minutes ?? 0));
    return days.map(d => {
      const m = dayMap[d.key]?.minutes ?? 0;
      return { key: d.key, label: d.dateObj.toLocaleDateString('en', { month:'short', day:'numeric' }), intensity: m / maxM, minutes: m };
    });
  }, [last28, dayMap]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-44 rounded-2xl bg-[#1E3358]/25" style={{ opacity: 0.6 - i * 0.08 }} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

      {/* 1 — Sessions */}
      <StatCard
        value={String(totalSess7)}
        subValue={<Delta pct={sessPct} />}
        label="Sessions · last 7 days"
        accent="rgba(74,232,160,0.10)"
      >
        <Spark data={miniSessions} color="#4AE8A0" type="area" />
      </StatCard>

      {/* 2 — Consistency */}
      <StatCard
        value={`${consistency}%`}
        label="Consistency · days active this week"
        accent="rgba(90,143,255,0.10)"
      >
        <Spark data={miniConsistency} color="#5A8FFF" />
      </StatCard>

      {/* 3 — Avg session */}
      <StatCard
        value={formatDuration(avgSess7)}
        subValue={<Delta pct={avgPct} />}
        label="Avg session · last 7 days"
        accent="rgba(58,130,247,0.10)"
      >
        <Spark data={miniAvg} color="#3A82F7" type="area" />
      </StatCard>

      {/* 4 — Best day */}
      <StatCard
        value={bestWeekday.avg > 0 ? bestWeekday.name : '—'}
        label={`Best day · ${bestWeekday.avg}m avg over 4 weeks`}
        accent="rgba(122,196,255,0.08)"
      >
        <div className="flex flex-col justify-center gap-1 pt-1">
          {bestWeekday.averages.map((avg, i) => {
            const maxA = Math.max(...bestWeekday.averages, 0.1);
            return (
              <div key={i} className="flex items-center gap-2">
                <span className="text-[9px] w-6 flex-shrink-0" style={{ color: i === bestWeekday.idx ? '#7AC4FF' : '#2A4060' }}>
                  {WEEKDAY[i]}
                </span>
                <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(30,51,88,0.5)' }}>
                  <div className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min((avg / maxA) * 100, 100)}%`,
                      background: i === bestWeekday.idx
                        ? 'linear-gradient(90deg, #1A5FCC, #7AC4FF)'
                        : 'rgba(42,84,153,0.35)',
                      boxShadow: i === bestWeekday.idx ? '0 0 8px rgba(74,158,255,0.5)' : 'none',
                    }}
                  />
                </div>
                <span className="text-[9px] w-8 text-right tabular-nums" style={{ color: i === bestWeekday.idx ? '#7AC4FF' : '#1E3358' }}>
                  {avg > 0 ? `${avg}m` : '—'}
                </span>
              </div>
            );
          })}
        </div>
      </StatCard>

      {/* 5 — Mood breakdown */}
      <StatCard
        value={moodStats.total > 0 ? `${moodStats.positivePct}%` : '—'}
        label="Positive mood · all sessions"
        accent="rgba(74,232,160,0.06)"
      >
        <div className="flex flex-col justify-center gap-2 pt-2">
          {[
            { label: 'Positive', pct: moodStats.positivePct, count: moodStats.positive, color: '#4AE8A0', bg: 'linear-gradient(90deg,#1A8F60,#4AE8A0)' },
            { label: 'Neutral',  pct: moodStats.neutralPct,  count: moodStats.neutral,  color: '#4A7AAA', bg: 'linear-gradient(90deg,#2A4060,#4A7AAA)' },
            { label: 'Tough',    pct: moodStats.negativePct, count: moodStats.negative, color: '#FF8A8A', bg: 'linear-gradient(90deg,#8A2020,#FF8A8A)' },
          ].map(({ label, pct, count, color, bg }) => (
            <div key={label} className="flex items-center gap-2">
              <span className="text-[9px] w-12 flex-shrink-0" style={{ color }}>{label}</span>
              <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(30,51,88,0.5)' }}>
                <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: bg }} />
              </div>
              <span className="text-[9px] tabular-nums w-8 text-right" style={{ color }}>{pct}%</span>
              <span className="text-[9px] text-[#1E3358] w-6">({count})</span>
            </div>
          ))}
          <div className="flex justify-between pt-1 border-t border-[#1E3358]/30 mt-0.5">
            <span className="text-[9px] text-[#1E3358]">Total entries</span>
            <span className="text-[9px] text-[#4A9EFF] tabular-nums">{moodStats.total}</span>
          </div>
        </div>
      </StatCard>

      {/* 6 — Heatmap */}
      <StatCard
        value={`${sessions.length} total`}
        label="Heatmap · last 28 days"
        accent="rgba(42,84,153,0.08)"
      >
        <div className="flex flex-col gap-0.5 w-full pt-1">
          {Array.from({ length: 4 }, (_, row) => (
            <div key={row} className="flex gap-0.5 w-full">
              {Array.from({ length: 7 }, (_, col) => {
                const cell = heatmap[row * 7 + col];
                if (!cell) return <div key={col} className="flex-1 h-4 rounded-sm" style={{ background: 'rgba(30,51,88,0.15)' }} />;
                return (
                  <div
                    key={col}
                    title={`${cell.label}: ${cell.minutes > 0 ? cell.minutes + 'm' : 'no session'}`}
                    className="flex-1 h-4 rounded-sm cursor-default hover:opacity-75 transition-opacity"
                    style={{
                      background: cell.intensity > 0
                        ? `rgba(58,130,247,${0.12 + cell.intensity * 0.83})`
                        : 'rgba(30,51,88,0.2)',
                      boxShadow: cell.intensity > 0.6
                        ? `0 0 4px rgba(74,158,255,${cell.intensity * 0.4})`
                        : 'none',
                    }}
                  />
                );
              })}
            </div>
          ))}
          <div className="flex gap-0.5 w-full mt-0.5">
            {['S','M','T','W','T','F','S'].map((d, i) => (
              <div key={i} className="flex-1 text-center text-[8px] text-[#1E3358]">{d}</div>
            ))}
          </div>
        </div>
      </StatCard>

    </div>
  );
};

export default StatsCards;