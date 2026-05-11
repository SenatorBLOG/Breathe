// src/pages/SupportPage.tsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import NavBar from '../components/NavBar';
import ThemeBackground from '../components/ThemeBackground';
import Footer from '../components/Footer';
import api from '../api';
import { Send, Mail, MessageCircle, BookOpen, Users, CheckCircle, Bug, Lightbulb, User } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useThemeStyles } from '../hooks/useThemeStyles';
import PageSEO from '../components/PageSEO';

// ─── Ad slot ──────────────────────────────────────────────────────────────────
function AdSlot({ className = '' }: { className?: string }) {
  const ts = useThemeStyles();
  return (
    <div className={`flex items-center justify-center border border-dashed rounded-xl ${className}`}
      style={{
        borderColor: ts.border,
        backgroundColor: `${ts.cardBg}40`,
      }}>
      <span className="t-label tracking-widest uppercase select-none" style={{ color: ts.textDim }}>
        Advertisement
      </span>
    </div>
  );
}

// ─── Quick link card ──────────────────────────────────────────────────────────
function QuickCard({ icon, title, desc, to, label }: {
  icon: React.ReactNode; title: string; desc: string; to: string; label: string;
}) {
  const ts = useThemeStyles();
  return (
    <Link to={to}
      className="flex flex-col gap-3 p-5 rounded-2xl border transition-all duration-200 group hover:-translate-y-0.5"
      style={{
        backgroundColor: ts.cardBg,
        borderColor: ts.border,
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = ts.borderHover;
        e.currentTarget.style.backgroundColor = ts.cardBgHover;
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = ts.border;
        e.currentTarget.style.backgroundColor = ts.cardBg;
      }}>
      <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{
          background: `${ts.accent}20`,
          border: `1px solid ${ts.accent}30`,
        }}>
        {icon}
      </div>
      <div className="flex-1">
        <p className="t-body font-medium group-hover:text-white transition-colors" style={{ color: ts.textPrimary }}>
          {title}
        </p>
        <p className="t-caption mt-0.5 leading-relaxed" style={{ color: ts.textMuted }}>
          {desc}
        </p>
      </div>
      <span className="t-label transition-all group-hover:underline" style={{ color: ts.accent }}>
        {label} →
      </span>
    </Link>
  );
}

