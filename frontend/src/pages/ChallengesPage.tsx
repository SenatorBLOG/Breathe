// src/pages/ChallengesPage.tsx
import React, { useEffect, useState, useContext } from 'react';
import NavBar from '../components/NavBar';
import ThemeBackground from '../components/ThemeBackground';
import Footer from '../components/Footer';
import api from '../api';
import { useThemeStyles } from '../hooks/useThemeStyles';
import { AuthContext } from '../components/contexts/AuthContext';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { Sparkles, Share2, Trash2, CheckCircle2, Circle, ArrowRight, Zap } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────
interface Challenge {
  _id: string;
  slug: string;
  title: string;
  subtitle: string;
  icon: string;
  duration: number;
  technique: string;
  minMinutes: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  tags: string[];
  badge: { emoji: string; label: string };
}

interface UserChallenge {
  _id: string;
  challenge: Challenge;
  startedAt: string;
  completedDays: string[];
  completedAt: string | null;
  abandoned: boolean;
  badge: { emoji: string; label: string; earnedAt: string } | null;
}

interface Recommendation {
  slug: string;
  reason: string;
  challenge: Challenge | null;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
const TECHNIQUE_LINKS: Record<string, string> = {
  box:       '/breathing/box-breathing',
  '4-7-8':   '/breathing/4-7-8',
  'wim-hof': '/breathing/wim-hof',
  coherent:  '/breathing',
  belly:     '/breathing',
  morning:   '/breathing/morning-ritual',
};

const DIFF_COLORS: Record<string, string> = {
  beginner:     '#4AE8A0',
  intermediate: '#FFD97D',
  advanced:     '#FF8A8A',
};

function diffLabel(d: string) {
  return d === 'beginner' ? '★ Beginner' : d === 'intermediate' ? '★★ Intermediate' : '★★★ Advanced';
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
}

// ─── Day dots ─────────────────────────────────────────────────────────────────
function DayDots({ total, done }: { total: number; done: number }) {
  const ts = useThemeStyles();
  const isToday = done; // next dot to complete
  return (
    <div className="flex flex-wrap gap-1.5">
      {Array.from({ length: total }, (_, i) => {
        const isDone    = i < done;
        const isCurrent = i === isToday;
        return (
          <div
            key={i}
            className={`rounded-full transition-all ${isCurrent && !isDone ? 'animate-pulse' : ''}`}
            style={{
              width:           total <= 7 ? 24 : 18,
              height:          total <= 7 ? 24 : 18,
              backgroundColor: isDone ? ts.accent : 'transparent',
              border:          isDone ? 'none' : isCurrent ? `2px solid ${ts.accent}` : `1px solid ${ts.border}`,
              flexShrink:      0,
            }}
          >
            {isDone && (
              <div className="w-full h-full flex items-center justify-center">
                <CheckCircle2 size={total <= 7 ? 12 : 9} color="white" />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Challenge card (Available) ───────────────────────────────────────────────
function ChallengeCard({
  challenge, onJoin, joining, alreadyJoined,
}: {
  challenge: Challenge;
  onJoin: (slug: string) => void;
  joining: boolean;
  alreadyJoined: boolean;
}) {
  const ts = useThemeStyles();
  return (
    <div
      className="flex flex-col gap-3 rounded-2xl p-5 transition-all duration-200"
      style={{
        backgroundColor: ts.cardBg,
        border: `1px solid ${alreadyJoined ? ts.accent + '50' : ts.border}`,
        boxShadow: alreadyJoined ? `0 0 20px ${ts.accent}10` : 'none',
      }}
    >
      <div className="flex items-start justify-between">
        <span className="text-3xl">{challenge.icon}</span>
        <span
          className="t-label px-2 py-0.5 rounded-full"
          style={{ backgroundColor: `${DIFF_COLORS[challenge.difficulty]}18`, color: DIFF_COLORS[challenge.difficulty] }}
        >
          {diffLabel(challenge.difficulty)}
        </span>
      </div>

      <div className="flex-1">
        <p className="t-body font-medium leading-snug" style={{ color: ts.textPrimary }}>
          {challenge.title}
        </p>
        <p className="t-label mt-0.5" style={{ color: ts.textMuted }}>{challenge.subtitle}</p>
      </div>

      <div className="flex flex-wrap gap-1">
        {challenge.tags.map(t => (
          <span key={t} className="t-label px-1.5 py-0.5 rounded capitalize"
            style={{ backgroundColor: ts.border, color: ts.textMuted }}>{t}</span>
        ))}
      </div>

      <div className="flex items-center justify-between mt-1">
        <span className="t-caption" style={{ color: ts.textDim }}>{challenge.badge.emoji} {challenge.badge.label}</span>
        {alreadyJoined ? (
          <span className="t-caption font-medium" style={{ color: ts.accent }}>In progress ✓</span>
        ) : (
          <button
            onClick={() => onJoin(challenge.slug)}
            disabled={joining}
            className="flex items-center gap-1 px-4 py-1.5 rounded-xl t-caption font-medium text-white transition-all hover:scale-105 active:scale-95 disabled:opacity-40"
            style={{ background: ts.btnGradient }}
          >
            Start <ArrowRight size={11} />
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Active challenge card ────────────────────────────────────────────────────
function ActiveCard({
  uc, onCheckin, onAbandon, checkingIn,
}: {
  uc: UserChallenge;
  onCheckin: (id: string) => void;
  onAbandon: (id: string) => void;
  checkingIn: boolean;
}) {
  const ts = useThemeStyles();
  const done = uc.completedDays.length;
  const total = uc.challenge.duration;
  const pct = Math.round((done / total) * 100);
  const today = new Date().toDateString();
  const checkedInToday = uc.completedDays.some(d => new Date(d).toDateString() === today);
  const techniqueLink = TECHNIQUE_LINKS[uc.challenge.technique] ?? '/breathing';

  return (
    <div
      className="rounded-2xl p-5 flex flex-col gap-4"
      style={{ backgroundColor: ts.cardBg, border: `1px solid ${ts.borderHover}`, boxShadow: `0 0 24px ${ts.accent}08` }}
    >
      {/* Header */}
      <div className="flex items-start gap-3">
        <span className="text-2xl flex-shrink-0">{uc.challenge.icon}</span>
        <div className="flex-1 min-w-0">
          <p className="t-body font-medium" style={{ color: ts.textPrimary }}>{uc.challenge.title}</p>
          <p className="t-caption mt-0.5" style={{ color: ts.textMuted }}>
            Day {done} of {total} · started {fmtDate(uc.startedAt)}
          </p>
        </div>
        <span className="t-caption font-medium tabular-nums flex-shrink-0" style={{ color: ts.accent }}>{pct}%</span>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: ts.border }}>
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, background: ts.btnGradient }}
        />
      </div>

      {/* Day dots */}
      <DayDots total={total} done={done} />

      {/* CTA */}
      {checkedInToday ? (
        <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl"
          style={{ backgroundColor: `${ts.accent}12`, border: `1px solid ${ts.accent}25` }}>
          <CheckCircle2 size={14} style={{ color: ts.accent }} />
          <p className="t-caption font-medium" style={{ color: ts.accent }}>Today's session complete!</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <Link
            to={techniqueLink}
            className="flex items-center justify-center gap-2 py-2.5 rounded-xl t-body font-medium text-white tracking-wide transition-all hover:scale-[1.02] active:scale-[0.98]"
            style={{ background: ts.btnGradient, boxShadow: ts.btnShadow }}
          >
            <Zap size={13} />
            Today: Start your session →
          </Link>
          <button
            onClick={() => onCheckin(uc._id)}
            disabled={checkingIn}
            className="py-2 rounded-xl t-caption border transition-all hover:opacity-80 disabled:opacity-30"
            style={{ borderColor: ts.border, color: ts.textMuted }}
          >
            Mark today as complete manually
          </button>
        </div>
      )}

      {/* Abandon */}
      <button
        onClick={() => onAbandon(uc._id)}
        className="flex items-center gap-1.5 t-label self-end hover:text-[#FF8A8A] transition-colors"
        style={{ color: ts.textDim }}
      >
        <Trash2 size={10} /> Abandon challenge
      </button>
    </div>
  );
}

// ─── Completed badge card ─────────────────────────────────────────────────────
function BadgeCard({ uc }: { uc: UserChallenge }) {
  const ts = useThemeStyles();

  const share = async () => {
    const text = `Just completed the ${uc.challenge.title} challenge! ${uc.badge?.emoji} breatheonline.app/challenges`;
    try {
      if (navigator.share) {
        await navigator.share({
          title: `I earned ${uc.badge?.label} on Breathe`,
          text,
          url: 'https://breatheonline.app/challenges',
        });
      } else {
        await navigator.clipboard.writeText(text);
        toast.success('Copied to clipboard!');
      }
    } catch { /* user cancelled */ }
  };

  return (
    <div
      className="flex items-center justify-between gap-4 p-4 rounded-2xl"
      style={{ backgroundColor: ts.cardBg, border: `1px solid ${ts.border}`, boxShadow: `0 0 16px ${ts.accent}08` }}
    >
      <div className="flex items-center gap-3">
        <span className="text-3xl">{uc.badge?.emoji}</span>
        <div>
          <p className="t-body font-medium" style={{ color: ts.textPrimary }}>{uc.badge?.label}</p>
          <p className="t-caption" style={{ color: ts.textMuted }}>
            {uc.challenge.title}
          </p>
          <p className="t-label mt-0.5" style={{ color: ts.textDim }}>
            Earned {uc.badge?.earnedAt ? fmtDate(uc.badge.earnedAt) : ''}
          </p>
        </div>
      </div>
      <button
        onClick={share}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl t-caption border transition-all hover:opacity-80"
        style={{ borderColor: ts.border, color: ts.textSecondary }}
      >
        <Share2 size={11} /> Share
      </button>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
type Tab = 'available' | 'my' | 'completed';

export default function ChallengesPage() {
  const ts = useThemeStyles();
  const { isAuthenticated } = useContext(AuthContext);

  const [challenges,      setChallenges]      = useState<Challenge[]>([]);
  const [userChallenges,  setUserChallenges]  = useState<UserChallenge[]>([]);
  const [recommendation,  setRecommendation]  = useState<Recommendation | null>(null);
  const [loading,         setLoading]         = useState(true);
  const [activeTab,       setActiveTab]       = useState<Tab>('available');
  const [joining,         setJoining]         = useState<string | null>(null);
  const [checkingIn,      setCheckingIn]      = useState<string | null>(null);

  const load = async () => {
    try {
      const [chRes] = await Promise.all([api.get('/challenges')]);
      setChallenges(chRes.data);

      if (isAuthenticated) {
        const [myRes] = await Promise.all([api.get('/challenges/my')]);
        setUserChallenges(myRes.data);
        api.get('/challenges/recommend').then(r => setRecommendation(r.data)).catch(() => {});
      }
    } catch (err) {
      toast.error('Failed to load challenges');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [isAuthenticated]);

  // Derived state
  const activeSlugs   = new Set(userChallenges.filter(uc => !uc.abandoned).map(uc => uc.challenge?.slug));
  const active        = userChallenges.filter(uc => !uc.completedAt && !uc.abandoned);
  const completed     = userChallenges.filter(uc => !!uc.completedAt);

  const handleJoin = async (slug: string) => {
    if (!isAuthenticated) { toast.error('Sign in to join a challenge'); return; }
    setJoining(slug);
    try {
      await api.post(`/challenges/${slug}/join`);
      toast.success('Challenge started! Complete daily sessions to progress.');
      await load();
      setActiveTab('my');
    } catch (err: any) {
      toast.error(err?.response?.data?.error ?? 'Failed to join');
    } finally {
      setJoining(null);
    }
  };

  const handleCheckin = async (id: string) => {
    setCheckingIn(id);
    try {
      const { data } = await api.post(`/challenges/${id}/checkin`);
      if (data.completed) {
        toast.success(`🎉 Challenge complete! You earned ${data.userChallenge.badge?.emoji} ${data.userChallenge.badge?.label}`);
      } else {
        toast.success('Day checked in! Keep going.');
      }
      await load();
    } catch (err: any) {
      toast.error(err?.response?.data?.error ?? 'Check-in failed');
    } finally {
      setCheckingIn(null);
    }
  };

  const handleAbandon = async (id: string) => {
    if (!window.confirm('Abandon this challenge? Your progress will be lost.')) return;
    try {
      await api.delete(`/challenges/${id}`);
      toast('Challenge abandoned');
      await load();
    } catch {
      toast.error('Failed to abandon');
    }
  };

  const tabs: { id: Tab; label: string }[] = [
    { id: 'available', label: 'Available' },
    { id: 'my',        label: `My Challenges${active.length ? ` · ${active.length}` : ''}` },
    { id: 'completed', label: `Completed${completed.length ? ` · ${completed.length}` : ''}` },
  ];

  return (
    <div className="relative flex flex-col min-h-screen font-montserrat">
      <ThemeBackground />

      <div className="relative z-10 flex flex-col min-h-screen">
        <NavBar />

        {/* Header */}
        <header className="max-w-4xl mx-auto w-full px-4 sm:px-6 pt-10 pb-4">
          <p className="t-label mb-2" style={{ color: ts.textMuted }}>
            Breathe · Challenges
          </p>
          <h1 className="text-2xl sm:text-3xl font-light tracking-wide" style={{ color: ts.textPrimary }}>
            Breathing Challenges
          </h1>
          <p className="t-caption mt-1" style={{ color: ts.textMuted }}>
            7 and 21-day streaks to build lasting habits and earn badges
          </p>

          {/* Tabs */}
          <div className="flex gap-1 p-1 rounded-xl mt-5 w-fit" style={{ backgroundColor: `${ts.border}60` }}>
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="px-4 py-1.5 rounded-lg t-caption font-medium tracking-wide transition-all"
                style={{
                  backgroundColor: activeTab === tab.id ? ts.cardBg : 'transparent',
                  color:           activeTab === tab.id ? ts.textPrimary : ts.textMuted,
                  boxShadow:       activeTab === tab.id ? '0 1px 4px rgba(0,0,0,0.2)' : 'none',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </header>

        {/* Body */}
        <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 pb-20 flex flex-col gap-5">

          {loading && (
            <div className="flex items-center justify-center py-16">
              <div className="w-5 h-5 rounded-full border-2 animate-spin"
                style={{ borderColor: ts.accent, borderTopColor: 'transparent' }} />
            </div>
          )}

          {/* ── Available tab ────────────────────────────────────────────── */}
          {!loading && activeTab === 'available' && (
            <>
              {/* AI recommendation */}
              {isAuthenticated && recommendation?.challenge && (
                <div
                  className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-2xl"
                  style={{
                    backgroundColor: `${ts.accent}0C`,
                    border: `1px solid ${ts.accent}30`,
                  }}
                >
                  <div className="flex items-center gap-3 flex-1">
                    <Sparkles size={16} style={{ color: ts.accent }} className="flex-shrink-0" />
                    <div>
                      <p className="t-caption font-medium" style={{ color: ts.textPrimary }}>
                        AI recommends: {recommendation.challenge.icon} {recommendation.challenge.title}
                      </p>
                      <p className="t-label mt-0.5" style={{ color: ts.textMuted }}>
                        {recommendation.reason}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleJoin(recommendation.slug)}
                    disabled={!!joining || activeSlugs.has(recommendation.slug)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl t-caption font-medium text-white transition-all hover:scale-105 disabled:opacity-40 flex-shrink-0"
                    style={{ background: ts.btnGradient }}
                  >
                    {activeSlugs.has(recommendation.slug) ? 'In progress ✓' : 'Start this →'}
                  </button>
                </div>
              )}

              {!isAuthenticated && (
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl"
                  style={{ backgroundColor: `${ts.accent}0A`, border: `1px solid ${ts.accent}20` }}>
                  <Sparkles size={13} style={{ color: ts.accent }} />
                  <p className="t-caption" style={{ color: ts.textMuted }}>
                    <Link to="/login" className="font-medium hover:underline" style={{ color: ts.accent }}>Sign in</Link>
                    {' '}to join challenges and track your progress
                  </p>
                </div>
              )}

              {/* Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {challenges.map(c => (
                  <ChallengeCard
                    key={c._id}
                    challenge={c}
                    onJoin={handleJoin}
                    joining={joining === c.slug}
                    alreadyJoined={activeSlugs.has(c.slug)}
                  />
                ))}
              </div>
            </>
          )}

          {/* ── My Challenges tab ────────────────────────────────────────── */}
          {!loading && activeTab === 'my' && (
            <>
              {!isAuthenticated ? (
                <div className="flex flex-col items-center gap-4 py-16 text-center">
                  <p className="t-body" style={{ color: ts.textSecondary }}>Sign in to track your challenges</p>
                  <Link to="/login"
                    className="px-6 py-2.5 rounded-full text-white t-body font-medium hover:scale-105 transition-all"
                    style={{ background: ts.btnGradient }}>
                    Sign in →
                  </Link>
                </div>
              ) : active.length === 0 ? (
                <div className="flex flex-col items-center gap-4 py-16 rounded-2xl text-center"
                  style={{ backgroundColor: ts.cardBg, border: `1px solid ${ts.border}` }}>
                  <Circle size={36} style={{ color: ts.textDim }} />
                  <div>
                    <p className="t-body font-medium mb-1" style={{ color: ts.textSecondary }}>No active challenges</p>
                    <p className="t-caption" style={{ color: ts.textMuted }}>Pick one from Available to get started</p>
                  </div>
                  <button onClick={() => setActiveTab('available')}
                    className="flex items-center gap-2 px-5 py-2 rounded-full text-white t-caption font-medium hover:scale-105 transition-all"
                    style={{ background: ts.btnGradient }}>
                    Browse challenges <ArrowRight size={12} />
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {active.map(uc => (
                    <ActiveCard
                      key={uc._id}
                      uc={uc}
                      onCheckin={handleCheckin}
                      onAbandon={handleAbandon}
                      checkingIn={checkingIn === uc._id}
                    />
                  ))}
                </div>
              )}
            </>
          )}

          {/* ── Completed tab ─────────────────────────────────────────────── */}
          {!loading && activeTab === 'completed' && (
            <>
              {!isAuthenticated ? (
                <div className="flex flex-col items-center gap-4 py-16 text-center">
                  <p className="t-body" style={{ color: ts.textSecondary }}>Sign in to see your badges</p>
                  <Link to="/login"
                    className="px-6 py-2.5 rounded-full text-white t-body font-medium hover:scale-105 transition-all"
                    style={{ background: ts.btnGradient }}>
                    Sign in →
                  </Link>
                </div>
              ) : completed.length === 0 ? (
                <div className="flex flex-col items-center gap-4 py-16 rounded-2xl text-center"
                  style={{ backgroundColor: ts.cardBg, border: `1px solid ${ts.border}` }}>
                  <span className="text-4xl">🏆</span>
                  <div>
                    <p className="t-body font-medium mb-1" style={{ color: ts.textSecondary }}>No badges yet</p>
                    <p className="t-caption" style={{ color: ts.textMuted }}>Complete a challenge to earn your first badge</p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  <p className="t-caption font-medium" style={{ color: ts.textMuted }}>
                    {completed.length} badge{completed.length !== 1 ? 's' : ''} earned
                  </p>
                  {completed.map(uc => <BadgeCard key={uc._id} uc={uc} />)}
                </div>
              )}
            </>
          )}

        </main>

        <Footer />
      </div>
    </div>
  );
}
