import json
import os

with open('/home/ubuntu/data2/vibe_coding/saierhao/data/story_quests.json', 'r', encoding='utf-8') as f:
    story = json.load(f)

# Planet 11: Stardust Abyss (Dark)
story['planets']['11']['steps'] = [
    {
      "step": 0,
      "name": "星尘的异响",
      "description": "赛尔号追寻虚空能量的残骸来到了雅典娜星系。前往【星屑回廊】调查异响。",
      "type": "npc_talk",
      "targetId": "npc_stardust_observer",
      "startDialogues": [
        { "character": "星尘观测者", "avatar": "npc_stardust_observer", "text": "不好，雅典娜星系的屏障被打破了！虚空教团在这里释放了真正的虚空行者！" },
        { "character": "玩家", "avatar": "player", "text": "真正的虚空？我们之前打败的那些是什么？" },
        { "character": "星尘观测者", "avatar": "npc_stardust_observer", "text": "那些只是被污染的幻影，而这次，他们要从陨石群中打通连接虚无的通道！快去收集星尘碎片修补裂缝！" }
      ],
      "endDialogues": [],
      "rewards": { "money": 500, "exp": 200 }
    },
    {
      "step": 1,
      "name": "收集星尘",
      "description": "在【星屑回廊】击败3只星尘浮游，收集星尘碎片。",
      "type": "battle",
      "targetId": None,
      "targetCount": 3,
      "startDialogues": [],
      "endDialogues": [
        { "character": "玩家", "avatar": "player", "text": "碎片收集完毕！但裂缝好像还在扩大！" }
      ],
      "rewards": { "money": 1000, "exp": 500 }
    },
    {
      "step": 2,
      "name": "虚空行者",
      "description": "前往【陨石荒原】，找到虚空裂缝！",
      "type": "npc_talk",
      "targetId": "npc_void_scout",
      "startDialogues": [
        { "character": "虚空斥候", "avatar": "npc_void_scout", "text": "愚蠢的赛尔，虚无的黑洞已经成型。你们的光明，终将被黑暗吞没！" },
        { "character": "玩家", "avatar": "player", "text": "我绝不会让你们得逞！" }
      ],
      "endDialogues": [],
      "rewards": { "money": 1000, "exp": 500 }
    },
    {
      "step": 3,
      "name": "黑洞崩塌",
      "description": "在【虚空裂口】击败噬星魔·虚空行者，阻止黑洞成型！",
      "type": "boss_battle",
      "targetId": 99,
      "targetCount": 1,
      "startDialogues": [
        { "character": "噬星魔·虚空行者", "avatar": "boss_99", "text": "吾乃黑洞的意志……感受重力的撕裂吧！" }
      ],
      "endDialogues": [
        { "character": "噬星魔·虚空行者", "avatar": "boss_99", "text": "我的身体……居然在崩坏……这不可能……" },
        { "character": "玩家", "avatar": "player", "text": "裂缝关闭了。但是虚空能量好像流向了旁边的棱镜星球！" }
      ],
      "rewards": { "money": 3000, "items": { "capsule_master": 1 } }
    }
]

