# Breathe — Technical Audit & Development Plan

> Audit date: 2026-07-03 · Auditor: full codebase + infrastructure review
> Goal: turn breatheonline.app from an unvisited side project into a portfolio
> centerpiece that demonstrates production-grade engineering.

---

## 1. Executive Summary

**What this is:** a feature-rich breathing/meditation PWA — React 18 + Vite + TS
on Vercel, Express + MongoDB Atlas on Fly.io, Python FastAPI ML service on
Render. 22 pages, AI coach (Gemini), 3D globe (Cesium), community, challenges,
health integrations, i18n (EN/RU/ES), GDPR endpoints.

**Honest assessment:** the *feature breadth* is far beyond a typical student
project — that's the strength. The weaknesses are the invisible 20% that
separates a demo from a product: **zero tests, no CI, a 1.4 GB git repo with
node_modules in history, leaked/weak secrets, no monitoring, and no
distribution strategy**. Recruiters who open the repo see the second list, not
the first.

**Verdict:** don't build more features. Spend 4–6 weeks on hardening,
credibility, and packaging. The app already has enough "wow"; it lacks proof
of engineering discipline.

---

## 2. What's Already Good — Don't Touch

| Area | Evidence |
|---|---|
| Auth hardening | bcrypt cost 12, timing-equalized login, enumeration defenses on register, tight per-route rate limits |
| Privacy engineering | Globe pin coordinate coarsening for non-owners, username redaction, GDPR export + cascade delete |
| SEO fundamentals | Per-page meta via Helmet, JSON-LD Article/FAQ schema, thoughtful robots.txt, sitemap, og-image |
| i18n | Full EN/RU/ES coverage incl. crisis-detection patterns rebuilt for Cyrillic |
| Perf work | Route-level code splitting, manualChunks vendor split (index 307→124 KB gzip), critical CSS inlined |
| Safety | Crisis keyword detection (multi-script), medical disclaimers, AI consent flow |

---

## 3. Critical Issues (fix first)

### 3.1 SECURITY — P0

1. **Rotate every secret. Today.**
   Secrets were pasted into chat logs / exist in weak form:
   - `JWT_SECRET` = `MySuperSecretKey_123!@` — weak AND exposed. Generate 64 random bytes.
   - MongoDB Atlas password — exposed. Rotate user password, ideally create a new DB user scoped to this app.
   - Google Fit client secret, Fitbit client secret — rotate in respective consoles.
   - Google Maps API key — rotate AND add HTTP-referrer + API restrictions in Cloud Console.
   - Cesium ion token — rotate, scope to breatheonline.app.
   Rotating JWT_SECRET invalidates all sessions — acceptable, users just re-login.

2. **CORS wildcard `*.vercel.app`** (`api/server.js`) — *anyone* can deploy a
   site on vercel.app and make credentialed calls to the API. Replace with an
   explicit allowlist of your production + your preview URLs only (or a
   Vercel-project-specific regex like `breathe-<team>-*.vercel.app`).

3. **JWT in localStorage** — any XSS = stolen 7-day token, and there's no
   revocation. Medium-term: move to httpOnly cookie + short-lived access token
   & refresh rotation. Minimum now: shorten expiry to 24h.

4. **SSRF in `/globe/resolve-place`** — user-supplied URL is fetched
   server-side; the goo.gl regex only *gates*, it doesn't validate (a URL like
   `http://169.254.169.254/?goo.gl` passes). Validate hostname against an
   allowlist (`goo.gl`, `maps.app.goo.gl`, `google.com/maps`) *after* parsing
   with `new URL()`, and block private IP ranges.

5. **CSP `unsafe-inline` in script-src** — nullifies much of the CSP. Move GA
   bootstrap to nonce or external file; long-term use Vercel middleware nonces.

6. **`photoUrl` accepts 1.5 MB base64 into MongoDB** — storage abuse vector +
   bloats every pins query. Move to object storage (Cloudflare R2 free tier)
   or at minimum drop the limit to ~200 KB and strip photos from list queries.

### 3.2 REPOSITORY HYGIENE — P0 (resume-critical)

The repo is the first thing a hiring engineer opens:

- **`.git` = 1.4 GB** — node_modules (45 MB swc binary, esbuild.exe…) live in
  history. Fix with `git filter-repo` (drop `node_modules/`, `build/`,
  `blobs/`, `manifests/`, `*.stackdump`) + force-push. Solo repo → safe.
- **Tracked junk:** `frontend/build/` (12 files), `manifests/registry.ollama.ai/*`,
  `bash.exe.stackdump`, root `blobs/`. Remove + .gitignore.
- **Backend deps inside `frontend/package.json`** (express, mongoose, helmet,
  jsonwebtoken, passport…) — move to `api/package.json` only; frontend keeps UI deps.
