// src/components/AICoach/AICoachModal.tsx
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { X, Send, Sparkles, ChevronRight, RotateCcw } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import api from '../../api';

// ─── Types ────────────────────────────────────────────────────────────────────
interface Technique { key: string; label: string; }
interface Message {
  id: string; role: 'user' | 'coach'; text: string;
  technique?: Technique; done: boolean;
}
interface AICoachModalProps { onClose: () => void; }

// ─── Preset map ───────────────────────────────────────────────────────────────
const COACH_PRESETS: Record<string, { inhale: number; hold: number; exhale: number; pause: number; name: string }> = {
  'box':       { name: 'Box Breathing',      inhale: 4, hold: 4, exhale: 4, pause: 4 },
  '4-7-8':     { name: '4-7-8 Breathing',    inhale: 4, hold: 7, exhale: 8, pause: 1 },
  'wim-hof':   { name: 'Wim Hof Method',     inhale: 2, hold: 1, exhale: 2, pause: 1 },
  'coherent':  { name: 'Coherent Breathing', inhale: 4, hold: 2, exhale: 6, pause: 2 },
  'belly':     { name: 'Belly Breathing',    inhale: 4, hold: 0, exhale: 6, pause: 2 },
  'alternate': { name: 'Alternate Nostril',  inhale: 4, hold: 4, exhale: 4, pause: 2 },
};

// ─── Typewriter ───────────────────────────────────────────────────────────────
function useTypewriter(text: string, speed = 16, enabled = true) {
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);
  const idx = useRef(0);
  useEffect(() => {
    if (!enabled) { setDisplayed(text); setDone(true); return; }
    setDisplayed(''); setDone(false); idx.current = 0;
    const iv = setInterval(() => {
      idx.current++;
      setDisplayed(text.slice(0, idx.current));
      if (idx.current >= text.length) { clearInterval(iv); setDone(true); }
    }, speed);
    return () => clearInterval(iv);
  }, [text, speed, enabled]);
  return { displayed, done };
}

// ─── Typing dots ──────────────────────────────────────────────────────────────
function TypingIndicator() {
  return (
    <div className="flex items-end gap-2 mb-3">
      <div className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center"
        style={{ background: 'linear-gradient(135deg,#1A5FCC,#7AC4FF)', boxShadow: '0 0 12px rgba(74,158,255,0.4)' }}>
        <Sparkles size={12} className="text-white" />
      </div>
      <div className="flex items-center gap-1 px-4 py-3 rounded-2xl rounded-bl-sm"
        style={{ background: 'rgba(13,27,51,0.8)', border: '1px solid rgba(30,51,88,0.5)' }}>
        {[0,1,2].map(i => (
          <div key={i} className="w-1.5 h-1.5 rounded-full bg-[#4A9EFF]"
            style={{ animation: `coachDot 1.2s ease-in-out ${i*0.2}s infinite` }} />
        ))}
      </div>
    </div>
  );
}

// ─── Coach bubble ─────────────────────────────────────────────────────────────
function CoachBubble({ message, isLatest, onTryTechnique }: {
  message: Message; isLatest: boolean;
  onTryTechnique: (technique: Technique) => void;
}) {
  const { displayed, done } = useTypewriter(message.text, 16, message.role === 'coach' && isLatest);
  const text = (message.role === 'coach' && isLatest) ? displayed : message.text;

  return (
    <div className="flex items-end gap-2 mb-3">
      <div className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center"
        style={{ background: 'linear-gradient(135deg,#1A5FCC,#7AC4FF)', boxShadow: '0 0 10px rgba(74,158,255,0.35)' }}>
        <Sparkles size={12} className="text-white" />
      </div>
      <div className="flex flex-col gap-2 max-w-[88%]">
        <div className="px-4 py-3 rounded-2xl rounded-bl-sm text-sm leading-relaxed text-[#B8D9FF]"
          style={{ background: 'rgba(13,27,51,0.85)', border: '1px solid rgba(30,51,88,0.5)' }}>
          {text}
          {isLatest && !done && <span className="inline-block w-0.5 h-4 bg-[#4A9EFF] ml-0.5 align-middle animate-pulse" />}
        </div>
        {done && message.technique && (
          <button
            onClick={() => onTryTechnique(message.technique!)}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-white font-medium self-start transition-all hover:scale-105 hover:shadow-[0_0_16px_rgba(74,158,255,0.4)] active:scale-95"
            style={{ background: 'linear-gradient(135deg,#1A5FCC,#3A82F7)' }}>
            ✦ Try {message.technique.label} <ChevronRight size={11} />
          </button>
        )}
      </div>
    </div>
  );
}

