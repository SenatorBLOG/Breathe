// src/components/SessionFeedbackModal.tsx
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { X, Sparkles, Brain, Target, Waves, Zap, Moon, Wind, Heart, AlertCircle, Leaf, VolumeX, Volume1, Volume2 } from "lucide-react";
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
function MoodPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const ts = useThemeStyles();
  const { t } = useTranslation();
  const MOODS = [
    { value: 1, emoji: "😞", label: t("sessions.feedback.moods.rough") },
    { value: 3, emoji: "😐", label: t("sessions.feedback.moods.meh") },
    { value: 5, emoji: "🙂", label: t("sessions.feedback.moods.okay") },
    { value: 7, emoji: "😊", label: t("sessions.feedback.moods.good") },
    { value: 10, emoji: "🌟", label: t("sessions.feedback.moods.amazing") },
  ];
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
            <span className={`transition-all duration-200 ${selected ? "text-2xl" : "t-heading opacity-60"}`}>{m.emoji}</span>
            <span className="t-label" style={{ color: selected ? ts.textSecondary : ts.textDim }}>{m.label}</span>
          </button>
        );
      })}
    </div>
  );
}

// ─── BeforeAfterPicker ────────────────────────────────────────────────────────
function BeforeAfterPicker({ before, after, onBefore, onAfter }: {
  before: number; after: number; onBefore: (v: number) => void; onAfter: (v: number) => void;
}) {
  const ts = useThemeStyles();
  const { t } = useTranslation();
  return (
    <div className="flex flex-col gap-4">
      {([
        { label: t("sessions.feedback.before"), val: before, set: onBefore, color: ts.textDim },
        { label: t("sessions.feedback.after"),  val: after,  set: onAfter,  color: ts.accent },
      ] as const).map(({ label, val, set, color }) => (
        <div key={label} className="flex flex-col gap-2">
          <span className="t-caption font-medium" style={{ color: ts.textMuted }}>{label}</span>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map(n => {
              const sel = val === n;
              return (
                <button key={n} type="button" onClick={() => set(n)}
                  className="flex-1 flex items-center justify-center rounded-xl border transition-all duration-150 active:scale-95"
                  style={{
                    minHeight: 48,
                    borderColor: sel ? color : ts.border,
                    backgroundColor: sel ? `${color}22` : ts.cardBg,
                    color: sel ? color : ts.textMuted,
                    fontWeight: sel ? 700 : 400,
                    fontSize: sel ? '1.1rem' : '0.95rem',
                  }}>
                  {n}
                </button>
              );
            })}
          </div>
          <div className="flex justify-between px-0.5">
            <span className="t-label" style={{ color: ts.textDim }}>{t('sessions.feedback.moodAnchorLow')}</span>
            <span className="t-label" style={{ color: ts.textDim }}>{t('sessions.feedback.moodAnchorHigh')}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── TagGrid ──────────────────────────────────────────────────────────────────
function TagGrid({ selected, onToggle }: { selected: string[]; onToggle: (t: string) => void }) {
  const ts = useThemeStyles();
  const { t } = useTranslation();
  const TAGS = [
    { key: "focused",    icon: <Target      size={18} color="#4AE8A0" />, label: t("sessions.feelings.focused") },
    { key: "calm",       icon: <Waves       size={18} color="#38BDF8" />, label: t("sessions.feelings.calm") },
    { key: "energized",  icon: <Zap         size={18} color="#FACC15" />, label: t("sessions.feelings.energized") },
    { key: "drowsy",     icon: <Moon        size={18} color="#818CF8" />, label: t("sessions.feelings.drowsy") },
    { key: "distracted", icon: <Wind        size={18} color="#A78BFA" />, label: t("sessions.feelings.distracted") },
    { key: "peaceful",   icon: <Heart       size={18} color="#34D399" />, label: t("sessions.feelings.peaceful") },
    { key: "anxious",    icon: <AlertCircle size={18} color="#F97316" />, label: t("sessions.feelings.anxious") },
    { key: "refreshed",  icon: <Leaf        size={18} color="#4ADE80" />, label: t("sessions.feelings.refreshed") },
  ];
  return (
    <div className="grid grid-cols-4 gap-2">
      {TAGS.map(tag => {
        const on = selected.includes(tag.key);
        return (
          <button key={tag.key} type="button" onClick={() => onToggle(tag.key)}
            className="flex flex-col items-center gap-1.5 py-3 rounded-xl border text-center transition-all duration-200 active:scale-95"
            style={{ borderColor: on ? ts.borderHover : ts.border, backgroundColor: on ? ts.cardBgHover : ts.cardBg }}>
            <span className={`transition-all ${on ? "" : "opacity-50"}`}>{tag.icon}</span>
            <span className="t-label" style={{ color: on ? ts.textSecondary : ts.textDim }}>{tag.label}</span>
          </button>
        );
      })}
    </div>
  );
}

// ─── BigRatingRow — replaces tiny DotSlider ───────────────────────────────────
function BigRatingRow({ value, options, onChange, color }: {
  value: number; options: number[]; onChange: (v: number) => void; color: string;
}) {
  const ts = useThemeStyles();
  return (
    <div className="flex gap-1.5">
      {options.map(n => {
        const sel = value === n;
        return (
          <button key={n} type="button" onClick={() => onChange(n)}
            className="flex-1 flex items-center justify-center rounded-xl border transition-all duration-150 active:scale-95"
            style={{
              minHeight: 44,
              borderColor: sel ? color : ts.border,
              backgroundColor: sel ? `${color}22` : ts.cardBg,
              color: sel ? color : ts.textMuted,
              fontWeight: sel ? 700 : 400,
              fontSize: sel ? '1rem' : '0.875rem',
            }}>
            {n}
          </button>
        );
      })}
    </div>
  );
}

// ─── NoisePicker ──────────────────────────────────────────────────────────────
function NoisePicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const ts = useThemeStyles();
  const { t } = useTranslation();
  const NOISE_OPTS = [
    { value: "Silent",   icon: <VolumeX size={18} color="#94A3B8" />, label: t("sessions.noise.silent") },
    { value: "Quiet",    icon: <Volume1 size={18} color="#7AC4FF" />, label: t("sessions.noise.quiet") },
    { value: "Moderate", icon: <Volume2 size={18} color="#4A9EFF" />, label: t("sessions.noise.moderate") },
    { value: "Noisy",    icon: <Volume2 size={18} color="#F97316" />, label: t("sessions.noise.noisy") },
  ];
  return (
    <div className="flex gap-2">
      {NOISE_OPTS.map(o => {
        const sel = value === o.value;
        return (
          <button key={o.value} type="button" onClick={() => onChange(o.value)}
            className="flex-1 flex flex-col items-center gap-1.5 py-3 rounded-xl border text-center transition-all duration-200 active:scale-95"
            style={{ borderColor: sel ? ts.borderHover : ts.border, backgroundColor: sel ? ts.cardBgHover : ts.cardBg }}>
            <span className={`t-body ${sel ? "" : "opacity-50"}`}>{o.icon}</span>
            <span className="t-label" style={{ color: sel ? ts.textSecondary : ts.textDim }}>{o.label}</span>
          </button>
        );
      })}
    </div>
  );
}

// ─── Main Modal ───────────────────────────────────────────────────────────────
const TOTAL_STEPS = 4;
const RATING_5 = [1, 2, 3, 4, 5];
const DISTRACTIONS = [0, 2, 4, 6, 8, 10];

export function SessionFeedbackModal({ open, onClose, initialData, onSubmit }: Props) {
  const ts = useThemeStyles();
  const { t } = useTranslation();
  const [step, setStep]         = useState(0);
  const [form, setForm]         = useState<FeedbackData>(initialData);
  const [feelings, setFeelings] = useState<string[]>([]);

  const set = <K extends keyof FeedbackData>(key: K, val: FeedbackData[K]) =>
    setForm(prev => ({ ...prev, [key]: val }));
  const toggleFeeling = (tag: string) =>
    setFeelings(prev => prev.includes(tag) ? prev.filter(x => x !== tag) : [...prev, tag]);

  const handleSubmit = () => {
    const finalNotes = [form.notes, feelings.length ? `Feelings: ${feelings.join(", ")}` : ""].filter(Boolean).join(" | ");
    onSubmit({ ...form, notes: finalNotes });
    setStep(0); setFeelings([]);
  };

  if (!open) return null;

  const fb = "sessions.feedback";

  return (
    <>
      <style>{`
        @keyframes fbSlideUp { from{opacity:0;transform:translateY(24px) scale(0.97)} to{opacity:1;transform:translateY(0) scale(1)} }
        @keyframes fbFadeIn  { from{opacity:0} to{opacity:1} }
        .fb-modal   { animation: fbSlideUp 0.4s cubic-bezier(0.34,1.4,0.64,1) forwards; }
        .fb-overlay { animation: fbFadeIn 0.25s ease forwards; }
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
                <p className="t-body font-medium leading-none" style={{ color: ts.textPrimary }}>{t(`${fb}.sessionComplete`)}</p>
                <p className="t-caption mt-0.5" style={{ color: ts.textDim }}>{t(`${fb}.aiCoachHint`)}</p>
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

            {/* Step 1 — mood shift */}
            {step === 0 && (
              <div className="flex flex-col gap-5">
                <div>
                  <p className="t-label mb-1" style={{ color: ts.textDim }}>1 / {TOTAL_STEPS}</p>
                  <h2 className="t-body font-medium" style={{ color: ts.textPrimary }}>{t(`${fb}.moodShiftTitle`)}</h2>
                  <p className="t-caption mt-1" style={{ color: ts.textMuted }}>{t(`${fb}.moodShiftHint`)}</p>
                </div>
                <BeforeAfterPicker
                  before={form.moodBefore} after={form.moodAfter}
                  onBefore={v => set("moodBefore", v)} onAfter={v => set("moodAfter", v)}
                />
                <div className="flex items-center justify-center gap-2">
                  <div className="flex-1 h-px" style={{ backgroundColor: ts.border }} />
                  <span className="t-caption font-medium px-3 py-1 rounded-full" style={{
                    color: form.moodAfter >= form.moodBefore ? ts.accent : '#FF8A8A',
                    backgroundColor: form.moodAfter >= form.moodBefore ? `${ts.accent}10` : 'rgba(255,138,138,0.1)',
                    border: `1px solid ${form.moodAfter >= form.moodBefore ? `${ts.accent}25` : 'rgba(255,138,138,0.25)'}`,
                  }}>
                    {form.moodAfter > form.moodBefore
                      ? `+${form.moodAfter - form.moodBefore} ${t(`${fb}.better`)}`
                      : form.moodAfter < form.moodBefore
                      ? `${form.moodAfter - form.moodBefore} ${t(`${fb}.worse`)}`
                      : t(`${fb}.noChange`)}
                  </span>
                  <div className="flex-1 h-px" style={{ backgroundColor: ts.border }} />
                </div>
              </div>
            )}

            {/* Step 2 — feelings */}
            {step === 1 && (
              <div className="flex flex-col gap-5">
                <div>
                  <p className="t-label mb-1" style={{ color: ts.textDim }}>2 / {TOTAL_STEPS}</p>
                  <h2 className="t-body font-medium" style={{ color: ts.textPrimary }}>{t(`${fb}.feelingsTitle`)}</h2>
                  <p className="t-caption mt-1" style={{ color: ts.textMuted }}>{t(`${fb}.feelingsHint`)}</p>
                </div>
                <TagGrid selected={feelings} onToggle={toggleFeeling} />
              </div>
            )}

            {/* Step 3 — quality metrics */}
            {step === 2 && (
              <div className="flex flex-col gap-4">
                <div>
                  <p className="t-label mb-1" style={{ color: ts.textDim }}>3 / {TOTAL_STEPS}</p>
                  <h2 className="t-body font-medium" style={{ color: ts.textPrimary }}>{t(`${fb}.qualityTitle`)}</h2>
                  <p className="t-caption mt-1" style={{ color: ts.textMuted }}>{t(`${fb}.qualityHint`)}</p>
                </div>

                {[
                  { label: t(`${fb}.metrics.focusLevel`),  key: "focusLevel"     as const, color: ts.accent },
                  { label: t(`${fb}.metrics.calmness`),    key: "calmnessScore"  as const, color: ts.accentLight },
                  { label: t(`${fb}.metrics.breathDepth`), key: "breathingDepth" as const, color: ts.accent },
                  { label: t(`${fb}.metrics.stressLevel`), key: "stressLevel"    as const, color: '#FF8A8A' },
                ].map(({ label, key, color }) => (
                  <div key={key} className="flex flex-col gap-1.5">
                    <span className="t-caption font-medium" style={{ color: ts.textMuted }}>{label}</span>
                    <BigRatingRow
                      value={form[key] as number}
                      options={RATING_5}
                      onChange={v => set(key, v)}
                      color={color}
                    />
                  </div>
                ))}

                <div className="flex flex-col gap-1.5">
                  <span className="t-caption font-medium" style={{ color: ts.textMuted }}>{t(`${fb}.metrics.distractions`)}</span>
                  <BigRatingRow
                    value={form.distractionCount}
                    options={DISTRACTIONS}
                    onChange={v => set("distractionCount", v)}
                    color={ts.accentLight}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <span className="t-caption font-medium" style={{ color: ts.textMuted }}>{t(`${fb}.metrics.noiseLevel`)}</span>
                  <NoisePicker value={form.noiseLevel} onChange={v => set("noiseLevel", v)} />
                </div>
              </div>
            )}

            {/* Step 4 — notes */}
            {step === 3 && (
              <div className="flex flex-col gap-5">
                <div>
                  <p className="t-label mb-1" style={{ color: ts.textDim }}>4 / {TOTAL_STEPS}</p>
                  <h2 className="t-body font-medium" style={{ color: ts.textPrimary }}>
                    {t(`${fb}.notesTitle`)}{" "}
                    <span className="font-normal t-body" style={{ color: ts.textDim }}>{t(`${fb}.notesOptional`)}</span>
                  </h2>
                </div>
                <div className="flex items-start gap-2.5 p-3 rounded-xl"
                  style={{ backgroundColor: ts.cardBgHover, border: `1px solid ${ts.border}` }}>
                  <Sparkles size={13} className="flex-shrink-0 mt-0.5" style={{ color: ts.accent }} />
                  <p className="t-caption leading-relaxed" style={{ color: ts.textMuted }}>{t(`${fb}.aiTrainHint`)}</p>
                </div>
                <textarea value={form.notes} onChange={e => set("notes", e.target.value)}
                  placeholder={t(`${fb}.notesPlaceholder`)} rows={4}
                  className="w-full rounded-xl px-4 py-3 t-caption outline-none resize-none leading-relaxed transition-colors"
                  style={{ backgroundColor: ts.cardBg, border: `1px solid ${ts.border}`, color: ts.textSecondary }} />
                <div className="flex flex-wrap gap-2">
                  {feelings.map(f => (
                    <span key={f} className="t-label px-2 py-1 rounded-full"
                      style={{ backgroundColor: ts.cardBgHover, border: `1px solid ${ts.borderHover}`, color: ts.accent }}>
                      {t(`sessions.feelings.${f}`, f)}
                    </span>
                  ))}
                  <span className="t-label px-2 py-1 rounded-full"
                    style={{ backgroundColor: ts.cardBgHover, border: `1px solid ${ts.border}`, color: ts.textDim }}>
                    {t(`${fb}.before`)} {form.moodBefore} → {t(`${fb}.after`)} {form.moodAfter}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 pb-6 flex items-center gap-3">
            {step > 0 && (
              <button type="button" onClick={() => setStep(s => s - 1)}
                className="px-4 py-2.5 rounded-xl t-caption transition-all"
                style={{ color: ts.textMuted, border: `1px solid ${ts.border}` }}>
                {t(`${fb}.back`)}
              </button>
            )}
            {step === 0 && (
              <button type="button" onClick={onClose} className="t-caption transition-colors" style={{ color: ts.textDim }}>
                {t(`${fb}.skip`)}
              </button>
            )}
            <div className="flex-1" />
            {step < TOTAL_STEPS - 1 ? (
              <button type="button" onClick={() => setStep(s => s + 1)}
                className="px-6 py-2.5 rounded-xl t-caption text-white font-medium tracking-wide transition-all hover:scale-105 active:scale-95"
                style={{ background: ts.btnGradient }}>
                {t(`${fb}.continue`)} →
              </button>
            ) : (
              <button type="button" onClick={handleSubmit}
                className="px-6 py-2.5 rounded-xl t-caption text-white font-medium tracking-wide transition-all hover:scale-105 active:scale-95"
                style={{ background: ts.btnGradient, boxShadow: ts.btnShadow }}>
                {t(`${fb}.save`)} ✓
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