// ─── Types ────────────────────────────────────────────────────────────────────
type Category = 'bug' | 'question' | 'feedback' | 'account' | 'other';

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function SupportPage() {
  const { t } = useTranslation();
  const ts = useThemeStyles();

  const CATEGORIES: { value: Category; label: string; icon: React.ReactNode }[] = [
    { value: 'bug',      label: t('support.topics.bug'),      icon: <Bug size={18} color="#F97316" /> },
    { value: 'question', label: t('support.topics.question'), icon: <MessageCircle size={18} color="#7AC4FF" /> },
    { value: 'feedback', label: t('support.topics.feedback'), icon: <Lightbulb size={18} color="#FACC15" /> },
    { value: 'account',  label: t('support.topics.account'),  icon: <User size={18} color="#A78BFA" /> },
    { value: 'other',    label: t('support.topics.other'),    icon: <Mail size={18} color="#4ADE80" /> },
  ];

  const [category, setCategory] = useState<Category>('question');
  const [name,     setName]     = useState('');
  const [email,    setEmail]    = useState('');
  const [message,  setMessage]  = useState('');
  const [sending,  setSending]  = useState(false);
  const [sent,     setSent]     = useState(false);
  const [error,    setError]    = useState('');

  const valid = name.trim().length > 0 && email.includes('@') && message.trim().length > 10;

  const submit = async () => {
    if (!valid) return;
    setSending(true);
    setError('');
    try {
      await api.post('/support', { name, email, category, message });
      setSent(true);
    } catch (e: any) {
      setError(e?.response?.data?.error ?? 'Something went wrong. Please try again.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="relative flex flex-col min-h-screen font-montserrat">
      <PageSEO
        title="Support | Breathe"
        description="Get help with Breathe. Browse FAQs, report a bug, or send us a message — we're here to help."
        canonical="/support"
      />
      <ThemeBackground />

      <div className="relative z-10 flex flex-col min-h-screen">
        <NavBar />

        <div className="max-w-4xl mx-auto w-full px-4 sm:px-6 pt-4">
          <AdSlot className="h-12" />
        </div>

        <header className="max-w-4xl mx-auto w-full px-4 sm:px-6 pt-8 pb-6 text-center flex flex-col items-center gap-3">
          <span className="t-label tracking-[0.3em] uppercase border px-4 py-1.5 rounded-full"
            style={{
              color: ts.textMuted,
              borderColor: ts.border,
            }}>
            {t('support.badge')}
          </span>
          <h1 className="text-2xl sm:text-4xl font-light tracking-wide" style={{ color: ts.textPrimary }}>
            {t('support.title')}
          </h1>
          <p className="t-body max-w-sm leading-relaxed" style={{ color: ts.textMuted }}>
            {t("support.subtitle")}
          </p>
        </header>

        <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 pb-20">
          <div className="flex gap-6 items-start">

            {/* Form */}
            <div className="flex-1 min-w-0">
              {sent ? (
                <div className="flex flex-col items-center gap-5 py-16 text-center rounded-2xl px-8"
                  style={{
                    backgroundColor: ts.cardBg,
                    border: `1px solid ${ts.border}`,
                  }}>
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
                    style={{
                      background: `${ts.accent}10`,
                      border: `1px solid ${ts.accent}20`,
                    }}>
                    <CheckCircle size={24} style={{ color: ts.accent }} />
                  </div>
                  <div>
                    <p className="t-heading font-medium" style={{ color: ts.textPrimary }}>
                      {t("support.success")}
                    </p>
                    <p className="t-body mt-1 leading-relaxed" style={{ color: ts.textMuted }}>
                      {t('support.thanksName', { name: name.split(' ')[0] })} {t('support.successDesc')} <span style={{ color: ts.accent }}>{email}</span> {t('support.successDesc2')}
                    </p>
                  </div>
                  <div className="flex gap-3 mt-2">
                    <button onClick={() => { setSent(false); setName(''); setEmail(''); setMessage(''); setCategory('question'); }}
                      className="px-5 py-2 rounded-xl t-caption transition-all"
                      style={{
                        color: ts.accent,
                        border: `1px solid ${ts.border}`,
                      }}>
                      {t('support.sendAnother')}
                    </button>
                    <Link to="/"
                      className="px-5 py-2 rounded-xl t-caption text-white font-medium transition-all hover:shadow-[0_0_16px_rgba(58,130,247,0.35)]"
                      style={{ background: ts.btnGradient }}>
                      {t('support.backHome')}
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl border overflow-hidden"
                  style={{
                    backgroundColor: ts.cardBg,
                    borderColor: ts.border,
                  }}>
                  <div className="h-px bg-gradient-to-r from-transparent via-[#4A9EFF]/20 to-transparent" />

                  <div className="p-5 sm:p-6 flex flex-col gap-5">
                    {/* Category */}
                    <div className="flex flex-col gap-2">
                      <label className="t-label uppercase tracking-widest" style={{ color: ts.textMuted }}>
                        {t('support.topic')}
                      </label>
                      <div className="flex gap-2 flex-wrap">
                        {CATEGORIES.map(c => (
                          <button key={c.value} onClick={() => setCategory(c.value)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl t-caption border transition-all"
                            style={{
                              backgroundColor: category === c.value ? ts.cardBgHover : 'transparent',
                              borderColor: category === c.value ? ts.borderHover : ts.border,
                              color: category === c.value ? ts.textSecondary : ts.textMuted,
                            }}>
                            <span>{c.icon}</span> {c.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Name + Email */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label htmlFor="support-name" className="t-label uppercase tracking-widest" style={{ color: ts.textMuted }}>
                          {t('support.name')}
                        </label>
                        <input type="text" id="support-name" name="name" autoComplete="name" value={name} onChange={e => setName(e.target.value)}
                          placeholder={t('support.namePlaceholder')}
                          className="rounded-xl px-4 py-2.5 t-body placeholder-[#2A4060] outline-none focus:border-[#2A5499] transition-colors"
                          style={{
                            backgroundColor: ts.cardBg,
                            border: `1px solid ${ts.border}`,
                            color: ts.textSecondary,
                          }} />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label htmlFor="support-email" className="t-label uppercase tracking-widest" style={{ color: ts.textMuted }}>
                          {t('support.email')}
                        </label>
                        <input id="support-email" name="email" autoComplete="email" value={email} onChange={e => setEmail(e.target.value)}
                          type="email" placeholder={t('support.emailPlaceholder')}
                          className="rounded-xl px-4 py-2.5 t-body placeholder-[#2A4060] outline-none focus:border-[#2A5499] transition-colors"
                          style={{
                            backgroundColor: ts.cardBg,
                            border: `1px solid ${ts.border}`,
                            color: ts.textSecondary,
                          }} />
                      </div>
                    </div>

                    {/* Message */}
                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="support-message" className="t-label uppercase tracking-widest" style={{ color: ts.textMuted }}>
                        {t('support.message')}
                      </label>
                      <textarea id="support-message" name="message" value={message} onChange={e => setMessage(e.target.value)}
                        rows={5} maxLength={1000}
                        placeholder={t('support.messagePlaceholder')}
                        className="rounded-xl px-4 py-3 t-body placeholder-[#2A4060] outline-none focus:border-[#2A5499] transition-colors resize-none leading-relaxed"
                        style={{
                          backgroundColor: ts.cardBg,
                          border: `1px solid ${ts.border}`,
                          color: ts.textSecondary,
                        }} />
                    </div>

                    {/* Error */}
                    {error && (
                      <p className="t-caption px-1" style={{ color: '#FF8A8A' }}>{error}</p>
                    )}

                    {/* Submit */}
                    <div className="flex items-center justify-between">
                      <span className="t-label tabular-nums" style={{ color: ts.textDim }}>
                        {message.length}/1000
                      </span>
                      <button onClick={submit} disabled={sending || !valid}
                        className="flex items-center gap-2 px-7 py-2.5 rounded-xl t-body font-medium tracking-wide transition-all hover:shadow-[0_0_20px_rgba(58,130,247,0.4)] hover:scale-105 active:scale-95 disabled:opacity-35"
                        style={{ background: ts.btnGradient }}>
                        <Send size={13} />
                        {sending ? t('support.sending') : t('support.send')}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <aside className="hidden lg:flex flex-col gap-4 w-56 flex-shrink-0">
              <QuickCard
                icon={<BookOpen size={14} style={{ color: ts.accent }} />}
                title={t('support.quickLinks.faqTitle')}
                desc={t('support.quickLinks.faqDesc')}
                to="/faq"
                label={t('support.quickLinks.faqLabel')}
              />
              <QuickCard
                icon={<Users size={14} style={{ color: ts.accent }} />}
                title={t('support.quickLinks.communityTitle')}
                desc={t('support.quickLinks.communityDesc')}
                to="/community"
                label={t('support.quickLinks.communityLabel')}
              />
              <QuickCard
                icon={<MessageCircle size={14} style={{ color: ts.accentLight }} />}
                title={t('support.quickLinks.responseTitle')}
                desc={t('support.quickLinks.responseDesc')}
                to="/support"
                label={t('support.quickLinks.responseLabel')}
              />
              <QuickCard
                icon={<Mail size={14} style={{ color: ts.accent }} />}
                title={t('support.quickLinks.emailTitle')}
                desc={t('support.quickLinks.emailDesc')}
                to="mailto:support@breatheonline.app"
                label="support@breatheonline.app"
              />

              <AdSlot className="h-44 mt-2" />
            </aside>
          </div>

          {/* Mobile quick links */}
          <div className="lg:hidden grid grid-cols-2 gap-3 mt-6">
            <QuickCard
              icon={<BookOpen size={14} style={{ color: ts.accent }} />}
              title={t('support.quickLinks.faqTitle')}
              desc={t('support.quickLinks.faqDescMobile')}
              to="/faq"
              label={t('support.quickLinks.faqLabel')}
            />
            <QuickCard
              icon={<Users size={14} style={{ color: ts.accent }} />}
              title={t('support.quickLinks.communityTitleMobile')}
              desc={t('support.quickLinks.communityDescMobile')}
              to="/community"
              label={t('support.quickLinks.communityLabelMobile')}
            />
          </div>
        </main>

        <div className="max-w-4xl mx-auto w-full px-4 sm:px-6 pb-8">
          <AdSlot className="h-12" />
        </div>

        <Footer />
      </div>
    </div>
  );
}