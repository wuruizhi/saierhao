import json
import os

with open('/home/ubuntu/data2/vibe_coding/saierhao/data/story_quests.json', 'r', encoding='utf-8') as f:
    story = json.load(f)

# Planet 6: Ice Planet
story['planets']['6']['steps'] = [
    {
      "step": 0,
      "name": "极寒的追踪",
      "description": "赛尔号追踪虚空教团的残党来到了冰霜星。在【冰晶平原】向迷失的探险家打听线索。",
      "type": "npc_talk",
      "targetId": "npc_lost_explorer",
      "startDialogues": [
        { "character": "玩家", "avatar": "player", "text": "大叔，你有没有看到一群穿着黑长袍的人经过这里？" },
        { "character": "迷失的探险家", "avatar": "npc_lost_explorer", "text": "阿嚏！黑长袍……我看到了，他们往冰封深处去了！" },
        { "character": "迷失的探险家", "avatar": "npc_lost_explorer", "text": "他们还用某种邪恶的法术激怒了原本温顺的冰霜精灵，现在到处都很危险！" }
      ],
      "endDialogues": [],
      "rewards": { "money": 500, "exp": 200 }
    },
    {
      "step": 1,
      "name": "极寒考验",
      "description": "在【寒冰洞窟】或【冰晶平原】击败3只狂暴的冰系精灵。",
      "type": "battle",
      "targetId": None,
      "targetCount": 3,
      "startDialogues": [],
      "endDialogues": [
        { "character": "玩家", "avatar": "player", "text": "呼，冻死我了，必须尽快找到冰霜女巫问清楚。" }
      ],
      "rewards": { "money": 1000, "exp": 500 }
    },
    {
      "step": 2,
      "name": "女巫的警告",
      "description": "在【寒冰洞窟】找到冰霜女巫。",
      "type": "npc_talk",
      "targetId": "npc_ice_witch",
      "startDialogues": [
        { "character": "冰霜女巫", "avatar": "npc_ice_witch", "text": "你身上有四大星系守护者的印记……看来你就是那个打破了混沌的赛尔。" },
        { "character": "玩家", "avatar": "player", "text": "女巫，虚空教团想在阿瑞斯星系（Ares Galaxy）做什么？" },
        { "character": "冰霜女巫", "avatar": "npc_ice_witch", "text": "他们妄图染指沉睡在此的‘远古封神’的力量。冰封古王已经被他们施加了梦魇的咒语，快去永冻王座！" }
      ],
      "endDialogues": [],
      "rewards": { "money": 1000, "exp": 500 }
    },
    {
      "step": 3,
      "name": "唤醒冰帝",
      "description": "在【永冻王座】击败极光冰麟·冰帝，解除梦魇！",
      "type": "boss_battle",
      "targetId": 74,
      "targetCount": 1,
      "startDialogues": [
        { "character": "冰封古王", "avatar": "npc_ice_king", "text": "（双眼赤红）滚出我的王座！感受绝对零度的恐惧吧！" },
        { "character": "玩家", "avatar": "player", "text": "古王！快醒醒，不要被虚空蛊惑！" }
      ],
      "endDialogues": [
        { "character": "冰封古王", "avatar": "npc_ice_king", "text": "梦魇……消散了……虚空教团夺走了一片‘凛冬碎片’，那是阿瑞斯星系的钥匙之一。" },
        { "character": "玩家", "avatar": "player", "text": "我一定会阻止他们集齐钥匙的！" }
      ],
      "rewards": { "money": 3000, "items": { "capsule_master": 1 } }
    }
]

