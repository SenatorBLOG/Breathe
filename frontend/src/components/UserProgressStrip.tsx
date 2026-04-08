// src/components/UserProgressStrip.tsx
import React, { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { useThemeStyles } from '../hooks/useThemeStyles';
import { AuthContext } from './contexts/AuthContext';

// ── Types ─────────────────────────────────────────────────────────────────────
interface Session {
  sessionDate: string;
  sessionLength: number;
}

// ── Milestones in minutes ─────────────────────────────────────────────────────
const MILESTONES = [60, 300, 600, 1500, 3000, 6000, 12000, 30000]; // 1h 5h 10h 25h 50h 100h 200h 500h
const MILESTONE_LABELS: Record<number, string> = {
  60: '1h', 300: '5h', 600: '10h', 1500: '25h',
  3000: '50h', 6000: '100h', 12000: '200h', 30000: '500h',
};

function getNextMilestone(mins: number) {
  const next = MILESTONES.find(m => m > mins) ?? MILESTONES[MILESTONES.length - 1];
  const prev = MILESTONES[MILESTONES.indexOf(next) - 1] ?? 0;
  const pct  = Math.min(100, ((mins - prev) / (next - prev)) * 100);
  const left = next - mins;
  return { next, prev, pct, left, label: MILESTONE_LABELS[next] };
}

function calculateStreak(sessions: Session[]): number {
  if (!sessions.length) return 0;
  const today = new Date().toDateString();
  const hasToday = sessions.some(s => new Date(s.sessionDate).toDateString() === today);
  if (!hasToday) return 0;
  const dates = [...new Set(sessions.map(s => new Date(s.sessionDate).toDateString()))].sort(
    (a, b) => new Date(b).getTime() - new Date(a).getTime()
  );
  let streak = 1;
  const cur = new Date();
  cur.setDate(cur.getDate() - 1);
  while (dates.includes(cur.toDateString())) { streak++; cur.setDate(cur.getDate() - 1); }
  return streak;
}

function formatMins(mins: number): string {
  if (mins < 60) return `${mins}m`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

// ── Animated counter ──────────────────────────────────────────────────────────
function Counter({ value, suffix = '' }: { value: number; suffix?: string }) {
  const [cur, setCur] = useState(0);
  useEffect(() => {
    const duration = 900;
    const steps = 40;
    const inc = value / steps;
    let count = 0;
    const t = setInterval(() => {
      count++;
      setCur(count >= steps ? value : Math.floor(inc * count));
      if (count >= steps) clearInterval(t);
    }, duration / steps);
    return () => clearInterval(t);
  }, [value]);
  return <>{cur}{suffix}</>;
}

// ── Glow ring around streak number ───────────────────────────────────────────
function StreakRing({ streak }: { streak: number }) {
  const ts = useThemeStyles();
  const color = streak >= 7 ? '#FF9A5C' : streak >= 3 ? '#FFD97D' : '#4A9EFF';
  const r = 28;
  const circumference = 2 * Math.PI * r;
  // Fill ring proportional to 30-day goal
  const fillPct = Math.min(1, streak / 30);

  return (
    <div style={{ position: 'relative', width: 72, height: 72, flexShrink: 0 }}>
      <svg width={72} height={72} style={{ transform: 'rotate(-90deg)' }}>
        {/* Track */}
        <circle cx={36} cy={36} r={r} fill="none" stroke={ts.border} strokeWidth={3} />
        {/* Fill */}
        <circle
          cx={36} cy={36} r={r}
          fill="none"
          stroke={color}
          strokeWidth={3}
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - fillPct)}
          strokeLinecap="round"
          style={{ filter: `drop-shadow(0 0 6px ${color})`, transition: 'stroke-dashoffset 1s ease' }}
        />
      </svg>
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        gap: 0,
      }}>
        <span style={{ fontSize: 9, lineHeight: 1 }}>🔥</span>
        <span style={{ fontSize: 18, fontWeight: 800, color, lineHeight: 1.1 }}>
          <Counter value={streak} />
        </span>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function UserProgressStrip() {
  const ts = useThemeStyles();
  const { isAuthenticated } = useContext(AuthContext);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading]   = useState(true);
  const [hasToday, setHasToday] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) { setLoading(false); return; }
    api.get<Session[]>('/sessions')
      .then(r => {
        setSessions(r.data);
        const today = new Date().toDateString();
        setHasToday(r.data.some(s => new Date(s.sessionDate).toDateString() === today));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [isAuthenticated]);

  // ── Not logged in: teaser ────────────────────────────────────────────────
  if (!isAuthenticated) {
    return (
      <div
        style={{
          margin: '0 auto',
          maxWidth: 900,
          width: '100%',
          padding: '0 16px',
        }}
      >
        <Link to="/login" style={{ textDecoration: 'none' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 12,
            padding: '14px 24px',
            borderRadius: 16,
            background: ts.cardBg,
            border: `1px solid ${ts.border}`,
            cursor: 'pointer',
            transition: 'border-color 0.2s',
            willChange: 'border-color',
          }}>
            <span style={{ fontSize: 20 }}>🔥</span>
            <span style={{ fontSize: 13, color: ts.textMuted }}>
              Sign in to track your streak, total practice time, and milestones
            </span>
            <span style={{ fontSize: 13, color: ts.accent, fontWeight: 600, marginLeft: 'auto', whiteSpace: 'nowrap' }}>
              Sign in →
            </span>
          </div>
        </Link>
      </div>
    );
  }

  // ── Loading skeleton ─────────────────────────────────────────────────────
  if (loading) {
    return (
      <div style={{ margin: '0 auto', maxWidth: 900, width: '100%', padding: '0 16px' }}>
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12,
        }}>
          {[0, 1, 2].map(i => (
            <div key={i} style={{
              height: 96, borderRadius: 16,
              background: `linear-gradient(90deg, ${ts.cardBg} 25%, ${ts.border} 50%, ${ts.cardBg} 75%)`,
              backgroundSize: '200% 100%',
              animation: 'shimmer 1.4s infinite',
            }} />
          ))}
        </div>
        <style>{`@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>
      </div>
    );
  }

  const streak    = calculateStreak(sessions);
  const totalMins = Math.round(sessions.reduce((s, x) => s + x.sessionLength, 0));
  const milestone = getNextMilestone(totalMins);

  // Colors
  const streakColor    = streak >= 7 ? '#FF9A5C' : streak >= 3 ? '#FFD97D' : '#4A9EFF';
  const milestoneColor = '#4AE8A0';

  return (
    <div style={{ margin: '0 auto', maxWidth: 900, width: '100%', padding: '0 16px' }}>

      {/* "No session today" nudge */}
      {!hasToday && sessions.length > 0 && (
        <Link to="/breathing" style={{ textDecoration: 'none', display: 'block', marginBottom: 10 }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '10px 16px', borderRadius: 12,
            background: `linear-gradient(135deg, ${ts.accent}14, ${ts.accent}08)`,
            border: `1px solid ${ts.accent}33`,
            cursor: 'pointer',
          }}>
            <span style={{
              width: 7, height: 7, borderRadius: '50%',
              background: ts.accent,
              boxShadow: `0 0 8px ${ts.accent}`,
              animation: 'ping 1.5s ease-in-out infinite',
              flexShrink: 0,
            }} />
            <span style={{ fontSize: 13, color: ts.accentLight }}>
              {streak > 0
                ? `🔥 Keep your ${streak}-day streak alive — meditate today`
                : 'Start a session today to begin your streak'}
            </span>
            <span style={{ marginLeft: 'auto', fontSize: 12, color: ts.accent, fontWeight: 600, whiteSpace: 'nowrap' }}>
              Breathe now →
            </span>
          </div>
          <style>{`@keyframes ping{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.5;transform:scale(1.5)}}`}</style>
        </Link>
      )}

      {/* 3-card grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>

        {/* ── Card 1: Streak ── */}
        <div style={{
          padding: '16px 18px',
          borderRadius: 18,
          background: ts.cardBg,
          border: `1px solid ${streakColor}30`,
          boxShadow: `0 0 24px ${streakColor}14`,
          display: 'flex', alignItems: 'center', gap: 14,
          backdropFilter: 'blur(12px)',
        }}>
          <StreakRing streak={streak} />
          <div>
            <div style={{ fontSize: 11, color: ts.textMuted, marginBottom: 3, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              Day streak
            </div>
            <div style={{ fontSize: 15, fontWeight: 700, color: ts.textPrimary, lineHeight: 1.2 }}>
              {streak === 0 ? 'Start today' : streak === 1 ? 'Day one! 💪' : streak >= 7 ? 'On fire! 🔥' : 'Keep going!'}
            </div>
            <div style={{ fontSize: 11, color: ts.textMuted, marginTop: 2 }}>
              {streak === 0 ? 'No session today' : `${streak} day${streak !== 1 ? 's' : ''} in a row`}
            </div>
          </div>
        </div>

        {/* ── Card 2: Total time ── */}
        <div style={{
          padding: '16px 18px',
          borderRadius: 18,
          background: ts.cardBg,
          border: `1px solid ${ts.accent}33`,
          boxShadow: `0 0 24px ${ts.accent}0d`,
          display: 'flex', flexDirection: 'column', justifyContent: 'center',
          backdropFilter: 'blur(12px)',
        }}>
          <div style={{ fontSize: 11, color: ts.textMuted, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 6 }}>
            Total practice
          </div>
          <div style={{ fontSize: 28, fontWeight: 800, color: ts.accentLight, lineHeight: 1, marginBottom: 4 }}>
            {formatMins(totalMins)}
          </div>
          <div style={{ fontSize: 11, color: ts.textMuted }}>
            across {sessions.length} session{sessions.length !== 1 ? 's' : ''}
          </div>
        </div>

        {/* ── Card 3: Next milestone ── */}
        <div style={{
          padding: '16px 18px',
          borderRadius: 18,
          background: ts.cardBg,
          border: `1px solid ${milestoneColor}25`,
          boxShadow: `0 0 24px ${milestoneColor}0d`,
          display: 'flex', flexDirection: 'column', justifyContent: 'center',
          backdropFilter: 'blur(12px)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
            <div style={{ fontSize: 11, color: ts.textMuted, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              Next milestone
            </div>
            <div style={{ fontSize: 11, fontWeight: 700, color: milestoneColor }}>
              🏆 {milestone.label}
            </div>
          </div>

          {/* Progress bar */}
          <div style={{
            height: 6, borderRadius: 99,
            background: ts.cardBgHover,
            overflow: 'hidden', marginBottom: 6,
          }}>
            <div style={{
              height: '100%',
              width: `${milestone.pct}%`,
              borderRadius: 99,
              background: `linear-gradient(90deg, ${milestoneColor}66, ${milestoneColor})`,
              boxShadow: `0 0 10px ${milestoneColor}66`,
              transition: 'width 1s cubic-bezier(0.4,0,0.2,1)',
            }} />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 11, color: ts.textMuted }}>
              {formatMins(totalMins)} done
            </span>
            <span style={{ fontSize: 11, color: milestoneColor, fontWeight: 600 }}>
              {formatMins(milestone.left)} to go
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}
