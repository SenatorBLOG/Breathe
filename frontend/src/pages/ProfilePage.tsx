// src/pages/ProfilePage.tsx
import React, { useCallback, useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import api from '../api';
import { toast } from 'sonner';
import { RefreshCw, Unlink, Moon, Heart, Activity, Zap, ChevronRight, Watch } from 'lucide-react';
import AppleHealthImport from '../components/AppleHealthImport';

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
  const max = Math.max(...days.map(d => d.duration), 480);
  return (
    <div className="flex items-end gap-1 h-16">
      {days.slice(-7).map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-0.5" title={`${fmt(d.date)}: ${Math.floor(d.duration/60)}h ${d.duration%60}m`}>
          <div className="w-full rounded-t-sm transition-all"
            style={{ height: `${(d.duration / max) * 100}%`, minHeight: 3,
              background: d.score && d.score > 70 ? '#4AE8A0' : d.score && d.score > 50 ? '#4A9EFF' : '#FF8A8A' }} />
          <span className="text-[7px] text-[#3D6080]">{fmt(d.date).split(' ')[1]}</span>
        </div>
      ))}
    </div>
  );
}

// ─── HRV trend ────────────────────────────────────────────────────────────────
function HRVLine({ days }: { days: HRVDay[] }) {
  const vals  = days.filter(d => d.rmssd).slice(-7);
  const max   = Math.max(...vals.map(d => d.rmssd!), 1);
  const min   = Math.min(...vals.map(d => d.rmssd!), 0);
  const range = max - min || 1;
  const w = 100 / Math.max(vals.length - 1, 1);
  const points = vals.map((d, i) => `${i * w},${100 - ((d.rmssd! - min) / range) * 85}`).join(' ');
  return (
    <div>
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-10">
        <polyline points={points} fill="none" stroke="#4A9EFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        {vals.map((d, i) => (
          <circle key={i} cx={i * w} cy={100 - ((d.rmssd! - min) / range) * 85}
            r="2.5" fill="#4A9EFF" opacity="0.8" />
        ))}
      </svg>
      <div className="flex justify-between text-[7px] text-[#3D6080] mt-0.5">
        {vals.map((d, i) => <span key={i}>{fmt(d.date).split(' ')[1]}</span>)}
      </div>
    </div>
  );
}

// ─── Stat pill ────────────────────────────────────────────────────────────────
function StatPill({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string; color: string }) {
  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#0B1628]/60 border border-[#1E3358]/40">
      <span style={{ color }}>{icon}</span>
      <div>
        <p className="text-[#7AC4FF] text-sm font-medium tabular-nums leading-none">{value}</p>
        <p className="text-[#4A7AAA] text-[9px] uppercase tracking-wide">{label}</p>
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
  // provider comes from props, not status
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
      style={{ background: 'linear-gradient(145deg,rgba(11,22,40,0.85),rgba(6,12,26,0.9))',
        border: status?.connected ? `1px solid ${meta.color}33` : '1px solid rgba(30,51,88,0.5)',
        boxShadow: status?.connected ? `0 0 20px ${meta.bg}` : 'none' }}>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg"
            style={{ background: meta.bg, border: `1px solid ${meta.color}33` }}>
            {meta.icon}
          </div>
          <div>
            <p className="text-[#B8D9FF] text-sm font-medium">{meta.label}</p>
            <p className="text-[9px] mt-0.5" style={{ color: status?.connected ? meta.color : '#3D6080' }}>
              {status?.connected
                ? `Connected${status.lastSyncAt ? ` · synced ${timeAgo(status.lastSyncAt)}` : ''}`
                : 'Not connected'}
            </p>
          </div>
        </div>

        {status?.connected ? (
          <div className="flex items-center gap-1.5">
            <button onClick={onSync} disabled={syncing}
              className="p-1.5 rounded-lg text-[#4A7AAA] hover:text-[#4A9EFF] transition-colors disabled:opacity-40">
              <RefreshCw size={13} className={syncing ? 'animate-spin' : ''} />
            </button>
            <button onClick={onDisconnect}
              className="p-1.5 rounded-lg text-[#4A7AAA] hover:text-[#FF8A8A] transition-colors">
              <Unlink size={13} />
            </button>
          </div>
        ) : (
          <button onClick={onConnect}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs text-white font-medium transition-all hover:scale-105"
            style={{ background: `linear-gradient(135deg,${meta.color}66,${meta.color})` }}>
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
              <p className="text-[9px] uppercase tracking-widest text-[#4A7AAA]">Sleep · last 7 days</p>
              <SleepBars days={sleep} />
            </div>
          )}

          {/* HRV line */}
          {hrv.filter(d => d.rmssd).length > 2 && (
            <div className="flex flex-col gap-1.5">
              <p className="text-[9px] uppercase tracking-widest text-[#4A7AAA]">HRV trend</p>
              <HRVLine days={hrv} />
            </div>
          )}
        </>
      )}

      {/* Connected but not yet synced */}
      {status?.connected && sleep.length === 0 && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#060C1A]/40 border border-[#1E3358]/30">
          <RefreshCw size={11} className="text-[#4A7AAA]" />
          <p className="text-[#4A7AAA] text-xs">Tap sync to load your health data</p>
        </div>
      )}
    </div>
  );
}

