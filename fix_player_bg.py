import cv2
import numpy as np

img_path = 'public/img/player.png'
img = cv2.imread(img_path, cv2.IMREAD_UNCHANGED)
if img is not None:
    if img.shape[2] == 3:
        img = cv2.cvtColor(img, cv2.COLOR_BGR2BGRA)
        
    h, w = img.shape[:2]
    
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
    print("Player background fixed!")
else:
    print("Could not read player.png")
