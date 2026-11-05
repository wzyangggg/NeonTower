from pathlib import Path
import base64, zipfile, hashlib, re, subprocess, json

root=Path(__file__).resolve().parents[1]
# Refresh font subsets before either offline or web packaging.
subprocess.run([__import__('sys').executable,str(root/'tools/build-fonts.py')],check=True)
version=__import__('json').loads((root/'package.json').read_text(encoding='utf-8'))['version']
dist=root/'dist'
release=root/'releases'/('hell-elevator-'+version+'-offline')
release.mkdir(parents=True,exist_ok=True)
html=(dist/'index.html').read_text(encoding='utf-8')
# Keep one embedded resource table, including paths assembled at runtime.
mimes={'.png':'image/png','.svg':'image/svg+xml','.wav':'audio/wav','.mp3':'audio/mpeg','.json':'application/json','.woff2':'font/woff2'}
assets={file.relative_to(dist).as_posix():'data:'+mimes[file.suffix]+';base64,'+base64.b64encode(file.read_bytes()).decode('ascii') for file in dist.rglob('*') if file.is_file() and file.suffix in mimes}
def offline_source(source):
    source=re.sub(r'''(['"])((?:assets|audio)/[^'"\n]+)\1''',lambda m:'globalThis.resolveOfflineAsset('+json.dumps(m.group(2))+')' if m.group(2) in assets else m.group(0),source)
    # SVG markup also consumes this dynamically constructed icon URL.
    source=re.sub(r'(const url=kind=>)([^\n]+?);',r'\1globalThis.resolveOfflineAsset(\2);',source)
    return source

if '<script src="hex-loader.js"></script>' in html:
    # Compile the same adapter as the web entry, without fetch/dynamic scripts on file://.
    engine=subprocess.check_output(['node','-e',"const fs=require('fs');process.stdout.write(require('./dist/hex-map.js').transform(fs.readFileSync('./dist/game.js','utf8')));"],cwd=root,encoding='utf-8')
    loader=(dist/'hex-loader.js').read_text(encoding='utf-8')
    module_list=re.search(r'const modules=(\[[^\]]+\])',loader) or re.search(r'for\(const file of (\[[^\]]+\])\)',loader)
    modules=json.loads(module_list.group(1).replace("'",'"'))
    if 'promo-mode.js' not in modules: modules.append('promo-mode.js')
    raw=offline_source((dist/'game.js').read_text(encoding='utf-8'))
    engine=offline_source(engine)
    boot='{const params=new URLSearchParams(location.search),lab=params.get("lab")==="1"||params.get("weaponlab")==="1",engine=document.createElement("script");engine.textContent=lab?'+json.dumps(raw,ensure_ascii=False)+':'+json.dumps(engine,ensure_ascii=False)+';document.body.append(engine);}'
    bootstrap='<script>'+boot.replace('</script',r'<\/script')+'</script>'+''.join('<script src="'+name+'"></script>' for name in modules)+'<script>HexMap.ready=true;</script>'
    html=html.replace('<script src="hex-loader.js"></script>',bootstrap)
html=html.replace('<head>','<head><style id="talents-inline-style">'+(dist/'talents.css').read_text(encoding='utf-8')+'</style>')
html=re.sub(r'<link rel="stylesheet" href="([^"]+)">',lambda m:'<style>'+(dist/m.group(1)).read_text(encoding='utf-8')+'</style>',html)
# Inline CSS font URLs for file://, with the same licensed subsets.
html=re.sub(r"url\(['\"]?(assets/fonts/[^)'\"]+)['\"]?\)",lambda m:'url("'+assets[m.group(1)]+'")',html)
for license_file in (dist/'assets/fonts').glob('*-OFL.txt'):
    (release/license_file.name).write_bytes(license_file.read_bytes())
# Discover every included module so scene, rain, hex and lab code also ships offline.
for name in dict.fromkeys(re.findall(r'<script src="([^"]+)"></script>',html)):
    source=offline_source((dist/name).read_text(encoding='utf-8')).replace('</script',r'<\/script')
    html=html.replace('<script src="'+name+'"></script>','<script>'+source+'</script>')

