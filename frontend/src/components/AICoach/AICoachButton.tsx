// src/components/AICoach/AICoachButton.tsx
import React, { useState } from 'react';
import { Sparkles } from 'lucide-react';
import AICoachModal from './AICoachModal';

interface AICoachButtonProps {
  variant?: 'orb' | 'floating';
}

export default function AICoachButton({ variant = 'floating' }: AICoachButtonProps) {
  const [open, setOpen] = useState(false);

  // ── Orb variant — sits below the orb in normal document flow ──────────────
  if (variant === 'orb') {
    return (
      <div className="flex flex-col items-center w-full">
        <style>{`
          @keyframes coachHintBounce {
            0%,100% { transform: translateY(0); }
            50%      { transform: translateY(-3px); }
          }
          @keyframes coachGlow {
            0%,100% { box-shadow: 0 0 16px rgba(74,158,255,0.3); }
            50%      { box-shadow: 0 0 28px rgba(74,158,255,0.6); }
          }
          .coach-hint-btn { animation: coachHintBounce 2.5s ease-in-out infinite, coachGlow 2.5s ease-in-out infinite; }
        `}</style>

        {/* Connector line from orb */}
        <div className="w-px h-4 bg-gradient-to-b from-[#4A9EFF]/30 to-transparent" />

        {/* Trigger button */}
        {!open && (
          <button onClick={() => setOpen(true)}
            className="coach-hint-btn flex items-center gap-2 px-4 py-2 rounded-full text-xs text-white font-medium tracking-wide transition-all hover:scale-105 active:scale-95"
            style={{ background: 'linear-gradient(135deg,#0D1B33,#1A3A6A)', border: '1px solid rgba(74,158,255,0.35)' }}>
            <Sparkles size={11} className="text-[#7AC4FF]" />
            Ask AI Coach ✨
          </button>
        )}

        {/* Inline chat — expands below button, pushing content down */}
        {open && <AICoachModal onClose={() => setOpen(false)} />}
      </div>
    );
  }

  // ── Floating pill — fixed bottom right on all other pages ─────────────────
  return (
    <>
      <style>{`
        @keyframes floatPulse {
          0%,100% { box-shadow: 0 0 20px rgba(74,158,255,0.3), 0 4px 20px rgba(0,0,0,0.4); }
          50%      { box-shadow: 0 0 36px rgba(74,158,255,0.55), 0 4px 24px rgba(0,0,0,0.5); }
        }
        .coach-float-btn { animation: floatPulse 3s ease-in-out infinite; }
      `}</style>

      <button onClick={() => setOpen(v => !v)}
        className="coach-float-btn fixed bottom-24 right-5 z-40 flex items-center gap-2 px-4 py-2.5 rounded-full text-sm text-white font-medium transition-all hover:scale-105 active:scale-95"
        style={{ background: 'linear-gradient(135deg,#1A3A6A,#1A5FCC)' }}>
        <Sparkles size={14} className="text-[#7AC4FF]" />
        <span className="hidden sm:inline">AI Coach</span>
      </button>

      {open && (
        <div className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center p-4 sm:p-6"
          style={{ background: 'rgba(1,8,20,0.8)', backdropFilter: 'blur(8px)' }}
          onClick={e => { if (e.target === e.currentTarget) setOpen(false); }}>
          <div className="w-full max-w-md">
            <AICoachModal onClose={() => setOpen(false)} />
          </div>
        </div>
      )}
    </>
  );
}