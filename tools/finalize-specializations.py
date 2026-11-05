from pathlib import Path
import json
root=Path(__file__).resolve().parents[1]
def replace(name,a,b):
 p=root/name;s=p.read_text(encoding='utf-8');assert a in s,(name,a[:70]);p.write_text(s.replace(a,b),encoding='utf-8')
replace('dist/index.html','<script src="specializations.js"></script>','<script src="specialization-catalog.js"></script><script src="specializations.js"></script>')
replace('dist/game.js','if(e.itemId)tagModelShots(start,e,source);applyDrinkVolley(start,origin,source)','if(e.itemId)tagModelShots(start,e,source);if(source===\'weapon\'&&globalThis.Specializations){const q=Specializations.stats(Specializations.family(e));if(q.n)for(let i=start;i<shots.length;i++)Specializations.decorate(shots[i],q,null);}applyDrinkVolley(start,origin,source)')
p=root/'package.json';data=json.loads(p.read_text(encoding='utf-8'));data['scripts']['check']='node --check dist/specialization-catalog.js && node --check dist/specializations.js && '+data['scripts']['check'];data['scripts']['test:specializations']='node tests/test-specializations.cjs';p.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
p=root/'tests/run.cjs';p.write_text("{const r=require('node:child_process').spawnSync(process.execPath,['tests/test-specializations.cjs'],{cwd:require('node:path').resolve(__dirname,'..'),stdio:'inherit'});if(r.status!==0)process.exit(r.status||1)}\n"+p.read_text(encoding='utf-8'),encoding='utf-8')
