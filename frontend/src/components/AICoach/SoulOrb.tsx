// src/components/AICoach/SoulOrb.tsx
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useThemeStyles } from "../../hooks/useThemeStyles";
import AICoachModal from './AICoachModal';

type Mood = 'idle' | 'curious' | 'happy' | 'thinking' | 'speaking';

export default function SoulOrb() {
  const ts = useThemeStyles();
  const orbRef = useRef<HTMLDivElement>(null);

  const [open, setOpen] = useState(false);
  const [mood, setMood] = useState<Mood>('idle');
  const [blink, setBlink] = useState(false);
  const [pupilX, setPupilX] = useState(0);
  const [pupilY, setPupilY] = useState(0);
  const [hovered, setHovered] = useState(false);

  // ── Blink ────────────────────────────────────────────────
  useEffect(() => {
    const loop = () => {
      const delay = 2500 + Math.random() * 4000;
      setTimeout(() => {
        setBlink(true);
        setTimeout(() => setBlink(false), 120);
        loop();
      }, delay);
    };
    loop();
  }, []);

  // ── Mood ─────────────────────────────────────────────────
  useEffect(() => {
    if (open) return setMood('speaking');
    if (hovered) return setMood('curious');

    const moods: Mood[] = ['idle', 'thinking', 'idle', 'happy'];
    let i = 0;
    const t = setInterval(() => {
      i = (i + 1) % moods.length;
      setMood(moods[i]);
    }, 4000);

    return () => clearInterval(t);
  }, [open, hovered]);

  // ── Mouse tracking ───────────────────────────────────────
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!orbRef.current) return;

    const rect = orbRef.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;

    const dx = e.clientX - cx;
    const dy = e.clientY - cy;

    const dist = Math.sqrt(dx * dx + dy * dy);
    const max = 6;
    const scale = Math.min(dist / 150, 1);

    setPupilX((dx / dist || 0) * max * scale);
    setPupilY((dy / dist || 0) * max * scale);
  }, []);

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [handleMouseMove]);

  const eyeScale =
    mood === 'happy' ? 0.7 :
    mood === 'curious' ? 1.1 :
    1;

  return (
    <>
      <style>{`
        @keyframes floatOrb {
          0%,100% { transform: translateY(0px); }
          50% { transform: translateY(-12px); }
        }

        @keyframes pulseGlow {
          0%,100% { opacity: 0.5; transform: scale(1); }
          50% { opacity: 0.9; transform: scale(1.08); }
        }

        .orb-float { animation: floatOrb 6s ease-in-out infinite; }
        .orb-glow { animation: pulseGlow 4s ease-in-out infinite; }
      `}</style>

      <div className="flex flex-col items-center select-none">

        {/* ORB */}
        <div
          ref={orbRef}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          onClick={() => setOpen(!open)}
          className="relative orb-float cursor-pointer"
          style={{ width: 200, height: 200 }}
        >

          {/* OUTER GLOW */}
          <div
            className="absolute inset-0 rounded-full blur-2xl orb-glow"
            style={{
              background: `${ts.accent}`,
              opacity: 0.25
            }}
          />

          {/* CORE */}
          <div
            className="absolute inset-0 rounded-full transition-all duration-500"
            style={{
              background: `
                radial-gradient(circle at 30% 30%, ${ts.accent}AA, ${ts.accent}55 40%, transparent 70%),
                radial-gradient(circle at 70% 70%, #ffffff22, transparent 60%),
                ${ts.cardBg}
              `,
              boxShadow: hovered
                ? `0 0 120px ${ts.accent}66, inset 0 0 60px ${ts.accent}33`
                : `0 0 60px ${ts.accent}33, inset 0 0 30px ${ts.accent}22`,
              backdropFilter: 'blur(20px)',
              border: `1px solid ${ts.border}`,
              transform: hovered ? 'scale(1.06)' : 'scale(1)'
            }}
          />

          {/* INNER SHINE */}
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background: `radial-gradient(circle at 40% 35%, rgba(255,255,255,0.25), transparent 60%)`
            }}
          />

          {/* EYES */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex gap-6">

              {[0, 1].map((i) => (
                <div
                  key={i}
                  className="relative rounded-full flex items-center justify-center transition-all"
                  style={{
                    width: 16 * eyeScale,
                    height: blink ? 2 : 16 * eyeScale,
                    background: 'white',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {!blink && (
                    <div
                      className="absolute rounded-full"
                      style={{
                        width: 8,
                        height: 8,
                        background: '#000',
                        transform: `translate(${pupilX}px, ${pupilY}px)`
                      }}
                    />
                  )}
                </div>
              ))}

            </div>
          </div>

          {/* SOFT SMILE */}
          {(hovered || mood === 'happy' || open) && (
            <div
              className="absolute left-1/2 bottom-[28%] -translate-x-1/2"
              style={{
                width: 30,
                height: 10,
                borderBottom: '2px solid rgba(0,0,0,0.5)',
                borderRadius: '0 0 50px 50px',
                opacity: 0.6
              }}
            />
          )}

        </div>

        {/* TEXT BUBBLE */}
        {!open && (
          <div className="mt-3">
            <div
              className="px-4 py-2 rounded-2xl backdrop-blur-xl transition-all"
              style={{
                background: `${ts.cardBg}CC`,
                border: `1px solid ${ts.border}`,
                color: ts.textPrimary
              }}
            >
              <p className="text-[10px] uppercase tracking-widest flex gap-2">
                <span style={{ color: ts.accent }}>✦</span>
                {hovered ? 'Talk to me' : 'Your AI coach'}
              </p>
            </div>
          </div>
        )}

        {/* MODAL */}
        {open && (
          <div className="w-full max-w-md mt-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <AICoachModal onClose={() => setOpen(false)} />
          </div>
        )}

      </div>
    </>
  );
}