import os
import cv2
import numpy as np

pet_dir = "public/img/pets"

def process_image(img_path):
    img = cv2.imread(img_path, cv2.IMREAD_UNCHANGED)
    if img is None:
        return False
        
    if img.shape[2] == 3:
        img = cv2.cvtColor(img, cv2.COLOR_BGR2BGRA)
        
    h, w = img.shape[:2]
    
    # Check corners to see if they are fully transparent
    corners = [
        img[0, 0],
        img[0, w-1],
        img[h-1, 0],
        img[h-1, w-1]
    ]
    if all(c[3] < 10 for c in corners):
        return False
        
    # Create mask for floodfill
    mask = np.zeros((h + 2, w + 2), np.uint8)
    
    # Floodfill on BGR channels to avoid grayscale merging different hues
    bgr = img[:, :, :3].copy()
    
    # We expect a white background, so flood fill from the corners with a small tolerance
    flood_points = [(0, 0), (w-1, 0), (0, h-1), (w-1, h-1)]
    for pt in flood_points:
        diff = (5, 5, 5)  # Very tight tolerance for BGR
        cv2.floodFill(bgr, mask, pt, (0, 255, 0), loDiff=diff, upDiff=diff)
        
    real_mask = mask[1:h+1, 1:w+1]
    img[real_mask == 1, 3] = 0
    
    cv2.imwrite(img_path, img)
    return True

for i in range(1, 34):
    path = os.path.join(pet_dir, f"{i}.png")
    if os.path.exists(path):
        try:
            if process_image(path):
                print(f"Fixed background for {i}.png")
        except Exception as e:
            print(f"Error processing {i}.png: {e}")
