import GuideLayout from '../../components/GuideLayout';

export default function DuringMeditationPage() {
  return (
    <GuideLayout
      eyebrow="Getting Started"
      titleTop="How to Breathe"
      titleAccent="During Meditation"
      intro="Almost every beginner asks this, and the answer surprises them: mostly, you don't. Meditation is about watching the breath, not managing it — and the moment you try to breathe 'correctly', you have stopped meditating and started performing."
      seo={{
        title: 'How to Breathe During Meditation — The Beginner Question, Answered',
        description: 'Should you control your breath while meditating? Why watching beats managing, what to do when breathing feels awkward, and simple anchors for beginners. Free.',
        canonical: '/breathing/during-meditation',
      }}
      ctaLabel="Start with a guided breath — free"
      preset={{ inhale: 5, hold: 0, exhale: 5, pause: 1 }}
      presetName="Coherent Breathing"
      sections={[
        {
          heading: 'Watching vs controlling',
          paragraphs: [
            'There are two different practices, and mixing them up is the most common beginner confusion.',
            '<strong>Pranayama / breathwork</strong> means deliberately shaping the breath — box breathing, 4-7-8, alternate nostril. You are doing something to your physiology.',
            '<strong>Meditation</strong> generally means using the breath as an <em>anchor for attention</em>. You let the body breathe itself and simply notice it. Nothing is being fixed or optimised.',
            'Both are worthwhile. But if you sit down to meditate and spend the session managing your inhale length, you have quietly swapped one for the other — and it usually makes you tense rather than settled.',
          ],
        },
        {
          heading: 'The awkward-breathing problem',
          paragraphs: [
            'Nearly everyone hits this: the moment you pay attention to your breath, it stops feeling automatic. It gets stilted, too deep, or you suddenly feel you must consciously run it. This is normal and it passes.',
            'The trick is not to fight it. <strong>Let it be awkward.</strong> Observe the awkwardness itself with the same curiosity — "ah, my breathing feels forced right now". Within a minute or two the autopilot usually takes back over, because you stopped interfering.',
            'If it stays uncomfortable, move your anchor. The breath is the traditional one, not a mandatory one.',
          ],
        },
        {
          heading: 'Practical anchors that work',
          cards: [
            { icon: '👃', title: 'The nostril sensation', desc: 'The subtlest anchor: cool air in, warmer air out, right at the nose tip. Small enough that attention has to stay sharp.' },
            { icon: '🫁', title: 'The belly rising', desc: 'A larger, easier target for restless minds. Feel the rise and fall rather than watching airflow.' },
            { icon: '🔢', title: 'Counting exhales 1–10', desc: 'Count each exhale up to ten, then start again. Lost count? That is the practice — begin at one, no self-criticism.' },
            { icon: '🔊', title: 'Sound instead of breath', desc: 'If breath focus makes you anxious — common with panic history — use ambient sound as the anchor. Equally valid.' },
          ],
        },
        {
          heading: 'A simple way to start',
          steps: [
            { n: '1', label: 'Sit upright but not rigid; hands wherever is comfortable', note: '—' },
            { n: '2', label: 'Take three deliberate slow breaths to settle in', note: '×3' },
            { n: '3', label: 'Then stop controlling. Let the body breathe on its own', note: '↓' },
            { n: '4', label: 'Rest attention on one anchor; when it wanders, return — that IS the exercise', note: '↻' },
          ],
          footnote: 'A wandering mind is not failure. Noticing you wandered and coming back is the entire repetition — like a rep in the gym. A session with fifty wanderings and fifty returns is a good session.',
        },
      ]}
      disclaimer="This article is general education, not medical advice. If focusing on your breath triggers anxiety or panic — which happens for some people, particularly with a trauma or panic history — use a different anchor such as sound or the feeling of your feet, and consider working with a teacher or therapist experienced in this."
      faqs={[
        { q: 'Should I control my breathing during meditation?', a: 'Generally no. Take a few deliberate breaths to settle, then let the body breathe by itself and simply observe. Deliberately shaping the breath is breathwork — also valuable, but a different practice with a different goal.' },
        { q: 'Why does my breathing feel weird when I focus on it?', a: 'Because attention temporarily interferes with an automatic process. It is extremely common and harmless. Let it be awkward without correcting it and the autopilot usually returns within a minute or two.' },
        { q: 'Should I breathe through my nose while meditating?', a: 'Yes, if it is comfortable — nasal breathing is naturally slower and quieter, which suits sitting practice. If your nose is blocked, breathe through your mouth rather than straining.' },
        { q: 'How fast should I breathe when meditating?', a: 'Whatever pace your body chooses. It usually slows on its own as you settle. If you would rather practise a deliberate rhythm, that is breathwork — try coherent breathing at five in, five out.' },
      ]}
      related={[
        { label: 'Coherent breathing', href: '/breathing/coherent' },
        { label: 'Alternate nostril breathing', href: '/breathing/alternate-nostril' },
        { label: 'Belly breathing', href: '/breathing/belly-breathing' },
        { label: 'All guides', href: '/learn' },
      ]}
    />
  );
}
