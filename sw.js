const CACHE='mowp-v3';
const FILES=['./index.html','./mowp_about.html','./mowp_about_mission.html','./mowp_about_board.html','./mowp_about_team.html','./mowp_about_sponsors.html','./mowp_about_contact.html','./mowp_getmeals.html','./mowp_givehope.html','./mowp_volunteer.html','./mowp_programs.html','./mowp_events.html','./mowp_news.html','./manifest.json','./icon-192.png','./icon-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES)));self.skipWaiting();});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))));clients.claim();});
self.addEventListener('fetch',e=>e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request))));
