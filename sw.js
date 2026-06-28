const CACHE='mowp-v6';

// Only cache static assets that never change
// HTML pages are NOT cached — always fetched fresh from network
const STATIC=['./manifest.json','./icon-192.png','./icon-512.png'];

self.addEventListener('install',e=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(STATIC)));
  self.skipWaiting();
});

self.addEventListener('activate',e=>{
  e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))));
  clients.claim();
});

self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET') return;
  
  const url=new URL(e.request.url);
  
  // HTML pages — always network, no cache
  if(e.request.destination==='document'||url.pathname.endsWith('.html')||url.pathname==='/'){
    e.respondWith(
      fetch(e.request).catch(()=>caches.match(e.request))
    );
    return;
  }
  
  // Static assets — cache first, then network
  e.respondWith(
    caches.match(e.request).then(r=>r||fetch(e.request))
  );
});
