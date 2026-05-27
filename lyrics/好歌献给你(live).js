// 歌曲：好歌献给你(live)

(function() {
    const song = {
        id: 552,
        title: "好歌献给你(live)",
        titleJyutping: ["hou2","go1","hin3","kap1","nei5","","","","","",""],
        artist: "陈奕迅",
        artistJyutping: ["can4","jik6","seon3"],
        lyricist: "郑国江",
        lyricistJyutping: ["zeng6","gwok3","gong1"],
        composer: "马饲野康二",
        composerJyutping: ["maa5","zi6","je5","hong1","ji6"],
        lyrics: [
            { chars: ["歌","声","飘","送","千","千","里"], jp: ["go1","sing1","piu1","sung3","cin1","cin1","lei5"] },
            { chars: ["不","计","距","离"], jp: ["bat1","gai3","keoi5","lei4"] },
            { chars: ["歌","声","飘","送","万","万","里"], jp: ["go1","sing1","piu1","sung3","maan6","maan6","lei5"] },
            { chars: ["跨","远","地"], jp: ["kwaa3","jyun5","dei6"] },
            { chars: ["歌","声","句","句","唱","出","愉","快","少","年","事"], jp: ["go1","sing1","geoi3","geoi3","coeng3","ceot1","jyu6","faai3","siu3","nin4","si6"] },
            { chars: ["好","歌","一","生","伴","着","你"], jp: ["hou2","go1","jat1","sang1","bun6","zoek6","nei5"] },
            { paragraphBreak: true },
            { chars: ["歌","声","飘","送","千","千","里"], jp: ["go1","sing1","piu1","sung3","cin1","cin1","lei5"] },
            { chars: ["不","计","距","离"], jp: ["bat1","gai3","keoi5","lei4"] },
            { chars: ["歌","声","飘","送","万","万","里"], jp: ["go1","sing1","piu1","sung3","maan6","maan6","lei5"] },
            { chars: ["跨","远","地"], jp: ["kwaa3","jyun5","dei6"] },
            { chars: ["歌","声","句","句","唱","出","愉","快","少","年","事"], jp: ["go1","sing1","geoi3","geoi3","coeng3","ceot1","jyu6","faai3","siu3","nin4","si6"] },
            { chars: ["好","歌","一","生","伴","着","你"], jp: ["hou2","go1","jat1","sang1","bun6","zoek6","nei5"] },
            { paragraphBreak: true },
            { chars: ["好","歌","献","给","你"], jp: ["hou2","go1","hin3","kap1","nei5"] },
            { chars: ["让","爱","藏","心","里"], jp: ["joeng6","ngoi3","cong4","sam1","leoi5"] },
            { chars: ["阳","光","在","我","心","里","照","耀"], jp: ["joeng4","gwong1","zoi6","ngo5","sam1","leoi5","ziu3","jiu6"] },
            { chars: ["光","辉","欢","笑","永","伴","随"], jp: ["gwong1","fai1","fun1","siu3","wing5","bun6","ceoi4"] },
            { paragraphBreak: true },
            { chars: ["好","歌","献","给","你"], jp: ["hou2","go1","hin3","kap1","nei5"] },
            { chars: ["愿","你","藏","心","里"], jp: ["jyun6","nei5","cong4","sam1","leoi5"] },
            { chars: ["惟","愿","为","你","解","去","愁","闷"], jp: ["wai4","jyun6","wai4","nei5","gaai2","heoi3","sau4","mun6"] },
            { chars: ["快","乐","在","歌","声","里"], jp: ["faai3","lok6","zoi6","go1","sing1","leoi5"] },
            { paragraphBreak: true },
            { chars: ["好","歌","献","给","你"], jp: ["hou2","go1","hin3","kap1","nei5"] },
            { chars: ["让","爱","藏","心","里"], jp: ["joeng6","ngoi3","cong4","sam1","leoi5"] },
            { chars: ["阳","光","在","我","心","里","照","耀"], jp: ["joeng4","gwong1","zoi6","ngo5","sam1","leoi5","ziu3","jiu6"] },
            { chars: ["光","辉","欢","笑","永","伴","随"], jp: ["gwong1","fai1","fun1","siu3","wing5","bun6","ceoi4"] },
            { paragraphBreak: true },
            { chars: ["好","歌","献","给","你"], jp: ["hou2","go1","hin3","kap1","nei5"] },
            { chars: ["愿","你","藏","心","里"], jp: ["jyun6","nei5","cong4","sam1","leoi5"] },
            { chars: ["惟","愿","为","你","解","去","愁","闷"], jp: ["wai4","jyun6","wai4","nei5","gaai2","heoi3","sau4","mun6"] },
            { chars: ["快","乐","在","歌","声","里"], jp: ["faai3","lok6","zoi6","go1","sing1","leoi5"] },
            { paragraphBreak: true },
            { chars: ["好","歌","献","给","你"], jp: ["hou2","go1","hin3","kap1","nei5"] },
            { chars: ["愿","你","藏","心","里"], jp: ["jyun6","nei5","cong4","sam1","leoi5"] },
            { chars: ["陪","伴","渡","过","黑","暗","长","夜"], jp: ["pui4","bun6","dou6","gwo3","haak1","am3","coeng4","je6"] },
            { chars: ["我","活","在","歌","声","里"], jp: ["ngo5","wut6","zoi6","go1","sing1","leoi5"] }
        ]
    };
    // 【方案A】通过 __songPush 接口注册歌曲数据
    // loadSongLyrics() 会将 __songPush 替换为当前歌曲的唯一数组
    if (typeof window !== 'undefined' && window.__songPush) {
        window.__songPush(song);
    }
})();
