// src/pages/StatsPage.tsx
import React, { useEffect, useState } from 'react';
import WeeklyActivityChart from '../components/charts/WeeklyActivityChart';
import AnnualProgressChart from '../components/charts/AnnualProgressChart';
import StatsCards from '../components/charts/StatsCards';
import MoodTrackingGrid from '../components/charts/MoodTrackingGrid';
import MonthlyActivityChart from '../components/charts/MonthlyActivityChart';
import NavBar from '../components/NavBar';
import ThemeBackground from '../components/ThemeBackground';
import Footer from '../components/Footer';
import { Link } from 'react-router-dom';
import api from '../api';
import {
  Flame, TrendingUp, Wind, Timer,
  Brain, Sparkles, ArrowRight, Trophy, Moon, Activity, Heart, Watch
} from 'lucide-react';
import { useHealthData } from '../hooks/useHealthData';
import { useTranslation } from 'react-i18next';
import { useThemeStyles } from '../hooks/useThemeStyles';

// ─── Types ────────────────────────────────────────────────────────────────────
interface Session {
  _id: string; sessionDate: string; moodBefore: number; moodAfter: number;
  focusLevel: number; stressLevel: number; calmnessScore: number;
  sessionLength: number; cycles: number;
}

// ─── Ad slot ──────────────────────────────────────────────────────────────────
function AdSlot({ label = 'Advertisement', className = '' }: { label?: string; className?: string }) {
  const ts = useThemeStyles();
  return (
    <div className={`flex items-center justify-center border border-dashed rounded-xl ${className}`}
      style={{
        borderColor: ts.border,
        backgroundColor: `${ts.cardBg}40`,
      }}>
      <span className="text-[9px] tracking-widest uppercase select-none" style={{ color: ts.textDim }}>
        {label}
      </span>
    </div>
  );
}

// ─── Chart wrapper card ───────────────────────────────────────────────────────
function ChartCard({ title, sub, children, className = '' }: {
  title: string; sub?: string; children: React.ReactNode; className?: string;
}) {
  const ts = useThemeStyles();
  return (
    <div className={`flex flex-col gap-3 rounded-2xl p-5 ${className}`}
      style={{
        backgroundColor: ts.cardBg,
        border: `1px solid ${ts.border}`,
      }}>
      <div>
        <h3 className="text-sm font-medium" style={{ color: ts.textPrimary }}>{title}</h3>
        {sub && <p className="text-[10px] mt-0.5" style={{ color: ts.textMuted }}>{sub}</p>}
      </div>
      <div className="w-full min-w-0">{children}</div>
    </div>
  );
}

// ─── Streak / milestone badge ─────────────────────────────────────────────────
function MilestoneBadge({ icon, label, value, glow }: {
  icon: React.ReactNode; label: string; value: string; glow: string;
}) {
  const ts = useThemeStyles();
  return (
    <div className="flex flex-col items-center gap-2 px-4 py-4 rounded-2xl text-center"
      style={{
        backgroundColor: ts.cardBg,
        border: `1px solid ${ts.border}`,
        boxShadow: `0 0 20px ${glow}`,
      }}>
      <div className="w-9 h-9 rounded-xl flex items-center justify-center"
        style={{ background: `${glow.replace('0.08', '0.15')}` }}>
        {icon}
      </div>
      <p className="text-lg font-medium tabular-nums leading-none" style={{ color: ts.textSecondary }}>
        {value}
      </p>
      <p className="text-[9px] uppercase tracking-widest" style={{ color: ts.textMuted }}>
        {label}
      </p>
    </div>
  );
}

