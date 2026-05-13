import json

with open('/home/ubuntu/data2/vibe_coding/saierhao/data/maps.json', 'r') as f:
    maps = json.load(f)

athena = [g for g in maps['galaxies'] if g['id']==3][0]

print("galaxy_3.png")

for p in athena['planets']:
    print(f"planet_{p['id']}.png")
    for s in p['scenes']:
        bg = s.get('backgroundImage')
        if bg: print(bg.split('/')[-1])
        for npc in s.get('npcs', []):
            sp = npc.get('sprite')
            if sp: print(sp.split('/')[-1])

