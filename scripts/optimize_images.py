#!/usr/bin/env python3
"""Convert photos to compressed WebP for the site.

  People:   python3 scripts/optimize_images.py person  photo.jpg  firstname-lastname
  Gallery:  python3 scripts/optimize_images.py gallery photo.jpg  lab-image25
  Figure:   python3 scripts/optimize_images.py figure  figure.png my-figure

Writes to assets/img/people/, assets/img/gallery/ (+ thumb/), or
assets/img/research/. Needs Pillow: pip install pillow
"""
import os, sys
from PIL import Image, ImageOps

Image.MAX_IMAGE_PIXELS = None

def save(src, dst, size, quality=80):
    im = ImageOps.exif_transpose(Image.open(src))
    if im.mode in ("RGBA", "LA", "P"):
        im = im.convert("RGBA")
        bg = Image.new("RGB", im.size, "white")
        bg.paste(im, mask=im.split()[3])
        im = bg
    else:
        im = im.convert("RGB")
    im.thumbnail(size, Image.LANCZOS)
    os.makedirs(os.path.dirname(dst), exist_ok=True)
    im.save(dst, "WEBP", quality=quality, method=6)
    print(f"wrote {dst} {im.size[0]}x{im.size[1]} {os.path.getsize(dst)//1024} KB")

if len(sys.argv) != 4 or sys.argv[1] not in ("person", "gallery", "figure"):
    sys.exit(__doc__)
kind, src, name = sys.argv[1:]
if kind == "person":
    save(src, f"assets/img/people/{name}.webp", (720, 900))
elif kind == "gallery":
    save(src, f"assets/img/gallery/{name}.webp", (1600, 1600), 78)
    save(src, f"assets/img/gallery/thumb/{name}.webp", (640, 640), 72)
else:
    save(src, f"assets/img/research/{name}.webp", (1400, 5600))
