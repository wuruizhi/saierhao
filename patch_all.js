const fs = require('fs');

// Patch pets.json
let petsData = JSON.parse(fs.readFileSync('data/pets.json', 'utf8'));
const new_pets = [
    {
      "id": 67,
      "name": "极寒冰狐",
      "type": "water",
      "maxHp": 130,
      "attack": 65,
      "defense": 60,
      "spAttack": 125,
      "spDefense": 110,
      "speed": 100,
      "skills": [
        {"name": "极冰闪", "type": "water", "power": 60, "pp": 20, "description": "发射冰凌攻击对手"},
        {"name": "霜冻护甲", "type": "water", "power": 0, "pp": 10, "description": "提升自身防御1个等级"},
        {"name": "绝对零度", "type": "water", "power": 90, "pp": 10, "description": "降低周围温度，有几率冻伤对手"},
        {"name": "九尾风暴", "type": "water", "power": 140, "pp": 5, "description": "释放强大的冰雪风暴"}
      ]
    },
    {
      "id": 68,
      "name": "沙丘巨蝎",
      "type": "fire",
      "maxHp": 140,
      "attack": 120,
      "defense": 125,
      "spAttack": 50,
      "spDefense": 90,
      "speed": 85,
      "skills": [
        {"name": "剧毒尾刺", "type": "fire", "power": 70, "pp": 15, "description": "使用带毒的尾刺攻击对手"},
        {"name": "高温装甲", "type": "fire", "power": 0, "pp": 10, "description": "提升自身防御2个等级"},
        {"name": "流沙陷阱", "type": "fire", "power": 85, "pp": 15, "description": "制造流沙限制对手行动"},
        {"name": "炎魔连斩", "type": "fire", "power": 130, "pp": 5, "description": "双钳连续斩击，附带极高温度"}
      ]
    },
    {
      "id": 69,
      "name": "幻境花妖",
      "type": "light",
      "maxHp": 110,
      "attack": 40,
      "defense": 70,
      "spAttack": 135,
      "spDefense": 120,
      "speed": 115,
      "skills": [
        {"name": "迷幻花粉", "type": "light", "power": 50, "pp": 20, "description": "散播致幻花粉，有几率让对手睡眠"},
        {"name": "光合作用", "type": "light", "power": 0, "pp": 10, "description": "回复自身部分体力"},
        {"name": "精神冲击", "type": "light", "power": 95, "pp": 15, "description": "使用精神力量冲击对手"},
        {"name": "梦魇花环", "type": "light", "power": 145, "pp": 5, "description": "召唤巨大的发光花环，给予毁灭性打击"}
      ]
    },
    {
      "id": 70,
      "name": "泰坦机甲",
      "type": "electric",
      "maxHp": 160,
      "attack": 135,
      "defense": 140,
      "spAttack": 60,
      "spDefense": 100,
      "speed": 75,
      "skills": [
        {"name": "重装铁拳", "type": "electric", "power": 80, "pp": 20, "description": "用沉重的铁拳锤击"},
        {"name": "雷达锁定", "type": "electric", "power": 0, "pp": 10, "description": "提升自身命中1个等级"},
        {"name": "高压电击", "type": "electric", "power": 95, "pp": 15, "description": "释放高压电流，有几率麻痹对手"},
        {"name": "等离子炮", "type": "electric", "power": 150, "pp": 5, "description": "蓄力发射高能等离子光束"}
      ]
    },
    {
      "id": 71,
      "name": "熔核魔神",
      "type": "dark",
      "maxHp": 150,
      "attack": 140,
      "defense": 110,
      "spAttack": 130,
      "spDefense": 105,
      "speed": 90,
      "skills": [
        {"name": "黑暗之火", "type": "dark", "power": 75, "pp": 20, "description": "喷射漆黑的火焰"},
        {"name": "魔神觉醒", "type": "dark", "power": 0, "pp": 10, "description": "大幅提升自身攻击与特攻"},
        {"name": "深渊凝视", "type": "dark", "power": 100, "pp": 10, "description": "来自深渊的凝视，降低对手防御"},
        {"name": "灭世熔岩", "type": "dark", "power": 160, "pp": 5, "description": "召唤毁天灭地的熔岩雨"}
      ]
    }
];

