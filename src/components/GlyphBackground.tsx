'use client';

import React, { useEffect, useRef } from 'react';

const VERTEX_SHADER = `
attribute vec2 position;
void main() {
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

const FRAGMENT_SHADER = `
precision highp float;
uniform sampler2D atlas;
uniform vec2 size;
uniform vec2 cell;
uniform float dpr;
uniform float count;
uniform float time;
uniform float rest;
uniform float haze;
uniform float hoverInk;
uniform vec3 pointer;
uniform float activity;
uniform vec2 drift;
uniform vec3 color;
uniform vec3 accent;
uniform vec4 waves[12];
uniform vec4 trail[8];

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

float smoothNoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
    mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
    u.y
  );
}

float clouds(vec2 p) {
  float v = 0.0;
  float a = 0.55;
  for (int i = 0; i < 4; i++) {
    v += a * smoothNoise(p);
    p = p * 2.02 + vec2(17.1, 9.4);
    a *= 0.5;
  }
  return v;
}

float outline(float kind, float angle, float phase) {
  if (kind < 0.5) return 1.0;
  if (kind < 1.5) {
    float s = sin(angle);
    float c = cos(angle);
    return (2.0 - 2.0 * s + s * sqrt(abs(c)) / (s + 1.4)) * 0.42;
  }
  return 1.0 + 0.14 * sin(3.0 * angle + phase) + 0.08 * sin(5.0 * angle - phase * 1.3);
}

