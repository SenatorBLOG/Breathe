// src/components/SessionFeedbackModal.tsx
import React, { useState } from "react";
import { X, Sparkles, Brain } from "lucide-react";
import { useThemeStyles } from "../hooks/useThemeStyles";

interface FeedbackData {
  moodBefore: number; moodAfter: number; focusLevel: number;
  stressLevel: number; breathingDepth: number; calmnessScore: number;
  distractionCount: number; noiseLevel: string; notes: string;
}
interface Props {
  open: boolean; onClose: () => void;
  initialData: FeedbackData; onSubmit: (data: FeedbackData) => void;
}

// ─── StepDot ──────────────────────────────────────────────────────────────────
function StepDot({ active, done }: { active: boolean; done: boolean }) {
  const ts = useThemeStyles();
  return (
    <div className="w-1.5 h-1.5 rounded-full transition-all duration-300"
      style={{
        backgroundColor: done ? ts.accent : active ? ts.accentLight : ts.border,
        transform: active ? 'scale(1.25)' : 'scale(1)',
      }} />
  );
}

// ─── MoodPicker ───────────────────────────────────────────────────────────────
const MOODS = [
  { value: 1, emoji: "😞", label: "Rough" },
  { value: 3, emoji: "😐", label: "Meh" },
  { value: 5, emoji: "🙂", label: "Okay" },
  { value: 7, emoji: "😊", label: "Good" },
  { value: 10, emoji: "🌟", label: "Amazing" },
];
function MoodPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const ts = useThemeStyles();
  return (
    <div className="flex items-end justify-between gap-2">
      {MOODS.map(m => {
        const selected = value === m.value;
        return (
          <button key={m.value} type="button" onClick={() => onChange(m.value)}
            className="flex flex-col items-center gap-1 flex-1 py-2 rounded-xl border transition-all duration-200"
            style={{
              borderColor: selected ? ts.borderHover : ts.border,
              backgroundColor: selected ? ts.cardBgHover : ts.cardBg,
            }}>
            <span className={`transition-all duration-200 ${selected ? "text-2xl" : "text-xl opacity-60"}`}>{m.emoji}</span>
            <span className="text-[9px] tracking-wide uppercase" style={{ color: selected ? ts.textSecondary : ts.textDim }}>{m.label}</span>
          </button>
        );
      })}
    </div>
  );
}

// ─── BeforeAfterSlider ────────────────────────────────────────────────────────
function BeforeAfterSlider({ before, after, onBefore, onAfter }: {
  before: number; after: number; onBefore: (v: number) => void; onAfter: (v: number) => void;
}) {
  const ts = useThemeStyles();
  return (
    <div className="flex flex-col gap-2">
      {(["Before", "After"] as const).map((label, i) => {
        const val = i === 0 ? before : after;
        const set = i === 0 ? onBefore : onAfter;
        const color = i === 0 ? ts.textDim : ts.accent;
        return (
          <div key={label} className="flex items-center gap-3">
            <span className="text-[10px] uppercase tracking-widest w-12 flex-shrink-0" style={{ color: ts.textMuted }}>{label}</span>
            <input type="range" min={1} max={10} step={1} value={val}
              onChange={e => set(Number(e.target.value))}
              className="flex-1 appearance-none h-1.5 rounded-full cursor-pointer"
              style={{
                background: `linear-gradient(to right, ${color} ${(val-1)/9*100}%, ${ts.border} ${(val-1)/9*100}%)`,
                accentColor: color,
              }} />
            <span className="text-xs tabular-nums w-5 text-right" style={{ color: ts.textSecondary }}>{val}</span>
          </div>
        );
      })}
    </div>
  );
}

