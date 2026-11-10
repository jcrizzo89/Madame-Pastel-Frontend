// Service Worker para PWA Madame Pastel
const CACHE_NAME = 'madame-pastel-v1';
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
  '/logo-madame-pastel.jpeg',
  '/logo192.png',
  '/logo512.png'
];

// Instalación: precacheo de archivos esenciales
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS).catch((err) => {
        console.warn('Pre-cache error (non-blocking):', err);
      });
    }).then(() => self.skipWaiting())
  );
});

// Activación: limpieza de cachés anteriores
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});

// Estrategia de respuesta a peticiones (Fetch)
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Ignorar peticiones no GET o de extensiones
  if (request.method !== 'GET' || !request.url.startsWith('http')) {
    return;
  }

  // Rutas de API: Network First (priorizar datos frescos del backend)
  if (request.url.includes('/api/')) {
    event.respondWith(
      fetch(request).catch(() => caches.match(request))
    );
    return;
  }

  // Activos estáticos y navegación: Stale-While-Revalidate
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      const fetchPromise = fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return networkResponse;
        })
        .catch(() => cachedResponse);

      return cachedResponse || fetchPromise;
    })
  );
});
