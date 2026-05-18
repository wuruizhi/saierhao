import os
from PIL import Image
import sys

def optimize_large_images(directory, size_threshold_kb=300):
    if not os.path.exists(directory):
        return
        
    for root, dirs, files in os.walk(directory):
        for filename in files:
            if not filename.endswith('.png') and not filename.endswith('.jpg'):
                continue
                
            filepath = os.path.join(root, filename)
            try:
                file_size = os.path.getsize(filepath)
            except OSError:
                continue
                
            # Process files larger than threshold
            if file_size > size_threshold_kb * 1024:
                print(f"Compressing {filepath} ({file_size/1024:.1f} KB)")
                try:
                    img = Image.open(filepath)
                    
                    # Convert backgrounds (scenes/galaxies) to WEBP for maximum compression
                    # WEBP supports RGBA so it's safe for transparent elements too
                    # Resize very large images > 1920 to save memory and space
                    max_dim = 1920
                    if img.width > max_dim or img.height > max_dim:
                        img.thumbnail((max_dim, max_dim), Image.Resampling.LANCZOS)
                        
                    # Save as WEBP but keep the original filename/extension so we don't break code references
                    # Browsers parse images by magic headers, not extensions
                    img.save(filepath, format='WEBP', quality=75, method=4)
                    
                    new_size = os.path.getsize(filepath)
                    print(f"  -> Reduced to {new_size/1024:.1f} KB ({(1 - new_size/file_size)*100:.1f}%)")
                except Exception as e:
                    print(f"Error processing {filepath}: {e}")

if __name__ == "__main__":
    base_dir = '/home/ubuntu/data2/vibe_coding/saierhao/public/img'
    print("Starting deep compression for large images...")
    optimize_large_images(base_dir, size_threshold_kb=150)
    print("Done!")
