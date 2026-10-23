# Escreve a versão do Modded no título (no lugar do "V1.4.3"): python3 tools/titulo.py 1.9
import sys
from PIL import Image, ImageDraw, ImageFont
from pathlib import Path
raiz = Path(__file__).resolve().parent.parent
im = Image.open(raiz / 'tools/title_original.png').convert('RGBA')
d = ImageDraw.Draw(im)
d.rectangle((549, 76, 639, 98), fill=(254, 255, 252, 255))  # apaga o V1.4.3
txt = 'Modded v' + sys.argv[1]
for sz in range(24, 8, -1):
    f = ImageFont.truetype('/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf', sz)
    b = d.textbbox((0, 0), txt, font=f)
    if b[2] - b[0] <= 86: break
d.text((551 - b[0], 95 - b[3]), txt, font=f, fill=(0, 0, 0, 255))  # mesma base do V1.4.3
im.save(raiz / 'app/assets/Texture2D/MenuTextures/title_final.png')
