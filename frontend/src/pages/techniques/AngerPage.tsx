import GuideLayout from '../../components/GuideLayout';

export default function AngerPage() {
  return (
    <GuideLayout
      eyebrow="For a Specific Situation"
      titleTop="How to Calm Down"
      titleAccent="When You're Angry"
      intro="Anger dumps adrenaline into your body faster than you can think your way out of it — pounding heart, hot face, clenched jaw, the urge to say the thing you'll regret. You can't reason with that state, but you can drain it, and the exhale is the valve."
      seo={{
        title: "How to Calm Down When Angry — Breathing That Actually Works",
        description: 'Breathing exercises to calm anger fast: why the long exhale drains adrenaline, the 90-second rule, and what to do before you say something you regret. Free, no signup.',
        canonical: '/breathing/anger',
      }}
      ctaLabel="Cool down — free"
      preset={{ inhale: 4, hold: 0, exhale: 8, pause: 1 }}
      presetName="Long Exhale"
      sections={[
        {
          heading: 'The 90-second window',
          paragraphs: [
            'The raw chemical surge of anger — the adrenaline flood — actually moves through your body in about <strong>90 seconds</strong> if you let it. What keeps anger burning for minutes or hours after that is not the chemistry, it is the <em>story</em>: replaying what they said, rehearsing your comeback, feeding the fire with thought.',
            'That is the practical opening. If you can avoid acting for 90 seconds and stop feeding the story, the physical charge drops on its own. Breathing gives you something to do in that window other than react — and the long exhale actively speeds the drain.',
          ],
        },
        {
          heading: 'What to do in the moment',
          steps: [
            { n: '1', label: 'Say nothing yet. The urge to speak now is the adrenaline talking', note: '🤐' },
            { n: '2', label: 'Exhale long and slow — much longer than the inhale', note: '4-8' },
            { n: '3', label: 'Unclench your jaw and drop your shoulders on each out-breath', note: '↓' },
            { n: '4', label: 'Six of those breaths — about 90 seconds — before you respond', note: '×6' },
          ],
          footnote: 'If you can, physically step away — a walk, another room, even the bathroom. Distance plus breath works far better than either alone. "I need a minute" is a complete sentence.',
        },
        {
          heading: 'Why the long exhale specifically',
          paragraphs: [
            'Anger is a high-arousal, sympathetic-nervous-system state — the same fight-or-flight response as fear, just pointed outward. Your heart rate is up, ready for confrontation.',
            'Your heart speeds up slightly on every inhale and slows on every exhale. By making the <strong>exhale much longer than the inhale</strong>, you tilt that balance toward the parasympathetic brake, and heart rate — the engine of the angry feeling — comes down. Box breathing works too, but when you are genuinely hot, the simple long exhale is easier to actually do.',
          ],
        },
        {
          heading: 'Building a longer fuse',
          cards: [
            { icon: '🔁', title: 'Practise when calm', desc: 'A technique you have never rehearsed will not show up mid-argument. Two minutes of long exhales daily makes it available when you need it.' },
            { icon: '🚶', title: 'Have an exit line ready', desc: 'Decide in advance what you say to buy time — "let me think and come back to this" — so you are not composing it while furious.' },
            { icon: '💤', title: 'Check the basics', desc: 'Poor sleep, hunger and alcohol all shorten your fuse dramatically. Sometimes the anger problem is a sleep problem.' },
            { icon: '📓', title: 'Notice the early signs', desc: 'Clenched jaw, held breath, heat in the face come before the outburst. Catching them early is far easier than stopping a full surge.' },
          ],
        },
      ]}
      disclaimer="This article is general education, not medical or psychological advice. If anger regularly damages your relationships, work, or leads to any aggression toward others, that is worth taking seriously — anger management and therapy help, and reaching out is a strength, not a failure. If you ever feel you might hurt someone, step away and seek help immediately."
      faqs={[
        { q: 'How do I calm down when angry fast?', a: 'Do not act or speak for about 90 seconds — the raw chemical surge of anger passes in roughly that time if you stop feeding it. Breathe with a long, slow exhale (twice the length of the inhale), unclench your jaw, and step away if you can. Then respond.' },
        { q: 'Why does breathing help with anger?', a: 'Anger is a fight-or-flight state with a raised heart rate. A long exhale activates the parasympathetic "brake" and slows the heart, which lowers the physical intensity of the feeling — you literally drain some of the charge that makes you want to lash out.' },
        { q: 'What is the 90-second rule?', a: 'The idea that the physiological wave of an emotion like anger moves through the body in about 90 seconds. Anything lasting longer is sustained by your thoughts — replaying the trigger — rather than the original chemistry. Ride out the 90 seconds without reacting and the surge subsides.' },
        { q: 'Is box breathing or long-exhale breathing better for anger?', a: 'Both help. Box breathing gives an agitated mind a steady count to hold; a simple long exhale is often easier to actually perform when you are very heated. Try both when calm and keep whichever you can reach for in the moment.' },
      ]}
      related={[
        { label: 'Fight-or-flight explained', href: '/science/fight-or-flight' },
        { label: 'Breathing for anxiety', href: '/breathing/anxiety' },
        { label: 'The physiological sigh', href: '/breathing/physiological-sigh' },
        { label: 'All guides', href: '/learn' },
      ]}
    />
  );
}
