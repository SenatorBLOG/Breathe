import React, { useEffect, useState } from 'react';
import { Square, Moon, Heart, Flame, Wind, Infinity, Waves, Zap, BarChart2, Globe, Activity } from 'lucide-react';
import NavBar from '../components/NavBar';
import ThemeBackground from '../components/ThemeBackground';
import Footer from '../components/Footer';
import { Link } from 'react-router-dom';
import AICoachButton from '../components/AICoach/AICoachButton';
import { useTranslation } from 'react-i18next';
import { useThemeStyles } from '../hooks/useThemeStyles';
import NewsletterWidget from '../components/NewsletterWidget';
import SoulOrb from '../components/AICoach/SoulOrb';
import HeroBreathDemo from '../components/HeroBreathDemo';
import HomeInteractive from '../components/HomeInteractive';
import { useScrollReveal } from '../hooks/useScrollReveal';
import UserProgressStrip from '../components/UserProgressStrip';
import Icon from '../components/Icon';
import PageSEO from '../components/PageSEO';
import { APP_STATS } from '../config/appStats';

// ─── Animated number counter ─────────────────────────────────────────────────
// Starts from ~80% of target so the first rendered frame is never "0".
function AnimatedNumber({ target, suffix = '' }: { target: number; suffix?: string }) {
  // Floor at 80% so even before the scroll-triggered animation the number
  // looks meaningful, not embarrassingly zero on Product Hunt.
  const floor = Math.floor(target * 0.8);
  const [current, setCurrent] = useState(floor);
  const [ref, visible] = useScrollReveal(0.3);

  useEffect(() => {
    if (!visible) return;
    let start = floor;
    const duration = 900;
    const step = 16;
    const increment = (target - floor) / (duration / step);
    const timer = setInterval(() => {
      start += increment;
      if (start >= target) { setCurrent(target); clearInterval(timer); }
      else setCurrent(Math.floor(start));
    }, step);
    return () => clearInterval(timer);
  }, [visible, target, floor]);

  return (
    <span ref={ref as React.RefObject<HTMLSpanElement>} className="tabular-nums">
      {current.toLocaleString()}{suffix}
    </span>
  );
}

