import os
from PIL import Image

def optimize_images_in_dir(directory, max_size):
    if not os.path.exists(directory):
        return
        
    for filename in os.listdir(directory):
        if not filename.endswith('.png'):
            continue
            
        filepath = os.path.join(directory, filename)
        file_size = os.path.getsize(filepath)
        
        # Only process if file is larger than 200KB to save time
        if file_size > 200 * 1024:
            print(f"Compressing {filepath} (Original size: {file_size/1024:.1f} KB)")
            try:
                img = Image.open(filepath)
                # Convert to RGBA if not already
                if img.mode != 'RGBA':
                    img = img.convert('RGBA')
                
                # Resize if larger than max_size while maintaining aspect ratio
                if img.width > max_size or img.height > max_size:
                    img.thumbnail((max_size, max_size), Image.Resampling.LANCZOS)
                
                # Save optimized
                img.save(filepath, 'PNG', optimize=True)
                
                new_size = os.path.getsize(filepath)
                print(f"  -> Reduced to {new_size/1024:.1f} KB")
            except Exception as e:
                print(f"Error processing {filepath}: {e}")

if __name__ == "__main__":
    base_dir = '/home/ubuntu/data2/vibe_coding/saierhao/public/img'
    
    # Planets and Galaxies can be max 512x512
    optimize_images_in_dir(os.path.join(base_dir, 'planets'), 512)
    optimize_images_in_dir(os.path.join(base_dir, 'galaxies'), 800)
    
    print("Optimization complete!")
