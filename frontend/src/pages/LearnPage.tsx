// src/pages/LearnPage.tsx
//
// Content hub for every guide on the site. Two jobs:
//   1. Users: one place to browse the library (the nav's "Learn" item used to
//      point at /faq, so the guides were effectively unreachable from the nav).
//   2. Crawlers: a single page linking every content route, putting all of
//      them one click from the navigation and cutting crawl depth.
import { Link } from 'react-router-dom';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import ThemeBackground from '../components/ThemeBackground';
import PageSEO from '../components/PageSEO';
import { useThemeStyles } from '../hooks/useThemeStyles';

interface Guide { title: string; desc: string; href: string; icon: string }

const SECTIONS: { heading: string; blurb: string; items: Guide[] }[] = [
  {
    heading: 'Breathing techniques',
    blurb: 'The core patterns — each one with step-by-step instructions and a guided session.',
    items: [
      { icon: '🟦', title: 'Box Breathing (4-4-4-4)', desc: 'Equal counts for focus and calm under pressure. Used by Navy SEALs.', href: '/breathing/box-breathing' },
      { icon: '🌙', title: '4-7-8 Breathing', desc: 'The long-exhale technique for falling asleep faster, naturally.', href: '/breathing/4-7-8' },
      { icon: '🌊', title: 'Coherent Breathing', desc: 'Five in, five out. The gentlest way to raise HRV and lower stress.', href: '/breathing/coherent' },
      { icon: '🌿', title: 'Belly (Diaphragmatic) Breathing', desc: 'The foundation: breathe with your diaphragm, not your chest.', href: '/breathing/belly-breathing' },
      { icon: '💨', title: 'The Physiological Sigh', desc: 'Double inhale, long exhale — the fastest way to calm down.', href: '/breathing/physiological-sigh' },
      { icon: '🔥', title: 'Wim Hof Method', desc: 'Rapid cycles and breath holds for energy and cold tolerance.', href: '/breathing/wim-hof' },
      { icon: '☀️', title: 'Morning Ritual', desc: 'A 3-minute sequence to start the day focused, before coffee.', href: '/breathing/morning-ritual' },
      { icon: '☯️', title: 'Alternate Nostril (Nadi Shodhana)', desc: 'The yogic technique for steadying an agitated mind in five minutes.', href: '/breathing/alternate-nostril' },
      { icon: '👄', title: 'Pursed-Lip Breathing', desc: 'What respiratory therapists teach first for shortness of breath.', href: '/breathing/pursed-lip' },
    ],
  },
  {
    heading: 'Compare & choose',
    blurb: 'Not sure which technique fits? Start here.',
    items: [
      { icon: '⚖️', title: 'Box Breathing vs 4-7-8', desc: 'Equal breath steadies you, long exhale sedates you. Pick the right one.', href: '/breathing/box-vs-4-7-8' },
      { icon: '👃', title: 'Nose vs Mouth Breathing', desc: 'What your nose does that your mouth cannot — and when mouth is fine.', href: '/breathing/nose-vs-mouth' },
      { icon: '🧘', title: 'How to Breathe During Meditation', desc: 'The beginner question: watch the breath, do not manage it.', href: '/breathing/during-meditation' },
      { icon: '📐', title: 'The Buteyko Method', desc: 'Breathe less, not deeper — and an honest look at the evidence.', href: '/breathing/buteyko' },
    ],
  },
  {
    heading: 'For a specific situation',
    blurb: 'When you need something to work right now.',
    items: [
      { icon: '😰', title: 'Breathing for Anxiety', desc: 'Interrupt a panic spiral in 60–90 seconds, no medication needed.', href: '/breathing/anxiety' },
      { icon: '🎤', title: 'Before Public Speaking', desc: 'Steady a shaking voice and calm your hands backstage.', href: '/breathing/public-speaking' },
      { icon: '🎯', title: 'Focus & Concentration', desc: 'A 3-minute routine to start deep work or study without drifting.', href: '/breathing/focus' },
      { icon: '🩺', title: 'High Blood Pressure', desc: 'What the evidence honestly supports — and what it does not.', href: '/breathing/high-blood-pressure' },
      { icon: '🏃', title: 'Breathing While Running', desc: 'Rhythmic 3:2 breathing, nose vs mouth, and killing side stitches.', href: '/breathing/running' },
      { icon: '🧒', title: 'Breathing for Kids', desc: 'Six playful calm-down exercises for children, with safety notes.', href: '/breathing/for-kids' },
      { icon: '🌀', title: 'Racing Thoughts at 3am', desc: 'You cannot out-think overthinking — change the body state instead.', href: '/breathing/racing-thoughts' },
      { icon: '💼', title: 'The 2-Minute Desk Reset', desc: 'Discreet reset between meetings. Nobody can tell you are doing it.', href: '/breathing/desk-reset' },
    ],
  },
  {
    heading: 'The science',
    blurb: 'Why any of this works, in plain language.',
    items: [
      { icon: '⚡', title: 'Why Slow Breathing Calms You', desc: 'The vagus nerve, HRV, and what happens at six breaths a minute.', href: '/science/slow-breathing' },
      { icon: '🐯', title: 'Fight-or-Flight & the False Alarm', desc: 'Why adrenaline fires with no real threat — and how to switch it off.', href: '/science/fight-or-flight' },
      { icon: '🧠', title: 'How to Stimulate the Vagus Nerve', desc: 'What genuinely works — and what the wellness industry oversells.', href: '/science/vagus-nerve' },
      { icon: '⏱️', title: 'Breath Holds & CO₂ Tolerance', desc: 'Why you feel the urge to breathe, and how to train it safely.', href: '/breathing/breath-hold' },
    ],
  },
  {
    heading: 'Sleep',
    blurb: 'Breathing is one of the strongest levers on how you sleep.',
    items: [
      { icon: '😴', title: 'Breathwork for Deep Sleep', desc: 'Activate rest-and-digest so you fall asleep faster and wake less.', href: '/sleep/breathwork-for-deep-sleep' },
      { icon: '💤', title: 'Why Sleep Is So Important', desc: 'Seven science-backed reasons sleep runs everything else.', href: '/sleep/why-sleep-is-important' },
      { icon: '😮‍💨', title: 'What Is Sleep Apnea?', desc: 'Types, warning signs, and where breathing training fits in.', href: '/sleep/what-is-sleep-apnea' },
      { icon: '📖', title: 'AI Sleep Stories', desc: 'A personalized bedtime story, narrated, to drift off to.', href: '/sleep/story' },
    ],
  },
];

