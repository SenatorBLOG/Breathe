// src/components/charts/AnnualProgressChart.tsx
import { useState, useEffect, useMemo } from 'react';
import {
  ComposedChart, Bar, Line, XAxis, YAxis,
  Tooltip, ResponsiveContainer, CartesianGrid, Area,
} from 'recharts';
import api from '../../api';
import { useThemeStyles } from '../../hooks/useThemeStyles';

// ─── Types ────────────────────────────────────────────────────────────────────
interface RawSession {
  sessionDate?: string;
  date?: string;
  sessionLength?: number;
  minutes?: number;
  time?: number;
  cycles?: number;
}

interface ChartPoint {
  name: string;
  totalMinutes: number;
  sessions: number;
  cycles: number;
  isCurrent: boolean;
}

// ─── Tooltip ──────────────────────────────────────────────────────────────────
function CustomTooltip({ active, payload }: any) {
  const ts = useThemeStyles();
  if (!active || !payload?.length) return null;
  const p: ChartPoint = payload[0].payload;
  return (
    <div className="rounded-2xl px-4 py-3 border text-xs"
      style={{
        background: ts.navBg,
        borderColor: ts.border,
        backdropFilter: 'blur(12px)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
      }}>
      <p className="font-medium mb-1" style={{ color: ts.textPrimary }}>{p.name}</p>
      <p style={{ color: ts.accent }}>{p.totalMinutes} min</p>
      <p className="mt-0.5" style={{ color: ts.textDim }}>
        {p.sessions} session{p.sessions !== 1 ? 's' : ''} · {p.cycles} cycles
      </p>
    </div>
  );
}

