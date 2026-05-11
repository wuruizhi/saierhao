import os
from PIL import Image

def process_directory(directory):
    print(f"Processing directory: {directory}")
    for file in os.listdir(directory):
        if file.endswith('.png'):
            path = os.path.join(directory, file)
            try:
                img = Image.open(path).convert("RGBA")
                datas = img.getdata()

                new_data = []
                changed = False
                for item in datas:
                    # check if pixel is white or very close to white
                    if item[0] > 240 and item[1] > 240 and item[2] > 240 and item[3] > 0:
                        # Make white transparent
                        new_data.append((255, 255, 255, 0))
                        changed = True
                    else:
                        new_data.append(item)
                        
                if changed:
                    img.putdata(new_data)
                    img.save(path, "PNG")
                    print(f"Removed white background from {file}")
            except Exception as e:
                print(f"Error processing {file}: {e}")

base_dir = '/home/ubuntu/data2/vibe_coding/saierhao/public/img'
for sub in ['pets', 'npcs', 'scenes', 'galaxies', 'planets']:
    d = os.path.join(base_dir, sub)
    if os.path.exists(d):
        process_directory(d)
