// ============================================
// TTS 语音播报模块
// 功能：提供粤拼语音朗读功能，支持整行、分段、单字播放
// 兼容：桌面浏览器、移动端 Safari/Chrome、微信内置浏览器
//
// 多源 CDN 切换（v2.0 新增）：
//   当主 CDN 加载失败时，自动切换到备选源尝试，
//   解决国内无法直接访问 GitHub/jsDelivr 的问题。
//   备选源包括 Cloudflare Worker 代理和公共 GitHub 加速站。
//
// 注意：使用 Audio 元素播放，避免 fetch 导致的 CORS 问题
// ============================================

// ============================================
// 全局状态变量
// ============================================

// TTS 清单数据（从 manifest.v1.json 加载）
// 格式为 { "粤拼": "音频文件路径", ... } 的映射表
let ttsManifest = null;

// TTS 音频文件的基础 URL（主源）
// 拼接方式：ttsBaseUrl + '/' + manifest中的路径
let ttsBaseUrl = '';

// 当前正在播放的 Audio 对象
// 用于控制播放、暂停和停止
let currentAudio = null;

// 当前播放按钮元素（用于高亮显示）
// 点击同一按钮可停止播放（toggle 行为）
let currentPlayingBtn = null;

// TTS 播放模式开关
// 开启后，点击歌词中的单字即可播放对应发音
let ttsMode = false;

// 当前正在播放的字符元素（用于单字播放高亮）
// 播放时添加高亮样式，播放完成后移除高亮
let currentPlayingChar = null;

// 是否已有用户交互（用于处理浏览器自动播放策略）
// 现代浏览器要求音频播放必须由用户手势触发
let _hasUserInteraction = false;

// ============================================
// 多源 CDN 配置（v2.0 新增）
// ============================================

/**
 * CDN 备选源列表
 * @description 定义多个可用的 CDN 源，按优先级排序。
 *              系统会依次尝试每个源，直到成功或全部失败。
 *
 * 使用说明：
 * - 第一个元素是默认主源（从 manifest 中读取的 baseUrl）
 * - 后续元素是备选源，在主源失败时自动切换
 * - 每个 source 对象包含：
 *   - name: 源名称（仅用于日志标识）
 *   - baseUrl: 基础 URL（会与 manifest 中的相对路径拼接）
 *   - enabled: 是否启用（可单独禁用某个源）
 *
 * 备选源说明：
 * - CF Worker 代理：通过项目自建的 Cloudflare Worker 转发请求到 GitHub Raw
 *   需要将 WORKER_URL 替换为实际的 Worker 域名
 */
const CDN_FALLBACK_SOURCES = [
    {
        // 主源：jsDelivr CDN（海外访问快，国内可能被墙）
        name: 'jsdelivr',
        baseUrl: '',  // 运行时从 manifest 动态填充
        enabled: true
    },
    {
        // 备选源1：Cloudflare Worker 音频代理
        // 利用 CF 全球网络代理 GitHub Raw，解决国内访问问题
        // ⚠️ 需要将此 URL 替换为实际部署的 Worker 域名
        name: 'worker-proxy',
        baseUrl: '',  // 运行时根据页面域名动态构建
        enabled: true,
        isWorkerProxy: true  // 标识这是 Worker 代理（URL 构建方式不同）
    },
    {
        // 备选源2：GitHub 公共加速镜像（备用方案，稳定性不保证）
        // 如需使用，取消注释并填入有效的加速地址
        name: 'gh-mirror',
        baseUrl: '',
        enabled: false  // 默认禁用，需要时可开启
    }
];

// 记录上次成功的 CDN 源索引
// 用于优化：下次请求优先使用上次的成功源，减少不必要的重试
let _lastSuccessfulSourceIndex = 0;

// ============================================
// 用户交互标记
// 功能：标记用户已有交互行为，以满足浏览器自动播放策略
// 必须在用户点击后调用，否则音频无法播放
// ============================================
function _markUserInteraction() {
    _hasUserInteraction = true;
}

// ============================================
// 微信环境初始化
// 功能：针对微信内置浏览器的特殊处理
// 微信环境需要特殊触发才能播放音频
// 原因：微信的 WebView 对音频自动播放有额外限制
// ============================================
function _initWechat() {
    if (!/MicroMessenger/i.test(navigator.userAgent)) return;
    console.log('[TTS] WeChat detected');

    const unlock = () => { _markUserInteraction(); };

    if (window.WeixinJSBridge && window.WeixinJSBridge.invoke) {
        WeixinJSBridge.invoke('getNetworkType', {}, unlock);
    } else {
        document.addEventListener('WeixinJSBridgeReady', unlock, { once: true });
    }
}

