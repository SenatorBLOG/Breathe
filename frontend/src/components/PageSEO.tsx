// src/components/PageSEO.tsx
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';

interface Props {
  title: string;
  description: string;
  canonical?: string;
  noIndex?: boolean;
}

const BASE = 'https://breatheonline.app';

const OG_LOCALE: Record<string, string> = {
  en: 'en_US',
  ru: 'ru_RU',
  es: 'es_ES',
};

export default function PageSEO({ title, description, canonical, noIndex }: Props) {
  const { i18n } = useTranslation();
  const lang = (i18n.language || 'en').split('-')[0];
  const ogLocale = OG_LOCALE[lang] ?? 'en_US';

  const fullTitle = title.includes('Breathe') ? title : `${title} | Breathe`;
  // Always derive URL from the canonical prop so crawlers see the correct per-page URL
  const url = canonical ? `${BASE}${canonical === '/' ? '' : canonical}` : `${BASE}${window.location.pathname}`;

  return (
    <Helmet>
      <html lang={lang} />
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {noIndex && <meta name="robots" content="noindex, nofollow" />}
      <link rel="canonical" href={url} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:locale" content={ogLocale} />
      {lang !== 'en' && <meta property="og:locale:alternate" content="en_US" />}
      {lang !== 'ru' && <meta property="og:locale:alternate" content="ru_RU" />}
      {lang !== 'es' && <meta property="og:locale:alternate" content="es_ES" />}
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
    </Helmet>
  );
}
