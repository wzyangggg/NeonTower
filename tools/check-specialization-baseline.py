from pathlib import Path
import ast,subprocess
root=Path(__file__).resolve().parents[1]
tree=ast.parse((root/'tools/integrate-specializations.py').read_text(encoding='utf-8'))
changes=next(ast.literal_eval(n.value.args[1]) for n in tree.body if isinstance(n,ast.Expr) and isinstance(n.value,ast.Call) and getattr(n.value.func,'id',None)=='edit' and ast.literal_eval(n.value.args[0])=='dist/game.js')
source=(root/'dist/game.js').read_text(encoding='utf-8')
for before,after in reversed(changes):source=source.replace(after,before)
source=source.replace("if(source==='weapon'&&globalThis.Specializations){const q=Specializations.stats(Specializations.family(e));if(q.n)for(let i=start;i<shots.length;i++)Specializations.decorate(shots[i],q,null);}",'')
wrapper=''' const start=shots.length;onModelWeaponHitBase(s,e);
 if(s.spec)for(let i=start;i<shots.length;i++){const child=shots[i];child.spec=s.spec;child.specDerived=true;child.specApplied=true;child.hitRadius=(child.hitRadius||4)*s.spec.size;}
}
function onModelWeaponHitBase(s,e){'''
source=source.replace(wrapper,'')
assert 'Specializations' not in source
tmp=root/'tests/specializations-baseline-game.tmp'
tmp.write_text(source,encoding='utf-8')
try:
 script="""const fs=require('fs');const read=fs.readFileSync;const baseline=read('tests/specializations-baseline-game.tmp','utf8');fs.readFileSync=function(file,...args){if(String(file)==='dist/game.js')return baseline;return read.call(this,file,...args)};require('./tests/test-economy-pool.cjs');"""
 result=subprocess.run(['node','-e',script],cwd=root,capture_output=True,text=True)
 output=result.stdout+result.stderr
 (root/'tests/specializations-baseline.log').write_text(output,encoding='utf-8')
 assert result.returncode!=0 and 'fixed enlarged pool 1' in output,output
 print('Confirmed same economy-pool failure after undoing every specialization change to game.js in memory.')
finally:tmp.unlink(missing_ok=True)