# Planet 7: Desert Planet
story['planets']['7']['steps'] = [
    {
      "step": 0,
      "name": "流沙的阴谋",
      "description": "向【流沙绿洲】的沙丘商人打听遗迹的情报。",
      "type": "npc_talk",
      "targetId": "npc_desert_merchant",
      "startDialogues": [
        { "character": "沙丘商人", "avatar": "npc_desert_merchant", "text": "嘿嘿，想要虚空教团的情报？没问题，但你得先帮我清理掉那些暴走的巨蝎！" },
        { "character": "玩家", "avatar": "player", "text": "又是暴走……看来他们已经来过了。" }
      ],
      "endDialogues": [],
      "rewards": { "money": 500, "exp": 200 }
    },
    {
      "step": 1,
      "name": "驱逐沙怪",
      "description": "击败3只沙漠星精灵。",
      "type": "battle",
      "targetId": None,
      "targetCount": 3,
      "startDialogues": [],
      "endDialogues": [
        { "character": "玩家", "avatar": "player", "text": "怪物清理完毕，快告诉我情报！" }
      ],
      "rewards": { "money": 1000, "exp": 500 }
    },
    {
      "step": 2,
      "name": "焦岩的守卫",
      "description": "前往【焦岩峡谷】寻找沙漠战士。",
      "type": "npc_talk",
      "targetId": "npc_sand_warrior",
      "startDialogues": [
        { "character": "沙漠战士", "avatar": "npc_sand_warrior", "text": "远古遗迹的大门被炸开了！法老的守卫炎沙暴龙在狂暴中攻击了一切活物！" },
        { "character": "玩家", "avatar": "player", "text": "肯定是虚空教团干的！我这就去阻止它！" },
        { "character": "沙漠战士", "avatar": "npc_sand_warrior", "text": "千万小心，它的沙暴能撕碎钢铁！" }
      ],
      "endDialogues": [],
      "rewards": { "money": 1000, "exp": 500 }
    },
    {
      "step": 3,
      "name": "法老的愤怒",
      "description": "在【远古遗迹】击败炎沙暴龙·沙皇，夺回遗迹的控制权。",
      "type": "boss_battle",
      "targetId": 79,
      "targetCount": 1,
      "startDialogues": [
        { "character": "沙漠法老", "avatar": "npc_sand_king", "text": "打扰法老安眠者，将被黄沙吞噬！你们这些黑暗的走狗！" },
        { "character": "玩家", "avatar": "player", "text": "等等，我不是虚空教团的人！" }
      ],
      "endDialogues": [
        { "character": "沙漠法老", "avatar": "npc_sand_king", "text": "原来如此……他们抢走了‘赤沙之瞳’。那群恶徒去了幻梦星，试图控制织梦者的力量。" },
        { "character": "玩家", "avatar": "player", "text": "我立刻追过去！" }
      ],
      "rewards": { "money": 3000, "items": { "capsule_master": 1 } }
    }
]

# Planet 8: Dream Planet
story['planets']['8']['steps'] = [
    {
      "step": 0,
      "name": "扭曲的梦境",
      "description": "与【梦境花园】的幻境向导对话。",
      "type": "npc_talk",
      "targetId": "npc_illusion_guide",
      "startDialogues": [
        { "character": "幻境向导", "avatar": "npc_illusion_guide", "text": "嘘……不要大声说话。这里的花粉被虚空能量污染了，一旦吸入就会陷入永远的噩梦。" },
        { "character": "玩家", "avatar": "player", "text": "难怪周围的精灵看起来都像在梦游一样攻击人。" },
        { "character": "幻境向导", "avatar": "npc_illusion_guide", "text": "帮我采集一些未被完全污染的花粉样本，也许我能制作出解药。" }
      ],
      "endDialogues": [],
      "rewards": { "money": 500, "exp": 200 }
    },
    {
      "step": 1,
      "name": "梦游的精灵",
      "description": "击败3只幻梦星精灵，收集花粉。",
      "type": "battle",
      "targetId": None,
      "targetCount": 3,
      "startDialogues": [],
      "endDialogues": [
        { "character": "玩家", "avatar": "player", "text": "花粉收集完毕，希望能管用。" }
      ],
      "rewards": { "money": 1000, "exp": 500 }
    },
    {
      "step": 2,
      "name": "噩梦的源头",
      "description": "前往【幻影迷林】寻找梦境仙女。",
      "type": "npc_talk",
      "targetId": "npc_dream_fairy",
      "startDialogues": [
        { "character": "梦境仙女", "avatar": "npc_dream_fairy", "text": "太可怕了……虚空教团唤醒了‘噩梦之主’，它占据了织梦神的身体！" },
        { "character": "玩家", "avatar": "player", "text": "他们是想把整个阿瑞斯星系拖入噩梦之中吗？" },
        { "character": "梦境仙女", "avatar": "npc_dream_fairy", "text": "是的，如果不打破梦魇神殿的结界，一切就完了！" }
      ],
      "endDialogues": [],
      "rewards": { "money": 1000, "exp": 500 }
    },
    {
      "step": 3,
      "name": "粉碎噩梦",
      "description": "在【梦魇神殿】击破虹光梦凤·织梦神。",
      "type": "boss_battle",
      "targetId": 84,
      "targetCount": 1,
      "startDialogues": [
        { "character": "噩梦之主", "avatar": "npc_nightmare", "text": "欢迎来到……无尽的虚空之梦！在这里，你将体会到最深沉的绝望！" },
        { "character": "玩家", "avatar": "player", "text": "就算是在梦里，我也能把你打得落花流水！" }
      ],
      "endDialogues": [
        { "character": "织梦者", "avatar": "npc_dream_weaver", "text": "噩梦……终于退散了。虚空教团不仅抢走了‘梦之羽’，还留下了一个坐标……" },
        { "character": "织梦者", "avatar": "npc_dream_weaver", "text": "他们准备前往机械星和魔界星，完成最后两把钥匙的收集！" }
      ],
      "rewards": { "money": 3000, "items": { "capsule_master": 1 } }
    }
]