// ─── AI Coach insight based on health data ───────────────────────────────────
function HealthInsight({ integrations }: { integrations: IntegrationStatus[] }) {
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
    <div className="flex flex-col gap-3 p-5 rounded-2xl border border-[#2A5499]/30 bg-[#0D1B33]/70"
      style={{ boxShadow: '0 0 30px rgba(74,158,255,0.06)' }}>
      <div className="flex items-center gap-2">
        <Zap size={12} className="text-[#4A9EFF]" />
        <p className="text-[9px] uppercase tracking-widest text-[#4A7AAA]">AI Coach · Health Insight</p>
      </div>
      <div className="flex items-start gap-3">
        <span className="text-2xl flex-shrink-0">{icon}</span>
        <div className="flex flex-col gap-1.5">
          <p className="text-[#B8D9FF] text-sm font-medium">{title}</p>
          <p className="text-[#4A7AAA] text-xs leading-relaxed">{desc}</p>
          <Link to={techniqueHref}
            className="flex items-center gap-1.5 text-xs text-white font-medium px-4 py-2 rounded-xl w-fit mt-1 transition-all hover:scale-105"
            style={{ background: 'linear-gradient(135deg,#1A5FCC,#3A82F7)' }}>
            ✦ Try {technique} <ChevronRight size={11} />
          </Link>
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function ProfilePage() {
  const location = useLocation();
  const [integrations, setIntegrations] = useState<IntegrationStatus[]>([]);
  const [syncing, setSyncing]           = useState(false);
  const [loading, setLoading]           = useState(true);

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

  // On mount + after OAuth redirect — always refetch
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

    // Always fetch status (catches both fresh load and OAuth return)
    fetchStatus();
  }, [location.search]);

  const BACKEND = import.meta.env.VITE_API_BASE?.replace('/api', '') ?? 'https://breathe-production-6cce.up.railway.app';
  const connect = (provider: string) => {
    const token = localStorage.getItem('token') ?? '';
    // Pass token as query param — backend will use it to identify user
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
    <div className="relative flex flex-col min-h-screen bg-[#010814] font-montserrat">
      <div className="fixed inset-0 bg-cover bg-center" style={{ backgroundImage: `url('/Background_img_Meditation.jpg')`, opacity: 0.35 }} />
      <div className="fixed inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at top, rgba(1,8,20,0.2) 0%, rgba(1,8,20,0.94) 68%)' }} />

      <div className="relative z-10 flex flex-col min-h-screen">
        <NavBar />

        <main className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 py-10 flex flex-col gap-6">

          {/* Header */}
          <div>
            <p className="text-[10px] tracking-[0.3em] uppercase text-[#4A7AAA] mb-1">Breathe · Profile</p>
            <h1 className="text-2xl sm:text-3xl font-light text-[#B8D9FF] tracking-wide">Health Integrations</h1>
            <p className="text-[#4A7AAA] text-xs mt-1">Connect your wearable to get AI coaching based on your real sleep and HRV data.</p>
          </div>

          {/* AI insight */}
          {integrations.length > 0 && <HealthInsight integrations={integrations} />}

          {/* Integration cards */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <p className="text-[10px] uppercase tracking-widest text-[#4A7AAA]">
                <Watch size={11} className="inline mr-1.5" />Connected services
              </p>
              {integrations.length > 0 && (
                <button onClick={sync} disabled={syncing}
                  className="flex items-center gap-1.5 text-[10px] text-[#4A9EFF] hover:underline disabled:opacity-40">
                  <RefreshCw size={10} className={syncing ? 'animate-spin' : ''} />
                  Sync all
                </button>
              )}
            </div>

            {loading ? (
              <div className="flex flex-col gap-3">
                {[0,1].map(i => <div key={i} className="h-24 rounded-2xl animate-pulse bg-[#0A1525]" />)}
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
                <AppleHealthImport onImported={() => fetchStatus()} />
              </>
            )}
          </div>

          {/* How it works */}
          <div className="flex flex-col gap-3 p-5 rounded-2xl bg-[#0B1628]/60 border border-[#1E3358]/40">
            <p className="text-[10px] uppercase tracking-widest text-[#4A7AAA]">How it works</p>
            {[
              { icon: '🔗', text: 'Connect your Fitbit or Google Fit account with one click' },
              { icon: '📊', text: 'We read your sleep stages, HRV, and resting heart rate' },
              { icon: '🤖', text: 'AI coach analyzes your recovery and recommends the right technique' },
              { icon: '🌊', text: 'Tap "Try X" to start a session perfectly calibrated to your body today' },
            ].map(({ icon, text }) => (
              <div key={text} className="flex items-center gap-3">
                <span className="text-base flex-shrink-0">{icon}</span>
                <p className="text-[#4A7AAA] text-xs leading-relaxed">{text}</p>
              </div>
            ))}
          </div>

          {/* Nav to sessions + stats */}
          <div className="grid grid-cols-2 gap-3">
            <Link to="/sessions" className="flex items-center justify-between p-4 rounded-2xl bg-[#0B1628]/60 border border-[#1E3358]/40 hover:border-[#2A5499]/50 transition-all group">
              <div>
                <p className="text-[#B8D9FF] text-xs font-medium">My Sessions</p>
                <p className="text-[#4A7AAA] text-[10px]">Breathing history</p>
              </div>
              <ChevronRight size={14} className="text-[#3D6080] group-hover:text-[#4A9EFF] transition-colors" />
            </Link>
            <Link to="/statistics" className="flex items-center justify-between p-4 rounded-2xl bg-[#0B1628]/60 border border-[#1E3358]/40 hover:border-[#2A5499]/50 transition-all group">
              <div>
                <p className="text-[#B8D9FF] text-xs font-medium">Progress</p>
                <p className="text-[#4A7AAA] text-[10px]">Charts & insights</p>
              </div>
              <ChevronRight size={14} className="text-[#3D6080] group-hover:text-[#4A9EFF] transition-colors" />
            </Link>
          </div>

        </main>
        <Footer />
      </div>
    </div>
  );
}