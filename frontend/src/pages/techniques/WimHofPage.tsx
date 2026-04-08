// src/pages/techniques/WimHofPage.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import NavBar from '../../components/NavBar';
import Footer from '../../components/Footer';
import ThemeBackground from '../../components/ThemeBackground';
import PageSEO from '../../components/PageSEO';
import { useThemeStyles } from '../../hooks/useThemeStyles';

export default function WimHofPage() {
  const ts = useThemeStyles();
  return (
    <div className="relative flex flex-col min-h-screen font-montserrat">
      <PageSEO
        title="Wim Hof Breathing Method — Boost Energy & Cold Tolerance"
        description="Practice the Wim Hof breathing method online. Rapid breathing cycles boost energy, strengthen immunity, and increase cold tolerance. Free guided sessions."
        canonical="/breathing/wim-hof"
      />
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
              Energy & Performance
            </span>
            <h1 className="text-3xl sm:text-5xl font-light leading-tight" style={{ color: ts.textPrimary }}>
              Wim Hof Method<br />
              <span style={{ color: ts.accent }}>Breathing Technique</span>
            </h1>
            <p className="t-body leading-relaxed max-w-xl" style={{ color: ts.textMuted }}>
              The breathing technique developed by Dutch extreme athlete Wim Hof. Scientifically validated to boost energy, reduce inflammation, and give you conscious influence over your immune system.
            </p>
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl w-fit"
              style={{
                backgroundColor: 'rgba(255,138,138,0.1)',
                border: `1px solid rgba(255,138,138,0.2)`,
              }}>
              <span className="t-caption">⚠️</span>
              <p className="t-caption" style={{ color: '#FF8A8A' }}>
                Never practice near water or while driving. Lightheadedness is normal.
              </p>
            </div>
            <Link to="/breathing"
              className="flex items-center gap-2 px-8 py-3.5 rounded-full text-white font-medium w-fit transition-all hover:shadow-[0_0_28px_rgba(58,130,247,0.45)] hover:scale-105"
              style={{ background: ts.btnGradient }}>
              🔥 Try Wim Hof now — free
            </Link>
          </div>

          {/* How It Works */}
          <div className="flex flex-col gap-3">
            <h2 className="t-heading font-medium" style={{ color: ts.textPrimary }}>
              How It Works
            </h2>
            {[
              { n: '1', label: '30 deep power breaths — inhale fully, let go', secs: '~2min', color: '#FF9A5C' },
              { n: '2', label: 'Exhale and hold on empty lungs', secs: '1–3min', color: '#FFD97D' },
              { n: '3', label: 'Inhale and hold for 15 seconds', secs: '15s', color: '#4AE8A0' },
              { n: '4', label: 'Repeat 3–4 rounds', secs: '×4', color: '#4A9EFF' },
            ].map(({ n, label, secs, color }) => (
              <div key={n} className="flex items-center gap-4 p-4 rounded-2xl"
                style={{
                  backgroundColor: ts.cardBg,
                  border: `1px solid ${ts.border}`,
                }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 font-bold text-white t-body"
                  style={{ background: color }}>
                  {n}
                </div>
                <p className="t-body flex-1" style={{ color: ts.textPrimary }}>
                  {label}
                </p>
                <span className="t-body font-light tabular-nums flex-shrink-0" style={{ color }}>
                  {secs}
                </span>
              </div>
            ))}
          </div>

          {/* Science */}
          <div className="flex flex-col gap-3">
            <h2 className="t-heading font-medium" style={{ color: ts.textPrimary }}>
              What the Science Says
            </h2>
            <p className="t-body leading-relaxed" style={{ color: ts.textMuted }}>
              A 2014 study in <em>PNAS</em> showed that Wim Hof practitioners could voluntarily influence their immune system — something previously thought impossible. Participants trained in the method produced significantly fewer inflammatory markers when injected with bacterial toxins.
            </p>
            <p className="t-body leading-relaxed" style={{ color: ts.textMuted }}>
              The technique works by temporarily altering blood pH through controlled hyperventilation, flooding the body with adrenaline and creating an alkaline state. This is why you feel an energy surge — you're triggering your body's natural stress response in a controlled way.
            </p>
          </div>

          {/* Best For */}
          <div className="flex flex-col gap-3">
            <h2 className="t-heading font-medium" style={{ color: ts.textPrimary }}>
              Best For
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { icon: '⚡', title: 'Morning energy boost', desc: 'Replaces coffee for many practitioners. The adrenaline spike lasts 2–3 hours.' },
                { icon: '🏋️', title: 'Pre-workout activation', desc: 'Increases pain tolerance and endurance. Many athletes use it before training.' },
                { icon: '🧠', title: 'Mental clarity', desc: 'The temporary CO2 reduction creates intense focus and present-moment awareness.' },
                { icon: '🛡️', title: 'Immune support', desc: 'Regular practice reduces baseline inflammation markers over 4–8 weeks.' },
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
            <span className="text-3xl">🔥</span>
            <p className="t-heading font-light" style={{ color: ts.textPrimary }}>
              Ready to try it?
            </p>
            <p className="t-body" style={{ color: ts.textMuted }}>
              Our animated orb guides your breathing rhythm. Find a comfortable seated position first.
            </p>
            <Link to="/breathing"
              className="px-10 py-4 rounded-full text-white font-medium transition-all hover:shadow-[0_0_28px_rgba(58,130,247,0.45)] hover:scale-105"
              style={{ background: ts.btnGradient }}>
              🔥 Start Wim Hof — Free
            </Link>
            <p className="t-caption" style={{ color: ts.textMuted }}>
              No account · Sit or lie down · Never near water
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
                { label: 'Breathing for Anxiety', href: '/breathing/anxiety' },
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