// ─── TagGrid ──────────────────────────────────────────────────────────────────
const TAGS = [
  { key: "focused", icon: "🎯", label: "Focused" }, { key: "calm", icon: "🌊", label: "Calm" },
  { key: "energized", icon: "⚡", label: "Energized" }, { key: "drowsy", icon: "💤", label: "Drowsy" },
  { key: "distracted", icon: "🌀", label: "Distracted" }, { key: "peaceful", icon: "☮️", label: "Peaceful" },
  { key: "anxious", icon: "😰", label: "Anxious" }, { key: "refreshed", icon: "🌿", label: "Refreshed" },
];
function TagGrid({ selected, onToggle }: { selected: string[]; onToggle: (t: string) => void }) {
  const ts = useThemeStyles();
  return (
    <div className="grid grid-cols-4 gap-2">
      {TAGS.map(t => {
        const on = selected.includes(t.key);
        return (
          <button key={t.key} type="button" onClick={() => onToggle(t.key)}
            className="flex flex-col items-center gap-1 py-2.5 rounded-xl border text-center transition-all duration-200"
            style={{ borderColor: on ? ts.borderHover : ts.border, backgroundColor: on ? ts.cardBgHover : ts.cardBg }}>
            <span className={`text-base transition-all ${on ? "" : "opacity-50"}`}>{t.icon}</span>
            <span className="text-[9px] uppercase tracking-wide" style={{ color: on ? ts.textSecondary : ts.textDim }}>{t.label}</span>
          </button>
        );
      })}
    </div>
  );
}

// ─── NoisePicker ──────────────────────────────────────────────────────────────
const NOISE_OPTS = [
  { value: "Silent", icon: "🔇" }, { value: "Quiet", icon: "🔉" },
  { value: "Moderate", icon: "🔊" }, { value: "Noisy", icon: "📢" },
];
function NoisePicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const ts = useThemeStyles();
  return (
    <div className="flex gap-2">
      {NOISE_OPTS.map(o => (
        <button key={o.value} type="button" onClick={() => onChange(o.value)}
          className="flex-1 flex flex-col items-center gap-1 py-2 rounded-xl border text-center transition-all duration-200"
          style={{ borderColor: value === o.value ? ts.borderHover : ts.border, backgroundColor: value === o.value ? ts.cardBgHover : ts.cardBg }}>
          <span className={`text-base ${value === o.value ? "" : "opacity-50"}`}>{o.icon}</span>
          <span className="text-[9px] uppercase tracking-wide" style={{ color: value === o.value ? ts.textSecondary : ts.textDim }}>{o.value}</span>
        </button>
      ))}
    </div>
  );
}

// ─── DotSlider ────────────────────────────────────────────────────────────────
function DotSlider({ value, max = 10, onChange, color: colorProp }: {
  value: number; max?: number; onChange: (v: number) => void; color?: string;
}) {
  const ts = useThemeStyles();
  const color = colorProp ?? ts.accent; // resolve after hook
  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {Array.from({ length: max + 1 }, (_, i) => (
        <button key={i} type="button" onClick={() => onChange(i)}
          className={`rounded-full transition-all duration-150 ${i <= value ? "w-3 h-3" : "w-2.5 h-2.5 opacity-25"}`}
          style={{ backgroundColor: i <= value ? color : ts.border, flexShrink: 0 }} />
      ))}
      <span className="text-xs tabular-nums ml-1" style={{ color: ts.textDim }}>{value}</span>
    </div>
  );
}

// ─── Main Modal ───────────────────────────────────────────────────────────────
const TOTAL_STEPS = 4;

