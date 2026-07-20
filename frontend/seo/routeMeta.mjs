// seo/routeMeta.mjs
//
// Single source of truth for per-route SEO metadata, consumed by the
// prerender-shells Vite plugin (see vite.config.ts). For each content route
// the plugin bakes a dedicated static index.html with the correct <title>,
// description, canonical, Open Graph / Twitter tags, JSON-LD, and a
// crawler-visible <noscript> content block.
//
// Why this exists: the app is a client-rendered SPA, so without prerendering
// EVERY URL ships the same generic index.html — same title, empty <div id=root>.
// Non-JS crawlers (Telegram, WhatsApp, LinkedIn, Slack, Discord) therefore
// showed one identical preview for every page, and Google saw no per-page
// signal in the initial HTML. This fixes both without a headless browser.

const SITE = 'https://breatheonline.app';

// Reusable breadcrumb builder
const crumb = (name, path) => ({ '@type': 'ListItem', name, item: `${SITE}${path}` });
const breadcrumbs = (...items) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map((it, i) => ({ position: i + 1, ...it })),
});

// HowTo builder for the technique pages — eligible for step-by-step rich results
const howTo = (name, description, steps) => ({
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name,
  description,
  totalTime: 'PT5M',
  step: steps.map((text, i) => ({ '@type': 'HowToStep', position: i + 1, text })),
});

/**
 * Each route:
 *   title, description  — exact <head> meta (matches the runtime PageSEO)
 *   h1, intro           — crawler-visible content for the <noscript> block
 *   links               — internal links rendered in the block (crawl depth)
 *   jsonLd              — array of structured-data objects injected before </head>
 */