# Static HTML attributes are resolved independently of JavaScript literals.
html=re.sub(r'((?:src|href)=")([^"]+)(")',lambda m:m.group(1)+assets.get(m.group(2),m.group(2))+m.group(3),html)
resource_bootstrap='''(()=>{const assets=ASSETS;globalThis.resolveOfflineAsset=value=>assets[value]||value;const nativeFetch=globalThis.fetch.bind(globalThis);globalThis.fetch=(input,init)=>nativeFetch(typeof input==='string'?resolveOfflineAsset(input):input,init);const descriptor=Object.getOwnPropertyDescriptor(HTMLImageElement.prototype,'src');Object.defineProperty(HTMLImageElement.prototype,'src',{...descriptor,set(value){descriptor.set.call(this,resolveOfflineAsset(value));}});})();'''.replace('ASSETS',json.dumps(assets,separators=(',',':')))
html=html.replace('<head>','<head><script>'+resource_bootstrap.replace('</script',r'<\/script')+'</script>',1)
audio=base64.b64encode((dist/'audio/normal-theme.mp3').read_bytes()).decode('ascii')
html=html.replace('src="audio/normal-theme.mp3"','src="data:audio/mpeg;base64,'+audio+'"')
(release/'game.html').write_text(html,encoding='utf-8')
(release/'玩法说明.txt').write_text('地狱电梯 离线版 '+version+'\n\n电脑玩法：\n1. 先解压整个压缩包。\n2. 双击 game.html，用 Chrome 或 Edge 浏览器打开。\n3. 点击“启动电梯”，WASD / 方向键移动，自动射击。\n4. P 键暂停，右上角可关闭音乐与音效。\n\n游戏、音乐均已放入 game.html，无需联网，无需安装 Node.js。\n手机上的文件预览器不一定支持运行游戏，电脑浏览器更方便；手机优先使用在线链接。\n在线版：https://hell-elevator.wzyanggg.chatgpt.site\n',encoding='utf-8-sig')
archive=release.parent/(release.name+'.zip')
with zipfile.ZipFile(archive,'w',zipfile.ZIP_DEFLATED,compresslevel=9) as z:
    for file in sorted(release.iterdir()):z.write(file,file.name)
with zipfile.ZipFile(archive) as z:
    assert z.testzip() is None
    assert z.read('game.html')==(release/'game.html').read_bytes()
    assert base64.b64decode(audio)==(dist/'audio/normal-theme.mp3').read_bytes()
assert '<script src=' not in html and '<link rel="stylesheet"' not in html
print('ZIP:',archive)
print('HTML:',release/'game.html')
print('Size:',archive.stat().st_size,'bytes')
print('SHA256:',hashlib.sha256(archive.read_bytes()).hexdigest())

web_archive=release.parent/('hell-elevator-'+version+'-web.zip')
web_readme='地狱电梯 Web 资源包 '+version+'\n\n将包内 index.html、所有 js/css 文件及 audio 目录一起上传到静态网站托管服务。\n入口为 index.html，资源必须保持相对目录结构。\n该包无需构建、无需后端，支持 HTTPS 静态托管。\n电脑离线试玩可使用单独提供的 offline 包，双击 game.html。\n'
with zipfile.ZipFile(web_archive,'w',zipfile.ZIP_DEFLATED,compresslevel=9) as z:
    for file in sorted(dist.rglob('*')):
        if file.is_file():z.write(file,file.relative_to(dist).as_posix())
    z.writestr('部署说明.txt',web_readme.encode('utf-8-sig'))
with zipfile.ZipFile(web_archive) as z:
    assert z.testzip() is None
    for file in dist.rglob('*'):
        if file.is_file():assert z.read(file.relative_to(dist).as_posix())==file.read_bytes()
print('WEB ZIP:',web_archive)
print('WEB size:',web_archive.stat().st_size,'bytes')
