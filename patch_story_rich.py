import json
import os

with open('/home/ubuntu/data2/vibe_coding/saierhao/data/story_quests.json', 'r', encoding='utf-8') as f:
    story = json.load(f)

# Planet 1: Flame Planet
story['planets']['1']['steps'] = [
    {
      "step": 0,
      "name": "异常的求救信号",
      "description": "赛尔号收到了一段来自火焰星的断续信号，前往【熔岩入口】寻找发信人。",
      "type": "npc_talk",
      "targetId": "npc_miner",
      "startDialogues": [
        { "character": "玩家", "avatar": "player", "text": "就是这里了……探测器显示信号源在附近。" },
        { "character": "受伤的矿工", "avatar": "npc_miner", "text": "救命……海盗……他们不是来挖矿的！" },
        { "character": "玩家", "avatar": "player", "text": "你受伤了！海盗到底在找什么？" },
        { "character": "受伤的矿工", "avatar": "npc_miner", "text": "他们在找‘火之石板’，那是封印地核能量的钥匙！快去阻止他们，周围的精灵已经被污染狂暴化了！" }
      ],
      "endDialogues": [],
      "rewards": { "money": 500, "exp": 200 }
    },
    {
      "step": 1,
      "name": "杀出重围",
      "description": "在【熔岩入口】或【烈焰峡谷】击败3只狂暴的火系精灵。",
      "type": "battle",
      "targetId": None,
      "targetCount": 3,
      "startDialogues": [],
      "endDialogues": [
        { "character": "玩家", "avatar": "player", "text": "呼……精灵们恢复理智了。必须赶快深入峡谷！" }
      ],
      "rewards": { "money": 1000, "exp": 500 }
    },
    {
      "step": 2,
      "name": "智者的秘密",
      "description": "前往【烈焰峡谷】，向烈焰智者询问‘火之石板’的下落。",
      "type": "npc_talk",
      "targetId": "npc_elder_fire",
      "startDialogues": [
        { "character": "烈焰智者", "avatar": "npc_elder_fire", "text": "年轻的赛尔，我感受到了你身上的纯粹能量。" },
        { "character": "玩家", "avatar": "player", "text": "智者，海盗正在寻找火之石板，我们必须阻止他们！" },
        { "character": "烈焰智者", "avatar": "npc_elder_fire", "text": "太迟了……他们已经用一种黑色的能量炸开了核心入口。那种黑暗气息，不像是海盗能拥有的。" },
        { "character": "烈焰智者", "avatar": "npc_elder_fire", "text": "去火山核心吧，炎皇正在独自对抗那股黑暗！" }
      ],
      "endDialogues": [],
      "rewards": { "money": 800, "exp": 300 }
    },
    {
      "step": 3,
      "name": "炎皇的决意",
      "description": "进入【火山核心】，帮助焱龙帝·炎皇击退海盗。",
      "type": "boss_battle",
      "targetId": 21,
      "targetCount": 1,
      "startDialogues": [
        { "character": "焱龙帝·炎皇", "avatar": "boss_21", "text": "咳……这股黑暗力量，竟然能侵蚀我的火焰！" },
        { "character": "玩家", "avatar": "player", "text": "炎皇！我来帮你！" },
        { "character": "焱龙帝·炎皇", "avatar": "boss_21", "text": "小心！那些被黑暗污染的火焰已经失去了控制，证明你有驾驭这烈焰的资格吧！" }
      ],
      "endDialogues": [
        { "character": "焱龙帝·炎皇", "avatar": "boss_21", "text": "你做的很好。海盗虽然逃了，但他们带走了一块石板碎片。这【火之印记】交给你，去寻找其他星球的守护者，事情远没有那么简单。" },
        { "character": "玩家", "avatar": "player", "text": "我明白了，这股黑暗力量一定还有更大的阴谋！" }
      ],
      "rewards": { "money": 3000, "items": { "capsule_master": 1 } }
    }
]

