"""Deterministic original 8-bit explosion, no external recordings."""
from pathlib import Path
import wave
import numpy as np
rate=22050
n=int(rate*.38)
t=np.arange(n)/rate
rng=np.random.default_rng(6000)
# Sample-held noise and stepped square oscillator emulate a tiny console sound chip.
noise=np.repeat(rng.uniform(-1,1,(n+7)//8),8)[:n]
freq=np.round((48+180*np.exp(-t*23))/12)*12
square=np.sign(np.sin(2*np.pi*np.cumsum(freq)/rate))
x=(noise*.72+square*.28)*np.exp(-t*12)*np.minimum(1,t/.0015)
x*=np.minimum(1,(.38-t)/.018)
x=np.round(x*31)/31
x*=.88/max(abs(x))
out=Path(__file__).resolve().parents[1]/'dist/assets/audio/enemy-death-bit.wav'
with wave.open(str(out),'wb') as f:
 f.setnchannels(1);f.setsampwidth(2);f.setframerate(rate);f.writeframes((x*32767).astype('<i2').tobytes())
print(out)
