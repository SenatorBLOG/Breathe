// src/pages/FAQPage.tsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import NavBar from '../components/NavBar';
import ThemeBackground from '../components/ThemeBackground';
import Footer from '../components/Footer';
import { ChevronDown, Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useThemeStyles } from '../hooks/useThemeStyles';

// ─── Types ────────────────────────────────────────────────────────────────────
interface FAQItem {
  q: string;
  a: string;
}
interface FAQCategory {
  id: string;
  label: string;
  icon: string;
  items: FAQItem[];
}

// ─── Content ──────────────────────────────────────────────────────────────────
const FAQ_DATA: FAQCategory[] = [
  {
    id: 'basics',
    label: 'Getting Started',
    icon: '🌱',
    items: [
      {
        q: 'What is Breathe?',
        a: 'Breathe is a guided breathing and meditation app. You follow an animated orb that expands and contracts — inhaling when it grows, exhaling when it shrinks. No prior experience needed.',
      },
      {
        q: 'Do I need to create an account?',
        a: 'No. You can use the breathing sessions completely free without an account. Creating an account lets you save your session history, track streaks, and join the community.',
      },
      {
        q: 'How long should my first session be?',
        a: 'Start with 3–5 minutes. Even 2 minutes of controlled breathing creates a measurable shift in your nervous system. Build up gradually — most users settle into 10–15 minute daily sessions after a week.',
      },
      {
        q: 'What time of day is best for breathing exercises?',
        a: 'Morning sessions set a calm baseline for the day. Evening sessions help you wind down. The "best" time is simply when you can be consistent — even a lunch break works great.',
      },
    ],
  },
  {
    id: 'techniques',
    label: 'Breathing Techniques',
    icon: '🌊',
    items: [
      {
        q: 'What is Box Breathing (4-4-4-4)?',
        a: 'Box Breathing involves inhaling for 4 seconds, holding for 4, exhaling for 4, and holding again for 4. It is used by Navy SEALs and athletes to regain focus under pressure. Excellent for stress and pre-performance anxiety.',
      },
      {
        q: 'What is 4-7-8 breathing and why does it help sleep?',
        a: 'You inhale for 4 seconds, hold for 7, then exhale slowly for 8. The extended exhale activates your parasympathetic nervous system — lowering heart rate and cortisol. Most people feel drowsy within 2–3 cycles.',
      },
      {
        q: 'What is the Wim Hof Method?',
        a: 'The Wim Hof technique uses 30 deep power breaths followed by a breath retention (holding on empty). This temporarily floods your body with oxygen and adrenaline, creating an energised, alert state. Not recommended before driving or in water.',
      },
      {
        q: 'What is Coherent Breathing (5.5 BPM)?',
        a: 'Breathing at around 5.5 breaths per minute — roughly 5.5 seconds in, 5.5 seconds out — synchronises your heart rate variability (HRV) to its resonant frequency. This is associated with reduced anxiety, improved mood, and better cardiovascular health.',
      },
      {
        q: 'Can I create a custom pattern?',
        a: 'Yes. On the breathing page, drag the phase bars to set your own inhale, hold, exhale, and hold-out durations anywhere from 1 to 10 seconds each. Your custom pattern is used for the session immediately.',
      },
    ],
  },
  {
    id: 'science',
    label: 'The Science',
    icon: '🧠',
    items: [
      {
        q: 'Why does slow breathing reduce stress?',
        a: 'Slow, controlled exhales stimulate the vagus nerve, which directly signals your brain to reduce the stress response. Your heart rate drops, cortisol decreases, and prefrontal cortex activity increases — making you calmer and clearer.',
      },
      {
        q: 'What is heart rate variability (HRV)?',
        a: 'HRV is the variation in time between heartbeats. Higher HRV generally indicates a more resilient, adaptable nervous system. Breathing exercises — especially coherent breathing — are one of the most effective ways to improve HRV over time.',
      },
      {
        q: 'How many sessions does it take to feel a difference?',
        a: 'Most people notice a shift in their anxiety levels after 5–7 consistent sessions. Structural benefits to HRV and baseline calm typically appear after 3–4 weeks of daily practice.',
      },
    ],
  },
  {
    id: 'account',
    label: 'Account & Sessions',
    icon: '👤',
    items: [
      {
        q: 'How are my sessions saved?',
        a: 'Sessions are automatically saved when you stop a breathing session (after at least 3 cycles). You can add a mood rating, feelings tags, and a note in the feedback modal that appears after stopping.',
      },
      {
        q: 'What does the mood tracking do?',
        a: 'After each session you can log your mood before and after (1–10 scale). Over time the Stats page shows your mood trends, so you can see exactly how meditation is shifting your baseline.',
      },
      {
        q: 'Can I delete my session history?',
        a: 'Yes. On the Sessions page you can delete individual sessions or clear all history. Deleted sessions cannot be recovered.',
      },
      {
        q: 'How do I delete my account?',
        a: 'Go to Settings → Account → Delete Account. This permanently removes all your data including sessions, mood logs, and community posts. This action is irreversible.',
      },
    ],
  },
  {
    id: 'community',
    label: 'Community',
    icon: '🌍',
    items: [
      {
        q: 'Who can read community posts?',
        a: 'Everyone — you do not need an account to read posts and comments. Creating an account is only required to write posts, leave comments, or like content.',
      },
      {
        q: 'What can I post in the community?',
        a: 'Share your experiences, ask questions about techniques, celebrate streaks and milestones, or post tips you have discovered. Keep it supportive and on-topic.',
      },
      {
        q: 'How do I report inappropriate content?',
        a: 'Click the flag icon on any post to report it. Reported posts are reviewed manually. We aim to act on reports within 24 hours.',
      },
    ],
  },
];

