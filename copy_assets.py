import os
import glob
import shutil

src_dir_old = '/home/ubuntu/.gemini/antigravity/brain/714ebf9b-90c4-468c-b417-9067c358d8bf/'
src_dir_new = '/home/ubuntu/.gemini/antigravity/brain/ccf3e703-065f-4fad-8a83-1ecb68dee673/'
dest_dir = '/home/ubuntu/data2/vibe_coding/saierhao/public/img/'

def copy_file(pattern, dest_rel_path, src_dir=src_dir_old):
    files = glob.glob(os.path.join(src_dir, pattern))
    if files:
        latest = max(files, key=os.path.getctime)
        dest = os.path.join(dest_dir, dest_rel_path)
        shutil.copy2(latest, dest)
        print(f"Copied {os.path.basename(latest)} to {dest_rel_path}")
    else:
        print(f"WARNING: Could not find {pattern}")

# Scenes (replace _ with - for the dest names)
scenes = [
    'stardust_corridor', 'meteor_wasteland', 'eye_of_void',
    'crystal_valley', 'refraction_maze', 'radiant_matrix',
    'corrupt_swamp', 'acid_rain_jungle', 'plague_source',
    'silent_wilderness', 'echo_valley', 'concerto_temple',
    'stalled_pendulum', 'gear_city', 'eternal_hourglass'
]
for s in scenes:
    dest_name = s.replace('_', '-') + '.png'
    copy_file(s + '_*.png', f"scenes/{dest_name}")

# NPCs
npc_map = {
    'npc_stargazer': 'npc_stargazer.png',
    'npc_void_walker': 'npc_void_walker.png',
    'npc_abyss_guard': 'npc_abyss_guard.png',
    'npc_crystal_mage': 'npc_crystal_miner.png',
    'npc_light_weaver': 'npc_light_weaver.png',
    'npc_archangel_guard': 'npc_archangel_projection.png',
    'npc_swamp_hermit': 'npc_swamp_hermit.png',
    'npc_mutant_survivor': 'npc_mutant_hunter.png',
    'npc_plague_doctor': 'npc_plague_doctor.png',
    'npc_requiem_priestess': 'npc_silent_monk.png',
    'npc_bard_spirit': 'npc_bard.png',
    'npc_echo_phantom': 'npc_maestro.png',
    'npc_time_traveler': 'npc_time_traveler.png',
    'npc_clockmaker': 'npc_clock_maker.png',
    'npc_guardian_of_time': 'npc_keeper_of_time.png'
}
for src, dest in npc_map.items():
    copy_file(src + '_*.png', f"npcs/{dest}")

# Pets
for i in range(101, 116):
    copy_file(f"pet_{i}_*.png", f"pets/{i}.png")

# New Planets & Galaxy
copy_file('galaxy_3_*.png', 'galaxies/galaxy_3.png', src_dir=src_dir_new)
for i in range(11, 16):
    copy_file(f"planet_{i}_*.png", f"planets/planet_{i}.png", src_dir=src_dir_new)

print("Copy complete!")
