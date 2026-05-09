// src/components/ScrollToTopButton.tsx
import React, { useEffect, useState } from 'react';
import { ChevronUp } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useThemeStyles } from '../hooks/useThemeStyles';

export default function ScrollToTopButton() {
  const ts = useThemeStyles();
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 320);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label={t('common.backToTop')}
      className="fixed bottom-6 right-6 z-40 w-11 h-11 flex items-center justify-center rounded-2xl shadow-xl transition-all duration-300 hover:-translate-y-1 active:scale-90"
      style={{
        background: ts.cardBg,
        border: `1px solid ${ts.borderHover}`,
        color: ts.textSecondary,
        backdropFilter: 'blur(12px)',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(8px)',
        pointerEvents: visible ? 'auto' : 'none',
      }}
      title={t('common.backToTop')}
    >
      <ChevronUp size={18} />
    </button>
  );
}
