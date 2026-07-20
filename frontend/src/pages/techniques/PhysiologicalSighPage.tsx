// src/pages/techniques/PhysiologicalSighPage.tsx
import { Link } from 'react-router-dom';
import NavBar from '../../components/NavBar';
import Footer from '../../components/Footer';
import ThemeBackground from '../../components/ThemeBackground';
import PageSEO from '../../components/PageSEO';
import { useThemeStyles } from '../../hooks/useThemeStyles';

// The sigh is a double-inhale + long exhale — no clean 4-phase preset, so the
// CTA lands with a long-exhale belly pattern, the closest guided rhythm.
const LONG_EXHALE_PRESET = { inhale: 4, hold: 0, exhale: 8, pause: 1 };

const FAQS = [
  {
    q: 'What is the physiological sigh?',
    a: 'The physiological sigh is a breathing pattern of two inhales through the nose — a full breath followed by a second short sip to top up — then a long, slow exhale through the mouth. Your body does it naturally when you cry or before sleep. Done deliberately, it is the fastest known way to calm down in real time.',
  },
  {
    q: 'Why does a double inhale calm you down so fast?',
    a: 'The tiny sacs in your lungs (alveoli) collapse under stress, trapping carbon dioxide. The second short inhale re-inflates them, and the long exhale offloads the built-up CO₂. That rapid CO₂ drop slows the heart and signals safety to the brain — often within one or two breaths.',
  },
  {
    q: 'How many should I do?',
    a: 'Even one physiological sigh lowers arousal noticeably. For a bigger reset, do 1–3 in a row. Research on "cyclic sighing" found that five minutes a day improved mood and lowered anxiety more than equal-length meditation.',
  },
  {
    q: 'When should I use it?',
    a: 'Any moment stress spikes — before a hard conversation, mid-panic, after bad news, or when you can\'t fall asleep. It is discreet, needs no setup, and works in seconds.',
  },
];

