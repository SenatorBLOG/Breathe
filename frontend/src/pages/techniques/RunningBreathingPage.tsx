// src/pages/techniques/RunningBreathingPage.tsx
import { Link } from 'react-router-dom';
import NavBar from '../../components/NavBar';
import Footer from '../../components/Footer';
import ThemeBackground from '../../components/ThemeBackground';
import PageSEO from '../../components/PageSEO';
import { useThemeStyles } from '../../hooks/useThemeStyles';

const BELLY_PRESET = { inhale: 4, hold: 0, exhale: 6, pause: 2 };

const FAQS = [
  {
    q: 'Should I breathe through my nose or mouth when running?',
    a: 'Both. Nose-only breathing works at easy conversational paces and filters and warms the air, but it cannot move enough air once you push the pace. Most runners breathe in through the nose and mouth together and out through the mouth. Do not force nose-only breathing at hard efforts — you will just run short of air.',
  },
  {
    q: 'What is rhythmic breathing and does it matter?',
    a: 'Rhythmic breathing means syncing your breath to your footfalls — for example inhaling for 3 steps and exhaling for 2 on easy runs, or 2:1 when working hard. An odd-numbered pattern alternates which foot lands as you start each exhale, spreading impact instead of always loading the same side.',
  },
  {
    q: 'How do I stop a side stitch?',
    a: 'Slow down, then exhale forcefully as the foot on the opposite side to the stitch strikes the ground, for several breaths. Breathing deeper into the belly rather than shallow into the chest usually prevents them, and so does avoiding a big meal or lots of fluid right before running.',
  },
  {
    q: 'Why am I out of breath so quickly?',
    a: 'Usually pace, not lungs. If you cannot speak a short sentence, you are running too fast for an easy run — most training should be at conversational pace. Shallow chest breathing makes it worse, so practising belly breathing at rest transfers directly to running.',
  },
];