// ─── Reveal section wrapper ───────────────────────────────────────────────────
function RevealSection({ children, className = '', delay = 0, direction = 'up' }: {
  children: React.ReactNode; className?: string; delay?: number; direction?: 'up' | 'left' | 'right';
}) {
  const [ref, visible] = useScrollReveal();
  const cls = direction === 'left' ? 'reveal-left' : direction === 'right' ? 'reveal-right' : 'reveal';
  return (
    <section
      ref={ref as React.RefObject<HTMLElement>}
      className={`${cls} ${visible ? 'visible' : ''} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </section>
  );
}

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
      <span className="t-label sm:text-xs tracking-widest uppercase" style={{ color: ts.textMuted }}>
        {label}
      </span>
    </div>
  );
}

// ─── Content card ────────────────────────────────────────────────────────────
function ContentCard({
  icon, title, desc, tag, href = '#',
}: {
  icon: React.ReactNode; title: string; desc: string; tag?: string; href?: string;
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
            className="t-label px-2 py-0.5 rounded-full"
            style={{
              color: ts.accent,
              backgroundColor: `${ts.accent}10`,
            }}
          >
            {tag}
          </span>
        )}
      </div>
      <h3 className="t-body sm:text-base font-medium leading-snug group-hover:text-white transition-colors" style={{ color: ts.textPrimary }}>
        {title}
      </h3>
      <p className="t-caption sm:text-sm leading-relaxed" style={{ color: ts.textMuted }}>
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
      <span className="t-label select-none" style={{ color: ts.textDim }}>
        {label}
      </span>
    </div>
  );
}

// ─── Technique presets ────────────────────────────────────────────────────────
interface PhaseDurations { inhale: number; hold: number; exhale: number; pause: number; }

const TECHNIQUE_PRESETS: Record<string, PhaseDurations> = {
  box:       { inhale: 4, hold: 4, exhale: 4, pause: 4 },
  sleep478:  { inhale: 4, hold: 7, exhale: 8, pause: 1 },
  coherent:  { inhale: 5, hold: 0, exhale: 5, pause: 1 },
  wimhof:    { inhale: 2, hold: 1, exhale: 2, pause: 1 },
  belly:     { inhale: 4, hold: 0, exhale: 6, pause: 2 },
  alternate: { inhale: 4, hold: 4, exhale: 4, pause: 2 },
};

// ─── Technique pill ──────────────────────────────────────────────────────────
function TechniquePill({ name, time, icon, presetKey, presetName }: {
  name: string; time: string; icon: React.ReactNode;
  presetKey: string; presetName: string;
}) {
  const ts = useThemeStyles();
  const preset = TECHNIQUE_PRESETS[presetKey];
  return (
    <Link
      to="/breathing"
      state={preset ? { coachPreset: preset, coachPresetName: presetName } : undefined}
      className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group"
      style={{
        backgroundColor: ts.cardBg,
        border: `1px solid ${ts.border}`,
      }}
    >
      <span className="t-heading">{icon}</span>
      <div className="flex-1 min-w-0">
        <p className="t-caption font-medium truncate group-hover:text-white transition-colors" style={{ color: ts.textPrimary }}>
          {name}
        </p>
        <p className="t-caption" style={{ color: ts.textMuted }}>
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
      <p className="t-body italic leading-relaxed" style={{ color: ts.textMuted }}>
        "{text}"
      </p>
      <p className="t-caption mt-2" style={{ color: ts.textDim }}>
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
      <PageSEO
        title="Breathe — Guided Breathing & Meditation App"
        description="Free guided breathing exercises for sleep, stress, and focus. Try Box Breathing, 4-7-8, Wim Hof and more. No download needed — works in your browser."
        canonical="/"
      />
      <ThemeBackground />

      <div className="relative z-10 flex flex-col min-h-screen">
        <NavBar />
        <main className="flex-1 flex flex-col">

        {/* HERO */}
        <section className="flex flex-col items-center justify-center text-center px-4 pt-16 pb-12 sm:pt-24 sm:pb-16 md:pt-32 md:pb-20 gap-8">
          <span className="anim-fade-up anim-delay-1 t-label sm:text-xs tracking-[0.35em] uppercase px-4 py-1.5 rounded-full" 
                style={{ color: ts.accent, border: `1px solid ${ts.accent}20` }}>
            {t('hero.eyebrow')}
          </span>

          {/* h1 renders immediately — it's the LCP element. No opacity:0 delay. */}
          <div className="flex flex-col gap-2">
            <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-light leading-none tracking-tight shimmer-text">
              {t('hero.title')}
            </h1>
            <p className="anim-fade-up anim-delay-2 t-body sm:text-xl md:text-2xl font-light max-w-xl mx-auto leading-relaxed" style={{ color: ts.textMuted }}>
              {t('hero.subtitle')}
            </p>
          </div>

          <div className="anim-fade-up anim-delay-2 flex flex-col items-center w-full">
            <SoulOrb />
          </div>

          <div className="anim-fade-up anim-delay-3 flex flex-col sm:flex-row items-center gap-4">
            <Link
              to="/breathing"
              className="group relative px-10 py-4 rounded-full font-medium text-white t-body tracking-wide overflow-hidden"
              style={{ background: ts.btnGradient, boxShadow: ts.btnShadow }}
            >
              <span className="relative z-10 flex items-center gap-2">
                <Icon name="1.blow" size={20} />
                {t('hero.cta')}
              </span>
            </Link>
            <Link
              to="/faq"
              className="px-8 py-4 rounded-full t-body tracking-wide transition-all duration-200"
              style={{ 
                color: ts.textMuted, 
                border: `1px solid ${ts.border}` 
              }}
            >
              {t('hero.howItWorks')}
            </Link>
          </div>

          <div className="anim-fade-up anim-delay-4 flex items-center gap-8 sm:gap-12 mt-2 border-t border-b py-4 px-8"
               style={{ borderColor: ts.border }}>
            <div className="flex flex-col items-center gap-1">
              <span className="text-2xl sm:text-3xl font-semibold" style={{ color: ts.textSecondary }}>
                <AnimatedNumber target={APP_STATS.SESSIONS_COUNT} suffix={APP_STATS.SESSIONS_SUFFIX} />
              </span>
              <span className="t-label sm:text-xs tracking-widest uppercase" style={{ color: ts.textMuted }}>{t("hero.stats.sessions")}</span>
            </div>
            <div className="w-px h-8" style={{ backgroundColor: ts.border }} />
            <div className="flex flex-col items-center gap-1">
              <span className="text-2xl sm:text-3xl font-semibold" style={{ color: ts.textSecondary }}>
                <AnimatedNumber target={APP_STATS.TECHNIQUES_COUNT} />
              </span>
              <span className="t-label sm:text-xs tracking-widest uppercase" style={{ color: ts.textMuted }}>{t("hero.stats.techniques")}</span>
            </div>
            <div className="w-px h-8" style={{ backgroundColor: ts.border }} />
            <StatCard value="4.9★" label={t("hero.stats.rating")} />
          </div>
        </section>

        {/* INSTANT BREATH DEMO — the product working before any click */}
        <HeroBreathDemo />

        {/* USER PROGRESS STRIP */}
        <div className="w-full py-4 sm:py-6">
          <UserProgressStrip />
        </div>

        {/* QUICK-START TECHNIQUES */}
        <RevealSection className="px-4 sm:px-6 lg:px-8 py-10 max-w-6xl mx-auto w-full">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="t-heading sm:text-xl font-medium" style={{ color: ts.textPrimary }}>
                {t('techniques.title')}
              </h2>
              <p className="t-caption mt-0.5" style={{ color: ts.textMuted }}>
                {t('techniques.subtitle')}
              </p>
            </div>
            <Link to="/breathing" className="t-caption hover:underline" style={{ color: ts.accent }}>
              {t('techniques.viewAll')}
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 reveal-stagger">
            <TechniquePill name={t("techniques.box")}       time={t("techniques.boxDesc")}       icon={<Square size={20} color="#38BDF8" />}   presetKey="box"       presetName="Box Breathing" />
            <TechniquePill name={t("techniques.sleep478")}  time={t("techniques.sleep478Desc")}  icon={<Moon size={20} color="#818CF8" />}     presetKey="sleep478"  presetName="4-7-8 Breathing" />
            <TechniquePill name={t("techniques.coherent")}  time={t("techniques.coherentDesc")}  icon={<Heart size={20} color="#60A5FA" />}    presetKey="coherent"  presetName="Coherent Breathing" />
            <TechniquePill name={t("techniques.wimhof")}    time={t("techniques.wimhofDesc")}    icon={<Flame size={20} color="#F97316" />}    presetKey="wimhof"    presetName="Wim Hof Method" />
            <TechniquePill name={t("techniques.belly")}     time={t("techniques.bellyDesc")}     icon={<Wind size={20} color="#A78BFA" />}     presetKey="belly"     presetName="Belly Breathing" />
            <TechniquePill name={t("techniques.alternate")} time={t("techniques.alternateDesc")} icon={<Infinity size={20} color="#4ADE80" />} presetKey="alternate" presetName="Alternate Nostril" />
          </div>
        </RevealSection>

        {/* INTERACTIVE QUIZ + STRESS CALCULATOR */}
        <RevealSection className="px-4 sm:px-6 lg:px-8 py-10 max-w-6xl mx-auto w-full" delay={100}>
          <div className="flex flex-col items-center gap-5">
            <div className="text-center">
              <h2 className="t-heading sm:text-xl font-medium tracking-wide" style={{ color: ts.textPrimary }}>
                {t('home.breatherQuiz')}
              </h2>
              <p className="t-caption mt-1" style={{ color: ts.textMuted }}>
                {t('home.fiveQuestions')}
              </p>
            </div>
            <HomeInteractive />
          </div>
        </RevealSection>

        {/* AD SLOT */}
        <div className="px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full pb-8">
          <AdSlot label="Ad · 728×90 leaderboard" />
        </div>

        {/* MAIN CONTENT GRID */}
        <RevealSection className="px-4 sm:px-6 lg:px-8 py-4 max-w-6xl mx-auto w-full" delay={80}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left column */}
            <div className="lg:col-span-2 flex flex-col gap-6">
              <div>
                <div className="flex items-center justify-between mb-4 gap-3">
                  <h2 className="t-heading sm:text-xl font-medium tracking-wide" style={{ color: ts.textPrimary }}>
                    {t('home.exploreMindfulness')}
                  </h2>
                  <Link to="/learn" className="t-caption whitespace-nowrap hover:underline flex-shrink-0" style={{ color: ts.accent }}>
                    {t('home.viewAllGuides', 'All guides →')}
                  </Link>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 reveal-stagger">
                  <ContentCard icon={<Waves size={20} color="#38BDF8" />}    tag="Guide"     title={t('home.contentCards.sleepTitle')}     desc={t('home.contentCards.sleepDesc')}      href="/sleep/breathwork-for-deep-sleep" />
                  <ContentCard icon={<Zap size={20} color="#FACC15" />}      tag="Science"   title={t('home.contentCards.scienceTitle')}   desc={t('home.contentCards.scienceDesc')}    href="/science/slow-breathing" />
                  <ContentCard icon={<Activity size={20} color="#F87171" />} tag="Science"   title={t('home.contentCards.fightTitle')}     desc={t('home.contentCards.fightDesc')}      href="/science/fight-or-flight" />
                  <ContentCard icon={<Wind size={20} color="#A78BFA" />}     tag="Practice"  title={t('home.contentCards.morningTitle')}   desc={t('home.contentCards.morningDesc')}    href="/breathing/morning-ritual" />
                  <ContentCard icon={<BarChart2 size={20} color="#4A9EFF" />} tag="Track"    title={t('home.contentCards.progressTitle')}  desc={t('home.contentCards.progressDesc')}   href="/sessions" />
                  <ContentCard icon={<Globe size={20} color="#4ADE80" />}    tag="Community" title={t('home.contentCards.communityTitle')} desc={t('home.contentCards.communityDesc')}  href="/community" />
                </div>
                <Link to="/learn"
                  className="mt-4 flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl t-body font-medium transition-all hover:scale-[1.01]"
                  style={{ color: ts.accent, border: `1px solid ${ts.border}`, backgroundColor: ts.cardBg }}>
                  📚 {t('home.browseLibrary', 'Browse the full guide library — 30+ free guides')} →
                </Link>
              </div>

              <div className="border rounded-2xl p-6 grid grid-cols-1 sm:grid-cols-2 gap-6" style={{ backgroundColor: ts.cardBg, borderColor: ts.border }}>
                <QuoteBlock text={t('home.quotes.thich')} author={t('home.quotes.thichAuthor')} />
                <QuoteBlock text={t('home.quotes.anne')} author={t('home.quotes.anneAuthor')} />
              </div>

              <AdSlot label="Ad · 300×250 medium rectangle" tall />
            </div>

            {/* Right sidebar */}
            <div className="flex flex-col gap-5">
              <div className="rounded-2xl p-6 flex flex-col items-center text-center gap-4"
                   style={{ background: ts.cardBg, border: `1px solid ${ts.border}` }}>
                <Icon name="Lotus_png" size={80} alt="Lotus" className="object-contain opacity-90" />
                <div>
                  <p className="t-body font-medium mb-1" style={{ color: ts.textSecondary }}>{t('home.readyToBegin')}</p>
                  <p className="t-caption leading-relaxed" style={{ color: ts.textMuted }}>{t('home.readyDesc')}</p>
                </div>
                <Link
                  to="/breathing"
                  data-tour="begin-session"
                  className="w-full py-3 rounded-xl t-body font-medium transition-colors text-center tracking-wide"
                  style={{ background: ts.btnGradient }}
                >
                  {t('home.beginSessionEmoji')}
                </Link>
              </div>

              {/* Sleep guides */}
              <div className="rounded-2xl overflow-hidden flex flex-col"
                style={{ background: ts.cardBg, border: `1px solid ${ts.border}` }}>

                {/* Header */}
                <div className="px-5 pt-5 pb-3 flex items-center justify-between">
                  <div>
                    <p className="t-body font-semibold tracking-wide" style={{ color: ts.textPrimary }}>
                      {t('home.sleepGuides')}
                    </p>
                    <p className="t-caption mt-0.5" style={{ color: ts.textDim }}>
                      {t('home.scienceBacked')}
                    </p>
                  </div>
                </div>

                {/* Featured card — AI Sleep Story */}
                <Link to="/sleep/story"
                  className="mx-4 mb-3 flex items-center gap-3 px-4 py-3 rounded-xl transition-all hover:opacity-90 hover:scale-[1.01] active:scale-[0.99]"
                  style={{
                    background: `linear-gradient(135deg, ${ts.accent}22, ${ts.accent}08)`,
                    border: `1px solid ${ts.accent}40`,
                  }}>
                  <span className="text-2xl flex-shrink-0">🌙</span>
                  <div className="flex-1 min-w-0">
                    <p className="t-body font-medium leading-snug" style={{ color: ts.accentLight }}>
                      {t('home.aiSleepStory')}
                    </p>
                    <p className="t-caption mt-0.5 truncate" style={{ color: ts.textDim }}>
                      {t('home.aiSleepDesc')}
                    </p>
                  </div>
                  <span className="t-caption flex-shrink-0" style={{ color: ts.accent }}>→</span>
                </Link>

                {/* Divider */}
                <div className="mx-4 mb-2 h-px" style={{ background: ts.border }} />

                {/* Regular guide list */}
                <div className="flex flex-col px-4 pb-4 gap-0.5">
                  {[
                    { icon: '💤', label: t('home.sleepLinks.why'),       sub: t('home.sleepLinks.whySub'),        href: '/sleep/why-sleep-is-important'   },
                    { icon: '😮‍💨', label: t('home.sleepLinks.apnea'),     sub: t('home.sleepLinks.apneaSub'),      href: '/sleep/what-is-sleep-apnea'      },
                    { icon: '🌊', label: t('home.sleepLinks.breathwork'), sub: t('home.sleepLinks.breathworkSub'), href: '/sleep/breathwork-for-deep-sleep' },
                    { icon: '⚡', label: t('home.sleepLinks.slow'),       sub: t('home.sleepLinks.slowSub'),       href: '/science/slow-breathing'         },
                  ].map(({ icon, label, sub, href }) => (
                    <Link key={href} to={href}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all hover:opacity-90 group"
                      style={{ background: 'transparent' }}
                      onMouseEnter={e => (e.currentTarget.style.background = `${ts.border}60`)}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                      <span className="text-base flex-shrink-0 w-6 text-center">{icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className="t-caption font-medium leading-snug truncate" style={{ color: ts.textSecondary }}>
                          {label}
                        </p>
                        <p className="t-caption" style={{ color: ts.textDim, fontSize: '10px' }}>{sub}</p>
                      </div>
                      <span className="t-caption opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" style={{ color: ts.accent }}>→</span>
                    </Link>
                  ))}
                </div>
              </div>

              <AdSlot label="Ad · 300×600 half-page" tall />
            </div>
          </div>
        </RevealSection>

        </main>
        <Footer />
      </div>
    </div>
  );
}