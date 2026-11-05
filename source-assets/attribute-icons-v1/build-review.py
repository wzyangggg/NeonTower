import json
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

root = Path(__file__).resolve().parent
out = root.parents[1] / 'dist' / 'assets' / 'attribute-icons-v1'
catalog = json.loads((root / 'catalog.json').read_text(encoding='utf-8'))
ids = [x[0] if x[0] != 'critDamage' else 'crit_damage' for x in catalog]
font = ImageFont.truetype('C:/Windows/Fonts/msyh.ttc', 18)
small = ImageFont.truetype('C:/Windows/Fonts/msyh.ttc', 14)
sheet = Image.new('RGB', (1008, 5*170+60), '#252338')
draw = ImageDraw.Draw(sheet)
draw.text((20, 14), '角色加点图标 · 待确认   每项：原画 / 48px / 32px', font=font, fill='white')
cards = []
for i, ((key, label), asset) in enumerate(zip(catalog, ids)):
    x, y = (i%3)*336, 60+(i//3)*170
    draw.text((x+12,y+3), f'{i+1:02}  {label}', font=font, fill='white')
    imgs=[]
    for j, suffix in enumerate(['original','48','32']):
        im=Image.open(out/f'{asset}-{suffix}.png').convert('RGBA')
        im=im.resize((96,96),Image.Resampling.LANCZOS if j==0 else Image.Resampling.NEAREST)
        sheet.paste(im,(x+8+j*108,y+30),im)
        draw.text((x+18+j*108,y+130),suffix,font=small,fill='#c9c7dc')
        imgs.append(f'<figure><img src="../../dist/assets/attribute-icons-v1/{asset}-{suffix}.png"><figcaption>{suffix}</figcaption></figure>')
    cards.append(f'<article><h2>{i+1:02} {label}</h2><div>{"".join(imgs)}</div></article>')
sheet.save(root/'review.png')
(root/'preview.html').write_text('<!doctype html><html lang="zh-CN"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>加点图标待确认</title><style>body{margin:20px;background:#252338;color:#eee;font:14px system-ui}h1{font-size:22px}main{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:14px;max-width:1100px}article{background:#302d47;padding:8px;border-radius:8px}h2{font-size:17px;margin:8px}article div{display:flex;justify-content:space-around}figure{margin:0;text-align:center}img{width:96px;height:96px;image-rendering:pixelated}figure:first-child img{image-rendering:auto}figcaption{color:#bbb;margin:8px}</style><h1>角色加点图标 · 待确认</h1><p>13 项全部覆盖；每项原画 / 48px / 32px。已接入本地角色加点界面。</p><main>'+''.join(cards)+'</main></html>',encoding='utf-8')
print('Built labeled review and responsive preview for 13 attributes')
