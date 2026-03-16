// src/components/AICoach/SoulOrb.tsx
// The living orb — brand mascot + AI Coach trigger
import React, { useCallback, useEffect, useRef, useState } from 'react';
import AICoachModal from './AICoachModal';

// ─── Mood states ──────────────────────────────────────────────────────────────
type Mood = 'idle' | 'curious' | 'happy' | 'thinking' | 'speaking';

export default function SoulOrb() {
  const orbRef      = useRef<HTMLDivElement>(null);
  const [open, setOpen]     = useState(false);
  const [mood, setMood]     = useState<Mood>('idle');
  const [blink, setBlink]   = useState(false);
  const [pupilX, setPupilX] = useState(0);
  const [pupilY, setPupilY] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [labelVisible, setLabelVisible] = useState(false);

  // ── Blink randomly ─────────────────────────────────────────────────────────
  useEffect(() => {
    const schedBlink = () => {
      const delay = 2000 + Math.random() * 4000;
      return setTimeout(() => {
        setBlink(true);
        setTimeout(() => { setBlink(false); schedBlink(); }, 150);
      }, delay);
    };
    const t = schedBlink();
    return () => clearTimeout(t);
  }, []);

  // ── Mood cycle when idle ───────────────────────────────────────────────────
  useEffect(() => {
    if (open) { setMood('speaking'); return; }
    if (hovered) { setMood('curious'); return; }
    const moods: Mood[] = ['idle', 'idle', 'thinking', 'idle', 'idle', 'happy'];
    let i = 0;
    const t = setInterval(() => {
      i = (i + 1) % moods.length;
      setMood(moods[i]);
    }, 3000);
    return () => clearInterval(t);
  }, [open, hovered]);

  // ── Show label after 2 sec ─────────────────────────────────────────────────
  useEffect(() => {
    const t = setTimeout(() => setLabelVisible(true), 2000);
    return () => clearTimeout(t);
  }, []);

  // ── Pupils follow mouse ────────────────────────────────────────────────────
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!orbRef.current) return;
    const rect = orbRef.current.getBoundingClientRect();
    const cx   = rect.left + rect.width  / 2;
    const cy   = rect.top  + rect.height / 2;
    const dx   = e.clientX - cx;
    const dy   = e.clientY - cy;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const max  = 4;
    const scale = Math.min(dist / 120, 1);
    setPupilX((dx / dist || 0) * max * scale);
    setPupilY((dy / dist || 0) * max * scale);
  }, []);

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [handleMouseMove]);

  // ── Eye shapes per mood ────────────────────────────────────────────────────
  const eyeConfig = {
    idle:     { ry: 5,   squint: 0,  pupilSize: 3.5 },
    curious:  { ry: 6.5, squint: 0,  pupilSize: 4   },
    happy:    { ry: 3,   squint: 2,  pupilSize: 3   },
    thinking: { ry: 4,   squint: 0,  pupilSize: 3   },
    speaking: { ry: 5.5, squint: 0,  pupilSize: 4   },
  }[mood];

  const blinkRy = blink ? 0.5 : eyeConfig.ry;

  return (
    <>
      <style>{`
        @keyframes orbFloat {
          0%,100% { transform: translateY(0px); }
          50%      { transform: translateY(-8px); }
        }
        @keyframes orbBreath {
          0%,100% { transform: scale(1); filter: drop-shadow(0 0 30px rgba(74,158,255,0.5)); }
          50%      { transform: scale(1.08); filter: drop-shadow(0 0 55px rgba(74,158,255,0.75)); }
        }
        @keyframes orbRing {
          0%   { transform: scale(1);   opacity: 0.35; }
          100% { transform: scale(1.9); opacity: 0; }
        }
        @keyframes labelFade {
          from { opacity:0; transform: translateY(4px); }
          to   { opacity:1; transform: translateY(0); }
        }
        @keyframes labelPulse {
          0%,100% { opacity: 0.75; }
          50%      { opacity: 1; }
        }
        .orb-float  { animation: orbFloat 5s ease-in-out infinite; }
        .orb-breath { animation: orbBreath 4s ease-in-out infinite; }
        .orb-ring   { animation: orbRing 2.8s ease-out infinite; }
        .orb-ring-2 { animation: orbRing 2.8s ease-out 0.9s infinite; }
        .label-in   { animation: labelFade 0.6s ease forwards, labelPulse 3s ease-in-out 1s infinite; }
        .orb-cursor { cursor: pointer; }
        .orb-cursor:hover .orb-hover-scale { transform: scale(1.06); transition: transform 0.3s ease; }
      `}</style>

      <div className="flex flex-col items-center gap-0 select-none">

        {/* ── ORB ── */}
        <div ref={orbRef} className="orb-cursor orb-float relative flex items-center justify-center"
          style={{ width: 200, height: 200 }}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          onClick={() => setOpen(v => !v)}>

          {/* Pulse rings */}
          <div className="orb-ring absolute inset-0 rounded-full border border-[#4A9EFF]/20" />
          <div className="orb-ring-2 absolute inset-0 rounded-full border border-[#4A9EFF]/15" />

          {/* Main orb body */}
          <div className="orb-breath orb-hover-scale absolute inset-6 rounded-full"
            style={{
              background: hovered
                ? 'radial-gradient(circle at 35% 30%, #9AD4FF, #2A7AFF 50%, #0A1A4F)'
                : 'radial-gradient(circle at 35% 30%, #7AC4FF, #1A5FCC 58%, #0A1A3F)',
              boxShadow: hovered
                ? '0 0 70px rgba(74,158,255,0.65), 0 0 140px rgba(74,158,255,0.2), inset 0 0 50px rgba(255,255,255,0.12)'
                : '0 0 50px rgba(74,158,255,0.45), 0 0 100px rgba(74,158,255,0.12), inset 0 0 40px rgba(255,255,255,0.08)',
              transition: 'background 0.4s ease, box-shadow 0.4s ease',
            }} />

          {/* Specular highlight */}
          <div className="absolute pointer-events-none rounded-full"
            style={{
              top: '28%', left: '30%', width: '22%', height: '14%',
              background: 'rgba(255,255,255,0.35)',
              filter: 'blur(3px)',
              transform: 'rotate(-25deg)',
            }} />

          {/* SVG face */}
          <svg className="absolute" viewBox="0 0 100 100"
            style={{ width: 80, height: 80, overflow: 'visible' }}>

            {/* Thinking eyebrow (left) */}
            {mood === 'thinking' && (
              <path d="M 34 36 Q 40 32 46 36" stroke="rgba(200,230,255,0.5)"
                strokeWidth="1.5" fill="none" strokeLinecap="round" />
            )}

            {/* Left eye */}
            <ellipse
              cx={40 + (mood === 'thinking' ? -1 : 0)}
              cy={48}
              rx={4.5}
              ry={blinkRy}
              fill="rgba(180,220,255,0.92)"
              style={{ transition: 'ry 0.08s ease, cx 0.15s ease' }}
            />
            {/* Left pupil */}
            {!blink && (
              <ellipse
                cx={40 + pupilX + (mood === 'thinking' ? -1.5 : 0)}
                cy={48 + pupilY}
                rx={eyeConfig.pupilSize * 0.6}
                ry={eyeConfig.pupilSize * 0.75}
                fill="rgba(10,26,64,0.9)"
                style={{ transition: 'cx 0.1s ease, cy 0.1s ease' }}
              />
            )}
            {/* Left pupil shine */}
            {!blink && (
              <ellipse cx={40 + pupilX - 1} cy={48 + pupilY - 1.5} rx={1} ry={1}
                fill="rgba(255,255,255,0.8)" />
            )}

            {/* Right eye */}
            <ellipse
              cx={60}
              cy={48}
              rx={4.5}
              ry={blinkRy}
              fill="rgba(180,220,255,0.92)"
              style={{ transition: 'ry 0.08s ease' }}
            />
            {!blink && (
              <ellipse
                cx={60 + pupilX}
                cy={48 + pupilY}
                rx={eyeConfig.pupilSize * 0.6}
                ry={eyeConfig.pupilSize * 0.75}
                fill="rgba(10,26,64,0.9)"
                style={{ transition: 'cx 0.1s ease, cy 0.1s ease' }}
              />
            )}
            {!blink && (
              <ellipse cx={60 + pupilX - 1} cy={48 + pupilY - 1.5} rx={1} ry={1}
                fill="rgba(255,255,255,0.8)" />
            )}

            {/* Happy squint / smile */}
            {mood === 'happy' && (
              <path d="M 42 58 Q 50 64 58 58" stroke="rgba(200,235,255,0.6)"
                strokeWidth="1.5" fill="none" strokeLinecap="round" />
            )}

            {/* Speaking — small mouth */}
            {(mood === 'speaking' || open) && (
              <ellipse cx={50} cy={60} rx={4} ry={2.5}
                fill="rgba(10,26,64,0.5)" />
            )}
          </svg>

          {/* Open indicator dot */}
          {open && (
            <div className="absolute top-3 right-3 w-2.5 h-2.5 rounded-full bg-[#4AE8A0]"
              style={{ boxShadow: '0 0 8px rgba(74,232,160,0.8)' }} />
          )}
        </div>

        {/* ── Label ── */}
        {labelVisible && !open && (
          <div className="label-in flex flex-col items-center gap-1 -mt-1">
            <div className="w-px h-3 bg-gradient-to-b from-[#4A9EFF]/25 to-transparent" />
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
              style={{
                background: 'rgba(9,17,34,0.85)',
                border: '1px solid rgba(74,158,255,0.25)',
                backdropFilter: 'blur(8px)',
              }}>
              <span className="text-[9px] text-[#4A9EFF]">✦</span>
              <span className="text-[10px] text-[#7AC4FF] tracking-wide">
                {hovered ? 'Click to chat with me' : 'I\'m your AI Coach — ask me anything'}
              </span>
            </div>
          </div>
        )}

        {/* ── Inline chat expands below ── */}
        {open && (
          <div className="w-full max-w-sm mt-3">
            <AICoachModal onClose={() => setOpen(false)} />
          </div>
        )}
      </div>
    </>
  );
}