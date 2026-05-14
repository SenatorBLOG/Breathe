import React, { useCallback, useMemo, useState, useRef, useEffect } from 'react';
import NavBar from '../components/NavBar';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useThemeStyles } from '../hooks/useThemeStyles';
import { useTheme } from '../contexts/ThemeContext';
import { useBreathingGuidance } from '../hooks/useBreathingGuidance';
import { type GuidanceMode, type VoiceGender } from '../components/GuidancePicker';
import AmbientSoundPlayer from '../components/AmbientSoundPlayer';
import { scheduleStreakReminder, requestPushPermission, getPushPermission } from '../utils/pushNotifications';
import { CoachOrb, Phase } from '../components/AICoach/CoachOrb';
import { VideoBackground } from '../components/VideoBackground';
import api from '../api';
import { toast } from 'sonner';
import Footer from '../components/Footer';
import { SessionFeedbackModal } from '../components/SessionFeedbackModal';
import { Wind, Timer, Zap, Waves, Moon, VolumeX, Vibrate, Mic, User, Settings, X, ChevronDown } from 'lucide-react';
import ThemeBackground from '../components/ThemeBackground';
import PageSEO from '../components/PageSEO';

const FEEDBACK_AFTER_CYCLES = 3;

interface Session {
  _id: string; sessionDate: string; moodBefore: number; moodAfter: number;
  focusLevel: number; stressLevel: number; breathingDepth: number;
  calmnessScore: number; distractionCount: number; timeOfDay: string;
  noiseLevel: string; sessionLength: number; cycles: number; notes?: string;
}

interface PhaseDurations { inhale: number; hold: number; exhale: number; pause: number; }

// ─── Stat pill ───────────────────────────────────────────────────────────────
function StatPill({ icon, label, value, dim = false }: {
  icon: React.ReactNode; label: string; value: string; dim?: boolean;
}) {
  const ts = useThemeStyles();
  return (
    <div
      className="flex items-center gap-2 px-3 py-2 rounded-2xl backdrop-blur-sm border transition-all duration-500"
      style={{
        backgroundColor: ts.cardBg,
        borderColor: ts.border,
        opacity: dim ? 0.35 : 1,
        boxShadow: dim ? 'none' : '0 0 20px rgba(0,0,0,0.18)',
      }}>
      <span style={{ color: ts.accent }}>{icon}</span>
      <div className="flex flex-col leading-none">
        <span className="t-body sm:text-base font-medium tabular-nums" style={{ color: ts.textSecondary }}>
          {value}
        </span>
        <span className="t-label uppercase tracking-widest mt-0.5" style={{ color: ts.textMuted }}>
          {label}
        </span>
      </div>
    </div>
  );
}

function fmtTime(sec: number) {
  return `${Math.floor(sec / 60).toString().padStart(2, "0")}:${(sec % 60).toString().padStart(2, "0")}`;
}

// ─── Draggable phase bar ─────────────────────────────────────────────────────
const PHASE_META: Record<keyof PhaseDurations, { label: string; color: string; glow: string }> = {
  inhale: { label: "Inhale",  color: "#3A82F7", glow: "rgba(58,130,247,0.5)"  },
  hold:   { label: "Hold",    color: "#7AC4FF", glow: "rgba(122,196,255,0.4)" },
  exhale: { label: "Exhale",  color: "#1A5FCC", glow: "rgba(26,95,204,0.5)"  },
  pause:  { label: "Rest",    color: "#0F4A8E", glow: "rgba(15,74,142,0.4)"  },
};
const BAR_MIN = 1; const BAR_MAX = 10; const BAR_H = 120;