export default function RunningBreathingPage() {
  const ts = useThemeStyles();
  const divider = <div style={{ height: 1, backgroundColor: ts.border + '40' }} />;

  return (
    <div className="relative flex flex-col min-h-screen font-montserrat">
      <PageSEO
        title="How to Breathe While Running — Rhythm, Nose vs Mouth & Side Stitches"
        description="How to breathe while running: rhythmic 3:2 breathing, nose vs mouth, belly breathing, and how to stop a side stitch. Practical guide for beginners and runners."
        canonical="/breathing/running"
      />
      <ThemeBackground />

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: 'How to Breathe While Running — Rhythm, Nose vs Mouth & Side Stitches',
        description: 'A practical guide to breathing while running: rhythmic breathing patterns, nose versus mouth, and fixing side stitches.',
        url: 'https://breatheonline.app/breathing/running',
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
              Breathing & Sport
            </span>
            <h1 className="text-3xl sm:text-5xl font-light tracking-wide leading-tight" style={{ color: ts.textPrimary }}>
              How to Breathe<br />
              <span style={{ color: ts.accent }}>While Running</span>
            </h1>
            <p className="t-body leading-relaxed max-w-xl" style={{ color: ts.textMuted }}>
              Gasping two kilometres in usually isn't your lungs — it's pace, shallow chest breathing,
              and no rhythm. Fix those three and running gets noticeably easier, without getting fitter
              first.
            </p>
            <Link to="/breathing"
              state={{ coachPreset: BELLY_PRESET, coachPresetName: 'Belly Breathing' }}
              className="flex items-center gap-2 px-8 py-3.5 rounded-full text-white font-medium w-fit transition-all hover:scale-105"
              style={{ background: ts.btnGradient, boxShadow: ts.btnShadow }}>
              🌬 Train belly breathing — free
            </Link>
          </div>

          {divider}

          {/* Nose vs mouth */}
          <div className="flex flex-col gap-4">
            <h2 className="t-heading font-medium" style={{ color: ts.textPrimary }}>
              Nose or mouth? Both.
            </h2>
            <p className="t-body leading-relaxed" style={{ color: ts.textMuted }}>
              Nose breathing filters, warms and humidifies air, and it's plenty at an easy pace. But
              the nose simply cannot move enough air once you're working hard — that's physics, not
              weakness. The practical answer most runners land on: <strong>in through nose and mouth
              together, out through the mouth</strong>, letting the mouth take over as effort rises.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-5 rounded-2xl flex flex-col gap-2"
                style={{ backgroundColor: ts.cardBg, border: `1px solid ${ts.border}` }}>
                <p className="t-body font-medium" style={{ color: ts.textPrimary }}>🐢 Easy pace</p>
                <p className="t-caption leading-relaxed" style={{ color: ts.textMuted }}>
                  Nose breathing is comfortable and a useful gauge — if you can't sustain it, you're
                  probably running your easy runs too fast.
                </p>
              </div>
              <div className="p-5 rounded-2xl flex flex-col gap-2"
                style={{ backgroundColor: ts.cardBg, border: `1px solid ${ts.border}` }}>
                <p className="t-body font-medium" style={{ color: ts.textPrimary }}>🔥 Hard effort</p>
                <p className="t-caption leading-relaxed" style={{ color: ts.textMuted }}>
                  Open the mouth without guilt. Restricting airflow during intervals or hills costs
                  you performance and gains nothing.
                </p>
              </div>
            </div>
          </div>

          {divider}

          {/* Rhythmic breathing */}
          <div className="flex flex-col gap-4">
            <h2 className="t-heading font-medium" style={{ color: ts.textPrimary }}>
              Rhythmic breathing: match breath to footfall
            </h2>
            <p className="t-body leading-relaxed" style={{ color: ts.textMuted }}>
              Counting your breath against your steps gives your mind something steady to hold and
              stops the ragged, panicky breathing that creeps in when you tire. Odd-numbered patterns
              have a bonus: you start each exhale on the alternate foot, so the impact of the
              exhale — when your core is least braced — doesn't always land on the same side.
            </p>
            {[
              { n: '3:2', label: 'Easy / conversational runs — in for 3 steps, out for 2', color: ts.accent },
              { n: '2:2', label: 'Steady, moderate effort — the most common default', color: ts.accent },
              { n: '2:1', label: 'Hard efforts, hills, intervals', color: ts.accent },
            ].map(s => (
              <div key={s.n} className="flex items-center gap-4 p-4 rounded-2xl"
                style={{ backgroundColor: ts.cardBg, border: `1px solid ${ts.border}` }}>
                <div className="px-3 h-10 rounded-xl flex items-center justify-center flex-shrink-0 font-bold text-white t-body tabular-nums"
                  style={{ background: ts.btnGradient }}>{s.n}</div>
                <p className="flex-1 t-body font-medium" style={{ color: ts.textPrimary }}>{s.label}</p>
              </div>
            ))}
            <p className="t-caption leading-relaxed" style={{ color: ts.textMuted }}>
              Don't force a pattern that feels wrong — it should reduce effort, not add homework. Try
              it on easy runs first until it becomes automatic.
            </p>
          </div>

          {divider}

          {/* Side stitch */}
          <div className="flex flex-col gap-4">
            <h2 className="t-heading font-medium" style={{ color: ts.textPrimary }}>
              Killing a side stitch
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { icon: '🐌', title: 'Ease off first', desc: 'Slow to a jog or walk. Trying to power through a stitch usually just extends it.' },
                { icon: '💨', title: 'Exhale on the opposite foot', desc: 'Breathe out forcefully as the foot opposite the stitch strikes, for several breaths.' },
                { icon: '🌿', title: 'Breathe lower', desc: 'Shallow chest breathing is the usual culprit. Deep belly breaths relieve and prevent it.' },
                { icon: '🥤', title: 'Check your timing', desc: 'Large meals or lots of fluid right before a run make stitches far more likely.' },
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
              Train the mechanics off the road
            </p>
            <p className="t-body max-w-sm" style={{ color: ts.textMuted }}>
              Belly breathing is far easier to learn standing still. A few minutes a day and it starts
              showing up in your running automatically.
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
          <p className="t-caption leading-relaxed text-center max-w-xl mx-auto" style={{ color: ts.textMuted, opacity: 0.9 }}>
            This article is general education, not medical advice. Breathlessness that is sudden,
            severe, or comes with chest pain, wheeze or dizziness needs a doctor — exercise-induced
            asthma is common and very treatable.
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
                { label: 'Belly breathing', href: '/breathing/belly-breathing' },
                { label: 'Wim Hof Method', href: '/breathing/wim-hof' },
                { label: 'Coherent breathing', href: '/breathing/coherent' },
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
