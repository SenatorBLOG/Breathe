import GuideLayout from '../../components/GuideLayout';

export default function VagusNervePage() {
  return (
    <GuideLayout
      eyebrow="Breathing Science"
      titleTop="How to Stimulate"
      titleAccent="Your Vagus Nerve"
      intro="The vagus nerve is the brake pedal of your nervous system — and breathing is the only way to press it on demand. Here's what it actually does, what genuinely stimulates it, and what is marketing."
      seo={{
        title: 'How to Stimulate the Vagus Nerve — What Actually Works',
        description: 'The vagus nerve controls your rest-and-digest state. Learn what genuinely stimulates it — slow exhales, humming, cold, breathing at 6 per minute — and what does not.',
        canonical: '/science/vagus-nerve',
      }}
      ctaLabel="Press the brake — free"
      preset={{ inhale: 4, hold: 0, exhale: 8, pause: 1 }}
      presetName="Long Exhale"
      sections={[
        {
          heading: 'What the vagus nerve actually does',
          paragraphs: [
            'The vagus nerve is the longest cranial nerve, wandering ("vagus" means wandering) from your brainstem down through your throat, heart, lungs and gut. It is the main highway of the <strong>parasympathetic</strong> nervous system — the rest-and-digest side that slows your heart, restarts digestion, and calms inflammation.',
            'Roughly 80% of its fibres carry signals <em>upward</em>, from body to brain. That is why bodily interventions like breathing change how you feel so directly: you are not talking yourself into calm, you are sending the brain physical evidence that you are safe.',
            '"Vagal tone" — how responsive that system is — is estimated by <strong>heart rate variability (HRV)</strong>. Higher tone tracks with better stress resilience and recovery.',
          ],
        },
        {
          heading: 'What genuinely stimulates it',
          cards: [
            { icon: '💨', title: 'A long exhale', desc: 'The most reliable lever. Your heart speeds up on the inhale and slows on the exhale — lengthening the out-breath directly increases vagal activity.' },
            { icon: '🌊', title: 'Breathing at ~6 per minute', desc: 'Coherent breathing hits your cardiovascular resonance frequency, where HRV is maximised.' },
            { icon: '🎵', title: 'Humming, chanting, gargling', desc: 'The vagus passes the larynx — vibration in the throat stimulates it. This is why bumble-bee breath works.' },
            { icon: '🧊', title: 'Cold on the face', desc: 'Cold water on the face triggers the dive reflex, a fast parasympathetic response. Real, if unpleasant.' },
          ],
          footnote: 'Notice the pattern: all of these are physical and immediate. None of them require you to feel calm first — that is the point.',
        },
        {
          heading: 'The simplest version that works',
          steps: [
            { n: '1', label: 'Inhale gently through the nose', note: '4s' },
            { n: '2', label: 'Exhale slowly through the mouth — twice as long', note: '8s' },
            { n: '3', label: 'Repeat for two to five minutes', note: '↻' },
          ],
          footnote: 'That is it. A 1:2 inhale-to-exhale ratio is the whole mechanism behind most "vagus nerve exercises" sold as something more complicated.',
        },
        {
          heading: 'Being honest about the hype',
          paragraphs: [
            '"Vagus nerve hacking" has become a wellness industry, and a lot of it oversells. Implanted vagus nerve stimulation is a real medical treatment for epilepsy and treatment-resistant depression — but that is <strong>surgery</strong>, not an app or a supplement, and consumer devices are not the same thing.',
            'What is well supported is modest and useful: slow breathing shifts you toward parasympathetic activity within minutes, and consistent practice improves HRV over weeks. That is worth doing. It is not a cure for a medical condition, and anyone selling it as one is selling something.',
          ],
        },
      ]}
      disclaimer="This article is general education, not medical advice. Vagus nerve stimulation as a medical treatment is a clinical procedure — nothing here is a substitute for care for depression, epilepsy, or any other condition."
      faqs={[
        { q: 'What is the fastest way to stimulate the vagus nerve?', a: 'A long, slow exhale — ideally about twice the length of your inhale. Effects on heart rate appear within a few breaths. Cold water on the face is faster still but far less pleasant.' },
        { q: 'How do I know if it is working?', a: 'The felt signs are a slowing heart, a settling stomach, and shoulders dropping. Measurably, HRV rises during slow breathing; many wearables will show it if you want objective feedback.' },
        { q: 'Does humming really help?', a: 'Yes — the vagus passes close to the larynx, so throat vibration from humming, chanting or gargling stimulates it. It also naturally forces a long exhale, which does most of the work.' },
        { q: 'How long before vagal tone improves?', a: 'Acute calming is immediate. Lasting improvements in HRV generally show up after several weeks of near-daily practice, typically 10–20 minutes a day.' },
      ]}
      related={[
        { label: 'The science of slow breathing', href: '/science/slow-breathing' },
        { label: 'Coherent breathing', href: '/breathing/coherent' },
        { label: 'Fight-or-flight explained', href: '/science/fight-or-flight' },
        { label: 'All guides', href: '/learn' },
      ]}
    />
  );
}
