// src/pages/StatsPage.tsx
import React, { useEffect, useState } from 'react';
import WeeklyActivityChart from '../components/charts/WeeklyActivityChart';
import AnnualProgressChart from '../components/charts/AnnualProgressChart';
import StatsCards from '../components/charts/StatsCards';
import MoodTrackingGrid from '../components/charts/MoodTrackingGrid';
import MonthlyActivityChart from '../components/charts/MonthlyActivityChart';
import HRVCorrelation from '../components/charts/HRVCorrelation';
import NavBar from '../components/NavBar';
import ThemeBackground from '../components/ThemeBackground';
import Footer from '../components/Footer';
import { Link } from 'react-router-dom';
import api from '../api';
import {
  Flame, TrendingUp, Wind, Timer,
  Brain, Sparkles, ArrowRight, Trophy, Moon, Activity, Heart, Watch,
  Waves, Leaf, Calendar, Zap
} from 'lucide-react';
import { useHealthData } from '../hooks/useHealthData';
import { useTranslation } from 'react-i18next';
import { useThemeStyles } from '../hooks/useThemeStyles';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine,
} from 'recharts';
import PageSEO from '../components/PageSEO';

// ─── Types ────────────────────────────────────────────────────────────────────
interface Session {
  _id: string; sessionDate: string; moodBefore: number; moodAfter: number;
  focusLevel: number; stressLevel: number; calmnessScore: number;
  sessionLength: number; cycles: number;
}

interface NLPInsights {
  totalAnalyzed: number;
  avgScore: number | null;
  topThemes: { theme: string; count: number }[];
  sentimentDist: { positive: number; neutral: number; negative: number };
  timeline: { date: string; score: number; sentiment: string; oneLineSummary: string }[];
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
      <span className="t-label select-none" style={{ color: ts.textDim }}>
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
    <div className={`flex flex-col gap-3 rounded-2xl p-5 transition-all duration-300 ${className}`}
      style={{
        backgroundColor: ts.cardBg,
        border: `1px solid ${ts.border}`,
      }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = ts.borderHover; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = ts.border; }}
    >
      <div>
        <h3 className="t-body font-medium" style={{ color: ts.textPrimary }}>{title}</h3>
        {sub && <p className="t-label mt-0.5" style={{ color: ts.textMuted }}>{sub}</p>}
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
  // Derive a brighter variant of the glow color for the icon container.
  // Robust against any incoming alpha value: bump rgba(...,a) → ~2× alpha.
  const iconBg = glow.replace(/rgba\(([^)]+),\s*([\d.]+)\)/, (_m, c, a) =>
    `rgba(${c},${Math.min(0.5, Number(a) * 1.9)})`
  );
  return (
    <div className="flex flex-col items-center gap-2 px-4 py-4 rounded-2xl text-center transition-all duration-300"
      style={{
        backgroundColor: ts.cardBg,
        border: `1px solid ${ts.border}`,
        boxShadow: `0 0 20px ${glow}`,
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.borderColor = ts.borderHover;
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.borderColor = ts.border;
      }}>
      <div className="w-9 h-9 rounded-xl flex items-center justify-center"
        style={{ background: iconBg }}>
        {icon}
      </div>
      <p className="t-heading font-medium tabular-nums leading-none" style={{ color: ts.textSecondary }}>
        {value}
      </p>
      <p className="t-label" style={{ color: ts.textMuted }}>
        {label}
      </p>
    </div>
  );
}

