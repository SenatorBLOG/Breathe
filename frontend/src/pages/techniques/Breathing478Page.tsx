// src/pages/techniques/Breathing478Page.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import NavBar from '../../components/NavBar';
import Footer from '../../components/Footer';

export default function Breathing478Page() {
  return (
    <div className="relative flex flex-col min-h-screen bg-[#010814] font-montserrat">
      <div className="fixed inset-0 bg-cover bg-center" style={{ backgroundImage: `url('/Background_img_Meditation.jpg')`, opacity: 0.35 }} />
      <div className="fixed inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at top, rgba(1,8,20,0.2) 0%, rgba(1,8,20,0.94) 68%)' }} />
      <div className="relative z-10 flex flex-col min-h-screen">
        <NavBar />
        <main className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 py-12 flex flex-col gap-8">

          <div className="flex flex-col gap-3">
            <span className="text-[10px] tracking-[0.3em] uppercase text-[#4A7AAA] border border-[#1E3358]/40 px-4 py-1.5 rounded-full w-fit">Sleep & Anxiety</span>
            <h1 className="text-3xl sm:text-5xl font-light text-[#B8D9FF] leading-tight">
              4-7-8 Breathing<br /><span className="text-[#4A9EFF]">for Sleep & Calm</span>
            </h1>
            <p className="text-[#4A7AAA] text-base leading-relaxed max-w-xl">
              Developed by Dr. Andrew Weil, the 4-7-8 technique is one of the most effective natural sleep aids ever documented. Most people fall asleep within 2–3 cycles when practiced in bed.
            </p>
            <Link to="/breathing" className="flex items-center gap-2 px-8 py-3.5 rounded-full text-white font-medium w-fit transition-all hover:shadow-[0_0_28px_rgba(58,130,247,0.45)] hover:scale-105"
              style={{ background: 'linear-gradient(135deg,#1A5FCC,#3A82F7)' }}>
              🌙 Try 4-7-8 now — free
            </Link>
          </div>

          <div className="flex flex-col gap-3">
            <h2 className="text-lg font-medium text-[#B8D9FF]">The Pattern</h2>
            {[
              { n: '1', label: 'Inhale quietly through your nose', secs: '4s', color: '#3A82F7' },
              { n: '2', label: 'Hold your breath', secs: '7s', color: '#7AC4FF' },
              { n: '3', label: 'Exhale completely through your mouth', secs: '8s', color: '#1A5FCC' },
            ].map(({ n, label, secs, color }) => (
              <div key={n} className="flex items-center gap-4 p-4 rounded-2xl bg-[#0B1628]/60 border border-[#1E3358]/40">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 font-bold text-white text-sm"
                  style={{ background: `linear-gradient(135deg, ${color}88, ${color})` }}>{n}</div>
                <p className="text-[#B8D9FF] text-sm flex-1">{label}</p>
                <span className="text-2xl font-light tabular-nums flex-shrink-0" style={{ color }}>{secs}</span>
              </div>
            ))}
            <p className="text-[#4A7AAA] text-xs px-1">Do 3–4 cycles. The ratio matters more than the exact timing — as long as exhale is 2× inhale.</p>
          </div>

          <div className="flex flex-col gap-3">
            <h2 className="text-lg font-medium text-[#B8D9FF]">The Science Behind 4-7-8</h2>
            <p className="text-[#4A7AAA] text-sm leading-relaxed">
              The extended hold (7 seconds) allows more oxygen to enter your bloodstream than a normal breath. The long exhale (8 seconds) forces your heart rate to slow, directly activating the parasympathetic nervous system.
            </p>
            <p className="text-[#4A7AAA] text-sm leading-relaxed">
              This combination mimics the body's natural relaxation response and can reduce cortisol levels measurably within 5 minutes of practice. It's essentially a manual override of your stress response.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <h2 className="text-lg font-medium text-[#B8D9FF]">Best For</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { icon: '🌙', title: 'Falling asleep faster', desc: 'Practice lying in bed with eyes closed. Most people are asleep before 4 complete cycles.' },
                { icon: '😰', title: 'Acute anxiety', desc: 'The forced slow exhale interrupts the anxiety feedback loop faster than most techniques.' },
                { icon: '💭', title: 'Racing thoughts at night', desc: 'The counting occupies your analytical mind, leaving no bandwidth for worry.' },
                { icon: '🔄', title: 'Mid-day reset', desc: '3 cycles after lunch resets your afternoon cortisol and improves focus.' },
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
            <span className="text-3xl">🌙</span>
            <p className="text-[#B8D9FF] text-xl font-light">Ready to sleep better tonight?</p>
            <p className="text-[#4A7AAA] text-sm">Follow the animated orb — it handles the counting so you can fully relax.</p>
            <Link to="/breathing" className="px-10 py-4 rounded-full text-white font-medium transition-all hover:shadow-[0_0_28px_rgba(58,130,247,0.45)] hover:scale-105"
              style={{ background: 'linear-gradient(135deg,#1A5FCC,#3A82F7)' }}>
              🌬 Try 4-7-8 — Free
            </Link>
            <p className="text-[#4A7AAA] text-xs">No account · Works on phone · 60 seconds to start</p>
          </div>

          <div className="flex flex-col gap-3">
            <p className="text-[10px] tracking-[0.25em] uppercase text-[#4A7AAA]">Related techniques</p>
            <div className="flex flex-wrap gap-2">
              {[
                { label: 'Box Breathing', href: '/breathing/box-breathing' },
                { label: 'Breathing for Anxiety', href: '/breathing/anxiety' },
                { label: 'Wim Hof Method', href: '/breathing/wim-hof' },
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