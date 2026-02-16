// ===========================================
// SERVICE WORKER - APP DUEÑO
// Cachea todos los recursos para funcionamiento offline
// ===========================================

const CACHE_NAME = 'dueno-cache-v1';
const API_CACHE_NAME = 'dueno-api-cache-v1';

// Archivos a cachear al instalar
const urlsToCache = [
  '/Beta3/Dueño.html',
  '/Beta3/styles_dueño.css',
  '/Beta3/app_dueño.js',
  '/Beta3/manifest_dueno.json',
  '/Beta3/icons/icon-192.png',
  '/Beta3/icons/icon-512.png'
];

// Instalación del Service Worker
self.addEventListener('install', event => {
  console.log('👷 Service Worker instalando...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('✅ Cache abierto, guardando recursos...');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log('✅ Todos los recursos cacheados');
        return self.skipWaiting(); // Activar inmediatamente
      })
  );
});

// Activación - limpiar caches viejos
self.addEventListener('activate', event => {
  console.log('👷 Service Worker activado');
  
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME && cacheName !== API_CACHE_NAME) {
            console.log('🗑️ Eliminando cache viejo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('✅ Service Worker listo para controlar clients');
      return self.clients.claim(); // Tomar control inmediato
    })
  );
});

// Interceptar peticiones
self.addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);
  
  // Estrategia para peticiones a la API
  if (url.pathname.includes('/api/')) {
    event.respondWith(handleApiRequest(request));
    return;
  }
  
  // Estrategia para recursos estáticos (archivos locales)
  event.respondWith(handleStaticRequest(request));
});

// Manejar peticiones a la API
async function handleApiRequest(request) {
  try {
    // Intentar obtener de la red primero
    const networkResponse = await fetch(request);
    
    // Si hay conexión, cachear la respuesta para offline
    if (networkResponse.ok) {
      const responseToCache = networkResponse.clone();
      caches.open(API_CACHE_NAME).then(cache => {
        cache.put(request, responseToCache);
        console.log('💾 API cacheada:', request.url);
      });
    }
    
    return networkResponse;
  } catch (error) {
    // Si no hay conexión, buscar en cache
    console.log('📴 Offline - buscando API en cache:', request.url);
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
      console.log('✅ Respuesta API desde cache:', request.url);
      return cachedResponse;
    }
    
    // Si no hay cache, devolver error amigable
    return new Response(
      JSON.stringify({ 
        error: 'offline', 
        message: 'No hay conexión a internet y no hay datos cacheados' 
      }),
      {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

// Manejar peticiones de archivos estáticos (HTML, CSS, JS, imágenes)
async function handleStaticRequest(request) {
  // Estrategia: cache first, luego red
  const cachedResponse = await caches.match(request);
  
  if (cachedResponse) {
    console.log('✅ Desde cache:', request.url);
    return cachedResponse;
  }
  
  try {
    // Si no está en cache, buscar en red
    const networkResponse = await fetch(request);
    
    // Guardar en cache para próxima vez
    if (networkResponse.ok) {
      const responseToCache = networkResponse.clone();
      caches.open(CACHE_NAME).then(cache => {
        cache.put(request, responseToCache);
        console.log('💾 Nuevo recurso cacheado:', request.url);
      });
    }
    
    return networkResponse;
  } catch (error) {
    console.log('❌ Error cargando recurso:', request.url);
    
    // Si es una página HTML, devolver página offline personalizada
    if (request.headers.get('Accept').includes('text/html')) {
      return caches.match('/offline.html');
    }
    
    return new Response('Recurso no disponible offline', {
      status: 404,
      headers: { 'Content-Type': 'text/plain' }
    });
  }
}

// Escuchar mensajes desde la app
self.addEventListener('message', event => {
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
  }
});