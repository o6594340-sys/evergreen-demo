// Kill-switch: удаляет все старые кэши и снимает регистрацию этого service worker.
// Временная мера — офлайн-кэш выключен на время активной доработки демо,
// чтобы браузер всегда показывал актуальную версию без ручной очистки кэша.
self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', e => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.map(k => caches.delete(k)));
    await self.registration.unregister();
    const clients = await self.clients.matchAll({ type: 'window' });
    clients.forEach(c => c.navigate(c.url));
  })());
});
