"""Rebuild the 28px chip emblems from the existing transparent artwork."""
from pathlib import Path

from PIL import Image


ASSETS = Path(__file__).resolve().parents[1] / 'dist/assets/chip-icons-v3'
SIZE = 28
EDGE = (26, 23, 34, 255)
images = {}
samples = []

for path in sorted(ASSETS.glob('*-emblem.png')):
    with Image.open(path) as original:
        source = original.convert('RGBA').resize((SIZE, SIZE), Image.Resampling.LANCZOS)

    result = Image.new('RGBA', source.size)
    for y in range(SIZE - 1):
        for x in range(SIZE - 1):
            if source.getpixel((x, y))[3] >= 128:
                result.putpixel((x + 1, y + 1), EDGE)

    # Stepped upper-left light and lower-right shade at the native pixel size.
    for y in range(SIZE):
        for x in range(SIZE):
            r, g, b, alpha = source.getpixel((x, y))
            if alpha < 128:
                continue
            if max(r, g, b) > 65:
                if x + y < 20:
                    r, g, b = (round(channel + (255 - channel) * .10) for channel in (r, g, b))
                elif x + y >= 28:
                    shade = .69 if x + y >= 34 else .83
                    r, g, b = (round(channel * shade) for channel in (r, g, b))
            result.putpixel((x, y), (r, g, b, 255))

    images[path] = result
    samples.extend(pixel[:3] for pixel in result.get_flattened_data() if pixel[3])

training = Image.new('RGB', (len(samples), 1))
training.putdata(samples)
palette = training.quantize(colors=64, method=Image.Quantize.MEDIANCUT)
for path, image in images.items():
    pixel = image.convert('RGB').quantize(palette=palette, dither=Image.Dither.NONE).convert('RGBA')
    pixel.putalpha(image.getchannel('A'))
    pixel.save(path.with_stem(f'{path.stem}-pixel'))
