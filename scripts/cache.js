;(function(){
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/cache.js', { scope: '/' })
          .then(reg => console.log('SW registrado com scope:', reg.scope))
          .catch(err => console.error('Falha no registro SW:', err));
      });
    }
  
    if (typeof self === 'undefined' || !(self instanceof ServiceWorkerGlobalScope)) {
      return;
    }
  
    const PRECACHE = 'precache-v1';
    const RUNTIME = 'runtime-v1';
    const OFFLINE_URL = '/offline.html';
  
    const PRECACHE_URLS = [
      '/',
      OFFLINE_URL,
      '/styles/styles.css',
      '/styles/home.css',
      '/styles/about.css',
      '/styles/projects.css',
      '/styles/skills.css',
      '/styles/contact.css',
      '/styles/navbar.css',
      '/styles/footer.css',
      '/scripts/anime.min.js',
      '/scripts/scripts.js',
      '/scripts/contact.js',
      '/fonts/Poppins-Regular.ttf',
      '/Images/profile.webp',
      '/Images/geometric.webp',
      '/Images/clouds.webp',
      '/Images/Andres.webp'
    ];
  
    self.addEventListener('install', event => {
      event.waitUntil(
        caches.open(PRECACHE)
          .then(cache => cache.addAll(PRECACHE_URLS))
          .then(() => self.skipWaiting())
      );
    });
  
    self.addEventListener('activate', event => {
      event.waitUntil(
        caches.keys()
          .then(keys => Promise.all(
            keys
              .filter(key => key !== PRECACHE && key !== RUNTIME)
              .map(key => caches.delete(key))
          ))
          .then(() => self.clients.claim())
      );
    });
  
    async function cacheFirst(request) {
      const cache = await caches.open(RUNTIME);
      const cached = await cache.match(request);
      if (cached) return cached;
      const response = await fetch(request);
      if (response && response.ok) cache.put(request, response.clone());
      return response;
    }
  
    async function staleWhileRevalidate(request) {
      const cache = await caches.open(RUNTIME);
      const cached = await cache.match(request);
      const network = fetch(request)
        .then(response => {
          if (response && response.ok) cache.put(request, response.clone());
          return response;
        })
        .catch(() => {});
      return cached || network;
    }
  
    async function networkFirst(request) {
      const cache = await caches.open(RUNTIME);
      try {
        const response = await fetch(request);
        if (response && response.ok) cache.put(request, response.clone());
        return response;
      } catch (err) {
        const cached = await cache.match(request) || await cache.match(OFFLINE_URL);
        return cached;
      }
    }
  
    self.addEventListener('fetch', event => {
      if (event.request.method !== 'GET') return;
      const url = new URL(event.request.url);
      const dest = event.request.destination;
  
      if (event.request.mode === 'navigate') {
        event.respondWith(networkFirst(event.request));
        return;
      }
  
      if (dest === 'script' || dest === 'style' || /\.js$/.test(url.pathname) || /\.css$/.test(url.pathname)) {
        event.respondWith(staleWhileRevalidate(event.request));
        return;
      }
  
      if (dest === 'image' || dest === 'font' || /\.(?:png|jpg|jpeg|svg|webp|ttf|woff2?)$/.test(url.pathname)) {
        event.respondWith(cacheFirst(event.request));
        return;
      }
    });
  
  })();