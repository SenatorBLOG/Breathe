// src/pages/NotFoundPage.tsx
import { Link } from 'react-router-dom';
import { useThemeStyles } from '../hooks/useThemeStyles';
import { useTranslation } from 'react-i18next';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import ThemeBackground from '../components/ThemeBackground';
import PageSEO from '../components/PageSEO';

export default function NotFoundPage() {
  const ts = useThemeStyles();
  const { t } = useTranslation();

  return (
    <div className="min-h-screen flex flex-col">
      <PageSEO
        title="Page Not Found | Breathe"
        description="This page doesn't exist. Head back to Breathe to continue your mindfulness journey."
        noIndex
      />
      <ThemeBackground />
      <NavBar />

      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 text-center gap-6">
        <span style={{ fontSize: 72, lineHeight: 1 }}>🌊</span>

        <div className="flex flex-col gap-2">
          <h1 className="text-6xl font-light" style={{ color: ts.textPrimary }}>404</h1>
          <p className="t-body" style={{ color: ts.textSecondary }}>
            {t('notFound.title', 'This page got lost in the current.')}
          </p>
          <p className="t-caption" style={{ color: ts.textMuted }}>
            {t('notFound.subtitle', "The page you're looking for doesn't exist or has been moved.")}
          </p>
        </div>

        <div className="flex flex-wrap gap-3 justify-center">
          <Link
            to="/"
            className="px-6 py-2.5 rounded-xl t-caption font-semibold text-white transition-opacity hover:opacity-90"
            style={{ background: ts.btnGradient }}
          >
            {t('notFound.goHome', '← Back to Home')}
          </Link>
          <Link
            to="/breathing"
            className="px-6 py-2.5 rounded-xl t-caption font-medium border transition-opacity hover:opacity-80"
            style={{ color: ts.textSecondary, borderColor: ts.border }}
          >
            {t('notFound.startBreathing', 'Start Breathing →')}
          </Link>
        </div>
      </main>

      <div className="relative z-10"><Footer /></div>
    </div>
  );
}
