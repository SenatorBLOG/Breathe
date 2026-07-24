import GuideLayout from '../../components/GuideLayout';

export default function ButeykoPage() {
  return (
    <GuideLayout
      eyebrow="Breathing Method"
      titleTop="The Buteyko"
      titleAccent="Method"
      intro="Most breathing advice says breathe deeper. Buteyko says the opposite: modern people chronically over-breathe, and the fix is to breathe less, lightly and through the nose. Here's the method — and an honest look at the evidence."
      seo={{
        title: 'The Buteyko Method — Breathe Less, Explained Honestly',
        description: 'What the Buteyko breathing method is, the core exercises, the control pause, and what the evidence actually shows for asthma. Balanced guide, free practice.',
        canonical: '/breathing/buteyko',
      }}
      ctaLabel="Practise light nasal breathing — free"
      preset={{ inhale: 3, hold: 0, exhale: 5, pause: 2 }}
      presetName="Light Breathing"
      notice={{
        title: '⚠️ If you have asthma',
        body: 'Buteyko is sometimes taught alongside asthma care and some trials show people reduce reliever use — but <strong>never reduce or stop asthma medication</strong>, especially preventer inhalers, on your own. Reduced symptoms do not mean reduced airway inflammation. Any medication change is a decision for your doctor. Keep your reliever inhaler with you.',
      }}
      sections={[
        {
          heading: 'The core claim',
          paragraphs: [
            'Konstantin Buteyko, a Soviet physician, argued in the 1950s that many chronic conditions are worsened by <strong>chronic over-breathing</strong> — habitually moving more air than the body needs. Over-breathing lowers carbon dioxide, and low CO₂ makes it harder for haemoglobin to release oxygen into tissues, plus it can narrow airways.',
            'The counterintuitive conclusion: the goal is not deeper breathing but <em>lighter</em> breathing — quiet, slow, nasal, using less air than feels natural at first.',
            'Strip away the more sweeping claims and what remains is genuinely sensible: breathe through your nose, do not habitually gulp air, and raise your tolerance to CO₂.',
          ],
        },
        {
          heading: 'The control pause',
          steps: [
            { n: '1', label: 'Sit and breathe normally for a few minutes', note: '—' },
            { n: '2', label: 'After a normal (not deep) exhale, pinch your nose', note: '👃' },
            { n: '3', label: 'Time until the first definite urge to breathe', note: '⏱' },
            { n: '4', label: 'Release — your first breath in should be calm, not a gasp', note: '✓' },
          ],
          footnote: 'This is the same measurement as the BOLT score. It is a comfort gauge, not a competition — if you gasp on release, you held too long and the number does not count.',
        },
        {
          heading: 'The main practices',
          cards: [
            { icon: '👃', title: 'Nasal breathing, always', desc: 'Day and night, at rest and during easy exercise. The foundation of the whole method.' },
            { icon: '🪶', title: 'Reduced (light) breathing', desc: 'Deliberately breathing a little less than you feel you need — a mild, tolerable air hunger, never distress.' },
            { icon: '🚶', title: 'Small breath holds while walking', desc: 'Exhale, hold for a few steps, resume nasal breathing. Builds CO₂ tolerance gently.' },
            { icon: '🤫', title: 'No sighing or mouth-gulping', desc: 'Habitual big sighs and yawns are treated as over-breathing to be interrupted.' },
          ],
        },
        {
          heading: 'What the evidence honestly says',
          paragraphs: [
            'For <strong>asthma</strong>, this is the strongest area: several trials found Buteyko training reduced symptoms and reliever medication use, and it is acknowledged in some clinical guidance as a technique that may help symptom control. Crucially, trials generally did <em>not</em> show improvement in lung function itself — meaning it changes how breathing feels and is managed, not the underlying inflammation. That is exactly why preventer medication must continue.',
            'For the broader claims — that over-breathing drives a long list of unrelated diseases — the evidence is thin to absent. Treat those with scepticism.',
            'The practical takeaway: nasal breathing and gentle CO₂ tolerance work are worth doing and low risk. The wider theory is not something to bet your health on.',
          ],
        },
      ]}
      disclaimer="This article is general education, not medical advice. Never change asthma or any other medication without your doctor. Stop breath-hold practice if you feel dizzy, and avoid it entirely in water, while driving, or if you are pregnant or have heart or seizure conditions."
      faqs={[
        { q: 'What is the Buteyko method?', a: 'A breathing method developed by Konstantin Buteyko based on the idea that chronic over-breathing harms health. Its practices are strict nasal breathing, deliberately light breathing, and gentle breath holds to raise CO₂ tolerance, tracked with a "control pause" measurement.' },
        { q: 'Does Buteyko work for asthma?', a: 'Several trials found it reduces asthma symptoms and reliever inhaler use, and it is recognised in some guidance as a technique that may help symptom control. However, it does not appear to improve underlying lung function — so it is an addition to medical treatment, never a replacement, and preventer inhalers must continue.' },
        { q: 'What is a good control pause?', a: 'Buteyko practitioners often cite 40 seconds as a target and under 20 as low, but these figures come from within the method rather than independent research. Treat it as a rough personal gauge that you can improve, not a diagnostic number.' },
        { q: 'Is breathing less actually safe?', a: 'Gentle light-breathing practice for a few minutes, seated, is low risk for healthy people — you should feel mild air hunger, never distress or dizziness. It is not appropriate during illness, pregnancy, or if you have heart, blood-pressure or seizure conditions without medical advice.' },
      ]}
      related={[
        { label: 'Nose vs mouth breathing', href: '/breathing/nose-vs-mouth' },
        { label: 'Breath holds & CO₂ tolerance', href: '/breathing/breath-hold' },
        { label: 'Pursed-lip breathing', href: '/breathing/pursed-lip' },
        { label: 'All guides', href: '/learn' },
      ]}
    />
  );
}
