import os
from rembg import remove
from PIL import Image

files_to_process = [
    '/home/ubuntu/data2/vibe_coding/saierhao/public/img/pets/25.png',
    '/home/ubuntu/data2/vibe_coding/saierhao/public/img/pets/19.png',
    '/home/ubuntu/data2/vibe_coding/saierhao/public/img/pets/16.png',
    '/home/ubuntu/data2/vibe_coding/saierhao/public/img/pets/31.png',
    '/home/ubuntu/data2/vibe_coding/saierhao/public/img/pets/26.png',
    '/home/ubuntu/data2/vibe_coding/saierhao/public/img/npcs/npc_dream_weaver.png'
]

for img_path in files_to_process:
    print(f"Processing {img_path} with rembg...")
    try:
        input_img = Image.open(img_path)
        output_img = remove(input_img)
        output_img.save(img_path)
        print(f"Successfully removed background from {img_path}")
    except Exception as e:
        print(f"Error processing {img_path}: {e}")
