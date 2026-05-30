// 歌曲：防不胜防

(function() {
    const song = {
        id: 613,
        title: "防不胜防",
        titleJyutping: ["fong4","bat1","sing3","fong4"],
        artist: "陈奕迅",
        artistJyutping: ["can4","jik6","seon3"],
        lyricist: "黄伟文",
        lyricistJyutping: ["wong4","wai5","man4"],
        composer: "张继聪",
        composerJyutping: ["zoeng1","gai3","cung1"],
        lyrics: [
        { chars: ["为", "何", "喝", "过", "那", "咖", "啡", "杯", "无", "故", "失", "踪", "了"], jp: ["wai4", "ho4", "hot3", "gwo3", "naa5", "gaa3", "fe1", "bui1", "mou4", "gu3", "sat1", "zung1", "liu5"] },
        { chars: ["家", "里", "却", "仿", "佛", "增", "添", "了", "数", "本", "新", "书"], jp: ["gaa1", "leoi5", "koek3", "fong2", "fat6", "zang1", "tim1", "liu5", "sou3", "bun2", "san1", "syu1"] },
        { chars: ["为", "何", "你", "那", "床", "头", "玩", "具", "熊", " ", "再", "找", "不", "到"], jp: ["wai4", "ho4", "nei5", "naa5", "cong4", "tau4", "wun6", "geoi6", "hung4", "", "zoi3", "zaau2", "bat1", "dou3"] },
        { chars: ["花", "樽", "的", "花", " ", "偏", "偏", "天", "天", "转", "色"], jp: ["faa1", "zeon1", "dik1", "faa1", "", "pin1", "pin1", "tin1", "tin1", "zyun2", "sik1"] },
        { paragraphBreak: true },
        { chars: ["也", "许", "这", "刻", "你", " ", "仍", "然", "尚", "未", "发", "觉"], jp: ["jaa5", "heoi2", "ze5", "hak1", "nei5", "", "jing4", "jin4", "soeng6", "mei6", "faat3", "gok3"] },
        { chars: ["家", "中", "有", "这", "一", "个", "访", "客", " ", "时", "时", "漏", "夜", "冒", "昧", "探", "你"], jp: ["gaa1", "zung1", "jau5", "ze5", "jat1", "go3", "fong2", "haak3", "", "si4", "si4", "lau6", "je6", "mou6", "mui6", "taam3", "nei5"] },
        { chars: ["将", "琐", "碎", "东", "西", "带", "走", " ", "然", "后", "又", "放", "低"], jp: ["zoeng1", "so2", "seoi3", "dung1", "sai1", "daai3", "zau2", "", "jin4", "hau6", "jau6", "fong3", "dai1"] },
        { paragraphBreak: true },
        { chars: ["在", "你", "的", "唱", "机", "放", "低", "唱", "片", "是", "我"], jp: ["zoi6", "nei5", "dik1", "coeng3", "gei1", "fong3", "dai1", "coeng3", "pin2", "si6", "ngo5"] },
        { chars: ["算", "是", "暗", "中", " ", "一", "起", "分", "享", "过", "首", "歌"], jp: ["syun3", "si6", "am3", "zung1", "", "jat1", "hei2", "fan1", "hoeng2", "gwo3", "sau2", "go1"] },
        { chars: ["从", "你", "的", "套", "房", "带", "走", "被", "单", "是", "我"], jp: ["cung4", "nei5", "dik1", "tou3", "fong2", "daai3", "zau2", "bei6", "daan1", "si6", "ngo5"] },
        { chars: ["你", "睡", "过", "的", " ", "至", "少", "我", "都", "睡", "过"], jp: ["nei5", "seoi6", "gwo3", "dik1", "", "zi3", "siu2", "ngo5", "dou1", "seoi6", "gwo3"] },
        { paragraphBreak: true },
        { chars: ["为", "何", "那", "个", "故", "障", "手", "机", " ", "无", "故", "修", "好", "了"], jp: ["wai4", "ho4", "naa5", "go3", "gu3", "zoeng3", "sau2", "gei1", "", "mou4", "gu3", "sau1", "hou2", "liu5"] },
        { chars: ["梳", "妆", "台", "怎", "么", " ", "这", "么", "快", "没", "有", "香", "水"], jp: ["so1", "zong1", "toi4", "zam2", "mo1", "", "ze5", "mo1", "faai3", "mut6", "jau5", "hoeng1", "seoi2"] },
        { chars: ["为", "何", "有", "雨", "门", "前", "就", "突", "然", "有", "一", "把", "伞"], jp: ["wai4", "ho4", "jau5", "jyu5", "mun4", "cin4", "zau6", "dat6", "jin4", "jau5", "jat1", "baa2", "saan3"] },
        { chars: ["相", "册", "的", "相", " ", "偏", "偏", "天", "天", "变", "少"], jp: ["soeng1", "caak3", "dik1", "soeng1", "", "pin1", "pin1", "tin1", "tin1", "bin3", "siu2"] },
        { paragraphBreak: true },
        { chars: ["也", "许", "这", "刻", "你", " ", "仍", "然", "尚", "未", "发", "觉"], jp: ["jaa5", "heoi2", "ze5", "hak1", "nei5", "", "jing4", "jin4", "soeng6", "mei6", "faat3", "gok3"] },
        { chars: ["家", "中", "有", "这", "一", "个", "访", "客", " ", "时", "时", "漏", "夜", "冒", "昧", "探", "你"], jp: ["gaa1", "zung1", "jau5", "ze5", "jat1", "go3", "fong2", "haak3", "", "si4", "si4", "lau6", "je6", "mou6", "mui6", "taam3", "nei5"] },
        { chars: ["将", "琐", "碎", "东", "西", "带", "走", " ", "然", "后", "又", "放", "低"], jp: ["zoeng1", "so2", "seoi3", "dung1", "sai1", "daai3", "zau2", "", "jin4", "hau6", "jau6", "fong3", "dai1"] },
        { paragraphBreak: true },
        { chars: ["在", "你", "的", "唱", "机", "放", "低", "唱", "片", "是", "我"], jp: ["zoi6", "nei5", "dik1", "coeng3", "gei1", "fong3", "dai1", "coeng3", "pin2", "si6", "ngo5"] },
        { chars: ["算", "是", "暗", "中", " ", "一", "起", "分", "享", "过", "首", "歌"], jp: ["syun3", "si6", "am3", "zung1", "", "jat1", "hei2", "fan1", "hoeng2", "gwo3", "sau2", "go1"] },
        { chars: ["从", "你", "的", "套", "房", "带", "走", "被", "单", "是", "我"], jp: ["cung4", "nei5", "dik1", "tou3", "fong2", "daai3", "zau2", "bei6", "daan1", "si6", "ngo5"] },
        { chars: ["你", "睡", "过", "的", " ", "至", "少", "我", "都", "睡", "过"], jp: ["nei5", "seoi6", "gwo3", "dik1", "", "zi3", "siu2", "ngo5", "dou1", "seoi6", "gwo3"] },
        { paragraphBreak: true },
        { chars: ["从", "你", "工", "作", "间", "带", "走", "废", "纸", "是", "我"], jp: ["cung4", "nei5", "gung1", "zok3", "gaan1", "daai3", "zau2", "fai3", "zi2", "si6", "ngo5"] },
        { chars: ["照", "着", "你", "的", "笔", "迹", "写", "封", "信", "给", "我"], jp: ["ziu3", "zoek6", "nei5", "dik1", "bat1", "zik1", "se2", "fung1", "seon3", "kap1", "ngo5"] },
        { chars: ["在", "你", "抽", "屉", "中", "放", "低", "戒", "指", "是", "我"], jp: ["zoi6", "nei5", "cau1", "tai3", "zung1", "fong3", "dai1", "gaai3", "zi2", "si6", "ngo5"] },
        { chars: ["你", "就", "算", "知", " ", "也", "不", "会", "想", " ", "是", "我"], jp: ["nei5", "zau6", "syun3", "zi1", "", "jaa5", "bat1", "wui6", "soeng2", "", "si6", "ngo5"] },
    
        ]
    };
    // 【方案A】通过 __songPush 接口注册歌曲数据
    // loadSongLyrics() 会将 __songPush 替换为当前歌曲的唯一数组
    if (typeof window !== 'undefined' && window.__songPush) {
        window.__songPush(song);
    }
})();
