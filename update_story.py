import json

with open('/home/ubuntu/data2/vibe_coding/saierhao/data/story_quests.json', 'r') as f:
    data = json.load(f)

data['planets']['6']['steps'] = [
    {
      "step": 0,
      "name": "失踪的探险家",
      "description": "前往【冰晶平原】，向迷失的探险家打听冰霜星的异变。",
      "type": "npc_talk",
      "targetId": "npc_lost_explorer",
      "startDialogues": [
        {"character": "玩家", "avatar": "player", "text": "大叔，你没事吧？这里发生了什么？"},
        {"character": "迷失的探险家", "avatar": "npc_lost_explorer", "text": "阿嚏！太冷了……深处的冰封古王好像苏醒了！"},
        {"character": "迷失的探险家", "avatar": "npc_lost_explorer", "text": "去问问前方的冰霜女巫吧，她可能知道原因！"}
      ],
      "endDialogues": [],
      "rewards": {"money": 500, "exp": 200}
    },
    {
      "step": 1,
      "name": "极寒考验",
      "description": "在【寒冰洞窟】或【冰晶平原】击败3只狂暴的冰系精灵。",
      "type": "battle",
      "targetId": None,
      "targetCount": 3,
      "startDialogues": [],
      "endDialogues": [{"character": "玩家", "avatar": "player", "text": "呼，冻死我了，总算清出一条路了。"}],
      "rewards": {"money": 1000, "exp": 500}
    },
    {
      "step": 2,
      "name": "女巫的警告",
      "description": "在【寒冰洞窟】找到冰霜女巫。",
      "type": "npc_talk",
      "targetId": "npc_ice_witch",
      "startDialogues": [
        {"character": "冰霜女巫", "avatar": "npc_ice_witch", "text": "愚蠢的外来者，你们的到来惊醒了沉睡的王。"},
        {"character": "冰霜女巫", "avatar": "npc_ice_witch", "text": "想要平息他的怒火，就去永冻王座证明你的实力吧。"}
      ],
      "endDialogues": [],
      "rewards": {"money": 1000, "exp": 500}
    },
    {
      "step": 3,
      "name": "冰封古王",
      "description": "在【永冻王座】击败极光冰麟·冰帝。",
      "type": "boss_battle",
      "targetId": 74,
      "targetCount": 1,
      "startDialogues": [
        {"character": "冰封古王", "avatar": "npc_ice_king", "text": "感受绝对零度的恐惧吧！"}
      ],
      "endDialogues": [
        {"character": "冰封古王", "avatar": "npc_ice_king", "text": "你证明了你的勇气，冰霜星再次归于宁静。"}
      ],
      "rewards": {"money": 3000, "items": {"capsule_master": 1}}
    }
]

data['planets']['7']['steps'] = [
    {
      "step": 0,
      "name": "沙丘的秘密",
      "description": "向【流沙绿洲】的沙丘商人打听遗迹的情报。",
      "type": "npc_talk",
      "targetId": "npc_desert_merchant",
      "startDialogues": [
        {"character": "沙丘商人", "avatar": "npc_desert_merchant", "text": "嘿嘿，想要情报？去帮我清理掉那些烦人的巨蝎和沙蜥吧！"}
      ],
      "endDialogues": [],
      "rewards": {"money": 500, "exp": 200}
    },
    {
      "step": 1,
      "name": "驱逐沙怪",
      "description": "击败3只沙漠星精灵。",
      "type": "battle",
      "targetId": None,
      "targetCount": 3,
      "startDialogues": [],
      "endDialogues": [],
      "rewards": {"money": 1000, "exp": 500}
    },
    {
      "step": 2,
      "name": "沙漠战士",
      "description": "前往【焦岩峡谷】寻找沙漠战士。",
      "type": "npc_talk",
      "targetId": "npc_sand_warrior",
      "startDialogues": [
        {"character": "沙漠战士", "avatar": "npc_sand_warrior", "text": "遗迹的大门已经被打开，法老的守卫炎沙暴龙暴走了！"},
        {"character": "玩家", "avatar": "player", "text": "交给我吧，我会阻止它的！"}
      ],
      "endDialogues": [],
      "rewards": {"money": 1000, "exp": 500}
    },
    {
      "step": 3,
      "name": "法老的愤怒",
      "description": "在【远古遗迹】击败炎沙暴龙·沙皇。",
      "type": "boss_battle",
      "targetId": 79,
      "targetCount": 1,
      "startDialogues": [
        {"character": "沙漠法老", "avatar": "npc_sand_king", "text": "打扰法老安眠者，将被黄沙吞噬！"}
      ],
      "endDialogues": [
        {"character": "沙漠法老", "avatar": "npc_sand_king", "text": "干得好，年轻的勇士。黄沙退去了。"}
      ],
      "rewards": {"money": 3000, "items": {"capsule_master": 1}}
    }
]

