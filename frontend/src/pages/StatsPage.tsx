// src/pages/StatsPage.tsx
import React, { useEffect, useState } from 'react';
import WeeklyActivityChart from '../components/charts/WeeklyActivityChart';
import AnnualProgressChart from '../components/charts/AnnualProgressChart';
import StatsCards from '../components/charts/StatsCards';
import MoodTrackingGrid from '../components/charts/MoodTrackingGrid';
import MonthlyActivityChart from '../components/charts/MonthlyActivityChart';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import { Link } from 'react-router-dom';
import api from '../api';
import {
  Flame, TrendingUp, Wind, Timer,
  Brain, Sparkles, ArrowRight, Trophy, Moon, Activity, Heart, Watch
} from 'lucide-react';
import { useHealthData } from '../hooks/useHealthData';
import { Link as RouterLink } from 'react-router-dom';

// ─── Types ────────────────────────────────────────────────────────────────────
interface Session {
  _id: string; sessionDate: string; moodBefore: number; moodAfter: number;
  focusLevel: number; stressLevel: number; calmnessScore: number;
  sessionLength: number; cycles: number;
}

// ─── Ad slot ──────────────────────────────────────────────────────────────────
function AdSlot({ label = 'Advertisement', className = '' }: { label?: string; className?: string }) {
  return (
    <div className={`flex items-center justify-center border border-dashed border-[#1E3358]/40 rounded-xl bg-[#040A14]/40 ${className}`}>
      <span className="text-[9px] tracking-[0.25em] uppercase text-[#1A2D48] select-none">{label}</span>
    </div>
  );
}

// ─── Chart wrapper card ───────────────────────────────────────────────────────
function ChartCard({ title, sub, children, className = '' }: {
  title: string; sub?: string; children: React.ReactNode; className?: string;
}) {
  return (
    <div className={`flex flex-col gap-3 rounded-2xl bg-[#0B1628]/70 border border-[#1E3358]/50 p-5 ${className}`}>
      <div>
        <h3 className="text-[#B8D9FF] text-sm font-medium">{title}</h3>
        {sub && <p className="text-[#4A7AAA] text-[10px] mt-0.5">{sub}</p>}
      </div>
      <div className="w-full min-w-0">{children}</div>
    </div>
  );
}

