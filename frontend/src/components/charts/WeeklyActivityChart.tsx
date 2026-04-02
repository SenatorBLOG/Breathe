// src/components/charts/ActivityChart.tsx
import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Cell, CartesianGrid,
} from 'recharts';
import api from '../../api';
import { useThemeStyles } from "../../hooks/useThemeStyles";

interface Session {
  sessionDate: string;
  sessionLength: number;
  cycles: number;
}

// ─── Custom tooltip ───────────────────────────────────────────────────────────
function CustomTooltip({ active, payload, label }: any) {
  const ts = useThemeStyles();
  if (!active || !payload?.length) return null;
  return (
    <div className="px-3 py-2 rounded-xl t-caption border backdrop-blur-md"
      style={{ 
        backgroundColor: `${ts.cardBg}F2`, // 95% opacity
        borderColor: ts.border, 
        color: ts.accent 
      }}>
      <p style={{ color: ts.textSecondary }} className="mb-0.5">{label}</p>
      <p className="font-bold">{payload[0].value} min</p>
    </div>
  );
}

// ─── Period pill tabs ─────────────────────────────────────────────────────────
function PeriodTabs({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const ts = useThemeStyles();
  return (
    <div className="flex gap-1">
      {['Weekly', 'Monthly', 'Yearly'].map(p => {
        const isActive = value === p;
        return (
          <button
            key={p}
            onClick={() => onChange(p)}
            className="px-3 py-1 rounded-lg t-label uppercase tracking-widest border transition-all duration-300"
            style={{
              backgroundColor: isActive ? `${ts.accent}15` : 'transparent',
              borderColor: isActive ? `${ts.accent}60` : `${ts.border}40`,
              color: isActive ? ts.accent : ts.textSecondary,
            }}
          >
            {p}
          </button>
        );
      })}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
const ActivityChart = () => {
  const ts = useThemeStyles();
  const [data, setData] = useState<any[]>([]);
  const [period, setPeriod] = useState('Weekly');
  const [loading, setLoading] = useState(true);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);

    api.get('/sessions')
      .then(res => {
        if (!mounted) return;
        const sessions: Session[] = Array.isArray(res.data) ? res.data : [];
        const now = new Date();

        // Логика обработки данных остается прежней...
        if (period === 'Weekly') {
          const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
          const ordered: string[] = [];
          const weekData: Record<string, number> = {};
          for (let i = 6; i >= 0; i--) {
            const d = new Date(); d.setDate(d.getDate() - i);
            const key = days[d.getDay()];
            ordered.push(key);
            weekData[key] = 0;
          }
          sessions.forEach(s => {
            const d = new Date(s.sessionDate);
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
            name: Number(day) % 5 === 0 || Number(day) === 1 ? day : '',
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
  const step = Math.ceil(maxValue / 4);

  if (loading) {
    return (
      <div className="flex flex-col gap-2 animate-pulse">
        <div className="h-4 w-1/4 rounded-lg" style={{ background: `${ts.border}40` }} />
        <div className="h-44 rounded-xl" style={{ background: `${ts.border}20` }} />
      </div>
    );
  }

  if (!data.length || data.every(d => d.value === 0)) {
    return (
      <div className="flex flex-col gap-3">
        <PeriodTabs value={period} onChange={setPeriod} />
        <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
          <span className="text-3xl opacity-20">📊</span>
          <p style={{ color: ts.textSecondary }} className="t-caption italic">No activity yet</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p style={{ color: ts.textSecondary }} className="t-label uppercase tracking-wider font-medium">
          min / {period === 'Weekly' ? 'day' : period === 'Monthly' ? 'day' : 'month'}
        </p>
        <PeriodTabs value={period} onChange={setPeriod} />
      </div>

      <div style={{ height: 180 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 4, right: 4, left: -22, bottom: 0 }}
            onMouseMove={(d: any) =>
              d?.activeTooltipIndex !== undefined
                ? setHoveredIndex(d.activeTooltipIndex)
                : setHoveredIndex(null)
            }
            onMouseLeave={() => setHoveredIndex(null)}
          >
            <CartesianGrid 
              strokeDasharray="3 3" 
              vertical={false} 
              stroke={`${ts.border}30`} 
            />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: ts.textSecondary, fontWeight: 500 }}
              dy={8}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              domain={[0, maxValue]}
              ticks={[0, step, step * 2, step * 3, step * 4]}
              tick={{ fontSize: 11, fill: ts.textSecondary, fontWeight: 500 }}
            />
            <Tooltip 
              content={<CustomTooltip />} 
              cursor={{ fill: `${ts.accent}08` }} 
            />
            <Bar dataKey="value" radius={[4, 4, 0, 0]} maxBarSize={24}>
              {data.map((entry, i) => (
                <Cell
                  key={i}
                  fill={
                    hoveredIndex === i
                      ? ts.accentLight
                      : entry.active
                      ? ts.accent
                      : `${ts.accent}33` // Заглушенные бары — прозрачный акцент
                  }
                  className="transition-all duration-300"
                  style={{ opacity: hoveredIndex !== null && hoveredIndex !== i ? 0.6 : 1 }}
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