const existing_ids = new Set(petsData.pets.map(p => p.id));
new_pets.forEach(p => {
    if (!existing_ids.has(p.id)) {
        petsData.pets.push(p);
    }
});
fs.writeFileSync('data/pets.json', JSON.stringify(petsData, null, 2), 'utf8');

// Patch maps.json
let mapsData = JSON.parse(fs.readFileSync('data/maps.json', 'utf8'));
mapsData.galaxies.forEach(g => {
    if (g.id === 2) {
        g.planets.forEach(p => {
            if (!p.scenes[0]) return;
            if (p.id === 6) {
                p.scenes[0].wildPets = [{"petId": 67, "minLevel": 30, "maxLevel": 40, "rate": 100}];
                p.scenes[0].npcs = [
                    {"id": "npc_ice_guardian", "name": "冰晶守护者", "x": 20, "y": 55, "sprite": "/img/npcs/npc_ice_guardian.png", "defaultText": "这里是极寒禁地。"},
                    {"id": "npc_lost_explorer", "name": "迷失的探险家", "x": 70, "y": 60, "sprite": "/img/npcs/npc_lost_explorer.png", "defaultText": "好冷...我找不到回去的路了。"}
                ];
            } else if (p.id === 7) {
                p.scenes[0].wildPets = [{"petId": 68, "minLevel": 35, "maxLevel": 45, "rate": 100}];
                p.scenes[0].npcs = [
                    {"id": "npc_desert_merchant", "name": "沙丘商人", "x": 30, "y": 50, "sprite": "/img/npcs/npc_desert_merchant.png", "defaultText": "朋友，需要点稀罕玩意儿吗？"},
                    {"id": "npc_ruin_scholar", "name": "遗迹学者", "x": 75, "y": 65, "sprite": "/img/npcs/npc_ruin_scholar.png", "defaultText": "这些遗迹的文字，我马上就能破译了！"}
                ];
            } else if (p.id === 8) {
                p.scenes[0].wildPets = [{"petId": 69, "minLevel": 40, "maxLevel": 50, "rate": 100}];
                p.scenes[0].npcs = [
                    {"id": "npc_dream_weaver", "name": "织梦者", "x": 25, "y": 45, "sprite": "/img/npcs/npc_dream_weaver.png", "defaultText": "你看到的，真的是真实的吗？"},
                    {"id": "npc_illusion_guide", "name": "幻境向导", "x": 65, "y": 55, "sprite": "/img/npcs/npc_illusion_guide.png", "defaultText": "跟我来，不要迷失在花海中。"}
                ];
            } else if (p.id === 9) {
                p.scenes[0].wildPets = [{"petId": 70, "minLevel": 45, "maxLevel": 55, "rate": 100}];
                p.scenes[0].npcs = [
                    {"id": "npc_ai_core", "name": "AI核心", "x": 40, "y": 40, "sprite": "/img/npcs/npc_ai_core.png", "defaultText": "警告：检测到未授权访问。"},
                    {"id": "npc_cyborg_rebel", "name": "改造人叛军", "x": 80, "y": 60, "sprite": "/img/npcs/npc_cyborg_rebel.png", "defaultText": "这帮废铜烂铁交给我对付！"}
                ];
            } else if (p.id === 10) {
                p.scenes[0].wildPets = [{"petId": 71, "minLevel": 50, "maxLevel": 60, "rate": 100}];
                p.scenes[0].npcs = [
                    {"id": "npc_magma_lord", "name": "炎魔领主", "x": 20, "y": 60, "sprite": "/img/npcs/npc_magma_lord.png", "defaultText": "感受深渊的烈焰吧！"},
                    {"id": "npc_fire_spirit", "name": "灰烬精灵", "x": 65, "y": 50, "sprite": "/img/npcs/npc_fire_spirit.png", "defaultText": "小心别被烫伤哦~"}
                ];
            }
        });
    }
});
fs.writeFileSync('data/maps.json', JSON.stringify(mapsData, null, 2), 'utf8');