# Planet 12: Prism Planet (Light)
story['planets']['12']['steps'] = [
    {
      "step": 0,
      "name": "折射的黑暗",
      "description": "前往【晶辉大殿】询问光之贤者。",
      "type": "npc_talk",
      "targetId": "npc_light_sage",
      "startDialogues": [
        { "character": "光之贤者", "avatar": "npc_light_sage", "text": "这里是纯粹的光之世界，但虚空能量侵入后，所有的棱镜都在折射出狂暴的光芒。" },
        { "character": "玩家", "avatar": "player", "text": "难道光也会被污染吗？" },
        { "character": "光之贤者", "avatar": "npc_light_sage", "text": "光若过于炽烈，便会化为审判的烈焰。去清理一下周围暴走的晶棱角，让光线柔和下来！" }
      ],
      "endDialogues": [],
      "rewards": { "money": 500, "exp": 200 }
    },
    {
      "step": 1,
      "name": "柔和之光",
      "description": "击败3只晶棱角，平息暴走的光芒。",
      "type": "battle",
      "targetId": None,
      "targetCount": 3,
      "startDialogues": [],
      "endDialogues": [
        { "character": "玩家", "avatar": "player", "text": "这里的光线没那么刺眼了。我们继续前进！" }
      ],
      "rewards": { "money": 1000, "exp": 500 }
    },
    {
      "step": 2,
      "name": "大天使的陨落",
      "description": "前往【耀光矩阵】寻找大天使的下落。",
      "type": "npc_talk",
      "targetId": "npc_angel_guard",
      "startDialogues": [
        { "character": "天使近卫", "avatar": "npc_angel_guard", "text": "糟了！光辉大天使被虚空能量直接命中，现在他认为所有的外来者都是‘杂质’，正在执行无差别的审判！" },
        { "character": "玩家", "avatar": "player", "text": "看来只能用武力让他清醒一下了！" }
      ],
      "endDialogues": [],
      "rewards": { "money": 1000, "exp": 500 }
    },
    {
      "step": 3,
      "name": "光之审判",
      "description": "在【至高圣坛】击破神圣裁决·大天使！",
      "type": "boss_battle",
      "targetId": 104,
      "targetCount": 1,
      "startDialogues": [
        { "character": "神圣裁决·大天使", "avatar": "boss_104", "text": "杂质！污秽！接受这净世的审判吧！" },
        { "character": "玩家", "avatar": "player", "text": "你的光已经偏执了，醒醒吧！" }
      ],
      "endDialogues": [
        { "character": "神圣裁决·大天使", "avatar": "boss_104", "text": "呼……多谢你，赛尔。偏执的光比黑暗更可怕。" },
        { "character": "神圣裁决·大天使", "avatar": "boss_104", "text": "但虚空教团趁乱偷走了‘纯白之钥’，他们一定是去腐坏沼泽找‘疫病之源’了！" }
      ],
      "rewards": { "money": 3000, "items": { "capsule_master": 1 } }
    }
]

# Planet 13: Miasma Planet (Water/Poison)
story['planets']['13']['steps'] = [
    {
      "step": 0,
      "name": "致命毒瘴",
      "description": "在【毒雾边境】询问防化兵。",
      "type": "npc_talk",
      "targetId": "npc_hazmat",
      "startDialogues": [
        { "character": "防化兵", "avatar": "npc_hazmat", "text": "咳咳……你居然没戴防毒面具！这里的毒瘴浓度已经爆表了！" },
        { "character": "玩家", "avatar": "player", "text": "我在寻找虚空教团的踪迹！" },
        { "character": "防化兵", "avatar": "npc_hazmat", "text": "他们刚往腐坏沼泽深处去了！顺便帮我清理几只挡路的污泥怪吧！" }
      ],
      "endDialogues": [],
      "rewards": { "money": 500, "exp": 200 }
    },
    {
      "step": 1,
      "name": "清理道路",
      "description": "在腐坏沼泽击退3只污泥怪。",
      "type": "battle",
      "targetId": None,
      "targetCount": 3,
      "startDialogues": [],
      "endDialogues": [
        { "character": "玩家", "avatar": "player", "text": "好了，道路通畅了。沼泽中心有什么东西在蠕动！" }
      ],
      "rewards": { "money": 1000, "exp": 500 }
    },
    {
      "step": 2,
      "name": "瘟疫之主",
      "description": "在【剧毒泥潭】追踪虚空教团。",
      "type": "npc_talk",
      "targetId": "npc_void_mage",
      "startDialogues": [
        { "character": "虚空法师", "avatar": "npc_void_mage", "text": "呵呵，太迟了。古老的‘疫病之源’已经吸收了纯白之钥，变成了终极的瘟疫炸弹！" },
        { "character": "玩家", "avatar": "player", "text": "一旦炸弹爆炸，整个雅典娜星系都会变成毒沼的！" }
      ],
      "endDialogues": [],
      "rewards": { "money": 1000, "exp": 500 }
    },
    {
      "step": 3,
      "name": "毒源净化",
      "description": "在【万毒之渊】击败万毒之主·瘟疫，拆除瘟疫炸弹！",
      "type": "boss_battle",
      "targetId": 109,
      "targetCount": 1,
      "startDialogues": [
        { "character": "万毒之主·瘟疫", "avatar": "boss_109", "text": "咕噜咕噜……拥抱这甜美的瘟疫吧……" }
      ],
      "endDialogues": [
        { "character": "万毒之主·瘟疫", "avatar": "boss_109", "text": "咳咳……毒液……消散了……" },
        { "character": "玩家", "avatar": "player", "text": "成功拆除！等等，为什么远处的幻音星传来了悲鸣？" }
      ],
      "rewards": { "money": 3000, "items": { "capsule_master": 1 } }
    }
]

