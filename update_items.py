import json

with open('data/items.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

for item in data.get('wardrobe', []):
    item_id = item.get('id')
    item['icon'] = f"/img/wardrobe/{item_id}.png"

with open('data/items.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print("Updated data/items.json")
