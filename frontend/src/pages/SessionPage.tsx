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
  Brain, Sparkles, X, Calendar, BookOpen, ArrowRight,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useThemeStyles } from "../hooks/useThemeStyles";
import ThemeBackground from "../components/ThemeBackground";

// ─── Types ────────────────────────────────────────────────────────────────────
interface NLPData {
  sentiment: 'positive' | 'neutral' | 'negative';
  score: number;
  themes: string[];
  intensity: number;
  suggestedTechnique: string;
  oneLineSummary: string;
  analyzedAt: string;
}

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
  nlp?: NLPData;
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

const TECHNIQUE_LABELS: Record<string, string> = {
  'box-breathing': 'Box Breathing', '4-7-8': '4-7-8 Breathing',
  'wim-hof': 'Wim Hof Method', 'coherent': 'Coherent Breathing',
  'belly': 'Belly Breathing', 'morning-ritual': 'Morning Ritual',
};
const TECHNIQUE_LINKS: Record<string, string> = {
  'box-breathing': '/breathing/box-breathing', '4-7-8': '/breathing/4-7-8',
  'wim-hof': '/breathing/wim-hof', 'coherent': '/breathing',
  'belly': '/breathing', 'morning-ritual': '/breathing/morning-ritual',
};

function sentimentColor(s: string | undefined, accent: string) {
  if (s === 'positive') return accent;
  if (s === 'negative') return '#FF8A8A';
  return '#7AAEC8';
}

