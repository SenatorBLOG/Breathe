import GuideLayout from '../../components/GuideLayout';

export default function AlternateNostrilPage() {
  return (
    <GuideLayout
      eyebrow="Breathing Technique"
      titleTop="Alternate Nostril"
      titleAccent="Breathing (Nadi Shodhana)"
      intro="Close one nostril, breathe in; close the other, breathe out. A 4,000-year-old yogic technique that turns out to be one of the most reliable ways to steady an agitated mind — and it takes five minutes."
      seo={{
        title: 'Alternate Nostril Breathing (Nadi Shodhana) — How to Do It',
        description: 'Alternate nostril breathing (Nadi Shodhana) step by step: hand position, timing, and what it does for stress and focus. Free guided practice, no signup.',
        canonical: '/breathing/alternate-nostril',
      }}
      ctaLabel="Try a guided session — free"
      preset={{ inhale: 4, hold: 4, exhale: 4, pause: 2 }}
      presetName="Alternate Nostril"
      sections={[
        {
          heading: 'What it is',
          paragraphs: [
            'Nadi Shodhana — "channel cleaning" in Sanskrit — alternates the breath between your left and right nostril using your fingers to close one side at a time. It is a cornerstone of pranayama, the breathing practice of yoga.',
            'You do not need to believe anything about energy channels for it to work. The measurable part is simple: the technique forces a <strong>slow, even, controlled breath</strong> and gives your hands and attention a job, which is a remarkably effective combination for a mind that will not settle.',
          ],
        },
        {
          heading: 'How to do it',
          steps: [
            { n: '1', label: 'Rest your right thumb on your right nostril, ring finger on the left' },
            { n: '2', label: 'Close the right nostril; inhale slowly through the left', note: '4s' },
            { n: '3', label: 'Close both; hold gently', note: '4s' },
            { n: '4', label: 'Release the right; exhale through it', note: '4s' },
            { n: '5', label: 'Inhale right, close, hold, exhale left — that is one full round', note: '↻' },
          ],
          footnote: 'Start with 5 rounds and build up. Never force the breath or strain on the holds — if the hold feels uncomfortable, shorten it or drop it entirely and just alternate sides.',
        },
        {
          heading: 'When it helps most',
          cards: [
            { icon: '🌀', title: 'A mind that will not stop', desc: 'The hand pattern plus the count occupies just enough attention to break a rumination loop.' },
            { icon: '🎯', title: 'Before focused work', desc: 'Balancing and slow — leaves you settled and clear rather than sleepy.' },
            { icon: '🧘', title: 'Before meditation', desc: 'The traditional use: a few rounds first makes sitting still noticeably easier.' },
            { icon: '🌙', title: 'Evening wind-down', desc: 'Drop the holds and lengthen the exhale for a gentler, sleep-friendly version.' },
          ],
        },
      ]}
      disclaimer="This article is general education, not medical advice. Skip the breath holds if you are pregnant or have high blood pressure, and stop if you feel lightheaded. If your nose is blocked, use a different technique rather than forcing airflow."
      faqs={[
        { q: 'Which nostril do I start with?', a: 'Traditionally you start by inhaling through the left nostril. In practice, starting on either side works — consistency matters more than the side you begin on.' },
        { q: 'How long should I practise?', a: 'Five minutes is a solid session, and even 5–10 rounds has a noticeable settling effect. It is a technique where little and often beats one long session.' },
        { q: 'Can I do it without using my hands?', a: 'There is a mental version where you simply imagine the breath moving through alternate sides, which is useful in public. It is gentler, but the physical version is more reliably calming for most people.' },
        { q: 'Is it better than box breathing?', a: 'Different jobs. Box breathing is sharper and better for acute pressure; alternate nostril is more balancing and pairs better with meditation or a restless mind. Try both and keep the one you actually use.' },
      ]}
      related={[
        { label: 'Box Breathing', href: '/breathing/box-breathing' },
        { label: 'Coherent breathing', href: '/breathing/coherent' },
        { label: 'How to breathe during meditation', href: '/breathing/during-meditation' },
        { label: 'All guides', href: '/learn' },
      ]}
    />
  );
}