export function SessionFeedbackModal({ open, onClose, initialData, onSubmit }: Props) {
  const ts = useThemeStyles();
  const [step, setStep]       = useState(0);
  const [form, setForm]       = useState<FeedbackData>(initialData);
  const [feelings, setFeelings] = useState<string[]>([]);

  const set = <K extends keyof FeedbackData>(key: K, val: FeedbackData[K]) =>
    setForm(prev => ({ ...prev, [key]: val }));
  const toggleFeeling = (t: string) =>
    setFeelings(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]);

  const handleSubmit = () => {
    const finalNotes = [form.notes, feelings.length ? `Feelings: ${feelings.join(", ")}` : ""].filter(Boolean).join(" | ");
    onSubmit({ ...form, notes: finalNotes });
    setStep(0); setFeelings([]);
  };

  if (!open) return null;

  return (
    <>
      <style>{`
        @keyframes fbSlideUp { from{opacity:0;transform:translateY(24px) scale(0.97)} to{opacity:1;transform:translateY(0) scale(1)} }
        @keyframes fbFadeIn  { from{opacity:0} to{opacity:1} }
        .fb-modal   { animation: fbSlideUp 0.4s cubic-bezier(0.34,1.4,0.64,1) forwards; }
        .fb-overlay { animation: fbFadeIn 0.25s ease forwards; }
        input[type=range]::-webkit-slider-thumb {
          -webkit-appearance:none; width:14px; height:14px; border-radius:50%;
          background:${ts.accent}; box-shadow:0 0 8px ${ts.accent}80; cursor:pointer; margin-top:-5px;
        }
        input[type=range]::-webkit-slider-runnable-track { height:4px; border-radius:4px; }
        input[type=range]::-moz-range-thumb {
          width:14px; height:14px; border-radius:50%; background:${ts.accent}; border:none; cursor:pointer;
        }
      `}</style>

      <div className="fb-overlay fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-4"
        style={{ background: `${ts.navBg}D9`, backdropFilter: "blur(6px)" }}
        onClick={e => { if (e.target === e.currentTarget) onClose(); }}>

        <div className="fb-modal relative w-full max-w-md rounded-3xl overflow-hidden"
          style={{ background: ts.cardBg, border: `1px solid ${ts.borderHover}`, boxShadow: ts.btnShadow }}>

          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-px"
            style={{ background: `linear-gradient(to right, transparent, ${ts.accentLight}66, transparent)` }} />

          {/* Header */}
          <div className="flex items-center justify-between px-6 pt-6 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-xl flex items-center justify-center"
                style={{ background: ts.btnGradient, boxShadow: ts.btnShadow }}>
                <Brain size={14} className="text-white" />
              </div>
              <div>
                <p className="text-sm font-medium leading-none" style={{ color: ts.textPrimary }}>Session complete</p>
                <p className="text-[10px] mt-0.5" style={{ color: ts.textDim }}>Your data trains your personal AI coach</p>
              </div>
            </div>
            <button onClick={onClose} className="transition-colors p-1" style={{ color: ts.textMuted }}><X size={16} /></button>
          </div>

          {/* Step dots */}
          <div className="flex justify-center gap-1.5 pb-4">
            {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
              <StepDot key={i} active={step === i} done={step > i} />
            ))}
          </div>

          {/* Content */}
          <div className="px-6 pb-6" style={{ minHeight: 280 }}>

            {step === 0 && (
              <div className="flex flex-col gap-5">
                <div>
                  <p className="text-[10px] tracking-[0.25em] uppercase mb-1" style={{ color: ts.textDim }}>Step 1 of 4</p>
                  <h2 className="text-base font-medium" style={{ color: ts.textPrimary }}>How did your mood shift?</h2>
                  <p className="text-xs mt-1" style={{ color: ts.textMuted }}>Slide before & after to track your progress</p>
                </div>
                <BeforeAfterSlider before={form.moodBefore} after={form.moodAfter}
                  onBefore={v => set("moodBefore", v)} onAfter={v => set("moodAfter", v)} />
                <div className="flex items-center justify-center gap-2">
                  <div className="flex-1 h-px" style={{ backgroundColor: ts.border }} />
                  <span className="text-xs font-medium px-3 py-1 rounded-full" style={{
                    color: form.moodAfter >= form.moodBefore ? ts.accent : '#FF8A8A',
                    backgroundColor: form.moodAfter >= form.moodBefore ? `${ts.accent}10` : 'rgba(255,138,138,0.1)',
                    border: `1px solid ${form.moodAfter >= form.moodBefore ? `${ts.accent}25` : 'rgba(255,138,138,0.25)'}`,
                  }}>
                    {form.moodAfter > form.moodBefore ? `+${form.moodAfter - form.moodBefore} better`
                     : form.moodAfter < form.moodBefore ? `${form.moodAfter - form.moodBefore} worse` : "no change"}
                  </span>
                  <div className="flex-1 h-px" style={{ backgroundColor: ts.border }} />
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="flex flex-col gap-5">
                <div>
                  <p className="text-[10px] tracking-[0.25em] uppercase mb-1" style={{ color: ts.textDim }}>Step 2 of 4</p>
                  <h2 className="text-base font-medium" style={{ color: ts.textPrimary }}>How do you feel right now?</h2>
                  <p className="text-xs mt-1" style={{ color: ts.textMuted }}>Pick all that apply</p>
                </div>
                <TagGrid selected={feelings} onToggle={toggleFeeling} />
              </div>
            )}

            {step === 2 && (
              <div className="flex flex-col gap-5">
                <div>
                  <p className="text-[10px] tracking-[0.25em] uppercase mb-1" style={{ color: ts.textDim }}>Step 3 of 4</p>
                  <h2 className="text-base font-medium" style={{ color: ts.textPrimary }}>Session quality</h2>
                  <p className="text-xs mt-1" style={{ color: ts.textMuted }}>Quick ratings help your AI coach personalise your sessions</p>
                </div>
                <div className="flex flex-col gap-4">
                  {[
                    { label: "Focus level",   key: "focusLevel" as const,     color: ts.accent },
                    { label: "Calmness",      key: "calmnessScore" as const,  color: ts.accentLight },
                    { label: "Breath depth",  key: "breathingDepth" as const, color: ts.accent },
                    { label: "Stress level",  key: "stressLevel" as const,    color: '#FF8A8A' },
                  ].map(({ label, key, color }) => (
                    <div key={key} className="flex flex-col gap-1.5">
                      <span className="text-xs" style={{ color: ts.textMuted }}>{label}</span>
                      <DotSlider value={form[key] as number} onChange={v => set(key, v)} color={color} />
                    </div>
                  ))}
                  <div className="flex flex-col gap-1.5">
                    <span className="text-xs" style={{ color: ts.textMuted }}>Distractions</span>
                    <DotSlider value={form.distractionCount} max={10} onChange={v => set("distractionCount", v)} color={ts.accentLight} />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <span className="text-xs" style={{ color: ts.textMuted }}>Noise level</span>
                    <NoisePicker value={form.noiseLevel} onChange={v => set("noiseLevel", v)} />
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="flex flex-col gap-5">
                <div>
                  <p className="text-[10px] tracking-[0.25em] uppercase mb-1" style={{ color: ts.textDim }}>Step 4 of 4</p>
                  <h2 className="text-base font-medium" style={{ color: ts.textPrimary }}>
                    Any thoughts? <span className="font-normal text-sm" style={{ color: ts.textDim }}>(optional)</span>
                  </h2>
                </div>
                <div className="flex items-start gap-2.5 p-3 rounded-xl"
                  style={{ backgroundColor: `${ts.cardBgHover}`, border: `1px solid ${ts.border}` }}>
                  <Sparkles size={13} className="flex-shrink-0 mt-0.5" style={{ color: ts.accent }} />
                  <p className="text-[10px] leading-relaxed" style={{ color: ts.textMuted }}>
                    Your feedback trains your personal AI breathing coach.
                  </p>
                </div>
                <textarea value={form.notes} onChange={e => set("notes", e.target.value)}
                  placeholder="How did this session feel? Any observations…" rows={4}
                  className="w-full rounded-xl px-4 py-3 text-xs outline-none resize-none leading-relaxed transition-colors"
                  style={{ backgroundColor: ts.cardBg, border: `1px solid ${ts.border}`, color: ts.textSecondary }} />
                <div className="flex flex-wrap gap-2">
                  {feelings.map(f => (
                    <span key={f} className="text-[9px] px-2 py-1 rounded-full uppercase tracking-wide"
                      style={{ backgroundColor: ts.cardBgHover, border: `1px solid ${ts.borderHover}`, color: ts.accent }}>
                      {f}
                    </span>
                  ))}
                  <span className="text-[9px] px-2 py-1 rounded-full uppercase tracking-wide"
                    style={{ backgroundColor: ts.cardBgHover, border: `1px solid ${ts.border}`, color: ts.textDim }}>
                    mood {form.moodBefore}→{form.moodAfter}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 pb-6 flex items-center gap-3">
            {step > 0 && (
              <button type="button" onClick={() => setStep(s => s - 1)}
                className="px-4 py-2.5 rounded-xl text-xs transition-all"
                style={{ color: ts.textMuted, border: `1px solid ${ts.border}` }}>
                Back
              </button>
            )}
            {step === 0 && (
              <button type="button" onClick={onClose} className="text-xs transition-colors" style={{ color: ts.textDim }}>
                Skip
              </button>
            )}
            <div className="flex-1" />
            {step < TOTAL_STEPS - 1 ? (
              <button type="button" onClick={() => setStep(s => s + 1)}
                className="px-6 py-2.5 rounded-xl text-xs text-white font-medium tracking-wide transition-all hover:scale-105 active:scale-95"
                style={{ background: ts.btnGradient }}>
                Continue →
              </button>
            ) : (
              <button type="button" onClick={handleSubmit}
                className="px-6 py-2.5 rounded-xl text-xs text-white font-medium tracking-wide transition-all hover:scale-105 active:scale-95"
                style={{ background: ts.btnGradient, boxShadow: ts.btnShadow }}>
                Save & close ✓
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}