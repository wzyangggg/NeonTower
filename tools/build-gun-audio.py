"""Import the user's real gun recordings as compact, level-matched game samples."""
import json
import wave
from pathlib import Path
import numpy as np

ROOT = Path(__file__).resolve().parents[1]
LIBRARY = Path(r'E:\AudioDatabase\Ultimate Sound FX Bundle\Real Recorded Guns')
OUT = ROOT / 'dist/assets/audio/recorded-guns'
SOURCES = {
    'pistol': ('Pistol 01/Pistol Single Shot.wav', .55),
    'smg': ('Submachine Gun_01/SMG Single Shot.wav', .28),
    'uzi': ('Submachine Gun_03/SMG Single Shot.wav', .28),
    'rifle': ('Assault Rifle 01/AR Single Shot.wav', .48),
    'machine': ('M4 AR/M4 Single Shot.wav', .38),
    'shotgun': ('Shotgun 01/Shotgun Boom 101.wav', .72),
    'sniper': ('Sniper Semi Auto/Sniper Single Shot.wav', .8),
    'barrett': ('Sniper Semi Auto/Sniper Single Shot 3.wav', .9),
    'magnum': ('Magnum Revolver/Revolver Single Shot.wav', .65),
    **{f'armor-{i}': (f'Body armor Impact/Body armor {i}.wav', .3) for i in range(1, 11)},
}

def build():
    OUT.mkdir(parents=True, exist_ok=True)
    report = {}
    for name, (relative, limit) in SOURCES.items():
        with wave.open(str(LIBRARY / relative), 'rb') as f:
            assert f.getsampwidth() == 2
            rate = f.getframerate()
            samples = np.frombuffer(f.readframes(f.getnframes()), dtype='<i2').astype(float).reshape(-1, f.getnchannels()).mean(axis=1) / 32768
        # Remove dead air, retain the attack and a short natural decay; fade the cut.
        active = np.flatnonzero(np.abs(samples) > max(.001, np.max(np.abs(samples)) * .012))
        start = max(0, int(active[0]) - int(rate * .002))
        end = min(len(samples), int(active[-1]) + int(rate * .025), start + int(rate * limit))
        samples = samples[start:end].copy()
        attack = samples[:min(len(samples), int(rate * .12))]
        gain = min(.16 / max(np.sqrt(np.mean(attack ** 2)), 1e-6), .7 / max(np.max(np.abs(samples)), 1e-6))
        samples *= gain
        fade = min(len(samples), int(rate * .025))
        samples[-fade:] *= np.linspace(1, 0, fade)
        with wave.open(str(OUT / f'{name}.wav'), 'wb') as f:
            f.setparams((1, 2, rate, 0, 'NONE', 'not compressed'))
            f.writeframes(np.rint(samples * 32767).astype('<i2').tobytes())
        report[name] = dict(source=relative, duration=round(len(samples)/rate, 4), peak=round(float(np.max(np.abs(samples))), 4), gainDb=round(float(20*np.log10(gain)), 2))
    (OUT / 'manifest.json').write_text(json.dumps(report, indent=2), encoding='utf-8')
    print(json.dumps(report, indent=2))

if __name__ == '__main__':
    build()
