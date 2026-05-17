import cv2
import numpy as np
import glob

wardrobe_dir = "public/img/wardrobe"
images = glob.glob(wardrobe_dir + "/*.png")

for path in images[:5]:
    img = cv2.imread(path)
    if img is None: continue
    
    # Check 20x20 block from top-left
    block = img[0:20, 0:20]
    
    # Calculate the variance of R, G, B for each pixel to see if it's strictly grey
    gray_diffs = np.std(block, axis=2)
    max_gray_diff = np.max(gray_diffs)
    
    # Get min and max intensity of this block
    min_val = np.min(block)
    max_val = np.max(block)
    
    print(f"{path}: gray_variance={max_gray_diff:.2f}, intensity range=[{min_val}, {max_val}]")
