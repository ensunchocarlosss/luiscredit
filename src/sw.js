// Service Worker mínimo — necesario para que Chrome/Android
// ofrezca "Instalar aplicación" (modo standalone real) en vez de
// solo "Crear acceso directo" (que muestra la barra del navegador).
const CACHE = 'luiscredit-v1'

self.addEventListener('install', (e) => {
  self.skipWaiting()
})

self.addEventListener('activate', (e) => {
  self.clients.claim()
})

self.addEventListener('fetch', (e) => {
  // Passthrough simple: no cachea nada agresivamente,
  // solo habilita la instalación como PWA.
  e.respondWith(fetch(e.request).catch(() => caches.match(e.request)))
})
