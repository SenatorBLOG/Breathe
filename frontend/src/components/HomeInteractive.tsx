// src/components/HomeInteractive.tsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useThemeStyles } from '../hooks/useThemeStyles';
import { Lock } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────
type Tag        = 'stress' | 'shallow' | 'deep';
type ResultType = 'stress' | 'shallow' | 'natural';

// ─── Quiz data ────────────────────────────────────────────────────────────────
const QUESTIONS = [
  {
    q:    'Where do you breathe from?',
    opts: [
      { label: 'Chest',    tag: 'shallow' as Tag },
      { label: 'Belly',    tag: 'deep'    as Tag },
      { label: 'Not sure', tag: 'stress'  as Tag },
    ],
  },
  {
    q:    'Do you breathe through your mouth?',
    opts: [
      { label: 'Often',     tag: 'shallow' as Tag },
      { label: 'Sometimes', tag: 'stress'  as Tag },
      { label: 'Rarely',    tag: 'deep'    as Tag },
    ],
  },
  {
    q:    'How do you feel at bedtime?',
    opts: [
      { label: 'Racing thoughts', tag: 'stress'  as Tag },
      { label: 'A bit restless',  tag: 'shallow' as Tag },
      { label: 'Calm',            tag: 'deep'    as Tag },
    ],
  },
  {
    q:    'Do you sigh or yawn a lot?',
    opts: [
      { label: 'Yes, constantly', tag: 'stress'  as Tag },
      { label: 'Sometimes',       tag: 'shallow' as Tag },
      { label: 'Not really',      tag: 'deep'    as Tag },
    ],
  },
  {
    q:    'Energy by midday?',
    opts: [
      { label: 'Exhausted',    tag: 'stress'  as Tag },
      { label: 'A bit tired',  tag: 'shallow' as Tag },
      { label: 'Still going',  tag: 'deep'    as Tag },
    ],
  },
];

const RESULTS: Record<ResultType, {
  emoji: string; title: string; desc: string;
  color: string; technique: string; techniqueLink: string;
}> = {
  stress: {
    emoji: '😰', title: 'Stress Breather', color: '#FF8A8A',
    desc: 'Your nervous system is running hot. Short breath holds and slow exhales will rebalance it fast.',
    technique: '4-7-8 Breathing', techniqueLink: '/breathing/4-7-8',
  },
  shallow: {
    emoji: '🌀', title: 'Shallow Breather', color: '#FFD97D',
    desc: "You're using only the top of your lungs. Belly breathing unlocks more oxygen and calm.",
    technique: 'Belly Breathing', techniqueLink: '/breathing',
  },
  natural: {
    emoji: '🌊', title: 'Natural Breather', color: '#4AE8A0',
    desc: 'You have solid breathing instincts. Coherent breathing will take you to the next level.',
    technique: 'Coherent Breathing', techniqueLink: '/breathing',
  },
};

const PLANS: Record<ResultType, string[]> = {
  stress:  ['Day 1–2: Reset your baseline with 4-7-8', 'Day 3–5: Box breathing for daytime calm', 'Day 6–7: Lock in the evening wind-down'],
  shallow: ['Day 1–2: Belly breathing foundation',     'Day 3–5: Expand to coherent breathing',  'Day 6–7: Full diaphragm activation habit'],
  natural: ['Day 1–2: Establish 5.5 BPM resonance',   'Day 3–5: HRV tracking + Wim Hof boost',  'Day 6–7: Lock in your peak-performance routine'],
};

// ─── Blurred plan card ────────────────────────────────────────────────────────
function BlurredPlan({ lines, ts }: { lines: string[]; ts: ReturnType<typeof useThemeStyles> }) {
  return (
    <div className="relative w-full rounded-2xl overflow-hidden" style={{ border: `1px solid ${ts.border}` }}>
      <div className="blur-sm pointer-events-none select-none p-4 flex flex-col gap-2"
        style={{ backgroundColor: ts.cardBg }}>
        <p className="text-xs font-medium" style={{ color: ts.textMuted }}>Your 7-day plan:</p>
        {lines.map((line, i) => (
          <p key={i} className="text-xs" style={{ color: ts.textSecondary }}>→ {line}</p>
        ))}
      </div>
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5"
        style={{ backdropFilter: 'blur(2px)', backgroundColor: `${ts.cardBg}70` }}>
        <Lock size={14} style={{ color: ts.textMuted }} />
        <p className="text-[10px] text-center px-4" style={{ color: ts.textMuted }}>
          Free account required to unlock
        </p>
      </div>
    </div>
  );
}

