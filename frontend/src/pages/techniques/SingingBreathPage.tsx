import GuideLayout from '../../components/GuideLayout';

export default function SingingBreathPage() {
  return (
    <GuideLayout
      eyebrow="Breathing & Voice"
      titleTop="Breath Support"
      titleAccent="for Singing"
      intro="Running out of air before the end of a phrase, a wobbly held note, a voice that tires fast — almost always a breathing problem, not a talent problem. Good singing runs on the diaphragm and a slow, controlled release of air. Here's how to build it."
      seo={{
        title: 'Breathing for Singing — Breath Support & Control Explained',
        description: 'Breath support for singing: diaphragmatic breathing, appoggio, and exercises to control the exhale so you never run out of air mid-phrase. Free guided practice.',
        canonical: '/breathing/for-singing',
      }}
      ctaLabel="Train your exhale control — free"
      preset={{ inhale: 2, hold: 0, exhale: 8, pause: 1 }}
      presetName="Exhale Control"
      sections={[
        {
          heading: 'Support is about the exhale, not the inhale',
          paragraphs: [
            'Most beginners think breath support means taking a huge breath. It does not. You can gulp all the air in the room and still run out mid-phrase if you dump it all in the first two seconds. <strong>Support is controlling the release</strong> — letting air out slowly and steadily so a long phrase gets an even supply from start to finish.',
            'The engine is the <strong>diaphragm</strong>. Singing from the chest and throat produces a thin, tense, quickly tiring voice. Singing on a low, diaphragmatic breath gives the sound a steady foundation and takes the strain off your vocal cords.',
          ],
        },
        {
          heading: 'Find the breath first',
          steps: [
            { n: '1', label: 'Hand on your belly. Breathe in low — the belly moves out, shoulders stay still', note: '👐' },
            { n: '2', label: 'The ribs expand sideways too — think "wide", not "up"', note: '↔' },
            { n: '3', label: 'Now hiss out on a steady "sss" — long, even, controlled', note: '8s+' },
            { n: '4', label: 'Feel the gentle resistance in your midsection holding the air back', note: '🎯' },
          ],
          footnote: 'That controlled resistance — the inhale muscles still gently working as you exhale — is the classical idea of "appoggio". It is what stops you collapsing all your air at once.',
        },
        {
          heading: 'Exercises that build control',
          cards: [
            { icon: '🐍', title: 'The hiss', desc: 'Inhale low, then hiss "sss" as long and evenly as you can. Time it. A steady, unwavering hiss = steady breath support.' },
            { icon: '💨', title: 'Lip trills', desc: 'Blow a raspberry through relaxed lips on a pitch. It forces steady airflow and releases throat tension at once.' },
            { icon: '📏', title: 'Numbers on one breath', desc: 'Count out loud, evenly, as far as you can on a single breath. Track the number over weeks as control grows.' },
            { icon: '🎵', title: 'Messa di voce', desc: 'Hold one note and swell it soft-loud-soft. A demanding test of managing air pressure — advanced but revealing.' },
          ],
        },
        {
          heading: 'Common mistakes',
          paragraphs: [
            'Watch for the two big ones. <strong>Raising your shoulders</strong> on the inhale means you are breathing high into the chest — shallow and unsupported. And <strong>pushing or squeezing</strong> to force volume strains the cords; power comes from steady airflow and resonance, not from shoving.',
            'If you feel tightness or pain in your throat, stop. Good technique should feel efficient and open, never forced. Persistent hoarseness is worth taking to a doctor or a singing teacher.',
          ],
        },
      ]}
      disclaimer="This article is general education, not vocal-health or medical advice. Never sing through pain. Persistent hoarseness, vocal fatigue or loss of range lasting more than two weeks should be checked by a doctor or an ENT — vocal-cord problems are common and treatable, and pushing through them can make them worse."
      faqs={[
        { q: 'What is breath support in singing?', a: 'Controlling the release of air so a long phrase gets a steady, even supply from start to finish. It comes from the diaphragm and the surrounding muscles gently holding the air back, not from taking a bigger breath. The skill is in the slow, controlled exhale.' },
        { q: 'How do I stop running out of breath when singing?', a: 'Stop focusing on inhaling more and start controlling the exhale. Practise hissing or lip trills for as long and evenly as you can, breathe low into the belly rather than the chest, and let the air out gradually instead of dumping it in the first second of the phrase.' },
        { q: 'What is appoggio?', a: 'A classical singing concept where the muscles used for inhaling stay gently engaged as you exhale, creating a controlled resistance. That balance lets you release air slowly and evenly, which is the heart of breath support.' },
        { q: 'Should I breathe through my nose or mouth when singing?', a: 'Usually the mouth (and nose together) between phrases, because it is faster and quieter for a quick catch-breath. The priority is a low, relaxed, diaphragmatic breath — how you take it in matters less than keeping it low and releasing it with control.' },
      ]}
      related={[
        { label: 'Belly breathing', href: '/breathing/belly-breathing' },
        { label: 'Before public speaking', href: '/breathing/public-speaking' },
        { label: 'Nose vs mouth breathing', href: '/breathing/nose-vs-mouth' },
        { label: 'All guides', href: '/learn' },
      ]}
    />
  );
}
