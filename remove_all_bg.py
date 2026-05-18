import os
import glob
from rembg import remove, new_session

wardrobe_dir = "public/img/wardrobe"
images = glob.glob(os.path.join(wardrobe_dir, "*.png"))

session = new_session("isnet-general-use")

for path in images:
    if "_isnet" in path or "_anime" in path:
        continue
    try:
        print(f"Processing {path}...")
        with open(path, "rb") as i_f:
            input_data = i_f.read()
            
        output_data = remove(input_data, session=session)
        
        with open(path, "wb") as o_f:
            o_f.write(output_data)
            
        print(f"Successfully processed {path}")
    except Exception as e:
        print(f"Failed {path}: {e}")
