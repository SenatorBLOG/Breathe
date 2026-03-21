import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import NavBar from '../../components/NavBar';
import Footer from '../../components/Footer';
import ThemeBackground from '../../components/ThemeBackground';
import { useThemeStyles } from '../../hooks/useThemeStyles';

const FAQS = [
  {
    q: 'Can I do this in bed?',
    a: "Yes. The physiological sigh works lying down. The energizing breath is slightly more effective sitting up — but even in bed it's better than nothing.",
  },
  {
    q: 'What if I only have 1 minute?',
    a: "Do just the physiological sigh — 5 repetitions. It's the highest-ROI single breathing exercise that exists for morning use.",
  },
  {
    q: 'Should I breathe through my nose or mouth?',
    a: 'Inhale always through nose. Exhale through mouth for the physiological sigh, nose for the energizing breath and box breathing.',
  },
  {
    q: 'Is this the same as pranayama?',
    a: 'This routine draws from pranayama — specifically Kapalabhati (energizing breath) and Nadi Shodhana principles. It\'s a simplified, science-backed version accessible to beginners.',
  },
  {
    q: 'When do I feel results?',
    a: 'Most people feel more alert and focused immediately on Day 1. The cumulative effects on stress resilience and sleep quality become noticeable after 10–14 days of consistency.',
  },
  {
    q: 'Can I do this instead of coffee?',
    a: 'Many people find the energizing breath phase replaces their first coffee — not by suppressing caffeine withdrawal, but by genuinely activating the same alertness pathway. Try it for a week.',
  },
];

const SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: '3-Minute Morning Breathing Ritual',
  description: 'A step-by-step pranayama sequence to do every morning for focus, energy and clarity.',
  totalTime: 'PT3M',
  url: 'https://breatheonline.app/breathing/morning-ritual',
  step: [
    {
      '@type': 'HowToStep',
      name: 'Physiological Sigh',
      text: 'Double inhale through nose, long exhale through mouth. 5 repetitions. Clears residual air and resets CO₂ balance.',
      position: 1,
    },
    {
      '@type': 'HowToStep',
      name: 'Energizing Breath',
      text: 'Inhale 6 seconds, exhale 2 seconds. 10 repetitions. Activates sympathetic system for alertness.',
      position: 2,
    },
    {
      '@type': 'HowToStep',
      name: 'Box Breathing',
      text: '4-4-4-4 pattern, 5 cycles. Balances the nervous system after energizing breath.',
      position: 3,
    },
  ],
};

