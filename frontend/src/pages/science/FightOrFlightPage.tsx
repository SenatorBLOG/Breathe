// src/pages/science/FightOrFlightPage.tsx
import { Link } from 'react-router-dom';
import NavBar from '../../components/NavBar';
import Footer from '../../components/Footer';
import ThemeBackground from '../../components/ThemeBackground';
import PageSEO from '../../components/PageSEO';
import { useThemeStyles } from '../../hooks/useThemeStyles';

const FAQS = [
  {
    q: 'Why do I feel anxious for no reason?',
    a: "Your fight-or-flight system can fire without a real threat. The brain's alarm center (the amygdala) can't always tell the difference between a physical danger and a stressful thought — so a looming deadline or an unread message can trigger the same adrenaline surge as a genuine emergency. The feeling is real; the threat often isn't.",
  },
  {
    q: 'Why does anxiety make me feel sick or nauseous?',
    a: 'Adrenaline shuts down digestion almost instantly — when your body thinks it needs to run or fight, processing food is the last priority. Blood is pulled away from the gut toward the large muscles. That sudden shift is what produces nausea, a churning stomach, or loss of appetite during anxiety.',
  },
  {
    q: 'How does breathing calm the fight-or-flight response?',
    a: 'Breathing is the one part of the autonomic nervous system you can control by hand. A slow exhale that is longer than your inhale stimulates the vagus nerve, which signals the brain that you are safe. That switches you from sympathetic (stress) to parasympathetic (calm) — lowering heart rate within a few breaths.',
  },
  {
    q: 'How long does an adrenaline surge last?',
    a: 'Once triggered, an adrenaline surge with no real threat to feed it usually peaks and begins to fade within about 20 minutes. Slowing your breath or moving your body speeds that up — a long exhale presses the nervous-system brake, and movement burns the adrenaline the way it was designed to be used.',
  },
];

