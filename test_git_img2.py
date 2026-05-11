import cv2
import numpy as np
import subprocess

subprocess.run(['git', 'checkout', '8d4f8cd', '--', 'public/img/pets/1.png'])

img = cv2.imread('public/img/pets/1.png', cv2.IMREAD_UNCHANGED)
if img is not None and img.shape[2] == 4:
    alpha = img[:, :, 3]
    print('8d4f8cd Pet 1 transparent pixels:', np.sum(alpha == 0), '/', alpha.size)
elif img is not None and img.shape[2] == 3:
    print('8d4f8cd Pet 1 has no alpha channel (solid background)')
else:
    print('Failed to read 8d4f8cd pet 1')

