import json

with open('/home/ubuntu/data2/vibe_coding/saierhao/data/pets.json', 'r') as f:
    data = json.load(f)

# Remove pets >= 67
data['pets'] = [p for p in data['pets'] if p['id'] < 67]

new_pets = [
    {
      "id": 67,
      "name": "冰晶鹿",
      "type": "water",
      "description": "生活在冰霜星的温顺精灵。",
      "baseStats": {"hp": 45, "attack": 40, "defense": 35, "speed": 50, "spAttack": 60, "spDefense": 40},
      "growthRate": {"hp": 2.0, "attack": 1.5, "defense": 1.2, "speed": 1.8, "spAttack": 2.2, "spDefense": 1.5},
      "learnset": [
        {"level": 1, "skillId": 5},
        {"level": 8, "skillId": 12},
        {"level": 15, "skillId": 81}
      ],
      "evolution": {"level": 20, "to": 73},
      "captureRate": 80,
      "captureGuide": "血量越低越容易捕捉。"
    },
    {
      "id": 73,
      "name": "霜角麋",
      "type": "water",
      "description": "头上的霜角能释放冻气。",
      "baseStats": {"hp": 65, "attack": 55, "defense": 50, "speed": 70, "spAttack": 85, "spDefense": 60},
      "growthRate": {"hp": 2.5, "attack": 1.8, "defense": 1.8, "speed": 2.2, "spAttack": 2.8, "spDefense": 2.0},
      "learnset": [
        {"level": 1, "skillId": 5},
        {"level": 8, "skillId": 12},
        {"level": 15, "skillId": 81},
        {"level": 25, "skillId": 74},
        {"level": 32, "skillId": 82}
      ],
      "evolution": {"level": 40, "to": 74},
      "captureRate": 40,
      "captureGuide": "需要中级以上的胶囊。"
    },
    {
      "id": 74,
      "name": "极光冰麟",
      "type": "water",
      "description": "冰霜星的守护者之一，拥有极光的力量。",
      "baseStats": {"hp": 90, "attack": 75, "defense": 70, "speed": 95, "spAttack": 120, "spDefense": 85},
      "growthRate": {"hp": 3.0, "attack": 2.2, "defense": 2.0, "speed": 2.8, "spAttack": 3.5, "spDefense": 2.5},
      "learnset": [
        {"level": 1, "skillId": 81},
        {"level": 25, "skillId": 74},
        {"level": 32, "skillId": 82},
        {"level": 42, "skillId": 83},
        {"level": 50, "skillId": 84}
      ],
      "captureRate": 15,
      "captureGuide": "难以捕捉，需要高级胶囊。"
    },
    {
      "id": 75,
      "name": "雪原兔",
      "type": "water",
      "description": "在雪地里跑得飞快的兔子。",
      "baseStats": {"hp": 40, "attack": 50, "defense": 30, "speed": 65, "spAttack": 35, "spDefense": 30},
      "growthRate": {"hp": 1.8, "attack": 2.0, "defense": 1.2, "speed": 2.5, "spAttack": 1.5, "spDefense": 1.2},
      "learnset": [
        {"level": 1, "skillId": 7},
        {"level": 10, "skillId": 85}
      ],
      "evolution": {"level": 22, "to": 76},
      "captureRate": 90,
      "captureGuide": "非常容易捕捉。"
    },
    {
      "id": 76,
      "name": "冰原战兔",
      "type": "water",
      "description": "双拳覆盖坚冰的格斗专家。",
      "baseStats": {"hp": 70, "attack": 95, "defense": 60, "speed": 105, "spAttack": 50, "spDefense": 55},
      "growthRate": {"hp": 2.5, "attack": 3.0, "defense": 1.8, "speed": 3.2, "spAttack": 1.8, "spDefense": 1.8},
      "learnset": [
        {"level": 1, "skillId": 7},
        {"level": 10, "skillId": 85},
        {"level": 28, "skillId": 86}
      ],
      "captureRate": 45,
      "captureGuide": "速度很快，建议先麻痹。"
    },
    {
      "id": 68,
      "name": "沙蜥",
      "type": "fire",
      "description": "能够在滚烫的沙子中潜游。",
      "baseStats": {"hp": 45, "attack": 55, "defense": 45, "speed": 50, "spAttack": 40, "spDefense": 35},
      "growthRate": {"hp": 2.0, "attack": 2.2, "defense": 1.8, "speed": 1.8, "spAttack": 1.5, "spDefense": 1.5},
      "learnset": [
        {"level": 1, "skillId": 1},
        {"level": 9, "skillId": 87}
      ],
      "evolution": {"level": 18, "to": 78},
      "captureRate": 85,
      "captureGuide": "普通胶囊即可。"
    },
    {
      "id": 78,
      "name": "烈沙龙蜥",
      "type": "fire",
      "description": "身上覆盖着坚硬的红色鳞片。",
      "baseStats": {"hp": 65, "attack": 80, "defense": 65, "speed": 70, "spAttack": 60, "spDefense": 50},
      "growthRate": {"hp": 2.5, "attack": 2.8, "defense": 2.2, "speed": 2.2, "spAttack": 2.0, "spDefense": 1.8},
      "learnset": [
        {"level": 1, "skillId": 1},
        {"level": 9, "skillId": 87},
        {"level": 22, "skillId": 9},
        {"level": 30, "skillId": 88}
      ],
      "evolution": {"level": 38, "to": 79},
      "captureRate": 45,
      "captureGuide": "中级胶囊。"
    },
    {
      "id": 79,
      "name": "炎沙暴龙",
      "type": "fire",
      "description": "沙漠星的霸主，能引发毁灭性的沙暴。",
      "baseStats": {"hp": 95, "attack": 115, "defense": 85, "speed": 85, "spAttack": 80, "spDefense": 70},
      "growthRate": {"hp": 3.2, "attack": 3.5, "defense": 2.8, "speed": 2.5, "spAttack": 2.5, "spDefense": 2.2},
      "learnset": [
        {"level": 1, "skillId": 87},
        {"level": 22, "skillId": 9},
        {"level": 30, "skillId": 88},
        {"level": 40, "skillId": 11},
        {"level": 48, "skillId": 89}
      ],
      "captureRate": 15,
      "captureGuide": "高级胶囊。"
    },
    {
      "id": 80,
      "name": "仙人球",
      "type": "grass",
      "description": "伪装成植物的精灵。",
      "baseStats": {"hp": 55, "attack": 40, "defense": 65, "speed": 20, "spAttack": 35, "spDefense": 55},
      "growthRate": {"hp": 2.5, "attack": 1.5, "defense": 2.8, "speed": 1.0, "spAttack": 1.5, "spDefense": 2.5},
      "learnset": [
        {"level": 1, "skillId": 17},
        {"level": 10, "skillId": 90}
      ],
      "evolution": {"level": 25, "to": 81},
      "captureRate": 95,
      "captureGuide": "非常容易捕捉。"
    },
    {
      "id": 81,
      "name": "沙棘巨人",
      "type": "grass",
      "description": "巨大的植物守卫。",
      "baseStats": {"hp": 100, "attack": 75, "defense": 105, "speed": 35, "spAttack": 50, "spDefense": 95},
      "growthRate": {"hp": 3.5, "attack": 2.5, "defense": 3.5, "speed": 1.5, "spAttack": 1.8, "spDefense": 3.0},
      "learnset": [
        {"level": 1, "skillId": 17},
        {"level": 10, "skillId": 90},
        {"level": 28, "skillId": 70},
        {"level": 36, "skillId": 91}
      ],
      "captureRate": 40,
      "captureGuide": "防御很高，慢慢磨血。"
    },
    {
      "id": 69,
      "name": "梦蝶",
      "type": "light",
      "description": "散发着微光的奇异蝴蝶。",
      "baseStats": {"hp": 40, "attack": 30, "defense": 30, "speed": 60, "spAttack": 65, "spDefense": 45},
      "growthRate": {"hp": 1.8, "attack": 1.2, "defense": 1.2, "speed": 2.2, "spAttack": 2.5, "spDefense": 1.8},
      "learnset": [
        {"level": 1, "skillId": 29},
        {"level": 10, "skillId": 41}
      ],
      "evolution": {"level": 18, "to": 83},
      "captureRate": 80,
      "captureGuide": "血量很低，小心打死。"
    },
    {
      "id": 83,
      "name": "幻彩蛾",
      "type": "light",
      "description": "翅膀上的粉末能让人产生幻觉。",
      "baseStats": {"hp": 60, "attack": 45, "defense": 45, "speed": 85, "spAttack": 90, "spDefense": 65},
      "growthRate": {"hp": 2.2, "attack": 1.5, "defense": 1.8, "speed": 2.8, "spAttack": 3.0, "spDefense": 2.2},
      "learnset": [
        {"level": 1, "skillId": 29},
        {"level": 10, "skillId": 41},
        {"level": 24, "skillId": 92}
      ],
      "evolution": {"level": 40, "to": 84},
      "captureRate": 45,
      "captureGuide": "中级胶囊。"
    },
    {
      "id": 84,
      "name": "虹光梦凤",
      "type": "light",
      "description": "幻梦星的神鸟，掌控梦境与现实的边界。",
      "baseStats": {"hp": 85, "attack": 65, "defense": 65, "speed": 110, "spAttack": 125, "spDefense": 85},
      "growthRate": {"hp": 2.8, "attack": 2.0, "defense": 2.2, "speed": 3.2, "spAttack": 3.8, "spDefense": 2.8},
      "learnset": [
        {"level": 1, "skillId": 41},
        {"level": 24, "skillId": 92},
        {"level": 42, "skillId": 32},
        {"level": 50, "skillId": 93}
      ],
      "captureRate": 10,
      "captureGuide": "极难捕捉，高级胶囊。"
    },
    {
      "id": 85,
      "name": "迷雾精",
      "type": "dark",
      "description": "在迷雾中诞生的暗影生物。",
      "baseStats": {"hp": 45, "attack": 35, "defense": 40, "speed": 55, "spAttack": 55, "spDefense": 50},
      "growthRate": {"hp": 2.0, "attack": 1.5, "defense": 1.5, "speed": 2.0, "spAttack": 2.2, "spDefense": 1.8},
      "learnset": [
        {"level": 1, "skillId": 34},
        {"level": 12, "skillId": 94}
      ],
      "evolution": {"level": 24, "to": 86},
      "captureRate": 85,
      "captureGuide": "普通胶囊。"
    },
    {
      "id": 86,
      "name": "幻境巫师",
      "type": "dark",
      "description": "擅长用诅咒折磨对手。",
      "baseStats": {"hp": 75, "attack": 55, "defense": 65, "speed": 85, "spAttack": 95, "spDefense": 85},
      "growthRate": {"hp": 2.8, "attack": 1.8, "defense": 2.2, "speed": 2.8, "spAttack": 3.2, "spDefense": 2.8},
      "learnset": [
        {"level": 1, "skillId": 34},
        {"level": 12, "skillId": 94},
        {"level": 30, "skillId": 95},
        {"level": 38, "skillId": 37}
      ],
      "captureRate": 40,
      "captureGuide": "中级胶囊。"
    },
    {
      "id": 70,
      "name": "齿轮鼠",
      "type": "electric",
      "description": "在废弃工厂里到处啃食电线的机械鼠。",
      "baseStats": {"hp": 40, "attack": 50, "defense": 55, "speed": 60, "spAttack": 30, "spDefense": 40},
      "growthRate": {"hp": 1.8, "attack": 2.0, "defense": 2.2, "speed": 2.2, "spAttack": 1.2, "spDefense": 1.5},
      "learnset": [
        {"level": 1, "skillId": 7},
        {"level": 10, "skillId": 24}
      ],
      "evolution": {"level": 18, "to": 88},
      "captureRate": 85,
      "captureGuide": "普通胶囊。"
    },
    {
      "id": 88,
      "name": "钢铁巨鼠",
      "type": "electric",
      "description": "全身覆盖厚重装甲的机械老鼠。",
      "baseStats": {"hp": 65, "attack": 75, "defense": 85, "speed": 80, "spAttack": 45, "spDefense": 60},
      "growthRate": {"hp": 2.5, "attack": 2.5, "defense": 2.8, "speed": 2.8, "spAttack": 1.8, "spDefense": 2.0},
      "learnset": [
        {"level": 1, "skillId": 7},
        {"level": 10, "skillId": 24},
        {"level": 22, "skillId": 96}
      ],
      "evolution": {"level": 38, "to": 89},
      "captureRate": 45,
      "captureGuide": "中级胶囊。"
    },
    {
      "id": 89,
      "name": "量子机神",
      "type": "electric",
      "description": "掌控量子能量的终极兵器。",
      "baseStats": {"hp": 90, "attack": 95, "defense": 105, "speed": 105, "spAttack": 110, "spDefense": 85},
      "growthRate": {"hp": 3.0, "attack": 3.0, "defense": 3.2, "speed": 3.2, "spAttack": 3.5, "spDefense": 2.8},
      "learnset": [
        {"level": 1, "skillId": 24},
        {"level": 22, "skillId": 96},
        {"level": 35, "skillId": 26},
        {"level": 45, "skillId": 76},
        {"level": 55, "skillId": 97}
      ],
      "captureRate": 10,
      "captureGuide": "极难捕捉，高级胶囊。"
    },
    {
      "id": 90,
      "name": "电路虫",
      "type": "electric",
      "description": "在电路板间穿梭的小虫。",
      "baseStats": {"hp": 35, "attack": 30, "defense": 35, "speed": 65, "spAttack": 55, "spDefense": 40},
      "growthRate": {"hp": 1.5, "attack": 1.2, "defense": 1.5, "speed": 2.5, "spAttack": 2.2, "spDefense": 1.8},
      "learnset": [
        {"level": 1, "skillId": 24},
        {"level": 12, "skillId": 80}
      ],
      "evolution": {"level": 20, "to": 91},
      "captureRate": 90,
      "captureGuide": "普通胶囊。"
    },
    {
      "id": 91,
      "name": "芯片蜂",
      "type": "electric",
      "description": "尾部带有高压电流的机械蜜蜂。",
      "baseStats": {"hp": 60, "attack": 50, "defense": 60, "speed": 105, "spAttack": 90, "spDefense": 70},
      "growthRate": {"hp": 2.2, "attack": 1.8, "defense": 2.0, "speed": 3.5, "spAttack": 3.0, "spDefense": 2.5},
      "learnset": [
        {"level": 1, "skillId": 24},
        {"level": 12, "skillId": 80},
        {"level": 28, "skillId": 26}
      ],
      "captureRate": 40,
      "captureGuide": "速度很快，中级胶囊。"
    },
    {
      "id": 71,
      "name": "熔岩蛇",
      "type": "dark",
      "description": "在熔岩中游弋的暗影之蛇。",
      "baseStats": {"hp": 45, "attack": 60, "defense": 40, "speed": 55, "spAttack": 50, "spDefense": 40},
      "growthRate": {"hp": 2.0, "attack": 2.2, "defense": 1.5, "speed": 2.0, "spAttack": 1.8, "spDefense": 1.5},
      "learnset": [
        {"level": 1, "skillId": 43},
        {"level": 10, "skillId": 35}
      ],
      "evolution": {"level": 20, "to": 93},
      "captureRate": 85,
      "captureGuide": "普通胶囊。"
    },
    {
      "id": 93,
      "name": "地裂巨蟒",
      "type": "dark",
      "description": "能够震裂大地的恐怖巨兽。",
      "baseStats": {"hp": 75, "attack": 85, "defense": 65, "speed": 75, "spAttack": 70, "spDefense": 65},
      "growthRate": {"hp": 2.8, "attack": 3.0, "defense": 2.2, "speed": 2.5, "spAttack": 2.5, "spDefense": 2.2},
      "learnset": [
        {"level": 1, "skillId": 43},
        {"level": 10, "skillId": 35},
        {"level": 24, "skillId": 98}
      ],
      "evolution": {"level": 42, "to": 94},
      "captureRate": 40,
      "captureGuide": "中级胶囊。"
    },
    {
      "id": 94,
      "name": "深渊冥龙",
      "type": "dark",
      "description": "熔核星深渊中沉睡的毁灭之王。",
      "baseStats": {"hp": 110, "attack": 125, "defense": 90, "speed": 95, "spAttack": 100, "spDefense": 85},
      "growthRate": {"hp": 3.5, "attack": 3.8, "defense": 2.8, "speed": 2.8, "spAttack": 3.0, "spDefense": 2.5},
      "learnset": [
        {"level": 1, "skillId": 35},
        {"level": 24, "skillId": 98},
        {"level": 35, "skillId": 36},
        {"level": 48, "skillId": 44},
        {"level": 58, "skillId": 99}
      ],
      "captureRate": 5,
      "captureGuide": "极难捕捉，高级胶囊。"
    },
    {
      "id": 95,
      "name": "灰烬蝙蝠",
      "type": "fire",
      "description": "在火山口附近飞舞的蝙蝠。",
      "baseStats": {"hp": 40, "attack": 55, "defense": 35, "speed": 70, "spAttack": 60, "spDefense": 40},
      "growthRate": {"hp": 1.8, "attack": 2.2, "defense": 1.5, "speed": 2.8, "spAttack": 2.5, "spDefense": 1.8},
      "learnset": [
        {"level": 1, "skillId": 1},
        {"level": 12, "skillId": 10}
      ],
      "evolution": {"level": 25, "to": 96},
      "captureRate": 85,
      "captureGuide": "普通胶囊。"
    },
    {
      "id": 96,
      "name": "暗焰魔翼",
      "type": "fire",
      "description": "翅膀燃烧着暗色火焰的魔物。",
      "baseStats": {"hp": 70, "attack": 85, "defense": 60, "speed": 105, "spAttack": 95, "spDefense": 65},
      "growthRate": {"hp": 2.5, "attack": 3.0, "defense": 2.0, "speed": 3.5, "spAttack": 3.2, "spDefense": 2.2},
      "learnset": [
        {"level": 1, "skillId": 1},
        {"level": 12, "skillId": 10},
        {"level": 30, "skillId": 100}
      ],
      "captureRate": 35,
      "captureGuide": "中高级胶囊。"
    }
]

data['pets'].extend(new_pets)

# Sort by id to keep it clean
data['pets'] = sorted(data['pets'], key=lambda x: x['id'])

with open('/home/ubuntu/data2/vibe_coding/saierhao/data/pets.json', 'w') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)
