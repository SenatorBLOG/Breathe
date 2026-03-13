import React, { useEffect, useRef, useState } from 'react';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import { Link } from 'react-router-dom';

// ─── Floating particle for hero ──────────────────────────────────────────────
function Particle({ delay, x, size }: { delay: number; x: number; size: number }) {
  return (
    <div
      className="absolute rounded-full bg-[#4A9EFF]/20 blur-sm"
      style={{
        left: `${x}%`,
        bottom: '-10px',
        width: size,
        height: size,
        animation: `floatUp ${6 + delay}s ease-in-out ${delay}s infinite`,
      }}
    />
  );
}

// ─── Breathing orb ───────────────────────────────────────────────────────────
function BreathOrb() {
  return (
    <div className="relative flex items-center justify-center w-48 h-48 sm:w-60 sm:h-60">
      {/* Outer glow rings */}
      <div className="absolute inset-0 rounded-full border border-[#4A9EFF]/10" style={{ animation: 'ping 3s ease-out infinite' }} />
      <div className="absolute inset-4 rounded-full border border-[#4A9EFF]/15" style={{ animation: 'ping 3s ease-out 0.5s infinite' }} />
      {/* Main orb */}
      <div
        className="absolute inset-8 rounded-full"
        style={{
          background: 'radial-gradient(circle at 35% 35%, #7AC4FF, #1A5FCC 60%, #0A1A3F)',
          boxShadow: '0 0 60px rgba(74,158,255,0.4), 0 0 120px rgba(74,158,255,0.15), inset 0 0 40px rgba(255,255,255,0.1)',
          animation: 'breathePulse 4s ease-in-out infinite',
        }}
      />
      {/* Center text */}
      <span className="relative z-10 text-[#C8E4FF] text-sm font-light tracking-[0.2em] uppercase">breathe</span>
    </div>
  );
}

