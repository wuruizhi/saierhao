from collections import deque
from pathlib import Path
import math
import random

from PIL import Image, ImageDraw, ImageEnhance, ImageFilter


ROOT = Path(__file__).resolve().parents[1]
SCENE_DIR = ROOT / "public" / "img" / "scenes"
PET_DIR = ROOT / "public" / "img" / "pets"
PLAYER_PATH = ROOT / "public" / "img" / "player.png"
SIZE = 1024


def load_base(name):
    return Image.open(SCENE_DIR / name).convert("RGBA").resize((SIZE, SIZE), Image.LANCZOS)


def grade(img, tint, strength=0.18, brightness=1.0, contrast=1.0, color=1.05):
    img = ImageEnhance.Color(img).enhance(color)
    img = ImageEnhance.Contrast(img).enhance(contrast)
    img = ImageEnhance.Brightness(img).enhance(brightness)
    overlay = Image.new("RGBA", img.size, tint)
    return Image.alpha_composite(img, overlay.putalpha(int(255 * strength)) or overlay)


def crop_zoom(img, zoom=1.0, center=(0.5, 0.5)):
    if zoom <= 1:
        return img.copy()
    w, h = img.size
    cw, ch = int(w / zoom), int(h / zoom)
    left = max(0, min(w - cw, int(center[0] * w - cw / 2)))
    top = max(0, min(h - ch, int(center[1] * h - ch / 2)))
    return img.crop((left, top, left + cw, top + ch)).resize((w, h), Image.LANCZOS)


def layer():
    return Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))


def blur_glow(points, color, radius=28):
    glow = layer()
    d = ImageDraw.Draw(glow)
    d.line(points, fill=color, width=18, joint="curve")
    return glow.filter(ImageFilter.GaussianBlur(radius))