# Planet 2: Ocean Planet
story['planets']['2']['steps'] = [
    {
      "step": 0,
      "name": "黑色的海潮",
      "description": "抵达【浅海沙滩】，向老水手打听海洋星的异常。",
      "type": "npc_talk",
      "targetId": "npc_sailor",
      "startDialogues": [
        { "character": "老水手", "avatar": "npc_sailor", "text": "唉，这大海已经不是从前的大海了。昨天退潮时，海水竟然变成了深紫色！" },
        { "character": "玩家", "avatar": "player", "text": "深紫色的海水？难道和火焰星的黑暗气息有关？" },
        { "character": "老水手", "avatar": "npc_sailor", "text": "不知道，但我看到海盗把一些奇怪的装置扔进了海里。现在浅海的精灵全疯了！" }
      ],
      "endDialogues": [],
      "rewards": { "money": 500, "exp": 200 }
    },
    {
      "step": 1,
      "name": "净化水域",
      "description": "在【浅海沙滩】击败3只变异的水系精灵。",
      "type": "battle",
      "targetId": None,
      "targetCount": 3,
      "startDialogues": [],
      "endDialogues": [
        { "character": "玩家", "avatar": "player", "text": "水质污染得太严重了，必须找到海盗的装置。" }
      ],
      "rewards": { "money": 1000, "exp": 500 }
    },
    {
      "step": 2,
      "name": "人鱼的眼泪",
      "description": "潜入【珊瑚迷宫】，寻找人鱼公主了解情况。",
      "type": "npc_talk",
      "targetId": "npc_mermaid",
      "startDialogues": [
        { "character": "人鱼公主", "avatar": "npc_mermaid", "text": "呜呜呜……海神大人他……他被黑色的锁链困住了！" },
        { "character": "玩家", "avatar": "player", "text": "又是那股黑暗力量吗？海盗到底用了什么手段？" },
        { "character": "人鱼公主", "avatar": "npc_mermaid", "text": "海盗首领带来了一颗黑色的珠子，它不仅污染了水源，还在抽取海神大人的生命力！求求你救救他！" }
      ],
      "endDialogues": [],
      "rewards": { "money": 800, "exp": 300 }
    },
    {
      "step": 3,
      "name": "挣脱锁链",
      "description": "抵达【深海遗迹】，击败暴走的渊鲲王·海神！",
      "type": "boss_battle",
      "targetId": 24,
      "targetCount": 1,
      "startDialogues": [
        { "character": "渊鲲王·海神", "avatar": "boss_24", "text": "杀戮……毁灭……将一切卷入深渊……！" },
        { "character": "玩家", "avatar": "player", "text": "他完全失去理智了，只能先用战斗消耗那股黑暗能量！" }
      ],
      "endDialogues": [
        { "character": "渊鲲王·海神", "avatar": "boss_24", "text": "咳……感谢你击碎了那颗黑暗之珠。海盗自称这股力量来自‘虚空’。" },
        { "character": "渊鲲王·海神", "avatar": "boss_24", "text": "带着这枚【水之印记】去丛林星吧，那里是生命的源泉，决不能让虚空染指。" }
      ],
      "rewards": { "money": 3000, "items": { "capsule_master": 1 } }
    }
]

