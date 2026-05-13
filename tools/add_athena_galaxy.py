import json
import os

BASE_DIR = '/home/ubuntu/data2/vibe_coding/saierhao/data'
MAPS_FILE = os.path.join(BASE_DIR, 'maps.json')
PETS_FILE = os.path.join(BASE_DIR, 'pets.json')
STORY_FILE = os.path.join(BASE_DIR, 'story_quests.json')

# 1. Update maps.json
with open(MAPS_FILE, 'r') as f:
    maps_data = json.load(f)

athena_galaxy = {
  "id": 3,
  "name": "雅典娜星系",
  "description": "充满神秘宇宙能量与未知法则的星系，独立于四大元素之外。",
  "requiredLevel": 30,
  "planets": [
    {
      "id": 11,
      "name": "星尘渊",
      "description": "深邃的宇宙深渊，到处漂浮着发光的星尘与陨石碎片。",
      "theme": "neutral",
      "bgColor": "#0b001a",
      "requiredLevel": 30,
      "scenes": [
        {
          "id": 0,
          "name": "星屑回廊",
          "icon": "✨",
          "description": "被星空光辉笼罩的走廊。",
          "bgGradient": "linear-gradient(180deg, #110022 0%, #1a0033 100%)",
          "backgroundImage": "/img/scenes/stardust-corridor.png",
          "maxSpawns": 4,
          "refreshInterval": 30,
          "requiredLevel": 30,
          "wildPets": [
            {"petId": 101, "minLevel": 30, "maxLevel": 35, "rate": 100}
          ],
          "npcs": [
            {
              "id": "npc_stargazer",
              "name": "观星者",
              "x": 30,
              "y": 60,
              "sprite": "/img/npcs/npc_stargazer.png",
              "defaultText": "群星在低语，深渊中有东西在苏醒。"
            }
          ]
        },
        {
          "id": 1,
          "name": "陨石荒原",
          "icon": "☄️",
          "description": "荒芜的陨石表面，充满空间裂缝。",
          "bgGradient": "linear-gradient(180deg, #1a0033 0%, #2b004d 100%)",
          "backgroundImage": "/img/scenes/meteor-wasteland.png",
          "maxSpawns": 5,
          "refreshInterval": 30,
          "requiredLevel": 35,
          "wildPets": [
            {"petId": 102, "minLevel": 35, "maxLevel": 42, "rate": 100}
          ],
          "npcs": [
            {
              "id": "npc_void_walker",
              "name": "虚空旅人",
              "x": 70,
              "y": 55,
              "sprite": "/img/npcs/npc_void_walker.png",
              "defaultText": "不要迷失在虚无之中。"
            }
          ]
        },
        {
          "id": 2,
          "name": "虚空之眼",
          "icon": "👁️",
          "description": "星尘渊的核心，黑洞般深邃的虚空之眼。",
          "bgGradient": "linear-gradient(180deg, #2b004d 0%, #3c0066 100%)",
          "backgroundImage": "/img/scenes/eye-of-void.png",
          "maxSpawns": 5,
          "refreshInterval": 30,
          "requiredLevel": 40,
          "wildPets": [
            {"petId": 102, "minLevel": 40, "maxLevel": 48, "rate": 100}
          ],
          "boss": {
            "petId": 103,
            "level": 45,
            "name": "虚空行者·黑洞",
            "rate": 100,
            "essenceId": "dark"
          },
          "npcs": [
            {
              "id": "npc_abyss_guard",
              "name": "深渊守卫",
              "x": 80,
              "y": 45,
              "sprite": "/img/npcs/npc_abyss_guard.png",
              "defaultText": "你无法逃脱吞噬。"
            }
          ]
        }
      ]
    },
    {
      "id": 12,
      "name": "棱镜星",
      "description": "由无尽水晶和棱镜构成的星球，折射着刺眼的光芒。",
      "theme": "light",
      "bgColor": "#fffae6",
      "requiredLevel": 35,
      "scenes": [
        {
          "id": 0,
          "name": "晶化谷",
          "icon": "💎",
          "description": "满是水晶柱的幽深峡谷。",
          "bgGradient": "linear-gradient(180deg, #fffde6 0%, #fffbd6 100%)",
          "backgroundImage": "/img/scenes/crystal-valley.png",
          "maxSpawns": 4,
          "refreshInterval": 30,
          "requiredLevel": 35,
          "wildPets": [
            {"petId": 104, "minLevel": 35, "maxLevel": 40, "rate": 100}
          ],
          "npcs": [
            {
              "id": "npc_crystal_miner",
              "name": "采晶人",
              "x": 20,
              "y": 50,
              "sprite": "/img/npcs/npc_crystal_miner.png",
              "defaultText": "这些水晶里蕴含着纯粹的光能。"
            }
          ]
        },
        {
          "id": 1,
          "name": "折射迷宫",
          "icon": "🪞",
          "description": "光线在这里扭曲，极易迷失方向的迷宫。",
          "bgGradient": "linear-gradient(180deg, #fffbd6 0%, #fff8b3 100%)",
          "backgroundImage": "/img/scenes/refraction-maze.png",
          "maxSpawns": 5,
          "refreshInterval": 30,
          "requiredLevel": 40,
          "wildPets": [
            {"petId": 105, "minLevel": 40, "maxLevel": 45, "rate": 100}
          ],
          "npcs": [
            {
              "id": "npc_light_weaver",
              "name": "织光者",
              "x": 65,
              "y": 65,
              "sprite": "/img/npcs/npc_light_weaver.png",
              "defaultText": "光影虚实，皆是幻象。"
            }
          ]
        },
        {
          "id": 2,
          "name": "耀光矩阵",
          "icon": "🔆",
          "description": "棱镜星的核心能源矩阵，极为刺眼。",
          "bgGradient": "linear-gradient(180deg, #fff8b3 0%, #fff080 100%)",
          "backgroundImage": "/img/scenes/radiant-matrix.png",
          "maxSpawns": 5,
          "refreshInterval": 30,
          "requiredLevel": 45,
          "wildPets": [
            {"petId": 105, "minLevel": 45, "maxLevel": 50, "rate": 100}
          ],
          "boss": {
            "petId": 106,
            "level": 50,
            "name": "光辉大天使·折射",
            "rate": 100,
            "essenceId": "light"
          },
          "npcs": [
            {
              "id": "npc_archangel_projection",
              "name": "大天使投影",
              "x": 50,
              "y": 50,
              "sprite": "/img/npcs/npc_archangel_projection.png",
              "defaultText": "接受圣光的洗礼吧。"
            }
          ]
        }
      ]
    },
    {
      "id": 13,
      "name": "毒瘴星",
      "description": "被有毒水汽和剧毒酸雨覆盖的危险星球。",
      "theme": "water",
      "bgColor": "#1a331a",
      "requiredLevel": 40,
      "scenes": [
        {
          "id": 0,
          "name": "腐坏沼泽",
          "icon": "🦠",
          "description": "冒着绿色气泡的剧毒沼泽。",
          "bgGradient": "linear-gradient(180deg, #1a331a 0%, #204020 100%)",
          "backgroundImage": "/img/scenes/corrupt-swamp.png",
          "maxSpawns": 4,
          "refreshInterval": 30,
          "requiredLevel": 40,
          "wildPets": [
            {"petId": 107, "minLevel": 40, "maxLevel": 45, "rate": 100}
          ],
          "npcs": [
            {
              "id": "npc_swamp_hermit",
              "name": "沼泽隐士",
              "x": 40,
              "y": 60,
              "sprite": "/img/npcs/npc_swamp_hermit.png",
              "defaultText": "小心脚下，这里的水能腐蚀骨头。"
            }
          ]
        },
        {
          "id": 1,
          "name": "酸雨密林",
          "icon": "🌧️",
          "description": "下着酸雨的阴暗密林。",
          "bgGradient": "linear-gradient(180deg, #204020 0%, #2d592d 100%)",
          "backgroundImage": "/img/scenes/acid-rain-jungle.png",
          "maxSpawns": 5,
          "refreshInterval": 30,
          "requiredLevel": 45,
          "wildPets": [
            {"petId": 108, "minLevel": 45, "maxLevel": 50, "rate": 100}
          ],
          "npcs": [
            {
              "id": "npc_mutant_hunter",
              "name": "变异猎手",
              "x": 75,
              "y": 55,
              "sprite": "/img/npcs/npc_mutant_hunter.png",
              "defaultText": "这些毒物可是绝佳的素材。"
            }
          ]
        },
        {
          "id": 2,
          "name": "疫病源头",
          "icon": "☣️",
          "description": "毒瘴的中心，散发着致命的瘟疫气息。",
          "bgGradient": "linear-gradient(180deg, #2d592d 0%, #397339 100%)",
          "backgroundImage": "/img/scenes/plague-source.png",
          "maxSpawns": 5,
          "refreshInterval": 30,
          "requiredLevel": 50,
          "wildPets": [
            {"petId": 108, "minLevel": 50, "maxLevel": 55, "rate": 100}
          ],
          "boss": {
            "petId": 109,
            "level": 55,
            "name": "疫病之源·瘟疫",
            "rate": 100,
            "essenceId": "water"
          },
          "npcs": [
            {
              "id": "npc_plague_doctor",
              "name": "瘟疫医生",
              "x": 30,
              "y": 45,
              "sprite": "/img/npcs/npc_plague_doctor.png",
              "defaultText": "疾病……即是进化。"
            }
          ]
        }
      ]
    },
    {
      "id": 14,
      "name": "幻音星",
      "description": "空气中回荡着无形旋律的星球，音乐构成了这里的世界。",
      "theme": "neutral",
      "bgColor": "#1a0033",
      "requiredLevel": 45,
      "scenes": [
        {
          "id": 0,
          "name": "寂静荒野",
          "icon": "🤫",
          "description": "听不到任何声音的奇特荒原。",
          "bgGradient": "linear-gradient(180deg, #1a0033 0%, #2a0052 100%)",
          "backgroundImage": "/img/scenes/silent-wilderness.png",
          "maxSpawns": 4,
          "refreshInterval": 30,
          "requiredLevel": 45,
          "wildPets": [
            {"petId": 110, "minLevel": 45, "maxLevel": 50, "rate": 100}
          ],
          "npcs": [
            {
              "id": "npc_silent_monk",
              "name": "静默僧侣",
              "x": 70,
              "y": 65,
              "sprite": "/img/npcs/npc_silent_monk.png",
              "defaultText": "……"
            }
          ]
        },
        {
          "id": 1,
          "name": "回音山谷",
          "icon": "📢",
          "description": "声音在这里被无限放大和折射的山谷。",
          "bgGradient": "linear-gradient(180deg, #2a0052 0%, #3e007a 100%)",
          "backgroundImage": "/img/scenes/echo-valley.png",
          "maxSpawns": 5,
          "refreshInterval": 30,
          "requiredLevel": 50,
          "wildPets": [
            {"petId": 111, "minLevel": 50, "maxLevel": 55, "rate": 100}
          ],
          "npcs": [
            {
              "id": "npc_bard",
              "name": "流浪吟游",
              "x": 25,
              "y": 55,
              "sprite": "/img/npcs/npc_bard.png",
              "defaultText": "听啊，这风中传来的悲歌。"
            }
          ]
        },
        {
          "id": 2,
          "name": "协奏圣殿",
          "icon": "🎼",
          "description": "庄严的音乐圣殿，演奏着死亡的安魂曲。",
          "bgGradient": "linear-gradient(180deg, #3e007a 0%, #5200a3 100%)",
          "backgroundImage": "/img/scenes/concerto-temple.png",
          "maxSpawns": 5,
          "refreshInterval": 30,
          "requiredLevel": 55,
          "wildPets": [
            {"petId": 111, "minLevel": 55, "maxLevel": 60, "rate": 100}
          ],
          "boss": {
            "petId": 112,
            "level": 60,
            "name": "绝望安魂曲·夜莺",
            "rate": 100,
            "essenceId": "neutral"
          },
          "npcs": [
            {
              "id": "npc_maestro",
              "name": "疯狂指挥家",
              "x": 80,
              "y": 45,
              "sprite": "/img/npcs/npc_maestro.png",
              "defaultText": "华丽的终章，就要开始了！"
            }
          ]
        }
      ]
    },
    {
      "id": 15,
      "name": "时之狭间",
      "description": "脱离正常时间流的裂缝，到处是巨大的齿轮和时钟。",
      "theme": "electric",
      "bgColor": "#331a00",
      "requiredLevel": 50,
      "scenes": [
        {
          "id": 0,
          "name": "停滞钟摆",
          "icon": "🕰️",
          "description": "巨大钟摆停止摇摆的空间。",
          "bgGradient": "linear-gradient(180deg, #331a00 0%, #4d2600 100%)",
          "backgroundImage": "/img/scenes/stalled-pendulum.png",
          "maxSpawns": 4,
          "refreshInterval": 30,
          "requiredLevel": 50,
          "wildPets": [
            {"petId": 113, "minLevel": 50, "maxLevel": 55, "rate": 100}
          ],
          "npcs": [
            {
              "id": "npc_time_traveler",
              "name": "时空旅人",
              "x": 30,
              "y": 50,
              "sprite": "/img/npcs/npc_time_traveler.png",
              "defaultText": "时间在这里失去了意义。"
            }
          ]
        },
        {
          "id": 1,
          "name": "齿轮迷城",
          "icon": "⚙️",
          "description": "由无数黄铜齿轮构成的迷宫城市。",
          "bgGradient": "linear-gradient(180deg, #4d2600 0%, #663300 100%)",
          "backgroundImage": "/img/scenes/gear-city.png",
          "maxSpawns": 5,
          "refreshInterval": 30,
          "requiredLevel": 55,
          "wildPets": [
            {"petId": 114, "minLevel": 55, "maxLevel": 60, "rate": 100}
          ],
          "npcs": [
            {
              "id": "npc_clock_maker",
              "name": "钟表匠",
              "x": 65,
              "y": 60,
              "sprite": "/img/npcs/npc_clock_maker.png",
              "defaultText": "咔哒，咔哒，机械是绝对精确的。"
            }
          ]
        },
        {
          "id": 2,
          "name": "永恒沙漏",
          "icon": "⏳",
          "description": "时间的核心，金色的沙粒在此倒流。",
          "bgGradient": "linear-gradient(180deg, #663300 0%, #804000 100%)",
          "backgroundImage": "/img/scenes/eternal-hourglass.png",
          "maxSpawns": 5,
          "refreshInterval": 30,
          "requiredLevel": 60,
          "wildPets": [
            {"petId": 114, "minLevel": 60, "maxLevel": 65, "rate": 100}
          ],
          "boss": {
            "petId": 115,
            "level": 65,
            "name": "时光领主·无限",
            "rate": 100,
            "essenceId": "electric"
          },
          "npcs": [
            {
              "id": "npc_keeper_of_time",
              "name": "时间看守",
              "x": 40,
              "y": 45,
              "sprite": "/img/npcs/npc_keeper_of_time.png",
              "defaultText": "妄图篡改过去之人，必将受到惩罚。"
            }
          ]
        }
      ]
    }
  ]
}