// ============================================
// 构建 CDN 源的完整基础 URL
// @description 根据源的配置信息构建完整的 baseUrl
// @param {Object} source - CDN 源配置对象
// @returns {string} 完整的基础 URL
// ============================================
function _buildSourceBaseUrl(source) {
    // 如果已有固定的 baseUrl（如 jsDelivr），直接返回
    if (source.baseUrl && !source.isWorkerProxy) {
        return source.baseUrl;
    }

    // Worker 代理模式：基于当前页面域名构建
    if (source.isWorkerProxy) {
        // 使用当前页面的 origin 作为 Worker 基础地址
        // 假设 Worker 部署在同一域名下（通过路由规则区分）
        // 例如：页面在 https://lyrics.example.com，Worker 在 https://lyrics.example.com/audio/
        const origin = window.location.origin;
        return origin + '/audio';
    }

    // 其他备选源
    return source.baseUrl || '';
}

// ============================================
// 初始化多源 CDN 配置
// @description 在 manifest 加载完成后调用，用实际数据填充 CDN 源列表
//              将 manifest 中的 baseUrl 设置为主源，并初始化其他备选源
// ============================================
function _initCDNSources() {
    if (!ttsBaseUrl) return;

    // 设置主源为 manifest 中的 baseUrl
    CDN_FALLBACK_SOURCES[0].baseUrl = ttsBaseUrl;

    // 初始化 Worker 代理的完整 URL（延迟到首次需要时构建）
    // Worker 代理的 URL 是动态的，依赖 location.origin
    // 不在这里预构建，由 _buildSourceBaseUrl 在运行时处理

    console.log('[TTS] CDN sources initialized, primary:', ttsBaseUrl);
}

