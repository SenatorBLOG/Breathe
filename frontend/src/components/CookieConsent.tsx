// src/components/CookieConsent.tsx
//
// GDPR / ePrivacy banner. Until the user gives an explicit choice we MUST NOT
// load Google Analytics or any other non-essential third-party tracker — that's
// the actual legal requirement, not the banner itself.
//
// The banner persists the choice in localStorage. On "Accept" we set
// window.__breatheAnalyticsConsent = true and fire a custom event that
// index.html listens for to load the GA script. On "Reject" we record the
// decision and never load GA.
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useThemeStyles } from '../hooks/useThemeStyles';

const STORAGE_KEY = 'breathe_cookie_consent';
type Choice = 'accepted' | 'rejected';

export function hasAnalyticsConsent(): boolean {
  try { return localStorage.getItem(STORAGE_KEY) === 'accepted'; } catch { return false; }
}

function record(choice: Choice) {
  try { localStorage.setItem(STORAGE_KEY, choice); } catch {}
  (window as any).__breatheAnalyticsConsent = choice === 'accepted';
  if (choice === 'accepted') {
    window.dispatchEvent(new CustomEvent('breathe:analytics-consent'));
  }
}

export default function CookieConsent() {
  const ts = useThemeStyles();
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const prior = localStorage.getItem(STORAGE_KEY);
      if (!prior) {
        // Delay slightly so the banner doesn't fight with first paint
        const id = setTimeout(() => setVisible(true), 800);
        return () => clearTimeout(id);
      }
      if (prior === 'accepted') {
        (window as any).__breatheAnalyticsConsent = true;
        window.dispatchEvent(new CustomEvent('breathe:analytics-consent'));
      }
    } catch {}
  }, []);

  if (!visible) return null;

  const accept = () => { record('accepted'); setVisible(false); };
  const reject = () => { record('rejected'); setVisible(false); };

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-labelledby="cookie-title"
      className="fixed bottom-4 left-4 right-4 sm:left-6 sm:right-auto sm:max-w-md z-[150] rounded-2xl border shadow-2xl"
      style={{ background: ts.cardBg, borderColor: ts.border, backdropFilter: 'blur(12px)' }}
    >
      <div className="p-5 flex flex-col gap-3">
        <h2 id="cookie-title" className="t-body font-semibold" style={{ color: ts.textPrimary }}>
          {t('cookies.title', 'Cookies & analytics')}
        </h2>
        <p className="t-caption leading-relaxed" style={{ color: ts.textMuted }}>
          {t('cookies.body', 'We use a single analytics cookie to count visits anonymously. We do not sell your data and never share it for advertising.')}{' '}
          <Link to="/privacy" className="underline" style={{ color: ts.accent }}>
            {t('cookies.learnMore', 'Privacy policy')}
          </Link>
        </p>
        <div className="flex flex-wrap gap-2 mt-1">
          <button
            type="button"
            onClick={accept}
            className="flex-1 min-w-[120px] px-4 py-2.5 rounded-xl t-caption font-semibold text-white"
            style={{ background: ts.btnGradient }}
          >
            {t('cookies.accept', 'Accept')}
          </button>
          <button
            type="button"
            onClick={reject}
            className="flex-1 min-w-[120px] px-4 py-2.5 rounded-xl t-caption font-semibold border"
            style={{ borderColor: ts.border, color: ts.textPrimary, background: ts.cardBg }}
          >
            {t('cookies.reject', 'Reject')}
          </button>
        </div>
      </div>
    </div>
  );
}
