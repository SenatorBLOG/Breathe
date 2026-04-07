// src/components/OnboardingTour.tsx
// Step-by-step UI tour shown once after first login.
// Renders a spotlight ring + tooltip over data-tour elements.
import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { AuthContext } from './contexts/AuthContext';
import { useThemeStyles } from '../hooks/useThemeStyles';

const LS_KEY = 'breathe_tour_done';

interface Step {
  selector: string | null;
  title: string;
  body: string;
  placement: 'center' | 'top' | 'bottom';
}

const STEPS: Step[] = [
  {
    selector: null,
    title: '🌬 Welcome to Breathe',
    body: 'Quick 30-second tour to help you find your way around. You can skip anytime.',
    placement: 'center',
  },
  {
    selector: '[data-tour="begin-session"]',
    title: '🌊 Start breathing',
    body: 'Tap here to begin an animated breathing session. Follow the orb — inhale, hold, exhale.',
    placement: 'top',
  },
  {
    selector: '[data-tour="nav-community"]',
    title: '👥 Community',
    body: "Share experiences, read others' posts, and stay motivated together.",
    placement: 'bottom',
  },
  {
    selector: '[data-tour="nav-profile"]',
    title: '📊 Your Profile',
    body: 'Track your streak, total practice time, milestones, and wearable data.',
    placement: 'bottom',
  },
  {
    selector: '[data-tour="new-session"]',
    title: '✏️ Log a session',
    body: 'After breathing, log your mood and get AI-powered technique recommendations.',
    placement: 'top',
  },
];

interface Rect { top: number; left: number; width: number; height: number; }

export default function OnboardingTour() {
  const ts = useThemeStyles();
  const { isAuthenticated } = useContext(AuthContext);
  const location = useLocation();
  const [step, setStep]     = useState(0);
  const [active, setActive] = useState(false);
  const [rect, setRect]     = useState<Rect | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ top: number; left: number } | null>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  // Only show on /, only if logged in, only once
  useEffect(() => {
    if (!isAuthenticated) return;
    if (location.pathname !== '/') return;
    if (localStorage.getItem(LS_KEY) === 'true') return;
    const t = setTimeout(() => setActive(true), 1200);
    return () => clearTimeout(t);
  }, [isAuthenticated, location.pathname]);

  const updateSpotlight = useCallback(() => {
    const current = STEPS[step];
    if (!current.selector) { setRect(null); setTooltipPos(null); return; }
    const el = document.querySelector(current.selector) as HTMLElement | null;
    if (!el) { setRect(null); setTooltipPos(null); return; }
    const r = el.getBoundingClientRect();
    const PAD = 8;
    setRect({ top: r.top - PAD, left: r.left - PAD, width: r.width + PAD * 2, height: r.height + PAD * 2 });

    const TIP_H = 140;
    const TIP_W = Math.min(300, window.innerWidth - 32);
    let top = current.placement === 'bottom' ? r.bottom + 14 : r.top - TIP_H - 14;
    let left = r.left + r.width / 2 - TIP_W / 2;
    left = Math.max(16, Math.min(left, window.innerWidth - TIP_W - 16));
    top  = Math.max(16, Math.min(top, window.innerHeight - TIP_H - 16));
    setTooltipPos({ top, left });
  }, [step]);

  useEffect(() => { if (active) updateSpotlight(); }, [active, step, updateSpotlight]);
  useEffect(() => {
    if (!active) return;
    window.addEventListener('resize', updateSpotlight);
    return () => window.removeEventListener('resize', updateSpotlight);
  }, [active, updateSpotlight]);

  const done = () => {
    localStorage.setItem(LS_KEY, 'true');
    setActive(false);
  };
  const next = () => { if (step < STEPS.length - 1) setStep(s => s + 1); else done(); };
  const prev = () => { if (step > 0) setStep(s => s - 1); };

  if (!active) return null;

  const current = STEPS[step];
  const isCenter = current.placement === 'center';

  return (
    <>
      {/* Dimming overlay */}
      <div
        ref={overlayRef}
        className="fixed inset-0 pointer-events-none"
        style={{ zIndex: 9990, background: 'rgba(0,0,0,0.62)', transition: 'background 0.3s' }}
      />

      {/* Spotlight ring (cut-out effect via border) */}
      {rect && (
        <div
          className="fixed pointer-events-none"
          style={{
            zIndex: 9991,
            top: rect.top, left: rect.left,
            width: rect.width, height: rect.height,
            borderRadius: 14,
            border: `2px solid ${ts.accent}`,
            boxShadow: `0 0 0 9999px rgba(0,0,0,0)`,
            animation: 'tourRing 1.4s ease-in-out infinite',
          }}
        />
      )}

      {/* Tooltip — either positioned near target or centered */}
      <div
        className="fixed flex flex-col gap-3"
        style={{
          zIndex: 9992,
          ...(isCenter || !tooltipPos
            ? { top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 'min(340px, calc(100vw - 32px))' }
            : { top: tooltipPos.top, left: tooltipPos.left, width: 'min(300px, calc(100vw - 32px))' }
          ),
          background: ts.cardBg,
          border: `1px solid ${ts.borderHover}`,
          borderRadius: 20,
          padding: '20px 20px 16px',
          boxShadow: `0 8px 40px rgba(0,0,0,0.5), 0 0 0 1px ${ts.accent}22`,
          animation: 'tourFadeIn 0.25s ease',
        }}
      >
        {/* Progress dots */}
        <div className="flex items-center gap-1.5 justify-end">
          {STEPS.map((_, i) => (
            <div key={i} style={{
              width: i === step ? 16 : 6, height: 6, borderRadius: 3,
              background: i === step ? ts.accent : `${ts.border}`,
              transition: 'all 0.25s',
            }} />
          ))}
        </div>

        <div>
          <p className="t-body font-semibold leading-snug" style={{ color: ts.textPrimary }}>
            {current.title}
          </p>
          <p className="t-caption mt-1.5 leading-relaxed" style={{ color: ts.textMuted }}>
            {current.body}
          </p>
        </div>

        <div className="flex items-center justify-between gap-2 pt-1">
          <button
            onClick={done}
            className="t-label transition-opacity hover:opacity-70"
            style={{ color: ts.textDim }}
          >
            Skip tour
          </button>
          <div className="flex gap-2">
            {step > 0 && (
              <button
                onClick={prev}
                className="px-4 py-2 rounded-xl t-caption border transition-all"
                style={{ color: ts.textSecondary, borderColor: ts.border }}
              >
                ← Back
              </button>
            )}
            <button
              onClick={next}
              className="px-4 py-2 rounded-xl t-caption font-medium text-white transition-all hover:opacity-90"
              style={{ background: ts.btnGradient }}
            >
              {step === STEPS.length - 1 ? "Let's go →" : 'Next →'}
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes tourRing {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.7; transform: scale(1.03); }
        }
        @keyframes tourFadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  );
}
