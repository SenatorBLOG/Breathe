# SEO — how discovery works for Breathe

Breathe is a client-rendered SPA. Without help, every URL ships the same
generic `index.html` (same title, empty `<div id="root">`), so crawlers that
don't run JavaScript — Telegram, WhatsApp, LinkedIn, Slack, Discord, and Google
on its first pass — saw no per-page signal. This is now fixed at build time.

## What the build does automatically

`vite build` runs `seo/prerenderShells.mjs`, which writes a dedicated static
`build/<route>/index.html` for every entry in `seo/routeMeta.mjs`. Each shell has:

- the page's real `<title>` and `<meta name="description">`
- a `<link rel="canonical">` and page-specific Open Graph / Twitter tags
- JSON-LD structured data (HowTo steps for techniques, BreadcrumbList for all)
- a crawler-visible `<noscript>` block with the page's H1, intro, and internal
  links — real content for non-JS crawlers (real users never see it; the
  `<div id="root">` stays empty so there's no flash)

Vercel serves these static files directly (filesystem beats the SPA rewrite),
and React still boots normally over them for real users.

Site-wide `Organization` and `WebSite` JSON-LD live in `index.html` for brand
entity recognition.

### Adding a new SEO page

1. Build the React page as usual and add its route in `App.tsx`.
2. Add an entry to `seo/routeMeta.mjs` (title, description, h1, intro, links,
   optional HowTo/Breadcrumb JSON-LD).
3. Add a `<url>` block to `public/sitemap.xml`.
That's it — the next build prerenders it.

## What YOU must do (one-time, ~30 min) — this is what actually gets traffic

The technical foundation is done, but a brand-new domain with zero backlinks
won't appear in search until search engines know it exists and other sites
point to it. In priority order:

1. **Google Search Console** — https://search.google.com/search-console
   - Add property `breatheonline.app`, verify (DNS TXT record, or drop the
     HTML verification file into `frontend/public/`).
   - Submit the sitemap: `https://breatheonline.app/sitemap.xml`
   - Use "URL Inspection" → "Request indexing" for the homepage and the top
     technique pages. This is the single fastest way to get first indexed.

2. **Bing Webmaster Tools** — https://www.bing.com/webmasters
   - Add the site, import from Search Console in one click. Bing also powers
     DuckDuckGo and ChatGPT search.

3. **Get the first backlinks** (authority is the real ranking bottleneck):
   - Product Hunt launch (assets exist in the repo).
   - "Show HN" on Hacker News + posts on r/webdev, r/SideProject, dev.to —
     tell the build story, link the site. Engineers are the audience for a
     portfolio piece anyway.
   - A few niche communities (r/Meditation, r/Anxiety — read their rules
     first; lead with value, not a naked link).

4. **Verify shares look right**: paste a technique-page URL into Telegram or
   https://www.opengraph.xyz — you should now see the page-specific title,
   description, and preview image, not the generic homepage one.

## Realistic expectations

- Indexing: days to a few weeks after GSC submission.
- Ranking for competitive terms ("box breathing") — dominated by Calm/
  Healthline/WebMD; a new domain won't crack those for months, if ever.
- Ranking for long-tail terms ("3 minute morning breathing ritual",
  "fight or flight false alarm breathing") — achievable much sooner; that's
  why the content pages target those.
- Treat organic search as a slow compounding channel. The fast wins are the
  launch/backlink pushes in step 3.
