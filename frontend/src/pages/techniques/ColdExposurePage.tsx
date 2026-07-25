import GuideLayout from '../../components/GuideLayout';

export default function ColdExposurePage() {
  return (
    <GuideLayout
      eyebrow="Breathing & Cold"
      titleTop="How to Breathe in"
      titleAccent="Cold Water & Ice Baths"
      intro="The cold shock response makes you gasp and hyperventilate the instant you hit cold water — and that gasp is exactly what makes cold plunges risky. Learning to control your breath is the difference between a calm, controlled cold exposure and a dangerous one."
      seo={{
        title: 'How to Breathe in an Ice Bath or Cold Shower — Safely',
        description: 'How to control your breathing in cold water and ice baths, manage the cold shock gasp reflex, and the critical safety rule: never hyperventilate before entering water.',
        canonical: '/breathing/cold-exposure',
      }}
      ctaLabel="Practise calm control — free"
      preset={{ inhale: 4, hold: 0, exhale: 6, pause: 2 }}
      presetName="Calm Control"
      notice={{
        title: '⚠️ The rule that keeps cold exposure safe',
        body: 'Do <strong>NOT</strong> do Wim Hof style hyperventilation (rounds of fast deep breaths) and then get into water. Hyperventilating before submersion can cause you to black out underwater with no warning — this combination has killed people. Keep breathing exercises and water strictly separate. Never cold-plunge alone, and skip cold exposure entirely if you have a heart condition, high blood pressure, or are pregnant, without a doctor\'s clearance.',
      }}
      sections={[
        {
          heading: 'The cold shock response',
          paragraphs: [
            'The moment cold water hits your skin, your body triggers the <strong>cold shock response</strong>: an involuntary gasp, followed by rapid, uncontrollable breathing, and a spike in heart rate and blood pressure. This is automatic and it is powerful — it is the most dangerous phase of any cold exposure, and it is what makes falling into cold water so deadly (that gasp underwater is how drowning happens).',
            'It also passes. The cold shock response fades within about <strong>one to three minutes</strong> as your body adapts. The whole skill of cold exposure is staying calm and keeping your breathing under control through that first couple of minutes.',
          ],
        },
        {
          heading: 'Entering the cold',
          steps: [
            { n: '1', label: 'Before entering, breathe normally and calmly — no power breathing', note: '🚫💨' },
            { n: '2', label: 'Enter slowly and deliberately, never jump or dunk your head first', note: '🐢' },
            { n: '3', label: 'The gasp will come — meet it with a long, deliberate exhale', note: 'out' },
            { n: '4', label: 'Keep exhales slow and long until the shock settles (1–3 min)', note: '4-6' },
          ],
          footnote: 'Focusing on the exhale is the trick — the cold shock drives you to gasp IN, so consciously pushing air OUT slowly counteracts it and brings your heart rate down. Once the first couple of minutes pass, breathing becomes much easier.',
        },
        {
          heading: 'Getting the benefits without the risk',
          cards: [
            { icon: '🚿', title: 'Start with cold showers', desc: 'Far safer than a plunge for learning breath control — no submersion, no drowning risk, and you can step out any second.' },
            { icon: '📉', title: 'Progress gradually', desc: 'Shorten how warm and lengthen how cold over weeks. There is no benefit to going colder or longer than you can breathe calmly through.' },
            { icon: '👥', title: 'Never alone in water', desc: 'For any plunge, open water or ice bath you could slip under, have someone present. Non-negotiable.' },
            { icon: '⏲', title: 'Short is enough', desc: 'A few minutes is plenty for the adaptation. Chasing longer times raises risk (including afterdrop) without much added benefit.' },
          ],
        },
      ]}
      disclaimer="This article is general education, not medical advice. Cold water immersion carries real risks — cold shock, cardiac strain, and hypothermia. Never combine breath-hold or hyperventilation techniques with water. Do not cold-plunge alone. If you have any heart condition, high or uncontrolled blood pressure, Raynaud's, or are pregnant, talk to a doctor before starting. Get out immediately if you feel faint, disoriented, or your breathing is out of control."
      faqs={[
        { q: 'How do I breathe in an ice bath?', a: 'Enter slowly and calmly, and when the involuntary gasp hits, meet it with a long, deliberate exhale. Keep your exhales slow and longer than your inhales for the first one to three minutes until the cold shock response settles. Focusing on breathing OUT counteracts the reflex to gasp in.' },
        { q: 'Is it safe to do Wim Hof breathing before an ice bath?', a: 'No — not before entering water. Wim Hof breathing involves hyperventilation, and hyperventilating before submersion can cause a blackout underwater with no warning. This combination has been fatal. Do the breathing separately, on dry land, well away from water.' },
        { q: 'What is the cold shock response?', a: 'An automatic reaction the instant cold water hits your skin: an involuntary gasp, rapid uncontrollable breathing, and a spike in heart rate and blood pressure. It is the most dangerous phase of cold exposure and it fades within about one to three minutes as you adapt.' },
        { q: 'How long should I stay in cold water?', a: 'A few minutes is plenty for the adaptation benefits. Going longer increases the risk of hypothermia and afterdrop without adding much. Never stay in past the point where you can keep your breathing calm and controlled.' },
      ]}
      related={[
        { label: 'Wim Hof Method', href: '/breathing/wim-hof' },
        { label: 'Breath holds & CO₂ tolerance', href: '/breathing/breath-hold' },
        { label: 'Fight-or-flight explained', href: '/science/fight-or-flight' },
        { label: 'All guides', href: '/learn' },
      ]}
    />
  );
}
