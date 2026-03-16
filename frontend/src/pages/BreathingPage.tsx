// src/pages/BreathingPage.tsx
import React, { useCallback, useMemo, useState, useRef, useEffect } from "react";
import NavBar from "../components/NavBar";
import { BreathingCircle, Phase } from "../components/BreathingCircle";
import { VideoBackground } from "../components/VideoBackground";
import api from "../api";
import { toast } from "sonner";
import Footer from "../components/Footer";
import { SessionFeedbackModal } from "../components/SessionFeedbackModal";
import { Flame, Wind, Timer, Zap } from "lucide-react";
import { useLocation } from "react-router-dom";

// ─── How many full cycles before the feedback modal fires ────────────────────
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
  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-2xl backdrop-blur-sm border transition-all duration-500 ${
      dim
        ? "bg-[#060C1A]/35 border-[#1E3358]/20 opacity-35"
        : "bg-[#060C1A]/65 border-[#1E3358]/60 shadow-[0_0_20px_rgba(0,0,0,0.4)]"
    }`}>
      <span className="text-[#4A9EFF]/70">{icon}</span>
      <div className="flex flex-col leading-none">
        <span className="text-[#7AC4FF] text-sm sm:text-base font-medium tabular-nums">{value}</span>
        <span className="text-[#2A4060] text-[9px] uppercase tracking-widest mt-0.5">{label}</span>
      </div>
    </div>
  );
}

function fmtTime(sec: number) {
  return `${Math.floor(sec / 60).toString().padStart(2, "0")}:${(sec % 60).toString().padStart(2, "0")}`;
}

// ─── Draggable phase bar (identical to previous version) ─────────────────────
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
  const meta = PHASE_META[phaseKey];
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
    const tm = (e: TouchEvent) => { e.preventDefault(); onMove(e.touches[0].clientY); };
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
      <span className={`text-xs font-medium tabular-nums transition-colors duration-200 ${isActivePhase ? "text-white" : "text-[#3D6080]"}`}>
        {value}s
      </span>
      <div
        className="relative w-full rounded-xl cursor-ns-resize touch-none overflow-hidden"
        style={{ height: BAR_H, background: "rgba(8,14,28,0.7)", border: "1px solid rgba(30,51,88,0.45)" }}
        onMouseDown={e  => { e.preventDefault(); onStart(e.clientY); }}
        onTouchStart={e => { e.preventDefault(); onStart(e.touches[0].clientY); }}
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
        {[3, 6, 9].map(tick => (
          <div key={tick} className="absolute left-0 right-0 h-px"
            style={{ bottom: Math.round(((tick - BAR_MIN) / (BAR_MAX - BAR_MIN)) * (BAR_H - 12)) + 12, background: "rgba(255,255,255,0.04)" }} />
        ))}
      </div>
      <span className={`text-[10px] tracking-widest uppercase transition-colors duration-200 ${isActivePhase ? "text-[#7AC4FF]" : "text-[#2A4060]"}`}>
        {meta.label}
      </span>
    </div>
  );
}

function PresetPill({ name, pattern, onApply, current }: {
  name: string; pattern: PhaseDurations; onApply: (p: PhaseDurations) => void; current: PhaseDurations;
}) {
  const active = JSON.stringify(pattern) === JSON.stringify(current);
  return (
    <button onClick={() => onApply(pattern)}
      className={`flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl border transition-all duration-200 ${
        active ? "bg-[#0D1B33]/90 border-[#2A5499]/70 shadow-[0_0_12px_rgba(74,158,255,0.12)]"
               : "bg-[#0B1628]/50 border-[#1E3358]/40 hover:border-[#2A5499]/60"
      }`}
    >
      <span className={`text-[10px] font-medium ${active ? "text-[#7AC4FF]" : "text-[#5A8FB8]"}`}>{name}</span>
      <span className="text-[#2A4060] text-[9px]">{pattern.inhale}-{pattern.hold}-{pattern.exhale}-{pattern.pause}</span>
    </button>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function BreathingPage() {
  const [isActive, setIsActive]           = useState(false);
  const location = useLocation();
  const [phaseDurations, setPhaseDurations] = useState<PhaseDurations>(() => {
    // Auto-apply preset from AI Coach navigation
    const state = location.state as { coachPreset?: PhaseDurations } | null;
    return state?.coachPreset ?? { inhale: 4, hold: 2, exhale: 5, pause: 3 };
  });
  const [coachPresetName, setCoachPresetName] = useState<string | null>(() => {
    const state = location.state as { coachPresetName?: string } | null;
    return state?.coachPresetName ?? null;
  });
  const [cycles, setCycles]               = useState(0);
  const [currentDuration, setCurrentDuration] = useState(0);
  const [totalStats, setTotalStats]       = useState({ totalSessions: 0, totalMinutes: 0, streak: 0 });
  const [feedbackOpen, setFeedbackOpen]   = useState(false);
  const [pendingPayload, setPendingPayload] = useState<any | null>(null);
  const savedClientIdsRef = useRef(new Set<string>());
  const [phase, setPhase] = useState<Phase | null>(null);
  const startTimeRef      = useRef<number | null>(null);
  const wasActiveRef      = useRef(isActive);
  // Track whether feedback has already been shown for this session run
  const feedbackShownRef  = useRef(false);

  const videos = [
    "/videos/med-01.mp4","/videos/med-02.mp4","/videos/med-03.mp4",
    "/videos/med-04.mp4","/videos/med-05.mp4","/videos/med-06.mp4","/videos/med-07.mp4",
  ];

  const handlePhaseChange = useCallback((p: Phase) => setPhase(p), []);
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

  const saveSession = async (payload: any) => {
    try {
      const cid = payload?.clientId;
      if (cid && savedClientIdsRef.current.has(cid)) return;
      if (cid) savedClientIdsRef.current.add(cid);
      await api.post("/sessions", payload);
      toast.success("Session saved");
      setCycles(0); setCurrentDuration(0); fetchStats();
    } catch {
      const cid = payload?.clientId;
      if (cid) savedClientIdsRef.current.delete(cid);
      toast.error("Failed to save session");
    }
  };

  // ── On stop: show feedback only if cycles >= 3, else save silently ──────────
  useEffect(() => {
    if (isActive) {
      // Session started — reset timer and flag
      startTimeRef.current = Date.now();
      feedbackShownRef.current = false;
    } else if (wasActiveRef.current && startTimeRef.current) {
      // Session stopped
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
        // Enough cycles — ask for feedback
        savedClientIdsRef.current.delete(cid);
        setPendingPayload({ ...base, feedbackSubmitted: false });
        setFeedbackOpen(true);
      } else {
        // Too few cycles — save quietly, no popup
        saveSession({ ...base, feedbackSubmitted: true });
      }

      startTimeRef.current = null;
    }
    wasActiveRef.current = isActive;
  }, [isActive]);

  const presets: { name: string; pattern: PhaseDurations; coachKey?: string }[] = [
    { name: "Box",       pattern: { inhale: 4, hold: 4, exhale: 4, pause: 4 }, coachKey: "box" },
    { name: "4-7-8",     pattern: { inhale: 4, hold: 7, exhale: 8, pause: 1 }, coachKey: "4-7-8" },
    { name: "Calm",      pattern: { inhale: 4, hold: 2, exhale: 6, pause: 2 }, coachKey: "coherent" },
    { name: "Energize",  pattern: { inhale: 6, hold: 0, exhale: 2, pause: 1 }, coachKey: "wim-hof" },
    { name: "Wim Hof",   pattern: { inhale: 2, hold: 1, exhale: 2, pause: 1 }, coachKey: "wim-hof" },
    { name: "Belly",     pattern: { inhale: 4, hold: 0, exhale: 6, pause: 2 }, coachKey: "belly" },
    { name: "Alternate", pattern: { inhale: 4, hold: 4, exhale: 4, pause: 2 }, coachKey: "alternate" },
  ];

  return (
    <div className="relative flex flex-col min-h-screen bg-[#010814] font-montserrat">
      <style>{`
        @keyframes fadeInUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        .stat-in { animation: fadeInUp 0.6s ease forwards; }
      `}</style>

      {/* Backgrounds */}
      <div className="fixed inset-0 bg-cover bg-center" style={{ backgroundImage: `url('/Background_img_Meditation.jpg')`, opacity: 0.5 }} />
      <VideoBackground videoFiles={videos} isActive={isActive} baseImage="/images/background.jpg" targetOpacity={0.55} playbackRate={1} crossfadeSeconds={2.0} pauseBetweenVideos={1.8} brightness={1.05} phase={phase} desiredPlaySeconds={desiredPlaySeconds} maxSpeed={1.2} />
      <div className="fixed inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse at center, transparent 30%, rgba(1,8,20,0.78) 100%)" }} />

      {/* NavBar */}
      <div className="relative z-50"><NavBar /></div>

      {/* ══ HERO — flex column, nothing overlaps ══════════════════════════════ */}
      <section
        className="relative z-10 flex flex-col items-center justify-center gap-4 sm:gap-5 px-4"
        style={{ minHeight: "calc(100vh - 56px)" }}
      >
        {/* ── Row 1: live session stats (top, always visible) ── */}
        <div className={`flex gap-3 transition-opacity duration-500 ${isActive ? "opacity-100" : "opacity-30"}`}>
          <div className="stat-in" style={{ animationDelay: "0.1s", opacity: 0 }}>
            <StatPill icon={<Timer size={12} />} label="Session" value={fmtTime(currentDuration)} dim={!isActive} />
          </div>
          <div className="stat-in" style={{ animationDelay: "0.2s", opacity: 0 }}>
            <StatPill icon={<Wind size={12} />} label="Cycles" value={String(cycles)} dim={!isActive} />
          </div>
        </div>

        {/* ── Row 2: ORB (the star of the show) ── */}
        {/*  Give it extra breathing room so the expanded circle never clips stats  */}
        <div
          className="flex items-center justify-center"
          style={{
            width:  circleSize * 1.28,   // extra horizontal padding
            height: circleSize * 1.28,   // extra vertical padding
          }}
        >
          <BreathingCircle
            isActive={isActive}
            phaseDurations={phaseDurations}
            onCycleComplete={() => setCycles(c => c + 1)}
            onPhaseChange={handlePhaseChange}
            onToggle={() => setIsActive(a => !a)}
            size={circleSize}
            glowIntensity={1.0}
          />
        </div>

        {/* ── Row 3: Start / Pause button ── */}
        <button
          onClick={() => setIsActive(a => !a)}
          className="group relative flex items-center gap-2.5 px-8 py-3 rounded-full text-white text-sm font-medium tracking-wide transition-all duration-300 hover:shadow-[0_0_30px_rgba(58,130,247,0.45)] hover:scale-105 active:scale-95"
          style={{ background: "linear-gradient(135deg,#1A5FCC 0%,#3A82F7 100%)" }}
        >
          {isActive ? (
            <><svg width="12" height="14" viewBox="0 0 12 14" fill="white"><rect x="0" y="0" width="4" height="14" rx="1.5"/><rect x="8" y="0" width="4" height="14" rx="1.5"/></svg>Pause</>
          ) : (
            <><svg width="11" height="13" viewBox="0 0 12 14" fill="white"><path d="M1 1l10 6L1 13V1z"/></svg>{cycles > 0 ? "Resume" : "Start"}</>
          )}
          <span className="absolute inset-0 rounded-full bg-white opacity-0 group-hover:opacity-10 transition-opacity" />
        </button>

        {/* ── Row 4: achievement stats (always below button) ── */}
        <div className="flex gap-3">
          {[
            { icon: <Flame size={12} />, label: "Streak",   value: `${totalStats.streak}d`         },
            { icon: <Zap size={12} />,   label: "All time", value: `${totalStats.totalMinutes}m`    },
            { icon: <Wind size={12} />,  label: "Sessions", value: String(totalStats.totalSessions) },
          ].map(({ icon, label, value }, i) => (
            <div key={label} className="stat-in" style={{ animationDelay: `${0.3 + i * 0.1}s`, opacity: 0 }}>
              <StatPill icon={icon} label={label} value={value} dim={isActive} />
            </div>
          ))}
        </div>

        {/* Scroll hint */}
        <div className={`flex flex-col items-center gap-1.5 transition-opacity duration-700 ${isActive ? "opacity-0" : "opacity-20"}`}>
          <span className="text-[9px] tracking-[0.25em] uppercase text-[#2A4060]">adjust below</span>
          <svg width="12" height="8" viewBox="0 0 12 8" fill="none">
            <path d="M1 1l5 5 5-5" stroke="#2A4060" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </div>
      </section>

      {/* ══ BELOW-FOLD ════════════════════════════════════════════════════════ */}
      <section className="relative z-10 bg-[#040A14]/90 backdrop-blur-sm border-t border-[#1E3358]/30 py-14 px-4 sm:px-6">
        <div className="max-w-2xl mx-auto flex flex-col items-center gap-10">

          <div className="text-center">
            <p className="text-[10px] tracking-[0.3em] uppercase text-[#2A4060] mb-2">Breathing pattern</p>
            <h2 className="text-[#7AC4FF] text-xl sm:text-2xl font-light tracking-wide mb-1">
              {phaseDurations.inhale}–{phaseDurations.hold}–{phaseDurations.exhale}–{phaseDurations.pause}
            </h2>
            <p className="text-[#1E3358] text-xs">Drag bars up · down to adjust · 1–10 seconds</p>
          </div>

          {/* Draggable bars */}
          <div className="w-full flex items-end gap-4 sm:gap-6 px-2" style={{ height: BAR_H + 56 }}>
            {(["inhale","hold","exhale","pause"] as (keyof PhaseDurations)[]).map(key => (
              <DraggablePhaseBar key={key} phaseKey={key} value={phaseDurations[key]}
                onChange={val => setPhaseDurations(prev => ({ ...prev, [key]: val }))}
                isActivePhase={phase === key && isActive} />
            ))}
          </div>

          <div className="w-full h-px bg-[#1E3358]/25" />

          {/* Presets */}
          <div className="flex flex-col items-center gap-3 w-full">
            <p className="text-[10px] tracking-[0.3em] uppercase text-[#2A4060]">Quick presets</p>
            <div className="flex flex-wrap justify-center gap-2">
              {presets.map(p => (
                <PresetPill key={p.name} name={p.name} pattern={p.pattern} onApply={setPhaseDurations} current={phaseDurations} />
              ))}
            </div>
          </div>

          {/* Info cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
            {[
              { icon: "🌊", title: "Box Breathing",   desc: "4-4-4-4. Equal phases for focus and calm. Used by Navy SEALs." },
              { icon: "🌙", title: "4-7-8 for Sleep", desc: "Long hold + slow exhale activates your parasympathetic system."  },
              { icon: "⚡", title: "Energizing",      desc: "Short sharp cycles boost alertness in under two minutes."         },
            ].map(({ icon, title, desc }) => (
              <div key={title} className="flex flex-col gap-2 p-4 rounded-2xl bg-[#0B1628]/60 border border-[#1E3358]/40 hover:border-[#2A5499]/60 transition-colors">
                <span className="text-xl">{icon}</span>
                <p className="text-[#B8D9FF] text-xs font-medium">{title}</p>
                <p className="text-[#3D6080] text-xs leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="relative z-10"><Footer /></div>

      {/* ── Feedback modal ── */}
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