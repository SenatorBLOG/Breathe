// src/pages/SupportPage.tsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import api from '../api';
import { Send, Mail, MessageCircle, BookOpen, Users, CheckCircle } from 'lucide-react';

// ─── Ad slot ──────────────────────────────────────────────────────────────────
function AdSlot({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center border border-dashed border-[#1E3358]/40 rounded-xl bg-[#040A14]/40 ${className}`}>
      <span className="text-[9px] tracking-[0.25em] uppercase text-[#1A2D48] select-none">Advertisement</span>
    </div>
  );
}

// ─── Quick link card ──────────────────────────────────────────────────────────
function QuickCard({ icon, title, desc, to, label }: {
  icon: React.ReactNode; title: string; desc: string; to: string; label: string;
}) {
  return (
    <Link to={to}
      className="flex flex-col gap-3 p-5 rounded-2xl border border-[#1E3358]/40 bg-[#0B1628]/60 hover:border-[#2A5499]/50 hover:bg-[#0D1B33]/70 transition-all duration-200 group">
      <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: 'rgba(42,84,153,0.2)', border: '1px solid rgba(42,84,153,0.3)' }}>
        {icon}
      </div>
      <div className="flex-1">
        <p className="text-[#B8D9FF] text-sm font-medium group-hover:text-white transition-colors">{title}</p>
        <p className="text-[#3D6080] text-xs mt-0.5 leading-relaxed">{desc}</p>
      </div>
      <span className="text-[10px] text-[#4A9EFF] group-hover:underline">{label} →</span>
    </Link>
  );
}

// ─── Types ────────────────────────────────────────────────────────────────────
type Category = 'bug' | 'question' | 'feedback' | 'account' | 'other';

