// src/pages/techniques/KidsBreathingPage.tsx
//
// Written for parents/teachers, not children. Deliberately avoids breath
// holds and any Wim Hof style technique — those are not appropriate for kids.
import { Link } from 'react-router-dom';
import NavBar from '../../components/NavBar';
import Footer from '../../components/Footer';
import ThemeBackground from '../../components/ThemeBackground';
import PageSEO from '../../components/PageSEO';
import { useThemeStyles } from '../../hooks/useThemeStyles';

// Gentle, no holds — appropriate for children.
const GENTLE_PRESET = { inhale: 4, hold: 0, exhale: 6, pause: 2 };

const FAQS = [
  {
    q: 'What age can children start breathing exercises?',
    a: 'From around age 3–4, if it is playful. Young children cannot follow counts or "relax your body" instructions, but they can blow out imaginary candles, smell a flower, or make a bee sound. From about age 7 most kids can follow a simple count. Keep it under a few minutes at any age.',
  },
  {
    q: 'Which breathing exercises are safe for kids?',
    a: 'Gentle techniques with slow exhales and no breath holding: belly breathing, blowing out candles, bumble-bee breath, and figure-eight or star tracing. Avoid breath retention, rapid or forceful breathing, and Wim Hof style hyperventilation — those are not appropriate for children.',
  },
  {
    q: 'How do I get a child to actually do it?',
    a: 'Do it with them rather than instructing them, and give it a story or a prop — a pinwheel, a feather, a soft toy on the belly to make it rise. Practise when they are already calm so the skill exists before a meltdown; asking a dysregulated child to breathe for the first time rarely works.',
  },
  {
    q: 'Does it help with tantrums and anxiety?',
    a: 'Slow exhales genuinely calm the nervous system in children as in adults, and breathing is a common part of anxiety programmes for kids. It is a helpful tool, not a cure — if a child\'s anxiety is persistent or interferes with school, sleep or friendships, speak with your paediatrician.',
  },
];

const EXERCISES = [
  { icon: '🎂', title: 'Birthday candles', age: 'Age 3+', desc: 'Hold up five fingers. Breathe in through the nose, then blow out one "candle" at a time with a long, slow breath. Five fingers, five slow exhales.' },
  { icon: '🌸', title: 'Smell the flower, blow the feather', age: 'Age 3+', desc: 'Breathe in as if smelling a flower, breathe out as if moving a feather without dropping it. Real props make it click faster.' },
  { icon: '🐝', title: 'Bumble-bee breath', age: 'Age 4+', desc: 'Breathe in through the nose, then hum on the way out. The vibration is soothing and kids love it — it also naturally lengthens the exhale.' },
  { icon: '🧸', title: 'Teddy on the belly', age: 'Age 3+', desc: 'Lie down with a soft toy on the tummy. The game is to rock the teddy up and down with the breath — teaches belly breathing without any explanation.' },
  { icon: '⭐', title: 'Star or figure-eight tracing', age: 'Age 5+', desc: 'Trace a star shape with a finger: breathe in going up one side, out coming down the other. The finger gives restless hands a job.' },
  { icon: '🎈', title: 'Balloon belly', age: 'Age 5+', desc: 'Inflate the "balloon" in the tummy on the in-breath, let it slowly deflate on the out-breath. Hands on the belly to feel it.' },
];

