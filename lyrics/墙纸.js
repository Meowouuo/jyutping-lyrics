// 歌曲：墙纸

(function() {
    const song = {
        id: 865,
        title: "墙纸",
        titleJyutping: ["coeng4","zi2"],
        artist: "容祖儿",
        artistJyutping: ["jung4","zou2","ji4"],
        lyricist: "黄伟文",
        lyricistJyutping: ["wong4","wai5","man4"],
        composer: "方大同",
        composerJyutping: ["fong1","daai6","tung4"],
        lyrics: [
            { chars: ["陪","着","你","你","都","不","会","知"], jp: ["pui4","zoek6","nei5","nei5","dou1","bat1","wui6","zi1"] },
            { chars: ["凝","视","你","背","影","一","辈","子"], jp: ["jing4","si6","nei5","bui3","jing2","jat1","bui3","zi2"] },
            { chars: ["旁","人","常","在","笑","我","坚","持"], jp: ["pong4","jan4","soeng4","zoi6","siu3","ngo5","gin1","ci4"] },
            { chars: ["我","只","得","坚","持"], jp: ["ngo5","zi2","dak1","gin1","ci4"] },
            { chars: ["我","喜","欢","坚","持"], jp: ["ngo5","hei2","fun1","gin1","ci4"] },
            { paragraphBreak: true },
            { chars: ["即","使","只","相","隔","着","块","纸"], jp: ["zik1","si2","zi2","soeng1","gaak3","zoek6","faai3","zi2"] },
            { chars: ["相","亲","必","须","同","时","同","意"], jp: ["soeng1","can1","bit1","seoi1","tung4","si4","tung4","ji3"] },
            { chars: ["地","上","最","远","的","只","怕","是"], jp: ["dei6","soeng6","zeoi3","jyun5","dik1","zi2","paa3","si6"] },
            { chars: ["同","场"], jp: ["tung4","coeng4"] },
            { chars: ["也","不","看","我","一","次"], jp: ["jaa5","bat1","hon3","ngo5","jat1","ci3"] },
            { paragraphBreak: true },
            { chars: ["墙","纸","一","般","贴","在","门","墙","是","我"], jp: ["coeng4","zi2","jat1","bun1","tip3","zoi6","mun4","coeng4","si6","ngo5"] },
            { chars: ["填","充","画","面","那","内","容"], jp: ["tin4","cung1","waak6","min6","naa5","noi6","jung4"] },
            { chars: ["无","权","伴","你","躺","卧"], jp: ["mou4","kyun4","bun6","nei5","tong2","ngo6"] },
            { chars: ["想","知","这","角","碎","花"], jp: ["soeng2","zi1","ze5","gok3","seoi3","faa1"] },
            { chars: ["只","装","饰","你","的"], jp: ["zi2","zong1","sik1","nei5","dik1"] },
            { chars: ["堂","皇","神","殿","么"], jp: ["tong4","wong4","san4","din6","mo1"] },
            { chars: ["可","曾","被","你","欣","赏","过"], jp: ["ho2","cang4","bei6","nei5","jan1","soeng2","gwo3"] },
            { paragraphBreak: true },
            { chars: ["其","实","我","也","想","讲","你","知"], jp: ["kei4","sat6","ngo5","jaa5","soeng2","gong2","nei5","zi1"] },
            { chars: ["谁","伴","你","也","非","一","辈","子"], jp: ["seoi4","bun6","nei5","jaa5","fei1","jat1","bui3","zi2"] },
            { chars: ["来","年","来","月","我","褪","色","时"], jp: ["loi4","nin4","loi4","jyut6","ngo5","teoi3","sik1","si4"] },
            { chars: ["你","想","珍","惜","时"], jp: ["nei5","soeng2","zan1","sik1","si4"] },
            { chars: ["后","悔","都","很","迟"], jp: ["hau6","fui3","dou1","han2","ci4"] },
            { paragraphBreak: true },
            { chars: ["只","担","心","撕","去","这","块","纸"], jp: ["zi2","daam1","sam1","si1","heoi3","ze5","faai3","zi2"] },
            { chars: ["空","出","一","方","无","人","留","意"], jp: ["hung1","ceot1","jat1","fong1","mou4","jan4","lau4","ji3"] },
            { chars: ["没","若","有","所","失","的","你"], jp: ["mut6","joek6","jau5","so2","sat1","dik1","nei5"] },
            { chars: ["未","怀","疑"], jp: ["mei6","waai4","ji4"] },
            { chars: ["美","景","缺","了","一","处"], jp: ["mei5","ging2","kyut3","liu5","jat1","cyu5"] },
            { paragraphBreak: true },
            { chars: ["墙","纸","一","般","贴","在","门","墙","是","我"], jp: ["coeng4","zi2","jat1","bun1","tip3","zoi6","mun4","coeng4","si6","ngo5"] },
            { chars: ["填","充","画","面","那","内","容"], jp: ["tin4","cung1","waak6","min6","naa5","noi6","jung4"] },
            { chars: ["无","权","伴","你","躺","卧"], jp: ["mou4","kyun4","bun6","nei5","tong2","ngo6"] },
            { chars: ["想","知","这","角","碎","花"], jp: ["soeng2","zi1","ze5","gok3","seoi3","faa1"] },
            { chars: ["只","装","饰","你","的"], jp: ["zi2","zong1","sik1","nei5","dik1"] },
            { chars: ["堂","皇","神","殿","么"], jp: ["tong4","wong4","san4","din6","mo1"] },
            { chars: ["可","曾","被","你","欣","赏","过"], jp: ["ho2","cang4","bei6","nei5","jan1","soeng2","gwo3"] },
            { paragraphBreak: true },
            { chars: ["墙","纸","一","般","盼","待","情","人","路","过"], jp: ["coeng4","zi2","jat1","bun1","paan3","doi6","cing4","jan4","lou6","gwo3"] },
            { chars: ["从","此","安","守","你","后","台"], jp: ["cung4","ci2","on1","sau2","nei5","hau6","toi4"] },
            { chars: ["无","缘","为","你","闯","祸"], jp: ["mou4","jyun4","wai4","nei5","cong2","wo6"] },
            { chars: ["想","知","一","旦","有","天"], jp: ["soeng2","zi1","jat1","daan3","jau5","tin1"] },
            { chars: ["壁","花","都","已","枯"], jp: ["bik1","faa1","dou1","ji5","fu1"] },
            { chars: ["情","人","怀","念","么"], jp: ["cing4","jan4","waai4","nim6","mo1"] },
            { chars: ["可","曾","为","我","伤","心","过"], jp: ["ho2","cang4","wai4","ngo5","soeng1","sam1","gwo3"] }
        ]
    };
    // 【方案A】通过 __songPush 接口注册歌曲数据
    // loadSongLyrics() 会将 __songPush 替换为当前歌曲的唯一数组
    if (typeof window !== 'undefined' && window.__songPush) {
        window.__songPush(song);
    }
})();