// ─── Accordion item ───────────────────────────────────────────────────────────
function AccordionItem({ item, index }: { item: FAQItem; index: number }) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className={`rounded-xl border transition-all duration-300 overflow-hidden ${
        open
          ? 'border-[#2A5499]/50 bg-[#0D1B33]/70'
          : 'border-[#1E3358]/40 bg-[#0B1628]/50 hover:border-[#1E3358]/70'
      }`}
    >
      <button
        className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left"
        onClick={() => setOpen(v => !v)}
      >
        <div className="flex items-center gap-3">
          <span className="text-[#3D6080] text-[10px] font-mono tabular-nums flex-shrink-0">
            {String(index + 1).padStart(2, '0')}
          </span>
          <span className={`text-sm leading-snug transition-colors ${open ? 'text-[#B8D9FF]' : 'text-[#7AADCC]'}`}>
            {item.q}
          </span>
        </div>
        <ChevronDown
          size={14}
          className={`flex-shrink-0 text-[#2A5499] transition-transform duration-300 ${open ? 'rotate-180 text-[#4A9EFF]' : ''}`}
        />
      </button>

      {open && (
        <div className="px-5 pb-5 pt-0">
          <div className="ml-7 pl-3 border-l border-[#2A5499]/30">
            <p className="text-[#4A7AAA] text-sm leading-relaxed">{item.a}</p>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Ad slot ──────────────────────────────────────────────────────────────────
function AdSlot({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center border border-dashed border-[#1E3358]/40 rounded-xl bg-[#040A14]/40 ${className}`}>
      <span className="text-[9px] tracking-[0.25em] uppercase text-[#1A2D48] select-none">Advertisement</span>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function FAQPage() {
  const { t } = useTranslation();
  const ts = useThemeStyles();
  const [activeCategory, setActiveCategory] = useState('basics');
  const [search, setSearch] = useState('');

  const currentCat = FAQ_DATA.find(c => c.id === activeCategory) ?? FAQ_DATA[0];

  const filtered = search.trim().length > 1
    ? FAQ_DATA.flatMap(cat =>
        cat.items
          .filter(item =>
            item.q.toLowerCase().includes(search.toLowerCase()) ||
            item.a.toLowerCase().includes(search.toLowerCase())
          )
          .map(item => ({ ...item, catLabel: cat.label, catIcon: cat.icon }))
      )
    : null;

  return (
    <div className="relative flex flex-col min-h-screen  font-montserrat">
      {/* Background */}
      <ThemeBackground />

      <div className="relative z-10 flex flex-col min-h-screen">
        <NavBar />

        {/* Top ad */}
        <div className="max-w-4xl mx-auto w-full px-4 sm:px-6 pt-4">
          <AdSlot className="h-12" />
        </div>

        {/* ── Hero ── */}
        <header className="max-w-4xl mx-auto w-full px-4 sm:px-6 pt-8 pb-4 text-center flex flex-col items-center gap-4">
          <span className="text-[10px] tracking-[0.3em] uppercase text-[#4A7AAA] border border-[#1E3358]/40 px-4 py-1.5 rounded-full">
            Help & FAQ
          </span>
          <h1 className="text-2xl sm:text-4xl font-light text-[#B8D9FF] tracking-wide">
            How can we help?
          </h1>
          <p className="text-[#4A7AAA] text-sm max-w-md leading-relaxed">
            Everything you need to know about breathing techniques, the app, and your account.
          </p>

          {/* Search */}
          <div className="relative w-full max-w-md mt-2">
            <Search size={13} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#4A7AAA]" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={t("faq.search")}
              className="w-full bg-[#060C1A]/70 border border-[#1E3358]/50 rounded-2xl pl-10 pr-4 py-3 text-sm text-[#7AC4FF] placeholder-[#2A4060] outline-none focus:border-[#2A5499] transition-colors"
            />
            {search && (
              <button onClick={() => setSearch('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#4A7AAA] hover:text-[#4A9EFF] transition-colors text-xs">
                ✕
              </button>
            )}
          </div>
        </header>

        {/* ── Body ── */}
        <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 pb-20 pt-4">

          {filtered ? (
            /* ── Search results ── */
            <div className="flex flex-col gap-3">
              <p className="text-[#4A7AAA] text-xs mb-1">{filtered.length} result{filtered.length !== 1 ? 's' : ''} for "{search}"</p>
              {filtered.length === 0 ? (
                <div className="text-center py-16">
                  <p className="text-4xl mb-4 opacity-30">🔍</p>
                  <p className="text-[#4A7AAA] text-sm">No results found.</p>
                  <p className="text-[#3D6080] text-xs mt-1">Try a different word, or <button onClick={() => setSearch('')} className="text-[#4A9EFF] hover:underline">browse categories</button>.</p>
                </div>
              ) : filtered.map((item, i) => (
                <div key={i}>
                  <p className="text-[9px] uppercase tracking-widest text-[#3D6080] mb-1.5 pl-1">
                    {item.catIcon} {item.catLabel}
                  </p>
                  <AccordionItem item={item} index={i} />
                </div>
              ))}
            </div>
          ) : (
            /* ── Category view ── */
            <div className="flex gap-5">

              {/* Category sidebar */}
              <aside className="hidden sm:flex flex-col gap-1.5 w-44 flex-shrink-0 pt-1">
                {FAQ_DATA.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left transition-all text-xs ${
                      activeCategory === cat.id
                        ? 'bg-[#0D1B33] border border-[#2A5499]/50 text-[#7AC4FF]'
                        : 'text-[#4A7AAA] hover:text-[#5A8FB8] border border-transparent'
                    }`}
                  >
                    <span className={activeCategory === cat.id ? '' : 'opacity-50'}>{cat.icon}</span>
                    {cat.label}
                  </button>
                ))}

                {/* Sidebar ad */}
                <AdSlot className="h-40 mt-4" />
              </aside>

              {/* Mobile category pills */}
              <div className="sm:hidden flex gap-1.5 overflow-x-auto pb-2 flex-nowrap w-full mb-4">
                {FAQ_DATA.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] border transition-all ${
                      activeCategory === cat.id
                        ? 'bg-[#0D1B33] border-[#2A5499]/50 text-[#7AC4FF]'
                        : 'border-[#1E3358]/40 text-[#4A7AAA]'
                    }`}
                  >
                    {cat.icon} {cat.label}
                  </button>
                ))}
              </div>

              {/* Questions */}
              <div className="flex-1 min-w-0 flex flex-col gap-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xl">{currentCat.icon}</span>
                  <h2 className="text-base font-medium text-[#B8D9FF]">{currentCat.label}</h2>
                  <span className="text-[9px] text-[#3D6080] bg-[#0A1525] px-2 py-0.5 rounded-full border border-[#1E3358]/40">
                    {currentCat.items.length} questions
                  </span>
                </div>

                {currentCat.items.map((item, i) => (
                  <AccordionItem key={i} item={item} index={i} />
                ))}

                {/* Bottom CTA */}
                <div className="mt-4 rounded-2xl p-5 border border-[#1E3358]/40 bg-[#0B1628]/60 flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
                  <div className="flex-1">
                    <p className="text-[#7AADCC] text-sm font-medium">{t("faq.stillQuestions")}</p>
                    <p className="text-[#4A7AAA] text-xs mt-0.5 leading-relaxed">
                      Can't find what you're looking for? We're happy to help.
                    </p>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <Link to="/community"
                      className="px-4 py-2 rounded-xl text-xs text-[#4A9EFF] border border-[#1E3358]/50 hover:border-[#2A5499]/60 transition-all">
                      {t("faq.askCommunity")}
                    </Link>
                    <Link to="/support"
                      className="px-4 py-2 rounded-xl text-xs text-white font-medium transition-all hover:shadow-[0_0_16px_rgba(58,130,247,0.35)]"
                      style={{ background: ts.btnGradient }}>
                      {t("faq.contactUs")}
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>

        {/* Bottom ad */}
        <div className="max-w-4xl mx-auto w-full px-4 sm:px-6 pb-8">
          <AdSlot className="h-12" />
        </div>

        <Footer />
      </div>
    </div>
  );
}