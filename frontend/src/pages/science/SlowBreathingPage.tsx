import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import NavBar from '../../components/NavBar';
import Footer from '../../components/Footer';
import ThemeBackground from '../../components/ThemeBackground';
import { useThemeStyles } from '../../hooks/useThemeStyles';

const FAQS = [
  {
    q: 'What is the science behind deep breathing?',
    a: 'Slow breathing activates the vagus nerve via pulmonary stretch receptors, triggering the parasympathetic nervous system response — lowering heart rate, blood pressure and cortisol while increasing heart rate variability.',
  },
  {
    q: 'How many breaths per minute is optimal for calm?',
    a: '5–6 breaths per minute (the resonance frequency of the cardiovascular system). At this rate, HRV is maximized and the baroreflex — blood pressure regulation reflex — operates most efficiently.',
  },
  {
    q: 'Does slow breathing really reduce anxiety?',
    a: 'Yes. Multiple RCTs have shown significant anxiety reduction from 4–8 weeks of daily slow breathing practice. Acute effects (feeling calmer within minutes) are well established.',
  },
  {
    q: 'What is the difference between slow breathing and meditation?',
    a: "Meditation requires mental focus and sustained attention. Slow breathing is physiological — it works whether or not your mind is quiet. The two complement each other but breathing produces faster measurable physiological change.",
  },
];