# Add galaxy if not exists
if not any(g['id'] == 3 for g in maps_data['galaxies']):
    maps_data['galaxies'].append(athena_galaxy)
else:
    for i, g in enumerate(maps_data['galaxies']):
        if g['id'] == 3:
            maps_data['galaxies'][i] = athena_galaxy
            break

with open(MAPS_FILE, 'w') as f:
    json.dump(maps_data, f, indent=2, ensure_ascii=False)


# 2. Update pets.json
with open(PETS_FILE, 'r') as f:
    pets_data = json.load(f)

new_pets = [
  # Planet 11 (Dark)
  {
    "id": 101, "name": "星尘浮游", "type": "dark", "form": "幼体", "description": "在宇宙深空诞生的微弱意识体。",
    "baseStats": {"hp": 55, "attack": 60, "defense": 50, "speed": 65, "spAttack": 70, "spDefense": 55},
    "growthRate": {"hp": 3.2, "attack": 3.0, "defense": 2.5, "speed": 3.2, "spAttack": 3.5, "spDefense": 2.8},
    "evolution": {"to": 102, "level": 25}, "learnset": [{"level": 1, "skillId": 34}, {"level": 10, "skillId": 36}],
    "lore": "星尘渊的初级生命形态。", "captureGuide": "在星屑回廊可捕捉。"
  },
  {
    "id": 102, "name": "深渊吞噬者", "type": "dark", "form": "成体", "description": "吞噬星尘长大的虚空生物。",
    "baseStats": {"hp": 80, "attack": 85, "defense": 70, "speed": 85, "spAttack": 95, "spDefense": 75},
    "growthRate": {"hp": 3.8, "attack": 3.8, "defense": 3.2, "speed": 3.8, "spAttack": 4.2, "spDefense": 3.4},
    "evolution": None, "learnset": [{"level": 1, "skillId": 34}, {"level": 25, "skillId": 64}, {"level": 40, "skillId": 35}],
    "lore": "黑洞的雏形，能吞噬光线。", "captureGuide": "由星尘浮游进化。"
  },
  {
    "id": 103, "name": "虚空行者·黑洞", "type": "dark", "form": "究极体", "description": "星尘渊的霸主，掌握绝对的虚无之力。",
    "baseStats": {"hp": 105, "attack": 100, "defense": 90, "speed": 100, "spAttack": 120, "spDefense": 95},
    "growthRate": {"hp": 4.5, "attack": 4.0, "defense": 3.8, "speed": 4.2, "spAttack": 4.8, "spDefense": 4.0},
    "evolution": None, "learnset": [{"level": 1, "skillId": 64}, {"level": 40, "skillId": 35}, {"level": 55, "skillId": 65}],
    "lore": "星尘渊的无上存在。", "captureGuide": "击败BOSS无法捕捉。"
  },
  # Planet 12 (Light)
  {
    "id": 104, "name": "晶棱角", "type": "light", "form": "幼体", "description": "闪闪发光的晶体精灵。",
    "baseStats": {"hp": 50, "attack": 55, "defense": 65, "speed": 60, "spAttack": 65, "spDefense": 70},
    "growthRate": {"hp": 3.0, "attack": 2.8, "defense": 3.2, "speed": 3.0, "spAttack": 3.2, "spDefense": 3.5},
    "evolution": {"to": 105, "level": 25}, "learnset": [{"level": 1, "skillId": 29}, {"level": 10, "skillId": 30}],
    "lore": "棱镜星晶化谷的特产精灵。", "captureGuide": "在晶化谷可捕捉。"
  },
  {
    "id": 105, "name": "闪耀棱柱", "type": "light", "form": "成体", "description": "能够折射出七彩强光的棱晶结构。",
    "baseStats": {"hp": 75, "attack": 75, "defense": 85, "speed": 80, "spAttack": 90, "spDefense": 95},
    "growthRate": {"hp": 3.6, "attack": 3.4, "defense": 4.0, "speed": 3.6, "spAttack": 4.0, "spDefense": 4.2},
    "evolution": None, "learnset": [{"level": 1, "skillId": 29}, {"level": 25, "skillId": 62}, {"level": 40, "skillId": 31}],
    "lore": "能发射高温激光束的晶体。", "captureGuide": "由晶棱角进化。"
  },
  {
    "id": 106, "name": "光辉大天使·折射", "type": "light", "form": "究极体", "description": "棱镜星的守护者，代表绝对的光明裁决。",
    "baseStats": {"hp": 95, "attack": 90, "defense": 105, "speed": 105, "spAttack": 115, "spDefense": 110},
    "growthRate": {"hp": 4.2, "attack": 3.8, "defense": 4.4, "speed": 4.4, "spAttack": 4.6, "spDefense": 4.5},
    "evolution": None, "learnset": [{"level": 1, "skillId": 62}, {"level": 40, "skillId": 31}, {"level": 55, "skillId": 63}],
    "lore": "无瑕的圣光化身。", "captureGuide": "击败BOSS无法捕捉。"
  },
  # Planet 13 (Water)
  {
    "id": 107, "name": "污泥怪", "type": "water", "form": "幼体", "description": "一团黏糊糊的毒液怪。",
    "baseStats": {"hp": 65, "attack": 55, "defense": 60, "speed": 40, "spAttack": 60, "spDefense": 55},
    "growthRate": {"hp": 3.5, "attack": 2.8, "defense": 3.0, "speed": 2.2, "spAttack": 3.0, "spDefense": 2.8},
    "evolution": {"to": 108, "level": 25}, "learnset": [{"level": 1, "skillId": 5}, {"level": 10, "skillId": 12}],
    "lore": "腐坏沼泽的常见生物。", "captureGuide": "在腐坏沼泽可捕捉。"
  },
  {
    "id": 108, "name": "剧毒沼王", "type": "water", "form": "成体", "description": "浑身滴落酸液的恐怖巨兽。",
    "baseStats": {"hp": 95, "attack": 75, "defense": 85, "speed": 60, "spAttack": 85, "spDefense": 80},
    "growthRate": {"hp": 4.2, "attack": 3.5, "defense": 3.8, "speed": 3.0, "spAttack": 3.8, "spDefense": 3.6},
    "evolution": None, "learnset": [{"level": 1, "skillId": 5}, {"level": 25, "skillId": 52}, {"level": 40, "skillId": 13}],
    "lore": "酸雨密林的掠食者。", "captureGuide": "由污泥怪进化。"
  },
  {
    "id": 109, "name": "疫病之源·瘟疫", "type": "water", "form": "究极体", "description": "散播一切疾病与毒素的源头。",
    "baseStats": {"hp": 120, "attack": 90, "defense": 110, "speed": 80, "spAttack": 105, "spDefense": 100},
    "growthRate": {"hp": 4.8, "attack": 4.0, "defense": 4.6, "speed": 3.5, "spAttack": 4.4, "spDefense": 4.2},
    "evolution": None, "learnset": [{"level": 1, "skillId": 52}, {"level": 40, "skillId": 13}, {"level": 55, "skillId": 74}],
    "lore": "触碰即死的瘟疫霸主。", "captureGuide": "击败BOSS无法捕捉。"
  },
  # Planet 14 (Neutral)
  {
    "id": 110, "name": "音符精灵", "type": "normal", "form": "幼体", "description": "伴随着音符跳动的可爱生物。",
    "baseStats": {"hp": 55, "attack": 45, "defense": 45, "speed": 75, "spAttack": 65, "spDefense": 55},
    "growthRate": {"hp": 3.2, "attack": 2.5, "defense": 2.5, "speed": 3.8, "spAttack": 3.4, "spDefense": 3.0},
    "evolution": {"to": 111, "level": 25}, "learnset": [{"level": 1, "skillId": 1}, {"level": 10, "skillId": 24}],
    "lore": "幻音星的基础居民。", "captureGuide": "在寂静荒野可捕捉。"
  },
  {
    "id": 111, "name": "幻音歌者", "type": "normal", "form": "成体", "description": "用歌声迷惑敌人的幻术师。",
    "baseStats": {"hp": 80, "attack": 60, "defense": 65, "speed": 100, "spAttack": 90, "spDefense": 80},
    "growthRate": {"hp": 3.8, "attack": 3.0, "defense": 3.2, "speed": 4.4, "spAttack": 4.2, "spDefense": 3.8},
    "evolution": None, "learnset": [{"level": 1, "skillId": 1}, {"level": 25, "skillId": 25}, {"level": 40, "skillId": 55}],
    "lore": "歌声能穿透一切护盾。", "captureGuide": "由音符精灵进化。"
  },
  {
    "id": 112, "name": "绝望安魂曲·夜莺", "type": "normal", "form": "究极体", "description": "她的歌声宣告着死亡的降临。",
    "baseStats": {"hp": 100, "attack": 75, "defense": 85, "speed": 120, "spAttack": 115, "spDefense": 105},
    "growthRate": {"hp": 4.2, "attack": 3.5, "defense": 4.0, "speed": 4.8, "spAttack": 4.6, "spDefense": 4.4},
    "evolution": None, "learnset": [{"level": 1, "skillId": 25}, {"level": 40, "skillId": 55}, {"level": 55, "skillId": 57}],
    "lore": "幻音星的最强音。", "captureGuide": "击败BOSS无法捕捉。"
  },
  # Planet 15 (Electric)
  {
    "id": 113, "name": "发条鼠", "type": "electric", "form": "幼体", "description": "依靠背后发条驱动的机械老鼠。",
    "baseStats": {"hp": 50, "attack": 65, "defense": 60, "speed": 65, "spAttack": 50, "spDefense": 50},
    "growthRate": {"hp": 3.0, "attack": 3.4, "defense": 3.0, "speed": 3.4, "spAttack": 2.8, "spDefense": 2.8},
    "evolution": {"to": 114, "level": 25}, "learnset": [{"level": 1, "skillId": 24}, {"level": 10, "skillId": 25}],
    "lore": "时之狭间的清理工。", "captureGuide": "在停滞钟摆可捕捉。"
  },
  {
    "id": 114, "name": "齿轮巨兵", "type": "electric", "form": "成体", "description": "由无数巨大齿轮组装而成的守卫。",
    "baseStats": {"hp": 75, "attack": 95, "defense": 90, "speed": 85, "spAttack": 65, "spDefense": 75},
    "growthRate": {"hp": 3.8, "attack": 4.2, "defense": 4.2, "speed": 4.0, "spAttack": 3.2, "spDefense": 3.6},
    "evolution": None, "learnset": [{"level": 1, "skillId": 24}, {"level": 25, "skillId": 58}, {"level": 40, "skillId": 13}],
    "lore": "保护时间齿轮不被破坏的巨像。", "captureGuide": "由发条鼠进化。"
  },
  {
    "id": 115, "name": "时光领主·无限", "type": "electric", "form": "究极体", "description": "掌控时间法则的终极机器神明。",
    "baseStats": {"hp": 100, "attack": 115, "defense": 105, "speed": 105, "spAttack": 85, "spDefense": 95},
    "growthRate": {"hp": 4.4, "attack": 4.8, "defense": 4.6, "speed": 4.5, "spAttack": 3.8, "spDefense": 4.2},
    "evolution": None, "learnset": [{"level": 1, "skillId": 58}, {"level": 40, "skillId": 13}, {"level": 55, "skillId": 54}],
    "lore": "时间的长河在其掌控之中。", "captureGuide": "击败BOSS无法捕捉。"
  }
]

