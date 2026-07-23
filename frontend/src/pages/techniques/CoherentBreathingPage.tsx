// src/pages/techniques/CoherentBreathingPage.tsx
import { Link } from 'react-router-dom';
import NavBar from '../../components/NavBar';
import Footer from '../../components/Footer';
import ThemeBackground from '../../components/ThemeBackground';
import PageSEO from '../../components/PageSEO';
import { useThemeStyles } from '../../hooks/useThemeStyles';

// Matches the app's coherent preset so the CTA lands with it preloaded.
const COHERENT_PRESET = { inhale: 5, hold: 0, exhale: 5, pause: 1 };

const FAQS = [
  {
    q: 'What is coherent breathing?',
    a: 'Coherent breathing is slow, even breathing at about 5 to 6 breaths per minute — roughly a 5-second inhale and a 5-second exhale with no holds. At this pace the heart, lungs and nervous system fall into sync, which maximises heart rate variability (HRV) and calms the body.',
  },
  {
    q: 'What is the ideal rate — 5, 5.5, or 6 breaths per minute?',
    a: 'The "resonance frequency" of most adults sits between 4.5 and 6.5 breaths per minute, with 5.5 as a common average. Anywhere in that band works. A simple 5-second-in, 5-second-out rhythm (6 breaths/min) is the easiest place to start.',
  },
  {
    q: 'How is coherent breathing different from box breathing?',
    a: 'Box breathing holds the breath between phases (4-4-4-4). Coherent breathing has no holds — just a smooth, continuous wave in and out. Coherent is gentler and better for sustained calm and HRV; box is better for acute focus and stress spikes.',
  },
  {
    q: 'How long should I practise?',
    a: 'Five minutes has a noticeable calming effect. Ten to twenty minutes a day over several weeks is where the research shows lasting improvements in stress, blood pressure and HRV.',
  },
];

export default function CoherentBreathingPage() {
  const ts = useThemeStyles();
  const divider = <div style={{ height: 1, backgroundColor: ts.border + '40' }} />;

  return (
    <div className="relative flex flex-col min-h-screen font-montserrat">
      <PageSEO
        title="Coherent Breathing — 5–6 Breaths Per Minute for Calm & HRV"
        description="Coherent breathing (resonance breathing) at 5–6 breaths per minute syncs your heart and nervous system, boosts HRV, and lowers stress. Free guided sessions online."
        canonical="/breathing/coherent"
      />
      <ThemeBackground />

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: 'Coherent Breathing — 5–6 Breaths Per Minute for Calm & HRV',
        description: 'How coherent (resonance) breathing at 5–6 breaths per minute improves heart rate variability and calms the nervous system.',
        url: 'https://breatheonline.app/breathing/coherent',
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
              Coherent Breathing<br />
              <span style={{ color: ts.accent }}>5–6 breaths a minute</span>
            </h1>
            <p className="t-body leading-relaxed max-w-xl" style={{ color: ts.textMuted }}>
              Slow your breath to about six a minute — five seconds in, five seconds out — and
              your heart, lungs and nervous system lock into a single calm rhythm. It's the
              gentlest, most sustainable way to lower stress and raise heart rate variability.
            </p>
            <Link to="/breathing"
              state={{ coachPreset: COHERENT_PRESET, coachPresetName: 'Coherent Breathing' }}
              className="flex items-center gap-2 px-8 py-3.5 rounded-full text-white font-medium w-fit transition-all hover:scale-105"
              style={{ background: ts.btnGradient, boxShadow: ts.btnShadow }}>
              🌬 Try coherent breathing — free
            </Link>
          </div>

          {divider}

          {/* Why it works */}
          <div className="flex flex-col gap-4">
            <h2 className="t-heading font-medium" style={{ color: ts.textPrimary }}>
              Why 6 breaths a minute is the magic number
            </h2>
            <p className="t-body leading-relaxed" style={{ color: ts.textMuted }}>
              Every cardiovascular system has a <strong>resonance frequency</strong> — a breathing
              rate at which heart rate, blood pressure and breath naturally rise and fall together.
              For most adults that's between 4.5 and 6.5 breaths per minute. Breathe at that pace and
              the swings in your heart rate grow large and smooth, a state measured as high
              <strong> heart rate variability (HRV)</strong> — the single best marker of a resilient,
              well-regulated nervous system.
            </p>
            <p className="t-body leading-relaxed" style={{ color: ts.textMuted }}>
              Unlike techniques with breath holds, coherent breathing is a continuous wave. That makes
              it easy to sustain for ten or twenty minutes, which is where the lasting benefits —
              lower resting stress, steadier blood pressure, better focus — actually build.
            </p>
          </div>

          {divider}

          {/* How to */}
          <div className="flex flex-col gap-4">
            <h2 className="t-heading font-medium" style={{ color: ts.textPrimary }}>
              How to do it
            </h2>
            {[
              { n: '1', label: 'Breathe in gently through your nose', secs: '5s' },
              { n: '2', label: 'Breathe out slowly — no pause, no force', secs: '5s' },
              { n: '3', label: 'Keep the wave smooth and even', secs: '↻' },
              { n: '4', label: 'Continue for 5–20 minutes', secs: '∞' },
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
              Prefer 5.5 breaths a minute? Use a 5.5-second inhale and exhale. Anywhere in the
              4.5–6.5 range is your resonance zone — pick what feels effortless.
            </p>
          </div>

          {divider}

          {/* When to use */}
          <div className="flex flex-col gap-4">
            <h2 className="t-heading font-medium" style={{ color: ts.textPrimary }}>
              When coherent breathing shines
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { icon: '🧘', title: 'Daily stress baseline', desc: '10 minutes each morning or evening lowers your resting stress over 2–4 weeks.' },
                { icon: '❤️', title: 'HRV & heart health', desc: 'The most reliable breathing pattern for raising HRV and supporting healthy blood pressure.' },
                { icon: '🎯', title: 'Before focused work', desc: 'A few minutes settles a scattered mind into steady, sustained attention.' },
                { icon: '😌', title: 'Winding down', desc: 'Gentler than 4-7-8 for people who dislike breath holds — pure smooth rhythm.' },
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
              Find your rhythm now
            </p>
            <p className="t-body max-w-sm" style={{ color: ts.textMuted }}>
              The guided orb paces your breath at a smooth 5-in, 5-out. Just follow it.
            </p>
            <Link to="/breathing"
              state={{ coachPreset: COHERENT_PRESET, coachPresetName: 'Coherent Breathing' }}
              className="px-10 py-4 rounded-full text-white font-medium transition-all hover:scale-105"
              style={{ background: ts.btnGradient, boxShadow: ts.btnShadow }}>
              🌬 Start breathing — free
            </Link>
            <p className="t-caption" style={{ color: ts.textMuted }}>No account · No download · Works in 30 seconds</p>
          </div>

          {/* Medical disclaimer */}
          <p className="t-caption leading-relaxed text-center max-w-xl mx-auto" style={{ color: ts.textMuted, opacity: 0.8 }}>
            This article is general education, not medical advice. Coherent breathing supports — but
            doesn't replace — treatment for high blood pressure, heart conditions, or anxiety
            disorders. If you have a medical condition, check with your doctor.
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
                { label: 'The science of slow breathing', href: '/science/slow-breathing' },
                { label: 'Breathing & blood pressure', href: '/breathing/high-blood-pressure' },
                { label: 'Belly breathing', href: '/breathing/belly-breathing' },
                { label: 'Box Breathing', href: '/breathing/box-breathing' },
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
