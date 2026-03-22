// src/components/ChallengesSection.tsx
// Self-contained challenges UI (no page chrome) — embedded in ProfilePage
import { useEffect, useState, useContext } from 'react';
import api from '../api';
import { useThemeStyles } from '../hooks/useThemeStyles';
import { AuthContext } from './contexts/AuthContext';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { Sparkles, Share2, Trash2, CheckCircle2, Circle, ArrowRight, Zap } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────
interface Preset { inhale: number; hold: number; exhale: number; pause: number; }

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
  preset?: Preset;
  joinCount?: number;
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
function fmtJoins(n: number) {
  if (n >= 1000) return `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}k`;
  return String(n);
}

function fmtPreset(p?: Preset) {
  if (!p) return null;
  const parts: string[] = [];
  if (p.inhale) parts.push(`${p.inhale}s in`);
  if (p.hold)   parts.push(`${p.hold}s hold`);
  if (p.exhale) parts.push(`${p.exhale}s out`);
  if (p.pause)  parts.push(`${p.pause}s pause`);
  return parts.join(' · ');
}

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
  return d === 'beginner' ? '★ Beginner' : d === 'intermediate' ? '★★ Mid' : '★★★ Hard';
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
}

// ─── Day dots ─────────────────────────────────────────────────────────────────
function DayDots({ total, done }: { total: number; done: number }) {
  const ts = useThemeStyles();
  return (
    <div className="flex flex-wrap gap-1.5">
      {Array.from({ length: total }, (_, i) => {
        const isDone    = i < done;
        const isCurrent = i === done;
        return (
          <div
            key={i}
            className={`rounded-full transition-all ${isCurrent && !isDone ? 'animate-pulse' : ''}`}
            style={{
              width:           total <= 7 ? 22 : 16,
              height:          total <= 7 ? 22 : 16,
              backgroundColor: isDone ? ts.accent : 'transparent',
              border:          isDone ? 'none' : isCurrent ? `2px solid ${ts.accent}` : `1px solid ${ts.border}`,
              flexShrink:      0,
            }}
          >
            {isDone && (
              <div className="w-full h-full flex items-center justify-center">
                <CheckCircle2 size={total <= 7 ? 11 : 8} color="white" />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Challenge card ───────────────────────────────────────────────────────────
function ChallengeCard({
  challenge, onJoin, joining, alreadyJoined,
}: {
  challenge: Challenge;
  onJoin: (slug: string) => void;
  joining: boolean;
  alreadyJoined: boolean;
}) {
  const ts = useThemeStyles();
  const preset = fmtPreset(challenge.preset);
  const joins  = challenge.joinCount ?? 0;

  return (
    <div
      className="flex flex-col gap-3 rounded-2xl p-4 transition-all duration-200"
      style={{
        backgroundColor: ts.cardBg,
        border: `1px solid ${alreadyJoined ? ts.accent + '50' : ts.border}`,
        boxShadow: alreadyJoined ? `0 0 18px ${ts.accent}0D` : 'none',
      }}
    >
      {/* Header row */}
      <div className="flex items-start justify-between">
        <span className="text-2xl">{challenge.icon}</span>
        <span className="text-[10px] px-2 py-0.5 rounded-full"
          style={{ backgroundColor: `${DIFF_COLORS[challenge.difficulty]}18`, color: DIFF_COLORS[challenge.difficulty] }}>
          {diffLabel(challenge.difficulty)}
        </span>
      </div>

      {/* Title + subtitle */}
      <div>
        <p className="text-sm font-medium leading-snug" style={{ color: ts.textPrimary }}>{challenge.title}</p>
        <p className="text-[10px] mt-0.5" style={{ color: ts.textMuted }}>{challenge.subtitle}</p>
      </div>

      {/* Preset timing */}
      {preset && (
        <p className="text-[10px] font-mono tracking-tight px-2 py-1 rounded-lg"
          style={{ backgroundColor: `${ts.accent}0D`, color: ts.accentLight }}>
          {preset}
        </p>
      )}

      {/* Tags */}
      <div className="flex flex-wrap gap-1">
        {challenge.tags.map(t => (
          <span key={t} className="text-[9px] px-1.5 py-0.5 rounded capitalize"
            style={{ backgroundColor: ts.border, color: ts.textMuted }}>{t}</span>
        ))}
      </div>

      {/* Footer: badge + join count + action */}
      <div className="flex items-center justify-between mt-auto pt-1 border-t"
        style={{ borderColor: `${ts.border}70` }}>
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px]" style={{ color: ts.textDim }}>{challenge.badge.emoji} {challenge.badge.label}</span>
          <span className="text-[9px]" style={{ color: ts.textDim }}>
            👥 {fmtJoins(joins)} joined
          </span>
        </div>
        {alreadyJoined ? (
          <span className="text-xs font-medium" style={{ color: ts.accent }}>Active ✓</span>
        ) : (
          <button
            onClick={() => onJoin(challenge.slug)}
            disabled={joining}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-medium text-white transition-all hover:scale-105 active:scale-95 disabled:opacity-40"
            style={{ background: ts.btnGradient }}
          >
            Start <ArrowRight size={10} />
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
    <div className="rounded-2xl p-4 flex flex-col gap-3"
      style={{ backgroundColor: ts.cardBg, border: `1px solid ${ts.borderHover}`, boxShadow: `0 0 20px ${ts.accent}06` }}>
      <div className="flex items-start gap-3">
        <span className="text-xl flex-shrink-0">{uc.challenge.icon}</span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium" style={{ color: ts.textPrimary }}>{uc.challenge.title}</p>
          <p className="text-xs mt-0.5" style={{ color: ts.textMuted }}>
            Day {done}/{total} · started {fmtDate(uc.startedAt)}
          </p>
        </div>
        <span className="text-xs font-medium tabular-nums flex-shrink-0" style={{ color: ts.accent }}>{pct}%</span>
      </div>

      <div className="h-1 rounded-full overflow-hidden" style={{ backgroundColor: ts.border }}>
        <div className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, background: ts.btnGradient }} />
      </div>

      <DayDots total={total} done={done} />

      {checkedInToday ? (
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl"
          style={{ backgroundColor: `${ts.accent}12`, border: `1px solid ${ts.accent}25` }}>
          <CheckCircle2 size={13} style={{ color: ts.accent }} />
          <p className="text-xs font-medium" style={{ color: ts.accent }}>Today's session complete!</p>
        </div>
      ) : (
        <div className="flex flex-col gap-1.5">
          <Link to={techniqueLink}
            className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-medium text-white tracking-wide transition-all hover:scale-[1.02] active:scale-[0.98]"
            style={{ background: ts.btnGradient, boxShadow: ts.btnShadow }}>
            <Zap size={12} />
            Start today's session →
          </Link>
          <button onClick={() => onCheckin(uc._id)} disabled={checkingIn}
            className="py-2 rounded-xl text-xs border transition-all hover:opacity-80 disabled:opacity-30"
            style={{ borderColor: ts.border, color: ts.textMuted }}>
            Mark today complete manually
          </button>
        </div>
      )}

      <button onClick={() => onAbandon(uc._id)}
        className="flex items-center gap-1.5 text-[10px] self-end hover:text-[#FF8A8A] transition-colors"
        style={{ color: ts.textDim }}>
        <Trash2 size={10} /> Abandon
      </button>
    </div>
  );
}

// ─── Badge card ───────────────────────────────────────────────────────────────
function BadgeCard({ uc }: { uc: UserChallenge }) {
  const ts = useThemeStyles();

  const share = async () => {
    const text = `Just completed the ${uc.challenge.title} challenge! ${uc.badge?.emoji} breatheonline.app`;
    try {
      if (navigator.share) {
        await navigator.share({ title: `I earned ${uc.badge?.label} on Breathe`, text, url: 'https://breatheonline.app' });
      } else {
        await navigator.clipboard.writeText(text);
        toast.success('Copied to clipboard!');
      }
    } catch { /* user cancelled */ }
  };

  return (
    <div className="flex items-center justify-between gap-4 p-4 rounded-2xl"
      style={{ backgroundColor: ts.cardBg, border: `1px solid ${ts.border}`, boxShadow: `0 0 12px ${ts.accent}08` }}>
      <div className="flex items-center gap-3">
        <span className="text-3xl">{uc.badge?.emoji}</span>
        <div>
          <p className="text-sm font-medium" style={{ color: ts.textPrimary }}>{uc.badge?.label}</p>
          <p className="text-xs" style={{ color: ts.textMuted }}>{uc.challenge.title}</p>
          <p className="text-[10px] mt-0.5" style={{ color: ts.textDim }}>
            Earned {uc.badge?.earnedAt ? fmtDate(uc.badge.earnedAt) : ''}
          </p>
        </div>
      </div>
      <button onClick={share}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs border transition-all hover:opacity-80"
        style={{ borderColor: ts.border, color: ts.textSecondary }}>
        <Share2 size={11} /> Share
      </button>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
type CTab = 'available' | 'my' | 'completed';

export default function ChallengesSection() {
  const ts = useThemeStyles();
  const { isAuthenticated } = useContext(AuthContext);

  const [challenges,     setChallenges]     = useState<Challenge[]>([]);
  const [userChallenges, setUserChallenges] = useState<UserChallenge[]>([]);
  const [recommendation, setRecommendation] = useState<Recommendation | null>(null);
  const [loading,        setLoading]        = useState(true);
  const [loadError,      setLoadError]      = useState(false);
  const [cTab,           setCTab]           = useState<CTab>('available');
  const [joining,        setJoining]        = useState<string | null>(null);
  const [checkingIn,     setCheckingIn]     = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setLoadError(false);
    try {
      const { data } = await api.get('/challenges');
      setChallenges(data);
      if (isAuthenticated) {
        const { data: myData } = await api.get('/challenges/my');
        setUserChallenges(myData);
        api.get('/challenges/recommend').then(r => setRecommendation(r.data)).catch(() => {});
      }
    } catch {
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [isAuthenticated]);

  const activeSlugs = new Set(userChallenges.filter(uc => !uc.abandoned).map(uc => uc.challenge?.slug));
  const active      = userChallenges.filter(uc => !uc.completedAt && !uc.abandoned);
  const completed   = userChallenges.filter(uc => !!uc.completedAt);

  const handleJoin = async (slug: string) => {
    if (!isAuthenticated) { toast.error('Sign in to join a challenge'); return; }
    setJoining(slug);
    try {
      await api.post(`/challenges/${slug}/join`);
      toast.success('Challenge started!');
      await load();
      setCTab('my');
    } catch (err: any) {
      toast.error(err?.response?.data?.error ?? 'Failed to join');
    } finally { setJoining(null); }
  };

  const handleCheckin = async (id: string) => {
    setCheckingIn(id);
    try {
      const { data } = await api.post(`/challenges/${id}/checkin`);
      if (data.completed) {
        toast.success(`🎉 ${data.userChallenge.badge?.emoji} ${data.userChallenge.badge?.label} earned!`);
      } else {
        toast.success('Day checked in! Keep going.');
      }
      await load();
    } catch (err: any) {
      toast.error(err?.response?.data?.error ?? 'Check-in failed');
    } finally { setCheckingIn(null); }
  };

  const handleAbandon = async (id: string) => {
    if (!window.confirm('Abandon this challenge? Progress will be lost.')) return;
    try {
      await api.delete(`/challenges/${id}`);
      toast('Challenge abandoned');
      await load();
    } catch { toast.error('Failed'); }
  };

  const tabs: { id: CTab; label: string }[] = [
    { id: 'available', label: 'Browse' },
    { id: 'my',        label: `Active${active.length ? ` · ${active.length}` : ''}` },
    { id: 'completed', label: `Badges${completed.length ? ` · ${completed.length}` : ''}` },
  ];

  return (
    <div className="flex flex-col gap-4">
      {/* Sub-tab bar */}
      <div className="flex gap-1 p-1 rounded-xl w-fit" style={{ backgroundColor: `${ts.border}50` }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setCTab(t.id)}
            className="px-4 py-1.5 rounded-lg text-xs font-medium tracking-wide transition-all"
            style={{
              backgroundColor: cTab === t.id ? ts.cardBg : 'transparent',
              color:           cTab === t.id ? ts.textPrimary : ts.textMuted,
              boxShadow:       cTab === t.id ? '0 1px 4px rgba(0,0,0,0.2)' : 'none',
            }}>
            {t.label}
          </button>
        ))}
      </div>

      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="w-5 h-5 rounded-full border-2 animate-spin"
            style={{ borderColor: ts.accent, borderTopColor: 'transparent' }} />
        </div>
      )}

      {/* ── Error state ────────────────────────────────────────────────────── */}
      {!loading && loadError && (
        <div className="flex flex-col items-center gap-3 py-12 rounded-2xl text-center"
          style={{ backgroundColor: ts.cardBg, border: `1px solid ${ts.border}` }}>
          <span className="text-3xl">⚠️</span>
          <div>
            <p className="text-sm font-medium" style={{ color: ts.textSecondary }}>Couldn't load challenges</p>
            <p className="text-xs mt-1" style={{ color: ts.textMuted }}>Check your connection or try again</p>
          </div>
          <button onClick={load}
            className="px-5 py-2 rounded-full text-white text-xs font-medium hover:scale-105 transition-all"
            style={{ background: ts.btnGradient }}>
            Retry
          </button>
        </div>
      )}

      {/* ── Browse ─────────────────────────────────────────────────────────── */}
      {!loading && !loadError && cTab === 'available' && (
        <div className="flex flex-col gap-4">
          {isAuthenticated && recommendation?.challenge && (
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 rounded-2xl"
              style={{ backgroundColor: `${ts.accent}0C`, border: `1px solid ${ts.accent}30` }}>
              <div className="flex items-center gap-2 flex-1">
                <Sparkles size={14} style={{ color: ts.accent }} className="flex-shrink-0" />
                <div>
                  <p className="text-xs font-medium" style={{ color: ts.textPrimary }}>
                    AI recommends: {recommendation.challenge.icon} {recommendation.challenge.title}
                  </p>
                  <p className="text-[10px] mt-0.5" style={{ color: ts.textMuted }}>{recommendation.reason}</p>
                </div>
              </div>
              <button
                onClick={() => handleJoin(recommendation.slug)}
                disabled={!!joining || activeSlugs.has(recommendation.slug)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium text-white transition-all hover:scale-105 disabled:opacity-40 flex-shrink-0"
                style={{ background: ts.btnGradient }}>
                {activeSlugs.has(recommendation.slug) ? 'Active ✓' : 'Start this →'}
              </button>
            </div>
          )}

          {!isAuthenticated && (
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl"
              style={{ backgroundColor: `${ts.accent}0A`, border: `1px solid ${ts.accent}20` }}>
              <Sparkles size={13} style={{ color: ts.accent }} />
              <p className="text-xs" style={{ color: ts.textMuted }}>
                <Link to="/login" className="font-medium hover:underline" style={{ color: ts.accent }}>Sign in</Link>
                {' '}to join challenges and track progress
              </p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            {challenges.map(c => (
              <ChallengeCard key={c._id} challenge={c}
                onJoin={handleJoin} joining={joining === c.slug}
                alreadyJoined={activeSlugs.has(c.slug)} />
            ))}
          </div>
        </div>
      )}

      {/* ── Active ─────────────────────────────────────────────────────────── */}
      {!loading && !loadError && cTab === 'my' && (
        <>
          {!isAuthenticated ? (
            <div className="flex flex-col items-center gap-4 py-12 text-center">
              <p className="text-sm" style={{ color: ts.textSecondary }}>Sign in to track your challenges</p>
              <Link to="/login" className="px-6 py-2.5 rounded-full text-white text-sm font-medium hover:scale-105 transition-all"
                style={{ background: ts.btnGradient }}>Sign in →</Link>
            </div>
          ) : active.length === 0 ? (
            <div className="flex flex-col gap-4">
              {/* Hero empty state */}
              <div className="flex flex-col items-center gap-3 py-8 px-4 rounded-2xl text-center"
                style={{ backgroundColor: ts.cardBg, border: `1px solid ${ts.border}` }}>
                <span className="text-4xl">🏆</span>
                <div>
                  <p className="text-sm font-semibold" style={{ color: ts.textPrimary }}>Start your first challenge</p>
                  <p className="text-xs mt-1 max-w-xs mx-auto leading-relaxed" style={{ color: ts.textMuted }}>
                    Build a daily breathing habit in 7 or 21 days. Complete sessions to earn badges.
                  </p>
                </div>
              </div>

              {/* Popular picks */}
              <div>
                <p className="text-[10px] uppercase tracking-widest mb-3 px-1" style={{ color: ts.textMuted }}>
                  Popular picks
                </p>
                <div className="flex flex-col gap-2">
                  {challenges
                    .filter(c => !activeSlugs.has(c.slug))
                    .sort((a, b) => (b.joinCount ?? 0) - (a.joinCount ?? 0))
                    .slice(0, 3)
                    .map(c => {
                      const preset = fmtPreset(c.preset);
                      return (
                        <div key={c._id}
                          className="flex items-center gap-3 p-3 rounded-2xl transition-all"
                          style={{ backgroundColor: ts.cardBg, border: `1px solid ${ts.border}` }}>
                          <span className="text-xl flex-shrink-0">{c.icon}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium truncate" style={{ color: ts.textPrimary }}>{c.title}</p>
                            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                              {preset && (
                                <span className="text-[9px] font-mono" style={{ color: ts.accentLight }}>{preset}</span>
                              )}
                              <span className="text-[9px]" style={{ color: ts.textDim }}>
                                👥 {fmtJoins(c.joinCount ?? 0)}
                              </span>
                            </div>
                          </div>
                          <button
                            onClick={() => handleJoin(c.slug)}
                            disabled={joining === c.slug}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-medium text-white flex-shrink-0 transition-all hover:scale-105 active:scale-95 disabled:opacity-40"
                            style={{ background: ts.btnGradient }}>
                            Start <ArrowRight size={10} />
                          </button>
                        </div>
                      );
                    })}
                </div>
                <button onClick={() => setCTab('available')}
                  className="mt-3 text-xs hover:underline w-full text-center"
                  style={{ color: ts.accent }}>
                  See all 6 challenges →
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {active.map(uc => (
                <ActiveCard key={uc._id} uc={uc}
                  onCheckin={handleCheckin} onAbandon={handleAbandon}
                  checkingIn={checkingIn === uc._id} />
              ))}
            </div>
          )}
        </>
      )}

      {/* ── Badges ──────────────────────────────────────────────────────────── */}
      {!loading && !loadError && cTab === 'completed' && (
        <>
          {!isAuthenticated ? (
            <div className="flex flex-col items-center gap-4 py-12 text-center">
              <p className="text-sm" style={{ color: ts.textSecondary }}>Sign in to see your badges</p>
              <Link to="/login" className="px-6 py-2.5 rounded-full text-white text-sm font-medium hover:scale-105 transition-all"
                style={{ background: ts.btnGradient }}>Sign in →</Link>
            </div>
          ) : completed.length === 0 ? (
            <div className="flex flex-col items-center gap-4 py-12 rounded-2xl text-center"
              style={{ backgroundColor: ts.cardBg, border: `1px solid ${ts.border}` }}>
              <span className="text-4xl">🏆</span>
              <div>
                <p className="text-sm font-medium mb-1" style={{ color: ts.textSecondary }}>No badges yet</p>
                <p className="text-xs" style={{ color: ts.textMuted }}>Complete a challenge to earn your first badge</p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <p className="text-xs" style={{ color: ts.textMuted }}>
                {completed.length} badge{completed.length !== 1 ? 's' : ''} earned
              </p>
              {completed.map(uc => <BadgeCard key={uc._id} uc={uc} />)}
            </div>
          )}
        </>
      )}
    </div>
  );
}
