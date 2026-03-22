import React, { useEffect, useRef, useState } from 'react';
import NavBar from '../components/NavBar';
import ThemeBackground from '../components/ThemeBackground';
import Footer from '../components/Footer';
import { Link } from 'react-router-dom';
import AICoachButton from '../components/AICoach/AICoachButton';
import { useTranslation } from 'react-i18next';
import { useThemeStyles } from '../hooks/useThemeStyles';
import NewsletterWidget from '../components/NewsletterWidget';
import SoulOrb from '../components/AICoach/SoulOrb';
import HomeInteractive from '../components/HomeInteractive';

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

// ─── Stat card ───────────────────────────────────────────────────────────────
function StatCard({ value, label }: { value: string; label: string }) {
  const ts = useThemeStyles();
  return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-2xl sm:text-3xl font-semibold" style={{ color: ts.textSecondary }}>
        {value}
      </span>
      <span className="text-[10px] sm:text-xs tracking-widest uppercase" style={{ color: ts.textMuted }}>
        {label}
      </span>
    </div>
  );
}

// ─── Content card ────────────────────────────────────────────────────────────
function ContentCard({
  icon, title, desc, tag, href = '#',
}: {
  icon: string; title: string; desc: string; tag?: string; href?: string;
}) {
  const ts = useThemeStyles();
  return (
    <Link
      to={href}
      className="group flex flex-col gap-3 rounded-2xl p-5 transition-all duration-300 hover:shadow-[0_0_30px_rgba(74,158,255,0.08)]"
      style={{
        backgroundColor: ts.cardBg,
        border: `1px solid ${ts.border}`,
      }}
    >
      <div className="flex items-start justify-between">
        <span className="text-2xl">{icon}</span>
        {tag && (
          <span
            className="text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full"
            style={{
              color: ts.accent,
              backgroundColor: `${ts.accent}10`,
            }}
          >
            {tag}
          </span>
        )}
      </div>
      <h3 className="text-sm sm:text-base font-medium leading-snug group-hover:text-white transition-colors" style={{ color: ts.textPrimary }}>
        {title}
      </h3>
      <p className="text-xs sm:text-sm leading-relaxed" style={{ color: ts.textMuted }}>
        {desc}
      </p>
    </Link>
  );
}

// ─── Ad placeholder ──────────────────────────────────────────────────────────
function AdSlot({ label = 'Advertisement', tall = false }: { label?: string; tall?: boolean }) {
  const ts = useThemeStyles();
  return (
    <div
      className={`flex items-center justify-center border border-dashed rounded-xl ${tall ? 'h-40 sm:h-48' : 'h-20 sm:h-24'}`}
      style={{
        borderColor: ts.border,
        backgroundColor: `${ts.cardBg}40`,
      }}
    >
      <span className="text-[10px] tracking-widest uppercase select-none" style={{ color: ts.textDim }}>
        {label}
      </span>
    </div>
  );
}

// ─── Technique pill ──────────────────────────────────────────────────────────
function TechniquePill({ name, time, icon }: { name: string; time: string; icon: string }) {
  const ts = useThemeStyles();
  return (
    <Link
      to="/breathing"
      className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group"
      style={{
        backgroundColor: ts.cardBg,
        border: `1px solid ${ts.border}`,
      }}
    >
      <span className="text-lg">{icon}</span>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium truncate group-hover:text-white transition-colors" style={{ color: ts.textPrimary }}>
          {name}
        </p>
        <p className="text-[10px]" style={{ color: ts.textMuted }}>
          {time}
        </p>
      </div>
      <svg className="w-3 h-3 transition-colors flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: ts.borderHover }}>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    </Link>
  );
}

