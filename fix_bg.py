import sys
from PIL import Image, ImageDraw, ImageFilter

def remove_background(image_path):
    img = Image.open(image_path).convert("RGBA")
    w, h = img.size
    
    # Create a smoothed version to average out checkerboards
    blurred = img.convert("RGB").filter(ImageFilter.GaussianBlur(radius=3))
    
    # We will use BFS (flood fill) to find background pixels
    # We'll consider a pixel as background if its blurred color is similar to the corner's blurred color
    
    corner_colors = [
        blurred.getpixel((0, 0)),
        blurred.getpixel((w-1, 0)),
        blurred.getpixel((0, h-1)),
        blurred.getpixel((w-1, h-1))
    ]
    
    # Pick the most common corner color (or just the top-left if it's representative)
    # Let's just start a floodfill from (0,0) and other corners
    
    mask = Image.new('L', (w, h), 255) # 255 means foreground (keep)
    
    def color_dist(c1, c2):
        return sum(abs(a - b) for a, b in zip(c1, c2))
    
    visited = set()
    queue = [(0, 0), (w-1, 0), (0, h-1), (w-1, h-1)]
    
    bg_colors = []
    for cx, cy in queue:
        bg_colors.append(blurred.getpixel((cx, cy)))

    # Tolerance for floodfill
    TOLERANCE = 40
    
    while queue:
        x, y = queue.pop(0)
        if (x, y) in visited:
            continue
        visited.add((x, y))
        
        curr_color = blurred.getpixel((x, y))
        
        # Check if it matches any known bg color
        if any(color_dist(curr_color, bgc) < TOLERANCE for bgc in bg_colors):
            mask.putpixel((x, y), 0) # 0 means background (transparent)
            
            # add neighbors
            for dx, dy in [(0, 1), (1, 0), (0, -1), (-1, 0)]:
                nx, ny = x + dx, y + dy
                if 0 <= nx < w and 0 <= ny < h and (nx, ny) not in visited:
                    queue.append((nx, ny))
                    
    # Apply mask
    pixels = img.load()
    mask_pixels = mask.load()
    
    for y in range(h):
        for x in range(w):
            if mask_pixels[x, y] == 0:
                r, g, b, a = pixels[x, y]
                pixels[x, y] = (r, g, b, 0)
                
    img.save(image_path)
    print(f"Processed {image_path}")

for file in sys.argv[1:]:
    try:
        remove_background(file)
    except Exception as e:
        print(f"Failed {file}: {e}")
