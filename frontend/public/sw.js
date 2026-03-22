const CACHE_NAME = 'breathe-v2';
const OFFLINE_URL = '/breathing';

// Assets to cache immediately on install
const PRECACHE = [
  '/',
  '/breathing',
  '/home-page',
  '/index.html',
  '/Background_Night.jpg',
  '/Background_Day.jpg',
  '/Background_Nature.jpg',
  '/icons/Lotus_png.png',
  '/icons/Spiral_png.png',
  '/icons/Waves_png.png',
  '/icons/Constellation_png.png',
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

// Activate — clean old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
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

  // Skip non-GET and API calls
  if (request.method !== 'GET') return;
  if (url.pathname.startsWith('/api/')) return;

  // Images and fonts: cache-first
  if (request.destination === 'image' || request.destination === 'font') {
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
        });
        return cached || fetchPromise;
      })
    )
  );
});

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