existing_pet_ids = set(p['id'] for p in pets_data['pets'])
for p in new_pets:
    if p['id'] not in existing_pet_ids:
        pets_data['pets'].append(p)
    else:
        for i, ep in enumerate(pets_data['pets']):
            if ep['id'] == p['id']:
                pets_data['pets'][i] = p

with open(PETS_FILE, 'w') as f:
    json.dump(pets_data, f, indent=2, ensure_ascii=False)


# 3. Update story_quests.json
with open(STORY_FILE, 'r') as f:
    story_data = json.load(f)

story_data['planets']['11'] = {
    "steps": [
        {"step": 0, "name": "深空异音", "description": "向【星屑回廊】的观星者询问情况。", "type": "npc_talk", "targetId": "npc_stargazer", "startDialogues": [{"character": "观星者", "avatar": "npc_stargazer", "text": "深空传来异响，去清理几只星尘浮游再来找我。"}], "endDialogues": [], "rewards": {"money": 1000, "exp": 500}},
        {"step": 1, "name": "清理浮游", "description": "击败3只星尘渊精灵。", "type": "battle", "targetId": None, "targetCount": 3, "startDialogues": [], "endDialogues": [], "rewards": {"money": 2000, "exp": 1000}},
        {"step": 2, "name": "虚空旅人", "description": "前往【陨石荒原】寻找虚空旅人。", "type": "npc_talk", "targetId": "npc_void_walker", "startDialogues": [{"character": "虚空旅人", "avatar": "npc_void_walker", "text": "黑洞即将来临，去阻止它！"}], "endDialogues": [], "rewards": {"money": 1000, "exp": 500}},
        {"step": 3, "name": "黑洞降临", "description": "在【虚空之眼】击败虚空行者·黑洞。", "type": "boss_battle", "targetId": 103, "targetCount": 1, "startDialogues": [{"character": "深渊守卫", "avatar": "npc_abyss_guard", "text": "一切归于虚无。"}], "endDialogues": [{"character": "深渊守卫", "avatar": "npc_abyss_guard", "text": "黑洞竟然被阻止了……"}], "rewards": {"money": 5000, "items": {"capsule_super": 1}}}
    ]
}

