import React, { useEffect, useMemo, useState } from 'react';
import api from '../../api';
import StatCard from './StatCard';
import { ResponsiveContainer, LineChart, Line } from 'recharts';
import { Chart3Colors } from './Chart3StyleComponents';
import { m } from 'framer-motion';

const daysAgo = (n) => { const d = new Date(); d.setHours(0,0,0,0); d.setDate(d.getDate() - n); return d; };
const buildDaysArray = (n) => { const arr=[]; for (let i=n-1;i>=0;i--){ const d=daysAgo(i); arr.push({ key: d.toISOString().slice(0,10), dateObj:d }); } return arr; };
const formatDuration = (minutes) => { if (minutes < 60) return `${minutes} min`; const h=Math.floor(minutes/60), m=minutes%60; return `${h}h ${m}m`; };
const safePct = (curr, prev) => { if (prev===0 && curr===0) return 0; if (prev===0) return 100; return ((curr-prev)/Math.abs(prev))*100; };

const weekdayShort = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

// --- new helpers
const parseDateFromSession = (s) => {
  // try common names used in your backend
  const raw = s.sessionDate ?? s.date ?? s.createdAt ?? s.timestamp ?? s.session_date ?? s.session_date_iso;
  if (!raw) return null;
  const d = new Date(raw);
  if (isNaN(d.getTime())) return null;
  d.setHours(0,0,0,0);
  return d;
};


// 1. parseMinutesFromSession
const parseMinutesFromSession = (s) => {
  let v = s.sessionLength ?? s.length ?? s.duration ?? s.time ?? s.minutes ?? 0;

  if (v > 720) v = v / 60;

  if (v > 1000000) v = v / 60000;

  return Number(v.toFixed(2)); 
};





const parseMoodFromSession = (s) => {
  return s.moodAfter ?? s.mood ?? s.moodBefore ?? s.mood_before ?? null;
};