function UserBubble({ text }: { text: string }) {
  return (
    <div className="flex justify-end mb-3">
      <div className="px-4 py-3 rounded-2xl rounded-br-sm text-sm text-[#7AC4FF] max-w-[80%] leading-relaxed"
        style={{ background: 'rgba(26,95,204,0.2)', border: '1px solid rgba(42,84,153,0.4)' }}>
        {text}
      </div>
    </div>
  );
}

function LimitBanner({ isAuthenticated, hoursLeft }: { isAuthenticated: boolean; hoursLeft?: number }) {
    const { t } = useTranslation();

  return (
    <div className="mx-0 mb-3 p-4 rounded-2xl border border-[#2A5499]/40 bg-[#0D1B33]/80 flex flex-col gap-3 text-center">
      <p className="text-[#7AC4FF] text-sm font-medium">
        {isAuthenticated ? t('coach.limit.usedAuth') : t('coach.limit.used')}
      </p>
      <p className="text-[#4A7AAA] text-xs leading-relaxed">
        {isAuthenticated
          ? t('coach.limit.comeback') + ` ${hoursLeft ?? 24}` + t('coach.limit.comebackHours')
          : t('coach.limit.createAccount')}
      </p>
      {!isAuthenticated && (
        <div className="flex gap-2">
          <Link to="/signup" className="flex-1 py-2 rounded-xl text-xs text-white font-medium text-center"
            style={{ background: 'linear-gradient(135deg,#1A5FCC,#3A82F7)' }}>
            Create account
          </Link>
          <Link to="/login" className="flex-1 py-2 rounded-xl text-xs text-[#4A9EFF] text-center border border-[#1E3358]/50">
            Sign in
          </Link>
        </div>
      )}
    </div>
  );
}

const SUGGESTION_KEYS = [
  'coach.suggestions.sleep',
  'coach.suggestions.stress',
  'coach.suggestions.energy',
  'coach.suggestions.anxiety',
  'coach.suggestions.focus',
  'coach.suggestions.calm',
] as const;

