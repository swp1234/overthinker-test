const CACHE_NAME = 'overthinker-test-v2';
const ASSETS = ['/', '/index.html', '/css/style.css', '/js/app.js', '/js/i18n.js', '/manifest.json', '/icon-192.svg', '/icon-512.svg'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(ASSETS))); self.skipWaiting(); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))))); self.clients.claim(); });
self.addEventListener('fetch', e => { e.respondWith(caches.match(e.request).then(r => r || fetch(e.request))); });