export default function FightOrFlightPage() {
  const ts = useThemeStyles();
  const divider = <div style={{ height: 1, backgroundColor: ts.border + '40' }} />;

  return (
    <div className="relative flex flex-col min-h-screen font-montserrat">
      <PageSEO
        title="Fight-or-Flight: Why Your Body Sounds False Alarms"
        description="Racing heart, shaking hands, nausea, restless legs — that's adrenaline. Learn why your fight-or-flight system fires without a real threat, and how one long exhale switches it off."
        canonical="/science/fight-or-flight"
      />
      <ThemeBackground />

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: 'Fight-or-Flight: Why Your Body Sounds False Alarms',
        description: 'The science of adrenaline, the fight-or-flight response, and how slow breathing switches your nervous system from stress back to calm.',
        url: 'https://breatheonline.app/science/fight-or-flight',
        author: { '@type': 'Organization', name: 'Breathe' },
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
            <span className="t-label tracking-[0.3em] uppercase border px-4 py-1.5 rounded-full w-fit"
              style={{ color: ts.textMuted, borderColor: ts.border }}>
              Breathing Science
            </span>
            <h1 className="text-3xl sm:text-5xl font-light tracking-wide leading-tight" style={{ color: ts.textPrimary }}>
              Fight-or-Flight<br />
              <span style={{ color: ts.accent }}>and the False Alarm</span>
            </h1>
            <p className="t-body leading-relaxed max-w-xl" style={{ color: ts.textMuted }}>
              Pounding heart, shaking hands, a stomach that won't settle, legs that won't keep
              still — it feels like something is deeply wrong. Usually nothing is. It's one
              ancient chemical doing exactly what it was built to do, just at the wrong moment.
              Here's how it works, and how to switch it off.
            </p>
          </div>

          {divider}

          {/* Section 1 — Adrenaline */}
          <div className="flex flex-col gap-4">
            <h2 className="t-heading font-medium" style={{ color: ts.textPrimary }}>
              Adrenaline: your oldest engine
            </h2>
            <p className="t-body leading-relaxed" style={{ color: ts.textMuted }}>
              Adrenaline (epinephrine) is a hormone your adrenal glands dump into your
              bloodstream in a fraction of a second the moment your brain decides:
              <em> danger — get ready to act</em>. The system is called <strong>fight-or-flight</strong>,
              it's millions of years old, and it is older than humanity itself. It is not a
              malfunction. It is survival hardware.
            </p>
            <p className="t-body leading-relaxed" style={{ color: ts.textMuted }}>
              Look at what it does to the body — you'll recognise every symptom of a panic
              spike, because they are the same thing:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-1">
              {[
                { icon: '💓', title: 'Pounding heart', desc: 'Pumps blood to the muscles so you can run or fight. That racing pulse is fuel delivery.' },
                { icon: '🤲', title: 'Shaking, sweating hands', desc: 'Blood pulls away from skin and hands toward the large leg muscles; the fine tremor is muscles held on standby.' },
                { icon: '🤢', title: 'Nausea, churning gut', desc: 'Digestion shuts off instantly — fleeing a tiger is no time to process lunch. Blood leaves the stomach.' },
                { icon: '🦵', title: "Legs that won't sit still", desc: 'The body is demanding movement. Adrenaline exists to be spent — lying still with it feels like torture.' },
                { icon: '👁️', title: 'Racing, scanning thoughts', desc: 'The brain flips into threat mode, hunting the environment for the danger it believes is there.' },
                { icon: '😮‍💨', title: 'Fast, shallow breath', desc: 'Quick breathing loads oxygen for action — but it also signals "danger" back to the brain, feeding the loop.' },
              ].map(({ icon, title, desc }) => (
                <div key={title} className="flex gap-3 p-4 rounded-2xl"
                  style={{ backgroundColor: ts.cardBg, border: `1px solid ${ts.border}` }}>
                  <span className="t-heading flex-shrink-0">{icon}</span>
                  <div>
                    <p className="t-caption font-medium mb-1" style={{ color: ts.textPrimary }}>{title}</p>
                    <p className="t-caption leading-relaxed" style={{ color: ts.textMuted }}>{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {divider}

          {/* Section 2 — The false alarm */}
          <div className="flex flex-col gap-4">
            <h2 className="t-heading font-medium" style={{ color: ts.textPrimary }}>
              When the engine misfires
            </h2>
            <p className="t-body leading-relaxed" style={{ color: ts.textMuted }}>
              Adrenaline is brilliant when there's a <strong>real, physical threat</strong> — a
              car, a fall, something to jump away from. You move, the adrenaline gets burned
              doing its job, the threat passes, the system shuts off. Clean.
            </p>
            <p className="t-body leading-relaxed" style={{ color: ts.textMuted }}>
              The trouble is that in modern life it fires without any tiger in the room. Your
              brain's alarm center — the amygdala — <strong>cannot tell the difference between a
              real tiger and a stressful thought</strong>. "I have to send that email," "I saw
              that message," "what if it goes wrong" — the amygdala reads the thought as a
              threat and presses the same button. The body floods with a hormone built for
              sprinting, while you sit perfectly still.
            </p>
            <p className="t-body leading-relaxed" style={{ color: ts.textMuted }}>
              Adrenaline is <em>gloriously stupid</em>: it never checks whether the danger is a
              predator, a deadline, or a passing worry. The brain said "threat," so it
              delivered. The whole problem lives in that one false signal — not in the
              adrenaline, and not in you.
            </p>
          </div>

          {divider}

          {/* Section 3 — The brake */}
          <div className="flex flex-col gap-4">
            <h2 className="t-heading font-medium" style={{ color: ts.textPrimary }}>
              The brake you didn't know you had
            </h2>
            <p className="t-body leading-relaxed" style={{ color: ts.textMuted }}>
              The autonomic nervous system — the part that runs your heart, lungs and digestion
              without your input — has two pedals:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-5 rounded-2xl flex flex-col gap-2"
                style={{ backgroundColor: ts.cardBg, border: `1px solid ${ts.border}` }}>
                <p className="t-body font-medium" style={{ color: ts.textPrimary }}>⚡ Sympathetic — the gas</p>
                <p className="t-caption leading-relaxed" style={{ color: ts.textMuted }}>
                  Fight-or-flight. Adrenaline, acceleration, alertness, anxiety. The pedal that's
                  jammed to the floor when you're spiralling.
                </p>
              </div>
              <div className="p-5 rounded-2xl flex flex-col gap-2"
                style={{ backgroundColor: ts.cardBg, border: `1px solid ${ts.border}` }}>
                <p className="t-body font-medium" style={{ color: ts.textPrimary }}>🌿 Parasympathetic — the brake</p>
                <p className="t-caption leading-relaxed" style={{ color: ts.textMuted }}>
                  Rest-and-digest. Slows the heart, switches digestion back on, releases the
                  muscles. The pedal that's hard to reach mid-panic.
                </p>
              </div>
            </div>
            <p className="t-body leading-relaxed" style={{ color: ts.textMuted }}>
              In a balanced state these two trade off like a seesaw. In anxiety, the gas is
              stuck down and the brake won't press. You can't simply <em>order</em> your heart to
              slow down — it's automatic. But there is one crossroads organ you can reach by
              hand.
            </p>
          </div>

          {divider}

          {/* Section 4 — Breath as the override */}
          <div className="flex flex-col gap-4">
            <h2 className="t-heading font-medium" style={{ color: ts.textPrimary }}>
              Your manual override: the breath
            </h2>
            <p className="t-body leading-relaxed" style={{ color: ts.textMuted }}>
              Breathing is unique. It's both automatic (you do it without thinking) and
              voluntary (you can change it at will). That makes it the single direct handle on
              the parasympathetic brake.
            </p>
            <p className="t-body leading-relaxed" style={{ color: ts.textMuted }}>
              <strong>A long exhale is pressing the brake.</strong> When your out-breath is
              slower than your in-breath, the vagus nerve carries a message to the brain:
              <em> no danger here, we're safe, you can stand down</em>. The parasympathetic system
              switches on, the pulse drops, the nausea loosens, the tremor fades. This is why a
              4-second inhale and an 8-second exhale can settle a racing body in a couple of
              breaths.
            </p>
            <p className="t-body leading-relaxed" style={{ color: ts.textMuted }}>
              <strong>And movement burns the gas.</strong> The other release valve is to let the
              adrenaline do what it was dumped into your blood to do: move. A brisk walk spends
              it, and the system rebalances. Breath presses the brake; movement empties the
              tank. Use either, or both.
            </p>
          </div>

          {divider}

          {/* Section 5 — The skill */}
          <div className="flex flex-col gap-4">
            <h2 className="t-heading font-medium" style={{ color: ts.textPrimary }}>
              The one question that breaks the spell
            </h2>
            <p className="t-body leading-relaxed" style={{ color: ts.textMuted }}>
              Here's the skill worth keeping. When the body sends its signal —
              <em> scared, sick, can't cope, danger</em> — ask yourself one thing:
            </p>
            <div className="p-6 rounded-3xl text-center"
              style={{ backgroundColor: ts.cardBg, border: `1px solid ${ts.border}` }}>
              <p className="t-heading font-light" style={{ color: ts.accent }}>
                "Where's the tiger?"
              </p>
            </div>
            <ul className="flex flex-col gap-2">
              <li className="t-body leading-relaxed" style={{ color: ts.textMuted }}>
                <strong style={{ color: ts.textPrimary }}>There's a real threat right now</strong>
                {' '}(a car, a genuine emergency)? The adrenaline is true. Listen to it. Act.
              </li>
              <li className="t-body leading-relaxed" style={{ color: ts.textMuted }}>
                <strong style={{ color: ts.textPrimary }}>No tiger, but the body is panicking</strong>
                {' '}(a deadline, an unread message, a worry)? It's a <em>false alarm</em>. The
                adrenaline is real — the threat is invented. The body is lying.
              </li>
            </ul>
            <p className="t-body leading-relaxed" style={{ color: ts.textMuted }}>
              Naming it strips its power. The moment you recognise "this is just adrenaline on a
              false signal — there's no tiger," you stop obeying the panic. The sensation may
              linger, but you no longer believe it. You breathe, you wait, and within twenty
              minutes it drains on its own — because with no real tiger to feed it, the
              adrenaline has nothing left to burn.
            </p>
          </div>

          {/* CTA */}
          <div className="flex flex-col items-center gap-4 py-8 rounded-3xl px-6 text-center"
            style={{ backgroundColor: ts.cardBg, border: `1px solid ${ts.border}` }}>
            <p className="t-heading font-light" style={{ color: ts.textPrimary }}>
              Feel it happening right now?
            </p>
            <p className="t-body max-w-sm" style={{ color: ts.textMuted }}>
              Press the brake. One guided round of slow breathing — long exhales — and your
              nervous system starts to stand down within a minute.
            </p>
            <Link to="/breathing"
              className="px-10 py-4 rounded-full text-white font-medium transition-all hover:shadow-[0_0_28px_rgba(58,130,247,0.45)] hover:scale-105"
              style={{ background: ts.btnGradient }}>
              🌬 Start breathing — free
            </Link>
            <p className="t-caption" style={{ color: ts.textMuted }}>
              No account · No download · Works in 60 seconds
            </p>
          </div>

          {/* Medical disclaimer */}
          <p className="t-caption leading-relaxed text-center max-w-xl mx-auto" style={{ color: ts.textMuted, opacity: 0.8 }}>
            This article is for general education and isn't medical advice. If anxiety, panic, or
            physical symptoms are frequent, severe, or interfering with your life, please talk to
            a doctor or mental-health professional. Breathing techniques complement care — they
            don't replace it.
          </p>

          {divider}

          {/* FAQ */}
          <div className="flex flex-col gap-3">
            <h2 className="t-heading font-medium" style={{ color: ts.textPrimary }}>
              Common questions
            </h2>
            {FAQS.map(({ q, a }) => (
              <div key={q} className="p-5 rounded-2xl flex flex-col gap-2"
                style={{ backgroundColor: ts.cardBg, border: `1px solid ${ts.border}` }}>
                <p className="t-body font-medium" style={{ color: ts.textPrimary }}>{q}</p>
                <p className="t-caption leading-relaxed" style={{ color: ts.textMuted }}>{a}</p>
              </div>
            ))}
          </div>

          {/* Related */}
          <div className="flex flex-col gap-3">
            <p className="t-label tracking-[0.25em] uppercase" style={{ color: ts.textMuted }}>
              Keep reading
            </p>
            <div className="flex flex-wrap gap-2">
              {[
                { label: 'Why Slow Breathing Calms You', href: '/science/slow-breathing' },
                { label: 'Breathing for Anxiety', href: '/breathing/anxiety' },
                { label: '4-7-8 Breathing', href: '/breathing/4-7-8' },
                { label: 'Box Breathing', href: '/breathing/box-breathing' },
              ].map(({ label, href }) => (
                <Link key={href} to={href}
                  className="px-4 py-2 rounded-xl t-caption transition-all"
                  style={{ color: ts.accent, border: `1px solid ${ts.border}` }}>
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