void main() {
  vec2 pixel = vec2(gl_FragCoord.x, size.y - gl_FragCoord.y);
  vec2 index = floor(pixel / cell);
  vec2 point = (index + 0.5) * cell / dpr;

  float ring = 0.0;
  for (int i = 0; i < 6; i++) {
    vec4 a = waves[i * 2];
    vec4 b = waves[i * 2 + 1];
    if (a.w <= 0.0) continue;
    vec2 v = point - a.xy;
    float angle = atan(-v.y, v.x);
    float shape = mix(1.0, outline(b.x, angle, b.z), b.y);
    shape *= 1.0 + 0.07 * sin(3.0 * angle + b.z + b.w) + 0.05 * sin(5.0 * angle - b.z * 1.7 - b.w * 1.3) + 0.03 * sin(9.0 * angle + b.w * 2.1);
    float d = length(v) - a.z * shape;
    float k = d > 0.0 ? d / 14.0 : d / 42.0;
    ring = max(ring, exp(-k * k) * a.w);
  }

  float focus = length((point - pointer.xy) / vec2(86.0, 48.0));
  float hover = pointer.z * (1.0 - smoothstep(0.12, 1.0, focus));
  for (int i = 0; i < 8; i++) {
    vec4 t = trail[i];
    if (t.w <= 0.0) continue;
    vec2 v = point - t.xy;
    hover += t.w * exp(-dot(v, v) / (2.0 * t.z * t.z));
  }
  hover = min(hover, 1.0);

  mat2 turn = mat2(0.82, 0.57, -0.57, 0.82);
  vec2 q = turn * (point - drift);
  float blob = smoothNoise(vec2(q.x / 140.0, q.y / 80.0) + vec2(time * 0.04, 0.0)) * 0.62
    + smoothNoise(vec2(q.x / 62.0, q.y / 36.0) + vec2(3.7, time * 0.06)) * 0.38;
  float grain = smoothNoise(vec2(q.x / 30.0, q.y / 14.0) + vec2(time * 0.2, 7.3));
  float cloud = blob * (0.82 + 0.24 * grain);
  float mask = pow(smoothstep(0.47 - 0.2 * activity, 0.84, cloud), 2.6);

  float ink = texture2D(atlas, pixel / size).a;

  vec2 viewport = size / dpr;
  vec2 patchSize = vec2(min(110.0, viewport.x * 0.23), 38.0);
  vec2 a = (point - viewport * vec2(0.16, 0.22)) / patchSize;
  vec2 b = (point - viewport * vec2(0.83, 0.36)) / patchSize;
  vec2 c = (point - viewport * vec2(0.22, 0.77)) / patchSize;
  vec2 d = (point - viewport * vec2(0.84, 0.82)) / patchSize;
  float idle = max(
    max(exp(-dot(a, a)) * (0.8 + 0.15 * sin(time * 0.18)),
        exp(-dot(b, b)) * (0.8 + 0.15 * sin(time * 0.18 + 1.6))),
    max(exp(-dot(c, c)) * (0.8 + 0.15 * sin(time * 0.18 + 3.2)),
        exp(-dot(d, d)) * (0.8 + 0.15 * sin(time * 0.18 + 4.8)))
  );
  float grey = ink * clamp(rest + 0.075 * idle + haze * mask * (1.0 + 0.3 * activity) + hoverInk * hover * (0.9 + 0.1 * mask), 0.0, 1.0);
  float blue = ink * ring * 0.10;
  float alpha = grey + blue - grey * blue;
  vec3 tint = color * grey * (1.0 - blue) + accent * blue;
  gl_FragColor = vec4(tint, alpha);
}
`;

interface GlyphBackgroundProps {
  code: string;
  fontSize?: number;
  interactive?: boolean;
  className?: string;
}

export function GlyphBackground({
  code,
  fontSize = 12,
  interactive = true,
  className = '',
}: GlyphBackgroundProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const gl = canvas.getContext('webgl', { alpha: true, premultipliedAlpha: true, antialias: false });
    if (!gl) return;

    const shaders: WebGLShader[] = [];
    const compile = (type: number, src: string) => {
      const shader = gl.createShader(type);
      if (!shader) return null;
      shaders.push(shader);
      gl.shaderSource(shader, src);
      gl.compileShader(shader);
      return gl.getShaderParameter(shader, gl.COMPILE_STATUS) ? shader : null;
    };

    const vs = compile(gl.VERTEX_SHADER, VERTEX_SHADER);
    const fs = compile(gl.FRAGMENT_SHADER, FRAGMENT_SHADER);
    const program = gl.createProgram();
    if (!vs || !fs || !program) {
      shaders.forEach(s => gl.deleteShader(s));
      if (program) gl.deleteProgram(program);
      return;
    }

    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      shaders.forEach(s => gl.deleteShader(s));
      gl.deleteProgram(program);
      return;
    }

    gl.useProgram(program);

    const quadBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, quadBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);

    const posAttr = gl.getAttribLocation(program, 'position');
    gl.enableVertexAttribArray(posAttr);
    gl.vertexAttribPointer(posAttr, 2, gl.FLOAT, false, 0, 0);

    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    const uniformNames = [
      'atlas', 'size', 'cell', 'dpr', 'time', 'rest', 'haze', 'hoverInk',
      'pointer', 'activity', 'drift', 'color', 'accent', 'waves[0]', 'trail[0]'
    ];
    const uniforms: Record<string, WebGLUniformLocation | null> = {};
    uniformNames.forEach(name => {
      uniforms[name] = gl.getUniformLocation(program, name);
    });

    gl.uniform1i(uniforms.atlas, 0);
    gl.uniform1f(uniforms.rest, 0.025);
    gl.uniform1f(uniforms.haze, 0.08);
    gl.uniform1f(uniforms.hoverInk, 0.38);

    const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
    const atlasCanvas = document.createElement('canvas');
    const atlasCtx = atlasCanvas.getContext('2d');
    const colorCanvas = document.createElement('canvas');
    const colorCtx = colorCanvas.getContext('2d');

    let width = 0;
    let height = 0;
    let dpr = 1;
    let elapsedTime = 0;
    let rafId = 0;
    let lastTime = 0;
    let isIntersecting = false;
    let destroyed = false;
    let fallback = false;
    let pointerPos: { x: number; y: number } | null = null;
    let clientPointer: { x: number; y: number } | null = null;
    let waveList: Array<{ x: number; y: number; at: number }> = [];
    let trailList: Array<{ x: number; y: number; at: number }> = [];
    const wavesArray = new Float32Array(48);
    const trailArray = new Float32Array(32);

    const updateThemeColors = () => {
      if (!colorCtx) return;
      colorCtx.fillStyle = getComputedStyle(container).color;
      colorCtx.fillRect(0, 0, 1, 1);
      const data = colorCtx.getImageData(0, 0, 1, 1).data;
      const r = data[0] / 255;
      const g = data[1] / 255;
      const b = data[2] / 255;
      gl.uniform3f(uniforms.color, r, g, b);
      gl.uniform3f(uniforms.accent, r, g, b);
    };

    const render = () => {
      if (destroyed || fallback || !width || !height) return;

      wavesArray.fill(0);
      waveList = waveList.filter(w => elapsedTime - w.at < 4);
      waveList.forEach((w, i) => {
        const dt = elapsedTime - w.at;
        const radius = Math.min(1, dt / 0.08) * Math.exp(-dt / 1.3) * Math.min(1, (4 - dt) / 0.5);
        wavesArray.set([w.x, w.y, (420 * dt) / (1 + 0.4 * dt), radius, 0, 0, 0, 0], i * 8);
      });

      trailArray.fill(0);
      trailList = trailList.filter(t => elapsedTime - t.at < 0.45);
      trailList.forEach((t, i) => {
        const progress = (elapsedTime - t.at) / 0.45;
        trailArray.set([t.x, t.y, 28, 0.18 * Math.pow(1 - progress, 2)], i * 4);
      });

      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(uniforms.size, canvas.width, canvas.height);
      gl.uniform2f(uniforms.cell, 8 * dpr, 18 * dpr);
      gl.uniform1f(uniforms.dpr, dpr);
      gl.uniform1f(uniforms.time, elapsedTime);
      gl.uniform3f(uniforms.pointer, pointerPos?.x ?? -1000, pointerPos?.y ?? -1000, pointerPos ? 1 : 0);
      gl.uniform1f(uniforms.activity, trailList.length / 8);
      gl.uniform2f(uniforms.drift, -8 * elapsedTime, 4 * elapsedTime);
      gl.uniform4fv(uniforms['waves[0]'], wavesArray);
      gl.uniform4fv(uniforms['trail[0]'], trailArray);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };

    const buildAtlas = () => {
      if (destroyed || fallback || !atlasCtx) return;
      const rect = container.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      dpr = Math.min(window.devicePixelRatio || 1, 1.5, Math.sqrt(1500000 / Math.max(1, width * height)));

      canvas.width = atlasCanvas.width = Math.max(1, Math.round(width * dpr));
      canvas.height = atlasCanvas.height = Math.max(1, Math.round(height * dpr));

      atlasCtx.scale(dpr, dpr);
      atlasCtx.fillStyle = 'white';
      atlasCtx.font = `400 ${fontSize}px ${getComputedStyle(container).fontFamily}`;
      atlasCtx.textBaseline = 'top';

      const lineHeight = 1.7 * fontSize;
      const rowCount = Math.ceil(height / lineHeight);
      const colCount = Math.max(1, Math.floor(width / 370));
      const colWidth = width / colCount;

      const maxLineWidth = Math.max(1, colWidth - 40);
      const measure = (text: string) => atlasCtx.measureText(text).width;

      const wrappedLines = code.split('\n').flatMap(line => {
        const lines: string[] = [];
        let isIndent = false;
        while (line && measure(`${isIndent ? '  ' : ''}${line}`) > maxLineWidth) {
          const prefix = isIndent ? '  ' : '';
          let len = line.length;
          while (len > 1 && measure(prefix + line.slice(0, len)) > maxLineWidth) len--;
          const lastSpace = line.lastIndexOf(' ', len);
          if (lastSpace > len / 2) len = lastSpace;
          lines.push(prefix + line.slice(0, len));
          line = line.slice(len).trimStart();
          isIndent = true;
        }
        return [...lines, `${isIndent && line ? '  ' : ''}${line}`];
      });

      for (let c = 0; c < colCount; c++) {
        atlasCtx.save();
        atlasCtx.beginPath();
        atlasCtx.rect(c * colWidth + 20, 0, colWidth - 40, height);
        atlasCtx.clip();
        const topOffset = width <= 700 ? 112 : 12;
        for (let r = 0; r < rowCount; r++) {
          atlasCtx.fillText(wrappedLines[(r + c * rowCount) % wrappedLines.length], c * colWidth + 20, topOffset + r * lineHeight);
        }
        atlasCtx.restore();
      }

      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, atlasCanvas);
      updateThemeColors();
      render();
      container.dataset.renderer = 'webgl';
    };

    const loop = (now: number) => {
      if (now - lastTime >= 1000 / 30) {
        elapsedTime += lastTime ? Math.min((now - lastTime) / 1000, 0.064) : 0;
        lastTime = now;
        render();
      }
      rafId = requestAnimationFrame(loop);
    };

    const updateAnimationState = () => {
      cancelAnimationFrame(rafId);
      rafId = 0;
      lastTime = 0;
      const shouldAnimate = isIntersecting && !document.hidden && !reducedMotion.matches && !fallback;
      container.dataset.animated = String(shouldAnimate);
      if (shouldAnimate) {
        rafId = requestAnimationFrame(loop);
      } else {
        waveList = [];
        trailList = [];
        if (!isIntersecting || document.hidden) pointerPos = null;
        if (isIntersecting && !document.hidden) render();
      }
    };

    const getLocalPos = (e: PointerEvent | MouseEvent) => {
      const rect = container.getBoundingClientRect();
      return { x: e.clientX - rect.left, y: e.clientY - rect.top, at: elapsedTime };
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (!interactive || !isIntersecting) return;
      clientPointer = e.pointerType === 'touch' ? null : { x: e.clientX, y: e.clientY };
      updatePointer();
      if (reducedMotion.matches) return render();

      const pos = getLocalPos(e);
      const last = trailList.at(-1);
      if (pos.x < 0 || pos.x > width || pos.y < 0 || pos.y > height) return;
      if (last && Math.hypot(pos.x - last.x, pos.y - last.y) < 14) return;
      trailList = [...trailList.slice(-7), pos];
    };

    const handlePointerDown = (e: PointerEvent) => {
      if (!interactive || reducedMotion.matches || !isIntersecting) return;
      const pos = getLocalPos(e);
      if (pos.x >= 0 && pos.x <= width && pos.y >= 0 && pos.y <= height) {
        waveList = [...waveList.slice(-5), pos];
      }
    };

    const updatePointer = () => {
      const rect = container.getBoundingClientRect();
      const x = (clientPointer?.x ?? -1000) - rect.left;
      const y = (clientPointer?.y ?? -1000) - rect.top;
      pointerPos = clientPointer && x >= 0 && x <= rect.width && y >= 0 && y <= rect.height ? { x, y } : null;
      if (reducedMotion.matches) render();
    };

    const handlePointerLeave = () => {
      clientPointer = null;
      pointerPos = null;
      if (reducedMotion.matches) render();
    };

    const handleContextLost = () => {
      fallback = true;
      container.dataset.renderer = 'fallback';
      updateAnimationState();
    };

    const ro = new ResizeObserver(buildAtlas);
    ro.observe(container);

    const io = new IntersectionObserver(([entry]) => {
      isIntersecting = entry.isIntersecting;
      updateAnimationState();
    });
    io.observe(container);

    const mo = new MutationObserver(() => {
      updateThemeColors();
      render();
    });
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

    window.addEventListener('pointermove', handlePointerMove, { passive: true, capture: true });
    window.addEventListener('pointerdown', handlePointerDown, { passive: true, capture: true });
    window.addEventListener('scroll', updatePointer, { passive: true });
    window.addEventListener('blur', handlePointerLeave);
    document.documentElement.addEventListener('pointerleave', handlePointerLeave);
    canvas.addEventListener('webglcontextlost', handleContextLost);
    reducedMotion.addEventListener('change', updateAnimationState);
    document.addEventListener('visibilitychange', updateAnimationState);

    buildAtlas();
    if (document.fonts?.ready) {
      document.fonts.ready.then(() => {
        if (!destroyed) buildAtlas();
      });
    }

    return () => {
      destroyed = true;
      cancelAnimationFrame(rafId);
      ro.disconnect();
      io.disconnect();
      mo.disconnect();
      window.removeEventListener('pointermove', handlePointerMove, true);
      window.removeEventListener('pointerdown', handlePointerDown, true);
      window.removeEventListener('scroll', updatePointer);
      window.removeEventListener('blur', handlePointerLeave);
      document.documentElement.removeEventListener('pointerleave', handlePointerLeave);
      canvas.removeEventListener('webglcontextlost', handleContextLost);
      reducedMotion.removeEventListener('change', updateAnimationState);
      document.removeEventListener('visibilitychange', updateAnimationState);

      gl.deleteTexture(texture);
      gl.deleteBuffer(quadBuffer);
      gl.deleteProgram(program);
      shaders.forEach(s => gl.deleteShader(s));
    };
  }, [code, fontSize, interactive]);

  return (
    <div
      ref={containerRef}
      className={`glyph-background ${className}`}
      data-slot="glyph-background"
      aria-hidden="true"
    >
      <pre className="glyph-code-fallback">{code}</pre>
      <canvas ref={canvasRef} />
    </div>
  );
}