function DraggablePhaseBar({ phaseKey, value, onChange, isActivePhase }: {
  phaseKey: keyof PhaseDurations; value: number; onChange: (v: number) => void; isActivePhase: boolean;
}) {
  const ts = useThemeStyles();
  const { t } = useTranslation();
  const meta = PHASE_META[phaseKey];
  const phaseLabel: Record<keyof PhaseDurations, string> = {
    inhale: t('breathing.phaseLabels.inhale'),
    hold:   t('breathing.phaseLabels.hold'),
    exhale: t('breathing.phaseLabels.exhale'),
    pause:  t('breathing.phaseLabels.rest'),
  };
  const dragging = useRef(false);
  const startY   = useRef(0);
  const startVal = useRef(value);
  const PX       = BAR_H / (BAR_MAX - BAR_MIN);

  const onStart = (clientY: number) => {
    dragging.current = true; startY.current = clientY; startVal.current = value;
    document.body.style.userSelect = "none"; document.body.style.cursor = "ns-resize";
  };
  const onMove = useCallback((clientY: number) => {
    if (!dragging.current) return;
    onChange(Math.round(Math.max(BAR_MIN, Math.min(BAR_MAX, startVal.current + (startY.current - clientY) / PX))));
  }, [onChange, PX]);
  const onEnd = () => { dragging.current = false; document.body.style.userSelect = ""; document.body.style.cursor = ""; };

  useEffect(() => {
    const mm = (e: MouseEvent) => onMove(e.clientY);
    const tm = (e: TouchEvent) => { if (!dragging.current) return; e.preventDefault(); onMove(e.touches[0].clientY); };
    window.addEventListener("mousemove", mm); window.addEventListener("mouseup", onEnd);
    window.addEventListener("touchmove", tm, { passive: false }); window.addEventListener("touchend", onEnd);
    return () => {
      window.removeEventListener("mousemove", mm); window.removeEventListener("mouseup", onEnd);
      window.removeEventListener("touchmove", tm); window.removeEventListener("touchend", onEnd);
    };
  }, [onMove]);

  const fillH = Math.round(((value - BAR_MIN) / (BAR_MAX - BAR_MIN)) * (BAR_H - 12)) + 12;

  return (
    <div className="flex flex-col items-center gap-2 select-none flex-1">
      <span className={`t-caption font-medium tabular-nums transition-colors duration-200 ${isActivePhase ? "text-white" : ""}`} style={{ color: isActivePhase ? ts.textPrimary : ts.textMuted }}>
        {value}s
      </span>
      <div
        role="slider"
        tabIndex={0}
        aria-label={`${phaseLabel[phaseKey]} duration`}
        aria-valuemin={BAR_MIN}
        aria-valuemax={BAR_MAX}
        aria-valuenow={value}
        aria-valuetext={`${value} seconds`}
        className="relative w-full rounded-xl cursor-ns-resize touch-none overflow-hidden focus-visible:outline focus-visible:outline-2 focus-visible:outline-white/70 focus-visible:outline-offset-2"
        style={{ height: BAR_H, background: ts.cardBg, border: `1px solid ${ts.border}` }}
        onMouseDown={e => { e.preventDefault(); onStart(e.clientY); }}
        onTouchStart={e => { e.preventDefault(); onStart(e.touches[0].clientY); }}
        onKeyDown={e => {
          if (e.key === 'ArrowUp'   || e.key === 'ArrowRight') { e.preventDefault(); onChange(Math.min(BAR_MAX, value + 1)); }
          if (e.key === 'ArrowDown' || e.key === 'ArrowLeft')  { e.preventDefault(); onChange(Math.max(BAR_MIN, value - 1)); }
          if (e.key === 'Home') { e.preventDefault(); onChange(BAR_MIN); }
          if (e.key === 'End')  { e.preventDefault(); onChange(BAR_MAX); }
        }}
      >
        <div className="absolute bottom-0 left-0 right-0 rounded-xl transition-[height] duration-150"
          style={{
            height: fillH,
            background: isActivePhase ? `linear-gradient(to top, ${meta.color}, ${meta.color}88)` : `linear-gradient(to top, ${meta.color}55, ${meta.color}18)`,
            boxShadow: isActivePhase ? `0 -2px 24px ${meta.glow}` : "none",
          }}
        />
        <div className="absolute left-1/2 -translate-x-1/2 w-7 h-1 rounded-full transition-all duration-150"
          style={{ bottom: fillH - 7, background: isActivePhase ? "rgba(255,255,255,0.55)" : "rgba(255,255,255,0.12)" }} />
      </div>
      <span className={`t-label tracking-widest uppercase transition-colors duration-200 ${isActivePhase ? "" : ""}`} style={{ color: isActivePhase ? ts.textSecondary : ts.textMuted }}>
        {phaseLabel[phaseKey]}
      </span>
    </div>
  );
}

function PresetPill({ name, pattern, onApply, current }: {
  name: string; pattern: PhaseDurations; onApply: (p: PhaseDurations) => void; current: PhaseDurations;
}) {
  const ts = useThemeStyles();
  const active = JSON.stringify(pattern) === JSON.stringify(current);
  return (
    <button
      onClick={() => onApply(pattern)}
      className="flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl border transition-all duration-200"
      style={{
        background: active ? ts.cardBgHover : ts.cardBg,
        borderColor: active ? ts.borderHover : ts.border,
        boxShadow: active ? `0 0 12px ${ts.accent}20` : 'none',
      }}
    >
      <span className="t-label font-medium" style={{ color: active ? ts.textSecondary : ts.textMuted }}>
        {name}
      </span>
      <span className="t-label" style={{ color: ts.textDim }}>
        {pattern.inhale}-{pattern.hold}-{pattern.exhale}-{pattern.pause}
      </span>
    </button>
  );
}

