// src/pages/techniques/BreathingAnxietyPage.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import NavBar from '../../components/NavBar';
import Footer from '../../components/Footer';
import ThemeBackground from '../../components/ThemeBackground';
import { useThemeStyles } from '../../hooks/useThemeStyles';

export default function BreathingAnxietyPage() {
  const ts = useThemeStyles();
  return (
    <div className="relative flex flex-col min-h-screen font-montserrat">
      <ThemeBackground />

      <div className="relative z-10 flex flex-col min-h-screen">
        <NavBar />

        <main className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 py-12 flex flex-col gap-8">

          {/* Hero */}
          <div className="flex flex-col gap-3">
            <span className="t-label tracking-[0.3em] uppercase border px-4 py-1.5 rounded-full w-fit"
              style={{
                color: ts.textMuted,
                borderColor: ts.border,
              }}>
              Anxiety Relief
            </span>
            <h1 className="text-3xl sm:text-5xl font-light leading-tight" style={{ color: ts.textPrimary }}>
              Breathing Exercises<br />
              <span style={{ color: ts.accent }}>for Anxiety</span>
            </h1>
            <p className="t-body leading-relaxed max-w-xl" style={{ color: ts.textMuted }}>
              Anxiety activates your fight-or-flight response — but your breath is a direct line to your nervous system. These techniques interrupt the anxiety loop within 60–90 seconds, no medication needed.
            </p>
            <Link to="/breathing"
              className="flex items-center gap-2 px-8 py-3.5 rounded-full text-white font-medium w-fit transition-all hover:shadow-[0_0_28px_rgba(58,130,247,0.45)] hover:scale-105"
              style={{ background: ts.btnGradient }}>
              🌬 Start breathing now — free
            </Link>
          </div>

          {/* Why Breathing Stops Anxiety */}
          <div className="flex flex-col gap-3">
            <h2 className="t-heading font-medium" style={{ color: ts.textPrimary }}>
              Why Breathing Stops Anxiety
            </h2>
            <p className="t-body leading-relaxed" style={{ color: ts.textMuted }}>
              When you're anxious, your breathing becomes fast and shallow — this signals danger to your brain and amplifies the anxiety response. Slow, controlled breathing does the opposite: it activates the vagus nerve, which directly tells your brain to calm down.
            </p>
            <p className="t-body leading-relaxed" style={{ color: ts.textMuted }}>
              The key is making your exhale longer than your inhale. A 4-second inhale followed by a 6–8 second exhale shifts your nervous system from sympathetic (stress) to parasympathetic (calm) within 2–3 breaths.
            </p>
          </div>

          {/* 3 Best Techniques */}
          <div className="flex flex-col gap-3">
            <h2 className="t-heading font-medium" style={{ color: ts.textPrimary }}>
              3 Best Techniques for Anxiety
            </h2>
            {[
              { name: 'Belly Breathing', pattern: '4-0-6-2', desc: 'The simplest. Breathe into your belly, not your chest. Longer exhale activates the parasympathetic response immediately. Best for beginners and panic attacks.', href: '/breathing', color: '#4AE8A0' },
              { name: 'Box Breathing 4-4-4-4', pattern: '4-4-4-4', desc: 'Equal phases create a rhythmic anchor for your mind. The holds give anxious thoughts nowhere to go. Used by the US military for combat stress.', href: '/breathing/box-breathing', color: '#3A82F7' },
              { name: '4-7-8 Breathing', pattern: '4-7-8-1', desc: 'The long hold and slow exhale produce the strongest calming effect. Best for acute anxiety — before a presentation, during a panic spiral, or at night.', href: '/breathing/4-7-8', color: '#7AC4FF' },
            ].map(t => (
              <div key={t.name} className="p-5 rounded-2xl flex flex-col gap-3"
                style={{
                  backgroundColor: ts.cardBg,
                  border: `1px solid ${ts.border}`,
                }}>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="t-body font-medium" style={{ color: ts.textPrimary }}>
                      {t.name}
                    </p>
                    <p className="t-label tabular-nums mt-0.5" style={{ color: t.color }}>
                      {t.pattern}
                    </p>
                  </div>
                  <Link to={t.href} className="t-caption px-3 py-1.5 rounded-xl text-white flex-shrink-0 transition-all hover:scale-105"
                    style={{ background: `linear-gradient(135deg,${t.color}66,${t.color})` }}>
                    Try →
                  </Link>
                </div>
                <p className="t-caption leading-relaxed" style={{ color: ts.textMuted }}>
                  {t.desc}
                </p>
              </div>
            ))}
          </div>

          {/* When to Use */}
          <div className="flex flex-col gap-3">
            <h2 className="t-heading font-medium" style={{ color: ts.textPrimary }}>
              When to Use Breathing for Anxiety
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { icon: '⚡', title: 'Panic attack', desc: 'Belly breathing immediately — focus on extending each exhale.' },
                { icon: '🎤', title: 'Before public speaking', desc: '5 cycles of box breathing backstage lowers heart rate within 60 seconds.' },
                { icon: '✈️', title: 'Flight anxiety', desc: '4-7-8 works with eyes closed. Can be done in your seat without anyone noticing.' },
                { icon: '💼', title: 'Work stress spiral', desc: '2 minutes of coherent breathing (5.5 BPM) resets your nervous system at your desk.' },
                { icon: '🌙', title: 'Anxiety at 3am', desc: '4-7-8 in bed. Three cycles and most people are asleep before finishing the fourth.' },
                { icon: '🔄', title: 'Daily prevention', desc: '5 minutes every morning reduces baseline anxiety over 2–4 weeks.' },
              ].map(({ icon, title, desc }) => (
                <div key={title} className="flex gap-3 p-4 rounded-2xl"
                  style={{
                    backgroundColor: ts.cardBg,
                    border: `1px solid ${ts.border}`,
                  }}>
                  <span className="t-heading flex-shrink-0">{icon}</span>
                  <div>
                    <p className="t-caption font-medium mb-1" style={{ color: ts.textPrimary }}>
                      {title}
                    </p>
                    <p className="t-caption leading-relaxed" style={{ color: ts.textMuted }}>
                      {desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="flex flex-col items-center gap-4 py-8 rounded-3xl px-6 text-center"
            style={{
              backgroundColor: ts.cardBg,
              border: `1px solid ${ts.border}`,
            }}>
            <p className="t-heading font-light" style={{ color: ts.textPrimary }}>
              Try it right now
            </p>
            <p className="t-body max-w-sm" style={{ color: ts.textMuted }}>
              Our AI coach will ask how you're feeling and recommend the right technique for your anxiety level.
            </p>
            <Link to="/breathing"
              className="px-10 py-4 rounded-full text-white font-medium transition-all hover:shadow-[0_0_28px_rgba(58,130,247,0.45)] hover:scale-105"
              style={{ background: ts.btnGradient }}>
              🌬 Start breathing — free
            </Link>
            <p className="t-caption" style={{ color: ts.textMuted }}>
              No account · No download · Works in 30 seconds
            </p>
          </div>

          {/* Related */}
          <div className="flex flex-col gap-3">
            <p className="t-label tracking-[0.25em] uppercase" style={{ color: ts.textMuted }}>
              Related techniques
            </p>
            <div className="flex flex-wrap gap-2">
              {[
                { label: 'Box Breathing', href: '/breathing/box-breathing' },
                { label: '4-7-8 for Sleep', href: '/breathing/4-7-8' },
                { label: 'Wim Hof Method', href: '/breathing/wim-hof' },
              ].map(({ label, href }) => (
                <Link key={href} to={href}
                  className="px-4 py-2 rounded-xl t-caption transition-all"
                  style={{
                    color: ts.accent,
                    border: `1px solid ${ts.border}`,
                  }}>
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