// seo/prerenderShells.mjs
//
// Vite plugin: after the bundle is written, generate a dedicated static
// index.html for every content route in routeMeta.mjs. Each shell carries
// the route's real <title>, description, canonical, Open Graph / Twitter
// tags, and JSON-LD in <head>, plus a crawler-visible <noscript> content
// block. Vercel serves these static files directly (filesystem beats the SPA
// rewrite), so crawlers — including the many that never run JS — finally see
// per-page metadata and content instead of one generic empty shell.
//
// Pure string manipulation in Node: no headless browser, so it can't slow or
// break the Vercel build.
import fs from 'node:fs';
import path from 'node:path';
import { ROUTE_META } from './routeMeta.mjs';

const SITE = 'https://breatheonline.app';

const esc = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function fullTitle(title) {
  return title.includes('Breathe') ? title : `${title} | Breathe`;
}

function buildHead(template, route, meta) {
  const url = `${SITE}${route}`;
  const title = esc(fullTitle(meta.title));
  const desc = esc(meta.description);
  let html = template;

  // <title>
  html = html.replace(/<title>[\s\S]*?<\/title>/, `<title>${title}</title>`);
  // meta description
  html = html.replace(
    /<meta name="description"[\s\S]*?\/>/,
    `<meta name="description" content="${desc}" />`,
  );
  // OG + Twitter — rewrite url/title/description to this page
  html = html
    .replace(/(<meta property="og:url"\s+content=")[^"]*(")/, `$1${url}$2`)
    .replace(/(<meta property="og:title"\s+content=")[^"]*(")/, `$1${title}$2`)
    .replace(/(<meta property="og:description"\s+content=")[^"]*(")/, `$1${desc}$2`)
    .replace(/(<meta name="twitter:url"\s+content=")[^"]*(")/, `$1${url}$2`)
    .replace(/(<meta name="twitter:title"\s+content=")[^"]*(")/, `$1${title}$2`)
    .replace(/(<meta name="twitter:description"\s+content=")[^"]*(")/, `$1${desc}$2`);

  // Canonical (index.html has none) + per-page JSON-LD, injected before </head>
  const jsonLd = (meta.jsonLd || [])
    .map((obj) => `<script type="application/ld+json">${JSON.stringify(obj)}</script>`)
    .join('\n    ');
  const inject = `<link rel="canonical" href="${url}" />\n    ${jsonLd}\n  </head>`;
  html = html.replace('</head>', inject);

  return html;
}

function buildNoscript(meta) {
  // Replaces the generic "needs JavaScript" noscript with real, crawlable
  // content for the (many) crawlers that don't execute JS. Real users never
  // see this — it only renders when JS is disabled.
  const links = (meta.links || [])
    .map(([label, href]) => `<a href="${esc(href)}" style="color:#7AC4FF;margin:0 10px">${esc(label)} →</a>`)
    .join('');
  return `<noscript>
      <div style="max-width:680px;margin:0 auto;padding:48px 24px;color:#B8D9FF;font-family:ui-sans-serif,system-ui,sans-serif">
        <h1 style="color:#fff;font-weight:400;font-size:28px;line-height:1.3">${esc(meta.h1)}</h1>
        <p style="color:#7AABCC;font-size:16px;line-height:1.7;margin-top:16px">${esc(meta.intro)}</p>
        <p style="margin-top:24px">${links}</p>
        <p style="color:#4A7AAA;font-size:13px;margin-top:32px">Breathe is a free guided breathing and meditation web app — no download, works in your browser. Enable JavaScript for the interactive guided session.</p>
      </div>
    </noscript>`;
}

export function prerenderShells() {
  return {
    name: 'prerender-seo-shells',
    apply: 'build',
    enforce: 'post',
    closeBundle() {
      const outDir = path.resolve(process.cwd(), 'build');
      const templatePath = path.join(outDir, 'index.html');
      if (!fs.existsSync(templatePath)) {
        this.warn?.('prerender-seo-shells: build/index.html not found, skipping');
        return;
      }
      const template = fs.readFileSync(templatePath, 'utf8');

      let written = 0;
      for (const [route, meta] of Object.entries(ROUTE_META)) {
        let html = buildHead(template, route, meta);
        // Replace the BODY noscript (the "needs JavaScript" block — it opens
        // with a <style>), not the earlier font-fallback <noscript><link>.
        const bodyNoscript = /<noscript>\s*<style>[\s\S]*?<\/noscript>/;
        if (!bodyNoscript.test(html)) {
          throw new Error(`prerender-seo-shells: body <noscript> not found for ${route}`);
        }
        html = html.replace(bodyNoscript, buildNoscript(meta));

        const dir = path.join(outDir, route.replace(/^\//, ''));
        fs.mkdirSync(dir, { recursive: true });
        fs.writeFileSync(path.join(dir, 'index.html'), html, 'utf8');
        written++;
      }
      // eslint-disable-next-line no-console
      console.log(`\n  prerender-seo-shells: wrote ${written} static route shells`);
    },
  };
}