export default function MorningRitualPage() {
  const ts = useThemeStyles();

  useEffect(() => {
    document.title = '3-Minute Morning Breathing Ritual — Focus & Energy for the Day';
    let desc = document.querySelector('meta[name="description"]');
    if (!desc) { desc = document.createElement('meta'); desc.setAttribute('name', 'description'); document.head.appendChild(desc); }
    desc.setAttribute('content', 'A simple 3-minute breathwork sequence to do every morning before coffee. Boosts focus, energy and mood — no equipment, no experience needed.');
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) { canonical = document.createElement('link'); canonical.setAttribute('rel', 'canonical'); document.head.appendChild(canonical); }
    canonical.setAttribute('href', 'https://breatheonline.app/breathing/morning-ritual');
  }, []);

  const divider = <div style={{ height: 1, backgroundColor: ts.border + '40' }} />;

  return (
    <div className="relative flex flex-col min-h-screen font-montserrat">
      <ThemeBackground />

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(SCHEMA) }} />

      <div className="relative z-10 flex flex-col min-h-screen">
        <NavBar />

        <main className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 py-12 flex flex-col gap-10">

          {/* Hero */}
          <div className="flex flex-col gap-3">
            <span className="text-[10px] tracking-[0.3em] uppercase border px-4 py-1.5 rounded-full w-fit"
              style={{ color: ts.textMuted, borderColor: ts.border }}>
              Morning Practice
            </span>
            <h1 className="text-3xl sm:text-5xl font-light tracking-wide leading-tight" style={{ color: ts.textPrimary }}>
              Morning Ritual<br />
              <span style={{ color: ts.accent }}>in 3 Minutes</span>
            </h1>
            <p className="text-base leading-relaxed max-w-xl" style={{ color: ts.textMuted }}>
              Most people reach for their phone within 30 seconds of waking.
              Their stress system is already active before they've had breakfast.
              This 3-minute sequence reverses that — every morning.
            </p>
          </div>

          {/* Stat strip */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: '⏱', value: '3 min',  label: 'total time, no equipment needed' },
              { icon: '🎯', value: '40%',    label: 'improvement in morning focus after 2 weeks' },
              { icon: '⚡', value: 'Day 1',  label: 'you feel the difference immediately' },
            ].map(({ icon, value, label }) => (
              <div key={label} className="flex flex-col gap-1 p-4 rounded-2xl text-center"
                style={{ backgroundColor: ts.cardBg, border: `1px solid ${ts.border}` }}>
                <span className="text-lg">{icon}</span>
                <p className="text-lg font-bold" style={{ color: ts.textPrimary }}>{value}</p>
                <p className="text-[10px] leading-tight" style={{ color: ts.textMuted }}>{label}</p>
              </div>
            ))}
          </div>

          {divider}

          {/* Section 1 — Why morning breathwork works */}
          <div className="flex flex-col gap-4">
            <h2 className="text-lg font-medium" style={{ color: ts.textPrimary }}>
              Why morning breathwork works
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex flex-col gap-3 p-4 rounded-2xl"
                style={{ backgroundColor: ts.cardBg, border: '1px solid rgba(248,113,113,0.25)' }}>
                <p className="text-xs font-semibold" style={{ color: '#F87171' }}>😴 What usually happens</p>
                {[
                  'Cortisol spikes naturally at 7–9am',
                  'Phone/news spikes it further instantly',
                  'Reactive, anxious, unfocused morning',
                  'Stress baseline set before breakfast',
                ].map(s => (
                  <div key={s} className="flex items-start gap-2">
                    <span className="text-[10px] mt-1 flex-shrink-0" style={{ color: '#F87171' }}>▸</span>
                    <p className="text-xs" style={{ color: ts.textMuted }}>{s}</p>
                  </div>
                ))}
              </div>
              <div className="flex flex-col gap-3 p-4 rounded-2xl"
                style={{ backgroundColor: ts.cardBg, border: '1px solid rgba(74,232,160,0.25)' }}>
                <p className="text-xs font-semibold" style={{ color: '#4AE8A0' }}>🌅 What breathing does instead</p>
                {[
                  'Gives cortisol spike somewhere productive',
                  'Clears sleep inertia faster than coffee',
                  'Sets parasympathetic baseline for the day',
                  'Takes 3 minutes — less than waiting for coffee',
                ].map(s => (
                  <div key={s} className="flex items-start gap-2">
                    <span className="text-[10px] mt-1 flex-shrink-0" style={{ color: '#4AE8A0' }}>▸</span>
                    <p className="text-xs" style={{ color: ts.textMuted }}>{s}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Key callout */}
            <div className="flex gap-3 px-4 py-4 rounded-2xl"
              style={{ background: ts.accent + '10', border: `1px solid ${ts.accent}30` }}>
              <span className="text-lg flex-shrink-0">⏰</span>
              <p className="text-xs leading-relaxed" style={{ color: ts.textMuted }}>
                <strong style={{ color: ts.textPrimary }}>The first 30 minutes after waking</strong> set the
                neurological tone for your entire day. What you do in that window determines your
                default stress level for hours.
              </p>
            </div>
          </div>

          {divider}

          {/* Section 2 — Why before eating */}
          <div className="flex flex-col gap-3">
            <h2 className="text-lg font-medium" style={{ color: ts.textPrimary }}>
              Why do it before eating
            </h2>
            <p className="text-sm leading-relaxed" style={{ color: ts.textMuted }}>
              Fasted breathwork is meaningfully more effective. Digestion competes for blood flow
              with the brain, and a full stomach physically limits diaphragm movement — reducing
              the depth and effectiveness of every breath. Cortisol (naturally high in the morning)
              also helps mobilize energy for the session. Ancient pranayama traditions all specify
              an empty stomach for exactly this reason — and modern physiology confirms it.
            </p>
            <div className="px-4 py-3 rounded-xl"
              style={{ background: ts.cardBg, border: `1px solid ${ts.border}` }}>
              <p className="text-xs" style={{ color: ts.textMuted }}>
                <strong style={{ color: ts.textPrimary }}>Practical order:</strong> breathwork → water → coffee → breakfast → phone.
                Even doing it in bed before standing up counts.
              </p>
            </div>
          </div>

          {divider}

          {/* Section 3 — The sequence */}
          <div className="flex flex-col gap-5">
            <h2 className="text-lg font-medium" style={{ color: ts.textPrimary }}>
              The 3-minute sequence
            </h2>

            {/* Step 1 — Physiological Sigh */}
            <div className="flex flex-col gap-3 p-5 rounded-2xl"
              style={{ backgroundColor: ts.cardBg, border: `1px solid ${ts.borderHover}` }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-sm font-bold text-white"
                  style={{ background: ts.btnGradient }}>1</div>
                <div>
                  <p className="text-sm font-semibold" style={{ color: ts.textPrimary }}>Physiological Sigh</p>
                  <p className="text-[10px]" style={{ color: ts.textMuted }}>⏱ 0:00 — 60 seconds · 5 repetitions</p>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                {[
                  ['1', 'Inhale through nose to 80% capacity'],
                  ['2', 'Sniff in a second time — fill to 100%'],
                  ['3', 'Exhale slowly through mouth until empty'],
                  ['4', 'Pause 1 second, then repeat'],
                ].map(([n, desc]) => (
                  <div key={n} className="flex items-center gap-3">
                    <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0"
                      style={{ background: ts.accent + '30', color: ts.accent }}>{n}</span>
                    <p className="text-xs" style={{ color: ts.textMuted }}>{desc}</p>
                  </div>
                ))}
              </div>

              {/* Visual cue */}
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl font-mono text-[10px] overflow-x-auto"
                style={{ background: ts.cardBgHover, color: ts.textMuted }}>
                <span style={{ color: ts.accentLight }}>Inhale ▓▓▓▓▓▓▓▓░░</span>
                <span>→</span>
                <span style={{ color: ts.accent }}>Sniff ▓▓▓▓▓▓▓▓▓▓</span>
                <span>→</span>
                <span style={{ color: ts.textDim }}>Exhale ░░░░░░░░░░</span>
              </div>

              <p className="text-xs leading-relaxed" style={{ color: ts.textMuted }}>
                <strong style={{ color: ts.textPrimary }}>Why it works:</strong> The double inhale deflates
                collapsed alveoli (air sacs) that accumulate during sleep. It's the fastest known way
                to reduce physiological arousal — used by athletes before competition and surgeons
                before procedures.
              </p>
            </div>

            {/* Step 2 — Energizing Breath */}
            <div className="flex flex-col gap-3 p-5 rounded-2xl"
              style={{ backgroundColor: ts.cardBg, border: `1px solid ${ts.border}` }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-sm font-bold text-white"
                  style={{ background: ts.btnGradient }}>2</div>
                <div>
                  <p className="text-sm font-semibold" style={{ color: ts.textPrimary }}>Energizing Breath</p>
                  <p className="text-[10px]" style={{ color: ts.textMuted }}>⏱ 1:00 — 60 seconds · 10 repetitions</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {[['6s', 'Inhale (nose)'], ['2s', 'Exhale (nose)']].map(([t, label]) => (
                  <div key={label} className="flex flex-col items-center py-3 rounded-xl"
                    style={{ background: ts.cardBgHover, border: `1px solid ${ts.border}` }}>
                    <p className="text-xl font-bold" style={{ color: ts.accent }}>{t}</p>
                    <p className="text-[10px]" style={{ color: ts.textMuted }}>{label}</p>
                  </div>
                ))}
              </div>

              <p className="text-xs leading-relaxed" style={{ color: ts.textMuted }}>
                <strong style={{ color: ts.textPrimary }}>Why it works:</strong> A long inhale activates
                the sympathetic system — the opposite of sleep breathing. Similar to Kapalabhati
                pranayama. You'll feel warmer, more alert, and slightly tingly. This is the
                physiological equivalent of a cold shower, without the cold.
              </p>

              {/* Warning */}
              <div className="flex items-start gap-2 px-3 py-3 rounded-xl"
                style={{ background: 'rgba(251,191,36,0.06)', border: '1px solid rgba(251,191,36,0.25)' }}>
                <span className="text-xs flex-shrink-0">⚠️</span>
                <p className="text-xs leading-relaxed" style={{ color: ts.textMuted }}>
                  Stop if you feel dizzy. Sit before starting if prone to lightheadedness.
                  Skip if you have cardiovascular conditions.
                </p>
              </div>
            </div>

            {/* Step 3 — Box Breathing */}
            <div className="flex flex-col gap-3 p-5 rounded-2xl"
              style={{ backgroundColor: ts.cardBg, border: `1px solid ${ts.border}` }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-sm font-bold text-white"
                  style={{ background: ts.btnGradient }}>3</div>
                <div>
                  <p className="text-sm font-semibold" style={{ color: ts.textPrimary }}>Box Breathing Balance</p>
                  <p className="text-[10px]" style={{ color: ts.textMuted }}>⏱ 2:00 — 60 seconds · 5 cycles</p>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-2 text-center">
                {[['4s', 'Inhale'], ['4s', 'Hold'], ['4s', 'Exhale'], ['4s', 'Hold']].map(([t, label], i) => (
                  <div key={i} className="py-2 rounded-xl"
                    style={{ background: ts.cardBgHover, border: `1px solid ${ts.border}` }}>
                    <p className="text-base font-bold" style={{ color: ts.accentLight }}>{t}</p>
                    <p className="text-[10px]" style={{ color: ts.textPrimary }}>{label}</p>
                  </div>
                ))}
              </div>

              <p className="text-xs leading-relaxed" style={{ color: ts.textMuted }}>
                <strong style={{ color: ts.textPrimary }}>Why it works:</strong> After the energizing breath,
                your system is activated. Box breathing brings it to calm-alert — focused but not
                anxious. This is the state top performers call "flow-ready."
              </p>
            </div>

            {/* CTA after sequence */}
            <div className="flex flex-col gap-3 p-5 rounded-2xl"
              style={{ background: ts.cardBg, border: `1px solid ${ts.borderHover}` }}>
              <p className="text-sm font-medium" style={{ color: ts.textPrimary }}>
                🌬 Let the app pace you — so you can focus on breathing
              </p>
              <p className="text-xs leading-relaxed" style={{ color: ts.textMuted }}>
                Set up the 3-minute morning sequence with one tap.
                Visual circle + optional voice or sound guidance.
              </p>
              <Link to="/breathing"
                className="self-start px-6 py-3 rounded-xl text-white text-sm font-medium transition-all hover:opacity-90"
                style={{ background: ts.btnGradient }}>
                Open breathing app →
              </Link>
            </div>
          </div>

          {divider}

          {/* Section 4 — Before / After */}
          <div className="flex flex-col gap-4">
            <h2 className="text-lg font-medium" style={{ color: ts.textPrimary }}>
              What changes after 2 weeks
            </h2>
            <div className="rounded-2xl overflow-hidden" style={{ border: `1px solid ${ts.border}` }}>
              {/* Header */}
              <div className="grid grid-cols-3 px-4 py-2"
                style={{ backgroundColor: ts.cardBgHover, borderBottom: `1px solid ${ts.border}` }}>
                <p className="text-[10px] font-semibold" style={{ color: ts.textMuted }}></p>
                <p className="text-[10px] font-semibold text-center" style={{ color: '#F87171' }}>Before</p>
                <p className="text-[10px] font-semibold text-center" style={{ color: '#4AE8A0' }}>After 2 weeks</p>
              </div>
              {[
                ['Morning',        'Groggy, reactive',          'Alert within 5 min'],
                ['Focus',          'Coffee-dependent',          'Sustained 2–3 hrs'],
                ['Stress response','Hair-trigger',              '30–40% slower to activate'],
                ['Sleep',          'Variable',                  'More consistent'],
                ['Mood',           'Default neutral/irritable', 'Default calm'],
              ].map(([label, before, after], i) => (
                <div key={label} className="grid grid-cols-3 px-4 py-3"
                  style={{
                    backgroundColor: i % 2 === 0 ? ts.cardBg : ts.cardBgHover,
                    borderBottom: i < 4 ? `1px solid ${ts.border}` : 'none',
                  }}>
                  <p className="text-xs font-medium" style={{ color: ts.textPrimary }}>{label}</p>
                  <p className="text-xs text-center" style={{ color: ts.textMuted }}>{before}</p>
                  <p className="text-xs text-center" style={{ color: '#4AE8A0' }}>{after}</p>
                </div>
              ))}
            </div>
            <p className="text-[10px] px-1" style={{ color: ts.textMuted }}>
              Results are individual. Consistency matters more than perfection.
            </p>
          </div>

          {divider}

          {/* Section 5 — Variations */}
          <div className="flex flex-col gap-4">
            <h2 className="text-lg font-medium" style={{ color: ts.textPrimary }}>
              Variations by goal
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                {
                  icon: '🧘',
                  goal: 'Calm focus',
                  steps: 'Use sequence as described. Add 2 minutes of box breathing at the end.',
                  total: '5 minutes',
                },
                {
                  icon: '⚡',
                  goal: 'High energy',
                  steps: 'Extend energizing breath to 2 min (20 cycles). Skip the box breathing phase.',
                  total: '3 min, more intense',
                },
                {
                  icon: '😰',
                  goal: 'Woke up anxious',
                  steps: 'Start with 5 cycles of 4-7-8 breathing BEFORE the sequence to bring cortisol down first.',
                  total: '5 minutes',
                },
              ].map(({ icon, goal, steps, total }) => (
                <div key={goal} className="flex flex-col gap-3 p-4 rounded-2xl"
                  style={{ backgroundColor: ts.cardBg, border: `1px solid ${ts.border}` }}>
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{icon}</span>
                    <p className="text-sm font-medium" style={{ color: ts.textPrimary }}>{goal}</p>
                  </div>
                  <p className="text-xs leading-relaxed" style={{ color: ts.textMuted }}>{steps}</p>
                  <p className="text-[10px] px-2 py-1 rounded-lg w-fit"
                    style={{ background: ts.border, color: ts.textMuted }}>
                    {total}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {divider}

          {/* Section 6 — FAQ */}
          <div className="flex flex-col gap-4">
            <h2 className="text-lg font-medium" style={{ color: ts.textPrimary }}>
              Frequently asked questions
            </h2>
            {FAQS.map(({ q, a }) => (
              <div key={q} className="p-4 rounded-2xl"
                style={{ backgroundColor: ts.cardBg, border: `1px solid ${ts.border}` }}>
                <p className="text-sm font-medium mb-2" style={{ color: ts.textPrimary }}>{q}</p>
                <p className="text-xs leading-relaxed" style={{ color: ts.textMuted }}>{a}</p>
              </div>
            ))}
          </div>

          {divider}

          {/* Section 7 — Internal links */}
          <div className="flex flex-col gap-3">
            <p className="text-[10px] tracking-[0.25em] uppercase" style={{ color: ts.textMuted }}>
              Related guides
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { icon: '📦', label: 'Box Breathing — full guide',     href: '/breathing/box-breathing' },
                { icon: '🧠', label: 'Neuroscience of breathing',      href: '/science/slow-breathing' },
                { icon: '🌙', label: 'Evening wind-down routine',      href: '/sleep/breathwork-for-deep-sleep' },
              ].map(({ icon, label, href }) => (
                <Link key={href} to={href}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all hover:scale-[1.01]"
                  style={{ backgroundColor: ts.cardBg, border: `1px solid ${ts.border}` }}>
                  <span className="text-lg">{icon}</span>
                  <p className="text-sm font-medium" style={{ color: ts.accent }}>{label} →</p>
                </Link>
              ))}
            </div>
          </div>

        </main>

        <Footer />
      </div>
    </div>
  );
}