story_data['planets']['12'] = {
    "steps": [
        {"step": 0, "name": "刺眼之光", "description": "向【晶化谷】的采晶人询问情况。", "type": "npc_talk", "targetId": "npc_crystal_miner", "startDialogues": [{"character": "采晶人", "avatar": "npc_crystal_miner", "text": "光芒越来越强了，清理掉一些发狂的晶棱角吧。"}], "endDialogues": [], "rewards": {"money": 1000, "exp": 500}},
        {"step": 1, "name": "清理棱晶", "description": "击败3只棱镜星精灵。", "type": "battle", "targetId": None, "targetCount": 3, "startDialogues": [], "endDialogues": [], "rewards": {"money": 2000, "exp": 1000}},
        {"step": 2, "name": "织光者", "description": "前往【折射迷宫】寻找织光者。", "type": "npc_talk", "targetId": "npc_light_weaver", "startDialogues": [{"character": "织光者", "avatar": "npc_light_weaver", "text": "光辉大天使失控了，需要你去平息它的怒火。"}], "endDialogues": [], "rewards": {"money": 1000, "exp": 500}},
        {"step": 3, "name": "大天使之怒", "description": "在【耀光矩阵】击败光辉大天使·折射。", "type": "boss_battle", "targetId": 106, "targetCount": 1, "startDialogues": [{"character": "大天使投影", "avatar": "npc_archangel_projection", "text": "接受净化吧。"}], "endDialogues": [{"character": "大天使投影", "avatar": "npc_archangel_projection", "text": "光芒重归平静。"}], "rewards": {"money": 5000, "items": {"capsule_super": 1}}}
    ]
}

