// src/components/PageSEO.tsx
import { Helmet } from 'react-helmet-async';

interface Props {
  title: string;
  description: string;
  canonical?: string;
  noIndex?: boolean;
}

const BASE = 'https://breatheonline.app';

export default function PageSEO({ title, description, canonical, noIndex }: Props) {
  const fullTitle = title.includes('Breathe') ? title : `${title} | Breathe`;
  // Always derive URL from the canonical prop so crawlers see the correct per-page URL
  const url = canonical ? `${BASE}${canonical === '/' ? '' : canonical}` : `${BASE}${window.location.pathname}`;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {noIndex && <meta name="robots" content="noindex, nofollow" />}
      <link rel="canonical" href={url} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
    </Helmet>
  );
}
