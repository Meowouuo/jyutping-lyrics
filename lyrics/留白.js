// 歌曲：留白

(function() {
    const song = {
        id: 939,
        title: "留白",
        titleJyutping: ["lau4","baak6"],
        artist: "王菀之",
        artistJyutping: ["wong4","jyun2","zi1"],
        lyricist: "林夕",
        lyricistJyutping: ["lam4","zik6"],
        composer: "常石磊",
        composerJyutping: ["soeng4","sek6","leoi5"],
        lyrics: [
            { chars: ["白","日","梦","内","白","风","光"], jp: ["baak6","jat6","mung6","noi6","baak6","fung1","gwong1"] },
            { chars: ["将","光","阴","停","下"], jp: ["zoeng1","gwong1","jam1","ting4","haa6"] },
            { chars: ["白","受","罪","后","白","开","心"], jp: ["baak6","sau6","zeoi6","hau6","baak6","hoi1","sam1"] },
            { chars: ["将","心","瓣","埋","下"], jp: ["zoeng1","sam1","faan2","maai4","haa6"] },
            { chars: ["（","啊","）","采","菊","东","篱","下"], jp: ["","aa1","","coi2","guk1","dung1","lei4","haa6"] },
            { chars: ["（","啊","）","以","退","为","进","化"], jp: ["","aa1","","ji5","teoi3","wai4","zeon3","faa3"] },
            { paragraphBreak: true },
            { chars: ["白","石","画","下","白","开","水"], jp: ["baak6","sek6","waak6","haa6","baak6","hoi1","seoi2"] },
            { chars: ["将","色","彩","埋","下"], jp: ["zoeng1","sik1","coi2","maai4","haa6"] },
            { chars: ["白","袜","踏","乱","白","身","影"], jp: ["baak6","mat6","daap6","lyun6","baak6","san1","jing2"] },
            { chars: ["将","身","躯","除","下"], jp: ["zoeng1","san1","keoi1","ceoi4","haa6"] },
            { chars: ["（","依","依","依","依","）","将","阴","影","留","白"], jp: ["","ji1","ji1","ji1","ji1","","zoeng1","jam1","jing2","lau4","baak6"] },
            { chars: ["（","依","依","依","依","）","向","透","明","进","化"], jp: ["","ji1","ji1","ji1","ji1","","hoeng3","tau3","ming4","zeon3","faa3"] },
            { paragraphBreak: true },
            { chars: ["白","日","白","夜","白","花","花"], jp: ["baak6","jat6","baak6","je6","baak6","faa1","faa1"] },
            { chars: ["秋","分","即","炎","夏"], jp: ["cau1","fan1","zik1","jim4","haa6"] },
            { chars: ["日","画","夜","画","画","疮","疤"], jp: ["jat6","waak6","je6","waak6","waak6","cong1","baa1"] },
            { chars: ["将","画","笔","扔","下"], jp: ["zoeng1","waak6","bat1","jing4","haa6"] },
            { chars: ["（","啊","）","给","心","境","留","白"], jp: ["","aa1","","kap1","sam1","ging2","lau4","baak6"] },
            { chars: ["（","啊","）","向","透","明","进","化"], jp: ["","aa1","","hoeng3","tau3","ming4","zeon3","faa3"] },
            { paragraphBreak: true },
            { chars: ["白","鹭","白","撞","白","乌","鸦"], jp: ["baak6","lou6","baak6","zong6","baak6","wu1","aa1"] },
            { chars: ["好","丑","分","明","吧"], jp: ["hou2","cau2","fan1","ming4","baa6"] },
            { chars: ["日","画","夜","画","什","么","画"], jp: ["jat6","waak6","je6","waak6","sap6","mo1","waak6"] },
            { chars: ["将","画","框","除","下"], jp: ["zoeng1","waak6","kwaang1","ceoi4","haa6"] },
            { chars: ["（","依","依","依","依","）","给","光","景","留","白"], jp: ["","ji1","ji1","ji1","ji1","","kap1","gwong1","ging2","lau4","baak6"] },
            { chars: ["（","依","依","依","依","）","向","透","明","进","化"], jp: ["","ji1","ji1","ji1","ji1","","hoeng3","tau3","ming4","zeon3","faa3"] },
            { paragraphBreak: true },
            { chars: ["白","日","白","望","白","烟","花"], jp: ["baak6","jat6","baak6","mong6","baak6","jin1","faa1"] },
            { chars: ["将","感","官","遗","下"], jp: ["zoeng1","gam2","gun1","wai4","haa6"] },
            { chars: ["日","画","夜","画","画","疮","疤"], jp: ["jat6","waak6","je6","waak6","waak6","cong1","baa1"] },
            { chars: ["将","画","笔","扔","下"], jp: ["zoeng1","waak6","bat1","jing4","haa6"] },
            { chars: ["（","啊","）","将","天","色","留","白"], jp: ["","aa1","","zoeng1","tin1","sik1","lau4","baak6"] },
            { chars: ["（","啊","）","世","界","无","界","吗","？"], jp: ["","aa1","","sai3","gaai3","mou4","gaai3","maa1",""] },
            { paragraphBreak: true },
            { chars: ["白","鹭","白","撞","白","乌","鸦"], jp: ["baak6","lou6","baak6","zong6","baak6","wu1","aa1"] },
            { chars: ["好","丑","分","明","吧"], jp: ["hou2","cau2","fan1","ming4","baa6"] },
            { chars: ["日","画","夜","画","什","么","画"], jp: ["jat6","waak6","je6","waak6","sap6","mo1","waak6"] },
            { chars: ["将","画","框","除","下"], jp: ["zoeng1","waak6","kwaang1","ceoi4","haa6"] },
            { chars: ["（","啊","）","将","天","色","留","白"], jp: ["","aa1","","zoeng1","tin1","sik1","lau4","baak6"] },
            { chars: ["（","啊","）","世","界","纯","洁","吗"], jp: ["","aa1","","sai3","gaai3","seon4","git3","maa1"] },
            { paragraphBreak: true },
            { chars: ["画","日","画","夜","画","青","空"], jp: ["waak6","jat6","waak6","je6","waak6","cing1","hung1"] },
            { chars: ["空","虚","不","能","画"], jp: ["hung1","heoi1","bat1","nang4","waak6"] },
            { chars: ["日","画","夜","画","什","么","画"], jp: ["jat6","waak6","je6","waak6","sap6","mo1","waak6"] },
            { chars: ["将","画","框","除","下"], jp: ["zoeng1","waak6","kwaang1","ceoi4","haa6"] },
            { chars: ["（","啊","）","将","心","迹","留","白"], jp: ["","aa1","","zoeng1","sam1","zik1","lau4","baak6"] },
            { chars: ["（","啊","）","世","界","纯","洁","吗"], jp: ["","aa1","","sai3","gaai3","seon4","git3","maa1"] }
        ]
    };
    // 【方案A】通过 __songPush 接口注册歌曲数据
    // loadSongLyrics() 会将 __songPush 替换为当前歌曲的唯一数组
    if (typeof window !== 'undefined' && window.__songPush) {
        window.__songPush(song);
    }
})();
