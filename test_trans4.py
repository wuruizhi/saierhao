import cv2
import numpy as np

for i in [4, 7]:
    img = cv2.imread(f'public/img/pets/{i}.png', cv2.IMREAD_UNCHANGED)
    if img is not None and img.shape[2] == 4:
        alpha = img[:, :, 3]
        print(f'Pet {i} transparent pixels:', np.sum(alpha == 0), '/', alpha.size)
    else:
        print(f'Pet {i} failed')
