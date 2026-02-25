// ActivityChart.tsx
import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from 'recharts';
import { Chart3BlueContainer, Chart3Colors, Chart3Dropdown } from './Chart3StyleComponents';
import api from '../../api';

interface Session {
  sessionDate: string;
  sessionLength: number; // in minutes 0.2
  cycles: number;
}

const ActivityChart = () => {
  const [data, setData] = useState<any[]>([]);
  const [period, setPeriod] = useState('Weekly');
  const [loading, setLoading] = useState(true);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const fetchAndAggregate = async () => {
    setLoading(true);
    try {
      const res = await api.get('/sessions');
      const sessions: Session[] = res.data;

      const now = new Date();
      const todayISO = now.toISOString().slice(0, 10);

      if (period === 'Weekly') {
        const weekData: { [key: string]: number } = {};
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

        // for last 7 days
        for (let i = 6; i >= 0; i--) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          const dayName = days[date.getDay()];
          weekData[dayName] = 0;
        }

        sessions.forEach(s => {
          const date = new Date(s.sessionDate);
          const iso = date.toISOString().slice(0, 10);
          const dayName = days[date.getDay()];

          const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
          if (diffDays <= 6 && diffDays >= 0) {
            weekData[dayName] += s.sessionLength;
          }
        });

        const mapped = Object.entries(weekData).map(([name, value]) => ({
          name,
          value: Math.round(value), // round for show
          active: name === days[now.getDay()],
        }));

        setData(mapped);
      }

      else if (period === 'Monthly') {
        const monthData: { [key: number]: number } = {};
        const year = now.getFullYear();
        const month = now.getMonth();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        for (let i = 1; i <= daysInMonth; i++) {
          monthData[i] = 0;
        }

        sessions.forEach(s => {
          const date = new Date(s.sessionDate);
          if (date.getFullYear() === year && date.getMonth() === month) {
            const day = date.getDate();
            monthData[day] += s.sessionLength;
          }
        });

        const mapped = Object.entries(monthData).map(([day, value]) => ({
          name: day,
          value: Math.round(value),
          active: Number(day) === now.getDate(),
        }));

        setData(mapped);
      }

      else if (period === 'Yearly') {
        const yearData: { [key: string]: number } = {
          Jan: 0, Feb: 0, Mar: 0, Apr: 0, May: 0, Jun: 0,
          Jul: 0, Aug: 0, Sep: 0, Oct: 0, Nov: 0, Dec: 0,
        };

        const monthNames = Object.keys(yearData);

        sessions.forEach(s => {
          const date = new Date(s.sessionDate);
          if (date.getFullYear() === now.getFullYear()) {
            const monthName = monthNames[date.getMonth()];
            yearData[monthName] += s.sessionLength;
          }
        });

        const mapped = Object.entries(yearData).map(([name, value]) => ({
          name,
          value: Math.round(value),
          active: name === monthNames[now.getMonth()],
        }));

        setData(mapped);
      }

    } catch (err) {
      console.error('Error:', err);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAndAggregate();
  }, [period]);

  const maxValue = Math.max(...data.map(d => d.value), 10);
  const step = Math.ceil(maxValue / 3);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-md px-4 py-2 text-[16px] font-normal text-center" style={{ background: '#D9D9D9', color: '#12294E' }}>
          {payload[0].value} min
        </div>
      );
    }
    return null;
  };

  return (
    <Chart3BlueContainer title={`${period} Meditation`} subtitle="Activity" width="100%" height="425px">
      <div className="absolute right-[66px] top-[39px]">
        <Chart3Dropdown value={period} onChange={setPeriod} options={['Weekly', 'Monthly', 'Yearly']} className="w-[239px] h-[35px]" />
      </div>

      <div className="absolute left-[65px] top-[150px] w-[900px] h-[210px]">
        {loading ? (
          <div className="flex items-center justify-center h-full text-gray-400 text-lg">Loading...</div>
        ) : data.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-400 text-lg">No data yet</div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 20, right: 20, left: 10, bottom: 10 }}
              onMouseMove={(d: any) => d?.activeTooltipIndex !== undefined && setHoveredIndex(d.activeTooltipIndex)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.1)" />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 17, fill: Chart3Colors.textPrimary, fontFamily: 'Montserrat', dy: 20 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                domain={[0, maxValue]}
                ticks={[0, step, step * 2, step * 3]}
                tick={{ fontSize: 20, fill: Chart3Colors.textPrimary, fontFamily: 'Montserrat', dx: -30 }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" radius={[7, 7, 0, 0]} isAnimationActive={false}>
                {data.map((entry, i) => (
                  <Cell
                    key={i}
                    fill={hoveredIndex === i ? (Chart3Colors.hover || '#70B8FF') : entry.active ? Chart3Colors.primary : Chart3Colors.secondary}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </Chart3BlueContainer>
  );
};

export default ActivityChart;