// ─── View toggle ──────────────────────────────────────────────────────────────
function ViewToggle({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const ts = useThemeStyles();
  return (
    <div className="flex gap-1">
      {['12 months', 'By year'].map(v => (
        <button
          key={v}
          onClick={() => onChange(v)}
          className="px-3 py-1 rounded-lg text-[10px] uppercase tracking-widest border transition-all"
          style={{
            backgroundColor: value === v ? ts.cardBgHover : 'transparent',
            borderColor: value === v ? ts.borderHover : ts.border,
            color: value === v ? ts.textPrimary : ts.textMuted,
          }}
        >
          {v}
        </button>
      ))}
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
const AnnualProgressChart = () => {
  const ts = useThemeStyles();
  const [rawSessions, setRawSessions] = useState<RawSession[]>([]);
  const [loading, setLoading]         = useState(true);
  const [view, setView]               = useState('12 months');

  useEffect(() => {
    let mounted = true;
    api.get('/sessions')
      .then(r => { if (mounted) setRawSessions(Array.isArray(r.data) ? r.data : []); })
      .catch(() => {})
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, []);

  const last12 = useMemo((): ChartPoint[] => {
    const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const now = new Date();
    const buckets: Record<string, ChartPoint> = {};

    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      buckets[key] = {
        name: MONTHS[d.getMonth()],
        totalMinutes: 0, sessions: 0, cycles: 0,
        isCurrent: i === 0,
      };
    }

    rawSessions.forEach(s => {
      const d = new Date(s.sessionDate || s.date || '');
      if (isNaN(d.getTime())) return;
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (!buckets[key]) return;
      buckets[key].totalMinutes += Number(s.sessionLength ?? s.minutes ?? (s.time ? s.time / 60 : 0)) || 0;
      buckets[key].sessions += 1;
      buckets[key].cycles   += Number(s.cycles || 0);
    });

    return Object.values(buckets).map(m => ({ ...m, totalMinutes: Math.round(m.totalMinutes * 10) / 10 }));
  }, [rawSessions]);

  const byYear = useMemo((): ChartPoint[] => {
    const map: Record<number, ChartPoint> = {};
    const curYear = new Date().getFullYear();
    rawSessions.forEach(s => {
      const d = new Date(s.sessionDate || s.date || '');
      if (isNaN(d.getTime())) return;
      const y = d.getFullYear();
      if (!map[y]) map[y] = { name: String(y), totalMinutes: 0, sessions: 0, cycles: 0, isCurrent: y === curYear };
      map[y].totalMinutes += Number(s.sessionLength ?? s.minutes ?? 0) || 0;
      map[y].sessions += 1;
      map[y].cycles   += Number(s.cycles || 0);
    });
    return Object.values(map)
      .sort((a, b) => Number(a.name) - Number(b.name))
      .map(m => ({ ...m, totalMinutes: Math.round(m.totalMinutes * 10) / 10 }));
  }, [rawSessions]);

  const data = view === 'By year' ? byYear : last12;

  const maxMins     = Math.max(...data.map(d => d.totalMinutes), 1);
  const maxSessions = Math.max(...data.map(d => d.sessions), 1);
  const yBarMax     = Math.ceil(maxMins / 5) * 5 + 5;
  const yLineMax    = Math.ceil(maxSessions * (yBarMax / maxMins));

  // ─── Loading ───────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex flex-col gap-2 animate-pulse">
        <div className="h-4 w-1/3 rounded-lg" style={{ background: `${ts.border}80` }} />
        <div className="h-52 rounded-xl" style={{ background: `${ts.border}50` }} />
      </div>
    );
  }

  if (!data.length || data.every(d => d.totalMinutes === 0)) {
    return (
      <div className="flex flex-col gap-3">
        <ViewToggle value={view} onChange={setView} />
        <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
          <span className="text-3xl opacity-30">🌊</span>
          <p className="text-xs" style={{ color: ts.textMuted }}>No data yet</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-1 rounded-full inline-block" style={{ background: ts.accent }} />
            <span className="text-[9px] uppercase tracking-wide" style={{ color: ts.textMuted }}>Minutes</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 inline-block" style={{ background: `linear-gradient(90deg,${ts.accentLight},#4AE8A0)`, height: 2, borderRadius: 2 }} />
            <span className="text-[9px] uppercase tracking-wide" style={{ color: ts.textMuted }}>Sessions</span>
          </div>
        </div>
        <ViewToggle value={view} onChange={setView} />
      </div>

      {/* Chart */}
      <div style={{ height: 200 }}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 12, right: 28, left: -10, bottom: 0 }} barCategoryGap="35%">

            <CartesianGrid vertical={false} strokeDasharray="2 6" stroke={`${ts.border}66`} />

            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fill: ts.textDim, fontSize: 9, fontFamily: 'Montserrat' }}
              dy={6}
              interval={view === '12 months' ? 1 : 0}
            />

            <YAxis
              yAxisId="left"
              axisLine={false}
              tickLine={false}
              domain={[0, yBarMax]}
              tick={{ fill: ts.textDim, fontSize: 9, fontFamily: 'Montserrat' }}
              tickFormatter={v => v === 0 ? '' : `${v}m`}
              width={36}
            />

            <YAxis
              yAxisId="right"
              orientation="right"
              axisLine={false}
              tickLine={false}
              domain={[0, yLineMax]}
              tick={{ fill: ts.textDim, fontSize: 9, fontFamily: 'Montserrat' }}
              tickFormatter={v => v === 0 ? '' : `${v}`}
              width={22}
            />

            <Tooltip content={<CustomTooltip />} cursor={{ fill: `${ts.accent}08`, radius: 6 } as any} />

            <Bar yAxisId="left" dataKey="totalMinutes" radius={[6, 6, 2, 2]} maxBarSize={24}
              fill="url(#barGrad)" isAnimationActive />

            <Area
              yAxisId="right"
              type="monotoneX"
              dataKey="sessions"
              stroke="none"
              fill="url(#lineGlow)"
              isAnimationActive
            />

            <Line
              yAxisId="right"
              type="monotoneX"
              dataKey="sessions"
              stroke="url(#lineGrad)"
              strokeWidth={2.5}
              dot={(props: any) => {
                const { cx, cy, payload } = props;
                if (payload.sessions === 0) return <g key={props.key} />;
                return (
                  <circle
                    key={props.key}
                    cx={cx} cy={cy} r={payload.isCurrent ? 5 : 3}
                    fill={payload.isCurrent ? '#4AE8A0' : ts.accentLight}
                    stroke={payload.isCurrent ? 'rgba(74,232,160,0.4)' : `${ts.accentLight}50`}
                    strokeWidth={payload.isCurrent ? 4 : 2}
                    style={{ filter: payload.isCurrent ? 'drop-shadow(0 0 6px rgba(74,232,160,0.8))' : `drop-shadow(0 0 4px ${ts.accentLight}80)` }}
                  />
                );
              }}
              activeDot={{ r: 6, fill: ts.accentLight, stroke: `${ts.accentLight}66`, strokeWidth: 4, style: { filter: `drop-shadow(0 0 8px ${ts.accentLight}CC)` } }}
              isAnimationActive
            />

            <defs>
              <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor={ts.accent}  stopOpacity={0.9} />
                <stop offset="100%" stopColor={ts.accent}  stopOpacity={0.3} />
              </linearGradient>
              <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%"   stopColor={ts.accentLight} />
                <stop offset="100%" stopColor="#4AE8A0" />
              </linearGradient>
              <linearGradient id="lineGlow" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor="#4AE8A0" stopOpacity={0.08} />
                <stop offset="100%" stopColor="#4AE8A0" stopOpacity={0}    />
              </linearGradient>
            </defs>

          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Sub-caption */}
      <div className="flex items-center justify-between border-t pt-2" style={{ borderColor: `${ts.border}40` }}>
        <span className="text-[9px]" style={{ color: ts.textDim }}>
          {data.reduce((s, d) => s + d.sessions, 0)} sessions · {data.reduce((s, d) => s + d.totalMinutes, 0)}m total
        </span>
        <span className="text-[9px]" style={{ color: ts.accent }}>
          ● this {view === 'By year' ? 'year' : 'month'}
        </span>
      </div>
    </div>
  );
};

export default AnnualProgressChart;
