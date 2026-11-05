from pathlib import Path
import csv,json
root=Path(__file__).resolve().parents[1]
source=root.parent/'outputs/progression-design/防御塔与武器分类增强候选.csv'
groups={}
with source.open(encoding='utf-8-sig',newline='') as f:
 for row in csv.DictReader(f):
  key=row['分类ID']
  group=groups.setdefault(key,{'id':key,'name':row['分类名称'],'system':row['系统'],'stages':[]})
  group['stages'].append({'stage':int(row['阶位']),'name':row['节点名称'],'effect':row['本阶新增或替换效果（数值草案）'],'visual':row['本阶画面表现']})
assert len(groups)==21 and all(len(g['stages'])==5 for g in groups.values())
(root/'dist/specialization-catalog.js').write_text("'use strict';\nglobalThis.SpecializationCatalog="+json.dumps(list(groups.values()),ensure_ascii=False,separators=(',',':'))+';\n',encoding='utf-8')
print('21 category descriptions / 105 stages generated')
