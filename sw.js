// ✅ CHANGE THIS when you update your game (new files, questions, etc.)
const CACHE_NAME = 'estonian-spelling-cache-v6';

// ✅ List of all files to cache
const FILES_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/questions.json',
  '/audio/kass.mp3',
  '/audio/koer.mp3',
  '/images/kass.jpg',
  '/images/koer.jpg'
];

// ✅ Install: pre-cache everything
self.addEventListener('install', event => {
  console.log('[Service Worker] Installing new version...');
  self.skipWaiting(); // activate immediately

  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('[Service Worker] Pre-caching app shell');
      return cache.addAll(FILES_TO_CACHE);
    })
  );
});

// ✅ Activate: delete all old caches automatically
self.addEventListener('activate', event => {
  console.log('[Service Worker] Activating new service worker...');
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            console.log('[Service Worker] Removing old cache:', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// ✅ Fetch: use network first, then fallback to cache
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Update cache with the latest version
        const cloned = response.clone();
        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, cloned);
        });
        return response;
      })
      .catch(() => {
        // Fallback to cache when offline
        return caches.match(event.request);
      })
  );
});

// ✅ Listen for manual updates (optional)
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
