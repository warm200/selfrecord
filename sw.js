/*
  sw.js —— Service Worker，让 App 添加到主屏幕后可离线打开。

  策略：网络优先（network-first）。
  - 有网络时：总是去拿服务器上的最新文件，所以你每次 push 部署后都会自动看到最新版，
    不需要再手动改任何版本号。
  - 没网络时：用上次缓存下来的文件，照常打开（数据本来就在本地）。
*/

const CACHE = 'selfrecord';

// 首次访问时缓存这些文件，保证之后离线也能打开。
const ASSETS = [
  './',
  './index.html',
  './css/style.css',
  './js/storage.js',
  './js/lock.js',
  './js/app.js',
  './manifest.webmanifest',
  './icons/icon-180.png',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;
  // 只处理本站自己的文件
  if (new URL(req.url).origin !== location.origin) return;

  // 网络优先：拿到最新就顺手更新缓存；断网则回退到缓存。
  event.respondWith(
    fetch(req)
      .then(res => {
        const copy = res.clone();
        caches.open(CACHE).then(cache => cache.put(req, copy));
        return res;
      })
      .catch(() => caches.match(req).then(c => c || caches.match('./index.html')))
  );
});