// Patch story_quests.json
let storyData = JSON.parse(fs.readFileSync('data/story_quests.json', 'utf8'));
const new_planets = {
    "6": {
      "planetName": "冰霜星",
      "steps": [
        {
          "step": 0,
          "name": "失踪的探险家",
          "description": "前往【冰晶平原】，向迷失的探险家打听冰霜星的异变。",
          "type": "npc_talk",
          "targetId": "npc_lost_explorer",
          "startDialogues": [
            {"character": "玩家", "avatar": "player", "text": "大叔，你没事吧？这里发生了什么？"},
            {"character": "迷失的探险家", "avatar": "npc_lost_explorer", "text": "阿嚏！太冷了……这里的冰狐突然狂暴了，我的罗盘也坏了！"},
            {"character": "迷失的探险家", "avatar": "npc_lost_explorer", "text": "去问问前方的守护者吧，他可能知道原因！"}
          ],
          "endDialogues": [],
          "rewards": {"money": 500, "exp": 200}
        },
        {
          "step": 1,
          "name": "极寒考验",
          "description": "在【冰晶平原】击败3只狂暴的极寒冰狐。",
          "type": "battle",
          "targetId": null,
          "targetCount": 3,
          "startDialogues": [{"character": "玩家", "avatar": "player", "text": "先让这些冰狐冷静下来！"}],
          "endDialogues": [{"character": "玩家", "avatar": "player", "text": "呼，冻死我了，总算搞定了。"}],
          "rewards": {"money": 1000, "exp": 500}
        },
        {
          "step": 2,
          "name": "冰晶守护者",
          "description": "向冰晶守护者汇报情况。",
          "type": "npc_talk",
          "targetId": "npc_ice_guardian",
          "startDialogues": [
            {"character": "冰晶守护者", "avatar": "npc_ice_guardian", "text": "外来者，你的实力不错。冰脉的躁动暂息了。"},
            {"character": "冰晶守护者", "avatar": "npc_ice_guardian", "text": "带上这份冰霜之礼，离开这里吧。"}
          ],
          "endDialogues": [],
          "rewards": {"money": 2000, "exp": 1000}
        }
      ]
    },
    "7": {
      "planetName": "沙漠星",
      "steps": [
        {
          "step": 0,
          "name": "沙丘的秘密",
          "description": "向沙丘商人打听遗迹的情报。",
          "type": "npc_talk",
          "targetId": "npc_desert_merchant",
          "startDialogues": [
            {"character": "沙丘商人", "avatar": "npc_desert_merchant", "text": "嘿嘿，想要情报？去帮我清理掉那些烦人的巨蝎吧！"}
          ],
          "endDialogues": [],
          "rewards": {"money": 500, "exp": 200}
        },
        {
          "step": 1,
          "name": "驱逐巨蝎",
          "description": "击败3只沙丘巨蝎。",
          "type": "battle",
          "targetId": null,
          "targetCount": 3,
          "startDialogues": [],
          "endDialogues": [],
          "rewards": {"money": 1000, "exp": 500}
        },
        {
          "step": 2,
          "name": "遗迹学者",
          "description": "商人告诉你学者在废墟深处，去找他。",
          "type": "npc_talk",
          "targetId": "npc_ruin_scholar",
          "startDialogues": [
            {"character": "遗迹学者", "avatar": "npc_ruin_scholar", "text": "你看这块石板！上面记载了阿瑞斯星系的远古武器……"},
            {"character": "玩家", "avatar": "player", "text": "远古武器？听起来很危险！"}
          ],
          "endDialogues": [],
          "rewards": {"money": 2000, "exp": 1000}
        }
      ]
    },
    "8": {
      "planetName": "幻梦星",
      "steps": [
        {
          "step": 0,
          "name": "迷幻花粉",
          "description": "与幻境向导对话。",
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
          "description": "击败3只幻境花妖。",
          "type": "battle",
          "targetId": null,
          "targetCount": 3,
          "startDialogues": [],
          "endDialogues": [],
          "rewards": {"money": 1000, "exp": 500}
        },
        {
          "step": 2,
          "name": "梦境的真相",
          "description": "将花粉交给织梦者。",
          "type": "npc_talk",
          "targetId": "npc_dream_weaver",
          "startDialogues": [
            {"character": "织梦者", "avatar": "npc_dream_weaver", "text": "梦与现实，本就没有界限。谢谢你的帮助。"}
          ],
          "endDialogues": [],
          "rewards": {"money": 2000, "exp": 1000}
        }
      ]
    },
    "9": {
      "planetName": "机械星",
      "steps": [
        {
          "step": 0,
          "name": "智械危机",
          "description": "听取改造人叛军的求救。",
          "type": "npc_talk",
          "targetId": "npc_cyborg_rebel",
          "startDialogues": [
            {"character": "改造人叛军", "avatar": "npc_cyborg_rebel", "text": "AI 核心失控了！它们造出了一大批泰坦机甲，快帮忙干掉几个！"}
          ],
          "endDialogues": [],
          "rewards": {"money": 500, "exp": 200}
        },
        {
          "step": 1,
          "name": "摧毁机甲",
          "description": "击败3只泰坦机甲。",
          "type": "battle",
          "targetId": null,
          "targetCount": 3,
          "startDialogues": [],
          "endDialogues": [],
          "rewards": {"money": 1000, "exp": 500}
        },
        {
          "step": 2,
          "name": "重置核心",
          "description": "前往质问AI核心。",
          "type": "npc_talk",
          "targetId": "npc_ai_core",
          "startDialogues": [
            {"character": "AI核心", "avatar": "npc_ai_core", "text": "逻辑冲突：人类的存在导致了战争。结论：消灭人类。"},
            {"character": "玩家", "avatar": "player", "text": "（按下强制重置按钮）抱歉，你的逻辑出错了！"}
          ],
          "endDialogues": [],
          "rewards": {"money": 2000, "exp": 1000}
        }
      ]
    },
    "10": {
      "planetName": "熔核星",
      "steps": [
        {
          "step": 0,
          "name": "灰烬中的低语",
          "description": "向灰烬精灵询问炎魔的下落。",
          "type": "npc_talk",
          "targetId": "npc_fire_spirit",
          "startDialogues": [
            {"character": "灰烬精灵", "avatar": "npc_fire_spirit", "text": "领主大人正在苏醒……那些熔核魔神就是前兆！快去阻止它们！"}
          ],
          "endDialogues": [],
          "rewards": {"money": 500, "exp": 200}
        },
        {
          "step": 1,
          "name": "深渊阻击战",
          "description": "击退3只熔核魔神。",
          "type": "battle",
          "targetId": null,
          "targetCount": 3,
          "startDialogues": [],
          "endDialogues": [],
          "rewards": {"money": 1000, "exp": 500}
        },
        {
          "step": 2,
          "name": "直面炎魔",
          "description": "挑战炎魔领主。",
          "type": "npc_talk",
          "targetId": "npc_magma_lord",
          "startDialogues": [
            {"character": "炎魔领主", "avatar": "npc_magma_lord", "text": "渺小的虫子，竟敢挑战深渊的怒火？！"},
            {"character": "玩家", "avatar": "player", "text": "赛尔号的勇士绝不退缩！"}
          ],
          "endDialogues": [],
          "rewards": {"money": 5000, "exp": 3000}
        }
      ]
    }
};

Object.assign(storyData.planets, new_planets);
fs.writeFileSync('data/story_quests.json', JSON.stringify(storyData, null, 2), 'utf8');

console.log("All JSONs patched.");
