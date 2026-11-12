import json
import re
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

root = Path(__file__).resolve().parent
project = root.parent.parent
game = (project / 'dist/game.js').read_text(encoding='utf-8')
groups = {}

def light_faces(icon):
    # Lift existing bright neutral faces while preserving shadows and accent colors.
    colors = {}
    for r, g, b, a in set(icon.get_flattened_data()):
        lightness = (54 * r + 183 * g + 19 * b) / 256
        neutral = max(0, 1 - (max(r, g, b) - min(r, g, b)) / 66)
        amount = 0.48 * neutral * max(0, min(1, (lightness - 143) / 69))
        colors[r, g, b, a] = tuple(round(c + (255 - c) * amount) for c in (r, g, b)) + (a,)
    result = Image.new('RGBA', icon.size)
    result.putdata([colors[color] for color in icon.get_flattened_data()])
    return result

def item(key, name, source):
    icon = Image.open(source).convert('RGBA')
    assert icon.size == (48,48) and icon.getchannel('A').getextrema() == (0,255), source
    path = root / 'icons' / f'{key}-48.png'
    path.parent.mkdir(exist_ok=True)
    assert not any(key == record['id'] for items in groups.values() for record in items), key
    light_faces(icon).save(path)
    small = Image.open(source.with_name(source.name.replace('-48.png', '-32.png'))).convert('RGBA')
    assert small.size == (32,32) and small.getchannel('A').getextrema() == (0,255), source
    small_path = path.with_name(f'{key}-32.png')
    light_faces(small).save(small_path)
    return {'id': key, 'name': name, 'icon': path.relative_to(root).as_posix(),
            'icon32': small_path.relative_to(root).as_posix(), 'source': source.relative_to(project).as_posix()}

for title, constant, batch in [('服装与护甲','ARMOR_TYPES',1), ('鞋履与坐骑','SHOE_CATALOG',2),
                              ('无人机','COMPANION_TYPES',3), ('炸弹','BOMB_TYPES',3)]:
    definition = re.search(rf'const {constant}=\[(.*?)\];', game, re.S)[1]
    groups[title] = [item(key, name, root / f'batch-{3 if key == "tentacle" else batch}-revised/pixel/{key}-48.png')
                     for key, name in re.findall(r"id:'([^']+)',name:'([^']+)'", definition)]

weapon_art = {path.stem.removesuffix('-48'): path for path in root.glob('weapon-*/pixel/*-48.png')}
groups['武器型号'] = []
for family, definitions in re.findall(r"registerWeaponModels\('([^']+)','[^']+',\[(.*?)\]\);", game):
    for tier, name in re.findall(r"\[(\d+),'([^']+)'", definitions):
        key = f'{family}_t{tier}'
        source = (root / 'batch-3-revised/pixel/barrett-48.png' if name == '巴雷特' else
                  weapon_art[key])
        groups['武器型号'].append(item(key, name, source))

font = ImageFont.truetype('C:/Windows/Fonts/msyh.ttc', 17)
header = ImageFont.truetype('C:/Windows/Fonts/msyh.ttc', 25)
for index, (title, items) in enumerate(groups.items(), 1):
    cols = 6 if len(items) > 12 else 4
    rows = (len(items) + cols - 1) // cols
    sheet = Image.new('RGB', (cols * 153 + 24, rows * 145 + 62), '#161d2b')
    draw = ImageDraw.Draw(sheet)
    draw.text((16, 14), f'{title} · {len(items)} 件', font=header, fill='#ebf0f8')
    for pos, record in enumerate(items):
        x, y = 12 + pos % cols * 153, 55 + pos // cols * 145
        draw.rounded_rectangle((x, y, x+144, y+134), radius=9, fill='#202a3b')
        icon = Image.open(root / record['icon']).resize((96,96), Image.Resampling.NEAREST)
        sheet.paste(icon, (x+24,y+5), icon)
        draw.text((x+72,y+113), record['name'], font=font, anchor='mm', fill='#ebf0f8')
    sheet.save(root / f'review-{index}.png')
(root / 'manifest.json').write_text(json.dumps(groups, ensure_ascii=False, indent=2), encoding='utf-8')
print({k: len(v) for k,v in groups.items()})




