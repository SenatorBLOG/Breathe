import GuideLayout from '../../components/GuideLayout';

export default function PursedLipPage() {
  return (
    <GuideLayout
      eyebrow="Breathing & Health"
      titleTop="Pursed-Lip"
      titleAccent="Breathing"
      intro="Breathe out slowly through lips pursed as if cooling soup. It's the technique respiratory therapists teach first for breathlessness — it keeps airways open longer so trapped air can escape, and it works in seconds."
      seo={{
        title: 'Pursed-Lip Breathing — Technique for Shortness of Breath',
        description: 'Pursed-lip breathing step by step: how it eases shortness of breath by keeping airways open longer. Widely taught for COPD and breathlessness. Free guided practice.',
        canonical: '/breathing/pursed-lip',
      }}
      ctaLabel="Practise a slow exhale — free"
      preset={{ inhale: 2, hold: 0, exhale: 4, pause: 1 }}
      presetName="Pursed-Lip Rhythm"
      notice={{
        title: '🩺 If you have a lung condition',
        body: 'Pursed-lip breathing is commonly taught by respiratory teams and is generally safe, but it <strong>supports</strong> treatment — it never replaces prescribed inhalers, oxygen or medication. <strong>Sudden or severe breathlessness is an emergency</strong>: seek urgent care, especially with chest pain, blue lips, confusion, or if a rescue inhaler is not working.',
      }}
      sections={[
        {
          heading: 'What it does',
          paragraphs: [
            'In conditions like COPD, and during any breathless episode, the problem is often not getting air <em>in</em> — it is getting stale air <em>out</em>. Airways can collapse during exhalation, trapping air in the lungs. Each new breath then has less room, and you feel increasingly starved for air.',
            'Pursing your lips creates gentle back-pressure. That pressure <strong>splints the airways open</strong> a little longer, so more trapped air escapes on each breath. It also naturally slows your breathing rate, which alone reduces the panic that makes breathlessness worse.',
          ],
        },
        {
          heading: 'How to do it',
          steps: [
            { n: '1', label: 'Relax your neck and shoulders — let them drop', note: '—' },
            { n: '2', label: 'Breathe in gently through your nose, mouth closed', note: '2s' },
            { n: '3', label: 'Purse your lips as if about to whistle or cool hot soup', note: '👄' },
            { n: '4', label: 'Breathe out slowly and steadily through pursed lips', note: '4s' },
          ],
          footnote: 'The exhale should be roughly twice as long as the inhale — but never forced. Do not push the air out; let it flow. Straining defeats the purpose.',
        },
        {
          heading: 'When to use it',
          cards: [
            { icon: '🪜', title: 'During exertion', desc: 'Climbing stairs, carrying shopping, walking uphill. Many people find breathing out on the effort makes it noticeably easier.' },
            { icon: '😮‍💨', title: 'A breathless episode', desc: 'Sit down, drop the shoulders, and settle into the rhythm. It slows the breathing rate that panic speeds up.' },
            { icon: '😰', title: 'Breathlessness with anxiety', desc: 'Breathlessness causes panic and panic worsens breathlessness. This breaks the loop at the physical end.' },
            { icon: '🏃', title: 'Recovering after effort', desc: 'A structured way to return to a normal breathing rate instead of gasping.' },
          ],
        },
      ]}
      disclaimer="This article is general education, not medical advice, and Breathe is a wellness app, not a medical device. If you have COPD, asthma or any lung condition, follow the plan your respiratory team gave you. Seek urgent medical help for sudden severe breathlessness, chest pain, blue lips or confusion."
      faqs={[
        { q: 'What is pursed-lip breathing?', a: 'Breathing in gently through the nose and out slowly through lips pursed as if whistling or cooling soup, with the exhale about twice as long as the inhale. It is one of the first techniques respiratory therapists teach for breathlessness.' },
        { q: 'How does it help shortness of breath?', a: 'The pursed lips create gentle back-pressure that holds the airways open longer during exhalation, so more trapped air escapes and there is more room for the next breath. It also slows your breathing rate, which reduces panic.' },
        { q: 'How often should I do it?', a: 'Use it whenever you feel breathless, and during activities that make you breathless such as stairs. Practising a few minutes a day when you are calm makes it easier to use when you actually need it.' },
        { q: 'Is it only for people with COPD?', a: 'No. It is widely taught in COPD care, but the same mechanism helps anyone who is breathless — after exertion, during anxiety, or while recovering from a respiratory illness.' },
      ]}
      related={[
        { label: 'Belly breathing', href: '/breathing/belly-breathing' },
        { label: 'Breathing for anxiety', href: '/breathing/anxiety' },
        { label: 'What is sleep apnea?', href: '/sleep/what-is-sleep-apnea' },
        { label: 'All guides', href: '/learn' },
      ]}
    />
  );
}
