// src/pages/DataConsentPage.tsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import NavBar from '../components/NavBar';
import ThemeBackground from '../components/ThemeBackground';
import Footer from '../components/Footer';
import { Heart, Shield, TrendingUp, Zap, Lock, Eye, ChevronRight, Check } from 'lucide-react';

// ─── Feature card ─────────────────────────────────────────────────────────────
function FeatureCard({ icon, title, desc, example }: {
  icon: React.ReactNode; title: string; desc: string; example?: string;
}) {
  return (
    <div className="flex gap-4 p-5 rounded-2xl bg-[#0B1628]/70 border border-[#1E3358]/50 hover:border-[#2A5499]/50 transition-all">
      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: 'rgba(42,84,153,0.2)', border: '1px solid rgba(42,84,153,0.3)' }}>
        {icon}
      </div>
      <div className="flex flex-col gap-1.5">
        <p className="text-[#B8D9FF] text-sm font-medium">{title}</p>
        <p className="text-[#4A7AAA] text-xs leading-relaxed">{desc}</p>
        {example && (
          <div className="mt-1 px-3 py-1.5 rounded-xl bg-[#060C1A]/60 border border-[#1E3358]/30">
            <p className="text-[#4A9EFF] text-[10px] italic">"{example}"</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Before / After demo ──────────────────────────────────────────────────────
function BeforeAfterDemo() {
  return (
    <div className="rounded-2xl overflow-hidden border border-[#1E3358]/50 bg-[#060C1A]/60">
      <div className="px-4 py-3 border-b border-[#1E3358]/30">
        <p className="text-[9px] uppercase tracking-widest text-[#4A7AAA]">Live example — 8 min Box Breathing session</p>
      </div>
      <div className="grid grid-cols-3 gap-0">
        {[
          { label: 'Before', bpm: 88, hrv: 42, calm: null, color: '#FF8A8A' },
          { label: 'During', bpm: 74, hrv: 55, calm: null, color: '#FFD97D' },
          { label: 'After',  bpm: 64, hrv: 67, calm: 34,   color: '#4AE8A0' },
        ].map(({ label, bpm, hrv, calm, color }, i) => (
          <div key={label}
            className={`flex flex-col items-center gap-3 p-5 ${i < 2 ? 'border-r border-[#1E3358]/30' : ''}`}>
            <p className="text-[9px] uppercase tracking-widest text-[#4A7AAA]">{label}</p>
            <div className="flex flex-col items-center gap-1">
              <span className="text-2xl font-light tabular-nums" style={{ color }}>{bpm}</span>
              <span className="text-[9px] text-[#4A7AAA]">bpm</span>
            </div>
            <div className="flex flex-col items-center gap-0.5">
              <span className="text-sm font-light tabular-nums text-[#7AC4FF]">{hrv}ms</span>
              <span className="text-[9px] text-[#4A7AAA]">HRV</span>
            </div>
            {calm !== null && (
              <div className="flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl"
                style={{ background: 'rgba(74,232,160,0.1)', border: '1px solid rgba(74,232,160,0.25)' }}>
                <span className="text-lg font-medium text-[#4AE8A0]">+{calm}</span>
                <span className="text-[9px] text-[#4AE8A0]">Calm Score</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Privacy promise ──────────────────────────────────────────────────────────
function PrivacyPoint({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0"
        style={{ background: 'rgba(74,232,160,0.12)', border: '1px solid rgba(74,232,160,0.25)' }}>
        <Check size={9} className="text-[#4AE8A0]" />
      </div>
      <p className="text-[#4A7AAA] text-xs leading-relaxed">{text}</p>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function DataConsentPage() {
  const navigate  = useNavigate();
  const [agreed, setAgreed] = useState(false);

  const handleConnect = () => {
    localStorage.setItem('breathe_data_consent', 'true');
    navigate('/profile');
  };

  return (
    <div className="relative flex flex-col min-h-screen  font-montserrat">
      <ThemeBackground />

      <div className="relative z-10 flex flex-col min-h-screen">
        <NavBar />

        <main className="flex-1 max-w-2xl mx-auto w-full px-4 sm:px-6 py-10 flex flex-col gap-8">

          {/* Hero */}
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg,rgba(255,107,138,0.15),rgba(255,107,138,0.05))', border: '1px solid rgba(255,107,138,0.3)', boxShadow: '0 0 30px rgba(255,107,138,0.1)' }}>
              <Heart size={28} className="text-[#FF6B8A]" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-light text-[#B8D9FF] tracking-wide mb-2">
                Measure your calm
              </h1>
              <p className="text-[#4A7AAA] text-sm leading-relaxed max-w-md">
                Connect your heart rate monitor to see exactly how meditation changes your body — in real time.
              </p>
            </div>
          </div>

          {/* Before/After demo */}
          <BeforeAfterDemo />

          {/* What we measure */}
          <div className="flex flex-col gap-3">
            <p className="text-[10px] uppercase tracking-widest text-[#4A7AAA] px-1">What we track during your session</p>
            <FeatureCard
              icon={<Heart size={16} className="text-[#FF6B8A]" />}
              title="Heart Rate (BPM)"
              desc="We measure your heart rate before, during, and after each session. A drop of 10–30 bpm is a reliable sign your nervous system has shifted into rest mode."
              example="Your HR dropped from 88 to 64 bpm — a 27% reduction in 8 minutes"
            />
            <FeatureCard
              icon={<Activity size={16} className="text-[#4A9EFF]" />}
              title="Heart Rate Variability (HRV)"
              desc="HRV is the variation between heartbeats — a higher HRV means your body is calm and adaptable. It's the single best real-time indicator of stress reduction."
              example="HRV improved from 42ms to 67ms — your recovery index is now optimal"
            />
            <FeatureCard
              icon={<TrendingUp size={16} className="text-[#4AE8A0]" />}
              title="Calm Score"
              desc="We combine HR change, HRV improvement, and session duration into a single Calm Score. Track it over time to see your meditation practice get stronger."
              example="7-day average Calm Score: +28. Up 40% from last week 🌊"
            />
            <FeatureCard
              icon={<Zap size={16} className="text-[#FFD97D]" />}
              title="AI Technique Matching"
              desc="Your biometrics tell us which techniques work best for you personally. If 4-7-8 consistently gives you a better Calm Score than Box Breathing, we'll recommend it more."
              example="Based on 14 sessions: 4-7-8 is 2.3× more effective for your nervous system"
            />
          </div>

          {/* How data flows */}
          <div className="flex flex-col gap-3">
            <p className="text-[10px] uppercase tracking-widest text-[#4A7AAA] px-1">How your data flows</p>
            <div className="relative flex flex-col gap-0">
              {[
                { icon: '⌚', label: 'Your watch/device', desc: 'Heart rate via Bluetooth LE — never leaves your device without permission' },
                { icon: '🌐', label: 'Your browser', desc: 'Processed locally first — we only send aggregated session summaries' },
                { icon: '🔒', label: 'Breathe servers', desc: 'Encrypted, stored under your account — never sold, never shared' },
                { icon: '🤖', label: 'Your AI Coach', desc: 'Uses your patterns to improve recommendations — only accessible to you' },
              ].map(({ icon, label, desc }, i) => (
                <div key={label} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 rounded-xl bg-[#0B1628] border border-[#1E3358]/50 flex items-center justify-center text-base flex-shrink-0">
                      {icon}
                    </div>
                    {i < 3 && <div className="w-px flex-1 bg-[#1E3358]/40 my-1" style={{ minHeight: 16 }} />}
                  </div>
                  <div className="pb-4">
                    <p className="text-[#B8D9FF] text-xs font-medium">{label}</p>
                    <p className="text-[#4A7AAA] text-[10px] mt-0.5 leading-relaxed">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Privacy promises */}
          <div className="flex flex-col gap-3 p-5 rounded-2xl bg-[#0B1628]/60 border border-[#1E3358]/40">
            <div className="flex items-center gap-2 mb-1">
              <Shield size={14} className="text-[#4AE8A0]" />
              <p className="text-[10px] uppercase tracking-widest text-[#4A7AAA]">Our privacy promise</p>
            </div>
            <PrivacyPoint text="Your heart rate data is never sold to third parties" />
            <PrivacyPoint text="You can delete all biometric data at any time from your profile" />
            <PrivacyPoint text="Data is encrypted in transit and at rest" />
            <PrivacyPoint text="We never share individual readings — only you see your data" />
            <PrivacyPoint text="You can disconnect your device and revoke access at any time" />
            <PrivacyPoint text="Breathe is not a medical device — this is for personal wellness only" />
          </div>

          {/* Consent + CTA */}
          <div className="flex flex-col gap-4">
            <label className="flex items-start gap-3 cursor-pointer group">
              <div onClick={() => setAgreed(v => !v)}
                className="w-5 h-5 mt-0.5 rounded flex items-center justify-center border flex-shrink-0 transition-all"
                style={agreed
                  ? { background: '#1A5FCC', border: '1px solid #3A82F7' }
                  : { background: 'rgba(6,12,26,0.6)', border: '1px solid rgba(30,51,88,0.6)' }}>
                {agreed && <Check size={11} className="text-white" />}
              </div>
              <p className="text-[#4A7AAA] text-xs leading-relaxed group-hover:text-[#7AADCC] transition-colors">
                I understand that Breathe will use my heart rate data to calculate my Calm Score and improve breathing recommendations. I can revoke this permission at any time.
              </p>
            </label>

            <button onClick={handleConnect} disabled={!agreed}
              className="w-full py-4 rounded-2xl text-white font-medium text-sm tracking-wide transition-all hover:shadow-[0_0_28px_rgba(255,107,138,0.4)] hover:scale-[1.02] active:scale-[0.98] disabled:opacity-35"
              style={{ background: agreed ? 'linear-gradient(135deg,#8B1A3A,#CC2244,#FF6B8A)' : 'rgba(30,51,88,0.4)' }}>
              <Heart size={16} className="inline mr-2" />
              Connect heart rate monitor →
            </button>

            <Link to="/breathing"
              className="text-center text-[10px] text-[#2A4060] hover:text-[#4A7AAA] transition-colors">
              Skip for now — use Breathe without biometrics
            </Link>
          </div>

        </main>
        <Footer />
      </div>
    </div>
  );
}

// Need this import
function Activity(props: any) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
    </svg>
  );
}