// src/pages/JournalPage.tsx
import React, { useEffect, useState } from 'react';
import NavBar from '../components/NavBar';
import ThemeBackground from '../components/ThemeBackground';
import Footer from '../components/Footer';
import api from '../api';
import { useThemeStyles } from '../hooks/useThemeStyles';
import { Brain, ChevronDown, ChevronUp, BookOpen, Sparkles, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import PageSEO from '../components/PageSEO';

interface NLPData {
  sentiment: 'positive' | 'neutral' | 'negative';
  score: number;
  themes: string[];
  intensity: number;
  suggestedTechnique: string;
  oneLineSummary: string;
  analyzedAt: string;
}

interface JournalSession {
  _id: string;
  sessionDate: string;
  sessionLength: number;
  moodBefore: number;
  moodAfter: number;
  notes: string;
  nlp?: NLPData;
}

interface Insights {
  totalAnalyzed: number;
  avgScore: number | null;
  topThemes: { theme: string; count: number }[];
  sentimentDist: { positive: number; neutral: number; negative: number };
  sessions: JournalSession[];
}

const TECHNIQUE_LINKS: Record<string, string> = {
  'box-breathing':  '/breathing/box-breathing',
  '4-7-8':          '/breathing/4-7-8',
  'wim-hof':        '/breathing/wim-hof',
  'coherent':       '/breathing',
  'belly':          '/breathing',
  'morning-ritual': '/breathing/morning-ritual',
};

const TECHNIQUE_LABELS: Record<string, string> = {
  'box-breathing':  'Box Breathing',
  '4-7-8':          '4-7-8 Breathing',
  'wim-hof':        'Wim Hof Method',
  'coherent':       'Coherent Breathing',
  'belly':          'Belly Breathing',
  'morning-ritual': 'Morning Ritual',
};

function sentimentColor(s: string | undefined, accent: string) {
  if (s === 'positive') return accent;
  if (s === 'negative') return '#FF8A8A';
  return '#7AAEC8';
}

function sentimentEmoji(s: string | undefined) {
  if (s === 'positive') return '😌';
  if (s === 'negative') return '😟';
  return '😐';
}

function scoreBar(score: number, accent: string) {
  const pct = ((score + 1) / 2) * 100;
  return (
    <div className="h-1.5 rounded-full overflow-hidden bg-white/10 flex-1">
      <div
        className="h-full rounded-full transition-all"
        style={{
          width: `${pct}%`,
          background: score > 0.2 ? accent : score < -0.2 ? '#FF8A8A' : '#7AAEC8',
        }}
      />
    </div>
  );
}

function groupByMonth(sessions: JournalSession[]) {
  const groups = new Map<string, JournalSession[]>();
  sessions.forEach(s => {
    const key = new Date(s.sessionDate).toLocaleDateString('en-US', {
      year: 'numeric', month: 'long',
    });
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(s);
  });
  return groups;
}

function JournalEntry({ session }: { session: JournalSession }) {
  const ts = useThemeStyles();
  const [expanded, setExpanded] = useState(false);
  const nlp = session.nlp;
  const date = new Date(session.sessionDate);
  const moodDelta = (session.moodAfter ?? 0) - (session.moodBefore ?? 0);

  return (
    <div
      className="rounded-2xl overflow-hidden transition-all"
      style={{ backgroundColor: ts.cardBg, border: `1px solid ${ts.border}` }}
    >
      {/* Header row */}
      <button
        className="w-full flex items-start gap-3 p-4 text-left hover:opacity-80 transition-opacity"
        onClick={() => setExpanded(e => !e)}
      >
        {/* Sentiment emoji */}
        <span className="text-2xl flex-shrink-0 mt-0.5">
          {sentimentEmoji(nlp?.sentiment)}
        </span>

        <div className="flex-1 min-w-0">
          {/* Date + session length */}
          <div className="flex items-center justify-between gap-2 mb-1">
            <p className="t-caption font-medium" style={{ color: ts.textPrimary }}>
              {date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
              {' · '}
              <span style={{ color: ts.textMuted }}>
                {date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </p>
            <div className="flex items-center gap-2 flex-shrink-0">
              {session.sessionLength > 0 && (
                <span className="t-caption px-2 py-0.5 rounded-full" style={{ backgroundColor: `${ts.accent}18`, color: ts.accent }}>
                  {session.sessionLength}m
                </span>
              )}
              {moodDelta > 0 && (
                <span className="t-caption" style={{ color: ts.accent }}>+{moodDelta} mood</span>
              )}
            </div>
          </div>

          {/* Notes excerpt */}
          {session.notes && (
            <p className="t-caption leading-relaxed line-clamp-2" style={{ color: ts.textSecondary }}>
              {session.notes}
            </p>
          )}

          {/* NLP one-line summary + themes preview */}
          {nlp?.oneLineSummary && !expanded && (
            <p className="t-caption mt-1.5 italic" style={{ color: sentimentColor(nlp.sentiment, ts.accent) }}>
              {nlp.oneLineSummary}
            </p>
          )}
        </div>

        {/* Expand toggle */}
        <span className="flex-shrink-0 mt-1" style={{ color: ts.textMuted }}>
          {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </span>
      </button>

      {/* Expanded NLP details */}
      {expanded && nlp && (
        <div className="px-4 pb-4 border-t" style={{ borderColor: ts.border }}>
          <div className="pt-3 flex flex-col gap-3">

            {/* One-line summary */}
            <p className="t-caption italic" style={{ color: sentimentColor(nlp.sentiment, ts.accent) }}>
              "{nlp.oneLineSummary}"
            </p>

            {/* Score bar */}
            <div className="flex items-center gap-3">
              <span className="t-label flex-shrink-0" style={{ color: ts.textMuted }}>
                Emotional score
              </span>
              {scoreBar(nlp.score, ts.accent)}
              <span className="t-caption font-medium tabular-nums flex-shrink-0" style={{ color: sentimentColor(nlp.sentiment, ts.accent) }}>
                {nlp.score >= 0 ? '+' : ''}{nlp.score.toFixed(2)}
              </span>
            </div>

            {/* Themes */}
            {nlp.themes.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {nlp.themes.map(t => (
                  <span
                    key={t}
                    className="t-label px-2 py-0.5 rounded-full capitalize"
                    style={{ backgroundColor: `${ts.accent}18`, color: ts.accent }}
                  >
                    {t}
                  </span>
                ))}
                <span
                  className="t-label px-2 py-0.5 rounded-full"
                  style={{ backgroundColor: `${ts.border}`, color: ts.textMuted }}
                >
                  intensity {nlp.intensity}/10
                </span>
              </div>
            )}

            {/* Technique suggestion */}
            {nlp.suggestedTechnique && (
              <div className="flex items-center justify-between">
                <p className="t-caption" style={{ color: ts.textMuted }}>
                  Recommended technique:
                  <span className="font-medium ml-1" style={{ color: ts.textSecondary }}>
                    {TECHNIQUE_LABELS[nlp.suggestedTechnique] ?? nlp.suggestedTechnique}
                  </span>
                </p>
                <Link
                  to={TECHNIQUE_LINKS[nlp.suggestedTechnique] ?? '/breathing'}
                  className="flex items-center gap-1 t-caption font-medium hover:opacity-80"
                  style={{ color: ts.accent }}
                >
                  Try it <ArrowRight size={11} />
                </Link>
              </div>
            )}

            {/* Full notes */}
            {session.notes && (
              <div className="rounded-xl p-3" style={{ backgroundColor: `${ts.border}40` }}>
                <p className="t-label mb-1.5" style={{ color: ts.textMuted }}>
                  Your notes
                </p>
                <p className="t-caption leading-relaxed whitespace-pre-wrap" style={{ color: ts.textSecondary }}>
                  {session.notes}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function JournalPage() {
  const ts = useThemeStyles();
  const [insights, setInsights] = useState<Insights | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/nlp/insights')
      .then(r => setInsights(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const sessions = insights?.sessions ?? [];
  const grouped = groupByMonth(sessions);
  const months = [...grouped.keys()];

  const avgLabel = insights?.avgScore !== null && insights?.avgScore !== undefined
    ? insights.avgScore > 0.2 ? 'Generally positive'
      : insights.avgScore < -0.2 ? 'Challenging period'
      : 'Balanced'
    : null;

  return (
    <div className="relative flex flex-col min-h-screen font-montserrat">
      <PageSEO
        title="Breathing Journal | Breathe"
        description="Reflect on your breathing sessions with AI-powered journal insights. Track mood patterns, themes, and emotional trends over time."
        canonical="/journal"
        noIndex
      />
      <ThemeBackground />

      <div className="relative z-10 flex flex-col min-h-screen">
        <NavBar />

        <header className="max-w-3xl mx-auto w-full px-4 sm:px-6 pt-10 pb-4">
          <p className="t-label mb-2" style={{ color: ts.textMuted }}>
            Breathe · Emotional Journal
          </p>
          <div className="flex items-end justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-light tracking-wide" style={{ color: ts.textPrimary }}>
                Your Journal
              </h1>
              <p className="t-caption mt-1 max-w-md" style={{ color: ts.textMuted }}>
                {insights?.totalAnalyzed
                  ? `${insights.totalAnalyzed} sessions analyzed · AI-powered emotional intelligence`
                  : 'Add notes to your sessions to unlock emotional insights'}
              </p>
            </div>
            <Link
              to="/breathing"
              className="flex items-center gap-2 px-4 py-2 rounded-full text-white t-caption font-medium tracking-wide transition-all hover:scale-105 active:scale-95 flex-shrink-0"
              style={{ background: ts.btnGradient }}
            >
              New session <ArrowRight size={12} />
            </Link>
          </div>
        </header>

        <main className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 pb-20 flex flex-col gap-6">

          {/* Monthly insight card */}
          {insights && insights.totalAnalyzed > 0 && (
            <div
              className="rounded-2xl p-5 flex flex-col gap-4"
              style={{ backgroundColor: ts.cardBg, border: `1px solid ${ts.border}` }}
            >
              <div className="flex items-center gap-2">
                <Brain size={14} style={{ color: ts.accent }} />
                <p className="t-label" style={{ color: ts.textMuted }}>
                  30-day overview
                </p>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="t-heading font-light tabular-nums" style={{ color: ts.textPrimary }}>
                    {insights.totalAnalyzed}
                  </p>
                  <p className="t-label mt-0.5" style={{ color: ts.textMuted }}>
                    analyzed
                  </p>
                </div>
                {avgLabel && (
                  <div>
                    <p className="t-body font-medium" style={{ color: sentimentColor(insights.avgScore! > 0.2 ? 'positive' : insights.avgScore! < -0.2 ? 'negative' : 'neutral', ts.accent) }}>
                      {avgLabel}
                    </p>
                    <p className="t-label mt-0.5" style={{ color: ts.textMuted }}>
                      overall mood
                    </p>
                  </div>
                )}
                <div>
                  <p className="t-heading font-light tabular-nums" style={{ color: '#4AE8A0' }}>
                    {insights.sentimentDist.positive}
                  </p>
                  <p className="t-label mt-0.5" style={{ color: ts.textMuted }}>
                    positive sessions
                  </p>
                </div>
              </div>

              {/* Top themes */}
              {insights.topThemes.length > 0 && (
                <div>
                  <p className="t-label mb-2" style={{ color: ts.textMuted }}>
                    Recurring themes
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {insights.topThemes.map(({ theme, count }) => (
                      <span
                        key={theme}
                        className="t-caption px-2.5 py-1 rounded-full capitalize"
                        style={{ backgroundColor: `${ts.accent}18`, color: ts.accent }}
                      >
                        {theme} · {count}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Sentiment bar */}
              {insights.totalAnalyzed > 0 && (
                <div>
                  <p className="t-label mb-2" style={{ color: ts.textMuted }}>
                    Sentiment distribution
                  </p>
                  <div className="flex h-2 rounded-full overflow-hidden gap-0.5">
                    {insights.sentimentDist.positive > 0 && (
                      <div
                        className="rounded-full transition-all"
                        style={{
                          flex: insights.sentimentDist.positive,
                          background: ts.accent,
                        }}
                        title={`Positive: ${insights.sentimentDist.positive}`}
                      />
                    )}
                    {insights.sentimentDist.neutral > 0 && (
                      <div
                        className="rounded-full transition-all"
                        style={{
                          flex: insights.sentimentDist.neutral,
                          background: '#7AAEC8',
                        }}
                        title={`Neutral: ${insights.sentimentDist.neutral}`}
                      />
                    )}
                    {insights.sentimentDist.negative > 0 && (
                      <div
                        className="rounded-full transition-all"
                        style={{
                          flex: insights.sentimentDist.negative,
                          background: '#FF8A8A',
                        }}
                        title={`Negative: ${insights.sentimentDist.negative}`}
                      />
                    )}
                  </div>
                  <div className="flex gap-4 mt-1.5">
                    <span className="t-caption" style={{ color: ts.accent }}>
                      ● Positive {insights.sentimentDist.positive}
                    </span>
                    <span className="t-caption" style={{ color: '#7AAEC8' }}>
                      ● Neutral {insights.sentimentDist.neutral}
                    </span>
                    <span className="t-caption" style={{ color: '#FF8A8A' }}>
                      ● Difficult {insights.sentimentDist.negative}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div className="flex items-center justify-center py-16">
              <div className="w-5 h-5 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: ts.accent, borderTopColor: 'transparent' }} />
            </div>
          )}

          {/* Empty state */}
          {!loading && sessions.length === 0 && (
            <div
              className="flex flex-col items-center justify-center gap-4 py-16 rounded-2xl text-center"
              style={{ backgroundColor: ts.cardBg, border: `1px solid ${ts.border}` }}
            >
              <BookOpen size={36} style={{ color: ts.textDim }} />
              <div>
                <p className="t-body font-medium mb-1" style={{ color: ts.textSecondary }}>
                  Your journal is empty
                </p>
                <p className="t-caption max-w-xs" style={{ color: ts.textMuted }}>
                  Add notes to your breathing sessions. The AI will analyze your emotions and suggest techniques.
                </p>
              </div>
              <Link
                to="/breathing"
                className="flex items-center gap-2 px-5 py-2.5 rounded-full text-white t-body font-medium tracking-wide transition-all hover:scale-105"
                style={{ background: ts.btnGradient }}
              >
                Start a session <ArrowRight size={14} />
              </Link>
            </div>
          )}

          {/* Grouped journal entries */}
          {months.map(month => (
            <div key={month} className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <p className="t-caption font-medium tracking-wide" style={{ color: ts.textMuted }}>
                  {month}
                </p>
                <div className="flex-1 h-px" style={{ backgroundColor: ts.border }} />
                <span className="t-caption" style={{ color: ts.textDim }}>
                  {grouped.get(month)!.length} {grouped.get(month)!.length === 1 ? 'entry' : 'entries'}
                </span>
              </div>
              {grouped.get(month)!.map(s => (
                <JournalEntry key={s._id} session={s} />
              ))}
            </div>
          ))}

          {/* Tip at bottom */}
          {!loading && sessions.length > 0 && (
            <div className="flex items-start gap-2 px-4 py-3 rounded-xl" style={{ backgroundColor: `${ts.accent}0A` }}>
              <Sparkles size={12} style={{ color: ts.accent }} className="mt-0.5 flex-shrink-0" />
              <p className="t-caption" style={{ color: ts.textMuted }}>
                The more you journal, the better the AI understands your emotional patterns and can recommend the right technique at the right time.
              </p>
            </div>
          )}

        </main>

        <Footer />
      </div>
    </div>
  );
}