// ─── Insight card ─────────────────────────────────────────────────────────────
function InsightCard({ icon, title, desc }: { icon: string; title: string; desc: string }) {
  const ts = useThemeStyles();
  return (
    <div className="flex items-start gap-3 p-4 rounded-2xl transition-colors"
      style={{
        backgroundColor: ts.cardBg,
        border: `1px solid ${ts.border}`,
      }}>
      <span className="text-xl flex-shrink-0">{icon}</span>
      <div>
        <p className="text-xs font-medium mb-1" style={{ color: ts.textPrimary }}>{title}</p>
        <p className="text-xs leading-relaxed" style={{ color: ts.textMuted }}>{desc}</p>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function StatsPage() {
  const { t } = useTranslation();
  const ts = useThemeStyles();
  const [sessions, setSessions] = useState<Session[]>([]);
  const { data: health } = useHealthData();

  useEffect(() => {
    api.get('/sessions').then(r => setSessions(r.data)).catch(() => {});
  }, []);

  // Derived numbers
  const totalMins     = Math.round(sessions.reduce((s, x) => s + x.sessionLength, 0));
  const totalCycles   = Math.round(sessions.reduce((s, x) => s + x.cycles, 0));
  const avgFocus      = sessions.length ? (sessions.reduce((s, x) => s + x.focusLevel, 0) / sessions.length).toFixed(1) : '—';
  const avgMoodDelta  = sessions.length
    ? (sessions.reduce((s, x) => s + (x.moodAfter - x.moodBefore), 0) / sessions.length)
    : null;

  const calculateStreak = () => {
    if (!sessions.length) return 0;
    const today = new Date().toDateString();
    if (!sessions.some(s => new Date(s.sessionDate).toDateString() === today)) return 0;
    const dates = [...new Set(sessions.map(s => new Date(s.sessionDate).toDateString()))].sort(
      (a, b) => new Date(b).getTime() - new Date(a).getTime()
    );
    let streak = 1, cur = new Date(); cur.setDate(cur.getDate() - 1);
    while (dates.includes(cur.toDateString())) { streak++; cur.setDate(cur.getDate() - 1); }
    return streak;
  };
  const streak = calculateStreak();

  // Dynamic insight based on data
  const insights = [
    sessions.length >= 5 && avgMoodDelta !== null && avgMoodDelta > 0
      ? { icon: '🌊', title: 'Mood is improving', desc: `Across your last ${sessions.length} sessions your mood lifted by +${avgMoodDelta.toFixed(1)} on average. Keep the rhythm going.` }
      : { icon: '🌱', title: 'Getting started', desc: 'Complete 5 sessions to unlock your first mood trend insights.' },
    totalMins >= 60
      ? { icon: '⏱', title: `${Math.floor(totalMins / 60)}h+ of mindfulness`, desc: 'Consistent short sessions beat occasional long ones. You\'re building real habits.' }
      : { icon: '⏱', title: 'Building the habit', desc: 'Just a few minutes daily is enough to rewire your stress response. Every session counts.' },
    streak >= 3
      ? { icon: '🔥', title: `${streak}-day streak`, desc: 'Streaks build momentum. Your nervous system is learning to shift faster each day.' }
      : { icon: '📅', title: 'Daily practice', desc: 'Meditate 3 days in a row to ignite your first streak and unlock deeper pattern insights.' },
    health.recoveryScore !== null
      ? health.recoveryScore >= 75
        ? { icon: '⚡', title: 'Great recovery today', desc: `Recovery ${health.recoveryScore}/100 — ideal for an energising Wim Hof session.` }
        : health.recoveryScore >= 50
        ? { icon: '🌊', title: 'Moderate recovery', desc: `Recovery ${health.recoveryScore}/100 — Box or Coherent Breathing recommended today.` }
        : { icon: '💙', title: 'Rest & restore', desc: `Recovery ${health.recoveryScore}/100 — try 4-7-8 to support your nervous system.` }
      : { icon: '🧠', title: 'AI coach learning', desc: 'Every session you log trains your personal recommendation engine.' },
  ];

  return (
    <div className="relative flex flex-col min-h-screen font-montserrat">
      <ThemeBackground />

      <div className="relative z-10 flex flex-col min-h-screen">
        <NavBar />

        <div className="max-w-6xl mx-auto w-full px-4 sm:px-6 pt-4">
          <AdSlot label="Ad · 728×90 leaderboard" className="h-12 sm:h-14" />
        </div>

        <header className="max-w-6xl mx-auto w-full px-4 sm:px-6 pt-8 pb-4">
          <p className="text-[10px] tracking-[0.3em] uppercase mb-2" style={{ color: ts.textMuted }}>
            Breathe · Analytics
          </p>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-light tracking-wide" style={{ color: ts.textPrimary }}>
                Your Progress
              </h1>
              <p className="text-xs mt-1 max-w-md" style={{ color: ts.textMuted }}>
                {sessions.length > 0
                  ? `${sessions.length} sessions recorded · ${totalMins} minutes of mindfulness · your data is training your AI coach`
                  : 'Start meditating to unlock your personal analytics'}
              </p>
            </div>
            <Link
              to="/breathing"
              className="flex items-center gap-2 px-5 py-2.5 rounded-full text-white text-sm font-medium tracking-wide transition-all hover:shadow-[0_0_24px_rgba(58,130,247,0.4)] hover:scale-105 active:scale-95 self-start sm:self-auto"
              style={{ background: ts.btnGradient }}
            >
              Meditate now <ArrowRight size={14} />
            </Link>
          </div>
        </header>

        <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 pb-20 flex flex-col gap-6">

          {/* Milestone badges row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <MilestoneBadge icon={<Flame size={16} />}    label={t("stats.dayStreak")}     value={`${streak}d`}         glow="rgba(255,154,92,0.08)" />
            <MilestoneBadge icon={<Timer size={16} />}    label={t("stats.totalMinutes")}  value={`${totalMins}m`}      glow="rgba(74,158,255,0.08)" />
            <MilestoneBadge icon={<Wind size={16} />}     label={t("stats.cyclesBeathed")} value={String(totalCycles)} glow="rgba(122,196,255,0.08)" />
            <MilestoneBadge icon={<TrendingUp size={16} />} label={t("stats.avgFocus")}    value={String(avgFocus)}     glow="rgba(74,232,160,0.08)" />
          </div>

          {/* Health data panel */}
          {health.sources.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {health.avgSleep7d && (
                <div className="flex flex-col gap-1.5 p-4 rounded-2xl"
                  style={{
                    backgroundColor: ts.cardBg,
                    border: `1px solid ${ts.border}`,
                  }}>
                  <div className="flex items-center gap-1.5">
                    <Moon size={12} style={{ color: ts.accent }} />
                    <p className="text-[9px] uppercase tracking-widest" style={{ color: ts.textMuted }}>
                      Avg sleep 7d
                    </p>
                  </div>
                  <p className="text-lg font-medium tabular-nums" style={{ color: ts.textPrimary }}>
                    {Math.floor(health.avgSleep7d/60)}h{health.avgSleep7d%60}m
                  </p>
                  <p className="text-[9px]" style={{
                    color: health.sleepQuality === 'good' ? ts.accent : health.sleepQuality === 'fair' ? '#FFD97D' : '#FF8A8A'
                  }}>
                    {health.sleepQuality}
                  </p>
                </div>
              )}
              {health.avgHRV7d && (
                <div className="flex flex-col gap-1.5 p-4 rounded-2xl"
                  style={{
                    backgroundColor: ts.cardBg,
                    border: `1px solid ${ts.border}`,
                  }}>
                  <div className="flex items-center gap-1.5">
                    <Activity size={12} style={{ color: ts.accent }} />
                    <p className="text-[9px] uppercase tracking-widest" style={{ color: ts.textMuted }}>
                      Avg HRV 7d
                    </p>
                  </div>
                  <p className="text-lg font-medium tabular-nums" style={{ color: ts.textPrimary }}>
                    {health.avgHRV7d}ms
                  </p>
                  <p className="text-[9px]" style={{ color: ts.textMuted }}>
                    heart rate variability
                  </p>
                </div>
              )}
              {health.restingHR && (
                <div className="flex flex-col gap-1.5 p-4 rounded-2xl"
                  style={{
                    backgroundColor: ts.cardBg,
                    border: `1px solid ${ts.border}`,
                  }}>
                  <div className="flex items-center gap-1.5">
                    <Heart size={12} style={{ color: '#FF8A8A' }} />
                    <p className="text-[9px] uppercase tracking-widest" style={{ color: ts.textMuted }}>
                      Resting HR
                    </p>
                  </div>
                  <p className="text-lg font-medium tabular-nums" style={{ color: ts.textPrimary }}>
                    {health.restingHR} bpm
                  </p>
                  <p className="text-[9px]" style={{ color: ts.textMuted }}>
                    last recorded
                  </p>
                </div>
              )}
              {health.recoveryScore !== null && (
                <div className="flex flex-col gap-1.5 p-4 rounded-2xl"
                  style={{
                    backgroundColor: ts.cardBg,
                    border: `1px solid ${ts.border}`,
                  }}>
                  <div className="flex items-center gap-1.5">
                    <Sparkles size={12} style={{ color: ts.accent }} />
                    <p className="text-[9px] uppercase tracking-widest" style={{ color: ts.textMuted }}>
                      Recovery
                    </p>
                  </div>
                  <p className="text-lg font-medium tabular-nums" style={{ color: ts.textPrimary }}>
                    {health.recoveryScore}/100
                  </p>
                  <div className="h-1 rounded-full overflow-hidden" style={{ backgroundColor: ts.border }}>
                    <div className="h-full rounded-full transition-all"
                      style={{
                        width: `${health.recoveryScore}%`,
                        background: health.recoveryScore >= 75 ? ts.accent : health.recoveryScore >= 50 ? ts.accentLight : '#FF8A8A'
                      }} />
                  </div>
                </div>
              )}
              <div className="sm:col-span-4 flex items-center justify-between px-1">
                <p className="text-[9px]" style={{ color: ts.textMuted }}>
                  <Watch size={9} className="inline mr-1" />
                  Data from: {health.sources.map(s => s === 'apple_health' ? 'Apple Health' : s === 'google_fit' ? 'Google Fit' : 'Fitbit').join(', ')}
                </p>
                <Link to="/profile" className="text-[9px] hover:underline" style={{ color: ts.accent }}>
                  Manage integrations →
                </Link>
              </div>
            </div>
          )}

          {/* StatsCards */}
          <div className="rounded-2xl p-5"
            style={{
              backgroundColor: ts.cardBg,
              border: `1px solid ${ts.border}`,
            }}>
            <div className="mb-3">
              <h3 className="text-sm font-medium" style={{ color: ts.textPrimary }}>
                Key metrics
              </h3>
              <p className="text-[10px] mt-0.5" style={{ color: ts.textMuted }}>
                Averages across all your sessions
              </p>
            </div>
            <StatsCards />
          </div>

          {/* Ad slot — mid page */}
          <AdSlot label="Ad · 728×90 mid-page" className="h-12 sm:h-14" />

          {/* Weekly + Annual charts */}
          <div className="grid grid-cols-1 gap-5">
            <ChartCard title={t("stats.weeklyActivity")} sub="Sessions and minutes per day this week">
              <WeeklyActivityChart />
            </ChartCard>
            <ChartCard title={t("stats.annualProgress")} sub="Your meditation journey across the year">
              <AnnualProgressChart />
            </ChartCard>
          </div>

          {/* Mood + Monthly side by side */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <ChartCard title={t("stats.moodTracking")} sub="How your mood shifts after each session">
              <MoodTrackingGrid />
            </ChartCard>
            <ChartCard title={t("stats.monthlyOverview")} sub="Session frequency across the current month">
              <MonthlyActivityChart />
            </ChartCard>
          </div>

          {/* Insights strip */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles size={12} style={{ color: ts.accent }} />
              <p className="text-[10px] tracking-[0.25em] uppercase" style={{ color: ts.textMuted }}>
                Insights
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {insights.map((ins, i) => ins && <InsightCard key={i} {...ins} />)}
            </div>
          </div>

          {/* Bottom ad + CTA row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <AdSlot label="Ad · 468×60 banner" className="h-20 sm:h-24" />
            </div>
            <div className="flex flex-col items-center justify-center gap-3 rounded-2xl p-5 text-center"
              style={{
                backgroundColor: ts.cardBg,
                border: `1px solid ${ts.border}`,
                boxShadow: ts.btnShadow,
              }}>
              <Trophy size={22} style={{ color: ts.accent }} />
              <p className="text-xs font-medium" style={{ color: ts.textSecondary }}>
                {sessions.length === 0
                  ? 'Start your first session'
                  : streak >= 7 ? `${streak} days strong!`
                  : 'Keep the streak alive'}
              </p>
              <Link to="/breathing"
                className="w-full py-2 rounded-xl text-xs font-medium tracking-wide transition-all hover:shadow-[0_0_16px_rgba(58,130,247,0.4)]"
                style={{ background: ts.btnGradient }}>
                {t("stats.breatheNow")}
              </Link>
            </div>
          </div>

          {/* Side ad */}
          <div className="hidden xl:block fixed right-4 top-1/3 w-36" style={{ zIndex: 20 }}>
            <AdSlot label="Ad · 120×600 skyscraper" className="h-64" />
          </div>

        </main>

        <Footer />
      </div>
    </div>
  );
}