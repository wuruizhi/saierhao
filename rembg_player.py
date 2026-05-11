import os
from rembg import remove
from PIL import Image

path = "public/img/player.png"
print("Processing player.png...")
with open(path, "rb") as i_f:
    input_data = i_f.read()
    
output_data = remove(input_data)

with open(path, "wb") as o_f:
    o_f.write(output_data)
    
print("Successfully removed background for player.png using rembg")