// --- component
const StatsCards = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const res = await api.get('/sessions');
        if (!mounted) return;
        const data = Array.isArray(res.data) ? res.data : [];
        //  you can see exactly what backend returns
        console.info('sessions fetched:', data.slice(0,10)); 
        setSessions(data);
      } catch(e){
        console.error('failed to fetch sessions', e);
        if (mounted) setSessions([]);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

const dayMap = useMemo(() => {
  const map = {};
  sessions.forEach(s => {
    const dObj = parseDateFromSession(s);
    if (!dObj) return;
    const key = dObj.toISOString().slice(0,10);
    if (!map[key]) map[key] = { minutes:0, sessions:0, moods:[] };
    const minutes = parseMinutesFromSession(s); // minutes int
    map[key].minutes += minutes; // decimal sum
    map[key].sessions += 1;
    const mood = parseMoodFromSession(s);
    if (mood) map[key].moods.push(String(mood).toLowerCase());
  });
  return map;
}, [sessions]);


  const last14 = useMemo(()=>buildDaysArray(14), []);
  const last7 = useMemo(()=> last14.slice(7), [last14]);
  const last28 = useMemo(()=>buildDaysArray(28), []);
  const last30 = useMemo(()=>buildDaysArray(30), []);

  const last7Data = useMemo(() => last7.map(d => ({
    key: d.key,
    minutes: dayMap[d.key]?.minutes || 0,
    sessions: dayMap[d.key]?.sessions || 0,
  })), [last7, dayMap]);

  const prev7Data = useMemo(() => last14.slice(0,7).map(d => ({
    key: d.key,
    minutes: dayMap[d.key]?.minutes || 0,
    sessions: dayMap[d.key]?.sessions || 0,
  })), [last14, dayMap]);

  const totalSessionsLast7 = useMemo(()=> last7Data.reduce((a,b)=>a+b.sessions,0), [last7Data]);
  const totalSessionsPrev7 = useMemo(()=> prev7Data.reduce((a,b)=>a+b.sessions,0), [prev7Data]);
  const totalMinutesLast7 = useMemo(()=> last7Data.reduce((a,b)=>a+b.minutes,0), [last7Data]);
  const totalMinutesPrev7 = useMemo(()=> prev7Data.reduce((a,b)=>a+b.minutes,0), [prev7Data]);

  const avgSessionLast7 = useMemo(()=> totalSessionsLast7 ? Math.round(totalMinutesLast7/Math.max(1,totalSessionsLast7)) : 0, [totalMinutesLast7, totalSessionsLast7]);
  const avgSessionPrev7 = useMemo(()=> totalSessionsPrev7 ? Math.round(totalMinutesPrev7/Math.max(1,totalSessionsPrev7)) : 0, [totalMinutesPrev7, totalSessionsPrev7]);

  const avgPct = useMemo(() => safePct(avgSessionLast7, avgSessionPrev7), [avgSessionLast7, avgSessionPrev7]);
  const sessionsPct = useMemo(() => safePct(totalSessionsLast7, totalSessionsPrev7), [totalSessionsLast7, totalSessionsPrev7]);

  const miniAvgData = useMemo(() => last7Data.map(d => ({ name:d.key, value: d.sessions? Math.round(d.minutes/Math.max(1,d.sessions)) : 0 })), [last7Data]);
  const miniSessionsData = useMemo(() => last7Data.map(d => ({ name:d.key, value: d.sessions })), [last7Data]);
  const miniConsistencyData = useMemo(() => last7Data.map(d => ({ name:d.key, value: d.sessions>0 ? 1 : 0 })), [last7Data]);

// 2. bestWeekday 
const bestWeekday = useMemo(() => {
  const totals = Array(7).fill(0);
  const counts = Array(7).fill(0);

  // last 28 days
  last28.forEach(d => {
    const wd = d.dateObj.getDay(); // 0 = Sun, 6 = Sat
    const minutes = dayMap[d.key]?.minutes || 0;
    totals[wd] += minutes;
    if (minutes > 0) counts[wd]++;
  });

  // Average with 1 decimal
  const avgs = totals.map((total, i) => {
    const avg = counts[i] > 0 ? total / counts[i] : 0;
    return Number(avg.toFixed(1)); // 5.3, 12.0, 0.0
  });

  // Best day
  let bestIdx = 0;
  for (let i = 1; i < 7; i++) {
    if (avgs[i] > avgs[bestIdx]) bestIdx = i;
  }

  const names = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return {
    idx: bestIdx,
    name: names[bestIdx],
    avg: avgs[bestIdx], // inthere .toFixed(1)
    averages: avgs,
  };
}, [last28, dayMap]);

const moodStats = useMemo(() => {
  const stats = {
    positive: { count: 0, percentage: 0 },
    neutral: { count: 0, percentage: 0 },
    negative: { count: 0, percentage: 0 },
    total: 0,
  };

  const moodValues = sessions
    .map(s => s.moodAfter ?? s.mood ?? s.moodBefore ?? null)
    .filter(m => m !== null && m >= 1 && m <= 10);

  stats.total = moodValues.length;

  moodValues.forEach(mood => {
    if (mood >= 8) stats.positive.count++;
    else if (mood >= 4) stats.neutral.count++;
    else stats.negative.count++;
  });

  if (stats.total > 0) {
    stats.positive.percentage = Math.round((stats.positive.count / stats.total) * 100);
    stats.neutral.percentage = Math.round((stats.neutral.count / stats.total) * 100);
    stats.negative.percentage = Math.round((stats.negative.count / stats.total) * 100);
  }

  return stats;
}, [sessions]);

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Total sessions*/}
        <StatCard
          value={loading ? '—' : String(totalSessionsLast7)}
          subValue={
            <span className={sessionsPct > 0 ? 'text-emerald-400' : 'text-rose-400'}>
              {(sessionsPct > 0 ? '+' : '') + Math.round(sessionsPct) + '%'} vs prev 7d
            </span>
          }
          label="Total sessions (last 7 days)"
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={miniSessionsData} margin={{ top: 15, right: 15, left: 15, bottom: 15 }}>
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke={Chart3Colors.hover} 
                strokeWidth={5}
                dot={false}
                strokeLinecap="round"
                style={{ 
                  filter: 'drop-shadow(0 0 10px rgba(0, 255, 136, 0.8))',
                  animation: 'dash 2s linear infinite'
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        </StatCard>

        {/* Consistency*/}
        <StatCard
          value={loading ? '—' : `${Math.round((last7Data.filter(d => d.sessions > 0).length / 7) * 100)}%`}
          label="Consistency (days with a session, 7d)"
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={miniConsistencyData} margin={{ top: 15, right: 15, left: 15, bottom: 15 }}>
              <Line 
                type="stepAfter" 
                dataKey="value" 
                stroke={Chart3Colors.consistency}
                strokeWidth={5}
                dot={{ fill: Chart3Colors.consistency, r: 6 }}
                activeDot={{ r: 8 }}
                style={{ filter: 'drop-shadow(0 0 10px rgba(90, 143, 255, 0.9))' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </StatCard>

        {/* Avg session */}
        <StatCard
          value={loading ? '—' : formatDuration(avgSessionLast7)}
          subValue={
            <span className={avgPct > 0 ? 'text-emerald-400' : 'text-rose-400'}>
              {(avgPct > 0 ? '+' : '') + Math.round(avgPct) + '%'} vs prev 7d
            </span>
          }
          label="Avg session (last 7 days)"
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={miniAvgData} margin={{ top: 15, right: 15, left: 15, bottom: 15 }}>
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke={Chart3Colors.primary}
                strokeWidth={5}
                dot={false}
                style={{ filter: 'drop-shadow(0 0 8px rgba(58, 130, 247, 0.7))' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </StatCard>

        {/* Best day */}
        <StatCard
          value={loading ? '—' : bestWeekday.name}
          label={`Best day • ${bestWeekday.avg} min avg (4 wks)`}
        >
          <div className="h-full flex flex-col justify-center gap-1.5 text-xs">
            {bestWeekday.averages.map((avg, i) => {
              const maxA = Math.max(...bestWeekday.averages, 0.1);
              const pct = avg / maxA;

              return (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-7 text-[10px] font-medium text-slate-400">
                    {weekdayShort[i]}
                  </div>
                  
                  <div className="flex-1 h-2.5 rounded-full bg-slate-800/50 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500 ease-out"
                      style={{
                        width: `${Math.min(pct * 100, 100)}%`,
                        background: i === bestWeekday.idx
                          ? 'linear-gradient(90deg, #3A82F7, #70B8FF)'
                          : 'rgba(255,255,255,0.25)',
                        boxShadow: i === bestWeekday.idx
                          ? '0 0 8px rgba(58, 130, 247, 0.6)'
                          : 'none',
                      }}
                    />
                  </div>

                  <div className="w-10 text-right text-[10px] font-medium text-slate-400">
                    {avg === 0 ? '—' : `${avg}m`}
                  </div>
                </div>
              );
            })}
          </div>
        </StatCard>

        {/* Mood Breakdown */}
        <StatCard
          value={loading ? '—' : moodStats.total > 0 ? `${moodStats.positive.percentage}%` : '—'}
          label="Mood Breakdown (All time)"
        >
          <div className="h-full flex flex-col justify-center gap-3">
            {/* Positive */}
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-sm" style={{ background: '#04CE00' }} />
              <div className="flex-1 h-3 rounded-full bg-slate-800/50 overflow-hidden">
                <div 
                  className="h-full transition-all duration-700 ease-out"
                  style={{ 
                    width: `${moodStats.positive.percentage}%`, 
                    background: 'linear-gradient(90deg, #04CE00, #00FFA3)' 
                  }} 
                />
              </div>
              <div className="w-16 text-right text-sm font-medium text-[#AEE6FF]">
                {moodStats.positive.percentage}%
              </div>
              <div className="text-xs text-slate-500">({moodStats.positive.count})</div>
            </div>

            {/* Neutral */}
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-sm" style={{ background: '#7A8194' }} />
              <div className="flex-1 h-3 rounded-full bg-slate-800/50 overflow-hidden">
                <div 
                  className="h-full transition-all duration-700 ease-out"
                  style={{ 
                    width: `${moodStats.neutral.percentage}%`, 
                    background: 'linear-gradient(90deg, #7A8194, #B0B7C9)' 
                  }} 
                />
              </div>
              <div className="w-16 text-right text-sm font-medium text-[#AEE6FF]">
                {moodStats.neutral.percentage}%
              </div>
              <div className="text-xs text-slate-500">({moodStats.neutral.count})</div>
            </div>

            {/* Negative */}
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-sm" style={{ background: '#FF4D4F' }} />
              <div className="flex-1 h-3 rounded-full bg-slate-800/50 overflow-hidden">
                <div 
                  className="h-full transition-all duration-700 ease-out"
                  style={{ 
                    width: `${moodStats.negative.percentage}%`, 
                    background: 'linear-gradient(90deg, #FF4D4F, #FF8A8A)' 
                  }} 
                />
              </div>
              <div className="w-16 text-right text-sm font-medium text-[#AEE6FF]">
                {moodStats.negative.percentage}%
              </div>
              <div className="text-xs text-slate-500">({moodStats.negative.count})</div>
            </div>

            {/* Total */}
            <div className="mt-2 pt-2 border-t border-slate-700 flex justify-between text-xs">
              <span className="text-slate-400">Total entries</span>
              <span className="font-medium text-[#70B8FF]">{moodStats.total}</span>
            </div>
          </div>
        </StatCard>

        {/* Heatmap */}
        <StatCard
          value={loading ? '—' : `${sessions.length} sessions`}
          label="Sessions heatmap (last 28 days)"
        >
          <div className="h-full grid grid-cols-4 grid-rows-7 gap-1.5">
            {(() => {
              const days = buildDaysArray(28);
              const weeks = [[],[],[],[]];
              for (let i=0;i<28;i++) weeks[Math.floor(i/7)].push(days[i]);
              const cells = weeks.map(w => w.map(d => ({ key:d.key, minutes: (dayMap[d.key]?.minutes || 0) })));
              const max = Math.max(1, ...cells.flat().map(c=>c.minutes));
              const out = [];
              for (let row=0; row<7; row++) {
                for (let col=0; col<4; col++) {
                  const cell = cells[col] && cells[col][row] ? cells[col][row] : { minutes:0 };
                  const intensity = Math.min(1, cell.minutes / max);
                  const bg = `rgba(45,91,255,${0.08 + intensity*0.86})`;
                  out.push(<div key={`${row}-${col}`} className="rounded" style={{ background: bg }} />);
                }
              }
              return out;
            })()}
          </div>
        </StatCard>
      </div>
    </div>
  );
};

export default StatsCards;
