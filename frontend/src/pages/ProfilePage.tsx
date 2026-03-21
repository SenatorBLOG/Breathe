// src/pages/ProfilePage.tsx
import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import NavBar from '../components/NavBar';
import ThemeBackground from '../components/ThemeBackground';
import Footer from '../components/Footer';
import api from '../api';
import { toast } from 'sonner';
import {
  RefreshCw, Unlink, Moon, Heart, Activity, Zap, ChevronRight,
  Watch, Camera, Save,
} from 'lucide-react';
import AppleHealthImport from '../components/AppleHealthImport';
import HeartRateMonitor from '../components/HeartRateMonitor';
import { useThemeStyles } from '../hooks/useThemeStyles';
import { AuthContext } from '../components/contexts/AuthContext';

// ─── Constants ────────────────────────────────────────────────────────────────
const GOALS = [
  { value: 'sleep',   label: 'Better Sleep',    icon: '😴' },
  { value: 'stress',  label: 'Less Stress',      icon: '🧘' },
  { value: 'focus',   label: 'More Focus',       icon: '🎯' },
  { value: 'energy',  label: 'More Energy',      icon: '⚡' },
  { value: 'general', label: 'General Wellness', icon: '🌊' },
] as const;

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
    icon: '💚',
    color: '#4AE8A0',
    bg: 'rgba(74,232,160,0.08)',
    description: 'Wearable device (watch / band)',
    details: 'Sleep stages (deep · REM · light · wake), HRV (RMSSD), resting heart rate',
    dataTypes: ['Sleep stages', 'HRV', 'Heart rate'],
  },
  google_fit: {
    label: 'Google Fit',
    icon: '🔵',
    color: '#4A9EFF',
    bg: 'rgba(74,158,255,0.08)',
    description: 'Android / Wear OS platform',
    details: 'Sleep duration, average heart rate. No sleep stages or HRV.',
    dataTypes: ['Sleep duration', 'Heart rate'],
  },
};

function fmt(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
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
      <p className="text-[10px] uppercase tracking-widest" style={{ color: ts.textMuted }}>{label}</p>
      {children}
    </div>
  );
}

function NumberField({ label, unit, min, max, value, onChange }: {
  label: string; unit: string; min: number; max: number;
  value: string | number; onChange: (v: string) => void;
}) {
  const ts = useThemeStyles();
  return (
    <div>
      <label className="text-[10px] uppercase tracking-widest block mb-1.5" style={{ color: ts.textMuted }}>
        {label}
      </label>
      <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl"
        style={{ background: ts.cardBgHover, border: `1px solid ${ts.border}` }}>
        <input
          type="number" min={min} max={max} value={value}
          onChange={e => onChange(e.target.value)}
          placeholder="—"
          className="flex-1 w-0 bg-transparent text-sm outline-none tabular-nums"
          style={{ color: ts.textPrimary }}
        />
        <span className="text-xs flex-shrink-0" style={{ color: ts.textMuted }}>{unit}</span>
      </div>
    </div>
  );
}

