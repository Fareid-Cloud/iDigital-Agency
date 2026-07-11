"use client";

import { useEffect, useRef } from "react";

/**
 * FluidCanvas — a hand-written WebGL fragment shader rendering flowing
 * "liquid silk" ribbons in the iDigital brand palette (deep aubergine →
 * magenta → blush), domain-warped fbm noise, with a pointer-reactive
 * lens/glow that follows the cursor.
 *
 * Performance guards:
 *  - single fullscreen quad, one draw call, no textures, no libraries
 *  - devicePixelRatio capped at 1.5
 *  - rAF loop pauses when the canvas leaves the viewport or tab is hidden
 *  - prefers-reduced-motion → renders one static frame, no loop
 *  - graceful CSS-gradient fallback when WebGL is unavailable
 */

const FRAG = `
precision highp float;

uniform vec2  u_res;
uniform float u_time;
uniform vec2  u_pointer;    // 0..1, y flipped to GL space
uniform float u_pstrength;  // eased pointer energy

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
    mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
    u.y
  );
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.55;
  mat2 rot = mat2(0.8, -0.6, 0.6, 0.8);
  for (int i = 0; i < 4; i++) {
    v += a * noise(p);
    p = rot * p * 2.05 + vec2(7.3, 3.1);
    a *= 0.55;
  }
  return v;
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_res;
  float aspect = u_res.x / u_res.y;
  vec2 p = vec2(uv.x * aspect, uv.y);
  vec2 m = vec2(u_pointer.x * aspect, u_pointer.y);

  float t = u_time * 0.055;

  // pointer lens: gently pull the field toward the cursor
  vec2 toM = p - m;
  float md = length(toM);
  float lens = u_pstrength * 0.28 * exp(-md * 3.2);
  p -= normalize(toM + 1e-4) * lens;

  // two-level domain warp -> silky ribbons
  vec2 q = vec2(
    fbm(p * 1.35 + vec2(0.0, t)),
    fbm(p * 1.35 + vec2(4.2, -t * 0.7))
  );
  vec2 r = vec2(
    fbm(p * 1.35 + q * 1.9 + vec2(1.7, 9.2) + t * 0.55),
    fbm(p * 1.35 + q * 1.9 + vec2(8.3, 2.8) - t * 0.4)
  );
  float f = fbm(p * 1.55 + r * 2.3);

  float band  = smoothstep(0.32, 0.78, f);
  float sheen = pow(smoothstep(0.58, 0.95, f), 3.0);

  vec3 deep = vec3(0.090, 0.028, 0.075);  // near #170713
  vec3 mag  = vec3(0.690, 0.094, 0.420);  // #b0186b
  vec3 lite = vec3(0.886, 0.337, 0.612);  // #e2569c

  vec3 col = deep;
  col = mix(col, mag * 0.82, band * 0.9);
  col += lite * sheen * 0.5;

  // cursor glow
  col += mag * exp(-md * 4.2) * 0.30 * (0.4 + 0.6 * u_pstrength);

  // vignette to keep edges quiet under the header/text
  float vig = smoothstep(1.35, 0.30, length(uv - vec2(0.5, 0.45)) * 1.55);
  col *= mix(0.72, 1.0, vig);

  // film grain (kills banding on gradients)
  col += (hash(gl_FragCoord.xy + fract(u_time)) - 0.5) * 0.028;

  gl_FragColor = vec4(col, 1.0);
}
`;

const VERT = `
attribute vec2 a_pos;
void main() { gl_Position = vec4(a_pos, 0.0, 1.0); }
`;