# Planet 14: Phantom Sound (Normal/Sound)
story['planets']['14']['steps'] = [
    {
      "step": 0,
      "name": "悲伤的安魂曲",
      "description": "前往【回音山谷】，向音符精灵了解情况。",
      "type": "npc_talk",
      "targetId": "npc_music_sprite",
      "startDialogues": [
        { "character": "音符精灵", "avatar": "npc_music_sprite", "text": "（哭泣）嘘……你听，风中的安魂曲。太悲伤了，大家都在哭泣。" },
        { "character": "玩家", "avatar": "player", "text": "这歌声确实让人感到无比绝望。是谁在唱歌？" },
        { "character": "音符精灵", "avatar": "npc_music_sprite", "text": "是‘夜莺’……虚空教团夺走了她的希望之歌，换成了绝望和声！请帮我们平复一下情绪吧。" }
      ],
      "endDialogues": [],
      "rewards": { "money": 500, "exp": 200 }
    },
    {
      "step": 1,
      "name": "安抚音符",
      "description": "与3只音符精灵交手，平复它们悲伤的情绪。",
      "type": "battle",
      "targetId": None,
      "targetCount": 3,
      "startDialogues": [],
      "endDialogues": [
        { "character": "玩家", "avatar": "player", "text": "大家都冷静下来了。我们去找夜莺吧！" }
      ],
      "rewards": { "money": 1000, "exp": 500 }
    },
    {
      "step": 2,
      "name": "绝望之歌",
      "description": "在【寂静舞台】找到夜莺的指挥者。",
      "type": "npc_talk",
      "targetId": "npc_void_conductor",
      "startDialogues": [
        { "character": "虚空指挥家", "avatar": "npc_void_conductor", "text": "多美的旋律啊，这就是宇宙临终前的挽歌！" },
        { "character": "玩家", "avatar": "player", "text": "快停下你的指挥！夜莺在痛苦地挣扎！" },
        { "character": "虚空指挥家", "avatar": "npc_void_conductor", "text": "她已经完全沉浸在绝望中了，没有人能唤醒她！" }
      ],
      "endDialogues": [],
      "rewards": { "money": 1000, "exp": 500 }
    },
    {
      "step": 3,
      "name": "唤醒希望",
      "description": "在【绝望音乐厅】击败绝望歌姬·夜莺，用战斗唤醒她！",
      "type": "boss_battle",
      "targetId": 114,
      "targetCount": 1,
      "startDialogues": [
        { "character": "绝望歌姬·夜莺", "avatar": "boss_114", "text": "在这个没有回音的宇宙里……我的歌声……你听得到吗？" },
        { "character": "玩家", "avatar": "player", "text": "我听到了！这不是你真正的声音！" }
      ],
      "endDialogues": [
        { "character": "绝望歌姬·夜莺", "avatar": "boss_114", "text": "谢谢你……我终于听到了充满希望的和弦……" },
        { "character": "绝望歌姬·夜莺", "avatar": "boss_114", "text": "虚空教团的首领收集了所有的绝望，前往了时间的尽头——时空裂隙！" }
      ],
      "rewards": { "money": 3000, "items": { "capsule_master": 1 } }
    }
]

