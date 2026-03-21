import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import NavBar from '../../components/NavBar';
import Footer from '../../components/Footer';
import ThemeBackground from '../../components/ThemeBackground';
import { useThemeStyles } from '../../hooks/useThemeStyles';

const REASONS = [
  {
    icon: '🧠',
    title: 'Memory Consolidation',
    body: "During deep sleep and REM, your brain transfers short-term memories to long-term storage. Studies show sleep deprivation impairs both declarative memory (facts) and procedural memory (skills) by up to 40%. Without adequate sleep, new information simply doesn't stick.",
  },
  {
    icon: '❤️',
    title: 'Heart Health',
    body: "Sleeping under 6 hours per night doubles the risk of heart disease. During sleep, blood pressure drops 10–20% — known as nocturnal dipping. Skipping this nightly recovery phase stresses cardiovascular tissue over months and years.",
  },
  {
    icon: '🛡️',
    title: 'Immune System',
    body: 'Your body produces cytokines — immune proteins that fight infection — primarily during sleep. Even one night of poor sleep reduces natural killer cell activity by 70%. That\'s why you always seem to get sick after a hard week.',
  },
  {
    icon: '⚖️',
    title: 'Metabolism & Weight',
    body: "Sleep deprivation raises ghrelin (hunger hormone) and lowers leptin (satiety hormone), increasing appetite by ~24%. Poor sleepers are 55% more likely to become obese over time, independent of diet and exercise habits.",
  },
  {
    icon: '😊',
    title: 'Mood & Mental Health',
    body: "The amygdala — your brain's emotional alarm — becomes 60% more reactive after just one night of poor sleep. Chronic poor sleep is strongly linked to anxiety, depression, and emotional dysregulation, often before any other symptoms appear.",
  },
  {
    icon: '⚡',
    title: 'Energy & Performance',
    body: 'Reaction time, decision making, and physical performance all degrade within 17–19 hours of wakefulness — equivalent to a 0.05% blood alcohol level (legally impaired in most countries). Most people dramatically underestimate their impairment.',
  },
  {
    icon: '🔬',
    title: 'Cellular Repair & Longevity',
    body: 'Growth hormone is released almost exclusively during deep sleep. It repairs muscle tissue, synthesises proteins, and supports cellular cleanup (autophagy). Chronic short sleepers have measurably shorter telomeres — a direct marker of biological aging.',
  },
];

const FAQS = [
  {
    q: 'Why is sleep important for the brain?',
    a: 'During sleep, the brain consolidates memories, clears metabolic waste via the glymphatic system, and resets emotional regulation. One night of poor sleep reduces cognitive performance equivalent to legal blood-alcohol impairment.',
  },
  {
    q: "What happens if you don't get enough sleep?",
    a: 'Short-term: impaired memory, poor mood, reduced reaction time. Long-term: increased risk of heart disease, obesity, type 2 diabetes, depression, and cognitive decline.',
  },
  {
    q: 'How many hours of sleep does an adult need?',
    a: 'The CDC and WHO recommend 7–9 hours per night for adults aged 18–64. Consistently sleeping under 6 hours is linked to significantly higher health risks.',
  },
  {
    q: 'Does sleep quality matter as much as sleep quantity?',
    a: 'Yes. Deep NREM sleep and REM sleep must make up sufficient proportions of your total sleep. Alcohol and some medications reduce REM sleep even if total hours are maintained.',
  },
  {
    q: 'Can breathing exercises improve sleep?',
    a: 'Yes. Techniques like 4-7-8 breathing activate the parasympathetic nervous system, reduce cortisol, and lower heart rate — creating the physiological conditions needed for sleep onset.',
  },
];

