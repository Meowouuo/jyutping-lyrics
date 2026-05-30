// 歌曲：我的快乐时代（live）

(function() {
    const song = {
        id: 623,
        title: "我的快乐时代（live）",
        titleJyutping: ["ngo5","dik1","faai3","lok6","si4","doi6","","","","","",""],
        artist: "陈奕迅",
        artistJyutping: ["can4","jik6","seon3"],
        lyricist: "林夕",
        lyricistJyutping: ["lam4","zik6"],
        composer: "林健华",
        composerJyutping: ["lam4","gin6","waa4"],
        lyrics: [
            { chars: ["让","我","有","个","美","满","旅","程"], jp: ["joeng6","ngo5","jau5","go3","mei5","mun5","leoi5","cing4"] },
            { chars: ["让","我","记","着","有","多","高","兴"], jp: ["joeng6","ngo5","gei3","zoek6","jau5","do1","gou1","hing1"] },
            { chars: ["让","我","有","勇","气","去","喊","停"], jp: ["joeng6","ngo5","jau5","jung5","hei3","heoi3","haam3","ting4"] },
            { chars: ["没","有","结","局","也","可","即","兴"], jp: ["mut6","jau5","git3","guk6","jaa5","ho2","zik1","hing1"] },
            { chars: ["难","堪","的","不","想"], jp: ["naan4","ham1","dik1","bat1","soeng2"] },
            { chars: ["只","想","痛","快","事","情"], jp: ["zi2","soeng2","tung3","faai3","si6","cing4"] },
            { chars: ["时","间","尚","早"], jp: ["si4","gaan1","soeng6","zou2"] },
            { chars: ["别","张","开","眼","睛"], jp: ["bit6","zoeng1","hoi1","ngaan5","zing1"] },
            { paragraphBreak: true },
            { chars: ["长","路","漫","漫","是","如","何","走","过"], jp: ["coeng4","lou6","maan6","maan6","si6","jyu4","ho4","zau2","gwo3"] },
            { chars: ["宁","愿","让","乐","极","忘","形","的","我"], jp: ["ning4","jyun6","joeng6","lok6","gik6","mong4","jing4","dik1","ngo5"] },
            { chars: ["离","时","代","远","远"], jp: ["lei4","si4","doi6","jyun5","jyun5"] },
            { chars: ["没","人","间","烟","火"], jp: ["mut6","jan4","gaan1","jin1","fo2"] },
            { chars: ["毫","无","代","价","唱","最","幸","福","的","歌"], jp: ["hou4","mou4","doi6","gaai3","coeng3","zeoi3","hang6","fuk1","dik1","go1"] },
            { paragraphBreak: true },
            { chars: ["让","我","对","这","世","界","好","奇"], jp: ["joeng6","ngo5","deoi3","ze5","sai3","gaai3","hou3","kei4"] },
            { chars: ["让","我","信","自","己","的","真","理"], jp: ["joeng6","ngo5","seon3","zi6","gei2","dik1","zan1","lei5"] },
            { chars: ["让","我","有","个","永","远","假","期"], jp: ["joeng6","ngo5","jau5","go3","wing5","jyun5","gaa3","kei4"] },
            { chars: ["让","我","渴","睡","也","可","嬉","戏"], jp: ["joeng6","ngo5","hot3","seoi6","jaa5","ho2","hei1","hei3"] },
            { chars: ["从","今","天","开","始"], jp: ["cung4","gam1","tin1","hoi1","ci2"] },
            { chars: ["相","识","当","作","别","离"], jp: ["soeng1","sik1","dong1","zok3","bit6","lei4"] },
            { chars: ["时","间","就","似","活","多","一","世","纪"], jp: ["si4","gaan1","zau6","ci5","wut6","do1","jat1","sai3","gei2"] },
            { paragraphBreak: true },
            { chars: ["长","路","漫","漫","是","如","何","走","过"], jp: ["coeng4","lou6","maan6","maan6","si6","jyu4","ho4","zau2","gwo3"] },
            { chars: ["宁","愿","让","乐","极","忘","形","的","我"], jp: ["ning4","jyun6","joeng6","lok6","gik6","mong4","jing4","dik1","ngo5"] },
            { chars: ["离","时","代","远","远"], jp: ["lei4","si4","doi6","jyun5","jyun5"] },
            { chars: ["没","人","间","烟","火"], jp: ["mut6","jan4","gaan1","jin1","fo2"] },
            { chars: ["毫","无","代","价","唱","最","幸","福","的","歌"], jp: ["hou4","mou4","doi6","gaai3","coeng3","zeoi3","hang6","fuk1","dik1","go1"] },
            { chars: ["愿","我","可"], jp: ["jyun6","ngo5","ho2"] },
            { paragraphBreak: true },
            { chars: ["无","论","日","夜","是","如","何","经","过"], jp: ["mou4","leon6","jat6","je6","si6","jyu4","ho4","ging1","gwo3"] },
            { chars: ["宁","愿","在","极","乐","当","中","的","我"], jp: ["ning4","jyun6","zoi6","gik6","lok6","dong1","zung1","dik1","ngo5"] },
            { chars: ["沉","迷","或","放","弃","亦","无","可","不","可"], jp: ["cam4","mai4","waak6","fong3","hei3","jik6","mou4","ho2","bat1","ho2"] },
            { chars: ["毫","无","代","价","唱","最","幸","福","的","歌"], jp: ["hou4","mou4","doi6","gaai3","coeng3","zeoi3","hang6","fuk1","dik1","go1"] },
            { chars: ["愿","我","可"], jp: ["jyun6","ngo5","ho2"] },
            { paragraphBreak: true },
            { chars: ["唯","求","在","某","次","尽","情","欢","乐","过"], jp: ["wai4","kau4","zoi6","mau5","ci3","zeon6","cing4","fun1","lok6","gwo3"] },
            { chars: ["时","间","够","了"], jp: ["si4","gaan1","gau3","liu5"] },
            { chars: ["时","针","偏","偏","出","了","错"], jp: ["si4","zam1","pin1","pin1","ceot1","liu5","co3"] }
        ]
    };
    // 【方案A】通过 __songPush 接口注册歌曲数据
    // loadSongLyrics() 会将 __songPush 替换为当前歌曲的唯一数组
    if (typeof window !== 'undefined' && window.__songPush) {
        window.__songPush(song);
    }
})();