# Planet 15: Rift of Time (Electric/Time)
story['planets']['15']['steps'] = [
    {
      "step": 0,
      "name": "停滞的沙漏",
      "description": "前往【时之沙暴】，找到时间守护者。",
      "type": "npc_talk",
      "targetId": "npc_time_keeper",
      "startDialogues": [
        { "character": "时间守护者", "avatar": "npc_time_keeper", "text": "指针不动了！时间的齿轮卡壳了！虚空教团想把宇宙的时间定格在毁灭的那一刻！" },
        { "character": "玩家", "avatar": "player", "text": "我们该怎么做？" },
        { "character": "时间守护者", "avatar": "npc_time_keeper", "text": "快帮我制止那些到处乱窜的发条鼠，它们偷走了重置时间的齿轮！" }
      ],
      "endDialogues": [],
      "rewards": { "money": 500, "exp": 200 }
    },
    {
      "step": 1,
      "name": "找回齿轮",
      "description": "击败3只发条鼠，收集散落的齿轮。",
      "type": "battle",
      "targetId": None,
      "targetCount": 3,
      "startDialogues": [],
      "endDialogues": [
        { "character": "玩家", "avatar": "player", "text": "齿轮找齐了！快去修复时间引擎！" }
      ],
      "rewards": { "money": 1000, "exp": 500 }
    },
    {
      "step": 2,
      "name": "最后的阻碍",
      "description": "在【无限回廊】遇到虚空教团最终首领！",
      "type": "npc_talk",
      "targetId": "npc_void_boss",
      "startDialogues": [
        { "character": "虚空教团首领", "avatar": "npc_void_boss", "text": "真是顽强的生命啊……从第一星系追到了这里。" },
        { "character": "玩家", "avatar": "player", "text": "你们的阴谋到此为止了！" },
        { "character": "虚空教团首领", "avatar": "npc_void_boss", "text": "可惜，‘时光领主’已经开启了无限的时间循环，他想把这一刻永远定格。你们赢不了的！" }
      ],
      "endDialogues": [],
      "rewards": { "money": 1000, "exp": 500 }
    },
    {
      "step": 3,
      "name": "打破循环",
      "description": "在【时间尽头】击败永恒钟摆·时光领主，让时间重新转动！",
      "type": "boss_battle",
      "targetId": 119,
      "targetCount": 1,
      "startDialogues": [
        { "character": "永恒钟摆·时光领主", "avatar": "boss_119", "text": "你们的未来充满了毁灭，不如在无限的停滞中享受永恒吧！" },
        { "character": "玩家", "avatar": "player", "text": "没有未来的永恒，只是一座坟墓！接招吧！" }
      ],
      "endDialogues": [
        { "character": "永恒钟摆·时光领主", "avatar": "boss_119", "text": "时间的齿轮……终于又开始转动了。未来……真的值得期待吗……" },
        { "character": "船长罗杰", "avatar": "rogers", "text": "（通讯器）赛尔！全宇宙的监测数据恢复正常了！虚空教团的首脑也被我们一网打尽！" },
        { "character": "玩家", "avatar": "player", "text": "太棒了船长！我们彻底粉碎了虚空的阴谋！宇宙迎来了新的明天！" }
      ],
      "rewards": { "money": 20000, "items": { "capsule_legend": 3 } }
    }
]

with open('/home/ubuntu/data2/vibe_coding/saierhao/data/story_quests.json', 'w', encoding='utf-8') as f:
    json.dump(story, f, ensure_ascii=False, indent=2)

print("Rich story patched for Planets 11-15!")