story_data['planets']['13'] = {
    "steps": [
        {"step": 0, "name": "致命瘴气", "description": "向【腐坏沼泽】的沼泽隐士询问情况。", "type": "npc_talk", "targetId": "npc_swamp_hermit", "startDialogues": [{"character": "沼泽隐士", "avatar": "npc_swamp_hermit", "text": "咳咳，毒气变浓了，先清理掉几只污泥怪！"}], "endDialogues": [], "rewards": {"money": 1000, "exp": 500}},
        {"step": 1, "name": "清理污泥", "description": "击败3只毒瘴星精灵。", "type": "battle", "targetId": None, "targetCount": 3, "startDialogues": [], "endDialogues": [], "rewards": {"money": 2000, "exp": 1000}},
        {"step": 2, "name": "变异猎手", "description": "前往【酸雨密林】寻找变异猎手。", "type": "npc_talk", "targetId": "npc_mutant_hunter", "startDialogues": [{"character": "变异猎手", "avatar": "npc_mutant_hunter", "text": "瘟疫的源头苏醒了，这是个大麻烦！"}], "endDialogues": [], "rewards": {"money": 1000, "exp": 500}},
        {"step": 3, "name": "疫病之源", "description": "在【疫病源头】击败疫病之源·瘟疫。", "type": "boss_battle", "targetId": 109, "targetCount": 1, "startDialogues": [{"character": "瘟疫医生", "avatar": "npc_plague_doctor", "text": "绝望地感染吧！"}], "endDialogues": [{"character": "瘟疫医生", "avatar": "npc_plague_doctor", "text": "毒雾散去了……"}], "rewards": {"money": 5000, "items": {"capsule_legend": 1}}}
    ]
}

