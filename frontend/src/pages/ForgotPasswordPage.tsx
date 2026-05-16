// src/pages/ForgotPasswordPage.tsx
//
// Placeholder for /forgot-password until the full reset-by-email flow ships.
// The audit flagged this as a critical broken funnel — landing on a 404 means a
// stuck user has nowhere to turn. This page gives them a working escape hatch
// (email support) while we wire up the proper server-side token + email pipeline.
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Mail, ArrowLeft } from 'lucide-react';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import ThemeBackground from '../components/ThemeBackground';
import PageSEO from '../components/PageSEO';
import { useThemeStyles } from '../hooks/useThemeStyles';

export default function ForgotPasswordPage() {
  const ts = useThemeStyles();
  const { t } = useTranslation();

  return (
    <div className="relative min-h-screen font-montserrat flex flex-col">
      <PageSEO
        title={t('forgotPassword.seoTitle', 'Forgot Password | Breathe')}
        description={t('forgotPassword.seoDesc', 'Reset your Breathe account password.')}
        canonical="/forgot-password"
        noIndex
      />
      <ThemeBackground />

      <div className="relative z-10 flex flex-col flex-1">
        <NavBar />

        <main className="flex-1 flex items-center justify-center px-4 py-12">
          <div
            className="w-full max-w-md rounded-2xl p-6 sm:p-8 flex flex-col gap-5"
            style={{ background: ts.cardBg, border: `1px solid ${ts.border}` }}
          >
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center"
              style={{ background: `${ts.accent}22`, border: `1px solid ${ts.accent}44` }}
            >
              <Mail size={20} style={{ color: ts.accentLight }} />
            </div>

            <div className="flex flex-col gap-2">
              <h1 className="text-2xl font-medium" style={{ color: ts.textPrimary }}>
                {t('forgotPassword.title', 'Forgot your password?')}
              </h1>
              <p className="t-body leading-relaxed" style={{ color: ts.textMuted }}>
                {t(
                  'forgotPassword.body',
                  "Self-serve password reset is coming soon. In the meantime, email us and we'll reset it for you within 24 hours."
                )}
              </p>
            </div>

            <a
              href="mailto:support@breatheonline.app?subject=Password%20reset%20request"
              className="w-full text-center px-5 py-3 rounded-xl t-body font-semibold text-white transition-opacity hover:opacity-90"
              style={{ background: ts.btnGradient }}
            >
              {t('forgotPassword.cta', 'Email support@breatheonline.app')}
            </a>

            <Link
              to="/login"
              className="flex items-center justify-center gap-1.5 t-caption transition-opacity hover:opacity-70"
              style={{ color: ts.textMuted }}
            >
              <ArrowLeft size={12} />
              {t('forgotPassword.backToLogin', 'Back to sign in')}
            </Link>
          </div>
        </main>

        <Footer />
      </div>
    </div>
  );
}
