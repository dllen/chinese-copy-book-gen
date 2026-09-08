/**
 * 课程模板内置数据（基于小学 1-5 年级语文/英语教材内容）
 * 由 data/ 目录教材文件提取生成
 */

export const COURSE_TEMPLATES = [
  {
    "id": "g1-pinyin-yunmu",
    "name": "一年级·单韵母描红",
    "grade": "一年级",
    "subject": "语文",
    "type": "pinyin",
    "icon": "🔤",
    "desc": "6 个单韵母四声描红，田字格大字格，适合幼小衔接",
    "text": "ā á ǎ à\nō ó ǒ ò\nē é ě è\nī í ǐ ì\nū ú ǔ ù\nǖ ǘ ǚ ǜ\na o e\ni u ü",
    "config": {
      "feature": "字帖模板",
      "layout": "连续排列",
      "gridType": "田字格",
      "mode": "多字",
      "cols": 8,
      "rows": 6,
      "cellSize": 66,
      "fontSize": 52,
      "strokeMode": "适中"
    }
  },
  {
    "id": "g1-pinyin-shengmu",
    "name": "一年级·声母描红",
    "grade": "一年级",
    "subject": "语文",
    "type": "pinyin",
    "icon": "✍️",
    "desc": "23 个声母描红，与韵母配套使用",
    "text": "b p m f\nd t n l\ng k h\nj q x\nzh ch sh r\nz c s\ny w\nb-ā-bā",
    "config": {
      "feature": "字帖模板",
      "layout": "连续排列",
      "gridType": "田字格",
      "mode": "多字",
      "cols": 8,
      "rows": 6,
      "cellSize": 66,
      "fontSize": 52,
      "strokeMode": "适中"
    }
  },
  {
    "id": "g1-text",
    "name": "一年级·我是中国人",
    "grade": "一年级",
    "subject": "语文",
    "type": "text",
    "icon": "🇨🇳",
    "desc": "一年级上册第 1-2 课：我是中国人、我爱我们的祖国",
    "text": "我是中国人\n我是中国人。\n我们都是中国人。\n中华民族是一家。\n\n我爱我们的祖国\n五星红旗\n北京天安门\n我爱五星红旗。\n我爱北京天安门。\n长江\n黄河\n我爱长江，我爱黄河。\n我爱中华人民共和国。",
    "config": {
      "feature": "字帖模板",
      "layout": "文章格式",
      "gridType": "田字格",
      "mode": "多字",
      "cols": 8,
      "rows": 8,
      "cellSize": 64,
      "fontSize": 46,
      "strokeMode": "适中"
    }
  },
  {
    "id": "g2-text",
    "name": "二年级·小蝌蚪找妈妈",
    "grade": "二年级",
    "subject": "语文",
    "type": "text",
    "icon": "🐸",
    "desc": "二年级上册第 1 课精选段落，练习长句书写",
    "text": "1 小蝌蚪找妈妈\n池塘里有一群小蝌蚪，大大的脑袋，黑灰色的身子，甩着长长的尾巴，快活地游来游去。\n小蝌蚪游哇游，过了几天，长出了两条后腿。他们看见鲤鱼妈妈在教小鲤鱼捕食，就迎上去，问：“鲤鱼阿姨，我们的妈妈在哪里？”鲤鱼妈妈说：“你们的妈妈四条腿，宽嘴巴。你们到那边去找吧！”\n小蝌蚪游哇游，过了几天，长出了两条前腿。他们看见一只乌龟摆动着四条腿在水里游，连忙追上去，叫着：“妈妈，妈妈！”乌龟笑着说：“我不是你们的妈妈。你们的妈妈头顶上有两只大眼睛，披着绿衣裳。你们到那边去找吧！”\n小蝌蚪游哇游，过了几天，尾巴变短了。他们游到荷花旁边，看见荷叶上蹲着一只大青蛙，披着碧绿的衣裳，露着雪白的肚皮，鼓着一对大眼睛。\n小蝌蚪游过去，叫着：“妈妈，妈妈！”青蛙妈妈低头一看，笑着说：“好孩子，你们已经长成青蛙了，快跳上来吧！”他们后腿一蹬，向前一跳，蹦到了荷叶上。\n不知什么时候，小青蛙的尾巴已经不见了。他们跟着妈妈，天天去捉害虫。",
    "config": {
      "feature": "字帖模板",
      "layout": "文章格式",
      "gridType": "田字格",
      "mode": "多字",
      "cols": 10,
      "rows": 8,
      "cellSize": 56,
      "fontSize": 42,
      "strokeMode": "适中"
    }
  },
  {
    "id": "g3-text",
    "name": "三年级·大青树下的小学",
    "grade": "三年级",
    "subject": "语文",
    "type": "text",
    "icon": "🏫",
    "desc": "三年级上册第 1 课，民族小学的早晨",
    "text": "1 大青树下的小学\n早晨，从山坡上，从坪坝里，从一条条开着绒球花和太阳花的小路上，走来了许多小学生，有汉族的，有傣族的，有景颇族的，还有阿昌族和德昂族的。大家穿戴不同，来到学校，都成了好朋友。那鲜艳的服装，把学校打扮得绚丽多彩。同学们向在校园里欢唱的小鸟打招呼，向敬爱的老师问好，向高高飘扬的国旗敬礼。\n“当，当当！当，当当！”大青树上的铜钟敲响了。\n上课了，不同民族的小学生，在同一间教室里学习。大家一起朗读课文，那声音真好听！这时候，窗外十分安静，树枝不摇了，鸟儿不叫了，蝴蝶停在花朵上，好像都在听同学们读课文。最有趣的是，跑来了两只猴子。这些山林里的朋友，是那样好奇地听着。下课了，大家在大青树下跳孔雀舞，摔跤，做游戏，招引来许多小鸟，连松鼠也赶来看热闹。\n这就是我们可爱的小学，一所边疆的小学。古老的铜钟，挂在大青树粗壮的枝干上。凤尾竹的影子，在洁白的墙上摇晃……",
    "config": {
      "feature": "字帖模板",
      "layout": "文章格式",
      "gridType": "田字格",
      "mode": "多字",
      "cols": 10,
      "rows": 8,
      "cellSize": 54,
      "fontSize": 40,
      "strokeMode": "适中"
    }
  },
  {
    "id": "g3-en-words",
    "name": "三年级·英语单词",
    "grade": "三年级",
    "subject": "英语",
    "type": "words",
    "icon": "🔤",
    "desc": "三年级上册 Unit 1-2 核心单词，附中文释义",
    "text": "ruler 尺子\npencil 铅笔\neraser 橡皮\ncrayon 蜡笔\nbag 包\npen 钢笔\npencil box 铅笔盒\nbook 书\nno 不\nyour 你（们）的\nred 红色；红色的\ngreen 绿色；绿色的\nyellow 黄色；黄色的\nblue 蓝色；蓝色的\nblack 黑色；黑色的\nbrown 棕色；棕色的\nwhite 白色；白色的\norange 橙子\nOK 好；行\nmum 妈妈\nface 脸\near 耳朵\neye 眼睛\nnose 鼻子",
    "config": {
      "feature": "字帖模板",
      "layout": "英文格式",
      "gridType": "四线三格",
      "mode": "多词",
      "cols": 12,
      "rows": 8,
      "cellSize": 46,
      "fontSize": 36,
      "strokeMode": "适中",
      "letterStyle": "印刷体"
    }
  },
  {
    "id": "g4-text",
    "name": "四年级·观潮",
    "grade": "四年级",
    "subject": "语文",
    "type": "text",
    "icon": "🌊",
    "desc": "四年级上册第 1 课，钱塘江大潮",
    "text": "1 观潮\n钱塘江大潮，自古以来被称为天下奇观。\n农历八月十八是一年中传统的观潮日。这一天早上，我们来到了海宁市的盐官镇，据说这里是观潮最好的地方。我们随着观潮的人群，登上了海塘大堤。宽阔的钱塘江横卧在眼前。江面很平静，越往东越宽，在雨后的阳光下，笼罩着一层蒙蒙的薄雾。镇海古塔、中山亭和观潮台屹立在江边。远处，几座小山在云雾中若隐若现。江潮还没有来，海塘大堤上早已人山人海。大家昂首东望，等着，盼着。\n午后一点左右，从远处传来隆隆的响声，好像闷雷滚动。顿时人声鼎沸，有人告诉我们，潮来了！我们踮着脚往东望去，江面还是风平浪静，看不出有什么变化。过了一会儿，响声越来越大，只见东边水天相接的地方出现了一条白线，人群又沸腾起来。\n那条白线很快地向我们移来，逐渐拉长，变粗，横贯江面。再近些，只见白浪翻滚，形成一堵高高的水墙。浪潮越来越近，犹如千万匹白色战马齐头并进，浩浩荡荡地飞奔而来；那声音如同山崩地裂，好像大地都被震得颤动起来。\n霎时，潮头奔腾西去，可是余波还在漫天卷地般涌来，江面上依旧风号浪吼。过了好久，钱塘江才恢复了平静。",
    "config": {
      "feature": "字帖模板",
      "layout": "文章格式",
      "gridType": "田字格",
      "mode": "多字",
      "cols": 10,
      "rows": 8,
      "cellSize": 52,
      "fontSize": 40,
      "strokeMode": "适中"
    }
  },
  {
    "id": "g4-en-words",
    "name": "四年级·英语单词",
    "grade": "四年级",
    "subject": "英语",
    "type": "words",
    "icon": "📝",
    "desc": "四年级上册核心单词，四线三格规范书写",
    "text": "classroom 教室\nwindow 窗户\nblackboard 黑板\nlight 电灯\npicture 图画\ndoor 门\nteacher's desk 讲台\ncomputer 计算机\nfan 风扇\nwall 墙壁\nfloor 地板\nreally 真的\nnear 距离近\nTV 电视\nclean 打扫\nhelp 帮助\nschoolbag 书包\nmaths book 数学书\nEnglish book 英语书\nChinese book 语文书\nstorybook 故事书\ncandy 糖果\nnotebook 笔记本\ntoy 玩具",
    "config": {
      "feature": "字帖模板",
      "layout": "英文格式",
      "gridType": "四线三格",
      "mode": "多词",
      "cols": 12,
      "rows": 8,
      "cellSize": 44,
      "fontSize": 34,
      "strokeMode": "适中",
      "letterStyle": "印刷体"
    }
  },
  {
    "id": "g5-text",
    "name": "五年级·白鹭",
    "grade": "五年级",
    "subject": "语文",
    "type": "text",
    "icon": "🕊️",
    "desc": "五年级上册第 1 课，郭沫若散文精选",
    "text": "1 白鹭\n白鹭是一首精巧的诗。\n色素的配合，身段的大小，一切都很适宜。\n白鹤太大而嫌生硬，即使如粉红的朱鹭或灰色的苍鹭，也觉得大了一些，而且太不寻常了。\n然而白鹭却因为它的常见，而被人忘却了它的美。\n那雪白的蓑毛，那全身的流线型结构，那铁色的长喙，那青色的脚，增之一分则嫌长，减之一分则嫌短，素之一忽则嫌白，黛之一忽则嫌黑。\n在清水田里，时有一只两只白鹭站着钓鱼，整个的田便成了一幅嵌在玻璃框里的画。田的大小好像是有心人为白鹭设计的镜匣。\n晴天的清晨，每每看见它孤独地站立于小树的绝顶，看来像是不安稳，而它却很悠然。这是别的鸟很难表现的一种嗜好。人们说它是在望哨，可它真是在望哨吗？\n黄昏的空中偶见白鹭的低飞，更是乡居生活中的一种恩惠。那是清澄的形象化，而且具有生命了。\n或许有人会感到美中不足，白鹭不会唱歌。但是白鹭本身不就是一首很优美的歌吗？\n——不，歌未免太铿锵了。\n白鹭实在是一首诗，一首韵在骨子里的散文诗。",
    "config": {
      "feature": "字帖模板",
      "layout": "文章格式",
      "gridType": "田字格",
      "mode": "多字",
      "cols": 10,
      "rows": 8,
      "cellSize": 50,
      "fontSize": 38,
      "strokeMode": "适中"
    }
  },
  {
    "id": "g5-en-sentences",
    "name": "五年级·英语句型",
    "grade": "五年级",
    "subject": "英语",
    "type": "sentences",
    "icon": "💬",
    "desc": "五年级上册核心句型，每句一格子行",
    "text": "That is Wu Binbin.\nHe’s very clever.\nHe’s polite, too.\nThis is Amy. She’s quiet.\nShe’s very hard-working.\nIs she strict?\nWhat’s she like?\nShe’s very kind.\nYes, sometimes.\nWhat’s he like?\nIs she kind?\nWu Binbin: Do you know Mr Young?\nOliver: No, I don’t. Who is he?\nWu Binbin: He’s our music teacher.\nOliver: Is he young?\nWu Binbin: No, he isn’t. He’s old.",
    "config": {
      "feature": "字帖模板",
      "layout": "英文格式",
      "gridType": "四线三格",
      "mode": "多句",
      "cols": 10,
      "rows": 8,
      "cellSize": 46,
      "fontSize": 32,
      "strokeMode": "适中",
      "letterStyle": "印刷体"
    }
  }
];
