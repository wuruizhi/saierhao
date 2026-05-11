import numpy as np
from PIL import Image

img = Image.open('/home/ubuntu/data2/vibe_coding/saierhao/public/img/pets/68.png').convert('RGBA')
data = np.array(img)
r, g, b, a = data[:,:,0], data[:,:,1], data[:,:,2], data[:,:,3]

unique_colors, counts = np.unique(data.reshape(-1, 4), axis=0, return_counts=True)
most_common = sorted(zip(counts, unique_colors), key=lambda x: x[0], reverse=True)

print("Top 10 most common colors (count, [R, G, B, A]):")
for count, color in most_common[:10]:
    print(f"{count}: {color}")