# Planet 3: Jungle Planet
story['planets']['3']['steps'] = [
    {
      "step": 0,
      "name": "枯萎的生命树",
      "description": "前往【林间小道】，向游侠了解森林的现状。",
      "type": "npc_talk",
      "targetId": "npc_ranger",
      "startDialogues": [
        { "character": "游侠", "avatar": "npc_ranger", "text": "你来晚了。虚空的腐化已经蔓延到了这颗星球。" },
        { "character": "玩家", "avatar": "player", "text": "海盗已经来过了吗？" },
        { "character": "游侠", "avatar": "npc_ranger", "text": "不，这次不仅仅是海盗。我看到一群浑身散发着黑气的人……他们把毒气发生器种在了生命树的根部。先去帮我收集一些光之露珠延缓枯萎吧。" }
      ],
      "endDialogues": [],
      "rewards": { "money": 500, "exp": 200 }
    },
    {
      "step": 1,
      "name": "微光希望",
      "description": "在丛林星击败3只草系精灵，收集光之露珠。",
      "type": "battle",
      "targetId": None,
      "targetCount": 3,
      "startDialogues": [],
      "endDialogues": [
        { "character": "玩家", "avatar": "player", "text": "收集够了！赶紧送去深处。" }
      ],
      "rewards": { "money": 1000, "exp": 500 }
    },
    {
      "step": 2,
      "name": "花仙子的指引",
      "description": "进入【蘑菇森林】，将露珠交给花仙子。",
      "type": "npc_talk",
      "targetId": "npc_fairy",
      "startDialogues": [
        { "character": "花仙子", "avatar": "npc_fairy", "text": "谢谢你，光之露珠能稍微净化空气。但真正的危机在古树之心。" },
        { "character": "花仙子", "avatar": "npc_fairy", "text": "森灵大人正在用全部力量对抗虚空腐化，他快撑不住了。那群黑衣人自称是‘虚空教团’！" },
        { "character": "玩家", "avatar": "player", "text": "虚空教团？海盗原来和他们勾结在了一起！我这就去古树之心！" }
      ],
      "endDialogues": [],
      "rewards": { "money": 800, "exp": 300 }
    },
    {
      "step": 3,
      "name": "古树的悲鸣",
      "description": "前往【古树之心】，唤醒蛮荒古树·森灵。",
      "type": "boss_battle",
      "targetId": 27,
      "targetCount": 1,
      "startDialogues": [
        { "character": "蛮荒古树·森灵", "avatar": "boss_27", "text": "不要过来……我……快控制不住……毁灭的冲动了……" },
        { "character": "玩家", "avatar": "player", "text": "森灵大人！坚持住，我这就帮你打散腐化！" }
      ],
      "endDialogues": [
        { "character": "蛮荒古树·森灵", "avatar": "boss_27", "text": "孩子，你身上的星辰之光非常温暖。虚空教团的目标是收集五大星球的本源，开启深渊之门。" },
        { "character": "蛮荒古树·森灵", "avatar": "boss_27", "text": "收下【草之印记】，去雷霆星警告雷帝，不要中了他们的圈套。" }
      ],
      "rewards": { "money": 3000, "items": { "capsule_master": 1 } }
    }
]

# Planet 4: Thunder Planet
story['planets']['4']['steps'] = [
    {
      "step": 0,
      "name": "引雷之塔",
      "description": "在【雷鸣平原】寻找雷电工程师。",
      "type": "npc_talk",
      "targetId": "npc_engineer",
      "startDialogues": [
        { "character": "玩家", "avatar": "player", "text": "这里的雷电怎么会如此狂暴，连天空都变成了暗红色？" },
        { "character": "雷电工程师", "avatar": "npc_engineer", "text": "虚空教团建造了‘逆源引雷塔’！他们不仅在抽取雷霆星的能量，还在向地核注入虚空物质！" },
        { "character": "雷电工程师", "avatar": "npc_engineer", "text": "我的仪器都烧毁了，你能帮我收集静电线圈，重启雷达吗？" }
      ],
      "endDialogues": [],
      "rewards": { "money": 500, "exp": 200 }
    },
    {
      "step": 1,
      "name": "重启雷达",
      "description": "在雷霆星击败3只电系精灵，收集静电线圈。",
      "type": "battle",
      "targetId": None,
      "targetCount": 3,
      "startDialogues": [],
      "endDialogues": [
        { "character": "玩家", "avatar": "player", "text": "线圈拿到了，工程师说教团的核心在闪电峡谷。" }
      ],
      "rewards": { "money": 1000, "exp": 500 }
    },
    {
      "step": 2,
      "name": "守卫的陨落",
      "description": "在【闪电峡谷】寻找神殿守卫。",
      "type": "npc_talk",
      "targetId": "npc_guard",
      "startDialogues": [
        { "character": "神殿守卫", "avatar": "npc_guard", "text": "咳咳……你来晚了……雷帝大人他……" },
        { "character": "玩家", "avatar": "player", "text": "发生了什么？" },
        { "character": "神殿守卫", "avatar": "npc_guard", "text": "虚空使者用诡计刺伤了雷帝，并将虚空之刃留在了他的体内。雷帝大人为了不波及整颗星球，把自己封锁在了殿堂里……" }
      ],
      "endDialogues": [],
      "rewards": { "money": 800, "exp": 300 }
    },
    {
      "step": 3,
      "name": "拔出虚空之刃",
      "description": "进入【雷神殿堂】，击败天雷兽·雷帝！",
      "type": "boss_battle",
      "targetId": 30,
      "targetCount": 1,
      "startDialogues": [
        { "character": "天雷兽·雷帝", "avatar": "boss_30", "text": "退后！雷霆……将无差别地粉碎一切！！！" },
        { "character": "玩家", "avatar": "player", "text": "得想办法在战斗中拔出他背上的那把黑色短刃！" }
      ],
      "endDialogues": [
        { "character": "天雷兽·雷帝", "avatar": "boss_30", "text": "狂暴的雷电终于平息了……虚空教团已经集齐了五大本源之四。他们去了光暗星！" },
        { "character": "玩家", "avatar": "player", "text": "光暗星？传说中封印着最终魔神的地方？" },
        { "character": "天雷兽·雷帝", "avatar": "boss_30", "text": "没错，带上【雷之印记】，决战的时刻到了！" }
      ],
      "rewards": { "money": 3000, "items": { "capsule_master": 1 } }
    }
]

