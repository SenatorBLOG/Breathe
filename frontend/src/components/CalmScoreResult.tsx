// src/components/CalmScoreResult.tsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { CalmScoreResult as CalmScoreData } from '../utils/calmScore';
import { Heart, TrendingUp, ChevronRight } from 'lucide-react';
import { useThemeStyles } from '../hooks/useThemeStyles';

// ─── Animated score ring ──────────────────────────────────────────────────────
function ScoreRing({ score, size = 120, ts }: { score: number; size?: number; ts: any }) {
  const [displayed, setDisplayed] = useState(0);
  const r = size * 0.38;
  const circ = 2 * Math.PI * r;
  const dash = (displayed / 100) * circ;

  useEffect(() => {
    let start = 0;
    const step = score / 60;
    const iv = setInterval(() => {
      start = Math.min(start + step, score);
      setDisplayed(Math.round(start));
      if (start >= score) clearInterval(iv);
    }, 16);
    return () => clearInterval(iv);
  }, [score]);

  // Цвета статуса (оставляем логику, но можно адаптировать под ts, если есть системные цвета успеха/ошибки)
  const statusColor = score >= 80 ? '#4AE8A0' : score >= 65 ? '#4A9EFF' : score >= 45 ? '#FFD97D' : '#FF8A8A';

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <circle cx={size/2} cy={size/2} r={r} fill="none"
          stroke={ts.border} strokeWidth="6" opacity="0.4" />
        <circle cx={size/2} cy={size/2} r={r} fill="none"
          stroke={statusColor} strokeWidth="6" strokeLinecap="round"
          strokeDasharray={`${dash} ${circ}`}
          style={{ transition: 'stroke-dasharray 0.05s', filter: `drop-shadow(0 0 6px ${statusColor}88)` }} />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-3xl font-light tabular-nums leading-none" style={{ color: statusColor }}>{displayed}</span>
        <span className="t-label mt-0.5 uppercase tracking-widest" style={{ color: ts.textMuted }}>Calm Score</span>
      </div>
    </div>
  );
}

// ─── HR comparison bars ───────────────────────────────────────────────────────
function HRBars({ before, after, ts }: { before: number; after: number; ts: any }) {
  const max = Math.max(before, after, 1);
  return (
    <div className="flex flex-col gap-2 w-full">
      {[
        { label: 'Before', value: before, color: '#FF8A8A' },
        { label: 'After',  value: after,  color: '#4AE8A0' },
      ].map(({ label, value, color }) => (
        <div key={label} className="flex items-center gap-3">
          <span className="t-label uppercase tracking-wide w-10 flex-shrink-0" style={{ color: ts.textMuted }}>{label}</span>
          <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ backgroundColor: ts.cardBgHover }}>
            <div className="h-full rounded-full transition-all duration-1000"
              style={{ width: `${(value / max) * 100}%`, background: color,
                boxShadow: `0 0 8px ${color}66` }} />
          </div>
          <span className="t-caption tabular-nums w-12 text-right flex-shrink-0" style={{ color }}>
            {value} bpm
          </span>
        </div>
      ))}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
interface CalmScoreResultProps {
  result:    CalmScoreData;
  technique: string;
  onClose:   () => void;
  onSave?:   () => void;
}

const LABEL_COLORS = {
  minimal:   { color: '#FF8A8A', bg: 'rgba(255,138,138,0.1)',  text: 'Minimal shift' },
  good:       { color: '#FFD97D', bg: 'rgba(255,217,125,0.1)',  text: 'Good session' },
  great:     { color: '#4A9EFF', bg: 'rgba(74,158,255,0.1)',   text: 'Great session 🌊' },
  excellent: { color: '#4AE8A0', bg: 'rgba(74,232,160,0.1)',   text: 'Excellent! 🔥' },
};

