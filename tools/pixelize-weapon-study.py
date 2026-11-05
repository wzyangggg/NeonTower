"""Normalize Seedream-extracted layers; create shared-palette native pixel icons.

This consumes API layers only, never crops objects out of the source sheet.
Raw layers and their source-coordinate metadata remain unchanged.
"""
import json
from pathlib import Path
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / 'source-assets/weapon-icon-study-v1/layers'
OUT = ROOT / 'dist/assets/weapon-icon-study-v1'
OUT.mkdir(parents=True, exist_ok=True)
NAMES = [('silver_sword', '银刃短剑'), ('gold_saber', '金色弯刀'),
         ('crystal_sword', '水晶短剑'), ('orange_pistol', '橙色手枪'),
         ('silver_revolver', '银色左轮'), ('teal_pistol', '能量手枪'),
         ('wood_rifle', '木托步枪'), ('purple_rifle', '紫晶步枪'),
         ('teal_carbine', '青色卡宾枪')]
layers = json.loads((SOURCE / 'layers.json').read_text(encoding='utf-8'))['layers']
foreground = {item['name']: item for item in layers if item.get('z_index', 0) > 0}
assert set(foreground) == {name for name, _ in NAMES}, 'Unexpected or missing API layers'
images, records = {}, []
for name, label in NAMES:
    layer = foreground[name]
    raw = Image.open(layer['path']).convert('RGBA')
    assert raw.getchannel('A').getextrema() == (0, 255), name
    # Ignore faint alpha fringe only when measuring bounds, not as a cutout.
    bounds = raw.getchannel('A').point(lambda a: 255 if a >= 128 else 0).getbbox()
    assert bounds, name
    cropped = raw.crop(bounds)
    canvas = Image.new('RGBA', (256, 256))
    fitted = cropped.copy()
    fitted.thumbnail((208, 208), Image.Resampling.LANCZOS)
    canvas.alpha_composite(fitted, ((256-fitted.width)//2, (256-fitted.height)//2))
    canvas.save(OUT / f'{name}-original.png')
    images[name] = canvas
    records.append({'id': name, 'label': label, 'sourceLayer': layer['path'],
                    'sourceBoundingBox': layer['bounding_box'], 'alphaTrim': bounds,
                    'normalized': f'{name}-original.png'})

# Train ONE 64-color palette from opaque pixels across all nine weapons.
samples = []
for canvas in images.values():
    samples.extend(pixel[:3] for pixel in canvas.get_flattened_data() if pixel[3] >= 128)
training = Image.new('RGB', (len(samples), 1))
training.putdata(samples)
palette = training.quantize(colors=64, method=Image.Quantize.MEDIANCUT)
palette_rgb = [palette.getpalette()[i:i+3] for i in range(0, 192, 3)]
for record in records:
    name = record['id']
    record['variants'] = {}
    for size in (32, 48):
        small = images[name].resize((size, size), Image.Resampling.LANCZOS)
        alpha = small.getchannel('A').point(lambda a: 255 if a >= 128 else 0)
        result = small.convert('RGB').quantize(palette=palette, dither=Image.Dither.NONE).convert('RGBA')
        result.putalpha(alpha)
        result.save(OUT / f'{name}-{size}.png')
        assert {p[3] for p in result.get_flattened_data()} == {0, 255}
        assert len({p[:3] for p in result.get_flattened_data() if p[3]}) <= 64
        record['variants'][str(size)] = f'{name}-{size}.png'

manifest = {'generator': 'image_gen', 'extractor': 'Seedream layer_decomposition',
            'pixelSizes': [32, 48], 'palette': palette_rgb, 'dither': False,
            'alphaThreshold': 128, 'normalizedSize': 256, 'maxObjectSize': 208, 'items': records}
(OUT / 'manifest.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding='utf-8')
# Visual QA: each row has original, 48px and 32px, all displayed at 96px.
sheet = Image.new('RGB', (9*108, 3*132), '#28263e')
draw = ImageDraw.Draw(sheet)
for col, (name, _) in enumerate(NAMES):
    for row, suffix in enumerate(('original', '48', '32')):
        image = Image.open(OUT / f'{name}-{suffix}.png').convert('RGBA')
        image = image.resize((96,96), Image.Resampling.LANCZOS if suffix=='original' else Image.Resampling.NEAREST)
        sheet.paste(image, (col*108+6, row*132+8), image)
        draw.text((col*108+8, row*132+108), suffix, fill='white')
sheet.save(ROOT / 'source-assets/weapon-icon-study-v1/comparison.png')
print('Created 9 normalized originals + 18 native pixel PNGs; shared 64-color palette, binary alpha')
