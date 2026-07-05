// 粤拼词组语境规则
// 当某个字出现在特定词组中时，使用指定的粤拼而非字典默认值
// 支持两种规则类型：
//   1. 固定词组规则：{ "词组": { "字": "指定粤拼" } }
//      例如："千里"中的"里"读 lei5，而非默认的 leoi5
//   2. 正则模式规则：{ "_pattern_描述": { test: RegExp, overrides: { "字": "指定粤拼" } } }
//      例如：数字+"里"中的"里"读 lei5（十里、百里、一里、两里、3里等）

const JYUTPING_CONTEXT_RULES = {
    // 固定词组规则
    "千里": { "里": "lei5" },
    "万里": { "里": "lei5" },
    "半里": { "里": "lei5" },
    "公里": { "里": "lei5" },
    "被窝": { "被": "pei5" },
    "被子": { "被": "pei5" },
    "被单": { "被": "pei5" },
    "汹涌": { "汹": "hung1", "涌": "jung2" },

    // 正则模式规则
    // 数字/中文数字 + "里" 中的 "里" 读 lei5（如十里、百里、一里、两里、3里等）
    "_pattern_数字里": {
        test: /^([一二三四五六七八九十百千万零两\d]+)里$/,
        overrides: { "里": "lei5" }
    },
};

/**
 * 根据词组语境修正粤拼
 * 支持固定词组规则和正则模式规则两种类型
 * @param {Array} result - matchJyutping 的返回结果 [{char, jp, alternatives}, ...]
 * @returns {Array} 修正后的结果
 */
function applyContextRules(result) {
    const text = result.map(r => r.char).join('');

    for (const [key, value] of Object.entries(JYUTPING_CONTEXT_RULES)) {
        // 判断规则类型：_pattern_ 开头为正则模式规则，其余为固定词组规则
        if (key.startsWith('_pattern_')) {
            // 正则模式规则：用正则在文本中滑动匹配
            const { test, overrides } = value;
            // 在文本中逐位置滑动窗口，查找匹配正则的子串
            for (let start = 0; start < text.length; start++) {
                for (let end = text.length; end > start; end--) {
                    const substring = text.substring(start, end);
                    if (test.test(substring)) {
                        // 匹配成功，对 overrides 中的每个字进行粤拼修正
                        for (const [char, correctJp] of Object.entries(overrides)) {
                            const charIdx = substring.indexOf(char);
                            if (charIdx === -1) continue;

                            const globalIdx = start + charIdx;
                            if (globalIdx < result.length && result[globalIdx].char === char) {
                                // 修正粤拼，将正确读音放到第一位，原来的放到 alternatives
                                const oldJp = result[globalIdx].jp;
                                if (oldJp !== correctJp) {
                                    const newAlternatives = [oldJp];
                                    if (result[globalIdx].alternatives) {
                                        for (const alt of result[globalIdx].alternatives) {
                                            if (alt !== correctJp && !newAlternatives.includes(alt)) {
                                                newAlternatives.push(alt);
                                            }
                                        }
                                    }
                                    result[globalIdx].jp = correctJp;
                                    result[globalIdx].alternatives = newAlternatives;
                                }
                            }
                        }
                        break;  // 当前 start 位置只匹配一次
                    }
                }
            }
        } else {
            // 固定词组规则：用 indexOf 查找词组出现位置
            const overrides = value;
            let searchFrom = 0;
            while (true) {
                const idx = text.indexOf(key, searchFrom);
                if (idx === -1) break;

                for (const [char, correctJp] of Object.entries(overrides)) {
                    const charIdx = key.indexOf(char);
                    if (charIdx === -1) continue;

                    const globalIdx = idx + charIdx;
                    if (globalIdx < result.length && result[globalIdx].char === char) {
                        // 修正粤拼，将正确读音放到第一位，原来的放到 alternatives
                        const oldJp = result[globalIdx].jp;
                        if (oldJp !== correctJp) {
                            const newAlternatives = [oldJp];
                            if (result[globalIdx].alternatives) {
                                for (const alt of result[globalIdx].alternatives) {
                                    if (alt !== correctJp && !newAlternatives.includes(alt)) {
                                        newAlternatives.push(alt);
                                    }
                                }
                            }
                            result[globalIdx].jp = correctJp;
                            result[globalIdx].alternatives = newAlternatives;
                        }
                    }
                }

                searchFrom = idx + 1;
            }
        }
    }

    return result;
}

// 导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { JYUTPING_CONTEXT_RULES, applyContextRules };
}