# Planet 9: Machine Planet
story['planets']['9']['steps'] = [
    {
      "step": 0,
      "name": "生锈的齿轮",
      "description": "在【废弃工厂】询问流浪机械师。",
      "type": "npc_talk",
      "targetId": "npc_mechanic",
      "startDialogues": [
        { "character": "流浪机械师", "avatar": "npc_mechanic", "text": "滴滴……系统错误……虚空病毒已感染中央处理器……" },
        { "character": "玩家", "avatar": "player", "text": "是赛博格病毒！虚空教团竟然连机械精灵都能控制！" },
        { "character": "流浪机械师", "avatar": "npc_mechanic", "text": "请消灭周边被感染的机械卫兵，否则病毒会通过网络传遍全宇宙！" }
      ],
      "endDialogues": [],
      "rewards": { "money": 500, "exp": 200 }
    },
    {
      "step": 1,
      "name": "杀毒程序",
      "description": "击退3只失控的机械星精灵。",
      "type": "battle",
      "targetId": None,
      "targetCount": 3,
      "startDialogues": [],
      "endDialogues": [
        { "character": "玩家", "avatar": "player", "text": "周围的机器暂时安全了，必须切断网络核心。" }
      ],
      "rewards": { "money": 1000, "exp": 500 }
    },
    {
      "step": 2,
      "name": "超频危机",
      "description": "在【合金要塞】寻找抵抗军首领。",
      "type": "npc_talk",
      "targetId": "npc_rebel_leader",
      "startDialogues": [
        { "character": "抵抗军首领", "avatar": "npc_rebel_leader", "text": "你终于来了！虚空教团把病毒直接注入了钢铁战龙的核心！" },
        { "character": "玩家", "avatar": "player", "text": "钢铁战龙？那是机械星的守护神啊！" },
        { "character": "抵抗军首领", "avatar": "npc_rebel_leader", "text": "如果它进入超频自爆程序，整个机械星都会被炸平！快去中枢神殿阻止它！" }
      ],
      "endDialogues": [],
      "rewards": { "money": 1000, "exp": 500 }
    },
    {
      "step": 3,
      "name": "代码重置",
      "description": "在【中枢神殿】击破合金战神·钢龙，强制重启其核心！",
      "type": "boss_battle",
      "targetId": 89,
      "targetCount": 1,
      "startDialogues": [
        { "character": "合金战神·钢龙", "avatar": "boss_89", "text": "警告：正在执行虚空指令。歼灭模式已启动。" },
        { "character": "玩家", "avatar": "player", "text": "强制关机键在哪？只能硬来了！" }
      ],
      "endDialogues": [
        { "character": "合金战神·钢龙", "avatar": "boss_89", "text": "系统重启完成……病毒已清除。谢谢你，赛尔。" },
        { "character": "合金战神·钢龙", "avatar": "boss_89", "text": "他们夺走了‘机械核心’。加上前三把钥匙，他们只差最后一步了……魔界星！" }
      ],
      "rewards": { "money": 3000, "items": { "capsule_master": 1 } }
    }
]

