import cv2
import numpy as np

img = cv2.imread("public/img/wardrobe/hat_crown.png")
if img is not None:
    print("Top left 5x5 pixels:")
    for y in range(5):
        row = []
        for x in range(5):
            row.append(img[y, x].tolist())
        print(row)
