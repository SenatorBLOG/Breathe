// src/components/AICoach/AICoachButton.tsx
import React, { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { useThemeStyles } from "../../hooks/useThemeStyles";
import AICoachModal from './AICoachModal';

interface AICoachButtonProps {
  variant?: 'orb' | 'floating';
}

export default function AICoachButton({ variant = 'floating' }: AICoachButtonProps) {
  const ts = useThemeStyles();
  const [open, setOpen] = useState(false);

  // ── Вариант для главной (под сферой) ───────────────────────────────────────
  if (variant === 'orb') {
    return (
      <div className="flex flex-col items-center w-full animate-in fade-in zoom-in-90 duration-700 delay-500 fill-mode-both">
        <style>{`
          @keyframes coachHintBounce {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-5px); }
          }
          .coach-hint-btn { animation: coachHintBounce 3s ease-in-out infinite; }
        `}</style>

        {/* Соединительная линия от сферы */}
        {!open && (
          <div className="w-px h-6 bg-gradient-to-b from-transparent via-current to-transparent opacity-20" 
               style={{ color: ts.accent }} />
        )}

        {!open && (
          <button 
            onClick={() => setOpen(true)}
            className="coach-hint-btn flex items-center gap-2.5 px-6 py-2.5 rounded-full t-caption text-white font-bold uppercase tracking-[0.15em] transition-all hover:scale-105 active:scale-95 shadow-xl"
            style={{
              background: `linear-gradient(135deg, ${ts.accent}, ${ts.accentLight})`,
              boxShadow: `0 10px 30px ${ts.accent}40`
            }}
          >
            <Sparkles size={12} />
            Спросить Коуча
          </button>
        )}

        {open && (
          <div className="w-full max-w-sm mt-4">
            <AICoachModal onClose={() => setOpen(false)} />
          </div>
        )}
      </div>
    );
  }

  // ── Плавающий вариант (для остальных страниц) ──────────────────────────────
  return (
    <>
      <style>{`
        @keyframes pulseGlow {
          0%, 100% { box-shadow: 0 8px 24px ${ts.accent}33; transform: scale(1); }
          50%      { box-shadow: 0 12px 40px ${ts.accent}55; transform: scale(1.03); }
        }
        .animate-pulse-glow { animation: pulseGlow 4s ease-in-out infinite; }
      `}</style>

      <button
        onClick={() => setOpen(true)}
        aria-label="Open AI Coach"
        className="fixed bottom-24 right-6 z-40 flex items-center justify-center w-14 h-14 sm:w-auto sm:px-5 rounded-2xl sm:rounded-full text-white shadow-2xl transition-all hover:-translate-y-1 active:scale-90 animate-pulse-glow"
        style={{ background: ts.accent }}
      >
        <Sparkles size={20} className="sm:mr-2" />
        <span className="hidden sm:inline t-caption font-bold uppercase tracking-wider">AI Coach</span>
      </button>

      {open && (
        <div 
          className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4 sm:p-6 animate-in fade-in duration-300"
          style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(10px)' }}
          onClick={(e) => e.target === e.currentTarget && setOpen(false)}
        >
          <div className="w-full max-w-md shadow-2xl relative">
            {/* Кнопка закрытия для мобилок сверху модалки */}
            <button 
              onClick={() => setOpen(false)}
              className="absolute -top-12 right-0 p-2 text-white/50 hover:text-white sm:hidden"
            >
              Закрыть
            </button>
            <AICoachModal onClose={() => setOpen(false)} />
          </div>
        </div>
      )}
    </>
  );
}