# Planet 10: Demon Planet
story['planets']['10']['steps'] = [
    {
      "step": 0,
      "name": "魔界的异动",
      "description": "在【幽暗冥府】向魔界守门人打探消息。",
      "type": "npc_talk",
      "targetId": "npc_gatekeeper",
      "startDialogues": [
        { "character": "魔界守门人", "avatar": "npc_gatekeeper", "text": "生者不该踏入此地……但这股比魔界更邪恶的虚空气息，已经先你一步进去了。" },
        { "character": "玩家", "avatar": "player", "text": "他们想要干什么？" },
        { "character": "魔界守门人", "avatar": "npc_gatekeeper", "text": "复活‘炼狱魔王’！他们想将魔王作为容器，容纳阿瑞斯星系的最终神力！去证明你的实力，我才能放你通行。" }
      ],
      "endDialogues": [],
      "rewards": { "money": 500, "exp": 200 }
    },
    {
      "step": 1,
      "name": "冥府试炼",
      "description": "在魔界星击败3只恶魔精灵。",
      "type": "battle",
      "targetId": None,
      "targetCount": 3,
      "startDialogues": [],
      "endDialogues": [
        { "character": "玩家", "avatar": "player", "text": "考验通过了！赶快去炼狱深渊！" }
      ],
      "rewards": { "money": 1000, "exp": 500 }
    },
    {
      "step": 2,
      "name": "深渊的祭典",
      "description": "在【猩红血池】找到暗夜游侠。",
      "type": "npc_talk",
      "targetId": "npc_dark_ranger",
      "startDialogues": [
        { "character": "暗夜游侠", "avatar": "npc_dark_ranger", "text": "太晚了，他们已经把四把钥匙插入了祭坛。炼狱魔王已经苏醒了！" },
        { "character": "玩家", "avatar": "player", "text": "就算苏醒了，我也要把它再打回去！" },
        { "character": "暗夜游侠", "avatar": "npc_dark_ranger", "text": "带着我的暗影护符去吧，它能保护你不受虚空烈焰的灼烧。" }
      ],
      "endDialogues": [],
      "rewards": { "money": 1000, "exp": 500 }
    },
    {
      "step": 3,
      "name": "魔王陨落",
      "description": "在【炼狱深渊】击败深渊恐惧·魔王！",
      "type": "boss_battle",
      "targetId": 94,
      "targetCount": 1,
      "startDialogues": [
        { "character": "深渊恐惧·魔王", "avatar": "boss_94", "text": "哈哈哈！阿瑞斯的远古神力，如今已在我体内沸腾！" },
        { "character": "玩家", "avatar": "player", "text": "借来的力量，终究不属于你！" }
      ],
      "endDialogues": [
        { "character": "深渊恐惧·魔王", "avatar": "boss_94", "text": "不……这不可能！这股力量……正在撕裂我！" },
        { "character": "船长罗杰", "avatar": "rogers", "text": "（通讯器）做的好！阿瑞斯星系的危机解除了！虚空教团的计划再次破产。" },
        { "character": "玩家", "avatar": "player", "text": "船长，但我有种不好的预感，他们可能还有后手……雅典娜星系！" }
      ],
      "rewards": { "money": 10000, "items": { "capsule_legend": 1 } }
    }
]

with open('/home/ubuntu/data2/vibe_coding/saierhao/data/story_quests.json', 'w', encoding='utf-8') as f:
    json.dump(story, f, ensure_ascii=False, indent=2)

print("Rich story patched for Planets 6-10!")
