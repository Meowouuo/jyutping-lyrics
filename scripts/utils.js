// ============================================
// 工具函数模块
// 功能：提供 Issue 解析、Git 操作、PR 创建等工具函数
// 由 GitHub Actions 调用，用于自动处理歌词投稿、纠错等请求
// ============================================

const fs = require('fs');          // 文件系统模块
const path = require('path');      // 路径处理模块
const { execSync } = require('child_process');  // 子进程模块，用于执行 git 命令
// const { matchJyutping } = require("../jyutping-dict");  // 粤拼匹配函数
const { matchJyutping: originalMatchJyutping, JYUTPING_DICT } = require("../jyutping-dict");  // 原始粤拼匹配函数和字典
const { applyContextRules } = require("../jyutping-context");  // 引入语境规则修正函数


// ============================================
// 获取 Issue 信息
// 功能：从临时文件读取 Issue 的标题、正文、编号、标签等信息
// 使用文件读取而非环境变量，避免多行内容丢失
//
// 返回值：Issue 信息对象
//   - title: Issue 标题
//   - body: Issue 正文内容
//   - number: Issue 编号
//   - labels: 标签数组
// ============================================
function getIssueInfo() {
    return {
        // 读取 Issue 标题
        title: fs.readFileSync('/tmp/issue_title.txt', 'utf8').trim(),
        // 读取 Issue 正文
        body: fs.readFileSync('/tmp/issue_body.txt', 'utf8').trim(),
        // 读取 Issue 编号
        number: fs.readFileSync('/tmp/issue_number.txt', 'utf8').trim(),
        // 读取标签列表（逗号分隔）
        labels: fs.readFileSync('/tmp/issue_labels.txt', 'utf8').trim().split(',').map(l => l.trim()).filter(l => l),
    };
}

// ============================================
// 解析 Markdown 表格
// 功能：从 Issue 正文中提取 Markdown 表格数据
//
// 参数：
//   - body: Issue 正文内容
//   - header1, header2: 备用参数（已废弃）
//
// 返回值：二维数组，每行是一个数组，包含各单元格内容
// ============================================
function parseTable(body, header1, header2) {
    // 按行分割正文
    const lines = body.split('\n');
    let inTable = false;  // 是否在表格内
    const rows = [];      // 存储表格行

    // 遍历每一行
    for (const line of lines) {
        const trimmed = line.trim();

        // 检测表格行（以 | 开头和结尾）
        if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
            // 分割单元格
            const cells = trimmed.split('|').slice(1, -1).map(c => c.trim());

            // 跳过表格分隔行（如 |---|---|）
            if (cells.every(c => /^[-:]+$/.test(c))) continue;

            // 检查是否是表头（第一次进入表格时）
            if (!inTable) {
                inTable = true;
                continue;  // 跳过表头
            }

            // 添加数据行
            rows.push(cells);
        } else {
            // 非表格行
            if (inTable) break;  // 表格结束
        }
    }
    return rows;
}

// ============================================
// 解析代码块内容
// 功能：从 Issue 正文中提取代码块内容
//
// 参数：
//   - body: Issue 正文内容
//
// 返回值：代码块内容（去除首尾空白），无代码块则返回空字符串
// ============================================
function parseCodeBlock(body) {
    // 匹配代码块：``` 开头和结尾
    const match = body.match(/```[\w]*\n([\s\S]*?)```/);
    return match ? match[1].trim() : '';
}

// ============================================
// 解析字段内容
// 功能：从 Issue 正文中提取指定字段的值
// 支持多种格式：**字段名**: 值 或 字段名: 值
//
// 参数：
//   - body: Issue 正文内容
//   - fieldName: 字段名称
//
// 返回值：字段值（去除首尾空白和 Markdown 格式）
// ============================================
function parseField(body, fieldName) {
    // 尝试多种匹配模式
    const patterns = [
        // 模式1：**字段名**: 值（支持中文冒号）
        new RegExp(`\\*\\*${fieldName}\\*\\*[:：]\\s*(.+)`),
        // 模式2：字段名: 值
        // 模式3：## 字段名（Markdown标题格式，值在下一行）
        new RegExp(`## ${fieldName}\\s*\\n\\s*(.+)`),
        new RegExp(`${fieldName}[:：]\\s*(.+)`),
    ];

    // 遍历尝试匹配
    for (const pattern of patterns) {
        const match = body.match(pattern);
        if (match) {
            let value = match[1].trim();
            // 如果值包含 "**字段名：**"，需要进一步提取
            // 例如：**歌曲名称：** 海阔天空 → 海阔天空
            const nestedMatch = value.match(/\*\*[^*]+[:：]\*\*\s*(.+)/);
            if (nestedMatch) {
                value = nestedMatch[1].trim();
            }
            // 去除首尾的 Markdown 粗体格式
            value = value.replace(/^\*\*|\*\*$/g, '');
            return value;
        }
    }
    return '';
}