function PillButton({ active, ts, onClick, children }: {
  active: boolean; ts: ReturnType<typeof useThemeStyles>;
  onClick: () => void; children: React.ReactNode;
}) {
  return (
    <button onClick={onClick} className="px-3 py-1.5 rounded-full text-xs transition-all"
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
      <div className="flex justify-between" style={{ fontSize: 9, color: ts.textDim }}>
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
          <span style={{ position: 'absolute', right: 0, top: -10, fontSize: 8, color: ts.textDim }}>8h goal</span>
        </div>
        <div className="flex items-end gap-1 absolute bottom-4 left-0 right-0" style={{ height: 72 }}>
          {shown.map((d, i) => {
            const pct = (d.duration / max) * 100;
            return (
              <div key={i} className="flex-1 flex flex-col items-center" style={{ gap: 2 }}>
                <span style={{ fontSize: 7, color: ts.textMuted, whiteSpace: 'nowrap' }}>{fmtDur(d.duration)}</span>
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
            <div key={i} className="flex-1 text-center" style={{ fontSize: 7, color: ts.textDim }}>
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
          <div key={label} className="flex items-center gap-1" style={{ fontSize: 8, color: ts.textDim }}>
            <div style={{ width: 7, height: 7, borderRadius: 2, background: color, flexShrink: 0 }} />
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
      <div className="flex justify-between text-[7px] mt-0.5" style={{ color: ts.textDim }}>
        {vals.map((d, i) => <span key={i}>{fmt(d.date).split(' ')[1]}</span>)}
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
        <p className="text-sm font-medium tabular-nums leading-none" style={{ color: ts.textSecondary }}>{value}</p>
        <p className="text-[9px] uppercase tracking-wide" style={{ color: ts.textMuted }}>{label}</p>
      </div>
    </div>
  );
}

// ─── Integration card ─────────────────────────────────────────────────────────
function IntegrationCard({ status, provider, onConnect, onDisconnect, onSync, syncing }: {
  status?: IntegrationStatus;
  provider: 'fitbit' | 'google_fit';
  onConnect: () => void;
  onDisconnect: () => void;
  onSync: () => void;
  syncing: boolean;
}) {
  const ts   = useThemeStyles();
  const meta = PROVIDER_META[provider];
  const sleep = status?.data?.sleep?.slice(-7) ?? [];
  const hrv   = (status?.data?.hrv?.slice(-7) ?? []).filter(d => d.rmssd);
  const hr    = status?.data?.heartRate?.slice(-1)[0];

  const avgSleep = sleep.length ? Math.round(sleep.reduce((s, d) => s + d.duration, 0) / sleep.length) : null;
  const avgHRV   = hrv.length   ? Math.round(hrv.reduce((s, d) => s + d.rmssd!, 0) / hrv.length)   : null;

  return (
    <div className="flex flex-col gap-4 p-5 rounded-2xl border transition-all"
      style={{
        backgroundColor: ts.cardBg,
        borderColor: status?.connected ? `${meta.color}33` : ts.border,
        boxShadow: status?.connected ? `0 0 20px ${meta.bg}` : 'none',
      }}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
            style={{ background: meta.bg, border: `1px solid ${meta.color}33` }}>
            {meta.icon}
          </div>
          <div>
            <p className="text-sm font-semibold" style={{ color: ts.textPrimary }}>{meta.label}</p>
            <p className="text-[9px]" style={{ color: ts.textDim }}>{meta.description}</p>
            <p className="text-[9px] mt-0.5" style={{ color: status?.connected ? meta.color : ts.textDim }}>
              {status?.connected
                ? `Connected · last sync: ${status.lastSyncAt ? timeAgo(status.lastSyncAt) : 'never'}`
                : 'Not connected'}
            </p>
          </div>
        </div>
        {status?.connected ? (
          <div className="flex items-center gap-1 flex-shrink-0">
            <button onClick={onSync} disabled={syncing} title="Sync data now"
              className="p-1.5 rounded-lg transition-colors disabled:opacity-40"
              style={{ color: ts.textMuted }}>
              <RefreshCw size={13} className={syncing ? 'animate-spin' : ''} />
            </button>
            <button onClick={onDisconnect} title="Disconnect"
              className="p-1.5 rounded-lg transition-colors"
              style={{ color: ts.textMuted }}>
              <Unlink size={13} />
            </button>
          </div>
        ) : (
          <button onClick={onConnect}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium transition-all hover:scale-105 flex-shrink-0"
            style={{ background: ts.btnGradient }}>
            Connect <ChevronRight size={11} />
          </button>
        )}
      </div>

      {!status?.connected && (
        <div className="px-3 py-2 rounded-xl" style={{ background: `${meta.color}08`, border: `1px solid ${meta.color}1A` }}>
          <p className="text-[9px] uppercase tracking-widest mb-1" style={{ color: meta.color }}>Tracks</p>
          <p className="text-[10px]" style={{ color: ts.textMuted }}>{meta.details}</p>
        </div>
      )}

      {status?.connected && sleep.length > 0 && (
        <>
          <div className="grid grid-cols-3 gap-2">
            {avgSleep !== null && <StatPill icon={<Moon size={12} />} label={`Avg sleep · ${sleep.length}d`} value={fmtDur(avgSleep)} color="#7AC4FF" />}
            {avgHRV   !== null && <StatPill icon={<Activity size={12} />} label="Avg HRV" value={`${avgHRV} ms`} color="#4A9EFF" />}
            {hr?.restingRate   && <StatPill icon={<Heart size={12} />} label="Resting HR" value={`${hr.restingRate} bpm`} color="#FF8A8A" />}
          </div>
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1.5">
              <Moon size={10} style={{ color: ts.textMuted }} />
              <p className="text-[9px] uppercase tracking-widest" style={{ color: ts.textMuted }}>Sleep duration</p>
              <span className="text-[8px] ml-auto" style={{ color: ts.textDim }}>source: {meta.label}</span>
            </div>
            <SleepBars days={sleep} />
          </div>
          {hrv.length > 1 && (
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-1.5">
                <Activity size={10} style={{ color: ts.textMuted }} />
                <p className="text-[9px] uppercase tracking-widest" style={{ color: ts.textMuted }}>HRV (RMSSD) · last {hrv.length} days</p>
                <span className="text-[8px] ml-auto" style={{ color: ts.textDim }}>higher = more recovered</span>
              </div>
              <HRVLine days={status?.data?.hrv?.slice(-7) ?? []} />
            </div>
          )}
          {hr && (hr.restingRate || hr.avgRate) && (
            <div className="px-3 py-2 rounded-xl" style={{ background: 'rgba(255,138,138,0.06)', border: '1px solid rgba(255,138,138,0.15)' }}>
              <p className="text-[9px] uppercase tracking-widest mb-1" style={{ color: '#FF8A8A' }}>Heart rate</p>
              {hr.restingRate && (
                <p className="text-xs" style={{ color: ts.textSecondary }}>
                  Resting: <strong>{hr.restingRate} bpm</strong>
                  <span style={{ color: ts.textDim, marginLeft: 6, fontSize: 9 }}>
                    {hr.restingRate < 60 ? 'Excellent' : hr.restingRate < 70 ? 'Good' : hr.restingRate < 80 ? 'Average' : 'High'}
                  </span>
                </p>
              )}
              {hr.avgRate && !hr.restingRate && (
                <p className="text-xs" style={{ color: ts.textSecondary }}>Daily avg: <strong>{hr.avgRate} bpm</strong></p>
              )}
              <p className="text-[8px] mt-1" style={{ color: ts.textDim }}>from {fmt(hr.date)}</p>
            </div>
          )}
        </>
      )}

      {status?.connected && sleep.length === 0 && (
        <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl"
          style={{ backgroundColor: `${meta.color}08`, border: `1px dashed ${meta.color}33` }}>
          <RefreshCw size={11} style={{ color: meta.color }} />
          <div>
            <p className="text-xs font-medium" style={{ color: ts.textSecondary }}>No data yet — tap ↻ to sync</p>
            <p className="text-[9px] mt-0.5" style={{ color: ts.textDim }}>
              Will pull last 7 days of {meta.dataTypes.join(', ').toLowerCase()} from {meta.label}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── AI health insight ────────────────────────────────────────────────────────
function HealthInsight({ integrations }: { integrations: IntegrationStatus[] }) {
  const ts = useThemeStyles();
  const allSleep = integrations.flatMap(i => i.data?.sleep ?? []);
  const allHRV   = integrations.flatMap(i => i.data?.hrv   ?? []).filter(d => d.rmssd);
  if (!allSleep.length && !allHRV.length) return null;

  const lastSleep = allSleep[allSleep.length - 1];
  const lastHRV   = allHRV[allHRV.length - 1];
  const avgHRV    = allHRV.length ? allHRV.reduce((s, d) => s + d.rmssd!, 0) / allHRV.length : null;

  let icon = '🧠'; let title = ''; let desc = ''; let technique = ''; let techniqueHref = '/breathing';

  if (lastSleep && lastSleep.duration < 360) {
    icon = '😴'; title = 'Poor sleep detected';
    desc = `You only got ${Math.floor(lastSleep.duration/60)}h${lastSleep.duration%60}m last night. Your nervous system needs recovery.`;
    technique = '4-7-8 Breathing'; techniqueHref = '/breathing/4-7-8';
  } else if (lastHRV && avgHRV && lastHRV.rmssd! < avgHRV * 0.8) {
    icon = '💙'; title = 'HRV below your baseline';
    desc = `Your HRV is ${Math.round(lastHRV.rmssd!)}ms — lower than your average of ${Math.round(avgHRV)}ms.`;
    technique = 'Coherent Breathing'; techniqueHref = '/breathing';
  } else if (lastSleep && lastSleep.score && lastSleep.score > 80) {
    icon = '⚡'; title = 'Great recovery — push today';
    desc = `Sleep score ${lastSleep.score}/100. Your body is well recovered — great day for an energising session.`;
    technique = 'Wim Hof Method'; techniqueHref = '/breathing/wim-hof';
  } else {
    icon = '🌊'; title = 'Daily baseline maintenance';
    desc = 'Consistent daily breathing practice keeps your HRV stable and stress resilience high.';
    technique = 'Box Breathing'; techniqueHref = '/breathing/box-breathing';
  }

  return (
    <div className="flex flex-col gap-3 p-5 rounded-2xl border"
      style={{ backgroundColor: ts.cardBg, borderColor: ts.borderHover, boxShadow: ts.btnShadow }}>
      <div className="flex items-center gap-2">
        <Zap size={12} style={{ color: ts.accent }} />
        <p className="text-[9px] uppercase tracking-widest" style={{ color: ts.textMuted }}>AI Coach · Health Insight</p>
      </div>
      <div className="flex items-start gap-3">
        <span className="text-2xl flex-shrink-0">{icon}</span>
        <div className="flex flex-col gap-1.5">
          <p className="text-sm font-medium" style={{ color: ts.textPrimary }}>{title}</p>
          <p className="text-xs leading-relaxed" style={{ color: ts.textMuted }}>{desc}</p>
          <Link to={techniqueHref}
            className="flex items-center gap-1.5 text-xs font-medium px-4 py-2 rounded-xl w-fit mt-1 transition-all hover:scale-105"
            style={{ background: ts.btnGradient }}>
            ✦ Try {technique} <ChevronRight size={11} />
          </Link>
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function ProfilePage() {
  const ts = useThemeStyles();
  const location = useLocation();
  const { user, updateUser } = useContext(AuthContext);

  // ── Tab ─────────────────────────────────────────────────────────────────────
  const [tab, setTab] = useState<'profile' | 'devices'>('profile');

  // ── Profile form ─────────────────────────────────────────────────────────────
  const [nickname, setNickname]    = useState('');
  const [avatarSrc, setAvatarSrc]  = useState<string | null>(null);
  const [body, setBody]            = useState({ heightCm: '', weightKg: '', age: '', gender: '', goal: '' });
  const [saving, setSaving]        = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    api.get('/auth/me')
      .then(({ data }) => {
        setNickname(data.nickname || '');
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
      })
      .catch(() => {})
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
    ? Number(bmi) < 18.5 ? 'Underweight' : Number(bmi) < 25 ? 'Normal' : Number(bmi) < 30 ? 'Overweight' : 'Obese'
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
      const { data } = await api.patch('/auth/me', payload);
      updateUser({ nickname: data.nickname, avatar: data.avatar });
      toast.success('Profile saved');
    } catch {
      toast.error('Failed to save');
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
      console.error('fetchStatus error:', err?.response?.status, err?.message);
    } finally { setLoadingInt(false); }
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const integ  = params.get('integration');
    const status = params.get('status');
    if (integ && status === 'connected')
      toast.success(`${integ === 'fitbit' ? 'Fitbit' : 'Google Fit'} connected! Tap Sync to load your data.`);
    if (integ && status === 'error')
      toast.error('Connection failed. Please try again.');
    fetchStatus();
  }, [location.search]);

  const BACKEND = import.meta.env.VITE_API_BASE?.replace('/api', '') ?? 'https://breathe-production-6cce.up.railway.app';
  const connect    = (provider: string) => {
    window.location.href = `${BACKEND}/api/integrations/${provider}/connect?token=${localStorage.getItem('token') ?? ''}`;
  };
  const disconnect = async (provider: string) => {
    try {
      await api.delete(`/integrations/${provider}`);
      setIntegrations(prev => prev.filter(i => i.provider !== provider));
      toast.success('Disconnected');
    } catch { toast.error('Failed to disconnect'); }
  };
  const sync = async () => {
    setSyncing(true);
    try { await api.post('/integrations/sync'); await fetchStatus(); toast.success('Synced successfully'); }
    catch { toast.error('Sync failed'); } finally { setSyncing(false); }
  };
  const getStatus = (provider: string) => integrations.find(i => i.provider === provider);

  // ── Derived display values ────────────────────────────────────────────────────
  const displayName  = nickname || user?.name || user?.email?.split('@')[0] || 'Your Profile';
  const currentGoal  = GOALS.find(g => g.value === body.goal);

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <div className="relative flex flex-col min-h-screen font-montserrat">
      <ThemeBackground />
      <div className="relative z-10 flex flex-col min-h-screen">
        <NavBar />

        <main className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 py-10 flex flex-col gap-6">

          {/* Page header */}
          <div>
            <p className="text-[10px] tracking-[0.3em] uppercase mb-1" style={{ color: ts.textMuted }}>
              Breathe · Profile
            </p>
            <h1 className="text-2xl sm:text-3xl font-light tracking-wide" style={{ color: ts.textPrimary }}>
              My Account
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
                className="relative w-16 h-16 rounded-full overflow-hidden group"
                title="Change photo"
              >
                {loadingProfile ? (
                  <div className="w-full h-full animate-pulse" style={{ background: ts.cardBgHover }} />
                ) : avatarSrc ? (
                  <img src={avatarSrc} alt="avatar" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-2xl font-semibold text-white"
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
              <p className="text-base font-semibold truncate" style={{ color: ts.textPrimary }}>
                {displayName}
              </p>
              <p className="text-xs mt-0.5 truncate" style={{ color: ts.textMuted }}>
                {user?.email}
              </p>
              {currentGoal && (
                <p className="text-[10px] mt-2 inline-flex items-center gap-1 px-2.5 py-1 rounded-full"
                  style={{ background: `${ts.accent}18`, color: ts.accentLight, border: `1px solid ${ts.accent}30` }}>
                  {currentGoal.icon} {currentGoal.label}
                </p>
              )}
            </div>

            {/* Body stats preview */}
            {(body.heightCm || body.weightKg || body.age) && (
              <div className="hidden sm:flex flex-col items-end gap-1 flex-shrink-0">
                {body.heightCm && (
                  <p className="text-xs tabular-nums" style={{ color: ts.textSecondary }}>
                    <span style={{ color: ts.textMuted }}>Height </span>{body.heightCm} cm
                  </p>
                )}
                {body.weightKg && (
                  <p className="text-xs tabular-nums" style={{ color: ts.textSecondary }}>
                    <span style={{ color: ts.textMuted }}>Weight </span>{body.weightKg} kg
                  </p>
                )}
                {body.age && (
                  <p className="text-xs tabular-nums" style={{ color: ts.textSecondary }}>
                    <span style={{ color: ts.textMuted }}>Age </span>{body.age}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Tab switcher */}
          <div className="flex rounded-xl overflow-hidden" style={{ border: `1px solid ${ts.border}` }}>
            {([
              { id: 'profile' as const, label: 'My Profile' },
              { id: 'devices' as const, label: 'Health Devices' },
            ]).map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className="flex-1 py-2.5 text-xs font-medium transition-all"
                style={{
                  background: tab === t.id ? ts.btnGradient : 'transparent',
                  color: tab === t.id ? '#fff' : ts.textMuted,
                }}>
                {t.label}
              </button>
            ))}
          </div>

          {/* ── My Profile tab ──────────────────────────────────────────────── */}
          {tab === 'profile' && (
            <div className="flex flex-col gap-4">

              {/* Display name */}
              <Section label="Display Name">
                <input
                  value={nickname}
                  onChange={e => setNickname(e.target.value.slice(0, 30))}
                  placeholder={user?.name || user?.email?.split('@')[0] || 'Your nickname'}
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                  style={{
                    background: ts.cardBgHover,
                    border: `1px solid ${ts.border}`,
                    color: ts.textPrimary,
                  }}
                />
                <p className="text-[10px]" style={{ color: ts.textDim }}>
                  Shown in community posts and leaderboards · max 30 chars
                </p>
              </Section>

              {/* Body data */}
              <Section label="Body Data">
                <div className="grid grid-cols-2 gap-3">
                  <NumberField label="Height" unit="cm" min={50} max={300}
                    value={body.heightCm} onChange={v => setBody(b => ({ ...b, heightCm: v }))} />
                  <NumberField label="Weight" unit="kg" min={20} max={500}
                    value={body.weightKg} onChange={v => setBody(b => ({ ...b, weightKg: v }))} />
                </div>

                {bmi && (
                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg"
                    style={{ background: `${bmiColor}12`, border: `1px solid ${bmiColor}33` }}>
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: bmiColor! }} />
                    <p className="text-xs" style={{ color: ts.textSecondary }}>
                      BMI <strong>{bmi}</strong>
                      <span className="ml-2" style={{ color: bmiColor! }}>{bmiLabel}</span>
                    </p>
                  </div>
                )}

                <NumberField label="Age" unit="years" min={1} max={120}
                  value={body.age} onChange={v => setBody(b => ({ ...b, age: v }))} />
              </Section>

              {/* Gender */}
              <Section label="Gender">
                <div className="flex flex-wrap gap-2">
                  {GENDERS.map(g => (
                    <PillButton key={g.value} ts={ts}
                      active={body.gender === g.value}
                      onClick={() => setBody(b => ({ ...b, gender: b.gender === g.value ? '' : g.value }))}>
                      {g.label}
                    </PillButton>
                  ))}
                </div>
              </Section>

              {/* Goal */}
              <Section label="My Goal">
                <div className="flex flex-wrap gap-2">
                  {GOALS.map(g => (
                    <PillButton key={g.value} ts={ts}
                      active={body.goal === g.value}
                      onClick={() => setBody(b => ({ ...b, goal: b.goal === g.value ? '' : g.value }))}>
                      {g.icon} {g.label}
                    </PillButton>
                  ))}
                </div>
              </Section>

              {/* How we use this */}
              <div className="px-4 py-3 rounded-xl"
                style={{ background: `${ts.accent}0D`, border: `1px solid ${ts.border}` }}>
                <p className="text-[10px] uppercase tracking-widest mb-1.5" style={{ color: ts.accentLight }}>
                  How we use this
                </p>
                <p className="text-xs leading-relaxed" style={{ color: ts.textMuted }}>
                  Your age, height and weight help calibrate optimal breathing rates and session lengths.
                  Your goal determines which techniques the AI coach recommends first — and shapes your daily insight cards.
                </p>
              </div>

              {/* Save */}
              <button onClick={saveProfile} disabled={saving}
                className="flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium text-white transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60"
                style={{ background: ts.btnGradient, boxShadow: ts.btnShadow }}>
                {saving ? <RefreshCw size={14} className="animate-spin" /> : <Save size={14} />}
                {saving ? 'Saving…' : 'Save changes'}
              </button>

              {/* Quick nav */}
              <div className="grid grid-cols-2 gap-3">
                <Link to="/sessions" className="flex items-center justify-between p-4 rounded-2xl transition-all"
                  style={{ backgroundColor: ts.cardBg, border: `1px solid ${ts.border}` }}>
                  <div>
                    <p className="text-xs font-medium" style={{ color: ts.textPrimary }}>My Sessions</p>
                    <p className="text-[10px]" style={{ color: ts.textMuted }}>Breathing history</p>
                  </div>
                  <ChevronRight size={14} style={{ color: ts.textDim }} />
                </Link>
                <Link to="/statistics" className="flex items-center justify-between p-4 rounded-2xl transition-all"
                  style={{ backgroundColor: ts.cardBg, border: `1px solid ${ts.border}` }}>
                  <div>
                    <p className="text-xs font-medium" style={{ color: ts.textPrimary }}>Progress</p>
                    <p className="text-[10px]" style={{ color: ts.textMuted }}>Charts & insights</p>
                  </div>
                  <ChevronRight size={14} style={{ color: ts.textDim }} />
                </Link>
              </div>
            </div>
          )}

          {/* ── Health Devices tab ────────────────────────────────────────────── */}
          {tab === 'devices' && (
            <div className="flex flex-col gap-6">
              <div className="flex items-start justify-between gap-4">
                <p className="text-xs" style={{ color: ts.textMuted }}>
                  Connect your wearable to get AI coaching based on your real sleep and HRV data.
                </p>
                <Link to="/data-consent"
                  className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl text-[10px]"
                  style={{ color: ts.accent, border: `1px solid ${ts.border}` }}>
                  Why we need data →
                </Link>
              </div>

              {integrations.length > 0 && <HealthInsight integrations={integrations} />}

              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] uppercase tracking-widest" style={{ color: ts.textMuted }}>
                    <Watch size={11} className="inline mr-1.5" /> Connected services
                  </p>
                  {integrations.length > 0 && (
                    <button onClick={sync} disabled={syncing}
                      className="flex items-center gap-1.5 text-[10px] disabled:opacity-40"
                      style={{ color: ts.accent }}>
                      <RefreshCw size={10} className={syncing ? 'animate-spin' : ''} />
                      Sync all
                    </button>
                  )}
                </div>

                {loadingInt ? (
                  <div className="flex flex-col gap-3">
                    {[0, 1].map(i => <div key={i} className="h-24 rounded-2xl animate-pulse" style={{ backgroundColor: ts.cardBg }} />)}
                  </div>
                ) : (
                  <>
                    <IntegrationCard
                      provider="fitbit"
                      status={getStatus('fitbit') as IntegrationStatus | undefined}
                      onConnect={() => connect('fitbit')}
                      onDisconnect={() => disconnect('fitbit')}
                      onSync={sync} syncing={syncing}
                    />
                    <IntegrationCard
                      provider="google_fit"
                      status={getStatus('google_fit') as IntegrationStatus | undefined}
                      onConnect={() => connect('google-fit')}
                      onDisconnect={() => disconnect('google_fit')}
                      onSync={sync} syncing={syncing}
                    />
                    <HeartRateMonitor variant="full" />
                    <AppleHealthImport onImported={() => fetchStatus()} />
                  </>
                )}
              </div>

              {/* How it works */}
              <div className="flex flex-col gap-3 p-5 rounded-2xl"
                style={{ backgroundColor: ts.cardBg, border: `1px solid ${ts.border}` }}>
                <p className="text-[10px] uppercase tracking-widest" style={{ color: ts.textMuted }}>How it works</p>
                {[
                  { icon: '🔗', text: 'Connect your Fitbit or Google Fit account with one click' },
                  { icon: '📊', text: 'We read your sleep stages, HRV, and resting heart rate' },
                  { icon: '🤖', text: 'AI coach analyzes your recovery and recommends the right technique' },
                  { icon: '🌊', text: 'Tap "Try X" to start a session perfectly calibrated to your body today' },
                ].map(({ icon, text }) => (
                  <div key={text} className="flex items-center gap-3">
                    <span className="text-base flex-shrink-0">{icon}</span>
                    <p className="text-xs leading-relaxed" style={{ color: ts.textMuted }}>{text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

        </main>
        <Footer />
      </div>
    </div>
  );
}
