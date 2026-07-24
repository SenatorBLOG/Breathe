// src/pages/techniques/FocusBreathingPage.tsx
import { Link } from 'react-router-dom';
import NavBar from '../../components/NavBar';
import Footer from '../../components/Footer';
import ThemeBackground from '../../components/ThemeBackground';
import PageSEO from '../../components/PageSEO';
import { useThemeStyles } from '../../hooks/useThemeStyles';

const BOX_PRESET = { inhale: 4, hold: 4, exhale: 4, pause: 4 };

const FAQS = [
  {
    q: 'Which breathing exercise is best for focus?',
    a: 'Box breathing (4-4-4-4) before a work block. The equal counts give a wandering mind a single simple thing to track, and the pattern steadies you without making you drowsy. For longer sustained focus, coherent breathing at about 6 breaths a minute is gentler and easier to keep up.',
  },
  {
    q: 'How long before I feel a difference?',
    a: 'Two to three minutes is enough to feel a shift before a study or work session. It is not a stimulant — it will not create energy you do not have. What it does is clear the scattered, jumpy quality of attention so you can start.',
  },
  {
    q: 'Should I breathe during deep work or just before?',
    a: 'Before. Trying to count breaths while doing demanding cognitive work splits your attention. Use it as a doorway into the session, then let your breath return to normal and forget about it.',
  },
  {
    q: 'Does breathing help with attention problems or ADHD?',
    a: 'Breathing exercises can help anyone settle before a task, and many people with attention difficulties find them a useful ritual. But they are not a treatment for ADHD, and the evidence does not support them replacing established care. If attention problems significantly affect your work, study or relationships, that is worth discussing with a doctor.',
  },
];

