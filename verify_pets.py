import json

with open('/home/ubuntu/data2/vibe_coding/saierhao/data/pets.json', 'r') as f:
    pets = json.load(f)

for p in pets['pets']:
    if p['id'] >= 67:
        if 'baseStats' not in p or 'growthRate' not in p:
            print(f"Pet {p['id']} is missing stats!")
        else:
            print(f"Pet {p['id']} OK.")

