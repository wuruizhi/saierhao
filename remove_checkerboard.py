import os
import glob
from PIL import Image

def remove_checkerboard(image_path):
    img = Image.open(image_path).convert("RGBA")
    pixels = img.load()
    width, height = img.size
    
    def is_checkerboard(r, g, b, a):
        if a == 0: return True
        if abs(r - g) <= 15 and abs(g - b) <= 15 and abs(r - b) <= 15:
            if 90 <= r <= 190:
                return True
        return False

    visited = set()
    queue = [(0, 0), (width-1, 0), (0, height-1), (width-1, height-1)]
    
    valid_starts = []
    for qx, qy in queue:
        r, g, b, a = pixels[qx, qy]
        if is_checkerboard(r, g, b, a) and a != 0:
            valid_starts.append((qx, qy))
            
    if not valid_starts:
        return False
        
    queue = valid_starts
    for qx, qy in queue:
        visited.add((qx, qy))
        
    changed = False
    while queue:
        cx, cy = queue.pop(0)
        pixels[cx, cy] = (0, 0, 0, 0)
        changed = True
        
        for dx, dy in [(0, 1), (1, 0), (0, -1), (-1, 0)]:
            nx, ny = cx + dx, cy + dy
            if 0 <= nx < width and 0 <= ny < height:
                if (nx, ny) not in visited:
                    visited.add((nx, ny))
                    r, g, b, a = pixels[nx, ny]
                    if is_checkerboard(r, g, b, a):
                        queue.append((nx, ny))
                        
    if changed:
        img.save(image_path)
    return changed

wardrobe_dir = "public/img/wardrobe"
for path in glob.glob(os.path.join(wardrobe_dir, "*.png")):
    try:
        if remove_checkerboard(path):
            print(f"Fixed {path}")
    except Exception as e:
        print(f"Failed {path}: {e}")
