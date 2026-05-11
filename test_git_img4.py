import cv2
import subprocess

subprocess.run(['git', 'checkout', 'c20dee0', '--', 'public/img/pets/19.png'])
img = cv2.imread('public/img/pets/19.png', cv2.IMREAD_UNCHANGED)
if img is not None and img.shape[2] == 4:
    print('c20dee0 Pet 19 is transparent')
elif img is not None and img.shape[2] == 3:
    print('c20dee0 Pet 19 is solid')

subprocess.run(['git', 'restore', '--staged', 'public/img/pets/19.png'])
subprocess.run(['git', 'restore', 'public/img/pets/19.png'])