// ============================================
// 获取所有歌曲列表
// 功能：读取 songFiles.js，解析所有歌曲文件，返回歌曲信息数组
//
// 返回值：歌曲数组，每个元素包含
//   - id: 歌曲 ID
//   - title: 歌曲名称
//   - artist: 歌手
//   - fileName: 文件名（不含扩展名）
// ============================================
function getAllSongs() {
    // 读取 songFiles.js 内容
    const songFilesContent = fs.readFileSync(path.join(__dirname, '..', 'songFiles.js'), 'utf8');
    const songs = [];

    // 解析新格式 songFiles（对象数组，包含 id, title, artist, lyricist, composer, file）
    const entryPattern = /id:\s*(\d+),\s*title:\s*"([^"]*)",\s*artist:\s*"([^"]*)",\s*lyricist:\s*"([^"]*)",\s*composer:\s*"([^"]*)",\s*file:\s*"([^"]*)"/g;
    let match;

    while ((match = entryPattern.exec(songFilesContent)) !== null) {
        const file = match[6];  // 文件路径，如 'lyrics/xxx.js'
        const filePath = path.join(__dirname, '..', file);

        // 检查文件是否存在
        if (fs.existsSync(filePath)) {
            const content = fs.readFileSync(filePath, 'utf8');
            const song = parseSongFile(content);
            if (song) {
                // 从文件路径提取文件名（不含路径和扩展名）
                song.fileName = path.basename(file, '.js');
                songs.push(song);
            }
        }
    }
    return songs;
}

// ============================================
// 解析歌曲文件
// 功能：从歌曲 JS 文件内容中提取歌曲信息
//
// 参数：
//   - content: 歌曲文件内容
//
// 返回值：歌曲信息对象，包含 id、title、artist
// ============================================
function parseSongFile(content) {
    // 匹配歌曲标题
    const titleMatch = content.match(/title:\s*"([^"]+)"/);
    // 匹配歌手名称
    const artistMatch = content.match(/artist:\s*"([^"]+)"/);
    // 匹配歌曲 ID
    const idMatch = content.match(/id:\s*(\d+)/);

    // 必须有标题和歌手
    if (!titleMatch || !artistMatch) return null;

    return {
        id: parseInt(idMatch?.[1] || '0'),
        title: titleMatch[1],
        artist: artistMatch[1],
    };
}

// ============================================
// 获取下一个可用的歌曲 ID
// 功能：查找所有歌曲中最大的 ID，然后加 1
//
// 返回值：下一个可用的歌曲 ID
// ============================================
function getNextSongId() {
    const songs = getAllSongs();
    let maxId = 0;
    songs.forEach(s => { if (s.id > maxId) maxId = s.id; });
    return maxId + 1;
}

// ============================================
// 查找歌曲文件
// 功能：根据歌曲名称和歌手查找匹配的歌曲
//
// 参数：
//   - title: 歌曲名称
//   - artist: 歌手名称（可选）
//
// 返回值：匹配的歌曲信息对象，未找到则返回 undefined
// ============================================
function findSongFile(title, artist) {
    const songs = getAllSongs();
    return songs.find(s =>
        s.title === title || (artist && s.artist === artist)
    );
}

// ============================================
// 创建 Git 分支
// 功能：配置 git 用户并创建新分支
//
// 参数：
//   - branchName: 分支名称
// ============================================
function createBranch(branchName) {
    // 配置 git 用户信息（GitHub Actions 需要）
    execSync(`git config user.name "github-actions[bot]"`, { stdio: 'pipe' });
    execSync(`git config user.email "github-actions[bot]@users.noreply.github.com"`, { stdio: 'pipe' });
    // 创建并切换到新分支
    execSync(`git checkout -b ${branchName}`, { stdio: 'pipe' });
}