// ─── Quote block ─────────────────────────────────────────────────────────────
function QuoteBlock({ text, author }: { text: string; author: string }) {
  const ts = useThemeStyles();
  return (
    <div className="relative pl-5 border-l-2" style={{ borderColor: ts.border }}>
      <p className="text-sm italic leading-relaxed" style={{ color: ts.textMuted }}>
        "{text}"
      </p>
      <p className="text-xs mt-2" style={{ color: ts.textDim }}>
        — {author}
      </p>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function HomePage() {
  const { t } = useTranslation();
  const ts = useThemeStyles();

  return (
    <div className="relative w-full min-h-screen font-montserrat overflow-x-hidden">
      <ThemeBackground />

      <div className="relative z-10 flex flex-col min-h-screen">
        <NavBar />

        {/* HERO */}
        <section className="flex flex-col items-center justify-center text-center px-4 pt-16 pb-12 sm:pt-24 sm:pb-16 md:pt-32 md:pb-20 gap-8">
          <span className="anim-fade-up anim-delay-1 text-[10px] sm:text-xs tracking-[0.35em] uppercase px-4 py-1.5 rounded-full" 
                style={{ color: ts.accent, border: `1px solid ${ts.accent}20` }}>
            {t('hero.eyebrow')}
          </span>

          <div className="anim-fade-up anim-delay-2 flex flex-col gap-2">
            <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-light leading-none tracking-tight shimmer-text">
              Breathe Better
            </h1>
            <p className="text-base sm:text-xl md:text-2xl font-light max-w-xl mx-auto leading-relaxed" style={{ color: ts.textMuted }}>
              {t('hero.subtitle')}
            </p>
          </div>

          <div className="anim-fade-up anim-delay-2 flex flex-col items-center w-full">
            <SoulOrb />
          </div>

          <div className="anim-fade-up anim-delay-3 flex flex-col sm:flex-row items-center gap-4">
            <Link
              to="/breathing"
              className="group relative px-10 py-4 rounded-full font-medium text-white text-base tracking-wide overflow-hidden"
              style={{ background: ts.btnGradient, boxShadow: ts.btnShadow }}
            >
              <span className="relative z-10 flex items-center gap-2">
                <span className="text-xl">🌬</span>
                {t('hero.cta')}
              </span>
            </Link>
            <Link
              to="/faq"
              className="px-8 py-4 rounded-full text-sm tracking-wide transition-all duration-200"
              style={{ 
                color: ts.textMuted, 
                border: `1px solid ${ts.border}` 
              }}
            >
              How it works →
            </Link>
          </div>

          <div className="anim-fade-up anim-delay-4 flex items-center gap-8 sm:gap-12 mt-2 border-t border-b py-4 px-8" 
               style={{ borderColor: ts.border }}>
            <StatCard value="50K+" label={t("hero.stats.sessions")} />
            <div className="w-px h-8" style={{ backgroundColor: ts.border }} />
            <StatCard value="12" label={t("hero.stats.techniques")} />
            <div className="w-px h-8" style={{ backgroundColor: ts.border }} />
            <StatCard value="4.9★" label={t("hero.stats.rating")} />
          </div>
        </section>

        {/* QUICK-START TECHNIQUES */}
        <section className="px-4 sm:px-6 lg:px-8 py-10 max-w-6xl mx-auto w-full">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-lg sm:text-xl font-medium" style={{ color: ts.textPrimary }}>
                {t('techniques.title')}
              </h2>
              <p className="text-xs mt-0.5" style={{ color: ts.textMuted }}>
                {t('techniques.subtitle')}
              </p>
            </div>
            <Link to="/breathing" className="text-xs hover:underline" style={{ color: ts.accent }}>
              {t('techniques.viewAll')}
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <TechniquePill name={t("techniques.box")} time={t("techniques.boxDesc")} icon="⬜" />
            <TechniquePill name={t("techniques.sleep478")} time={t("techniques.sleep478Desc")} icon="🌙" />
            <TechniquePill name={t("techniques.coherent")} time={t("techniques.coherentDesc")} icon="💙" />
            <TechniquePill name={t("techniques.wimhof")} time={t("techniques.wimhofDesc")} icon="🔥" />
            <TechniquePill name={t("techniques.belly")} time={t("techniques.bellyDesc")} icon="🌀" />
            <TechniquePill name={t("techniques.alternate")} time={t("techniques.alternateDesc")} icon="☯️" />
          </div>
        </section>

        {/* INTERACTIVE QUIZ + STRESS CALCULATOR */}
        <section className="px-4 sm:px-6 lg:px-8 py-10 max-w-6xl mx-auto w-full">
          <div className="flex flex-col items-center gap-5">
            <div className="text-center">
              <h2 className="text-lg sm:text-xl font-medium tracking-wide" style={{ color: ts.textPrimary }}>
                What kind of breather are you?
              </h2>
              <p className="text-xs mt-1" style={{ color: ts.textMuted }}>
                5 questions · free · instant result
              </p>
            </div>
            <HomeInteractive />
          </div>
        </section>

        {/* AD SLOT */}
        <div className="px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full pb-8">
          <AdSlot label="Ad · 728×90 leaderboard" />
        </div>

        {/* MAIN CONTENT GRID */}
        <section className="px-4 sm:px-6 lg:px-8 py-4 max-w-6xl mx-auto w-full">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left column */}
            <div className="lg:col-span-2 flex flex-col gap-6">
              <div>
                <h2 className="text-lg sm:text-xl font-medium mb-4 tracking-wide" style={{ color: ts.textPrimary }}>
                  {t('home.exploreMindfulness')}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <ContentCard icon="🌊" tag="Guide" title={t('home.contentCards.sleepTitle')} desc={t('home.contentCards.sleepDesc')} href="/sleep/breathwork-for-deep-sleep" />
                  <ContentCard icon="⚡" tag="Science" title={t('home.contentCards.scienceTitle')} desc={t('home.contentCards.scienceDesc')} href="/science/slow-breathing" />
                  <ContentCard icon="🧘" tag="Practice" title={t('home.contentCards.morningTitle')} desc={t('home.contentCards.morningDesc')} href="/breathing/morning-ritual" />
                  <ContentCard icon="📊" tag="Track" title={t('home.contentCards.progressTitle')} desc={t('home.contentCards.progressDesc')} href="/sessions" />
                  <ContentCard icon="🌍" tag="Community" title={t('home.contentCards.communityTitle')} desc={t('home.contentCards.communityDesc')} href="/community" />
                </div>
              </div>

              <div className="bg-[#0B1628]/60 border rounded-2xl p-6 grid grid-cols-1 sm:grid-cols-2 gap-6" style={{ borderColor: ts.border }}>
                <QuoteBlock text="The breath is the bridge which connects life to consciousness." author="Thich Nhat Hanh" />
                <QuoteBlock text="Almost everything will work again if you unplug it for a few minutes — including you." author="Anne Lamott" />
              </div>

              <AdSlot label="Ad · 300×250 medium rectangle" tall />
            </div>

            {/* Right sidebar */}
            <div className="flex flex-col gap-5">
              <div className="rounded-2xl p-6 flex flex-col items-center text-center gap-4" 
                   style={{ background: ts.cardBg, border: `1px solid ${ts.border}` }}>
                <img src="/icons/Lotus_png.png" alt="Lotus" className="w-20 h-20 object-contain opacity-90" />
                <div>
                  <p className="text-base font-medium mb-1" style={{ color: ts.textSecondary }}>{t('home.readyToBegin')}</p>
                  <p className="text-xs leading-relaxed" style={{ color: ts.textMuted }}>{t('home.readyDesc')}</p>
                </div>
                <Link
                  to="/breathing"
                  className="w-full py-3 rounded-xl text-sm font-medium transition-colors text-center tracking-wide"
                  style={{ background: ts.btnGradient }}
                >
                  🌬 &nbsp;Begin Session
                </Link>
              </div>

              {/* Sleep guides */}
              <div className="rounded-2xl p-5 flex flex-col gap-3"
                style={{ background: ts.cardBg, border: `1px solid ${ts.border}` }}>
                <p className="text-[10px] tracking-[0.25em] uppercase" style={{ color: ts.textMuted }}>
                  Sleep guides
                </p>
                {[
                  { label: 'Why Sleep is So Important',  href: '/sleep/why-sleep-is-important',    icon: '💤' },
                  { label: 'What is Sleep Apnea?',       href: '/sleep/what-is-sleep-apnea',        icon: '😮‍💨' },
                  { label: 'Breathwork for Deep Sleep',  href: '/sleep/breathwork-for-deep-sleep',  icon: '🌊' },
                  { label: 'Why Slow Breathing Calms You', href: '/science/slow-breathing',         icon: '⚡' },
                ].map(({ label, href, icon }) => (
                  <Link key={href} to={href}
                    className="flex items-center gap-2 text-xs transition-all hover:opacity-80"
                    style={{ color: ts.accent }}>
                    <span>{icon}</span>
                    <span>{label} →</span>
                  </Link>
                ))}
              </div>

              <AdSlot label="Ad · 300×600 half-page" tall />
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </div>
  );
}