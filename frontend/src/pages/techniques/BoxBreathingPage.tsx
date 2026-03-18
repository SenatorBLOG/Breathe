// src/pages/techniques/BoxBreathingPage.tsx
import React from 'react';
import { useThemeStyles } from '../../hooks/useThemeStyles';
import { Link } from 'react-router-dom';
import NavBar from '../../components/NavBar';
import Footer from '../../components/Footer';
import ThemeBackground from '../../components/ThemeBackground';

function TechCard({ icon, title, desc }: { icon: string; title: string; desc: string }) {
  return (
    <div className="flex gap-3 p-4 rounded-2xl bg-[#0B1628]/70 border border-[#1E3358]/50">
      <span className="text-xl flex-shrink-0">{icon}</span>
      <div>
        <p className="text-[#B8D9FF] text-sm font-medium mb-1">{title}</p>
        <p className="text-[#4A7AAA] text-xs leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}

function Step({ n, label, secs, color }: { n: string; label: string; secs: string; color: string }) {
  return (
    <div className="flex items-center gap-4 p-4 rounded-2xl bg-[#0B1628]/60 border border-[#1E3358]/40">
      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 font-bold text-white text-sm"
        style={{ background: `linear-gradient(135deg, ${color}88, ${color})` }}>{n}</div>
      <div className="flex-1">
        <p className="text-[#B8D9FF] text-sm font-medium">{label}</p>
      </div>
      <span className="text-2xl font-light tabular-nums flex-shrink-0" style={{ color }}>{secs}</span>
    </div>
  );
}

export default function BoxBreathingPage() {
  const ts = useThemeStyles();
  return (
    <div className="relative flex flex-col min-h-screen  font-montserrat">
      <ThemeBackground />
      <div className="relative z-10 flex flex-col min-h-screen">
        <NavBar />
        <main className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 py-12 flex flex-col gap-8">

          {/* Hero */}
          <div className="flex flex-col gap-3">
            <span className="text-[10px] tracking-[0.3em] uppercase text-[#4A7AAA] border border-[#1E3358]/40 px-4 py-1.5 rounded-full w-fit">
              Breathing Technique
            </span>
            <h1 className="text-3xl sm:text-5xl font-light text-[#B8D9FF] tracking-wide leading-tight">
              Box Breathing<br />
              <span className="text-[#4A9EFF]">4-4-4-4 Technique</span>
            </h1>
            <p className="text-[#4A7AAA] text-base leading-relaxed max-w-xl">
              The same breathing method used by Navy SEALs and elite athletes to stay calm under extreme pressure. Four equal phases, four seconds each — simple, powerful, proven.
            </p>
            <Link to="/breathing"
              className="flex items-center gap-2 px-8 py-3.5 rounded-full text-white font-medium w-fit transition-all hover:shadow-[0_0_28px_rgba(58,130,247,0.45)] hover:scale-105"
              style={{ background: ts.btnGradient }}>
              🌬 Try Box Breathing now
            </Link>
          </div>

          {/* Pattern visual */}
          <div className="flex flex-col gap-3">
            <h2 className="text-lg font-medium text-[#B8D9FF]">The Pattern</h2>
            <Step n="1" label="Inhale through your nose" secs="4s" color="#3A82F7" />
            <Step n="2" label="Hold — lungs full" secs="4s" color="#7AC4FF" />
            <Step n="3" label="Exhale through your mouth" secs="4s" color="#1A5FCC" />
            <Step n="4" label="Hold — lungs empty" secs="4s" color="#4A9EFF" />
            <p className="text-[#4A7AAA] text-xs px-1">Repeat 4–6 cycles. One full cycle takes 16 seconds.</p>
          </div>

          {/* Science */}
          <div className="flex flex-col gap-3">
            <h2 className="text-lg font-medium text-[#B8D9FF]">Why It Works</h2>
            <p className="text-[#4A7AAA] text-sm leading-relaxed">
              Box breathing works by directly influencing your autonomic nervous system. The controlled holds activate your parasympathetic response — the "rest and digest" system — which counteracts the fight-or-flight response triggered by stress.
            </p>
            <p className="text-[#4A7AAA] text-sm leading-relaxed">
              Research published in <em>Frontiers in Human Neuroscience</em> shows that slow, rhythmic breathing at 4–6 cycles per minute significantly increases heart rate variability (HRV) — a key marker of stress resilience and emotional regulation.
            </p>
          </div>

          {/* Use cases */}
          <div className="flex flex-col gap-3">
            <h2 className="text-lg font-medium text-[#B8D9FF]">Best For</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <TechCard icon="🎯" title="Focus & concentration" desc="Use before deep work sessions, exams, or any task requiring sustained attention." />
              <TechCard icon="😰" title="Stress & anxiety" desc="Interrupts the cortisol loop within 90 seconds. Works faster than most anti-anxiety techniques." />
              <TechCard icon="⚡" title="Pre-performance" desc="Athletes, speakers, and executives use it backstage or in the locker room to enter flow state." />
              <TechCard icon="😴" title="Better sleep prep" desc="10 minutes before bed resets your nervous system and lowers heart rate for faster sleep onset." />
            </div>
          </div>

          {/* FAQ */}
          <div className="flex flex-col gap-4">
            <h2 className="text-lg font-medium text-[#B8D9FF]">Common Questions</h2>
            {[
              { q: 'How many cycles should I do?', a: 'Start with 4 cycles (about 1 minute). As you get comfortable, work up to 8–10 cycles. Most people feel a shift within 2–3 cycles.' },
              { q: 'Can I do box breathing during a panic attack?', a: 'Yes, but start with longer exhales if the holds feel too intense. The goal is calm, not control — adapt the timing to what your body allows.' },
              { q: 'How often should I practice?', a: 'Daily practice compounds. Even 5 minutes in the morning lowers your baseline anxiety over 2–4 weeks.' },
              { q: 'Is it safe for everyone?', a: 'Box breathing is safe for most people. If you have respiratory conditions like asthma, consult your doctor. Never practice while driving.' },
            ].map(({ q, a }) => (
              <div key={q} className="p-4 rounded-2xl bg-[#0B1628]/60 border border-[#1E3358]/40">
                <p className="text-[#B8D9FF] text-sm font-medium mb-2">{q}</p>
                <p className="text-[#4A7AAA] text-xs leading-relaxed">{a}</p>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="flex flex-col items-center gap-4 py-8 rounded-3xl border border-[#1E3358]/40 bg-[#0B1628]/60 text-center px-6">
            <p className="text-[#B8D9FF] text-xl font-light">Ready to try it?</p>
            <p className="text-[#4A7AAA] text-sm">Our animated orb guides you through each phase. No counting, no distractions.</p>
            <Link to="/breathing"
              className="px-10 py-4 rounded-full text-white font-medium transition-all hover:shadow-[0_0_28px_rgba(58,130,247,0.45)] hover:scale-105"
              style={{ background: ts.btnGradient }}>
              🌬 Start Box Breathing — Free
            </Link>
            <p className="text-[#4A7AAA] text-xs">No account needed · Works in any browser</p>
          </div>

          {/* Related */}
          <div className="flex flex-col gap-3">
            <p className="text-[10px] tracking-[0.25em] uppercase text-[#4A7AAA]">Other techniques</p>
            <div className="flex flex-wrap gap-2">
              {[
                { label: '4-7-8 for Sleep', href: '/breathing/4-7-8' },
                { label: 'Wim Hof Method', href: '/breathing/wim-hof' },
                { label: 'Breathing for Anxiety', href: '/breathing/anxiety' },
              ].map(({ label, href }) => (
                <Link key={href} to={href}
                  className="px-4 py-2 rounded-xl text-xs text-[#4A9EFF] border border-[#1E3358]/50 hover:border-[#2A5499]/60 transition-all">
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