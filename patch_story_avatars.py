import json
import os

with open('/home/ubuntu/data2/vibe_coding/saierhao/data/story_quests.json', 'r', encoding='utf-8') as f:
    story = json.load(f)

# Existing NPCs based on ls
available_npcs = [
    "npc_abyss_guard", "npc_abyss_lord", "npc_ai_core", "npc_archangel_projection",
    "npc_bard", "npc_clock_maker", "npc_crystal_miner", "npc_cyborg_rebel",
    "npc_desert_merchant", "npc_dream_fairy", "npc_dream_weaver", "npc_elder_fire",
    "npc_engineer", "npc_fairy", "npc_fire_spirit", "npc_guard", "npc_ice_guardian",
    "npc_ice_king", "npc_ice_witch", "npc_illusion_guide", "npc_keeper_of_time",
    "npc_lava_keeper", "npc_light_weaver", "npc_lost_explorer", "npc_maestro",
    "npc_magma_lord", "npc_mech_engineer", "npc_mech_overlord", "npc_mermaid",
    "npc_miner", "npc_mutant_hunter", "npc_nightmare", "npc_oracle",
    "npc_plague_doctor", "npc_priest", "npc_ranger", "npc_ruin_scholar",
    "npc_sailor", "npc_sand_king", "npc_sand_warrior", "npc_silent_monk",
    "npc_stargazer", "npc_swamp_hermit", "npc_time_traveler", "npc_void_walker",
    "player", "rogers"
]

fallback_map = {
    "npc_stardust_observer": "npc_stargazer",
    "npc_void_scout": "npc_void_walker",
    "npc_light_sage": "npc_light_weaver",
    "npc_angel_guard": "npc_archangel_projection",
    "npc_hazmat": "npc_plague_doctor",
    "npc_void_mage": "npc_void_walker",
    "npc_music_sprite": "npc_bard",
    "npc_void_conductor": "npc_maestro",
    "npc_time_keeper": "npc_keeper_of_time",
    "npc_void_boss": "npc_abyss_lord",
    "npc_rebel_leader": "npc_cyborg_rebel",
    "npc_gatekeeper": "npc_abyss_guard",
    "npc_dark_ranger": "npc_mutant_hunter",
    "npc_mechanic": "npc_mech_engineer",
    "npc_dream_fairy": "npc_dream_fairy",
    "npc_dream_weaver": "npc_dream_weaver",
    "npc_nightmare": "npc_nightmare"
}

for pid, pdata in story['planets'].items():
    for step in pdata['steps']:
        if 'startDialogues' in step:
            for d in step['startDialogues']:
                if d['avatar'] in fallback_map:
                    d['avatar'] = fallback_map[d['avatar']]
                elif d['avatar'] not in available_npcs and not d['avatar'].startswith('boss_'):
                    print(f"Unknown avatar: {d['avatar']}")
                    d['avatar'] = "rogers"
        if 'endDialogues' in step:
            for d in step['endDialogues']:
                if d['avatar'] in fallback_map:
                    d['avatar'] = fallback_map[d['avatar']]
                elif d['avatar'] not in available_npcs and not d['avatar'].startswith('boss_'):
                    print(f"Unknown avatar: {d['avatar']}")
                    d['avatar'] = "rogers"

with open('/home/ubuntu/data2/vibe_coding/saierhao/data/story_quests.json', 'w', encoding='utf-8') as f:
    json.dump(story, f, ensure_ascii=False, indent=2)

print("Avatar fallbacks applied.")