- **Three globe renderers** (Cesium + Leaflet + Three.js) for one feature.
  Pick Cesium (it's the wow factor) + Leaflet as the light 2D fallback; delete
  the Three.js path. Cesium assets alone are 14 MB of the build.
- Commit messages: current history is decent; keep conventional commits.

### 3.3 ENGINEERING CREDIBILITY — P0/P1

- **Tests: zero.** Minimum credible bar:
  - API: Jest + supertest — auth flow, GDPR delete cascade, globe privacy
    coarsening, rate limits (≈25 tests, 2–3 days).
  - Frontend: Vitest — crisisDetection, audioFade, one component test.
  - This is the single highest-ROI resume item after secrets.
- **CI: none.** GitHub Actions: lint + typecheck + test + build on PR (half a day).
- **Monitoring: none.** Sentry free tier (front + back, 1 hour), UptimeRobot
  on `/healthz` (10 min).
- **Duplicate route** `POST /posts/:id/report` defined twice in `api/routes/posts.js`
  (line ~186 and ~247) — second is dead code; delete.

---

## 4. Why Nobody Visits — Growth Diagnosis

Traffic ≈ 0 is not a mystery. Causes, in order:

1. **Zero distribution.** No launch happened (PH launch prepped but not shipped),
   no backlinks, no social presence, domain has no authority. Content pages
   can't rank on a DR-0 domain in a competitive niche ("box breathing" is
   dominated by Calm/Healthline/WebMD).
2. **Crowded category, undifferentiated pitch.** "Free breathing app" competes
   with defaults. The *actual* differentiators — no-signup instant start, 3D
   globe community, AI coach, works-in-browser — aren't the headline.
3. **SPA reality:** Google renders JS fine, but a new domain + thin backlink
   profile means articles are invisible regardless of on-page quality.

**Realistic strategy (portfolio-first):**
- Treat traffic as a *nice-to-have*, resume as the goal. But do one real
  launch to have numbers to talk about:
  - Product Hunt launch (assets exist) — aim for a Tuesday.
  - Post the build story on r/webdev, r/SideProject, dev.to, Hacker News
    "Show HN" — engineers are the actual audience for a portfolio.
  - 2–3 niche communities (r/breathwork, r/Anxiety — carefully, follow rules).
- Instrument first: GA4 is in; add PostHog or Clarity funnel (signup → first
  session → return) so you can *say* "X% activation" in interviews.
- SEO: keep publishing the science articles (they're good), but expect months.
  Add `<link rel=alternate hreflang>` for RU/ES to triple the surface.

---

## 5. Product Polish (P1–P2, selective)

- **Instant demo:** "Try one breath cycle" on the hero *without* any click-through
  — the breathing circle should animate on the landing page itself.
- **Server-side persistence for sessions** — currently localStorage-only for
  guests; cross-device sync is the top real-user complaint vector.
- **PWA:** replace hand-rolled sw.js with Workbox (versioning, offline shell,
  background sync). "Full offline mode" is a great interview line.
- **Cold ML service:** Render free tier sleeps; either move ML to Fly machine
  (same account) or accept + hide latency behind optimistic UI.
- **Cut scope:** Journal, Challenges, Leaderboard, Newsletter, Integrations —
  each half-polished feature dilutes. Pick the 3 you demo (Breathing, Globe,
  AI Coach) and gate/hide anything you wouldn't show in an interview.

---

## 6. Resume Packaging (the actual goal)

1. **README overhaul** — hero screenshot/GIF, architecture diagram
   (Vercel→Fly→Atlas→Gemini/ML), feature list with tech notes, "run locally in
   3 commands", link to live site + test account.
2. **Case study page or blog post** — "What I learned building a full-stack
   PWA solo": the crisis-detection Unicode bug, the timing-attack fix, the
   bundle-split numbers. Concrete war stories beat feature lists.
3. **Architecture Decision Records** — 5 short ADRs in `docs/adr/` (why
   Fly.io, why Cesium, why no Redux, why cascade-delete for GDPR, why JWT→cookie).
4. **Numbers in the resume bullet:** "Solo-built and operate a PWA (React/
   Express/MongoDB/Python ML) with 25+ API endpoints, 3 locales, CI, 85%+
   Lighthouse, monitored in production" — every claim backed by the repo.

---

## 7. Roadmap

### Phase 0 — Stop the bleeding (this week, ~2 days)
- [ ] Rotate ALL secrets (§3.1.1) + restrict Maps key
- [ ] Fix CORS wildcard (§3.1.2)
- [ ] SSRF hostname allowlist (§3.1.4)
- [ ] `git rm --cached` junk + .gitignore; schedule filter-repo rewrite
- [ ] Delete duplicate report route
- [ ] Sentry + UptimeRobot

### Phase 1 — Credibility (weeks 2–4)
- [ ] API test suite (Jest+supertest, ~25 tests) + Vitest for utils
- [ ] GitHub Actions CI (lint, typecheck, test, build)
- [ ] git filter-repo history rewrite → repo under 50 MB
- [ ] Dependency cleanup (frontend/api split, remove Three.js path)
- [ ] README + architecture diagram + ADRs
- [ ] JWT → httpOnly cookie + refresh tokens
- [ ] photoUrl → R2/object storage

### Phase 2 — Launch & story (weeks 5–8)
- [ ] Hero instant-demo breathing circle
- [ ] Workbox PWA + offline mode
- [ ] hreflang for RU/ES
- [ ] Product Hunt + Show HN + dev.to case study
- [ ] PostHog funnel; collect 4 weeks of real metrics
- [ ] Hide/cut unpolished features (Journal, Leaderboard…)

### Explicitly NOT doing
- New user-facing features before Phase 2 ends
- Paid infra upgrades (free tiers suffice at current traffic)
- Native mobile apps, more locales, more article volume

---

*Working doc — check items off as you go. Re-audit after Phase 1.*
