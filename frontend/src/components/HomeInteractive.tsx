// src/components/HomeInteractive.tsx
import React, { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useThemeStyles } from '../hooks/useThemeStyles';
import { AuthContext } from './contexts/AuthContext';
import { Lock } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────
type Tag        = 'stress' | 'shallow' | 'deep';
type ResultType = 'stress' | 'shallow' | 'natural';

// ─── Blurred plan card ────────────────────────────────────────────────────────
function BlurredPlan({ lines, ts, unlockLabel }: { lines: string[]; ts: ReturnType<typeof useThemeStyles>; unlockLabel: string }) {
  return (
    <div className="relative w-full rounded-2xl overflow-hidden" style={{ border: `1px solid ${ts.border}` }}>
      <div className="blur-sm pointer-events-none select-none p-4 flex flex-col gap-2"
        style={{ backgroundColor: ts.cardBg }}>
        {lines.map((line, i) => (
          <p key={i} className="t-caption" style={{ color: ts.textSecondary }}>→ {line}</p>
        ))}
      </div>
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5"
        style={{ backdropFilter: 'blur(2px)', backgroundColor: `${ts.cardBg}70` }}>
        <Lock size={14} style={{ color: ts.textMuted }} />
        <p className="t-caption text-center px-4" style={{ color: ts.textMuted }}>
          {unlockLabel}
        </p>
      </div>
    </div>
  );
}