// ============================================
// 提交并推送
// 功能：添加所有更改、提交、推送到远程仓库
//
// 参数：
//   - branchName: 分支名称
//   - message: 提交信息
// ============================================
function commitAndPush(branchName, message) {
    // 添加所有更改
    execSync('git add -A', { stdio: 'pipe' });
    // 提交更改
    execSync(`git commit -m "${message}"`, { stdio: 'pipe' });
    // 检查远程分支是否已存在，存在则先删除
    try {
        execSync(`git ls-remote --heads origin ${branchName}`, { stdio: 'pipe' });
        // 如果存在，删除远程分支
        execSync(`git push origin --delete ${branchName}`, { stdio: 'pipe' });
        console.log(`已删除存在的远程分支: ${branchName}`);
    } catch (e) {
        // 分支不存在，忽略错误
    }
    // 推送到远程仓库
    execSync(`git push origin ${branchName}`, { stdio: 'pipe' });
}

// ============================================
// 创建 Pull Request
// 功能：使用 gh 命令创建 Pull Request
//
// 参数：
//   - title: PR 标题
//   - body: PR 正文内容
//   - branchName: 分支名称
//   - issueNumber: 关联的 Issue 编号
// ============================================
function createPR(title, body, branchName, issueNumber) {
    // 自动添加 Fixes #XX 以在合并时自动关闭 Issue
    if (issueNumber) {
        body += `\n\nFixes #${issueNumber}`;
    }

    // 写入临时文件（避免命令行参数转义问题）
    const tmpFile = '/tmp/pr_body.md';
    fs.writeFileSync(tmpFile, body, 'utf8');

    // 创建 Pull Request
    // 注意：PR 目标分支改为 dev，遵循"在 dev 分支修改，合并到 main 部署"的规则
    execSync(
        `gh pr create --title "${title}" --body-file "${tmpFile}" --base dev --head ${branchName}`,
        { stdio: 'pipe' }
    );
}

// ============================================
// 在 Issue 中添加评论
// 功能：使用 gh 命令在 Issue 下添加评论
//
// 参数：
//   - issueNumber: Issue 编号
//   - body: 评论内容
// ============================================
function addComment(issueNumber, body) {
    // 写入临时文件
    const tmpFile = '/tmp/comment_body.md';
    fs.writeFileSync(tmpFile, body, 'utf8');

    // 添加评论
    execSync(
        `gh issue comment ${issueNumber} --body-file "${tmpFile}"`,
        { stdio: 'pipe' }
    );
}

// ============================================
// 关闭 Issue
// 功能：使用 gh 命令关闭 Issue
//
// 参数：
//   - issueNumber: Issue 编号
// ============================================
function closeIssue(issueNumber) {
    execSync(`gh issue close ${issueNumber}`, { stdio: 'pipe' });
}

// ============================================
// 给 Issue 添加标签
// 功能：使用 gh 命令给 Issue 添加标签
//
// 参数：
//   - issueNumber: Issue 编号
//   - label: 标签名称
// ============================================
function addLabel(issueNumber, label) {
    execSync(`gh issue edit ${issueNumber} --add-label "${label}"`, { stdio: 'pipe' });
}

// ============================================
// 加载 cantowords 词典
// 功能：按需加载词典文件，建立词语到粤拼的映射
// ============================================

// 词典缓存
let cantowordsCache = null;
let headwordIndexCache = null;
let cantowordsLoaded = false;

// 加载 manifest.json 获取索引
function loadHeadwordIndex() {
    if (headwordIndexCache) return headwordIndexCache;
    
    const manifestPath = path.join(__dirname, '..', 'dictionaries', 'cantowords', 'manifest.json');
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    headwordIndexCache = manifest.headwordIndex;
    return headwordIndexCache;
}

// 加载指定 chunk 的词典数据
function loadChunk(chunkName) {
    if (!cantowordsCache) {
        cantowordsCache = {};
    }
    
    if (cantowordsCache[chunkName]) return cantowordsCache[chunkName];
    
    const chunkPath = path.join(__dirname, '..', 'dictionaries', 'cantowords', `${chunkName}.json`);
    if (!fs.existsSync(chunkPath)) {
        cantowordsCache[chunkName] = [];
        return [];
    }
    
    const data = JSON.parse(fs.readFileSync(chunkPath, 'utf8'));
    cantowordsCache[chunkName] = data;
    return data;
}

