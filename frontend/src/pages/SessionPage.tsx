// src/pages/SessionsPage.tsx
import React, { useEffect, useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";
import api from "../api";
import { toast } from "sonner";
import {
  Trash2, Plus, Wind, Timer, Flame, TrendingUp,
  ChevronDown, ChevronUp, Search, SlidersHorizontal,
  Brain, Sparkles, X, Calendar,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useThemeStyles } from "../hooks/useThemeStyles";
import ThemeBackground from "../components/ThemeBackground";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Session {
  _id: string;
  sessionDate: string;
  moodBefore: number;
  moodAfter: number;
  focusLevel: number;
  stressLevel: number;
  breathingDepth: number;
  calmnessScore: number;
  distractionCount: number;
  timeOfDay: string;
  noiseLevel: string;
  sessionLength: number;
  cycles: number;
  notes?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" });
}
function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
}
function moodEmoji(v: number) {
  if (v <= 2) return "😞"; if (v <= 4) return "😐"; if (v <= 6) return "🙂"; if (v <= 8) return "😊"; return "🌟";
}
function deltaColor(before: number, after: number) {
  return after > before ? "#4A9EFF" : after < before ? "#FF8A8A" : "#3D6080";
}

// ─── Ad slot ──────────────────────────────────────────────────────────────────
function AdSlot({ label = "Advertisement", className = "" }: { label?: string; className?: string }) {
  return (
    <div className={`flex items-center justify-center border border-dashed border-[#1E3358]/40 rounded-xl bg-[#040A14]/40 ${className}`}>
      <ThemeBackground />
      <span className="text-[9px] tracking-[0.25em] uppercase text-[#1A2D48] select-none">{label}</span>
    </div>
  );
}

