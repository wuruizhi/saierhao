import os
import glob
from rembg import remove
from PIL import Image
import io

wardrobe_dir = "public/img/wardrobe"
images = glob.glob(os.path.join(wardrobe_dir, "*.png"))

for path in images:
    try:
        print(f"Processing {path}...")
        with open(path, "rb") as i_f:
            input_data = i_f.read()
            
        output_data = remove(input_data)
        
        with open(path, "wb") as o_f:
            o_f.write(output_data)
            
        print(f"Successfully removed background for {path}")
    except Exception as e:
        print(f"Failed {path}: {e}")