export default function WhySleepPage() {
  const ts = useThemeStyles();
  const [openCard, setOpenCard] = useState<number | null>(null);

  useEffect(() => {
    document.title = 'Why is Sleep So Important? 7 Science-Backed Reasons';
    let desc = document.querySelector('meta[name="description"]');
    if (!desc) { desc = document.createElement('meta'); desc.setAttribute('name', 'description'); document.head.appendChild(desc); }
    desc.setAttribute('content', 'Sleep affects your brain, heart, immune system, mood and metabolism. Here\'s exactly why sleep is critical — and what you can do tonight to sleep better.');
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) { canonical = document.createElement('link'); canonical.setAttribute('rel', 'canonical'); document.head.appendChild(canonical); }
    canonical.setAttribute('href', 'https://breatheonline.app/sleep/why-sleep-is-important');
  }, []);

  const divider = <div style={{ height: 1, backgroundColor: ts.border + '40' }} />;

  return (
    <div className="relative flex flex-col min-h-screen font-montserrat">
      <ThemeBackground />

      {/* Schema.org JSON-LD */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: 'Why is Sleep So Important? 7 Science-Backed Reasons',
        description: 'Sleep affects memory, heart health, immune function, mood and metabolism. Learn exactly why sleep is critical and how to improve it tonight.',
        url: 'https://breatheonline.app/sleep/why-sleep-is-important',
        author: { '@type': 'Organization', name: 'Breathe' },
        publisher: { '@type': 'Organization', name: 'Breathe', url: 'https://breatheonline.app' },
        mainEntity: FAQS.map(({ q, a }) => ({
          '@type': 'Question',
          name: q,
          acceptedAnswer: { '@type': 'Answer', text: a },
        })),
      }) }} />

      <div className="relative z-10 flex flex-col min-h-screen">
        <NavBar />

        <main className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 py-12 flex flex-col gap-10">

          {/* Hero */}
          <div className="flex flex-col gap-3">
            <span className="text-[10px] tracking-[0.3em] uppercase border px-4 py-1.5 rounded-full w-fit"
              style={{ color: ts.textMuted, borderColor: ts.border }}>
              Sleep Science
            </span>
            <h1 className="text-3xl sm:text-5xl font-light tracking-wide leading-tight" style={{ color: ts.textPrimary }}>
              Why is Sleep<br />
              <span style={{ color: ts.accent }}>So Important?</span>
            </h1>
            <p className="text-base leading-relaxed max-w-xl" style={{ color: ts.textMuted }}>
              You spend a third of your life asleep — and every minute matters.
              Here's what's actually happening in your body while you rest.
            </p>
          </div>

          {/* Stat strip */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: '🕐', value: '7–9 hrs', label: 'recommended for adults (WHO)' },
              { icon: '🧠', value: '23%',     label: 'cognitive decline risk from chronic sleep loss' },
              { icon: '❤️', value: '2×',      label: 'higher heart disease risk with <6hrs/night' },
            ].map(({ icon, value, label }) => (
              <div key={label} className="flex flex-col gap-1 p-4 rounded-2xl text-center"
                style={{ backgroundColor: ts.cardBg, border: `1px solid ${ts.border}` }}>
                <span className="text-lg">{icon}</span>
                <p className="text-xl font-bold" style={{ color: ts.textPrimary }}>{value}</p>
                <p className="text-[10px] leading-tight" style={{ color: ts.textMuted }}>{label}</p>
              </div>
            ))}
          </div>

          {divider}

          {/* Section 1 — What happens when you sleep */}
          <div className="flex flex-col gap-4">
            <h2 className="text-lg font-medium" style={{ color: ts.textPrimary }}>
              What actually happens when you sleep
            </h2>
            <p className="text-sm leading-relaxed" style={{ color: ts.textMuted }}>
              Sleep is not passive downtime. Your brain and body are working harder during sleep
              than during many waking activities — clearing toxins, repairing tissue, and encoding
              everything you learned that day.
            </p>

            {/* Sleep cycle visual */}
            <div className="flex flex-col gap-2">
              <div className="flex rounded-xl overflow-hidden h-8">
                <div className="flex items-center justify-center text-[9px] font-medium"
                  style={{ width: '10%', background: ts.textDim, color: ts.textPrimary }}>
                  N1
                </div>
                <div className="flex items-center justify-center text-[9px] font-medium"
                  style={{ width: '25%', background: ts.border, color: ts.textPrimary }}>
                  N2
                </div>
                <div className="flex items-center justify-center text-[9px] font-medium"
                  style={{ width: '40%', background: ts.accent, color: '#fff' }}>
                  N3 Deep
                </div>
                <div className="flex items-center justify-center text-[9px] font-medium"
                  style={{ width: '25%', background: ts.accentLight, color: '#fff' }}>
                  REM
                </div>
              </div>
              <div className="flex text-[9px]" style={{ color: ts.textMuted }}>
                <div style={{ width: '10%' }}>Light</div>
                <div style={{ width: '25%' }}>Spindles</div>
                <div style={{ width: '40%' }}>Restoration</div>
                <div style={{ width: '25%' }}>Memory + Dreams</div>
              </div>
              <p className="text-xs" style={{ color: ts.textMuted }}>
                A typical sleep cycle lasts 90 minutes. You go through 4–6 cycles per night.
              </p>
            </div>
          </div>

          {divider}

          {/* Section 2 — 7 reasons accordion */}
          <div className="flex flex-col gap-3">
            <h2 className="text-lg font-medium" style={{ color: ts.textPrimary }}>
              7 reasons sleep is critical
            </h2>
            {REASONS.map(({ icon, title, body }, i) => {
              const isOpen = openCard === i;
              return (
                <button
                  key={title}
                  onClick={() => setOpenCard(isOpen ? null : i)}
                  className="text-left w-full rounded-2xl transition-all"
                  style={{
                    backgroundColor: ts.cardBg,
                    border: `1px solid ${isOpen ? ts.borderHover : ts.border}`,
                  }}
                >
                  <div className="flex items-center gap-3 px-4 py-4">
                    <span className="text-xl flex-shrink-0">{icon}</span>
                    <p className="text-sm font-medium flex-1" style={{ color: ts.textPrimary }}>
                      {i + 1}. {title}
                    </p>
                    <span className="text-xs flex-shrink-0 transition-transform"
                      style={{
                        color: ts.textMuted,
                        transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                        display: 'inline-block',
                      }}>
                      ▾
                    </span>
                  </div>
                  {isOpen && (
                    <div className="px-4 pb-4">
                      <p className="text-xs leading-relaxed" style={{ color: ts.textMuted }}>{body}</p>
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {divider}

          {/* Section 3 — How much sleep */}
          <div className="flex flex-col gap-4">
            <h2 className="text-lg font-medium" style={{ color: ts.textPrimary }}>
              How much sleep do you actually need?
            </h2>
            <div className="rounded-2xl overflow-hidden" style={{ border: `1px solid ${ts.border}` }}>
              {[
                { group: 'Newborns (0–3 months)',      hours: '14–17 hrs' },
                { group: 'School-age children (6–13)', hours: '9–11 hrs' },
                { group: 'Teenagers (14–17)',           hours: '8–10 hrs' },
                { group: 'Adults (18–64)',              hours: '7–9 hrs' },
                { group: 'Older adults (65+)',          hours: '7–8 hrs' },
              ].map(({ group, hours }, i) => (
                <div key={group} className="flex items-center justify-between px-4 py-3"
                  style={{
                    backgroundColor: i % 2 === 0 ? ts.cardBg : ts.cardBgHover,
                    borderBottom: i < 4 ? `1px solid ${ts.border}` : 'none',
                  }}>
                  <p className="text-sm" style={{ color: ts.textMuted }}>{group}</p>
                  <p className="text-sm font-semibold" style={{ color: ts.textPrimary }}>{hours}</p>
                </div>
              ))}
            </div>
            <p className="text-xs px-1" style={{ color: ts.textMuted }}>
              Quality matters as much as quantity — 7 hours of deep, uninterrupted sleep
              is better than 9 hours of fragmented sleep.
            </p>
          </div>

          {divider}

          {/* Section 4 — Signs you're not getting enough */}
          <div className="flex flex-col gap-4">
            <h2 className="text-lg font-medium" style={{ color: ts.textPrimary }}>
              Signs you're not getting enough
            </h2>
            <div className="flex flex-col gap-2">
              {[
                'You need an alarm to wake up',
                'You fall asleep within 5 minutes of lying down',
                'You feel groggy for more than 20 minutes after waking',
                "You can't focus without caffeine before noon",
                'You doze off easily during the day',
                'You sleep significantly more on weekends (social jetlag)',
              ].map(item => (
                <div key={item} className="flex items-start gap-3 px-4 py-3 rounded-xl"
                  style={{ backgroundColor: ts.cardBg, border: `1px solid ${ts.border}` }}>
                  <span className="text-xs mt-0.5 flex-shrink-0" style={{ color: '#F87171' }}>✗</span>
                  <p className="text-sm" style={{ color: ts.textMuted }}>{item}</p>
                </div>
              ))}
            </div>
          </div>

          {divider}

          {/* Section 5 — What kills sleep quality */}
          <div className="flex flex-col gap-4">
            <h2 className="text-lg font-medium" style={{ color: ts.textPrimary }}>
              What kills sleep quality
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-3 p-4 rounded-2xl"
                style={{ backgroundColor: ts.cardBg, border: `1px solid ${ts.border}` }}>
                <p className="text-sm font-medium" style={{ color: ts.textPrimary }}>Biological factors</p>
                {[
                  'Stress and high cortisol levels',
                  'Irregular sleep schedule',
                  'Blue light — suppresses melatonin',
                  'Caffeine after 2pm (half-life 5–7 hours)',
                  'Alcohol (fragments REM sleep)',
                ].map(item => (
                  <div key={item} className="flex items-start gap-2">
                    <span className="text-[10px] mt-1 flex-shrink-0" style={{ color: ts.accent }}>▸</span>
                    <p className="text-xs leading-relaxed" style={{ color: ts.textMuted }}>{item}</p>
                  </div>
                ))}
              </div>
              <div className="flex flex-col gap-3 p-4 rounded-2xl"
                style={{ backgroundColor: ts.cardBg, border: `1px solid ${ts.border}` }}>
                <p className="text-sm font-medium" style={{ color: ts.textPrimary }}>Environmental factors</p>
                {[
                  'Room temperature above 19°C (67°F)',
                  'Noise and light pollution',
                  'Inconsistent bedtime',
                  'Late meals (within 2 hours of bed)',
                  'Lack of physical activity',
                ].map(item => (
                  <div key={item} className="flex items-start gap-2">
                    <span className="text-[10px] mt-1 flex-shrink-0" style={{ color: ts.accent }}>▸</span>
                    <p className="text-xs leading-relaxed" style={{ color: ts.textMuted }}>{item}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {divider}

          {/* Section 6 — How breathing helps */}
          <div className="flex flex-col gap-5 p-6 rounded-2xl"
            style={{ background: ts.cardBg, border: `1px solid ${ts.borderHover}` }}>
            <h2 className="text-lg font-medium" style={{ color: ts.textPrimary }}>
              🌙 Better breathing = better sleep
            </h2>
            <p className="text-sm leading-relaxed" style={{ color: ts.textMuted }}>
              Slow, controlled breathing before bed activates your parasympathetic nervous system —
              the biological "rest and digest" mode. This lowers cortisol, drops heart rate, and
              shifts your body into the state it needs to fall and stay asleep.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                {
                  icon: '🌙',
                  name: '4-7-8 Breathing',
                  desc: 'Long exhale activates the vagus nerve. Most effective for sleep onset.',
                  href: '/breathing/4-7-8',
                },
                {
                  icon: '📦',
                  name: 'Box Breathing',
                  desc: 'Reduces cortisol and calms racing thoughts before bed.',
                  href: '/breathing/box-breathing',
                },
                {
                  icon: '🌀',
                  name: 'Belly Breathing',
                  desc: 'Strengthens diaphragm and triggers the relaxation response.',
                  href: '/breathing',
                },
              ].map(({ icon, name, desc, href }) => (
                <Link to={href} key={name}
                  className="flex flex-col gap-2 p-4 rounded-xl transition-all hover:scale-[1.02]"
                  style={{ background: ts.cardBgHover, border: `1px solid ${ts.border}` }}>
                  <span className="text-2xl">{icon}</span>
                  <p className="text-sm font-medium" style={{ color: ts.textPrimary }}>{name}</p>
                  <p className="text-xs leading-relaxed" style={{ color: ts.textMuted }}>{desc}</p>
                </Link>
              ))}
            </div>
            <Link to="/breathing"
              className="self-center px-8 py-3 rounded-full text-white text-sm font-medium transition-all hover:scale-105"
              style={{ background: ts.btnGradient, boxShadow: ts.btnShadow }}>
              Start a free sleep session →
            </Link>
          </div>

          {divider}

          {/* Section 7 — FAQ */}
          <div className="flex flex-col gap-4">
            <h2 className="text-lg font-medium" style={{ color: ts.textPrimary }}>
              Frequently asked questions
            </h2>
            {FAQS.map(({ q, a }) => (
              <div key={q} className="p-4 rounded-2xl"
                style={{ backgroundColor: ts.cardBg, border: `1px solid ${ts.border}` }}>
                <p className="text-sm font-medium mb-2" style={{ color: ts.textPrimary }}>{q}</p>
                <p className="text-xs leading-relaxed" style={{ color: ts.textMuted }}>{a}</p>
              </div>
            ))}
          </div>

          {divider}

          {/* Related sleep guides */}
          <div className="flex flex-col gap-3">
            <p className="text-[10px] tracking-[0.25em] uppercase" style={{ color: ts.textMuted }}>
              More sleep guides
            </p>
            <Link to="/sleep/what-is-sleep-apnea"
              className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all hover:scale-[1.01]"
              style={{ backgroundColor: ts.cardBg, border: `1px solid ${ts.border}` }}>
              <span className="text-xl">😮‍💨</span>
              <div>
                <p className="text-sm font-medium" style={{ color: ts.accent }}>
                  What is Sleep Apnea? →
                </p>
                <p className="text-xs" style={{ color: ts.textMuted }}>
                  Symptoms, types, and how breathing exercises can help
                </p>
              </div>
            </Link>
          </div>

        </main>

        <Footer />
      </div>
    </div>
  );
}
