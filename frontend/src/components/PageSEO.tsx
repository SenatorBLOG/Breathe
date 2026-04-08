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
  const url = canonical ? `${BASE}${canonical}` : undefined;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {noIndex && <meta name="robots" content="noindex, nofollow" />}
      {url && <link rel="canonical" href={url} />}
      {url && <meta property="og:url" content={url} />}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
    </Helmet>
  );
}
