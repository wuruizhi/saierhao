const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, '../data/story_quests.json');
const data = JSON.parse(fs.readFileSync(file, 'utf8'));

// 1. 火焰星
data.planets['1'].steps = [
  {
    "step": 0,
    "name": "智者的指引",
    "description": "前往【熔岩入口】，寻找烈焰智者，了解火山喷发的原因。",
    "type": "npc_talk",
    "targetId": "npc_elder_fire",
    "startDialogues": [
      { "character": "玩家", "avatar": "player", "text": "智者您好，船长说火山异常喷发，是不是出了什么事？" },
      { "character": "烈焰智者", "avatar": "npc_elder_fire", "text": "年轻的赛尔啊……火山深处的封印正在松动。海盗的钻探机破坏了地脉。" },
      { "character": "烈焰智者", "avatar": "npc_elder_fire", "text": "火系精灵们因此陷入了狂暴，必须先让它们冷静下来！" }
    ],
    "endDialogues": [],
    "rewards": { "money": 500, "exp": 200 }
  },
  {
    "step": 1,
    "name": "平息狂暴",
    "description": "在【熔岩入口】或【烈焰峡谷】击败3只狂暴的火系精灵。",
    "type": "battle",
    "targetId": null,
    "targetCount": 3,
    "startDialogues": [
      { "character": "玩家", "avatar": "player", "text": "看来只能用战斗让它们清醒了！" }
    ],
    "endDialogues": [
      { "character": "玩家", "avatar": "player", "text": "呼……终于让它们安静了。" }
    ],
    "rewards": { "money": 1000, "exp": 500 }
  },
  {
    "step": 2,
    "name": "迷路的矿工",
    "description": "前往【烈焰峡谷】，向迷路的矿工打听海盗钻探机的下落。",
    "type": "npc_talk",
    "targetId": "npc_miner",
    "startDialogues": [
      { "character": "玩家", "avatar": "player", "text": "你没事吧？" },
      { "character": "迷路的矿工", "avatar": "npc_miner", "text": "太可怕了！海盗抢走了我的超级钻探机，他们去了火山核心！" },
      { "character": "迷路的矿工", "avatar": "npc_miner", "text": "快去阻止他们，否则地心能量会被抽干的！" }
    ],
    "endDialogues": [],
    "rewards": { "money": 500, "exp": 200 }
  },
  {
    "step": 3,
    "name": "炎帝的认可",
    "description": "进入【火山核心】，击败焱龙帝·炎皇，获得火之印记。",
    "type": "boss_battle",
    "targetId": 21,
    "targetCount": 1,
    "startDialogues": [
      { "character": "焱龙帝·炎皇", "avatar": "boss_21", "text": "吼！贪婪的铁皮人，休想带走无尽能源！" },
      { "character": "玩家", "avatar": "player", "text": "我们是来阻止海盗的，请相信我！" },
      { "character": "焱龙帝·炎皇", "avatar": "boss_21", "text": "那就用实力来证明吧！" }
    ],
    "endDialogues": [
      { "character": "焱龙帝·炎皇", "avatar": "boss_21", "text": "海盗已被赶跑，这个【火之印记】交给你了。" },
      { "character": "玩家", "avatar": "player", "text": "谢谢你，炎帝猩！" }
    ],
    "rewards": { "money": 3000, "items": { "capsule_master": 1 } }
  }
];