// ─── Stat summary card ────────────────────────────────────────────────────────
function SummaryCard({ icon, label, value, sub }: { icon: React.ReactNode; label: string; value: string; sub?: string }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-[#0B1628]/70 border border-[#1E3358]/50">
      <span className="text-[#4A9EFF]/70">{icon}</span>
      <div>
        <p className="text-[#7AC4FF] text-base sm:text-lg font-medium tabular-nums leading-none">{value}</p>
        <p className="text-[#4A7AAA] text-[9px] uppercase tracking-widest mt-0.5">{label}</p>
        {sub && <p className="text-[#3D6080] text-[9px] mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

// ─── Mini bar (score visualiser) ─────────────────────────────────────────────
function MiniBar({ value, max = 10, color = "#3A82F7" }: { value: number; max?: number; color?: string }) {
  return (
    <div className="flex-1 h-1 rounded-full bg-[#1E3358]/40 overflow-hidden">
      <div className="h-full rounded-full transition-all" style={{ width: `${(value / max) * 100}%`, background: color }} />
    </div>
  );
}

// ─── Score row ────────────────────────────────────────────────────────────────
function ScoreRow({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] text-[#3D6080] w-16 flex-shrink-0">{label}</span>
      <MiniBar value={value} color={color} />
      <span className="text-[10px] tabular-nums flex-shrink-0" style={{ color }}>{value}</span>
    </div>
  );
}

// ─── Session card ─────────────────────────────────────────────────────────────
function SessionCard({ session, onDelete }: { session: Session; onDelete: (id: string) => void }) {
  const [expanded, setExpanded] = useState(false);
  const delta = session.moodAfter - session.moodBefore;

  return (
    <div className={`flex flex-col rounded-2xl border transition-all duration-300 overflow-hidden ${
      expanded
        ? "bg-[#0D1B33]/90 border-[#2A5499]/55 shadow-[0_0_24px_rgba(74,158,255,0.08)]"
        : "bg-[#0B1628]/60 border-[#1E3358]/45 hover:border-[#1E3358]/70 hover:bg-[#0B1628]/80"
    }`}>
      {/* Header row */}
      <div
        className="flex items-center gap-3 px-4 py-3 cursor-pointer select-none"
        onClick={() => setExpanded(e => !e)}
      >
        {/* Mood emoji */}
        <span className="text-xl flex-shrink-0">{moodEmoji(session.moodAfter)}</span>

        {/* Date + meta */}
        <div className="flex-1 min-w-0">
          <p className="text-[#B8D9FF] text-xs font-medium truncate">{fmtDate(session.sessionDate)}</p>
          <p className="text-[#4A7AAA] text-[10px] truncate">
            {fmtTime(session.sessionDate)} · {session.sessionLength}m · {session.cycles} cycles · {session.noiseLevel}
          </p>
        </div>

        {/* Mood delta badge */}
        <span
          className="text-[10px] px-2 py-0.5 rounded-full border flex-shrink-0 tabular-nums"
          style={{ color: deltaColor(session.moodBefore, session.moodAfter), borderColor: `${deltaColor(session.moodBefore, session.moodAfter)}33`, background: `${deltaColor(session.moodBefore, session.moodAfter)}0D` }}
        >
          {session.moodBefore}→{session.moodAfter} {delta > 0 ? `+${delta}` : delta < 0 ? `${delta}` : "="}
        </span>

        {/* Expand chevron */}
        <span className="text-[#3D6080] flex-shrink-0">
          {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </span>
      </div>

      {/* Expanded detail */}
      {expanded && (
        <div className="px-4 pb-4 flex flex-col gap-3 border-t border-[#1E3358]/30 pt-3">
          {/* Scores */}
          <div className="flex flex-col gap-1.5">
            <ScoreRow label="Focus"     value={session.focusLevel}     color="#3A82F7" />
            <ScoreRow label="Calmness"  value={session.calmnessScore}  color="#7AC4FF" />
            <ScoreRow label="Breath"    value={session.breathingDepth} color="#4A9EFF" />
            <ScoreRow label="Stress"    value={session.stressLevel}    color="#FF8A8A" />
          </div>

          {/* Distractions */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-[#4A7AAA]">Distractions:</span>
            <div className="flex gap-1">
              {Array.from({ length: Math.min(session.distractionCount, 10) }).map((_, i) => (
                <span key={i} className="w-1.5 h-1.5 rounded-full bg-[#FF8A8A]/40" />
              ))}
              {session.distractionCount === 0 && <span className="text-[10px] text-[#3D6080]">none</span>}
            </div>
            {session.distractionCount > 10 && <span className="text-[10px] text-[#3D6080]">+{session.distractionCount - 10}</span>}
          </div>

          {/* Notes */}
          {session.notes && (
            <p className="text-[#4A7AAA] text-[10px] italic leading-relaxed border-t border-[#1E3358]/25 pt-2">
              "{session.notes}"
            </p>
          )}

          {/* Delete */}
          <button
            onClick={() => onDelete(session._id)}
            className="self-end flex items-center gap-1.5 text-[10px] text-[#4A7AAA] hover:text-[#FF8A8A] transition-colors"
          >
            <Trash2 size={11} /> Delete
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Inline "Add Session" form (same fields as FeedbackModal) ─────────────────
const NOISE_OPTS = ["Silent", "Quiet", "Moderate", "Noisy"] as const;
const FEELINGS   = ["focused","calm","energized","drowsy","distracted","peaceful","anxious","refreshed"] as const;
const FEELING_ICONS: Record<string, string> = {
  focused:"🎯", calm:"🌊", energized:"⚡", drowsy:"💤",
  distracted:"🌀", peaceful:"☮️", anxious:"😰", refreshed:"🌿",
};

const emptyForm = {
  sessionDate: new Date().toISOString().slice(0, 16),
  moodBefore: 5, moodAfter: 5, focusLevel: 5, stressLevel: 5,
  breathingDepth: 5, calmnessScore: 5, distractionCount: 0,
  timeOfDay: new Date().toLocaleTimeString([], { hour12: false }),
  noiseLevel: "Quiet", sessionLength: 10, cycles: 5, notes: "",
};

function DotSlider({ value, max = 10, onChange, color = "#3A82F7" }: {
  value: number; max?: number; onChange: (v: number) => void; color?: string;
}) {
  return (
    <div className="flex items-center gap-1 flex-wrap">
      {Array.from({ length: max + 1 }, (_, i) => (
        <button key={i} type="button" onClick={() => onChange(i)}
          className="rounded-full transition-all duration-100"
          style={{ width: i <= value ? 12 : 10, height: i <= value ? 12 : 10, flexShrink: 0,
            background: i <= value ? color : "#1E3358", opacity: i <= value ? 1 : 0.35 }} />
      ))}
      <span className="text-[10px] tabular-nums ml-1" style={{ color }}>{value}</span>
    </div>
  );
}

function AddSessionPanel({ onAdd, onClose }: { onAdd: (s: Omit<Session, "_id">) => void; onClose: () => void }) {
  const [step, setStep]     = useState(0);
  const [form, setForm]     = useState({ ...emptyForm });
  const [feelings, setFeelings] = useState<string[]>([]);
  const set = <K extends keyof typeof emptyForm>(k: K, v: typeof emptyForm[K]) => setForm(p => ({ ...p, [k]: v }));
  const toggleFeeling = (f: string) => setFeelings(p => p.includes(f) ? p.filter(x => x !== f) : [...p, f]);

  const handleSave = () => {
    const finalNotes = [form.notes, feelings.length ? `Feelings: ${feelings.join(", ")}` : ""].filter(Boolean).join(" | ");
    onAdd({ ...form, timeOfDay: new Date(form.sessionDate).toLocaleTimeString([], { hour12: false }), notes: finalNotes, sessionDate: new Date(form.sessionDate).toISOString() });
    setStep(0); setForm({ ...emptyForm }); setFeelings([]);
  };

  const STEPS = ["When & duration", "Mood shift", "How you felt", "Quality"];

  return (
    <div className="rounded-3xl overflow-hidden border border-[#2A5499]/40 bg-[#070E1F]/95"
      style={{ boxShadow: "0 0 60px rgba(74,158,255,0.07), 0 20px 50px rgba(0,0,0,0.6)" }}>
      {/* Top glow */}
      <div className="h-px w-full bg-gradient-to-r from-transparent via-[#4A9EFF]/30 to-transparent" />

      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-[#1E3358]/30">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'linear-gradient(135deg,#1A5FCC,#3A82F7)', boxShadow: "0 0 14px rgba(74,158,255,0.35)" }}>
            <Brain size={13} className="text-white" />
          </div>
          <div>
            <p className="text-[#B8D9FF] text-sm font-medium leading-none">Log a session</p>
            <p className="text-[#4A7AAA] text-[10px] mt-0.5">Your data trains your personal AI coach</p>
          </div>
        </div>
        <button onClick={onClose} className="text-[#4A7AAA] hover:text-[#5A8FB8] transition-colors p-1"><X size={15} /></button>
      </div>

      {/* Step tabs */}
      <div className="flex border-b border-[#1E3358]/25">
        {STEPS.map((s, i) => (
          <button key={i} onClick={() => setStep(i)}
            className={`flex-1 py-2 text-[9px] uppercase tracking-widest transition-colors ${
              step === i ? "text-[#7AC4FF] border-b border-[#4A9EFF]" : "text-[#3D6080] hover:text-[#3D6080]"
            }`}
          >{s}</button>
        ))}
      </div>

      <div className="px-6 py-5 flex flex-col gap-4" style={{ minHeight: 260 }}>

        {/* Step 0 — when & duration */}
        {step === 0 && (
          <>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase tracking-widest text-[#3D6080]">Date & time</label>
              <input type="datetime-local" value={form.sessionDate}
                onChange={e => set("sessionDate", e.target.value)}
                className="bg-[#060C1A]/60 border border-[#1E3358]/50 rounded-xl px-3 py-2 text-xs text-[#7AC4FF] outline-none focus:border-[#2A5499] transition-colors" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase tracking-widest text-[#3D6080]">Duration (min)</label>
                <input type="number" min={1} max={120} value={form.sessionLength}
                  onChange={e => set("sessionLength", Number(e.target.value))}
                  className="bg-[#060C1A]/60 border border-[#1E3358]/50 rounded-xl px-3 py-2 text-xs text-[#7AC4FF] outline-none focus:border-[#2A5499] transition-colors" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase tracking-widest text-[#3D6080]">Cycles</label>
                <input type="number" min={0} max={200} value={form.cycles}
                  onChange={e => set("cycles", Number(e.target.value))}
                  className="bg-[#060C1A]/60 border border-[#1E3358]/50 rounded-xl px-3 py-2 text-xs text-[#7AC4FF] outline-none focus:border-[#2A5499] transition-colors" />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase tracking-widest text-[#3D6080]">Noise level</label>
              <div className="flex gap-2">
                {NOISE_OPTS.map(n => (
                  <button key={n} type="button" onClick={() => set("noiseLevel", n)}
                    className={`flex-1 py-2 rounded-xl text-[10px] border transition-all ${
                      form.noiseLevel === n ? "border-[#2A5499]/70 bg-[#0D1B33] text-[#7AC4FF]" : "border-[#1E3358]/35 text-[#3D6080] hover:border-[#1E3358]"
                    }`}>{n}</button>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Step 1 — mood shift */}
        {step === 1 && (
          <div className="flex flex-col gap-4">
            <p className="text-[#4A7AAA] text-xs">How did your mood shift during this session?</p>
            {(["Before","After"] as const).map((label, i) => {
              const key = i === 0 ? "moodBefore" : "moodAfter" as const;
              const val = form[key]; const color = i === 0 ? "#3D6080" : "#3A82F7";
              return (
                <div key={label} className="flex items-center gap-3">
                  <span className="text-[10px] uppercase tracking-widest text-[#4A7AAA] w-12 flex-shrink-0">{label}</span>
                  <input type="range" min={1} max={10} step={1} value={val}
                    onChange={e => set(key, Number(e.target.value))}
                    className="flex-1 appearance-none h-1.5 rounded-full cursor-pointer"
                    style={{ background: `linear-gradient(to right, ${color} ${(val-1)/9*100}%, rgba(30,51,88,0.5) ${(val-1)/9*100}%)`, accentColor: color }} />
                  <span className="text-xs tabular-nums w-5 text-right flex-shrink-0" style={{ color }}>{val}</span>
                </div>
              );
            })}
            <div className="flex items-center justify-center">
              <span className="text-xs px-3 py-1 rounded-full border tabular-nums"
                style={{ color: deltaColor(form.moodBefore, form.moodAfter), borderColor: `${deltaColor(form.moodBefore, form.moodAfter)}33`, background: `${deltaColor(form.moodBefore, form.moodAfter)}0D` }}>
                {form.moodAfter > form.moodBefore ? `+${form.moodAfter - form.moodBefore} better` :
                 form.moodAfter < form.moodBefore ? `${form.moodAfter - form.moodBefore} worse` : "no change"}
              </span>
            </div>
          </div>
        )}

        {/* Step 2 — feelings grid */}
        {step === 2 && (
          <div className="flex flex-col gap-3">
            <p className="text-[#4A7AAA] text-xs">How did you feel after? Pick all that apply.</p>
            <div className="grid grid-cols-4 gap-2">
              {FEELINGS.map(f => {
                const on = feelings.includes(f);
                return (
                  <button key={f} type="button" onClick={() => toggleFeeling(f)}
                    className={`flex flex-col items-center gap-1 py-2.5 rounded-xl border text-center transition-all duration-200 ${
                      on ? "border-[#2A5499]/70 bg-[#0D1B33]" : "border-[#1E3358]/35 hover:border-[#1E3358]/60"
                    }`}>
                    <span className={`text-base transition-all ${on ? "" : "opacity-45"}`}>{FEELING_ICONS[f]}</span>
                    <span className={`text-[9px] uppercase tracking-wide ${on ? "text-[#7AC4FF]" : "text-[#3D6080]"}`}>{f}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 3 — quality sliders + notes */}
        {step === 3 && (
          <div className="flex flex-col gap-3">
            {[
              { label: "Focus",    key: "focusLevel" as const,    color: "#3A82F7" },
              { label: "Calmness", key: "calmnessScore" as const, color: "#7AC4FF" },
              { label: "Breath",   key: "breathingDepth" as const,color: "#4A9EFF" },
              { label: "Stress",   key: "stressLevel" as const,   color: "#FF8A8A" },
            ].map(({ label, key, color }) => (
              <div key={key} className="flex flex-col gap-1">
                <span className="text-[10px] text-[#3D6080] uppercase tracking-widest">{label}</span>
                <DotSlider value={form[key] as number} onChange={v => set(key, v)} color={color} />
              </div>
            ))}
            <div className="flex flex-col gap-1 mt-1">
              <span className="text-[10px] text-[#3D6080] uppercase tracking-widest">Notes (optional)</span>
              <textarea value={form.notes} onChange={e => set("notes", e.target.value)} rows={2}
                placeholder="Any observations…"
                className="bg-[#060C1A]/60 border border-[#1E3358]/50 rounded-xl px-3 py-2 text-xs text-[#7AC4FF] placeholder-[#1A2D48] outline-none focus:border-[#2A5499] resize-none transition-colors" />
            </div>
          </div>
        )}
      </div>

      {/* Footer nav */}
      <div className="flex items-center gap-3 px-6 pb-5">
        {step > 0 && (
          <button onClick={() => setStep(s => s - 1)}
            className="px-4 py-2 rounded-xl text-xs text-[#3D6080] border border-[#1E3358]/40 hover:border-[#1E3358]/70 hover:text-[#5A8FB8] transition-all">
            Back
          </button>
        )}
        <div className="flex-1" />
        {step < 3 ? (
          <button onClick={() => setStep(s => s + 1)}
            className="px-6 py-2 rounded-xl text-xs text-white font-medium tracking-wide hover:shadow-[0_0_20px_rgba(58,130,247,0.4)] hover:scale-105 active:scale-95 transition-all"
            style={{ background: 'linear-gradient(135deg,#1A5FCC,#3A82F7)' }}>
            Continue →
          </button>
        ) : (
          <button onClick={handleSave}
            className="px-6 py-2 rounded-xl text-xs text-white font-medium tracking-wide hover:shadow-[0_0_24px_rgba(58,130,247,0.5)] hover:scale-105 active:scale-95 transition-all"
            style={{ background: 'linear-gradient(135deg,#1A5FCC,#3A82F7)', boxShadow: "0 0 20px rgba(74,158,255,0.15)" }}>
            Save session ✓
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
type SortKey = "date" | "duration" | "cycles" | "mood";

export default function SessionsPage() {
  const { t } = useTranslation();
  const ts = useThemeStyles();
  const navigate = useNavigate();
  const [sessions, setSessions]     = useState<Session[]>([]);
  const [loading, setLoading]       = useState(true);
  const [showAdd, setShowAdd]       = useState(false);
  const [search, setSearch]         = useState("");
  const [sortKey, setSortKey]       = useState<SortKey>("date");
  const [sortDir, setSortDir]       = useState<"asc"|"desc">("desc");
  const [filterOpen, setFilterOpen] = useState(false);
  const [minCycles, setMinCycles]   = useState(0);
  const [minDuration, setMinDuration] = useState(0);

  useEffect(() => {
    if (!localStorage.getItem("token")) { navigate("/login"); return; }
    api.get("/sessions")
      .then(r => setSessions(r.data))
      .catch(() => toast.error("Failed to load sessions"))
      .finally(() => setLoading(false));
  }, [navigate]);

  const handleDeleteOne = async (id: string) => {
    try {
      await api.delete(`/sessions/${id}`);
      setSessions(s => s.filter(x => x._id !== id));
      toast.success("Session deleted");
    } catch { toast.error("Failed to delete"); }
  };

  const handleDeleteAll = async () => {
    if (!window.confirm("Delete ALL sessions? This cannot be undone.")) return;
    try {
      await api.delete("/sessions");
      setSessions([]);
      toast.success("All sessions deleted");
    } catch { toast.error("Failed to delete"); }
  };

  const handleAdd = async (data: Omit<Session, "_id">) => {
    try {
      const res = await api.post("/sessions", data);
      setSessions(s => [res.data, ...s]);
      setShowAdd(false);
      toast.success("Session saved");
    } catch { toast.error("Failed to save session"); }
  };

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("desc"); }
  };

  const filtered = useMemo(() => {
    let out = [...sessions];
    if (search) {
      const q = search.toLowerCase();
      out = out.filter(s => s.notes?.toLowerCase().includes(q) || s.noiseLevel.toLowerCase().includes(q) || fmtDate(s.sessionDate).toLowerCase().includes(q));
    }
    if (minCycles > 0)   out = out.filter(s => s.cycles >= minCycles);
    if (minDuration > 0) out = out.filter(s => s.sessionLength >= minDuration);
    out.sort((a, b) => {
      let av = 0, bv = 0;
      if (sortKey === "date")     { av = new Date(a.sessionDate).getTime(); bv = new Date(b.sessionDate).getTime(); }
      if (sortKey === "duration") { av = a.sessionLength; bv = b.sessionLength; }
      if (sortKey === "cycles")   { av = a.cycles; bv = b.cycles; }
      if (sortKey === "mood")     { av = a.moodAfter - a.moodBefore; bv = b.moodAfter - b.moodBefore; }
      return sortDir === "desc" ? bv - av : av - bv;
    });
    return out;
  }, [sessions, search, sortKey, sortDir, minCycles, minDuration]);

  // Summary stats
  const totalMins   = Math.round(sessions.reduce((s, x) => s + x.sessionLength, 0));
  const totalCycles = Math.round(sessions.reduce((s, x) => s + x.cycles, 0));
  const avgMoodDelta = sessions.length
    ? (sessions.reduce((s, x) => s + (x.moodAfter - x.moodBefore), 0) / sessions.length).toFixed(1)
    : "—";

  return (
    <div className="relative flex flex-col min-h-screen  font-montserrat">
      <style>{`
        @keyframes sessFadeUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        .sess-in { animation: sessFadeUp 0.5s ease forwards; }
        input[type=range]::-webkit-slider-thumb {
          -webkit-appearance:none; width:13px; height:13px;
          border-radius:50%; background:#7AC4FF;
          box-shadow: 0 0 6px rgba(74,158,255,0.5); cursor:pointer; margin-top:-4px;
        }
        input[type=range]::-webkit-slider-runnable-track { height:4px; border-radius:4px; }
      `}</style>

      {/* Star background */}
      <ThemeBackground />

      <div className="relative z-10 flex flex-col min-h-screen">
        <NavBar />

        {/* ── Top ad ── */}
        <div className="max-w-6xl mx-auto w-full px-4 sm:px-6 pt-4">
          <AdSlot label="Ad · 728×90 leaderboard" className="h-12 sm:h-14" />
        </div>

        {/* ── Page header ── */}
        <header className="max-w-6xl mx-auto w-full px-4 sm:px-6 pt-6 pb-2">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <p className="text-[10px] tracking-[0.3em] uppercase text-[#4A7AAA] mb-1">Breathe · History</p>
              <h1 className="text-2xl sm:text-3xl font-light text-[#B8D9FF] tracking-wide">My Sessions</h1>
            </div>
            <button
              onClick={() => setShowAdd(v => !v)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full text-white text-sm font-medium tracking-wide transition-all hover:shadow-[0_0_24px_rgba(58,130,247,0.4)] hover:scale-105 active:scale-95"
              style={{ background: ts.btnGradient }}
            >
              {showAdd ? <X size={14} /> : <Plus size={14} />}
              {showAdd ? t("sessions.cancel") : t("sessions.logSession")}
            </button>
          </div>
        </header>

        {/* ── Main body ── */}
        <div className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 pb-20">
          <div className="flex gap-5">

            {/* ── LEFT sidebar ── */}
            <aside className="hidden lg:flex flex-col gap-4 w-56 flex-shrink-0 pt-4">
              {/* Summary stats */}
              <div className="flex flex-col gap-2">
                <p className="text-[9px] tracking-[0.25em] uppercase text-[#3D6080] px-1 mb-1">Overview</p>
                <SummaryCard icon={<Timer size={14} />}   label={t("sessions.totalMinutes")} value={`${totalMins}m`} />
                <SummaryCard icon={<Wind size={14} />}    label={t("sessions.totalCycles")}  value={String(totalCycles)} />
                <SummaryCard icon={<Flame size={14} />}   label={t("sessions.sessions")}      value={String(sessions.length)} />
                <SummaryCard icon={<TrendingUp size={14} />} label="Avg mood shift" value={typeof avgMoodDelta === "string" && avgMoodDelta !== "—" && Number(avgMoodDelta) > 0 ? `+${avgMoodDelta}` : String(avgMoodDelta)} />
              </div>

              {/* Filters */}
              <div className="flex flex-col gap-2 bg-[#0B1628]/60 border border-[#1E3358]/40 rounded-2xl p-4">
                <p className="text-[9px] tracking-[0.25em] uppercase text-[#3D6080] mb-1">Filters</p>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] text-[#4A7AAA]">Min cycles: {minCycles}</label>
                  <input type="range" min={0} max={20} value={minCycles} onChange={e => setMinCycles(Number(e.target.value))}
                    className="w-full appearance-none h-1.5 rounded-full cursor-pointer"
                    style={{ background: `linear-gradient(to right, #3A82F7 ${minCycles/20*100}%, rgba(30,51,88,0.5) ${minCycles/20*100}%)`, accentColor: "#3A82F7" }} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] text-[#4A7AAA]">Min duration: {minDuration}m</label>
                  <input type="range" min={0} max={60} value={minDuration} onChange={e => setMinDuration(Number(e.target.value))}
                    className="w-full appearance-none h-1.5 rounded-full cursor-pointer"
                    style={{ background: `linear-gradient(to right, #7AC4FF ${minDuration/60*100}%, rgba(30,51,88,0.5) ${minDuration/60*100}%)`, accentColor: "#7AC4FF" }} />
                </div>
                {(minCycles > 0 || minDuration > 0) && (
                  <button onClick={() => { setMinCycles(0); setMinDuration(0); }}
                    className="text-[9px] text-[#4A9EFF] hover:underline self-end mt-1">
                    Reset filters
                  </button>
                )}
              </div>

              {/* Sidebar ad */}
              <AdSlot label="Ad · 160×600" className="flex-1 min-h-48" />

              {/* AI hint */}
              <div className="rounded-2xl bg-[#0B1628]/60 border border-[#1E3358]/40 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles size={11} className="text-[#2A5499]" />
                  <p className="text-[9px] tracking-[0.2em] uppercase text-[#4A7AAA]">AI coach</p>
                </div>
                <p className="text-[#4A7AAA] text-[10px] leading-relaxed">
                  Your session history is used to personalise breathing pattern recommendations.
                </p>
              </div>

              {/* Delete all */}
              {sessions.length > 0 && (
                <button onClick={handleDeleteAll}
                  className="flex items-center gap-1.5 text-[10px] text-[#4A7AAA] hover:text-[#FF8A8A] transition-colors px-1">
                  <Trash2 size={11} /> Delete all sessions
                </button>
              )}
            </aside>

            {/* ── Main content ── */}
            <div className="flex-1 min-w-0 flex flex-col gap-4 pt-4">

              {/* Add session panel */}
              {showAdd && (
                <div className="sess-in">
                  <AddSessionPanel onAdd={handleAdd} onClose={() => setShowAdd(false)} />
                </div>
              )}

              {/* Search + sort bar */}
              <div className="flex items-center gap-2 flex-wrap">
                <div className="relative flex-1 min-w-48">
                  <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4A7AAA] pointer-events-none" />
                  <input value={search} onChange={e => setSearch(e.target.value)} placeholder={t("sessions.search")}
                    className="w-full pl-8 pr-8 py-2 rounded-xl bg-[#0B1628]/70 border border-[#1E3358]/50 text-[#7AC4FF] text-xs placeholder-[#2A4060] outline-none focus:border-[#2A5499] transition-colors" />
                  {search && (
                    <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#4A7AAA] hover:text-[#5A8FB8]">
                      <X size={11} />
                    </button>
                  )}
                </div>

                {/* Sort pills */}
                <div className="flex items-center gap-1.5">
                  {(["date","duration","cycles","mood"] as SortKey[]).map(k => (
                    <button key={k} onClick={() => toggleSort(k)}
                      className={`flex items-center gap-1 px-3 py-2 rounded-xl text-[10px] uppercase tracking-widest border transition-all ${
                        sortKey === k
                          ? "bg-[#0D1B33] border-[#2A5499]/60 text-[#7AC4FF]"
                          : "border-[#1E3358]/35 text-[#4A7AAA] hover:border-[#1E3358]/60"
                      }`}>
                      {k}
                      {sortKey === k && (sortDir === "desc" ? <ChevronDown size={10} /> : <ChevronUp size={10} />)}
                    </button>
                  ))}
                </div>

                {/* Mobile filter toggle */}
                <button onClick={() => setFilterOpen(v => !v)}
                  className="lg:hidden flex items-center gap-1.5 px-3 py-2 rounded-xl text-[10px] text-[#4A7AAA] border border-[#1E3358]/35 hover:border-[#1E3358]/60 transition-all">
                  <SlidersHorizontal size={11} /> Filters
                </button>
              </div>

              {/* Mobile filters */}
              {filterOpen && (
                <div className="lg:hidden flex flex-col gap-3 p-4 rounded-2xl bg-[#0B1628]/60 border border-[#1E3358]/40 sess-in">
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { label: `Min cycles: ${minCycles}`, val: minCycles, max: 20, set: setMinCycles, color: "#3A82F7" },
                      { label: `Min duration: ${minDuration}m`, val: minDuration, max: 60, set: setMinDuration, color: "#7AC4FF" },
                    ].map(({ label, val, max, set: s, color }) => (
                      <div key={label} className="flex flex-col gap-1.5">
                        <label className="text-[10px] text-[#4A7AAA]">{label}</label>
                        <input type="range" min={0} max={max} value={val} onChange={e => s(Number(e.target.value))}
                          className="w-full appearance-none h-1.5 rounded-full cursor-pointer"
                          style={{ background: `linear-gradient(to right, ${color} ${val/max*100}%, rgba(30,51,88,0.5) ${val/max*100}%)`, accentColor: color }} />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Status */}
              <p className="text-[10px] text-[#4A7AAA] tracking-wide">
                {loading ? "Loading…" : `${filtered.length} of ${sessions.length} sessions`}
                {(minCycles > 0 || minDuration > 0 || search) ? " · filtered" : ""}
              </p>

              {/* Session list */}
              {loading ? (
                <div className="flex flex-col gap-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="h-16 rounded-2xl animate-pulse bg-[#0A1525]" style={{ opacity: 0.5 - i * 0.08 }} />
                  ))}
                </div>
              ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center gap-4 py-20">
                  <Calendar size={32} className="text-[#3D6080]" />
                  <p className="text-[#4A7AAA] text-sm">
                    {sessions.length === 0 ? "No sessions yet — start meditating!" : "No sessions match your filters"}
                  </p>
                  {sessions.length === 0 && (
                    <Link to="/breathing"
                      className="px-6 py-2.5 rounded-full text-white text-xs font-medium hover:shadow-[0_0_20px_rgba(58,130,247,0.4)] transition-all"
                      style={{ background: ts.btnGradient }}>
                      Start meditating →
                    </Link>
                  )}
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {filtered.map((s, i) => (
                    <div key={s._id} className="sess-in" style={{ animationDelay: `${i * 0.04}s`, opacity: 0 }}>
                      <SessionCard session={s} onDelete={handleDeleteOne} />
                    </div>
                  ))}
                </div>
              )}

              {/* Bottom ad */}
              {!loading && filtered.length > 4 && (
                <AdSlot label="Ad · 300×250 rectangle" className="h-28 mt-2" />
              )}
            </div>
          </div>
        </div>

        <Footer />
      </div>
    </div>
  );
}