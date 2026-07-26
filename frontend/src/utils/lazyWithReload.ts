// src/utils/lazyWithReload.ts
import { lazy as reactLazy, type ComponentType } from 'react';

// Vite emits content-hashed chunk filenames (e.g. WhySleepPage-CKRR1fPa.js).
// After a new deploy, a browser still running the PREVIOUS index.html
// references chunk hashes that no longer exist on the server. Worse, the SPA
// rewrite (`/(.*) -> /index.html`) means the missing .js request returns
// index.html with `Content-Type: text/html`, so the dynamic import() rejects
// with a module/MIME error rather than a clean 404 — and the route renders
// blank.
//
// Fix: when a lazy import fails, force ONE full page reload to fetch the fresh
// index.html and its current chunks. A sessionStorage flag prevents an
// infinite reload loop if the failure is something else (offline, a genuine
// runtime error) — in that case we rethrow so the ErrorBoundary handles it.
const RELOAD_FLAG = 'chunk-reload-attempted';

export function lazyWithReload<T extends ComponentType<unknown>>(
  factory: () => Promise<{ default: T }>,
) {
  return reactLazy(async () => {
    try {
      const mod = await factory();
      // Success — clear the flag so a genuinely stale chunk later can still
      // trigger its own single reload.
      try { window.sessionStorage.removeItem(RELOAD_FLAG); } catch { /* ignore */ }
      return mod;
    } catch (err) {
      let alreadyTried = false;
      try { alreadyTried = window.sessionStorage.getItem(RELOAD_FLAG) === '1'; } catch { /* ignore */ }

      if (!alreadyTried) {
        try { window.sessionStorage.setItem(RELOAD_FLAG, '1'); } catch { /* ignore */ }
        window.location.reload();
        // Never resolve — keep the Suspense fallback on screen through the
        // reload instead of flashing an error.
        return new Promise<{ default: T }>(() => {});
      }
      // Second failure in a row: not a stale-chunk problem. Let it surface.
      throw err;
    }
  });
}