export default function PhysiologicalSighPage() {
  const ts = useThemeStyles();
  const divider = <div style={{ height: 1, backgroundColor: ts.border + '40' }} />;

  return (
    <div className="relative flex flex-col min-h-screen font-montserrat">
      <PageSEO
        title="The Physiological Sigh — The Fastest Way to Calm Down"
        description="The physiological sigh: a double inhale through the nose and a long exhale through the mouth. The science-backed fastest way to lower stress in real time. Try it free."
        canonical="/breathing/physiological-sigh"
      />
      <ThemeBackground />

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: 'The Physiological Sigh — The Fastest Way to Calm Down',
        description: 'How the physiological sigh (double inhale, long exhale) resets your nervous system in real time, and how to do it.',
        url: 'https://breatheonline.app/breathing/physiological-sigh',
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
              The Physiological Sigh<br />
              <span style={{ color: ts.accent }}>calm in one breath</span>
            </h1>
            <p className="t-body leading-relaxed max-w-xl" style={{ color: ts.textMuted }}>
              Two inhales through the nose, one long exhale through the mouth. It's the pattern your
              body reaches for when you cry — and, done on purpose, it's the single fastest way
              scientists have found to switch off stress in real time.
            </p>
            <Link to="/breathing"
              state={{ coachPreset: LONG_EXHALE_PRESET, coachPresetName: 'Long-Exhale Calm' }}
              className="flex items-center gap-2 px-8 py-3.5 rounded-full text-white font-medium w-fit transition-all hover:scale-105"
              style={{ background: ts.btnGradient, boxShadow: ts.btnShadow }}>
              🌬 Practise a calming breath — free
            </Link>
          </div>

          {divider}

          {/* Why it works */}
          <div className="flex flex-col gap-4">
            <h2 className="t-heading font-medium" style={{ color: ts.textPrimary }}>
              Why one breath can flip the switch
            </h2>
            <p className="t-body leading-relaxed" style={{ color: ts.textMuted }}>
              Your lungs are filled with millions of tiny balloons called <strong>alveoli</strong>,
              where oxygen and carbon dioxide are exchanged. Under stress, many of them collapse and
              go flat, trapping CO₂ and starving your blood of oxygen — which the brain reads as more
              danger, feeding the stress loop.
            </p>
            <p className="t-body leading-relaxed" style={{ color: ts.textMuted }}>
              The <strong>double inhale</strong> fixes this mechanically: the first breath fills what
              it can, and the second short sip pops the collapsed alveoli back open. Then the
              <strong> long exhale</strong> dumps the trapped CO₂ all at once. That sudden drop in CO₂
              slows your heart rate through the vagus nerve — the calming happens on the exhale, and it
              can land within a single breath.
            </p>
          </div>

          {divider}

          {/* How to */}
          <div className="flex flex-col gap-4">
            <h2 className="t-heading font-medium" style={{ color: ts.textPrimary }}>
              How to do a physiological sigh
            </h2>
            {[
              { n: '1', label: 'Inhale fully through your nose', secs: 'in' },
              { n: '2', label: 'Sip a second short inhale on top — top it up', secs: '+in' },
              { n: '3', label: 'Let it all out slowly through your mouth', secs: 'out' },
              { n: '4', label: 'Repeat 1–3 times, or once whenever you need it', secs: '↻' },
            ].map(s => (
              <div key={s.n} className="flex items-center gap-4 p-4 rounded-2xl"
                style={{ backgroundColor: ts.cardBg, border: `1px solid ${ts.border}` }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 font-bold text-white t-body"
                  style={{ background: ts.btnGradient }}>{s.n}</div>
                <p className="flex-1 t-body font-medium" style={{ color: ts.textPrimary }}>{s.label}</p>
                <span className="t-body font-light tabular-nums flex-shrink-0" style={{ color: ts.accent }}>{s.secs}</span>
              </div>
            ))}
            <p className="t-caption leading-relaxed" style={{ color: ts.textMuted }}>
              The key is that the exhale is longer than the combined inhales, and that the second
              inhale is short and sharp. That's the whole technique.
            </p>
          </div>

          {divider}

          {/* When to use */}
          <div className="flex flex-col gap-4">
            <h2 className="t-heading font-medium" style={{ color: ts.textPrimary }}>
              When to reach for it
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { icon: '⚡', title: 'A stress spike', desc: 'Bad email, sharp words, sudden bad news — one sigh takes the edge off immediately.' },
                { icon: '🎤', title: 'Before pressure', desc: 'A discreet sigh backstage or before you speak steadies your voice and hands.' },
                { icon: '🌙', title: "Can't sleep", desc: 'A few slow sighs in bed pull you out of a racing mind and toward rest.' },
                { icon: '🔁', title: 'Daily "cyclic sighing"', desc: '5 minutes of repeated sighs a day beat equal-length meditation for mood in one Stanford study.' },
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
              Feel it work right now
            </p>
            <p className="t-body max-w-sm" style={{ color: ts.textMuted }}>
              Do one sigh at your screen — double inhale, long exhale — then let the guided orb take
              over with a soothing long-exhale rhythm.
            </p>
            <Link to="/breathing"
              state={{ coachPreset: LONG_EXHALE_PRESET, coachPresetName: 'Long-Exhale Calm' }}
              className="px-10 py-4 rounded-full text-white font-medium transition-all hover:scale-105"
              style={{ background: ts.btnGradient, boxShadow: ts.btnShadow }}>
              🌬 Start breathing — free
            </Link>
            <p className="t-caption" style={{ color: ts.textMuted }}>No account · No download · Works in 30 seconds</p>
          </div>

          {/* Medical disclaimer */}
          <p className="t-caption leading-relaxed text-center max-w-xl mx-auto" style={{ color: ts.textMuted, opacity: 0.8 }}>
            This article is general education, not medical advice. If anxiety or panic is frequent or
            severe, please talk to a doctor or mental-health professional — breathing helps, but it
            doesn't replace care.
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
                { label: 'Breathing for anxiety', href: '/breathing/anxiety' },
                { label: 'Fight-or-flight explained', href: '/science/fight-or-flight' },
                { label: '4-7-8 for sleep', href: '/breathing/4-7-8' },
                { label: 'Coherent breathing', href: '/breathing/coherent' },
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
