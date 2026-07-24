import GuideLayout from '../../components/GuideLayout';

export default function BreathHoldPage() {
  return (
    <GuideLayout
      eyebrow="Training"
      titleTop="Breath Holds &"
      titleAccent="CO₂ Tolerance"
      intro="The urge to breathe is not your body running out of oxygen — it's carbon dioxide building up. Training that tolerance makes breathing feel easier under stress and exertion. Done wrong, it's genuinely dangerous. Here's both halves."
      seo={{
        title: 'Breath Hold Training & CO₂ Tolerance — How to Do It Safely',
        description: 'How to hold your breath longer: the CO₂ tolerance test, safe breath-hold training, and the hard safety rules. Never practise in or near water.',
        canonical: '/breathing/breath-hold',
      }}
      ctaLabel="Practise calm breathing first — free"
      preset={{ inhale: 4, hold: 4, exhale: 6, pause: 2 }}
      presetName="Controlled Breathing"
      notice={{
        title: '⚠️ Read before you try anything here',
        body: '<strong>Never practise breath holds in or near water</strong> — hyperventilating before a hold causes shallow-water blackout, which kills experienced swimmers every year, without warning. Never practise while driving, standing, or anywhere a faint would injure you. Always sit or lie down. Skip breath-hold training entirely if you are pregnant, or have heart disease, epilepsy, uncontrolled high blood pressure or a history of fainting.',
      }}
      sections={[
        {
          heading: 'Why you feel the urge to breathe',
          paragraphs: [
            'Hold your breath and the panic that builds is not oxygen running out — you have plenty left. It is <strong>rising carbon dioxide</strong>. Receptors detect the CO₂ increase and trigger the urge to breathe long before oxygen becomes a real problem.',
            'How early that alarm fires varies between people, and it is trainable. Someone with low CO₂ tolerance feels breathless sooner: during exercise, when stressed, or when speaking in public. Someone with higher tolerance stays comfortable longer in the same conditions.',
            'This is why the training is worth anything at all — the goal is not a party trick. It is a calmer response to the sensation of breathlessness, which shows up in sport, anxiety, and panic.',
          ],
        },
        {
          heading: 'The CO₂ tolerance test (BOLT)',
          steps: [
            { n: '1', label: 'Sit down and breathe normally for a few minutes', note: '—' },
            { n: '2', label: 'After a normal exhale, pinch your nose and start a timer', note: '▶' },
            { n: '3', label: 'Stop the timer at the FIRST definite urge to breathe', note: '⏱' },
            { n: '4', label: 'Your next breath should be calm — if you gasp, you held too long', note: '✓' },
          ],
          footnote: 'This is a comfort measurement, not a maximum hold. Under ~10 seconds suggests low tolerance; 20–40 seconds is a common comfortable range. Re-test occasionally, not daily — chasing the number defeats the point.',
        },
        {
          heading: 'Safe ways to train it',
          cards: [
            { icon: '🚶', label: '', title: 'Walking holds', desc: 'Exhale, then walk while holding until a moderate urge. Breathe normally for a minute. Repeat a handful of times.' },
            { icon: '🌊', title: 'Extended exhales', desc: 'A 1:2 inhale-to-exhale ratio gently raises CO₂ tolerance with none of the risk. The safest option by far.' },
            { icon: '🧘', title: 'Box breathing', desc: 'The 4-4-4-4 holds are short and controlled — a mild, sustainable version of the same training.' },
            { icon: '📉', title: 'Light breathing', desc: 'Deliberately breathing a little less than you feel you need, gently, for a few minutes. Uncomfortable, never distressing.' },
          ],
          footnote: 'Notice what is absent: maximum-effort holds after hyperventilation. That combination is what causes blackouts, and it has no benefit over the methods above.',
        },
        {
          heading: 'What this does not do',
          paragraphs: [
            'Breath-hold training does not increase your lung capacity in any meaningful sense, and it will not make you fitter. What changes is your <strong>tolerance to the sensation</strong> — you stop panicking as CO₂ rises.',
            'That is a genuinely useful adaptation for runners, swimmers, singers and anxious people. But if you find yourself chasing a longer number for its own sake, you have left the useful part behind and moved to the risky part.',
          ],
        },
      ]}
      disclaimer="This article is general education, not medical advice. Breath-hold training carries real risk of fainting. Never do it in water, while driving, or while standing. Stop immediately if you feel dizzy, and speak with a doctor before starting if you have any heart, lung, blood-pressure or neurological condition, or are pregnant."
      faqs={[
        { q: 'How do I hold my breath longer?', a: 'By raising CO₂ tolerance gradually — extended exhales, box breathing, and gentle walking holds. Avoid the popular advice to hyperventilate first: it delays the urge to breathe without adding oxygen, which is precisely how blackouts happen.' },
        { q: 'What is a good BOLT score?', a: 'Measured to the first definite urge to breathe (not your maximum), under about 10 seconds suggests low tolerance, and 20–40 seconds is a common comfortable range. Treat it as a rough gauge, not a target to chase.' },
        { q: 'Is breath holding dangerous?', a: 'It can be. In or near water it is potentially fatal — hyperventilating before a hold causes shallow-water blackout with no warning. On dry land, sitting or lying down, gentle holds are low risk for healthy people, but skip them if you are pregnant or have heart, blood-pressure or seizure conditions.' },
        { q: 'Does it increase lung capacity?', a: 'Not meaningfully. Lung volume is largely fixed by anatomy. What improves is your tolerance to rising CO₂ — you feel breathless later and panic less, which is the actual benefit.' },
      ]}
      related={[
        { label: 'Wim Hof Method', href: '/breathing/wim-hof' },
        { label: 'Breathing while running', href: '/breathing/running' },
        { label: 'Box Breathing', href: '/breathing/box-breathing' },
        { label: 'All guides', href: '/learn' },
      ]}
    />
  );
}
