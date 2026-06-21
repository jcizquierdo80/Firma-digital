/**
 * Service Worker - Offline First
 * Firma Digital v4.2
 * Estrategia: Stale-While-Revalidate para assets críticos
 */

const CACHE_NAME = 'firma-digital-v4.2';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/assets/css/main.css?v=4009',
  '/assets/js/main.js',
  '/assets/js/capabilities.js',
  '/assets/js/state.js',
  '/assets/js/share-manager.js',
  '/media/f1-poster.jpg',
  '/media/perfil.webp'
];

// Install: Cache essential assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing...', CACHE_NAME);
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Caching essential assets');
      return cache.addAll(ASSETS_TO_CACHE).catch(err => {
        console.warn('[SW] Some assets failed to cache:', err);
        // Continuar incluso si algunos assets fallan
        return Promise.resolve();
      });
    })
  );
  self.skipWaiting();
});

// Activate: Clean old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('[SW] Activation complete');
      return self.clients.claim();
    })
  );
});

// Fetch: Stale-While-Revalidate strategy
self.addEventListener('fetch', (event) => {
  const { request } = event;
  
  // Solo manejar solicitudes GET
  if (request.method !== 'GET') return;
  
  // Ignorar solicitudes externas (CDN, APIs de terceros)
  if (!request.url.startsWith(self.location.origin)) return;
  
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      // Retornar cached response inmediatamente si existe
      if (cachedResponse) {
        // Actualizar caché en segundo plano (stale-while-revalidate)
        const fetchPromise = fetch(request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, networkResponse.clone());
            });
          }
          return networkResponse;
        }).catch(() => {
          // Network falló, ya retornamos el cached response
          return cachedResponse;
        });
        
        return cachedResponse;
      }
      
      // No hay caché, intentar network
      return fetch(request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, networkResponse.clone());
          });
        }
        return networkResponse;
      }).catch(() => {
        // Offline total y no hay caché
        if (request.headers.get('accept').includes('text/html')) {
          // Para HTML, retornar index.html como fallback
          return caches.match('/index.html');
        }
        // Para otros recursos, retornar error
        return new Response('Offline', { status: 503, statusText: 'Service Unavailable' });
      });
    })
  );
});

// Manejar mensajes del cliente
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
