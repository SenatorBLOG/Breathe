import GuideLayout from '../../components/GuideLayout';

export default function NoseVsMouthPage() {
  return (
    <GuideLayout
      eyebrow="Breathing Basics"
      titleTop="Nose vs Mouth"
      titleAccent="Breathing"
      intro="Your nose is not just a hole for air. It filters, warms, humidifies and adds nitric oxide — none of which your mouth does. Here's what the difference actually costs you, and when mouth breathing is fine."
      seo={{
        title: 'Nose vs Mouth Breathing — Why It Matters and How to Switch',
        description: 'Nose breathing filters, warms and humidifies air and boosts nitric oxide; mouth breathing dries and over-ventilates. What the difference means and how to switch.',
        canonical: '/breathing/nose-vs-mouth',
      }}
      ctaLabel="Practise nasal breathing — free"
      preset={{ inhale: 4, hold: 0, exhale: 6, pause: 2 }}
      presetName="Nasal Belly Breathing"
      sections={[
        {
          heading: 'What your nose does that your mouth cannot',
          cards: [
            { icon: '🧹', title: 'Filters', desc: 'Nasal hairs and mucus trap dust, pollen and particles before they reach your lungs.' },
            { icon: '🌡️', title: 'Warms and humidifies', desc: 'Air arrives at body temperature and moisture — much gentler on the airways, especially in cold weather.' },
            { icon: '💨', title: 'Adds nitric oxide', desc: 'Your sinuses release nitric oxide, which widens blood vessels and improves oxygen uptake in the lungs.' },
            { icon: '🐢', title: 'Slows you down', desc: 'The nose has more resistance, which naturally paces your breathing and discourages over-breathing.' },
          ],
        },
        {
          heading: 'What chronic mouth breathing costs',
          paragraphs: [
            'Occasional mouth breathing is harmless — during hard exercise it is necessary. The problems come from breathing through the mouth <strong>by default</strong>, all day and all night.',
            'A dry mouth overnight raises the risk of tooth decay and gum disease because saliva, which protects your teeth, evaporates. Mouth breathing during sleep is also associated with snoring and disrupted, less restorative rest — you may sleep eight hours and still wake tired.',
            'It also encourages faster, shallower, upper-chest breathing, which is the same pattern your body uses when anxious. That keeps a low-grade stress signal running in the background all day.',
          ],
        },
        {
          heading: 'How to switch to nasal breathing',
          steps: [
            { n: '1', label: 'Start at rest — sitting, reading, walking. Not during hard exercise', note: '—' },
            { n: '2', label: 'Practise slow nasal belly breathing a few minutes a day', note: '4-6' },
            { n: '3', label: 'On easy runs, use nose-only as a pace check — if you cannot, slow down', note: '🏃' },
            { n: '4', label: 'Treat the cause if your nose is genuinely blocked — see below', note: '👃' },
          ],
          footnote: 'Do not force nose-only breathing at high effort. If you are gasping, your body needs more airflow than the nose can deliver — that is physiology, not a lack of discipline.',
        },
        {
          heading: 'When mouth breathing is the right call',
          cards: [
            { icon: '🔥', title: 'Hard exercise', desc: 'Intervals, hills, racing — open the mouth. Restricting airflow costs performance and gains nothing.' },
            { icon: '🤧', title: 'A blocked nose', desc: 'Congestion from a cold or allergies means you breathe through your mouth. Fix the blockage, do not fight it.' },
            { icon: '😮‍💨', title: 'Long-exhale techniques', desc: 'Many calming methods (4-7-8, physiological sigh) deliberately exhale through the mouth.' },
            { icon: '🗣️', title: 'Talking and singing', desc: 'Obviously. Nasal breathing is a default to return to, not a rule to obey.' },
          ],
        },
      ]}
      disclaimer="This article is general education, not medical advice. Persistent nasal blockage, loud snoring, or waking unrefreshed are worth a doctor's attention — a deviated septum, allergies or sleep apnea are all common and treatable. Do not tape your mouth shut at night without medical guidance, particularly if you may have sleep apnea."
      faqs={[
        { q: 'Is nose breathing really better?', a: 'At rest, yes — it filters, warms and humidifies the air, adds nitric oxide, and naturally slows your breathing rate. During hard exercise the nose cannot move enough air, and mouth breathing is appropriate.' },
        { q: 'How do I stop mouth breathing at night?', a: 'First find out why it happens: allergies, congestion, a deviated septum or sleep apnea all force mouth breathing. Treating the cause is the answer. Mouth taping is popular online but can be dangerous with undiagnosed sleep apnea — ask a doctor first.' },
        { q: 'What is nitric oxide and why does it matter?', a: 'Your sinuses produce nitric oxide, which you inhale into the lungs when breathing nasally. It widens blood vessels and improves the efficiency of oxygen transfer — a benefit you skip entirely when breathing through the mouth.' },
        { q: 'Can I retrain myself to breathe through my nose?', a: 'Yes, for most people. Practise nasal breathing at rest for a few minutes daily, use it as a pace gauge on easy runs, and it gradually becomes the default. If your nose is structurally blocked, no amount of practice fixes it — that needs a doctor.' },
      ]}
      related={[
        { label: 'Belly breathing', href: '/breathing/belly-breathing' },
        { label: 'Breathing while running', href: '/breathing/running' },
        { label: 'What is sleep apnea?', href: '/sleep/what-is-sleep-apnea' },
        { label: 'All guides', href: '/learn' },
      ]}
    />
  );
}
