// src/components/SessionFeedbackModal.tsx
import React, { useState } from "react";
import { X, Sparkles, Brain } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
interface FeedbackData {
  moodBefore: number;
  moodAfter: number;
  focusLevel: number;
  stressLevel: number;
  breathingDepth: number;
  calmnessScore: number;
  distractionCount: number;
  noiseLevel: string;
  notes: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  initialData: FeedbackData;
  onSubmit: (data: FeedbackData) => void;
}

// ─── Step indicator ───────────────────────────────────────────────────────────
function StepDot({ active, done }: { active: boolean; done: boolean }) {
  return (
    <div
      className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
        done ? "bg-[#4A9EFF]" : active ? "bg-[#7AC4FF] scale-125" : "bg-[#1E3358]"
      }`}
    />
  );
}

// ─── Mood emoji picker ────────────────────────────────────────────────────────
const MOODS = [
  { value: 1,  emoji: "😞", label: "Rough"    },
  { value: 3,  emoji: "😐", label: "Meh"      },
  { value: 5,  emoji: "🙂", label: "Okay"     },
  { value: 7,  emoji: "😊", label: "Good"     },
  { value: 10, emoji: "🌟", label: "Amazing"  },
];

function MoodPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex items-end justify-between gap-2">
      {MOODS.map(m => {
        const active = value >= m.value && (m.value === 10 ? value === 10 : value < (MOODS[MOODS.findIndex(x => x.value === m.value) + 1]?.value ?? 11));
        const selected = value === m.value;
        return (
          <button
            key={m.value}
            type="button"
            onClick={() => onChange(m.value)}
            className={`flex flex-col items-center gap-1 flex-1 py-2 rounded-xl border transition-all duration-200 ${
              selected
                ? "border-[#2A5499]/70 bg-[#0D1B33] shadow-[0_0_14px_rgba(74,158,255,0.12)]"
                : "border-[#1E3358]/40 hover:border-[#1E3358]/70 hover:bg-[#0A1525]/50"
            }`}
          >
            <span className={`transition-all duration-200 ${selected ? "text-2xl" : "text-xl opacity-60"}`}>
              {m.emoji}
            </span>
            <span className={`text-[9px] tracking-wide uppercase transition-colors ${selected ? "text-[#7AC4FF]" : "text-[#1E3358]"}`}>
              {m.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

// ─── Compact dual-thumb range (before → after) ───────────────────────────────
function BeforeAfterSlider({
  before, after,
  onBefore, onAfter,
}: { before: number; after: number; onBefore: (v: number) => void; onAfter: (v: number) => void }) {
  return (
    <div className="flex flex-col gap-2">
      {["Before", "After"].map((label, i) => {
        const val = i === 0 ? before : after;
        const set = i === 0 ? onBefore : onAfter;
        const color = i === 0 ? "#3D6080" : "#3A82F7";
        return (
          <div key={label} className="flex items-center gap-3">
            <span className="text-[10px] uppercase tracking-widest text-[#2A4060] w-12 flex-shrink-0">{label}</span>
            <div className="flex-1 relative">
              <input
                type="range"
                min={1} max={10} step={1}
                value={val}
                onChange={e => set(Number(e.target.value))}
                className="w-full appearance-none h-1.5 rounded-full cursor-pointer"
                style={{
                  background: `linear-gradient(to right, ${color} 0%, ${color} ${(val - 1) / 9 * 100}%, rgba(30,51,88,0.5) ${(val - 1) / 9 * 100}%, rgba(30,51,88,0.5) 100%)`,
                  accentColor: color,
                }}
              />
            </div>
            <span className="text-xs tabular-nums w-5 text-right" style={{ color }}>{val}</span>
          </div>
        );
      })}
    </div>
  );
}

// ─── Tag checkbox grid ────────────────────────────────────────────────────────
function TagGrid({ selected, onToggle }: { selected: string[]; onToggle: (t: string) => void }) {
  const tags = [
    { key: "focused",     icon: "🎯", label: "Focused"      },
    { key: "calm",        icon: "🌊", label: "Calm"         },
    { key: "energized",   icon: "⚡", label: "Energized"    },
    { key: "drowsy",      icon: "💤", label: "Drowsy"       },
    { key: "distracted",  icon: "🌀", label: "Distracted"   },
    { key: "peaceful",    icon: "☮️", label: "Peaceful"     },
    { key: "anxious",     icon: "😰", label: "Anxious"      },
    { key: "refreshed",   icon: "🌿", label: "Refreshed"    },
  ];
  return (
    <div className="grid grid-cols-4 gap-2">
      {tags.map(t => {
        const on = selected.includes(t.key);
        return (
          <button
            key={t.key}
            type="button"
            onClick={() => onToggle(t.key)}
            className={`flex flex-col items-center gap-1 py-2.5 rounded-xl border text-center transition-all duration-200 ${
              on
                ? "border-[#2A5499]/70 bg-[#0D1B33] shadow-[0_0_10px_rgba(74,158,255,0.1)]"
                : "border-[#1E3358]/35 hover:border-[#1E3358]/70 hover:bg-[#0A1525]/40"
            }`}
          >
            <span className={`text-base transition-all ${on ? "" : "opacity-50"}`}>{t.icon}</span>
            <span className={`text-[9px] uppercase tracking-wide transition-colors ${on ? "text-[#7AC4FF]" : "text-[#1E3358]"}`}>
              {t.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

// ─── Noise level pill select ──────────────────────────────────────────────────
const NOISE_OPTS = [
  { value: "Silent",   icon: "🔇" },
  { value: "Quiet",    icon: "🔉" },
  { value: "Moderate", icon: "🔊" },
  { value: "Noisy",    icon: "📢" },
];

function NoisePicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex gap-2">
      {NOISE_OPTS.map(o => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className={`flex-1 flex flex-col items-center gap-1 py-2 rounded-xl border text-center transition-all duration-200 ${
            value === o.value
              ? "border-[#2A5499]/70 bg-[#0D1B33] shadow-[0_0_10px_rgba(74,158,255,0.1)]"
              : "border-[#1E3358]/35 hover:border-[#1E3358]/60"
          }`}
        >
          <span className={`text-base transition-all ${value === o.value ? "" : "opacity-50"}`}>{o.icon}</span>
          <span className={`text-[9px] uppercase tracking-wide ${value === o.value ? "text-[#7AC4FF]" : "text-[#1E3358]"}`}>
            {o.value}
          </span>
        </button>
      ))}
    </div>
  );
}

// ─── Simple 0–10 dot-row slider ───────────────────────────────────────────────
function DotSlider({ value, max = 10, onChange, color = "#3A82F7" }: {
  value: number; max?: number; onChange: (v: number) => void; color?: string;
}) {
  return (
    <div className="flex items-center gap-1.5">
      {Array.from({ length: max + 1 }, (_, i) => (
        <button
          key={i}
          type="button"
          onClick={() => onChange(i)}
          className={`rounded-full transition-all duration-150 ${i <= value ? "w-3 h-3" : "w-2.5 h-2.5 opacity-25"}`}
          style={{ background: i <= value ? color : "#1E3358", flexShrink: 0 }}
        />
      ))}
      <span className="text-xs tabular-nums ml-1 text-[#3D6080]">{value}</span>
    </div>
  );
}

// ─── STEPS config ─────────────────────────────────────────────────────────────
const TOTAL_STEPS = 4;

// ─── Main modal ───────────────────────────────────────────────────────────────
export function SessionFeedbackModal({ open, onClose, initialData, onSubmit }: Props) {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FeedbackData>(initialData);
  const [feelings, setFeelings] = useState<string[]>([]);

  const set = <K extends keyof FeedbackData>(key: K, val: FeedbackData[K]) =>
    setForm(prev => ({ ...prev, [key]: val }));

  const toggleFeeling = (t: string) =>
    setFeelings(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]);

  const handleSubmit = () => {
    const finalNotes = [
      form.notes,
      feelings.length ? `Feelings: ${feelings.join(", ")}` : "",
    ].filter(Boolean).join(" | ");
    onSubmit({ ...form, notes: finalNotes });
    // reset
    setStep(0);
    setFeelings([]);
  };

  if (!open) return null;

  return (
    <>
      <style>{`
        @keyframes fbSlideUp {
          from { opacity:0; transform:translateY(24px) scale(0.97); }
          to   { opacity:1; transform:translateY(0)    scale(1);    }
        }
        @keyframes fbFadeIn { from{opacity:0} to{opacity:1} }
        .fb-modal { animation: fbSlideUp 0.4s cubic-bezier(0.34,1.4,0.64,1) forwards; }
        .fb-overlay { animation: fbFadeIn 0.25s ease forwards; }

        /* native range track */
        input[type=range]::-webkit-slider-thumb {
          -webkit-appearance:none; width:14px; height:14px;
          border-radius:50%; background:#7AC4FF;
          box-shadow: 0 0 8px rgba(74,158,255,0.5);
          cursor:pointer; margin-top:-5px;
        }
        input[type=range]::-webkit-slider-runnable-track {
          height:4px; border-radius:4px;
        }
        input[type=range]::-moz-range-thumb {
          width:14px; height:14px; border-radius:50%;
          background:#7AC4FF; border:none; cursor:pointer;
        }
      `}</style>

      {/* Overlay */}
      <div
        className="fb-overlay fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-4"
        style={{ background: "rgba(1,8,20,0.85)", backdropFilter: "blur(6px)" }}
        onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      >
        {/* Panel */}
        <div
          className="fb-modal relative w-full max-w-md rounded-3xl overflow-hidden"
          style={{
            background: "linear-gradient(160deg,#070E1F 0%,#050A18 100%)",
            border: "1px solid rgba(42,84,153,0.45)",
            boxShadow: "0 0 80px rgba(74,158,255,0.08), 0 24px 60px rgba(0,0,0,0.7)",
          }}
        >
          {/* Top glow line */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-px bg-gradient-to-r from-transparent via-[#4A9EFF]/40 to-transparent" />

          {/* Header */}
          <div className="flex items-center justify-between px-6 pt-6 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg,#1A5FCC,#3A82F7)", boxShadow: "0 0 16px rgba(74,158,255,0.35)" }}>
                <Brain size={14} className="text-white" />
              </div>
              <div>
                <p className="text-[#B8D9FF] text-sm font-medium leading-none">Session complete</p>
                <p className="text-[#2A4060] text-[10px] mt-0.5">Your data trains your personal AI coach</p>
              </div>
            </div>
            <button onClick={onClose} className="text-[#2A4060] hover:text-[#5A8FB8] transition-colors p-1">
              <X size={16} />
            </button>
          </div>

          {/* Step dots */}
          <div className="flex justify-center gap-1.5 pb-4">
            {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
              <StepDot key={i} active={step === i} done={step > i} />
            ))}
          </div>

          {/* ── STEP CONTENT ── */}
          <div className="px-6 pb-6" style={{ minHeight: 280 }}>

            {/* Step 0 — Mood before/after */}
            {step === 0 && (
              <div className="flex flex-col gap-5">
                <div>
                  <p className="text-[10px] tracking-[0.25em] uppercase text-[#2A4060] mb-1">Step 1 of 4</p>
                  <h2 className="text-[#B8D9FF] text-base font-medium">How did your mood shift?</h2>
                  <p className="text-[#2A4060] text-xs mt-1">Slide before & after to track your progress over time</p>
                </div>
                <BeforeAfterSlider
                  before={form.moodBefore}
                  after={form.moodAfter}
                  onBefore={v => set("moodBefore", v)}
                  onAfter={v => set("moodAfter", v)}
                />
                {/* Delta indicator */}
                <div className="flex items-center justify-center gap-2">
                  <div className="flex-1 h-px bg-[#1E3358]/30" />
                  <span
                    className="text-xs font-medium px-3 py-1 rounded-full"
                    style={{
                      color: form.moodAfter >= form.moodBefore ? "#4A9EFF" : "#FF8A8A",
                      background: form.moodAfter >= form.moodBefore ? "rgba(74,158,255,0.08)" : "rgba(255,138,138,0.08)",
                      border: `1px solid ${form.moodAfter >= form.moodBefore ? "rgba(74,158,255,0.2)" : "rgba(255,138,138,0.2)"}`,
                    }}
                  >
                    {form.moodAfter > form.moodBefore ? `+${form.moodAfter - form.moodBefore} better` :
                     form.moodAfter < form.moodBefore ? `${form.moodAfter - form.moodBefore} worse` :
                     "no change"}
                  </span>
                  <div className="flex-1 h-px bg-[#1E3358]/30" />
                </div>
              </div>
            )}

            {/* Step 1 — How do you feel NOW */}
            {step === 1 && (
              <div className="flex flex-col gap-5">
                <div>
                  <p className="text-[10px] tracking-[0.25em] uppercase text-[#2A4060] mb-1">Step 2 of 4</p>
                  <h2 className="text-[#B8D9FF] text-base font-medium">How do you feel right now?</h2>
                  <p className="text-[#2A4060] text-xs mt-1">Pick all that apply</p>
                </div>
                <TagGrid selected={feelings} onToggle={toggleFeeling} />
              </div>
            )}

            {/* Step 2 — Session quality */}
            {step === 2 && (
              <div className="flex flex-col gap-5">
                <div>
                  <p className="text-[10px] tracking-[0.25em] uppercase text-[#2A4060] mb-1">Step 3 of 4</p>
                  <h2 className="text-[#B8D9FF] text-base font-medium">Session quality</h2>
                  <p className="text-[#2A4060] text-xs mt-1">Quick ratings help your AI coach personalise your sessions</p>
                </div>

                <div className="flex flex-col gap-4">
                  {[
                    { label: "Focus level",    key: "focusLevel" as const,    color: "#4A9EFF" },
                    { label: "Calmness",       key: "calmnessScore" as const, color: "#7AC4FF" },
                    { label: "Breath depth",   key: "breathingDepth" as const,color: "#3A82F7" },
                    { label: "Stress level",   key: "stressLevel" as const,   color: "#FF8A8A" },
                  ].map(({ label, key, color }) => (
                    <div key={key} className="flex flex-col gap-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-[#4A7AAA]">{label}</span>
                      </div>
                      <DotSlider value={form[key] as number} onChange={v => set(key, v)} color={color} />
                    </div>
                  ))}

                  <div className="flex flex-col gap-1.5">
                    <span className="text-xs text-[#4A7AAA]">Distractions</span>
                    <DotSlider value={form.distractionCount} max={10} onChange={v => set("distractionCount", v)} color="#7AADCC" />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <span className="text-xs text-[#4A7AAA]">Noise level</span>
                    <NoisePicker value={form.noiseLevel} onChange={v => set("noiseLevel", v)} />
                  </div>
                </div>
              </div>
            )}

            {/* Step 3 — Optional note */}
            {step === 3 && (
              <div className="flex flex-col gap-5">
                <div>
                  <p className="text-[10px] tracking-[0.25em] uppercase text-[#2A4060] mb-1">Step 4 of 4</p>
                  <h2 className="text-[#B8D9FF] text-base font-medium">Any thoughts? <span className="text-[#2A4060] font-normal text-sm">(optional)</span></h2>
                  <p className="text-[#2A4060] text-xs mt-1">Your notes help train your personal breathing coach</p>
                </div>

                {/* AI context hint */}
                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-[#0D1B33]/60 border border-[#1E3358]/40">
                  <Sparkles size={13} className="text-[#2A5499] flex-shrink-0 mt-0.5" />
                  <p className="text-[#2A4060] text-[10px] leading-relaxed">
                    Your feedback is used to personalise your AI breathing coach — suggesting patterns that work specifically for your stress levels, focus goals, and daily rhythm.
                  </p>
                </div>

                <textarea
                  value={form.notes}
                  onChange={e => set("notes", e.target.value)}
                  placeholder="How did this session feel? Any observations…"
                  rows={4}
                  className="w-full bg-[#060C1A]/60 border border-[#1E3358]/50 rounded-xl px-4 py-3 text-xs text-[#7AC4FF] placeholder-[#1A2D48] outline-none focus:border-[#2A5499] transition-colors resize-none leading-relaxed"
                />

                {/* Summary preview */}
                <div className="flex flex-wrap gap-2">
                  {feelings.map(f => (
                    <span key={f} className="text-[9px] px-2 py-1 rounded-full bg-[#0D1B33] border border-[#2A5499]/40 text-[#4A9EFF] uppercase tracking-wide">
                      {f}
                    </span>
                  ))}
                  <span className="text-[9px] px-2 py-1 rounded-full bg-[#0D1B33] border border-[#1E3358]/40 text-[#2A4060] uppercase tracking-wide">
                    mood {form.moodBefore}→{form.moodAfter}
                  </span>
                  <span className="text-[9px] px-2 py-1 rounded-full bg-[#0D1B33] border border-[#1E3358]/40 text-[#2A4060] uppercase tracking-wide">
                    focus {form.focusLevel}/10
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 pb-6 flex items-center gap-3">
            {step > 0 && (
              <button
                type="button"
                onClick={() => setStep(s => s - 1)}
                className="px-4 py-2.5 rounded-xl text-xs text-[#3D6080] border border-[#1E3358]/40 hover:border-[#1E3358]/70 hover:text-[#5A8FB8] transition-all duration-200"
              >
                Back
              </button>
            )}

            <button
              type="button"
              onClick={() => step === 0 ? onClose() : setStep(s => s - 1)}
              className={`text-xs text-[#2A4060] hover:text-[#4A7AAA] transition-colors ${step > 0 ? "hidden" : ""}`}
            >
              Skip
            </button>

            <div className="flex-1" />

            {step < TOTAL_STEPS - 1 ? (
              <button
                type="button"
                onClick={() => setStep(s => s + 1)}
                className="px-6 py-2.5 rounded-xl text-xs text-white font-medium tracking-wide transition-all duration-200 hover:shadow-[0_0_20px_rgba(58,130,247,0.4)] hover:scale-105 active:scale-95"
                style={{ background: "linear-gradient(135deg,#1A5FCC,#3A82F7)" }}
              >
                Continue →
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                className="px-6 py-2.5 rounded-xl text-xs text-white font-medium tracking-wide transition-all duration-200 hover:shadow-[0_0_24px_rgba(58,130,247,0.5)] hover:scale-105 active:scale-95"
                style={{ background: "linear-gradient(135deg,#1A5FCC,#3A82F7)", boxShadow: "0 0 20px rgba(74,158,255,0.2)" }}
              >
                Save & close ✓
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}