// 2. 海洋星
data.planets['2'].steps = [
  {
    "step": 0,
    "name": "异样的海流",
    "description": "在【浅海沙滩】找到老水手，打听水质污染的情况。",
    "type": "npc_talk",
    "targetId": "npc_sailor",
    "startDialogues": [
      { "character": "老水手", "avatar": "npc_sailor", "text": "最近海里的水质越来越差了，鱼儿们都在发狂。" },
      { "character": "老水手", "avatar": "npc_sailor", "text": "我看到几个鬼鬼祟祟的家伙在往海里倒紫黑色的液体……你得去教训一下那些变异的精灵。" }
    ],
    "rewards": { "money": 500, "exp": 200 }
  },
  {
    "step": 1,
    "name": "拯救生命",
    "description": "在【浅海沙滩】或【珊瑚迷宫】击退3只被污染变异的水系精灵。",
    "type": "battle",
    "targetId": null,
    "targetCount": 3,
    "startDialogues": [],
    "endDialogues": [
      { "character": "玩家", "avatar": "player", "text": "精灵们恢复理智了，但污染源还在更深处。" }
    ],
    "rewards": { "money": 1000, "exp": 500 }
  },
  {
    "step": 2,
    "name": "人鱼的求救",
    "description": "潜入【珊瑚迷宫】，寻找人鱼公主。",
    "type": "npc_talk",
    "targetId": "npc_mermaid",
    "startDialogues": [
      { "character": "人鱼公主", "avatar": "npc_mermaid", "text": "海神大人被污染控制了心智！他现在就在深海遗迹！" },
      { "character": "玩家", "avatar": "player", "text": "不用担心，我一定会让他清醒过来的！" }
    ],
    "rewards": { "money": 500, "exp": 200 }
  },
  {
    "step": 3,
    "name": "海神之怒",
    "description": "抵达【深海遗迹】，击败渊鲲王·海神，获得水之印记。",
    "type": "boss_battle",
    "targetId": 24,
    "targetCount": 1,
    "startDialogues": [
      { "character": "渊鲲王·海神", "avatar": "boss_24", "text": "肮脏的入侵者，休想污染这片圣洁的海域！" }
    ],
    "endDialogues": [
      { "character": "渊鲲王·海神", "avatar": "boss_24", "text": "污染退去了...谢谢你，勇敢的赛尔。这是【水之印记】。" }
    ],
    "rewards": { "money": 3000, "items": { "capsule_master": 1 } }
  }
];

// 3. 丛林星
data.planets['3'].steps = [
  {
    "step": 0,
    "name": "丛林危机",
    "description": "前往【林间小道】，向游侠了解森林枯萎的原因。",
    "type": "npc_talk",
    "targetId": "npc_ranger",
    "startDialogues": [
      { "character": "游侠", "avatar": "npc_ranger", "text": "森林里的植物正在枯萎，海盗设立了毒气发生器。请你先去收集一些草系精灵身上的光之露珠！" }
    ],
    "rewards": { "money": 500, "exp": 200 }
  },
  {
    "step": 1,
    "name": "收集露珠",
    "description": "在丛林星击败3只草系精灵，收集光之露珠。",
    "type": "battle",
    "targetId": null,
    "targetCount": 3,
    "startDialogues": [],
    "endDialogues": [
      { "character": "玩家", "avatar": "player", "text": "露珠收集完毕！继续前进。" }
    ],
    "rewards": { "money": 1000, "exp": 500 }
  },
  {
    "step": 2,
    "name": "仙子的指引",
    "description": "进入【蘑菇森林】，找到花仙子。",
    "type": "npc_talk",
    "targetId": "npc_fairy",
    "startDialogues": [
      { "character": "花仙子", "avatar": "npc_fairy", "text": "毒气已经蔓延到这里了，咳咳……" },
      { "character": "花仙子", "avatar": "npc_fairy", "text": "多亏了你的光之露珠，我感觉好多了。毒气源头在古树之心，森灵大人有危险！" }
    ],
    "rewards": { "money": 500, "exp": 200 }
  },
  {
    "step": 3,
    "name": "森灵苏醒",
    "description": "前往【古树之心】，击败蛮荒古树·森灵，获得草之印记。",
    "type": "boss_battle",
    "targetId": 27,
    "targetCount": 1,
    "startDialogues": [
      { "character": "蛮荒古树·森灵", "avatar": "boss_27", "text": "是谁...打扰了森林的沉睡...你们也是来夺取生机的吗..." }
    ],
    "endDialogues": [
      { "character": "蛮荒古树·森灵", "avatar": "boss_27", "text": "原来是带来生机的使者...这【草之印记】属于你了。" }
    ],
    "rewards": { "money": 3000, "items": { "capsule_master": 1 } }
  }
];

