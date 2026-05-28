// ============================================
// 四层粤拼匹配器（同步版本）
// ============================================
// 优先级（从高到低）：
// 1. 语境规则（jyutping-context.js 中的词组规则）
// 2. 词语/短语匹配（dictionaries/cantowords/*.json）
// 3. 单字匹配（cantowords 中的单字 entry_type: "character"）
// 4. 单字后备匹配（jyutping-dict.js 的 JYUTPING_DICT）
// ============================================

// 全局变量存储加载的字典数据
let CANTOWORDS_DICT = null;
let CANTOWORDS_LOADED = false;
let CANTOWORDS_LOADING = false;

// 异步加载 cantowords 字典（后台预加载）
async function loadCantowordsDictAsync() {
    if (CANTOWORDS_LOADED || CANTOWORDS_LOADING) return;
    
    CANTOWORDS_LOADING = true;
    
    try {
        // 加载 manifest
        const manifestResponse = await fetch('dictionaries/cantowords/manifest.json');
        const manifest = await manifestResponse.json();
        
        // 加载所有分块文件
        const chunks = Object.keys(manifest.chunks);
        const allWords = [];
        
        for (const chunk of chunks) {
            const chunkFile = manifest.chunks[chunk].file;
            try {
                const response = await fetch(`dictionaries/cantowords/${chunkFile}`);
                const words = await response.json();
                allWords.push(...words);
            } catch (e) {
                console.warn(`[Cantowords] 加载 ${chunkFile} 失败:`, e);
            }
        }
        
        // 构建查找索引
        CANTOWORDS_DICT = {
            words: {},      // 多字词语: headword -> jyutping
            characters: {}  // 单字: headword -> jyutping
        };
        
        for (const entry of allWords) {
            const headword = entry.headword?.display;
            const jyutping = entry.phonetic?.jyutping?.[0];
            
            if (!headword || !jyutping) continue;
            
            if (entry.entry_type === 'word') {
                CANTOWORDS_DICT.words[headword] = jyutping;
            } else if (entry.entry_type === 'character') {
                CANTOWORDS_DICT.characters[headword] = jyutping;
            }
        }
        
        CANTOWORDS_LOADED = true;
        console.log(`[Cantowords] 加载完成: ${Object.keys(CANTOWORDS_DICT.words).length} 个词语, ${Object.keys(CANTOWORDS_DICT.characters).length} 个单字`);
    } catch (e) {
        console.error('[Cantowords] 加载失败:', e);
        CANTOWORDS_DICT = { words: {}, characters: {} };
        CANTOWORDS_LOADED = true;
    }
    
    CANTOWORDS_LOADING = false;
}

// 四层匹配主函数（同步调用，字典未加载时回退到原有匹配）
function matchJyutpingFourLayer(text) {
    // 如果 cantowords 已加载，使用四层匹配
    if (CANTOWORDS_LOADED && CANTOWORDS_DICT) {
        return matchWithFourLayers(text);
    }
    
    // 字典未加载，回退到原有匹配
    return matchWithOriginal(text);
}

