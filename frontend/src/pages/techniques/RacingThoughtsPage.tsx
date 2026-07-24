import GuideLayout from '../../components/GuideLayout';

export default function RacingThoughtsPage() {
  return (
    <GuideLayout
      eyebrow="For a Specific Situation"
      titleTop="Racing Thoughts"
      titleAccent="at 3am"
      intro="You're exhausted, but your brain is relitigating a conversation from 2019 and planning tomorrow at the same time. You can't out-think an overthinking brain — but you can change its physical state, and the thoughts follow."
      seo={{
        title: "Can't Sleep With Racing Thoughts? Breathing That Actually Stops It",
        description: 'Overthinking at night keeping you awake? Why you cannot out-think racing thoughts, and the breathing techniques that break the loop from the body up. Free, no signup.',
        canonical: '/breathing/racing-thoughts',
      }}
      ctaLabel="Quiet it down — free"
      preset={{ inhale: 4, hold: 7, exhale: 8, pause: 1 }}
      presetName="4-7-8 Breathing"
      sections={[
        {
          heading: 'Why you cannot think your way out',
          paragraphs: [
            'Racing thoughts at night are not a thinking problem, they are an <strong>arousal</strong> problem. Your nervous system is still switched on, and an activated brain generates thoughts the way a running engine generates noise. Telling yourself to stop thinking is asking the engine to be quiet while it is still running.',
            'Worse, the effort itself backfires: trying not to think about something reliably makes it more present, and then you start worrying about not sleeping — a second layer of stress on top of the first.',
            'The way out is not through your thoughts. Slow breathing lowers the arousal directly, and the mental noise quiets as a <em>consequence</em>. You are turning the engine down rather than arguing with the noise.',
          ],
        },
        {
          heading: 'The 3am protocol',
          steps: [
            { n: '1', label: 'Do not check the time — it starts the "only 4 hours left" spiral', note: '⏰' },
            { n: '2', label: 'Three physiological sighs: double inhale, long slow exhale', note: '×3' },
            { n: '3', label: 'Then 4-7-8: in 4, hold 7, out 8 — four rounds only', note: '4-7-8' },
            { n: '4', label: 'Then stop counting. Just let the exhale stay longer than the inhale', note: '↻' },
          ],
          footnote: 'If you are still wide awake after about 20 minutes, get up and do something dull in dim light until you feel sleepy. Lying in bed frustrated teaches your brain that bed is a place for stress.',
        },
        {
          heading: 'Two things that make it much easier',
          cards: [
            { icon: '📝', title: 'Park the thoughts on paper', desc: 'Keep a notepad by the bed. Writing a worry down tells your brain it is recorded and does not need rehearsing all night.' },
            { icon: '🔢', title: 'Give the mind a job', desc: 'An idle mind fills the space with worry. Counting breaths, or counting backwards from 300 in threes, occupies it without stimulating it.' },
            { icon: '🌡️', title: 'Cool and dark', desc: 'A cooler room genuinely helps sleep onset. Light — especially from a phone — works directly against it.' },
            { icon: '☕', title: 'Check the obvious', desc: 'Afternoon caffeine and evening alcohol both fragment sleep. Alcohol especially: it knocks you out, then wakes you at 3am.' },
          ],
        },
      ]}
      disclaimer="This article is general education, not medical advice. Persistent insomnia — trouble sleeping most nights for over a month — is treatable, and CBT-I (cognitive behavioural therapy for insomnia) is the recommended first-line treatment and works better than sleeping pills. If racing thoughts come with persistent low mood or dread, please speak to a doctor."
      faqs={[
        { q: 'How do I stop overthinking at night?', a: 'Stop trying to stop the thoughts — that makes them louder. Instead change your physical state: slow your breathing so the exhale is longer than the inhale, which lowers arousal directly. The mental noise settles as a result rather than by force of will.' },
        { q: 'Which breathing technique is best for racing thoughts?', a: 'Start with three physiological sighs for the fastest drop in arousal, then move to 4-7-8 for four rounds. The long exhale in both is what does the work.' },
        { q: 'Why do I wake up at 3am specifically?', a: 'Early-morning waking is common and often driven by alcohol, a stress spike in cortisol, or simply lighter sleep in the second half of the night. The waking itself is normal — it becomes a problem when anxiety about being awake keeps you there.' },
        { q: 'Should I get out of bed if I cannot sleep?', a: 'Yes, if you have been awake around 20 minutes and are frustrated. Get up, keep the lights low, do something boring, and return when sleepy. This prevents your brain associating bed with lying awake and worrying.' },
      ]}
      related={[
        { label: '4-7-8 for sleep', href: '/breathing/4-7-8' },
        { label: 'The physiological sigh', href: '/breathing/physiological-sigh' },
        { label: 'Breathwork for deep sleep', href: '/sleep/breathwork-for-deep-sleep' },
        { label: 'Breathing for anxiety', href: '/breathing/anxiety' },
      ]}
    />
  );
}
