#!/usr/bin/env python3
"""Comprehensive bug audit for the game's story quest system."""
import json, os, sys

BASE = os.path.dirname(os.path.abspath(__file__))

with open(os.path.join(BASE, 'data/story_quests.json'), encoding='utf-8') as f:
    sq = json.load(f)
with open(os.path.join(BASE, 'data/maps.json'), encoding='utf-8') as f:
    maps = json.load(f)
with open(os.path.join(BASE, 'data/pets.json'), encoding='utf-8') as f:
    pets = json.load(f)

# Build lookup tables
all_npc_ids_in_maps = {}  # planet_id -> {scene_idx -> [npc_ids]}
all_boss_in_maps = {}     # planet_id -> boss petId
all_pet_ids_in_maps = {}  # planet_id -> set of petIds in wildPets
planet_names = {}
available_npc_images = set()

for fname in os.listdir(os.path.join(BASE, 'public/img/npcs')):
    if fname.endswith('.png'):
        available_npc_images.add(fname.replace('.png', ''))

pet_ids_set = set(p['id'] for p in pets['pets'])

for g in maps['galaxies']:
    for p in g['planets']:
        pid = p['id']
        planet_names[pid] = p['name']
        all_npc_ids_in_maps[pid] = {}
        all_pet_ids_in_maps[pid] = set()
        for si, scene in enumerate(p['scenes']):
            npc_ids = [npc['id'] for npc in scene.get('npcs', [])]
            all_npc_ids_in_maps[pid][si] = npc_ids
            for wp in scene.get('wildPets', []):
                all_pet_ids_in_maps[pid].add(wp['petId'])
            if 'boss' in scene:
                all_boss_in_maps[pid] = scene['boss']['petId']

bugs = []
warnings = []

# ===== AUDIT 1: Story quest data integrity =====
for pid_str, pdata in sq['planets'].items():
    pid = int(pid_str)
    pname = pdata.get('name', planet_names.get(pid, f'Planet {pid}'))
    
    # Check planet exists in maps
    if pid not in planet_names:
        bugs.append(f"[DATA] Planet {pid} ({pname}) has story quests but doesn't exist in maps.json")
        continue
    
    steps = pdata.get('steps', [])
    if not steps:
        bugs.append(f"[DATA] Planet {pid} ({pname}) has no steps defined")
        continue
    
    # Check step numbering is sequential
    step_nums = [s['step'] for s in steps]
    for i, sn in enumerate(step_nums):
        if sn != i:
            bugs.append(f"[DATA] Planet {pid} ({pname}) step numbering gap: expected step {i}, got {sn}")
    
    for step in steps:
        stype = step.get('type')
        sid = step.get('step')
        
        # Check required fields
        if 'description' not in step:
            warnings.append(f"[DATA] Planet {pid} Step {sid}: missing description")
        if 'targetCount' not in step:
            bugs.append(f"[DATA] Planet {pid} Step {sid}: missing targetCount")
        
        # Check NPC talk steps
        if stype == 'npc_talk':
            target_id = step.get('targetId')
            if not target_id:
                bugs.append(f"[DATA] Planet {pid} Step {sid}: npc_talk with no targetId")
                continue
            
            # Check if NPC exists in ANY scene
            found_in_scene = -1
            for si, npc_ids in all_npc_ids_in_maps.get(pid, {}).items():
                if target_id in npc_ids:
                    found_in_scene = si
                    break
            
            if found_in_scene == -1:
                bugs.append(f"[CRITICAL] Planet {pid} Step {sid}: npc_talk targets '{target_id}' but this NPC doesn't exist in any scene of planet {pid}!")
            
        # Check battle steps
        elif stype == 'battle':
            target_id = step.get('targetId')
            if target_id:
                if isinstance(target_id, list):
                    for tid in target_id:
                        if tid not in pet_ids_set:
                            bugs.append(f"[DATA] Planet {pid} Step {sid}: battle targetId {tid} doesn't exist in pets.json")
                        if tid not in all_pet_ids_in_maps.get(pid, set()) and tid not in [all_boss_in_maps.get(pid)]:
                            warnings.append(f"[DATA] Planet {pid} Step {sid}: battle targetId {tid} may not spawn on this planet")
                elif isinstance(target_id, int):
                    if target_id not in pet_ids_set:
                        bugs.append(f"[DATA] Planet {pid} Step {sid}: battle targetId {target_id} doesn't exist in pets.json")
        
        # Check boss_battle steps
        elif stype == 'boss_battle':
            target_id = step.get('targetId')
            actual_boss = all_boss_in_maps.get(pid)
            if target_id and actual_boss and target_id != actual_boss:
                bugs.append(f"[CRITICAL] Planet {pid} Step {sid}: boss_battle targets petId {target_id} but actual boss is {actual_boss}")
            if not actual_boss:
                bugs.append(f"[CRITICAL] Planet {pid} Step {sid}: boss_battle defined but no boss exists on this planet!")
        
        # Check dialogue avatars
        for dlg_key in ['startDialogues', 'endDialogues']:
            for d in step.get(dlg_key, []):
                avatar = d.get('avatar', '')
                if not avatar:
                    warnings.append(f"[UI] Planet {pid} Step {sid}: dialogue has empty avatar for character '{d.get('character','?')}'")
                elif avatar.startswith('npc_') and avatar not in available_npc_images:
                    bugs.append(f"[UI] Planet {pid} Step {sid}: avatar '{avatar}' has no image file in /img/npcs/")
                
                if not d.get('text'):
                    bugs.append(f"[DATA] Planet {pid} Step {sid}: dialogue has empty text for character '{d.get('character','?')}'")
                if not d.get('character'):
                    bugs.append(f"[DATA] Planet {pid} Step {sid}: dialogue has empty character name")

