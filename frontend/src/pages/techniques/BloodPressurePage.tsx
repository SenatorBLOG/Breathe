// src/pages/techniques/BloodPressurePage.tsx
//
// Health-claims page — deliberately conservative. Slow breathing has real but
// MODEST evidence for lowering blood pressure, and only as an adjunct. Nothing
// here may imply it replaces medication or a doctor; the disclaimer is placed
// high on the page, not buried at the bottom.
import { Link } from 'react-router-dom';
import NavBar from '../../components/NavBar';
import Footer from '../../components/Footer';
import ThemeBackground from '../../components/ThemeBackground';
import PageSEO from '../../components/PageSEO';
import { useThemeStyles } from '../../hooks/useThemeStyles';

const COHERENT_PRESET = { inhale: 5, hold: 0, exhale: 5, pause: 1 };

const FAQS = [
  {
    q: 'Can breathing exercises lower blood pressure?',
    a: 'Slow breathing at around 6 breaths per minute can produce a modest reduction in blood pressure — studies typically report a few mmHg with regular daily practice. It is a genuine, measurable effect, but it is small compared with medication, weight loss, reducing salt, or exercise. Treat it as one helpful habit among several, not as a treatment on its own.',
  },
  {
    q: 'How long and how often do I need to practise?',
    a: 'The research that shows an effect generally uses about 15 minutes a day, most days, sustained over weeks. A single session may relax you in the moment, but the blood-pressure benefit comes from consistency.',
  },
  {
    q: 'Can I stop my blood pressure medication if I breathe every day?',
    a: 'No. Never stop or reduce prescribed medication because of a breathing practice. Untreated high blood pressure damages the heart, brain, kidneys and eyes silently, often with no symptoms. Any change to your medication is a decision for your doctor alone.',
  },
  {
    q: 'Which breathing pattern is best for blood pressure?',
    a: 'Slow, even breathing with no strain — roughly a 5-second inhale and 5-second exhale (coherent breathing). Avoid forceful techniques with long breath holds, such as Wim Hof style hyperventilation, if you have hypertension or a heart condition, unless your doctor has cleared them.',
  },
];

