// src/pages/techniques/BreathingAnxietyPage.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import NavBar from '../../components/NavBar';
import Footer from '../../components/Footer';

export default function BreathingAnxietyPage() {
  return (
    <div className="relative flex flex-col min-h-screen bg-[#010814] font-montserrat">
      <div className="fixed inset-0 bg-cover bg-center" style={{ backgroundImage: `url('/Background_img_Meditation.jpg')`, opacity: 0.35 }} />
      <div className="fixed inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at top, rgba(1,8,20,0.2) 0%, rgba(1,8,20,0.94) 68%)' }} />
      <div className="relative z-10 flex flex-col min-h-screen">
        <NavBar />
        <main className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 py-12 flex flex-col gap-8">

          <div className="flex flex-col gap-3">
            <span className="text-[10px] tracking-[0.3em] uppercase text-[#4A7AAA] border border-[#1E3358]/40 px-4 py-1.5 rounded-full w-fit">Anxiety Relief</span>
            <h1 className="text-3xl sm:text-5xl font-light text-[#B8D9FF] leading-tight">
              Breathing Exercises<br /><span className="text-[#4A9EFF]">for Anxiety</span>
            </h1>
            <p className="text-[#4A7AAA] text-base leading-relaxed max-w-xl">
              Anxiety activates your fight-or-flight response — but your breath is a direct line to your nervous system. These techniques interrupt the anxiety loop within 60–90 seconds, no medication needed.
            </p>
            <Link to="/breathing"
              className="flex items-center gap-2 px-8 py-3.5 rounded-full text-white font-medium w-fit transition-all hover:shadow-[0_0_28px_rgba(58,130,247,0.45)] hover:scale-105"
              style={{ background: 'linear-gradient(135deg,#1A5FCC,#3A82F7)' }}>
              🌬 Start breathing now — free
            </Link>
          </div>

          <div className="flex flex-col gap-3">
            <h2 className="text-lg font-medium text-[#B8D9FF]">Why Breathing Stops Anxiety</h2>
            <p className="text-[#4A7AAA] text-sm leading-relaxed">
              When you're anxious, your breathing becomes fast and shallow — this signals danger to your brain and amplifies the anxiety response. Slow, controlled breathing does the opposite: it activates the vagus nerve, which directly tells your brain to calm down.
            </p>
            <p className="text-[#4A7AAA] text-sm leading-relaxed">
              The key is making your exhale longer than your inhale. A 4-second inhale followed by a 6–8 second exhale shifts your nervous system from sympathetic (stress) to parasympathetic (calm) within 2–3 breaths.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <h2 className="text-lg font-medium text-[#B8D9FF]">3 Best Techniques for Anxiety</h2>
            {[
              { name: 'Belly Breathing', pattern: '4-0-6-2', desc: 'The simplest. Breathe into your belly, not your chest. Longer exhale activates the parasympathetic response immediately. Best for beginners and panic attacks.', href: '/breathing', color: '#4AE8A0' },
              { name: 'Box Breathing 4-4-4-4', pattern: '4-4-4-4', desc: 'Equal phases create a rhythmic anchor for your mind. The holds give anxious thoughts nowhere to go. Used by the US military for combat stress.', href: '/breathing/box-breathing', color: '#3A82F7' },
              { name: '4-7-8 Breathing', pattern: '4-7-8-1', desc: 'The long hold and slow exhale produce the strongest calming effect. Best for acute anxiety — before a presentation, during a panic spiral, or at night.', href: '/breathing/4-7-8', color: '#7AC4FF' },
            ].map(t => (
              <div key={t.name} className="p-5 rounded-2xl bg-[#0B1628]/70 border border-[#1E3358]/50 flex flex-col gap-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-[#B8D9FF] text-sm font-medium">{t.name}</p>
                    <p className="text-[10px] tabular-nums mt-0.5" style={{ color: t.color }}>{t.pattern}</p>
                  </div>
                  <Link to={t.href} className="text-xs px-3 py-1.5 rounded-xl text-white flex-shrink-0"
                    style={{ background: `linear-gradient(135deg,${t.color}66,${t.color})` }}>
                    Try →
                  </Link>
                </div>
                <p className="text-[#4A7AAA] text-xs leading-relaxed">{t.desc}</p>
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-3">
            <h2 className="text-lg font-medium text-[#B8D9FF]">When to Use Breathing for Anxiety</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { icon: '⚡', title: 'Panic attack', desc: 'Belly breathing immediately — focus on extending each exhale.' },
                { icon: '🎤', title: 'Before public speaking', desc: '5 cycles of box breathing backstage lowers heart rate within 60 seconds.' },
                { icon: '✈️', title: 'Flight anxiety', desc: '4-7-8 works with eyes closed. Can be done in your seat without anyone noticing.' },
                { icon: '💼', title: 'Work stress spiral', desc: '2 minutes of coherent breathing (5.5 BPM) resets your nervous system at your desk.' },
                { icon: '🌙', title: 'Anxiety at 3am', desc: '4-7-8 in bed. Three cycles and most people are asleep before finishing the fourth.' },
                { icon: '🔄', title: 'Daily prevention', desc: '5 minutes every morning reduces baseline anxiety over 2–4 weeks.' },
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
            <p className="text-[#B8D9FF] text-xl font-light">Try it right now</p>
            <p className="text-[#4A7AAA] text-sm max-w-sm">Our AI coach will ask how you're feeling and recommend the right technique for your anxiety level.</p>
            <Link to="/breathing" className="px-10 py-4 rounded-full text-white font-medium transition-all hover:shadow-[0_0_28px_rgba(58,130,247,0.45)] hover:scale-105"
              style={{ background: 'linear-gradient(135deg,#1A5FCC,#3A82F7)' }}>
              🌬 Start breathing — free
            </Link>
            <p className="text-[#4A7AAA] text-xs">No account · No download · Works in 30 seconds</p>
          </div>

          <div className="flex flex-col gap-3">
            <p className="text-[10px] tracking-[0.25em] uppercase text-[#4A7AAA]">Related techniques</p>
            <div className="flex flex-wrap gap-2">
              {[
                { label: 'Box Breathing', href: '/breathing/box-breathing' },
                { label: '4-7-8 for Sleep', href: '/breathing/4-7-8' },
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