"""TreasureIsland Seedream layer API, with durable submission and download recovery."""
import argparse
import base64
import hashlib
import json
import os
from pathlib import Path
import time
import urllib.error
import urllib.request

ENDPOINT = 'https://ark.cn-beijing.volces.com/api/v3/images/generations'
MODEL = 'doubao-seedream-5-0-pro-260628'


def credential():
    value = os.environ.get('ARK_API_KEY', '').strip()
    if value:
        return value
    try:
        import winreg
        with winreg.OpenKey(winreg.HKEY_CURRENT_USER, r'Software\Unity Technologies\Unity Editor 5.x') as key:
            for i in range(winreg.QueryInfoKey(key)[1]):
                name, value, _ = winreg.EnumValue(key, i)
                if name.startswith('FrameworkClean.SeedreamLayerize.ApiKey_'):
                    value = (value.decode('utf-8') if isinstance(value, bytes) else value).rstrip('\0').strip()
                    if value:
                        return value
    except (ImportError, OSError):
        pass
    raise RuntimeError('Seedream credential unavailable: ARK_API_KEY / configured EditorPrefs')


class NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, *args, **kwargs):
        return None


def save(path, data):
    temporary = path.with_suffix(path.suffix + '.tmp')
    temporary.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding='utf-8')
    temporary.replace(path)


def run(args):
    out = args.out.resolve()
    out.mkdir(parents=True, exist_ok=True)
    response = out / 'response.json'
    attempt = out / 'submitted.json'
    if not response.exists():
        if args.resume:
            raise RuntimeError('No saved response to resume')
        if attempt.exists():
            raise RuntimeError('Submission already recorded without response; inspect before any paid retry')
        if not args.source or not args.prompt:
            raise RuntimeError('--source and --prompt required for a new submission')
        source = args.source.resolve()
        mime = {'.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg'}.get(source.suffix.lower())
        if not mime:
            raise RuntimeError('Source must be PNG or JPEG')
        content = source.read_bytes()
        request = dict(model=MODEL, size='auto', response_format='url', output_format='png',
                       watermark=False, layer_decomposition=True, optimize_prompt_options={'mode': 'standard'},
                       prompt=args.prompt.read_text(encoding='utf-8-sig'),
                       image=f'data:{mime};base64,' + base64.b64encode(content).decode())
        secret = credential()
        save(out / 'request-redacted.json', {**request, 'image': str(source), 'sha256': hashlib.sha256(content).hexdigest()})
        req = urllib.request.Request(ENDPOINT, json.dumps(request).encode(),
                                     {'Content-Type': 'application/json', 'Authorization': 'Bearer ' + secret})
        # Exclusive creation prevents concurrent callers submitting the same job twice.
        with attempt.open('x', encoding='utf-8') as f:
            json.dump({'time': time.time(), 'source': str(source), 'sha256': hashlib.sha256(content).hexdigest()}, f)
        try:
            with urllib.request.build_opener(NoRedirect).open(req, timeout=300) as result:
                body = result.read().decode()
        except urllib.error.HTTPError as error:
            body = error.read().decode()
        response.write_text(body.replace(secret, '[REDACTED]'), encoding='utf-8')
    data = json.loads(response.read_text(encoding='utf-8'))
    if data.get('error') or not data.get('data'):
        raise RuntimeError('Saved API response is an error or contains no layers; inspect response.json')
    layers = []
    for index, item in enumerate(data['data']):
        if item.get('error'):
            raise RuntimeError(f'Layer {index} failed; inspect response.json')
        path = out / f'layer-{index:02}.png'
        if not path.exists():
            if item.get('b64_json'):
                content = base64.b64decode(item['b64_json'].split(',')[-1], validate=True)
            else:
                url = item.get('url', '')
                if not url.startswith('https://'):
                    raise RuntimeError('Missing HTTPS layer URL')
                with urllib.request.urlopen(url, timeout=90) as result:
                    content = result.read()
            if not content.startswith(b'\x89PNG\r\n\x1a\n'):
                raise RuntimeError('Layer response is not PNG')
            temporary = path.with_suffix('.tmp')
            temporary.write_bytes(content)
            temporary.replace(path)
        layers.append({**{k: v for k, v in item.items() if k not in ('url', 'b64_json')}, 'path': str(path)})
    save(out / 'layers.json', {'submission': json.loads(attempt.read_text(encoding='utf-8')) if attempt.exists() else None,
                             'layers': layers, 'usage': data.get('usage')})
    print(f'Cached {len(layers)} layers: {out / "layers.json"}')


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--source', type=Path)
    parser.add_argument('--prompt', type=Path)
    parser.add_argument('--out', type=Path, required=True)
    parser.add_argument('--resume', action='store_true')
    run(parser.parse_args())