// ─── Guidance meta (labels resolved via hook inside component) ────────────────
const GUIDANCE_META_STATIC: Record<GuidanceMode, { icon: React.ReactNode; color: string; glow: string; tKey: string }> = {
  silent:    { icon: <VolumeX size={18} />,  color: '#4A9EFF', glow: 'rgba(74,158,255,0.3)',   tKey: 'breathing.guidance.visual'    },
  vibration: { icon: <Vibrate size={18} />,  color: '#4AE8A0', glow: 'rgba(74,232,160,0.3)',  tKey: 'breathing.guidance.vibration' },
  voice:     { icon: <Mic size={18} />,      color: '#7AC4FF', glow: 'rgba(122,196,255,0.3)', tKey: 'breathing.guidance.voice'     },
};

// ─── Stat ring (SVG arc progress, theme-aware) ───────────────────────────────
const RING_SIZE = 72;
const RING_STROKE = 4.5;

function StatRing({ value, max, unit, label, color, glow }: {
  color: string; glow: string; value: number; max: number; unit: string; label: string;
}) {
  const r        = (RING_SIZE - RING_STROKE) / 2;
  const circ     = 2 * Math.PI * r;
  const pct      = value > 0 ? Math.min(value / max, 1) : 0;
  const filled   = circ * pct;
  const hasValue = value > 0;

  return (
    <div className="flex flex-col items-center gap-2 flex-1 select-none">
      <div className="relative" style={{ width: RING_SIZE, height: RING_SIZE }}>
        <svg width={RING_SIZE} height={RING_SIZE} style={{ transform: 'rotate(-90deg)', overflow: 'visible' }}>
          {/* background track */}
          <circle
            cx={RING_SIZE / 2} cy={RING_SIZE / 2} r={r}
            fill="none" stroke={`${color}1A`} strokeWidth={RING_STROKE}
          />
          {/* progress arc */}
          {hasValue && (
            <circle
              cx={RING_SIZE / 2} cy={RING_SIZE / 2} r={r}
              fill="none" stroke={color}
              strokeWidth={RING_STROKE} strokeLinecap="round"
              strokeDasharray={`${filled} ${circ - filled}`}
              style={{
                filter: `drop-shadow(0 0 5px ${glow})`,
                transition: 'stroke-dasharray 1.4s cubic-bezier(0.4,0,0.2,1)',
              }}
            />
          )}
        </svg>
        {/* centre value */}
        <div className="absolute inset-0 flex flex-col items-center justify-center leading-none pointer-events-none">
          <span
            className="font-bold tabular-nums"
            style={{
              fontSize: value >= 100 ? 13 : 16,
              color: hasValue ? color : 'rgba(74,96,128,0.28)',
              textShadow: hasValue ? `0 0 14px ${glow}` : 'none',
              transition: 'color 0.6s, text-shadow 0.6s',
            }}
          >
            {value}
          </span>
          {unit && (
            <span
              className="tracking-wider uppercase mt-0.5"
              style={{
                fontSize: 8,
                fontWeight: 600,
                color: hasValue ? `${color}99` : 'rgba(74,96,128,0.18)',
                transition: 'color 0.6s',
              }}
            >
              {unit}
            </span>
          )}
        </div>
      </div>
      <span
        className="t-label uppercase tracking-[0.1em] text-center whitespace-nowrap"
        style={{ color: 'rgba(74,96,128,0.52)' }}
      >
        {label}
      </span>
    </div>
  );
}