export default function KidsBreathingPage() {
  const ts = useThemeStyles();
  const divider = <div style={{ height: 1, backgroundColor: ts.border + '40' }} />;

  return (
    <div className="relative flex flex-col min-h-screen font-montserrat">
      <PageSEO
        title="Breathing Exercises for Kids — 6 Calm-Down Techniques That Work"
        description="Simple, playful breathing exercises for children: birthday candles, bumble-bee breath, balloon belly and more. Calm big feelings at home or in the classroom. Free."
        canonical="/breathing/for-kids"
      />
      <ThemeBackground />

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: 'Breathing Exercises for Kids — 6 Calm-Down Techniques That Work',
        description: 'Playful, age-appropriate breathing exercises to help children calm down, with safety guidance for parents and teachers.',
        url: 'https://breatheonline.app/breathing/for-kids',
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
              For Parents & Teachers
            </span>
            <h1 className="text-3xl sm:text-5xl font-light tracking-wide leading-tight" style={{ color: ts.textPrimary }}>
              Breathing Exercises<br />
              <span style={{ color: ts.accent }}>for Kids</span>
            </h1>
            <p className="t-body leading-relaxed max-w-xl" style={{ color: ts.textMuted }}>
              Children can't "just calm down" on command — but they can blow out candles, hum like a
              bee, or rock a teddy bear on their tummy. Six playful exercises that teach the same
              nervous-system skill adults use, without a single instruction to relax.
            </p>
            <Link to="/breathing"
              state={{ coachPreset: GENTLE_PRESET, coachPresetName: 'Gentle Breathing' }}
              className="flex items-center gap-2 px-8 py-3.5 rounded-full text-white font-medium w-fit transition-all hover:scale-105"
              style={{ background: ts.btnGradient, boxShadow: ts.btnShadow }}>
              🌬 Breathe together — free
            </Link>
          </div>

          {/* Safety note high on the page */}
          <div className="p-5 rounded-2xl flex flex-col gap-2"
            style={{ backgroundColor: ts.cardBg, border: `1px solid ${ts.accent}66` }}>
            <p className="t-body font-medium" style={{ color: ts.textPrimary }}>👶 Keep it safe</p>
            <p className="t-caption leading-relaxed" style={{ color: ts.textMuted }}>
              For children, stick to <strong>gentle breathing with slow exhales and no breath
              holding</strong>. Skip breath retention, fast forceful breathing and Wim Hof style
              techniques entirely — they aren't appropriate for kids. Keep sessions short (1–3
              minutes), make it a game, and stop if the child dislikes it or feels dizzy.
            </p>
          </div>

          {divider}

          {/* Why it works for kids */}
          <div className="flex flex-col gap-4">
            <h2 className="t-heading font-medium" style={{ color: ts.textPrimary }}>
              Why "calm down" never works — and this does
            </h2>
            <p className="t-body leading-relaxed" style={{ color: ts.textMuted }}>
              During a meltdown, the thinking part of a child's brain is effectively offline. Verbal
              instructions ask exactly the part that isn't available. A <strong>long exhale</strong>,
              on the other hand, works from the body up: it slows the heart, and the calm arrives
              without the child needing to understand or agree with anything.
            </p>
            <p className="t-body leading-relaxed" style={{ color: ts.textMuted }}>
              That's why every exercise below is really the same technique wearing a costume — a long,
              slow out-breath. Blowing, humming and feather-moving all force the exhale to stretch out
              naturally, which is the entire mechanism.
            </p>
          </div>

          {divider}

          {/* Exercises */}
          <div className="flex flex-col gap-4">
            <h2 className="t-heading font-medium" style={{ color: ts.textPrimary }}>
              Six exercises that work
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {EXERCISES.map(({ icon, title, age, desc }) => (
                <div key={title} className="flex gap-3 p-4 rounded-2xl"
                  style={{ backgroundColor: ts.cardBg, border: `1px solid ${ts.border}` }}>
                  <span className="t-heading flex-shrink-0">{icon}</span>
                  <div>
                    <div className="flex items-baseline gap-2 flex-wrap mb-1">
                      <p className="t-caption font-medium" style={{ color: ts.textPrimary }}>{title}</p>
                      <span className="t-label" style={{ color: ts.accent }}>{age}</span>
                    </div>
                    <p className="t-caption leading-relaxed" style={{ color: ts.textMuted }}>{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {divider}

          {/* Tips */}
          <div className="flex flex-col gap-4">
            <h2 className="t-heading font-medium" style={{ color: ts.textPrimary }}>
              Making it actually stick
            </h2>
            {[
              { n: '1', label: 'Practise when they are already calm — not mid-meltdown' },
              { n: '2', label: 'Do it with them; children copy far better than they comply' },
              { n: '3', label: 'Use a prop — pinwheel, bubbles, feather, soft toy' },
              { n: '4', label: 'Keep it to 1–3 minutes and stop while it is still fun' },
            ].map(s => (
              <div key={s.n} className="flex items-center gap-4 p-4 rounded-2xl"
                style={{ backgroundColor: ts.cardBg, border: `1px solid ${ts.border}` }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 font-bold text-white t-body"
                  style={{ background: ts.btnGradient }}>{s.n}</div>
                <p className="flex-1 t-body font-medium" style={{ color: ts.textPrimary }}>{s.label}</p>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="flex flex-col items-center gap-4 py-8 rounded-3xl px-6 text-center"
            style={{ backgroundColor: ts.cardBg, border: `1px solid ${ts.border}` }}>
            <p className="t-heading font-light" style={{ color: ts.textPrimary }}>
              Try it together right now
            </p>
            <p className="t-body max-w-sm" style={{ color: ts.textMuted }}>
              The glowing orb grows and shrinks — kids follow the shape without needing any counting
              at all. A gentle 4-in, 6-out rhythm with no holds.
            </p>
            <Link to="/breathing"
              state={{ coachPreset: GENTLE_PRESET, coachPresetName: 'Gentle Breathing' }}
              className="px-10 py-4 rounded-full text-white font-medium transition-all hover:scale-105"
              style={{ background: ts.btnGradient, boxShadow: ts.btnShadow }}>
              🌬 Start breathing — free
            </Link>
            <p className="t-caption" style={{ color: ts.textMuted }}>No account · No download · Works in 30 seconds</p>
          </div>

          {/* Medical disclaimer */}
          <p className="t-caption leading-relaxed text-center max-w-xl mx-auto" style={{ color: ts.textMuted, opacity: 0.9 }}>
            This article is general education, not medical advice. If a child has asthma or another
            respiratory condition, check with your paediatrician first. Persistent anxiety, or
            distress that disrupts school, sleep or friendships, deserves a professional's attention —
            it responds very well to help at this age.
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
                { label: 'Breathing for anxiety', href: '/breathing/anxiety' },
                { label: 'Breathwork for deep sleep', href: '/sleep/breathwork-for-deep-sleep' },
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