// ─── Stat card ───────────────────────────────────────────────────────────────
function StatCard({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-2xl sm:text-3xl font-semibold text-[#7AC4FF] font-montserrat">{value}</span>
      <span className="text-[10px] sm:text-xs text-[#4A7AAA] tracking-widest uppercase">{label}</span>
    </div>
  );
}

// ─── Content card (feature / article / link block) ───────────────────────────
function ContentCard({
  icon, title, desc, tag, href = '#',
}: {
  icon: string; title: string; desc: string; tag?: string; href?: string;
}) {
  return (
    <Link
      to={href}
      className="group flex flex-col gap-3 bg-[#0B1628]/70 border border-[#1E3358]/50 rounded-2xl p-5 hover:border-[#2A5499]/70 hover:bg-[#0D1B33]/80 transition-all duration-300 hover:shadow-[0_0_30px_rgba(74,158,255,0.08)]"
    >
      <div className="flex items-start justify-between">
        <span className="text-2xl">{icon}</span>
        {tag && <span className="text-[10px] uppercase tracking-widest text-[#4A9EFF]/70 bg-[#4A9EFF]/10 px-2 py-0.5 rounded-full">{tag}</span>}
      </div>
      <h3 className="text-[#B8D9FF] text-sm sm:text-base font-medium leading-snug group-hover:text-white transition-colors">{title}</h3>
      <p className="text-[#4A7AAA] text-xs sm:text-sm leading-relaxed">{desc}</p>
    </Link>
  );
}

// ─── Ad placeholder ──────────────────────────────────────────────────────────
function AdSlot({ label = 'Advertisement', tall = false }: { label?: string; tall?: boolean }) {
  return (
    <div className={`flex items-center justify-center border border-dashed border-[#1E3358]/60 rounded-xl bg-[#080E1A]/40 ${tall ? 'h-40 sm:h-48' : 'h-20 sm:h-24'}`}>
      <span className="text-[10px] tracking-widest uppercase text-[#1E3358] select-none">{label}</span>
    </div>
  );
}

// ─── Technique pill ──────────────────────────────────────────────────────────
function TechniquePill({ name, time, icon }: { name: string; time: string; icon: string }) {
  return (
    <Link
      to="/breathing"
      className="flex items-center gap-3 px-4 py-3 bg-[#0B1628]/70 border border-[#1E3358]/50 rounded-xl hover:border-[#2A5499]/70 hover:bg-[#0D1B33]/80 transition-all duration-200 group"
    >
      <span className="text-lg">{icon}</span>
      <div className="flex-1 min-w-0">
        <p className="text-[#B8D9FF] text-xs font-medium truncate group-hover:text-white transition-colors">{name}</p>
        <p className="text-[#3D6080] text-[10px]">{time}</p>
      </div>
      <svg className="w-3 h-3 text-[#2A5499] group-hover:text-[#4A9EFF] transition-colors flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
    </Link>
  );
}

// ─── Quote block ─────────────────────────────────────────────────────────────
function QuoteBlock({ text, author }: { text: string; author: string }) {
  return (
    <div className="relative pl-5 border-l-2 border-[#2A5499]/60">
      <p className="text-[#7AADCC] text-sm italic leading-relaxed">"{text}"</p>
      <p className="text-[#3D6080] text-xs mt-2">— {author}</p>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function HomePage() {
  const particles = Array.from({ length: 12 }, (_, i) => ({
    id: i,
    delay: Math.random() * 5,
    x: Math.random() * 100,
    size: 4 + Math.random() * 12,
  }));

  return (
    <div className="relative w-full min-h-screen bg-[#010814] font-montserrat overflow-x-hidden">
      {/* ── Keyframes injected via style tag ─────────────────────────── */}
      <style>{`
        @keyframes floatUp {
          0% { transform: translateY(0) scale(1); opacity: 0; }
          10% { opacity: 0.6; }
          90% { opacity: 0.1; }
          100% { transform: translateY(-100vh) scale(0.5); opacity: 0; }
        }
        @keyframes breathePulse {
          0%, 100% { transform: scale(1); box-shadow: 0 0 60px rgba(74,158,255,0.4), 0 0 120px rgba(74,158,255,0.15); }
          50% { transform: scale(1.12); box-shadow: 0 0 80px rgba(74,158,255,0.6), 0 0 160px rgba(74,158,255,0.25); }
        }
        @keyframes ping {
          0% { transform: scale(1); opacity: 0.4; }
          80%, 100% { transform: scale(1.8); opacity: 0; }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        .anim-fade-up { animation: fadeInUp 0.8s ease forwards; }
        .anim-delay-1 { animation-delay: 0.15s; opacity: 0; }
        .anim-delay-2 { animation-delay: 0.3s; opacity: 0; }
        .anim-delay-3 { animation-delay: 0.45s; opacity: 0; }
        .anim-delay-4 { animation-delay: 0.6s; opacity: 0; }
        .shimmer-text {
          background: linear-gradient(90deg, #7AC4FF 0%, #ffffff 40%, #7AC4FF 60%, #4A9EFF 100%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: shimmer 4s linear infinite;
        }
      `}</style>

      {/* ── Global star background ────────────────────────────────────── */}
      <div
        className="fixed inset-0 w-full h-full bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url('/Background_img_Meditation.jpg')`, opacity: 0.55 }}
      />
      <div className="fixed inset-0 bg-gradient-to-b from-[#010814]/60 via-transparent to-[#010814]/90" />

      {/* ── Floating particles ────────────────────────────────────────── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {particles.map(p => <Particle key={p.id} {...p} />)}
      </div>

      {/* ── PAGE CONTENT ──────────────────────────────────────────────── */}
      <div className="relative z-10 flex flex-col min-h-screen">
        <NavBar />

        {/* ════════════════════════════════════════════════════════
            §1  HERO
        ════════════════════════════════════════════════════════ */}
        <section className="flex flex-col items-center justify-center text-center px-4 pt-16 pb-12 sm:pt-24 sm:pb-16 md:pt-32 md:pb-20 gap-8">
          {/* Eyebrow */}
          <span className="anim-fade-up anim-delay-1 text-[10px] sm:text-xs tracking-[0.35em] uppercase text-[#4A9EFF]/70 border border-[#4A9EFF]/20 px-4 py-1.5 rounded-full">
            Your daily mindfulness companion
          </span>

          {/* Orb */}
          <div className="anim-fade-up anim-delay-2">
            <BreathOrb />
          </div>

          {/* Headline */}
          <div className="anim-fade-up anim-delay-2 flex flex-col gap-2">
            <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-light leading-none tracking-tight shimmer-text">
              Breathe Better
            </h1>
            <p className="text-base sm:text-xl md:text-2xl font-light text-[#5A8FB8] max-w-xl mx-auto leading-relaxed">
              Meditation for sleep, focus, and inner quiet — guided by your breath.
            </p>
          </div>

          {/* CTA */}
          <div className="anim-fade-up anim-delay-3 flex flex-col sm:flex-row items-center gap-4">
            <Link
              to="/breathing"
              className="group relative px-10 py-4 rounded-full font-medium text-white text-base tracking-wide overflow-hidden"
              style={{ background: 'linear-gradient(135deg, #1A5FCC 0%, #3A82F7 50%, #2266D4 100%)', boxShadow: '0 0 40px rgba(58,130,247,0.35)' }}
            >
              <span className="relative z-10 flex items-center gap-2">
                <span className="text-xl">🌬</span>
                Start Meditating
              </span>
              <span className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full" />
            </Link>
            <Link
              to="/faq"
              className="px-8 py-4 rounded-full text-sm text-[#5A8FB8] border border-[#1E3358]/60 hover:border-[#2A5499] hover:text-[#7AC4FF] transition-all duration-200 tracking-wide"
            >
              How it works →
            </Link>
          </div>

          {/* Stats strip */}
          <div className="anim-fade-up anim-delay-4 flex items-center gap-8 sm:gap-12 mt-2 border-t border-b border-[#1E3358]/40 py-4 px-8">
            <StatCard value="50K+" label="Sessions" />
            <div className="w-px h-8 bg-[#1E3358]/60" />
            <StatCard value="12" label="Techniques" />
            <div className="w-px h-8 bg-[#1E3358]/60" />
            <StatCard value="4.9★" label="Rating" />
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════
            §2  QUICK-START TECHNIQUES (top pool)
        ════════════════════════════════════════════════════════ */}
        <section className="px-4 sm:px-6 lg:px-8 py-10 max-w-6xl mx-auto w-full">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-lg sm:text-xl font-medium text-[#B8D9FF] tracking-wide">Popular Techniques</h2>
              <p className="text-xs text-[#3D6080] mt-0.5">Pick a session and begin right now</p>
            </div>
            <Link to="/breathing" className="text-xs text-[#4A9EFF] hover:underline">View all →</Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <TechniquePill name="Box Breathing 4-4-4-4" time="5 min · Focus & calm" icon="⬜" />
            <TechniquePill name="4-7-8 Sleep Breath" time="8 min · Wind down" icon="🌙" />
            <TechniquePill name="Coherent Breathing" time="10 min · Heart rate" icon="💙" />
            <TechniquePill name="Wim Hof Method" time="15 min · Energy burst" icon="🔥" />
            <TechniquePill name="Belly Breathing" time="5 min · Beginners" icon="🌀" />
            <TechniquePill name="Alternate Nostril" time="7 min · Balance" icon="☯️" />
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════
            §3  AD SLOT (leaderboard)
        ════════════════════════════════════════════════════════ */}
        <div className="px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full pb-8">
          <AdSlot label="Ad · 728×90 leaderboard" />
        </div>

        {/* ════════════════════════════════════════════════════════
            §4  MAIN CONTENT GRID
        ════════════════════════════════════════════════════════ */}
        <section className="px-4 sm:px-6 lg:px-8 py-4 max-w-6xl mx-auto w-full">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* ── Left column (2/3) ── */}
            <div className="lg:col-span-2 flex flex-col gap-6">

              {/* Feature row */}
              <div>
                <h2 className="text-lg sm:text-xl font-medium text-[#B8D9FF] mb-4 tracking-wide">Explore Mindfulness</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <ContentCard icon="🌊" tag="Guide" title="Breathwork for Deep Sleep" desc="How controlled breathing activates your parasympathetic system and knocks you out in under 10 minutes." href="/faq" />
                  <ContentCard icon="⚡" tag="Science" title="Why Slow Breath = Calm Mind" desc="Neuroscience behind the breath-brain connection — and how 6 breaths per minute changes everything." href="/faq" />
                  <ContentCard icon="🧘" tag="Practice" title="Morning Ritual in 3 Minutes" desc="Start every day with a simple pranayama sequence that sets your nervous system for focused flow." href="/breathing" />
                  <ContentCard icon="📊" tag="Track" title="Your Progress Dashboard" desc="View streaks, session history, and breathing stats to keep your practice consistent and rewarding." href="/sessions" />
                  <ContentCard icon="🌍" tag="Community" title="Join the Community" desc="Share your journey, ask questions, and celebrate milestones with meditators from around the world." href="/community" />
                </div>
              </div>

              {/* Meditation quote strip */}
              <div className="bg-[#0B1628]/60 border border-[#1E3358]/50 rounded-2xl p-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
                <QuoteBlock text="The breath is the bridge which connects life to consciousness." author="Thich Nhat Hanh" />
                <QuoteBlock text="Almost everything will work again if you unplug it for a few minutes — including you." author="Anne Lamott" />
              </div>

              {/* Ad slot — rectangle */}
              <AdSlot label="Ad · 300×250 medium rectangle" tall />

              {/* How it works — condensed 3-step */}
              <div>
                <h2 className="text-lg sm:text-xl font-medium text-[#B8D9FF] mb-4 tracking-wide">How Breathe Works</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[
                    { icon: '/icons/Spiral_png.png', step: '01', title: 'Follow the Orb', desc: 'Inhale as it expands, exhale as it contracts. Zero effort, full effect.' },
                    { icon: '/icons/Constellation_png.png', step: '02', title: 'Build the Habit', desc: '3–5 min daily sessions. Morning, lunch, bedtime — you choose the rhythm.' },
                    { icon: '/icons/Waves_png.png', step: '03', title: 'Feel the Change', desc: 'Track progress, unlock achievements, and watch your baseline calm rise.' },
                  ].map(({ icon, step, title, desc }) => (
                    <div key={step} className="flex flex-col items-center text-center gap-3 bg-[#0B1628]/60 border border-[#1E3358]/40 rounded-2xl p-5 hover:border-[#2A5499]/60 transition-colors">
                      <img src={icon} alt={title} className="w-16 h-16 object-contain opacity-80" />
                      <span className="text-[10px] tracking-[0.3em] text-[#2A5499] uppercase">{step}</span>
                      <h3 className="text-[#B8D9FF] text-sm font-medium">{title}</h3>
                      <p className="text-[#3D6080] text-xs leading-relaxed">{desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ── Right column (1/3) sidebar ── */}
            <div className="flex flex-col gap-5">

              {/* Featured CTA card */}
              <div
                className="relative overflow-hidden rounded-2xl p-6 flex flex-col items-center text-center gap-4"
                style={{ background: 'linear-gradient(145deg, #0D1F3C 0%, #091530 100%)', border: '1px solid rgba(74,158,255,0.2)', boxShadow: '0 0 60px rgba(74,158,255,0.07)' }}
              >
                <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-[#4A9EFF]/5 blur-2xl" />
                <img src="/icons/Lotus_png.png" alt="Lotus" className="w-20 h-20 object-contain opacity-90" />
                <div>
                  <p className="text-[#7AC4FF] text-base font-medium mb-1">Ready to begin?</p>
                  <p className="text-[#3D6080] text-xs leading-relaxed">Your first session takes less than 5 minutes. No account needed.</p>
                </div>
                <Link
                  to="/breathing"
                  className="w-full py-3 rounded-xl bg-[#1A5FCC] hover:bg-[#2266D4] text-white text-sm font-medium transition-colors text-center tracking-wide"
                >
                  🌬 &nbsp;Begin Session
                </Link>
              </div>

              {/* Today's top */}
              <div className="bg-[#0B1628]/70 border border-[#1E3358]/50 rounded-2xl p-4">
                <h3 className="text-xs uppercase tracking-widest text-[#3D6080] mb-3">Today's Pick</h3>
                <div className="flex flex-col gap-2">
                  {[
                    { rank: '1', title: '4-7-8 for Sleep', views: '2.4K sessions' },
                    { rank: '2', title: 'Box Breathing', views: '1.8K sessions' },
                    { rank: '3', title: 'Wim Hof Basic', views: '1.2K sessions' },
                    { rank: '4', title: 'Coherent 5.5', views: '900 sessions' },
                    { rank: '5', title: 'Morning Pranayama', views: '760 sessions' },
                  ].map(item => (
                    <Link to="/breathing" key={item.rank} className="flex items-center gap-3 py-1.5 group">
                      <span className="text-[#1E3358] text-xs w-4 text-right font-mono">{item.rank}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-[#8ABADD] text-xs truncate group-hover:text-white transition-colors">{item.title}</p>
                        <p className="text-[#2A4060] text-[10px]">{item.views}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Ad slot — sidebar */}
              <AdSlot label="Ad · 300×600 half-page" tall />

              {/* Links pool */}
              <div className="bg-[#0B1628]/70 border border-[#1E3358]/50 rounded-2xl p-4">
                <h3 className="text-xs uppercase tracking-widest text-[#3D6080] mb-3">Quick Links</h3>
                <ul className="flex flex-col gap-2">
                  {[
                    { label: 'Meditation Library', href: '/breathing' },
                    { label: 'Sleep Sounds',        href: '/music-library' },
                    { label: 'Community Forum',     href: '/community' },
                    { label: 'Stress Relief Tools', href: '/breathing' },
                    { label: 'My Sessions',         href: '/sessions' },
                    { label: 'Expert Articles',     href: '/faq' },
                  ].map(({ label, href }) => (
                    <li key={label}>
                      <Link to={href} className="text-[#5A8FB8] text-xs hover:text-[#7AC4FF] transition-colors flex items-center gap-2 group">
                        <span className="w-1 h-1 rounded-full bg-[#2A5499] group-hover:bg-[#4A9EFF] transition-colors flex-shrink-0" />
                        {label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Newsletter mini */}
              <div className="bg-[#0B1628]/70 border border-[#1E3358]/50 rounded-2xl p-4 flex flex-col gap-3">
                <h3 className="text-xs uppercase tracking-widest text-[#3D6080]">Weekly Calm</h3>
                <p className="text-[#4A7AAA] text-xs leading-relaxed">Get one mindfulness tip delivered every Sunday.</p>
                <div className="flex gap-2">
                  <input
                    type="email"
                    placeholder="your@email.com"
                    className="flex-1 min-w-0 bg-[#060C1A] border border-[#1E3358]/60 rounded-lg px-3 py-2 text-xs text-[#7AADCC] placeholder-[#2A4060] outline-none focus:border-[#2A5499] transition-colors"
                  />
                  <button className="px-3 py-2 bg-[#1A5FCC] rounded-lg text-xs text-white hover:bg-[#2266D4] transition-colors flex-shrink-0">
                    →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════
            §5  BOTTOM FEATURED POOLS
        ════════════════════════════════════════════════════════ */}
        <section className="px-4 sm:px-6 lg:px-8 py-10 max-w-6xl mx-auto w-full">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Pool 1 */}
            <div className="bg-[#0B1628]/70 border border-[#1E3358]/50 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xl">🌙</span>
                <h3 className="text-sm font-medium text-[#B8D9FF]">Sleep Pool</h3>
              </div>
              <ul className="flex flex-col gap-2.5">
                {['4-7-8 Wind Down', 'Body Scan Relaxation', 'Delta Wave Breath', 'Yoga Nidra Intro'].map(t => (
                  <li key={t}><Link to="/breathing" className="text-[#5A8FB8] text-xs hover:text-[#7AC4FF] transition-colors">{t} →</Link></li>
                ))}
              </ul>
            </div>
            {/* Pool 2 */}
            <div className="bg-[#0B1628]/70 border border-[#1E3358]/50 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xl">⚡</span>
                <h3 className="text-sm font-medium text-[#B8D9FF]">Focus Pool</h3>
              </div>
              <ul className="flex flex-col gap-2.5">
                {['Box Breathing Pro', 'Coherent 5.5 BPM', 'Kapalbhati Energize', 'Nasal Alternation'].map(t => (
                  <li key={t}><Link to="/breathing" className="text-[#5A8FB8] text-xs hover:text-[#7AC4FF] transition-colors">{t} →</Link></li>
                ))}
              </ul>
            </div>
            {/* Pool 3 */}
            <div className="bg-[#0B1628]/70 border border-[#1E3358]/50 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xl">💚</span>
                <h3 className="text-sm font-medium text-[#B8D9FF]">Beginner Pool</h3>
              </div>
              <ul className="flex flex-col gap-2.5">
                {['First Breath Session', 'Belly Breathing 101', 'Count to Calm', '3-Minute Reset'].map(t => (
                  <li key={t}><Link to="/breathing" className="text-[#5A8FB8] text-xs hover:text-[#7AC4FF] transition-colors">{t} →</Link></li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════
            §6  FINAL CTA BANNER
        ════════════════════════════════════════════════════════ */}
        <section className="px-4 sm:px-6 lg:px-8 py-12 max-w-6xl mx-auto w-full">
          <div
            className="relative overflow-hidden rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-6 px-8 py-10"
            style={{ background: 'linear-gradient(135deg, #0D1F3C 0%, #0A1525 100%)', border: '1px solid rgba(74,158,255,0.15)', boxShadow: '0 0 80px rgba(74,158,255,0.06)' }}
          >
            <div className="absolute -right-10 -top-10 w-48 h-48 rounded-full bg-[#4A9EFF]/5 blur-3xl pointer-events-none" />
            <div className="absolute -left-5 -bottom-5 w-32 h-32 rounded-full bg-[#1A5FCC]/10 blur-2xl pointer-events-none" />
            <div className="flex items-center gap-5">
              <img src="/icons/Lotus_png.png" alt="" className="w-14 h-14 object-contain opacity-80 hidden sm:block" />
              <div>
                <h2 className="text-xl sm:text-2xl font-light text-[#B8D9FF] mb-1">Ready to find your calm?</h2>
                <p className="text-[#3D6080] text-sm">Your first guided breath session is one tap away.</p>
              </div>
            </div>
            <Link
              to="/breathing"
              className="flex-shrink-0 px-10 py-4 rounded-full text-white font-medium text-sm tracking-wide transition-all duration-300 hover:shadow-[0_0_40px_rgba(58,130,247,0.4)]"
              style={{ background: 'linear-gradient(135deg, #1A5FCC, #3A82F7)' }}
            >
              🌬 &nbsp;Start Now
            </Link>
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════
            §7  BOTTOM AD SLOT
        ════════════════════════════════════════════════════════ */}
        <div className="px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full pb-8">
          <AdSlot label="Ad · 728×90 footer leaderboard" />
        </div>

        <Footer />
      </div>
    </div>
  );
}