export default function SlowBreathingPage() {
  const ts = useThemeStyles();

  useEffect(() => {
    document.title = 'Why Slow Breathing Calms Your Mind — The Neuroscience Explained';
    let desc = document.querySelector('meta[name="description"]');
    if (!desc) { desc = document.createElement('meta'); desc.setAttribute('name', 'description'); document.head.appendChild(desc); }
    desc.setAttribute('content', '6 breaths per minute activates your vagus nerve, boosts HRV, and resets your stress response. Here\'s the neuroscience behind why breathing controls your mind.');
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) { canonical = document.createElement('link'); canonical.setAttribute('rel', 'canonical'); document.head.appendChild(canonical); }
    canonical.setAttribute('href', 'https://breatheonline.app/science/slow-breathing');
  }, []);

  const divider = <div style={{ height: 1, backgroundColor: ts.border + '40' }} />;

  return (
    <div className="relative flex flex-col min-h-screen font-montserrat">
      <ThemeBackground />

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: 'Why Slow Breathing Calms Your Mind — The Neuroscience',
        description: 'The science behind how slow breathing at 6 breaths/min activates the vagus nerve, improves HRV, and calms anxiety.',
        url: 'https://breatheonline.app/science/slow-breathing',
        author: { '@type': 'Organization', name: 'Breathe' },
        mainEntity: FAQS.map(({ q, a }) => ({
          '@type': 'Question',
          name: q,
          acceptedAnswer: { '@type': 'Answer', text: a },
        })),
      }) }} />

      <div className="relative z-10 flex flex-col min-h-screen">
        <NavBar />

        <main className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 py-12 flex flex-col gap-10">

          {/* Hero */}
          <div className="flex flex-col gap-3">
            <span className="text-[10px] tracking-[0.3em] uppercase border px-4 py-1.5 rounded-full w-fit"
              style={{ color: ts.textMuted, borderColor: ts.border }}>
              Breathing Science
            </span>
            <h1 className="text-3xl sm:text-5xl font-light tracking-wide leading-tight" style={{ color: ts.textPrimary }}>
              Why Slow Breath<br />
              <span style={{ color: ts.accent }}>= Calm Mind</span>
            </h1>
            <p className="text-base leading-relaxed max-w-xl" style={{ color: ts.textMuted }}>
              You can change your brain state in 60 seconds — not with meditation, not with
              willpower, just by changing how fast you breathe. Here's the science.
            </p>
          </div>

          {divider}

          {/* Section 1 — Vagus nerve */}
          <div className="flex flex-col gap-4">
            <h2 className="text-lg font-medium" style={{ color: ts.textPrimary }}>
              The vagus nerve: your body's calm switch
            </h2>
            <p className="text-sm leading-relaxed" style={{ color: ts.textMuted }}>
              The vagus nerve is the longest nerve in the body, running from the brainstem all
              the way to the gut. It controls heart rate, digestion, inflammation, and immune
              response. Its "tone" — how active and responsive it is — determines your baseline
              anxiety level. The higher the tone, the calmer and more resilient you are.
            </p>
            <p className="text-sm leading-relaxed" style={{ color: ts.textMuted }}>
              Slow exhalations physically stimulate the vagus nerve via stretch receptors in the
              lungs. This is not metaphor or meditation theory — it is direct mechanical
              stimulation of a nerve that regulates your entire stress response system.
            </p>

            {/* Vagus nerve diagram */}
            <div className="flex flex-col items-center gap-1 p-5 rounded-2xl font-mono text-xs"
              style={{ backgroundColor: ts.cardBg, border: `1px solid ${ts.border}` }}>
              <p style={{ color: ts.textPrimary }}>Brain → Brainstem</p>
              <p style={{ color: ts.textMuted }}>↓</p>
              <p style={{ color: ts.accent }}>Vagus Nerve (10th cranial nerve)</p>
              <p style={{ color: ts.textMuted }}>↓&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;↓&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;↓</p>
              <div className="grid grid-cols-3 gap-4 w-full text-center mt-1">
                {[
                  ['❤️', 'Heart', '(rate drops)'],
                  ['🫁', 'Lungs', '(stretch sensors)'],
                  ['🍃', 'Gut', '(calm digestion)'],
                ].map(([icon, organ, effect]) => (
                  <div key={organ}>
                    <p>{icon}</p>
                    <p style={{ color: ts.textPrimary }}>{organ}</p>
                    <p style={{ color: ts.textMuted }}>{effect}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Key fact box */}
            <div className="px-5 py-4 rounded-2xl"
              style={{ background: ts.accent + '10', border: `1px solid ${ts.accent}30` }}>
              <p className="text-sm leading-relaxed" style={{ color: ts.textMuted }}>
                People with higher vagal tone are measurably more resilient to stress, recover
                faster from difficult emotions, and have better cardiovascular health.{' '}
                <strong style={{ color: ts.textPrimary }}>Vagal tone is trainable — with breathing.</strong>
              </p>
            </div>
          </div>

          {divider}

          {/* Section 2 — HRV */}
          <div className="flex flex-col gap-4">
            <h2 className="text-lg font-medium" style={{ color: ts.textPrimary }}>
              HRV: the measure of calm
            </h2>
            <p className="text-sm leading-relaxed" style={{ color: ts.textMuted }}>
              HRV — Heart Rate Variability — is the variation in time between heartbeats.
              Counter-intuitively, a <em>more variable</em> heart rate means a healthier, more
              adaptable nervous system. A rigid, perfectly metronomic heart rate is a sign of
              stress and poor recovery capacity.
            </p>

            {/* HRV visual */}
            <div className="flex flex-col gap-3 p-5 rounded-2xl"
              style={{ backgroundColor: ts.cardBg, border: `1px solid ${ts.border}` }}>
              <div className="flex flex-col gap-2">
                <p className="text-xs" style={{ color: '#F87171' }}>Fast, rigid rhythm (low HRV — stressed)</p>
                <p className="text-base tracking-[0.05em]" style={{ color: '#F87171' }}>♥♥♥♥♥♥♥♥♥♥♥♥</p>
              </div>
              <div className="flex flex-col gap-2">
                <p className="text-xs" style={{ color: '#4AE8A0' }}>Slow, variable rhythm (high HRV — calm)</p>
                <p className="text-base tracking-[0.4em]" style={{ color: '#4AE8A0' }}>♥ &nbsp; ♥ &nbsp;&nbsp; ♥ &nbsp; ♥ &nbsp;&nbsp; ♥</p>
              </div>
            </div>

            <div className="flex flex-col gap-2 px-4 py-3 rounded-xl"
              style={{ background: ts.cardBg, border: `1px solid ${ts.border}` }}>
              <p className="text-xs font-semibold" style={{ color: ts.textPrimary }}>Low HRV →</p>
              <p className="text-xs" style={{ color: ts.textMuted }}>Stressed, fatigued, poor recovery</p>
              <p className="text-xs font-semibold mt-1" style={{ color: ts.textPrimary }}>High HRV →</p>
              <p className="text-xs" style={{ color: ts.textMuted }}>
                Calm, adaptive, resilient. Breathing at 6 breaths/minute maximizes HRV.
                This is the resonance frequency of the cardiovascular system.
              </p>
            </div>

            {/* Research callout */}
            <div className="flex gap-3 px-4 py-4 rounded-2xl"
              style={{ background: ts.cardBg, border: `1px solid ${ts.borderHover}` }}>
              <span className="text-lg flex-shrink-0">📊</span>
              <p className="text-xs leading-relaxed" style={{ color: ts.textMuted }}>
                <strong style={{ color: ts.textPrimary }}>Stanford 2023 study:</strong> Just 5 minutes of slow
                breathing per day for 4 weeks significantly reduced anxiety and improved HRV
                compared to mindfulness meditation alone.
              </p>
            </div>
          </div>

          {divider}

          {/* Section 3 — CO2/O2 paradox */}
          <div className="flex flex-col gap-4">
            <h2 className="text-lg font-medium" style={{ color: ts.textPrimary }}>
              The CO₂/O₂ paradox
            </h2>
            <p className="text-sm leading-relaxed" style={{ color: ts.textMuted }}>
              Most people believe anxiety comes from "not enough oxygen." The reality is the
              opposite: anxiety caused by breathing is usually from too <em>little</em> CO₂,
              not too little O₂.
            </p>
            <p className="text-sm leading-relaxed" style={{ color: ts.textMuted }}>
              Hyperventilation (fast, shallow breathing) exhales CO₂ faster than your body
              produces it. Low CO₂ causes blood vessels to constrict — producing dizziness,
              tingling, and a sense of panic. Slow breathing keeps CO₂ at optimal levels and
              reverses this within 60–90 seconds.
            </p>
            <div className="px-5 py-4 rounded-2xl"
              style={{ background: 'rgba(248,113,113,0.06)', border: '1px solid rgba(248,113,113,0.2)' }}>
              <p className="text-sm leading-relaxed" style={{ color: ts.textMuted }}>
                The "I can't breathe" feeling during a panic attack is{' '}
                <strong style={{ color: '#F87171' }}>NOT</strong> lack of oxygen. Your blood
                oxygen is fine. It's a CO₂ regulation problem — and slow nasal breathing
                fixes it within 60–90 seconds.
              </p>
            </div>
          </div>

          {divider}

          {/* Section 4 — Why 6 BPM */}
          <div className="flex flex-col gap-4">
            <h2 className="text-lg font-medium" style={{ color: ts.textPrimary }}>
              Why 6 breaths per minute specifically
            </h2>
            <p className="text-sm leading-relaxed" style={{ color: ts.textMuted }}>
              At exactly 6 breaths/min (5 seconds in, 5 seconds out), the baroreflex and
              respiratory system enter harmonic resonance. Blood pressure waves and heart rate
              oscillations synchronize — maximizing the efficiency of the cardiovascular system.
              This is called coherent breathing or resonance breathing.
            </p>
            <div className="grid grid-cols-2 gap-3">
              {[
                'PTSD treatment protocols',
                'Anxiety disorder therapy',
                'Hypertension management',
                'Depression adjunct treatment',
                'Surgical performance under stress',
                'Athletic peak performance',
              ].map(item => (
                <div key={item} className="flex items-center gap-2 px-3 py-2 rounded-xl"
                  style={{ backgroundColor: ts.cardBg, border: `1px solid ${ts.border}` }}>
                  <span className="text-[10px]" style={{ color: ts.accent }}>✓</span>
                  <p className="text-xs" style={{ color: ts.textMuted }}>{item}</p>
                </div>
              ))}
            </div>

            {/* Try it now */}
            <div className="flex flex-col gap-3 p-5 rounded-2xl text-center"
              style={{ background: ts.accent + '10', border: `1px solid ${ts.accent}30` }}>
              <p className="text-sm font-medium" style={{ color: ts.textPrimary }}>Try it right now</p>
              <div className="flex justify-center gap-6">
                <div>
                  <p className="text-2xl font-light" style={{ color: ts.accent }}>5s</p>
                  <p className="text-xs" style={{ color: ts.textMuted }}>Inhale</p>
                </div>
                <div className="flex items-center text-lg" style={{ color: ts.textDim }}>→</div>
                <div>
                  <p className="text-2xl font-light" style={{ color: ts.accentLight }}>5s</p>
                  <p className="text-xs" style={{ color: ts.textMuted }}>Exhale</p>
                </div>
              </div>
              <p className="text-xs" style={{ color: ts.textMuted }}>
                That's 6 breaths per minute. Do it for 2 minutes — notice the shift.
              </p>
              <Link to="/breathing"
                className="self-center px-6 py-2.5 rounded-xl text-white text-xs font-medium transition-all hover:opacity-90"
                style={{ background: ts.btnGradient }}>
                Try coherent breathing on Breathe →
              </Link>
            </div>
          </div>

          {divider}

          {/* Section 5 — Amygdala */}
          <div className="flex flex-col gap-4">
            <h2 className="text-lg font-medium" style={{ color: ts.textPrimary }}>
              Breathing and the amygdala
            </h2>
            <p className="text-sm leading-relaxed" style={{ color: ts.textMuted }}>
              The amygdala — your brain's fear and threat detection center — receives direct
              neural input from the olfactory bulb (nose) and the brainstem. Slow nasal
              breathing directly inhibits amygdala firing at a physiological level. This is
              why "take a deep breath" works. It's not placebo. It's anatomy.
            </p>

            {/* Research callout */}
            <div className="flex gap-3 px-4 py-4 rounded-2xl"
              style={{ background: ts.cardBg, border: `1px solid ${ts.borderHover}` }}>
              <span className="text-lg flex-shrink-0">🔬</span>
              <p className="text-xs leading-relaxed" style={{ color: ts.textMuted }}>
                Nasal breathing synchronizes electrical activity in the amygdala and
                hippocampus — mouth breathing does not. This is why nose breathing during
                exercise, sleep, and meditation produces consistently better outcomes.
                <strong style={{ color: ts.textPrimary }}> (Northwestern University, 2016)</strong>
              </p>
            </div>
          </div>

          {divider}

          {/* Section 6 — Practical application */}
          <div className="flex flex-col gap-4">
            <h2 className="text-lg font-medium" style={{ color: ts.textPrimary }}>
              Practical application
            </h2>
            {[
              {
                icon: '😰',
                situation: 'Acute anxiety / panic',
                technique: '4-7-8 breathing, 4 cycles',
                result: 'Works in 90 seconds',
                href: '/breathing/4-7-8',
              },
              {
                icon: '🎯',
                situation: 'Focus before an important task',
                technique: 'Box breathing, 5 minutes',
                result: 'Used by Navy SEALs and surgeons',
                href: '/breathing/box-breathing',
              },
              {
                icon: '💤',
                situation: 'Sleep onset',
                technique: 'Coherent breathing (5-5) → 4-7-8 in bed',
                result: 'Most people asleep within 10 minutes',
                href: '/sleep/breathwork-for-deep-sleep',
              },
              {
                icon: '⚡',
                situation: 'Energy + mood reset',
                technique: 'Physiological sigh (double inhale + long exhale)',
                result: 'Fastest mood shift possible, 5 reps',
                href: '/breathing',
              },
            ].map(({ icon, situation, technique, result, href }) => (
              <Link key={situation} to={href}
                className="flex gap-4 p-4 rounded-2xl transition-all hover:scale-[1.01]"
                style={{ backgroundColor: ts.cardBg, border: `1px solid ${ts.border}` }}>
                <span className="text-2xl flex-shrink-0">{icon}</span>
                <div className="flex-1">
                  <p className="text-sm font-medium mb-1" style={{ color: ts.textPrimary }}>{situation}</p>
                  <p className="text-xs mb-1" style={{ color: ts.accent }}>→ {technique}</p>
                  <p className="text-xs" style={{ color: ts.textMuted }}>{result}</p>
                </div>
                <span className="text-xs self-center flex-shrink-0" style={{ color: ts.textMuted }}>→</span>
              </Link>
            ))}
          </div>

          {divider}

          {/* Section 7 — FAQ */}
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

          {/* Section 8 — Internal links */}
          <div className="flex flex-col gap-3">
            <p className="text-[10px] tracking-[0.25em] uppercase" style={{ color: ts.textMuted }}>
              Related techniques
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { icon: '🌙', label: '4-7-8 for Sleep',         href: '/breathing/4-7-8' },
                { icon: '📦', label: 'Box Breathing',            href: '/breathing/box-breathing' },
                { icon: '💤', label: 'Breathwork for Deep Sleep', href: '/sleep/breathwork-for-deep-sleep' },
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
