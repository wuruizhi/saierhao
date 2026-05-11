import json
import traceback
try:
    with open('data/story_quests.json', 'r', encoding='utf-8') as f:
        data = json.load(f)
    print("KEYS:", data['planets'].keys())
except Exception as e:
    traceback.print_exc()
