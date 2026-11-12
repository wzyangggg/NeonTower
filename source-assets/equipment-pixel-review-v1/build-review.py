from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

root = Path(__file__).resolve().parent
items = [
    ('builder-outfit', '建筑工服饰'), ('ranger-outfit', '游侠服饰'),
    ('casual-outfit', '便装'), ('light-armor', '轻便护甲'),
    ('heavy-armor', '重型防弹衣'), ('armored-mount', '装甲坐骑'),
    ('swift-mount', '迅捷坐骑'), ('combat-mount', '火力坐骑'),
    ('support-mount', '辅助坐骑'), ('attack-drone', '攻击型无人机'),
    ('guard-drone', '守卫型无人机'), ('support-drone', '辅助型无人机'),
]
font = ImageFont.truetype('C:/Windows/Fonts/msyh.ttc', 16)
title = ImageFont.truetype('C:/Windows/Fonts/msyh.ttc', 24)
sheet = Image.new('RGB', (672, 752), '#161d2b')
draw = ImageDraw.Draw(sheet)
draw.text((24, 16), '研究一级界面 · 现有 48px 参考', font=title, fill='#ebf0f8')
draw.text((24, 192), '首批装备 · 48px 像素图标', font=title, fill='#ebf0f8')

def tile(path, col, y, label):
    x = 24 + col * 158
    icon = Image.open(path).convert('RGBA').resize((96, 96), Image.Resampling.NEAREST)
    draw.rounded_rectangle((x, y, x + 148, y + 142), 10, fill='#202a3b')
    sheet.paste(icon, (x + 26, y + 9), icon)
    draw.text((x + 74, y + 121), label, font=font, anchor='mm', fill='#d5e0ed')

reference = root.parent.parent / 'dist/assets/research-icons-v4'
for col, (key, name) in enumerate([('pistol', '手枪'), ('rifle', '步枪'), ('rocket', '火箭筒'), ('laser', '激光枪')]):
    tile(reference / f'{key}-48.png', col, 48, name)
for index, (key, name) in enumerate(items):
    tile(root / 'pixel' / f'{key}-48.png', index % 4, 226 + index // 4 * 166, name)
sheet.save(root / 'review.png')
