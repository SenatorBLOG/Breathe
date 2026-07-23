// src/pages/techniques/BellyBreathingPage.tsx
import { Link } from 'react-router-dom';
import NavBar from '../../components/NavBar';
import Footer from '../../components/Footer';
import ThemeBackground from '../../components/ThemeBackground';
import PageSEO from '../../components/PageSEO';
import { useThemeStyles } from '../../hooks/useThemeStyles';

// Matches the app's belly preset so the CTA lands with it preloaded.
const BELLY_PRESET = { inhale: 4, hold: 0, exhale: 6, pause: 2 };

const FAQS = [
  {
    q: 'What is diaphragmatic (belly) breathing?',
    a: 'Diaphragmatic breathing means breathing with your diaphragm — the dome-shaped muscle under your lungs — instead of your chest and shoulders. As the diaphragm contracts and drops, your belly rises. It is the way you breathed as a baby, and the way you breathe in deep sleep.',
  },
  {
    q: 'How do I know if I am breathing from my chest?',
    a: 'Put one hand on your chest and one on your belly. Breathe normally. If the top hand moves more than the bottom one, you are chest breathing. In diaphragmatic breathing the belly hand rises first and moves further, while the chest hand stays almost still.',
  },
  {
    q: 'Why is belly breathing better?',
    a: 'The lower lobes of your lungs hold the most blood, so belly breathing exchanges oxygen more efficiently with less effort. It also stimulates the vagus nerve, which lowers heart rate and shifts you out of stress mode. Chest breathing is shallow, faster, and mimics the pattern your body uses when anxious — which keeps the stress loop running.',
  },
  {
    q: 'How long until it feels natural?',
    a: 'Most people feel the difference in the first session, but rewiring a lifetime of chest breathing takes practice. Five to ten minutes a day for two to three weeks is usually enough for it to start happening automatically.',
  },
];

