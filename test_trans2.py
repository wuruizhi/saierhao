import cv2
import numpy as np

img = cv2.imread('public/img/player.png', cv2.IMREAD_UNCHANGED)
if img is not None and img.shape[2] == 4:
    alpha = img[:, :, 3]
    print('Player transparent pixels:', np.sum(alpha == 0), '/', alpha.size)
else:
    print('Failed or no alpha')
