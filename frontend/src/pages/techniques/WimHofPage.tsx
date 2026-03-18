// src/pages/techniques/WimHofPage.tsx
import React from 'react';
import { useThemeStyles } from '../../hooks/useThemeStyles';
import { Link } from 'react-router-dom';
import NavBar from '../../components/NavBar';
import Footer from '../../components/Footer';
import ThemeBackground from '../../components/ThemeBackground';

export default function WimHofPage() {
  const ts = useThemeStyles();
  return (
    <div className="relative flex flex-col min-h-screen  font-montserrat">
      <ThemeBackground />
      <div className="relative z-10 flex flex-col min-h-screen">
        <NavBar />
        <main className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 py-12 flex flex-col gap-8">

          <div className="flex flex-col gap-3">
            <span className="text-[10px] tracking-[0.3em] uppercase text-[#4A7AAA] border border-[#1E3358]/40 px-4 py-1.5 rounded-full w-fit">Energy & Performance</span>
            <h1 className="text-3xl sm:text-5xl font-light text-[#B8D9FF] leading-tight">
              Wim Hof Method<br /><span className="text-[#4A9EFF]">Breathing Technique</span>
            </h1>
            <p className="text-[#4A7AAA] text-base leading-relaxed max-w-xl">
              The breathing technique developed by Dutch extreme athlete Wim Hof. Scientifically validated to boost energy, reduce inflammation, and give you conscious influence over your immune system.
            </p>
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl w-fit" style={{ background: 'rgba(255,138,138,0.1)', border: '1px solid rgba(255,138,138,0.2)' }}>
              <span className="text-xs">⚠️</span>
              <p className="text-[#FF8A8A] text-xs">Never practice near water or while driving. Lightheadedness is normal.</p>
            </div>
            <Link to="/breathing" className="flex items-center gap-2 px-8 py-3.5 rounded-full text-white font-medium w-fit transition-all hover:shadow-[0_0_28px_rgba(58,130,247,0.45)] hover:scale-105"
              style={{ background: ts.btnGradient }}>
              🔥 Try Wim Hof now — free
            </Link>
          </div>

          <div className="flex flex-col gap-3">
            <h2 className="text-lg font-medium text-[#B8D9FF]">How It Works</h2>
            {[
              { n: '1', label: '30 deep power breaths — inhale fully, let go', secs: '~2min', color: '#FF9A5C' },
              { n: '2', label: 'Exhale and hold on empty lungs', secs: '1–3min', color: '#FFD97D' },
              { n: '3', label: 'Inhale and hold for 15 seconds', secs: '15s', color: '#4AE8A0' },
              { n: '4', label: 'Repeat 3–4 rounds', secs: '×4', color: '#4A9EFF' },
            ].map(({ n, label, secs, color }) => (
              <div key={n} className="flex items-center gap-4 p-4 rounded-2xl bg-[#0B1628]/60 border border-[#1E3358]/40">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 font-bold text-white text-sm"
                  style={{ background: `linear-gradient(135deg, ${color}88, ${color})` }}>{n}</div>
                <p className="text-[#B8D9FF] text-sm flex-1">{label}</p>
                <span className="text-sm font-light tabular-nums flex-shrink-0" style={{ color }}>{secs}</span>
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-3">
            <h2 className="text-lg font-medium text-[#B8D9FF]">What the Science Says</h2>
            <p className="text-[#4A7AAA] text-sm leading-relaxed">
              A 2014 study in <em>PNAS</em> showed that Wim Hof practitioners could voluntarily influence their immune system — something previously thought impossible. Participants trained in the method produced significantly fewer inflammatory markers when injected with bacterial toxins.
            </p>
            <p className="text-[#4A7AAA] text-sm leading-relaxed">
              The technique works by temporarily altering blood pH through controlled hyperventilation, flooding the body with adrenaline and creating an alkaline state. This is why you feel an energy surge — you're triggering your body's natural stress response in a controlled way.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <h2 className="text-lg font-medium text-[#B8D9FF]">Best For</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { icon: '⚡', title: 'Morning energy boost', desc: 'Replaces coffee for many practitioners. The adrenaline spike lasts 2–3 hours.' },
                { icon: '🏋️', title: 'Pre-workout activation', desc: 'Increases pain tolerance and endurance. Many athletes use it before training.' },
                { icon: '🧠', title: 'Mental clarity', desc: 'The temporary CO2 reduction creates intense focus and present-moment awareness.' },
                { icon: '🛡️', title: 'Immune support', desc: 'Regular practice reduces baseline inflammation markers over 4–8 weeks.' },
              ].map(({ icon, title, desc }) => (
                <div key={title} className="flex gap-3 p-4 rounded-2xl bg-[#0B1628]/60 border border-[#1E3358]/40">
                  <span className="text-xl flex-shrink-0">{icon}</span>
                  <div>
                    <p className="text-[#B8D9FF] text-xs font-medium mb-1">{title}</p>
                    <p className="text-[#4A7AAA] text-xs leading-relaxed">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col items-center gap-4 py-8 rounded-3xl border border-[#1E3358]/40 bg-[#0B1628]/60 text-center px-6">
            <span className="text-3xl">🔥</span>
            <p className="text-[#B8D9FF] text-xl font-light">Ready to try it?</p>
            <p className="text-[#4A7AAA] text-sm">Our animated orb guides your breathing rhythm. Find a comfortable seated position first.</p>
            <Link to="/breathing" className="px-10 py-4 rounded-full text-white font-medium transition-all hover:shadow-[0_0_28px_rgba(58,130,247,0.45)] hover:scale-105"
              style={{ background: ts.btnGradient }}>
              🔥 Start Wim Hof — Free
            </Link>
            <p className="text-[#4A7AAA] text-xs">No account · Sit or lie down · Never near water</p>
          </div>

          <div className="flex flex-col gap-3">
            <p className="text-[10px] tracking-[0.25em] uppercase text-[#4A7AAA]">Related techniques</p>
            <div className="flex flex-wrap gap-2">
              {[
                { label: 'Box Breathing', href: '/breathing/box-breathing' },
                { label: '4-7-8 for Sleep', href: '/breathing/4-7-8' },
                { label: 'Breathing for Anxiety', href: '/breathing/anxiety' },
              ].map(({ label, href }) => (
                <Link key={href} to={href} className="px-4 py-2 rounded-xl text-xs text-[#4A9EFF] border border-[#1E3358]/50 hover:border-[#2A5499]/60 transition-all">
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