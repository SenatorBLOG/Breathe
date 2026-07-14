// src/components/HeroBreathDemo.tsx
//
// Instant breathe-along demo for the landing page. The product's whole pitch
// is "works in 30 seconds, no signup" — so the landing page itself IS the
// product: an auto-running belly-breathing circle (inhale 4s · exhale 6s ·
// rest 2s) the visitor can follow before clicking anything.
//
// Battery/attention friendly: the cycle only runs while the section is
// actually in the viewport (IntersectionObserver) and freezes for users with
// prefers-reduced-motion (label still cycles — the guidance keeps its value,
// the scaling stops).
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useThemeStyles } from '../hooks/useThemeStyles';

type PhaseKey = 'inhale' | 'exhale' | 'rest';

const PHASES: { key: PhaseKey; secs: number; scale: number }[] = [
  { key: 'inhale', secs: 4, scale: 1.3 },
  { key: 'exhale', secs: 6, scale: 1.0 },
  { key: 'rest',   secs: 2, scale: 1.0 },
];

// Same shape TechniquePill passes to /breathing — lands with belly preloaded.
const BELLY_PRESET = { inhale: 4, hold: 0, exhale: 6, pause: 2 };

export default function HeroBreathDemo() {
  const { t } = useTranslation();
  const ts = useThemeStyles();
  const sectionRef = useRef<HTMLElement>(null);

  const [visible, setVisible] = useState(false);
  const [phaseIdx, setPhaseIdx] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(PHASES[0].secs);
  const [reducedMotion, setReducedMotion] = useState(false);

  // Run only while on screen.
  useEffect(() => {
    const node = sectionRef.current;
    if (!node || typeof IntersectionObserver === 'undefined') {
      setVisible(true);
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { threshold: 0.35 },
    );
    io.observe(node);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const mq = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    if (!mq) return;
    setReducedMotion(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener?.('change', onChange);
    return () => mq.removeEventListener?.('change', onChange);
  }, []);

  // Per-phase countdown; advancing the phase re-arms the effect.
  useEffect(() => {
    if (!visible) return;
    setSecondsLeft(PHASES[phaseIdx].secs);
    const id = setInterval(() => {
      setSecondsLeft(prev => {
        if (prev <= 1) {
          setPhaseIdx(i => (i + 1) % PHASES.length);
          return prev; // next effect run resets the counter
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [visible, phaseIdx]);

  const phase = PHASES[phaseIdx];
  const scale = reducedMotion ? 1 : phase.scale;

  return (
    <section
      ref={sectionRef}
      className="flex flex-col items-center gap-6 px-4 py-12 sm:py-16"
      aria-label={t('home.breathDemo.title', 'Try it right now')}
    >
      <div className="text-center">
        <h2 className="t-heading sm:text-xl font-medium tracking-wide" style={{ color: ts.textPrimary }}>
          {t('home.breathDemo.title', 'Try it right now')}
        </h2>
        <p className="t-caption mt-1 max-w-sm mx-auto" style={{ color: ts.textMuted }}>
          {t('home.breathDemo.caption', 'Breathe with the circle — inhale 4s, exhale 6s. No signup, it’s already working.')}
        </p>
      </div>

      {/* The circle */}
      <div className="relative flex items-center justify-center" style={{ width: 230, height: 230 }}>
        {/* Outer halo — breathes with the core */}
        <div
          aria-hidden
          className="absolute rounded-full blur-2xl"
          style={{
            width: 170,
            height: 170,
            background: ts.accent,
            opacity: phase.key === 'inhale' ? 0.28 : 0.14,
            transform: `scale(${reducedMotion ? 1 : phase.scale * 1.15})`,
            transition: `transform ${phase.secs}s cubic-bezier(0.4,0,0.2,1), opacity ${phase.secs}s ease`,
          }}
        />
        {/* Core ring */}
        <div
          className="relative rounded-full flex flex-col items-center justify-center"
          style={{
            width: 150,
            height: 150,
            background: `radial-gradient(circle at 32% 30%, ${ts.accent}55, transparent 65%), ${ts.cardBg}`,
            border: `1.5px solid ${ts.accent}55`,
            boxShadow: `0 0 45px ${ts.accent}30, inset 0 0 30px ${ts.accent}18`,
            transform: `scale(${scale})`,
            transition: `transform ${phase.secs}s cubic-bezier(0.4,0,0.2,1)`,
          }}
        >
          <span className="t-body font-medium tracking-wide" style={{ color: ts.textPrimary }}>
            {t(`breathing.phaseLabels.${phase.key}`)}
          </span>
          <span className="text-2xl font-light tabular-nums mt-0.5" style={{ color: ts.accent }}>
            {secondsLeft}
          </span>
        </div>
      </div>

      <Link
        to="/breathing"
        state={{ coachPreset: BELLY_PRESET, coachPresetName: 'Belly Breathing' }}
        className="px-8 py-3 rounded-full t-body font-medium text-white transition-all hover:scale-105"
        style={{ background: ts.btnGradient, boxShadow: ts.btnShadow }}
      >
        {t('home.breathDemo.cta', 'Start a full session')} →
      </Link>
    </section>
  );
}
