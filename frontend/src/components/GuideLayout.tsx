// src/components/GuideLayout.tsx
//
// Shared layout for content/guide pages. The first 19 guides were each a
// hand-rolled ~200-line TSX file repeating the same structure; this captures
// that structure once so a new guide is just data. Existing bespoke pages
// still work — they can migrate here whenever they're next touched.
import { Link } from 'react-router-dom';
import NavBar from './NavBar';
import Footer from './Footer';
import ThemeBackground from './ThemeBackground';
import PageSEO from './PageSEO';
import { useThemeStyles } from '../hooks/useThemeStyles';

export interface PhaseDurations { inhale: number; hold: number; exhale: number; pause: number }

export interface GuideStep { n: string; label: string; note?: string }
export interface GuideCard { icon: string; title: string; desc: string }

export interface GuideSection {
  heading: string;
  /** Body copy. Strings may contain <strong>/<em> — authored by us, never user input. */
  paragraphs?: string[];
  steps?: GuideStep[];
  cards?: GuideCard[];
  /** Small print under the section. */
  footnote?: string;
}

export interface GuideFaq { q: string; a: string }

export interface GuideProps {
  eyebrow: string;
  titleTop: string;
  titleAccent: string;
  intro: string;
  seo: { title: string; description: string; canonical: string };
  ctaLabel: string;
  /** Preloads the guided session with this pattern. */
  preset?: PhaseDurations;
  presetName?: string;
  /** Safety callout rendered directly under the hero, before any content. */
  notice?: { title: string; body: string };
  sections: GuideSection[];
  closing?: { title: string; body: string };
  disclaimer?: string;
  faqs: GuideFaq[];
  related: { label: string; href: string }[];
}

