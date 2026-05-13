import json

with open('/home/ubuntu/data2/vibe_coding/saierhao/data/maps.json', 'r') as f:
    maps = json.load(f)

with open('/home/ubuntu/data2/vibe_coding/saierhao/data/story_quests.json', 'r') as f:
    story = json.load(f)

with open('/home/ubuntu/data2/vibe_coding/saierhao/data/pets.json', 'r') as f:
    pets = json.load(f)

ares = next(g for g in maps['galaxies'] if g['id'] == 2)
for p in ares['planets']:
    print(f"Planet {p['id']}: {p['name']} has {len(p['scenes'])} scenes.")
    
for p_id, steps in story['planets'].items():
    if int(p_id) in [6, 7, 8, 9, 10]:
        print(f"Story for planet {p_id} has {len(steps.get('steps', []))} steps.")