# ===== AUDIT 2: Check all planets 1-15 have story quests =====
for pid in range(1, 16):
    if str(pid) not in sq['planets']:
        bugs.append(f"[CRITICAL] Planet {pid} ({planet_names.get(pid, '?')}) has no story quests defined!")

# ===== AUDIT 3: Check step type validity =====
VALID_TYPES = {'dialogue', 'battle', 'boss_battle', 'npc_talk', 'npc_battle', 'explore'}
for pid_str, pdata in sq['planets'].items():
    for step in pdata.get('steps', []):
        if step.get('type') not in VALID_TYPES:
            bugs.append(f"[DATA] Planet {pid_str} Step {step['step']}: unknown step type '{step.get('type')}'")

# ===== AUDIT 4: Reward structure integrity =====
for pid_str, pdata in sq['planets'].items():
    for step in pdata.get('steps', []):
        rewards = step.get('rewards', {})
        if rewards:
            if 'money' in rewards and not isinstance(rewards['money'], (int, float)):
                bugs.append(f"[DATA] Planet {pid_str} Step {step['step']}: invalid money reward type")
            if 'exp' in rewards and not isinstance(rewards['exp'], (int, float)):
                bugs.append(f"[DATA] Planet {pid_str} Step {step['step']}: invalid exp reward type")

# ===== Print results =====
print("=" * 60)
print("COMPREHENSIVE BUG AUDIT RESULTS")
print("=" * 60)

if bugs:
    print(f"\n🐛 BUGS FOUND: {len(bugs)}")
    for b in sorted(bugs):
        print(f"  ❌ {b}")
else:
    print("\n✅ No bugs found!")

if warnings:
    print(f"\n⚠️  WARNINGS: {len(warnings)}")
    for w in sorted(warnings[:20]):  # limit output
        print(f"  ⚠️  {w}")
    if len(warnings) > 20:
        print(f"  ... and {len(warnings)-20} more warnings")

print(f"\nTotal: {len(bugs)} bugs, {len(warnings)} warnings")