// ─── Insight card ─────────────────────────────────────────────────────────────
function InsightCard({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  const ts = useThemeStyles();
  return (
    <div className="flex items-start gap-3 p-4 rounded-2xl transition-colors"
      style={{
        backgroundColor: ts.cardBg,
        border: `1px solid ${ts.border}`,
      }}>
      <span className="t-heading flex-shrink-0">{icon}</span>
      <div>
        <p className="t-caption font-medium mb-1" style={{ color: ts.textPrimary }}>{title}</p>
        <p className="t-caption leading-relaxed" style={{ color: ts.textMuted }}>{desc}</p>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export function StatsSection() {
  const { t } = useTranslation();
  const ts = useThemeStyles();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [nlp, setNlp] = useState<NLPInsights | null>(null);
  const { data: health, loading: healthLoading } = useHealthData();

  useEffect(() => {
    api.get('/sessions').then(r => setSessions(r.data)).catch(() => {
      // Sessions failed to load — user sees empty stats; no toast needed (could be unauthenticated)
    });
    api.get('/nlp/insights').then(r => setNlp(r.data)).catch(() => {
      // NLP insights are optional — gracefully absent is fine
    });
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
      ? { icon: <Waves size={20} color="#38BDF8" />, title: t('stats.insightCards.moodImproving'), desc: t('stats.insightCards.moodImprovingDesc', { count: sessions.length, delta: avgMoodDelta.toFixed(1) }) }
      : { icon: <Leaf size={20} color="#4ADE80" />, title: t('stats.insightCards.gettingStarted'), desc: t('stats.insightCards.gettingStartedDesc') },
    totalMins >= 60
      ? { icon: <Timer size={20} color="#A78BFA" />, title: t('stats.insightCards.hoursTitle', { hours: Math.floor(totalMins / 60) }), desc: t('stats.insightCards.hoursDesc') }
      : { icon: <Timer size={20} color="#A78BFA" />, title: t('stats.insightCards.buildingHabit'), desc: t('stats.insightCards.buildingHabitDesc') },
    streak >= 3
      ? { icon: <Flame size={20} color="#F97316" />, title: t('stats.insightCards.streakTitle', { streak }), desc: t('stats.insightCards.streakDesc') }
      : { icon: <Calendar size={20} color="#7AC4FF" />, title: t('stats.insightCards.dailyPractice'), desc: t('stats.insightCards.dailyPracticeDesc') },
    health.recoveryScore !== null
      ? health.recoveryScore >= 75
        ? { icon: <Zap size={20} color="#FACC15" />, title: t('stats.insightCards.greatRecovery'), desc: t('stats.insightCards.greatRecoveryDesc', { score: health.recoveryScore }) }
        : health.recoveryScore >= 50
        ? { icon: <Waves size={20} color="#38BDF8" />, title: t('stats.insightCards.moderateRecovery'), desc: t('stats.insightCards.moderateRecoveryDesc', { score: health.recoveryScore }) }
        : { icon: <Heart size={20} color="#60A5FA" />, title: t('stats.insightCards.restRestore'), desc: t('stats.insightCards.restRestoreDesc', { score: health.recoveryScore }) }
      : { icon: <Brain size={20} color="#C084FC" />, title: t('stats.insightCards.aiLearning'), desc: t('stats.insightCards.aiLearningDesc') },
  ];

  return (
    <>

        <div className="max-w-6xl mx-auto w-full px-4 sm:px-6 pt-4">
          <AdSlot label="Ad · 728×90 leaderboard" className="h-12 sm:h-14" />
        </div>

        <header className="max-w-6xl mx-auto w-full px-4 sm:px-6 pt-8 pb-4">
          <p className="t-label mb-2" style={{ color: ts.textMuted }}>
            {t('stats.brand')}
          </p>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-light tracking-wide" style={{ color: ts.textPrimary }}>
                {t('stats.title')}
              </h1>
              <p className="t-caption mt-1 max-w-md" style={{ color: ts.textMuted }}>
                {sessions.length > 0
                  ? t('stats.sessionsDesc', { count: sessions.length, mins: totalMins })
                  : t('stats.unlockAnalytics')}
              </p>
            </div>
            <Link
              to="/breathing"
              className="flex items-center gap-2 px-5 py-2.5 rounded-full text-white t-body font-medium tracking-wide transition-all hover:shadow-[0_0_24px_rgba(58,130,247,0.4)] hover:scale-105 active:scale-95 self-start sm:self-auto"
              style={{ background: ts.btnGradient }}
            >
              {t('stats.meditateNow')} <ArrowRight size={14} />
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
                    <p className="t-label" style={{ color: ts.textMuted }}>
                      {t('stats.avgSleep7d')}
                    </p>
                  </div>
                  <p className="t-heading font-medium tabular-nums" style={{ color: ts.textPrimary }}>
                    {Math.floor(health.avgSleep7d/60)}h{health.avgSleep7d%60}m
                  </p>
                  <p className="t-caption" style={{
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
                    <p className="t-label" style={{ color: ts.textMuted }}>
                      {t('stats.avgHRV7d')}
                    </p>
                  </div>
                  <p className="t-heading font-medium tabular-nums" style={{ color: ts.textPrimary }}>
                    {health.avgHRV7d}ms
                  </p>
                  <p className="t-caption" style={{ color: ts.textMuted }}>
                    {t('stats.heartRateVariability')}
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
                    <p className="t-label" style={{ color: ts.textMuted }}>
                      {t('stats.restingHR')}
                    </p>
                  </div>
                  <p className="t-heading font-medium tabular-nums" style={{ color: ts.textPrimary }}>
                    {health.restingHR} bpm
                  </p>
                  <p className="t-caption" style={{ color: ts.textMuted }}>
                    {t('stats.lastRecorded')}
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
                    <p className="t-label" style={{ color: ts.textMuted }}>
                      {t('stats.recovery')}
                    </p>
                  </div>
                  <p className="t-heading font-medium tabular-nums" style={{ color: ts.textPrimary }}>
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
                <p className="t-caption" style={{ color: ts.textMuted }}>
                  <Watch size={9} className="inline mr-1" />
                  {health.sources.map(s => s === 'apple_health' ? t('stats.appleHealth') : s === 'google_fit' ? t('stats.googleFit') : t('stats.fitbit')).join(', ')}
                </p>
                <Link to="/profile?tab=devices" className="t-caption hover:underline" style={{ color: ts.accent }}>
                  {t('stats.manageIntegrations')}
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
              <h3 className="t-body font-medium" style={{ color: ts.textPrimary }}>
                {t('stats.keyMetrics')}
              </h3>
              <p className="t-label mt-0.5" style={{ color: ts.textMuted }}>
                {t('stats.averagesAll')}
              </p>
            </div>
            <StatsCards />
          </div>

          {/* Ad slot — mid page */}
          <AdSlot label="Ad · 728×90 mid-page" className="h-12 sm:h-14" />

          {/* Weekly + Annual charts */}
          <div className="grid grid-cols-1 gap-5">
            <ChartCard title={t("stats.weeklyActivity")} sub={t('stats.weeklyActivitySub')}>
              <WeeklyActivityChart />
            </ChartCard>
            <ChartCard title={t("stats.annualProgress")} sub={t('stats.annualProgressSub')}>
              <AnnualProgressChart />
            </ChartCard>
          </div>

          {/* Mood + Monthly side by side */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <ChartCard title={t("stats.moodTracking")} sub={t('stats.moodTrackingSub')}>
              <MoodTrackingGrid />
            </ChartCard>
            <ChartCard title={t("stats.monthlyOverview")} sub={t('stats.monthlyOverviewSub')}>
              <MonthlyActivityChart />
            </ChartCard>
          </div>

          {/* HRV Correlation */}
          <ChartCard
            title={t('stats.hrvTitle')}
            sub={t('stats.hrvSub')}
          >
            <HRVCorrelation
              hrv={health.hrv}
              sessions={sessions}
              loadingHealth={healthLoading}
            />
          </ChartCard>

          {/* Insights strip */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles size={12} style={{ color: ts.accent }} />
              <p className="t-label" style={{ color: ts.textMuted }}>
                {t('stats.insights')}
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {insights.map((ins, i) => ins && <InsightCard key={i} {...ins} />)}
            </div>
          </div>

          {/* Emotional Intelligence section */}
          {nlp && nlp.totalAnalyzed > 0 && (
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Brain size={12} style={{ color: ts.accent }} />
                  <p className="t-label" style={{ color: ts.textMuted }}>
                    {t('stats.emotionalIntelligence')}
                  </p>
                </div>
                <Link to="/journal" className="t-caption hover:underline flex items-center gap-1" style={{ color: ts.accent }}>
                  {t('stats.viewJournal')} <ArrowRight size={11} />
                </Link>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Score timeline chart */}
                {nlp.timeline.length > 1 && (
                  <ChartCard title={t('stats.emotionalScore')} sub={t('stats.emotionalScoreSub')}>
                    <ResponsiveContainer width="100%" height={140}>
                      <LineChart data={nlp.timeline.map(entry => ({
                        date: new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                        score: entry.score,
                      }))}>
                        <XAxis dataKey="date" tick={{ fontSize: 10, fill: ts.textMuted }} axisLine={false} tickLine={false} />
                        <YAxis domain={[-1, 1]} tick={{ fontSize: 10, fill: ts.textMuted }} axisLine={false} tickLine={false} width={28} />
                        <ReferenceLine y={0} stroke={ts.border} strokeDasharray="3 3" />
                        <Tooltip
                          contentStyle={{ backgroundColor: ts.cardBg, border: `1px solid ${ts.border}`, borderRadius: 12, fontSize: 11 }}
                          labelStyle={{ color: ts.textSecondary }}
                          itemStyle={{ color: ts.accent }}
                          formatter={(v: number) => [v.toFixed(2), t('sessions.card.score')]}
                        />
                        <Line
                          type="monotone" dataKey="score"
                          stroke={ts.accent} strokeWidth={2} dot={false}
                          activeDot={{ r: 4, fill: ts.accent }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </ChartCard>
                )}

                {/* Top themes + sentiment dist */}
                <div
                  className="flex flex-col gap-3 rounded-2xl p-5"
                  style={{ backgroundColor: ts.cardBg, border: `1px solid ${ts.border}` }}
                >
                  <div>
                    <h3 className="t-body font-medium" style={{ color: ts.textPrimary }}>{t('stats.recurringThemes')}</h3>
                    <p className="t-label mt-0.5" style={{ color: ts.textMuted }}>
                      {t('stats.basedOn', { count: nlp.totalAnalyzed })}
                    </p>
                  </div>

                  {nlp.topThemes.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {nlp.topThemes.map(({ theme, count }) => (
                        <span
                          key={theme}
                          className="t-caption px-2.5 py-1 rounded-full capitalize"
                          style={{ backgroundColor: `${ts.accent}18`, color: ts.accent }}
                        >
                          {theme} · {count}
                        </span>
                      ))}
                    </div>
                  )}

                  <div>
                    <p className="t-label mb-1.5" style={{ color: ts.textMuted }}>
                      {t('stats.sentimentSplit')}
                    </p>
                    <div className="flex h-2 rounded-full overflow-hidden gap-0.5">
                      {nlp.sentimentDist.positive > 0 && (
                        <div style={{ flex: nlp.sentimentDist.positive, background: ts.accent }} className="rounded-full" />
                      )}
                      {nlp.sentimentDist.neutral > 0 && (
                        <div style={{ flex: nlp.sentimentDist.neutral, background: '#7AAEC8' }} className="rounded-full" />
                      )}
                      {nlp.sentimentDist.negative > 0 && (
                        <div style={{ flex: nlp.sentimentDist.negative, background: '#FF8A8A' }} className="rounded-full" />
                      )}
                    </div>
                    <div className="flex gap-3 mt-1.5">
                      <span className="t-caption" style={{ color: ts.accent }}>{t('stats.sentimentPositive', { count: nlp.sentimentDist.positive })}</span>
                      <span className="t-caption" style={{ color: '#7AAEC8' }}>{t('stats.sentimentNeutral', { count: nlp.sentimentDist.neutral })}</span>
                      <span className="t-caption" style={{ color: '#FF8A8A' }}>{t('stats.sentimentDifficult', { count: nlp.sentimentDist.negative })}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

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
              <p className="t-caption font-medium" style={{ color: ts.textSecondary }}>
                {sessions.length === 0
                  ? t('stats.startFirst')
                  : streak >= 7 ? t('stats.daysStrong', { streak })
                  : t('stats.keepStreak')}
              </p>
              <Link to="/breathing"
                className="w-full py-2 rounded-xl t-caption font-medium tracking-wide transition-all hover:shadow-[0_0_16px_rgba(58,130,247,0.4)]"
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

    </>
  );
}

export default function StatsPage() {
  return (
    <div className="relative flex flex-col min-h-screen font-montserrat">
      <PageSEO
        title="Progress & Stats | Breathe"
        description="Explore your breathing journey — mood trends, calmness scores, weekly streaks, and detailed session analytics."
        canonical="/statistics"
        noIndex
      />
      <ThemeBackground />
      <div className="relative z-10 flex flex-col min-h-screen">
        <NavBar />
        <StatsSection />
        <Footer />
      </div>
    </div>
  );
}