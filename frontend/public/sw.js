// Bumped on every cache-shape change. Old caches are deleted in `activate`.
const CACHE_NAME = 'breathe-v7';
const AUDIO_CACHE = 'breathe-audio-v1';
const OFFLINE_URL = '/breathing';

// Assets to cache immediately on install.
// All background images are .webp (converted from .jpg in May 2026).
// Icons are .webp (see site.webmanifest).
const PRECACHE = [
  '/',
  '/breathing',
  '/index.html',
  '/Background_Night.webp',
  '/Background_Day.webp',
  '/Background_Nature.webp',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
];

// Install — precache static assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting())
  );
});

// Activate — clean old caches. Keep current versioned caches only;
// every stale entry from a previous deploy is removed here so the
// device doesn't accumulate JS chunks indefinitely.
const KEEP_CACHES = new Set([CACHE_NAME, AUDIO_CACHE]);
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => !KEEP_CACHES.has(k)).map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

// Fetch strategy:
// - Navigation requests (HTML): network-first, fallback to /breathing
// - Images + fonts: cache-first
// - API calls (/api/*): network-only (never cache)
// - JS/CSS: stale-while-revalidate

self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET, API calls, and all localhost/dev server requests
  if (request.method !== 'GET') return;
  if (url.hostname === 'localhost' || url.hostname === '127.0.0.1') return;
  if (url.pathname.startsWith('/api/')) return;

  // Jamendo audio streams — cache-on-demand so previously-listened tracks
  // continue to work offline. Bounded by AUDIO_CACHE entry count to keep
  // device storage in check.
  if (url.hostname.endsWith('storage.jamendo.com') || request.destination === 'audio') {
    event.respondWith(
      caches.open(AUDIO_CACHE).then(cache =>
        cache.match(request).then(cached => {
          if (cached) return cached;
          return fetch(request).then(response => {
            // Only cache full (200) responses, never partial 206 byte-ranges
            if (response.status === 200) {
              const clone = response.clone();
              cache.put(request, clone).then(() => trimCache(AUDIO_CACHE, 20));
            }
            return response;
          }).catch(() => cached);
        })
      )
    );
    return;
  }

  // Skip ALL other external origins — let the browser handle CDN/API requests directly.
  // The SW must not intercept them: CSP blocks SW-internal fetches to external domains,
  // which would cause map tiles, fonts, analytics, and auth calls to silently fail.
  if (url.hostname !== self.location.hostname) return;

  // Images and fonts: cache-first (exclude favicons — they must always be fresh)
  if (
    (request.destination === 'image' || request.destination === 'font') &&
    !url.pathname.includes('favicon') &&
    !url.pathname.includes('apple-touch-icon')
  ) {
    event.respondWith(
      caches.match(request).then(cached => {
        if (cached) return cached;
        return fetch(request).then(response => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(request, clone));
          return response;
        });
      })
    );
    return;
  }

  // HTML navigation: network-first, offline fallback
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() =>
        caches.match(OFFLINE_URL) || caches.match('/index.html')
      )
    );
    return;
  }

  // JS/CSS: stale-while-revalidate
  event.respondWith(
    caches.open(CACHE_NAME).then(cache =>
      cache.match(request).then(cached => {
        const fetchPromise = fetch(request).then(response => {
          cache.put(request, response.clone());
          return response;
        }).catch(() => cached || new Response('', { status: 503 }));
        return cached || fetchPromise;
      })
    )
  );
});

// Evict oldest entries when a cache exceeds `max` items. Simple FIFO
// rather than LRU — accurate enough for audio (20 tracks) and JS chunks.
async function trimCache(cacheName, max) {
  try {
    const cache = await caches.open(cacheName);
    const keys = await cache.keys();
    if (keys.length <= max) return;
    const toDelete = keys.length - max;
    for (let i = 0; i < toDelete; i++) await cache.delete(keys[i]);
  } catch (_) {}
}

// Push notifications
self.addEventListener('push', event => {
  if (!event.data) return;
  const data = event.data.json();
  event.waitUntil(
    self.registration.showNotification(data.title || 'Breathe', {
      body: data.body || 'Time to breathe',
      icon: '/icons/icon-192.png',
      badge: '/icons/icon-192.png',
      tag: 'breathe-reminder',
      renotify: true,
      actions: [
        { action: 'open', title: 'Start session' },
        { action: 'dismiss', title: 'Later' },
      ],
    })
  );
});

// Notification click
self.addEventListener('notificationclick', event => {
  event.notification.close();
  if (event.action === 'dismiss') return;
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then(clientList => {
      for (const client of clientList) {
        if (client.url.includes('breatheonline.app') && 'focus' in client) {
          return client.focus();
        }
      }
      return clients.openWindow('/breathing');
    })
  );
});
