import { useEffect, useState } from 'react';
import { useThemeStyles } from '../hooks/useThemeStyles';
import { useTranslation } from 'react-i18next';

export default function PWAInstallBanner() {
  const ts = useThemeStyles();
  const { t } = useTranslation();
  const [prompt, setPrompt] = useState<any>(null);
  const [dismissed, setDismissed] = useState(
    () => localStorage.getItem('breathe_pwa_dismissed') === 'true'
  );

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  if (!prompt || dismissed) return null;
  if (window.matchMedia('(display-mode: standalone)').matches) return null;

  const install = async () => {
    prompt.prompt();
    const { outcome } = await prompt.userChoice;
    if (outcome === 'accepted') setPrompt(null);
  };

  const dismiss = () => {
    localStorage.setItem('breathe_pwa_dismissed', 'true');
    setDismissed(true);
  };

  return (
    <div
      className="fixed bottom-20 left-4 right-4 sm:left-auto sm:right-4 sm:w-80 z-40
        flex items-center gap-3 px-4 py-3 rounded-2xl shadow-lg"
      style={{ background: ts.cardBg, border: `1px solid ${ts.borderHover}` }}
    >
      <span className="text-2xl flex-shrink-0">📱</span>
      <div className="flex-1 min-w-0">
        <p className="t-caption font-medium" style={{ color: ts.textPrimary }}>
          {t('pwa.addToHome')}
        </p>
        <p className="t-label" style={{ color: ts.textMuted }}>
          {t('pwa.worksOffline')}
        </p>
      </div>
      <div className="flex gap-1.5 flex-shrink-0">
        <button
          onClick={install}
          className="px-3 py-1.5 rounded-xl t-label text-white font-medium"
          style={{ background: ts.btnGradient }}
        >
          {t('pwa.install')}
        </button>
        <button
          onClick={dismiss}
          className="px-2 py-1.5 rounded-xl t-label"
          style={{ color: ts.textDim, border: `1px solid ${ts.border}` }}
        >
          ✕
        </button>
      </div>
    </div>
  );
}