const CATEGORIES: { value: Category; label: string; icon: string }[] = [
  { value: 'bug',      label: 'Bug report',    icon: '🐛' },
  { value: 'question', label: 'Question',       icon: '💭' },
  { value: 'feedback', label: 'Feedback',       icon: '💡' },
  { value: 'account',  label: 'Account issue',  icon: '👤' },
  { value: 'other',    label: 'Other',          icon: '📩' },
];

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function SupportPage() {
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
    <div className="relative flex flex-col min-h-screen bg-[#010814] font-montserrat">
      {/* Background */}
      <div className="fixed inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url('/Background_img_Meditation.jpg')`, opacity: 0.35 }} />
      <div className="fixed inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at top, rgba(1,8,20,0.2) 0%, rgba(1,8,20,0.94) 68%)' }} />

      <div className="relative z-10 flex flex-col min-h-screen">
        <NavBar />

        {/* Top ad */}
        <div className="max-w-4xl mx-auto w-full px-4 sm:px-6 pt-4">
          <AdSlot className="h-12" />
        </div>

        {/* ── Hero ── */}
        <header className="max-w-4xl mx-auto w-full px-4 sm:px-6 pt-8 pb-6 text-center flex flex-col items-center gap-3">
          <span className="text-[10px] tracking-[0.3em] uppercase text-[#3D6080] border border-[#1E3358]/40 px-4 py-1.5 rounded-full">
            Support
          </span>
          <h1 className="text-2xl sm:text-4xl font-light text-[#B8D9FF] tracking-wide">
            We're here to help
          </h1>
          <p className="text-[#3D6080] text-sm max-w-sm leading-relaxed">
            Send us a message and we'll get back to you within 24 hours.
          </p>
        </header>

        <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 pb-20">
          <div className="flex gap-6 items-start">

            {/* ── Form ── */}
            <div className="flex-1 min-w-0">
              {sent ? (
                /* Success state */
                <div className="flex flex-col items-center gap-5 py-16 text-center rounded-2xl border border-[#1E3358]/40 bg-[#0B1628]/60 px-8">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
                    style={{ background: 'rgba(74,232,160,0.1)', border: '1px solid rgba(74,232,160,0.2)' }}>
                    <CheckCircle size={24} className="text-[#4AE8A0]" />
                  </div>
                  <div>
                    <p className="text-[#B8D9FF] text-lg font-medium">Message sent!</p>
                    <p className="text-[#3D6080] text-sm mt-1 leading-relaxed">
                      Thanks {name.split(' ')[0]}. We'll reply to <span className="text-[#4A9EFF]">{email}</span> within 24 hours.
                    </p>
                  </div>
                  <div className="flex gap-3 mt-2">
                    <button onClick={() => { setSent(false); setName(''); setEmail(''); setMessage(''); setCategory('question'); }}
                      className="px-5 py-2 rounded-xl text-xs text-[#4A9EFF] border border-[#1E3358]/50 hover:border-[#2A5499]/60 transition-all">
                      Send another
                    </button>
                    <Link to="/home-page"
                      className="px-5 py-2 rounded-xl text-xs text-white font-medium transition-all hover:shadow-[0_0_16px_rgba(58,130,247,0.35)]"
                      style={{ background: 'linear-gradient(135deg,#1A5FCC,#3A82F7)' }}>
                      Back to home
                    </Link>
                  </div>
                </div>
              ) : (
                /* Form */
                <div className="rounded-2xl border border-[#1E3358]/40 bg-[#0B1628]/60 overflow-hidden">
                  <div className="h-px bg-gradient-to-r from-transparent via-[#4A9EFF]/20 to-transparent" />

                  <div className="p-5 sm:p-6 flex flex-col gap-5">

                    {/* Category */}
                    <div className="flex flex-col gap-2">
                      <label className="text-[10px] uppercase tracking-widest text-[#3D6080]">Topic</label>
                      <div className="flex gap-2 flex-wrap">
                        {CATEGORIES.map(c => (
                          <button key={c.value} onClick={() => setCategory(c.value)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs border transition-all ${
                              category === c.value
                                ? 'bg-[#0D1B33] border-[#2A5499]/60 text-[#7AC4FF]'
                                : 'border-[#1E3358]/35 text-[#3D6080] hover:border-[#1E3358]/60 hover:text-[#5A8FB8]'
                            }`}>
                            <span>{c.icon}</span> {c.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Name + Email */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] uppercase tracking-widest text-[#3D6080]">Your name</label>
                        <input value={name} onChange={e => setName(e.target.value)}
                          placeholder="Alex"
                          className="bg-[#060C1A]/70 border border-[#1E3358]/50 rounded-xl px-4 py-2.5 text-sm text-[#7AC4FF] placeholder-[#1E3358] outline-none focus:border-[#2A5499] transition-colors" />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] uppercase tracking-widest text-[#3D6080]">Email address</label>
                        <input value={email} onChange={e => setEmail(e.target.value)}
                          type="email" placeholder="you@email.com"
                          className="bg-[#060C1A]/70 border border-[#1E3358]/50 rounded-xl px-4 py-2.5 text-sm text-[#7AC4FF] placeholder-[#1E3358] outline-none focus:border-[#2A5499] transition-colors" />
                      </div>
                    </div>

                    {/* Message */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] uppercase tracking-widest text-[#3D6080]">Message</label>
                      <textarea value={message} onChange={e => setMessage(e.target.value)}
                        rows={5} maxLength={1000}
                        placeholder="Describe your issue or question in detail…"
                        className="bg-[#060C1A]/70 border border-[#1E3358]/50 rounded-xl px-4 py-3 text-sm text-[#7AC4FF] placeholder-[#1E3358] outline-none focus:border-[#2A5499] transition-colors resize-none leading-relaxed" />
                    </div>

                    {/* Error */}
                    {error && (
                      <p className="text-[#FF8A8A] text-xs px-1">{error}</p>
                    )}

                    {/* Submit */}
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] text-[#1E3358] tabular-nums">{message.length}/1000</span>
                      <button onClick={submit} disabled={sending || !valid}
                        className="flex items-center gap-2 px-7 py-2.5 rounded-xl text-sm text-white font-medium tracking-wide transition-all hover:shadow-[0_0_20px_rgba(58,130,247,0.4)] hover:scale-105 active:scale-95 disabled:opacity-35"
                        style={{ background: 'linear-gradient(135deg,#1A5FCC,#3A82F7)' }}>
                        <Send size={13} />
                        {sending ? 'Sending…' : 'Send message'}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* ── Sidebar ── */}
            <aside className="hidden lg:flex flex-col gap-4 w-56 flex-shrink-0">

              <QuickCard
                icon={<BookOpen size={14} className="text-[#4A9EFF]" />}
                title="Browse FAQ"
                desc="Most questions are already answered in our help center."
                to="/faq"
                label="Open FAQ"
              />
              <QuickCard
                icon={<Users size={14} className="text-[#4AE8A0]" />}
                title="Ask the community"
                desc="Fellow meditators often have the fastest answers."
                to="/community"
                label="Go to community"
              />
              <QuickCard
                icon={<MessageCircle size={14} className="text-[#FFD97D]" />}
                title="Response time"
                desc="We reply within 24 hours on weekdays. Usually much faster."
                to="/support"
                label="Send a message"
              />
              <QuickCard
                icon={<Mail size={14} className="text-[#7AC4FF]" />}
                title="Email us directly"
                desc="Prefer email? Reach us any time."
                to="mailto:support@breatheonline.app"
                label="support@breatheonline.app"
              />

              <AdSlot className="h-44 mt-2" />
            </aside>
          </div>

          {/* Mobile quick links */}
          <div className="lg:hidden grid grid-cols-2 gap-3 mt-6">
            <QuickCard
              icon={<BookOpen size={14} className="text-[#4A9EFF]" />}
              title="Browse FAQ"
              desc="Most questions already answered."
              to="/faq"
              label="Open FAQ"
            />
            <QuickCard
              icon={<Users size={14} className="text-[#4AE8A0]" />}
              title="Community"
              desc="Ask fellow meditators."
              to="/community"
              label="Open community"
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