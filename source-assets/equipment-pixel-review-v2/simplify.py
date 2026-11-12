from pathlib import Path
from PIL import Image, ImageFilter

root = Path(__file__).resolve().parent
originals = root.parent / 'equipment-pixel-review-v1/pixel'

for path in sorted(originals.glob('*-original.png')):
    name = path.stem.removesuffix('-original')
    art = Image.open(path).convert('RGBA')
    for size in (32, 48):
        old = Image.open(originals / f'{name}-{size}.png').convert('RGBA')
        # Keep the exact silhouette. Merge nearby tones using the opaque artwork only.
        small = art.resize((size, size), Image.Resampling.LANCZOS)
        rgb = small.convert('RGB')
        mask = old.getchannel('A')
        points = [(x, y) for y in range(size) for x in range(size) if mask.getpixel((x, y))]
        interior = mask.filter(ImageFilter.MinFilter(3))
        colors = [rgb.getpixel(p) for p in points]
        training = Image.new('RGB', (len(colors), 1))
        training.putdata(colors)
        palette = training.quantize(colors=20, method=Image.Quantize.MAXCOVERAGE, dither=Image.Dither.NONE)
        reduced = rgb.quantize(palette=palette, dither=Image.Dither.NONE).convert('RGB')
        result = reduced.copy()
        for x, y in points:
            if not interior.getpixel((x, y)):
                continue
            current = reduced.getpixel((x, y))
            neighbors = [reduced.getpixel(p) for p in ((x-1,y),(x+1,y),(x,y-1),(x,y+1))]
            if current in neighbors:
                continue
            # Remove isolated near-color specks while preserving contrasting markings.
            dominant = max(neighbors, key=neighbors.count)
            distance = sum((a-b)**2 for a,b in zip(current, dominant))
            if neighbors.count(dominant) >= 2 and distance < 75**2:
                result.putpixel((x,y), dominant)
        result.putalpha(mask)
        result.save(root / 'pixel' / f'{name}-{size}.png')