// ─── Main modal ───────────────────────────────────────────────────────────────
export default function AICoachModal({ onClose }: AICoachModalProps) {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [messages, setMessages] = useState<Message[]>([]);
  // Set welcome message once t() is available
  useEffect(() => {
    setMessages([{ id: 'welcome', role: 'coach', text: t('coach.welcome'), done: false }]);
  }, [t]);
  const [input,        setInput]   = useState('');
  const [loading,      setLoading] = useState(false);
  const [limitData,    setLimit]   = useState<{ reached: boolean; isAuthenticated: boolean; hoursLeft?: number } | null>(null);
  const [messagesLeft, setLeft]    = useState<number | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef  = useRef<HTMLInputElement>(null);

  const history = messages
    .filter(m => m.id !== 'welcome')
    .map(m => ({ role: m.role === 'coach' ? 'model' : 'user', text: m.text }));

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, loading]);
  useEffect(() => { setTimeout(() => inputRef.current?.focus(), 400); }, []);

  // ── Navigate to breathing page with preset ────────────────────────────────
  const handleTryTechnique = useCallback((technique: Technique) => {
    const preset = COACH_PRESETS[technique.key];
    onClose(); // close modal first
    navigate('/breathing', {
      state: {
        coachPreset:     preset
          ? { inhale: preset.inhale, hold: preset.hold, exhale: preset.exhale, pause: preset.pause }
          : undefined,
        coachPresetName: preset?.name ?? technique.label,
      },
    });
  }, [navigate, onClose]);

  const send = useCallback(async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;
    setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', text: trimmed, done: true }]);
    setInput('');
    setLoading(true);
    try {
      const { data } = await api.post('/coach/message', { message: trimmed, history });
      setMessages(prev => [...prev, {
        id: Date.now()+'_c', role: 'coach',
        text: data.reply, technique: data.technique ?? undefined, done: false,
      }]);
      if (data.messagesLeft != null) setLeft(data.messagesLeft);
    } catch (err: any) {
      if (err?.response?.status === 429) {
        const d = err.response.data;
        setLimit({ reached: true, isAuthenticated: !d.isAnonymous, hoursLeft: d.hoursUntilReset });
      } else {
        setMessages(prev => [...prev, {
          id: Date.now()+'_err', role: 'coach',
          text: "Something went wrong. Please try again.", done: false,
        }]);
      }
    } finally { setLoading(false); }
  }, [loading, history]);

  const reset = () => {
    setMessages([{ id: 'welcome', role: 'coach', text: t('coach.welcome'), done: false }]);
    setLimit(null); setLeft(null);
  };

  return (
    <>
      <style>{`
        @keyframes coachExpand {
          from { opacity:0; max-height:0; transform:scaleY(0.95); }
          to   { opacity:1; max-height:560px; transform:scaleY(1); }
        }
        @keyframes coachDot {
          0%,80%,100% { transform:scale(0.6); opacity:0.4; }
          40%          { transform:scale(1);   opacity:1; }
        }
        .coach-expand { animation: coachExpand 0.4s cubic-bezier(0.34,1.2,0.64,1) forwards; transform-origin: top center; }
      `}</style>

      <div className="coach-expand w-full max-w-sm mx-auto mt-4 rounded-3xl overflow-hidden"
        style={{
          background: 'linear-gradient(170deg,rgba(9,17,34,0.97),rgba(5,10,20,0.98))',
          border: '1px solid rgba(42,84,153,0.5)',
          boxShadow: '0 0 60px rgba(74,158,255,0.1), 0 20px 60px rgba(0,0,0,0.5)',
        }}>

        <div className="h-px bg-gradient-to-r from-transparent via-[#4A9EFF]/50 to-transparent" />

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#1E3358]/30">
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg,#1A5FCC,#7AC4FF)', boxShadow: '0 0 16px rgba(74,158,255,0.45)' }}>
                <Sparkles size={14} className="text-white" />
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-[#4AE8A0] border-2 border-[#05080F]" />
            </div>
            <div>
              <p className="text-[#B8D9FF] text-xs font-medium leading-none">AI Breathing Coach</p>
              <p className="text-[#4A7AAA] text-[9px] mt-0.5 flex items-center gap-1">
                <span className="w-1 h-1 rounded-full bg-[#4AE8A0] inline-block" />
                Online · Gemini
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            {messagesLeft !== null && (
              <span className="text-[9px] text-[#4A7AAA] bg-[#0A1525] px-2 py-0.5 rounded-full border border-[#1E3358]/40">
                {messagesLeft} left
              </span>
            )}
            <button onClick={reset} className="text-[#4A7AAA] hover:text-[#4A9EFF] transition-colors p-1">
              <RotateCcw size={11} />
            </button>
            <button onClick={onClose} className="text-[#4A7AAA] hover:text-[#B8D9FF] transition-colors p-1">
              <X size={14} />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="overflow-y-auto px-4 pt-4 pb-2 flex flex-col"
          style={{ maxHeight: 300, scrollbarWidth: 'thin', scrollbarColor: '#1E3358 transparent' }}>
          {messages.map((msg, i) =>
            msg.role === 'user'
              ? <UserBubble key={msg.id} text={msg.text} />
              : <CoachBubble key={msg.id} message={msg} isLatest={i === messages.length - 1}
                  onTryTechnique={handleTryTechnique} />
          )}
          {loading && <TypingIndicator />}
          {messages.length === 1 && !loading && (
            <div className="flex flex-wrap gap-1.5 mt-1 mb-3">
              {SUGGESTION_KEYS.map(key => (
                <button key={key} onClick={() => send(t(key))}
                  className="text-[9px] px-2.5 py-1.5 rounded-xl border border-[#1E3358]/50 text-[#2A5499] hover:border-[#2A5499]/60 hover:text-[#4A9EFF] transition-all">
                  {t(key)}
                </button>
              ))}
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {limitData?.reached && (
          <div className="px-4"><LimitBanner isAuthenticated={limitData.isAuthenticated} hoursLeft={limitData.hoursLeft} /></div>
        )}

        {!limitData?.reached && (
          <div className="px-4 pb-4 pt-2 border-t border-[#1E3358]/25">
            <div className="flex gap-2 items-center">
              <input ref={inputRef} value={input} onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(input); }}}
                placeholder={t('coach.placeholder')}
                maxLength={500} disabled={loading}
                className="flex-1 bg-[#060C1A]/60 border border-[#1E3358]/50 rounded-2xl px-4 py-2.5 text-xs text-[#7AC4FF] placeholder-[#1A2D48] outline-none focus:border-[#2A5499] transition-colors disabled:opacity-50"
              />
              <button onClick={() => send(input)} disabled={loading || !input.trim()}
                className="w-9 h-9 flex-shrink-0 rounded-2xl flex items-center justify-center transition-all hover:scale-105 active:scale-95 disabled:opacity-30"
                style={{ background: 'linear-gradient(135deg,#1A5FCC,#3A82F7)' }}>
                <Send size={12} className="text-white" />
              </button>
            </div>
            <p className="text-[9px] text-[#1A2D48] text-center mt-1.5">Not medical advice</p>
          </div>
        )}
      </div>
    </>
  );
}