story_data['planets']['14'] = {
    "steps": [
        {"step": 0, "name": "无声之哀", "description": "与【寂静荒野】的静默僧侣交流。", "type": "npc_talk", "targetId": "npc_silent_monk", "startDialogues": [{"character": "静默僧侣", "avatar": "npc_silent_monk", "text": "（他指了指发狂的音符精灵，示意你清理它们）"}], "endDialogues": [], "rewards": {"money": 1000, "exp": 500}},
        {"step": 1, "name": "平息音符", "description": "击败3只幻音星精灵。", "type": "battle", "targetId": None, "targetCount": 3, "startDialogues": [], "endDialogues": [], "rewards": {"money": 2000, "exp": 1000}},
        {"step": 2, "name": "流浪吟游", "description": "前往【回音山谷】寻找流浪吟游。", "type": "npc_talk", "targetId": "npc_bard", "startDialogues": [{"character": "流浪吟游", "avatar": "npc_bard", "text": "绝望的安魂曲正在奏响，快去阻止它！"}], "endDialogues": [], "rewards": {"money": 1000, "exp": 500}},
        {"step": 3, "name": "安魂曲之终", "description": "在【协奏圣殿】击败绝望安魂曲·夜莺。", "type": "boss_battle", "targetId": 112, "targetCount": 1, "startDialogues": [{"character": "疯狂指挥家", "avatar": "npc_maestro", "text": "为这绝望的乐章献上你的生命！"}], "endDialogues": [{"character": "疯狂指挥家", "avatar": "npc_maestro", "text": "曲终，人散……"}], "rewards": {"money": 5000, "items": {"capsule_super": 1}}}
    ]
}

