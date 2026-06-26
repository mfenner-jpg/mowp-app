const CACHE='mowp-v4';
const FILES=['./index.html','./mowp_about.html','./mowp_about_whatwedo.html','./mowp_about_mission.html','./mowp_about_board.html','./mowp_about_team.html','./mowp_about_sponsors.html','./mowp_about_contact.html','./mowp_getmeals.html','./mowp_givehope.html','./mowp_volunteer.html','./mowp_programs.html','./mowp_events.html','./mowp_news.html','./manifest.json','./icon-192.png','./icon-512.png'];

// Install — pre-cache all app files
self.addEventListener('install',e=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES)));
  self.skipWaiting();
});

// Activate — clean up old caches
self.addEventListener('activate',e=>{
  e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))));
  clients.claim();
});

// Fetch — NETWORK FIRST strategy
// Always tries network first for fresh content
// Falls back to cache if offline or network fails
self.addEventListener('fetch',e=>{
  // Only handle GET requests
  if(e.request.method!=='GET') return;
  
  e.respondWith(
    fetch(e.request)
      .then(networkResponse=>{
        // Got fresh response from network — update cache and return it
        if(networkResponse&&networkResponse.status===200){
          const clone=networkResponse.clone();
          caches.open(CACHE).then(c=>c.put(e.request,clone));
        }
        return networkResponse;
      })
      .catch(()=>{
        // Network failed — serve from cache (offline fallback)
        return caches.match(e.request);
      })
  );
});
