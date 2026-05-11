import os
import glob
import shutil
from rembg import remove
from PIL import Image

artifacts_dir = '/home/ubuntu/.gemini/antigravity/brain/71eb4014-1709-4140-97b6-4d5f9eedab70/'
pets_dir = '/home/ubuntu/data2/vibe_coding/saierhao/public/img/pets/'
npcs_dir = '/home/ubuntu/data2/vibe_coding/saierhao/public/img/npcs/'

os.makedirs(pets_dir, exist_ok=True)
os.makedirs(npcs_dir, exist_ok=True)

def process_and_move(src_pattern, dest_dir, is_pet=False):
    files = glob.glob(os.path.join(artifacts_dir, src_pattern))
    for f in files:
        # Get filename without the timestamp
        basename = os.path.basename(f)
        if is_pet:
            # e.g., 73_1778519594080.png -> 73.png
            pet_id = basename.split('_')[0]
            new_name = f"{pet_id}.png"
        else:
            # e.g., npc_lost_explorer_1778520226665.png -> npc_lost_explorer.png
            # need to remove the _123456789 timestamp
            parts = basename.rsplit('_', 1)
            new_name = parts[0] + '.png'
            
        dest_path = os.path.join(dest_dir, new_name)
        
        print(f"Processing {basename} -> {new_name}")
        try:
            input_img = Image.open(f)
            output_img = remove(input_img)
            output_img.save(dest_path)
        except Exception as e:
            print(f"Error processing {f}: {e}")

# Note: pets 68, 69, 70, 71 are in the scratch folder as 68.png etc.
scratch_dir = os.path.join(artifacts_dir, 'scratch')
for pid in ['68', '69', '70', '71']:
    f = os.path.join(scratch_dir, f"{pid}.png")
    if os.path.exists(f):
        dest_path = os.path.join(pets_dir, f"{pid}.png")
        print(f"Processing scratch {pid}.png")
        try:
            input_img = Image.open(f)
            output_img = remove(input_img)
            output_img.save(dest_path)
        except Exception as e:
            print(f"Error processing {f}: {e}")

# Process newly generated pets
process_and_move("[0-9][0-9]_*.png", pets_dir, is_pet=True)

# Process newly generated npcs
process_and_move("npc_*.png", npcs_dir, is_pet=False)

print("All done!")