// ─── Streak / milestone badge ─────────────────────────────────────────────────
function MilestoneBadge({ icon, label, value, glow }: {
  icon: React.ReactNode; label: string; value: string; glow: string;
}) {
  return (
    <div className="flex flex-col items-center gap-2 px-4 py-4 rounded-2xl bg-[#0B1628]/70 border border-[#1E3358]/50 text-center"
      style={{ boxShadow: `0 0 20px ${glow}` }}>
      <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${glow.replace('0.08', '0.15')}` }}>
        {icon}
      </div>
      <p className="text-[#7AC4FF] text-lg font-medium tabular-nums leading-none">{value}</p>
      <p className="text-[#4A7AAA] text-[9px] uppercase tracking-widest">{label}</p>
    </div>
  );
}

// ─── Insight card ─────────────────────────────────────────────────────────────
function InsightCard({ icon, title, desc }: { icon: string; title: string; desc: string }) {
  return (
    <div className="flex items-start gap-3 p-4 rounded-2xl bg-[#0B1628]/60 border border-[#1E3358]/40 hover:border-[#2A5499]/50 transition-colors">
      <span className="text-xl flex-shrink-0">{icon}</span>
      <div>
        <p className="text-[#B8D9FF] text-xs font-medium mb-1">{title}</p>
        <p className="text-[#3D6080] text-[10px] leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function StatsPage() {
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
    // Health-based insight
    health.recoveryScore !== null
      ? health.recoveryScore >= 75
        ? { icon: '⚡', title: 'Great recovery today', desc: `Recovery ${health.recoveryScore}/100 — ideal for an energising Wim Hof session.` }
        : health.recoveryScore >= 50
        ? { icon: '🌊', title: 'Moderate recovery', desc: `Recovery ${health.recoveryScore}/100 — Box or Coherent Breathing recommended today.` }
        : { icon: '💙', title: 'Rest & restore', desc: `Recovery ${health.recoveryScore}/100 — try 4-7-8 to support your nervous system.` }
      : { icon: '🧠', title: 'AI coach learning', desc: 'Every session you log trains your personal recommendation engine.' },
  ];

  return (
    <div className="relative flex flex-col min-h-screen bg-[#010814] font-montserrat">
      <style>{`
        @keyframes statsFadeUp { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
        .stats-in { animation: statsFadeUp 0.6s ease forwards; }
      `}</style>

      {/* Star background */}
      <div className="fixed inset-0 bg-cover bg-center" style={{ backgroundImage: `url('/Background_img_Meditation.jpg')`, opacity: 0.35 }} />
      <div className="fixed inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at top, rgba(1,8,20,0.2) 0%, rgba(1,8,20,0.94) 68%)' }} />

      <div className="relative z-10 flex flex-col min-h-screen">
        <NavBar />

        {/* ── Top ad ── */}
        <div className="max-w-6xl mx-auto w-full px-4 sm:px-6 pt-4">
          <AdSlot label="Ad · 728×90 leaderboard" className="h-12 sm:h-14" />
        </div>

        {/* ── Hero header ── */}
        <header className="max-w-6xl mx-auto w-full px-4 sm:px-6 pt-8 pb-4">
          <p className="text-[10px] tracking-[0.3em] uppercase text-[#4A7AAA] mb-2">Breathe · Analytics</p>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-light text-[#B8D9FF] tracking-wide">Your Progress</h1>
              <p className="text-[#4A7AAA] text-xs mt-1 max-w-md">
                {sessions.length > 0
                  ? `${sessions.length} sessions recorded · ${totalMins} minutes of mindfulness · your data is training your AI coach`
                  : 'Start meditating to unlock your personal analytics'}
              </p>
            </div>
            <Link
              to="/breathing"
              className="flex items-center gap-2 px-5 py-2.5 rounded-full text-white text-sm font-medium tracking-wide transition-all hover:shadow-[0_0_24px_rgba(58,130,247,0.4)] hover:scale-105 active:scale-95 self-start sm:self-auto"
              style={{ background: 'linear-gradient(135deg,#1A5FCC,#3A82F7)' }}
            >
              Meditate now <ArrowRight size={14} />
            </Link>
          </div>
        </header>

        {/* ── Main content ── */}
        <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 pb-20 flex flex-col gap-6">

          {/* Milestone badges row */}
          <div className="stats-in grid grid-cols-2 sm:grid-cols-4 gap-3" style={{ animationDelay: '0.05s', opacity: 0 }}>
            <MilestoneBadge icon={<Flame size={16} className="text-[#FF9A5C]" />}    label="Day streak"     value={`${streak}d`}         glow="rgba(255,154,92,0.08)" />
            <MilestoneBadge icon={<Timer size={16} className="text-[#4A9EFF]" />}    label="Total minutes"  value={`${totalMins}m`}      glow="rgba(74,158,255,0.08)" />
            <MilestoneBadge icon={<Wind size={16} className="text-[#7AC4FF]" />}     label="Cycles breathed" value={String(totalCycles)} glow="rgba(122,196,255,0.08)" />
            <MilestoneBadge icon={<TrendingUp size={16} className="text-[#4AE8A0]" />} label="Avg focus"    value={String(avgFocus)}     glow="rgba(74,232,160,0.08)" />
          </div>

          {/* Health data panel — only if wearable connected */}
          {health.sources.length > 0 && (
            <div className="stats-in grid grid-cols-2 sm:grid-cols-4 gap-3" style={{ animationDelay: '0.08s', opacity: 0 }}>
              {health.avgSleep7d && (
                <div className="flex flex-col gap-1.5 p-4 rounded-2xl bg-[#0B1628]/70 border border-[#1E3358]/50">
                  <div className="flex items-center gap-1.5">
                    <Moon size={12} className="text-[#7AC4FF]" />
                    <p className="text-[9px] uppercase tracking-widest text-[#4A7AAA]">Avg sleep 7d</p>
                  </div>
                  <p className="text-[#B8D9FF] text-lg font-medium tabular-nums">
                    {Math.floor(health.avgSleep7d/60)}h{health.avgSleep7d%60}m
                  </p>
                  <p className="text-[9px]" style={{
                    color: health.sleepQuality === 'good' ? '#4AE8A0' : health.sleepQuality === 'fair' ? '#FFD97D' : '#FF8A8A'
                  }}>{health.sleepQuality}</p>
                </div>
              )}
              {health.avgHRV7d && (
                <div className="flex flex-col gap-1.5 p-4 rounded-2xl bg-[#0B1628]/70 border border-[#1E3358]/50">
                  <div className="flex items-center gap-1.5">
                    <Activity size={12} className="text-[#4A9EFF]" />
                    <p className="text-[9px] uppercase tracking-widest text-[#4A7AAA]">Avg HRV 7d</p>
                  </div>
                  <p className="text-[#B8D9FF] text-lg font-medium tabular-nums">{health.avgHRV7d}ms</p>
                  <p className="text-[9px] text-[#4A7AAA]">heart rate variability</p>
                </div>
              )}
              {health.restingHR && (
                <div className="flex flex-col gap-1.5 p-4 rounded-2xl bg-[#0B1628]/70 border border-[#1E3358]/50">
                  <div className="flex items-center gap-1.5">
                    <Heart size={12} className="text-[#FF8A8A]" />
                    <p className="text-[9px] uppercase tracking-widest text-[#4A7AAA]">Resting HR</p>
                  </div>
                  <p className="text-[#B8D9FF] text-lg font-medium tabular-nums">{health.restingHR} bpm</p>
                  <p className="text-[9px] text-[#4A7AAA]">last recorded</p>
                </div>
              )}
              {health.recoveryScore !== null && (
                <div className="flex flex-col gap-1.5 p-4 rounded-2xl bg-[#0B1628]/70 border border-[#1E3358]/50">
                  <div className="flex items-center gap-1.5">
                    <Sparkles size={12} className="text-[#4AE8A0]" />
                    <p className="text-[9px] uppercase tracking-widest text-[#4A7AAA]">Recovery</p>
                  </div>
                  <p className="text-[#B8D9FF] text-lg font-medium tabular-nums">{health.recoveryScore}/100</p>
                  <div className="h-1 rounded-full bg-[#1E3358]/40 overflow-hidden">
                    <div className="h-full rounded-full transition-all"
                      style={{ width: `${health.recoveryScore}%`,
                        background: health.recoveryScore >= 75 ? '#4AE8A0' : health.recoveryScore >= 50 ? '#4A9EFF' : '#FF8A8A' }} />
                  </div>
                </div>
              )}
              {/* Link to connect more */}
              <div className="sm:col-span-4 flex items-center justify-between px-1">
                <p className="text-[9px] text-[#4A7AAA]">
                  <Watch size={9} className="inline mr-1" />
                  Data from: {health.sources.map(s => s === 'apple_health' ? 'Apple Health' : s === 'google_fit' ? 'Google Fit' : 'Fitbit').join(', ')}
                </p>
                <RouterLink to="/profile" className="text-[9px] text-[#4A9EFF] hover:underline">Manage integrations →</RouterLink>
              </div>
            </div>
          )}

          {/* StatsCards (existing component, wrapped) */}
          <div className="stats-in" style={{ animationDelay: '0.1s', opacity: 0 }}>
            <div className="rounded-2xl bg-[#0B1628]/70 border border-[#1E3358]/50 p-5">
              <div className="mb-3">
                <h3 className="text-[#B8D9FF] text-sm font-medium">Key metrics</h3>
                <p className="text-[#4A7AAA] text-[10px] mt-0.5">Averages across all your sessions</p>
              </div>
              <StatsCards />
            </div>
          </div>

          {/* Ad slot — mid page */}
          <AdSlot label="Ad · 728×90 mid-page" className="h-12 sm:h-14" />

          {/* Weekly + Annual charts */}
          <div className="stats-in grid grid-cols-1 gap-5" style={{ animationDelay: '0.15s', opacity: 0 }}>
            <ChartCard title="Weekly activity" sub="Sessions and minutes per day this week">
              <WeeklyActivityChart />
            </ChartCard>
            <ChartCard title="Annual progress" sub="Your meditation journey across the year">
              <AnnualProgressChart />
            </ChartCard>
          </div>

          {/* Mood + Monthly side by side */}
          <div className="stats-in grid grid-cols-1 lg:grid-cols-2 gap-5" style={{ animationDelay: '0.2s', opacity: 0 }}>
            <ChartCard title="Mood tracking" sub="How your mood shifts after each session">
              <MoodTrackingGrid />
            </ChartCard>
            <ChartCard title="Monthly overview" sub="Session frequency across the current month">
              <MonthlyActivityChart />
            </ChartCard>
          </div>

          {/* Insights strip */}
          <div className="stats-in flex flex-col gap-3" style={{ animationDelay: '0.25s', opacity: 0 }}>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles size={12} className="text-[#2A5499]" />
              <p className="text-[10px] tracking-[0.25em] uppercase text-[#4A7AAA]">Insights</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {insights.map((ins, i) => ins && <InsightCard key={i} {...ins} />)}
            </div>
          </div>

          {/* Bottom ad + CTA row */}
          <div className="stats-in grid grid-cols-1 sm:grid-cols-3 gap-4" style={{ animationDelay: '0.3s', opacity: 0 }}>
            <div className="sm:col-span-2">
              <AdSlot label="Ad · 468×60 banner" className="h-20 sm:h-24" />
            </div>
            {/* Motivational CTA */}
            <div className="flex flex-col items-center justify-center gap-3 rounded-2xl bg-[#0D1B33]/70 border border-[#1E3358]/50 p-5 text-center"
              style={{ boxShadow: '0 0 30px rgba(74,158,255,0.06)' }}>
              <Trophy size={22} className="text-[#4A9EFF]/60" />
              <p className="text-[#7AC4FF] text-xs font-medium">
                {sessions.length === 0
                  ? 'Start your first session'
                  : streak >= 7 ? `${streak} days strong!`
                  : 'Keep the streak alive'}
              </p>
              <Link to="/breathing"
                className="w-full py-2 rounded-xl text-xs text-white font-medium tracking-wide hover:shadow-[0_0_16px_rgba(58,130,247,0.4)] transition-all"
                style={{ background: 'linear-gradient(135deg,#1A5FCC,#3A82F7)' }}>
                Breathe now →
              </Link>
            </div>
          </div>

          {/* Side ad — visible on wide screens as float-right-like block */}
          <div className="hidden xl:block fixed right-4 top-1/3 w-36" style={{ zIndex: 20 }}>
            <AdSlot label="Ad · 120×600 skyscraper" className="h-64" />
          </div>

        </main>

        <Footer />
      </div>
    </div>
  );
}