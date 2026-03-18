// src/pages/ProfilePage.tsx
import React, { useCallback, useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import NavBar from '../components/NavBar';
import ThemeBackground from '../components/ThemeBackground';
import Footer from '../components/Footer';
import api from '../api';
import { toast } from 'sonner';
import { RefreshCw, Unlink, Moon, Heart, Activity, Zap, ChevronRight, Watch } from 'lucide-react';
import AppleHealthImport from '../components/AppleHealthImport';
import HeartRateMonitor from '../components/HeartRateMonitor';
import { useThemeStyles } from '../hooks/useThemeStyles';

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
  fitbit:     { label: 'Fitbit',      icon: '💚', color: '#4AE8A0', bg: 'rgba(74,232,160,0.08)' },
  google_fit: { label: 'Google Fit',  icon: '🔵', color: '#4A9EFF', bg: 'rgba(74,158,255,0.08)' },
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

// ─── Sleep bar chart (7 days) ─────────────────────────────────────────────────
function SleepBars({ days }: { days: SleepDay[] }) {
  const ts = useThemeStyles();
  const max = Math.max(...days.map(d => d.duration), 480);
  return (
    <div className="flex items-end gap-1 h-16">
      {days.slice(-7).map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-0.5" title={`${fmt(d.date)}: ${Math.floor(d.duration/60)}h ${d.duration%60}m`}>
          <div className="w-full rounded-t-sm transition-all"
            style={{
              height: `${(d.duration / max) * 100}%`,
              minHeight: 3,
              background: d.score && d.score > 70 ? ts.accent : d.score && d.score > 50 ? ts.accentLight : '#FF8A8A'
            }} />
          <span className="text-[7px]" style={{ color: ts.textDim }}>{fmt(d.date).split(' ')[1]}</span>
        </div>
      ))}
    </div>
  );
}

// ─── HRV trend ────────────────────────────────────────────────────────────────
function HRVLine({ days }: { days: HRVDay[] }) {
  const ts = useThemeStyles();
  const vals  = days.filter(d => d.rmssd).slice(-7);
  const max   = Math.max(...vals.map(d => d.rmssd!), 1);
  const min   = Math.min(...vals.map(d => d.rmssd!), 0);
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
      style={{
        backgroundColor: ts.cardBg,
        border: `1px solid ${ts.border}`,
      }}>
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
  const ts = useThemeStyles();
  const meta     = PROVIDER_META[provider];
  const sleep    = status?.data?.sleep?.slice(-7) ?? [];
  const hrv      = status?.data?.hrv?.slice(-7)   ?? [];
  const hr       = status?.data?.heartRate?.slice(-1)[0];
  const avgSleep = sleep.length
    ? Math.round(sleep.reduce((s, d) => s + d.duration, 0) / sleep.length)
    : null;
  const avgHRV   = hrv.filter(d => d.rmssd).length
    ? Math.round(hrv.filter(d => d.rmssd).reduce((s, d) => s + d.rmssd!, 0) / hrv.filter(d => d.rmssd).length)
    : null;

  return (
    <div className="flex flex-col gap-4 p-5 rounded-2xl border transition-all"
      style={{
        backgroundColor: ts.cardBg,
        borderColor: status?.connected ? `${meta.color}33` : ts.border,
        boxShadow: status?.connected ? `0 0 20px ${meta.bg}` : 'none',
      }}>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg"
            style={{ background: meta.bg, border: `1px solid ${meta.color}33` }}>
            {meta.icon}
          </div>
          <div>
            <p className="text-sm font-medium" style={{ color: ts.textPrimary }}>{meta.label}</p>
            <p className="text-[9px] mt-0.5" style={{ color: status?.connected ? meta.color : ts.textDim }}>
              {status?.connected
                ? `Connected${status.lastSyncAt ? ` · synced ${timeAgo(status.lastSyncAt)}` : ''}`
                : 'Not connected'}
            </p>
          </div>
        </div>

        {status?.connected ? (
          <div className="flex items-center gap-1.5">
            <button onClick={onSync} disabled={syncing}
              className="p-1.5 rounded-lg transition-colors disabled:opacity-40"
              style={{ color: ts.textMuted }}>
              <RefreshCw size={13} className={syncing ? 'animate-spin' : ''} />
            </button>
            <button onClick={onDisconnect}
              className="p-1.5 rounded-lg transition-colors"
              style={{ color: ts.textMuted }}>
              <Unlink size={13} />
            </button>
          </div>
        ) : (
          <button onClick={onConnect}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium transition-all hover:scale-105"
            style={{ background: ts.btnGradient }}>
            Connect <ChevronRight size={11} />
          </button>
        )}
      </div>

      {/* Data — only when connected and synced */}
      {status?.connected && sleep.length > 0 && (
        <>
          {/* Summary pills */}
          <div className="grid grid-cols-3 gap-2">
            {avgSleep && (
              <StatPill icon={<Moon size={12} />} label="Avg sleep"
                value={`${Math.floor(avgSleep/60)}h${avgSleep%60}m`} color="#7AC4FF" />
            )}
            {avgHRV && (
              <StatPill icon={<Activity size={12} />} label="Avg HRV"
                value={`${avgHRV}ms`} color="#4A9EFF" />
            )}
            {hr?.restingRate && (
              <StatPill icon={<Heart size={12} />} label="Resting HR"
                value={`${hr.restingRate} bpm`} color="#FF8A8A" />
            )}
          </div>

          {/* Sleep chart */}
          {sleep.length > 0 && (
            <div className="flex flex-col gap-1.5">
              <p className="text-[9px] uppercase tracking-widest" style={{ color: ts.textMuted }}>
                Sleep · last 7 days
              </p>
              <SleepBars days={sleep} />
            </div>
          )}

          {/* HRV line */}
          {hrv.filter(d => d.rmssd).length > 2 && (
            <div className="flex flex-col gap-1.5">
              <p className="text-[9px] uppercase tracking-widest" style={{ color: ts.textMuted }}>
                HRV trend
              </p>
              <HRVLine days={hrv} />
            </div>
          )}
        </>
      )}

      {/* Connected but not yet synced */}
      {status?.connected && sleep.length === 0 && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl"
          style={{
            backgroundColor: `${ts.cardBg}40`,
            border: `1px solid ${ts.border}`,
          }}>
          <RefreshCw size={11} style={{ color: ts.textMuted }} />
          <p className="text-xs" style={{ color: ts.textMuted }}>
            Tap sync to load your health data
          </p>
        </div>
      )}
    </div>
  );
}

