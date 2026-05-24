/**
 * ============================================================
 * Service Worker：粤拼歌词 PWA 离线缓存
 * ============================================================
 *
 * 功能说明：
 * - 缓存静态资源（HTML、CSS、JS、图片等），实现离线访问
 * - 采用"缓存优先"策略：优先从缓存读取，缓存未命中则从网络获取
 * - 安装时预缓存核心资源，确保基本功能离线可用
 * - 激活时清理旧版本缓存
 *
 * 缓存策略：
 * - 预缓存：index.html、manifest、图标等核心文件
 * - 运行时缓存：歌词数据文件、音频文件等动态资源
 * - 版本号：更新 CACHE_VERSION 可触发重新缓存
 *
 * 作者：粤拼歌词项目组
 * 版本：1.0.0
 */

/* ============================================================
 * 常量定义
 * ============================================================ */

/** 缓存版本号，修改后 Service Worker 会重新安装并更新缓存 */
const CACHE_VERSION = 'v1.1.0';

/** 缓存名称，包含版本号，便于版本管理 */
const CACHE_NAME = `jyutping-lyrics-${CACHE_VERSION}`;

/** 预缓存资源列表：安装时立即缓存的核心文件 */
const PRECACHE_URLS = [
  './',                          /* 首页 */
  './index.html',                /* 主页面 */
  './site.webmanifest',          /* PWA 清单 */
  './icons/favicon.ico',               /* 网站图标 */
  './icons/favicon.svg',               /* SVG 图标 */
  './icons/apple-touch-icon.png',      /* Apple 触摸图标 */
  './icons/web-app-manifest-192x192.png', /* PWA 图标 192x192 */
  './icons/web-app-manifest-512x512.png', /* PWA 图标 512x512 */
  './jyutping-dict.js',          /* 粤拼词典 */
  './jyutping-context.js',       /* 粤拼语境规则 */
  './songFiles.js',              /* 歌曲列表 */
  './js/correction.js',          /* 纠错模块 */
  './js/edit-lyrics.js',         /* 编辑歌词模块 */
  './js/import.js',              /* 导入模块 */
  './js/delete.js',              /* 删除模块 */
  './js/pwa.js',                 /* PWA 模块 */
  './submit.html'                /* 提交页面 */
];

/** 运行时缓存的最大数量（防止缓存无限增长） */
const MAX_RUNTIME_CACHE = 50;

/** 运行时缓存的最大存活时间（7天，单位：秒） */
const MAX_CACHE_AGE = 7 * 24 * 60 * 60;

/* ============================================================
 * 安装事件：预缓存核心资源
 * ============================================================ */

self.addEventListener('install', (event) => {
  /* 等待所有预缓存资源完成，安装完成后立即激活新 Service Worker */
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] 预缓存核心资源...');
        return cache.addAll(PRECACHE_URLS);
      })
      .then(() => {
        console.log('[SW] 预缓存完成');
        return self.skipWaiting(); /* 跳过等待，立即激活 */
      })
      .catch((err) => {
        console.warn('[SW] 部分资源预缓存失败:', err);
        return self.skipWaiting(); /* 即使部分失败也继续激活 */
      })
  );
});

/* ============================================================
 * 激活事件：清理旧版本缓存
 * ============================================================ */

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        /* 找出所有不属于当前版本的缓存，逐一删除 */
        const deletePromises = cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => {
            console.log('[SW] 删除旧缓存:', name);
            return caches.delete(name);
          });
        return Promise.all(deletePromises);
      })
      .then(() => {
        console.log('[SW] 激活完成，已清理旧缓存');
        return self.clients.claim(); /* 立即控制所有页面 */
      })
  );
});

/* ============================================================
 * 请求拦截：缓存优先策略
 * ============================================================
 *
 * 策略说明：
 * 1. 同源 GET 请求 → 优先从缓存读取，缓存未命中则从网络获取并缓存
 * 2. 异源请求（API调用等）→ 直接走网络，不缓存
 * 3. 非 GET 请求 → 直接走网络，不缓存
 */

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  /* 只处理同源 GET 请求 */
  if (request.method !== 'GET' || url.origin !== self.location.origin) {
    return;
  }

  event.respondWith(
    caches.match(request)
      .then((cachedResponse) => {
        /* 缓存命中：直接返回缓存内容 */
        if (cachedResponse) {
          return cachedResponse;
        }

        /* 缓存未命中：从网络获取，成功后存入缓存 */
        return fetch(request)
          .then((networkResponse) => {
            /* 只缓存成功的响应 */
            if (!networkResponse || networkResponse.status !== 200) {
              return networkResponse;
            }

            /* 克隆响应（响应流只能消费一次） */
            const responseToCache = networkResponse.clone();

            caches.open(CACHE_NAME)
              .then((cache) => cache.put(request, responseToCache))
              .catch(() => {
                /* 缓存写入失败不影响页面正常使用 */
              });

            return networkResponse;
          })
          .catch(() => {
            /* 网络请求失败：对于导航请求返回离线页面，其他返回错误 */
            if (request.mode === 'navigate') {
              return caches.match('./index.html');
            }
            return new Response('离线状态，无法访问', {
              status: 503,
              statusText: 'Service Unavailable'
            });
          });
      })
  );
});