// ─── Quiz ─────────────────────────────────────────────────────────────────────
function QuizSection({ ts }: { ts: ReturnType<typeof useThemeStyles> }) {
  const [answers, setAnswers]       = useState<(Tag | null)[]>(Array(5).fill(null));
  const [step, setStep]             = useState(0);
  const [selectedOpt, setSelectedOpt] = useState<number | null>(null);

  const handleNext = () => {
    if (selectedOpt === null) return;
    const next = [...answers];
    next[step] = QUESTIONS[step].opts[selectedOpt].tag;
    setAnswers(next);
    setSelectedOpt(null);
    setStep(s => s + 1);
  };

  const handleReset = () => {
    setAnswers(Array(5).fill(null));
    setStep(0);
    setSelectedOpt(null);
  };

  // Result screen
  if (step === 5) {
    const counts = { stress: 0, shallow: 0, deep: 0 };
    answers.forEach(a => { if (a) counts[a]++; });
    const resultType: ResultType =
      counts.deep >= 3    ? 'natural' :
      counts.shallow >= 3 ? 'shallow' : 'stress';

    const result = RESULTS[resultType];
    const plan   = PLANS[resultType];

    return (
      <div className="flex flex-col items-center gap-4">
        <div className="text-4xl">{result.emoji}</div>
        <div className="text-center">
          <p className="text-base font-semibold" style={{ color: result.color }}>{result.title}</p>
          <p className="text-xs mt-1 max-w-xs leading-relaxed" style={{ color: ts.textMuted }}>{result.desc}</p>
        </div>

        <BlurredPlan lines={plan} ts={ts} />

        <Link
          to={`/signup?ref=${resultType}`}
          className="w-full py-3 rounded-xl text-sm font-medium tracking-wide text-white text-center transition-all hover:scale-[1.02] active:scale-[0.98]"
          style={{ background: ts.btnGradient, boxShadow: ts.btnShadow }}
        >
          Unlock my plan — free →
        </Link>

        <p className="text-[10px]" style={{ color: ts.textDim }}>No credit card · 30 seconds</p>

        <Link to={result.techniqueLink} className="text-xs hover:underline" style={{ color: ts.accent }}>
          Or try {result.technique} without account →
        </Link>

        <button onClick={handleReset} className="text-[10px] hover:underline mt-1" style={{ color: ts.textDim }}>
          Retake quiz
        </button>
      </div>
    );
  }

  const q = QUESTIONS[step];

  return (
    <div className="flex flex-col gap-4">
      {/* Progress */}
      <div className="flex gap-1">
        {QUESTIONS.map((_, i) => (
          <div key={i} className="flex-1 h-0.5 rounded-full transition-all duration-300"
            style={{ background: i < step ? ts.accent : i === step ? `${ts.accent}80` : ts.border }} />
        ))}
      </div>

      <div>
        <p className="text-[10px] tracking-wider uppercase mb-1" style={{ color: ts.textMuted }}>
          Question {step + 1} of {QUESTIONS.length}
        </p>
        <p className="text-sm font-medium" style={{ color: ts.textPrimary }}>{q.q}</p>
      </div>

      <div className="flex flex-col gap-2">
        {q.opts.map((opt, i) => (
          <button
            key={i}
            onClick={() => setSelectedOpt(i)}
            className="w-full text-left px-4 py-3 rounded-xl text-sm border transition-all duration-150"
            style={{
              borderColor:     selectedOpt === i ? ts.borderHover : ts.border,
              backgroundColor: selectedOpt === i ? ts.cardBgHover : 'transparent',
              color:           selectedOpt === i ? ts.textPrimary : ts.textSecondary,
            }}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleNext}
          disabled={selectedOpt === null}
          className="px-6 py-2.5 rounded-xl text-sm font-medium text-white tracking-wide transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-30"
          style={{ background: ts.btnGradient }}
        >
          {step < 4 ? 'Next →' : 'See my result →'}
        </button>
      </div>
    </div>
  );
}

// ─── Stress calculator ────────────────────────────────────────────────────────
function StressSection({ ts }: { ts: ReturnType<typeof useThemeStyles> }) {
  const [sleep,   setSleep]   = useState(5);
  const [anxiety, setAnxiety] = useState(5);
  const [focus,   setFocus]   = useState(5);
  const [energy,  setEnergy]  = useState(5);
  const [showResult, setShowResult] = useState(false);

  const score = Math.round(
    (sleep   / 10) * 25 +
    ((10 - anxiety) / 10) * 25 +
    (focus   / 10) * 25 +
    (energy  / 10) * 25,
  );

  const scoreLabel = score >= 76 ? 'Low Stress' : score >= 51 ? 'Balanced' : score >= 31 ? 'Moderate Stress' : 'High Stress';
  const scoreColor = score >= 76 ? '#4AE8A0'    : score >= 51 ? '#4A9EFF'  : score >= 31 ? '#FFD97D'         : '#FF8A8A';

  const insights: string[] = [];
  if (sleep   <= 4) insights.push('Sleep is your biggest lever right now');
  if (anxiety >= 7) insights.push('Anxiety is spiking your baseline stress');
  if (focus   <= 4) insights.push('Low focus suggests mental fatigue');
  if (energy  <= 4) insights.push('Morning routine would help energy levels');
  if (insights.length === 0) {
    insights.push('Maintain your current healthy balance', 'Add Coherent Breathing to go deeper', 'Evening wind-down session recommended');
  }
  while (insights.length < 3) insights.push('Evening wind-down session recommended');
  const planLines = insights.slice(0, 3);

  const sliders = [
    { label: 'Sleep Quality', value: sleep,   set: setSleep,   color: ts.accent,      invert: false },
    { label: 'Anxiety Level', value: anxiety, set: setAnxiety, color: '#FF8A8A',      invert: true  },
    { label: 'Focus',         value: focus,   set: setFocus,   color: ts.accentLight, invert: false },
    { label: 'Energy',        value: energy,  set: setEnergy,  color: '#FFD97D',      invert: false },
  ];

  if (showResult) {
    return (
      <div className="flex flex-col items-center gap-4">
        <div className="text-center">
          <p className="text-6xl font-light tabular-nums leading-none" style={{ color: scoreColor }}>{score}</p>
          <p className="text-sm font-medium mt-2" style={{ color: scoreColor }}>{scoreLabel}</p>
        </div>

        <div className="w-full h-2 rounded-full overflow-hidden" style={{ backgroundColor: ts.border }}>
          <div className="h-full rounded-full transition-all duration-700"
            style={{ width: `${score}%`, background: scoreColor }} />
        </div>

        <BlurredPlan
          lines={planLines.map(l => `→ ${l}`).map(l => l.replace('→ → ', '→ '))}
          ts={ts}
        />

        <Link
          to={`/signup?ref=stress-calc&score=${score}`}
          className="w-full py-3 rounded-xl text-sm font-medium tracking-wide text-white text-center transition-all hover:scale-[1.02] active:scale-[0.98]"
          style={{ background: ts.btnGradient, boxShadow: ts.btnShadow }}
        >
          Get my breathing plan →
        </Link>

        <p className="text-[10px]" style={{ color: ts.textDim }}>Free · No card · 30 seconds</p>

        <button onClick={() => setShowResult(false)} className="text-[10px] hover:underline" style={{ color: ts.textDim }}>
          Adjust scores
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {sliders.map(({ label, value, set, color, invert }) => {
        const pct = ((value - 1) / 9) * 100;
        return (
          <div key={label} className="flex flex-col gap-1">
            <div className="flex justify-between items-center">
              <label className="text-xs" style={{ color: ts.textSecondary }}>{label}</label>
              <span className="text-xs tabular-nums font-medium" style={{ color }}>{value}/10</span>
            </div>
            <input
              type="range" min={1} max={10} value={value}
              onChange={e => set(Number(e.target.value))}
              className="w-full appearance-none h-1.5 rounded-full cursor-pointer"
              style={{
                background: `linear-gradient(to right, ${color} ${pct}%, ${ts.border}80 ${pct}%)`,
                accentColor: color,
              }}
            />
            <div className="flex justify-between">
              <span className="text-[9px]" style={{ color: ts.textDim }}>{invert ? 'Low' : '1'}</span>
              <span className="text-[9px]" style={{ color: ts.textDim }}>{invert ? 'High' : '10'}</span>
            </div>
          </div>
        );
      })}

      {/* Live preview */}
      <div className="flex items-center justify-between px-4 py-3 rounded-xl"
        style={{ backgroundColor: `${ts.cardBg}80`, border: `1px solid ${ts.border}` }}>
        <p className="text-xs" style={{ color: ts.textMuted }}>Your stress score:</p>
        <div className="flex items-center gap-2">
          <p className="text-xl font-medium tabular-nums" style={{ color: scoreColor }}>{score}</p>
          <p className="text-xs" style={{ color: scoreColor }}>{scoreLabel}</p>
        </div>
      </div>

      <button
        onClick={() => setShowResult(true)}
        className="w-full py-3 rounded-xl text-sm font-medium text-white tracking-wide transition-all hover:scale-[1.02] active:scale-[0.98]"
        style={{ background: ts.btnGradient, boxShadow: ts.btnShadow }}
      >
        Calculate my plan →
      </button>
    </div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────
export default function HomeInteractive() {
  const ts  = useThemeStyles();
  const [tab, setTab] = useState<'quiz' | 'stress'>('quiz');

  return (
    <div className="w-full max-w-md">
      {/* Tab switcher */}
      <div className="flex gap-1 p-1 rounded-xl mb-4" style={{ backgroundColor: `${ts.border}60` }}>
        {(['quiz', 'stress'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="flex-1 py-2 rounded-lg text-xs font-medium tracking-wide transition-all"
            style={{
              backgroundColor: tab === t ? ts.cardBg : 'transparent',
              color:           tab === t ? ts.textPrimary : ts.textMuted,
              boxShadow:       tab === t ? '0 1px 4px rgba(0,0,0,0.2)' : 'none',
            }}
          >
            {t === 'quiz' ? '🧪 Breathing Quiz' : '📊 Stress Score'}
          </button>
        ))}
      </div>

      <div className="rounded-2xl p-5" style={{ backgroundColor: ts.cardBg, border: `1px solid ${ts.border}` }}>
        {tab === 'quiz'
          ? <QuizSection ts={ts} />
          : <StressSection ts={ts} />
        }
      </div>
    </div>
  );
}