export default function BreathingPage() {
  const { t, i18n } = useTranslation();
  const ts = useThemeStyles();
  const { theme } = useTheme();
  const [isActive, setIsActive] = useState(false);
  const [guidanceMode, setGuidanceMode] = useState<GuidanceMode>(
    () => (localStorage.getItem('breathe_guidance_mode') as GuidanceMode) || 'silent'
  );
  const [voiceGender, setVoiceGender] = useState<VoiceGender>(
    () => (localStorage.getItem('breathe_voice_gender') as VoiceGender) || 'female'
  );
  const handleGuidanceChange = (mode: GuidanceMode, gender: VoiceGender) => {
    setGuidanceMode(mode);
    setVoiceGender(gender);
    localStorage.setItem('breathe_guidance_mode', mode);
    localStorage.setItem('breathe_voice_gender', gender);
  };
  const navigate = useNavigate();
  const location = useLocation();
  const [phaseDurations, setPhaseDurations] = useState<PhaseDurations>(() => {
    const state = location.state as { coachPreset?: PhaseDurations } | null;
    return state?.coachPreset ?? { inhale: 4, hold: 2, exhale: 5, pause: 3 };
  });
  const [coachPresetName, setCoachPresetName] = useState<string | null>(() => {
    const state = location.state as { coachPresetName?: string } | null;
    return state?.coachPresetName ?? null;
  });
  const [cycles, setCycles] = useState(0);
  const [currentDuration, setCurrentDuration] = useState(0);
  const [totalStats, setTotalStats] = useState({ totalSessions: 0, totalMinutes: 0, streak: 0 });
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [pendingPayload, setPendingPayload] = useState<any | null>(null);
  const savedClientIdsRef = useRef(new Set<string>());
  const [phase, setPhase] = useState<Phase | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const wasActiveRef = useRef(isActive);
  const feedbackShownRef = useRef(false);

  const videos = [
    "/videos/med-01.mp4","/videos/med-02.mp4","/videos/med-03.mp4",
    "/videos/med-04.mp4","/videos/med-05.mp4","/videos/med-06.mp4","/videos/med-07.mp4",
  ];

  const { guidePhase } = useBreathingGuidance({
    mode:        guidanceMode,
    voiceGender: voiceGender,
    enabled:     isActive,
    language:    i18n.language,
  });

  const handlePhaseChange = useCallback((p: Phase) => {
    setPhase(p);
    if (p && isActive) {
      guidePhase(p as 'inhale' | 'hold' | 'exhale' | 'pause');
    }
  }, [guidePhase, isActive]);
  const desiredPlaySeconds = useMemo(() => {
    const t = phaseDurations.inhale + phaseDurations.hold + phaseDurations.exhale + phaseDurations.pause;
    return t / 2;
  }, [phaseDurations]);

  const calcCircle = () => Math.round(Math.max(Math.min(Math.min(window.innerWidth, window.innerHeight) * 0.46, 500), 160));
  const [circleSize, setCircleSize] = useState(calcCircle);
  useEffect(() => {
    const r = () => setCircleSize(calcCircle());
    window.addEventListener("resize", r);
    return () => window.removeEventListener("resize", r);
  }, []);

  const calculateStreak = (sessions: Session[]) => {
    if (!sessions.length) return 0;
    const today = new Date().toDateString();
    if (!sessions.some(s => new Date(s.sessionDate).toDateString() === today)) return 0;
    const dates = [...new Set(sessions.map(s => new Date(s.sessionDate).toDateString()))].sort(
      (a, b) => new Date(b).getTime() - new Date(a).getTime()
    );
    let streak = 1, cur = new Date(); cur.setDate(cur.getDate() - 1);
    while (dates.includes(cur.toDateString())) { streak++; cur.setDate(cur.getDate() - 1); }
    return streak;
  };

  const fetchStats = async () => {
    try {
      if (!localStorage.getItem('token')) return;
      const { data } = await api.get<Session[]>("/sessions");
      setTotalStats({ totalSessions: data.length, totalMinutes: Math.round(data.reduce((s, x) => s + x.sessionLength, 0)), streak: calculateStreak(data) });
    } catch {}
  };
  useEffect(() => { fetchStats(); }, []);

  useEffect(() => {
    let iv: ReturnType<typeof setInterval> | null = null;
    if (isActive) {
      if (!startTimeRef.current) startTimeRef.current = Date.now();
      iv = setInterval(() => { if (startTimeRef.current) setCurrentDuration(Math.floor((Date.now() - startTimeRef.current) / 1000)); }, 1000);
    }
    return () => { if (iv) clearInterval(iv); };
  }, [isActive]);

  const TECHNIQUE_LABELS = t('journal.techniqueLabels', { returnObjects: true }) as Record<string, string>;

  const triggerNLPAnalysis = async (sessionId: string) => {
    try {
      const { data } = await api.post(`/nlp/analyze/${sessionId}`);
      if (data?.nlp?.suggestedTechnique) {
        const label = TECHNIQUE_LABELS[data.nlp.suggestedTechnique] ?? data.nlp.suggestedTechnique;
        toast.info(t('breathing.basedOnNotes', { technique: label }), {
          description: data.nlp.oneLineSummary ?? undefined,
          duration: 8000,
        });
      }
    } catch { /* silent — NLP is non-critical */ }
  };

  const saveSession = async (payload: any) => {
    if (!localStorage.getItem('token')) {
      toast(t('breathing.notSaved'), {
        description: t('breathing.notSavedDesc'),
        action: { label: t('auth.signInArrow'), onClick: () => navigate('/login') },
        duration: 6000,
      });
      return;
    }
    try {
      const cid = payload?.clientId;
      if (cid && savedClientIdsRef.current.has(cid)) return;
      if (cid) savedClientIdsRef.current.add(cid);
      const { data } = await api.post("/sessions", payload);
      toast.success(t('breathing.sessionSaved'));
      setCycles(0); setCurrentDuration(0); fetchStats();
      if (payload.notes?.trim() && data?._id) {
        triggerNLPAnalysis(data._id); // fire-and-forget
      }
    } catch {
      const cid = payload?.clientId;
      if (cid) savedClientIdsRef.current.delete(cid);
      toast.error(t('breathing.failedToSave'));
    }
  };

  useEffect(() => {
    if (cycles === 1 && getPushPermission() === 'default') {
      setTimeout(() => requestPushPermission(), 2000);
    }
  }, [cycles]);

  useEffect(() => {
    if (isActive) {
      startTimeRef.current = Date.now();
      feedbackShownRef.current = false;
    } else if (wasActiveRef.current && startTimeRef.current) {
      const sessionLength = Math.round(((Date.now() - startTimeRef.current) / 60000) * 10) / 10 || 0.1;
      const cid = `c_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      const base = {
        sessionDate: new Date().toISOString(),
        moodBefore: 5, moodAfter: 5, focusLevel: 5, stressLevel: 5,
        breathingDepth: 5, calmnessScore: 5, distractionCount: 0,
        timeOfDay: new Date().toLocaleTimeString([], { hour12: false }),
        noiseLevel: "Quiet", sessionLength, cycles,
        notes: "", clientId: cid,
      };

      if (cycles >= FEEDBACK_AFTER_CYCLES) {
        savedClientIdsRef.current.delete(cid);
        setPendingPayload({ ...base, feedbackSubmitted: false });
        setFeedbackOpen(true);
      } else {
        saveSession({ ...base, feedbackSubmitted: true });
      }

      startTimeRef.current = null;
    }
    wasActiveRef.current = isActive;
  }, [isActive]);

  const presets: { name: string; pattern: PhaseDurations; coachKey?: string }[] = [
    { name: t('breathing.presetNames.box'),      pattern: { inhale: 4, hold: 4, exhale: 4, pause: 4 }, coachKey: "box" },
    { name: t('breathing.presetNames.478'),      pattern: { inhale: 4, hold: 7, exhale: 8, pause: 1 }, coachKey: "4-7-8" },
    { name: t('breathing.presetNames.calm'),     pattern: { inhale: 4, hold: 2, exhale: 6, pause: 2 }, coachKey: "coherent" },
    { name: t('breathing.presetNames.energize'), pattern: { inhale: 6, hold: 0, exhale: 2, pause: 1 }, coachKey: "wim-hof" },
    { name: t('breathing.presetNames.wimHof'),   pattern: { inhale: 2, hold: 1, exhale: 2, pause: 1 }, coachKey: "wim-hof" },
    { name: t('breathing.presetNames.belly'),    pattern: { inhale: 4, hold: 0, exhale: 6, pause: 2 }, coachKey: "belly" },
    { name: t('breathing.presetNames.alternate'),pattern: { inhale: 4, hold: 4, exhale: 4, pause: 2 }, coachKey: "alternate" },
  ];

  return (
    <div className="relative flex flex-col min-h-screen font-montserrat">
      {/* Screen-reader live region — announces phase changes when voice guidance is off */}
      <div
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {isActive && phase
          ? `${phase.charAt(0).toUpperCase() + phase.slice(1)} — ${phaseDurations[phase as keyof typeof phaseDurations]} seconds`
          : ''}
      </div>
      <style>{`
        @keyframes fadeInUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeIn   { from{opacity:0} to{opacity:1} }
        @keyframes slideUp  { from{opacity:0;transform:translateY(28px)} to{opacity:1;transform:translateY(0)} }
        .stat-in { animation: fadeInUp 0.6s ease forwards; }
      `}</style>

      <PageSEO
        title={t('breathing.seoTitle')}
        description={t('breathing.seoDesc')}
        canonical="/breathing"
      />
      <ThemeBackground />
      <VideoBackground videoFiles={videos} isActive={isActive} targetOpacity={0.55} playbackRate={1} crossfadeSeconds={2.0} pauseBetweenVideos={1.8} brightness={1.05} phase={phase} desiredPlaySeconds={desiredPlaySeconds} maxSpeed={1.2} />
      {theme !== 'day' && (
        <div className="fixed inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.72) 100%)" }} />
      )}

      <div className="relative z-50"><NavBar /></div>

      <section
        className="relative z-10 flex flex-col items-center justify-center gap-4 sm:gap-5 px-4"
        style={{ minHeight: "calc(100vh - 56px)" }}
      >
        <div className={`flex gap-3 transition-opacity duration-500 ${isActive ? "opacity-100" : "opacity-30"}`}>
          <div className="stat-in" style={{ animationDelay: "0.1s", opacity: 0 }}>
            <StatPill icon={<Timer size={12} />} label={t('breathing.session')} value={fmtTime(currentDuration)} dim={!isActive} />
          </div>
          <div className="stat-in" style={{ animationDelay: "0.2s", opacity: 0 }}>
            <StatPill icon={<Wind size={12} />} label={t("breathing.cycles")} value={String(cycles)} dim={!isActive} />
          </div>
        </div>

        <div className="flex items-center justify-center" style={{ width: circleSize * 1.28, height: circleSize * 1.28 }}>
          <CoachOrb
            isActive={isActive}
            phaseDurations={phaseDurations}
            onCycleComplete={() => setCycles(c => c + 1)}
            onPhaseChange={handlePhaseChange}
            onToggle={() => setIsActive(a => !a)}
            size={circleSize}
            glowIntensity={1.0}
          />
        </div>

        {/* ── Start / Pause ──────────────────────────────────────────────────── */}
        <button
          onClick={() => setIsActive(a => !a)}
          className="w-full max-w-sm py-3.5 rounded-full text-white t-body font-medium tracking-wide flex items-center justify-center gap-2.5 transition-all duration-200 hover:opacity-90 active:scale-[0.98]"
          style={{ background: ts.btnGradient, boxShadow: ts.btnShadow }}
        >
          {isActive ? (
            <><svg width="12" height="14" viewBox="0 0 12 14" fill="white"><rect x="0" y="0" width="4" height="14" rx="1.5"/><rect x="8" y="0" width="4" height="14" rx="1.5"/></svg>{t('breathing.pause')}</>
          ) : (
            <><svg width="11" height="13" viewBox="0 0 12 14" fill="white"><path d="M1 1l10 6L1 13V1z"/></svg>{cycles > 0 ? t('breathing.resume') : t('breathing.start')}</>
          )}
        </button>

        {/* ── Settings trigger pill ─────────────────────────────────────── */}
        <button
          onClick={() => setSettingsOpen(true)}
          className="w-full max-w-sm flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-200 active:scale-[0.98] hover:opacity-80"
          style={{
            background: ts.cardBg,
            border: `1px solid ${ts.border}`,
            backdropFilter: 'blur(20px)',
            boxShadow: '0 4px 24px rgba(0,0,0,0.28)',
          }}
        >
          <Settings size={14} style={{ color: ts.textMuted, flexShrink: 0 }} />
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <span className="t-label uppercase tracking-[0.18em]" style={{ color: ts.textSecondary }}>
              {t(GUIDANCE_META_STATIC[guidanceMode].tKey)}
            </span>
            <span style={{ color: ts.textDim, fontSize: 10 }}>·</span>
            <span className="t-label tabular-nums" style={{ color: ts.textMuted }}>
              {phaseDurations.inhale}-{phaseDurations.hold}-{phaseDurations.exhale}-{phaseDurations.pause}
            </span>
            {totalStats.streak > 0 && (
              <>
                <span style={{ color: ts.textDim, fontSize: 10 }}>·</span>
                <span className="t-label font-semibold" style={{ color: ts.accent }}>
                  🔥 {totalStats.streak}
                </span>
              </>
            )}
          </div>
          <ChevronDown size={13} style={{ color: ts.textDim, flexShrink: 0 }} />
        </button>
      </section>

      {/* ── Settings bottom sheet ──────────────────────────────────────────────── */}
      {/* Backdrop — conditional */}
      {settingsOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          style={{ animation: 'fadeIn 0.18s ease' }}
          onClick={() => setSettingsOpen(false)}
        />
      )}
      {/* Sheet — always mounted so AmbientSoundPlayer audio context survives close */}
      <div
        className="fixed bottom-0 left-0 right-0 z-50 flex justify-center px-4 pb-4 sm:items-center sm:inset-0 sm:pb-0"
        style={{ pointerEvents: 'none', display: settingsOpen ? 'flex' : 'none' }}
      >
            <div
              className="w-full max-w-sm rounded-3xl overflow-hidden"
              style={{
                pointerEvents: 'auto',
                background: ts.cardBg,
                border: `1px solid ${ts.borderHover}`,
                backdropFilter: 'blur(40px)',
                boxShadow: `0 -8px 60px rgba(0,0,0,0.25), inset 0 1px 0 ${ts.border}`,
                animation: 'slideUp 0.26s cubic-bezier(0.22,1,0.36,1)',
              }}
            >
              {/* drag handle */}
              <div className="flex justify-center pt-3 pb-1 sm:hidden">
                <div className="w-9 h-1 rounded-full" style={{ background: ts.border }} />
              </div>

              {/* header */}
              <div className="flex items-center justify-between px-5 pt-4 pb-3.5">
                <span className="t-label uppercase tracking-[0.22em] font-semibold" style={{ color: ts.textMuted }}>
                  {t('breathing.sessionSettings')}
                </span>
                <button
                  onClick={() => setSettingsOpen(false)}
                  className="flex items-center justify-center w-7 h-7 rounded-full transition-opacity hover:opacity-60"
                  style={{ background: ts.cardBgHover, color: ts.textMuted }}
                >
                  <X size={13} />
                </button>
              </div>

              <div className="mx-5 h-px" style={{ background: `linear-gradient(90deg,transparent,${ts.border},transparent)` }} />

              {/* guidance */}
              <div className="px-5 pt-4 pb-3">
                <p className="t-label uppercase tracking-[0.22em] mb-3" style={{ color: ts.textDim }}>{t('breathing.guidanceSection')}</p>
                <div className="flex gap-2">
                  {(['silent', 'vibration', 'voice'] as GuidanceMode[]).map(m => {
                    const gm = GUIDANCE_META_STATIC[m];
                    const active = guidanceMode === m;
                    const disabled = (m === 'vibration' && !('vibrate' in navigator)) ||
                                     (m === 'voice' && !('speechSynthesis' in window));
                    return (
                      <button
                        key={m}
                        onClick={() => !disabled && handleGuidanceChange(m, voiceGender)}
                        disabled={disabled}
                        className="flex-1 flex flex-col items-center gap-1.5 py-3 rounded-2xl border transition-all duration-200 disabled:opacity-25"
                        style={{
                          background: active ? `${gm.color}18` : ts.cardBgHover,
                          borderColor: active ? `${gm.color}45` : ts.border,
                          boxShadow: active ? `0 0 20px ${gm.glow}, inset 0 1px 0 rgba(255,255,255,0.05)` : 'none',
                        }}
                      >
                        <span style={{ color: active ? gm.color : ts.textMuted }}>{gm.icon}</span>
                        <span className="t-label font-semibold uppercase tracking-[0.07em]"
                          style={{ color: active ? gm.color : ts.textMuted }}>
                          {t(gm.tKey)}
                        </span>
                        {active && (
                          <div className="w-1 h-1 rounded-full"
                            style={{ background: gm.color, boxShadow: `0 0 5px ${gm.color}` }} />
                        )}
                      </button>
                    );
                  })}
                </div>
                {guidanceMode === 'voice' && 'speechSynthesis' in window && (
                  <div className="flex gap-2 mt-2">
                    {(['female', 'male'] as VoiceGender[]).map(g => (
                      <button
                        key={g}
                        onClick={() => handleGuidanceChange('voice', g)}
                        className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-xl border t-label transition-all"
                        style={{
                          background: voiceGender === g ? `${ts.accentLight}18` : ts.cardBgHover,
                          borderColor: voiceGender === g ? `${ts.accentLight}55` : ts.border,
                          color: voiceGender === g ? ts.accentLight : ts.textMuted,
                        }}
                      >
                        <User size={16} />
                        <span>{g === 'female' ? t('breathing.female') : t('breathing.male')}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="mx-5 h-px" style={{ background: `linear-gradient(90deg,transparent,${ts.border},transparent)` }} />

              {/* ambient */}
              <div className="px-5 py-4">
                <p className="t-label uppercase tracking-[0.22em] mb-3" style={{ color: ts.textDim }}>{t('breathing.ambientSection')}</p>
                <AmbientSoundPlayer inline />
              </div>

              <div className="mx-5 h-px" style={{ background: `linear-gradient(90deg,transparent,${ts.border},transparent)` }} />

              {/* stat rings */}
              <div className="px-5 pb-7 pt-4">
                <p className="t-label uppercase tracking-[0.22em] mb-5" style={{ color: ts.textDim }}>{t('breathing.yourProgress')}</p>
                <div className="flex items-start justify-around">
                  <StatRing
                    value={totalStats.streak} max={30} unit="days"
                    label={t('breathing.streak')}
                    color={ts.accent} glow={`${ts.accent}88`}
                  />
                  <StatRing
                    value={totalStats.totalMinutes} max={600} unit="min"
                    label={t('breathing.allTime')}
                    color={ts.accentLight} glow={`${ts.accentLight}88`}
                  />
                  <StatRing
                    value={totalStats.totalSessions} max={100} unit=""
                    label={t('breathing.sessions')}
                    color="#A78BFA" glow="rgba(167,139,250,0.6)"
                  />
                </div>
              </div>
            </div>
      </div>

      <section className="relative z-10 backdrop-blur-sm border-t py-14 px-4 sm:px-6"
        style={{ background: `${ts.pageBg}E6`, borderColor: ts.border }}>
        <div className="max-w-2xl mx-auto flex flex-col items-center gap-10">
          <div className="text-center">
            <p className="t-label tracking-[0.3em] uppercase mb-2" style={{ color: ts.textDim }}>{t('breathing.pattern')}</p>
            <h2 className="t-heading sm:text-2xl font-light tracking-wide mb-1" style={{ color: ts.accentLight }}>
              {phaseDurations.inhale}–{phaseDurations.hold}–{phaseDurations.exhale}–{phaseDurations.pause}
            </h2>
            <p className="t-caption" style={{ color: ts.textDim }}>{t('breathing.dragHint')}</p>
          </div>

          <div className="w-full flex items-end gap-4 sm:gap-6 px-2" style={{ height: BAR_H + 56 }}>
            {(["inhale","hold","exhale","pause"] as (keyof PhaseDurations)[]).map(key => (
              <DraggablePhaseBar key={key} phaseKey={key} value={phaseDurations[key]}
                onChange={val => setPhaseDurations(prev => ({ ...prev, [key]: val }))}
                isActivePhase={phase === key && isActive} />
            ))}
          </div>

          <div className="w-full h-px" style={{ backgroundColor: ts.border }} />

          <div className="flex flex-col items-center gap-3 w-full">
            <p className="t-label tracking-[0.3em] uppercase" style={{ color: ts.textDim }}>{t('breathing.presets')}</p>
            <div className="flex flex-wrap justify-center gap-2">
              {presets.map((p, i) => (
                <PresetPill key={i} name={p.name} pattern={p.pattern} onApply={setPhaseDurations} current={phaseDurations} />
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
            {([
              {
                icon: <Waves size={22} color="#38BDF8" />, title: t('breathing.cards.box.title'), tag: t('breathing.cards.box.tag'),
                pattern: { inhale: 4, hold: 4, exhale: 4, pause: 4 },
                desc: t('breathing.cards.box.desc'),
                href: '/breathing/box-breathing',
              },
              {
                icon: <Moon size={22} color="#818CF8" />, title: t('breathing.cards.sleep.title'), tag: t('breathing.cards.sleep.tag'),
                pattern: { inhale: 4, hold: 7, exhale: 8, pause: 1 },
                desc: t('breathing.cards.sleep.desc'),
                href: '/breathing/4-7-8',
              },
              {
                icon: <Zap size={22} color="#FACC15" />, title: t('breathing.cards.energy.title'), tag: t('breathing.cards.energy.tag'),
                pattern: { inhale: 6, hold: 0, exhale: 2, pause: 1 },
                desc: t('breathing.cards.energy.desc'),
                href: '/breathing/wim-hof',
              },
            ]).map(({ icon, title, tag, pattern, desc, href }) => {
              const nums = [pattern.inhale, pattern.hold, pattern.exhale, pattern.pause];
              const labels = [t('breathing.phaseLabels.inhale'), t('breathing.phaseLabels.hold'), t('breathing.phaseLabels.exhale'), t('breathing.pause_phase')];
              return (
                <div
                  key={href}
                  className="flex flex-col gap-3 p-4 rounded-2xl"
                  style={{ backgroundColor: ts.cardBg, border: `1px solid ${ts.border}` }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-2xl">{icon}</span>
                    <span
                      className="t-label font-semibold uppercase tracking-widest px-2 py-0.5 rounded-full whitespace-nowrap"
                      style={{ background: ts.borderHover, color: ts.textSecondary }}
                    >{tag}</span>
                  </div>

                  <p className="t-body font-semibold" style={{ color: ts.textPrimary }}>{title}</p>

                  <div className="flex items-center gap-1">
                    {labels.map((label, idx) => (
                      <React.Fragment key={label}>
                        <div className="flex flex-col items-center min-w-0">
                          <span className="t-body font-bold leading-tight" style={{ color: ts.textSecondary }}>{nums[idx]}</span>
                          <span className="text-[8px] leading-tight" style={{ color: ts.textDim }}>{label}</span>
                        </div>
                        {idx < 3 && <span className="mx-0.5" style={{ color: ts.textDim, fontSize: 10 }}>·</span>}
                      </React.Fragment>
                    ))}
                  </div>

                  <p className="t-caption leading-relaxed flex-1" style={{ color: ts.textMuted }}>{desc}</p>

                  <div className="flex items-center gap-3 pt-1">
                    <button
                      onClick={() => { setPhaseDurations(pattern); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                      className="flex-1 py-1.5 rounded-xl t-caption font-semibold transition-all hover:opacity-90 active:scale-95"
                      style={{ background: ts.btnGradient, color: '#fff' }}
                    >{t('breathing.apply')}</button>
                    <Link
                      to={href}
                      className="t-caption font-medium hover:opacity-80 transition-opacity whitespace-nowrap"
                      style={{ color: ts.textSecondary }}
                    >{t('breathing.readGuide')} →</Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <div className="relative z-10"><Footer /></div>

      <SessionFeedbackModal
        open={feedbackOpen}
        onClose={async () => {
          setFeedbackOpen(false);
          if (pendingPayload) {
            const cid = pendingPayload.clientId;
            if (cid && !savedClientIdsRef.current.has(cid)) {
              savedClientIdsRef.current.add(cid);
              await saveSession({ ...pendingPayload, feedbackSubmitted: false });
            }
            setPendingPayload(null);
          }
        }}
        initialData={{ moodBefore: 5, moodAfter: 5, focusLevel: 5, stressLevel: 5, breathingDepth: 5, calmnessScore: 5, distractionCount: 0, noiseLevel: "Quiet", notes: "" }}
        onSubmit={async (feedback: any) => {
          if (!pendingPayload) return;
          await saveSession({ ...pendingPayload, ...feedback, feedbackSubmitted: true });
          setPendingPayload(null); setFeedbackOpen(false);
        }}
      />
    </div>
  );
}