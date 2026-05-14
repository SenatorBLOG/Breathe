// src/components/AICoach/AICoachModal.tsx
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { X, Send, Sparkles, ChevronRight, RotateCcw, ShieldAlert } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import api from '../../api';
import { useThemeStyles } from "../../hooks/useThemeStyles";

// ─── Types & Presets ──────────────────────────────────────────────────────────
interface Technique { key: string; label: string; }
interface Message {
  id: string; role: 'user' | 'coach'; text: string;
  technique?: Technique; done: boolean;
}

const COACH_PRESETS: Record<string, any> = {
  'box': { name: 'Box Breathing', inhale: 4, hold: 4, exhale: 4, pause: 4 },
  '4-7-8': { name: '4-7-8 Breathing', inhale: 4, hold: 7, exhale: 8, pause: 1 },
  'wim-hof': { name: 'Wim Hof Method', inhale: 2, hold: 1, exhale: 2, pause: 1 },
  'coherent': { name: 'Coherent Breathing', inhale: 4, hold: 2, exhale: 6, pause: 2 },
};

// ─── Sub-Components ───────────────────────────────────────────────────────────

const TypingIndicator = () => {
  const ts = useThemeStyles();
  return (
    <div className="flex items-end gap-2 mb-4 animate-in fade-in duration-300">
      <div className="w-8 h-8 rounded-xl flex items-center justify-center shadow-lg"
           style={{ background: `linear-gradient(135deg, ${ts.accent}, ${ts.accentLight})` }}>
        <Sparkles size={14} className="text-white animate-pulse" />
      </div>
      <div className="flex gap-1 px-4 py-3 rounded-2xl rounded-bl-none border"
           style={{ background: `${ts.cardBg}EE`, borderColor: ts.border }}>
        {[0, 1, 2].map(i => (
          <div key={i} className="w-1.5 h-1.5 rounded-full bg-current opacity-40 animate-bounce"
               style={{ color: ts.accent, animationDelay: `${i * 0.15}s` }} />
        ))}
      </div>
    </div>
  );
};

