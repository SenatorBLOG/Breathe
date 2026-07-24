import GuideLayout from '../../components/GuideLayout';

export default function DeskResetPage() {
  return (
    <GuideLayout
      eyebrow="For a Specific Situation"
      titleTop="The 2-Minute"
      titleAccent="Desk Reset"
      intro="Eight hours of back-to-back calls, shallow chest breathing and a jaw you didn't notice you were clenching. You don't need a retreat — you need two minutes between meetings, and nobody has to know you're doing it."
      seo={{
        title: 'Breathing Exercises at Work — A 2-Minute Desk Reset for Stress',
        description: 'A discreet 2-minute breathing reset for work stress: between meetings, before a hard email, or mid-afternoon slump. Nobody can tell you are doing it. Free.',
        canonical: '/breathing/desk-reset',
      }}
      ctaLabel="Take two minutes — free"
      preset={{ inhale: 4, hold: 4, exhale: 6, pause: 2 }}
      presetName="Desk Reset"
      sections={[
        {
          heading: 'What eight hours at a desk does to your breathing',
          paragraphs: [
            'Sitting hunched toward a screen compresses the diaphragm, so breathing moves up into the chest — shallow, fast and inefficient. That is the same pattern the body uses when anxious, which quietly signals "mild threat" to your brain all day.',
            'Add "email apnea" — the near-universal habit of <strong>holding your breath while reading messages</strong> — and you get a nervous system that never fully comes down between stressors. By 4pm you feel wrung out without having done anything physically demanding.',
            'The fix does not require leaving your desk. It requires interrupting the pattern often enough that it does not accumulate.',
          ],
        },
        {
          heading: 'The reset',
          steps: [
            { n: '1', label: 'Feet flat, sit back, unclench your jaw and drop your shoulders', note: '10s' },
            { n: '2', label: 'One physiological sigh: double inhale, long slow exhale', note: '×1' },
            { n: '3', label: 'Then 6 rounds — in 4, hold 4, out 6', note: '4-4-6' },
            { n: '4', label: 'Look at something more than 6 metres away before you resume', note: '👀' },
          ],
          footnote: 'Step 4 is not padding — your eye muscles have been locked at screen distance for hours, and refocusing far away relieves that strain in seconds.',
        },
        {
          heading: 'When to deploy it',
          cards: [
            { icon: '📅', title: 'Between back-to-back meetings', desc: 'Two minutes turns "still in the last call" into actually present for the next one.' },
            { icon: '📧', title: 'Before replying to that email', desc: 'The one that made your chest tighten. Breathe first, write second — the reply will be better.' },
            { icon: '📉', title: 'The 3pm slump', desc: 'Reach for this before a third coffee. Often the problem is under-breathing, not under-caffeination.' },
            { icon: '🎥', title: 'Before you unmute', desc: 'Completely invisible on a video call. Your voice lands steadier for it.' },
          ],
        },
        {
          heading: 'Making it a habit that survives a busy week',
          paragraphs: [
            'Good intentions lose to a full calendar. The reliable trick is <strong>anchoring</strong>: attach the reset to something that already happens. After every meeting ends. Every time you refill your water. Before opening your inbox.',
            'Two minutes, three times a day, beats a twenty-minute session you plan on Monday and never do. The point is interrupting accumulation, and frequency does that better than duration.',
          ],
        },
      ]}
      disclaimer="This article is general education, not medical advice. Persistent work stress that affects your sleep, mood or health deserves more than a breathing exercise — that is worth raising with a doctor, and where possible with your employer."
      faqs={[
        { q: 'What is a good breathing exercise to do at work?', a: 'A 4-4-6 pattern — in for 4, hold 4, out for 6 — for about six rounds, roughly two minutes. The longer exhale calms without making you drowsy, and it is completely invisible to anyone around you.' },
        { q: 'What is email apnea?', a: 'The common habit of unconsciously holding your breath or breathing very shallowly while reading email and messages. It keeps your stress response mildly activated throughout the day, which is exhausting in a way that is hard to attribute.' },
        { q: 'How often should I do it?', a: 'Two or three short resets a day beats one long session. Anchor them to things that already happen — after a meeting, when you refill your water — so they survive a busy week.' },
        { q: 'Will people notice me doing it?', a: 'No. Slow nasal breathing while sitting upright looks like thinking. It is one of the few stress interventions that is genuinely invisible in an open-plan office or on camera.' },
      ]}
      related={[
        { label: 'Breathing for focus', href: '/breathing/focus' },
        { label: 'The physiological sigh', href: '/breathing/physiological-sigh' },
        { label: 'Box Breathing', href: '/breathing/box-breathing' },
        { label: 'Before public speaking', href: '/breathing/public-speaking' },
      ]}
    />
  );
}
