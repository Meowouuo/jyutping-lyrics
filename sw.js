/**
 * ============================================================
 * Service Worker：粤拼歌词 PWA 离线缓存
 * ============================================================
 *
 * 功能说明：
 * - 缓存静态资源（HTML、CSS、JS、图片等），实现离线访问
 * - 采用"混合缓存策略"：核心资源缓存优先，歌词数据文件网络优先
 * - 安装时预缓存核心资源，确保基本功能离线可用
 * - 激活时清理旧版本缓存
 *
 * 缓存策略（v2.0.0 重大更新）：
 * - 预缓存：index.html、manifest、图标等核心文件 → Cache-First
 * - 歌词数据文件 (.js under lyrics/) → Network-First（防止 SPA Fallback 缓存错误 HTML）
 * - 其他静态资源 → Cache-First
 * - 版本号：更新 CACHE_VERSION 可触发重新缓存
 *
 * v2.0.0 变更说明：
 * - 修复歌词显示错乱的严重Bug：Cache-First 策略会永久缓存 Cloudflare Pages
 *   返回的 SPA Fallback HTML（当 URL 编码不匹配时），导致歌词 .js 文件被替换为
 *   index.html 内容，点击歌曲显示错误的歌词。
 * - 解决方案：对 lyrics/ 路径下的 .js 文件采用 Network-First 策略，
 *   同时升级版本号强制清除所有旧缓存。
 *
 * 作者：粤拼歌词项目组
 * 版本：2.0.0
 */

/* ============================================================
 * 常量定义
 * ============================================================ */

/** 缓存版本号，修改后 Service Worker 会重新安装并更新缓存 */
const CACHE_VERSION = 'v2.0.0';

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
        console.log('[SW] 激活完成，已清理旧缓存（含v1.x所有可能污染的缓存）');
        return self.clients.claim(); /* 立即控制所有页面 */
      })
  );
});

/* ============================================================
 * 请求拦截：混合缓存策略（v2.0.0 核心修复）
 * ============================================================
 *
 * 策略说明（v2.0.0 更新）：
 * 1. 歌词数据文件 (lyrics/*.js) → Network-First（网络优先）
 *    - 原因: Cloudflare Pages 的 SPA Fallback 会将不存在的/URL编码的请求
 *            重定向到 index.html，Cache-First 会永久缓存这个错误 HTML 响应
 *    - Network-First 确保每次都从服务器获取最新正确的歌词内容
 *    - 仅在网络失败时才使用缓存作为回退
 *
 * 2. 其他同源 GET 请求 → Cache-First（缓存优先）
 *    - HTML/CSS/图片等静态资源适合缓存优先
 *
 * 3. 异源请求（API调用等）→ 直接走网络，不缓存
 *
 * 4. 非 GET 请求 → 直接走网络，不缓存
 */

/** 判断是否为歌词数据文件 */
function isLyricFile(url) {
  return url.pathname.startsWith('/lyrics/') || url.pathname.startsWith('/lyrics\\/') ||
         url.pathname.includes('/lyrics/');
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  /* 只处理同源 GET 请求 */
  if (request.method !== 'GET' || url.origin !== self.location.origin) {
    return;
  }

  /* ===== 歌词数据文件：Network-First 策略（v2.0.0 核心 Bug 修复） ===== */
  if (isLyricFile(url)) {
    event.respondWith(
      caches.open(CACHE_NAME)
        .then((cache) => {
          return fetch(request)
            .then((networkResponse) => {
              /* 检查响应是否为有效的 JS 内容（非 HTML Fallback） */
              const contentType = networkResponse.headers.get('Content-Type') || '';

              /* 如果返回的是 HTML 而非 JS，说明触发了 SPA Fallback，不缓存！ */
              if (contentType.includes('text/html') || networkResponse.status !== 200) {
                console.warn('[SW] 歌词文件返回了非JS内容（可能是SPA Fallback）, URL:', url.pathname);
                return networkResponse; /* 直接返回，不缓存 */
              }

              /* 有效 JS 响应：更新缓存并返回 */
              const responseToCache = networkResponse.clone();
              cache.put(request, responseToCache).catch(() => {});
              return networkResponse;
            })
            .catch(() => {
              /* 网络失败：尝试从缓存读取 */
              console.log('[SW] 歌词文件网络请求失败，尝试缓存回退:', url.pathname);
              return cache.match(request).then((cached) => {
                return cached || new Response('离线状态，无法加载歌词', {
                  status: 503,
                  statusText: 'Service Unavailable'
                });
              });
            });
        })
    );
    return;
  }

  /* ===== 其他资源：Cache-First 策略（原有逻辑保持不变） ===== */
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
