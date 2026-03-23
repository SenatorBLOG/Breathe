import { useEffect, useCallback } from 'react';

export type GuidanceMode = 'silent' | 'vibration' | 'voice';
export type VoiceGender  = 'female' | 'male';

const PHASE_TEXT: Record<string, Record<string, string>> = {
  en: { inhale: 'Breathe in', hold: 'Hold',     exhale: 'Breathe out', pause: 'Rest'     },
  ru: { inhale: 'Вдох',      hold: 'Задержка', exhale: 'Выдох',       pause: 'Отдых'    },
  es: { inhale: 'Inhala',    hold: 'Mantén',   exhale: 'Exhala',      pause: 'Descansa' },
};

const VIBRATION_PATTERNS: Record<string, number[]> = {
  inhale: [80, 40, 80, 40, 80],
  hold:   [300],
  exhale: [120, 40, 80, 40, 50],
  pause:  [60],
};

const LANG_MAP: Record<string, string> = { en: 'en-US', ru: 'ru-RU', es: 'es-ES' };

const FEMALE_KW = /female|woman|samantha|karen|moira|fiona|victoria|zira|helena|paulina|milena|irina/i;
const MALE_KW   = /male|man|daniel|david|jorge|diego|thomas|alex|fred|yuri/i;

interface Options {
  mode:        GuidanceMode;
  voiceGender: VoiceGender;
  language:    string;
  enabled:     boolean;
}

export function useBreathingGuidance({ mode, voiceGender, language, enabled }: Options) {

  const guidePhase = useCallback((phase: 'inhale' | 'hold' | 'exhale' | 'pause') => {
    if (!enabled || mode === 'silent') return;

    if (mode === 'vibration') {
      if ('vibrate' in navigator) navigator.vibrate(VIBRATION_PATTERNS[phase] ?? [100]);
      return;
    }

    if (mode === 'voice') {
      if (!('speechSynthesis' in window)) return;
      window.speechSynthesis.cancel();

      const lang     = language.slice(0, 2);
      const text     = PHASE_TEXT[lang]?.[phase] ?? PHASE_TEXT.en[phase];
      const langCode = LANG_MAP[lang] ?? 'en-US';

      const msg    = new SpeechSynthesisUtterance(text);
      msg.lang     = langCode;
      msg.rate     = 0.75;
      msg.pitch    = voiceGender === 'female' ? 1.1 : 0.8;
      msg.volume   = 0.9;

      const doSpeak = () => {
        const voices     = window.speechSynthesis.getVoices();
        const langVoices = voices.filter(v => v.lang.startsWith(lang));
        const voice = langVoices.find(v =>
          voiceGender === 'female' ? FEMALE_KW.test(v.name) : MALE_KW.test(v.name)
        ) ?? (voiceGender === 'female' ? langVoices[0] : langVoices[1]) ?? langVoices[0];
        if (voice) msg.voice = voice;
        window.speechSynthesis.speak(msg);
      };

      if (window.speechSynthesis.getVoices().length > 0) {
        doSpeak();
      } else {
        window.speechSynthesis.onvoiceschanged = doSpeak;
      }
    }
  }, [mode, voiceGender, language, enabled]);

  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
      if ('vibrate' in navigator) navigator.vibrate(0);
    };
  }, []);

  return { guidePhase };
}