export default function FluidCanvas({ className = "" }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fallbackRef = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl =
      canvas.getContext("webgl", {
        antialias: false,
        depth: false,
        stencil: false,
        alpha: false,
        powerPreference: "low-power",
      }) || canvas.getContext("experimental-webgl");

    if (!gl || !(gl instanceof WebGLRenderingContext)) {
      fallbackRef.current = true;
      canvas.style.display = "none";
      return;
    }

    const compile = (type: number, src: string) => {
      const sh = gl.createShader(type)!;
      gl.shaderSource(sh, src);
      gl.compileShader(sh);
      if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
        console.error(gl.getShaderInfoLog(sh));
        return null;
      }
      return sh;
    };

    const vs = compile(gl.VERTEX_SHADER, VERT);
    const fs = compile(gl.FRAGMENT_SHADER, FRAG);
    if (!vs || !fs) {
      canvas.style.display = "none";
      return;
    }

    const prog = gl.createProgram()!;
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 3, -1, -1, 3]),
      gl.STATIC_DRAW
    );
    const loc = gl.getAttribLocation(prog, "a_pos");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    const uRes = gl.getUniformLocation(prog, "u_res");
    const uTime = gl.getUniformLocation(prog, "u_time");
    const uPointer = gl.getUniformLocation(prog, "u_pointer");
    const uPStrength = gl.getUniformLocation(prog, "u_pstrength");

    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const w = Math.max(1, Math.floor(rect.width * dpr));
      const h = Math.max(1, Math.floor(rect.height * dpr));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
        gl.viewport(0, 0, w, h);
      }
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    // pointer state (spring-eased in the loop)
    const target = { x: 0.62, y: 0.5, energy: 0 };
    const eased = { x: 0.62, y: 0.5, energy: 0.35 };

    const onPointer = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      target.x = (e.clientX - rect.left) / rect.width;
      target.y = 1.0 - (e.clientY - rect.top) / rect.height;
      target.energy = 1;
    };
    const parent = canvas.parentElement ?? canvas;
    parent.addEventListener("pointermove", onPointer, { passive: true });

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let raf = 0;
    let running = true;
    let visible = true;
    const start = performance.now();

    const frame = () => {
      if (!running || !visible) return;
      const now = (performance.now() - start) / 1000;

      // ease pointer + decay energy toward a gentle idle breathing level
      eased.x += (target.x - eased.x) * 0.06;
      eased.y += (target.y - eased.y) * 0.06;
      target.energy *= 0.985;
      const idle = 0.3 + 0.1 * Math.sin(now * 0.6);
      eased.energy += (Math.max(target.energy, idle) - eased.energy) * 0.05;

      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.uniform1f(uTime, now);
      gl.uniform2f(uPointer, eased.x, eased.y);
      gl.uniform1f(uPStrength, eased.energy);
      gl.drawArrays(gl.TRIANGLES, 0, 3);

      raf = requestAnimationFrame(frame);
    };

    if (reduced) {
      // one static, pretty frame — no animation loop
      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.uniform1f(uTime, 12.0);
      gl.uniform2f(uPointer, 0.62, 0.5);
      gl.uniform1f(uPStrength, 0.35);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    } else {
      const io = new IntersectionObserver(
        ([entry]) => {
          visible = entry.isIntersecting;
          if (visible) {
            cancelAnimationFrame(raf);
            raf = requestAnimationFrame(frame);
          }
        },
        { threshold: 0.02 }
      );
      io.observe(canvas);

      const onVis = () => {
        visible = document.visibilityState === "visible";
        if (visible) {
          cancelAnimationFrame(raf);
          raf = requestAnimationFrame(frame);
        }
      };
      document.addEventListener("visibilitychange", onVis);

      raf = requestAnimationFrame(frame);

      return () => {
        running = false;
        cancelAnimationFrame(raf);
        io.disconnect();
        ro.disconnect();
        document.removeEventListener("visibilitychange", onVis);
        parent.removeEventListener("pointermove", onPointer);
        gl.getExtension("WEBGL_lose_context")?.loseContext();
      };
    }

    return () => {
      running = false;
      ro.disconnect();
      parent.removeEventListener("pointermove", onPointer);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    };
  }, []);

  return (
    <>
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className={`absolute inset-0 h-full w-full ${className}`}
      />
      {/* CSS fallback lives underneath; visible only if canvas hides itself */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[radial-gradient(120%_90%_at_70%_30%,#b0186b_0%,#4a0e35_45%,#170713_100%)]"
      />
    </>
  );
}
