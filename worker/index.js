/**
 * ============================================================
 * Cloudflare Worker：粤拼歌词后端服务
 * ============================================================
 *
 * 功能说明：
 * - 接收前端投稿表单数据（原功能）
 * - 音频文件代理转发（新增，解决国内无法访问 GitHub 的问题）
 *
 * 音频代理路由：
 * - GET /audio/<path>  → 代理 GitHub Raw 上的音频文件
 *   示例: /audio/v1/4f/4fef6fb...mp3
 *         → https://raw.githubusercontent.com/Meowouuo/lyrics-audio/main/v1/4f/4fef6fb...mp3
 *
 * 部署说明：
 * - 使用 Cloudflare Workers 部署
 * - 需要在 Workers 环境变量中配置 GITHUB_TOKEN
 * - GITHUB_TOKEN 需要具有创建 Issue 的权限
 *
 * 作者：粤拼歌词项目组
 * 版本：2.0.0（新增音频代理功能）
 */

// ============================================================
// 配置常量
// ============================================================

/**
 * 音频文件的 GitHub 源地址
 * @description 音频文件存储在独立的 lyrics-audio 仓库的 main 分支
 */
const AUDIO_SOURCE_BASE = 'https://raw.githubusercontent.com/Meowouuo/lyrics-audio/main/';

// ============================================================
// 主入口函数：处理所有 HTTP 请求
// ============================================================

/**
 * Fetch 事件处理函数
 * @description 处理所有进入的 HTTP 请求，包括：
 *   - OPTIONS 预检请求（CORS）
 *   - GET /audio/* 音频代理请求
 *   - POST 投稿表单提交
 * @param {Request} request - HTTP 请求对象
 * @param {Object} env - 环境变量，包含 GITHUB_TOKEN 等配置
 * @param {Object} ctx - Cloudflare 上下文对象
 * @returns {Response} HTTP 响应
 */
export default {
  async fetch(request, env) {
    // 解析请求 URL 和路径
    const url = new URL(request.url);
    const path = url.pathname;

    // ------------------------------------------------
    // 路由分发：根据请求路径和方法分配到对应处理器
    // ------------------------------------------------

    // GET /audio/* → 音频代理处理器
    if (request.method === 'GET' && path.startsWith('/audio/')) {
      return handleAudioProxy(path);
    }

    // OPTIONS → CORS 预检处理器
    if (request.method === 'OPTIONS') {
      return handleOptions();
    }

    // POST → 投稿表单处理器（原功能）
    if (request.method === 'POST') {
      return handleSubmit(request, env);
    }

    // 其他请求返回 405
    return jsonResponse({ error: 'Method Not Allowed' }, 405);
  },
};

// ============================================================
// 音频代理处理器（新增功能）
// ============================================================

/**
 * 处理音频文件代理请求
 * @description 将前端的音频请求代理到 GitHub Raw，
 *             利用 Cloudflare 全球网络解决国内访问问题。
 *             支持 Range 请求（音频拖动播放）和缓存优化。
 *
 * 工作流程：
 * 1. 从 URL 路径中提取音频文件相对路径
 * 2. 拼接完整的 GitHub Raw URL
 * 3. 转发请求（保留原始 headers 如 Range）
 * 4. 返回响应（添加缓存头优化重复访问）
 *
 * @param {string} path - 请求路径（格式: /audio/v1/xx/xxxx.mp3）
 * @returns {Response} 音频文件响应或错误响应
 */
