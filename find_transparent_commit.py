import cv2
import subprocess

# get all commits that touched public/img/pets/1.png
res = subprocess.run(['git', 'log', '--format=%H', '--', 'public/img/pets/1.png'], capture_output=True, text=True)
commits = res.stdout.strip().split('\n')
commits.reverse() # oldest first

for commit in commits:
    subprocess.run(['git', 'checkout', commit, '--', 'public/img/pets/1.png'], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    img = cv2.imread('public/img/pets/1.png', cv2.IMREAD_UNCHANGED)
    if img is not None and img.shape[2] == 4:
        print(f"Commit {commit} made it transparent!")
        break

# Restore HEAD
subprocess.run(['git', 'restore', '--staged', 'public/img/pets/1.png'])
subprocess.run(['git', 'restore', 'public/img/pets/1.png'])
