import GuideLayout from '../../components/GuideLayout';

export default function NauseaPage() {
  return (
    <GuideLayout
      eyebrow="Breathing & Health"
      titleTop="Breathing for"
      titleAccent="Nausea & Queasiness"
      intro="Slow, controlled breathing is one of the simplest things that genuinely eases nausea — it is used in hospitals for post-operative and chemotherapy sickness. It won't fix the cause, but when you feel queasy and stuck, it's a tool that costs nothing and often helps within a minute."
      seo={{
        title: 'Breathing for Nausea — Slow Breathing to Ease Queasiness',
        description: 'How slow controlled breathing eases nausea and motion sickness, why it works, and a simple technique to try. Used clinically for post-op and chemo nausea. Free.',
        canonical: '/breathing/nausea',
      }}
      ctaLabel="Ease it slowly — free"
      preset={{ inhale: 4, hold: 0, exhale: 6, pause: 2 }}
      presetName="Slow Belly Breathing"
      sections={[
        {
          heading: 'Why breathing helps nausea',
          paragraphs: [
            'Nausea is partly driven by your autonomic nervous system — the same system that governs stress. Anxiety and nausea feed each other: feeling sick makes you anxious, and anxiety makes the sick feeling worse. Slow breathing interrupts that loop by shifting you toward the calm, rest-and-digest side.',
            'It is not folk wisdom. Controlled slow breathing is used clinically to reduce <strong>post-operative nausea</strong> and <strong>chemotherapy-related nausea</strong>, and studies have found it can lessen queasiness meaningfully. Slow paced breathing at around 6 breaths per minute is the pattern most often studied.',
          ],
        },
        {
          heading: 'What to do when you feel sick',
          steps: [
            { n: '1', label: 'Get fresh, cool air if you can — a window, a fan, outside', note: '🌬' },
            { n: '2', label: 'Breathe low into the belly, slowly, through the nose', note: '4s' },
            { n: '3', label: 'Exhale longer than you inhale — gently, never forced', note: '6s' },
            { n: '4', label: 'Keep your gaze on something still if the room feels unsteady', note: '👁' },
          ],
          footnote: 'Do not breathe fast or deep — over-breathing can make nausea and lightheadedness worse. Slow and small is the goal. If the smell of anything is triggering it, breathe through your mouth instead.',
        },
        {
          heading: 'Different kinds of nausea',
          cards: [
            { icon: '🚗', title: 'Motion sickness', desc: 'Slow breathing plus a steady gaze on the horizon (or a fixed distant point) reduces the sensory conflict that causes it.' },
            { icon: '😰', title: 'Anxiety nausea', desc: 'When nerves turn your stomach, this is where breathing works best — you are treating the actual cause.' },
            { icon: '🏥', title: 'Post-op or treatment nausea', desc: 'A recognised adjunct alongside anti-sickness medication. Use both; do not skip the meds.' },
            { icon: '🤰', title: 'Morning sickness', desc: 'Gentle slow breathing plus fresh air can take the edge off, though it will not stop pregnancy nausea entirely.' },
          ],
        },
      ]}
      disclaimer="This article is general education, not medical advice. Nausea can signal something that needs attention. Seek medical care if it is severe or persistent, comes with a bad headache, chest pain, a stiff neck, blood in vomit, severe abdominal pain, or signs of dehydration — and follow your doctor's advice for treatment-related or pregnancy nausea."
      faqs={[
        { q: 'Can breathing exercises help nausea?', a: 'Yes. Slow, controlled breathing shifts your nervous system toward its calm state and can meaningfully reduce queasiness. It is used clinically for post-operative and chemotherapy nausea. It eases the symptom rather than curing the cause.' },
        { q: 'How should I breathe to reduce nausea?', a: 'Slowly and low into the belly, with the exhale a little longer than the inhale, at roughly six breaths per minute. Cool fresh air helps a lot. Avoid fast or deep breathing — over-breathing can make nausea worse.' },
        { q: 'Does breathing help motion sickness?', a: 'It can. Slow breathing calms the nausea response, and pairing it with a steady gaze on the horizon or a fixed distant point reduces the sensory mismatch that causes motion sickness in the first place.' },
        { q: 'When should I see a doctor about nausea?', a: 'If nausea is severe, persistent, or comes with a severe headache, stiff neck, chest pain, blood in vomit, intense abdominal pain, or dehydration. Breathing is a comfort tool, not a substitute for care when something is genuinely wrong.' },
      ]}
      related={[
        { label: 'Coherent breathing', href: '/breathing/coherent' },
        { label: 'Breathing for anxiety', href: '/breathing/anxiety' },
        { label: 'Belly breathing', href: '/breathing/belly-breathing' },
        { label: 'All guides', href: '/learn' },
      ]}
    />
  );
}