export default function BloodPressurePage() {
  const ts = useThemeStyles();
  const divider = <div style={{ height: 1, backgroundColor: ts.border + '40' }} />;

  return (
    <div className="relative flex flex-col min-h-screen font-montserrat">
      <PageSEO
        title="Breathing Exercises for High Blood Pressure — What the Evidence Says"
        description="Can slow breathing lower blood pressure? An honest look at the evidence, the realistic effect size, and how to practise coherent breathing safely alongside your treatment."
        canonical="/breathing/high-blood-pressure"
      />
      <ThemeBackground />

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: 'Breathing Exercises for High Blood Pressure — What the Evidence Says',
        description: 'An honest look at whether slow breathing lowers blood pressure, the realistic effect size, and how to practise safely alongside medical treatment.',
        url: 'https://breatheonline.app/breathing/high-blood-pressure',
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
              Breathing & Health
            </span>
            <h1 className="text-3xl sm:text-5xl font-light tracking-wide leading-tight" style={{ color: ts.textPrimary }}>
              Breathing &<br />
              <span style={{ color: ts.accent }}>High Blood Pressure</span>
            </h1>
            <p className="t-body leading-relaxed max-w-xl" style={{ color: ts.textMuted }}>
              Slow breathing does lower blood pressure — but by less than the internet usually claims,
              and only with consistent practice. Here's the honest version: what the evidence supports,
              how big the effect really is, and how to do it safely alongside your treatment.
            </p>
          </div>

          {/* Safety notice — high on the page, not buried */}
          <div className="p-5 rounded-2xl flex flex-col gap-2"
            style={{ backgroundColor: ts.cardBg, border: `1px solid ${ts.accent}66` }}>
            <p className="t-body font-medium" style={{ color: ts.textPrimary }}>⚠️ Read this first</p>
            <p className="t-caption leading-relaxed" style={{ color: ts.textMuted }}>
              Breathing exercises are a <strong>complement to</strong> — never a replacement for —
              medical treatment. Do not stop or change prescribed blood-pressure medication based on
              anything you read here. High blood pressure usually has no symptoms while it damages
              your heart, kidneys, brain and eyes, so "feeling fine" tells you nothing. Talk to your
              doctor before adding or changing anything.
            </p>
          </div>

          {divider}

          {/* Evidence */}
          <div className="flex flex-col gap-4">
            <h2 className="t-heading font-medium" style={{ color: ts.textPrimary }}>
              What the evidence actually shows
            </h2>
            <p className="t-body leading-relaxed" style={{ color: ts.textMuted }}>
              Breathing slowly at about <strong>six breaths per minute</strong> shifts the balance of
              your autonomic nervous system away from the "fight-or-flight" sympathetic side. That
              reduces the constriction of your blood vessels and quiets the reflexes that keep
              pressure high. Device-guided slow breathing has been studied as an add-on therapy for
              hypertension for over two decades.
            </p>
            <p className="t-body leading-relaxed" style={{ color: ts.textMuted }}>
              The honest summary: reviews generally find <strong>a few mmHg</strong> of reduction with
              regular practice. That is real and worth having — but it is <em>modest</em>. Losing
              excess weight, cutting salt, regular aerobic exercise, limiting alcohol, and (where
              prescribed) medication all move the number considerably more. Breathing earns its place
              as one habit in that stack, not as the centrepiece.
            </p>
          </div>

          {divider}

          {/* How to practise */}
          <div className="flex flex-col gap-4">
            <h2 className="t-heading font-medium" style={{ color: ts.textPrimary }}>
              How to practise it safely
            </h2>
            {[
              { n: '1', label: 'Sit comfortably — never strain or force the breath', secs: '—' },
              { n: '2', label: 'Inhale gently through your nose', secs: '5s' },
              { n: '3', label: 'Exhale slowly and completely — no breath holds', secs: '5s' },
              { n: '4', label: 'Continue for about 15 minutes, most days', secs: '15m' },
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
              <strong>Avoid</strong> forceful hyperventilation techniques and long breath holds
              (Wim Hof style) if you have hypertension or heart disease, unless your doctor has
              specifically cleared them. Gentle and slow is the whole point here.
            </p>
            <Link to="/breathing"
              state={{ coachPreset: COHERENT_PRESET, coachPresetName: 'Coherent Breathing' }}
              className="flex items-center gap-2 px-8 py-3.5 rounded-full text-white font-medium w-fit transition-all hover:scale-105"
              style={{ background: ts.btnGradient, boxShadow: ts.btnShadow }}>
              🌬 Try guided slow breathing — free
            </Link>
          </div>

          {divider}

          {/* Bigger levers — honest context */}
          <div className="flex flex-col gap-4">
            <h2 className="t-heading font-medium" style={{ color: ts.textPrimary }}>
              The bigger levers (be honest with yourself)
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { icon: '🧂', title: 'Less salt', desc: 'One of the most reliable non-drug reductions available, especially if your intake is high.' },
                { icon: '🏃', title: 'Regular aerobic exercise', desc: 'Most weeks, most days. Comfortably outperforms breathing practice on its own.' },
                { icon: '⚖️', title: 'Weight & alcohol', desc: 'Both move blood pressure meaningfully when they are part of the picture.' },
                { icon: '💊', title: 'Prescribed medication', desc: 'If your doctor prescribed it, it is doing more than any lifestyle change. Keep taking it.' },
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
            <p className="t-caption leading-relaxed" style={{ color: ts.textMuted }}>
              Where breathing genuinely helps: it lowers day-to-day stress load, improves sleep, and
              is easy to stick with — and those make the bigger levers easier to sustain.
            </p>
          </div>

          {/* Medical disclaimer */}
          <p className="t-caption leading-relaxed text-center max-w-xl mx-auto" style={{ color: ts.textMuted, opacity: 0.9 }}>
            This article is general education, not medical advice, and Breathe is a wellness app, not
            a medical device. Seek urgent care for a blood pressure reading above 180/120, or for
            chest pain, breathlessness, severe headache, vision changes or weakness.
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
                { label: 'The science of slow breathing', href: '/science/slow-breathing' },
                { label: 'Belly breathing', href: '/breathing/belly-breathing' },
                { label: 'Why sleep matters', href: '/sleep/why-sleep-is-important' },
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