story_data['planets']['15'] = {
    "steps": [
        {"step": 0, "name": "时间停滞", "description": "向【停滞钟摆】的时空旅人询问情况。", "type": "npc_talk", "targetId": "npc_time_traveler", "startDialogues": [{"character": "时空旅人", "avatar": "npc_time_traveler", "text": "时间齿轮卡住了，去修理几个发条鼠吧。"}], "endDialogues": [], "rewards": {"money": 1000, "exp": 500}},
        {"step": 1, "name": "修理齿轮", "description": "击败3之时之狭间精灵。", "type": "battle", "targetId": None, "targetCount": 3, "startDialogues": [], "endDialogues": [], "rewards": {"money": 2000, "exp": 1000}},
        {"step": 2, "name": "钟表匠", "description": "前往【齿轮迷城】寻找钟表匠。", "type": "npc_talk", "targetId": "npc_clock_maker", "startDialogues": [{"character": "钟表匠", "avatar": "npc_clock_maker", "text": "时光领主的程序错乱了，去重置它。"}], "endDialogues": [], "rewards": {"money": 1000, "exp": 500}},
        {"step": 3, "name": "时光重置", "description": "在【永恒沙漏】击败时光领主·无限。", "type": "boss_battle", "targetId": 115, "targetCount": 1, "startDialogues": [{"character": "时间看守", "avatar": "npc_keeper_of_time", "text": "时间的法则，不可违背。"}], "endDialogues": [{"character": "时间看守", "avatar": "npc_keeper_of_time", "text": "时间再次流动。"}], "rewards": {"money": 5000, "items": {"capsule_legend": 1}}}
    ]
}

with open(STORY_FILE, 'w') as f:
    json.dump(story_data, f, indent=2, ensure_ascii=False)

print("Added Athena Galaxy and all 5 planets/quests successfully!")