// ─── Quiz ─────────────────────────────────────────────────────────────────────
function QuizSection({ ts }: { ts: ReturnType<typeof useThemeStyles> }) {
  const { isAuthenticated } = useContext(AuthContext);
  const { t } = useTranslation();
  const [answers, setAnswers]       = useState<(Tag | null)[]>(Array(5).fill(null));
  const [step, setStep]             = useState(0);
  const [selectedOpt, setSelectedOpt] = useState<number | null>(null);

  const QUESTIONS = [
    { q: t('homeQuiz.questions.q1'), opts: [
      { label: t('homeQuiz.questions.q1o1'), tag: 'shallow' as Tag },
      { label: t('homeQuiz.questions.q1o2'), tag: 'deep'    as Tag },
      { label: t('homeQuiz.questions.q1o3'), tag: 'stress'  as Tag },
    ]},
    { q: t('homeQuiz.questions.q2'), opts: [
      { label: t('homeQuiz.questions.q2o1'), tag: 'shallow' as Tag },
      { label: t('homeQuiz.questions.q2o2'), tag: 'stress'  as Tag },
      { label: t('homeQuiz.questions.q2o3'), tag: 'deep'    as Tag },
    ]},
    { q: t('homeQuiz.questions.q3'), opts: [
      { label: t('homeQuiz.questions.q3o1'), tag: 'stress'  as Tag },
      { label: t('homeQuiz.questions.q3o2'), tag: 'shallow' as Tag },
      { label: t('homeQuiz.questions.q3o3'), tag: 'deep'    as Tag },
    ]},
    { q: t('homeQuiz.questions.q4'), opts: [
      { label: t('homeQuiz.questions.q4o1'), tag: 'stress'  as Tag },
      { label: t('homeQuiz.questions.q4o2'), tag: 'shallow' as Tag },
      { label: t('homeQuiz.questions.q4o3'), tag: 'deep'    as Tag },
    ]},
    { q: t('homeQuiz.questions.q5'), opts: [
      { label: t('homeQuiz.questions.q5o1'), tag: 'stress'  as Tag },
      { label: t('homeQuiz.questions.q5o2'), tag: 'shallow' as Tag },
      { label: t('homeQuiz.questions.q5o3'), tag: 'deep'    as Tag },
    ]},
  ];

  const RESULTS: Record<ResultType, { emoji: string; title: string; desc: string; color: string; technique: string; techniqueLink: string }> = {
    stress:  { emoji: '😰', color: '#FF8A8A', techniqueLink: '/breathing/4-7-8', title: t('homeQuiz.results.stress.title'), desc: t('homeQuiz.results.stress.desc'), technique: t('homeQuiz.results.stress.technique') },
    shallow: { emoji: '🌀', color: '#FFD97D', techniqueLink: '/breathing',        title: t('homeQuiz.results.shallow.title'), desc: t('homeQuiz.results.shallow.desc'), technique: t('homeQuiz.results.shallow.technique') },
    natural: { emoji: '🌊', color: '#4AE8A0', techniqueLink: '/breathing',        title: t('homeQuiz.results.natural.title'), desc: t('homeQuiz.results.natural.desc'), technique: t('homeQuiz.results.natural.technique') },
  };

  const PLANS: Record<ResultType, string[]> = {
    stress:  t('homeQuiz.plans.stress',  { returnObjects: true }) as string[],
    shallow: t('homeQuiz.plans.shallow', { returnObjects: true }) as string[],
    natural: t('homeQuiz.plans.natural', { returnObjects: true }) as string[],
  };

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
          <p className="t-body font-semibold" style={{ color: result.color }}>{result.title}</p>
          <p className="t-caption mt-1 max-w-xs leading-relaxed" style={{ color: ts.textMuted }}>{result.desc}</p>
        </div>

        {isAuthenticated ? (
          <div className="w-full flex flex-col gap-2 p-4 rounded-xl"
            style={{ background: ts.cardBgHover, border: `1px solid ${ts.borderHover}` }}>
            <p className="t-caption font-medium" style={{ color: ts.textPrimary }}>{t('homeQuiz.sevenDayPlan')}</p>
            {plan.map((day, i) => (
              <div key={i} className="flex items-start gap-2">
                <span style={{ color: result.color }}>→</span>
                <span className="t-caption leading-relaxed" style={{ color: ts.textMuted }}>{day}</span>
              </div>
            ))}
            <Link to={result.techniqueLink}
              className="flex items-center justify-center py-2.5 rounded-xl text-white t-caption font-medium mt-2 transition-all hover:scale-[1.02]"
              style={{ background: ts.btnGradient }}>
              {t('homeQuiz.startTechnique', { technique: result.technique })}
            </Link>
          </div>
        ) : (
          <BlurredPlan lines={plan} ts={ts} unlockLabel={t('homeQuiz.unlockPlan')} />
        )}

        {!isAuthenticated && (
          <>
            <Link
              to={`/signup?ref=${resultType}`}
              className="w-full py-3 rounded-xl t-body font-medium tracking-wide text-white text-center transition-all hover:scale-[1.02] active:scale-[0.98]"
              style={{ background: ts.btnGradient, boxShadow: ts.btnShadow }}
            >
              {t('homeQuiz.unlockBtn')}
            </Link>
            <p className="t-caption" style={{ color: ts.textDim }}>{t('homeQuiz.noCard')}</p>
          </>
        )}

        <Link to={result.techniqueLink} className="t-caption hover:underline" style={{ color: ts.accent }}>
          {isAuthenticated ? t('homeQuiz.openTechnique', { technique: result.technique }) : t('homeQuiz.tryWithout', { technique: result.technique })}
        </Link>

        <button onClick={handleReset} className="t-caption hover:underline mt-1" style={{ color: ts.textDim }}>
          {t('homeQuiz.retake')}
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
        <p className="t-label mb-1" style={{ color: ts.textMuted }}>
          {t('homeQuiz.questionOf', { current: step + 1, total: QUESTIONS.length })}
        </p>
        <p className="t-body font-medium" style={{ color: ts.textPrimary }}>{q.q}</p>
      </div>

      <div className="flex flex-col gap-2">
        {q.opts.map((opt, i) => (
          <button
            key={i}
            onClick={() => setSelectedOpt(i)}
            className="w-full text-left px-4 py-3 rounded-xl t-body border transition-all duration-150"
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
          className="px-6 py-2.5 rounded-xl t-body font-medium text-white tracking-wide transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-30"
          style={{ background: ts.btnGradient }}
        >
          {step < 4 ? t('homeQuiz.next') : t('homeQuiz.seeResult')}
        </button>
      </div>
    </div>
  );
}

// ─── Stress calculator ────────────────────────────────────────────────────────
function StressSection({ ts }: { ts: ReturnType<typeof useThemeStyles> }) {
  const { isAuthenticated } = useContext(AuthContext);
  const { t } = useTranslation();
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

  const scoreLabel = score >= 76 ? t('homeStress.scoreLow') : score >= 51 ? t('homeStress.scoreBalanced') : score >= 31 ? t('homeStress.scoreModerate') : t('homeStress.scoreHigh');
  const scoreColor = score >= 76 ? '#4AE8A0'    : score >= 51 ? '#4A9EFF'  : score >= 31 ? '#FFD97D'         : '#FF8A8A';

  const insights: string[] = [];
  if (sleep   <= 4) insights.push(t('homeStress.insightSleepLever'));
  if (anxiety >= 7) insights.push(t('homeStress.insightAnxietySpiking'));
  if (focus   <= 4) insights.push(t('homeStress.insightLowFocus'));
  if (energy  <= 4) insights.push(t('homeStress.insightLowEnergy'));
  if (insights.length === 0) {
    insights.push(t('homeStress.insightMaintainBalance'), t('homeStress.insightCoherentBreathing'), t('homeStress.insightEveningWindDown'));
  }
  while (insights.length < 3) insights.push(t('homeStress.insightEveningWindDown'));
  const planLines = insights.slice(0, 3);

  const getBreakdown = (s: number): string[] => {
    if (s < 30) return t('homeStress.breakdown.highStress',     { returnObjects: true }) as string[];
    if (s < 50) return t('homeStress.breakdown.moderateStress', { returnObjects: true }) as string[];
    if (s < 75) return t('homeStress.breakdown.balanced',       { returnObjects: true }) as string[];
    return           t('homeStress.breakdown.lowStress',        { returnObjects: true }) as string[];
  };

  const sliders = [
    { label: t('homeStress.sliderSleep'),   value: sleep,   set: setSleep,   color: ts.accent,      invert: false },
    { label: t('homeStress.sliderAnxiety'), value: anxiety, set: setAnxiety, color: '#FF8A8A',      invert: true  },
    { label: t('homeStress.sliderFocus'),   value: focus,   set: setFocus,   color: ts.accentLight, invert: false },
    { label: t('homeStress.sliderEnergy'),  value: energy,  set: setEnergy,  color: '#FFD97D',      invert: false },
  ];

  const breakdown = getBreakdown(score);
  const planHref  = score < 50 ? '/breathing/4-7-8' : score < 75 ? '/breathing' : '/breathing';

  if (showResult) {
    return (
      <div className="flex flex-col items-center gap-4">
        <div className="text-center">
          <p className="text-6xl font-light tabular-nums leading-none" style={{ color: scoreColor }}>{score}</p>
          <p className="t-body font-medium mt-2" style={{ color: scoreColor }}>{scoreLabel}</p>
        </div>

        <div className="w-full h-2 rounded-full overflow-hidden" style={{ backgroundColor: ts.border }}>
          <div className="h-full rounded-full transition-all duration-700"
            style={{ width: `${score}%`, background: scoreColor }} />
        </div>

        {isAuthenticated ? (
          <div className="w-full flex flex-col gap-2 p-4 rounded-xl"
            style={{ background: ts.cardBgHover, border: `1px solid ${ts.borderHover}` }}>
            <p className="t-caption font-medium" style={{ color: ts.textPrimary }}>{t('homeStress.whatsDriving')}</p>
            {breakdown.map(item => (
              <div key={item} className="flex items-start gap-2">
                <span style={{ color: scoreColor }}>→</span>
                <span className="t-caption leading-relaxed" style={{ color: ts.textMuted }}>{item}</span>
              </div>
            ))}
            <Link to={planHref}
              className="flex items-center justify-center py-2.5 rounded-xl text-white t-caption font-medium mt-2 transition-all hover:scale-[1.02]"
              style={{ background: ts.btnGradient }}>
              {t('homeStress.startPlan')}
            </Link>
          </div>
        ) : (
          <BlurredPlan lines={planLines} ts={ts} />
        )}

        {!isAuthenticated && (
          <>
            <Link
              to={`/signup?ref=stress-calc&score=${score}`}
              className="w-full py-3 rounded-xl t-body font-medium tracking-wide text-white text-center transition-all hover:scale-[1.02] active:scale-[0.98]"
              style={{ background: ts.btnGradient, boxShadow: ts.btnShadow }}
            >
              {t('homeStress.getBreathingPlan')}
            </Link>
            <p className="t-caption" style={{ color: ts.textDim }}>{t('homeStress.freeNoCard')}</p>
          </>
        )}

        <button onClick={() => setShowResult(false)} className="t-caption hover:underline" style={{ color: ts.textDim }}>
          {t('homeStress.adjustScores')}
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
              <label className="t-caption" style={{ color: ts.textSecondary }}>{label}</label>
              <span className="t-caption tabular-nums font-medium" style={{ color }}>{value}/10</span>
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
              <span className="t-caption" style={{ color: ts.textDim }}>{invert ? t('homeStress.sliderLow') : '1'}</span>
              <span className="t-caption" style={{ color: ts.textDim }}>{invert ? t('homeStress.sliderHigh') : '10'}</span>
            </div>
          </div>
        );
      })}

      {/* Live preview */}
      <div className="flex items-center justify-between px-4 py-3 rounded-xl"
        style={{ backgroundColor: `${ts.cardBg}80`, border: `1px solid ${ts.border}` }}>
        <p className="t-caption" style={{ color: ts.textMuted }}>{t('homeStress.yourStressScore')}</p>
        <div className="flex items-center gap-2">
          <p className="t-heading font-medium tabular-nums" style={{ color: scoreColor }}>{score}</p>
          <p className="t-caption" style={{ color: scoreColor }}>{scoreLabel}</p>
        </div>
      </div>

      <button
        onClick={() => setShowResult(true)}
        className="w-full py-3 rounded-xl t-body font-medium text-white tracking-wide transition-all hover:scale-[1.02] active:scale-[0.98]"
        style={{ background: ts.btnGradient, boxShadow: ts.btnShadow }}
      >
        {t('homeStress.calculatePlan')}
      </button>
    </div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────
export default function HomeInteractive() {
  const ts  = useThemeStyles();
  const { t } = useTranslation();
  const [tab, setTab] = useState<'quiz' | 'stress'>('quiz');

  return (
    <div className="w-full max-w-md">
      {/* Tab switcher */}
      <div className="flex gap-1 p-1 rounded-xl mb-4" style={{ backgroundColor: `${ts.border}60` }}>
        {(['quiz', 'stress'] as const).map(tabKey => (
          <button
            key={tabKey}
            onClick={() => setTab(tabKey)}
            className="flex-1 py-2 rounded-lg t-caption font-medium tracking-wide transition-all"
            style={{
              backgroundColor: tab === tabKey ? ts.cardBg : 'transparent',
              color:           tab === tabKey ? ts.textPrimary : ts.textMuted,
              boxShadow:       tab === tabKey ? '0 1px 4px rgba(0,0,0,0.2)' : 'none',
            }}
          >
            {tabKey === 'quiz' ? t('homeStress.tabQuiz') : t('homeStress.tabStress')}
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