function JournalEntryCard({ session }: { session: Session }) {
  const ts = useThemeStyles();
  const [expanded, setExpanded] = useState(false);
  const nlp = session.nlp;
  const date = new Date(session.sessionDate);

  const emoji = nlp?.sentiment === 'positive' ? '😌' : nlp?.sentiment === 'negative' ? '😟' : '😐';

  return (
    <div className="rounded-2xl overflow-hidden transition-all"
      style={{ backgroundColor: ts.cardBg, border: `1px solid ${ts.border}` }}>
      <button
        className="w-full flex items-start gap-3 p-4 text-left hover:opacity-80 transition-opacity"
        onClick={() => setExpanded(e => !e)}
      >
        <span className="text-xl flex-shrink-0 mt-0.5">{emoji}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <p className="text-xs font-medium" style={{ color: ts.textPrimary }}>
              {date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
              <span className="font-normal ml-1.5" style={{ color: ts.textMuted }}>
                {date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </p>
            {session.sessionLength > 0 && (
              <span className="text-[10px] px-2 py-0.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: `${ts.accent}18`, color: ts.accent }}>
                {session.sessionLength}m
              </span>
            )}
          </div>
          {session.notes && (
            <p className="text-xs leading-relaxed line-clamp-2" style={{ color: ts.textSecondary }}>
              {session.notes}
            </p>
          )}
          {nlp?.oneLineSummary && !expanded && (
            <p className="text-xs mt-1.5 italic" style={{ color: sentimentColor(nlp.sentiment, ts.accent) }}>
              {nlp.oneLineSummary}
            </p>
          )}
        </div>
        <span className="flex-shrink-0 mt-1" style={{ color: ts.textMuted }}>
          {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </span>
      </button>

      {expanded && nlp && (
        <div className="px-4 pb-4 border-t flex flex-col gap-3" style={{ borderColor: ts.border, paddingTop: 12 }}>
          <p className="text-xs italic" style={{ color: sentimentColor(nlp.sentiment, ts.accent) }}>
            "{nlp.oneLineSummary}"
          </p>
          {/* Score bar */}
          <div className="flex items-center gap-3">
            <span className="text-[10px] uppercase tracking-wider flex-shrink-0" style={{ color: ts.textMuted }}>Score</span>
            <div className="flex-1 h-1.5 rounded-full overflow-hidden bg-white/10">
              <div className="h-full rounded-full" style={{
                width: `${((nlp.score + 1) / 2) * 100}%`,
                background: nlp.score > 0.2 ? ts.accent : nlp.score < -0.2 ? '#FF8A8A' : '#7AAEC8',
              }} />
            </div>
            <span className="text-xs font-medium tabular-nums flex-shrink-0"
              style={{ color: sentimentColor(nlp.sentiment, ts.accent) }}>
              {nlp.score >= 0 ? '+' : ''}{nlp.score.toFixed(2)}
            </span>
          </div>
          {/* Themes */}
          {nlp.themes.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {nlp.themes.map(t => (
                <span key={t} className="text-[10px] px-2 py-0.5 rounded-full capitalize"
                  style={{ backgroundColor: `${ts.accent}18`, color: ts.accent }}>{t}</span>
              ))}
              <span className="text-[10px] px-2 py-0.5 rounded-full"
                style={{ backgroundColor: ts.border, color: ts.textMuted }}>intensity {nlp.intensity}/10</span>
            </div>
          )}
          {/* Technique */}
          {nlp.suggestedTechnique && (
            <div className="flex items-center justify-between">
              <p className="text-xs" style={{ color: ts.textMuted }}>
                Try: <span className="font-medium" style={{ color: ts.textSecondary }}>
                  {TECHNIQUE_LABELS[nlp.suggestedTechnique] ?? nlp.suggestedTechnique}
                </span>
              </p>
              <Link to={TECHNIQUE_LINKS[nlp.suggestedTechnique] ?? '/breathing'}
                className="flex items-center gap-1 text-xs font-medium hover:opacity-80"
                style={{ color: ts.accent }}>
                Try it <ArrowRight size={11} />
              </Link>
            </div>
          )}
          {/* Full notes */}
          {session.notes && (
            <div className="rounded-xl p-3" style={{ backgroundColor: `${ts.border}40` }}>
              <p className="text-[10px] uppercase tracking-wider mb-1.5" style={{ color: ts.textMuted }}>Notes</p>
              <p className="text-xs leading-relaxed whitespace-pre-wrap" style={{ color: ts.textSecondary }}>
                {session.notes}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Ad slot ──────────────────────────────────────────────────────────────────
function AdSlot({ label = "Advertisement", className = "" }: { label?: string; className?: string }) {
  const ts = useThemeStyles();
  return (
    <div
      className={`flex items-center justify-center border border-dashed rounded-xl ${className}`}
      style={{ borderColor: ts.border, backgroundColor: `${ts.cardBg}40` }}
    >
      <span className="text-[9px] tracking-[0.25em] uppercase select-none" style={{ color: ts.textDim }}>{label}</span>
    </div>
  );
}

// ─── Stat summary card ────────────────────────────────────────────────────────
function SummaryCard({ icon, label, value, sub }: { icon: React.ReactNode; label: string; value: string; sub?: string }) {
  const ts = useThemeStyles();
  return (
    <div className="flex items-center gap-3 px-4 py-3 rounded-2xl border"
      style={{ backgroundColor: ts.cardBg, borderColor: ts.border }}>
      <span style={{ color: `${ts.accent}BB` }}>{icon}</span>
      <div>
        <p className="text-base sm:text-lg font-medium tabular-nums leading-none" style={{ color: ts.textPrimary }}>{value}</p>
        <p className="text-[9px] uppercase tracking-widest mt-0.5" style={{ color: ts.textMuted }}>{label}</p>
        {sub && <p className="text-[9px] mt-0.5" style={{ color: ts.textDim }}>{sub}</p>}
      </div>
    </div>
  );
}

// ─── Mini bar (score visualiser) ─────────────────────────────────────────────
function MiniBar({ value, max = 10, color }: { value: number; max?: number; color: string }) {
  const ts = useThemeStyles();
  return (
    <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ background: `${ts.border}66` }}>
      <div className="h-full rounded-full transition-all" style={{ width: `${(value / max) * 100}%`, background: color }} />
    </div>
  );
}

// ─── Score row ────────────────────────────────────────────────────────────────
function ScoreRow({ label, value, color }: { label: string; value: number; color: string }) {
  const ts = useThemeStyles();
  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] w-16 flex-shrink-0" style={{ color: ts.textDim }}>{label}</span>
      <MiniBar value={value} color={color} />
      <span className="text-[10px] tabular-nums flex-shrink-0" style={{ color }}>{value}</span>
    </div>
  );
}

// ─── Session card ─────────────────────────────────────────────────────────────
function SessionCard({ session, onDelete }: { session: Session; onDelete: (id: string) => void }) {
  const ts = useThemeStyles();
  const [expanded, setExpanded] = useState(false);
  const delta = session.moodAfter - session.moodBefore;
  const deltaCol = delta > 0 ? ts.accent : delta < 0 ? "#FF8A8A" : ts.textDim;

  return (
    <div
      className="flex flex-col rounded-2xl border transition-all duration-300 overflow-hidden"
      style={{
        backgroundColor: expanded ? ts.cardBgHover : ts.cardBg,
        borderColor: expanded ? ts.borderHover : ts.border,
        boxShadow: expanded ? `0 0 24px ${ts.accent}10` : "none",
      }}
    >
      {/* Header row */}
      <div className="flex items-center gap-3 px-4 py-3 cursor-pointer select-none"
        onClick={() => setExpanded(e => !e)}>
        <span className="text-xl flex-shrink-0">{moodEmoji(session.moodAfter)}</span>

        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium truncate" style={{ color: ts.textPrimary }}>{fmtDate(session.sessionDate)}</p>
          <p className="text-[10px] truncate" style={{ color: ts.textMuted }}>
            {fmtTime(session.sessionDate)} · {session.sessionLength}m · {session.cycles} cycles · {session.noiseLevel}
          </p>
        </div>

        <span className="text-[10px] px-2 py-0.5 rounded-full border flex-shrink-0 tabular-nums"
          style={{ color: deltaCol, borderColor: `${deltaCol}33`, background: `${deltaCol}0D` }}>
          {session.moodBefore}→{session.moodAfter} {delta > 0 ? `+${delta}` : delta < 0 ? `${delta}` : "="}
        </span>

        <span className="flex-shrink-0" style={{ color: ts.textDim }}>
          {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </span>
      </div>

      {/* Expanded detail */}
      {expanded && (
        <div className="px-4 pb-4 flex flex-col gap-3 border-t pt-3" style={{ borderColor: `${ts.border}50` }}>
          <div className="flex flex-col gap-1.5">
            <ScoreRow label="Focus"    value={session.focusLevel}     color={ts.accent} />
            <ScoreRow label="Calmness" value={session.calmnessScore}  color={ts.accentLight} />
            <ScoreRow label="Breath"   value={session.breathingDepth} color={ts.accent} />
            <ScoreRow label="Stress"   value={session.stressLevel}    color="#FF8A8A" />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px]" style={{ color: ts.textMuted }}>Distractions:</span>
            <div className="flex gap-1">
              {Array.from({ length: Math.min(session.distractionCount, 10) }).map((_, i) => (
                <span key={i} className="w-1.5 h-1.5 rounded-full bg-[#FF8A8A]/40" />
              ))}
              {session.distractionCount === 0 && <span className="text-[10px]" style={{ color: ts.textDim }}>none</span>}
            </div>
            {session.distractionCount > 10 && (
              <span className="text-[10px]" style={{ color: ts.textDim }}>+{session.distractionCount - 10}</span>
            )}
          </div>

          {session.notes && (
            <p className="text-[10px] italic leading-relaxed border-t pt-2"
              style={{ color: ts.textMuted, borderColor: `${ts.border}40` }}>
              "{session.notes}"
            </p>
          )}

          <button onClick={() => onDelete(session._id)}
            className="self-end flex items-center gap-1.5 text-[10px] hover:text-[#FF8A8A] transition-colors"
            style={{ color: ts.textMuted }}>
            <Trash2 size={11} /> Delete
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Inline "Add Session" form ────────────────────────────────────────────────
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

function DotSlider({ value, max = 10, onChange, color }: {
  value: number; max?: number; onChange: (v: number) => void; color: string;
}) {
  const ts = useThemeStyles();
  return (
    <div className="flex items-center gap-1 flex-wrap">
      {Array.from({ length: max + 1 }, (_, i) => (
        <button key={i} type="button" onClick={() => onChange(i)}
          className="rounded-full transition-all duration-100"
          style={{
            width: i <= value ? 12 : 10, height: i <= value ? 12 : 10, flexShrink: 0,
            background: i <= value ? color : ts.border,
            opacity: i <= value ? 1 : 0.4,
          }} />
      ))}
      <span className="text-[10px] tabular-nums ml-1" style={{ color }}>{value}</span>
    </div>
  );
}

function AddSessionPanel({ onAdd, onClose }: { onAdd: (s: Omit<Session, "_id">) => void; onClose: () => void }) {
  const ts = useThemeStyles();
  const { t } = useTranslation();
  const [step, setStep]         = useState(0);
  const [form, setForm]         = useState({ ...emptyForm });
  const [feelings, setFeelings] = useState<string[]>([]);
  const set = <K extends keyof typeof emptyForm>(k: K, v: typeof emptyForm[K]) => setForm(p => ({ ...p, [k]: v }));
  const toggleFeeling = (f: string) => setFeelings(p => p.includes(f) ? p.filter(x => x !== f) : [...p, f]);

  const handleSave = () => {
    const finalNotes = [form.notes, feelings.length ? `Feelings: ${feelings.join(", ")}` : ""].filter(Boolean).join(" | ");
    onAdd({ ...form, timeOfDay: new Date(form.sessionDate).toLocaleTimeString([], { hour12: false }), notes: finalNotes, sessionDate: new Date(form.sessionDate).toISOString() });
    setStep(0); setForm({ ...emptyForm }); setFeelings([]);
  };

  const STEPS = [t('sessions.steps.when'), t('sessions.steps.mood'), t('sessions.steps.feelings'), t('sessions.steps.quality')];
  const NOISE_LABELS: Record<string, string> = {
    Silent: t('sessions.noise.silent'), Quiet: t('sessions.noise.quiet'),
    Moderate: t('sessions.noise.moderate'), Noisy: t('sessions.noise.noisy'),
  };
  const FEELING_LABELS: Record<string, string> = {
    focused: t('sessions.feelings.focused'), calm: t('sessions.feelings.calm'),
    energized: t('sessions.feelings.energized'), drowsy: t('sessions.feelings.drowsy'),
    distracted: t('sessions.feelings.distracted'), peaceful: t('sessions.feelings.peaceful'),
    anxious: t('sessions.feelings.anxious'), refreshed: t('sessions.feelings.refreshed'),
  };

  const inputCls = "outline-none transition-colors text-xs rounded-xl px-3 py-2";
  const inputStyle = {
    backgroundColor: ts.cardBg,
    border: `1px solid ${ts.border}`,
    color: ts.textPrimary,
  };

  const moodDelta = form.moodAfter - form.moodBefore;
  const moodDeltaColor = moodDelta > 0 ? ts.accent : moodDelta < 0 ? "#FF8A8A" : ts.textDim;

  return (
    <div className="rounded-3xl overflow-hidden border"
      style={{
        backgroundColor: ts.cardBg,
        borderColor: ts.borderHover,
        boxShadow: `0 0 60px ${ts.accent}10, 0 20px 50px rgba(0,0,0,0.4)`,
      }}>
      {/* Top glow */}
      <div className="h-px w-full"
        style={{ background: `linear-gradient(to right, transparent, ${ts.accentLight}4D, transparent)` }} />

      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: ts.border }}>
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: ts.btnGradient, boxShadow: ts.btnShadow }}>
            <Brain size={13} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-medium leading-none" style={{ color: ts.textPrimary }}>Log a session</p>
            <p className="text-[10px] mt-0.5" style={{ color: ts.textMuted }}>Your data trains your personal AI coach</p>
          </div>
        </div>
        <button onClick={onClose} className="transition-colors p-1" style={{ color: ts.textMuted }}>
          <X size={15} />
        </button>
      </div>

      {/* Step tabs */}
      <div className="flex border-b" style={{ borderColor: ts.border }}>
        {STEPS.map((s, i) => (
          <button key={i} onClick={() => setStep(i)}
            className="flex-1 py-2 text-[9px] uppercase tracking-widest transition-colors"
            style={{
              color: step === i ? ts.textPrimary : ts.textDim,
              borderBottom: step === i ? `1px solid ${ts.accent}` : "none",
            }}>
            {s}
          </button>
        ))}
      </div>

      <div className="px-6 py-5 flex flex-col gap-4" style={{ minHeight: 260 }}>

        {/* Step 0 — when & duration */}
        {step === 0 && (
          <>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase tracking-widest" style={{ color: ts.textDim }}>Date & time</label>
              <input type="datetime-local" value={form.sessionDate}
                onChange={e => set("sessionDate", e.target.value)}
                className={inputCls} style={inputStyle} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase tracking-widest" style={{ color: ts.textDim }}>Duration (min)</label>
                <input type="number" min={1} max={120} value={form.sessionLength}
                  onChange={e => set("sessionLength", Number(e.target.value))}
                  className={inputCls} style={inputStyle} />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase tracking-widest" style={{ color: ts.textDim }}>Cycles</label>
                <input type="number" min={0} max={200} value={form.cycles}
                  onChange={e => set("cycles", Number(e.target.value))}
                  className={inputCls} style={inputStyle} />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase tracking-widest" style={{ color: ts.textDim }}>Noise level</label>
              <div className="flex gap-2">
                {NOISE_OPTS.map(n => (
                  <button key={n} type="button" onClick={() => set("noiseLevel", n)}
                    className="flex-1 py-2 rounded-xl text-[10px] border transition-all"
                    style={{
                      borderColor: form.noiseLevel === n ? ts.borderHover : ts.border,
                      backgroundColor: form.noiseLevel === n ? ts.cardBgHover : "transparent",
                      color: form.noiseLevel === n ? ts.textPrimary : ts.textMuted,
                    }}>
                    {NOISE_LABELS[n] ?? n}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Step 1 — mood shift */}
        {step === 1 && (
          <div className="flex flex-col gap-4">
            <p className="text-xs" style={{ color: ts.textMuted }}>How did your mood shift during this session?</p>
            {(["Before", "After"] as const).map((label, i) => {
              const key = i === 0 ? "moodBefore" : "moodAfter" as const;
              const val = form[key];
              const color = i === 0 ? ts.textDim : ts.accent;
              return (
                <div key={label} className="flex items-center gap-3">
                  <span className="text-[10px] uppercase tracking-widest w-12 flex-shrink-0" style={{ color: ts.textMuted }}>{label}</span>
                  <input type="range" min={1} max={10} step={1} value={val}
                    onChange={e => set(key, Number(e.target.value))}
                    className="flex-1 appearance-none h-1.5 rounded-full cursor-pointer"
                    style={{ background: `linear-gradient(to right, ${color} ${(val-1)/9*100}%, ${ts.border}80 ${(val-1)/9*100}%)`, accentColor: color }} />
                  <span className="text-xs tabular-nums w-5 text-right flex-shrink-0" style={{ color }}>{val}</span>
                </div>
              );
            })}
            <div className="flex items-center justify-center">
              <span className="text-xs px-3 py-1 rounded-full border tabular-nums"
                style={{ color: moodDeltaColor, borderColor: `${moodDeltaColor}33`, background: `${moodDeltaColor}0D` }}>
                {moodDelta > 0 ? `+${moodDelta} better` : moodDelta < 0 ? `${moodDelta} worse` : "no change"}
              </span>
            </div>
          </div>
        )}

        {/* Step 2 — feelings grid */}
        {step === 2 && (
          <div className="flex flex-col gap-3">
            <p className="text-xs" style={{ color: ts.textMuted }}>How did you feel after? Pick all that apply.</p>
            <div className="grid grid-cols-4 gap-2">
              {FEELINGS.map(f => {
                const on = feelings.includes(f);
                return (
                  <button key={f} type="button" onClick={() => toggleFeeling(f)}
                    className="flex flex-col items-center gap-1 py-2.5 rounded-xl border text-center transition-all duration-200"
                    style={{
                      borderColor: on ? ts.borderHover : ts.border,
                      backgroundColor: on ? ts.cardBgHover : "transparent",
                    }}>
                    <span className={`text-base transition-all ${on ? "" : "opacity-45"}`}>{FEELING_ICONS[f]}</span>
                    <span className="text-[9px] uppercase tracking-wide" style={{ color: on ? ts.textPrimary : ts.textDim }}>{FEELING_LABELS[f] ?? f}</span>
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
              { label: "Focus",    key: "focusLevel" as const,    color: ts.accent },
              { label: "Calmness", key: "calmnessScore" as const, color: ts.accentLight },
              { label: "Breath",   key: "breathingDepth" as const,color: ts.accent },
              { label: "Stress",   key: "stressLevel" as const,   color: "#FF8A8A" },
            ].map(({ label, key, color }) => (
              <div key={key} className="flex flex-col gap-1">
                <span className="text-[10px] uppercase tracking-widest" style={{ color: ts.textDim }}>{label}</span>
                <DotSlider value={form[key] as number} onChange={v => set(key, v)} color={color} />
              </div>
            ))}
            <div className="flex flex-col gap-1 mt-1">
              <span className="text-[10px] uppercase tracking-widest" style={{ color: ts.textDim }}>Notes (optional)</span>
              <textarea value={form.notes} onChange={e => set("notes", e.target.value)} rows={2}
                placeholder="Any observations…"
                className={`${inputCls} resize-none`} style={inputStyle} />
            </div>
          </div>
        )}
      </div>

      {/* Footer nav */}
      <div className="flex items-center gap-3 px-6 pb-5">
        {step > 0 && (
          <button onClick={() => setStep(s => s - 1)}
            className="px-4 py-2 rounded-xl text-xs transition-all"
            style={{ color: ts.textMuted, border: `1px solid ${ts.border}` }}>
            Back
          </button>
        )}
        <div className="flex-1" />
        {step < 3 ? (
          <button onClick={() => setStep(s => s + 1)}
            className="px-6 py-2 rounded-xl text-xs text-white font-medium tracking-wide hover:scale-105 active:scale-95 transition-all"
            style={{ background: ts.btnGradient, boxShadow: ts.btnShadow }}>
            Continue →
          </button>
        ) : (
          <button onClick={handleSave}
            className="px-6 py-2 rounded-xl text-xs text-white font-medium tracking-wide hover:scale-105 active:scale-95 transition-all"
            style={{ background: ts.btnGradient, boxShadow: ts.btnShadow }}>
            Save session ✓
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
type SortKey = "date" | "duration" | "cycles" | "mood";

export function SessionsSection() {
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
  const [activeTab, setActiveTab]   = useState<"sessions"|"journal">("sessions");

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

  const totalMins   = Math.round(sessions.reduce((s, x) => s + x.sessionLength, 0));
  const totalCycles = Math.round(sessions.reduce((s, x) => s + x.cycles, 0));
  const avgMoodDelta = sessions.length
    ? (sessions.reduce((s, x) => s + (x.moodAfter - x.moodBefore), 0) / sessions.length).toFixed(1)
    : "—";

  // ── Journal data (derived from sessions) ────────────────────────────────────
  const journalSessions = useMemo(() =>
    [...sessions].filter(s => s.nlp?.analyzedAt).sort(
      (a, b) => new Date(b.sessionDate).getTime() - new Date(a.sessionDate).getTime()
    ), [sessions]);

  const journalGroups = useMemo(() => {
    const map = new Map<string, Session[]>();
    journalSessions.forEach(s => {
      const key = new Date(s.sessionDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(s);
    });
    return map;
  }, [journalSessions]);

  const journalStats = useMemo(() => {
    if (!journalSessions.length) return null;
    const scores = journalSessions.map(s => s.nlp!.score);
    const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
    const sentimentDist = { positive: 0, neutral: 0, negative: 0 };
    const themeCounts: Record<string, number> = {};
    journalSessions.forEach(s => {
      if (s.nlp!.sentiment) sentimentDist[s.nlp!.sentiment]++;
      (s.nlp!.themes ?? []).forEach(t => { themeCounts[t] = (themeCounts[t] || 0) + 1; });
    });
    const topThemes = Object.entries(themeCounts)
      .sort((a, b) => b[1] - a[1]).slice(0, 5)
      .map(([theme, count]) => ({ theme, count }));
    return { avgScore, sentimentDist, topThemes };
  }, [journalSessions]);

  return (
    <>
      <style>{`
        @keyframes sessFadeUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        .sess-in { animation: sessFadeUp 0.5s ease forwards; }
        input[type=range]::-webkit-slider-thumb {
          -webkit-appearance:none; width:13px; height:13px;
          border-radius:50%; background:${ts.accentLight};
          box-shadow: 0 0 6px ${ts.accent}80; cursor:pointer; margin-top:-4px;
        }
        input[type=range]::-webkit-slider-runnable-track { height:4px; border-radius:4px; }
      `}</style>

        {/* Top ad */}
        <div className="max-w-6xl mx-auto w-full px-4 sm:px-6 pt-4">
          <AdSlot label="Ad · 728×90 leaderboard" className="h-12 sm:h-14" />
        </div>

        {/* Page header */}
        <header className="max-w-6xl mx-auto w-full px-4 sm:px-6 pt-6 pb-2">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <p className="text-[10px] tracking-[0.3em] uppercase mb-1" style={{ color: ts.textMuted }}>Breathe · History</p>
              <h1 className="text-2xl sm:text-3xl font-light tracking-wide" style={{ color: ts.textPrimary }}>My Sessions</h1>
            </div>
            {activeTab === "sessions" && (
              <button
                onClick={() => setShowAdd(v => !v)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-full text-white text-sm font-medium tracking-wide transition-all hover:scale-105 active:scale-95"
                style={{ background: ts.btnGradient, boxShadow: ts.btnShadow }}
              >
                {showAdd ? <X size={14} /> : <Plus size={14} />}
                {showAdd ? t("sessions.cancel") : t("sessions.logSession")}
              </button>
            )}
          </div>

          {/* Tab switcher */}
          <div className="flex gap-1 mt-4 p-1 rounded-xl w-fit" style={{ backgroundColor: `${ts.border}60` }}>
            {(["sessions", "journal"] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className="px-5 py-1.5 rounded-lg text-xs font-medium tracking-wide transition-all capitalize"
                style={{
                  backgroundColor: activeTab === tab ? ts.cardBg : 'transparent',
                  color: activeTab === tab ? ts.textPrimary : ts.textMuted,
                  boxShadow: activeTab === tab ? `0 1px 4px rgba(0,0,0,0.2)` : 'none',
                }}
              >
                {tab === "journal" ? `Journal${journalSessions.length ? ` · ${journalSessions.length}` : ""}` : "Sessions"}
              </button>
            ))}
          </div>
        </header>

        {/* ── Journal tab ─────────────────────────────────────────────────────── */}
        {activeTab === "journal" && (
          <div className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 pb-20 flex flex-col gap-5 pt-4">
            {/* Summary card */}
            {journalStats && (
              <div className="rounded-2xl p-5 flex flex-col gap-4"
                style={{ backgroundColor: ts.cardBg, border: `1px solid ${ts.border}` }}>
                <div className="flex items-center gap-2">
                  <Brain size={13} style={{ color: ts.accent }} />
                  <p className="text-[10px] tracking-[0.25em] uppercase" style={{ color: ts.textMuted }}>Emotional overview</p>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-xl font-light tabular-nums" style={{ color: ts.textPrimary }}>{journalSessions.length}</p>
                    <p className="text-[10px] uppercase tracking-wider mt-0.5" style={{ color: ts.textMuted }}>analyzed</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium" style={{
                      color: journalStats.avgScore > 0.2
                        ? ts.accent : journalStats.avgScore < -0.2 ? '#FF8A8A' : '#7AAEC8'
                    }}>
                      {journalStats.avgScore > 0.2 ? 'Generally positive' : journalStats.avgScore < -0.2 ? 'Challenging' : 'Balanced'}
                    </p>
                    <p className="text-[10px] uppercase tracking-wider mt-0.5" style={{ color: ts.textMuted }}>overall mood</p>
                  </div>
                  <div>
                    <p className="text-xl font-light tabular-nums" style={{ color: ts.accent }}>{journalStats.sentimentDist.positive}</p>
                    <p className="text-[10px] uppercase tracking-wider mt-0.5" style={{ color: ts.textMuted }}>positive</p>
                  </div>
                </div>
                {journalStats.topThemes.length > 0 && (
                  <div>
                    <p className="text-[10px] uppercase tracking-wider mb-2" style={{ color: ts.textMuted }}>Recurring themes</p>
                    <div className="flex flex-wrap gap-1.5">
                      {journalStats.topThemes.map(({ theme, count }) => (
                        <span key={theme} className="text-xs px-2.5 py-1 rounded-full capitalize"
                          style={{ backgroundColor: `${ts.accent}18`, color: ts.accent }}>
                          {theme} · {count}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                <div>
                  <div className="flex h-2 rounded-full overflow-hidden gap-0.5">
                    {journalStats.sentimentDist.positive > 0 && (
                      <div style={{ flex: journalStats.sentimentDist.positive, background: ts.accent }} className="rounded-full" />
                    )}
                    {journalStats.sentimentDist.neutral > 0 && (
                      <div style={{ flex: journalStats.sentimentDist.neutral, background: '#7AAEC8' }} className="rounded-full" />
                    )}
                    {journalStats.sentimentDist.negative > 0 && (
                      <div style={{ flex: journalStats.sentimentDist.negative, background: '#FF8A8A' }} className="rounded-full" />
                    )}
                  </div>
                  <div className="flex gap-4 mt-1.5">
                    <span className="text-[10px]" style={{ color: ts.accent }}>● Positive {journalStats.sentimentDist.positive}</span>
                    <span className="text-[10px]" style={{ color: '#7AAEC8' }}>● Neutral {journalStats.sentimentDist.neutral}</span>
                    <span className="text-[10px]" style={{ color: '#FF8A8A' }}>● Difficult {journalStats.sentimentDist.negative}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Empty state */}
            {journalSessions.length === 0 && (
              <div className="flex flex-col items-center justify-center gap-4 py-16 rounded-2xl text-center"
                style={{ backgroundColor: ts.cardBg, border: `1px solid ${ts.border}` }}>
                <BookOpen size={34} style={{ color: ts.textDim }} />
                <div>
                  <p className="text-sm font-medium mb-1" style={{ color: ts.textSecondary }}>Journal is empty</p>
                  <p className="text-xs max-w-xs" style={{ color: ts.textMuted }}>
                    Add notes to your breathing sessions. AI will analyze your emotions and suggest techniques.
                  </p>
                </div>
                <Link to="/breathing"
                  className="flex items-center gap-2 px-5 py-2.5 rounded-full text-white text-sm font-medium hover:scale-105 transition-all"
                  style={{ background: ts.btnGradient }}>
                  Start a session <ArrowRight size={14} />
                </Link>
              </div>
            )}

            {/* Grouped entries */}
            {[...journalGroups.keys()].map(month => (
              <div key={month} className="flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <p className="text-xs font-medium tracking-wide" style={{ color: ts.textMuted }}>{month}</p>
                  <div className="flex-1 h-px" style={{ backgroundColor: ts.border }} />
                  <span className="text-[10px]" style={{ color: ts.textDim }}>
                    {journalGroups.get(month)!.length} {journalGroups.get(month)!.length === 1 ? 'entry' : 'entries'}
                  </span>
                </div>
                {journalGroups.get(month)!.map(s => <JournalEntryCard key={s._id} session={s} />)}
              </div>
            ))}

            {journalSessions.length > 0 && (
              <div className="flex items-start gap-2 px-4 py-3 rounded-xl" style={{ backgroundColor: `${ts.accent}0A` }}>
                <Sparkles size={12} style={{ color: ts.accent }} className="mt-0.5 flex-shrink-0" />
                <p className="text-xs" style={{ color: ts.textMuted }}>
                  The more you journal, the better the AI understands your emotional patterns.
                </p>
              </div>
            )}
          </div>
        )}

        {/* ── Sessions tab ────────────────────────────────────────────────────── */}
        {activeTab === "sessions" && (
        <div className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 pb-20">
          <div className="flex gap-5">

            {/* LEFT sidebar */}
            <aside className="hidden lg:flex flex-col gap-4 w-56 flex-shrink-0 pt-4">
              <div className="flex flex-col gap-2">
                <p className="text-[9px] tracking-[0.25em] uppercase px-1 mb-1" style={{ color: ts.textDim }}>Overview</p>
                <SummaryCard icon={<Timer size={14} />}      label={t("sessions.totalMinutes")} value={`${totalMins}m`} />
                <SummaryCard icon={<Wind size={14} />}       label={t("sessions.totalCycles")}  value={String(totalCycles)} />
                <SummaryCard icon={<Flame size={14} />}      label={t("sessions.sessions")}     value={String(sessions.length)} />
                <SummaryCard icon={<TrendingUp size={14} />} label="Avg mood shift"
                  value={typeof avgMoodDelta === "string" && avgMoodDelta !== "—" && Number(avgMoodDelta) > 0 ? `+${avgMoodDelta}` : String(avgMoodDelta)} />
              </div>

              {/* Filters */}
              <div className="flex flex-col gap-2 rounded-2xl p-4 border"
                style={{ backgroundColor: ts.cardBg, borderColor: ts.border }}>
                <p className="text-[9px] tracking-[0.25em] uppercase mb-1" style={{ color: ts.textDim }}>Filters</p>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px]" style={{ color: ts.textMuted }}>Min cycles: {minCycles}</label>
                  <input type="range" min={0} max={20} value={minCycles} onChange={e => setMinCycles(Number(e.target.value))}
                    className="w-full appearance-none h-1.5 rounded-full cursor-pointer"
                    style={{ background: `linear-gradient(to right, ${ts.accent} ${minCycles/20*100}%, ${ts.border}80 ${minCycles/20*100}%)`, accentColor: ts.accent }} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px]" style={{ color: ts.textMuted }}>Min duration: {minDuration}m</label>
                  <input type="range" min={0} max={60} value={minDuration} onChange={e => setMinDuration(Number(e.target.value))}
                    className="w-full appearance-none h-1.5 rounded-full cursor-pointer"
                    style={{ background: `linear-gradient(to right, ${ts.accentLight} ${minDuration/60*100}%, ${ts.border}80 ${minDuration/60*100}%)`, accentColor: ts.accentLight }} />
                </div>
                {(minCycles > 0 || minDuration > 0) && (
                  <button onClick={() => { setMinCycles(0); setMinDuration(0); }}
                    className="text-[9px] hover:underline self-end mt-1" style={{ color: ts.accent }}>
                    Reset filters
                  </button>
                )}
              </div>

              <AdSlot label="Ad · 160×600" className="flex-1 min-h-48" />

              {/* AI hint */}
              <div className="rounded-2xl border p-4" style={{ backgroundColor: ts.cardBg, borderColor: ts.border }}>
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles size={11} style={{ color: ts.accent }} />
                  <p className="text-[9px] tracking-[0.2em] uppercase" style={{ color: ts.textMuted }}>AI coach</p>
                </div>
                <p className="text-[10px] leading-relaxed" style={{ color: ts.textMuted }}>
                  Your session history is used to personalise breathing pattern recommendations.
                </p>
              </div>

              {/* Challenges shortcut */}
              <Link to="/profile"
                className="flex flex-col gap-2 rounded-2xl border p-4 transition-all hover:opacity-90"
                style={{ backgroundColor: `${ts.accent}0E`, borderColor: `${ts.accent}30` }}>
                <div className="flex items-center justify-between">
                  <span className="text-base">🏆</span>
                  <ArrowRight size={11} style={{ color: ts.accent }} />
                </div>
                <div>
                  <p className="text-[10px] font-semibold" style={{ color: ts.accentLight }}>Challenges</p>
                  <p className="text-[9px] mt-0.5 leading-relaxed" style={{ color: ts.textMuted }}>
                    7 & 21-day streaks to build habits and earn badges
                  </p>
                </div>
              </Link>

              {sessions.length > 0 && (
                <button onClick={handleDeleteAll}
                  className="flex items-center gap-1.5 text-[10px] hover:text-[#FF8A8A] transition-colors px-1"
                  style={{ color: ts.textMuted }}>
                  <Trash2 size={11} /> Delete all sessions
                </button>
              )}
            </aside>

            {/* Main content */}
            <div className="flex-1 min-w-0 flex flex-col gap-4 pt-4">

              {/* Challenges banner — mobile only (desktop sees sidebar card) */}
              <Link to="/profile"
                className="lg:hidden flex items-center justify-between px-4 py-3 rounded-2xl transition-all"
                style={{ backgroundColor: `${ts.accent}0E`, border: `1px solid ${ts.accent}30` }}>
                <div className="flex items-center gap-2.5">
                  <span className="text-lg">🏆</span>
                  <div>
                    <p className="text-xs font-semibold" style={{ color: ts.accentLight }}>Breathing Challenges</p>
                    <p className="text-[10px]" style={{ color: ts.textMuted }}>7 & 21-day streaks · earn badges</p>
                  </div>
                </div>
                <ArrowRight size={13} style={{ color: ts.accent }} />
              </Link>

              {showAdd && (
                <div className="sess-in">
                  <AddSessionPanel onAdd={handleAdd} onClose={() => setShowAdd(false)} />
                </div>
              )}

              {/* Search + sort bar */}
              <div className="flex items-center gap-2 flex-wrap">
                <div className="relative flex-1 min-w-48">
                  <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: ts.textMuted }} />
                  <input value={search} onChange={e => setSearch(e.target.value)} placeholder={t("sessions.search")}
                    className="w-full pl-8 pr-8 py-2 rounded-xl text-xs outline-none transition-colors"
                    style={{ backgroundColor: ts.cardBg, border: `1px solid ${ts.border}`, color: ts.textPrimary }} />
                  {search && (
                    <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                      style={{ color: ts.textMuted }}>
                      <X size={11} />
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-1.5">
                  {(["date","duration","cycles","mood"] as SortKey[]).map(k => (
                    <button key={k} onClick={() => toggleSort(k)}
                      className="flex items-center gap-1 px-3 py-2 rounded-xl text-[10px] uppercase tracking-widest border transition-all"
                      style={{
                        backgroundColor: sortKey === k ? ts.cardBgHover : "transparent",
                        borderColor: sortKey === k ? ts.borderHover : ts.border,
                        color: sortKey === k ? ts.textPrimary : ts.textMuted,
                      }}>
                      {k}
                      {sortKey === k && (sortDir === "desc" ? <ChevronDown size={10} /> : <ChevronUp size={10} />)}
                    </button>
                  ))}
                </div>

                <button onClick={() => setFilterOpen(v => !v)}
                  className="lg:hidden flex items-center gap-1.5 px-3 py-2 rounded-xl text-[10px] border transition-all"
                  style={{ color: ts.textMuted, borderColor: ts.border }}>
                  <SlidersHorizontal size={11} /> Filters
                </button>
              </div>

              {/* Mobile filters */}
              {filterOpen && (
                <div className="lg:hidden flex flex-col gap-3 p-4 rounded-2xl border sess-in"
                  style={{ backgroundColor: ts.cardBg, borderColor: ts.border }}>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { label: `Min cycles: ${minCycles}`,   val: minCycles,   max: 20, setFn: setMinCycles,   color: ts.accent },
                      { label: `Min duration: ${minDuration}m`, val: minDuration, max: 60, setFn: setMinDuration, color: ts.accentLight },
                    ].map(({ label, val, max, setFn, color }) => (
                      <div key={label} className="flex flex-col gap-1.5">
                        <label className="text-[10px]" style={{ color: ts.textMuted }}>{label}</label>
                        <input type="range" min={0} max={max} value={val} onChange={e => setFn(Number(e.target.value))}
                          className="w-full appearance-none h-1.5 rounded-full cursor-pointer"
                          style={{ background: `linear-gradient(to right, ${color} ${val/max*100}%, ${ts.border}80 ${val/max*100}%)`, accentColor: color }} />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Status */}
              <p className="text-[10px] tracking-wide" style={{ color: ts.textMuted }}>
                {loading ? "Loading…" : `${filtered.length} of ${sessions.length} sessions`}
                {(minCycles > 0 || minDuration > 0 || search) ? " · filtered" : ""}
              </p>

              {/* Session list */}
              {loading ? (
                <div className="flex flex-col gap-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="h-16 rounded-2xl animate-pulse"
                      style={{ backgroundColor: ts.cardBg, opacity: 0.5 - i * 0.08 }} />
                  ))}
                </div>
              ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center gap-4 py-20">
                  <Calendar size={32} style={{ color: ts.textDim }} />
                  <p className="text-sm" style={{ color: ts.textMuted }}>
                    {sessions.length === 0 ? "No sessions yet — start meditating!" : "No sessions match your filters"}
                  </p>
                  {sessions.length === 0 && (
                    <Link to="/breathing"
                      className="px-6 py-2.5 rounded-full text-white text-xs font-medium hover:scale-105 transition-all"
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

              {!loading && filtered.length > 4 && (
                <AdSlot label="Ad · 300×250 rectangle" className="h-28 mt-2" />
              )}
            </div>
          </div>
        </div>
        )}

    </>
  );
}

export default function SessionsPage() {
  return (
    <div className="relative flex flex-col min-h-screen font-montserrat">
      <ThemeBackground />
      <div className="relative z-10 flex flex-col min-h-screen">
        <NavBar />
        <SessionsSection />
        <Footer />
      </div>
    </div>
  );
}
