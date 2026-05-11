import os
from rembg import remove
from PIL import Image

pet_dir = "public/img/pets"

for i in range(19, 34):
    path = os.path.join(pet_dir, f"{i}.png")
    if os.path.exists(path):
        try:
            print(f"Processing {i}.png...")
            with open(path, "rb") as i_f:
                input_data = i_f.read()
                
            output_data = remove(input_data)
            
            with open(path, "wb") as o_f:
                o_f.write(output_data)
                
            print(f"Successfully removed background for {i}.png")
        except Exception as e:
            print(f"Failed {i}.png: {e}")
