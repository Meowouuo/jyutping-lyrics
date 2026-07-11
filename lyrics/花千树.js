// 歌曲：花千树

(function() {
    const song = {
        id: 981,
        title: "花千树",
        titleJyutping: ["faa1","cin1","syu6"],
        artist: "容祖儿",
        artistJyutping: ["jung4","zou2","ji4"],
        lyricist: "黄伟文",
        lyricistJyutping: ["wong4","wai5","man4"],
        composer: "Mattew Tisher/Andrew Ang",
        composerJyutping: ["","","","","","","","","","","","","","","","","","","","","","","",""],
        lyrics: [
            { chars: ["恋","爱","若","然","像","旅","行"], jp: ["lyun2","ngoi3","joek6","jin4","zoeng6","leoi5","hang4"] },
            { chars: ["风","景","看","尽","至","甘","心"], jp: ["fung1","ging2","hon3","zeon6","zi3","gam1","sam1"] },
            { chars: ["就","怕","给","你","走","遍","世","间","仍","可","能"], jp: ["zau6","paa3","kap1","nei5","zau2","pin3","sai3","gaan1","jing4","ho2","nang4"] },
            { chars: ["疑","问","宇","宙","有","没","世","外","桃","源"], jp: ["ji4","man6","jyu5","zau6","jau5","mut6","sai3","ngoi6","tou4","jyun4"] },
            { chars: ["尚","要","觅","寻"], jp: ["soeng6","jiu3","mik6","cam4"] },
            { paragraphBreak: true },
            { chars: ["一","见","就","情","定","某","人"], jp: ["jat1","gin3","zau6","cing4","ding6","mau5","jan4"] },
            { chars: ["等","于","对","待","你","残","忍"], jp: ["dang2","jyu1","deoi3","doi6","nei5","caan4","jan2"] },
            { chars: ["谁","能","保","証","终","生","不","抱","憾"], jp: ["seoi4","nang4","bou2","zing3","zung1","sang1","bat1","pou5","ham6"] },
            { chars: ["没","更","好","在","眼","前","等"], jp: ["mut6","gang1","hou2","zoi6","ngaan5","cin4","dang2"] },
            { paragraphBreak: true },
            { chars: ["遇","过","很","多","很","多","恋","人"], jp: ["jyu6","gwo3","han2","do1","han2","do1","lyun2","jan4"] },
            { chars: ["一","朵","花","跟","森","林"], jp: ["jat1","do2","faa1","gan1","sam1","lam4"] },
            { chars: ["你","未","决","定","哪","边","合","衬"], jp: ["nei5","mei6","kyut3","ding6","naa5","bin1","hap6","can3"] },
            { chars: ["如","何","投","入","你","情","感"], jp: ["jyu4","ho4","tau4","jap6","nei5","cing4","gam2"] },
            { chars: ["害","怕","今","天","挑","选","这","人"], jp: ["hoi6","paa3","gam1","tin1","tiu1","syun2","ze5","jan4"] },
            { chars: ["转","角","有","个","某","君"], jp: ["zyun2","gok3","jau5","go3","mau5","gwan1"] },
            { chars: ["送","赠","更","动","魄","的","热","吻"], jp: ["sung3","zang6","gang1","dung6","paak3","dik1","jit6","man5"] },
            { chars: ["你","为","何","没","有","等"], jp: ["nei5","wai4","ho4","mut6","jau5","dang2"] },
            { chars: ["一","早","已","被","困"], jp: ["jat1","zou2","ji5","bei6","kwan3"] },
            { paragraphBreak: true },
            { chars: ["花","满","地","奇","树","满","林"], jp: ["faa1","mun5","dei6","kei4","syu6","mun5","lam4"] },
            { chars: ["花","多","眼","乱","难","评","分"], jp: ["faa1","do1","ngaan5","lyun6","naan4","ping4","fan1"] },
            { chars: ["回","头","只","怕","兜","兜","转","太","耐"], jp: ["wui4","tau4","zi2","paa3","dau1","dau1","zyun2","taai3","noi6"] },
            { chars: ["没","有","采","就","已","黄","昏"], jp: ["mut6","jau5","coi2","zau6","ji5","wong4","fan1"] },
            { paragraphBreak: true },
            { chars: ["遇","过","很","多","很","多","恋","人"], jp: ["jyu6","gwo3","han2","do1","han2","do1","lyun2","jan4"] },
            { chars: ["一","朵","花","跟","森","林"], jp: ["jat1","do2","faa1","gan1","sam1","lam4"] },
            { chars: ["你","未","决","定","哪","边","合","衬"], jp: ["nei5","mei6","kyut3","ding6","naa5","bin1","hap6","can3"] },
            { chars: ["如","何","投","入","你","情","感"], jp: ["jyu4","ho4","tau4","jap6","nei5","cing4","gam2"] },
            { chars: ["害","怕","今","天","挑","选","这","人"], jp: ["hoi6","paa3","gam1","tin1","tiu1","syun2","ze5","jan4"] },
            { chars: ["转","角","有","个","某","君"], jp: ["zyun2","gok3","jau5","go3","mau5","gwan1"] },
            { chars: ["送","赠","更","动","魄","的","热","吻"], jp: ["sung3","zang6","gang1","dung6","paak3","dik1","jit6","man5"] },
            { chars: ["你","为","何","没","有","等"], jp: ["nei5","wai4","ho4","mut6","jau5","dang2"] },
            { chars: ["一","早","已","被","困"], jp: ["jat1","zou2","ji5","bei6","kwan3"] },
            { paragraphBreak: true },
            { chars: ["大","概","你","也","抱","歉","得","很","伤","了","几","百","个","心"], jp: ["daai6","koi3","nei5","jaa5","pou5","hip3","dak1","han2","soeng1","liu5","gei2","baak3","go3","sam1"] },
            { chars: ["也","未","决","定","那","位","合","衬"], jp: ["jaa5","mei6","kyut3","ding6","naa5","wai6","hap6","can3"] },
            { chars: ["或","你","知","事","到","如","今"], jp: ["waak6","nei5","zi1","si6","dou3","jyu4","gam1"] },
            { chars: ["共","你","应","该","一","起","的","人"], jp: ["gung6","nei5","jing3","goi1","jat1","hei2","dik1","jan4"] },
            { chars: ["已","变","了","做","至","亲"], jp: ["ji5","bin3","liu5","zou6","zi3","can1"] },
            { chars: ["看","着","你","共","谁","合","又","分"], jp: ["hon3","zoek6","nei5","gung6","seoi4","hap6","jau6","fan1"] },
            { chars: ["美","事","还","未","发","生"], jp: ["mei5","si6","waan4","mei6","faat3","sang1"] },
            { chars: ["冬","天","已","渐","近"], jp: ["dung1","tin1","ji5","zim6","gan6"] }
        ]
    };
    // 【方案A】通过 __songPush 接口注册歌曲数据
    // loadSongLyrics() 会将 __songPush 替换为当前歌曲的唯一数组
    if (typeof window !== 'undefined' && window.__songPush) {
        window.__songPush(song);
    }
})();
