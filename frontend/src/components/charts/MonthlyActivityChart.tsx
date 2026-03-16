// src/components/charts/MonthlyActivityChart.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import api from '../../api';

// ─── Duration buckets ─────────────────────────────────────────────────────────
const BUCKETS: { name: string; label: string; min: number; max: number; color: string; midpoint: number }[] = [
  { name: 'Short',    label: '≤5 min',   min: 0,  max: 5,   color: '#1A5FCC', midpoint: 2.5  },
  { name: 'Medium',   label: '6–15 min', min: 6,  max: 15,  color: '#3A82F7', midpoint: 10   },
  { name: 'Long',     label: '16–30 min',min: 16, max: 30,  color: '#4A9EFF', midpoint: 22.5 },
  { name: 'Extended', label: '30+ min',  min: 31, max: 9999,color: '#7AC4FF', midpoint: 45   },
];

// ─── Custom tooltip ───────────────────────────────────────────────────────────
function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="px-3 py-2 rounded-xl text-xs border bg-[#060C1A]/95 border-[#1E3358]/70 text-[#7AC4FF]">
      <p className="font-medium">{d.name} <span className="text-[#3D6080]">({d.label})</span></p>
      <p className="text-[#4A9EFF] mt-0.5">{d.value} session{d.value !== 1 ? 's' : ''}</p>
    </div>
  );
}

const MonthlyActivityChart = () => {
  const [rawSessions, setRawSessions] = useState<any[]>([]);
  const [loading, setLoading]         = useState(true);

  useEffect(() => {
    let mounted = true;
    api.get('/sessions')
      .then(r => { if (mounted) setRawSessions(Array.isArray(r.data) ? r.data : []); })
      .catch(() => {})
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, []);

  // ── Aggregate into buckets ────────────────────────────────────────────────
  const pieData = useMemo(() => {
    const counts: Record<string, number> = { Short: 0, Medium: 0, Long: 0, Extended: 0 };
    rawSessions.forEach(s => {
      const mins = Number(s.sessionLength ?? s.minutes ?? 0);
      const bucket = BUCKETS.find(b => mins >= b.min && mins <= b.max) ?? BUCKETS[3];
      counts[bucket.name]++;
    });
    return BUCKETS
      .map(b => ({ ...b, value: counts[b.name] }))
      .filter(b => b.value > 0); // hide empty buckets
  }, [rawSessions]);

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
        <div className="h-4 w-1/3 bg-[#1E3358]/50 rounded-lg" />
        <div className="h-40 bg-[#1E3358]/30 rounded-xl" />
      </div>
    );
  }

  // ─── Empty state ──────────────────────────────────────────────────────────
  if (total === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
        <span className="text-3xl opacity-30">🫧</span>
        <p className="text-[#3D6080] text-xs">No sessions yet</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Donut + legend row */}
      <div className="flex items-center gap-5">
        {/* Donut — compact */}
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
                  <Cell key={i} fill={d.color} stroke="rgba(1,8,20,0.6)" strokeWidth={2} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>

          {/* Centre label */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <p className="text-[#7AC4FF] text-xl font-medium tabular-nums leading-none">{avgMinutes}</p>
            <p className="text-[#3D6080] text-[9px] uppercase tracking-widest mt-0.5">avg min</p>
          </div>
        </div>

        {/* Legend */}
        <div className="flex-1 flex flex-col gap-2 min-w-0">
          {pieData.map(d => {
            const pct = Math.round((d.value / total) * 100);
            return (
              <div key={d.name} className="flex items-center gap-2">
                {/* Color dot */}
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: d.color }} />
                {/* Name + label */}
                <span className="text-[10px] text-[#5A8FB8] w-16 flex-shrink-0">{d.name}</span>
                {/* Bar */}
                <div className="flex-1 h-1.5 rounded-full bg-[#1E3358]/40 overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${pct}%`, background: d.color }} />
                </div>
                {/* Count + pct */}
                <span className="text-[10px] tabular-nums text-[#3D6080] flex-shrink-0 w-14 text-right">
                  {d.value}× · {pct}%
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Sub-caption */}
      <div className="flex items-center justify-between border-t border-[#1E3358]/25 pt-3">
        <span className="text-[10px] text-[#3D6080]">{total} sessions total</span>

        <div className="flex gap-2">
          {BUCKETS.filter(b => pieData.some(p => p.name === b.name)).map(b => (
            <span key={b.name} className="text-[9px] px-2 py-0.5 rounded-full border"
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