// ============================================
// 播放音频核心函数（v2.0 升级：支持多源自动切换）
// 功能：创建 Audio 对象并播放指定 URL，支持跨源重试机制
//
// 参数：
//   - audioPath: 音频文件的相对路径（来自 manifest，如 "v1/4f/xxx.mp3"）
//   - retryCount: 当前重试次数（内部递归使用，默认为 0）
//   - sourceIndex: 当前使用的 CDN 源索引（内部递归使用，默认从上次成功的源开始）
//
// 返回值：Promise，播放成功或失败时 resolve
//
// v2.0 变更：
//   - 不再对同一个 URL 重试 3 次
//   - 改为：每个 CDN 源尝试 1 次，失败后立即切换到下一个源
//   - 总尝试次数 = 已启用的 CDN 源数量
// ============================================
function _playAudio(audioPath, retryCount = 0, sourceIndex = null) {

    // ------------------------------------------------
    // 确定当前要使用的 CDN 源
    // ------------------------------------------------

    // 如果指定了源索引，直接使用；否则从上次成功的源开始
    if (sourceIndex === null) {
        sourceIndex = _lastSuccessfulSourceIndex;
    }

    // 找到下一个可用的已启用源
    let currentSource = null;
    let startIndex = sourceIndex;
    let attempts = 0;  // 已尝试次数
    const maxAttempts = CDN_FALLBACK_SOURCES.filter(s => s.enabled).length;  // 最大尝试次数 = 启用源数

    for (let i = startIndex; i < CDN_FALLBACK_SOURCES.length && attempts < maxAttempts; i++) {
        if (CDN_FALLBACK_SOURCES[i].enabled) {
            sourceIndex = i;
            currentSource = CDN_FALLBACK_SOURCES[i];
            attempts++;
            break;
        }
    }

    // 如果从 startIndex 没找到可用源，从头再找（循环）
    if (!currentSource && attempts < maxAttempts) {
        for (let i = 0; i < startIndex && attempts < maxAttempts; i++) {
            if (CDN_FALLBACK_SOURCES[i].enabled) {
                sourceIndex = i;
                currentSource = CDN_FALLBACK_SOURCES[i];
                attempts++;
                break;
            }
        }
    }

    // 所有源都不可用
    if (!currentSource) {
        console.error('[TTS] No available CDN sources');
        return Promise.reject(new Error('No available CDN sources'));
    }

    // ------------------------------------------------
    // 构建完整的音频 URL
    // ------------------------------------------------
    const sourceBaseUrl = _buildSourceBaseUrl(currentSource);
    const fullUrl = sourceBaseUrl + '/' + audioPath;

    console.log('[TTS] Attempting source:', currentSource.name, '(' + (attempts) + '/' + maxAttempts + ')', fullUrl);

    return new Promise((resolve, reject) => {
        // 显示加载提示（如果加载提示组件存在）
        if (window.TTSLoading && window.currentSong) {
            window.TTSLoading.show(window.currentSong.id);
        }

        // 创建新的 Audio 对象
        const audio = new Audio();
        currentAudio = audio;  // 保存引用，用于后续停止控制

        // 标记是否已完成（避免重复调用 resolve/reject）
        let resolved = false;
        // 成功完成回调
        const done = () => {
            if (!resolved) {
                resolved = true;
                // 记录本次成功的源索引，下次优先使用
                _lastSuccessfulSourceIndex = sourceIndex;
                resolve();
            }
        };
        // 失败回调，传入错误对象
        const fail = (e) => {
            if (!resolved) {
                resolved = true;
                reject(e || new Error('Audio error'));
            }
        };

        // 监听播放结束事件（音频自然播放完毕）
        audio.onended = done;

        // 监听播放错误事件（加载失败或解码错误）
        // v2.0: 失败后尝试下一个 CDN 源
        audio.onerror = () => {
            console.warn('[TTS] Source failed:', currentSource.name, '- trying next source');

            // 尝试下一个 CDN 源
            const nextSourceIndex = sourceIndex + 1;
            // 检查是否还有更多可用源
            const hasMoreSources = CDN_FALLBACK_SOURCES.some(
                (s, idx) => s.enabled && idx > sourceIndex
            );

            if (hasMoreSources) {
                // 有更多源可以尝试，递归调用并传入下一个源索引
                _playAudio(audioPath, retryCount + 1, nextSourceIndex)
                    .then(resolve)
                    .catch(reject);
            } else {
                // 所有源都已尝试过，放弃
                fail(new Error('All CDN sources failed after ' + attempts + ' attempts'));
            }
        };

        // 监听时间更新事件，用于检测播放是否正常结束
        audio.addEventListener('timeupdate', function () {
            if (!resolved && audio.duration && audio.currentTime >= audio.duration - 0.06) {
                done();
            }
        });

        // 设置音频源 URL
        audio.src = fullUrl;

        // 尝试播放函数
        const tryPlay = () => {
            const playPromise = audio.play();
            if (playPromise !== undefined) {
                playPromise.catch((err) => {
                    if (err.name === 'NotAllowedError' && !_hasUserInteraction) {
                        showToast('请点击页面任意位置后再播放');
                    }
                    fail(err);
                });
            }
        };

        // 监听 canplay 事件，音频可以播放时尝试播放
        audio.addEventListener('canplay', tryPlay, { once: true });

        // 延迟 500ms 后再次尝试播放（兜底机制）
        setTimeout(() => { if (!resolved) tryPlay(); }, 500);

        // 设置总超时时间 15 秒（针对所有源的总超时保护）
        setTimeout(() => {
            if (!resolved) {
                const nextIdx = sourceIndex + 1;
                const hasMore = CDN_FALLBACK_SOURCES.some(
                    (s, idx) => s.enabled && idx > sourceIndex
                );
                if (hasMore) {
                    _playAudio(audioPath, retryCount + 1, nextIdx).then(resolve).catch(reject);
                } else {
                    fail(new Error('Timeout after trying all CDN sources'));
                }
            }
        }, 15000);
    });
}

// ============================================
// 加载 TTS 清单
// 功能：从 manifest.v1.json 加载音频文件映射表
// manifest 包含粤拼到音频文件的映射关系
// 加载失败时会自动重试一次（延迟 1 秒）
// v2.0: 加载成功后会自动初始化多源 CDN 配置
// ============================================
function loadTTSManifest() {
    return new Promise(function(resolve) {
        // 首次尝试加载 manifest 文件
        fetch('tts/manifest.v1.json')
            .then(function(resp) {
                if (resp.ok) return resp.json();
                throw new Error('HTTP ' + resp.status);
            })
            .then(function(data) {
                // 保存清单数据（粤拼→文件路径映射）
                ttsManifest = data.items;
                // 保存基础 URL（音频文件的公共前缀）
                ttsBaseUrl = data.baseUrl;
                // v2.0: 初始化多源 CDN 配置
                _initCDNSources();
                resolve();  // 加载成功
            })
            .catch(function(e) {
                // 首次加载失败，打印警告
                console.warn('[TTS] Manifest load error:', e.message || e);
                // 1 秒后重试一次（可能是临时网络问题）
                setTimeout(function() {
                    fetch('tts/manifest.v1.json')
                        .then(function(resp) { return resp.json(); })
                        .then(function(data) {
                            // 重试成功，保存数据
                            ttsManifest = data.items;
                            ttsBaseUrl = data.baseUrl;
                            // v2.0: 初始化多源 CDN 配置
                            _initCDNSources();
                        })
                        .catch(function(e2) {
                            // 重试仍然失败，打印警告但不阻塞
                            console.warn('[TTS] Manifest retry error:', e2.message || e2);
                        });
                }, 1000);
                // 即使失败也 resolve，因为 TTS 不影响基本功能
                resolve();
            });
    });
}