export default function FocusBreathingPage() {
  const ts = useThemeStyles();
  const divider = <div style={{ height: 1, backgroundColor: ts.border + '40' }} />;

  return (
    <div className="relative flex flex-col min-h-screen font-montserrat">
      <PageSEO
        title="Breathing Exercises for Focus & Concentration — Before Work or Study"
        description="Breathing exercises for focus and concentration: a 3-minute box breathing routine to start deep work or study sessions with a clear, settled mind. Free and guided."
        canonical="/breathing/focus"
      />
      <ThemeBackground />

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: 'Breathing Exercises for Focus & Concentration',
        description: 'How to use box and coherent breathing to settle attention before deep work or study.',
        url: 'https://breatheonline.app/breathing/focus',
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
              Focus & Study
            </span>
            <h1 className="text-3xl sm:text-5xl font-light tracking-wide leading-tight" style={{ color: ts.textPrimary }}>
              Breathing for<br />
              <span style={{ color: ts.accent }}>Focus & Concentration</span>
            </h1>
            <p className="t-body leading-relaxed max-w-xl" style={{ color: ts.textMuted }}>
              You sit down to work and your mind is still in six tabs. Three minutes of box breathing
              is a doorway: it doesn't manufacture energy, it clears the scattered quality of attention
              so starting stops being the hard part.
            </p>
            <Link to="/breathing"
              state={{ coachPreset: BOX_PRESET, coachPresetName: 'Box Breathing' }}
              className="flex items-center gap-2 px-8 py-3.5 rounded-full text-white font-medium w-fit transition-all hover:scale-105"
              style={{ background: ts.btnGradient, boxShadow: ts.btnShadow }}>
              🌬 Focus in 3 minutes — free
            </Link>
          </div>

          {divider}

          {/* Why */}
          <div className="flex flex-col gap-4">
            <h2 className="t-heading font-medium" style={{ color: ts.textPrimary }}>
              Why breathing sharpens attention
            </h2>
            <p className="t-body leading-relaxed" style={{ color: ts.textMuted }}>
              Scattered focus is usually <strong>over-arousal</strong>, not laziness. Stress hormones
              keep your brain scanning for the next thing — which is exactly what makes you flick to
              another tab. Slow, even breathing lowers that arousal to the level where sustained
              attention is actually possible.
            </p>
            <p className="t-body leading-relaxed" style={{ color: ts.textMuted }}>
              There's a second, simpler mechanism: counting the breath is a <strong>single-task
              rehearsal</strong>. For three minutes you practise holding one thing in mind and
              returning when you drift — the exact skill the next hour of work requires.
            </p>
          </div>

          {divider}

          {/* Routine */}
          <div className="flex flex-col gap-4">
            <h2 className="t-heading font-medium" style={{ color: ts.textPrimary }}>
              The 3-minute pre-work routine
            </h2>
            {[
              { n: '1', label: 'Phone out of reach, tabs closed, water within arm\'s length', secs: '30s' },
              { n: '2', label: 'Box breathing 4-4-4-4 — around 8 slow cycles', secs: '2m' },
              { n: '3', label: 'Decide the single next action before you open anything', secs: '20s' },
              { n: '4', label: 'Start with that action — no inbox, no "quick check"', secs: '→' },
            ].map(s => (
              <div key={s.n} className="flex items-center gap-4 p-4 rounded-2xl"
                style={{ backgroundColor: ts.cardBg, border: `1px solid ${ts.border}` }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 font-bold text-white t-body"
                  style={{ background: ts.btnGradient }}>{s.n}</div>
                <p className="flex-1 t-body font-medium" style={{ color: ts.textPrimary }}>{s.label}</p>
                <span className="t-caption font-light tabular-nums flex-shrink-0" style={{ color: ts.accent }}>{s.secs}</span>
              </div>
            ))}
            <p className="t-caption leading-relaxed" style={{ color: ts.textMuted }}>
              Step 3 matters more than people expect. Breathing settles you, but an undecided task
              sends you straight back to the tabs.
            </p>
          </div>

          {divider}

          {/* Which pattern when */}
          <div className="flex flex-col gap-4">
            <h2 className="t-heading font-medium" style={{ color: ts.textPrimary }}>
              Which pattern, when
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { icon: '🟦', title: 'Before deep work — box 4-4-4-4', desc: 'Equal counts, alert but calm. The default starting ritual.' },
                { icon: '🌊', title: 'Long study sessions — coherent', desc: 'Five in, five out, no holds. Gentle enough to sustain for 10–20 minutes.' },
                { icon: '😰', title: 'Anxious about the task — long exhales', desc: 'When avoidance is really anxiety, lengthen the exhale before you start.' },
                { icon: '😴', title: 'Afternoon slump — skip the holds', desc: 'Long breath holds can make drowsiness worse. Move, get light, breathe lightly.' },
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
              Work session starting?
            </p>
            <p className="t-body max-w-sm" style={{ color: ts.textMuted }}>
              Eight guided cycles of box breathing, then straight into the task. Two minutes well
              spent.
            </p>
            <Link to="/breathing"
              state={{ coachPreset: BOX_PRESET, coachPresetName: 'Box Breathing' }}
              className="px-10 py-4 rounded-full text-white font-medium transition-all hover:scale-105"
              style={{ background: ts.btnGradient, boxShadow: ts.btnShadow }}>
              🌬 Start breathing — free
            </Link>
            <p className="t-caption" style={{ color: ts.textMuted }}>No account · No download · Works in 30 seconds</p>
          </div>

          {/* Medical disclaimer */}
          <p className="t-caption leading-relaxed text-center max-w-xl mx-auto" style={{ color: ts.textMuted, opacity: 0.9 }}>
            This article is general education, not medical advice. Breathing exercises are not a
            treatment for ADHD or any attention disorder. If concentration problems significantly
            affect your work, study or relationships, speak with a doctor — it is very treatable.
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
                { label: 'Box Breathing', href: '/breathing/box-breathing' },
                { label: 'Coherent breathing', href: '/breathing/coherent' },
                { label: 'Morning ritual', href: '/breathing/morning-ritual' },
                { label: 'All guides', href: '/learn' },
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
