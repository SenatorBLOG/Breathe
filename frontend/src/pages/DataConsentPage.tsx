// src/pages/DataConsentPage.tsx
import React, { useState } from 'react';
import { useThemeStyles } from '../hooks/useThemeStyles';
import { useNavigate, Link } from 'react-router-dom';
import NavBar from '../components/NavBar';
import ThemeBackground from '../components/ThemeBackground';
import Footer from '../components/Footer';
import { Heart, Shield, TrendingUp, Zap, Lock, Eye, ChevronRight, Check, Watch, Globe, Bot } from 'lucide-react';
import { useTranslation } from 'react-i18next';

// ─── Feature card ─────────────────────────────────────────────────────────────
function FeatureCard({ icon, title, desc, example }: {
  icon: React.ReactNode; title: string; desc: string; example?: string;
}) {
  const ts = useThemeStyles();
  return (
    <div className="flex gap-4 p-5 rounded-2xl transition-all"
      style={{
        backgroundColor: ts.cardBg,
        border: `1px solid ${ts.border}`,
      }}>
      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: `${ts.accent}20`, border: `1px solid ${ts.accent}30` }}>
        {icon}
      </div>
      <div className="flex flex-col gap-1.5">
        <p className="t-body font-medium" style={{ color: ts.textPrimary }}>{title}</p>
        <p className="t-caption leading-relaxed" style={{ color: ts.textMuted }}>{desc}</p>
        {example && (
          <div className="mt-1 px-3 py-1.5 rounded-xl"
            style={{
              backgroundColor: `${ts.cardBg}60`,
              border: `1px solid ${ts.border}`,
            }}>
            <p className="t-label italic" style={{ color: ts.accent }}>"{example}"</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Before / After demo ──────────────────────────────────────────────────────
function BeforeAfterDemo() {
  const ts = useThemeStyles();
  const { t } = useTranslation();
  return (
    <div className="rounded-2xl overflow-hidden border"
      style={{
        borderColor: ts.border,
        backgroundColor: `${ts.cardBg}60`,
      }}>
      <div className="px-4 py-3 border-b" style={{ borderColor: ts.border }}>
        <p className="t-label uppercase tracking-widest" style={{ color: ts.textMuted }}>
          {t('dataConsent.demoLabel')}
        </p>
      </div>
      <div className="grid grid-cols-3 gap-0">
        {([
          { labelKey: 'dataConsent.demoBefore', bpm: 88, hrv: 42, calm: null, color: '#FF8A8A' },
          { labelKey: 'dataConsent.demoDuring', bpm: 74, hrv: 55, calm: null, color: '#FFD97D' },
          { labelKey: 'dataConsent.demoAfter',  bpm: 64, hrv: 67, calm: 34,   color: '#4AE8A0' },
        ] as const).map(({ labelKey, bpm, hrv, calm, color }, i) => (
          <div key={labelKey}
            className={`flex flex-col items-center gap-3 p-5 ${i < 2 ? 'border-r' : ''}`}
            style={{ borderColor: ts.border }}>
            <p className="t-label uppercase tracking-widest" style={{ color: ts.textMuted }}>{t(labelKey)}</p>
            <div className="flex flex-col items-center gap-1">
              <span className="text-2xl font-light tabular-nums" style={{ color }}>{bpm}</span>
              <span className="t-label" style={{ color: ts.textMuted }}>bpm</span>
            </div>
            <div className="flex flex-col items-center gap-0.5">
              <span className="t-body font-light tabular-nums" style={{ color: ts.textSecondary }}>{hrv}ms</span>
              <span className="t-label" style={{ color: ts.textMuted }}>HRV</span>
            </div>
            {calm !== null && (
              <div className="flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl"
                style={{
                  background: `${ts.accent}10`,
                  border: `1px solid ${ts.accent}25`,
                }}>
                <span className="t-heading font-medium" style={{ color: ts.accent }}>+{calm}</span>
                <span className="t-label" style={{ color: ts.accent }}>{t('dataConsent.calmScore')}</span>
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
  const ts = useThemeStyles();
  return (
    <div className="flex items-center gap-2.5">
      <div className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0"
        style={{
          background: `${ts.accent}12`,
          border: `1px solid ${ts.accent}25`,
        }}>
        <Check size={9} style={{ color: ts.accent }} />
      </div>
      <p className="t-caption leading-relaxed" style={{ color: ts.textMuted }}>{text}</p>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function DataConsentPage() {
  const ts = useThemeStyles();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [agreed, setAgreed] = useState(false);

  const handleConnect = () => {
    localStorage.setItem('breathe_data_consent', 'true');
    navigate('/profile');
  };

  return (
    <div className="relative flex flex-col min-h-screen font-montserrat">
      <ThemeBackground />

      <div className="relative z-10 flex flex-col min-h-screen">
        <NavBar />

        <main className="flex-1 max-w-2xl mx-auto w-full px-4 sm:px-6 py-10 flex flex-col gap-8">

          {/* Hero */}
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
              style={{
                background: ts.btnGradient,
                boxShadow: ts.btnShadow,
              }}>
              <Heart size={28} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-light tracking-wide mb-2" style={{ color: ts.textPrimary }}>
                {t('dataConsent.heroTitle')}
              </h1>
              <p className="t-body leading-relaxed max-w-md" style={{ color: ts.textMuted }}>
                {t('dataConsent.heroSubtitle')}
              </p>
            </div>
          </div>

          {/* Before/After demo */}
          <BeforeAfterDemo />

          {/* What we measure */}
          <div className="flex flex-col gap-3">
            <p className="t-label uppercase tracking-widest px-1" style={{ color: ts.textMuted }}>
              {t('dataConsent.whatWeTrack')}
            </p>
            <FeatureCard
              icon={<Heart size={16} style={{ color: ts.accent }} />}
              title={t('dataConsent.hrTitle')}
              desc={t('dataConsent.hrDesc')}
              example={t('dataConsent.hrExample')}
            />
            <FeatureCard
              icon={<Zap size={16} style={{ color: ts.accent }} />}
              title={t('dataConsent.hrvTitle')}
              desc={t('dataConsent.hrvDesc')}
              example={t('dataConsent.hrvExample')}
            />
            <FeatureCard
              icon={<TrendingUp size={16} style={{ color: ts.accent }} />}
              title={t('dataConsent.calmTitle')}
              desc={t('dataConsent.calmDesc')}
              example={t('dataConsent.calmExample')}
            />
            <FeatureCard
              icon={<Zap size={16} style={{ color: ts.accent }} />}
              title={t('dataConsent.aiTitle')}
              desc={t('dataConsent.aiDesc')}
              example={t('dataConsent.aiExample')}
            />
          </div>

          {/* How data flows */}
          <div className="flex flex-col gap-3">
            <p className="t-label uppercase tracking-widest px-1" style={{ color: ts.textMuted }}>
              {t('dataConsent.dataFlowTitle')}
            </p>
            <div className="relative flex flex-col gap-0">
              {[
                { icon: <Watch size={20} color="#7AC4FF" />, label: t('dataConsent.flowWatch'),   desc: t('dataConsent.flowWatchDesc')   },
                { icon: <Globe size={20} color="#4ADE80" />, label: t('dataConsent.flowBrowser'), desc: t('dataConsent.flowBrowserDesc') },
                { icon: <Lock  size={20} color="#A78BFA" />, label: t('dataConsent.flowServer'),  desc: t('dataConsent.flowServerDesc')  },
                { icon: <Bot   size={20} color="#F59E0B" />, label: t('dataConsent.flowAI'),      desc: t('dataConsent.flowAIDesc')      },
              ].map(({ icon, label, desc }, i) => (
                <div key={label} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center t-body flex-shrink-0"
                      style={{
                        backgroundColor: ts.cardBg,
                        border: `1px solid ${ts.border}`,
                      }}>
                      {icon}
                    </div>
                    {i < 3 && <div className="w-px flex-1 my-1" style={{ minHeight: 16, backgroundColor: ts.border }} />}
                  </div>
                  <div className="pb-4">
                    <p className="t-caption font-medium" style={{ color: ts.textPrimary }}>{label}</p>
                    <p className="t-label mt-0.5 leading-relaxed" style={{ color: ts.textMuted }}>{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Privacy promises */}
          <div className="flex flex-col gap-3 p-5 rounded-2xl"
            style={{
              backgroundColor: ts.cardBg,
              border: `1px solid ${ts.border}`,
            }}>
            <div className="flex items-center gap-2 mb-1">
              <Shield size={14} style={{ color: ts.accent }} />
              <p className="t-label uppercase tracking-widest" style={{ color: ts.textMuted }}>
                {t('dataConsent.privacyTitle')}
              </p>
            </div>
            <PrivacyPoint text={t('dataConsent.privacy1')} />
            <PrivacyPoint text={t('dataConsent.privacy2')} />
            <PrivacyPoint text={t('dataConsent.privacy3')} />
            <PrivacyPoint text={t('dataConsent.privacy4')} />
            <PrivacyPoint text={t('dataConsent.privacy5')} />
            <PrivacyPoint text={t('dataConsent.privacy6')} />
          </div>

          {/* Consent + CTA */}
          <div className="flex flex-col gap-4">
            <label className="flex items-start gap-3 cursor-pointer group">
              <div onClick={() => setAgreed(v => !v)}
                className="w-5 h-5 mt-0.5 rounded flex items-center justify-center border flex-shrink-0 transition-all"
                style={agreed
                  ? { backgroundColor: ts.accent, borderColor: ts.accentLight }
                  : { backgroundColor: `${ts.cardBg}60`, borderColor: ts.border }}>
                {agreed && <Check size={11} className="text-white" />}
              </div>
              <p className="t-caption leading-relaxed group-hover:text-white transition-colors" style={{ color: ts.textMuted }}>
                {t('dataConsent.consentText')}
              </p>
            </label>

            <button onClick={handleConnect} disabled={!agreed}
              className="w-full py-4 rounded-2xl text-white font-medium t-body tracking-wide transition-all hover:shadow-[0_0_28px_rgba(58,130,247,0.4)] hover:scale-[1.02] active:scale-[0.98] disabled:opacity-35"
              style={{
                background: agreed ? ts.btnGradient : `${ts.cardBg}40`,
              }}>
              <Heart size={16} className="inline mr-2" />
              {t('dataConsent.connectBtn')}
            </button>

            <Link to="/breathing"
              className="text-center t-label transition-colors"
              style={{ color: ts.textMuted }}>
              {t('dataConsent.skipLink')}
            </Link>
          </div>

        </main>
        <Footer />
      </div>
    </div>
  );
}