// ============================================
// 播放整行语音
// 功能：播放指定行的所有粤拼发音
// 点击同一按钮可停止播放（toggle 行为）
//
// 参数：
//   - lineIndex: 行索引（歌词数组中的索引，从 0 开始）
//   - btn: 播放按钮元素（用于高亮和 toggle 判断）
// ============================================
async function playLineTTS(lineIndex, btn) {
    // 前置检查：manifest 是否已加载，当前歌曲是否存在
    if (!ttsManifest || !window.currentSong) {
        showToast('语音数据未加载');
        return;
    }

    // 根据行索引获取该行歌词数据
    const line = window.currentSong.lyrics[lineIndex];
    if (!line || !line.jp) {
        showToast('该行没有粤拼数据');
        return;
    }

    // Toggle 逻辑：如果点击的是当前正在播放的按钮，则停止播放
    if (currentPlayingBtn === btn) {
        stopCurrentTTS();
        return;
    }

    // 停止之前的播放（避免多个音频同时播放）
    stopCurrentTTS();

    // 过滤掉空的粤拼（undefined、null、空字符串）
    const arr = line.jp.filter(Boolean);
    if (!arr.length) {
        showToast('该行没有粤拼数据');
        return;
    }

    // 记录当前播放按钮，用于 toggle 判断和高亮
    currentPlayingBtn = btn;
    btn.classList.add('playing');  // 添加播放中的 CSS 样式类

    // 按顺序逐个播放粤拼
    await _playSequence(arr, btn);
}

// ============================================
// 播放分段语音
// 功能：播放指定粤拼数组的发音
// 用于播放一行中的部分内容（如用户选中的片段）
//
// 参数：
//   - arr: 粤拼数组（如 [\"jyut\", \"ping\"]）
//   - btn: 播放按钮元素（用于高亮和 toggle 判断）
// ============================================
async function playSegmentTTS(arr, btn) {
    // 前置检查：manifest 是否已加载，数组是否有效
    if (!ttsManifest || !arr || !arr.length) return;

    // Toggle 逻辑：点击同一按钮则停止播放
    if (currentPlayingBtn === btn) {
        stopCurrentTTS();
        return;
    }

    // 停止之前的播放
    stopCurrentTTS();

    // 记录当前播放按钮
    currentPlayingBtn = btn;
    btn.classList.add('playing');  // 添加播放中样式

    // 按顺序播放粤拼数组
    await _playSequence(arr, btn);
}

// ============================================
// 按顺序播放粤拼数组
// 功能：循环播放数组中的每个粤拼，一个接一个
// 支持中途停止（通过检查 currentPlayingBtn 是否仍匹配）
//
// 参数：
//   - arr: 粤拼数组（如 [\"ngo5\", \"hai6\", \"hong1\", \"kong3\"]）
//   - btn: 播放按钮元素（用于判断是否被用户中途停止）
// ============================================
async function _playSequence(arr, btn) {
    // 遍历每个粤拼，按顺序播放
    for (const jp of arr) {
        // 每次播放前检查是否被用户停止
        if (!currentPlayingBtn || currentPlayingBtn !== btn) break;

        // 从 manifest 中查找粤拼对应的音频文件路径
        const p = ttsManifest[jp];
        if (!p) continue;  // 没有对应音频文件，跳过该粤拼

        try {
            // v2.0: _playAudio 现在接受相对路径，内部自动处理多源切换
            await _playAudio(p);
        } catch (e) {
            // 单个粤拼播放失败不影响后续播放
            console.warn('[TTS] Play failed:', jp, e.message);
        }
    }

    // 播放完成后的清理工作
    if (currentPlayingBtn === btn) {
        btn.classList.remove('playing');  // 移除播放中样式
        currentAudio = null;              // 清除音频引用
        currentPlayingBtn = null;         // 清除按钮引用
    }
}

