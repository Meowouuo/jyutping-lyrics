// 粤拼词组语境规则
// 当某个字出现在特定词组中时，使用指定的粤拼而非字典默认值
// 格式：{ "词组": { "字": "指定粤拼" } }
// 例如："千里"中的"里"读 lei5，而非默认的 leoi5

const JYUTPING_CONTEXT_RULES = {
    "千里": { "里": "lei5" },
    "万里": { "里": "lei5" },
    "半里": { "里": "lei5" },
    "公里": { "里": "lei5" },
    "被窝": { "被": "pei5" },
    "被子": { "被": "pei5" },
    "被单": { "被": "pei5" },
};

/**
 * 根据词组语境修正粤拼
 * @param {Array} result - matchJyutping 的返回结果 [{char, jp, alternatives}, ...]
 * @returns {Array} 修正后的结果
 */
function applyContextRules(result) {
    const text = result.map(r => r.char).join('');

    for (const [phrase, overrides] of Object.entries(JYUTPING_CONTEXT_RULES)) {
        let searchFrom = 0;
        while (true) {
            const idx = text.indexOf(phrase, searchFrom);
            if (idx === -1) break;

            for (const [char, correctJp] of Object.entries(overrides)) {
                const charIdx = phrase.indexOf(char);
                if (charIdx === -1) continue;

                const globalIdx = idx + charIdx;
                if (globalIdx < result.length && result[globalIdx].char === char) {
                    // 修正粤拼
                    const oldJp = result[globalIdx].jp;
                    if (oldJp !== correctJp) {
                        // 将正确的粤拼放到第一位，原来的放到 alternatives
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

    return result;
}

// 导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { JYUTPING_CONTEXT_RULES, applyContextRules };
}
