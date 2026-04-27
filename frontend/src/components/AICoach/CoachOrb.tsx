// src/components/AICoach/CoachOrb.tsx
//
// Breathing coach orb — the SoulOrb adapted for guided breathing sessions.
// Replaces BreathingCircle with a living, emotional entity:
//   • Eyes widen on inhale, soften on exhale, go half-closed on rest
//   • Glow bloom scales with breath fullness (inhale = bright halo)
//   • Phase + countdown rendered inside the orb body as glassy text
//   • Hold phase: halo pulses instead of scaling
//   • Idle (not active): gentle float animation, mouse-tracked pupils
//
// Performance:
//   • Only `scale` is framer-motion animated (GPU-composited transform)
//   • box-shadow transitions via CSS `transition` (only on phase change, ~4× per cycle)
//   • Pupil tracking via `transform: translate()` (composited)
//   • No per-frame JS values — all hot-path animation stays on compositor thread
//
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { useThemeStyles } from '../../hooks/useThemeStyles';
import { useTheme, type Theme } from '../../contexts/ThemeContext';

export type Phase = 'inhale' | 'hold' | 'exhale' | 'pause';

interface PhaseDurations {
  inhale: number;
  hold: number;
  exhale: number;
  pause: number;
}

interface CoachOrbProps {
  isActive: boolean;
  phaseDurations: PhaseDurations;
  onCycleComplete?: () => void;
  /** intensity is 0–1; matches BreathingCircle's signature for drop-in replacement */
  onPhaseChange?: (phase: Phase, intensity?: number) => void;
  onToggle?: () => void;
  size?: number;
  minScale?: number;
  maxScale?: number;
  glowIntensity?: number;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const PHASE_LABEL: Record<Phase, string> = {
  inhale: 'Inhale',
  hold:   'Hold',
  exhale: 'Exhale',
  pause:  'Rest',
};

// Eye vertical openness multiplier per phase (1.0 = baseline)
const EYE_OPENNESS: Record<Phase, number> = {
  inhale: 1.20,  // wide — filling with breath
  hold:   1.0,   // calm / steady
  exhale: 0.60,  // soft squint — releasing
  pause:  0.40,  // peaceful, half-closed
};

// Glow intensity multiplier per phase (used for box-shadow + halo opacity)
const PHASE_GLOW: Record<Phase, number> = {
  inhale: 1.00,
  hold:   0.80,
  exhale: 0.36,
  pause:  0.20,
};

// ── Component ─────────────────────────────────────────────────────────────────

// Always-dark orb body per theme — breathing page always has dark video backdrop.
// Day/gold theme uses a deep amber-black so the gold glow reads clearly, never white.
// Fully opaque so backdropFilter can't bleed the bright video background through.
// Day/gold uses dark amber-black so the gold accent reads clearly (not cream like ts.cardBg).
const ORB_BASE: Record<Theme, string> = {
  night:  'rgb(10, 20, 42)',    // deep navy
  day:    'rgb(241, 245, 249)',    // dark amber-black
  nature: 'rgb( 8, 20, 10)',   // dark forest
};

export function CoachOrb({
  isActive,
  phaseDurations,
  onCycleComplete,
  onPhaseChange,
  onToggle,
  size = 280,
  minScale = 0.76,
  maxScale = 1.08,
  glowIntensity = 1.0,
}: CoachOrbProps) {
  const ts = useThemeStyles();
  const { theme } = useTheme();
  const orbBase = ORB_BASE[theme];
const bottomHighlight =
  theme === 'day'
    ? 'radial-gradient(circle at 70% 70%, rgba(255,255,255,0.25), transparent 60%)'
    : 'transparent';
  const controls = useAnimation();
  const orbRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<number | null>(null);

  const [phase, setPhase] = useState<Phase>('inhale');
  const [blink, setBlink] = useState(false);
  const [pupilX, setPupilX] = useState(0);
  const [pupilY, setPupilY] = useState(0);
  const [countdown, setCountdown] = useState(0);

  // ── Blink loop ─────────────────────────────────────────────────────────────
  useEffect(() => {
    let outerTid: ReturnType<typeof setTimeout>;
    let innerTid: ReturnType<typeof setTimeout>;
    const loop = () => {
      outerTid = setTimeout(() => {
        setBlink(true);
        innerTid = setTimeout(() => setBlink(false), 110);
        loop();
      }, 2800 + Math.random() * 3800);
    };
    loop();
    return () => { clearTimeout(outerTid); clearTimeout(innerTid); };
  }, []);

  // ── Pupil tracking — only when idle (not during active session) ───────────
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!orbRef.current) return;
    const rect = orbRef.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = e.clientX - cx;
    const dy = e.clientY - cy;
    const dist = Math.sqrt(dx * dx + dy * dy) || 1;
    const maxOffset = 5;
    const factor = Math.min(dist / 200, 1);
    setPupilX((dx / dist) * maxOffset * factor);
    setPupilY((dy / dist) * maxOffset * factor);
  }, []);

  // When session starts, smoothly return pupils to center
  useEffect(() => {
    if (isActive) {
      setPupilX(0);
      setPupilY(0);
    }
  }, [isActive]);

  useEffect(() => {
    if (isActive) return; // don't track mouse during meditation
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [handleMouseMove, isActive]);

  // ── Per-phase countdown ────────────────────────────────────────────────────
  useEffect(() => {
    if (!isActive) { setCountdown(0); return; }
    setCountdown(Math.round(phaseDurations[phase]));
    const iv = setInterval(() => setCountdown(c => Math.max(0, c - 1)), 1000);
    return () => clearInterval(iv);
  }, [phase, isActive, phaseDurations]);

  // ── Breathing phase engine ─────────────────────────────────────────────────
  // Mirror of BreathingCircle's engine. Only `scale` goes through framer-motion;
  // box-shadow transitions via CSS (avoids per-frame JS → compositor only).
  useEffect(() => {
    if (timeoutRef.current) { window.clearTimeout(timeoutRef.current); timeoutRef.current = null; }

    if (!isActive) {
      controls.start({ scale: 1, transition: { duration: 0.8, ease: 'easeOut' } });
      setPhase('inhale');
      onPhaseChange?.('inhale', 1.0);
      return;
    }

    const order: Phase[] = ['inhale', 'hold', 'exhale', 'pause'];

    const runPhase = (p: Phase) => {
      setPhase(p);
      onPhaseChange?.(p, PHASE_GLOW[p]);

      const expanding = p === 'inhale' || p === 'hold';
      controls.start({
        scale: expanding ? maxScale : minScale,
        transition: { duration: phaseDurations[p], ease: 'easeInOut' },
      });

      timeoutRef.current = window.setTimeout(() => {
        if (p === 'pause') onCycleComplete?.();
        runPhase(order[(order.indexOf(p) + 1) % order.length]);
      }, Math.max(50, Math.round(phaseDurations[p] * 1000)));
    };

    // Always restart from inhale — avoids relying on stale `phase` state
    runPhase('inhale');

    return () => {
      if (timeoutRef.current) { window.clearTimeout(timeoutRef.current); timeoutRef.current = null; }
    };
  }, [isActive, phaseDurations, glowIntensity, minScale, maxScale, ts.accent]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Derived display values ─────────────────────────────────────────────────

  // Memoized per-phase glow values — only recompute when phase/isActive/glowIntensity change.
  // This prevents mousemove (pupilX/Y) and countdown (1 Hz) re-renders from touching
  // box-shadow or halo opacity, keeping those DOM mutations to ~4× per breath cycle.
  const { glow, shadowAlpha, insetAlpha, haloOpacity } = useMemo(() => {
    const g = (isActive ? PHASE_GLOW[phase] : 0.28) * glowIntensity;
    // Both shadow alphas are hex strings appended to ts.accent (e.g. "#3A82F7" + "2A")
    // shadowAlpha: outer bloom  (max ~40% at inhale)
    // insetAlpha:  inner glow   (max ~20% at inhale, matching SoulOrb's "33" at rest)
    return {
      glow: g,
      shadowAlpha: Math.floor(g * 102).toString(16).padStart(2, '0'),  // 0–40% opacity
      insetAlpha:  Math.floor(g * 51).toString(16).padStart(2, '0'),   // 0–20% opacity
      haloOpacity: g * 0.30,
    };
  }, [phase, isActive, glowIntensity]);

  const eyeOpenness = isActive ? EYE_OPENNESS[phase] : 1.0;
  const showSmile   = isActive && (phase === 'exhale' || phase === 'pause');
  const isHoldPhase = isActive && phase === 'hold';

  // Proportional geometry — stable across renders for a given size
  const eyeW      = Math.round(size * 0.072);
  const eyeH      = blink ? 2 : Math.round(eyeW * eyeOpenness);
  const pupilSize = Math.round(eyeW * 0.52);
  const eyeGap    = Math.round(size * 0.12);
  const smileW    = Math.round(size * 0.17);
  const smileH    = Math.round(size * 0.055);
  const labelSize = Math.min(Math.round(size * 0.050), 17);
  const timerSize = Math.min(Math.round(size * 0.130), 42);
  const glowBlur  = Math.round(size * 0.5);
  const haloInset = Math.round(size * 0.1);

  return (
    <>
      <style>{`
        @keyframes coachFloat {
          0%,100% { transform: translateY(0px) rotate(0deg); }
          40%     { transform: translateY(-9px) rotate(0.4deg); }
          70%     { transform: translateY(-4px) rotate(-0.3deg); }
        }
        @keyframes holdHaloPulse {
          0%,100% { opacity: 0.38; transform: scale(1); }
          50%     { opacity: 0.68; transform: scale(1.07); }
        }
        .coach-orb-float     { animation: coachFloat 7s ease-in-out infinite; }
        .coach-halo-hold     { animation: holdHaloPulse 1.9s ease-in-out infinite; }
      `}</style>

      {/* Root container — carries float when idle */}
      <div
        ref={orbRef}
        className={!isActive ? 'coach-orb-float' : undefined}
        style={{ width: size, height: size, position: 'relative' }}
      >

        {/* ── Ambient glow halo ──────────────────────────────────────────── */}
        {/* Sits behind the sphere; blooms on inhale, pulses on hold */}
        <div
          className={isHoldPhase ? 'coach-halo-hold' : undefined}
          style={{
            position: 'absolute',
            top:    -haloInset,
            left:   -haloInset,
            right:  -haloInset,
            bottom: -haloInset,
            borderRadius: '9999px',
            background: ts.accent,
            filter: `blur(${glowBlur}px)`,
            opacity: haloOpacity,
            transition: 'opacity 1.5s ease',
            pointerEvents: 'none',
          }}
        />

        {/* ── Core sphere — framer-motion handles ONLY scale ─────────────── */}
        <motion.div
          animate={controls}
          initial={{ scale: 1 }}
          whileHover={!isActive ? { scale: 1.04, transition: { duration: 0.22 } } : undefined}
          whileTap={{ scale: 0.97 }}
          onClick={onToggle}
          style={{
            width: size,
            height: size,
            borderRadius: '9999px',
            cursor: 'pointer',
            position: 'relative',
            willChange: 'transform',
            // Exact SoulOrb gradient formula — accent bloom top-left,
            // subtle counter-shine bottom-right, per-theme dark base.
            // Opaque base blocks video bleed-through on all themes.
            // backdropFilter is safe here — opaque base stops background from showing.
            background: `
              radial-gradient(circle at 30% 30%, ${ts.accent}AA, ${ts.accent}55 40%, transparent 70%),
              ${orbBase}
            `,
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: `1px solid ${ts.border}`,
            // SoulOrb formula scaled by phase glow. CSS transition only — not framer-motion.
            boxShadow: `
              0 0 ${glowBlur}px ${ts.accent}${shadowAlpha},
              inset 0 0 ${Math.round(size * 0.25)}px ${ts.accent}${insetAlpha}
            `,
            transition: 'box-shadow 1.4s ease',
          }}
        >

          {/* Inner shine — copied verbatim from SoulOrb; smooth gradient, not a blob */}
          <div style={{
            position: 'absolute', inset: 0, borderRadius: '9999px', pointerEvents: 'none',
            background: `
              radial-gradient(circle at 30% 30%, ${ts.accent}AA, ${ts.accent}55 40%, transparent 70%),
              ${bottomHighlight},
              ${orbBase}
            `,          }} />

          {/* ── Eyes ──────────────────────────────────────────────────────── */}
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: eyeGap,
            paddingTop: Math.round(size * 0.04),
            pointerEvents: 'none',
          }}>
            {[0, 1].map(i => (
              <div key={i} style={{
                width: eyeW,
                height: eyeH,
                background: 'rgba(255,255,255,0.92)',
                borderRadius: blink ? 2 : '9999px',
                position: 'relative',
                transition: 'height 0.14s ease, width 0.30s ease',
                boxShadow: '0 1px 6px rgba(0,0,0,0.18)',
                overflow: 'hidden',
              }}>
                {!blink && (
                  // Pupil — translate-only for compositor-path animation
                  <div style={{
                    position: 'absolute',
                    top: '50%', left: '50%',
                    width: pupilSize, height: pupilSize,
                    borderRadius: '9999px',
                    background: '#111',
                    transform: `translate(calc(-50% + ${pupilX}px), calc(-50% + ${pupilY}px))`,
                    transition: 'transform 0.07s linear',
                  }}>
                    {/* Pupil glint */}
                    <div style={{
                      position: 'absolute',
                      top: '17%', left: '17%',
                      width: '36%', height: '36%',
                      borderRadius: '9999px',
                      background: 'rgba(255,255,255,0.72)',
                    }} />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* ── Smile — fades in on exhale + rest ─────────────────────── */}
          <div style={{
            position: 'absolute',
            left: '50%',
            top: '62%',
            transform: 'translateX(-50%)',
            width: smileW,
            height: smileH,
            borderBottom: '2px solid rgba(255,255,255,0.36)',
            borderRadius: '0 0 50px 50px',
            opacity: showSmile ? 1 : 0,
            transition: 'opacity 0.55s ease',
            pointerEvents: 'none',
          }} />

          {/* ── Phase label + countdown — glassy text inside the body ─── */}
          <div style={{
            position: 'absolute',
            bottom: 0, left: 0, right: 0,
            height: '33%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none',
            userSelect: 'none',
          }}>
            {isActive ? (
              <div style={{ textAlign: 'center', lineHeight: 1 }}>
                <div style={{
                  color: 'rgba(255,255,255,0.70)',
                  fontSize: labelSize,
                  fontWeight: 600,
                  letterSpacing: '0.22em',
                  textTransform: 'uppercase',
                  textShadow: '0 1px 8px rgba(0,0,0,0.50)',
                }}>
                  {PHASE_LABEL[phase]}
                </div>
                <div style={{
                  color: 'rgba(255,255,255,0.92)',
                  fontSize: timerSize,
                  fontWeight: 700,
                  marginTop: Math.round(size * 0.012),
                  fontVariantNumeric: 'tabular-nums',
                  textShadow: '0 2px 12px rgba(0,0,0,0.55)',
                  letterSpacing: '-0.02em',
                }}>
                  {countdown}
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', lineHeight: 1 }}>
                <div style={{
                  color: 'rgba(255,255,255,0.55)',
                  fontSize: labelSize,
                  fontWeight: 600,
                  letterSpacing: '0.12em',
                  textShadow: '0 2px 10px rgba(0,0,0,0.4)',
                }}>
                  Tap to begin
                </div>
              </div>
            )}
          </div>

        </motion.div>
      </div>
    </>
  );
}
