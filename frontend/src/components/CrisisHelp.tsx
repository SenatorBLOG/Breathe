// src/components/CrisisHelp.tsx
//
// Modal shown when AI Coach detects crisis language (see utils/crisisDetection.ts).
// Replaces the LLM response with vetted regional helpline numbers. This is a
// hard safety requirement — see the comment in crisisDetection.ts.
//
// Numbers sourced from official providers (988 — US/Canada, Samaritans — UK/IE,
// Befrienders Worldwide — global directory). If you change them, double-check
// they still resolve to a real, free crisis service.
import { useEffect, useRef } from 'react';
import { Phone, MessageCircle, ExternalLink, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useThemeStyles } from '../hooks/useThemeStyles';

interface Helpline {
  region: string;
  name: string;
  phone?: string;
  text?: string;
  url: string;
}

const HELPLINES: Helpline[] = [
  { region: 'US / Canada', name: '988 Suicide & Crisis Lifeline', phone: '988',           text: '988',         url: 'https://988lifeline.org' },
  { region: 'UK / Ireland', name: 'Samaritans',                    phone: '116 123',                            url: 'https://www.samaritans.org' },
  { region: 'EU',          name: 'European Emergency Number',      phone: '112',                                url: 'https://112.eu' },
  { region: 'Russia',      name: 'Телефон доверия (МЧС)',          phone: '8 800 2000 122',                     url: 'https://telefon-doveria.ru' },
  { region: 'Spain',       name: 'Teléfono de la Esperanza',       phone: '717 003 717',                        url: 'https://telefonodelaesperanza.org' },
  { region: 'Worldwide',   name: 'Befrienders Worldwide',                                                       url: 'https://www.befrienders.org' },
];

interface Props {
  onClose: () => void;
}

export default function CrisisHelp({ onClose }: Props) {
  const ts = useThemeStyles();
  const { t } = useTranslation();
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="crisis-title"
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6"
      style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-lg rounded-3xl border shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
        style={{ background: ts.cardBg, borderColor: '#ff6b6b' }}
      >
        <div className="flex items-start justify-between gap-4 p-6 pb-4 border-b" style={{ borderColor: ts.border }}>
          <div className="flex flex-col gap-2">
            <h2 id="crisis-title" className="text-xl font-medium" style={{ color: ts.textPrimary }}>
              {t('crisis.title', 'You are not alone')}
            </h2>
            <p className="t-caption leading-relaxed" style={{ color: ts.textMuted }}>
              {t('crisis.subtitle', 'If you are in crisis or thinking about hurting yourself, please reach a trained human right now. These services are free and confidential.')}
            </p>
          </div>
          <button
            ref={closeRef}
            onClick={onClose}
            aria-label={t('common.close', 'Close')}
            className="p-2 rounded-lg hover:bg-black/10 transition-colors flex-shrink-0"
            style={{ color: ts.textMuted }}
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-3">
          {HELPLINES.map(h => (
            <div
              key={h.region + h.name}
              className="rounded-2xl p-4 border flex flex-col gap-2"
              style={{ background: ts.pageBg, borderColor: ts.border }}
            >
              <div className="flex items-center gap-2">
                <span className="t-label uppercase tracking-widest" style={{ color: ts.textDim }}>{h.region}</span>
              </div>
              <p className="t-body font-medium" style={{ color: ts.textPrimary }}>{h.name}</p>
              <div className="flex flex-wrap gap-2 mt-1">
                {h.phone && (
                  <a
                    href={`tel:${h.phone.replace(/\s+/g, '')}`}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl t-caption font-semibold text-white"
                    style={{ background: ts.btnGradient }}
                  >
                    <Phone size={13} /> {h.phone}
                  </a>
                )}
                {h.text && (
                  <a
                    href={`sms:${h.text.replace(/\s+/g, '')}`}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl t-caption font-semibold border"
                    style={{ borderColor: ts.border, color: ts.textPrimary, background: ts.cardBg }}
                  >
                    <MessageCircle size={13} /> {t('crisis.text', 'Text')} {h.text}
                  </a>
                )}
                <a
                  href={h.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3 py-2 rounded-xl t-caption font-semibold border"
                  style={{ borderColor: ts.border, color: ts.textPrimary, background: ts.cardBg }}
                >
                  <ExternalLink size={13} /> {t('crisis.website', 'Website')}
                </a>
              </div>
            </div>
          ))}

          <p className="t-caption leading-relaxed mt-2 px-2" style={{ color: ts.textMuted }}>
            {t('crisis.disclaimer', 'Breathe is a wellness app, not a medical or emergency service. In a life-threatening emergency please call your local emergency number (911, 112, 999, 102) immediately.')}
          </p>
        </div>
      </div>
    </div>
  );
}
