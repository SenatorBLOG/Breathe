/// <reference lib="webworker" />
// Service worker source (vite-plugin-pwa injectManifest mode).
//
// Replaces the hand-rolled public/sw.js. What Workbox buys us over that
// version: the build injects a manifest of every hashed asset
// (self.__WB_MANIFEST), so the FULL app shell — all lazy route chunks
// included — is cached at install time and every route works offline,
// not just the ones the user happened to visit. Cache versioning is
// derived from content hashes instead of a manually bumped 'breathe-v7'.
declare let self: ServiceWorkerGlobalScope;

import { precacheAndRoute, cleanupOutdatedCaches, createHandlerBoundToURL } from 'workbox-precaching';
import { registerRoute, NavigationRoute } from 'workbox-routing';
import { CacheFirst } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';
import { RangeRequestsPlugin } from 'workbox-range-requests';

// ── Precache: hashed JS/CSS + index.html + core images (injected at build) ──
precacheAndRoute(self.__WB_MANIFEST);
cleanupOutdatedCaches();

// Update flow: new deploy → new precache manifest → this SW activates
// immediately and takes over open tabs.
self.skipWaiting();
self.addEventListener('activate', event => {
  event.waitUntil(
    (async () => {
      // Drop caches from the pre-Workbox service worker generations.
      const legacy = (await caches.keys()).filter(k => k.startsWith('breathe-'));
      await Promise.all(legacy.map(k => caches.delete(k)));
      await self.clients.claim();
    })(),
  );
});

// ── SPA app shell: serve precached index.html for all navigations ──────────
// API lives on another origin, so no denylist needed beyond /api safety net.
registerRoute(
  new NavigationRoute(createHandlerBoundToURL('/index.html'), {
    denylist: [/^\/api\//],
  }),
);

// ── Images & fonts: cache-first with expiry (favicons stay fresh) ──────────
registerRoute(
  ({ request, url }) =>
    (request.destination === 'image' || request.destination === 'font') &&
    url.origin === self.location.origin &&
    !url.pathname.includes('favicon') &&
    !url.pathname.includes('apple-touch-icon'),
  new CacheFirst({
    cacheName: 'static-media',
    plugins: [
      new CacheableResponsePlugin({ statuses: [200] }),
      new ExpirationPlugin({ maxEntries: 80, maxAgeSeconds: 30 * 24 * 3600, purgeOnQuotaError: true }),
    ],
  }),
);

// ── Meditation videos: cache-on-demand with range support, few entries ──────
registerRoute(
  ({ request, url }) => request.destination === 'video' && url.origin === self.location.origin,
  new CacheFirst({
    cacheName: 'bg-videos',
    plugins: [
      new CacheableResponsePlugin({ statuses: [200] }),
      new RangeRequestsPlugin(),
      new ExpirationPlugin({ maxEntries: 3, purgeOnQuotaError: true }),
    ],
  }),
);

// ── Jamendo ambient audio: previously played tracks keep working offline ────
registerRoute(
  ({ request, url }) => request.destination === 'audio' || url.hostname.endsWith('storage.jamendo.com'),
  new CacheFirst({
    cacheName: 'ambient-audio',
    plugins: [
      new CacheableResponsePlugin({ statuses: [200] }),
      new RangeRequestsPlugin(),
      new ExpirationPlugin({ maxEntries: 20, purgeOnQuotaError: true }),
    ],
  }),
);

// ── Push notifications (ported unchanged from the previous sw.js) ───────────
self.addEventListener('push', event => {
  if (!event.data) return;
  const data = event.data.json();
  event.waitUntil(
    self.registration.showNotification(data.title || 'Breathe', {
      body: data.body || 'Time to breathe',
      icon: '/icons/icon-192.png',
      badge: '/icons/icon-192.png',
      tag: 'breathe-reminder',
      // @ts-expect-error — renotify/actions are valid at runtime; TS lib lags
      renotify: true,
      actions: [
        { action: 'open', title: 'Start session' },
        { action: 'dismiss', title: 'Later' },
      ],
    }),
  );
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  if (event.action === 'dismiss') return;
  event.waitUntil(
    self.clients.matchAll({ type: 'window' }).then(clientList => {
      for (const client of clientList) {
        if (client.url.includes('breatheonline.app') && 'focus' in client) {
          return client.focus();
        }
      }
      return self.clients.openWindow('/breathing');
    }),
  );
});
