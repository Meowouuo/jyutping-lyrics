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
 * PWA 主题色动态更新
 * ============================================================ */

/**
 * 动态更新 PWA 主题色
 * 根据当前网页主题（日间/夜间）动态更新 theme-color meta 标签
 * 使 PWA 窗口标题栏颜色与网页背景色保持一致
 */
function updatePWAThemeColor() {
    // 获取 theme-color meta 标签
    const themeColorMeta = document.getElementById('themeColorMeta');
    if (!themeColorMeta) {
        console.log('[PWA] 未找到 theme-color meta 标签');
        return;
    }

    // 获取当前网页的实际背景色（从 CSS 变量中读取）
    const computedStyle = getComputedStyle(document.documentElement);
    const bgColor = computedStyle.getPropertyValue('--bg-primary').trim();

    if (bgColor) {
        // 将网页背景色设置为 PWA 主题色
        themeColorMeta.setAttribute('content', bgColor);
        console.log(`[PWA] 主题色已更新为: ${bgColor}`);
    }
}

/**
 * 初始化主题色监听
 * 监听网页主题切换，自动更新 PWA 主题色
 */
function initThemeColorListener() {
    // 初始更新一次（等待主题模块加载完成）
    // 延迟执行确保 CSS 变量已生效
    setTimeout(updatePWAThemeColor, 100);

    // 监听系统主题变化（用于"跟随系统"模式）
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', () => {
        // 延迟执行，等待 ThemeModule 更新 CSS 变量
        setTimeout(updatePWAThemeColor, 100);
    });

    // 监听网页主题手动切换（日间/夜间/跟随系统）
    // 通过 MutationObserver 监听 html 元素的 style 属性变化
    const observer = new MutationObserver(() => {
        setTimeout(updatePWAThemeColor, 50);
    });
    observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['style', 'class', 'data-theme']
    });
}

/* ============================================================
 * 模块初始化
 * ============================================================ */

// 页面加载时自动初始化 PWA 功能
document.addEventListener('DOMContentLoaded', () => {
    registerServiceWorker();
    initInstallPrompt();
    initThemeColorListener();
});

// 导出公共 API（供其他模块使用）
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        registerServiceWorker,
        showInstallPrompt
    };
}