async function handleAudioProxy(path) {
  // ------------------------------------------------
  // 提取音频文件路径
  // ------------------------------------------------
  // 去掉 /audio/ 前缀，得到相对路径（如 v1/4f/4fef6fb...mp3）
  const audioPath = path.replace(/^\/audio\//, '');

  // 安全校验：防止路径遍历攻击
  // 只允许包含字母、数字、斜杠、点、连字符、下划线的路径
  if (!/^[\w\-./]+$/.test(audioPath) || audioPath.includes('..')) {
    return jsonResponse({ error: 'Invalid audio path' }, 400);
  }

  // ------------------------------------------------
  // 构建源文件 URL
  // ------------------------------------------------
  // 最终 URL 格式：
  // https://raw.githubusercontent.com/Meowouuo/lyrics-audio/main/v1/4f/4fef6fb...mp3
  const sourceUrl = AUDIO_SOURCE_BASE + audioPath;

  console.log('[Audio Proxy] Fetching:', sourceUrl);

  try {
    // ------------------------------------------------
    // 转发请求到 GitHub Raw
    // ------------------------------------------------
    // 构建转发请求头
    const forwardHeaders = new Headers();

    // 传递 Range 头（支持音频拖动/分段加载）
    // 浏览器在播放音频时会用 Range 请求来实现拖动进度条等功能
    const rangeHeader = request.headers.get('Range');
    if (rangeHeader) {
      forwardHeaders.set('Range', rangeHeader);
    }

    // 发起子请求获取音频文件
    // Cloudflare Worker 的 fetch 可以直接访问外部网络
    const response = await fetch(sourceUrl, {
      method: 'GET',
      headers: forwardHeaders,
      // 不跟随重定向以外的特殊处理
    });

    // ------------------------------------------------
    // 检查响应状态
    // ------------------------------------------------
    if (!response.ok) {
      console.error('[Audio Proxy] Source returned status:', response.status);
      return jsonResponse(
        { error: `Audio source error: ${response.status}` },
        response.status
      );
    }

    // ------------------------------------------------
    // 构建并返回响应
    // ------------------------------------------------
    // 读取响应体（音频二进制数据）
    const audioData = await response.arrayBuffer();

    // 构建响应头
    const responseHeaders = new Headers({
      // 设置正确的 MIME 类型为音频
      'Content-Type': 'audio/mpeg',
      // 设置内容长度
      'Content-Length': audioData.byteLength.toString(),
      // 允许跨域访问（前端页面域名与 Worker 域名不同）
      'Access-Control-Allow-Origin': '*',
      // 缓存策略：
      // public: 可被 CDN 和浏览器缓存
      // max-age=2592000: 缓存 30 天（音频文件不变更）
      // immutable: 缓存期间内不需要重新验证
      'Cache-Control': 'public, max-age=2592000, immutable',
      // 传递源站的 Accept-Ranges 头（支持 Range 请求的标识）
      'Accept-Ranges': 'bytes',
    });

    // 如果源站支持 Range，传递 Content-Range 头
    const contentRange = response.headers.get('Content-Range');
    if (contentRange) {
      responseHeaders.set('Content-Range', contentRange);
      // Range 请求成功返回 206 Partial Content
      return new Response(audioData, {
        status: 206,
        headers: responseHeaders,
      });
    }

    // 普通 GET 请求返回 200 OK
    return new Response(audioData, {
      status: 200,
      headers: responseHeaders,
    });

  } catch (error) {
    // ------------------------------------------------
    // 错误处理
    // ------------------------------------------------
    console.error('[Audio Proxy] Error:', error.message);
    return jsonResponse(
      { error: 'Failed to proxy audio file', detail: error.message },
      502  // Bad Gateway：上游服务不可达
    );
  }
}

// ============================================================
// CORS 预检处理器
// ============================================================

/**
 * 处理 OPTIONS 预检请求
 * @description 浏览器在发送跨域请求前会先发送 OPTIONS 请求
 *              需要返回正确的 CORS 头才能让浏览器继续发送实际请求
 *              同时也用于音频代理接口的预检
 * @returns {Response} CORS 预检响应
 */
function handleOptions() {
  return new Response(null, {
    headers: {
      // 允许所有来源访问（生产环境应限制具体域名）
      'Access-Control-Allow-Origin': '*',
      // 允许的 HTTP 方法（包含 GET 用于音频代理，POST 用于投稿）
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      // 允许的请求头（Range 用于音频拖动）
      'Access-Control-Allow-Headers': 'Content-Type, Range',
    },
  });
}

// ============================================================
// 投稿表单处理器（原功能保持不变）
// ============================================================

/**
 * 处理前端投稿表单提交
 * @description 接收前端 POST 请求，验证数据后调用 GitHub API 创建 Issue
 * @param {Request} request - HTTP 请求对象
 * @param {Object} env - 环境变量
 * @returns {Response} JSON 格式的处理结果
 */
async function handleSubmit(request, env) {
  try {
    // 解析 JSON 请求体
    const data = await request.json();

    // 从请求体中提取基本字段
    const {
      type,
      title,
      artist,
      lyricist,
      composer,
      lyrics,
      corrections,
      songName
    } = data;

    // 验证 type 字段是否存在（必须指定请求类型）
    if (!type) {
      return jsonResponse({ error: '缺少 type 字段' }, 400);
    }

    // 根据 type 类型处理不同的请求
    let issueTitle;    // GitHub Issue 标题
    let issueBody;      // GitHub Issue 正文
    let labels;         // GitHub Issue 标签

    switch (type) {
      // =============================================
      // 新歌投稿处理
      // =============================================
      case 'new-song':
        // 验证必填字段
        if (!title || !artist || !lyrics) {
          return jsonResponse({
            error: '投稿需要歌曲名称、歌手和歌词'
          }, 400);
        }
        // 构建 Issue 标题，格式：[新歌投稿] 歌曲名 - 歌手
        issueTitle = `[新歌投稿] ${title} - ${artist}`;
        labels = ['投稿-新歌'];
        issueBody = buildNewSongBody({ title, artist, lyricist, composer, lyrics, lyricsLayerStats: data.lyricsLayerStats });
        break;

      // =============================================
      // 粤拼纠错处理
      // =============================================
      case 'jyutping-correction':
        // 验证必填字段
        if (!songName || !corrections || corrections.length === 0) {
          return jsonResponse({
            error: '纠错需要歌曲名称和纠错内容'
          }, 400);
        }
        issueTitle = `[粤拼纠错] ${songName}（${corrections.length}处）`;
        labels = ['投稿-粤拼'];
        issueBody = buildJyutpingCorrectionBody({ songName, corrections });
        break;

      // =============================================
      // 歌词纠错处理（支持多种纠错类型）
      // =============================================
      case 'lyrics-correction':
        // 验证歌曲名称
        if (!songName) {
          return jsonResponse({
            error: '歌词纠错需要歌曲名称'
          }, 400);
        }
        const correctionType = data.correctionType || 'line';
        const fullLyrics = data.fullLyrics;
        const insertData = data.insert;

        if (correctionType === 'full') {
          if (!fullLyrics) {
            return jsonResponse({ error: '整首替换需要填写完整歌词' }, 400);
          }
          issueTitle = `[歌词纠错-整首替换] ${songName}`;
          labels = ['歌词纠错'];
          issueBody = buildFullReplacementBody({ songName, fullLyrics });
        } else if (correctionType === 'insert') {
          const insertions = data.insertions || (data.insert ? [data.insert] : []);
          if (!insertions || insertions.length === 0) {
            return jsonResponse({ error: '插入行需要填写插入位置和歌词' }, 400);
          }
          issueTitle = `[歌词纠错-插入行] ${songName}（${insertions.length}处）`;
          labels = ['歌词纠错'];
          issueBody = buildInsertBody({ songName, insertions });
        } else {
          const meta = data.meta;
          if ((!corrections || corrections.length === 0) && (!meta || Object.keys(meta).length === 0)) {
            return jsonResponse({ error: '歌词纠错需要纠错内容' }, 400);
          }
          const metaParts = [];
          if (meta) {
            if (meta.title) metaParts.push('歌名: ' + meta.title.original + ' → ' + meta.title.new);
            if (meta.artist) metaParts.push('歌手: ' + meta.artist.original + ' → ' + meta.artist.new);
            if (meta.lyricist) metaParts.push('填词: ' + meta.lyricist.original + ' → ' + meta.lyricist.new);
            if (meta.composer) metaParts.push('作曲: ' + meta.composer.original + ' → ' + meta.composer.new);
          }
          const count = (corrections ? corrections.length : 0) + metaParts.length;
          issueTitle = `[歌词纠错] ${songName}（${count}处）`;
          labels = ['歌词纠错'];
          if (corrections && corrections.length > 0) {
            issueBody = buildLyricsCorrectionBody({ songName, corrections, meta });
          } else {
            issueBody = `## 歌曲名称\n${songName}\n\n## 纠错内容\n\n${metaParts.map(p => '- ' + p).join('\n')}`;
          }
        }
        break;

      // =============================================
      // 删除歌曲请求处理
      // =============================================
      case 'delete-song':
        const songs = data.songs;
        if (!songs || songs.length === 0) {
          return jsonResponse({ error: '删除歌曲需要选择要删除的歌曲' }, 400);
        }
        issueTitle = `[删除歌曲] ${songs.length}首歌曲`;
        labels = ['投稿-删除'];
        issueBody = buildDeleteSongBody({ songs });
        break;

      default:
        return jsonResponse({ error: `未知的 type: ${type}` }, 400);
    }

    // 检查 GitHub Token 是否配置
    const githubToken = env.GITHUB_TOKEN;
    if (!githubToken) {
      return jsonResponse({ error: '服务端未配置 GITHUB_TOKEN' }, 500);
    }

    // 调用 GitHub API 创建 Issue
    const githubResponse = await fetch('https://api.github.com/repos/Meowouuo/lyrics/issues', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${githubToken}`,
        'Content-Type': 'application/json',
        'User-Agent': 'Lyrics-Submit-Worker',
      },
      body: JSON.stringify({
        title: issueTitle,
        body: issueBody,
        labels: labels,
      }),
    });

    if (!githubResponse.ok) {
      const error = await githubResponse.text();
      console.error('GitHub API 错误:', error);
      return jsonResponse({ error: '创建 Issue 失败', detail: error }, 500);
    }

    const issue = await githubResponse.json();
    return jsonResponse({
      success: true,
      message: '提交成功！已创建 GitHub Issue',
      issueUrl: issue.html_url,
      issueNumber: issue.number,
    });

  } catch (error) {
    console.error('Worker 运行时错误:', error);
    return jsonResponse({ error: '服务器内部错误' }, 500);
  }
}

// ============================================================
// 辅助函数
// ============================================================

/**
 * 创建 JSON 格式的 HTTP 响应
 * @description 封装统一的响应格式，自动添加 CORS 头和 Content-Type
 * @param {Object} data - 要返回的 JSON 数据
 * @param {number} status - HTTP 状态码，默认为 200
 * @returns {Response} Response 对象
 */
function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
  });
}

// ============================================================
// Issue 正文生成函数（保持原逻辑不变）
// ============================================================

/**
 * 生成新歌投稿的 Issue 正文
 */
function buildNewSongBody({ title, artist, lyricist, composer, lyrics, lyricsLayerStats }) {
  // 层级统计
  const layerStatsHtml = lyricsLayerStats 
    ? `| 层级 | 匹配字数 |
|------|----------|
| 语境规则（第1层） | ${lyricsLayerStats.layer1 || 0} 字 |
| cantowords 词语（第2层） | ${lyricsLayerStats.layer2} 字 |
| cantowords 单字（第3层） | ${lyricsLayerStats.layer3} 字 |
| JYUTPING_DICT 后备（第4层） | ${lyricsLayerStats.layer4} 字 |`
    : '层级统计加载中...';

  return `## 投稿信息

**歌曲名称：** ${title}
**歌手：** ${artist}
**填词：** ${lyricist || ''}
**作曲：** ${composer || ''}

## 粤拼匹配层级统计

${layerStatsHtml}

## 完整歌词

\`\`\`
${lyrics}
\`\`\`

---
*由网站投稿表单自动提交*`;
}

/**
 * 生成粤拼纠错的 Issue 正文
 */
function buildJyutpingCorrectionBody({ songName, corrections }) {
  const tableRows = corrections.map(c =>
    `| 第${c.line}行 | ${c.char} | ${c.originalJp} | ${c.newJp} |`
  ).join('\n');

  return `## 纠错内容

**歌曲名称：** ${songName}

### 纠错详情

| 行号 | 字 | 原粤拼 | 正确粤拼 |
|------|-----|--------|----------|
${tableRows}

---
*由网站投稿表单自动提交*`;
}

/**
 * 生成删除歌曲请求的 Issue 正文
 */
function buildDeleteSongBody({ songs }) {
  const songList = songs.map((s, i) =>
    `${i + 1}. **${s.title}** - ${s.artist}（ID: ${s.id}）`
  ).join('\n');

  return `## 删除歌曲请求

**删除数量：** ${songs.length} 首

${songList}

---
*由网站投稿表单自动提交*`;
}

/**
 * 生成歌词纠错（逐行修改）的 Issue 正文
 */
function buildLyricsCorrectionBody({ songName, corrections }) {
  const tableRows = corrections.map(c =>
    `| 第${c.line}行 | ${c.originalText} | ${c.newText} |`
  ).join('\n');

  return `## 纠错内容

**歌曲名称：** ${songName}

### 纠错详情

| 行号 | 原歌词 | 正确歌词 |
|------|--------|----------|
${tableRows}

---
*由网站投稿表单自动提交*`;
}

/**
 * 生成整首歌词替换的 Issue 正文
 */
function buildFullReplacementBody({ songName, fullLyrics }) {
  return `## 整首歌词替换

**歌曲名称：** ${songName}

## 完整歌词

\`\`\`
${fullLyrics}
\`\`\`

---
*由网站投稿表单自动提交*`;
}

/**
 * 生成插入歌词的 Issue 正文
 */
function buildInsertBody({ songName, insertions }) {
  const insertList = insertions.map((ins, i) => {
    const posText = ins.position === 'before' ? '前' : '后';
    return `### 插入 ${i + 1}
- **位置：** 第${ins.line}行${posText}
- **歌词：**
\`\`\`
${ins.lyrics}
\`\`\``;
  }).join('\n\n');

  return `## 插入歌词

**歌曲名称：** ${songName}
**插入数量：** ${insertions.length} 处

${insertList}

---
*由网站投稿表单自动提交*`;
}
