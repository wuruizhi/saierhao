import cv2
import numpy as np
import subprocess

# checkout the image from the oldest commit where it existed
subprocess.run(['git', 'checkout', '1c9918c', '--', 'public/img/pets/1.png'])

img = cv2.imread('public/img/pets/1.png', cv2.IMREAD_UNCHANGED)
if img is not None and img.shape[2] == 4:
    alpha = img[:, :, 3]
    print('OLD Pet 1 transparent pixels:', np.sum(alpha == 0), '/', alpha.size)
elif img is not None and img.shape[2] == 3:
    print('OLD Pet 1 has no alpha channel')
else:
    print('Failed to read old pet 1')

# restore
subprocess.run(['git', 'restore', '--staged', 'public/img/pets/1.png'])
subprocess.run(['git', 'restore', 'public/img/pets/1.png'])
