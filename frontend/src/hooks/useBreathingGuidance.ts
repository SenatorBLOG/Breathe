import { useEffect, useRef, useCallback } from 'react';

export type GuidanceMode = 'visual' | 'sound' | 'vibration' | 'voice';

interface UseBreathingGuidanceOptions {
  modes: GuidanceMode[];
  enabled: boolean;
  language?: string;
}

export function useBreathingGuidance({ modes, enabled, language = 'en' }: UseBreathingGuidanceOptions) {
  const audioCtxRef = useRef<AudioContext | null>(null);

  const getAudioCtx = useCallback(() => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioCtxRef.current;
  }, []);

  const playTone = useCallback((freq: number, duration: number, volume = 0.25) => {
    if (!modes.includes('sound') || !enabled) return;
    try {
      const ctx = getAudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(volume, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + duration);
    } catch {}
  }, [modes, enabled, getAudioCtx]);

  const vibrate = useCallback((pattern: number | number[]) => {
    if (!modes.includes('vibration') || !enabled) return;
    if ('vibrate' in navigator) {
      navigator.vibrate(pattern);
    }
  }, [modes, enabled]);

  const speak = useCallback((text: string) => {
    if (!modes.includes('voice') || !enabled) return;
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const msg = new SpeechSynthesisUtterance(text);
      msg.rate = 0.75;
      msg.pitch = 0.9;
      msg.volume = 0.8;
      msg.lang = language === 'ru' ? 'ru-RU' : language === 'es' ? 'es-ES' : 'en-US';
      window.speechSynthesis.speak(msg);
    }
  }, [modes, enabled, language]);

  const guidePhase = useCallback((phase: 'inhale' | 'hold' | 'exhale' | 'pause', t: (key: string) => string) => {
    if (!enabled) return;

    const PHASE_CONFIG = {
      inhale: {
        freq: 528,
        duration: 1.5,
        vibration: [80, 40, 80, 40, 80],
        voiceKey: 'breathing.phaseLabels.inhale',
      },
      hold: {
        freq: 396,
        duration: 0.8,
        vibration: [200],
        voiceKey: 'breathing.phaseLabels.hold',
      },
      exhale: {
        freq: 285,
        duration: 1.5,
        vibration: [100, 40, 70, 40, 40],
        voiceKey: 'breathing.phaseLabels.exhale',
      },
      pause: {
        freq: 174,
        duration: 0.5,
        vibration: [50],
        voiceKey: 'breathing.phaseLabels.rest',
      },
    };

    const cfg = PHASE_CONFIG[phase];
    playTone(cfg.freq, cfg.duration);
    vibrate(cfg.vibration);
    speak(t(cfg.voiceKey));
  }, [enabled, playTone, vibrate, speak]);

  useEffect(() => {
    return () => {
      window.speechSynthesis?.cancel();
      navigator.vibrate?.(0);
    };
  }, []);

  return { guidePhase, playTone, vibrate, speak };
}
