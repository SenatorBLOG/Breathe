import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import NavBar from '../../components/NavBar';
import Footer from '../../components/Footer';
import ThemeBackground from '../../components/ThemeBackground';
import { useThemeStyles } from '../../hooks/useThemeStyles';

const FAQS = [
  {
    q: 'How many breaths per minute should I take to sleep?',
    a: 'Aim for 5–6 breaths per minute (about 5 seconds in, 5 seconds out). This is the resonance frequency of the heart — the rate where heart rate variability is maximized and the nervous system is most calm.',
  },
  {
    q: 'Should I breathe through my nose or mouth for sleep?',
    a: 'Nose breathing for inhales always. Nose filters, warms and humidifies air. Exhale can be through the mouth (for 4-7-8) or nose (for box breathing). Mouth breathing during sleep is associated with worse sleep quality and higher sleep apnea risk.',
  },
  {
    q: 'How long before bed should I do breathwork?',
    a: 'Start 10–20 minutes before you want to be asleep. Doing breathwork already in bed is fine — many people fall asleep during the practice itself.',
  },
  {
    q: 'Does breathwork work for insomnia?',
    a: 'For stress-related insomnia, yes — often within the same night. For chronic insomnia disorder, breathwork is a useful complement to CBT-I (Cognitive Behavioral Therapy for Insomnia), not a replacement for clinical treatment.',
  },
];

