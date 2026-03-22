import { useState, useRef, useEffect, useCallback } from 'react';
import NavBar from '../../components/NavBar';
import Footer from '../../components/Footer';
import ThemeBackground from '../../components/ThemeBackground';
import { useThemeStyles } from '../../hooks/useThemeStyles';
import api from '../../api';

// ─── Presets ─────────────────────────────────────────────────────────────────
const PRESETS = [
  { label: 'Forest at dusk',    value: 'a quiet forest at dusk with fireflies',         icon: '🌲' },
  { label: 'Ocean shore',       value: 'a calm ocean shore at night with gentle waves',  icon: '🌊' },
  { label: 'Mountain cabin',    value: 'a cozy mountain cabin with a crackling fireplace',icon: '🏔️' },
  { label: 'Floating on clouds',value: 'floating gently through soft pink clouds',       icon: '☁️' },
  { label: 'Japanese garden',   value: 'a serene Japanese garden with a koi pond',       icon: '⛩️' },
  { label: 'Starlit desert',    value: 'a warm desert under a breathtaking starlit sky', icon: '🌌' },
];

const LANGS = [
  { code: 'en', label: 'English' },
  { code: 'ru', label: 'Русский' },
  { code: 'es', label: 'Español' },
];

const DURATIONS = [
  { value: 'short',  label: 'Short',  desc: '~2 min' },
  { value: 'medium', label: 'Medium', desc: '~5 min' },
  { value: 'long',   label: 'Long',   desc: '~9 min' },
];

const SPEEDS = [0.7, 0.85, 1.0];

