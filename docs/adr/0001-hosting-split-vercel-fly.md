# ADR-0001: SPA on Vercel, API on Fly.io, ML on Render

**Status:** accepted (2026-05, migrated from Render Node free tier)

## Context
The app is a Vite SPA + Express API + Python ML microservice, operated solo on
a student budget. The API originally ran on Render's free Node tier, which was
discontinued — the backend went down when the limit hit.

## Decision
- **Frontend → Vercel**: zero-config Vite deploys, per-branch previews, global
  CDN, and headers/rewrites via `vercel.json` (CSP, HSTS, SPA fallback).
- **API → Fly.io** (`api/Dockerfile` + `fly.toml`): one shared-cpu 256 MB
  machine with `min_machines_running = 1` to avoid cold starts on the paths
  users feel (auth, AI coach). Health-checked via `/healthz`, which returns
  503 only on hard failures (Mongo unreachable, JWT secret missing) — soft
  dependencies like Gemini only degrade features and must not fail the check.
- **ML → Render free tier**: recommendation quality is a nice-to-have; a cold
  start there is acceptable and hidden behind optimistic UI defaults.

## Consequences
- Three dashboards/CLIs instead of one; acceptable for the cost profile (≈ $0).
- CORS must pin exact Vercel preview patterns (see ADR-0003 fallout: a bare
  `.vercel.app` suffix check is an account-takeover-adjacent hole).
- The API is a single region (ams) — fine for current traffic; revisit if the
  user base concentrates elsewhere.