export default function LearnPage() {
  const ts = useThemeStyles();
  const allGuides = SECTIONS.flatMap(s => s.items);

  return (
    <div className="relative flex flex-col min-h-screen font-montserrat">
      <PageSEO
        title="Learn — Breathing Guides, Techniques & Science"
        description="Every Breathe guide in one place: breathing techniques step by step, what to use for anxiety, sleep and public speaking, and the science behind why breathwork works."
        canonical="/learn"
      />
      <ThemeBackground />

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: 'Breathing Guides, Techniques & Science',
        url: 'https://breatheonline.app/learn',
        description: 'Every Breathe guide in one place: techniques, situational advice, sleep, and the science of breathwork.',
        hasPart: allGuides.map(g => ({
          '@type': 'Article',
          headline: g.title,
          url: `https://breatheonline.app${g.href}`,
        })),
      }) }} />

      <div className="relative z-10 flex flex-col min-h-screen">
        <NavBar />
        <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-12 flex flex-col gap-12">

          {/* Hero */}
          <div className="flex flex-col gap-3">
            <span className="t-label tracking-[0.3em] uppercase border px-4 py-1.5 rounded-full w-fit"
              style={{ color: ts.textMuted, borderColor: ts.border }}>
              Guide Library
            </span>
            <h1 className="text-3xl sm:text-5xl font-light tracking-wide leading-tight" style={{ color: ts.textPrimary }}>
              Learn to breathe<br />
              <span style={{ color: ts.accent }}>on purpose</span>
            </h1>
            <p className="t-body leading-relaxed max-w-xl" style={{ color: ts.textMuted }}>
              {allGuides.length} free guides — the techniques, what to reach for in a given moment
              (anxiety, focus, running, kids), and the science underneath. No account needed for any
              of it.
            </p>
            <Link to="/breathing"
              className="flex items-center gap-2 px-8 py-3.5 rounded-full text-white font-medium w-fit transition-all hover:scale-105"
              style={{ background: ts.btnGradient, boxShadow: ts.btnShadow }}>
              🌬 Skip the reading — just breathe
            </Link>
          </div>

          {/* Sections */}
          {SECTIONS.map(section => (
            <section key={section.heading} className="flex flex-col gap-4">
              <div>
                <h2 className="t-heading font-medium" style={{ color: ts.textPrimary }}>
                  {section.heading}
                </h2>
                <p className="t-caption mt-1" style={{ color: ts.textMuted }}>
                  {section.blurb}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {section.items.map(g => (
                  <Link key={g.href} to={g.href}
                    className="flex gap-3 p-4 rounded-2xl transition-all hover:scale-[1.02] group"
                    style={{ backgroundColor: ts.cardBg, border: `1px solid ${ts.border}` }}>
                    <span className="t-heading flex-shrink-0">{g.icon}</span>
                    <div className="min-w-0">
                      <p className="t-body font-medium mb-1" style={{ color: ts.textPrimary }}>
                        {g.title}
                      </p>
                      <p className="t-caption leading-relaxed" style={{ color: ts.textMuted }}>
                        {g.desc}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          ))}

          {/* Footer CTA */}
          <div className="flex flex-col items-center gap-4 py-8 rounded-3xl px-6 text-center"
            style={{ backgroundColor: ts.cardBg, border: `1px solid ${ts.border}` }}>
            <p className="t-heading font-light" style={{ color: ts.textPrimary }}>
              Still have a question?
            </p>
            <p className="t-body max-w-sm" style={{ color: ts.textMuted }}>
              The FAQ covers the practical stuff — safety, how often to practise, and what to do if
              you feel lightheaded.
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              <Link to="/faq" className="px-6 py-3 rounded-full t-caption transition-all"
                style={{ color: ts.accent, border: `1px solid ${ts.border}` }}>
                Read the FAQ →
              </Link>
              <Link to="/support" className="px-6 py-3 rounded-full t-caption transition-all"
                style={{ color: ts.accent, border: `1px solid ${ts.border}` }}>
                Ask us directly →
              </Link>
            </div>
          </div>

        </main>
        <Footer />
      </div>
    </div>
  );
}