// ─── AI Coach insight based on health data ───────────────────────────────────
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
    technique = '4-7-8 Breathing';
    techniqueHref = '/breathing/4-7-8';
  } else if (lastHRV && avgHRV && lastHRV.rmssd! < avgHRV * 0.8) {
    icon = '💙'; title = 'HRV below your baseline';
    desc = `Your HRV is ${Math.round(lastHRV.rmssd!)}ms — lower than your average of ${Math.round(avgHRV)}ms. Your body is under stress.`;
    technique = 'Coherent Breathing';
    techniqueHref = '/breathing';
  } else if (lastSleep && lastSleep.score && lastSleep.score > 80) {
    icon = '⚡'; title = 'Great recovery — push today';
    desc = `Sleep score ${lastSleep.score}/100. Your body is well recovered — great day for an energising session.`;
    technique = 'Wim Hof Method';
    techniqueHref = '/breathing/wim-hof';
  } else {
    icon = '🌊'; title = 'Daily baseline maintenance';
    desc = 'Consistent daily breathing practice keeps your HRV stable and stress resilience high.';
    technique = 'Box Breathing';
    techniqueHref = '/breathing/box-breathing';
  }

  return (
    <div className="flex flex-col gap-3 p-5 rounded-2xl border"
      style={{
        backgroundColor: ts.cardBg,
        borderColor: ts.borderHover,
        boxShadow: ts.btnShadow,
      }}>
      <div className="flex items-center gap-2">
        <Zap size={12} style={{ color: ts.accent }} />
        <p className="text-[9px] uppercase tracking-widest" style={{ color: ts.textMuted }}>
          AI Coach · Health Insight
        </p>
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
  const [integrations, setIntegrations] = useState<IntegrationStatus[]>([]);
  const [syncing, setSyncing] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchStatus = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/integrations/status');
      console.log('Integration status:', data);
      setIntegrations(data);
    } catch (err: any) {
      console.error('fetchStatus error:', err?.response?.status, err?.message);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const integ  = params.get('integration');
    const status = params.get('status');

    if (integ && status === 'connected') {
      toast.success(`${integ === 'fitbit' ? 'Fitbit' : 'Google Fit'} connected! Tap Sync to load your data.`);
    }
    if (integ && status === 'error') {
      toast.error('Connection failed. Please try again.');
    }

    fetchStatus();
  }, [location.search]);

  const BACKEND = import.meta.env.VITE_API_BASE?.replace('/api', '') ?? 'https://breathe-production-6cce.up.railway.app';
  const connect = (provider: string) => {
    const token = localStorage.getItem('token') ?? '';
    window.location.href = `${BACKEND}/api/integrations/${provider}/connect?token=${token}`;
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
    try {
      await api.post('/integrations/sync');
      await fetchStatus();
      toast.success('Synced successfully');
    } catch { toast.error('Sync failed'); } finally { setSyncing(false); }
  };

  const getStatus = (provider: string) => integrations.find(i => i.provider === provider);

  return (
    <div className="relative flex flex-col min-h-screen font-montserrat">
      <ThemeBackground />

      <div className="relative z-10 flex flex-col min-h-screen">
        <NavBar />

        <main className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 py-10 flex flex-col gap-6">

          {/* Header */}
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[10px] tracking-[0.3em] uppercase mb-1" style={{ color: ts.textMuted }}>
                Breathe · Profile
              </p>
              <h1 className="text-2xl sm:text-3xl font-light tracking-wide" style={{ color: ts.textPrimary }}>
                Health Integrations
              </h1>
              <p className="text-xs mt-1" style={{ color: ts.textMuted }}>
                Connect your wearable to get AI coaching based on your real sleep and HRV data.
              </p>
            </div>
            <Link to="/data-consent"
              className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl text-[10px] transition-all"
              style={{
                color: ts.accent,
                border: `1px solid ${ts.border}`,
              }}>
              Why we need data →
            </Link>
          </div>

          {/* AI insight */}
          {integrations.length > 0 && <HealthInsight integrations={integrations} />}

          {/* Integration cards */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <p className="text-[10px] uppercase tracking-widest" style={{ color: ts.textMuted }}>
                <Watch size={11} className="inline mr-1.5" /> Connected services
              </p>
              {integrations.length > 0 && (
                <button onClick={sync} disabled={syncing}
                  className="flex items-center gap-1.5 text-[10px] transition-all disabled:opacity-40"
                  style={{ color: ts.accent }}>
                  <RefreshCw size={10} className={syncing ? 'animate-spin' : ''} />
                  Sync all
                </button>
              )}
            </div>

            {loading ? (
              <div className="flex flex-col gap-3">
                {[0,1].map(i => <div key={i} className="h-24 rounded-2xl animate-pulse" style={{ backgroundColor: ts.cardBg }} />)}
              </div>
            ) : (
              <>
                <IntegrationCard
                  provider="fitbit"
                  status={getStatus('fitbit') as IntegrationStatus | undefined}
                  onConnect={() => connect('fitbit')}
                  onDisconnect={() => disconnect('fitbit')}
                  onSync={sync}
                  syncing={syncing}
                />
                <IntegrationCard
                  provider="google_fit"
                  status={getStatus('google_fit') as IntegrationStatus | undefined}
                  onConnect={() => connect('google-fit')}
                  onDisconnect={() => disconnect('google_fit')}
                  onSync={sync}
                  syncing={syncing}
                />
                <HeartRateMonitor variant="full" />
                <AppleHealthImport onImported={() => fetchStatus()} />
              </>
            )}
          </div>

          {/* How it works */}
          <div className="flex flex-col gap-3 p-5 rounded-2xl"
            style={{
              backgroundColor: ts.cardBg,
              border: `1px solid ${ts.border}`,
            }}>
            <p className="text-[10px] uppercase tracking-widest" style={{ color: ts.textMuted }}>
              How it works
            </p>
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

          {/* Nav to sessions + stats */}
          <div className="grid grid-cols-2 gap-3">
            <Link to="/sessions" className="flex items-center justify-between p-4 rounded-2xl transition-all group"
              style={{
                backgroundColor: ts.cardBg,
                border: `1px solid ${ts.border}`,
              }}>
              <div>
                <p className="text-xs font-medium" style={{ color: ts.textPrimary }}>My Sessions</p>
                <p className="text-[10px]" style={{ color: ts.textMuted }}>Breathing history</p>
              </div>
              <ChevronRight size={14} className="transition-colors" style={{ color: ts.textDim }} />
            </Link>
            <Link to="/statistics" className="flex items-center justify-between p-4 rounded-2xl transition-all group"
              style={{
                backgroundColor: ts.cardBg,
                border: `1px solid ${ts.border}`,
              }}>
              <div>
                <p className="text-xs font-medium" style={{ color: ts.textPrimary }}>Progress</p>
                <p className="text-[10px]" style={{ color: ts.textMuted }}>Charts & insights</p>
              </div>
              <ChevronRight size={14} className="transition-colors" style={{ color: ts.textDim }} />
            </Link>
          </div>

        </main>
        <Footer />
      </div>
    </div>
  );
}