export default function BreathworkSleepPage() {
  const ts = useThemeStyles();

  useEffect(() => {
    document.title = 'Breathwork for Deep Sleep — Activate Your Parasympathetic System';
    let desc = document.querySelector('meta[name="description"]');
    if (!desc) { desc = document.createElement('meta'); desc.setAttribute('name', 'description'); document.head.appendChild(desc); }
    desc.setAttribute('content', 'Use 4-7-8, box breathing and belly breathing to activate your nervous system\'s rest mode. Fall asleep faster and sleep deeper — free guided sessions.');
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) { canonical = document.createElement('link'); canonical.setAttribute('rel', 'canonical'); document.head.appendChild(canonical); }
    canonical.setAttribute('href', 'https://breatheonline.app/sleep/breathwork-for-deep-sleep');
  }, []);

  const divider = <div style={{ height: 1, backgroundColor: ts.border + '40' }} />;

  return (
    <div className="relative flex flex-col min-h-screen font-montserrat">
      <ThemeBackground />

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: 'Breathwork for Deep Sleep',
        description: 'How breathing exercises activate the parasympathetic nervous system for deeper, faster sleep.',
        url: 'https://breatheonline.app/sleep/breathwork-for-deep-sleep',
        author: { '@type': 'Organization', name: 'Breathe' },
        mainEntity: [{
          '@type': 'Question',
          name: 'What breathing technique helps you fall asleep?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'The 4-7-8 technique (inhale 4s, hold 7s, exhale 8s) is the most effective for sleep. The extended exhale activates the vagus nerve and parasympathetic nervous system, lowering heart rate and cortisol within minutes.',
          },
        }],
      }) }} />

      <div className="relative z-10 flex flex-col min-h-screen">
        <NavBar />

        <main className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 py-12 flex flex-col gap-10">

          {/* Hero */}
          <div className="flex flex-col gap-3">
            <span className="t-label tracking-[0.3em] uppercase border px-4 py-1.5 rounded-full w-fit"
              style={{ color: ts.textMuted, borderColor: ts.border }}>
              Sleep Guide
            </span>
            <h1 className="text-3xl sm:text-5xl font-light tracking-wide leading-tight" style={{ color: ts.textPrimary }}>
              Breathwork for<br />
              <span style={{ color: ts.accent }}>Deep Sleep</span>
            </h1>
            <p className="t-body leading-relaxed max-w-xl" style={{ color: ts.textMuted }}>
              Your nervous system has two modes: fight-or-flight (sympathetic) and
              rest-and-digest (parasympathetic). Breathing is the only way to switch
              between them consciously.
            </p>
          </div>

          {/* Stat strip */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: '⏱', value: '4 min',   label: 'to shift your nervous system into rest mode' },
              { icon: '💤', value: '37%',     label: 'improvement in sleep onset with nightly breathwork' },
              { icon: '❤️', value: '10–20%', label: 'drop in heart rate after 3 cycles of slow breathing' },
            ].map(({ icon, value, label }) => (
              <div key={label} className="flex flex-col gap-1 p-4 rounded-2xl text-center"
                style={{ backgroundColor: ts.cardBg, border: `1px solid ${ts.border}` }}>
                <span className="t-heading">{icon}</span>
                <p className="t-heading font-bold" style={{ color: ts.textPrimary }}>{value}</p>
                <p className="t-label leading-tight" style={{ color: ts.textMuted }}>{label}</p>
              </div>
            ))}
          </div>

          {divider}

          {/* Section 1 — Why breathing controls sleep */}
          <div className="flex flex-col gap-4">
            <h2 className="t-heading font-medium" style={{ color: ts.textPrimary }}>
              Why breathing controls sleep
            </h2>
            <p className="t-body leading-relaxed" style={{ color: ts.textMuted }}>
              Breathing is the only autonomic function you can consciously control. A slow exhale
              stimulates the vagus nerve, which releases acetylcholine — your body's natural
              "slow down" signal. Heart rate drops, cortisol falls, and your body enters the
              state required for sleep onset.
            </p>
            <p className="t-body leading-relaxed" style={{ color: ts.textMuted }}>
              Most people go to bed in sympathetic dominance — high cortisol, racing thoughts,
              fast shallow breathing — and wonder why they can't sleep. The problem isn't the
              bed. It's the nervous system state.
            </p>

            {/* Two-state diagram */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-2 p-4 rounded-2xl"
                style={{ background: 'rgba(248,113,113,0.06)', border: '1px solid rgba(248,113,113,0.2)' }}>
                <p className="t-caption font-semibold" style={{ color: '#F87171' }}>😤 Sympathetic</p>
                {['Fast breathing', 'High cortisol', 'Racing heart', "Can't sleep"].map(s => (
                  <p key={s} className="t-caption" style={{ color: ts.textMuted }}>{s}</p>
                ))}
              </div>
              <div className="flex flex-col gap-2 p-4 rounded-2xl"
                style={{ background: 'rgba(74,232,160,0.06)', border: '1px solid rgba(74,232,160,0.2)' }}>
                <p className="t-caption font-semibold" style={{ color: '#4AE8A0' }}>😴 Parasympathetic</p>
                {['Slow breathing', 'Low cortisol', 'Slow heart rate', 'Sleep onset'].map(s => (
                  <p key={s} className="t-caption" style={{ color: ts.textMuted }}>{s}</p>
                ))}
              </div>
            </div>
            <div className="flex justify-center">
              <span className="t-caption" style={{ color: ts.textMuted }}>
                ← breathwork switches you from left to right →
              </span>
            </div>
          </div>

          {divider}

          {/* Section 2 — 3 techniques */}
          <div className="flex flex-col gap-5">
            <h2 className="t-heading font-medium" style={{ color: ts.textPrimary }}>
              The 3 best techniques for sleep
            </h2>

            {/* 4-7-8 */}
            <div className="flex flex-col gap-3 p-5 rounded-2xl"
              style={{ backgroundColor: ts.cardBg, border: `1px solid ${ts.borderHover}` }}>
              <div className="flex items-center gap-2">
                <span className="t-heading">🌙</span>
                <p className="t-body font-semibold" style={{ color: ts.textPrimary }}>4-7-8 Breathing</p>
                <span className="t-label px-2 py-0.5 rounded-full ml-auto"
                  style={{ background: ts.accent + '22', color: ts.accent, border: `1px solid ${ts.accent}44` }}>
                  ⭐ Most effective for sleep
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                {[['4s', 'Inhale', 'nose'], ['7s', 'Hold', ''], ['8s', 'Exhale', 'mouth']].map(([t, label, sub]) => (
                  <div key={label} className="py-2 rounded-xl"
                    style={{ background: ts.cardBgHover, border: `1px solid ${ts.border}` }}>
                    <p className="t-heading font-bold" style={{ color: ts.accent }}>{t}</p>
                    <p className="t-label" style={{ color: ts.textPrimary }}>{label}</p>
                    <p className="t-label" style={{ color: ts.textMuted }}>{sub}</p>
                  </div>
                ))}
              </div>
              <p className="t-caption leading-relaxed" style={{ color: ts.textMuted }}>
                The 7-second hold slightly increases CO₂, triggering a powerful parasympathetic
                response. The 8-second exhale maximally stimulates the vagus nerve. Most people
                feel physically heavy and warm in the limbs by cycle 3 — this is the pre-sleep state.
              </p>
              <p className="t-caption" style={{ color: ts.textMuted }}>
                <strong style={{ color: ts.textPrimary }}>When:</strong> In bed, lights off. 4 cycles minimum.
              </p>
              <Link to="/breathing/4-7-8"
                className="self-start px-5 py-2 rounded-xl text-white t-caption font-medium transition-all hover:opacity-90"
                style={{ background: ts.btnGradient }}>
                Try 4-7-8 now →
              </Link>
            </div>

            {/* Box breathing */}
            <div className="flex flex-col gap-3 p-5 rounded-2xl"
              style={{ backgroundColor: ts.cardBg, border: `1px solid ${ts.border}` }}>
              <div className="flex items-center gap-2">
                <span className="t-heading">📦</span>
                <p className="t-body font-semibold" style={{ color: ts.textPrimary }}>Box Breathing</p>
                <span className="t-label px-2 py-0.5 rounded-full ml-auto"
                  style={{ background: ts.border, color: ts.textMuted }}>
                  For anxiety-driven insomnia
                </span>
              </div>
              <div className="grid grid-cols-4 gap-2 text-center">
                {[['4s', 'Inhale'], ['4s', 'Hold'], ['4s', 'Exhale'], ['4s', 'Hold']].map(([t, label], i) => (
                  <div key={i} className="py-2 rounded-xl"
                    style={{ background: ts.cardBgHover, border: `1px solid ${ts.border}` }}>
                    <p className="t-body font-bold" style={{ color: ts.accentLight }}>{t}</p>
                    <p className="t-label" style={{ color: ts.textPrimary }}>{label}</p>
                  </div>
                ))}
              </div>
              <p className="t-caption leading-relaxed" style={{ color: ts.textMuted }}>
                The equal ratio neutralizes an overactive stress response. The holds train CO₂
                tolerance, reducing the "I can't breathe" panic that many anxious sleepers feel.
                Better for people who feel "wired but tired."
              </p>
              <p className="t-caption" style={{ color: ts.textMuted }}>
                <strong style={{ color: ts.textPrimary }}>When:</strong> 10–15 minutes before bed, sitting up.
              </p>
              <Link to="/breathing/box-breathing"
                className="self-start px-5 py-2 rounded-xl text-white t-caption font-medium transition-all hover:opacity-90"
                style={{ background: ts.btnGradient }}>
                Try Box Breathing →
              </Link>
            </div>

            {/* Belly breathing */}
            <div className="flex flex-col gap-3 p-5 rounded-2xl"
              style={{ backgroundColor: ts.cardBg, border: `1px solid ${ts.border}` }}>
              <div className="flex items-center gap-2">
                <span className="t-heading">💨</span>
                <p className="t-body font-semibold" style={{ color: ts.textPrimary }}>Belly Breathing</p>
                <span className="t-label px-2 py-0.5 rounded-full ml-auto"
                  style={{ background: ts.border, color: ts.textMuted }}>
                  Foundation technique
                </span>
              </div>
              <p className="t-caption leading-relaxed" style={{ color: ts.textMuted }}>
                Place one hand on your belly. Inhale slowly — only the belly rises, not the chest.
                Exhale fully, belly falls. Aim for 5–6 breaths per minute.
              </p>
              <p className="t-caption leading-relaxed" style={{ color: ts.textMuted }}>
                Diaphragmatic breathing maximally stimulates stretch receptors in the lower lungs,
                connected directly to the vagus nerve via pulmonary branches. This grounds the body
                and establishes the slow rhythm the other techniques build on.
              </p>
              <p className="t-caption" style={{ color: ts.textMuted }}>
                <strong style={{ color: ts.textPrimary }}>When:</strong> 5 minutes in bed, before trying the techniques above.
              </p>
              <Link to="/breathing"
                className="self-start px-5 py-2 rounded-xl text-white t-caption font-medium transition-all hover:opacity-90"
                style={{ background: ts.btnGradient }}>
                Start breathing →
              </Link>
            </div>
          </div>

          {divider}

          {/* Section 3 — Bedtime routine */}
          <div className="flex flex-col gap-4">
            <h2 className="t-heading font-medium" style={{ color: ts.textPrimary }}>
              Step-by-step bedtime breathwork routine
            </h2>
            {[
              {
                step: '1',
                title: 'Set the scene',
                time: '1 min',
                desc: 'Dim lights 30 minutes before. Put phone face down. Lie on your back, legs uncrossed, arms by your sides.',
              },
              {
                step: '2',
                title: 'Belly breathing warm-up',
                time: '2 min',
                desc: '6 slow belly breaths. Feel your body get heavier with each exhale.',
              },
              {
                step: '3',
                title: '4-7-8 cycles',
                time: '4 min',
                desc: "4 complete cycles. Don't count in your head — let the Breathe app pace you.",
              },
              {
                step: '4',
                title: 'Let go',
                time: '',
                desc: "After the last exhale, just breathe naturally. Don't try to sleep — your nervous system will take over.",
              },
            ].map(({ step, title, time, desc }) => (
              <div key={step} className="flex gap-4 p-4 rounded-2xl"
                style={{ backgroundColor: ts.cardBg, border: `1px solid ${ts.border}` }}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 t-body font-bold text-white"
                  style={{ background: ts.btnGradient }}>
                  {step}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="t-body font-medium" style={{ color: ts.textPrimary }}>{title}</p>
                    {time && (
                      <span className="t-label px-2 py-0.5 rounded-full"
                        style={{ background: ts.border, color: ts.textMuted }}>
                        {time}
                      </span>
                    )}
                  </div>
                  <p className="t-caption leading-relaxed" style={{ color: ts.textMuted }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>

          {divider}

          {/* Section 4 — Do / Avoid */}
          <div className="flex flex-col gap-4">
            <h2 className="t-heading font-medium" style={{ color: ts.textPrimary }}>
              What to do (and avoid) before sleep
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-3 p-4 rounded-2xl"
                style={{ backgroundColor: ts.cardBg, border: '1px solid rgba(74,232,160,0.25)' }}>
                <p className="t-body font-medium" style={{ color: '#4AE8A0' }}>✓ Do before bed</p>
                {[
                  'Breathwork (any technique above)',
                  'Body scan meditation',
                  'Gentle stretching',
                  'Reading a physical book',
                  'Cool room temperature (17–19°C)',
                ].map(item => (
                  <div key={item} className="flex items-start gap-2">
                    <span className="t-label mt-1 flex-shrink-0" style={{ color: '#4AE8A0' }}>▸</span>
                    <p className="t-caption" style={{ color: ts.textMuted }}>{item}</p>
                  </div>
                ))}
              </div>
              <div className="flex flex-col gap-3 p-4 rounded-2xl"
                style={{ backgroundColor: ts.cardBg, border: '1px solid rgba(248,113,113,0.25)' }}>
                <p className="t-body font-medium" style={{ color: '#F87171' }}>✗ Avoid before bed</p>
                {[
                  'Screens within 30 min (blue light blocks melatonin)',
                  'Caffeine after 2pm (5–7hr half-life)',
                  'Alcohol (fragments REM sleep)',
                  'Intense exercise within 2 hours',
                  'Heavy meals within 3 hours',
                ].map(item => (
                  <div key={item} className="flex items-start gap-2">
                    <span className="t-label mt-1 flex-shrink-0" style={{ color: '#F87171' }}>▸</span>
                    <p className="t-caption" style={{ color: ts.textMuted }}>{item}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {divider}

          {/* Section 5 — FAQ */}
          <div className="flex flex-col gap-4">
            <h2 className="t-heading font-medium" style={{ color: ts.textPrimary }}>
              Frequently asked questions
            </h2>
            {FAQS.map(({ q, a }) => (
              <div key={q} className="p-4 rounded-2xl"
                style={{ backgroundColor: ts.cardBg, border: `1px solid ${ts.border}` }}>
                <p className="t-body font-medium mb-2" style={{ color: ts.textPrimary }}>{q}</p>
                <p className="t-caption leading-relaxed" style={{ color: ts.textMuted }}>{a}</p>
              </div>
            ))}
          </div>

          {divider}

          {/* Section 6 — Internal links */}
          <div className="flex flex-col gap-3">
            <p className="t-label tracking-[0.25em] uppercase" style={{ color: ts.textMuted }}>
              More sleep guides
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { icon: '🧠', label: 'Why is sleep so important?',  href: '/sleep/why-sleep-is-important' },
                { icon: '😮‍💨', label: 'What is sleep apnea?',         href: '/sleep/what-is-sleep-apnea' },
              ].map(({ icon, label, href }) => (
                <Link key={href} to={href}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all hover:scale-[1.01]"
                  style={{ backgroundColor: ts.cardBg, border: `1px solid ${ts.border}` }}>
                  <span className="t-heading">{icon}</span>
                  <p className="t-body font-medium" style={{ color: ts.accent }}>{label} →</p>
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
