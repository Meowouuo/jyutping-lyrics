// 歌曲：邮差

(function() {
    const song = {
        id: 910,
        title: "邮差",
        titleJyutping: ["jau4","caa1"],
        artist: "王菲",
        artistJyutping: ["wong4","fei2"],
        lyricist: "林夕",
        lyricistJyutping: ["lam4","zik6"],
        composer: "Adrian Chen",
        composerJyutping: ["","","","","","","","","","",""],
        lyrics: [
            { chars: ["直","到","细","雪","飞","下","来"], jp: ["zik6","dou3","sai3","syut3","fei1","haa6","loi4"] },
            { chars: ["荡","进","远","处","深","海"], jp: ["dong6","zeon3","jyun5","cyu5","sam1","hoi2"] },
            { chars: ["甚","至","两","脚","走","不","动"], jp: ["sam6","zi3","loeng5","goek3","zau2","bat1","dung6"] },
            { chars: ["先","想","到"], jp: ["sin1","soeng2","dou3"] },
            { chars: ["离","开"], jp: ["lei4","hoi1"] },
            { chars: ["直","到","你","说","不","回","来"], jp: ["zik6","dou3","nei5","syut3","bat1","wui4","loi4"] },
            { chars: ["直","到","我","说","活","该"], jp: ["zik6","dou3","ngo5","syut3","wut6","goi1"] },
            { chars: ["拿","下","了","你","这","感","情","包","袱"], jp: ["naa4","haa6","liu5","nei5","ze5","gam2","cing4","baau1","fuk6"] },
            { chars: ["或","者","反","而","相","信","爱"], jp: ["waak6","ze2","faan2","ji4","soeng1","seon3","ngoi3"] },
            { paragraphBreak: true },
            { chars: ["你","是","千","堆","雪"], jp: ["nei5","si6","cin1","deoi1","syut3"] },
            { chars: ["我","是","长","街"], jp: ["ngo5","si6","coeng4","gaai1"] },
            { chars: ["怕","日","出","一","到"], jp: ["paa3","jat6","ceot1","jat1","dou3"] },
            { chars: ["彼","此","瓦","解"], jp: ["bei2","ci2","ngaa5","gaai2"] },
            { chars: ["看","着","蝴","蝶","扑","不","过","天","涯"], jp: ["hon3","zoek6","wu4","dip2","pok3","bat1","gwo3","tin1","ngaai4"] },
            { chars: ["谁","又","有","权","不","理","解","(","唯","独","怪","时","间","真","快",")"], jp: ["seoi4","jau6","jau5","kyun4","bat1","lei5","gaai2","","wai4","duk6","gwaai3","si4","gaan1","zan1","faai3",""] },
            { chars: ["你","是","一","封","信"], jp: ["nei5","si6","jat1","fung1","seon3"] },
            { chars: ["我","是","邮","差"], jp: ["ngo5","si6","jau4","caa1"] },
            { chars: ["最","后","一","双","脚"], jp: ["zeoi3","hau6","jat1","soeng1","goek3"] },
            { chars: ["惹","尽","尘","埃"], jp: ["je5","zeon6","can4","oi1"] },
            { chars: ["忙","着","去","护","送"], jp: ["mong4","zoek6","heoi3","wu6","sung3"] },
            { chars: ["来","不","及","拆","开"], jp: ["loi4","bat1","kap6","caak3","hoi1"] },
            { chars: ["里","面","完","美","的","世","界"], jp: ["leoi5","min6","jyun4","mei5","dik1","sai3","gaai3"] },
            { paragraphBreak: true },
            { chars: ["认","错","旅","店","的","门","牌"], jp: ["jing6","co3","leoi5","dim3","dik1","mun4","paai4"] },
            { chars: ["认","错","想","逛","的","街"], jp: ["jing6","co3","soeng2","kwaang3","dik1","gaai1"] },
            { chars: ["便","当","冷","了","想","保","存"], jp: ["bin6","dong1","laang5","liu5","soeng2","bou2","cyun4"] },
            { chars: ["怎","可","以","乱","摆"], jp: ["zam2","ho2","ji5","lyun6","baai2"] },
            { chars: ["没","有","你","我","的","和","弦"], jp: ["mut6","jau5","nei5","ngo5","dik1","wo4","jin4"] },
            { chars: ["但","有","结","尾","伏","线"], jp: ["daan6","jau5","git3","mei5","fuk6","sin3"] },
            { chars: ["黄","叶","会","远","飞","这","场","宿","命"], jp: ["wong4","jip6","wui6","jyun5","fei1","ze5","coeng4","suk1","ming6"] },
            { chars: ["最","终","只","能","讲","再","见"], jp: ["zeoi3","zung1","zi2","nang4","gong2","zoi3","gin3"] }
        ]
    };
    // 【方案A】通过 __songPush 接口注册歌曲数据
    // loadSongLyrics() 会将 __songPush 替换为当前歌曲的唯一数组
    if (typeof window !== 'undefined' && window.__songPush) {
        window.__songPush(song);
    }
})();
