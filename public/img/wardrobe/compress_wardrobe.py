import os
from PIL import Image

def optimize_images_in_dir(directory, max_size):
    if not os.path.exists(directory):
        return
        
    for filename in os.listdir(directory):
        if not filename.endswith('.png'):
            continue
            
        filepath = os.path.join(directory, filename)
        
        try:
            img = Image.open(filepath)
            if img.mode != 'RGBA':
                img = img.convert('RGBA')
            
            if img.width > max_size or img.height > max_size:
                img.thumbnail((max_size, max_size), Image.Resampling.LANCZOS)
            
            img.save(filepath, 'PNG', optimize=True)
            print(f"Optimized {filename}")
        except Exception as e:
            print(f"Error processing {filepath}: {e}")

optimize_images_in_dir('/home/ubuntu/data2/vibe_coding/saierhao/public/img/wardrobe', 256)
