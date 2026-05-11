import os
from rembg import remove
from PIL import Image

def process_image(img_path):
    print(f"Processing {img_path} with rembg...")
    try:
        input_img = Image.open(img_path)
        output_img = remove(input_img)
        output_img.save(img_path)
        print(f"Successfully removed background from {img_path}")
    except Exception as e:
        print(f"Error processing {img_path}: {e}")

pets_dir = '/home/ubuntu/data2/vibe_coding/saierhao/public/img/pets/'
new_pets = ['67.png', '68.png', '69.png', '70.png', '71.png']

for file in new_pets:
    process_image(os.path.join(pets_dir, file))
