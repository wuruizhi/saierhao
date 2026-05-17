import cv2
import numpy as np

img = cv2.imread("public/img/wardrobe/hat_crown.png")
if img is not None:
    # Print a single row of 40 pixels
    print([img[0, x, 0] for x in range(40)])
    print([img[y, 0, 0] for y in range(40)])
