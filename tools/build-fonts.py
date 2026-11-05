"""Generate local WOFF2 assets from game text; never downloads during a build.

Requires: python -m pip install 'fonttools[woff]'
"""
from pathlib import Path
import hashlib
import json
import re
import shutil
from fontTools import subset
from fontTools.ttLib import TTFont

ROOT = Path(__file__).resolve().parents[1]
DIST = ROOT / 'dist'
SOURCE = ROOT / 'source-assets/fonts'
OUT = DIST / 'assets/fonts'


def build():
    OUT.mkdir(parents=True, exist_ok=True)
    # Scan source, not generated bundles. A superset (including comments) avoids
    # relying on fragile JS string parsing and includes dynamically joined text.
    text = ''.join(chr(i) for i in range(32, 127))
    for path in sorted(DIST.rglob('*')):
        if path.suffix in {'.js', '.html', '.css', '.json'} and OUT not in path.parents:
            source = path.read_text(encoding='utf-8')
            source = re.sub(r'\\u\{([0-9a-fA-F]+)\}|\\u([0-9a-fA-F]{4})',
                            lambda m: chr(int(m[1] or m[2], 16)), source)
            text += source
    chars = set(text)
    entries = []
    for filename, output, wanted in [
        ('GlowSansSC-Normal-Medium.otf', 'glow-medium.woff2', chars),
        ('GlowSansSC-Normal-Bold.otf', 'glow-bold.woff2', chars),
        ('Rajdhani-SemiBold.ttf', 'rajdhani-numbers.woff2', set('0123456789.,:+-%/×$')),
    ]:
        path = SOURCE / filename
        font = TTFont(path, recalcTimestamp=False)
        cmap = font.getBestCmap()
        available = {ord(c) for c in wanted if ord(c) in cmap}
        digest = hashlib.sha256(path.read_bytes() + ''.join(map(chr, sorted(available))).encode()).hexdigest()
        cache = OUT / (output + '.sha256')
        if not (OUT / output).exists() or not cache.exists() or cache.read_text() != digest:
            options = subset.Options()
            options.flavor = 'woff2'
            options.recalc_timestamp = False
            worker = subset.Subsetter(options=options)
            worker.populate(unicodes=available)
            worker.subset(font)
            font.flavor = 'woff2'
            font.save(OUT / output)
            cache.write_text(digest)
        entries.append({'file': output, 'glyphCharacters': len(available), 'bytes': (OUT / output).stat().st_size})
    for license_file in SOURCE.glob('*-OFL.txt'):
        shutil.copyfile(license_file, OUT / license_file.name)
    (OUT / 'manifest.json').write_text(json.dumps(entries, indent=2) + '\n', encoding='utf-8')
    print('Font subsets:', ', '.join(f"{e['file']} {e['bytes'] / 1024:.1f} KiB" for e in entries))


if __name__ == '__main__':
    build()
