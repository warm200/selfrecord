/*
  sw.js —— Service Worker，让 App 添加到主屏幕后可以离线打开。
  做的事很简单：第一次访问时把这些文件缓存下来，
  之后就算没有网络也能正常打开（数据本来就存在本地）。

  说明：修改了代码后，把下面的 CACHE 版本号 +1（如 v2、v3），
  手机上重新打开一次即可更新缓存。
*/

const CACHE = 'selfrecord-v1';

const ASSETS = [
  './',
  './index.html',
  './css/style.css',
  './js/storage.js',
  './js/app.js',
  './manifest.webmanifest',
  './icons/icon-180.png',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

// 安装：缓存核心文件
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

// 激活：清理旧版本缓存
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// 请求：优先用缓存，没有再走网络（离线优先）
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request).then(cached => cached || fetch(event.request))
  );
});
