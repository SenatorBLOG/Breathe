import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import NavBar from '../../components/NavBar';
import Footer from '../../components/Footer';
import ThemeBackground from '../../components/ThemeBackground';
import { useThemeStyles } from '../../hooks/useThemeStyles';

export default function SleepApneaPage() {
  const ts = useThemeStyles();

  useEffect(() => {
    document.title = 'What is Sleep Apnea? Symptoms, Causes & Breathing Solutions';
    let desc = document.querySelector('meta[name="description"]');
    if (!desc) { desc = document.createElement('meta'); desc.setAttribute('name', 'description'); document.head.appendChild(desc); }
    desc.setAttribute('content', 'Sleep apnea causes your breathing to stop repeatedly during sleep. Learn the 3 types, warning signs, and how breathing exercises can help.');
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) { canonical = document.createElement('link'); canonical.setAttribute('rel', 'canonical'); document.head.appendChild(canonical); }
    canonical.setAttribute('href', 'https://breatheonline.app/sleep/what-is-sleep-apnea');
  }, []);

  const divider = <div style={{ height: 1, backgroundColor: ts.border + '40' }} />;

  const checks = [
    'Loud snoring',
    'Gasping or choking during sleep (often noticed by a partner)',
    'Waking with a dry mouth or morning headache',
    'Excessive daytime sleepiness — falling asleep at work or while driving',
    'Difficulty concentrating or memory problems',
    'Waking frequently through the night',
    'Mood changes, irritability, or depression',
  ];

  const risks = [
    'Overweight / Obesity', 'Neck circumference > 17" (men) / 15" (women)',
    'Age 40+', 'Male sex',
    'Family history of sleep apnea', 'Smoking',
    'Alcohol or sedative use', 'Chronic nasal congestion',
    'Enlarged tonsils or adenoids', 'Sleeping on your back',
  ];

  const faqs = [
    {
      q: 'What are the main symptoms of sleep apnea?',
      a: 'Loud snoring, gasping during sleep, waking with headaches or dry mouth, excessive daytime sleepiness, and difficulty concentrating.',
    },
    {
      q: 'How is sleep apnea diagnosed?',
      a: 'Through a sleep study (polysomnography) done in a lab or at home. A doctor monitors breathing, oxygen levels, and brain activity overnight.',
    },
    {
      q: 'Can sleep apnea go away on its own?',
      a: 'Mild cases may improve with weight loss or position changes. Moderate to severe OSA typically requires CPAP therapy or surgery.',
    },
    {
      q: 'What is the difference between snoring and sleep apnea?',
      a: 'Snoring is partial airway obstruction. Sleep apnea is complete airway collapse where breathing actually stops for 10+ seconds at a time.',
    },
    {
      q: 'Can breathing exercises reduce sleep apnea?',
      a: "They can't cure it, but studies show oropharyngeal exercises may reduce mild OSA severity. They also help with sleep quality and anxiety.",
    },
  ];

  return (
    <div className="relative flex flex-col min-h-screen font-montserrat">
      <ThemeBackground />

      {/* Schema.org JSON-LD */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'MedicalWebPage',
        name: 'What is Sleep Apnea?',
        description: 'A comprehensive guide to sleep apnea — symptoms, types, causes and how breathing exercises can support treatment.',
        url: 'https://breatheonline.app/sleep/what-is-sleep-apnea',
        about: {
          '@type': 'MedicalCondition',
          name: 'Sleep Apnea',
          alternateName: ['Obstructive Sleep Apnea', 'OSA', 'Sleep Disordered Breathing'],
        },
        mainEntity: faqs.map(({ q, a }) => ({
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
            <span className="t-label tracking-[0.3em] uppercase border px-4 py-1.5 rounded-full w-fit"
              style={{ color: ts.textMuted, borderColor: ts.border }}>
              Sleep Health
            </span>
            <h1 className="text-3xl sm:text-5xl font-light tracking-wide leading-tight" style={{ color: ts.textPrimary }}>
              What is<br />
              <span style={{ color: ts.accent }}>Sleep Apnea?</span>
            </h1>
            <p className="t-body leading-relaxed max-w-xl" style={{ color: ts.textMuted }}>
              Your breathing stops and starts repeatedly while you sleep.
              Over 1 billion people have it — most don't know.
            </p>
          </div>

          {/* Medical disclaimer */}
          <div className="flex items-start gap-2 px-4 py-3 rounded-xl t-caption"
            style={{ background: 'rgba(255,200,50,0.06)', border: '1px solid rgba(255,200,50,0.2)' }}>
            <span className="flex-shrink-0">⚕️</span>
            <p style={{ color: ts.textMuted }}>
              This article is for informational purposes only and does not constitute medical advice.
              If you suspect sleep apnea, consult a healthcare professional.
            </p>
          </div>

          {divider}

          {/* Section 1 — What is it */}
          <div className="flex flex-col gap-3">
            <h2 className="t-heading font-medium" style={{ color: ts.textPrimary }}>
              What exactly happens?
            </h2>
            <p className="t-body leading-relaxed" style={{ color: ts.textMuted }}>
              Sleep apnea is a sleep disorder where breathing repeatedly stops for 10 seconds or longer
              during sleep. Your brain detects falling oxygen levels and briefly wakes you to restart breathing —
              often so briefly you have no memory of it.
            </p>
            <p className="t-body leading-relaxed" style={{ color: ts.textMuted }}>
              These pauses can occur <strong style={{ color: ts.textPrimary }}>5 to 100+ times per hour</strong>.
              Left untreated, the chronic oxygen disruption stresses your heart, brain, and metabolism every
              single night.
            </p>
          </div>

          {divider}

          {/* Section 2 — 3 types */}
          <div className="flex flex-col gap-4">
            <h2 className="t-heading font-medium" style={{ color: ts.textPrimary }}>
              The 3 types of sleep apnea
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                {
                  icon: '😮‍💨',
                  title: 'Obstructive (OSA)',
                  desc: 'Most common. Throat muscles relax and physically block the airway. Affects 9–38% of adults worldwide.',
                },
                {
                  icon: '🧠',
                  title: 'Central (CSA)',
                  desc: "Brain fails to send the correct signals to breathing muscles. Less common — often linked to heart failure or opioid use.",
                },
                {
                  icon: '🔄',
                  title: 'Complex',
                  desc: 'Combination of OSA and CSA, also called treatment-emergent central sleep apnea. Often emerges during CPAP therapy.',
                },
              ].map(({ icon, title, desc }) => (
                <div key={title} className="flex flex-col gap-2 p-4 rounded-2xl"
                  style={{ backgroundColor: ts.cardBg, border: `1px solid ${ts.border}` }}>
                  <span className="text-2xl">{icon}</span>
                  <p className="t-body font-medium" style={{ color: ts.textPrimary }}>{title}</p>
                  <p className="t-caption leading-relaxed" style={{ color: ts.textMuted }}>{desc}</p>
                </div>
              ))}
            </div>
          </div>

          {divider}

          {/* Section 3 — Warning signs */}
          <div className="flex flex-col gap-4">
            <h2 className="t-heading font-medium" style={{ color: ts.textPrimary }}>
              Warning signs to watch for
            </h2>
            <div className="flex flex-col gap-2">
              {checks.map(item => (
                <div key={item} className="flex items-start gap-3 px-4 py-3 rounded-xl"
                  style={{ backgroundColor: ts.cardBg, border: `1px solid ${ts.border}` }}>
                  <span className="t-caption mt-0.5 flex-shrink-0" style={{ color: ts.accent }}>✓</span>
                  <p className="t-body leading-relaxed" style={{ color: ts.textMuted }}>{item}</p>
                </div>
              ))}
            </div>
          </div>

          {divider}

          {/* Section 4 — Risk factors */}
          <div className="flex flex-col gap-4">
            <h2 className="t-heading font-medium" style={{ color: ts.textPrimary }}>
              Risk factors
            </h2>
            <div className="flex flex-wrap gap-2">
              {risks.map(r => (
                <span key={r} className="px-3 py-1.5 rounded-full t-caption"
                  style={{ background: ts.cardBg, border: `1px solid ${ts.border}`, color: ts.textMuted }}>
                  {r}
                </span>
              ))}
            </div>
          </div>

          {divider}

          {/* Section 5 — Health risks */}
          <div className="flex flex-col gap-4">
            <h2 className="t-heading font-medium" style={{ color: ts.textPrimary }}>
              Why it matters — long-term health risks
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                {
                  icon: '❤️',
                  title: 'Cardiovascular',
                  desc: 'Hypertension, irregular heartbeat, coronary artery disease, and 2–3× higher stroke risk.',
                },
                {
                  icon: '🩸',
                  title: 'Metabolic',
                  desc: 'Insulin resistance, type 2 diabetes, and metabolic syndrome — even in lean individuals.',
                },
                {
                  icon: '🧠',
                  title: 'Mental health',
                  desc: 'Anxiety, depression, and accelerated cognitive decline. Often mistaken for ADHD in adults.',
                },
                {
                  icon: '🚗',
                  title: 'Accident risk',
                  desc: 'People with untreated OSA have a 3× higher rate of motor vehicle accidents due to daytime sleepiness.',
                },
              ].map(({ icon, title, desc }) => (
                <div key={title} className="flex gap-3 p-4 rounded-2xl"
                  style={{ backgroundColor: ts.cardBg, border: `1px solid ${ts.border}` }}>
                  <span className="t-heading flex-shrink-0">{icon}</span>
                  <div>
                    <p className="t-body font-medium mb-1" style={{ color: ts.textPrimary }}>{title}</p>
                    <p className="t-caption leading-relaxed" style={{ color: ts.textMuted }}>{desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <p className="t-caption px-1" style={{ color: ts.textMuted }}>
              Source: NIH reports OSA prevalence of 9–38% in adults.
              Untreated OSA is independently associated with cardiovascular morbidity and mortality.
            </p>
          </div>

          {divider}

          {/* Section 6 — Can breathing exercises help */}
          <div className="flex flex-col gap-4">
            <h2 className="t-heading font-medium" style={{ color: ts.textPrimary }}>
              Can breathing exercises help?
            </h2>

            <div className="px-4 py-3 rounded-xl t-caption"
              style={{ background: 'rgba(255,200,50,0.06)', border: '1px solid rgba(255,200,50,0.2)', color: ts.textMuted }}>
              <strong style={{ color: ts.textPrimary }}>Important:</strong> breathing exercises are NOT a cure for sleep apnea.
              If you suspect sleep apnea, see a doctor. CPAP therapy is the gold-standard treatment.
            </div>

            <p className="t-body leading-relaxed" style={{ color: ts.textMuted }}>
              That said, breathing practice can play a meaningful supportive role:
            </p>

            <div className="flex flex-col gap-2">
              {[
                'Strengthening upper airway muscles — reduces mild OSA severity in some patients',
                'Reducing sleep anxiety and stress that worsen overall sleep quality',
                'Training slower, more controlled breathing patterns during waking hours',
                'Improving HRV and parasympathetic tone — your body\'s recovery baseline',
              ].map(item => (
                <div key={item} className="flex items-start gap-3 px-4 py-2.5 rounded-xl"
                  style={{ backgroundColor: ts.cardBg, border: `1px solid ${ts.border}` }}>
                  <span className="t-caption mt-0.5 flex-shrink-0" style={{ color: ts.accent }}>✓</span>
                  <p className="t-body leading-relaxed" style={{ color: ts.textMuted }}>{item}</p>
                </div>
              ))}
            </div>

            <p className="t-caption px-1" style={{ color: ts.textMuted }}>
              Research: Didgeridoo playing, oropharyngeal exercises, and controlled breathing practice
              are associated with reduced snoring and mild-to-moderate OSA severity in peer-reviewed studies.
            </p>

            {/* CTA card */}
            <div className="rounded-2xl p-6 flex flex-col gap-4"
              style={{ background: ts.cardBg, border: `1px solid ${ts.border}` }}>
              <p className="t-body font-medium" style={{ color: ts.textPrimary }}>
                🌙 Try 4-7-8 breathing for better sleep
              </p>
              <p className="t-body leading-relaxed" style={{ color: ts.textMuted }}>
                The extended exhale (8 counts) activates your parasympathetic nervous system,
                slowing your heart rate and helping you enter deeper, more restorative sleep.
              </p>
              <Link to="/breathing/4-7-8"
                className="px-6 py-3 rounded-xl text-white t-body font-medium text-center transition-all hover:opacity-90"
                style={{ background: ts.btnGradient }}>
                Try 4-7-8 Breathing — Free →
              </Link>
            </div>
          </div>

          {divider}

          {/* Section 7 — FAQ */}
          <div className="flex flex-col gap-4">
            <h2 className="t-heading font-medium" style={{ color: ts.textPrimary }}>
              Frequently asked questions
            </h2>
            {faqs.map(({ q, a }) => (
              <div key={q} className="p-4 rounded-2xl"
                style={{ backgroundColor: ts.cardBg, border: `1px solid ${ts.border}` }}>
                <p className="t-body font-medium mb-2" style={{ color: ts.textPrimary }}>{q}</p>
                <p className="t-caption leading-relaxed" style={{ color: ts.textMuted }}>{a}</p>
              </div>
            ))}
          </div>

          {divider}

          {/* Section 8 — Related techniques */}
          <div className="flex flex-col gap-3">
            <p className="t-label tracking-[0.25em] uppercase" style={{ color: ts.textMuted }}>
              Breathing techniques for sleep
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                {
                  icon: '🌙',
                  label: '4-7-8 Breathing',
                  desc: 'Best for sleep anxiety and falling asleep faster',
                  href: '/breathing/4-7-8',
                },
                {
                  icon: '📦',
                  label: 'Box Breathing',
                  desc: 'Reduces stress and trains respiratory control',
                  href: '/breathing/box-breathing',
                },
                {
                  icon: '💨',
                  label: 'Belly Breathing',
                  desc: 'Strengthens diaphragm, improves breathing efficiency',
                  href: '/breathing',
                },
              ].map(({ icon, label, desc, href }) => (
                <Link key={href} to={href}
                  className="flex flex-col gap-2 p-4 rounded-2xl transition-all hover:scale-[1.02]"
                  style={{ backgroundColor: ts.cardBg, border: `1px solid ${ts.border}` }}>
                  <span className="t-heading">{icon}</span>
                  <p className="t-body font-medium" style={{ color: ts.accent }}>{label} →</p>
                  <p className="t-caption leading-relaxed" style={{ color: ts.textMuted }}>{desc}</p>
                </Link>
              ))}
            </div>
          </div>

          {/* Internal link to related sleep guide */}
          <Link to="/sleep/why-sleep-is-important"
            className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all hover:scale-[1.01]"
            style={{ backgroundColor: ts.cardBg, border: `1px solid ${ts.border}` }}>
            <span className="t-heading">💤</span>
            <div>
              <p className="t-body font-medium" style={{ color: ts.accent }}>
                Also read: Why is sleep so important? →
              </p>
              <p className="t-caption" style={{ color: ts.textMuted }}>
                7 science-backed reasons your body needs quality sleep
              </p>
            </div>
          </Link>

        </main>

        <Footer />
      </div>
    </div>
  );
}
