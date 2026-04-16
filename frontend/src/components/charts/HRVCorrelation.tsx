// src/components/charts/HRVCorrelation.tsx
import { useMemo } from 'react';
import {
  ComposedChart, Bar, Line, XAxis, YAxis,
  Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine,
} from 'recharts';
import { useThemeStyles } from '../../hooks/useThemeStyles';
import { DailyHRV } from '../../hooks/useHealthData';

// ─── Types ────────────────────────────────────────────────────────────────────
interface Session {
  sessionDate: string;
  sessionLength?: number;
}

interface Props {
  hrv: DailyHRV[];
  sessions: Session[];
  loadingHealth: boolean;
}

interface ChartPoint {
  label: string;
  date: string;
  hrv: number | null;
  sessions: number;
}

// ─── Tooltip ──────────────────────────────────────────────────────────────────
function CustomTooltip({ active, payload }: any) {
  const ts = useThemeStyles();
  if (!active || !payload?.length) return null;
  const p: ChartPoint = payload[0].payload;
  return (
    <div
      className="rounded-2xl px-4 py-3 border t-caption"
      style={{
        background: ts.navBg,
        borderColor: ts.border,
        backdropFilter: 'blur(12px)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
      }}
    >
      <p className="font-medium mb-1" style={{ color: ts.textPrimary }}>{p.date}</p>
      {p.hrv !== null ? (
        <p style={{ color: '#4AE8A0' }}>{p.hrv} ms HRV</p>
      ) : (
        <p style={{ color: ts.textDim }}>No HRV data</p>
      )}
      {p.sessions > 0 ? (
        <p className="mt-0.5" style={{ color: ts.accent }}>
          {p.sessions} meditation session{p.sessions !== 1 ? 's' : ''}
        </p>
      ) : (
        <p className="mt-0.5" style={{ color: ts.textDim }}>No session</p>
      )}
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
const HRVCorrelation = ({ hrv, sessions, loadingHealth }: Props) => {
  const ts = useThemeStyles();

  // Build last-30-day chart data by joining HRV + sessions
  const { chartData, trend } = useMemo(() => {
    const today = new Date();
    const start = new Date(today);
    start.setDate(start.getDate() - 29);
    start.setHours(0, 0, 0, 0);

    // Index HRV by date — only store entries with an actual rmssd value
    const hrvByDate = new Map<string, number>();
    hrv.forEach(e => { if (e.date && e.rmssd !== null && e.rmssd !== undefined) hrvByDate.set(e.date, e.rmssd); });

    // Index sessions by date
    const sessionsByDate = new Map<string, number>();
    sessions.forEach(s => {
      const key = new Date(s.sessionDate).toISOString().slice(0, 10);
      sessionsByDate.set(key, (sessionsByDate.get(key) ?? 0) + 1);
    });

    const days: ChartPoint[] = [];
    for (let i = 0; i < 30; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      const key = d.toISOString().slice(0, 10);
      const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      days.push({
        label,
        date: key,
        hrv: hrvByDate.get(key) ?? null,
        sessions: sessionsByDate.get(key) ?? 0,
      });
    }

    // Trend summary
    const meditationDays = days.filter(d => d.sessions > 0 && d.hrv !== null);
    const restDays       = days.filter(d => d.sessions === 0 && d.hrv !== null);
    const avg = (arr: ChartPoint[]) =>
      arr.length
        ? Math.round((arr.reduce((s, d) => s + (d.hrv ?? 0), 0) / arr.length) * 10) / 10
        : null;

    const meditationAvg = avg(meditationDays);
    const restAvg       = avg(restDays);
    let percentDiff: number | null = null;
    if (meditationAvg !== null && restAvg !== null && restAvg > 0) {
      percentDiff = Math.round(((meditationAvg - restAvg) / restAvg) * 100);
    }

    return {
      chartData: days,
      trend: { meditationAvg, restAvg, percentDiff, meditationDaysCount: meditationDays.length },
    };
  }, [hrv, sessions]);

  const hasHRV = chartData.some(d => d.hrv !== null);

  // ─── Loading ───────────────────────────────────────────────────────────────
  if (loadingHealth) {
    return (
      <div className="flex flex-col gap-2 animate-pulse">
        <div className="h-4 w-1/3 rounded-lg" style={{ background: `${ts.border}80` }} />
        <div className="h-52 rounded-xl" style={{ background: `${ts.border}50` }} />
      </div>
    );
  }

  // ─── No data ───────────────────────────────────────────────────────────────
  if (!hasHRV) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
        <span className="text-3xl opacity-30">🫀</span>
        <p className="t-caption font-medium" style={{ color: ts.textMuted }}>No HRV data yet</p>
        <p className="t-label max-w-xs" style={{ color: ts.textDim }}>
          Connect your smartwatch via the Android app to see how meditation affects your heart rate variability
        </p>
      </div>
    );
  }

  const maxHRV = Math.max(...chartData.map(d => d.hrv ?? 0), 1);
  const yMax   = Math.ceil(maxHRV / 10) * 10 + 10;

  return (
    <div className="flex flex-col gap-4">

      {/* Trend summary cards */}
      {trend.percentDiff !== null && (() => {
        const pct = trend.percentDiff;
        return (
          <div className="grid grid-cols-3 gap-3">
            <div className="flex flex-col gap-1 p-3 rounded-xl" style={{ backgroundColor: `${ts.accent}12`, border: `1px solid ${ts.border}` }}>
              <p className="t-label" style={{ color: ts.textMuted }}>On meditation days</p>
              <p className="t-subheading font-medium tabular-nums" style={{ color: '#4AE8A0' }}>
                {trend.meditationAvg} ms
              </p>
              <p className="t-label" style={{ color: ts.textDim }}>avg HRV</p>
            </div>
            <div className="flex flex-col gap-1 p-3 rounded-xl" style={{ backgroundColor: `${ts.cardBg}`, border: `1px solid ${ts.border}` }}>
              <p className="t-label" style={{ color: ts.textMuted }}>Rest days</p>
              <p className="t-subheading font-medium tabular-nums" style={{ color: ts.textSecondary }}>
                {trend.restAvg} ms
              </p>
              <p className="t-label" style={{ color: ts.textDim }}>avg HRV</p>
            </div>
            <div className="flex flex-col gap-1 p-3 rounded-xl" style={{
              backgroundColor: pct > 0 ? `rgba(74,232,160,0.08)` : `rgba(255,138,138,0.08)`,
              border: `1px solid ${ts.border}`,
            }}>
              <p className="t-label" style={{ color: ts.textMuted }}>Difference</p>
              <p className="t-subheading font-medium tabular-nums" style={{ color: pct > 0 ? '#4AE8A0' : '#FF8A8A' }}>
                {pct > 0 ? '+' : ''}{pct}%
              </p>
              <p className="t-label" style={{ color: ts.textDim }}>
                {pct > 0 ? 'higher on med. days' : 'lower on med. days'}
              </p>
            </div>
          </div>
        );
      })()}

      {/* Legend */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <span className="inline-block w-3 rounded-full" style={{ height: 2, background: '#4AE8A0' }} />
          <span className="t-label uppercase tracking-wide" style={{ color: ts.textMuted }}>HRV (ms)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded-sm" style={{ background: ts.accent, opacity: 0.7 }} />
          <span className="t-label uppercase tracking-wide" style={{ color: ts.textMuted }}>Sessions</span>
        </div>
      </div>

      {/* Chart */}
      <div style={{ height: 200 }}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 8, right: 28, left: -10, bottom: 0 }} barCategoryGap="40%">

            <defs>
              <linearGradient id="hrvLineGrad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%"   stopColor={ts.accentLight} />
                <stop offset="100%" stopColor="#4AE8A0" />
              </linearGradient>
              <linearGradient id="sessionBarGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor={ts.accent} stopOpacity={0.8} />
                <stop offset="100%" stopColor={ts.accent} stopOpacity={0.2} />
              </linearGradient>
            </defs>

            <CartesianGrid vertical={false} strokeDasharray="2 6" stroke={`${ts.border}66`} />

            <XAxis
              dataKey="label"
              axisLine={false}
              tickLine={false}
              tick={{ fill: ts.textMuted, fontSize: 10, fontFamily: 'Montserrat' }}
              dy={6}
              interval={4}
            />

            {/* Left axis: HRV */}
            <YAxis
              yAxisId="hrv"
              axisLine={false}
              tickLine={false}
              domain={[0, yMax]}
              tick={{ fill: ts.textMuted, fontSize: 11, fontFamily: 'Montserrat' }}
              tickFormatter={v => v === 0 ? '' : `${v}`}
              width={30}
            />

            {/* Right axis: sessions count */}
            <YAxis
              yAxisId="sessions"
              orientation="right"
              axisLine={false}
              tickLine={false}
              domain={[0, 4]}
              tick={{ fill: ts.textMuted, fontSize: 11, fontFamily: 'Montserrat' }}
              tickFormatter={v => v === 0 ? '' : `${v}`}
              width={20}
              allowDecimals={false}
            />

            <Tooltip content={<CustomTooltip />} cursor={{ fill: `${ts.accent}08`, radius: 4 } as any} />

            {/* Reference line at average HRV on meditation days */}
            {trend.meditationAvg !== null && (
              <ReferenceLine
                yAxisId="hrv"
                y={trend.meditationAvg}
                stroke="#4AE8A0"
                strokeDasharray="4 4"
                strokeOpacity={0.4}
              />
            )}

            {/* Sessions bar (background context) */}
            <Bar
              yAxisId="sessions"
              dataKey="sessions"
              fill="url(#sessionBarGrad)"
              radius={[4, 4, 0, 0]}
              maxBarSize={18}
              isAnimationActive
            />

            {/* HRV line */}
            <Line
              yAxisId="hrv"
              type="monotone"
              dataKey="hrv"
              stroke="url(#hrvLineGrad)"
              strokeWidth={2.5}
              dot={false}
              connectNulls={false}
              activeDot={{ r: 5, fill: '#4AE8A0', stroke: 'rgba(74,232,160,0.4)', strokeWidth: 4 }}
              isAnimationActive
            />

          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Footer caption */}
      <div className="flex items-center justify-between border-t pt-2" style={{ borderColor: `${ts.border}40` }}>
        <span className="t-label" style={{ color: ts.textDim }}>
          Last 30 days · {trend.meditationDaysCount} meditation day{trend.meditationDaysCount !== 1 ? 's' : ''} with HRV data
        </span>
        <span className="t-label" style={{ color: '#4AE8A0' }}>
          ── HRV trend
        </span>
      </div>

    </div>
  );
};

export default HRVCorrelation;
