// src/pages/techniques/PublicSpeakingPage.tsx
import { Link } from 'react-router-dom';
import NavBar from '../../components/NavBar';
import Footer from '../../components/Footer';
import ThemeBackground from '../../components/ThemeBackground';
import PageSEO from '../../components/PageSEO';
import { useThemeStyles } from '../../hooks/useThemeStyles';

const BOX_PRESET = { inhale: 4, hold: 4, exhale: 4, pause: 4 };

const FAQS = [
  {
    q: 'What is the best breathing exercise before public speaking?',
    a: 'Box breathing (4-4-4-4) in the last few minutes before you go on. The equal counts give a racing mind something to hold onto, and the rhythm steadies your heart rate without making you sleepy — you stay alert but calm. If you only have one breath, use a physiological sigh: two inhales, one long exhale.',
  },
  {
    q: 'Why does my voice shake when I am nervous?',
    a: 'Adrenaline makes you breathe high and fast in the chest, so you run out of air mid-sentence and your vocal cords tighten. The shake is a symptom of shallow breathing, not of weakness. Breathing low into the belly gives your voice a steady column of air to sit on.',
  },
  {
    q: 'How soon before speaking should I breathe?',
    a: 'Start 3–5 minutes before you go on and keep it slow while you wait. A last physiological sigh right before your first sentence resets you without anyone noticing.',
  },
  {
    q: 'Should I try to make the nerves go away completely?',
    a: 'No — and you cannot. Some adrenaline sharpens you; the best speakers feel it too. The goal is to keep the arousal without the shaking hands and shallow voice. Breathing does exactly that: it lowers the physical symptoms while leaving the alertness.',
  },
];

export default function PublicSpeakingPage() {
  const ts = useThemeStyles();
  const divider = <div style={{ height: 1, backgroundColor: ts.border + '40' }} />;

  return (
    <div className="relative flex flex-col min-h-screen font-montserrat">
      <PageSEO
        title="Breathing Before Public Speaking — Calm Nerves & Steady Your Voice"
        description="Breathing exercises to calm nerves before public speaking. Stop a shaking voice, steady your hands, and stay sharp on stage. Free guided techniques you can do backstage."
        canonical="/breathing/public-speaking"
      />
      <ThemeBackground />

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: 'Breathing Before Public Speaking — Calm Nerves & Steady Your Voice',
        description: 'Breathing techniques to calm nerves, steady a shaking voice, and stay sharp before speaking in public.',
        url: 'https://breatheonline.app/breathing/public-speaking',
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
              Performance Nerves
            </span>
            <h1 className="text-3xl sm:text-5xl font-light tracking-wide leading-tight" style={{ color: ts.textPrimary }}>
              Breathing Before<br />
              <span style={{ color: ts.accent }}>Public Speaking</span>
            </h1>
            <p className="t-body leading-relaxed max-w-xl" style={{ color: ts.textMuted }}>
              Shaking hands, a voice that wobbles, going blank on the first line — that's adrenaline,
              not a lack of preparation. Three minutes of the right breathing backstage keeps the
              sharpness and drops the shake. Nobody can see you doing it.
            </p>
            <Link to="/breathing"
              state={{ coachPreset: BOX_PRESET, coachPresetName: 'Box Breathing' }}
              className="flex items-center gap-2 px-8 py-3.5 rounded-full text-white font-medium w-fit transition-all hover:scale-105"
              style={{ background: ts.btnGradient, boxShadow: ts.btnShadow }}>
              🌬 Calm down before you speak — free
            </Link>
          </div>

          {divider}

          {/* Why the voice shakes */}
          <div className="flex flex-col gap-4">
            <h2 className="t-heading font-medium" style={{ color: ts.textPrimary }}>
              Why your voice shakes (and it isn't nerves alone)
            </h2>
            <p className="t-body leading-relaxed" style={{ color: ts.textMuted }}>
              When you're about to speak, your brain treats the audience like a threat and releases
              adrenaline. Breathing goes <strong>high and fast into the chest</strong>, which does
              three things you can feel on stage: you run out of air halfway through a sentence, your
              vocal cords tighten and the pitch wobbles, and your hands tremble because the muscles
              are primed to move.
            </p>
            <p className="t-body leading-relaxed" style={{ color: ts.textMuted }}>
              None of that is a character flaw — it's mechanics. And mechanics can be fixed. Slow the
              breath and move it down into the belly, and your voice gets a steady column of air to
              sit on. The nerves stay; the symptoms fade.
            </p>
          </div>

          {divider}

          {/* Timeline */}
          <div className="flex flex-col gap-4">
            <h2 className="t-heading font-medium" style={{ color: ts.textPrimary }}>
              Your backstage timeline
            </h2>
            {[
              { n: '1', label: '10 min before — belly breathing, long exhales, settle the baseline', secs: '4-6' },
              { n: '2', label: '3 min before — box breathing 4-4-4-4, five slow cycles', secs: '4-4-4-4' },
              { n: '3', label: 'Right before your first line — one physiological sigh', secs: '×1' },
              { n: '4', label: 'On stage — exhale fully before each new point', secs: '↻' },
            ].map(s => (
              <div key={s.n} className="flex items-center gap-4 p-4 rounded-2xl"
                style={{ backgroundColor: ts.cardBg, border: `1px solid ${ts.border}` }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 font-bold text-white t-body"
                  style={{ background: ts.btnGradient }}>{s.n}</div>
                <p className="flex-1 t-body font-medium" style={{ color: ts.textPrimary }}>{s.label}</p>
                <span className="t-caption font-light tabular-nums flex-shrink-0" style={{ color: ts.accent }}>{s.secs}</span>
              </div>
            ))}
          </div>

          {divider}

          {/* Situations */}
          <div className="flex flex-col gap-4">
            <h2 className="t-heading font-medium" style={{ color: ts.textPrimary }}>
              Works for more than stages
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { icon: '🎤', title: 'Presentations & talks', desc: 'Five box-breathing cycles in the wings lower heart rate before you walk on.' },
                { icon: '💼', title: 'Job interviews', desc: 'Do it in the waiting room. Slow exhales keep your answers measured instead of rushed.' },
                { icon: '💻', title: 'Video calls', desc: 'Two minutes before you unmute — nobody sees it, and your voice lands steadier.' },
                { icon: '🎓', title: 'Exams & vivas', desc: 'Box breathing narrows a spiralling mind to one simple count you can control.' },
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
              Speaking soon? Start now
            </p>
            <p className="t-body max-w-sm" style={{ color: ts.textMuted }}>
              Five cycles of guided box breathing takes about 90 seconds — enough to feel your
              heart rate come down before you go on.
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
          <p className="t-caption leading-relaxed text-center max-w-xl mx-auto" style={{ color: ts.textMuted, opacity: 0.8 }}>
            This article is general education, not medical advice. If fear of speaking or social
            situations regularly stops you doing things that matter to you, that's worth raising with
            a doctor or therapist — it responds very well to treatment.
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
                { label: 'The physiological sigh', href: '/breathing/physiological-sigh' },
                { label: 'Breathing for anxiety', href: '/breathing/anxiety' },
                { label: 'Fight-or-flight explained', href: '/science/fight-or-flight' },
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
