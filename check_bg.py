import os
from PIL import Image

pet_dir = "public/img/pets"
suspicious_files = []

for file in os.listdir(pet_dir):
    if file.endswith('.png'):
        path = os.path.join(pet_dir, file)
        try:
            img = Image.open(path).convert("RGBA")
            # Check the four corners
            w, h = img.size
            corners = [
                img.getpixel((0, 0)),
                img.getpixel((w-1, 0)),
                img.getpixel((0, h-1)),
                img.getpixel((w-1, h-1))
            ]
            
            # If all corners have high alpha (not transparent)
            if all(c[3] > 240 for c in corners):
                suspicious_files.append((file, corners[0]))
        except Exception as e:
            print(f"Error with {file}: {e}")

print("Suspicious files (no transparent background at corners):")
for f, color in suspicious_files:
    print(f"{f} - Corner color: {color}")
