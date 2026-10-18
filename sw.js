/* Iqra: офлайн-кэш. Свои файлы — «сначала сеть», тексты сур — «сначала кэш». Аудио не кэшируется. */
const V = "iqra-v5";
const SHELL = ["./", "index.html", "app.js?v=5", "app.css?v=5", "icon.svg", "fonts/iqra-quran.woff", "manifest.webmanifest", "data/core.json", "data/course.json"];
self.addEventListener("install", e => { e.waitUntil(caches.open(V).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== V).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener("fetch", e => {
  const u = new URL(e.request.url);
  if (e.request.method !== "GET") return;
  const own = u.origin === location.origin;
  const fonts = /fonts\.(googleapis|gstatic)\.com$/.test(u.hostname);
  if (!own && !fonts) return;
  if (fonts || /\/quran\/\d{3}\.json$/.test(u.pathname)) {
    e.respondWith(caches.match(e.request).then(r => r || fetch(e.request).then(res => { if (res.ok || res.type === "opaque") { const cp = res.clone(); caches.open(V).then(c => c.put(e.request, cp)); } return res; })));
    return;
  }
  e.respondWith(fetch(e.request, { cache: "no-cache" }).then(res => { if (res.ok) { const cp = res.clone(); caches.open(V).then(c => c.put(e.request, cp)); } return res; })
    .catch(() => caches.match(e.request).then(r => r || caches.match("index.html"))));
});