// 4. 雷霆星
data.planets['4'].steps = [
  {
    "step": 0,
    "name": "磁场失控",
    "description": "在【雷鸣平原】寻找雷电工程师。",
    "type": "npc_talk",
    "targetId": "npc_engineer",
    "startDialogues": [
      { "character": "雷电工程师", "avatar": "npc_engineer", "text": "磁场完全紊乱了，我的仪器都失效了！海盗在这里建造了引雷塔！" },
      { "character": "雷电工程师", "avatar": "npc_engineer", "text": "去击败一些狂暴的电系精灵，帮我收集静电线圈来修复仪器。" }
    ],
    "rewards": { "money": 500, "exp": 200 }
  },
  {
    "step": 1,
    "name": "收集线圈",
    "description": "在雷霆星击败3只电系精灵，收集静电线圈。",
    "type": "battle",
    "targetId": null,
    "targetCount": 3,
    "startDialogues": [],
    "endDialogues": [
      { "character": "玩家", "avatar": "player", "text": "线圈收集完毕，可以继续深入了。" }
    ],
    "rewards": { "money": 1000, "exp": 500 }
  },
  {
    "step": 2,
    "name": "神殿之门",
    "description": "在【闪电峡谷】与神殿守卫对话。",
    "type": "npc_talk",
    "targetId": "npc_guard",
    "startDialogues": [
      { "character": "神殿守卫", "avatar": "npc_guard", "text": "海盗破坏了能量节点，雷帝大人发怒了！必须有人进去平息他的怒火。" },
      { "character": "玩家", "avatar": "player", "text": "交给我吧！" }
    ],
    "rewards": { "money": 500, "exp": 200 }
  },
  {
    "step": 3,
    "name": "雷帝的咆哮",
    "description": "进入【雷神殿堂】，击败天雷兽·雷帝，获得雷之印记。",
    "type": "boss_battle",
    "targetId": 30,
    "targetCount": 1,
    "startDialogues": [
      { "character": "天雷兽·雷帝", "avatar": "boss_30", "text": "雷霆...粉碎一切！！！" }
    ],
    "endDialogues": [
      { "character": "天雷兽·雷帝", "avatar": "boss_30", "text": "狂暴的雷电平息了...收下【雷之印记】吧！" }
    ],
    "rewards": { "money": 3000, "items": { "capsule_master": 1 } }
  }
];

// 5. 光暗星
data.planets['5'].steps = [
  {
    "step": 0,
    "name": "晨曦守护",
    "description": "在【晨曦之地】向光之祭司了解虚空魔神的情报。",
    "type": "npc_talk",
    "targetId": "npc_priest",
    "startDialogues": [
      { "character": "光之祭司", "avatar": "npc_priest", "text": "黑暗正在侵蚀这片晨曦，海盗首领企图释放被封印的虚空魔神！" },
      { "character": "光之祭司", "avatar": "npc_priest", "text": "快去消灭那些被黑暗控制的精灵，夺回晨星碎片！" }
    ],
    "rewards": { "money": 500, "exp": 200 }
  },
  {
    "step": 1,
    "name": "光暗交织",
    "description": "在光暗星击败3只精灵。",
    "type": "battle",
    "targetId": null,
    "targetCount": 3,
    "startDialogues": [],
    "endDialogues": [
      { "character": "玩家", "avatar": "player", "text": "碎片收集完毕，光明暂且保住了。" }
    ],
    "rewards": { "money": 1500, "exp": 1000 }
  },
  {
    "step": 2,
    "name": "深渊预言",
    "description": "在【黄昏边界】找到暗影先知。",
    "type": "npc_talk",
    "targetId": "npc_oracle",
    "startDialogues": [
      { "character": "暗影先知", "avatar": "npc_oracle", "text": "虚空魔神即将苏醒，宇宙的终结要来了……" },
      { "character": "玩家", "avatar": "player", "text": "只要还有一丝希望，我就绝不退缩！" }
    ],
    "rewards": { "money": 500, "exp": 200 }
  },
  {
    "step": 3,
    "name": "终极决战",
    "description": "深入【永夜深渊】，击败虚空魔神·混沌，拯救宇宙！",
    "type": "boss_battle",
    "targetId": 33,
    "targetCount": 1,
    "startDialogues": [
      { "character": "虚空魔神·混沌", "avatar": "boss_33", "text": "吾乃混沌...万物皆归于虚无！" }
    ],
    "endDialogues": [
      { "character": "船长罗杰", "avatar": "rogers", "text": "太棒了小赛尔！你拯救了宇宙，无尽能源的希望保住了！" }
    ],
    "rewards": { "money": 10000, "items": { "capsule_legend": 1 } }
  }
];

fs.writeFileSync(file, JSON.stringify(data, null, 2));
console.log('story_quests.json updated successfully.');
