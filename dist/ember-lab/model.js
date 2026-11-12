// Ember Lab 2D model, wrapped for the game and its offline build.
(() => {
'use strict';

const DT = 1 / 30;
const PRESSURE_ITERATIONS = 12;
const PRESSURE_LEAK = 0.04;
const MAX_EMITTERS = 4;
const SHOCK_WIDTH = 0.045;

function emittersForStep(source) {
  const emitters = Array.isArray(source) ? source : [source];
  if (emitters.length > MAX_EMITTERS) throw new RangeError(`At most ${MAX_EMITTERS} emitters per step`);
  return emitters;
}

function hueAt(source, dx, dy, time, rainbowPhase) {
  if (source.hue != null) return source.hue;
  const phase = source.rainbowPhase ?? rainbowPhase;
  if (phase != null) return phase + Math.atan2(dy, dx) / (2 * Math.PI);
  return 0.66 + 0.8 * time + 5.2 * dx + 3 * dy;
}

function spectrumChannel(hue, channel) {
  const phase = hue + (channel === 0 ? 0 : (3 - channel) / 3);
  return Math.max(0, Math.min(1, Math.abs((phase - Math.floor(phase)) * 6 - 3) - 1));
}

function remainingSmoke(time, expiry, fade) {
  const remaining = Math.max(0, Math.min(1, 1 - (time - expiry) / fade));
  return remaining * remaining * (3 - 2 * remaining);
}

function flameHash(x, y) {
  let value = Math.imul(x, 0x9e3779b1) ^ Math.imul(y, 0x85ebca77);
  value = Math.imul(value ^ (value >>> 16), 0x7feb352d);
  return ((value ^ (value >>> 15)) & 0xffff) / 65535;
}

function flameNoise(x, y) {
  const ix = Math.floor(x), iy = Math.floor(y);
  let fx = x - ix, fy = y - iy;
  fx *= fx * (3 - 2 * fx);
  fy *= fy * (3 - 2 * fy);
  const a = flameHash(ix, iy), b = flameHash(ix, iy + 1);
  const lo = a + fx * (flameHash(ix + 1, iy) - a);
  const hi = b + fx * (flameHash(ix + 1, iy + 1) - b);
  return 2 * (lo + fy * (hi - lo)) - 1;
}

function sourceAt(scene, time, strength) {
  if (scene === 'collision') {
    const pulse = 0.5 + 0.5 * Math.cos(4.5 * time);
    const jet = { y: 0.46, radius: 0.088, amount: strength * (0.62 + 0.45 * pulse), smoke: 4.6,
      heat: 0.7, fuel: 0, impulse: 0.25, lift: 0.3, expansion: 0.05, turbulence: 0.75 };
    return [{ ...jet, x: 0.22, jetX: 10, hue: 0.51 }, { ...jet, x: 0.78, jetX: -10, hue: 0.075 }];
  }
  if (scene === 'smoke') {
    return { x: 0.5, y: 0.12, radius: 0.078, amount: strength * 0.8, smoke: 3.5,
      heat: 2.5, fuel: 0, cooling: 1.15, impulse: 0.35, lift: 1.8, rise: 1, expansion: 0.06, turbulence: 0.7 };
  }
  const pulse = Math.max(0, 1 - time / 0.5);
  return { x: 0.5, y: 0.5, radius: 0.142 + 0.24 * Math.min(time, 0.5),
    amount: strength * pulse * pulse, smoke: 3.3, heat: 12, fuel: 4.6,
    cooling: 3.3, impulse: 7.5, lift: 0, rise: 0, expansion: 4.2, turbulence: 1.65 };
}

class CpuFluid {
  constructor(n) {
    this.n = n;
    const field = () => new Float32Array(n * n * 4);
    const scalar = () => new Float32Array(n * n);
    this.velocity = field();
    this.advected = field();
    this.forced = field();
    this.material = field();
    this.reacted = field();
    this.dye = field();
    this.reactedDye = field();
    this.curl = scalar();
    this.divergence = scalar();
    this.pressure = scalar();
    this.nextPressure = scalar();
  }

  reset() {
    this.velocity.fill(0);
    this.material.fill(0);
    this.dye.fill(0);
    this.pressure.fill(0);
  }

  sample(field, output, i, x, y, channels) {
    const n = this.n, row = n * 4, last = n - 1;
    const px = Math.max(0, Math.min(last, x));
    const py = Math.max(0, Math.min(last, y));
    const ix = Math.floor(px), iy = Math.floor(py);
    const a = ix * 4 + iy * row;
    const sx = ix < last ? 4 : 0, sy = iy < last ? row : 0;
    const fx = px - ix, fy = py - iy;
    for (let c = 0; c < channels; c++) {
      const j = a + c;
      const lo = field[j] + fx * (field[j + sx] - field[j]);
      const hi = field[j + sy] + fx * (field[j + sy + sx] - field[j + sy]);
      output[i + c] = lo + fy * (hi - lo);
    }
  }

  advect(field, output, channels) {
    const { n, velocity } = this;
    let i = 0;
    for (let y = 0; y < n; y++) for (let x = 0; x < n; x++, i += 4) {
      const vx = velocity[i], vy = velocity[i + 1];
      this.sample(velocity, output, i, x - DT * vx, y - DT * vy, 2);
      this.sample(field, output, i, x - 0.5 * DT * (vx + output[i]),
        y - 0.5 * DT * (vy + output[i + 1]), channels);
    }
  }

  step(source, settings, time) {
    const n = this.n, last = n - 1;
    const { noiseX = 0, noiseY = 0, rainbowPhase, breakup = 0, expiryFade = 1, latestExpiry = Infinity, sharedPigment } = settings;
    const emitters = emittersForStep(source);
    const medium = emitters[0];
    const { velocity, advected, forced, curl, material, reacted, dye, reactedDye, divergence } = this;
    this.advect(velocity, advected, 3);
    let cell = 0;
    for (let y = 0; y < n; y++) for (let x = 0; x < n; x++, cell++) {
      const l = x ? cell - 1 : cell, r = x < last ? cell + 1 : cell;
      const b = y ? cell - n : cell, t = y < last ? cell + n : cell;
      curl[cell] = 0.5 * (advected[4 * r + 1] - advected[4 * l + 1] - advected[4 * t] + advected[4 * b]);
    }

    const densityKeep = Math.exp(-settings.decay * DT), heatKeep = Math.exp(-(settings.cooling ?? medium?.cooling ?? 1.15) * DT);
    const buoyancy = settings.buoyancy * (settings.rise ?? medium?.rise ?? 1);
    const velocityKeep = settings.velocityKeep ?? 0.991;
    cell = 0;
    for (let y = 0; y < n; y++) for (let x = 0; x < n; x++, cell++) {
      const i = 4 * cell;
      const l = x ? cell - 1 : cell, r = x < last ? cell + 1 : cell;
      const b = y ? cell - n : cell, t = y < last ? cell + n : cell;
      const gx = Math.abs(curl[r]) - Math.abs(curl[l]), gy = Math.abs(curl[t]) - Math.abs(curl[b]);
      const spin = settings.swirl * curl[cell] / Math.sqrt(gx * gx + gy * gy + 0.0001);
      const px = (x + 0.5) / n, py = (y + 0.5) / n;
      const oldSmoke = material[i], oldExpiry = oldSmoke > 0.001 ? dye[i + 3] / oldSmoke : 0;
      let keep = densityKeep;
      // Apply just this step's share of the fade to smoke mass and its carried dye.
      if (breakup > 0 && oldExpiry > 0 && time + DT > oldExpiry) {
        const before = remainingSmoke(time, oldExpiry, expiryFade);
        keep *= remainingSmoke(time + DT, oldExpiry, expiryFade) / Math.max(before, 0.000001);
      }
      let smokeIn = 0, heatIn = 0, fuelIn = 0, fx = 0, fy = 0, expansion = 0;
      let red = 0, green = 0, blue = 0, expiryMass = 0, folds = advected[i + 2] * 0.99;
      for (const emitter of emitters) {
        let dx = px - emitter.x, dy = py - emitter.y;
        if (emitter.sweepX || emitter.sweepY) {
          const sx = emitter.sweepX, sy = emitter.sweepY;
          const t = Math.max(0, Math.min(1, (dx * sx + dy * sy) / (sx * sx + sy * sy)));
          dx -= t * sx;
          dy -= t * sy;
        }
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance >= emitter.radius * 1.2 || emitter.amount <= 0) continue;
        const roughness = 1 + 0.18 * Math.sin(48 * dx + 5 * time + noiseX) * Math.sin(39 * dy + 1.4 + noiseY);
        const edge = Math.max(0, 1 - distance / (emitter.radius * roughness));
        const emission = emitter.amount * edge * edge * (3 - 2 * edge);
        if (emission <= 0) continue;
        const e = emission * DT, smokeAdded = e * emitter.smoke;
        smokeIn += smokeAdded;
        heatIn += e * emitter.heat;
        fuelIn += e * emitter.fuel;
        const hue = hueAt(emitter, dx, dy, time, rainbowPhase);
        const b = spectrumChannel(hue, 2);
        if (sharedPigment) {
          if (emitter.paleSmoke) blue += smokeAdded;
          else {
            red += smokeAdded * (spectrumChannel(hue, 0) - b);
            green += smokeAdded * (spectrumChannel(hue, 1) - b);
          }
        } else {
          red += smokeAdded * spectrumChannel(hue, 0);
          green += smokeAdded * spectrumChannel(hue, 1);
          blue += smokeAdded * b;
        }
        let expiry = emitter.smokeExpiry ?? 0;
        if (breakup > 0 && expiry > 0) {
          // Neighboring cells are born with related lifetimes and carry them with the dye.
          const qx = px * 14 + noiseX * 2, qy = py * 14 + noiseY * 2;
          const uneven = .49 * flameNoise(qx, qy) + .11 * flameNoise(qx * 2 + 4.1, qy * 2 + 7.3);
          expiry = Math.min(emitter.latestExpiry ?? latestExpiry, Math.max(time + .07, expiry + breakup * uneven));
        }
        expiryMass += smokeAdded * expiry;
        const push = emission * emitter.impulse / Math.max(0.025, distance);
        const eddy = emission * emitter.turbulence;
        fx += push * dx + emission * (emitter.jetX ?? 0) + eddy * Math.sin(29 * dy + 4 * time + noiseY);
        fy += push * dy + emission * emitter.lift + eddy * Math.sin(26 * dx + 2.1 + 3 * time + noiseX);
        expansion += emission * emitter.expansion;
        if (emitter.fuel > 0) {
          const fine = flameNoise(49 * dx + 8.2 + 4 * noiseX, 46 * dy + 3.7 + 4 * noiseY);
          const broad = flameNoise(19 * dx + 2.4 + 2 * noiseY + 0.45 * fine, 21 * dy + 5.8 + 2 * noiseX - 0.38 * fine);
          folds += (0.82 * broad + 0.18 * fine - folds) * Math.min(1, 22 * e);
        }
      }
      const retainedSmoke = oldSmoke * keep;
      let smoke = retainedSmoke + smokeIn;
      const combustionCooling = sharedPigment ? 2.8 * Math.min(1, 2 * material[i + 2] + 5 * material[i + 3]) : 0;
      const heat = material[i + 1] * heatKeep * Math.exp(-combustionCooling * DT) + heatIn;
      const fuel = material[i + 2] + fuelIn;
      let flame = material[i + 3];
      const extinction = 0.5 * (Number(heat <= 0.527) + Math.exp(-((heat / 0.527) ** 2)));
      const extinct = flame * (3 + 6 * extinction) * DT;
      flame -= extinct;
      smoke += extinct * 0.65;
      const oxygen = Math.max(0, 1 - fuel * 0.6 - smoke - flame);
      const ignition = 0.5 * (Number(heat >= 0.634) + Math.exp(-0.634 / Math.max(heat, 0.01)));
      const burn = Math.min(fuel, oxygen) * ignition * (9 * DT);
      const nextSmoke = Math.min(8, smoke + burn * 0.3);
      reacted[i] = nextSmoke;
      reacted[i + 1] = Math.min(8, heat + burn * 1.75);
      reacted[i + 2] = fuel - burn;
      reacted[i + 3] = flame + burn * 1.7;

      // Transport color and expiry together, weighted by smoke mass.
      const newSmoke = Math.max(0, nextSmoke - retainedSmoke);
      if (smokeIn > 0) {
        const scale = newSmoke / smokeIn;
        red *= scale;
        green *= scale;
        blue *= scale;
        expiryMass *= scale;
      } else if (newSmoke > 0) {
        const birthExpiry = medium?.smokeExpiry ?? 0;
        const expiry = oldSmoke > 0.001 ? oldExpiry : breakup > 0 ? Math.min(birthExpiry, latestExpiry) : birthExpiry;
        expiryMass = newSmoke * expiry;
        if (sharedPigment && oldSmoke > 0.001) {
          red = newSmoke * dye[i] / oldSmoke;
          green = newSmoke * dye[i + 1] / oldSmoke;
          blue = newSmoke * dye[i + 2] / oldSmoke;
        } else if (medium) {
          const hue = hueAt(medium, px - medium.x, py - medium.y, time, rainbowPhase);
          if (sharedPigment && medium.paleSmoke) blue = newSmoke;
          else {
            const b = spectrumChannel(hue, 2);
            red = newSmoke * (spectrumChannel(hue, 0) - (sharedPigment ? b : 0));
            green = newSmoke * (spectrumChannel(hue, 1) - (sharedPigment ? b : 0));
            blue = sharedPigment ? 0 : newSmoke * b;
          }
        }
      }
      reactedDye[i] = dye[i] * keep + red;
      reactedDye[i + 1] = dye[i + 1] * keep + green;
      reactedDye[i + 2] = dye[i + 2] * keep + blue;
      reactedDye[i + 3] = dye[i + 3] * keep + expiryMass;

      fy += buoyancy * (0.33 * reacted[i + 1] - 0.045 * reacted[i] - 0.025 * reacted[i + 2]);
      forced[i] = x === last ? 0 : velocityKeep * advected[i] + DT * (n * fx + gy * spin);
      forced[i + 1] = y === last ? 0 : velocityKeep * advected[i + 1] + DT * (n * fy - gx * spin);
      // The spare velocity channel carries visual detail with the flow.
      forced[i + 2] = folds;
      forced[i + 3] = expansion + burn * 15;
    }

    cell = 0;
    for (let y = 0; y < n; y++) for (let x = 0; x < n; x++, cell++) {
      const i = 4 * cell;
      divergence[cell] = forced[i] + forced[i + 1] - (x ? forced[i - 4] : 0)
        - (y ? forced[i - 4 * n + 1] : 0) - forced[i + 3];
    }

    for (let iteration = 0; iteration < PRESSURE_ITERATIONS; iteration++) {
      const { pressure, nextPressure } = this;
      cell = 0;
      for (let y = 0; y < n; y++) for (let x = 0; x < n; x++, cell++) {
        const l = x > 0, r = x < last, b = y > 0, t = y < last;
        const sum = (l ? pressure[cell - 1] : 0) + (r ? pressure[cell + 1] : 0)
          + (b ? pressure[cell - n] : 0) + (t ? pressure[cell + n] : 0);
        nextPressure[cell] = (sum - divergence[cell]) / (l + r + b + t + PRESSURE_LEAK);
      }
      this.pressure = nextPressure;
      this.nextPressure = pressure;
    }

    const { pressure } = this, shocks = settings.shocks ?? [];
    cell = 0;
    for (let y = 0; y < n; y++) for (let x = 0; x < n; x++, cell++) {
      const i = 4 * cell;
      let shockX = 0, shockY = 0;
      if (shocks.length) {
        const density = Math.max(0, Math.min(1, (material[i] - .006) / .069));
        const heat = Math.max(0, Math.min(1, (material[i + 1] - .36) / .89));
        const carrier = density * density * (3 - 2 * density) * (1 - heat * heat * (3 - 2 * heat));
        const coupling = .08 + .92 * carrier;
        for (const shock of shocks) {
          const dx = (x + .5) / n - shock.x, dy = (y + .5) / n - shock.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          const front = Math.max(0, 1 - Math.abs(distance - shock.radius) / SHOCK_WIDTH);
          const push = coupling * n * shock.strength * front * front * (3 - 2 * front) / Math.max(distance, .001);
          shockX += dx * push;
          shockY += dy * push;
        }
      }
      velocity[i] = x < last ? forced[i] - pressure[cell + 1] + pressure[cell] + shockX : 0;
      velocity[i + 1] = y < last ? forced[i + 1] - pressure[cell + n] + pressure[cell] + shockY : 0;
      velocity[i + 2] = forced[i + 2];
    }

    this.advect(reacted, material, 4);
    this.advect(reactedDye, dye, 4);
    let i = 0;
    for (let y = 0; y < n; y++) for (let x = 0; x < n; x++, i += 4) {
      const edge = Math.min(x, y, last - x, last - y);
      const sponge = Math.min(1, 0.82 + 0.09 * edge);
      for (let c = 0; c < 4; c++) material[i + c] *= sponge;
      for (let c = 0; c < 4; c++) dye[i + c] *= sponge;
    }
  }
}

globalThis.EmberLab = { DT, sourceAt, CpuFluid, PRESSURE_ITERATIONS, PRESSURE_LEAK, MAX_EMITTERS, SHOCK_WIDTH, emittersForStep };
})();
