import os
from rembg import remove, new_session
from PIL import Image

pets_to_process = [f'/home/ubuntu/data2/vibe_coding/saierhao/public/img/pets/{i}.png' for i in range(101, 116)]
npcs_to_process = [
    '/home/ubuntu/data2/vibe_coding/saierhao/public/img/npcs/npc_stargazer.png',
    '/home/ubuntu/data2/vibe_coding/saierhao/public/img/npcs/npc_void_walker.png',
    '/home/ubuntu/data2/vibe_coding/saierhao/public/img/npcs/npc_abyss_guard.png',
    '/home/ubuntu/data2/vibe_coding/saierhao/public/img/npcs/npc_crystal_miner.png',
    '/home/ubuntu/data2/vibe_coding/saierhao/public/img/npcs/npc_light_weaver.png',
    '/home/ubuntu/data2/vibe_coding/saierhao/public/img/npcs/npc_archangel_projection.png',
    '/home/ubuntu/data2/vibe_coding/saierhao/public/img/npcs/npc_swamp_hermit.png',
    '/home/ubuntu/data2/vibe_coding/saierhao/public/img/npcs/npc_mutant_hunter.png',
    '/home/ubuntu/data2/vibe_coding/saierhao/public/img/npcs/npc_plague_doctor.png',
    '/home/ubuntu/data2/vibe_coding/saierhao/public/img/npcs/npc_silent_monk.png',
    '/home/ubuntu/data2/vibe_coding/saierhao/public/img/npcs/npc_bard.png',
    '/home/ubuntu/data2/vibe_coding/saierhao/public/img/npcs/npc_maestro.png',
    '/home/ubuntu/data2/vibe_coding/saierhao/public/img/npcs/npc_time_traveler.png',
    '/home/ubuntu/data2/vibe_coding/saierhao/public/img/npcs/npc_clock_maker.png',
    '/home/ubuntu/data2/vibe_coding/saierhao/public/img/npcs/npc_keeper_of_time.png'
]

session = new_session("u2net")

for img_path in pets_to_process + npcs_to_process:
    if os.path.exists(img_path):
        print(f"Processing {os.path.basename(img_path)}...")
        try:
            input_img = Image.open(img_path)
            output_img = remove(input_img, session=session)
            output_img.save(img_path)
        except Exception as e:
            print(f"Error on {img_path}: {e}")
    else:
        print(f"File not found: {img_path}")

print("Rembg complete!")
