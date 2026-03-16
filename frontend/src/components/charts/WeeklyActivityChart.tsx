// src/components/charts/ActivityChart.tsx
import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Cell, CartesianGrid,
} from 'recharts';
import api from '../../api';

interface Session {
  sessionDate: string;
  sessionLength: number;
  cycles: number;
}

// ─── Custom tooltip ───────────────────────────────────────────────────────────
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="px-3 py-2 rounded-xl text-xs border bg-[#060C1A]/95 border-[#1E3358]/70 text-[#7AC4FF]">
      <p className="text-[#3D6080] mb-0.5">{label}</p>
      <p className="font-medium">{payload[0].value} min</p>
    </div>
  );
}

// ─── Period pill tabs ─────────────────────────────────────────────────────────
function PeriodTabs({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex gap-1">
      {['Weekly', 'Monthly', 'Yearly'].map(p => (
        <button
          key={p}
          onClick={() => onChange(p)}
          className={`px-3 py-1 rounded-lg text-[10px] uppercase tracking-widest border transition-all ${
            value === p
              ? 'bg-[#0D1B33] border-[#2A5499]/60 text-[#7AC4FF]'
              : 'border-[#1E3358]/35 text-[#3D6080] hover:border-[#1E3358]/60 hover:text-[#3D6080]'
          }`}
        >
          {p}
        </button>
      ))}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
const ActivityChart = () => {
  const [data, setData]               = useState<any[]>([]);
  const [period, setPeriod]           = useState('Weekly');
  const [loading, setLoading]         = useState(true);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);

    api.get('/sessions')
      .then(res => {
        if (!mounted) return;
        const sessions: Session[] = Array.isArray(res.data) ? res.data : [];
        const now = new Date();

        if (period === 'Weekly') {
          const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
          // Build ordered last-7-days map
          const ordered: string[] = [];
          const weekData: Record<string, number> = {};
          for (let i = 6; i >= 0; i--) {
            const d = new Date(); d.setDate(d.getDate() - i);
            const key = days[d.getDay()];
            ordered.push(key);
            weekData[key] = 0;
          }
          sessions.forEach(s => {
            const d    = new Date(s.sessionDate);
            const diff = Math.floor((now.getTime() - d.getTime()) / 86400000);
            if (diff >= 0 && diff <= 6) weekData[days[d.getDay()]] += s.sessionLength;
          });
          setData(ordered.map(name => ({
            name,
            value: Math.round(weekData[name]),
            active: name === days[now.getDay()],
          })));
        }

        else if (period === 'Monthly') {
          const y = now.getFullYear(), m = now.getMonth();
          const dim = new Date(y, m + 1, 0).getDate();
          const monthData: Record<number, number> = {};
          for (let i = 1; i <= dim; i++) monthData[i] = 0;
          sessions.forEach(s => {
            const d = new Date(s.sessionDate);
            if (d.getFullYear() === y && d.getMonth() === m)
              monthData[d.getDate()] += s.sessionLength;
          });
          setData(Object.entries(monthData).map(([day, value]) => ({
            name: Number(day) % 5 === 0 || Number(day) === 1 ? day : '', // show every 5th tick
            fullName: day,
            value: Math.round(value),
            active: Number(day) === now.getDate(),
          })));
        }

        else if (period === 'Yearly') {
          const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
          const yearData: Record<string, number> = Object.fromEntries(months.map(m => [m, 0]));
          sessions.forEach(s => {
            const d = new Date(s.sessionDate);
            if (d.getFullYear() === now.getFullYear())
              yearData[months[d.getMonth()]] += s.sessionLength;
          });
          setData(months.map(name => ({
            name,
            value: Math.round(yearData[name]),
            active: name === months[now.getMonth()],
          })));
        }
      })
      .catch(() => { if (mounted) setData([]); })
      .finally(() => { if (mounted) setLoading(false); });

    return () => { mounted = false; };
  }, [period]);

  const maxValue = Math.max(...data.map(d => d.value), 10);
  const step     = Math.ceil(maxValue / 4);

  // ─── Loading ───────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex flex-col gap-2 animate-pulse">
        <div className="h-4 w-1/4 bg-[#1E3358]/50 rounded-lg" />
        <div className="h-44 bg-[#1E3358]/30 rounded-xl" />
      </div>
    );
  }

  // ─── Empty ─────────────────────────────────────────────────────────────────
  if (!data.length || data.every(d => d.value === 0)) {
    return (
      <div className="flex flex-col gap-3">
        <PeriodTabs value={period} onChange={setPeriod} />
        <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
          <span className="text-3xl opacity-30">📊</span>
          <p className="text-[#3D6080] text-xs">No activity yet</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <p className="text-[10px] text-[#3D6080]">minutes per {period === 'Weekly' ? 'day' : period === 'Monthly' ? 'day' : 'month'}</p>
        <PeriodTabs value={period} onChange={setPeriod} />
      </div>

      {/* Chart */}
      <div style={{ height: 180 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 4, right: 4, left: -18, bottom: 0 }}
            onMouseMove={(d: any) =>
              d?.activeTooltipIndex !== undefined
                ? setHoveredIndex(d.activeTooltipIndex)
                : setHoveredIndex(null)
            }
            onMouseLeave={() => setHoveredIndex(null)}
          >
            <CartesianGrid strokeDasharray="2 4" vertical={false} stroke="rgba(30,51,88,0.35)" />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 9, fill: '#2A4060', fontFamily: 'Montserrat' }}
              dy={6}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              domain={[0, maxValue]}
              ticks={[0, step, step * 2, step * 3, step * 4]}
              tick={{ fontSize: 9, fill: '#2A4060', fontFamily: 'Montserrat' }}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(74,158,255,0.04)' }} />
            <Bar dataKey="value" radius={[5, 5, 0, 0]} maxBarSize={28} isAnimationActive>
              {data.map((entry, i) => (
                <Cell
                  key={i}
                  fill={
                    hoveredIndex === i
                      ? '#7AC4FF'
                      : entry.active
                      ? '#3A82F7'
                      : '#1A3A6A'
                  }
                  opacity={hoveredIndex !== null && hoveredIndex !== i ? 0.5 : 1}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ActivityChart;