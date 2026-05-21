/**
 * ============================================================
 * PWA 功能模块：Service Worker 注册与管理
 * ============================================================
 *
 * 功能说明：
 * - 注册 Service Worker 以启用 PWA 离线缓存功能
 * - 处理注册成功/失败的情况
 * - 提供 PWA 安装提示功能（可选）
 *
 * 使用方式：
 * - 在页面加载完成后自动执行
 * - 无需手动调用
 *
 * 作者：粤拼歌词项目组
 * 版本：1.0.0
 */

/* ============================================================
 * Service Worker 注册
 * ============================================================ */

/**
 * 注册 Service Worker
 * 页面加载完成后执行，启用离线缓存和 PWA 功能
 */
function registerServiceWorker() {
    // 检查浏览器是否支持 Service Worker
    if (!('serviceWorker' in navigator)) {
        console.log('[PWA] 浏览器不支持 Service Worker');
        return;
    }

    // 页面加载完成后注册 Service Worker
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
            .then((registration) => {
                console.log('[PWA] Service Worker 注册成功，作用域:', registration.scope);
            })
            .catch((error) => {
                console.warn('[PWA] Service Worker 注册失败:', error);
            });
    });
}

/* ============================================================
 * PWA 安装提示（可选功能）
 * ============================================================ */

/**
 * PWA 安装提示管理器
 * 监听 beforeinstallprompt 事件，提供安装提示
 */
let deferredPrompt = null;

/**
 * 初始化 PWA 安装提示
 * 捕获安装提示事件，供后续使用
 */
function initInstallPrompt() {
    // 监听安装提示事件
    window.addEventListener('beforeinstallprompt', (event) => {
        // 保存事件供后续使用
        deferredPrompt = event;
        console.log('[PWA] 安装提示已捕获，可以安装 PWA');
        // 注意：不调用 event.preventDefault()，允许浏览器显示安装图标
    });

    // 监听应用安装完成事件
    window.addEventListener('appinstalled', () => {
        console.log('[PWA] 应用已安装');
        deferredPrompt = null;
    });
}

/**
 * 触发 PWA 安装提示
 * 调用此方法显示安装对话框（需要在用户交互时调用）
 * @returns {Promise<boolean>} 是否成功安装
 */
async function showInstallPrompt() {
    if (!deferredPrompt) {
        console.log('[PWA] 暂无可用的安装提示');
        return false;
    }

    // 显示安装提示
    deferredPrompt.prompt();

    // 等待用户响应
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`[PWA] 用户安装选择: ${outcome}`);

    // 清除已使用的提示
    deferredPrompt = null;

    return outcome === 'accepted';
}

/* ============================================================
 * 模块初始化
 * ============================================================ */

// 页面加载时自动初始化 PWA 功能
document.addEventListener('DOMContentLoaded', () => {
    registerServiceWorker();
    initInstallPrompt();
});

// 导出公共 API（供其他模块使用）
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        registerServiceWorker,
        showInstallPrompt
    };
}
