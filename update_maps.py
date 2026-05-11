import json

with open('/home/ubuntu/data2/vibe_coding/saierhao/data/maps.json', 'r') as f:
    data = json.load(f)

# Find Ares galaxy
ares = next(g for g in data['galaxies'] if g['id'] == 2)

for planet in ares['planets']:
    if planet['id'] == 6:  # 冰霜星
        planet['scenes'] = [
            {
              "id": 0,
              "name": "冰晶平原",
              "icon": "❄️",
              "description": "被厚厚冰层覆盖的平原，极其寒冷。",
              "bgGradient": "linear-gradient(180deg, #e0f7fa 0%, #b2ebf2 100%)",
              "backgroundImage": "/img/scenes/ice-plains.png",
              "maxSpawns": 4,
              "refreshInterval": 30,
              "requiredLevel": 30,
              "wildPets": [
                {"petId": 67, "minLevel": 30, "maxLevel": 35, "rate": 50},
                {"petId": 75, "minLevel": 30, "maxLevel": 35, "rate": 50}
              ],
              "npcs": [
                {
                  "id": "npc_lost_explorer",
                  "name": "迷失的探险家",
                  "x": 70,
                  "y": 60,
                  "sprite": "/img/npcs/npc_lost_explorer.png",
                  "defaultText": "好冷...我找不到回去的路了。"
                }
              ]
            },
            {
              "id": 1,
              "name": "寒冰洞窟",
              "icon": "🧊",
              "description": "晶莹剔透的冰窟，生活着更强壮的冰系精灵。",
              "bgGradient": "linear-gradient(180deg, #b2ebf2 0%, #80deea 100%)",
              "backgroundImage": "/img/scenes/ice-cave.png",
              "maxSpawns": 5,
              "refreshInterval": 30,
              "requiredLevel": 35,
              "wildPets": [
                {"petId": 73, "minLevel": 35, "maxLevel": 42, "rate": 60},
                {"petId": 76, "minLevel": 35, "maxLevel": 42, "rate": 40}
              ],
              "npcs": [
                {
                  "id": "npc_ice_witch",
                  "name": "冰霜女巫",
                  "x": 30,
                  "y": 55,
                  "sprite": "/img/npcs/npc_ice_witch.png",
                  "defaultText": "感受刺骨的寒意吧。"
                }
              ]
            },
            {
              "id": 2,
              "name": "永冻王座",
              "icon": "👑",
              "description": "冰霜星的极寒中心，极光冰麟守护于此。",
              "bgGradient": "linear-gradient(180deg, #80deea 0%, #4dd0e1 100%)",
              "backgroundImage": "/img/scenes/ice-throne.png",
              "maxSpawns": 5,
              "refreshInterval": 30,
              "requiredLevel": 40,
              "wildPets": [
                {"petId": 73, "minLevel": 40, "maxLevel": 48, "rate": 70},
                {"petId": 76, "minLevel": 40, "maxLevel": 48, "rate": 30}
              ],
              "boss": {
                "petId": 74,
                "level": 45,
                "name": "极光冰麟·冰帝",
                "rate": 100,
                "essenceId": "water"
              },
              "npcs": [
                {
                  "id": "npc_ice_king",
                  "name": "冰封古王",
                  "x": 80,
                  "y": 45,
                  "sprite": "/img/npcs/npc_ice_king.png",
                  "defaultText": "王座不容亵渎。"
                }
              ]
            }
        ]
    elif planet['id'] == 7:  # 沙漠星
        planet['scenes'] = [
            {
              "id": 0,
              "name": "流沙绿洲",
              "icon": "🌵",
              "description": "沙漠中罕见的绿洲。",
              "bgGradient": "linear-gradient(180deg, #ffcc80 0%, #ffb74d 100%)",
              "backgroundImage": "/img/scenes/desert-oasis.png",
              "maxSpawns": 4,
              "refreshInterval": 30,
              "requiredLevel": 35,
              "wildPets": [
                {"petId": 68, "minLevel": 35, "maxLevel": 40, "rate": 50},
                {"petId": 80, "minLevel": 35, "maxLevel": 40, "rate": 50}
              ],
              "npcs": [
                {
                  "id": "npc_desert_merchant",
                  "name": "沙丘商人",
                  "x": 30,
                  "y": 50,
                  "sprite": "/img/npcs/npc_desert_merchant.png",
                  "defaultText": "朋友，需要点稀罕玩意儿吗？"
                }
              ]
            },
            {
              "id": 1,
              "name": "焦岩峡谷",
              "icon": "🏜️",
              "description": "炙热的峡谷，狂风卷起漫天黄沙。",
              "bgGradient": "linear-gradient(180deg, #ffb74d 0%, #ffa726 100%)",
              "backgroundImage": "/img/scenes/desert-canyon.png",
              "maxSpawns": 5,
              "refreshInterval": 30,
              "requiredLevel": 40,
              "wildPets": [
                {"petId": 78, "minLevel": 40, "maxLevel": 48, "rate": 60},
                {"petId": 81, "minLevel": 40, "maxLevel": 48, "rate": 40}
              ],
              "npcs": [
                {
                  "id": "npc_sand_warrior",
                  "name": "沙漠战士",
                  "x": 75,
                  "y": 65,
                  "sprite": "/img/npcs/npc_sand_warrior.png",
                  "defaultText": "沙漠的试炼可是很严酷的！"
                }
              ]
            },
            {
              "id": 2,
              "name": "远古遗迹",
              "icon": "🏛️",
              "description": "被黄沙掩埋的遗迹，炎沙暴龙在深处咆哮。",
              "bgGradient": "linear-gradient(180deg, #ffa726 0%, #ff9800 100%)",
              "backgroundImage": "/img/scenes/desert-ruins.png",
              "maxSpawns": 5,
              "refreshInterval": 30,
              "requiredLevel": 45,
              "wildPets": [
                {"petId": 78, "minLevel": 45, "maxLevel": 52, "rate": 70},
                {"petId": 81, "minLevel": 45, "maxLevel": 52, "rate": 30}
              ],
              "boss": {
                "petId": 79,
                "level": 50,
                "name": "炎沙暴龙·沙皇",
                "rate": 100,
                "essenceId": "fire"
              },
              "npcs": [
                {
                  "id": "npc_sand_king",
                  "name": "沙漠法老",
                  "x": 25,
                  "y": 55,
                  "sprite": "/img/npcs/npc_sand_king.png",
                  "defaultText": "打扰法老安眠者，死！"
                }
              ]
            }
        ]
    elif planet['id'] == 8:  # 幻梦星
        planet['scenes'] = [
            {
              "id": 0,
              "name": "梦境花园",
              "icon": "🌸",
              "description": "充满发光植物的花园。",
              "bgGradient": "linear-gradient(180deg, #e1bee7 0%, #ce93d8 100%)",
              "backgroundImage": "/img/scenes/dream-garden.png",
              "maxSpawns": 4,
              "refreshInterval": 30,
              "requiredLevel": 40,
              "wildPets": [
                {"petId": 69, "minLevel": 40, "maxLevel": 45, "rate": 50},
                {"petId": 85, "minLevel": 40, "maxLevel": 45, "rate": 50}
              ],
              "npcs": [
                {
                  "id": "npc_illusion_guide",
                  "name": "幻境向导",
                  "x": 65,
                  "y": 55,
                  "sprite": "/img/npcs/npc_illusion_guide.png",
                  "defaultText": "跟我来，不要迷失在花海中。"
                }
              ]
            },
            {
              "id": 1,
              "name": "幻影迷林",
              "icon": "🌲",
              "description": "充满迷雾的森林，方向感会在这里消失。",
              "bgGradient": "linear-gradient(180deg, #ce93d8 0%, #ba68c8 100%)",
              "backgroundImage": "/img/scenes/dream-forest.png",
              "maxSpawns": 5,
              "refreshInterval": 30,
              "requiredLevel": 45,
              "wildPets": [
                {"petId": 83, "minLevel": 45, "maxLevel": 52, "rate": 60},
                {"petId": 86, "minLevel": 45, "maxLevel": 52, "rate": 40}
              ],
              "npcs": [
                {
                  "id": "npc_dream_fairy",
                  "name": "梦境仙女",
                  "x": 30,
                  "y": 60,
                  "sprite": "/img/npcs/npc_dream_fairy.png",
                  "defaultText": "这森林里的粉末会让你昏睡哦。"
                }
              ]
            },
            {
              "id": 2,
              "name": "梦魇神殿",
              "icon": "🏯",
              "description": "织梦神栖息的神秘神殿，分不清现实与梦境。",
              "bgGradient": "linear-gradient(180deg, #ba68c8 0%, #ab47bc 100%)",
              "backgroundImage": "/img/scenes/dream-temple.png",
              "maxSpawns": 5,
              "refreshInterval": 30,
              "requiredLevel": 50,
              "wildPets": [
                {"petId": 83, "minLevel": 50, "maxLevel": 58, "rate": 70},
                {"petId": 86, "minLevel": 50, "maxLevel": 58, "rate": 30}
              ],
              "boss": {
                "petId": 84,
                "level": 55,
                "name": "虹光梦凤·织梦神",
                "rate": 100,
                "essenceId": "light"
              },
              "npcs": [
                {
                  "id": "npc_nightmare",
                  "name": "噩梦之主",
                  "x": 75,
                  "y": 45,
                  "sprite": "/img/npcs/npc_nightmare.png",
                  "defaultText": "深陷于噩梦之中吧！"
                }
              ]
            }
        ]
    elif planet['id'] == 9:  # 机械星
        planet['scenes'] = [
            {
              "id": 0,
              "name": "废弃工厂",
              "icon": "🏭",
              "description": "轰鸣声不断的钢铁工厂。",
              "bgGradient": "linear-gradient(180deg, #cfd8dc 0%, #b0bec5 100%)",
              "backgroundImage": "/img/scenes/mech-factory.png",
              "maxSpawns": 4,
              "refreshInterval": 30,
              "requiredLevel": 45,
              "wildPets": [
                {"petId": 70, "minLevel": 45, "maxLevel": 50, "rate": 50},
                {"petId": 90, "minLevel": 45, "maxLevel": 50, "rate": 50}
              ],
              "npcs": [
                {
                  "id": "npc_cyborg_rebel",
                  "name": "改造人叛军",
                  "x": 80,
                  "y": 60,
                  "sprite": "/img/npcs/npc_cyborg_rebel.png",
                  "defaultText": "这帮废铜烂铁交给我对付！"
                }
              ]
            },
            {
              "id": 1,
              "name": "数据走廊",
              "icon": "🚇",
              "description": "光缆交织的通道，充满高压电流。",
              "bgGradient": "linear-gradient(180deg, #b0bec5 0%, #90a4ae 100%)",
              "backgroundImage": "/img/scenes/mech-corridor.png",
              "maxSpawns": 5,
              "refreshInterval": 30,
              "requiredLevel": 50,
              "wildPets": [
                {"petId": 88, "minLevel": 50, "maxLevel": 58, "rate": 60},
                {"petId": 91, "minLevel": 50, "maxLevel": 58, "rate": 40}
              ],
              "npcs": [
                {
                  "id": "npc_mech_engineer",
                  "name": "机械工程师",
                  "x": 25,
                  "y": 55,
                  "sprite": "/img/npcs/npc_mech_engineer.png",
                  "defaultText": "这里的线路完全混乱了！"
                }
              ]
            },
            {
              "id": 2,
              "name": "中央主脑",
              "icon": "🧠",
              "description": "控制整个星球的主脑核心，量子机神在此运算。",
              "bgGradient": "linear-gradient(180deg, #90a4ae 0%, #78909c 100%)",
              "backgroundImage": "/img/scenes/mech-core.png",
              "maxSpawns": 5,
              "refreshInterval": 30,
              "requiredLevel": 55,
              "wildPets": [
                {"petId": 88, "minLevel": 55, "maxLevel": 62, "rate": 70},
                {"petId": 91, "minLevel": 55, "maxLevel": 62, "rate": 30}
              ],
              "boss": {
                "petId": 89,
                "level": 58,
                "name": "量子机神·欧米茄",
                "rate": 100,
                "essenceId": "electric"
              },
              "npcs": [
                {
                  "id": "npc_mech_overlord",
                  "name": "超级AI",
                  "x": 75,
                  "y": 65,
                  "sprite": "/img/npcs/npc_mech_overlord.png",
                  "defaultText": "逻辑错误...执行抹杀程序。"
                }
              ]
            }
        ]
    elif planet['id'] == 10:  # 熔核星
        planet['scenes'] = [
            {
              "id": 0,
              "name": "地壳裂缝",
              "icon": "🌋",
              "description": "岩浆喷涌的危险裂缝。",
              "bgGradient": "linear-gradient(180deg, #ff8a65 0%, #ff7043 100%)",
              "backgroundImage": "/img/scenes/magma-rift.png",
              "maxSpawns": 4,
              "refreshInterval": 30,
              "requiredLevel": 50,
              "wildPets": [
                {"petId": 71, "minLevel": 50, "maxLevel": 55, "rate": 50},
                {"petId": 95, "minLevel": 50, "maxLevel": 55, "rate": 50}
              ],
              "npcs": [
                {
                  "id": "npc_fire_spirit",
                  "name": "灰烬精灵",
                  "x": 65,
                  "y": 50,
                  "sprite": "/img/npcs/npc_fire_spirit.png",
                  "defaultText": "小心别被烫伤哦~"
                }
              ]
            },
            {
              "id": 1,
              "name": "熔岩之河",
              "icon": "♨️",
              "description": "流淌着岩浆的地下暗河，深不见底。",
              "bgGradient": "linear-gradient(180deg, #ff7043 0%, #f4511e 100%)",
              "backgroundImage": "/img/scenes/lava-river.png",
              "maxSpawns": 5,
              "refreshInterval": 30,
              "requiredLevel": 55,
              "wildPets": [
                {"petId": 93, "minLevel": 55, "maxLevel": 62, "rate": 60},
                {"petId": 96, "minLevel": 55, "maxLevel": 62, "rate": 40}
              ],
              "npcs": [
                {
                  "id": "npc_lava_keeper",
                  "name": "熔岩守望者",
                  "x": 20,
                  "y": 65,
                  "sprite": "/img/npcs/npc_lava_keeper.png",
                  "defaultText": "这里的热量正在不断攀升。"
                }
              ]
            },
            {
              "id": 2,
              "name": "深渊祭坛",
              "icon": "👁️",
              "description": "熔核星最深处的禁忌之地，深渊冥龙在此沉睡。",
              "bgGradient": "linear-gradient(180deg, #f4511e 0%, #d84315 100%)",
              "backgroundImage": "/img/scenes/abyss-altar.png",
              "maxSpawns": 5,
              "refreshInterval": 30,
              "requiredLevel": 60,
              "wildPets": [
                {"petId": 93, "minLevel": 60, "maxLevel": 68, "rate": 70},
                {"petId": 96, "minLevel": 60, "maxLevel": 68, "rate": 30}
              ],
              "boss": {
                "petId": 94,
                "level": 62,
                "name": "深渊冥龙·末日",
                "rate": 100,
                "essenceId": "dark"
              },
              "npcs": [
                {
                  "id": "npc_abyss_lord",
                  "name": "深渊领主",
                  "x": 80,
                  "y": 55,
                  "sprite": "/img/npcs/npc_abyss_lord.png",
                  "defaultText": "一切终将归于虚无。"
                }
              ]
            }
        ]

with open('/home/ubuntu/data2/vibe_coding/saierhao/data/maps.json', 'w') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)