def draw_lava_river(img, points, width=54, core=(255, 206, 55, 235)):
    glow = blur_glow(points, (255, 72, 8, 170), 35)
    img.alpha_composite(glow)
    d = ImageDraw.Draw(img)
    d.line(points, fill=(255, 72, 8, 230), width=width, joint="curve")
    d.line(points, fill=core, width=max(10, width // 3), joint="curve")
    for i in range(0, len(points) - 1):
        x, y = points[i]
        nx, ny = points[i + 1]
        mx = (x + nx) // 2
        my = (y + ny) // 2
        d.ellipse((mx - 20, my - 10, mx + 20, my + 10), fill=(255, 244, 116, 160))


def draw_flame(d, x, y, scale=1.0):
    pts = [
        (x, y - 75 * scale), (x + 34 * scale, y - 35 * scale),
        (x + 22 * scale, y + 20 * scale), (x, y + 54 * scale),
        (x - 24 * scale, y + 20 * scale), (x - 34 * scale, y - 35 * scale)
    ]
    d.polygon(pts, fill=(255, 82, 18, 220))
    inner = [(x, y - 40 * scale), (x + 17 * scale, y - 8 * scale), (x, y + 32 * scale), (x - 16 * scale, y - 8 * scale)]
    d.polygon(inner, fill=(255, 223, 80, 230))


def fire_entrance():
    img = grade(crop_zoom(load_base("fire.png"), 1.16, (0.44, 0.58)), (42, 12, 0, 255), 0.12, 0.95, 1.08, 1.05)
    d = ImageDraw.Draw(img, "RGBA")
    d.polygon([(0, 1024), (0, 695), (228, 520), (420, 1024)], fill=(16, 12, 12, 180))
    d.polygon([(1024, 1024), (1024, 670), (800, 520), (610, 1024)], fill=(16, 12, 12, 180))
    d.arc((240, 310, 784, 1130), 180, 360, fill=(33, 22, 18, 235), width=74)
    d.arc((308, 405, 716, 1102), 180, 360, fill=(255, 108, 22, 175), width=16)
    d.polygon([(360, 1024), (472, 610), (552, 610), (670, 1024)], fill=(42, 30, 26, 215))
    draw_lava_river(img, [(512, 735), (505, 820), (536, 912), (516, 1024)], 44)
    for x, y, s in [(230, 650, .72), (790, 650, .7), (512, 604, .55)]:
        draw_flame(d, x, y, s)
    return img


def fire_canyon():
    img = grade(crop_zoom(load_base("fire.png"), 1.22, (0.62, 0.42)), (74, 14, 2, 255), 0.18, 0.92, 1.16, 1.1)
    d = ImageDraw.Draw(img, "RGBA")
    d.polygon([(0, 1024), (0, 160), (220, 270), (310, 1024)], fill=(22, 12, 10, 185))
    d.polygon([(1024, 1024), (1024, 115), (805, 260), (724, 1024)], fill=(25, 14, 11, 190))
    d.line([(200, 320), (140, 580), (205, 790)], fill=(255, 89, 18, 205), width=18)
    d.line([(825, 290), (902, 548), (830, 820)], fill=(255, 90, 20, 190), width=17)
    draw_lava_river(img, [(370, 0), (470, 180), (435, 360), (530, 545), (488, 770), (565, 1024)], 52)
    for x, y, s in [(110, 562, .58), (916, 535, .6), (490, 345, .5)]:
        draw_flame(d, x, y, s)
    return img


def fire_core():
    img = grade(crop_zoom(load_base("fire.png"), 1.34, (0.50, 0.56)), (100, 12, 0, 255), 0.22, 1.02, 1.2, 1.18)
    core = layer()
    d = ImageDraw.Draw(core, "RGBA")
    for r, a in [(310, 48), (230, 72), (150, 110), (72, 210)]:
        d.ellipse((512 - r, 505 - r, 512 + r, 505 + r), fill=(255, 88, 0, a))
    core = core.filter(ImageFilter.GaussianBlur(24))
    img.alpha_composite(core)
    d = ImageDraw.Draw(img, "RGBA")
    d.ellipse((355, 348, 669, 662), fill=(255, 92, 12, 125), outline=(255, 225, 84, 230), width=18)
    d.ellipse((430, 422, 594, 586), fill=(255, 214, 55, 190))
    for angle in range(0, 360, 45):
        x = 512 + math.cos(math.radians(angle)) * 330
        y = 505 + math.sin(math.radians(angle)) * 330
        d.line([(512, 505), (x, y)], fill=(255, 126, 20, 155), width=10)
    return img


def water_beach():
    img = grade(crop_zoom(load_base("water.png"), 1.08, (0.50, 0.18)), (50, 160, 200, 255), 0.06, 1.08, 1.03, 1.0)
    d = ImageDraw.Draw(img, "RGBA")
    d.rectangle((0, 640, 1024, 1024), fill=(237, 198, 124, 230))
    d.polygon([(0, 625), (160, 660), (310, 622), (485, 670), (665, 615), (825, 655), (1024, 620), (1024, 735), (0, 730)], fill=(67, 204, 220, 190))
    for y in [628, 670, 715]:
        d.arc((-90, y - 65, 280, y + 70), 8, 175, fill=(255, 255, 255, 170), width=8)
        d.arc((245, y - 60, 600, y + 80), 5, 172, fill=(255, 255, 255, 160), width=7)
        d.arc((600, y - 70, 1080, y + 75), 8, 175, fill=(255, 255, 255, 150), width=8)
    for x, y in [(145, 820), (780, 842), (430, 910), (900, 730)]:
        d.ellipse((x - 22, y - 12, x + 22, y + 12), fill=(173, 111, 70, 130))
    return img


def water_coral():
    img = grade(crop_zoom(load_base("water.png"), 1.17, (0.44, 0.56)), (0, 50, 120, 255), 0.12, 0.98, 1.12, 1.22)
    d = ImageDraw.Draw(img, "RGBA")
    random.seed(20)
    for _ in range(18):
        x = random.randint(60, 960)
        y = random.randint(570, 950)
        h = random.randint(70, 165)
        c = random.choice([(255, 93, 160, 205), (95, 231, 214, 205), (183, 93, 255, 205), (255, 176, 73, 205)])
        d.line([(x, y), (x, y - h)], fill=c, width=random.randint(7, 14))
        for b in range(3):
            yy = y - random.randint(15, h - 10)
            dx = random.choice([-1, 1]) * random.randint(28, 58)
            d.line([(x, yy), (x + dx, yy - random.randint(15, 45))], fill=c, width=random.randint(5, 9))
    d.line([(90, 835), (250, 755), (450, 790), (620, 700), (860, 742), (1024, 650)], fill=(104, 255, 235, 105), width=20)
    return img


def water_ruins():
    img = grade(crop_zoom(load_base("water.png"), 1.25, (0.64, 0.62)), (0, 20, 80, 255), 0.22, 0.82, 1.18, .88)
    d = ImageDraw.Draw(img, "RGBA")
    for x, y, h in [(125, 560, 320), (260, 635, 255), (790, 555, 350), (910, 610, 260)]:
        d.rectangle((x - 32, y, x + 32, y + h), fill=(42, 62, 83, 210), outline=(112, 190, 210, 120), width=5)
        d.polygon([(x - 46, y), (x + 46, y), (x + 25, y - 44), (x - 25, y - 44)], fill=(55, 78, 100, 220))
    d.arc((245, 360, 780, 1020), 180, 360, fill=(87, 180, 210, 130), width=28)
    d.rectangle((430, 610, 594, 965), fill=(20, 36, 58, 125))
    for y in [210, 340, 470]:
        d.line([(0, y), (1024, y + 58)], fill=(155, 226, 255, 35), width=6)
    return img


def grass_path():
    img = grade(crop_zoom(load_base("grass.png"), 1.08, (0.47, 0.50)), (35, 92, 38, 255), 0.07, 1.08, 1.02, 1.0)
    d = ImageDraw.Draw(img, "RGBA")
    d.polygon([(380, 1024), (460, 655), (520, 450), (575, 655), (710, 1024)], fill=(103, 86, 55, 165))
    for i in range(12):
        y = 530 + i * 43
        x = 510 + math.sin(i * .7) * 35
        d.ellipse((x - 82, y, x - 54, y + 24), fill=(138, 137, 105, 155))
        d.rectangle((x - 68, y, x + 68, y + 24), fill=(138, 137, 105, 155))
        d.ellipse((x + 54, y, x + 82, y + 24), fill=(138, 137, 105, 155))
    sun = layer()
    sd = ImageDraw.Draw(sun, "RGBA")
    for x in [455, 520, 590]:
        sd.polygon([(x, 0), (x + 105, 0), (720, 1024), (610, 1024)], fill=(255, 236, 146, 38))
    img.alpha_composite(sun.filter(ImageFilter.GaussianBlur(16)))
    return img


def grass_mushroom():
    img = grade(crop_zoom(load_base("grass.png"), 1.22, (0.31, 0.54)), (18, 70, 54, 255), 0.18, 0.88, 1.1, 1.2)
    d = ImageDraw.Draw(img, "RGBA")
    random.seed(42)
    for x, y, s, c in [(135, 720, 1.55, (38, 217, 231, 210)), (855, 660, 1.8, (238, 95, 218, 210)), (520, 785, 1.2, (255, 169, 72, 210))]:
        d.rectangle((x - 22 * s, y - 5 * s, x + 22 * s, y + 145 * s), fill=(223, 197, 150, 190))
        d.pieslice((x - 92 * s, y - 92 * s, x + 92 * s, y + 72 * s), 180, 360, fill=c)
        for _ in range(9):
            px = x + random.randint(int(-55 * s), int(55 * s))
            py = y + random.randint(int(-55 * s), int(15 * s))
            d.ellipse((px - 7, py - 7, px + 7, py + 7), fill=(255, 255, 210, 135))
    for _ in range(95):
        x = random.randint(0, SIZE)
        y = random.randint(180, 930)
        r = random.randint(2, 5)
        d.ellipse((x - r, y - r, x + r, y + r), fill=(150, 255, 210, random.randint(65, 150)))
    return img


def grass_heart():
    img = grade(crop_zoom(load_base("grass.png"), 1.32, (0.63, 0.46)), (5, 60, 24, 255), 0.24, 0.83, 1.18, .9)
    d = ImageDraw.Draw(img, "RGBA")
    d.ellipse((215, 150, 810, 1040), fill=(63, 45, 28, 215), outline=(118, 92, 54, 225), width=20)
    d.ellipse((310, 265, 714, 870), fill=(21, 58, 39, 210), outline=(115, 255, 151, 135), width=16)
    for angle in range(205, 335, 16):
        x1 = 512 + math.cos(math.radians(angle)) * 175
        y1 = 735 + math.sin(math.radians(angle)) * 115
        x2 = 512 + math.cos(math.radians(angle)) * 520
        y2 = 900 + math.sin(math.radians(angle)) * 220
        d.line([(x1, y1), (x2, y2)], fill=(82, 52, 30, 220), width=28)
    glow = layer()
    gd = ImageDraw.Draw(glow, "RGBA")
    gd.ellipse((360, 345, 664, 650), fill=(80, 255, 135, 90))
    img.alpha_composite(glow.filter(ImageFilter.GaussianBlur(35)))
    return img


def lightning(d, start, end, color=(188, 224, 255, 235), width=7, seed=1):
    random.seed(seed)
    points = [start]
    sx, sy = start
    ex, ey = end
    segments = 8
    for i in range(1, segments):
        t = i / segments
        x = sx + (ex - sx) * t + random.randint(-48, 48)
        y = sy + (ey - sy) * t + random.randint(-34, 34)
        points.append((x, y))
    points.append(end)
    d.line(points, fill=color, width=width, joint="curve")
    d.line(points, fill=(255, 255, 255, 225), width=max(2, width // 2), joint="curve")
    for i, p in enumerate(points[2:-2], 2):
        bx = p[0] + random.choice([-1, 1]) * random.randint(70, 150)
        by = p[1] + random.randint(30, 120)
        d.line([p, (bx, by)], fill=(176, 210, 255, 130), width=max(2, width // 3))


def electric_plains():
    img = grade(crop_zoom(load_base("electric.png"), 1.12, (0.48, 0.36)), (80, 70, 0, 255), 0.16, .96, 1.08, .9)
    d = ImageDraw.Draw(img, "RGBA")
    d.polygon([(0, 665), (220, 615), (512, 660), (792, 620), (1024, 680), (1024, 1024), (0, 1024)], fill=(58, 52, 18, 205))
    for x in range(20, 1040, 95):
        d.line([(x, 720), (x + 30, 1024)], fill=(217, 188, 52, 110), width=5)
    lightning(d, (170, 0), (280, 650), width=9, seed=4)
    lightning(d, (760, 0), (690, 610), width=6, seed=7)
    return img


def electric_canyon():
    img = grade(crop_zoom(load_base("electric.png"), 1.24, (0.50, 0.54)), (52, 20, 98, 255), 0.16, .88, 1.2, 1.08)
    d = ImageDraw.Draw(img, "RGBA")
    d.polygon([(0, 1024), (0, 260), (235, 380), (350, 1024)], fill=(24, 18, 46, 185))
    d.polygon([(1024, 1024), (1024, 250), (770, 365), (670, 1024)], fill=(24, 18, 48, 190))
    for y in [390, 510, 635, 760]:
        d.line([(245, y), (780, y + random.randint(-25, 25))], fill=(188, 112, 255, 125), width=9)
    lightning(d, (485, 0), (512, 940), width=8, seed=13)
    lightning(d, (900, 0), (750, 500), width=6, seed=15)
    return img


def electric_temple():
    img = grade(crop_zoom(load_base("electric.png"), 1.28, (0.54, 0.57)), (76, 54, 0, 255), 0.18, .95, 1.16, 1.0)
    d = ImageDraw.Draw(img, "RGBA")
    d.polygon([(235, 845), (790, 845), (910, 1024), (105, 1024)], fill=(46, 40, 70, 230))
    for x in [240, 372, 652, 784]:
        d.rectangle((x - 28, 440, x + 28, 840), fill=(68, 62, 95, 220), outline=(194, 164, 71, 125), width=5)
        d.rectangle((x - 54, 395, x + 54, 445), fill=(76, 70, 105, 225))
    d.polygon([(205, 390), (820, 390), (742, 305), (283, 305)], fill=(77, 67, 103, 235), outline=(255, 219, 96, 120))
    d.ellipse((412, 570, 612, 770), outline=(255, 231, 111, 230), width=18)
    lightning(d, (512, 0), (512, 575), width=10, seed=21)
    return img


def light_dawn():
    img = grade(crop_zoom(load_base("dark.png"), 1.16, (0.34, 0.40)), (255, 188, 76, 255), 0.38, 1.28, .94, .9)
    sun = layer()
    d = ImageDraw.Draw(sun, "RGBA")
    d.ellipse((350, 150, 674, 474), fill=(255, 230, 135, 165))
    for x in range(-160, 1040, 160):
        d.polygon([(512, 300), (x, 1024), (x + 95, 1024)], fill=(255, 224, 132, 48))
    img.alpha_composite(sun.filter(ImageFilter.GaussianBlur(18)))
    d = ImageDraw.Draw(img, "RGBA")
    d.arc((300, 520, 724, 1075), 180, 360, fill=(255, 246, 178, 145), width=28)
    return img


def light_twilight():
    left = grade(crop_zoom(load_base("dark.png"), 1.12, (0.34, 0.52)), (255, 180, 75, 255), 0.24, 1.08, 1.02, .95)
    right = grade(crop_zoom(load_base("electric.png"), 1.2, (0.68, 0.45)), (45, 0, 90, 255), 0.32, .78, 1.2, .9)
    mask = Image.new("L", (SIZE, SIZE), 0)
    md = ImageDraw.Draw(mask)
    md.polygon([(360, 0), (1024, 0), (1024, 1024), (560, 1024)], fill=255)
    mask = mask.filter(ImageFilter.GaussianBlur(85))
    img = Image.composite(right, left, mask).convert("RGBA")
    d = ImageDraw.Draw(img, "RGBA")
    d.line([(520, 0), (470, 220), (560, 410), (505, 650), (560, 1024)], fill=(255, 240, 150, 185), width=12)
    d.line([(548, 0), (500, 245), (590, 430), (530, 670), (590, 1024)], fill=(78, 31, 150, 170), width=9)
    lightning(d, (915, 0), (720, 660), color=(178, 125, 255, 200), width=5, seed=33)
    return img


def dark_abyss():
    img = grade(crop_zoom(load_base("dark.png"), 1.28, (0.62, 0.56)), (5, 0, 28, 255), 0.34, .62, 1.28, .78)
    d = ImageDraw.Draw(img, "RGBA")
    for r, a in [(420, 185), (315, 210), (215, 230), (120, 245)]:
        d.ellipse((512 - r, 470 - r, 512 + r, 470 + r), fill=(0, 0, 10, a))
    d.arc((270, 240, 754, 720), 0, 360, fill=(110, 50, 255, 130), width=14)
    random.seed(77)
    for _ in range(70):
        x = random.randint(0, SIZE)
        y = random.randint(0, SIZE)
        rr = random.randint(1, 4)
        d.ellipse((x - rr, y - rr, x + rr, y + rr), fill=(100, 220, 255, random.randint(50, 130)))
    return img


SCENES = {
    "fire-entrance.png": fire_entrance,
    "fire-canyon.png": fire_canyon,
    "fire-core.png": fire_core,
    "water-beach.png": water_beach,
    "water-coral.png": water_coral,
    "water-ruins.png": water_ruins,
    "grass-path.png": grass_path,
    "grass-mushroom.png": grass_mushroom,
    "grass-heart.png": grass_heart,
    "electric-plains.png": electric_plains,
    "electric-canyon.png": electric_canyon,
    "electric-temple.png": electric_temple,
    "light-dawn.png": light_dawn,
    "light-twilight.png": light_twilight,
    "dark-abyss.png": dark_abyss,
}


def is_near_white(pixel):
    r, g, b, a = pixel
    if a == 0:
        return False
    return r > 224 and g > 224 and b > 224 and max(r, g, b) - min(r, g, b) < 38


def remove_connected_white_background(path):
    img = Image.open(path).convert("RGBA")
    w, h = img.size
    px = img.load()
    bg = Image.new("L", (w, h), 0)
    bgpx = bg.load()
    q = deque()

    def push(x, y):
        if bgpx[x, y] == 0 and is_near_white(px[x, y]):
            bgpx[x, y] = 255
            q.append((x, y))

    for x in range(w):
        push(x, 0)
        push(x, h - 1)
    for y in range(h):
        push(0, y)
        push(w - 1, y)

    while q:
        x, y = q.popleft()
        if x > 0:
            push(x - 1, y)
        if x < w - 1:
            push(x + 1, y)
        if y > 0:
            push(x, y - 1)
        if y < h - 1:
            push(x, y + 1)

    soft = bg.filter(ImageFilter.GaussianBlur(1.35))
    data = list(img.getdata())
    bg_data = list(bg.getdata())
    soft_data = list(soft.getdata())
    out = []
    transparent = 0
    for (r, g, b, a), hard, edge in zip(data, bg_data, soft_data):
        if hard:
            out.append((r, g, b, 0))
            transparent += 1
            continue
        if edge and r > 205 and g > 205 and b > 205:
            whiteness = (r + g + b) / 3
            edge_alpha = max(70, int(255 - edge * ((whiteness - 205) / 50)))
            a = min(a, edge_alpha)
        out.append((r, g, b, a))

    img.putdata(out)
    img.save(path, "PNG", optimize=True)
    return transparent


def build_scenes():
    SCENE_DIR.mkdir(parents=True, exist_ok=True)
    for filename, factory in SCENES.items():
        img = factory().convert("RGB")
        img.save(SCENE_DIR / filename, "PNG", optimize=True)
        print(f"scene {filename}")


def clean_sprites():
    paths = sorted(PET_DIR.glob("*.png"), key=lambda p: int(p.stem)) + [PLAYER_PATH]
    for path in paths:
        transparent = remove_connected_white_background(path)
        print(f"sprite {path.relative_to(ROOT)} transparent_pixels={transparent}")


if __name__ == "__main__":
    build_scenes()
    clean_sprites()
