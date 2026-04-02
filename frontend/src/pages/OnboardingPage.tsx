// src/pages/OnboardingPage.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useThemeStyles } from '../hooks/useThemeStyles';
import ThemeBackground from '../components/ThemeBackground';
import { requestPushPermission } from '../utils/pushNotifications';

// ─── Types ────────────────────────────────────────────────────────────────────
type Goal = 'sleep' | 'anxiety' | 'focus' | 'energy';
type GuidanceMode = 'visual' | 'sound' | 'vibration' | 'voice';

// ─── Presets ──────────────────────────────────────────────────────────────────
const PRESETS: Record<Goal, { inhale: number; hold: number; exhale: number; pause: number }> = {
  sleep:   { inhale: 4, hold: 7, exhale: 8, pause: 1 },
  anxiety: { inhale: 4, hold: 4, exhale: 4, pause: 4 },
  focus:   { inhale: 5, hold: 0, exhale: 5, pause: 1 },
  energy:  { inhale: 2, hold: 1, exhale: 2, pause: 1 },
};

const BACKEND = import.meta.env.VITE_API_BASE?.replace('/api', '')
  ?? 'https://breathe-production-6cce.up.railway.app';

// ─── Toggle ───────────────────────────────────────────────────────────────────
function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  const ts = useThemeStyles();
  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
      className="relative w-11 h-6 rounded-full transition-all duration-200 flex-shrink-0"
      style={{ background: value ? ts.accent : ts.border }}
    >
      <div
        className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-all duration-200"
        style={{ left: value ? 22 : 2 }}
      />
    </button>
  );
}