export const ROUTE_META = {
  '/breathing/box-breathing': {
    title: 'Box Breathing — 4-4-4-4 Technique for Focus & Stress Relief',
    description: 'Learn box breathing (4-4-4-4): inhale 4s, hold 4s, exhale 4s, hold 4s. Used by Navy SEALs to stay calm under pressure. Free guided sessions in your browser.',
    h1: 'Box Breathing: the 4-4-4-4 technique for focus and calm',
    intro: 'Box breathing is a simple four-count pattern — inhale for 4 seconds, hold for 4, exhale for 4, hold for 4 — that steadies your nervous system in about 90 seconds. It is used by Navy SEALs, athletes, and clinicians to stay calm and focused under pressure.',
    links: [['Try box breathing free', '/breathing'], ['4-7-8 for sleep', '/breathing/4-7-8'], ['Breathing for anxiety', '/breathing/anxiety']],
    jsonLd: [
      howTo('How to do box breathing', 'The 4-4-4-4 box breathing technique for stress relief and focus.', [
        'Sit upright and exhale completely.',
        'Inhale slowly through your nose for 4 seconds.',
        'Hold your breath for 4 seconds.',
        'Exhale slowly through your mouth for 4 seconds.',
        'Hold empty for 4 seconds, then repeat for 4–6 cycles.',
      ]),
      breadcrumbs(crumb('Home', '/'), crumb('Breathing', '/breathing'), crumb('Box Breathing', '/breathing/box-breathing')),
    ],
  },
  '/breathing/4-7-8': {
    title: '4-7-8 Breathing — Fall Asleep Faster with This Sleep Technique',
    description: 'The 4-7-8 breathing method: inhale 4s, hold 7s, exhale 8s. Activates the parasympathetic nervous system to help you fall asleep naturally. Try it free.',
    h1: '4-7-8 Breathing: fall asleep faster, naturally',
    intro: 'The 4-7-8 technique — inhale 4 seconds, hold 7, exhale 8 — lengthens your out-breath to switch the body from stress mode into rest mode. The long exhale slows your heart rate and quiets a racing mind, making it one of the most effective drug-free sleep aids.',
    links: [['Try 4-7-8 free', '/breathing'], ['Breathwork for deep sleep', '/sleep/breathwork-for-deep-sleep'], ['Box breathing', '/breathing/box-breathing']],
    jsonLd: [
      howTo('How to do 4-7-8 breathing', 'The 4-7-8 breathing technique to fall asleep faster.', [
        'Rest the tip of your tongue behind your upper front teeth.',
        'Exhale completely through your mouth.',
        'Inhale quietly through your nose for 4 seconds.',
        'Hold your breath for 7 seconds.',
        'Exhale through your mouth for 8 seconds. Repeat for 4 cycles.',
      ]),
      breadcrumbs(crumb('Home', '/'), crumb('Breathing', '/breathing'), crumb('4-7-8 Breathing', '/breathing/4-7-8')),
    ],
  },
  '/breathing/wim-hof': {
    title: 'Wim Hof Breathing Method — Boost Energy & Cold Tolerance',
    description: 'Practice the Wim Hof breathing method online. Rapid breathing cycles boost energy, strengthen immunity, and increase cold tolerance. Free guided sessions.',
    h1: 'The Wim Hof Method: breathe for energy and resilience',
    intro: 'The Wim Hof Method uses rounds of 30–40 deep, rapid breaths followed by a breath hold. It floods the body with oxygen, sharpens alertness, and builds tolerance to cold and stress. Think of it as natural energy without caffeine.',
    links: [['Try Wim Hof free', '/breathing'], ['Morning breathing ritual', '/breathing/morning-ritual'], ['The science of slow breathing', '/science/slow-breathing']],
    jsonLd: [
      howTo('How to do Wim Hof breathing', 'The Wim Hof breathing method for energy and cold tolerance.', [
        'Sit or lie down somewhere safe — never in water or while driving.',
        'Take 30–40 deep breaths: full inhale, relaxed exhale.',
        'After the last exhale, hold your breath as long as is comfortable.',
        'Inhale fully and hold for 15 seconds, then release.',
        'Repeat for 3–4 rounds.',
      ]),
      breadcrumbs(crumb('Home', '/'), crumb('Breathing', '/breathing'), crumb('Wim Hof Method', '/breathing/wim-hof')),
    ],
  },
  '/breathing/anxiety': {
    title: 'Breathing Exercises for Anxiety — Calm Panic in Minutes',
    description: 'Breathing techniques to stop anxiety and panic attacks fast. Slow your nervous system, reduce cortisol, and regain calm with guided breathwork. Free online.',
    h1: 'Breathing exercises for anxiety and panic',
    intro: 'When anxiety hits, your breath is the fastest way back to calm. Making your exhale longer than your inhale signals safety to your brain and interrupts the panic loop within 60–90 seconds — no medication needed. These guided techniques work anywhere.',
    links: [['Start breathing free', '/breathing'], ['Fight-or-flight explained', '/science/fight-or-flight'], ['4-7-8 for anxiety', '/breathing/4-7-8']],
    jsonLd: [
      breadcrumbs(crumb('Home', '/'), crumb('Breathing', '/breathing'), crumb('Breathing for Anxiety', '/breathing/anxiety')),
    ],
  },
  '/breathing/morning-ritual': {
    title: '3-Minute Morning Breathing Ritual — Focus & Energy for the Day',
    description: 'A simple 3-minute breathwork sequence to do every morning before coffee. Boosts focus, energy and mood — no equipment, no experience needed.',
    h1: 'A 3-minute morning breathing ritual',
    intro: 'Start your day with three minutes of breathwork before you reach for coffee. This simple sequence wakes up your nervous system, clears mental fog, and sets a focused, steady tone for the hours ahead.',
    links: [['Start your ritual', '/breathing'], ['Wim Hof for energy', '/breathing/wim-hof'], ['Why slow breathing works', '/science/slow-breathing']],
    jsonLd: [
      breadcrumbs(crumb('Home', '/'), crumb('Breathing', '/breathing'), crumb('Morning Ritual', '/breathing/morning-ritual')),
    ],
  },
  '/science/slow-breathing': {
    title: 'Why Slow Breathing Calms Your Mind — The Neuroscience Explained',
    description: "6 breaths per minute activates your vagus nerve, boosts HRV, and resets your stress response. Here's the neuroscience behind why breathing controls your mind.",
    h1: 'The neuroscience of slow breathing',
    intro: 'Breathing at around six breaths per minute stimulates the vagus nerve, raises heart-rate variability, and shifts your nervous system from stress into calm. It is the one bodily function that is both automatic and under your conscious control — a direct handle on your own physiology.',
    links: [['Try slow breathing', '/breathing'], ['Fight-or-flight explained', '/science/fight-or-flight'], ['Coherent breathing', '/breathing']],
    jsonLd: [
      breadcrumbs(crumb('Home', '/'), crumb('Science', '/science/slow-breathing')),
    ],
  },
  '/science/fight-or-flight': {
    title: 'Fight-or-Flight: Why Your Body Sounds False Alarms',
    description: "Racing heart, shaking hands, nausea, restless legs — that's adrenaline. Learn why your fight-or-flight system fires without a real threat, and how one long exhale switches it off.",
    h1: 'Fight-or-flight and the false alarm',
    intro: 'A pounding heart, shaking hands, and a churning stomach with no real danger in sight is adrenaline misfiring. Your brain cannot always tell a real threat from a stressful thought — but a slow, long exhale reaches the one manual override you have and switches the alarm off.',
    links: [['Calm it with breathing', '/breathing'], ['Breathing for anxiety', '/breathing/anxiety'], ['The science of slow breathing', '/science/slow-breathing']],
    jsonLd: [
      breadcrumbs(crumb('Home', '/'), crumb('Science', '/science/fight-or-flight')),
    ],
  },
  '/sleep/breathwork-for-deep-sleep': {
    title: 'Breathwork for Deep Sleep — Activate Your Parasympathetic System',
    description: "Use 4-7-8, box breathing and belly breathing to activate your nervous system's rest mode. Fall asleep faster and sleep deeper — free guided sessions.",
    h1: 'Breathwork for deep sleep',
    intro: 'The right breathing pattern is a switch for sleep. Slow, extended exhales activate your parasympathetic "rest and digest" system, lowering heart rate and blood pressure so you fall asleep faster and wake less during the night.',
    links: [['Try it before bed', '/breathing'], ['4-7-8 sleep technique', '/breathing/4-7-8'], ['Why sleep matters', '/sleep/why-sleep-is-important']],
    jsonLd: [
      breadcrumbs(crumb('Home', '/'), crumb('Sleep', '/sleep/breathwork-for-deep-sleep')),
    ],
  },
  '/sleep/why-sleep-is-important': {
    title: 'Why is Sleep So Important? 7 Science-Backed Reasons',
    description: "Sleep affects your brain, heart, immune system, mood and metabolism. Here's exactly why sleep is critical — and what you can do tonight to sleep better.",
    h1: 'Why sleep is so important',
    intro: 'Sleep is when your brain consolidates memory, your heart and blood vessels repair, your immune system recharges, and your hormones rebalance. Chronic short sleep raises the risk of nearly every major health condition — and better breathing before bed is one of the simplest ways to improve it.',
    links: [['Breathe before bed', '/breathing'], ['Breathwork for deep sleep', '/sleep/breathwork-for-deep-sleep'], ['What is sleep apnea?', '/sleep/what-is-sleep-apnea']],
    jsonLd: [
      breadcrumbs(crumb('Home', '/'), crumb('Sleep', '/sleep/why-sleep-is-important')),
    ],
  },
  '/sleep/what-is-sleep-apnea': {
    title: 'What is Sleep Apnea? Symptoms, Causes & Breathing Solutions',
    description: 'Sleep apnea causes your breathing to stop repeatedly during sleep. Learn the 3 types, warning signs, and how breathing exercises can help.',
    h1: 'What is sleep apnea?',
    intro: 'Sleep apnea is a disorder where breathing repeatedly stops and starts during sleep, starving the body of oxygen and fragmenting rest. Learn the three types, the warning signs to watch for, and how daytime breathing training can support treatment.',
    links: [['Breathing exercises', '/breathing'], ['Why sleep matters', '/sleep/why-sleep-is-important'], ['Breathwork for deep sleep', '/sleep/breathwork-for-deep-sleep']],
    jsonLd: [
      breadcrumbs(crumb('Home', '/'), crumb('Sleep', '/sleep/what-is-sleep-apnea')),
    ],
  },
  '/sleep/story': {
    title: 'AI Sleep Story — Personalized Bedtime Stories to Fall Asleep',
    description: 'Let AI write a personalized sleep story for your chosen scene, narrated with calming text-to-speech to help you drift off peacefully. Free and no download.',
    h1: 'AI-generated sleep stories',
    intro: 'Choose a scene and let AI write you a gentle, personalized bedtime story, narrated aloud with a calm voice. A soothing way to quiet your thoughts and drift off — different every night.',
    links: [['Breathe first', '/breathing'], ['Breathwork for deep sleep', '/sleep/breathwork-for-deep-sleep'], ['4-7-8 for sleep', '/breathing/4-7-8']],
    jsonLd: [
      breadcrumbs(crumb('Home', '/'), crumb('Sleep', '/sleep/story')),
    ],
  },
};
