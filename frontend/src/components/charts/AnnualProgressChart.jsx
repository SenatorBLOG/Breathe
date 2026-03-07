// AnnualProgressChart.tsx
import React, { useState, useEffect, useMemo } from 'react';
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LabelList,
  CartesianGrid
} from 'recharts';
import { Chart3BlueContainer, Chart3Colors, Chart3Dropdown } from './Chart3StyleComponents';
import api from '../../api';
import { Bot } from 'lucide-react';

const AnnualProgressChart = ({ currentSession = null }) => {
  const [rawSessions, setRawSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('Last 12 months');

  useEffect(() => { fetchSessions(); }, []);

  async function fetchSessions() {
    setLoading(true);
    try {
      const res = await api.get('/sessions');
      const sessions = (res.data || []).map(s => ({
        ...s,
        dateObj: new Date(s.sessionDate || s.date),
        minutes: Number(s.sessionLength ?? s.minutes ?? (s.time ? s.time / 60 : 0)) || 0,
        cycles: Number(s.cycles || 0)
      }));
      setRawSessions(sessions);
    } catch (err) {
      console.error('Error fetching sessions:', err);
    } finally {
      setLoading(false);
    }
  }

  const monthsLabels = (d) => {
    const M = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const year = String(d.getFullYear()).slice(-2);
    return `${M[d.getMonth()]} ${year}`;
  };

  const last12Months = useMemo(() => {
    const arr = [];
    const now = new Date();
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2,'0')}`;
      arr.push({ dateObj: d, key, label: monthsLabels(d) });
    }
    return arr;
  }, []);

  const monthlyData = useMemo(() => {
    const map = Object.fromEntries(last12Months.map(m => [m.key, { ...m, minutes: 0, sessions: 0, cycles: 0 }]));
    
    rawSessions.forEach(s => {
      const d = s.dateObj;
      if (!d || isNaN(d)) return;
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2,'0')}`;
      if (!map[key]) return;
      map[key].minutes += s.minutes;
      map[key].sessions += 1;
      map[key].cycles += s.cycles;
    });

    return Object.values(map).map(m => {
      const total = Math.round(m.minutes * 10) / 10;
      const seg = total / 4;
      const seg1 = Math.round(seg * 10) / 10;
      const seg2 = Math.round(seg * 10) / 10;
      const seg3 = Math.round(seg * 10) / 10;
      const seg4 = Math.round((total - seg1 - seg2 - seg3) * 10) / 10;

      return {
        name: m.label,
        totalMinutes: total,
        sessions: m.sessions,
        cycles: m.cycles,
        segment1: seg1,
        segment2: seg2,
        segment3: seg3,
        segment4: seg4,
        lineValue: m.sessions
      };
    });
  }, [rawSessions, last12Months]);

  const yearlyData = useMemo(() => {
    const map = {};
    rawSessions.forEach(s => {
      const y = s.dateObj?.getFullYear() || new Date(s.sessionDate || s.date).getFullYear();
      if (!map[y]) map[y] = { year: y, minutes: 0, sessions: 0, cycles: 0 };
      map[y].minutes += s.minutes;
      map[y].sessions += 1;
      map[y].cycles += s.cycles;
    });
    return Object.values(map).sort((a,b) => a.year - b.year).map(item => {
      const total = Math.round(item.minutes * 10) / 10;
      const seg = total / 4;
      const seg1 = Math.round(seg * 10) / 10;
      const seg2 = Math.round(seg * 10) / 10;
      const seg3 = Math.round(seg * 10) / 10;
      const seg4 = Math.round((total - seg1 - seg2 - seg3) * 10) / 10;
      return {
        name: String(item.year),
        totalMinutes: total,
        sessions: item.sessions,
        cycles: item.cycles,
        segment1: seg1,
        segment2: seg2,
        segment3: seg3,
        segment4: seg4,
        lineValue: item.sessions
      };
    });
  }, [rawSessions]);

  const data = view === 'Yearly summary' ? yearlyData : monthlyData;
  const maxRaw = data.length ? Math.max(...data.map(d => d.totalMinutes || 0)) : 1;
  const step = Math.ceil(maxRaw / 3);
  const yMax = step * 3;

  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload || !payload.length) return null;
    const p = payload[0].payload;
    return (
      <div className="rounded-xl px-5 py-3 shadow-2xl border border-white/20"
           style={{ background: 'rgba(15, 30, 51, 0.95)', backdropFilter: 'blur(12px)' }}>
        <div className="font-bold text-[#70B8FF] text-lg">{p.name}</div>
        <div className="text-[#AEE6FF] text-sm">{p.totalMinutes} min • {p.sessions} sessions</div>
        <div className="text-[#88AACC] text-xs">{p.cycles} cycles</div>
      </div>
    );
  };

  return (
    <Chart3BlueContainer 
      title={view === 'Yearly summary' ? 'Yearly meditation' : 'Last 12 months'} 
      subtitle="Total time & sessions"
      width="100%" 
      height="420px"
    >
      {/* DROPDOWN  */}
      <div className="absolute right-8 top-8 z-10">
        <Chart3Dropdown
          value={view}
          onChange={setView}
          options={['Last 12 months', 'Yearly summary']}
        />
      </div>

      {/* Live session */}
      {currentSession && (
        <div className="absolute left-8 top-24 px-4 py-3 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20">
          <div className="text-xs text-[#88AACC]">Live session</div>
          <div className="text-2xl font-bold text-[#70B8FF]">
            {Math.floor((currentSession.time||0)/60)}:{String((currentSession.time||0)%60).padStart(2,'0')}
          </div>
          <div className="text-xs text-[#AEE6FF]">{currentSession.cycles || 0} cycles</div>
        </div>
      )}

      <ResponsiveContainer>
        <ComposedChart data={data} margin={{ top: 20, right: 0, left: 0, bottom: 0 }}barCategoryGap="10%" barGap={-20} >
          <CartesianGrid vertical={false} strokeDasharray="4 4" stroke="rgba(112, 184, 255, 0.15)" />
          <XAxis 
          dataKey="name" 
          axisLine={false} 
          tickLine={false}
          tick={{ fill: '#AEE6FF', fontSize: 13, fontWeight: 500 }}
          interval={0}
          padding={{ left: 0, right: 0 }} 
          height={50}
        />

          
          <YAxis 
            yAxisId="left" 
            axisLine={false} 
            tickLine={false}
            tick={{ fill: '#88AACC', fontSize: 12 }}
            domain={[0, yMax]}
          />
          
          <YAxis 
            yAxisId="right" 
            orientation="right" 
            axisLine={false} 
            tickLine={false}
            tick={{ fill: '#70B8FF', fontSize: 11 }}
          />

          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(112, 184, 255, 0.1)' }} />

          {/* Segments — Chart3Colors */}
          <Bar yAxisId="left" dataKey="segment1" stackId="a" fill="#70B8FF" radius={[0,0,8,8]} />
          <Bar yAxisId="left" dataKey="segment2" stackId="a" fill="#62AAFB" />
          <Bar yAxisId="left" dataKey="segment3" stackId="a" fill="#549BF6" />
          <Bar yAxisId="left" dataKey="segment4" stackId="a" fill="#387DED" radius={[8,8,0,0]} />

          {/* Top resource */}
          <Bar yAxisId="left" dataKey="totalMinutes" fill="transparent">
            <LabelList 
              dataKey="totalMinutes" 
              position="top-right" 
              formatter={(v) => v > 0 ? `${v}m` : ''} 
              style={{ fill: '#AEE6FF', fontSize: 13, fontWeight: 'bold', }}
            />
          </Bar>

          {/* line sessions */}
          <Line 
            yAxisId="right" 
            type="monotone" 
            dataKey="lineValue" 
            stroke="#00ff88" 
            strokeWidth={4}
            dot={{ fill: '#00ff88', r: 3 }}
            activeDot={{ r: 8 }}
            style={{ filter: 'drop-shadow(0 0 8px rgba(0, 255, 136, 0.7))' }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </Chart3BlueContainer>
  );
};

export default AnnualProgressChart;