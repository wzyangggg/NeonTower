(() => {
  const canvas = document.querySelector('#surface');
  const controls = document.querySelector('#controls');
  const play = document.querySelector('#play');
  const speed = document.querySelector('#speed');
  const density = document.querySelector('#density');
  const status = document.querySelector('#status');
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const gl = canvas.getContext('webgl', { alpha: false, antialias: false });
  let paused = motion.matches;
  let time = 0;
  let previous = 0;
  let frame = 0;
  let uniforms;

  const vertex = `
    attribute vec2 position;
    varying vec2 uv;
    void main() {
      uv = position * .5 + .5;
      gl_Position = vec4(position, 0., 1.);
    }
  `;
  const fragment = `
    precision highp float;
    varying vec2 uv;
    uniform float time;
    uniform float density;
    uniform float pixelSize;

    float hash(vec2 p) {
      p = fract(p * vec2(.1031, .11369));
      p += dot(p, p.yx + 19.19);
      return fract((p.x + p.y) * p.x);
    }
    float noise(vec2 p) {
      vec2 i = floor(p), f = fract(p);
      f = f * f * (3. - 2. * f);
      return mix(mix(hash(i), hash(i + vec2(1,0)), f.x),
                 mix(hash(i + vec2(0,1)), hash(i + vec2(1,1)), f.x), f.y);
    }
    float stars(vec2 p, float grid, float threshold) {
      vec2 cell = floor(p * grid);
      float seed = hash(cell + grid);
      vec2 center = .24 + .52 * vec2(hash(cell + 51.), hash(cell + 27.));
      float radius = mix(.035, .13, seed);
      float aa = pixelSize * grid * .5;
      return step(threshold, seed) * (1. - smoothstep(radius, radius + aa, length(fract(p * grid) - center)));
    }
    void main() {
      vec2 p = (uv - .5) * (4.7 * density);
      vec2 drift = vec2(.15, -.11) * time;
      // Two scales of distortion curl the bands around the darker pools.
      vec2 warp = vec2(noise(p + drift + 8.3), noise(p - drift + 17.1)) - .5;
      vec2 q = p + warp * 2.2;
      q += .23 * (vec2(noise(q * 2.8 - drift), noise(q * 2.8 + drift + 6.)) - .5);
      float field = noise(q + drift) + .19 * noise(q * 2.05 - drift * .7);
      float phase = field * 3.2 - time * .19;
      float band = .5 + .5 * cos(6.283185 * phase);
      float ribbon = pow(band, 4.);
      float thread = .5 + .5 * cos(6.283185 * (phase * 9. + .38 * noise(q * 3.)));
      float cyan = smoothstep(.56, .81, noise(q * 1.15 + vec2(25., 19.) + drift));
      vec3 color = vec3(.012, .006, .095) + vec3(.055, .035, .31) * noise(q * 2.);
      color += pow(band, 1.7) * vec3(.23, .015, .47);
      color += ribbon * mix(vec3(.65, .012, .52), vec3(.01, .63, .9), cyan) * (.38 + .62 * thread);
      color += pow(band, 35.) * pow(thread, 2.) * vec3(.45, .22, .4);
      color *= .87 + .22 * hash(floor(uv * 760.));
      vec2 dust = uv + .0008 * warp;
      color += stars(dust, 174., .88) * vec3(.27, .24, .74);
      color += stars(dust, 83., .95) * vec3(.68, .55, 1.) * (.8 + .2 * sin(time * 2. + field * 36.));
      gl_FragColor = vec4(color, 1.);
    }
  `;

  function requestDraw() {
    if (uniforms && !frame) frame = requestAnimationFrame(draw);
  }

  function draw(now) {
    frame = 0;
    if (gl.isContextLost()) return;
    if (!paused && previous) time += Math.min((now - previous) / 1000, .05) * Number(speed.value);
    previous = paused ? 0 : now;
    const size = Math.max(1, Math.round(canvas.clientWidth * Math.min(devicePixelRatio, 1.5)));
    if (canvas.width !== size || canvas.height !== size) canvas.width = canvas.height = size;
    gl.viewport(0, 0, size, size);
    gl.uniform1f(uniforms.time, time);
    gl.uniform1f(uniforms.density, Number(density.value));
    gl.uniform1f(uniforms.pixelSize, 1 / size);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    if (!paused) requestDraw();
  }

  function initialize() {
    try {
      if (!gl) throw new Error('WebGL unavailable');
      const program = gl.createProgram();
      for (const [type, source] of [[gl.VERTEX_SHADER, vertex], [gl.FRAGMENT_SHADER, fragment]]) {
        const shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(shader));
        gl.attachShader(program, shader);
        gl.deleteShader(shader);
      }
      gl.linkProgram(program);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program));
      gl.useProgram(program);
      gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
      const position = gl.getAttribLocation(program, 'position');
      gl.enableVertexAttribArray(position);
      gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
      uniforms = Object.fromEntries(['time', 'density', 'pixelSize'].map(name => [name, gl.getUniformLocation(program, name)]));
      controls.disabled = false;
      status.hidden = true;
      requestDraw();
    } catch (error) {
      console.error(error);
      status.textContent = '无法绘制预览，请在支持 WebGL 的浏览器中打开。';
      status.hidden = false;
    }
  }

  function setPaused(value) {
    paused = value;
    previous = 0;
    play.textContent = paused ? '播放' : '暂停';
    requestDraw();
  }

  canvas.addEventListener('webglcontextlost', event => {
    event.preventDefault();
    cancelAnimationFrame(frame);
    frame = previous = 0;
    uniforms = null;
    controls.disabled = true;
    status.textContent = 'WebGL 预览暂时中断，正在等待恢复。';
    status.hidden = false;
  });
  canvas.addEventListener('webglcontextrestored', initialize);
  play.addEventListener('click', () => setPaused(!paused));
  controls.addEventListener('input', requestDraw);
  motion.addEventListener('change', () => setPaused(motion.matches));
  new ResizeObserver(requestDraw).observe(canvas);
  setPaused(paused);
  initialize();
})();
