// src/components/GuidancePicker.tsx
import React, { useState, useEffect, useRef } from 'react';
import { useThemeStyles } from '../hooks/useThemeStyles';
import { useTranslation } from 'react-i18next';
import type { GuidanceMode, VoiceGender } from '../hooks/useBreathingGuidance';

export type { GuidanceMode, VoiceGender };

const MODE_ICONS:  Record<GuidanceMode, string> = { silent: '🔇', vibration: '📳', voice: '🎙' };
const MODE_LABELS: Record<GuidanceMode, string> = { silent: 'Silent', vibration: 'Vibration', voice: 'AI Voice' };

const FEMALE_KW = /female|woman|samantha|karen|moira|fiona|victoria|zira|helena|paulina|milena|irina/i;
const MALE_KW   = /male|man|daniel|david|jorge|diego|thomas|alex|fred|yuri/i;
const LANG_MAP: Record<string, string> = { en: 'en-US', ru: 'ru-RU', es: 'es-ES' };
const PREVIEW_TEXT: Record<string, string> = { en: 'Breathe in', ru: 'Вдох', es: 'Inhala' };

interface Props {
  mode:        GuidanceMode;
  voiceGender: VoiceGender;
  onChange:    (mode: GuidanceMode, gender: VoiceGender) => void;
}

export default function GuidancePicker({ mode, voiceGender, onChange }: Props) {
  const ts  = useThemeStyles();
  const { t, i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const ref  = useRef<HTMLDivElement>(null);

  const vibrationSupported = 'vibrate' in navigator;
  const voiceSupported     = 'speechSynthesis' in window;

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const previewVoice = (gender: VoiceGender) => {
    if (!voiceSupported) return;
    window.speechSynthesis.cancel();
    const lang     = i18n.language.slice(0, 2);
    const langCode = LANG_MAP[lang] ?? 'en-US';
    const text     = PREVIEW_TEXT[lang] ?? 'Breathe in';
    const msg      = new SpeechSynthesisUtterance(text);
    msg.lang       = langCode;
    msg.rate       = 0.75;
    msg.pitch      = gender === 'female' ? 1.1 : 0.8;
    msg.volume     = 0.9;
    const doSpeak  = () => {
      const voices     = window.speechSynthesis.getVoices();
      const langVoices = voices.filter(v => v.lang.startsWith(lang));
      const voice = langVoices.find(v =>
        gender === 'female' ? FEMALE_KW.test(v.name) : MALE_KW.test(v.name)
      ) ?? (gender === 'female' ? langVoices[0] : langVoices[1]) ?? langVoices[0];
      if (voice) msg.voice = voice;
      window.speechSynthesis.speak(msg);
    };
    if (window.speechSynthesis.getVoices().length > 0) doSpeak();
    else window.speechSynthesis.onvoiceschanged = doSpeak;
  };

  return (
    <div ref={ref} className="relative flex justify-center">

      {/* ── Pill trigger ──────────────────────────────────────────────────── */}
      <button
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full t-caption transition-all hover:scale-105 active:scale-95"
        style={{
          background:   open ? ts.cardBgHover : ts.cardBg,
          border:       `1px solid ${open ? ts.borderHover : ts.border}`,
          color:        ts.textMuted,
        }}
      >
        <span>{MODE_ICONS[mode]}</span>
        <span>{mode === 'silent' ? t('breathing.guidance.visual') : mode === 'vibration' ? t('breathing.guidance.vibration') : t('breathing.guidance.voice')}</span>
        <span style={{ opacity: 0.5, fontSize: 9 }}>▾</span>
      </button>

      {/* ── Popover ───────────────────────────────────────────────────────── */}
      {open && (
        <div
          className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 z-50 w-56 rounded-2xl overflow-hidden"
          style={{
            background:  ts.cardBg,
            border:      `1px solid ${ts.borderHover}`,
            boxShadow:   '0 -8px 32px rgba(0,0,0,0.45)',
          }}
        >
          {/* top divider glow */}
          <div className="h-px" style={{ background: `linear-gradient(to right, transparent, ${ts.accent}40, transparent)` }} />

          <div className="p-3 flex flex-col gap-1">
            <p className="t-label uppercase tracking-widest px-1 mb-1" style={{ color: ts.textDim }}>
              {t('breathing.guidance.title')}
            </p>

            {/* Mode options */}
            {(['silent', 'vibration', 'voice'] as GuidanceMode[]).map(m => {
              const disabled = (m === 'vibration' && !vibrationSupported) ||
                               (m === 'voice'     && !voiceSupported);
              const active   = mode === m;
              return (
                <button
                  key={m}
                  onClick={() => !disabled && onChange(m, voiceGender)}
                  disabled={disabled}
                  className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left transition-all w-full disabled:opacity-30"
                  style={{
                    background: active ? ts.cardBgHover : 'transparent',
                    border:     `1px solid ${active ? ts.borderHover : 'transparent'}`,
                  }}
                >
                  {/* Radio dot */}
                  <div
                    className="w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center flex-shrink-0"
                    style={{ borderColor: active ? ts.accent : ts.border }}
                  >
                    {active && (
                      <div className="w-1.5 h-1.5 rounded-full" style={{ background: ts.accent }} />
                    )}
                  </div>
                  <span className="t-body">{MODE_ICONS[m]}</span>
                  <div>
                    <p className="t-caption font-medium" style={{ color: active ? ts.textPrimary : ts.textMuted }}>
                      {m === 'silent' ? t('breathing.guidance.visual') : m === 'vibration' ? t('breathing.guidance.vibration') : t('breathing.guidance.voice')}
                    </p>
                    {m === 'vibration' && !vibrationSupported && (
                      <p className="t-label" style={{ color: ts.textDim }}>{t('breathing.guidance.androidOnly')}</p>
                    )}
                    {m === 'voice' && !voiceSupported && (
                      <p className="t-label" style={{ color: ts.textDim }}>{t('breathing.guidance.notSupported')}</p>
                    )}
                  </div>
                </button>
              );
            })}

            {/* Voice gender — only when voice active */}
            {mode === 'voice' && voiceSupported && (
              <div className="mt-1 pt-2 border-t flex flex-col gap-2" style={{ borderColor: ts.border }}>
                <p className="t-label uppercase tracking-widest px-1" style={{ color: ts.textDim }}>
                  {t('breathing.guidance.voiceStyle')}
                </p>
                <div className="flex gap-2">
                  {(['female', 'male'] as VoiceGender[]).map(g => (
                    <button
                      key={g}
                      onClick={() => { onChange(mode, g); previewVoice(g); }}
                      className="flex-1 flex flex-col items-center gap-1 py-2 rounded-xl t-caption transition-all"
                      style={{
                        background: voiceGender === g ? ts.cardBgHover : 'transparent',
                        border:     `1px solid ${voiceGender === g ? ts.borderHover : ts.border}`,
                        color:      voiceGender === g ? ts.textSecondary : ts.textMuted,
                      }}
                    >
                      <span className="t-body">{g === 'female' ? '👩' : '👨'}</span>
                      <span>{g === 'female' ? t('breathing.female') : t('breathing.male')}</span>
                    </button>
                  ))}
                </div>
                <p className="t-label text-center" style={{ color: ts.textDim }}>▶ {t('breathing.guidance.tapToPreview')}</p>
              </div>
            )}

            <button
              onClick={() => setOpen(false)}
              className="mt-2 w-full py-2 rounded-xl t-caption font-medium text-white"
              style={{ background: ts.btnGradient }}
            >
              {t('breathing.guidance.done')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