// 四层匹配实现
function matchWithFourLayers(text) {
    const result = [];
    let i = 0;
    
    while (i < text.length) {
        const char = text[i];
        
        // 跳过空白字符
        if (char === ' ' || char === '\n' || char === '\r') {
            result.push({ char: char, jp: '' });
            i++;
            continue;
        }
        
        // 字母：不显示粤拼
        if (/^[a-zA-Z]$/.test(char)) {
            result.push({ char: char, jp: '' });
            i++;
            continue;
        }
        
        // 阿拉伯数字转汉字
        if (DIGIT_TO_CN[char]) {
            const cnChar = DIGIT_TO_CN[char];
            const jp = CANTOWORDS_DICT.characters[cnChar] || 
                       (JYUTPING_DICT[cnChar] ? JYUTPING_DICT[cnChar][0] : '');
            result.push({ char: char, jp: jp, alternatives: [] });
            i++;
            continue;
        }
        
        // 第2层：尝试匹配最长的多字词语
        let matched = false;
        const maxWordLen = 8;
        
        for (let len = Math.min(maxWordLen, text.length - i); len >= 2; len--) {
            const substring = text.substring(i, i + len);
            if (CANTOWORDS_DICT.words[substring]) {
                const jyutpingStr = CANTOWORDS_DICT.words[substring];
                const jyutpingArr = jyutpingStr.split(' ');
                
                for (let j = 0; j < substring.length; j++) {
                    result.push({
                        char: substring[j],
                        jp: jyutpingArr[j] || '',
                        alternatives: []
                    });
                }
                
                i += len;
                matched = true;
                break;
            }
        }
        
        if (matched) continue;
        
        // 第3层：cantowords 单字匹配
        if (CANTOWORDS_DICT.characters[char]) {
            result.push({
                char: char,
                jp: CANTOWORDS_DICT.characters[char],
                alternatives: []
            });
            i++;
            continue;
        }
        
        // 第4层：JYUTPING_DICT 后备匹配
        if (JYUTPING_DICT[char]) {
            result.push({
                char: char,
                jp: JYUTPING_DICT[char][0],
                alternatives: JYUTPING_DICT[char].slice(1)
            });
            i++;
            continue;
        }
        
        // 未匹配到任何读音
        result.push({ char: char, jp: '', alternatives: [] });
        i++;
    }
    
    // 第1层：应用语境规则
    if (typeof applyContextRules === 'function') {
        return applyContextRules(result);
    }
    
    return result;
}

// 原有匹配（回退方案）
function matchWithOriginal(text) {
    const result = [];
    for (const char of text) {
        if (char === ' ' || char === '\n' || char === '\r') {
            result.push({ char: char, jp: '' });
        } else if (JYUTPING_DICT[char]) {
            result.push({ char: char, jp: JYUTPING_DICT[char][0], alternatives: JYUTPING_DICT[char].slice(1) });
        } else if (DIGIT_TO_CN[char]) {
            const cnChar = DIGIT_TO_CN[char];
            const cnJp = JYUTPING_DICT[cnChar];
            result.push({ char: char, jp: cnJp ? cnJp[0] : '', alternatives: cnJp ? cnJp.slice(1) : [] });
        } else if (/^[a-zA-Z]$/.test(char)) {
            result.push({ char: char, jp: '' });
        } else {
            result.push({ char: char, jp: '' });
        }
    }
    
    if (typeof applyContextRules === 'function') {
        return applyContextRules(result);
    }
    
    return result;
}

// 导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { loadCantowordsDictAsync, matchJyutpingFourLayer };
}

// ============================================
// 计算粤拼匹配的层级统计
// 返回：{ layer2: 词语数, layer3: cantowords单字数, layer4: JYUTPING_DICT后备数 }
// ============================================
function getMatchLayerStats(text) {
    const stats = { layer2: 0, layer3: 0, layer4: 0, total: 0 };
    
    // 确保字典已加载
    if (!CANTOWORDS_LOADED || !CANTOWORDS_DICT) {
        return stats;
    }
    
    let i = 0;
    while (i < text.length) {
        const char = text[i];
        
        if (char === ' ' || char === '\n' || char === '\r') {
            i++;
            continue;
        }
        
        if (/^[a-zA-Z]$/.test(char)) {
            i++;
            continue;
        }
        
        let matched = false;
        
        // 第2层：cantowords 词语
        for (let len = Math.min(8, text.length - i); len >= 2; len--) {
            const substring = text.substring(i, i + len);
            if (CANTOWORDS_DICT.words[substring]) {
                stats.layer2 += len;
                stats.total += len;
                i += len;
                matched = true;
                break;
            }
        }
        
        if (matched) continue;
        
        // 第3层：cantowords 单字
        if (CANTOWORDS_DICT.characters[char]) {
            stats.layer3++;
            stats.total++;
            i++;
            continue;
        }
        
        // 第4层：JYUTPING_DICT 后备
        if (JYUTPING_DICT[char]) {
            stats.layer4++;
            stats.total++;
            i++;
            continue;
        }
        
        i++;
    }
    
    return stats;
}

// 导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { loadCantowordsDictAsync, matchJyutpingFourLayer, getMatchLayerStats };
}
