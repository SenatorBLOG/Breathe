import GuideLayout from '../../components/GuideLayout';

export default function CravingsPage() {
  return (
    <GuideLayout
      eyebrow="For a Specific Situation"
      titleTop="Breathing Through"
      titleAccent="a Craving"
      intro="A craving feels like it will build forever until you give in. It won't. Cravings rise, peak, and fall like a wave — usually within a few minutes — whether or not you act on them. Breathing gives you something to hold onto while the wave passes."
      seo={{
        title: 'Breathing to Beat Cravings — Urge Surfing for Smoking & More',
        description: 'How to breathe through a craving using urge surfing: why cravings peak and fall like a wave, and a simple technique to ride one out. For quitting smoking, snacking and more.',
        canonical: '/breathing/cravings',
      }}
      ctaLabel="Ride out the urge — free"
      preset={{ inhale: 4, hold: 0, exhale: 6, pause: 2 }}
      presetName="Urge Surfing"
      sections={[
        {
          heading: 'A craving is a wave, not a straight line',
          paragraphs: [
            'The trap of a craving is the belief that it will keep intensifying until it is unbearable and you have no choice. That is not how cravings behave. Left alone, a craving <strong>rises, crests, and subsides</strong> — most peak and start falling within a few minutes.',
            'This is the idea behind <strong>urge surfing</strong>, a technique from addiction psychology: you do not fight the craving and you do not obey it. You watch it like a wave and breathe while it moves through, knowing it will come down on its own. You do not have to make it go away — you only have to outlast it.',
          ],
        },
        {
          heading: 'How to surf the urge',
          steps: [
            { n: '1', label: 'Notice it without judgment — "a craving is here"', note: '👀' },
            { n: '2', label: 'Where do you feel it in your body? Tightness, restlessness, watering mouth?', note: '🔍' },
            { n: '3', label: 'Breathe slowly into that sensation — long, gentle exhales', note: '4-6' },
            { n: '4', label: 'Watch the wave rise and fall for a few minutes without acting', note: '🌊' },
          ],
          footnote: 'You are not trying to make the craving disappear — that fight usually makes it stronger. You are staying with it, breathing, until it passes on its own. Each wave you surf without giving in makes the next one weaker.',
        },
        {
          heading: 'What makes it easier',
          cards: [
            { icon: '⏱', title: 'Set a timer', desc: 'Tell yourself "just 5 minutes of breathing first". Most cravings have faded before it goes off, and the decision is different on the other side.' },
            { icon: '🚶', title: 'Change your surroundings', desc: 'Move to a different room, step outside, do something with your hands. Cravings are strongly cue-driven — break the cue.' },
            { icon: '💧', title: 'Drink water, occupy the mouth', desc: 'For smoking and snacking especially, giving your mouth and hands something else to do carries you through the peak.' },
            { icon: '📈', title: 'Track your surfs', desc: 'Notice that you rode it out. Proof that a craving passes without action is what dissolves its power over time.' },
          ],
        },
      ]}
      disclaimer="This article is general education, not medical or addiction treatment. Urge surfing is a helpful skill but it is not a treatment for addiction on its own. For quitting smoking, medication and counselling roughly double your chances. For alcohol or drug dependence, please reach out to a doctor or a support service — withdrawal from some substances can be dangerous and needs medical supervision. Asking for help is the strong move."
      faqs={[
        { q: 'How long does a craving last?', a: 'Most cravings peak and begin to fall within a few minutes, whether or not you act on them. They feel like they will build forever, but they behave like a wave — the key is to outlast the peak rather than believing it will keep rising.' },
        { q: 'What is urge surfing?', a: 'A technique from addiction psychology where you neither fight nor obey a craving. You observe it, notice where you feel it in your body, breathe slowly through it, and watch it rise and fall like a wave until it passes on its own.' },
        { q: 'Does breathing really help with cravings?', a: 'It gives you a concrete thing to do during the few minutes a craving peaks, and slow breathing lowers the stress and restlessness that intensify the urge. It is a genuinely useful skill, though for addiction it works best alongside proper support.' },
        { q: 'Can this help me quit smoking?', a: 'It helps you get through individual cravings, which is a real part of quitting. But for the best odds, combine it with proven help — nicotine replacement or medication plus counselling roughly double your chances of quitting for good.' },
      ]}
      related={[
        { label: 'The physiological sigh', href: '/breathing/physiological-sigh' },
        { label: 'Breathing for anxiety', href: '/breathing/anxiety' },
        { label: 'Fight-or-flight explained', href: '/science/fight-or-flight' },
        { label: 'All guides', href: '/learn' },
      ]}
    />
  );
}
