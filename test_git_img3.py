import cv2
import numpy as np
import subprocess

subprocess.run(['git', 'checkout', '2d1bbf4', '--', 'public/img/pets/1.png'])

img = cv2.imread('public/img/pets/1.png', cv2.IMREAD_UNCHANGED)
if img is not None and img.shape[2] == 4:
    alpha = img[:, :, 3]
    print('2d1bbf4 Pet 1 transparent pixels:', np.sum(alpha == 0), '/', alpha.size)
elif img is not None and img.shape[2] == 3:
    print('2d1bbf4 Pet 1 has no alpha channel (solid background)')
else:
    print('Failed to read 2d1bbf4 pet 1')

# Restore HEAD version for now so we don't mess up the working tree
subprocess.run(['git', 'restore', '--staged', 'public/img/pets/1.png'])
subprocess.run(['git', 'restore', 'public/img/pets/1.png'])