// ─── Section header ───────────────────────────────────────────────────────────
function SectionTitle({ title, sub }: { title: string; sub?: string }) {
  const ts = useThemeStyles();
  return (
    <div className="flex flex-col gap-0.5 text-center">
      <p className="t-label" style={{ color: ts.textMuted }}>{title}</p>
      {sub && <p className="t-caption" style={{ color: ts.textDim }}>{sub}</p>}
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function OnboardingPage() {
  const { t } = useTranslation();
  const ts = useThemeStyles();
  const navigate = useNavigate();

  const [goal, setGoal] = useState<Goal | null>(null);
  const [guidanceModes, setGuidanceModes] = useState<GuidanceMode[]>(['visual']);
  const [notifEnabled, setNotifEnabled] = useState(false);
  const [wearableSkipped, setWearableSkipped] = useState(false);

  // Browser capability checks
  const canVibrate = 'vibrate' in navigator;
  const canSound   = 'AudioContext' in window || 'webkitAudioContext' in (window as any);
  const canVoice   = 'speechSynthesis' in window;

  useEffect(() => {
    if (localStorage.getItem('breathe_onboarded') === 'true') {
      navigate('/breathing', { replace: true });
    }
  }, [navigate]);

  useEffect(() => {
    if (notifEnabled) requestPushPermission();
  }, [notifEnabled]);

  const toggleMode = (mode: GuidanceMode) => {
    if (mode === 'visual' && guidanceModes.length === 1) return;
    setGuidanceModes(prev =>
      prev.includes(mode) ? prev.filter(m => m !== mode) : [...prev, mode]
    );
  };

  const connectWearable = (provider: string) => {
    localStorage.setItem('breathe_onboarded', 'true');
    if (goal) localStorage.setItem('breathe_goal', goal);
    localStorage.setItem('breathe_guidance_modes', JSON.stringify(guidanceModes));
    const token = localStorage.getItem('token') ?? '';
    window.location.href = `${BACKEND}/api/integrations/${provider}/connect?token=${token}`;
  };

  const handleStart = () => {
    localStorage.setItem('breathe_onboarded', 'true');
    if (goal) localStorage.setItem('breathe_goal', goal);
    localStorage.setItem('breathe_guidance_modes', JSON.stringify(guidanceModes));
    navigate('/breathing', {
      state: {
        coachPreset:     goal ? PRESETS[goal] : undefined,
        coachPresetName: goal ?? undefined,
      },
    });
  };

  const skip = () => {
    localStorage.setItem('breathe_onboarded', 'true');
    navigate('/breathing');
  };

  // ─── Data ──────────────────────────────────────────────────────────────────
  const GOALS: { key: Goal; emoji: string; label: string; sub: string }[] = [
    { key: 'sleep',   emoji: '😴', label: t('onboarding.goals.sleep'),   sub: t('onboarding.goals.sleepDesc')   },
    { key: 'anxiety', emoji: '😰', label: t('onboarding.goals.anxiety'), sub: t('onboarding.goals.anxietyDesc') },
    { key: 'focus',   emoji: '🎯', label: t('onboarding.goals.focus'),   sub: t('onboarding.goals.focusDesc')   },
    { key: 'energy',  emoji: '⚡', label: t('onboarding.goals.energy'),  sub: t('onboarding.goals.energyDesc')  },
  ];

  const MODES: { key: GuidanceMode; emoji: string; label: string; desc: string; available: boolean }[] = [
    { key: 'visual',    emoji: '👁',  label: t('onboarding.guidanceModes.visual'),    desc: t('onboarding.guidanceModes.visualDesc'),    available: true       },
    { key: 'sound',     emoji: '🔔', label: t('onboarding.guidanceModes.sound'),     desc: t('onboarding.guidanceModes.soundDesc'),     available: canSound   },
    { key: 'vibration', emoji: '📳', label: t('onboarding.guidanceModes.vibration'), desc: t('onboarding.guidanceModes.vibrationDesc'), available: canVibrate },
    { key: 'voice',     emoji: '🎙', label: t('onboarding.guidanceModes.voice'),     desc: t('onboarding.guidanceModes.voiceDesc'),     available: canVoice   },
  ];

  return (
    <div className="relative min-h-screen font-montserrat overflow-x-hidden">
      <style>{`
        @keyframes breathePulse {
          0%, 100% { transform: scale(1); }
          50%       { transform: scale(1.1); }
        }
        @keyframes onboardIn {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .ob-in { animation: onboardIn 0.5s ease forwards; }
        .ob-d1 { animation-delay: 0.05s; opacity: 0; }
        .ob-d2 { animation-delay: 0.15s; opacity: 0; }
        .ob-d3 { animation-delay: 0.25s; opacity: 0; }
        .ob-d4 { animation-delay: 0.35s; opacity: 0; }
        .ob-d5 { animation-delay: 0.45s; opacity: 0; }
        .ob-d6 { animation-delay: 0.55s; opacity: 0; }
      `}</style>

      <ThemeBackground />

      <div className="relative z-10 flex flex-col items-center min-h-screen px-4 sm:px-6 py-12">
        <div className="w-full max-w-md flex flex-col gap-10">

          {/* ── Hero ──────────────────────────────────────────────────────── */}
          <section className="ob-in ob-d1 flex flex-col items-center gap-5 text-center">
            <div
              style={{
                width: 64, height: 64, borderRadius: '50%',
                background: `radial-gradient(circle at 35% 35%, ${ts.accentLight}, ${ts.accent} 70%)`,
                boxShadow: `0 0 30px ${ts.accent}55`,
                animation: 'breathePulse 4s ease-in-out infinite',
              }}
            />
            <div className="flex flex-col gap-2">
              <h1 className="text-2xl font-light tracking-wide" style={{ color: ts.textPrimary }}>
                {t('onboarding.welcome')}
              </h1>
              <p className="t-body leading-relaxed" style={{ color: ts.textSecondary }}>
                {t('onboarding.desc1')}
              </p>
              <p className="t-body leading-relaxed" style={{ color: ts.textMuted }}>
                {t('onboarding.desc2')}
              </p>
              <p className="t-caption mt-1" style={{ color: ts.textDim }}>
                {t('onboarding.desc3')}
              </p>
            </div>
          </section>

          {/* ── Goal picker ───────────────────────────────────────────────── */}
          <section className="ob-in ob-d2 flex flex-col gap-4">
            <SectionTitle title={t('onboarding.goalTitle')} />
            <div className="grid grid-cols-2 gap-3">
              {GOALS.map(g => {
                const active = goal === g.key;
                return (
                  <button
                    key={g.key}
                    onClick={() => setGoal(g.key)}
                    className="flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all duration-200 text-center"
                    style={{
                      backgroundColor: active ? ts.cardBgHover : ts.cardBg,
                      borderColor:     active ? ts.borderHover : ts.border,
                      boxShadow:       active ? `0 0 16px ${ts.accent}20` : 'none',
                    }}
                  >
                    <span className="text-2xl">{g.emoji}</span>
                    <span className="t-body font-medium leading-snug" style={{ color: active ? ts.textPrimary : ts.textSecondary }}>
                      {g.label}
                    </span>
                    <span className="t-caption" style={{ color: ts.textDim }}>{g.sub}</span>
                  </button>
                );
              })}
            </div>
          </section>

          {/* ── Guidance mode picker ──────────────────────────────────────── */}
          <section className="ob-in ob-d3 flex flex-col gap-4">
            <SectionTitle title={t('onboarding.guidanceTitle')} sub={t('onboarding.guidanceSub')} />
            <div className="grid grid-cols-2 gap-3">
              {MODES.map(m => {
                const active = guidanceModes.includes(m.key);
                return (
                  <button
                    key={m.key}
                    onClick={() => m.available && toggleMode(m.key)}
                    className="flex flex-col items-center gap-1.5 p-3 rounded-2xl border transition-all duration-200 text-center"
                    style={{
                      backgroundColor: active ? ts.cardBgHover : ts.cardBg,
                      borderColor:     active ? ts.borderHover : ts.border,
                      boxShadow:       active ? `0 0 12px ${ts.accent}18` : 'none',
                      opacity:         m.available ? 1 : 0.4,
                      cursor:          m.available ? 'pointer' : 'not-allowed',
                    }}
                  >
                    <span className="t-heading">{m.emoji}</span>
                    <span className="t-caption font-medium" style={{ color: active ? ts.textPrimary : ts.textSecondary }}>
                      {m.label}
                    </span>
                    <span className="t-caption" style={{ color: ts.textDim }}>
                      {m.available ? m.desc : t('onboarding.guidanceUnavailable')}
                    </span>
                  </button>
                );
              })}
            </div>
            {guidanceModes.some(m => m !== 'visual') && (
              <p className="t-caption text-center" style={{ color: ts.textDim }}>
                💡 {t('onboarding.guidanceHint')}
              </p>
            )}
          </section>

          {/* ── Wearable ──────────────────────────────────────────────────── */}
          {!wearableSkipped && (
            <section className="ob-in ob-d4 flex flex-col gap-4">
              <SectionTitle title={t('onboarding.wearableTitle')} sub={t('onboarding.wearableSub')} />
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => connectWearable('fitbit')}
                  className="flex items-center gap-3 px-4 py-3.5 rounded-2xl border transition-all duration-200 hover:opacity-90 text-left"
                  style={{ backgroundColor: ts.cardBg, borderColor: ts.border }}
                >
                  <span className="t-heading flex-shrink-0">💚</span>
                  <div className="flex flex-col">
                    <span className="t-body font-medium" style={{ color: ts.textSecondary }}>
                      {t('onboarding.connectFitbit')}
                    </span>
                    <span className="t-caption" style={{ color: ts.textDim }}>Sleep · HRV · Heart Rate</span>
                  </div>
                </button>

                <button
                  onClick={() => connectWearable('google-fit')}
                  className="flex items-center gap-3 px-4 py-3.5 rounded-2xl border transition-all duration-200 hover:opacity-90 text-left"
                  style={{ backgroundColor: ts.cardBg, borderColor: ts.border }}
                >
                  <span className="t-heading flex-shrink-0">🔵</span>
                  <div className="flex flex-col">
                    <span className="t-body font-medium" style={{ color: ts.textSecondary }}>
                      {t('onboarding.connectGoogleFit')}
                    </span>
                    <span className="t-caption" style={{ color: ts.textDim }}>Works with Amazfit · Mi Band · Wear OS</span>
                  </div>
                </button>

                <button
                  onClick={() => setWearableSkipped(true)}
                  className="t-body text-center py-2 transition-colors hover:opacity-80"
                  style={{ color: ts.textDim }}
                >
                  {t('onboarding.wearableLater')}
                </button>
              </div>
            </section>
          )}

          {/* ── Notifications ─────────────────────────────────────────────── */}
          <section className="ob-in ob-d5 flex flex-col gap-3">
            <SectionTitle title={t('onboarding.notifTitle')} />
            <div
              className="flex items-center justify-between px-4 py-3.5 rounded-2xl border"
              style={{ backgroundColor: ts.cardBg, borderColor: ts.border }}
            >
              <div className="flex flex-col gap-0.5">
                <span className="t-body" style={{ color: ts.textSecondary }}>
                  {t('onboarding.notifToggle')}
                </span>
                <span className="t-caption" style={{ color: ts.textDim }}>
                  {t('onboarding.notifDesc')}
                </span>
              </div>
              <Toggle value={notifEnabled} onChange={setNotifEnabled} />
            </div>
          </section>

          {/* ── CTA ───────────────────────────────────────────────────────── */}
          <section className="ob-in ob-d6 flex flex-col items-center gap-3 pb-8">
            <button
              onClick={handleStart}
              disabled={!goal}
              className="w-full py-4 rounded-2xl text-white font-medium t-body tracking-wide transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
              style={{
                background:  ts.btnGradient,
                boxShadow:   goal ? ts.btnShadow : 'none',
              }}
            >
              {t('onboarding.start')}
            </button>
            <button
              onClick={skip}
              className="t-body transition-colors hover:opacity-80"
              style={{ color: ts.textDim }}
            >
              {t('onboarding.skipAll')}
            </button>
          </section>

        </div>
      </div>
    </div>
  );
}
