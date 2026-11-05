"""Build a short two-note 8-bit coin pickup cue (no external dependencies)."""
import math
import struct
import wave
from pathlib import Path

RATE = 48000
DURATION = .13
out = Path(__file__).resolve().parents[1] / 'dist/assets/audio/cash-pickup-bit.wav'
samples = []
phase = 0.
for i in range(round(RATE * DURATION)):
    t = i / RATE
    # A rising fifth, pulse-wave timbre and stepped amplitude give a coin-like chirp.
    frequency = 987.77 if t < .045 else 1480.
    phase += frequency / RATE
    envelope = min(1., t / .002) * min(1., (DURATION-t) / .018)
    envelope *= 1 - .4 * t / DURATION
    amplitude = round(envelope * 15) / 15 * .24
    samples.append(round((1 if phase % 1 < .25 else -1/3) * amplitude * 32767))
with wave.open(str(out), 'wb') as wav:
    wav.setnchannels(1)
    wav.setsampwidth(2)
    wav.setframerate(RATE)
    wav.writeframes(struct.pack('<' + 'h' * len(samples), *samples))
print(out)
