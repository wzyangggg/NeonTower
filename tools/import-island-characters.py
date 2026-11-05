"""Copy appearance assets from a Unity project, without modifying the source."""
from pathlib import Path
import argparse,re,json,shutil,hashlib,subprocess
ROOT=Path(__file__).resolve().parents[1]
def refs(path):
 try:return set(re.findall(r'guid:\s*([0-9a-f]{32})',path.read_text(encoding='utf-8-sig')))
 except (UnicodeError,OSError):return set()
def run(source):
 source=source.resolve();index={}
 for name in subprocess.check_output(['rg','--files','-g','*.meta',str(source)],text=True,encoding='utf-8').splitlines():
  p=Path(name)
  try:t=p.open(encoding='utf-8-sig').read(600)
  except OSError:continue
  m=re.search(r'^guid: ([0-9a-f]{32})',t,re.M)
  if m:index[m[1]]=Path(str(p)[:-5])
 dest=ROOT/'source-assets/island-characters';dest.mkdir(parents=True,exist_ok=True)
 configs={'fox':('IslandDefender/Models/FoxRigged.fbx','IslandDefender/Resources/Characters/Archer/IslandDefenderFoxArcher.prefab'),'bunny':('IslandDefender/Models/BunnyRigged.fbx','Resources/Characters/IslandDefenderBombardier/IslandDefenderBombardier.prefab')}
 allowed={'.fbx','.mat','.png','.jpg','.jpeg','.tga','.bmp','.psd','.shader','.shadergraph','.hlsl','.cginc','.anim','.controller','.overridecontroller','.mask'}
 manifest={'sourceAssets':str(source),'scope':'Appearance only; Unity prefab snapshots are reference files, not standalone runtime characters.','characters':{},'files':[],'omittedUnityDependencies':[]}
 selected=set()
 for kind,(model,prefab) in configs.items():
  seeds=[source/model,source/prefab,source/'IslandDefender/Animations/Idle.fbx',source/'IslandDefender/Animations/Running.fbx'];pending=list(seeds);seen=set();excluded=[]
  while pending:
   p=pending.pop()
   if p in seen:continue
   if not p.is_file():raise FileNotFoundError(p)
   seen.add(p);meta=p.with_name(p.name+'.meta')
   for guid in refs(p if p.suffix.lower() not in {'.fbx','.png','.jpg','.jpeg','.psd'} else meta)|refs(meta):
    q=index.get(guid)
    if q and q.suffix.lower() in allowed and q.is_file():pending.append(q)
    elif q and q not in seen:excluded.append({'guid':guid,'source':q.relative_to(source).as_posix()})
    elif not q and not guid.startswith('0000000000000000'):excluded.append({'guid':guid,'source':None})
  selected.update(seen);manifest['characters'][kind]={'model':'Assets/'+model,'prefabReference':'Assets/'+prefab,'files':['Assets/'+p.relative_to(source).as_posix() for p in sorted(seen)],'externalPrefabDependencies':excluded}
 for p in sorted(selected):
  for src in [p,p.with_name(p.name+'.meta')]:
   if not src.exists():continue
   out=dest/'Assets'/src.relative_to(source);out.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(src,out)
   sha=lambda q:hashlib.sha256(q.read_bytes()).hexdigest()
   digest=sha(src);assert sha(out)==digest
   manifest['files'].append({'path':out.relative_to(dest).as_posix(),'bytes':out.stat().st_size,'sha256':digest})
 (dest/'manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2),encoding='utf-8')
 print(json.dumps({'files':len(manifest['files']),'bytes':sum(f['bytes'] for f in manifest['files']),'characters':{k:len(v['files']) for k,v in manifest['characters'].items()},'materials':[p.name for p in selected if p.suffix=='.mat'],'textures':[p.name for p in selected if p.suffix in {'.png','.jpg','.jpeg'}]},ensure_ascii=False))
if __name__=='__main__':
 parser=argparse.ArgumentParser();parser.add_argument('--source',type=Path,required=True);run(parser.parse_args().source)
