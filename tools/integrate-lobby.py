from pathlib import Path
import json
root=Path(__file__).resolve().parents[1]
def edit(name,a,b):
 p=root/name;s=p.read_text(encoding='utf-8');assert a in s,(name,a[:80]);p.write_text(s.replace(a,b),encoding='utf-8')
edit('dist/talents.js',"for(const s of catalog){const n=Math.min(s.max,integer(raw.levels?.[s.id]));", "if(raw.research&&typeof raw.research==='object'&&!Array.isArray(raw.research)){next.research={};for(const [id,n]of Object.entries(raw.research))if(/^[a-z_]+$/.test(id)&&Number.isInteger(n)&&n>=0&&n<=5)next.research[id]=n;}for(const s of catalog){const n=Math.min(s.max,integer(raw.levels?.[s.id]));")
edit('dist/talents.js',"  const readBase=read;\n  function readResearch(){readBase();if(!persistence)return;try{const raw=JSON.parse(storage?.getItem(key)||'null');if(raw?.research&&typeof raw.research==='object'&&!Array.isArray(raw.research)){data.research={};for(const [id,n]of Object.entries(raw.research))if(/^[a-z_]+$/.test(id)&&Number.isInteger(n)&&n>=0&&n<=5)data.research[id]=n;}}catch{}}", "  function readResearch(){read();}")
edit('dist/talents.js',"draft=null;ui.hud.focus();}","draft=null;ui.hud.focus();globalThis.LobbyUI?.onCharacterClose();}")
edit('dist/talents.js',"root.TalentRuntime={store,catalog,", "root.TalentRuntime={store,catalog,refreshHud:updateHud,")
edit('dist/game.js',"$('start').onclick=()=>startDifficulty(selectedDifficulty);syncMusic();", "$('start').onclick=()=>startDifficulty(selectedDifficulty);globalThis.LobbyUI?.show();syncMusic();")
edit('dist/game.js',"function reset(){$('viewport')", "function reset(){globalThis.LobbyUI?.hide();$('viewport')")
edit('dist/index.html','<link rel="stylesheet" href="difficulty.css">','<link rel="stylesheet" href="difficulty.css"><link rel="stylesheet" href="lobby.css">')
edit('dist/index.html','<script src="hex-loader.js"></script>','<script src="lobby.js"></script><script src="hex-loader.js"></script>')
p=root/'package.json';data=json.loads(p.read_text(encoding='utf-8'));data['scripts']['check']='node --check dist/lobby.js && '+data['scripts']['check'];p.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
