import os, glob

from PIL import Image


def image_to_square(fname, min_size=256, fill_color=(255,255,255)):
    im = Image.open(fname)
    x,y = im.size
    size = max(x,y)
    new_im = Image.new('RGB', (size, size), fill_color)
    new_im.paste(im, ((size - x) // 2, (size - y) // 2))
    return new_im

to = "square_images"
os.mkdir(to)

for fname in glob.glob("andrew/*"):
    image = image_to_square(fname)
    fname = os.path.basename(fname)
    image.save(os.path.join(to, fname))


