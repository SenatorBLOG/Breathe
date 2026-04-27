// src/components/charts/StatsCards.tsx
import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../../api';
import StatCard from './StatCard';
import { ResponsiveContainer, LineChart, Line, AreaChart, Area } from 'recharts';
import { useThemeStyles } from "../../hooks/useThemeStyles";

// ─── Helpers (без изменений) ──────────────────────────────────────────────────
const daysAgo = (n: number) => { const d = new Date(); d.setHours(0,0,0,0); d.setDate(d.getDate() - n); return d; };
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
  // Используем семантические цвета, но адаптируем их под прозрачность темы
  const color = positive ? '#4AE8A0' : '#FF8A8A';
  return (
    <span
      className="t-label px-2 py-0.5 rounded-full border tabular-nums font-medium"
      style={{
        color: color,
        borderColor: `${color}40`,
        background: `${color}10`,
      }}
    >
      {positive ? '+' : ''}{Math.round(pct)}% vs 7d
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
            <stop offset="0%" stopColor={color} stopOpacity={0.4} />
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
          style={{ filter: `drop-shadow(0 0 6px ${color}66)` }} />
      </LineChart>
    </ResponsiveContainer>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
const StatsCards = () => {
  const ts = useThemeStyles();
  const { t } = useTranslation();
  const [sessions, setSessions] = useState<RawSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    api.get('/sessions')
      .then(r => { if (mounted) setSessions(Array.isArray(r.data) ? r.data : []); })
      .catch(() => {})
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, []);

  // Вычисления (useMemo остаются без изменений)
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

  const last14 = buildDaysArray(14);
  const last7 = last14.slice(7);
  const last28 = buildDaysArray(28);

  const last7Data = last7.map(d => ({ key: d.key, name: d.key, minutes: dayMap[d.key]?.minutes ?? 0, sessions: dayMap[d.key]?.sessions ?? 0 }));
  const prev7Data = last14.slice(0, 7).map(d => ({ minutes: dayMap[d.key]?.minutes ?? 0, sessions: dayMap[d.key]?.sessions ?? 0 }));

  const totalSess7 = last7Data.reduce((a, b) => a + b.sessions, 0);
  const totalSessP7 = prev7Data.reduce((a, b) => a + b.sessions, 0);
  const totalMins7 = last7Data.reduce((a, b) => a + b.minutes, 0);
  const totalMinsP7 = prev7Data.reduce((a, b) => a + b.minutes, 0);
  const avgSess7 = totalSess7 ? Math.round(totalMins7 / Math.max(1, totalSess7)) : 0;
  const avgSessP7 = totalSessP7 ? Math.round(totalMinsP7 / Math.max(1, totalSessP7)) : 0;

  const sessPct = safePct(totalSess7, totalSessP7);
  const avgPct = safePct(avgSess7, avgSessP7);
  const consistency = Math.round((last7Data.filter(d => d.sessions > 0).length / 7) * 100);

  const miniSessions = last7Data.map(d => ({ name: d.key, value: d.sessions }));
  const miniConsistency = last7Data.map(d => ({ name: d.key, value: d.sessions > 0 ? 1 : 0 }));
  const miniAvg = last7Data.map(d => ({ name: d.key, value: d.sessions ? Math.round(d.minutes / d.sessions) : 0 }));

  const bestWeekday = useMemo(() => {
    const totals = Array(7).fill(0), counts = Array(7).fill(0);
    last28.forEach(d => {
      const wd = d.dateObj.getDay();
      const m = dayMap[d.key]?.minutes ?? 0;
      totals[wd] += m; if (m > 0) counts[wd]++;
    });
    const avgs = totals.map((t, i) => counts[i] > 0 ? Math.round((t / counts[i]) * 10) / 10 : 0);
    const best = avgs.indexOf(Math.max(...avgs));
    return { idx: best, name: WEEKDAY[best], avg: avgs[best], averages: avgs };
  }, [last28, dayMap]);

  const moodStats = useMemo(() => {
    const vals = sessions.map(s => parseMood(s)).filter((m): m is number => m !== null && m >= 1 && m <= 10);
    const total = vals.length;
    const pos = vals.filter(m => m >= 8).length;
    const neu = vals.filter(m => m >= 4 && m < 8).length;
    const neg = vals.filter(m => m < 4).length;
    const pct = (n: number) => total ? Math.round((n / total) * 100) : 0;
    return { total, positivePct: pct(pos), neutralPct: pct(neu), negativePct: pct(neg), pos, neu, neg };
  }, [sessions]);

  const heatmap = useMemo(() => {
    const maxM = Math.max(1, ...last28.map(d => dayMap[d.key]?.minutes ?? 0));
    return last28.map(d => ({
      key: d.key, label: d.dateObj.toLocaleDateString('ru', { month:'short', day:'numeric' }),
      intensity: (dayMap[d.key]?.minutes ?? 0) / maxM,
      minutes: dayMap[d.key]?.minutes ?? 0
    }));
  }, [last28, dayMap]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-44 rounded-2xl" style={{ background: `${ts.border}30` }} />
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
        label={t('statsCards.sessions7d')}
        accent={`${ts.accent}15`}
      >
        <Spark data={miniSessions} color={ts.accent} type="area" />
      </StatCard>

      {/* 2 — Consistency */}
      <StatCard
        value={`${consistency}%`}
        label={t('statsCards.consistency')}
        accent={`${ts.accentLight}15`}
      >
        <Spark data={miniConsistency} color={ts.accentLight} />
      </StatCard>

      {/* 3 — Avg session */}
      <StatCard
        value={formatDuration(avgSess7)}
        subValue={<Delta pct={avgPct} />}
        label={t('statsCards.avgTime7d')}
        accent={`${ts.accent}15`}
      >
        <Spark data={miniAvg} color={ts.accent} type="area" />
      </StatCard>

      {/* 4 — Best day */}
      <StatCard
        value={bestWeekday.avg > 0 ? bestWeekday.name : '—'}
        label={t('statsCards.bestDay', { avg: bestWeekday.avg })}
        accent={`${ts.accentLight}10`}
      >
        <div className="flex flex-col justify-center gap-1.5 pt-1">
          {bestWeekday.averages.map((avg, i) => {
            const isBest = i === bestWeekday.idx;
            const maxA = Math.max(...bestWeekday.averages, 0.1);
            return (
              <div key={i} className="flex items-center gap-2">
                <span className="t-label w-6 flex-shrink-0 font-medium" 
                  style={{ color: isBest ? ts.accentLight : ts.textMuted }}>
                  {WEEKDAY[i]}
                </span>
                <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: `${ts.border}40` }}>
                  <div className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min((avg / maxA) * 100, 100)}%`,
                      background: isBest ? `linear-gradient(90deg, ${ts.accent}, ${ts.accentLight})` : `${ts.accent}40`,
                      boxShadow: isBest ? `0 0 8px ${ts.accentLight}40` : 'none',
                    }}
                  />
                </div>
                <span className="t-label w-8 text-right tabular-nums font-medium" 
                  style={{ color: isBest ? ts.accentLight : ts.textDim }}>
                  {avg > 0 ? `${Math.round(avg)}m` : '—'}
                </span>
              </div>
            );
          })}
        </div>
      </StatCard>

      {/* 5 — Mood breakdown */}
      <StatCard
        value={moodStats.total > 0 ? `${moodStats.positivePct}%` : '—'}
        label={t('statsCards.positiveMood')}
        accent={`${ts.accent}08`}
      >
        <div className="flex flex-col justify-center gap-2 pt-2">
          {[
            { label: 'Good', pct: moodStats.positivePct, color: '#4AE8A0', grad: `linear-gradient(90deg, ${ts.accent}, #4AE8A0)` },
            { label: 'Ok',   pct: moodStats.neutralPct,  color: ts.textMuted, grad: ts.textMuted },
            { label: 'Hard', pct: moodStats.negativePct, color: '#FF8A8A', grad: '#FF8A8A' },
          ].map(({ label, pct, color, grad }) => (
            <div key={label} className="flex items-center gap-2">
              <span className="t-label w-10 flex-shrink-0 font-medium" style={{ color: ts.textMuted }}>{label}</span>
              <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: `${ts.border}40` }}>
                <div className="h-full rounded-full transition-all duration-700" 
                  style={{ width: `${pct}%`, background: grad, opacity: pct > 0 ? 1 : 0 }} />
              </div>
              <span className="t-label tabular-nums font-bold w-7 text-right" style={{ color: pct > 50 ? ts.accentLight : ts.textSecondary }}>{pct}%</span>
            </div>
          ))}
          <div className="flex justify-between pt-1.5 border-t mt-1" style={{ borderColor: `${ts.border}30` }}>
            <span className="t-label" style={{ color: ts.textDim }}>{t('statsCards.totalEntries')}</span>
            <span className="t-label font-bold tabular-nums" style={{ color: ts.accentLight }}>{moodStats.total}</span>
          </div>
        </div>
      </StatCard>

      {/* 6 — Heatmap */}
      <StatCard
        value={t('statsCards.totalCount', { count: sessions.length })}
        label={t('statsCards.activity28d')}
        accent={`${ts.accent}10`}
      >
        <div className="flex flex-col gap-1 w-full pt-1">
          {Array.from({ length: 4 }, (_, row) => (
            <div key={row} className="flex gap-1 w-full">
              {Array.from({ length: 7 }, (_, col) => {
                const cell = heatmap[row * 7 + col];
                if (!cell) return null;
                return (
                  <div
                    key={col}
                    title={`${cell.label}: ${cell.minutes}m`}
                    className="flex-1 h-4 rounded-[3px] transition-all hover:scale-110"
                    style={{
                      background: cell.intensity > 0
                        ? ts.accent
                        : `${ts.border}30`,
                      opacity: cell.intensity > 0 ? 0.2 + (cell.intensity * 0.8) : 0.3,
                      boxShadow: cell.intensity > 0.7 ? `0 0 8px ${ts.accent}40` : 'none',
                    }}
                  />
                );
              })}
            </div>
          ))}
          <div className="flex gap-1 w-full mt-1">
            {['S','M','T','W','T','F','S'].map((d, i) => (
              <div key={i} className="flex-1 text-center text-[8px] font-bold" style={{ color: ts.textDim }}>{d}</div>
            ))}
          </div>
        </div>
      </StatCard>

    </div>
  );
};

export default StatsCards;