data['planets']['8']['steps'] = [
    {
      "step": 0,
      "name": "迷幻花粉",
      "description": "与【梦境花园】的幻境向导对话。",
      "type": "npc_talk",
      "targetId": "npc_illusion_guide",
      "startDialogues": [
        {"character": "幻境向导", "avatar": "npc_illusion_guide", "text": "千万别吸入花粉，你会沉睡不醒的。帮我采集一些花粉样本。"}
      ],
      "endDialogues": [],
      "rewards": {"money": 500, "exp": 200}
    },
    {
      "step": 1,
      "name": "花妖之梦",
      "description": "击败3只幻梦星精灵。",
      "type": "battle",
      "targetId": None,
      "targetCount": 3,
      "startDialogues": [],
      "endDialogues": [],
      "rewards": {"money": 1000, "exp": 500}
    },
    {
      "step": 2,
      "name": "梦境仙女",
      "description": "前往【幻影迷林】寻找梦境仙女。",
      "type": "npc_talk",
      "targetId": "npc_dream_fairy",
      "startDialogues": [
        {"character": "梦境仙女", "avatar": "npc_dream_fairy", "text": "噩梦之主控制了织梦神，所有人的梦境都变成了噩梦！"}
      ],
      "endDialogues": [],
      "rewards": {"money": 1000, "exp": 500}
    },
    {
      "step": 3,
      "name": "噩梦苏醒",
      "description": "在【梦魇神殿】击破虹光梦凤·织梦神。",
      "type": "boss_battle",
      "targetId": 84,
      "targetCount": 1,
      "startDialogues": [
        {"character": "噩梦之主", "avatar": "npc_nightmare", "text": "在无尽的噩梦中沉沦吧！"}
      ],
      "endDialogues": [
        {"character": "织梦者", "avatar": "npc_dream_weaver", "text": "梦与现实恢复了平衡，谢谢你打破了噩梦。"}
      ],
      "rewards": {"money": 3000, "items": {"capsule_master": 1}}
    }
]

data['planets']['9']['steps'] = [
    {
      "step": 0,
      "name": "智械危机",
      "description": "在【废弃工厂】听取改造人叛军的求救。",
      "type": "npc_talk",
      "targetId": "npc_cyborg_rebel",
      "startDialogues": [
        {"character": "改造人叛军", "avatar": "npc_cyborg_rebel", "text": "AI 核心失控了！它们造出了一大批机器怪物，快帮忙干掉几个！"}
      ],
      "endDialogues": [],
      "rewards": {"money": 500, "exp": 200}
    },
    {
      "step": 1,
      "name": "摧毁机甲",
      "description": "击败3只机械星精灵。",
      "type": "battle",
      "targetId": None,
      "targetCount": 3,
      "startDialogues": [],
      "endDialogues": [],
      "rewards": {"money": 1000, "exp": 500}
    },
    {
      "step": 2,
      "name": "数据走廊",
      "description": "前往【数据走廊】找到机械工程师。",
      "type": "npc_talk",
      "targetId": "npc_mech_engineer",
      "startDialogues": [
        {"character": "机械工程师", "avatar": "npc_mech_engineer", "text": "超级AI接管了中央主脑，我们必须重启它的核心逻辑！"}
      ],
      "endDialogues": [],
      "rewards": {"money": 1000, "exp": 500}
    },
    {
      "step": 3,
      "name": "核心重置",
      "description": "在【中央主脑】击溃量子机神·欧米茄。",
      "type": "boss_battle",
      "targetId": 89,
      "targetCount": 1,
      "startDialogues": [
        {"character": "超级AI", "avatar": "npc_mech_overlord", "text": "警告：检测到未授权的重启尝试。启动最高防御机制。"}
      ],
      "endDialogues": [
        {"character": "超级AI", "avatar": "npc_mech_overlord", "text": "系统重置完成。和平模式已激活。"}
      ],
      "rewards": {"money": 3000, "items": {"capsule_master": 1}}
    }
]

data['planets']['10']['steps'] = [
    {
      "step": 0,
      "name": "灰烬中的低语",
      "description": "在【地壳裂缝】向灰烬精灵询问情况。",
      "type": "npc_talk",
      "targetId": "npc_fire_spirit",
      "startDialogues": [
        {"character": "灰烬精灵", "avatar": "npc_fire_spirit", "text": "深渊的封印正在崩坏……快去阻止那些狂暴的暗影生物！"}
      ],
      "endDialogues": [],
      "rewards": {"money": 500, "exp": 200}
    },
    {
      "step": 1,
      "name": "深渊阻击战",
      "description": "击退3只熔核星精灵。",
      "type": "battle",
      "targetId": None,
      "targetCount": 3,
      "startDialogues": [],
      "endDialogues": [],
      "rewards": {"money": 1000, "exp": 500}
    },
    {
      "step": 2,
      "name": "熔岩守望者",
      "description": "前往【熔岩之河】寻找熔岩守望者。",
      "type": "npc_talk",
      "targetId": "npc_lava_keeper",
      "startDialogues": [
        {"character": "熔岩守望者", "avatar": "npc_lava_keeper", "text": "深渊领主正在召唤末日冥龙，一旦它完全苏醒，整个星系都将毁灭！"}
      ],
      "endDialogues": [],
      "rewards": {"money": 1000, "exp": 500}
    },
    {
      "step": 3,
      "name": "终焉之战",
      "description": "在【深渊祭坛】击败深渊冥龙·末日。",
      "type": "boss_battle",
      "targetId": 94,
      "targetCount": 1,
      "startDialogues": [
        {"character": "深渊领主", "avatar": "npc_abyss_lord", "text": "渺小的虫子，见证真正的末日吧！"}
      ],
      "endDialogues": [
        {"character": "深渊领主", "avatar": "npc_abyss_lord", "text": "不可能……深渊的力量怎么会被打败……"}
      ],
      "rewards": {"money": 5000, "items": {"capsule_legend": 1}}
    }
]

with open('/home/ubuntu/data2/vibe_coding/saierhao/data/story_quests.json', 'w') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)
