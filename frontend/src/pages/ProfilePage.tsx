// src/pages/ProfilePage.tsx
import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import NavBar from '../components/NavBar';
import ThemeBackground from '../components/ThemeBackground';
import Footer from '../components/Footer';
import api from '../api';
import { toast } from 'sonner';
import {
  RefreshCw, Unlink, Moon, Heart, Activity, Zap, ChevronRight,
  Watch, Camera, Save, Download, Trash2,
  Wind, Star, Target, Dumbbell, Trophy, Flame, Sparkles, Waves, Sunrise, Smile,
} from 'lucide-react';
import { AchievementBadge } from '../components/AchievementToast';

const ALL_ACHIEVEMENTS = [
  { id: 'first_breath',  icon: <Wind   size={20} color="#7AC4FF" />, title: 'First Breath',   desc: 'Complete your first session' },
  { id: 'sessions_5',   icon: <Star   size={20} color="#FFD700" />, title: 'Getting Started', desc: '5 sessions completed' },
  { id: 'sessions_10',  icon: <Target size={20} color="#4A9EFF" />, title: 'Dedicated',       desc: '10 sessions completed' },
  { id: 'sessions_50',  icon: <Dumbbell size={20} color="#A78BFA" />, title: 'Committed',     desc: '50 sessions completed' },
  { id: 'sessions_100', icon: <Trophy size={20} color="#F59E0B" />, title: 'Century',         desc: '100 sessions completed' },
  { id: 'streak_3',     icon: <Flame  size={20} color="#F97316" />, title: 'Warming Up',      desc: '3-day streak' },
  { id: 'streak_7',     icon: <Zap    size={20} color="#FACC15" />, title: 'Week Warrior',    desc: '7-day streak' },
  { id: 'streak_30',    icon: <Sparkles size={20} color="#C084FC" />, title: 'Monthly Master', desc: '30-day streak' },
  { id: 'long_session', icon: <Waves  size={20} color="#38BDF8" />, title: 'Deep Diver',      desc: 'Session lasting 20+ minutes' },
  { id: 'early_bird',   icon: <Sunrise size={20} color="#FB923C" />, title: 'Early Bird',     desc: 'Session before 7 AM' },
  { id: 'night_owl',    icon: <Moon   size={20} color="#818CF8" />, title: 'Night Owl',       desc: 'Session after 11 PM' },
  { id: 'mood_boost',   icon: <Smile  size={20} color="#34D399" />, title: 'Mood Boost',      desc: 'Mood improved 3+ points' },
];
import AppleHealthImport from '../components/AppleHealthImport';
import HeartRateMonitor from '../components/HeartRateMonitor';
import { useThemeStyles } from '../hooks/useThemeStyles';
import { AuthContext } from '../components/contexts/AuthContext';
import ChallengesSection from '../components/ChallengesSection';
import { SessionsSection } from './SessionPage';
import { StatsSection } from './StatsPage';
import PageSEO from '../components/PageSEO';

// ─── Constants ────────────────────────────────────────────────────────────────
const GOALS = [
  { value: 'sleep',   label: 'Better Sleep',    icon: <Moon    size={16} color="#7AC4FF" /> },
  { value: 'stress',  label: 'Less Stress',      icon: <Wind    size={16} color="#A78BFA" /> },
  { value: 'focus',   label: 'More Focus',       icon: <Target  size={16} color="#4AE8A0" /> },
  { value: 'energy',  label: 'More Energy',      icon: <Zap     size={16} color="#FACC15" /> },
  { value: 'general', label: 'General Wellness', icon: <Waves   size={16} color="#38BDF8" /> },
];

const GENDERS = [
  { value: 'male',       label: 'Male' },
  { value: 'female',     label: 'Female' },
  { value: 'other',      label: 'Other' },
  { value: 'prefer_not', label: 'Prefer not to say' },
] as const;

// ─── Types ────────────────────────────────────────────────────────────────────
interface SleepDay { date: string; duration: number; efficiency?: number; score?: number; deepMins?: number; remMins?: number; }
interface HRVDay   { date: string; rmssd: number | null; }
interface HRDay    { date: string; restingRate: number | null; avgRate?: number; }

