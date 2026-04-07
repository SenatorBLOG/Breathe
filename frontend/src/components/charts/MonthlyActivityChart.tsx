// src/components/charts/MonthlyActivityChart.tsx
import { useState, useEffect, useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import api from '../../api';
import { useThemeStyles } from '../../hooks/useThemeStyles';

// ─── Duration buckets (colors derived from theme inside component) ─────────────
const BUCKET_META = [
  { name: 'Short',    label: '≤5 min',    min: 0,  max: 5,   midpoint: 2.5  },
  { name: 'Medium',   label: '6–15 min',  min: 6,  max: 15,  midpoint: 10   },
  { name: 'Long',     label: '16–30 min', min: 16, max: 30,  midpoint: 22.5 },
  { name: 'Extended', label: '30+ min',   min: 31, max: 9999, midpoint: 45  },
];

// ─── Custom tooltip ───────────────────────────────────────────────────────────
function CustomTooltip({ active, payload }: any) {
  const ts = useThemeStyles();
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="px-3 py-2 rounded-xl t-caption border"
      style={{
        background: ts.navBg,
        borderColor: ts.border,
        color: ts.textPrimary,
      }}>
      <p className="font-medium">
        {d.name} <span style={{ color: ts.textDim }}>({d.label})</span>
      </p>
      <p className="mt-0.5" style={{ color: ts.accent }}>
        {d.value} session{d.value !== 1 ? 's' : ''}
      </p>
    </div>
  );
}

const MonthlyActivityChart = () => {
  const ts = useThemeStyles();
  const [rawSessions, setRawSessions] = useState<any[]>([]);
  const [loading, setLoading]         = useState(true);

  const BUCKETS = useMemo(() => {
    const colors = [ts.accent, ts.accentLight, `${ts.accent}CC`, `${ts.accentLight}99`];
    return BUCKET_META.map((b, i) => ({ ...b, color: colors[i] }));
  }, [ts.accent, ts.accentLight]);

  useEffect(() => {
    let mounted = true;
    api.get('/sessions')
      .then(r => { if (mounted) setRawSessions(Array.isArray(r.data) ? r.data : []); })
      .catch(() => {})
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, []);

  const pieData = useMemo(() => {
    const counts: Record<string, number> = { Short: 0, Medium: 0, Long: 0, Extended: 0 };
    rawSessions.forEach(s => {
      const mins = Number(s.sessionLength ?? s.minutes ?? 0);
      const bucket = BUCKETS.find(b => mins >= b.min && mins <= b.max) ?? BUCKETS[3];
      counts[bucket.name]++;
    });
    return BUCKETS
      .map(b => ({ ...b, value: counts[b.name] }))
      .filter(b => b.value > 0);
  }, [rawSessions, BUCKETS]);

  const total = pieData.reduce((s, d) => s + d.value, 0);

  const avgMinutes = useMemo(() => {
    if (!total) return 0;
    const sum = pieData.reduce((s, d) => s + d.midpoint * d.value, 0);
    return Math.round((sum / total) * 10) / 10;
  }, [pieData, total]);

  // ─── Loading skeleton ─────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex flex-col gap-3 animate-pulse">
        <div className="h-4 w-1/3 rounded-lg" style={{ background: `${ts.border}80` }} />
        <div className="h-40 rounded-xl" style={{ background: `${ts.border}50` }} />
      </div>
    );
  }

  // ─── Empty state ──────────────────────────────────────────────────────────
  if (total === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
        <span className="text-3xl opacity-30">🫧</span>
        <p className="t-caption" style={{ color: ts.textMuted }}>No sessions yet</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Donut + legend row */}
      <div className="flex items-center gap-5">
        {/* Donut */}
        <div className="relative flex-shrink-0" style={{ width: 130, height: 130 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                innerRadius="62%"
                outerRadius="88%"
                startAngle={90}
                endAngle={-270}
                paddingAngle={3}
                cornerRadius={6}
              >
                {pieData.map((d, i) => (
                  <Cell key={i} fill={d.color} stroke={ts.pageBg} strokeWidth={2} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>

          {/* Centre label */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <p className="t-heading font-medium tabular-nums leading-none" style={{ color: ts.textPrimary }}>
              {avgMinutes}
            </p>
            <p className="t-label uppercase tracking-widest mt-0.5" style={{ color: ts.textMuted }}>
              avg min
            </p>
          </div>
        </div>

        {/* Legend */}
        <div className="flex-1 flex flex-col gap-2 min-w-0">
          {pieData.map(d => {
            const pct = Math.round((d.value / total) * 100);
            return (
              <div key={d.name} className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: d.color }} />
                <span className="t-label w-12 flex-shrink-0" style={{ color: ts.textSecondary }}>
                  {d.name}
                </span>
                <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: `${ts.border}66` }}>
                  <div className="h-full rounded-full" style={{ width: `${pct}%`, background: d.color }} />
                </div>
                <span className="t-label tabular-nums flex-shrink-0 w-12 text-right" style={{ color: ts.textMuted }}>
                  {d.value}× · {pct}%
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Sub-caption */}
      <div className="flex flex-col gap-2 border-t pt-3" style={{ borderColor: `${ts.border}40` }}>
        <span className="t-label" style={{ color: ts.textMuted }}>{total} sessions total</span>
        <div className="flex flex-wrap gap-1.5">
          {BUCKETS.filter(b => pieData.some(p => p.name === b.name)).map(b => (
            <span key={b.name} className="t-label px-2 py-0.5 rounded-full border"
              style={{ color: b.color, borderColor: `${b.color}33`, background: `${b.color}0D` }}>
              {b.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MonthlyActivityChart;
