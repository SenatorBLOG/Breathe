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
  '/learn': {
    title: 'Learn — Breathing Guides, Techniques & Science',
    description: 'Every Breathe guide in one place: breathing techniques step by step, what to use for anxiety, sleep and public speaking, and the science behind why breathwork works.',
    h1: 'Learn to breathe on purpose',
    intro: 'Nineteen free guides: the core breathing techniques with step-by-step instructions, what to reach for in a specific moment — anxiety, focus, public speaking, running, kids, sleep, blood pressure — and the science of why slow breathing changes how you feel. No account needed for any of it.',
    links: [
      ['Breathing for Focus', '/breathing/focus'],
      ['Breathing While Running', '/breathing/running'],
      ['Breathing for Kids', '/breathing/for-kids'],
      ['Box Breathing', '/breathing/box-breathing'],
      ['4-7-8 Breathing', '/breathing/4-7-8'],
      ['Coherent Breathing', '/breathing/coherent'],
      ['Belly Breathing', '/breathing/belly-breathing'],
      ['The Physiological Sigh', '/breathing/physiological-sigh'],
      ['Wim Hof Method', '/breathing/wim-hof'],
      ['Morning Ritual', '/breathing/morning-ritual'],
      ['Breathing for Anxiety', '/breathing/anxiety'],
      ['Before Public Speaking', '/breathing/public-speaking'],
      ['High Blood Pressure', '/breathing/high-blood-pressure'],
      ['Why Slow Breathing Calms You', '/science/slow-breathing'],
      ['Fight-or-Flight Explained', '/science/fight-or-flight'],
      ['Breathwork for Deep Sleep', '/sleep/breathwork-for-deep-sleep'],
      ['Why Sleep Is Important', '/sleep/why-sleep-is-important'],
      ['What Is Sleep Apnea', '/sleep/what-is-sleep-apnea'],
      ['AI Sleep Stories', '/sleep/story'],
    ],
    jsonLd: [
      breadcrumbs(crumb('Home', '/'), crumb('Learn', '/learn')),
    ],
  },
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
  '/breathing/coherent': {
    title: 'Coherent Breathing — 5–6 Breaths Per Minute for Calm & HRV',
    description: 'Coherent breathing (resonance breathing) at 5–6 breaths per minute syncs your heart and nervous system, boosts HRV, and lowers stress. Free guided sessions online.',
    h1: 'Coherent breathing: 5–6 breaths a minute',
    intro: 'Slow your breath to about six a minute — five seconds in, five seconds out — and your heart, lungs and nervous system lock into one calm rhythm. It is the gentlest, most sustainable way to lower stress and raise heart rate variability (HRV).',
    links: [['Try coherent breathing', '/breathing'], ['The science of slow breathing', '/science/slow-breathing'], ['Box breathing', '/breathing/box-breathing']],
    jsonLd: [
      howTo('How to do coherent breathing', 'Coherent (resonance) breathing at 5–6 breaths per minute for calm and HRV.', [
        'Sit comfortably and relax your shoulders.',
        'Breathe in gently through your nose for 5 seconds.',
        'Breathe out slowly for 5 seconds — no holds, no force.',
        'Keep the wave smooth and even.',
        'Continue for 5–20 minutes.',
      ]),
      breadcrumbs(crumb('Home', '/'), crumb('Breathing', '/breathing'), crumb('Coherent Breathing', '/breathing/coherent')),
    ],
  },
  '/breathing/physiological-sigh': {
    title: 'The Physiological Sigh — The Fastest Way to Calm Down',
    description: 'The physiological sigh: a double inhale through the nose and a long exhale through the mouth. The science-backed fastest way to lower stress in real time. Try it free.',
    h1: 'The physiological sigh: calm in one breath',
    intro: 'Two inhales through the nose, one long exhale through the mouth — the pattern your body reaches for when you cry. Done on purpose, it is the single fastest way scientists have found to switch off stress in real time, often within one breath.',
    links: [['Practise a calming breath', '/breathing'], ['Breathing for anxiety', '/breathing/anxiety'], ['Fight-or-flight explained', '/science/fight-or-flight']],
    jsonLd: [
      howTo('How to do a physiological sigh', 'The physiological sigh (double inhale, long exhale) to calm down fast.', [
        'Inhale fully through your nose.',
        'Sip a second short inhale on top to top up your lungs.',
        'Exhale slowly and completely through your mouth.',
        'Repeat 1–3 times, or once whenever you need it.',
      ]),
      breadcrumbs(crumb('Home', '/'), crumb('Breathing', '/breathing'), crumb('Physiological Sigh', '/breathing/physiological-sigh')),
    ],
  },
  '/breathing/belly-breathing': {
    title: 'Diaphragmatic Breathing — How to Belly Breathe Properly',
    description: 'Learn diaphragmatic (belly) breathing step by step: breathe with your diaphragm, not your chest. Reduces stress, improves oxygen exchange. Free guided practice.',
    h1: 'Diaphragmatic breathing: breathe with your belly',
    intro: 'Most adults breathe with the chest and shoulders all day — shallow, fast, and stuck in a low-grade stress pattern. Belly breathing puts the work back where it belongs: the diaphragm. It is the foundation every other breathing technique is built on.',
    links: [['Practise belly breathing', '/breathing'], ['Coherent breathing', '/breathing/coherent'], ['Breathing for anxiety', '/breathing/anxiety']],
    jsonLd: [
      howTo('How to do diaphragmatic breathing', 'Step-by-step diaphragmatic (belly) breathing technique.', [
        'Lie down or sit upright with one hand on your chest and one on your belly.',
        'Inhale through your nose for 4 seconds — let the belly hand rise.',
        'Exhale slowly through pursed lips for 6 seconds — the belly falls.',
        'Keep the chest hand as still as possible throughout.',
        'Continue for 5–10 minutes a day.',
      ]),
      breadcrumbs(crumb('Home', '/'), crumb('Breathing', '/breathing'), crumb('Belly Breathing', '/breathing/belly-breathing')),
    ],
  },
  '/breathing/public-speaking': {
    title: 'Breathing Before Public Speaking — Calm Nerves & Steady Your Voice',
    description: 'Breathing exercises to calm nerves before public speaking. Stop a shaking voice, steady your hands, and stay sharp on stage. Free guided techniques you can do backstage.',
    h1: 'Breathing before public speaking',
    intro: 'Shaking hands, a wobbling voice, going blank on the first line — that is adrenaline, not a lack of preparation. Three minutes of the right breathing backstage keeps the sharpness and drops the shake, and nobody can see you doing it.',
    links: [['Calm down before you speak', '/breathing'], ['Box breathing', '/breathing/box-breathing'], ['The physiological sigh', '/breathing/physiological-sigh']],
    jsonLd: [
      howTo('How to breathe before public speaking', 'A backstage breathing routine to calm nerves before speaking.', [
        '10 minutes before: belly breathing with long exhales to settle your baseline.',
        '3 minutes before: five slow cycles of box breathing (4-4-4-4).',
        'Right before your first line: one physiological sigh — double inhale, long exhale.',
        'On stage: exhale fully before each new point.',
      ]),
      breadcrumbs(crumb('Home', '/'), crumb('Breathing', '/breathing'), crumb('Public Speaking', '/breathing/public-speaking')),
    ],
  },
  '/breathing/high-blood-pressure': {
    title: 'Breathing Exercises for High Blood Pressure — What the Evidence Says',
    description: 'Can slow breathing lower blood pressure? An honest look at the evidence, the realistic effect size, and how to practise coherent breathing safely alongside your treatment.',
    h1: 'Breathing and high blood pressure',
    intro: 'Slow breathing does lower blood pressure — but by less than the internet usually claims, and only with consistent practice. Breathing exercises complement medical treatment and never replace it: never stop or change prescribed medication without your doctor.',
    links: [['Try guided slow breathing', '/breathing'], ['Coherent breathing', '/breathing/coherent'], ['The science of slow breathing', '/science/slow-breathing']],
    jsonLd: [
      breadcrumbs(crumb('Home', '/'), crumb('Breathing', '/breathing'), crumb('High Blood Pressure', '/breathing/high-blood-pressure')),
    ],
  },
  '/breathing/for-kids': {
    title: 'Breathing Exercises for Kids — 6 Calm-Down Techniques That Work',
    description: 'Simple, playful breathing exercises for children: birthday candles, bumble-bee breath, balloon belly and more. Calm big feelings at home or in the classroom. Free.',
    h1: 'Breathing exercises for kids',
    intro: 'Children cannot "just calm down" on command — but they can blow out imaginary candles, hum like a bee, or rock a teddy bear on their tummy. Six playful exercises that teach the same nervous-system skill adults use. Keep it gentle: no breath holds for kids.',
    links: [['Breathe together', '/breathing'], ['Belly breathing', '/breathing/belly-breathing'], ['All guides', '/learn']],
    jsonLd: [
      howTo('Breathing exercises for children', 'Playful, age-appropriate breathing exercises to help kids calm down.', [
        'Birthday candles: hold up five fingers and blow each one out with a long slow breath.',
        'Smell the flower, blow the feather: breathe in through the nose, out slowly through the mouth.',
        'Bumble-bee breath: breathe in, then hum all the way out.',
        'Teddy on the belly: lie down and rock a soft toy up and down with the breath.',
        'Keep sessions to 1–3 minutes and stop while it is still fun.',
      ]),
      breadcrumbs(crumb('Home', '/'), crumb('Learn', '/learn'), crumb('Breathing for Kids', '/breathing/for-kids')),
    ],
  },
  '/breathing/running': {
    title: 'How to Breathe While Running — Rhythm, Nose vs Mouth & Side Stitches',
    description: 'How to breathe while running: rhythmic 3:2 breathing, nose vs mouth, belly breathing, and how to stop a side stitch. Practical guide for beginners and runners.',
    h1: 'How to breathe while running',
    intro: 'Gasping two kilometres in usually is not your lungs — it is pace, shallow chest breathing, and no rhythm. Learn rhythmic breathing (3:2 easy, 2:1 hard), when to switch from nose to mouth, and how to kill a side stitch.',
    links: [['Train belly breathing', '/breathing'], ['Belly breathing', '/breathing/belly-breathing'], ['Wim Hof Method', '/breathing/wim-hof']],
    jsonLd: [
      howTo('How to breathe while running', 'Rhythmic breathing technique for running.', [
        'Breathe in through the nose and mouth together; breathe out through the mouth.',
        'On easy runs, inhale for 3 steps and exhale for 2.',
        'At hard efforts, switch to a 2:1 pattern and open the mouth fully.',
        'Breathe into the belly, not the chest, to prevent side stitches.',
        'If a stitch starts, slow down and exhale forcefully on the opposite foot strike.',
      ]),
      breadcrumbs(crumb('Home', '/'), crumb('Learn', '/learn'), crumb('Breathing While Running', '/breathing/running')),
    ],
  },
  '/breathing/focus': {
    title: 'Breathing Exercises for Focus & Concentration — Before Work or Study',
    description: 'Breathing exercises for focus and concentration: a 3-minute box breathing routine to start deep work or study sessions with a clear, settled mind. Free and guided.',
    h1: 'Breathing for focus and concentration',
    intro: 'You sit down to work and your mind is still in six tabs. Scattered focus is usually over-arousal, not laziness — three minutes of box breathing lowers it to the level where sustained attention is actually possible, and rehearses the exact skill the next hour requires.',
    links: [['Focus in 3 minutes', '/breathing'], ['Box breathing', '/breathing/box-breathing'], ['Coherent breathing', '/breathing/coherent']],
    jsonLd: [
      howTo('A 3-minute breathing routine for focus', 'Box breathing routine to settle attention before deep work or study.', [
        'Put your phone out of reach and close extra tabs.',
        'Do about 8 slow cycles of box breathing: in 4, hold 4, out 4, hold 4.',
        'Decide the single next action before opening anything.',
        'Start with that action — no inbox, no quick checks.',
      ]),
      breadcrumbs(crumb('Home', '/'), crumb('Learn', '/learn'), crumb('Breathing for Focus', '/breathing/focus')),
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
