// Ember Lab 2D gpu, wrapped for the game and its offline build.
(() => {
'use strict';

const { DT, PRESSURE_ITERATIONS, PRESSURE_LEAK, MAX_EMITTERS, SHOCK_WIDTH, emittersForStep } = globalThis.EmberLab;

const vertex = `#version 300 es
out vec2 uv;
void main() {
  uv = vec2((gl_VertexID << 1) & 2, gl_VertexID & 2);
  gl_Position = vec4(uv * 2.0 - 1.0, 0, 1);
}`;

function program(gl, fragment, vertexSource = vertex) {
  const compile = (type, source) => {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      const error = gl.getShaderInfoLog(shader);
      gl.deleteShader(shader);
      throw new Error(error);
    }
    return shader;
  };
  const vs = compile(gl.VERTEX_SHADER, vertexSource);
  let fs;
  try {
    fs = compile(gl.FRAGMENT_SHADER, fragment);
  } catch (error) {
    gl.deleteShader(vs);
    throw error;
  }
  const handle = gl.createProgram();
  gl.attachShader(handle, vs);
  gl.attachShader(handle, fs);
  gl.linkProgram(handle);
  gl.deleteShader(vs);
  gl.deleteShader(fs);
  if (!gl.getProgramParameter(handle, gl.LINK_STATUS)) {
    const error = gl.getProgramInfoLog(handle);
    gl.deleteProgram(handle);
    throw new Error(error);
  }
  const locations = new Map();
  return {
    use: () => gl.useProgram(handle),
    dispose: () => gl.deleteProgram(handle),
    uniform(name) {
      if (!locations.has(name)) locations.set(name, gl.getUniformLocation(handle, name));
      return locations.get(name);
    },
  };
}

function fieldTexture(gl, n) {
  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texStorage2D(gl.TEXTURE_2D, 1, gl.RGBA16F, n, n);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  return texture;
}

const shaderHeader = `#version 300 es
precision highp float;
precision highp int;
precision highp sampler2D;
layout(location = 0) out vec4 result;
`;

// Reference concrete uniforms in both samples to keep their bindings distinct on ANGLE/D3D11.
const simulationHeader = `${shaderHeader}
uniform int n;
uniform sampler2D a, b, c, dyeForForce;
uniform int emitterCount;
uniform int shockCount;
uniform vec4 shocks[${MAX_EMITTERS}];
uniform vec4 shapes[${MAX_EMITTERS}], rates[${MAX_EMITTERS}], thrust[${MAX_EMITTERS}], jets[${MAX_EMITTERS}];
uniform vec4 sweeps[${MAX_EMITTERS}];
uniform bool sharedPigment;
uniform vec4 settings;
uniform float velocityKeep;
uniform vec3 variation;
uniform vec3 smokeTiming;
uniform float time;
const float dt = ${DT};
const ivec2 X = ivec2(1, 0), Y = ivec2(0, 1);
#define readCell(field, p) texelFetch(field, clamp(p, ivec2(0), ivec2(n - 1)), 0)
vec2 delta(ivec2 p, vec4 shape) { return (vec2(p) + 0.5) / float(n) - shape.xy; }
vec2 sweptDelta(ivec2 p, int j) {
  vec2 d = delta(p, shapes[j]), segment = sweeps[j].xy;
  float u = clamp(dot(d, segment) / max(1e-12, dot(segment, segment)), 0.0, 1.0);
  return d - segment * u;
}
float emission(vec2 d, vec4 shape) {
  float distance = length(d);
  if (distance >= shape.z * 1.2 || shape.w <= 0.0) return 0.0;
  float roughness = 1.0 + 0.18 * sin(48.0 * d.x + 5.0 * time + variation.x) * sin(39.0 * d.y + 1.4 + variation.y);
  float edge = max(0.0, 1.0 - distance / (shape.z * roughness));
  return shape.w * edge * edge * (3.0 - 2.0 * edge);
}
vec3 emitterColor(vec2 d, vec4 jet, float phase) {
  float hue = 0.66 + 0.8 * time + dot(d, vec2(5.2, 3.0));
  float rainbow = phase >= 0.0 ? phase : variation.z;
  if (jet.z > 0.0) hue = jet.y;
  else if (rainbow >= 0.0) hue = rainbow + atan(d.y, d.x == 0.0 ? 1e-6 : d.x) / 6.28318530718;
  return clamp(abs(fract(hue + vec3(0.0, 2.0 / 3.0, 1.0 / 3.0)) * 6.0 - 3.0) - 1.0, 0.0, 1.0);
}
vec3 smokePigment(vec2 d, int j) {
  vec3 color = emitterColor(d, jets[j], rates[j].w);
  if (!sharedPigment) return color;
  if (sweeps[j].z > 0.0) return vec3(0.0, 0.0, 1.0);
  return vec3(color.rg - color.b, 0.0);
}
vec2 interior(ivec2 p) { return vec2(lessThan(p, ivec2(n - 1))); }
vec2 toUV(vec2 p) { return (p + 0.5) / float(n); }
vec2 departure(ivec2 p) {
  vec2 v1 = readCell(b, p).xy;
  vec2 v2 = textureLod(b, toUV(vec2(p) - dt * v1), 0.0).xy;
  return toUV(vec2(p) - 0.5 * dt * (v1 + v2));
}
float flameHash(ivec2 p) {
  uint value = uint(p.x) * 0x9e3779b1u ^ uint(p.y) * 0x85ebca77u;
  value = (value ^ (value >> 16u)) * 0x7feb352du;
  return float((value ^ (value >> 15u)) & 0xffffu) / 65535.0;
}
float flameNoise(vec2 p) {
  ivec2 cell = ivec2(floor(p));
  vec2 f = fract(p);
  f *= f * (3.0 - 2.0 * f);
  float lo = mix(flameHash(cell), flameHash(cell + X), f.x);
  float hi = mix(flameHash(cell + Y), flameHash(cell + X + Y), f.x);
  return 2.0 * mix(lo, hi, f.y) - 1.0;
}
float remainingSmoke(float at, float expiry) {
  float remaining = clamp(1.0 - (at - expiry) / smokeTiming.y, 0.0, 1.0);
  return remaining * remaining * (3.0 - 2.0 * remaining);
}
float smokeKeep(float mass, float expiryMass) {
  float keep = exp(-settings.z * dt);
  if (smokeTiming.x <= 0.0 || mass <= 0.001 || expiryMass <= 0.0) return keep;
  float expiry = expiryMass / mass;
  if (time + dt <= expiry) return keep;
  return keep * remainingSmoke(time + dt, expiry) / max(remainingSmoke(time, expiry), 0.000001);
}
float bornExpiry(ivec2 p, float expiry, float latestExpiry) {
  if (smokeTiming.x <= 0.0 || expiry <= 0.0) return expiry;
  vec2 q = (vec2(p) + 0.5) * (14.0 / float(n)) + variation.xy * 2.0;
  float uneven = 0.49 * flameNoise(q) + 0.11 * flameNoise(q * 2.0 + vec2(4.1, 7.3));
  return min(latestExpiry > 0.0 ? latestExpiry : smokeTiming.z, max(time + 0.07, expiry + smokeTiming.x * uneven));
}
vec4 reaction(vec4 m, vec3 injected, float keep, out float burn) {
  m.x *= keep;
  // Burning parcels cool faster than the warm, fuel-free exhaust in the same field.
  float combustionCooling = sharedPigment ? 2.8 * clamp(2.0 * m.z + 5.0 * m.w, 0.0, 1.0) : 0.0;
  m.y *= exp(-(settings.w + combustionCooling) * dt);
  m.xyz += injected;
  float ratio = m.y / 0.527;
  float extinction = mix(step(m.y, 0.527), exp(-ratio * ratio), 0.5);
  float extinct = m.w * (3.0 + 6.0 * extinction) * dt;
  m.w -= extinct;
  m.x += extinct * 0.65;
  float oxygen = max(0.0, 1.0 - dot(m.xzw, vec3(1.0, 0.6, 1.0)));
  float ignition = mix(step(0.634, m.y), exp(-0.634 / max(m.y, 0.01)), 0.5);
  burn = min(m.z, oxygen) * ignition * (9.0 * dt);
  m += burn * vec4(0.3, 1.75, -1.0, 1.7);
  m.xy = min(m.xy, vec2(8));
  return m;
}
`;

const stages = {
  advect: `return textureLod(a, departure(p), 0.0);`,
  curl: `
    float dx = readCell(a, p + X).y - readCell(a, p - X).y;
    float dy = readCell(a, p + Y).x - readCell(a, p - Y).x;
    return vec4(0.5 * (dx - dy), 0, 0, 0);`,
  force: `
    vec3 transported = readCell(a, p).xyz;
    vec3 injected = vec3(0);
    vec2 force = vec2(0);
    float expansion = 0.0, folds = transported.z * 0.99;
    for (int j = 0; j < emitterCount; j++) {
      vec2 d = sweptDelta(p, j);
      float e = emission(d, shapes[j]);
      if (e <= 0.0) continue;
      vec4 push = thrust[j];
      injected += dt * e * rates[j].xyz;
      force += e * (push.x * d / max(0.025, length(d)) + vec2(jets[j].x, push.y));
      force += e * push.w * sin(vec2(29.0 * d.y + 4.0 * time, 26.0 * d.x + 2.1 + 3.0 * time) + variation.yx);
      expansion += e * push.z;
      if (rates[j].z > 0.0) {
        float fine = flameNoise(d * vec2(49.0, 46.0) + vec2(8.2, 3.7) + 4.0 * variation.xy);
        float broad = flameNoise(d * vec2(19.0, 21.0) + vec2(2.4, 5.8) + 2.0 * variation.yx + fine * vec2(0.45, -0.38));
        folds = mix(folds, 0.82 * broad + 0.18 * fine, min(1.0, 22.0 * e * dt));
      }
    }
    float burn;
    vec4 old = readCell(b, p);
    float expiryMass = smokeTiming.x > 0.0 ? readCell(dyeForForce, p).a : 0.0;
    vec4 material = reaction(old, injected, smokeKeep(old.x, expiryMass), burn);
    force.y += settings.y * (0.33 * material.y - 0.045 * material.x - 0.025 * material.z);
    vec2 g = vec2(abs(readCell(c, p + X).x) - abs(readCell(c, p - X).x),
                  abs(readCell(c, p + Y).x) - abs(readCell(c, p - Y).x));
    float spin = settings.x * readCell(c, p).x * inversesqrt(dot(g, g) + 0.0001);
    vec2 v = velocityKeep * transported.xy + dt * (float(n) * force + vec2(g.y, -g.x) * spin);
    return vec4(v * interior(p), folds, expansion + burn * 15.0);`,
  divergence: `
    vec4 v = readCell(a, p);
    vec2 before = vec2(p.x > 0 ? readCell(a, p - X).x : 0.0,
                       p.y > 0 ? readCell(a, p - Y).y : 0.0);
    return vec4(dot(v.xy - before, vec2(1)) - v.w, 0, 0, 0);`,
  pressure: `
    vec2 lower = vec2(greaterThan(p, ivec2(0))), upper = interior(p);
    vec2 before = vec2(readCell(a, p - X).x, readCell(a, p - Y).x);
    vec2 after = vec2(readCell(a, p + X).x, readCell(a, p + Y).x);
    float sum = dot(lower, before) + dot(upper, after);
    return vec4((sum - readCell(b, p).x) / (dot(lower + upper, vec2(1)) + ${PRESSURE_LEAK}), 0, 0, 0);`,
  project: `
    float pressure = readCell(b, p).x;
    vec2 after = vec2(readCell(b, p + X).x, readCell(b, p + Y).x);
    vec3 forced = readCell(a, p).xyz;
    vec2 wind = forced.xy - after + pressure;
    // Couple the strong part of the wave to cool smoke without stretching the hot core.
    vec2 smoke = shockCount > 0 ? readCell(c, p).xy : vec2(0);
    float carrier = smoothstep(0.006, 0.075, smoke.x) * (1.0 - smoothstep(0.36, 1.25, smoke.y));
    float coupling = mix(0.08, 1.0, carrier);
    // The outward impulse is compressible. Apply it after the pressure projection.
    for (int j = 0; j < shockCount; j++) {
      vec2 d = delta(p, shocks[j]);
      float distance = length(d);
      float front = max(0.0, 1.0 - abs(distance - shocks[j].z) / ${SHOCK_WIDTH});
      wind += coupling * float(n) * shocks[j].w * front * front * (3.0 - 2.0 * front) * d / max(distance, 0.001);
    }
    return vec4(wind * interior(p), forced.z, 0);`,
  react: `
    vec3 injected = vec3(0);
    vec4 colorAndExpiry = vec4(0);
    for (int j = 0; j < emitterCount; j++) {
      vec2 d = sweptDelta(p, j);
      float e = emission(d, shapes[j]);
      if (e <= 0.0) continue;
      vec3 added = dt * e * rates[j].xyz;
      injected += added;
      colorAndExpiry += added.x * vec4(smokePigment(d, j), bornExpiry(p, jets[j].w, sweeps[j].w));
    }
    vec4 old = readCell(a, p);
    vec4 carried = readCell(b, p);
    float burn, keep = smokeKeep(old.x, carried.a);
    vec4 updated = reaction(old, injected, keep, burn);
    float added = max(0.0, updated.x - old.x * keep);
    if (injected.x > 0.0) colorAndExpiry *= added / injected.x;
    else if (added > 0.0) {
      float birthExpiry = emitterCount > 0 ? jets[0].w : 0.0;
      if (smokeTiming.x > 0.0) birthExpiry = min(birthExpiry, smokeTiming.z);
      float expiry = old.x > 0.001 ? carried.a / old.x : birthExpiry;
      colorAndExpiry.a = added * expiry;
      if (sharedPigment && old.x > 0.001) colorAndExpiry.rgb = added * carried.rgb / old.x;
      else if (emitterCount > 0) colorAndExpiry.rgb = added * smokePigment(delta(p, shapes[0]), 0);
    }
    pigment = carried * keep + colorAndExpiry;
    return updated;`,
  material: `
    vec4 m = textureLod(a, departure(p), 0.0);
    ivec2 edge = min(p, n - 1 - p);
    float sponge = min(1.0, 0.82 + 0.09 * float(min(edge.x, edge.y)));
    return m * sponge;`,
};

class GpuFluid {
  constructor(gl, n) {
    this.gl = gl;
    this.n = n;
    this.fbo = gl.createFramebuffer();
    this.textures = Array.from({ length: 11 }, () => fieldTexture(gl, n));
    [this.velocity, this.advected, this.curl, this.forced, this.divergence, this.pressure,
      this.nextPressure, this.material, this.nextMaterial, this.dye, this.nextDye] = this.textures;
    this.programs = {};
    this.emitterUniforms = Object.fromEntries(['shapes', 'rates', 'thrust', 'jets', 'sweeps']
      .map(name => [name, new Float32Array(4 * MAX_EMITTERS)]));
    this.shockUniforms = new Float32Array(4 * MAX_EMITTERS);
    try {
      this.reset();
      for (const [name, body] of Object.entries(stages)) {
        const pigmentOutput = name === 'react' ? 'layout(location = 1) out vec4 pigment;' : '';
        this.programs[name] = program(gl, `${simulationHeader}
          ${pigmentOutput}
          vec4 update(ivec2 p) { ${body} }
          void main() {
            result = update(ivec2(gl_FragCoord.xy));
          }`);
      }
    } catch (error) {
      this.dispose();
      throw error;
    }
  }

  dispose() {
    const gl = this.gl;
    for (const pass of Object.values(this.programs)) pass.dispose();
    for (const texture of this.textures) gl.deleteTexture(texture);
    gl.deleteFramebuffer(this.fbo);
  }

  target(texture) {
    const gl = this.gl;
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
  }

  reset() {
    const gl = this.gl;
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.fbo);
    for (const texture of this.textures) {
      this.target(texture);
      if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) {
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        throw new Error('RGBA16F 浮点帧缓冲不可用');
      }
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
    }
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  }

  step(source, settings, time) {
    const { gl, n } = this;
    const emitters = emittersForStep(source);
    const medium = emitters[0];
    const shocks = settings.shocks ?? [];
    const { shapes, rates, thrust, jets, sweeps } = this.emitterUniforms;
    emitters.forEach((emitter, index) => {
      const offset = index * 4;
      shapes.set([emitter.x, emitter.y, emitter.radius, emitter.amount], offset);
      rates.set([emitter.smoke, emitter.heat, emitter.fuel, emitter.rainbowPhase ?? -1], offset);
      thrust.set([emitter.impulse, emitter.lift, emitter.expansion, emitter.turbulence], offset);
      sweeps.set([emitter.sweepX ?? 0, emitter.sweepY ?? 0, Number(Boolean(emitter.paleSmoke)), emitter.latestExpiry ?? 0], offset);
      jets.set([emitter.jetX ?? 0, emitter.hue ?? 0, Number(emitter.hue != null), emitter.smokeExpiry ?? 0], offset);
    });
    shocks.forEach((shock, index) => {
      this.shockUniforms.set([shock.x, shock.y, shock.radius, shock.strength], index * 4);
    });
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.fbo);
    gl.viewport(0, 0, n, n);
    const draw = (name, target, ...inputs) => {
      const pass = this.programs[name];
      this.target(target);
      pass.use();
      const u = pass.uniform;
      gl.uniform1i(u('n'), n);
      gl.uniform1f(u('time'), time);
      gl.uniform4f(u('settings'), settings.swirl, settings.buoyancy * (settings.rise ?? medium?.rise ?? 1),
        settings.decay, settings.cooling ?? medium?.cooling ?? 1.15);
      if (name === 'force') gl.uniform1f(u('velocityKeep'), settings.velocityKeep ?? 0.991);
      if (name === 'force' || name === 'react') {
        gl.uniform3f(u('variation'), settings.noiseX ?? 0, settings.noiseY ?? 0, settings.rainbowPhase ?? -1);
        gl.uniform3f(u('smokeTiming'), settings.breakup ?? 0, settings.expiryFade ?? 1, settings.latestExpiry ?? 0);
        gl.uniform1i(u('emitterCount'), emitters.length);
        gl.uniform4fv(u('shapes[0]'), shapes);
        gl.uniform4fv(u('rates[0]'), rates);
        gl.uniform4fv(u('thrust[0]'), thrust);
        gl.uniform4fv(u('jets[0]'), jets);
        gl.uniform4fv(u('sweeps[0]'), sweeps);
        gl.uniform1i(u('sharedPigment'), Boolean(settings.sharedPigment));
      }
      if (name === 'project') {
        gl.uniform1i(u('shockCount'), shocks.length);
        if (shocks.length) gl.uniform4fv(u('shocks[0]'), this.shockUniforms);
      }
      inputs.forEach((texture, i) => {
        gl.activeTexture(gl.TEXTURE0 + i);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.uniform1i(u(['a','b','c','dyeForForce'][i]), i);
      });
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };
    draw('advect', this.advected, this.velocity, this.velocity);
    draw('curl', this.curl, this.advected);
    draw('force', this.forced, this.advected, this.material, this.curl, this.dye);
    draw('divergence', this.divergence, this.forced);
    for (let i = 0; i < PRESSURE_ITERATIONS; i++) {
      draw('pressure', this.nextPressure, this.pressure, this.divergence);
      [this.pressure, this.nextPressure] = [this.nextPressure, this.pressure];
    }
    draw('project', this.velocity, this.forced, this.pressure, this.material);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT1, gl.TEXTURE_2D, this.nextDye, 0);
    gl.drawBuffers([gl.COLOR_ATTACHMENT0, gl.COLOR_ATTACHMENT1]);
    draw('react', this.nextMaterial, this.material, this.dye);
    gl.drawBuffers([gl.COLOR_ATTACHMENT0]);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT1, gl.TEXTURE_2D, null, 0);
    draw('material', this.material, this.nextMaterial, this.velocity);
    draw('material', this.dye, this.nextDye, this.velocity);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  }
}

Object.assign(globalThis.EmberLab, { GpuFluid, fieldTexture, program, shaderHeader });
})();