export default function GuideLayout(p: GuideProps) {
  const ts = useThemeStyles();
  const divider = <div style={{ height: 1, backgroundColor: ts.border + '40' }} />;
  const ctaState = p.preset ? { coachPreset: p.preset, coachPresetName: p.presetName } : undefined;

  return (
    <div className="relative flex flex-col min-h-screen font-montserrat">
      <PageSEO title={p.seo.title} description={p.seo.description} canonical={p.seo.canonical} />
      <ThemeBackground />

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: p.seo.title,
        description: p.seo.description,
        url: `https://breatheonline.app${p.seo.canonical}`,
        author: { '@type': 'Organization', name: 'Breathe' },
        mainEntity: p.faqs.map(({ q, a }) => ({
          '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a },
        })),
      }) }} />

      <div className="relative z-10 flex flex-col min-h-screen">
        <NavBar />
        <main className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 py-12 flex flex-col gap-10">

          {/* Hero */}
          <div className="flex flex-col gap-3">
            <span className="t-label tracking-[0.3em] uppercase border px-4 py-1.5 rounded-full w-fit"
              style={{ color: ts.textMuted, borderColor: ts.border }}>
              {p.eyebrow}
            </span>
            <h1 className="text-3xl sm:text-5xl font-light tracking-wide leading-tight" style={{ color: ts.textPrimary }}>
              {p.titleTop}<br />
              <span style={{ color: ts.accent }}>{p.titleAccent}</span>
            </h1>
            <p className="t-body leading-relaxed max-w-xl" style={{ color: ts.textMuted }}>
              {p.intro}
            </p>
            <Link to="/breathing" state={ctaState}
              className="flex items-center gap-2 px-8 py-3.5 rounded-full text-white font-medium w-fit transition-all hover:scale-105"
              style={{ background: ts.btnGradient, boxShadow: ts.btnShadow }}>
              🌬 {p.ctaLabel}
            </Link>
          </div>

          {/* Safety notice — deliberately above the content, never buried */}
          {p.notice && (
            <div className="p-5 rounded-2xl flex flex-col gap-2"
              style={{ backgroundColor: ts.cardBg, border: `1px solid ${ts.accent}66` }}>
              <p className="t-body font-medium" style={{ color: ts.textPrimary }}>{p.notice.title}</p>
              <p className="t-caption leading-relaxed" style={{ color: ts.textMuted }}
                 dangerouslySetInnerHTML={{ __html: p.notice.body }} />
            </div>
          )}

          {p.sections.map((s, i) => (
            <div key={s.heading} className="flex flex-col gap-4">
              {i > 0 && divider}
              <h2 className="t-heading font-medium" style={{ color: ts.textPrimary }}>{s.heading}</h2>

              {s.paragraphs?.map((html, j) => (
                <p key={j} className="t-body leading-relaxed" style={{ color: ts.textMuted }}
                   dangerouslySetInnerHTML={{ __html: html }} />
              ))}

              {s.steps && (
                <div className="flex flex-col gap-3">
                  {s.steps.map(step => (
                    <div key={step.n} className="flex items-center gap-4 p-4 rounded-2xl"
                      style={{ backgroundColor: ts.cardBg, border: `1px solid ${ts.border}` }}>
                      <div className="px-3 min-w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 font-bold text-white t-body"
                        style={{ background: ts.btnGradient }}>{step.n}</div>
                      <p className="flex-1 t-body font-medium" style={{ color: ts.textPrimary }}>{step.label}</p>
                      {step.note && (
                        <span className="t-caption font-light tabular-nums flex-shrink-0" style={{ color: ts.accent }}>
                          {step.note}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {s.cards && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {s.cards.map(c => (
                    <div key={c.title} className="flex gap-3 p-4 rounded-2xl"
                      style={{ backgroundColor: ts.cardBg, border: `1px solid ${ts.border}` }}>
                      <span className="t-heading flex-shrink-0">{c.icon}</span>
                      <div>
                        <p className="t-caption font-medium mb-1" style={{ color: ts.textPrimary }}>{c.title}</p>
                        <p className="t-caption leading-relaxed" style={{ color: ts.textMuted }}>{c.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {s.footnote && (
                <p className="t-caption leading-relaxed" style={{ color: ts.textMuted }}
                   dangerouslySetInnerHTML={{ __html: s.footnote }} />
              )}
            </div>
          ))}

          {/* Closing CTA */}
          <div className="flex flex-col items-center gap-4 py-8 rounded-3xl px-6 text-center"
            style={{ backgroundColor: ts.cardBg, border: `1px solid ${ts.border}` }}>
            <p className="t-heading font-light" style={{ color: ts.textPrimary }}>
              {p.closing?.title ?? 'Try it right now'}
            </p>
            <p className="t-body max-w-sm" style={{ color: ts.textMuted }}>
              {p.closing?.body ?? 'The guided orb paces your breath so you can stop counting and just follow it.'}
            </p>
            <Link to="/breathing" state={ctaState}
              className="px-10 py-4 rounded-full text-white font-medium transition-all hover:scale-105"
              style={{ background: ts.btnGradient, boxShadow: ts.btnShadow }}>
              🌬 Start breathing — free
            </Link>
            <p className="t-caption" style={{ color: ts.textMuted }}>
              No account · No download · Works in 30 seconds
            </p>
          </div>

          {p.disclaimer && (
            <p className="t-caption leading-relaxed text-center max-w-xl mx-auto"
               style={{ color: ts.textMuted, opacity: 0.9 }}>
              {p.disclaimer}
            </p>
          )}

          {divider}

          {/* FAQ */}
          <div className="flex flex-col gap-3">
            <h2 className="t-heading font-medium" style={{ color: ts.textPrimary }}>Common questions</h2>
            {p.faqs.map(({ q, a }) => (
              <div key={q} className="p-5 rounded-2xl flex flex-col gap-2"
                style={{ backgroundColor: ts.cardBg, border: `1px solid ${ts.border}` }}>
                <p className="t-body font-medium" style={{ color: ts.textPrimary }}>{q}</p>
                <p className="t-caption leading-relaxed" style={{ color: ts.textMuted }}>{a}</p>
              </div>
            ))}
          </div>

          {/* Related */}
          <div className="flex flex-col gap-3">
            <p className="t-label tracking-[0.25em] uppercase" style={{ color: ts.textMuted }}>Keep reading</p>
            <div className="flex flex-wrap gap-2">
              {p.related.map(({ label, href }) => (
                <Link key={href} to={href} className="px-4 py-2 rounded-xl t-caption transition-all"
                  style={{ color: ts.accent, border: `1px solid ${ts.border}` }}>
                  {label} →
                </Link>
              ))}
            </div>
          </div>

        </main>
        <Footer />
      </div>
    </div>
  );
}
