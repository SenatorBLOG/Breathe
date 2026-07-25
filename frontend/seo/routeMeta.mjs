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
    intro: 'Thirty-four free guides: the core breathing techniques with step-by-step instructions, what to reach for in a specific moment — anxiety, focus, public speaking, running, kids, sleep, blood pressure — comparisons to help you choose, and the science of why slow breathing changes how you feel. No account needed for any of it.',
    links: [
      ['Breathing for Focus', '/breathing/focus'],
      ['Breathing While Running', '/breathing/running'],
      ['Breathing for Kids', '/breathing/for-kids'],
      ['Alternate Nostril Breathing', '/breathing/alternate-nostril'],
      ['Nose vs Mouth Breathing', '/breathing/nose-vs-mouth'],
      ['Box Breathing vs 4-7-8', '/breathing/box-vs-4-7-8'],
      ['Racing Thoughts at 3am', '/breathing/racing-thoughts'],
      ['Breath Holds & CO2 Tolerance', '/breathing/breath-hold'],
      ['Pursed-Lip Breathing', '/breathing/pursed-lip'],
      ['The 2-Minute Desk Reset', '/breathing/desk-reset'],
      ['The Buteyko Method', '/breathing/buteyko'],
      ['How to Breathe During Meditation', '/breathing/during-meditation'],
      ['How to Stimulate the Vagus Nerve', '/science/vagus-nerve'],
      ['Calm Down When Angry', '/breathing/anger'],
      ['Breathing for Nausea', '/breathing/nausea'],
      ['Breathing Through a Craving', '/breathing/cravings'],
      ['Breath Support for Singing', '/breathing/for-singing'],
      ['Ice Baths & Cold Water', '/breathing/cold-exposure'],
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
  '/breathing/alternate-nostril': {
    title: 'Alternate Nostril Breathing (Nadi Shodhana) — How to Do It',
    description: 'Alternate nostril breathing (Nadi Shodhana) step by step: hand position, timing, and what it does for stress and focus. Free guided practice, no signup.',
    h1: 'Alternate nostril breathing (Nadi Shodhana)',
    intro: 'Close one nostril, breathe in; close the other, breathe out. A 4,000-year-old yogic technique that turns out to be one of the most reliable ways to steady an agitated mind — and it takes five minutes.',
    links: [['Try a guided session', '/breathing'], ['Box breathing', '/breathing/box-breathing'], ['How to breathe during meditation', '/breathing/during-meditation']],
    jsonLd: [
      howTo('How to do alternate nostril breathing', 'Nadi Shodhana step by step.', [
        'Rest your right thumb on your right nostril and ring finger on the left.',
        'Close the right nostril and inhale slowly through the left for 4 seconds.',
        'Close both nostrils and hold gently for 4 seconds.',
        'Release the right nostril and exhale through it for 4 seconds.',
        'Inhale right, close, hold, exhale left — that is one full round.',
      ]),
      breadcrumbs(crumb('Home', '/'), crumb('Learn', '/learn'), crumb('Alternate Nostril Breathing', '/breathing/alternate-nostril')),
    ],
  },
  '/breathing/nose-vs-mouth': {
    title: 'Nose vs Mouth Breathing — Why It Matters and How to Switch',
    description: 'Nose breathing filters, warms and humidifies air and boosts nitric oxide; mouth breathing dries and over-ventilates. What the difference means and how to switch.',
    h1: 'Nose vs mouth breathing',
    intro: 'Your nose filters, warms, humidifies and adds nitric oxide — none of which your mouth does. Chronic mouth breathing dries your mouth, disrupts sleep and encourages the shallow chest pattern your body uses when anxious. Here is what it costs, and when mouth breathing is fine.',
    links: [['Practise nasal breathing', '/breathing'], ['Belly breathing', '/breathing/belly-breathing'], ['Breathing while running', '/breathing/running']],
    jsonLd: [
      breadcrumbs(crumb('Home', '/'), crumb('Learn', '/learn'), crumb('Nose vs Mouth Breathing', '/breathing/nose-vs-mouth')),
    ],
  },
  '/breathing/box-vs-4-7-8': {
    title: 'Box Breathing vs 4-7-8 — Which Technique Should You Use?',
    description: 'Box breathing (4-4-4-4) or 4-7-8? A direct comparison: what each does, when to use which, and why the wrong choice makes breathing feel useless. Try both free.',
    h1: 'Box breathing vs 4-7-8: which one?',
    intro: 'Both work, and they are built for opposite jobs. Box breathing has equal counts and keeps you alert under pressure. 4-7-8 has a doubled exhale and pushes you toward sleep. Equal breath steadies you, long exhale sedates you — picking the wrong one is why people say breathing does not work for them.',
    links: [['Box breathing', '/breathing/box-breathing'], ['4-7-8 breathing', '/breathing/4-7-8'], ['Coherent breathing', '/breathing/coherent']],
    jsonLd: [
      breadcrumbs(crumb('Home', '/'), crumb('Learn', '/learn'), crumb('Box vs 4-7-8', '/breathing/box-vs-4-7-8')),
    ],
  },
  '/breathing/racing-thoughts': {
    title: "Can't Sleep With Racing Thoughts? Breathing That Actually Stops It",
    description: 'Overthinking at night keeping you awake? Why you cannot out-think racing thoughts, and the breathing techniques that break the loop from the body up. Free, no signup.',
    h1: 'Racing thoughts at 3am',
    intro: 'Racing thoughts at night are an arousal problem, not a thinking problem — an activated brain generates thoughts the way a running engine generates noise. You cannot out-think it, but slow breathing lowers the arousal directly and the mental noise quiets as a consequence.',
    links: [['Quiet it down', '/breathing'], ['4-7-8 for sleep', '/breathing/4-7-8'], ['Breathwork for deep sleep', '/sleep/breathwork-for-deep-sleep']],
    jsonLd: [
      howTo('Breathing for racing thoughts at night', 'A breathing protocol for when overthinking keeps you awake.', [
        'Do not check the time — it starts the "only 4 hours left" spiral.',
        'Take three physiological sighs: double inhale, long slow exhale.',
        'Then do four rounds of 4-7-8: in 4, hold 7, out 8.',
        'Stop counting and simply keep the exhale longer than the inhale.',
      ]),
      breadcrumbs(crumb('Home', '/'), crumb('Learn', '/learn'), crumb('Racing Thoughts', '/breathing/racing-thoughts')),
    ],
  },
  '/breathing/breath-hold': {
    title: 'Breath Hold Training & CO₂ Tolerance — How to Do It Safely',
    description: 'How to hold your breath longer: the CO₂ tolerance test, safe breath-hold training, and the hard safety rules. Never practise in or near water.',
    h1: 'Breath holds and CO₂ tolerance',
    intro: 'The urge to breathe is not oxygen running out — it is carbon dioxide building up, and that tolerance is trainable. Never practise breath holds in or near water: hyperventilating before a hold causes shallow-water blackout, which kills experienced swimmers without warning. Always sit or lie down.',
    links: [['Practise calm breathing', '/breathing'], ['Wim Hof Method', '/breathing/wim-hof'], ['Buteyko method', '/breathing/buteyko']],
    jsonLd: [
      breadcrumbs(crumb('Home', '/'), crumb('Learn', '/learn'), crumb('Breath Holds & CO₂ Tolerance', '/breathing/breath-hold')),
    ],
  },
  '/breathing/pursed-lip': {
    title: 'Pursed-Lip Breathing — Technique for Shortness of Breath',
    description: 'Pursed-lip breathing step by step: how it eases shortness of breath by keeping airways open longer. Widely taught for COPD and breathlessness. Free guided practice.',
    h1: 'Pursed-lip breathing',
    intro: 'Breathe out slowly through lips pursed as if cooling soup. The gentle back-pressure splints your airways open longer so trapped air can escape — the technique respiratory therapists teach first for breathlessness. It supports treatment and never replaces prescribed inhalers or oxygen.',
    links: [['Practise a slow exhale', '/breathing'], ['Belly breathing', '/breathing/belly-breathing'], ['Breathing for anxiety', '/breathing/anxiety']],
    jsonLd: [
      howTo('How to do pursed-lip breathing', 'Pursed-lip breathing for shortness of breath.', [
        'Relax your neck and shoulders and let them drop.',
        'Breathe in gently through your nose with your mouth closed for 2 seconds.',
        'Purse your lips as if about to whistle or cool hot soup.',
        'Breathe out slowly and steadily through pursed lips for about 4 seconds.',
      ]),
      breadcrumbs(crumb('Home', '/'), crumb('Learn', '/learn'), crumb('Pursed-Lip Breathing', '/breathing/pursed-lip')),
    ],
  },
  '/breathing/desk-reset': {
    title: 'Breathing Exercises at Work — A 2-Minute Desk Reset for Stress',
    description: 'A discreet 2-minute breathing reset for work stress: between meetings, before a hard email, or mid-afternoon slump. Nobody can tell you are doing it. Free.',
    h1: 'The 2-minute desk reset',
    intro: 'Sitting hunched at a screen pushes breathing up into the chest, and "email apnea" — holding your breath while reading messages — keeps your stress response quietly running all day. Two minutes between meetings interrupts the accumulation, and nobody can tell you are doing it.',
    links: [['Take two minutes', '/breathing'], ['Breathing for focus', '/breathing/focus'], ['Before public speaking', '/breathing/public-speaking']],
    jsonLd: [
      howTo('A 2-minute breathing reset at your desk', 'A discreet breathing reset for work stress.', [
        'Put your feet flat, sit back, unclench your jaw and drop your shoulders.',
        'Take one physiological sigh: double inhale, long slow exhale.',
        'Do six rounds of in 4, hold 4, out 6.',
        'Look at something more than 6 metres away before resuming work.',
      ]),
      breadcrumbs(crumb('Home', '/'), crumb('Learn', '/learn'), crumb('Desk Reset', '/breathing/desk-reset')),
    ],
  },
  '/breathing/buteyko': {
    title: 'The Buteyko Method — Breathe Less, Explained Honestly',
    description: 'What the Buteyko breathing method is, the core exercises, the control pause, and what the evidence actually shows for asthma. Balanced guide, free practice.',
    h1: 'The Buteyko method',
    intro: 'Most breathing advice says breathe deeper. Buteyko says the opposite: modern people chronically over-breathe, and the fix is lighter, nasal breathing. Trials show reduced asthma symptoms and reliever use — but not improved lung function, so never reduce asthma medication on your own.',
    links: [['Practise light nasal breathing', '/breathing'], ['Nose vs mouth breathing', '/breathing/nose-vs-mouth'], ['Breath holds & CO₂ tolerance', '/breathing/breath-hold']],
    jsonLd: [
      breadcrumbs(crumb('Home', '/'), crumb('Learn', '/learn'), crumb('Buteyko Method', '/breathing/buteyko')),
    ],
  },
  '/breathing/during-meditation': {
    title: 'How to Breathe During Meditation — The Beginner Question, Answered',
    description: 'Should you control your breath while meditating? Why watching beats managing, what to do when breathing feels awkward, and simple anchors for beginners. Free.',
    h1: 'How to breathe during meditation',
    intro: 'Almost every beginner asks this, and the answer surprises them: mostly, you do not. Meditation uses the breath as an anchor for attention — you let the body breathe itself and simply notice. The moment you try to breathe correctly, you have stopped meditating and started performing.',
    links: [['Start with a guided breath', '/breathing'], ['Coherent breathing', '/breathing/coherent'], ['Alternate nostril breathing', '/breathing/alternate-nostril']],
    jsonLd: [
      breadcrumbs(crumb('Home', '/'), crumb('Learn', '/learn'), crumb('Breathing During Meditation', '/breathing/during-meditation')),
    ],
  },
  '/science/vagus-nerve': {
    title: 'How to Stimulate the Vagus Nerve — What Actually Works',
    description: 'The vagus nerve controls your rest-and-digest state. Learn what genuinely stimulates it — slow exhales, humming, cold, breathing at 6 per minute — and what does not.',
    h1: 'How to stimulate your vagus nerve',
    intro: 'The vagus nerve is the brake pedal of your nervous system, and breathing is the only way to press it on demand. What genuinely works: a long exhale, breathing at about six per minute, humming, and cold on the face. What is hype: most of the devices and supplements sold around it.',
    links: [['Press the brake', '/breathing'], ['The science of slow breathing', '/science/slow-breathing'], ['Coherent breathing', '/breathing/coherent']],
    jsonLd: [
      howTo('How to stimulate the vagus nerve with breathing', 'The simplest effective vagus nerve breathing exercise.', [
        'Inhale gently through the nose for 4 seconds.',
        'Exhale slowly through the mouth for 8 seconds — twice as long.',
        'Repeat for two to five minutes.',
      ]),
      breadcrumbs(crumb('Home', '/'), crumb('Science', '/science/vagus-nerve')),
    ],
  },
  '/breathing/anger': {
    title: 'How to Calm Down When Angry — Breathing That Actually Works',
    description: 'Breathing exercises to calm anger fast: why the long exhale drains adrenaline, the 90-second rule, and what to do before you say something you regret. Free, no signup.',
    h1: "How to calm down when you're angry",
    intro: 'Anger dumps adrenaline faster than you can think your way out of it. The raw chemical surge passes in about 90 seconds if you avoid acting and stop feeding the story — and a long, slow exhale actively drains the charge. Breathe first, respond second.',
    links: [['Cool down now', '/breathing'], ['Fight-or-flight explained', '/science/fight-or-flight'], ['Breathing for anxiety', '/breathing/anxiety']],
    jsonLd: [
      howTo('How to calm down when angry', 'A breathing method to defuse anger in the moment.', [
        'Say nothing yet — the urge to speak now is the adrenaline talking.',
        'Exhale long and slow, much longer than the inhale.',
        'Unclench your jaw and drop your shoulders on each out-breath.',
        'Take about six of those breaths — roughly 90 seconds — before you respond.',
      ]),
      breadcrumbs(crumb('Home', '/'), crumb('Learn', '/learn'), crumb('Calm Down When Angry', '/breathing/anger')),
    ],
  },
  '/breathing/nausea': {
    title: 'Breathing for Nausea — Slow Breathing to Ease Queasiness',
    description: 'How slow controlled breathing eases nausea and motion sickness, why it works, and a simple technique to try. Used clinically for post-op and chemo nausea. Free.',
    h1: 'Breathing for nausea and queasiness',
    intro: 'Slow, controlled breathing is one of the simplest things that genuinely eases nausea — it is used clinically for post-operative and chemotherapy sickness. It will not fix the cause, but when you feel queasy and stuck, it often helps within a minute and costs nothing.',
    links: [['Ease it slowly', '/breathing'], ['Coherent breathing', '/breathing/coherent'], ['Breathing for anxiety', '/breathing/anxiety']],
    jsonLd: [
      howTo('Breathing to ease nausea', 'Slow breathing technique to reduce queasiness.', [
        'Get fresh, cool air if you can.',
        'Breathe low into the belly, slowly, through the nose.',
        'Exhale longer than you inhale — gently, never forced.',
        'Keep your gaze on something still if the room feels unsteady.',
      ]),
      breadcrumbs(crumb('Home', '/'), crumb('Learn', '/learn'), crumb('Breathing for Nausea', '/breathing/nausea')),
    ],
  },
  '/breathing/cravings': {
    title: 'Breathing to Beat Cravings — Urge Surfing for Smoking & More',
    description: 'How to breathe through a craving using urge surfing: why cravings peak and fall like a wave, and a simple technique to ride one out. For quitting smoking, snacking and more.',
    h1: 'Breathing through a craving',
    intro: 'A craving feels like it will build forever until you give in. It will not — cravings rise, peak and fall like a wave, usually within a few minutes, whether or not you act. Urge surfing means breathing through the wave and outlasting it instead of fighting or obeying it.',
    links: [['Ride out the urge', '/breathing'], ['The physiological sigh', '/breathing/physiological-sigh'], ['Breathing for anxiety', '/breathing/anxiety']],
    jsonLd: [
      howTo('How to urge-surf a craving', 'Breathing through a craving using urge surfing.', [
        'Notice the craving without judgment — "a craving is here".',
        'Find where you feel it in your body.',
        'Breathe slowly into that sensation with long, gentle exhales.',
        'Watch the wave rise and fall for a few minutes without acting on it.',
      ]),
      breadcrumbs(crumb('Home', '/'), crumb('Learn', '/learn'), crumb('Breathing Through a Craving', '/breathing/cravings')),
    ],
  },
  '/breathing/for-singing': {
    title: 'Breathing for Singing — Breath Support & Control Explained',
    description: 'Breath support for singing: diaphragmatic breathing, appoggio, and exercises to control the exhale so you never run out of air mid-phrase. Free guided practice.',
    h1: 'Breath support for singing',
    intro: 'Running out of air before the end of a phrase is a breathing problem, not a talent problem. Good singing runs on the diaphragm and a slow, controlled release of air — support is about controlling the exhale, not taking a bigger breath.',
    links: [['Train exhale control', '/breathing'], ['Belly breathing', '/breathing/belly-breathing'], ['Before public speaking', '/breathing/public-speaking']],
    jsonLd: [
      howTo('Breath support exercises for singing', 'How to build breath control for singing.', [
        'Breathe in low with a hand on your belly — belly out, shoulders still.',
        'Let the ribs expand sideways; think wide, not up.',
        'Hiss out on a steady "sss" — long, even and controlled.',
        'Feel the gentle resistance in your midsection holding the air back.',
      ]),
      breadcrumbs(crumb('Home', '/'), crumb('Learn', '/learn'), crumb('Breathing for Singing', '/breathing/for-singing')),
    ],
  },
  '/breathing/cold-exposure': {
    title: 'How to Breathe in an Ice Bath or Cold Shower — Safely',
    description: 'How to control your breathing in cold water and ice baths, manage the cold shock gasp reflex, and the critical safety rule: never hyperventilate before entering water.',
    h1: 'How to breathe in cold water and ice baths',
    intro: 'The cold shock response makes you gasp and hyperventilate the instant you hit cold water, and that gasp is what makes cold plunges risky. Controlling your breath — meeting the gasp with a long exhale — is the difference between a calm cold exposure and a dangerous one. Never hyperventilate before entering water.',
    links: [['Practise calm control', '/breathing'], ['Wim Hof Method', '/breathing/wim-hof'], ['Breath holds & CO2 tolerance', '/breathing/breath-hold']],
    jsonLd: [
      howTo('How to breathe in cold water', 'Controlling your breath through the cold shock response.', [
        'Before entering, breathe normally and calmly — no power breathing.',
        'Enter slowly and deliberately; never jump or dunk your head first.',
        'When the gasp comes, meet it with a long, deliberate exhale.',
        'Keep exhales slow and long until the cold shock settles, about 1–3 minutes.',
      ]),
      breadcrumbs(crumb('Home', '/'), crumb('Learn', '/learn'), crumb('Breathing in Cold Water', '/breathing/cold-exposure')),
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