export default function SleepStoryPage() {
  const ts = useThemeStyles();

  const [theme, setTheme]       = useState('');
  const [duration, setDuration] = useState<'short' | 'medium' | 'long'>('medium');
  const [language, setLanguage] = useState('en');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [story, setStory]       = useState('');

  // TTS state
  const [playing, setPlaying]   = useState(false);
  const [speed, setSpeed]       = useState(1.0);
  const [progress, setProgress] = useState(0); // 0–100

  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const storyWords   = useRef<string[]>([]);
  const wordIndexRef = useRef(0);
  const wakeLockRef  = useRef<WakeLockSentinel | null>(null);

  // SEO
  useEffect(() => {
    document.title = 'AI Sleep Story — Personalized Bedtime Stories | Breathe';
    const desc = document.querySelector('meta[name="description"]') ?? (() => {
      const m = document.createElement('meta');
      m.setAttribute('name', 'description');
      document.head.appendChild(m);
      return m;
    })();
    desc.setAttribute('content', 'Let AI write a personalized sleep story for your chosen scene. Narrated with calming text-to-speech to help you drift off peacefully.');
    const canonical = document.querySelector('link[rel="canonical"]') ?? (() => {
      const l = document.createElement('link');
      l.setAttribute('rel', 'canonical');
      document.head.appendChild(l);
      return l;
    })();
    canonical.setAttribute('href', 'https://breatheonline.app/sleep/story');
  }, []);

  // Stop speech on unmount
  useEffect(() => {
    return () => { window.speechSynthesis?.cancel(); releaseWakeLock(); };
  }, []);

  async function acquireWakeLock() {
    try {
      if ('wakeLock' in navigator) {
        wakeLockRef.current = await navigator.wakeLock.request('screen');
      }
    } catch { /* ignore */ }
  }

  function releaseWakeLock() {
    wakeLockRef.current?.release().catch(() => {});
    wakeLockRef.current = null;
  }

  async function generate() {
    const finalTheme = theme.trim() || PRESETS[0].value;
    setLoading(true);
    setError('');
    setStory('');
    stopSpeech();

    try {
      const { data } = await api.post('/coach/sleep-story', {
        theme: finalTheme,
        duration,
        language,
      });
      setStory(data.story);
    } catch (err: any) {
      setError(err?.response?.data?.error ?? 'Story generation failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  const stopSpeech = useCallback(() => {
    window.speechSynthesis?.cancel();
    utteranceRef.current = null;
    setPlaying(false);
    releaseWakeLock();
  }, []);

  const startSpeech = useCallback(() => {
    if (!story || !window.speechSynthesis) return;

    window.speechSynthesis.cancel();
    storyWords.current = story.split(/\s+/);
    wordIndexRef.current = 0;

    const utter = new SpeechSynthesisUtterance(story);
    utter.rate   = speed;
    utter.pitch  = 0.9;
    utter.volume = 1;

    // Pick a gentle voice if available
    const voices = window.speechSynthesis.getVoices();
    const langCode = language === 'ru' ? 'ru' : language === 'es' ? 'es' : 'en';
    const preferred = voices.find(v => v.lang.startsWith(langCode) && v.name.toLowerCase().includes('female'))
      || voices.find(v => v.lang.startsWith(langCode))
      || voices[0];
    if (preferred) utter.voice = preferred;

    utter.onboundary = (e) => {
      if (e.name === 'word') {
        const total = story.length;
        const pct   = Math.min(100, Math.round((e.charIndex / total) * 100));
        setProgress(pct);
      }
    };

    utter.onend = () => {
      setPlaying(false);
      setProgress(100);
      releaseWakeLock();
    };

    utter.onerror = () => {
      setPlaying(false);
      releaseWakeLock();
    };

    utteranceRef.current = utter;
    window.speechSynthesis.speak(utter);
    setPlaying(true);
    setProgress(0);
    acquireWakeLock();
  }, [story, speed, language]);

  function togglePlay() {
    if (playing) {
      window.speechSynthesis?.pause();
      setPlaying(false);
    } else if (window.speechSynthesis?.paused) {
      window.speechSynthesis.resume();
      setPlaying(true);
    } else {
      startSpeech();
    }
  }

  function changeSpeed(s: number) {
    setSpeed(s);
    if (playing) {
      // Restart with new speed from beginning (Web Speech API doesn't support mid-play rate change)
      stopSpeech();
      setTimeout(() => {
        const utter = new SpeechSynthesisUtterance(story);
        utter.rate   = s;
        utter.pitch  = 0.9;
        utter.volume = 1;
        const voices = window.speechSynthesis.getVoices();
        const langCode = language === 'ru' ? 'ru' : language === 'es' ? 'es' : 'en';
        const preferred = voices.find(v => v.lang.startsWith(langCode) && v.name.toLowerCase().includes('female'))
          || voices.find(v => v.lang.startsWith(langCode));
        if (preferred) utter.voice = preferred;
        utter.onboundary = (e) => {
          if (e.name === 'word') setProgress(Math.min(100, Math.round((e.charIndex / story.length) * 100)));
        };
        utter.onend = () => { setPlaying(false); setProgress(100); releaseWakeLock(); };
        utter.onerror = () => { setPlaying(false); releaseWakeLock(); };
        utteranceRef.current = utter;
        window.speechSynthesis.speak(utter);
        setPlaying(true);
        acquireWakeLock();
      }, 100);
    }
  }

  async function copyStory() {
    try {
      await navigator.clipboard.writeText(story);
    } catch { /* ignore */ }
  }

  const ttsSupported = typeof window !== 'undefined' && 'speechSynthesis' in window;

  return (
    <div className="relative w-full min-h-screen font-montserrat overflow-x-hidden">
      <ThemeBackground />
      <div className="relative z-10 flex flex-col min-h-screen">
        <NavBar />

        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-10 max-w-3xl mx-auto w-full flex flex-col gap-8">

          {/* Header */}
          <div className="text-center flex flex-col gap-2">
            <span className="text-3xl">🌙</span>
            <h1 className="text-2xl sm:text-3xl font-semibold" style={{ color: ts.textPrimary }}>
              AI Sleep Story
            </h1>
            <p className="text-sm" style={{ color: ts.textMuted }}>
              Describe a peaceful scene — AI writes a calming story just for you
            </p>
          </div>

          {/* Builder card */}
          <div className="rounded-2xl p-6 flex flex-col gap-5"
            style={{ background: ts.cardBg, border: `1px solid ${ts.border}` }}>

            {/* Scene input */}
            <div className="flex flex-col gap-2">
              <label className="text-xs tracking-wide uppercase" style={{ color: ts.textMuted }}>
                Scene
              </label>
              <input
                type="text"
                value={theme}
                onChange={e => setTheme(e.target.value)}
                placeholder="e.g. a quiet forest at dusk…"
                maxLength={200}
                className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all"
                style={{
                  background: ts.pageBg,
                  border: `1px solid ${ts.border}`,
                  color: ts.textPrimary,
                }}
              />

              {/* Presets */}
              <div className="flex flex-wrap gap-2 mt-1">
                {PRESETS.map(p => (
                  <button
                    key={p.value}
                    onClick={() => setTheme(p.value)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs transition-all"
                    style={{
                      background: theme === p.value ? `${ts.accent}20` : ts.pageBg,
                      border: `1px solid ${theme === p.value ? ts.accent : ts.border}`,
                      color: theme === p.value ? ts.accentLight : ts.textMuted,
                    }}
                  >
                    <span>{p.icon}</span>
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Duration + Language row */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-xs tracking-wide uppercase" style={{ color: ts.textMuted }}>
                  Duration
                </label>
                <div className="flex gap-1.5">
                  {DURATIONS.map(d => (
                    <button
                      key={d.value}
                      onClick={() => setDuration(d.value as any)}
                      className="flex-1 flex flex-col items-center gap-0.5 py-2 rounded-xl text-xs transition-all"
                      style={{
                        background: duration === d.value ? `${ts.accent}20` : ts.pageBg,
                        border: `1px solid ${duration === d.value ? ts.accent : ts.border}`,
                        color: duration === d.value ? ts.accentLight : ts.textMuted,
                      }}
                    >
                      <span className="font-medium">{d.label}</span>
                      <span className="text-[10px] opacity-70">{d.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs tracking-wide uppercase" style={{ color: ts.textMuted }}>
                  Language
                </label>
                <div className="flex gap-1.5">
                  {LANGS.map(l => (
                    <button
                      key={l.code}
                      onClick={() => setLanguage(l.code)}
                      className="flex-1 py-2 rounded-xl text-xs transition-all"
                      style={{
                        background: language === l.code ? `${ts.accent}20` : ts.pageBg,
                        border: `1px solid ${language === l.code ? ts.accent : ts.border}`,
                        color: language === l.code ? ts.accentLight : ts.textMuted,
                      }}
                    >
                      {l.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Generate button */}
            <button
              onClick={generate}
              disabled={loading}
              className="w-full py-3.5 rounded-xl text-sm font-medium text-white transition-all disabled:opacity-60"
              style={{ background: ts.btnGradient, boxShadow: loading ? 'none' : ts.btnShadow }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Writing your story…
                </span>
              ) : (
                '✨ Generate Story'
              )}
            </button>

            {error && (
              <p className="text-xs text-center" style={{ color: '#FF8A8A' }}>{error}</p>
            )}
          </div>

          {/* Story player */}
          {story && (
            <div className="rounded-2xl flex flex-col gap-4"
              style={{ background: ts.cardBg, border: `1px solid ${ts.border}` }}>

              {/* Player controls */}
              {ttsSupported && (
                <div className="px-5 pt-5 flex flex-col gap-3">
                  {/* Progress bar */}
                  <div className="relative h-1 rounded-full overflow-hidden"
                    style={{ background: `${ts.border}60` }}>
                    <div
                      className="absolute left-0 top-0 h-full rounded-full transition-all duration-300"
                      style={{ width: `${progress}%`, background: ts.btnGradient }}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    {/* Play / Pause + restart */}
                    <div className="flex items-center gap-3">
                      <button
                        onClick={togglePlay}
                        className="w-10 h-10 rounded-full flex items-center justify-center text-white transition-all active:scale-95"
                        style={{ background: ts.btnGradient, boxShadow: ts.btnShadow }}
                      >
                        {playing ? (
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                            <rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" />
                          </svg>
                        ) : (
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M8 5v14l11-7z" />
                          </svg>
                        )}
                      </button>

                      {/* Stop */}
                      <button
                        onClick={stopSpeech}
                        className="w-8 h-8 rounded-full flex items-center justify-center transition-all"
                        style={{ background: ts.pageBg, border: `1px solid ${ts.border}`, color: ts.textMuted }}
                        title="Stop"
                      >
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                          <rect x="4" y="4" width="16" height="16" />
                        </svg>
                      </button>
                    </div>

                    {/* Speed buttons */}
                    <div className="flex items-center gap-1">
                      {SPEEDS.map(s => (
                        <button
                          key={s}
                          onClick={() => changeSpeed(s)}
                          className="px-2.5 py-1 rounded-lg text-xs transition-all"
                          style={{
                            background: speed === s ? `${ts.accent}20` : 'transparent',
                            border: `1px solid ${speed === s ? ts.accent : ts.border}`,
                            color: speed === s ? ts.accentLight : ts.textMuted,
                          }}
                        >
                          {s}×
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Story text */}
              <div className="px-5 pb-2 max-h-72 overflow-y-auto">
                <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: ts.textSecondary }}>
                  {story}
                </p>
              </div>

              {/* Footer actions */}
              <div className="px-5 pb-5 flex items-center gap-2 border-t pt-3"
                style={{ borderColor: `${ts.border}60` }}>
                <button
                  onClick={generate}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs transition-all"
                  style={{ background: ts.pageBg, border: `1px solid ${ts.border}`, color: ts.textMuted }}
                >
                  🔁 New story
                </button>
                <button
                  onClick={copyStory}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs transition-all"
                  style={{ background: ts.pageBg, border: `1px solid ${ts.border}`, color: ts.textMuted }}
                >
                  📋 Copy
                </button>
              </div>
            </div>
          )}

          {/* Tip */}
          <p className="text-xs text-center" style={{ color: ts.textDim }}>
            Tip: use headphones and dim your screen for the best experience
          </p>
        </main>

        <Footer />
      </div>
    </div>
  );
}
