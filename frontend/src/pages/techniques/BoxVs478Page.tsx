import GuideLayout from '../../components/GuideLayout';

export default function BoxVs478Page() {
  return (
    <GuideLayout
      eyebrow="Comparison"
      titleTop="Box Breathing vs"
      titleAccent="4-7-8: which one?"
      intro="Both are famous, both work, and they are built for opposite jobs. Box breathing keeps you alert and steady under pressure; 4-7-8 pushes you toward sleep. Picking the wrong one is why people say breathing 'doesn't work' for them."
      seo={{
        title: 'Box Breathing vs 4-7-8 — Which Technique Should You Use?',
        description: 'Box breathing (4-4-4-4) or 4-7-8? A direct comparison: what each does, when to use which, and why the wrong choice makes breathing feel useless. Try both free.',
        canonical: '/breathing/box-vs-4-7-8',
      }}
      ctaLabel="Try both — free"
      preset={{ inhale: 4, hold: 4, exhale: 4, pause: 4 }}
      presetName="Box Breathing"
      sections={[
        {
          heading: 'The short answer',
          paragraphs: [
            '<strong>Box breathing (4-4-4-4)</strong> has equal inhale and exhale. That balance keeps you alert while lowering agitation — ideal when you need to perform, not relax.',
            '<strong>4-7-8</strong> has an exhale twice as long as the inhale, plus a long hold. That heavily favours the parasympathetic side and makes you drowsy — ideal for sleep, wrong before a presentation.',
            'The rule of thumb worth remembering: <em>equal breath steadies you, long exhale sedates you.</em>',
          ],
        },
        {
          heading: 'Side by side',
          cards: [
            { icon: '🟦', title: 'Box — the pattern', desc: 'In 4, hold 4, out 4, hold 4. Equal on all sides, hence the name. Typically 4–6 rounds.' },
            { icon: '🌙', title: '4-7-8 — the pattern', desc: 'In 4, hold 7, out 8. No pause at the bottom. Usually just 3–4 rounds is enough.' },
            { icon: '🎯', title: 'Box — what it does', desc: 'Steadies heart rate while keeping alertness. Gives a racing mind a simple count to hold.' },
            { icon: '😴', title: '4-7-8 — what it does', desc: 'The long exhale strongly activates rest-and-digest. Genuinely sleep-inducing for most people.' },
          ],
        },
        {
          heading: 'When to use which',
          steps: [
            { n: '🟦', label: 'Before a presentation, interview, exam or hard conversation', note: 'Box' },
            { n: '🟦', label: 'Starting deep work, or mid-day when scattered', note: 'Box' },
            { n: '🌙', label: 'In bed, unable to fall asleep', note: '4-7-8' },
            { n: '🌙', label: 'Waking at 3am with a racing mind', note: '4-7-8' },
            { n: '🌙', label: 'Winding down after a stressful evening', note: '4-7-8' },
          ],
          footnote: 'The classic mistake: using 4-7-8 before something demanding, feeling foggy, and concluding breathing techniques do not work. It worked — it just did the job you asked for.',
        },
        {
          heading: 'If neither suits you',
          paragraphs: [
            'Some people dislike breath holds entirely — they can feel like air hunger, especially if you are anxious. Both of these techniques hold the breath.',
            'In that case use <strong>coherent breathing</strong> instead: five seconds in, five out, no holds at all. It is gentler than both, easy to sustain for 10–20 minutes, and is the better choice for daily practice and blood pressure. For an instant reset with no counting at all, use the <strong>physiological sigh</strong>.',
          ],
        },
      ]}
      disclaimer="This article is general education, not medical advice. Skip or shorten the breath holds if you are pregnant, have high blood pressure, or feel lightheaded — the benefit comes from the slow exhale, not from straining on a hold."
      faqs={[
        { q: 'Which is better, box breathing or 4-7-8?', a: 'Neither is better — they do different jobs. Box breathing (equal counts) keeps you alert and steady, so use it before performance or focused work. 4-7-8 (long exhale) is sedating, so use it for sleep and winding down.' },
        { q: 'Can I use 4-7-8 during the day?', a: 'You can, but expect to feel relaxed and slightly drowsy afterwards. If you need to be sharp, box breathing or coherent breathing is the better choice.' },
        { q: 'Which is better for anxiety?', a: 'Both help, but it depends on the moment. For an acute panic spike where you still need to function, box breathing or a physiological sigh works better. For anxiety at bedtime, 4-7-8 is excellent.' },
        { q: 'How many rounds of each?', a: 'Box breathing: 4–6 rounds, or about 2 minutes. 4-7-8: only 3–4 rounds — it is potent, and more is not better. Stop if you feel lightheaded.' },
      ]}
      related={[
        { label: 'Box Breathing', href: '/breathing/box-breathing' },
        { label: '4-7-8 Breathing', href: '/breathing/4-7-8' },
        { label: 'Coherent breathing', href: '/breathing/coherent' },
        { label: 'The physiological sigh', href: '/breathing/physiological-sigh' },
      ]}
    />
  );
}
