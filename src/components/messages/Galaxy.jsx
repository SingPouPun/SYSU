import { Color, Mesh, Program, Renderer, Triangle } from 'ogl'
import { useEffect, useRef } from 'react'

const DEFAULT_FOCAL = [0.5, 0.5]
const DEFAULT_ROTATION = [1, 0]

const vertexShader = `
attribute vec2 uv;
attribute vec2 position;
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 0.0, 1.0);
}
`

const fragmentShader = `
precision highp float;
uniform float uTime;
uniform vec3 uResolution;
uniform vec2 uFocal;
uniform vec2 uRotation;
uniform float uDensity;
uniform float uHueShift;
uniform float uGlowIntensity;
uniform float uSaturation;
uniform float uTwinkleIntensity;
uniform float uRotationSpeed;
uniform float uRamp;
varying vec2 vUv;

#define LAYERS 4.0
#define PI 3.14159265359

float hash21(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

vec3 hsv2rgb(vec3 c) {
  vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
  vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
  return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

float star(vec2 point, float flare, float glow) {
  float distanceToStar = max(0.003, length(point));
  float body = (0.022 * glow) / distanceToStar;
  float rays = smoothstep(0.018, 0.0, abs(point.x * point.y));
  point = mat2(0.7071, -0.7071, 0.7071, 0.7071) * point;
  rays += smoothstep(0.014, 0.0, abs(point.x * point.y)) * 0.45;
  body += rays * flare * glow;
  return body * smoothstep(0.72, 0.08, distanceToStar);
}

vec3 starLayer(vec2 uv, float depth, float layerSeed) {
  vec3 color = vec3(0.0);
  vec2 grid = fract(uv) - 0.5;
  vec2 cell = floor(uv);
  for (int y = -1; y <= 1; y++) {
    for (int x = -1; x <= 1; x++) {
      vec2 offset = vec2(float(x), float(y));
      vec2 id = cell + offset + layerSeed;
      float seed = hash21(id);
      float size = pow(hash21(id + 12.7), 4.2);
      vec2 drift = vec2(
        sin(uTime * (0.23 + uRamp * 0.42) + seed * 19.0),
        cos(uTime * (0.17 + uRamp * 0.36) + seed * 23.0)
      ) * 0.08;
      float twinkle = 1.0 + sin(uTime * (1.2 + uRamp * 4.4) + seed * 50.0)
        * uTwinkleIntensity * (0.2 + uRamp * 0.8);
      float hue = fract(seed * 0.13 + uHueShift / 360.0);
      vec3 tint = hsv2rgb(vec3(hue, uSaturation, 0.7 + size * 0.55));
      float flare = smoothstep(0.72, 1.0, size) * (0.25 + uRamp * 0.75);
      color += star(grid - offset - drift, flare, uGlowIntensity + uRamp * 0.7)
        * tint * (0.18 + size * 1.25) * twinkle * depth;
    }
  }
  return color;
}

void main() {
  vec2 focalPx = uFocal * uResolution.xy;
  vec2 uv = (vUv * uResolution.xy - focalPx) / uResolution.y;
  float angle = uTime * uRotationSpeed;
  uv = mat2(cos(angle), -sin(angle), sin(angle), cos(angle)) * uv;
  uv = mat2(uRotation.x, -uRotation.y, uRotation.y, uRotation.x) * uv;

  vec3 color = vec3(0.0);
  float density = uDensity * mix(0.62, 1.38, uRamp);
  float travel = uTime * mix(0.035, 0.24, uRamp);
  for (float layer = 0.0; layer < 1.0; layer += 1.0 / LAYERS) {
    float depth = fract(layer + travel);
    float scale = mix(22.0 * density, 0.62 * density, depth);
    float fade = depth * smoothstep(1.0, 0.78, depth);
    color += starLayer(uv * scale + layer * 453.32, fade, layer * 91.7);
  }
  float vignette = smoothstep(0.92, 0.15, length(uv));
  color *= 0.45 + vignette * 0.85;
  gl_FragColor = vec4(color, min(1.0, length(color) * 1.18));
}
`

export default function Galaxy({
  focal = DEFAULT_FOCAL,
  rotation = DEFAULT_ROTATION,
  density = 1.2,
  hueShift = 112,
  glowIntensity = 0.38,
  saturation = 0.28,
  twinkleIntensity = 0.42,
  rotationSpeed = 0.08,
  rampDuration = 3,
  className = '',
}) {
  const containerRef = useRef(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return undefined
    const renderer = new Renderer({ alpha: true, premultipliedAlpha: false, dpr: Math.min(1.5, window.devicePixelRatio || 1) })
    const { gl } = renderer
    gl.enable(gl.BLEND)
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)
    gl.clearColor(0, 0, 0, 0)

    const geometry = new Triangle(gl)
    const program = new Program(gl, {
      vertex: vertexShader,
      fragment: fragmentShader,
      transparent: true,
      uniforms: {
        uTime: { value: 0 },
        uResolution: { value: new Color(1, 1, 1) },
        uFocal: { value: new Float32Array(focal) },
        uRotation: { value: new Float32Array(rotation) },
        uDensity: { value: density },
        uHueShift: { value: hueShift },
        uGlowIntensity: { value: glowIntensity },
        uSaturation: { value: saturation },
        uTwinkleIntensity: { value: twinkleIntensity },
        uRotationSpeed: { value: rotationSpeed },
        uRamp: { value: 0 },
      },
    })
    const mesh = new Mesh(gl, { geometry, program })
    const startedAt = performance.now()
    let animationFrame = 0

    const resize = () => {
      const width = Math.max(1, container.clientWidth)
      const height = Math.max(1, container.clientHeight)
      renderer.setSize(width, height)
      program.uniforms.uResolution.value = new Color(gl.canvas.width, gl.canvas.height, gl.canvas.width / gl.canvas.height)
    }
    const observer = new ResizeObserver(resize)
    observer.observe(container)
    resize()
    container.appendChild(gl.canvas)

    const render = (time) => {
      const seconds = (time - startedAt) / 1000
      program.uniforms.uTime.value = seconds
      program.uniforms.uRamp.value = Math.min(1, seconds / rampDuration)
      renderer.render({ scene: mesh })
      animationFrame = requestAnimationFrame(render)
    }
    animationFrame = requestAnimationFrame(render)

    return () => {
      cancelAnimationFrame(animationFrame)
      observer.disconnect()
      if (gl.canvas.parentNode === container) container.removeChild(gl.canvas)
      gl.getExtension('WEBGL_lose_context')?.loseContext()
    }
  }, [density, focal, glowIntensity, hueShift, rampDuration, rotation, rotationSpeed, saturation, twinkleIntensity])

  return <div ref={containerRef} className={`galaxy-container ${className}`} aria-hidden="true" />
}