export default function CalmScoreResult({ result, technique, onClose, onSave }: CalmScoreResultProps) {
  const ts = useThemeStyles();
  const { score, label, hrDrop, hrvGain, avgBefore, avgAfter, insight, techniqueMatch } = result;
  const meta = LABEL_COLORS[label];

  return (
    <>
      <style>{`
        @keyframes calmSlideUp {
          from { opacity:0; transform: translateY(30px) scale(0.97); }
          to   { opacity:1; transform: translateY(0) scale(1); }
        }
        .calm-in { animation: calmSlideUp 0.5s cubic-bezier(0.34,1.2,0.64,1) forwards; }
      `}</style>

      <div className="fixed inset-0 z-[90] flex items-end sm:items-center justify-center p-4"
        style={{ background: `${ts.navBg}E0`, backdropFilter: 'blur(10px)' }}>
        
        <div className="calm-in w-full max-w-sm flex flex-col gap-5 rounded-3xl overflow-hidden"
          style={{
            background: ts.cardBg,
            border: `1px solid ${meta.color}33`,
            boxShadow: `0 0 60px ${meta.color}0D, 0 24px 60px rgba(0,0,0,0.4)`,
          }}>

          <div className="h-px" style={{ background: `linear-gradient(90deg,transparent,${meta.color}66,transparent)` }} />

          <div className="px-6 pt-2 pb-6 flex flex-col gap-5">
            {/* Label badge */}
            <div className="flex items-center justify-between">
              <span className="t-caption px-3 py-1 rounded-full font-medium"
                style={{ color: meta.color, background: meta.bg }}>
                {meta.text}
              </span>
              <span className="t-label" style={{ color: ts.textMuted }}>{technique}</span>
            </div>

            {/* Score ring + HR drop */}
            <div className="flex items-center gap-4">
              <ScoreRing score={score} size={110} ts={ts} />
              <div className="flex-1 flex flex-col gap-3">
                {hrDrop > 0 && (
                  <div className="flex flex-col gap-0.5">
                    <div className="flex items-center gap-1.5">
                      <Heart size={12} className="text-[#FF6B8A]" />
                      <span className="t-caption font-medium" style={{ color: ts.textPrimary }}>–{hrDrop} bpm</span>
                    </div>
                    <p className="t-label" style={{ color: ts.textMuted }}>heart rate drop</p>
                  </div>
                )}
                {hrvGain && hrvGain > 0 && (
                  <div className="flex flex-col gap-0.5">
                    <div className="flex items-center gap-1.5">
                      <TrendingUp size={12} className="text-[#4AE8A0]" />
                      <span className="t-caption font-medium" style={{ color: ts.textPrimary }}>+{hrvGain}ms</span>
                    </div>
                    <p className="t-label" style={{ color: ts.textMuted }}>HRV improvement</p>
                  </div>
                )}
                {/* Technique match */}
                <div className="flex items-center gap-1.5">
                  <span className="t-body" style={{ color: ts.accentLight }}>
                    {techniqueMatch === 'optimal' ? '✦' : techniqueMatch === 'good' ? '◈' : '○'}
                  </span>
                  <span className="t-label capitalize" style={{
                    color: techniqueMatch === 'optimal' ? '#4AE8A0' : techniqueMatch === 'good' ? '#4A9EFF' : '#FFD97D'
                  }}>
                    {techniqueMatch} match
                  </span>
                </div>
              </div>
            </div>

            {/* HR bars */}
            <HRBars before={avgBefore} after={avgAfter} ts={ts} />

            {/* Insight */}
            <div className="px-4 py-3 rounded-xl border" 
              style={{ backgroundColor: ts.cardBgHover, borderColor: `${ts.border}40` }}>
              <p className="t-caption leading-relaxed" style={{ color: ts.textSecondary }}>{insight}</p>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2">
              {onSave && (
                <button onClick={() => { onSave(); onClose(); }}
                  className="w-full py-3 rounded-xl text-white t-body font-medium tracking-wide transition-all hover:scale-[1.02]"
                  style={{ background: ts.btnGradient, boxShadow: ts.btnShadow }}>
                  Save session with biometrics
                </button>
              )}
              <div className="flex gap-2">
                <Link to="/statistics"
                  className="flex-1 py-2.5 rounded-xl t-caption text-center border transition-all flex items-center justify-center gap-1.5"
                  style={{ color: ts.accentLight, borderColor: ts.border }}>
                  View trends <ChevronRight size={11} />
                </Link>
                <button onClick={onClose}
                  className="flex-1 py-2.5 rounded-xl t-caption border transition-all"
                  style={{ color: ts.textMuted, borderColor: ts.border }}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}