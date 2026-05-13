import json

# 1. Update skills.json
with open('/home/ubuntu/data2/vibe_coding/saierhao/data/skills.json', 'r') as f:
    skills_data = json.load(f)

new_skills = [
    {"id": 101, "name": "星尘冲击", "type": "dark", "category": "special", "power": 55, "accuracy": 100, "pp": 20, "description": "星尘浮游专属·星尘能量冲击"},
    {"id": 102, "name": "吞噬漩涡", "type": "dark", "category": "special", "power": 90, "accuracy": 95, "pp": 10, "description": "深渊吞噬者专属·产生吞噬漩涡，吸收伤害的20%", "drain": 0.2},
    {"id": 103, "name": "黑洞湮灭", "type": "dark", "category": "special", "power": 140, "accuracy": 80, "pp": 5, "description": "虚空行者专属·释放黑洞湮灭一切，可能降低敌方速度", "debuff": {"stat": "speed", "statMult": 0.6, "turns": 3}},
    
    {"id": 104, "name": "棱镜折射", "type": "light", "category": "special", "power": 55, "accuracy": 100, "pp": 20, "description": "晶棱角专属·折射出耀眼光芒，提升自身防御", "buff": {"defense": 1.2}},
    {"id": 105, "name": "七彩光束", "type": "light", "category": "special", "power": 90, "accuracy": 95, "pp": 10, "description": "闪耀棱柱专属·七彩光束轰击，可能降低敌方攻击", "debuff": {"stat": "attack", "statMult": 0.8, "turns": 2}},
    {"id": 106, "name": "大天使之耀", "type": "light", "category": "special", "power": 140, "accuracy": 80, "pp": 5, "description": "光辉大天使专属·绽放天使之耀，恢复自身20%HP", "heal": 0.2},
    
    {"id": 107, "name": "剧毒污泥", "type": "water", "category": "special", "power": 55, "accuracy": 100, "pp": 20, "description": "污泥怪专属·喷射剧毒污泥", "poison": {"turns": 2, "hpPercent": 0.05}},
    {"id": 108, "name": "沼泽地狱", "type": "water", "category": "special", "power": 90, "accuracy": 90, "pp": 10, "description": "剧毒沼王专属·将敌人拖入沼泽", "poison": {"turns": 3, "hpPercent": 0.08}},
    {"id": 109, "name": "瘟疫爆发", "type": "water", "category": "special", "power": 140, "accuracy": 80, "pp": 5, "description": "疫病之源专属·爆发恐怖瘟疫，剧毒侵蚀", "poison": {"turns": 5, "hpPercent": 0.12}},
    
    {"id": 110, "name": "催眠之音", "type": "normal", "category": "status", "power": 0, "accuracy": 90, "pp": 15, "description": "音符精灵专属·催眠音符，使敌方麻痹", "paralyze": {"turns": 2, "speedMult": 0.5, "chance": 1.0}},
    {"id": 111, "name": "幻音震荡", "type": "normal", "category": "special", "power": 90, "accuracy": 100, "pp": 10, "description": "幻音歌者专属·强烈音波震荡，降低敌方防御", "debuff": {"stat": "defense", "statMult": 0.7, "turns": 3}},
    {"id": 112, "name": "绝望安魂曲", "type": "normal", "category": "special", "power": 140, "accuracy": 80, "pp": 5, "description": "夜莺专属·吟唱绝望的安魂曲，吸收伤害30%", "drain": 0.3},
    
    {"id": 113, "name": "齿轮撞击", "type": "electric", "category": "physical", "power": 60, "accuracy": 100, "pp": 20, "description": "发条鼠专属·高速齿轮撞击"},
    {"id": 114, "name": "机械压制", "type": "electric", "category": "physical", "power": 95, "accuracy": 90, "pp": 10, "description": "齿轮巨兵专属·重型机械压制，必定先制", "priority": True},
    {"id": 115, "name": "时间停止", "type": "electric", "category": "special", "power": 140, "accuracy": 75, "pp": 5, "description": "时光领主专属·停止时间流动，使敌方严重麻痹", "paralyze": {"turns": 3, "speedMult": 0.2, "chance": 0.8}}
]

existing_skill_ids = [s['id'] for s in skills_data['skills']]
for ns in new_skills:
    if ns['id'] not in existing_skill_ids:
        skills_data['skills'].append(ns)
    else:
        for i, s in enumerate(skills_data['skills']):
            if s['id'] == ns['id']:
                skills_data['skills'][i] = ns

with open('/home/ubuntu/data2/vibe_coding/saierhao/data/skills.json', 'w', encoding='utf-8') as f:
    json.dump(skills_data, f, ensure_ascii=False, indent=2)

# 2. Update pets.json learnsets
with open('/home/ubuntu/data2/vibe_coding/saierhao/data/pets.json', 'r') as f:
    pets_data = json.load(f)

for p in pets_data['pets']:
    pid = p['id']
    if pid == 101:
        p['learnset'] = [{"level": 1, "skillId": 34}, {"level": 15, "skillId": 101}]
    elif pid == 102:
        p['learnset'] = [{"level": 1, "skillId": 34}, {"level": 15, "skillId": 101}, {"level": 30, "skillId": 102}]
    elif pid == 103:
        p['learnset'] = [{"level": 1, "skillId": 101}, {"level": 30, "skillId": 102}, {"level": 45, "skillId": 103}]
    elif pid == 104:
        p['learnset'] = [{"level": 1, "skillId": 29}, {"level": 15, "skillId": 104}]
    elif pid == 105:
        p['learnset'] = [{"level": 1, "skillId": 29}, {"level": 15, "skillId": 104}, {"level": 30, "skillId": 105}]
    elif pid == 106:
        p['learnset'] = [{"level": 1, "skillId": 104}, {"level": 30, "skillId": 105}, {"level": 45, "skillId": 106}]
    elif pid == 107:
        p['learnset'] = [{"level": 1, "skillId": 5}, {"level": 15, "skillId": 107}]
    elif pid == 108:
        p['learnset'] = [{"level": 1, "skillId": 5}, {"level": 15, "skillId": 107}, {"level": 30, "skillId": 108}]
    elif pid == 109:
        p['learnset'] = [{"level": 1, "skillId": 107}, {"level": 30, "skillId": 108}, {"level": 45, "skillId": 109}]
    elif pid == 110:
        p['learnset'] = [{"level": 1, "skillId": 7}, {"level": 15, "skillId": 110}]
    elif pid == 111:
        p['learnset'] = [{"level": 1, "skillId": 7}, {"level": 15, "skillId": 110}, {"level": 30, "skillId": 111}]
    elif pid == 112:
        p['learnset'] = [{"level": 1, "skillId": 110}, {"level": 30, "skillId": 111}, {"level": 45, "skillId": 112}]
    elif pid == 113:
        p['learnset'] = [{"level": 1, "skillId": 24}, {"level": 15, "skillId": 113}]
    elif pid == 114:
        p['learnset'] = [{"level": 1, "skillId": 24}, {"level": 15, "skillId": 113}, {"level": 30, "skillId": 114}]
    elif pid == 115:
        p['learnset'] = [{"level": 1, "skillId": 113}, {"level": 30, "skillId": 114}, {"level": 45, "skillId": 115}]

with open('/home/ubuntu/data2/vibe_coding/saierhao/data/pets.json', 'w', encoding='utf-8') as f:
    json.dump(pets_data, f, ensure_ascii=False, indent=2)

print("Updated skills and pets data.")