interface IntegrationStatus {
  provider:   'fitbit' | 'google_fit';
  connected:  boolean;
  lastSyncAt: string | null;
  data: {
    sleep:     SleepDay[]  | null;
    hrv:       HRVDay[]    | null;
    heartRate: HRDay[]     | null;
  };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const PROVIDER_META = {
  fitbit: {
    label: 'Fitbit',
    icon: <Heart size={16} color="#4ADE80" />,
    color: '#4AE8A0',
    bg: 'rgba(74,232,160,0.08)',
    description: 'Wearable device (watch / band)',
    details: 'Sleep stages (deep · REM · light · wake), HRV (RMSSD), resting heart rate',
    dataTypes: ['Sleep stages', 'HRV', 'Heart rate'],
  },
  google_fit: {
    label: 'Google Fit',
    icon: <Activity size={16} color="#4A9EFF" />,
    color: '#4A9EFF',
    bg: 'rgba(74,158,255,0.08)',
    description: 'Android / Wear OS platform',
    details: 'Sleep duration, average heart rate. No sleep stages or HRV.',
    dataTypes: ['Sleep duration', 'Heart rate'],
  },
};

function fmt(iso: string, locale?: string) {
  return new Date(iso).toLocaleDateString(locale ?? (typeof navigator !== 'undefined' ? navigator.language : 'en-US'), { month: 'short', day: 'numeric' });
}
function timeAgo(iso: string) {
  const m = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}
function fmtDur(mins: number) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

// ─── Small UI components ──────────────────────────────────────────────────────
function Section({ label, children }: { label: string; children: React.ReactNode }) {
  const ts = useThemeStyles();
  return (
    <div className="flex flex-col gap-3 p-5 rounded-2xl"
      style={{ backgroundColor: ts.cardBg, border: `1px solid ${ts.border}` }}>
      <p className="t-caption uppercase tracking-widest font-semibold" style={{ color: ts.textSecondary }}>{label}</p>
      {children}
    </div>
  );
}

function NumberField({ label, unit, min, max, value, onChange }: {
  label: string; unit: string; min: number; max: number;
  value: string | number; onChange: (v: string) => void;
}) {
  const ts = useThemeStyles();
  const numeric = value === '' ? null : Number(value);
  const outOfRange = numeric !== null && (Number.isNaN(numeric) || numeric < min || numeric > max);

  // Clamp to [min, max] when the user finishes editing (blur).
  // Typing-time stays permissive so partial values like "1" while reaching "180" aren't fought.
  const onBlur = () => {
    if (value === '' || numeric === null) return;
    if (Number.isNaN(numeric)) { onChange(''); return; }
    if (numeric < min) onChange(String(min));
    else if (numeric > max) onChange(String(max));
  };

  return (
    <div>
      <label className="t-caption uppercase tracking-widest font-semibold block mb-2" style={{ color: ts.textSecondary }}>
        {label}
      </label>
      <div className="flex items-center gap-2 px-3 py-3 rounded-xl"
        style={{
          background: ts.cardBgHover,
          border: `1px solid ${outOfRange ? '#FF8A8A' : ts.border}`,
        }}>
        <input
          type="number" min={min} max={max} step={1} value={value}
          onChange={e => onChange(e.target.value)}
          onBlur={onBlur}
          placeholder="—"
          className="flex-1 w-0 bg-transparent t-body outline-none tabular-nums"
          style={{ color: ts.textPrimary }}
          aria-invalid={outOfRange}
        />
        <span className="t-caption flex-shrink-0" style={{ color: ts.textMuted }}>{unit}</span>
      </div>
      {outOfRange && (
        <p className="t-label mt-1" style={{ color: '#FF8A8A' }}>{`Allowed: ${min}–${max} ${unit}`}</p>
      )}
    </div>
  );
}

function PillButton({ active, ts, onClick, children }: {
  active: boolean; ts: ReturnType<typeof useThemeStyles>;
  onClick: () => void; children: React.ReactNode;
}) {
  return (
    <button onClick={onClick} className="px-4 py-2 rounded-full t-body transition-all"
      style={{
        background: active ? ts.btnGradient : 'transparent',
        color:  active ? '#fff' : ts.textMuted,
        border: `1px solid ${active ? 'transparent' : ts.border}`,
      }}>
      {children}
    </button>
  );
}

// ─── Sleep bar chart (7 days) ─────────────────────────────────────────────────
function SleepBars({ days }: { days: SleepDay[] }) {
  const ts = useThemeStyles();
  const shown    = days.slice(-7);
  const GOAL_MIN = 480;
  const max      = Math.max(...shown.map(d => d.duration), GOAL_MIN);

  if (shown.length === 0) return null;

  const barColor = (d: SleepDay) =>
    d.duration >= 420 ? ts.accent
    : d.duration >= 360 ? '#FFD97D'
    : '#FF8A8A';

  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between t-caption" style={{ color: ts.textMuted }}>
        <span>{shown.length} night{shown.length !== 1 ? 's' : ''} recorded</span>
        <span>{fmt(shown[0].date)} – {fmt(shown[shown.length - 1].date)}</span>
      </div>
      <div style={{ position: 'relative', height: 88 }}>
        <div style={{
          position: 'absolute',
          bottom: `${(GOAL_MIN / max) * 72}px`,
          left: 0, right: 0,
          borderTop: '1px dashed rgba(255,255,255,0.15)',
          zIndex: 0,
        }}>
          <span style={{ position: 'absolute', right: 0, top: -12, fontSize: 10, color: ts.textMuted }}>8h goal</span>
        </div>
        <div className="flex items-end gap-1 absolute bottom-4 left-0 right-0" style={{ height: 72 }}>
          {shown.map((d, i) => {
            const pct = (d.duration / max) * 100;
            return (
              <div key={i} className="flex-1 flex flex-col items-center" style={{ gap: 2 }}>
                <span style={{ fontSize: 10, color: ts.textSecondary, whiteSpace: 'nowrap' }}>{fmtDur(d.duration)}</span>
                <div style={{
                  width: '100%', height: `${pct}%`, minHeight: 3,
                  background: barColor(d), borderRadius: '2px 2px 0 0', flexShrink: 0,
                }} />
              </div>
            );
          })}
        </div>
        <div className="flex gap-1 absolute bottom-0 left-0 right-0">
          {shown.map((d, i) => (
            <div key={i} className="flex-1 text-center" style={{ fontSize: 10, color: ts.textMuted }}>
              {fmt(d.date)}
            </div>
          ))}
        </div>
      </div>
      <div className="flex gap-3">
        {[
          { color: ts.accent,  label: 'Good  ≥7h' },
          { color: '#FFD97D',  label: 'Fair  ≥6h' },
          { color: '#FF8A8A',  label: 'Poor  <6h' },
        ].map(({ color, label }) => (
          <div key={label} className="flex items-center gap-1.5 t-caption" style={{ color: ts.textSecondary }}>
            <div style={{ width: 8, height: 8, borderRadius: 2, background: color, flexShrink: 0 }} />
            {label}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── HRV trend ────────────────────────────────────────────────────────────────
function HRVLine({ days }: { days: HRVDay[] }) {
  const ts  = useThemeStyles();
  const vals = days.filter(d => d.rmssd).slice(-7);
  const max  = Math.max(...vals.map(d => d.rmssd!), 1);
  const min  = Math.min(...vals.map(d => d.rmssd!), 0);
  const range = max - min || 1;
  const w = 100 / Math.max(vals.length - 1, 1);
  const points = vals.map((d, i) => `${i * w},${100 - ((d.rmssd! - min) / range) * 85}`).join(' ');
  return (
    <div>
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-10">
        <polyline points={points} fill="none" stroke={ts.accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        {vals.map((d, i) => (
          <circle key={i} cx={i * w} cy={100 - ((d.rmssd! - min) / range) * 85}
            r="2.5" fill={ts.accent} opacity="0.8" />
        ))}
      </svg>
      <div className="flex justify-between t-caption mt-1" style={{ color: ts.textMuted }}>
        {vals.map((d, i) => <span key={i}>{fmt(d.date)}</span>)}
      </div>
    </div>
  );
}

// ─── Stat pill ────────────────────────────────────────────────────────────────
function StatPill({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string; color: string }) {
  const ts = useThemeStyles();
  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-xl"
      style={{ backgroundColor: ts.cardBg, border: `1px solid ${ts.border}` }}>
      <span style={{ color }}>{icon}</span>
      <div>
        <p className="t-body font-semibold tabular-nums leading-none" style={{ color: ts.textSecondary }}>{value}</p>
        <p className="t-caption mt-0.5" style={{ color: ts.textMuted }}>{label}</p>
      </div>
    </div>
  );
}

// ─── Single source row ────────────────────────────────────────────────────────
function SourceRow({ icon, label, sublabel, connected, color, onAction, actionLabel, actionLoading, children }: {
  icon: React.ReactNode; label: string; sublabel: string;
  connected: boolean; color: string;
  onAction: () => void; actionLabel: string; actionLoading?: boolean;
  children?: React.ReactNode;
}) {
  const ts = useThemeStyles();
  return (
    <div className="flex flex-col gap-3 p-4 rounded-2xl transition-all"
      style={{
        backgroundColor: ts.cardBg,
        border: `1px solid ${connected ? color + '30' : ts.border}`,
      }}>
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 t-body"
          style={{ background: color + '14', border: `1px solid ${color}28` }}>
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="t-body font-medium leading-tight" style={{ color: ts.textPrimary }}>{label}</p>
          <p className="t-label mt-0.5" style={{ color: connected ? color : ts.textMuted }}>{sublabel}</p>
        </div>
        <button
          onClick={onAction}
          disabled={actionLoading}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl t-label font-medium flex-shrink-0 transition-all hover:scale-105 disabled:opacity-40"
          style={connected
            ? { color: ts.textMuted, border: `1px solid ${ts.border}`, background: 'transparent' }
            : { color: '#fff', background: ts.btnGradient }
          }
        >
          {actionLoading ? <RefreshCw size={11} className="animate-spin" /> : null}
          {actionLabel}
        </button>
      </div>
      {children}
    </div>
  );
}

// ─── AI health insight (compact chip + hover popover) ────────────────────────
function HealthInsight({ integrations }: { integrations: IntegrationStatus[] }) {
  const ts = useThemeStyles();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const allSleep = integrations.flatMap(i => i.data?.sleep ?? []);
  const allHRV   = integrations.flatMap(i => i.data?.hrv   ?? []).filter(d => d.rmssd);
  if (!allSleep.length && !allHRV.length) return null;

  const lastSleep = allSleep[allSleep.length - 1];
  const lastHRV   = allHRV[allHRV.length - 1];
  const avgHRV    = allHRV.length ? allHRV.reduce((s, d) => s + d.rmssd!, 0) / allHRV.length : null;

  let icon = '🧠'; let title = ''; let desc = ''; let technique = ''; let techniqueHref = '/breathing';

  if (lastSleep && lastSleep.duration < 360) {
    icon = '😴'; title = 'Poor sleep detected';
    desc = `${Math.floor(lastSleep.duration/60)}h${lastSleep.duration%60}m last night — try 4-7-8 to recover.`;
    technique = '4-7-8 Breathing'; techniqueHref = '/breathing/4-7-8';
  } else if (lastHRV && avgHRV && lastHRV.rmssd! < avgHRV * 0.8) {
    icon = '💙'; title = 'HRV below baseline';
    desc = `${Math.round(lastHRV.rmssd!)}ms vs your avg ${Math.round(avgHRV)}ms — go gentle today.`;
    technique = 'Coherent Breathing'; techniqueHref = '/breathing';
  } else if (lastSleep && lastSleep.score && lastSleep.score > 80) {
    icon = '⚡'; title = `Score ${lastSleep.score}/100 — push today`;
    desc = 'Great recovery. Ideal day for an energising session.';
    technique = 'Wim Hof Method'; techniqueHref = '/breathing/wim-hof';
  } else {
    icon = '🌊'; title = 'Baseline looks good';
    desc = 'Consistent practice keeps HRV stable.';
    technique = 'Box Breathing'; techniqueHref = '/breathing/box-breathing';
  }

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} className="relative w-fit">
      {/* Compact chip */}
      <button
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full t-label transition-all hover:scale-105"
        style={{
          backgroundColor: `${ts.accent}12`,
          border: `1px solid ${ts.accent}30`,
          color: ts.accent,
        }}
      >
        <Zap size={10} />
        <span>{icon} {title}</span>
      </button>

      {/* Popover */}
      {open && (
        <div
          className="absolute top-full mt-2 left-0 z-50 w-64 rounded-2xl p-4 flex flex-col gap-3"
          style={{
            backgroundColor: ts.cardBg,
            border: `1px solid ${ts.borderHover}`,
            boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
          }}
        >
          <p className="t-caption leading-relaxed" style={{ color: ts.textMuted }}>{desc}</p>
          <Link
            to={techniqueHref}
            onClick={() => setOpen(false)}
            className="flex items-center gap-1.5 t-caption font-medium px-4 py-2 rounded-xl w-fit transition-all hover:scale-105"
            style={{ background: ts.btnGradient, color: '#fff' }}
          >
            Try {technique} <ChevronRight size={11} />
          </Link>
        </div>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function ProfilePage() {
  const ts = useThemeStyles();
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, updateUser, logout } = useContext(AuthContext);

  // ── Tab ─────────────────────────────────────────────────────────────────────
  const validTabs = ['profile', 'devices', 'challenges', 'sessions', 'progress'] as const;
  type TabId = typeof validTabs[number];
  const paramTab = new URLSearchParams(location.search).get('tab') as TabId | null;
  const [tab, setTabState] = useState<TabId>(validTabs.includes(paramTab as TabId) ? (paramTab as TabId) : 'profile');

  // Keep state in sync with URL ?tab= param (back/forward nav + direct links)
  useEffect(() => {
    const next = new URLSearchParams(location.search).get('tab') as TabId | null;
    if (next && validTabs.includes(next) && next !== tab) {
      setTabState(next);
    }
  }, [location.search]);

  // Click handler that updates both state AND the URL so the link is shareable
  const setTab = (next: TabId) => {
    setTabState(next);
    const params = new URLSearchParams(location.search);
    if (next === 'profile') params.delete('tab');
    else params.set('tab', next);
    navigate(`${location.pathname}${params.toString() ? '?' + params.toString() : ''}`, { replace: true });
  };

  // ── Profile form ─────────────────────────────────────────────────────────────
  const [nickname, setNickname]    = useState('');
  // savedNickname is the value last persisted to the server; used for the avatar header preview
  // so the header doesn't visually change as the user types or clears the input pre-save.
  const [savedNickname, setSavedNickname] = useState('');
  const [avatarSrc, setAvatarSrc]  = useState<string | null>(null);
  const [body, setBody]            = useState({ heightCm: '', weightKg: '', age: '', gender: '', goal: '' });
  const [saving, setSaving]        = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const fileRef = useRef<HTMLInputElement>(null);

  // ── Reminder prefs ────────────────────────────────────────────────────────────
  const [reminderEnabled, setReminderEnabled] = useState(true);
  const [reminderHour, setReminderHour]       = useState(20);

  // ── Achievements ──────────────────────────────────────────────────────────────
  const [earnedAchievements, setEarnedAchievements] = useState<{ id: string; unlockedAt: string }[]>([]);

  useEffect(() => {
    api.get('/auth/me')
      .then(({ data }) => {
        setNickname(data.nickname || '');
        setSavedNickname(data.nickname || '');
        setAvatarSrc(data.avatar || data.picture || null);
        if (data.bodyProfile) {
          setBody({
            heightCm: data.bodyProfile.heightCm ?? '',
            weightKg: data.bodyProfile.weightKg ?? '',
            age:      data.bodyProfile.age      ?? '',
            gender:   data.bodyProfile.gender   ?? '',
            goal:     data.bodyProfile.goal     ?? '',
          });
        }
        if (data.emailPreferences) {
          setReminderEnabled(data.emailPreferences.reminder ?? true);
          setReminderHour(data.emailPreferences.reminderHour ?? 20);
        }
        if (data.achievements) setEarnedAchievements(data.achievements);
      })
      .catch(() => {
        toast.error(t('profile.loadFailed'));
      })
      .finally(() => setLoadingProfile(false));
  }, []);

  const onFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        const c = document.createElement('canvas');
        c.width = c.height = 160;
        const ctx = c.getContext('2d')!;
        const s = Math.min(img.width, img.height);
        ctx.drawImage(img, (img.width - s) / 2, (img.height - s) / 2, s, s, 0, 0, 160, 160);
        setAvatarSrc(c.toDataURL('image/jpeg', 0.78));
      };
      img.src = ev.target?.result as string;
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // BMI
  const bmi = body.heightCm && body.weightKg
    ? (Number(body.weightKg) / Math.pow(Number(body.heightCm) / 100, 2)).toFixed(1)
    : null;
  const bmiLabel = bmi
    ? Number(bmi) < 18.5 ? t('profile.bmi.underweight') : Number(bmi) < 25 ? t('profile.bmi.normal') : Number(bmi) < 30 ? t('profile.bmi.overweight') : t('profile.bmi.obese')
    : null;
  const bmiColor = bmi
    ? Number(bmi) < 18.5 ? '#FFD97D' : Number(bmi) < 25 ? '#4AE8A0' : Number(bmi) < 30 ? '#FFD97D' : '#FF8A8A'
    : null;

  const saveProfile = async () => {
    setSaving(true);
    try {
      const payload: any = { nickname };
      if (avatarSrc?.startsWith('data:')) payload.avatar = avatarSrc;
      payload.bodyProfile = {
        ...(body.heightCm && { heightCm: Number(body.heightCm) }),
        ...(body.weightKg && { weightKg: Number(body.weightKg) }),
        ...(body.age      && { age:      Number(body.age) }),
        ...(body.gender   && { gender:   body.gender }),
        ...(body.goal     && { goal:     body.goal }),
      };
      payload.emailPreferences = {
        reminder:     reminderEnabled,
        reminderHour: reminderHour,
      };
      const { data } = await api.patch('/auth/me', payload);
      updateUser({ nickname: data.nickname, avatar: data.avatar });
      setSavedNickname(data.nickname || '');
      toast.success(t('profile.savedSuccess'));
    } catch {
      toast.error(t('profile.failedSave'));
    } finally {
      setSaving(false);
    }
  };

  // ── Integrations ──────────────────────────────────────────────────────────────
  const [integrations, setIntegrations] = useState<IntegrationStatus[]>([]);
  const [syncing, setSyncing]           = useState(false);
  const [loadingInt, setLoadingInt]     = useState(true);

  const fetchStatus = useCallback(async () => {
    setLoadingInt(true);
    try {
      const { data } = await api.get('/integrations/status');
      setIntegrations(data);
    } catch (err: any) {
      console.error('fetchStatus error:', err?.response?.status ?? err?.code, err?.message);
    } finally { setLoadingInt(false); }
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const integ  = params.get('integration');
    const status = params.get('status');
    if (integ && status === 'connected')
      toast.success(t('profile.integConnected', { integ: integ === 'fitbit' ? 'Fitbit' : 'Google Fit' }));
    if (integ && status === 'error')
      toast.error(t('profile.connectionFailed'));
    fetchStatus();
  }, [location.search]);

  const BACKEND = import.meta.env.VITE_API_BASE?.replace('/api', '') ?? 'https://breathe-api-amut.onrender.com';
  const connect    = (provider: string) => {
    window.location.href = `${BACKEND}/api/integrations/${provider}/connect?token=${localStorage.getItem('token') ?? ''}`;
  };
  const disconnect = async (provider: string) => {
    try {
      await api.delete(`/integrations/${provider}`);
      setIntegrations(prev => prev.filter(i => i.provider !== provider));
      toast.success(t('profile.disconnected'));
    } catch { toast.error(t('profile.failedDisconnect')); }
  };
  const sync = async () => {
    setSyncing(true);
    try { await api.post('/integrations/sync'); await fetchStatus(); toast.success(t('profile.syncedSuccess')); }
    catch { toast.error(t('profile.syncFailed')); } finally { setSyncing(false); }
  };
  const getStatus = (provider: string) => integrations.find(i => i.provider === provider);

  // ── Derived display values ────────────────────────────────────────────────────
  const displayName  = savedNickname || user?.name || user?.email?.split('@')[0] || 'Your Profile';
  const currentGoal  = GOALS.find(g => g.value === body.goal);

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <div className="relative flex flex-col min-h-screen font-montserrat">
      <PageSEO
        title="Profile | Breathe"
        description="Manage your Breathe profile, track your streaks, view achievements, and customize your meditation experience."
        canonical="/profile"
        noIndex
      />
      <ThemeBackground />
      <div className="relative z-10 flex flex-col min-h-screen">
        <NavBar />

        <main className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 py-10 flex flex-col gap-6">

          {/* Page header */}
          <div>
            <p className="t-label mb-1" style={{ color: ts.textMuted }}>
              {t('profile.brand')}
            </p>
            <h1 className="text-2xl sm:text-3xl font-medium tracking-wide" style={{ color: ts.textPrimary }}>
              {t('profile.myAccount')}
            </h1>
          </div>

          {/* Avatar card */}
          <div className="flex items-center gap-5 p-5 rounded-2xl"
            style={{ backgroundColor: ts.cardBg, border: `1px solid ${ts.border}` }}>
            {/* Clickable avatar */}
            <div className="relative flex-shrink-0">
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onFileSelect} />
              <button
                onClick={() => fileRef.current?.click()}
                className="relative w-20 h-20 rounded-full overflow-hidden group"
                title="Change photo"
              >
                {loadingProfile ? (
                  <div className="w-full h-full animate-pulse" style={{ background: ts.cardBgHover }} />
                ) : avatarSrc ? (
                  <img src={avatarSrc} alt="avatar" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-3xl font-semibold text-white"
                    style={{ background: ts.btnGradient }}>
                    {(user?.email?.[0] ?? 'U').toUpperCase()}
                  </div>
                )}
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
                  <Camera size={18} className="text-white" />
                </div>
              </button>
            </div>

            {/* User info */}
            <div className="flex-1 min-w-0">
              <p className="t-heading font-semibold truncate" style={{ color: ts.textPrimary }}>
                {displayName}
              </p>
              <p className="t-caption mt-0.5 truncate" style={{ color: ts.textMuted }}>
                {user?.email}
              </p>
              {currentGoal && (
                <p className="t-caption mt-2 inline-flex items-center gap-1 px-2.5 py-1 rounded-full"
                  style={{ background: `${ts.accent}18`, color: ts.accentLight, border: `1px solid ${ts.accent}30` }}>
                  {currentGoal.icon} {currentGoal.label}
                </p>
              )}
            </div>

            {/* Body stats preview */}
            {(body.heightCm || body.weightKg || body.age) && (
              <div className="hidden sm:flex flex-col items-end gap-1 flex-shrink-0">
                {body.heightCm && (
                  <p className="t-caption tabular-nums" style={{ color: ts.textSecondary }}>
                    <span style={{ color: ts.textMuted }}>Height </span>{body.heightCm} cm
                  </p>
                )}
                {body.weightKg && (
                  <p className="t-caption tabular-nums" style={{ color: ts.textSecondary }}>
                    <span style={{ color: ts.textMuted }}>Weight </span>{body.weightKg} kg
                  </p>
                )}
                {body.age && (
                  <p className="t-caption tabular-nums" style={{ color: ts.textSecondary }}>
                    <span style={{ color: ts.textMuted }}>Age </span>{body.age}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Tab switcher */}
          <div className="flex flex-wrap rounded-xl overflow-hidden" style={{ border: `1px solid ${ts.border}` }}>
            {([
              { id: 'profile'    as const, label: t('profile.tabs.profile') },
              { id: 'sessions'   as const, label: t('profile.tabs.sessions') },
              { id: 'progress'   as const, label: t('profile.tabs.progress') },
              { id: 'challenges' as const, label: t('profile.tabs.challenges') },
              { id: 'devices'    as const, label: t('profile.tabs.devices') },
            ]).map(tb => (
              <button key={tb.id} onClick={() => setTab(tb.id)}
                className="flex-1 py-3 t-caption font-medium transition-all"
                style={{
                  background: tab === tb.id ? ts.btnGradient : ts.cardBg,
                  color: tab === tb.id ? '#fff' : ts.textSecondary,
                  minWidth: '20%',
                  borderRight: `1px solid ${ts.border}`,
                }}>
                {tb.label}
              </button>
            ))}
          </div>

          {/* ── My Profile tab ──────────────────────────────────────────────── */}
          {tab === 'profile' && (
            <div className="flex flex-col gap-4">

              {/* Display name */}
              <Section label={t('profile.displayName')}>
                <input
                  type="text"
                  value={nickname}
                  onChange={e => setNickname(e.target.value.slice(0, 30))}
                  placeholder={user?.name || user?.email?.split('@')[0] || 'Your nickname'}
                  className="w-full px-4 py-3 rounded-xl t-body outline-none"
                  style={{
                    background: ts.cardBgHover,
                    border: `1px solid ${ts.border}`,
                    color: ts.textPrimary,
                  }}
                />
                <p className="t-caption" style={{ color: ts.textDim }}>
                  {t('profile.displayNameHint')}
                </p>
              </Section>

              {/* Body data */}
              <Section label={t('profile.bodyData')}>
                <div className="grid grid-cols-2 gap-3">
                  <NumberField label={t('profile.height')} unit="cm" min={50} max={300}
                    value={body.heightCm} onChange={v => setBody(b => ({ ...b, heightCm: v }))} />
                  <NumberField label={t('profile.weight')} unit="kg" min={20} max={500}
                    value={body.weightKg} onChange={v => setBody(b => ({ ...b, weightKg: v }))} />
                </div>

                {bmi && (
                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg"
                    style={{ background: `${bmiColor}12`, border: `1px solid ${bmiColor}33` }}>
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: bmiColor! }} />
                    <p className="t-caption" style={{ color: ts.textSecondary }}>
                      BMI <strong>{bmi}</strong>
                      <span className="ml-2" style={{ color: bmiColor! }}>{bmiLabel}</span>
                    </p>
                  </div>
                )}

                <NumberField label={t('profile.age')} unit="years" min={1} max={120}
                  value={body.age} onChange={v => setBody(b => ({ ...b, age: v }))} />
              </Section>

              {/* Gender */}
              <Section label={t('profile.gender')}>
                <div className="flex flex-wrap gap-2">
                  {GENDERS.map(g => (
                    <PillButton key={g.value} ts={ts}
                      active={body.gender === g.value}
                      onClick={() => setBody(b => ({ ...b, gender: b.gender === g.value ? '' : g.value }))}>
                      {t(`profile.genders.${g.value}`)}
                    </PillButton>
                  ))}
                </div>
              </Section>

              {/* Goal */}
              <Section label={t('profile.myGoal')}>
                <div className="flex flex-wrap gap-2">
                  {GOALS.map(g => (
                    <PillButton key={g.value} ts={ts}
                      active={body.goal === g.value}
                      onClick={() => setBody(b => ({ ...b, goal: b.goal === g.value ? '' : g.value }))}>
                      {g.icon} {t(`profile.goals.${g.value}`)}
                    </PillButton>
                  ))}
                </div>
              </Section>

              {/* Daily reminder */}
              <Section label={t('profile.dailyReminder')}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="t-body" style={{ color: ts.textSecondary }}>{t('profile.emailReminder')}</p>
                    <p className="t-caption mt-0.5" style={{ color: ts.textDim }}>
                      {t('profile.reminderHint')}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setReminderEnabled(v => !v)}
                    className="relative w-11 h-6 rounded-full transition-all duration-200 flex-shrink-0"
                    style={{ background: reminderEnabled ? ts.accent : ts.border }}
                  >
                    <div
                      className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-all duration-200"
                      style={{ left: reminderEnabled ? 22 : 2 }}
                    />
                  </button>
                </div>

                {reminderEnabled && (
                  <div className="flex items-center gap-3 mt-1">
                    <p className="t-caption flex-shrink-0" style={{ color: ts.textMuted }}>{t('profile.sendAt')}</p>
                    <div className="flex items-center gap-1 px-3 py-2 rounded-xl flex-1"
                      style={{ background: ts.cardBgHover, border: `1px solid ${ts.border}` }}>
                      <input
                        type="number" min={0} max={23} value={reminderHour}
                        onChange={e => setReminderHour(Math.max(0, Math.min(23, Number(e.target.value))))}
                        className="w-10 bg-transparent t-body outline-none tabular-nums text-center"
                        style={{ color: ts.textPrimary }}
                      />
                      <span className="t-caption" style={{ color: ts.textMuted }}>:00</span>
                    </div>
                    <p className="t-caption flex-shrink-0" style={{ color: ts.textDim }}>
                      {String(reminderHour).padStart(2, '0')}:00 UTC
                    </p>
                  </div>
                )}
              </Section>

              {/* How we use this */}
              <div className="px-4 py-3 rounded-xl"
                style={{ background: `${ts.accent}0D`, border: `1px solid ${ts.border}` }}>
                <p className="t-caption uppercase tracking-widest font-semibold mb-2" style={{ color: ts.accentLight }}>
                  {t('profile.howWeUse')}
                </p>
                <p className="t-body leading-relaxed" style={{ color: ts.textMuted }}>
                  {t('profile.howWeUseText')}
                </p>
              </div>

              {/* Save */}
              <button onClick={saveProfile} disabled={saving}
                className="flex items-center justify-center gap-2 py-3.5 rounded-xl t-body font-semibold text-white transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60"
                style={{ background: ts.btnGradient, boxShadow: ts.btnShadow }}>
                {saving ? <RefreshCw size={14} className="animate-spin" /> : <Save size={14} />}
                {saving ? t('profile.saving') : t('profile.saveChanges')}
              </button>

              {/* Quick nav */}
              <div className="grid grid-cols-2 gap-3">
                <Link to="/sessions" className="flex items-center justify-between p-4 rounded-2xl transition-all"
                  style={{ backgroundColor: ts.cardBg, border: `1px solid ${ts.border}` }}>
                  <div>
                    <p className="t-body font-medium" style={{ color: ts.textPrimary }}>{t('profile.mySessions')}</p>
                    <p className="t-caption mt-0.5" style={{ color: ts.textMuted }}>{t('profile.breathingHistory')}</p>
                  </div>
                  <ChevronRight size={14} style={{ color: ts.textDim }} />
                </Link>
                <Link to="/statistics" className="flex items-center justify-between p-4 rounded-2xl transition-all"
                  style={{ backgroundColor: ts.cardBg, border: `1px solid ${ts.border}` }}>
                  <div>
                    <p className="t-body font-medium" style={{ color: ts.textPrimary }}>{t('profile.progress')}</p>
                    <p className="t-caption mt-0.5" style={{ color: ts.textMuted }}>{t('profile.chartsInsights')}</p>
                  </div>
                  <ChevronRight size={14} style={{ color: ts.textDim }} />
                </Link>
                <button
                  onClick={() => setTab('challenges')}
                  className="col-span-2 flex items-center justify-between p-4 rounded-2xl transition-all hover:opacity-90"
                  style={{ background: `${ts.accent}12`, border: `1px solid ${ts.accent}30` }}
                >
                  <div className="flex items-center gap-3">
                    <span className="t-heading">🏆</span>
                    <div className="text-left">
                      <p className="t-body font-medium" style={{ color: ts.accentLight }}>{t('profile.breathingChallenges')}</p>
                      <p className="t-caption mt-0.5" style={{ color: ts.textMuted }}>{t('profile.challengeSubtitle')}</p>
                    </div>
                  </div>
                  <ChevronRight size={14} style={{ color: ts.accent }} />
                </button>
              </div>
              {/* Achievements */}
              <Section label={`${t('profile.achievementsLabel')} · ${earnedAchievements.length}/${ALL_ACHIEVEMENTS.length}`}>
                <div className="grid grid-cols-4 gap-2">
                  {ALL_ACHIEVEMENTS.map(a => {
                    const earned = earnedAchievements.find(e => e.id === a.id);
                    return (
                      <AchievementBadge
                        key={a.id}
                        achievement={a}
                        earned={!!earned}
                        earnedAt={earned?.unlockedAt}
                      />
                    );
                  })}
                </div>
              </Section>

              {/* ── Data & Account ─────────────────────────────────────────── */}
              <Section label={t('profile.dataAccount', 'Data & Account')}>
                <div className="flex flex-col gap-2">
                  <button
                    onClick={async () => {
                      try {
                        const res = await api.get('/users/me/export', { responseType: 'blob', timeout: 60000 });
                        const url = URL.createObjectURL(res.data);
                        const a = document.createElement('a');
                        a.href = url; a.download = 'breathe-my-data.json'; a.click();
                        URL.revokeObjectURL(url);
                        toast.success(t('profile.exportSuccess', 'Your data is downloading.'));
                      } catch {
                        toast.error(t('profile.exportError', 'Export failed. Please try again.'));
                      }
                    }}
                    className="flex items-center gap-3 p-4 rounded-2xl text-left transition-all hover:opacity-90"
                    style={{ background: ts.cardBg, border: `1px solid ${ts.border}` }}
                  >
                    <Download size={16} style={{ color: ts.accent }} />
                    <div>
                      <p className="t-body font-medium" style={{ color: ts.textPrimary }}>{t('profile.exportData', 'Export My Data')}</p>
                      <p className="t-caption mt-0.5" style={{ color: ts.textMuted }}>{t('profile.exportDataSub', 'Download a copy of all your data (GDPR Art. 20)')}</p>
                    </div>
                  </button>
                  <button
                    onClick={async () => {
                      if (!window.confirm(t('profile.deleteConfirm', 'This will permanently delete your account and all data. This cannot be undone. Continue?'))) return;
                      try {
                        await api.delete('/users/me');
                        toast.success(t('profile.deleteSuccess', 'Account deleted.'));
                        logout();
                        navigate('/');
                      } catch {
                        toast.error(t('profile.deleteError', 'Delete failed. Please try again or contact support.'));
                      }
                    }}
                    className="flex items-center gap-3 p-4 rounded-2xl text-left transition-all hover:opacity-90"
                    style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)' }}
                  >
                    <Trash2 size={16} color="#EF4444" />
                    <div>
                      <p className="t-body font-medium" style={{ color: '#EF4444' }}>{t('profile.deleteAccount', 'Delete Account')}</p>
                      <p className="t-caption mt-0.5" style={{ color: ts.textMuted }}>{t('profile.deleteAccountSub', 'Permanently erase your account and all associated data (GDPR Art. 17)')}</p>
                    </div>
                  </button>
                </div>
              </Section>
            </div>
          )}

          {/* ── Sessions tab ─────────────────────────────────────────────────── */}
          {tab === 'sessions' && <SessionsSection />}

          {/* ── Progress tab ─────────────────────────────────────────────────── */}
          {tab === 'progress' && <StatsSection />}

          {/* ── Challenges tab ───────────────────────────────────────────────── */}
          {tab === 'challenges' && <ChallengesSection />}

          {/* ── Health Devices tab ────────────────────────────────────────────── */}
          {tab === 'devices' && (() => {
            const fitbit     = getStatus('fitbit') as IntegrationStatus | undefined;
            const googleFit  = getStatus('google_fit') as IntegrationStatus | undefined;

            // Aggregate health data across all connected sources
            const allSleep = integrations.flatMap(i => i.data?.sleep ?? []);
            const allHRV   = integrations.flatMap(i => (i.data?.hrv ?? []).filter(d => d.rmssd));
            const allHR    = integrations.flatMap(i => i.data?.heartRate ?? []);
            const hasData  = allSleep.length > 0 || allHRV.length > 0;

            const avgSleep7 = (() => {
              const s = allSleep.slice(-7);
              return s.length ? Math.round(s.reduce((a, d) => a + d.duration, 0) / s.length) : null;
            })();
            const avgHRV7 = (() => {
              const h = allHRV.slice(-7);
              return h.length ? Math.round(h.reduce((a, d) => a + (d.rmssd ?? 0), 0) / h.length) : null;
            })();
            const restingHR = allHR.length ? (allHR[allHR.length - 1]?.restingRate ?? null) : null;

            return (
              <div className="flex flex-col gap-5">

                {/* ── Health summary (only when data exists) ── */}
                {hasData && (
                  <div className="rounded-2xl p-4"
                    style={{ backgroundColor: ts.cardBg, border: `1px solid ${ts.border}` }}>
                    <div className="flex items-center justify-between mb-3">
                      <p className="t-label uppercase tracking-widest" style={{ color: ts.textMuted }}>{t('profile.healthOverview')}</p>
                      {integrations.length > 0 && <HealthInsight integrations={integrations} />}
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="flex flex-col gap-0.5">
                        <div className="flex items-center gap-1.5 mb-1">
                          <Moon size={10} style={{ color: ts.accentLight }} />
                          <p className="t-label" style={{ color: ts.textMuted }}>{t('profile.sleepLabel')}</p>
                        </div>
                        <p className="t-subheading font-semibold tabular-nums" style={{ color: avgSleep7 ? ts.textPrimary : ts.textDim }}>
                          {avgSleep7 ? fmtDur(avgSleep7) : '—'}
                        </p>
                        <p className="t-label" style={{ color: avgSleep7 && avgSleep7 >= 420 ? ts.accent : avgSleep7 && avgSleep7 >= 300 ? '#FFD97D' : ts.textDim }}>
                          {avgSleep7 ? (avgSleep7 >= 420 ? t('profile.good') : avgSleep7 >= 300 ? t('profile.fair') : t('profile.poor')) : t('profile.noData')}
                        </p>
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <div className="flex items-center gap-1.5 mb-1">
                          <Activity size={10} style={{ color: ts.accent }} />
                          <p className="t-label" style={{ color: ts.textMuted }}>HRV</p>
                        </div>
                        <p className="t-subheading font-semibold tabular-nums" style={{ color: avgHRV7 ? ts.textPrimary : ts.textDim }}>
                          {avgHRV7 ? `${avgHRV7} ms` : '—'}
                        </p>
                        <p className="t-label" style={{ color: ts.textDim }}>
                          {avgHRV7 ? (avgHRV7 >= 60 ? t('profile.great') : avgHRV7 >= 40 ? t('profile.good') : t('profile.low')) : t('profile.noData')}
                        </p>
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <div className="flex items-center gap-1.5 mb-1">
                          <Heart size={10} style={{ color: '#FF8A8A' }} />
                          <p className="t-label" style={{ color: ts.textMuted }}>Resting HR</p>
                        </div>
                        <p className="t-subheading font-semibold tabular-nums" style={{ color: restingHR ? ts.textPrimary : ts.textDim }}>
                          {restingHR ? `${restingHR} bpm` : '—'}
                        </p>
                        <p className="t-label" style={{ color: ts.textDim }}>
                          {restingHR ? (restingHR < 60 ? t('profile.excellent') : restingHR < 70 ? t('profile.good') : t('profile.average')) : t('profile.noData')}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* ── Sources ── */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between px-1">
                    <p className="t-label uppercase tracking-widest" style={{ color: ts.textMuted }}>{t('profile.sources')}</p>
                    <div className="flex items-center gap-3">
                      {integrations.some(i => i.connected) && (
                        <button onClick={sync} disabled={syncing}
                          className="flex items-center gap-1 t-label disabled:opacity-40 hover:underline"
                          style={{ color: ts.accent }}>
                          <RefreshCw size={9} className={syncing ? 'animate-spin' : ''} /> {t('profile.syncAll')}
                        </button>
                      )}
                      <Link to="/data-consent" className="t-label hover:underline" style={{ color: ts.textDim }}>{t('profile.privacyLink')}</Link>
                    </div>
                  </div>

                  {loadingInt ? (
                    <div className="flex flex-col gap-2">
                      {[0, 1, 2, 3].map(i => <div key={i} className="h-16 rounded-2xl animate-pulse" style={{ backgroundColor: ts.cardBg }} />)}
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2">
                      {/* Fitbit */}
                      <SourceRow
                        icon={<Heart size={16} color="#4ADE80" />} label="Fitbit" color="#4AE8A0"
                        connected={!!fitbit?.connected}
                        sublabel={fitbit?.connected ? `Synced ${fitbit.lastSyncAt ? timeAgo(fitbit.lastSyncAt) : 'never'} · sleep · HRV · HR` : 'Wearable — sleep stages, HRV, heart rate'}
                        onAction={fitbit?.connected ? () => disconnect('fitbit') : () => connect('fitbit')}
                        actionLabel={fitbit?.connected ? t('profile.disconnect') : t('profile.connect')}
                      >
                        {fitbit?.connected && (() => {
                          const s = fitbit.data?.sleep?.slice(-7) ?? [];
                          const h = (fitbit.data?.hrv?.slice(-7) ?? []).filter(d => d.rmssd);
                          const avg = s.length ? Math.round(s.reduce((a, d) => a + d.duration, 0) / s.length) : null;
                          const hrvAvg = h.length ? Math.round(h.reduce((a, d) => a + (d.rmssd ?? 0), 0) / h.length) : null;
                          return avg || hrvAvg ? (
                            <div className="flex gap-2 flex-wrap">
                              {avg    && <StatPill icon={<Moon size={11} />}     label={t('profile.avgSleep')} value={fmtDur(avg)}    color="#7AC4FF" />}
                              {hrvAvg && <StatPill icon={<Activity size={11} />} label={t('profile.avgHRV')}   value={`${hrvAvg} ms`} color="#4A9EFF" />}
                            </div>
                          ) : null;
                        })()}
                      </SourceRow>

                      {/* Google Fit */}
                      <SourceRow
                        icon={<Activity size={16} color="#4A9EFF" />} label="Google Fit" color="#4A9EFF"
                        connected={!!googleFit?.connected}
                        sublabel={googleFit?.connected ? `Synced ${googleFit.lastSyncAt ? timeAgo(googleFit.lastSyncAt) : 'never'} · sleep · HR` : 'Android / Wear OS — sleep duration, heart rate'}
                        onAction={googleFit?.connected ? () => disconnect('google_fit') : () => connect('google-fit')}
                        actionLabel={googleFit?.connected ? t('profile.disconnect') : t('profile.connect')}
                      >
                        {googleFit?.connected && (() => {
                          const s = googleFit.data?.sleep?.slice(-7) ?? [];
                          const avg = s.length ? Math.round(s.reduce((a, d) => a + d.duration, 0) / s.length) : null;
                          return avg ? (
                            <div className="flex gap-2">
                              <StatPill icon={<Moon size={11} />} label={t('profile.avgSleep')} value={fmtDur(avg)} color="#7AC4FF" />
                            </div>
                          ) : null;
                        })()}
                      </SourceRow>

                      {/* Apple Health */}
                      <AppleHealthImport onImported={() => fetchStatus()} />

                      {/* BLE Heart Rate — only shown on Chrome/Edge with Web Bluetooth */}
                      {'bluetooth' in navigator && (
                        <HeartRateMonitor variant="full" />
                      )}
                    </div>
                  )}
                </div>

              </div>
            );
          })()}

        </main>
        <Footer />
      </div>
    </div>
  );
}