# Planet 5: Light/Dark Planet
story['planets']['5']['steps'] = [
    {
      "step": 0,
      "name": "晨曦的黄昏",
      "description": "在【晨曦之地】向光之祭司了解最终的危机。",
      "type": "npc_talk",
      "targetId": "npc_priest",
      "startDialogues": [
        { "character": "光之祭司", "avatar": "npc_priest", "text": "你终于来了，命运的破局者。光与暗的平衡已经被彻底打破了。" },
        { "character": "玩家", "avatar": "player", "text": "虚空教团的人在哪里？" },
        { "character": "光之祭司", "avatar": "npc_priest", "text": "他们正在用前四个星球的本源，献祭给永夜深渊，企图唤醒虚空魔神！你必须先清理外围的虚空衍生物！" }
      ],
      "endDialogues": [],
      "rewards": { "money": 500, "exp": 200 }
    },
    {
      "step": 1,
      "name": "撕裂黑暗",
      "description": "在光暗星击败3只虚空衍生物（精灵）。",
      "type": "battle",
      "targetId": None,
      "targetCount": 3,
      "startDialogues": [],
      "endDialogues": [
        { "character": "玩家", "avatar": "player", "text": "这些怪物太难缠了。得赶紧去黄昏边界！" }
      ],
      "rewards": { "money": 1500, "exp": 1000 }
    },
    {
      "step": 2,
      "name": "先知的赌注",
      "description": "在【黄昏边界】找到暗影先知。",
      "type": "npc_talk",
      "targetId": "npc_oracle",
      "startDialogues": [
        { "character": "暗影先知", "avatar": "npc_oracle", "text": "预言中的毁灭已经降临，虚空魔神已经睁开了它的眼睛……" },
        { "character": "玩家", "avatar": "player", "text": "哪怕只有万分之一的机会，我也要把它的眼睛闭上！" },
        { "character": "暗影先知", "avatar": "npc_oracle", "text": "呵呵，勇敢的灵魂。四枚印记在你的胸前共鸣，去吧，深渊就在前方！" }
      ],
      "endDialogues": [],
      "rewards": { "money": 800, "exp": 300 }
    },
    {
      "step": 3,
      "name": "虚空降临",
      "description": "深入【永夜深渊】，决战虚空魔神·混沌！",
      "type": "boss_battle",
      "targetId": 33,
      "targetCount": 1,
      "startDialogues": [
        { "character": "虚空教团首领", "avatar": "npc_oracle", "text": "来不及了，卑微的蝼蚁！伟大的混沌已经降临！" },
        { "character": "虚空魔神·混沌", "avatar": "boss_33", "text": "吾乃混沌……万物皆归于虚无！" },
        { "character": "玩家", "avatar": "player", "text": "只要星辰之光不灭，宇宙就不会终结！看招！" }
      ],
      "endDialogues": [
        { "character": "虚空魔神·混沌", "avatar": "boss_33", "text": "这股光芒……居然……" },
        { "character": "船长罗杰", "avatar": "rogers", "text": "（通讯器）太棒了小赛尔！监测显示虚空能量正在坍缩，你拯救了整个星系！" },
        { "character": "玩家", "avatar": "player", "text": "船长，虚空教团的首领逃走了，这场战斗恐怕只是个开始……" }
      ],
      "rewards": { "money": 10000, "items": { "capsule_legend": 1 } }
    }
]

with open('/home/ubuntu/data2/vibe_coding/saierhao/data/story_quests.json', 'w', encoding='utf-8') as f:
    json.dump(story, f, ensure_ascii=False, indent=2)

print("Rich story patched for Planets 1-5!")
