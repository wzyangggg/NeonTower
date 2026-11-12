// Ember Lab 2D render, wrapped for the game and its offline build.
(() => {
'use strict';

const { program, shaderHeader } = globalThis.EmberLab;

const worldVertex = `#version 300 es
out vec2 uv;
uniform mat4 viewProjection;
uniform vec3 planeCenter;
uniform float planeSize;
void main() {
  uv = vec2(gl_VertexID & 1, gl_VertexID >> 1);
  vec2 offset = (uv - 0.5) * planeSize;
  gl_Position = viewProjection * vec4(planeCenter + vec3(offset.x, 0.0, -offset.y), 1.0);
}`;

const fragment = `${shaderHeader}
in vec2 uv;
uniform sampler2D material;
uniform sampler2D flow;
uniform bool hasFlameDetail;
uniform sampler2D smokeDye;
uniform bool hasSmokeDye;
uniform float opacity;
uniform float openingFlash;
uniform float smokeAge;
uniform float edgeSoftness;
uniform float fadeWidth;
uniform bool physicalExpiry;
uniform bool mist;
uniform bool paleSmoke;
uniform bool sharedPigment;

void main() {
  vec4 m = textureLod(material, uv, 0.0);
  if (m.x + m.w < 0.002) {
    result = vec4(0);
    return;
  }

  float shadowScale = sharedPigment ? 0.45 : 1.0;
  float nearSmoke = textureLod(material, uv + shadowScale * vec2(-0.018, 0.024), 0.0).x;
  float farSmoke = textureLod(material, uv + shadowScale * vec2(-0.044, 0.057), 0.0).x;
  float shade = exp(-1.1 * nearSmoke - 0.95 * farSmoke) + clamp((m.x - nearSmoke) * 0.7, 0.0, 0.16);
  vec3 ash = mix(vec3(0.22, 0.24, 0.28), vec3(0.63, 0.65, 0.68), clamp(shade, 0.0, 1.0));
  float smokeAlpha = 1.0 - exp(-2.85 * m.x);
  float paleFraction = paleSmoke ? 1.0 : 0.0;
  if (edgeSoftness > 0.0) {
    vec2 offset = vec2(0.015 + 0.02 * edgeSoftness, 0.0);
    float surrounding = textureLod(material, uv + offset, 0.0).x + textureLod(material, uv - offset, 0.0).x
                      + textureLod(material, uv + offset.yx, 0.0).x + textureLod(material, uv - offset.yx, 0.0).x;
    float density = (2.0 * m.x + surrounding) / 6.0;
    smokeAlpha *= mix(1.0, smoothstep(0.02, 0.20, density), edgeSoftness);
  }
  if (hasSmokeDye) {
    vec4 pigment = textureLod(smokeDye, uv, 0.0);
    vec4 parcel = pigment / max(m.x, 0.001);
    vec3 color = clamp(parcel.rgb, 0.0, 1.0);
    if (sharedPigment) {
      // RG carry chroma and B carries the white smoke fraction, all weighted by density.
      paleFraction = clamp(parcel.b, 0.0, 1.0);
      vec3 chroma = vec3(parcel.rg / max(1.0 - paleFraction, 0.001), 0.0);
      float lo = min(0.0, min(chroma.r, chroma.g));
      float hi = max(0.0, max(chroma.r, chroma.g));
      color = clamp(chroma + 0.5 - 0.5 * (hi + lo), 0.0, 1.0);
    }
    vec3 brightColor = mix(vec3(0.56), vec3(1.0), color);
    ash = brightColor * mix(0.82, 1.0, clamp(shade, 0.0, 1.0));
    if (mist) {
      vec2 texel = 1.0 / vec2(textureSize(material, 0));
      float light = textureLod(material, uv + texel * vec2(-0.65, 0.65), 0.0).x;
      float rim = smoothstep(0.008, 0.28, m.x - light);
      ash = mix(vec3(0.50, 0.55, 0.62), vec3(0.97, 0.94, 0.88), 0.25 + 0.75 * rim);
      smokeAlpha = (1.0 - exp(-1.25 * m.x)) * (0.55 + 0.35 * rim);
    }
    if (!physicalExpiry && parcel.a > 0.0)
      smokeAlpha *= 1.0 - smoothstep(parcel.a - 0.19 * fadeWidth, parcel.a + 0.21 * fadeWidth, smokeAge);
  }
  if (paleFraction > 0.0) {
    vec3 pale = mix(vec3(0.74, 0.75, 0.77), vec3(0.97, 0.97, 0.98), clamp(shade, 0.0, 1.0));
    float opacityScale = mix(1.0, 0.60, paleFraction);
    ash = mix(ash, pale, 0.60 * paleFraction / opacityScale);
    smokeAlpha *= opacityScale;
  }
  float fireAlpha = 0.43 * (1.0 - exp(-5.0 * m.w)) * smoothstep(0.37, 0.96, m.y);
  vec3 fire = mix(vec3(1.0, 0.26, 0.045), vec3(1.0, 0.82, 0.49), smoothstep(0.65, 1.85, m.y));

  // Hot material can glow even where oxygen limits the flame concentration.
  if (m.z + m.w > 0.002) {
    float hotCore = smoothstep(0.48, 1.95, m.y);
    fireAlpha += 0.39 * hotCore;
    if (hasFlameDetail && hotCore > 0.0) {
      float folds = textureLod(flow, uv, 0.0).z;
      float whiteHeat = smoothstep(-0.24, 0.33, folds + 0.17 * (m.y - 1.15));
      float glow = smoothstep(0.48, 1.65, m.y);
      fireAlpha = min(0.98, fireAlpha + glow * mix(-0.06, 0.47, whiteHeat));
      fire = mix(vec3(1.0, 0.34, 0.065), vec3(1.0, 0.98, 0.86), smoothstep(0.06, 0.8, glow * whiteHeat));
    }
  }
  float whiteFlash = openingFlash * smoothstep(0.04, 0.65, m.y);
  fire = mix(fire, vec3(1.0, 0.99, 0.91), whiteFlash);
  fireAlpha = mix(fireAlpha, 1.0, whiteFlash);
  float transmittance = 1.0 - fireAlpha;
  vec2 edge = min(uv, 1.0 - uv);
  float fade = smoothstep(0.0, 0.045, min(edge.x, edge.y));
  result = (fade * opacity) * vec4(fire * fireAlpha + ash * smokeAlpha * transmittance,
                       fireAlpha + smokeAlpha * transmittance);
}`;

function createEffectRenderer(gl, worldSpace = false) {
  const pass = program(gl, fragment, worldSpace ? worldVertex : undefined);
  return {
    draw(texture, x, y, width, height, flowTexture, dyeTexture, plane) {
      gl.viewport(x, y, width, height);
      pass.use();
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.uniform1i(pass.uniform('material'), 0);
      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, flowTexture ?? texture);
      gl.uniform1i(pass.uniform('flow'), 1);
      gl.uniform1i(pass.uniform('hasFlameDetail'), Boolean(flowTexture));
      gl.activeTexture(gl.TEXTURE2);
      gl.bindTexture(gl.TEXTURE_2D, dyeTexture ?? texture);
      gl.uniform1i(pass.uniform('smokeDye'), 2);
      gl.uniform1i(pass.uniform('hasSmokeDye'), Boolean(dyeTexture));
      gl.activeTexture(gl.TEXTURE0);
      gl.uniform1f(pass.uniform('opacity'), plane?.opacity ?? 1);
      gl.uniform1f(pass.uniform('openingFlash'), plane?.openingFlash ?? 0);
      gl.uniform1f(pass.uniform('smokeAge'), plane?.age ?? 0);
      gl.uniform1f(pass.uniform('edgeSoftness'), plane?.edgeSoftness ?? 0);
      gl.uniform1f(pass.uniform('fadeWidth'), plane?.fadeWidth ?? 1);
      gl.uniform1i(pass.uniform('physicalExpiry'), Boolean(plane?.physicalExpiry));
      gl.uniform1i(pass.uniform('mist'), Boolean(plane?.mist));
      gl.uniform1i(pass.uniform('paleSmoke'), Boolean(plane?.paleSmoke));
      gl.uniform1i(pass.uniform('sharedPigment'), Boolean(plane?.sharedPigment));
      if (worldSpace) {
        gl.uniformMatrix4fv(pass.uniform('viewProjection'), false, plane.vp);
        gl.uniform3f(pass.uniform('planeCenter'), plane.x, plane.y, plane.z);
        gl.uniform1f(pass.uniform('planeSize'), plane.size);
      }
      gl.drawArrays(worldSpace ? gl.TRIANGLE_STRIP : gl.TRIANGLES, 0, worldSpace ? 4 : 3);
    },
    dispose: pass.dispose,
  };
}

Object.assign(globalThis.EmberLab, { createEffectRenderer });
})();