export default function BellyBreathingPage() {
  const ts = useThemeStyles();
  const divider = <div style={{ height: 1, backgroundColor: ts.border + '40' }} />;

  return (
    <div className="relative flex flex-col min-h-screen font-montserrat">
      <PageSEO
        title="Diaphragmatic Breathing — How to Belly Breathe Properly"
        description="Learn diaphragmatic (belly) breathing step by step: breathe with your diaphragm, not your chest. Reduces stress, improves oxygen exchange. Free guided practice."
        canonical="/breathing/belly-breathing"
      />
      <ThemeBackground />

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: 'Diaphragmatic Breathing — How to Belly Breathe Properly',
        description: 'A step-by-step guide to diaphragmatic (belly) breathing, why it beats chest breathing, and how to make it automatic.',
        url: 'https://breatheonline.app/breathing/belly-breathing',
        author: { '@type': 'Organization', name: 'Breathe' },
        mainEntity: FAQS.map(({ q, a }) => ({
          '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a },
        })),
      }) }} />

      <div className="relative z-10 flex flex-col min-h-screen">
        <NavBar />
        <main className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 py-12 flex flex-col gap-10">

          {/* Hero */}
          <div className="flex flex-col gap-3">
            <span className="t-label tracking-[0.3em] uppercase border px-4 py-1.5 rounded-full w-fit"
              style={{ color: ts.textMuted, borderColor: ts.border }}>
              Breathing Technique
            </span>
            <h1 className="text-3xl sm:text-5xl font-light tracking-wide leading-tight" style={{ color: ts.textPrimary }}>
              Diaphragmatic Breathing<br />
              <span style={{ color: ts.accent }}>breathe with your belly</span>
            </h1>
            <p className="t-body leading-relaxed max-w-xl" style={{ color: ts.textMuted }}>
              Most adults breathe with their chest and shoulders all day — shallow, fast, and stuck
              in a low-grade stress pattern. Belly breathing puts the work back where it belongs:
              the diaphragm. It's the foundation every other technique is built on.
            </p>
            <Link to="/breathing"
              state={{ coachPreset: BELLY_PRESET, coachPresetName: 'Belly Breathing' }}
              className="flex items-center gap-2 px-8 py-3.5 rounded-full text-white font-medium w-fit transition-all hover:scale-105"
              style={{ background: ts.btnGradient, boxShadow: ts.btnShadow }}>
              🌬 Practise belly breathing — free
            </Link>
          </div>

          {divider}

          {/* Chest vs belly */}
          <div className="flex flex-col gap-4">
            <h2 className="t-heading font-medium" style={{ color: ts.textPrimary }}>
              Chest breathing vs belly breathing
            </h2>
            <p className="t-body leading-relaxed" style={{ color: ts.textMuted }}>
              Try this now: one hand on your chest, one on your belly, and breathe as you normally
              would. If the <strong>top</strong> hand moves more, you're a chest breather — like most
              adults. If the <strong>bottom</strong> hand rises first and further, you're already
              breathing diaphragmatically.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-5 rounded-2xl flex flex-col gap-2"
                style={{ backgroundColor: ts.cardBg, border: `1px solid ${ts.border}` }}>
                <p className="t-body font-medium" style={{ color: ts.textPrimary }}>😰 Chest breathing</p>
                <p className="t-caption leading-relaxed" style={{ color: ts.textMuted }}>
                  Shallow and fast. Uses neck and shoulder muscles, so they stay tense. Only fills the
                  upper lungs — the same pattern your body uses when it's anxious, which quietly keeps
                  the stress signal running all day.
                </p>
              </div>
              <div className="p-5 rounded-2xl flex flex-col gap-2"
                style={{ backgroundColor: ts.cardBg, border: `1px solid ${ts.border}` }}>
                <p className="t-body font-medium" style={{ color: ts.textPrimary }}>🌿 Belly breathing</p>
                <p className="t-caption leading-relaxed" style={{ color: ts.textMuted }}>
                  Slow and full. The diaphragm drops, the belly rises, and the lower lungs — where
                  most of the blood is — do the gas exchange. More oxygen for less effort, and it
                  stimulates the vagus nerve to calm you down.
                </p>
              </div>
            </div>
          </div>

          {divider}

          {/* How to */}
          <div className="flex flex-col gap-4">
            <h2 className="t-heading font-medium" style={{ color: ts.textPrimary }}>
              How to belly breathe, step by step
            </h2>
            {[
              { n: '1', label: 'Lie down or sit upright; one hand on chest, one on belly', secs: '—' },
              { n: '2', label: 'Inhale through your nose — let the belly hand rise', secs: '4s' },
              { n: '3', label: 'Exhale slowly through pursed lips — belly falls', secs: '6s' },
              { n: '4', label: 'Rest a beat, keep the chest hand still throughout', secs: '2s' },
            ].map(s => (
              <div key={s.n} className="flex items-center gap-4 p-4 rounded-2xl"
                style={{ backgroundColor: ts.cardBg, border: `1px solid ${ts.border}` }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 font-bold text-white t-body"
                  style={{ background: ts.btnGradient }}>{s.n}</div>
                <p className="flex-1 t-body font-medium" style={{ color: ts.textPrimary }}>{s.label}</p>
                <span className="text-2xl font-light tabular-nums flex-shrink-0" style={{ color: ts.accent }}>{s.secs}</span>
              </div>
            ))}
            <p className="t-caption leading-relaxed" style={{ color: ts.textMuted }}>
              Lying on your back with knees bent is the easiest way to learn it — gravity makes the
              belly movement obvious. Once it clicks, it transfers to sitting and standing.
            </p>
          </div>

          {divider}

          {/* Why bother */}
          <div className="flex flex-col gap-4">
            <h2 className="t-heading font-medium" style={{ color: ts.textPrimary }}>
              What it does for you
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { icon: '😌', title: 'Lower baseline stress', desc: 'Deep, slow breaths stimulate the vagus nerve and pull you out of low-grade fight-or-flight.' },
                { icon: '💪', title: 'Less neck & shoulder tension', desc: 'Stop recruiting accessory muscles for something the diaphragm should be doing.' },
                { icon: '🫁', title: 'Better oxygen exchange', desc: 'The lower lung lobes hold the most blood — filling them is simply more efficient.' },
                { icon: '🧱', title: 'Foundation for everything else', desc: 'Box breathing, 4-7-8 and coherent breathing all work better once you breathe from the belly.' },
              ].map(({ icon, title, desc }) => (
                <div key={title} className="flex gap-3 p-4 rounded-2xl"
                  style={{ backgroundColor: ts.cardBg, border: `1px solid ${ts.border}` }}>
                  <span className="t-heading flex-shrink-0">{icon}</span>
                  <div>
                    <p className="t-caption font-medium mb-1" style={{ color: ts.textPrimary }}>{title}</p>
                    <p className="t-caption leading-relaxed" style={{ color: ts.textMuted }}>{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="flex flex-col items-center gap-4 py-8 rounded-3xl px-6 text-center"
            style={{ backgroundColor: ts.cardBg, border: `1px solid ${ts.border}` }}>
            <p className="t-heading font-light" style={{ color: ts.textPrimary }}>
              Let the orb pace you
            </p>
            <p className="t-body max-w-sm" style={{ color: ts.textMuted }}>
              A gentle 4-second in, 6-second out rhythm — the easiest way to train the pattern until
              it becomes automatic.
            </p>
            <Link to="/breathing"
              state={{ coachPreset: BELLY_PRESET, coachPresetName: 'Belly Breathing' }}
              className="px-10 py-4 rounded-full text-white font-medium transition-all hover:scale-105"
              style={{ background: ts.btnGradient, boxShadow: ts.btnShadow }}>
              🌬 Start breathing — free
            </Link>
            <p className="t-caption" style={{ color: ts.textMuted }}>No account · No download · Works in 30 seconds</p>
          </div>

          {/* Medical disclaimer */}
          <p className="t-caption leading-relaxed text-center max-w-xl mx-auto" style={{ color: ts.textMuted, opacity: 0.8 }}>
            This article is general education, not medical advice. If you have a lung condition such
            as COPD or asthma, ask your doctor or a respiratory physiotherapist before changing how
            you breathe.
          </p>

          {divider}

          {/* FAQ */}
          <div className="flex flex-col gap-3">
            <h2 className="t-heading font-medium" style={{ color: ts.textPrimary }}>Common questions</h2>
            {FAQS.map(({ q, a }) => (
              <div key={q} className="p-5 rounded-2xl flex flex-col gap-2"
                style={{ backgroundColor: ts.cardBg, border: `1px solid ${ts.border}` }}>
                <p className="t-body font-medium" style={{ color: ts.textPrimary }}>{q}</p>
                <p className="t-caption leading-relaxed" style={{ color: ts.textMuted }}>{a}</p>
              </div>
            ))}
          </div>

          {/* Related */}
          <div className="flex flex-col gap-3">
            <p className="t-label tracking-[0.25em] uppercase" style={{ color: ts.textMuted }}>Keep reading</p>
            <div className="flex flex-wrap gap-2">
              {[
                { label: 'Coherent Breathing', href: '/breathing/coherent' },
                { label: 'Breathing for anxiety', href: '/breathing/anxiety' },
                { label: 'The physiological sigh', href: '/breathing/physiological-sigh' },
                { label: 'The science of slow breathing', href: '/science/slow-breathing' },
              ].map(({ label, href }) => (
                <Link key={href} to={href} className="px-4 py-2 rounded-xl t-caption transition-all"
                  style={{ color: ts.accent, border: `1px solid ${ts.border}` }}>
                  {label} →
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