const CoachBubble = ({ message, isLatest, onTry }: { message: Message; isLatest: boolean; onTry: (t: Technique) => void }) => {
  const ts = useThemeStyles();
  const { t } = useTranslation();
  // Имитация печати для последнего сообщения
  const [displayed, setDisplayed] = useState(isLatest ? "" : message.text);
  
  useEffect(() => {
    if (isLatest && displayed.length < message.text.length) {
      const timeout = setTimeout(() => {
        setDisplayed(message.text.slice(0, displayed.length + 1));
      }, 15);
      return () => clearTimeout(timeout);
    }
  }, [displayed, message.text, isLatest]);

  return (
    <div className="flex items-end gap-2 mb-4 animate-in slide-in-from-left-2 duration-300">
      <div className="w-8 h-8 rounded-xl flex-shrink-0 flex items-center justify-center shadow-md"
           style={{ background: `linear-gradient(135deg, ${ts.accent}, ${ts.accentLight})` }}>
        <Sparkles size={14} className="text-white" />
      </div>
      <div className="flex flex-col gap-2 max-w-[85%]">
        <div className="px-4 py-3 rounded-2xl rounded-bl-none t-body leading-relaxed border shadow-sm"
             style={{ background: ts.cardBg, borderColor: ts.border, color: ts.textPrimary }}>
          {displayed}
          {isLatest && displayed.length < message.text.length && (
            <span className="inline-block w-1.5 h-4 ml-1 animate-pulse" style={{ background: ts.accent }} />
          )}
        </div>
        {message.technique && displayed.length === message.text.length && (
          <button 
            onClick={() => onTry(message.technique!)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl t-caption font-bold text-white self-start transition-all hover:scale-105 active:scale-95 shadow-lg"
            style={{ background: ts.accent }}
          >
            ✦ {t('coach.tryTechnique')} {message.technique.label} <ChevronRight size={12} />
          </button>
        )}
      </div>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

export default function AICoachModal({ onClose }: { onClose: () => void }) {
  const ts = useThemeStyles();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [limitData, setLimit] = useState<any>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages([{ id: 'welcome', role: 'coach', text: t('coach.welcome'), done: true }]);
  }, [t]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async (text: string) => {
    if (!text.trim() || loading) return;
    const userMsg = text.trim();
    setInput('');
    setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', text: userMsg, done: true }]);
    setLoading(true);

    try {
      const history = messages.map(m => ({ role: m.role === 'coach' ? 'model' : 'user', text: m.text }));
      const { data } = await api.post('/coach/message', { message: userMsg, history, language: i18n.language.slice(0, 2) });

      setMessages(prev => [...prev, {
        id: Date.now() + '_c',
        role: 'coach',
        text: data.reply,
        technique: data.technique,
        done: true
      }]);
    } catch (err: any) {
      if (err?.response?.status === 429) {
        setLimit(err.response.data);
      } else {
        // Surface a visible error message — silent failure breaks the chat UX
        const errMsg = err?.response?.data?.error
          ?? t('coach.errorGeneric', "Sorry, I couldn't respond just now. Try again in a moment?");
        setMessages(prev => [...prev, {
          id: Date.now() + '_e',
          role: 'coach',
          text: errMsg,
          done: true,
        }]);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full flex flex-col rounded-3xl overflow-hidden border shadow-2xl animate-in zoom-in-95 duration-300"
         style={{ background: ts.cardBg, borderColor: ts.border }}>
      
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: ts.border }}>
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-[#4AE8A0] animate-pulse shadow-[0_0_8px_#4AE8A0]" />
          <span className="t-caption font-bold uppercase tracking-widest" style={{ color: ts.textDim }}>AI Coach</span>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setMessages([{ id: 'w', role: 'coach', text: t('coach.welcome'), done: true }])} 
                  className="p-2 rounded-lg hover:bg-black/5 transition-colors" style={{ color: ts.textDim }}>
            <RotateCcw size={16} />
          </button>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-black/5 transition-colors" style={{ color: ts.textDim }}>
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Chat Area */}
      <div className="h-[350px] overflow-y-auto px-5 py-4 scrollbar-hide">
        {messages.map((msg, i) => (
          msg.role === 'user' ? (
            <div key={msg.id} className="flex justify-end mb-4 animate-in slide-in-from-right-2">
              <div className="px-4 py-3 rounded-2xl rounded-br-none t-body font-medium border"
                   style={{ backgroundColor: `${ts.accent}15`, borderColor: `${ts.accent}30`, color: ts.textPrimary }}>
                {msg.text}
              </div>
            </div>
          ) : (
            <CoachBubble key={msg.id} message={msg} isLatest={i === messages.length - 1} onTry={(tech) => {
              onClose();
              navigate('/breathing', { state: { coachPreset: COACH_PRESETS[tech.key], coachPresetName: tech.label } });
            }} />
          )
        ))}
        {loading && <TypingIndicator />}
        <div ref={bottomRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t" style={{ borderColor: ts.border, background: ts.pageBg }}>
        {limitData ? (
          <div className="p-3 rounded-xl border flex items-center gap-3" style={{ borderColor: '#ff4d4d30', backgroundColor: '#ff4d4d10' }}>
            <ShieldAlert className="text-[#ff4d4d]" size={18} />
            <div className="t-label leading-tight" style={{ color: ts.textPrimary }}>
              <p className="font-bold uppercase tracking-tighter">{t('coach.limit.usedAuth')}</p>
              <p className="opacity-60">
                {t('coach.limit.comeback')} {limitData.hoursUntilReset}{t('coach.limit.comebackHours')} {t('coach.limit.createAccount')}
              </p>
            </div>
          </div>
        ) : (
          <div className="relative flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key !== 'Enter') return;
                if (e.shiftKey || (e as any).isComposing || (e as any).nativeEvent?.isComposing) return;
                e.preventDefault();
                handleSend(input);
              }}
              placeholder={t('coach.placeholder')}
              className="w-full bg-transparent border-2 rounded-2xl px-4 py-3 t-body transition-all focus:outline-none"
              style={{ borderColor: ts.border, color: ts.textPrimary }}
            />
            <button 
              onClick={() => handleSend(input)}
              disabled={!input.trim() || loading}
              className="absolute right-2 p-2 rounded-xl text-white transition-all hover:scale-110 active:scale-95 disabled:opacity-30 disabled:grayscale"
              style={{ background: ts.accent }}
            >
              <Send size={16} />
            </button>
          </div>
        )}
        <p className="t-label text-center mt-3 opacity-30 font-bold uppercase tracking-widest" style={{ color: ts.textDim }}>
          Powered by Gemini AI
        </p>
      </div>
    </div>
  );
}