// 获取词语的粤拼
function getWordJyutping(word) {
    if (!word || word.length === 0) return null;
    
    const index = loadHeadwordIndex();
    const firstChar = word[0];
    
    // 从索引中查找该字所在的 chunk
    const chunks = index[firstChar];
    if (!chunks || chunks.length === 0) return null;
    
    // 在所有可能的 chunk 中查找
    for (const chunkName of chunks) {
        const entries = loadChunk(chunkName);
        
        // 查找匹配的词条
        for (const entry of entries) {
            if (entry.headword && entry.headword.display === word) {
                // 找到匹配，返回第一个粤拼
                if (entry.phonetic && entry.phonetic.jyutping && entry.phonetic.jyutping.length > 0) {
                    return entry.phonetic.jyutping[0];
                }
            }
        }
    }
    
    return null;
}

// ============================================
// 改进的粤拼匹配函数
// 功能：优先匹配词语和短语，未匹配则回退到单字匹配
// 
// 参数：
//   - text: 要匹配的文本
//
// 返回值：匹配结果数组，每个元素包含 char 和 jp
// ============================================
function matchJyutping(text) {
    if (!text) return [];
    
    const result = [];
    let i = 0;
    const len = text.length;
    
    while (i < len) {
        const char = text[i];
        
        // 处理空格和换行
        if (char === ' ' || char === '\n' || char === '\r') {
            result.push({ char: char, jp: '' });
            i++;
            continue;
        }
        
        // 尝试匹配最长词语（从最长到最短）
        let matched = false;
        const maxWordLen = Math.min(10, len - i); // 最多尝试10个字符的词语
        
        for (let wordLen = maxWordLen; wordLen >= 2; wordLen--) {
            if (i + wordLen > len) continue;
            
            const word = text.substring(i, i + wordLen);
            const jyutping = getWordJyutping(word);
            
            if (jyutping) {
                // 找到词语匹配，将词语中的每个字符都标记为对应的粤拼
                const jpParts = jyutping.split(' ');
                
                for (let j = 0; j < wordLen; j++) {
                    const wordChar = word[j];
                    const wordJp = jpParts[j] || '';
                    
                    if (wordChar === ' ' || wordChar === '\n' || wordChar === '\r') {
                        result.push({ char: wordChar, jp: '' });
                    } else {
                        result.push({ char: wordChar, jp: wordJp });
                    }
                }
                
                i += wordLen;
                matched = true;
                break;
            }
        }
        
        // 如果没有匹配到词语，使用单字匹配
        if (!matched) {
            console.log("未匹配到粤拼, 使用字体库匹配");
            // 使用原始匹配函数处理单字
            const singleResult = originalMatchJyutping(char);
            if (singleResult && singleResult.length > 0) {
                result.push(singleResult[0]);
            } else {
                result.push({ char: char, jp: '' });
            }
            i++;
        }
    }
    
    // 数字+里 的通用规则（十里、百里、一里、两里等）
    for (let i = 0; i < result.length - 1; i++) {
        if (result[i + 1].char === '里' && /^[一二三四五六七八九十百千万零两\d]$/.test(result[i].char)) {
            result[i + 1].jp = 'lei5';
        }
    }
    
    if (typeof applyContextRules === 'function') {
        return applyContextRules(result);
    }
    
    return result;
}


// ============================================
// 导出模块
// 导出所有工具函数供其他脚本使用
// ============================================
module.exports = {
    matchJyutping,     // 粤拼匹配函数
    getWordJyutping,   // 词语粤拼匹配函数
    JYUTPING_DICT,     // 粤拼字典
    getIssueInfo,        // 获取 Issue 信息
    parseTable,          // 解析 Markdown 表格
    parseCodeBlock,     // 解析代码块
    parseField,          // 解析字段
    getAllSongs,         // 获取所有歌曲
    parseSongFile,       // 解析歌曲文件
    getNextSongId,       // 获取下一个歌曲 ID
    findSongFile,        // 查找歌曲文件
    createBranch,        // 创建 Git 分支
    commitAndPush,       // 提交并推送
    createPR,            // 创建 Pull Request
    addComment,          // 添加 Issue 评论
    closeIssue,          // 关闭 Issue
    addLabel,            // 添加 Issue 标签
};