// ============================================
// 播放单字语音
// 功能：播放单个粤拼的发音，用于单字学习模式
// 播放时会高亮当前字符，播放完成后自动移除高亮
//
// 参数：
//   - jp: 粤拼（如 \"jyut\"）
//   - charEl: 字符 DOM 元素（用于高亮显示）
// ============================================
async function playCharTTS(jp, charEl) {
    // 前置检查：manifest 是否已加载，粤拼是否有效
    if (!ttsManifest || !jp) return;

    // 清除上一个正在播放的字符的高亮
    if (currentPlayingChar) {
        currentPlayingChar.classList.remove('tts-char-playing');
    }

    // 从 manifest 中查找粤拼对应的音频文件路径
    const p = ttsManifest[jp];
    if (!p) return;  // 没有对应音频，直接返回

    // 记录当前播放的字符元素
    currentPlayingChar = charEl;
    charEl.classList.add('tts-char-playing');  // 添加高亮样式

    try {
        // v2.0: 传递相对路径而非完整 URL
        await _playAudio(p);
    } catch (e) {
        // 播放失败，提示用户
        console.error('[TTS] Char play failed:', e);
        showToast('播放失败，请重试');
    }

    // 播放完成，移除字符高亮
    _clearChar(charEl);
}

// ============================================
// 清除字符高亮
// 功能：移除字符元素的高亮样式，并更新全局状态
//
// 参数：
//   - el: 字符 DOM 元素
// ============================================
function _clearChar(el) {
    el.classList.remove('tts-char-playing');
    if (currentPlayingChar === el) {
        currentPlayingChar = null;
    }
}

// ============================================
// 停止当前播放
// 功能：停止所有正在播放的音频，清除所有播放状态
// 包括：音频对象、按钮高亮、字符高亮
// ============================================
function stopCurrentTTS() {
    if (currentAudio) {
        try {
            currentAudio.pause();          // 暂停播放
            currentAudio.currentTime = 0;  // 重置播放进度到开头
        } catch(e) {
            // 忽略停止时的异常
        }
        currentAudio = null;
    }

    if (currentPlayingBtn) {
        currentPlayingBtn.classList.remove('playing');
        currentPlayingBtn = null;
    }

    if (currentPlayingChar) {
        currentPlayingChar.classList.remove('tts-char-playing');
        currentPlayingChar = null;
    }
}

// ============================================
// 切换 TTS 模式
// 功能：开启/关闭单字播放模式
// 单字模式下，点击歌词中的任意字符可播放其发音
// 关闭模式时会自动停止当前播放
// ============================================
function toggleTTSMode() {
    ttsMode = !ttsMode;

    const btn = document.getElementById('ttsModeBtn');
    const view = document.getElementById('lyricsView');

    if (ttsMode) {
        btn.classList.add('tts-active');
        view.classList.add('tts-mode');
        _markUserInteraction();
        _initWechat();
        showToast('已进入播放模式，点击单字播放语音');
    } else {
        btn.classList.remove('tts-active');
        view.classList.remove('tts-mode');
        stopCurrentTTS();
        showToast('已退出播放模式');
    }
}

// ============================================
// 初始化微信环境
// 功能：在页面加载时初始化微信特殊处理
// ============================================
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', _initWechat);
} else {
    _initWechat();
}

// ============================================
// 监听用户交互事件
// 功能：标记用户交互，以满足浏览器自动播放策略
// ============================================
document.addEventListener('touchstart', _markUserInteraction, { passive: true });
document.addEventListener('click', _markUserInteraction, { passive: true });

// ============================================
// 导出模块
// 将功能挂载到全局对象，供 HTML 页面中的事件处理函数调用
// ============================================
window.TTSModule = {
    init: loadTTSManifest,      // 初始化：加载 manifest 清单
    playLine: playLineTTS,      // 播放整行：播放指定行的所有粤拼
    playSegment: playSegmentTTS,// 播放分段：播放选中的粤拼片段
    playChar: playCharTTS,      // 播放单字：播放单个字符的粤拼发音
    toggleMode: toggleTTSMode,  // 切换模式：开启/关闭单字播放模式
    stop: stopCurrentTTS,       // 停止播放：停止所有音频并清除状态
    isModeActive: () => ttsMode // 查询状态：返回当前是否处于 TTS 模式
};
