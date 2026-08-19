export const ORBIT_CAMERA = {
  position: [0, 0.25, 12.8],
  fov: 38,
  near: 0.1,
  far: 80,
}

export const ORBIT_RINGS = [
  { id: 'equator', a: 5.05, b: 1.72, rotation: [0.08, 0.12, -0.03], lineSeed: 0.4 },
  { id: 'rising', a: 4.65, b: 2.12, rotation: [0.88, 0.42, 0.72], lineSeed: 1.7 },
  { id: 'cross', a: 4.35, b: 1.86, rotation: [1.16, -0.58, -0.64], lineSeed: 2.9 },
  { id: 'deep', a: 3.92, b: 2.38, rotation: [-0.62, 0.92, 0.36], lineSeed: 4.1 },
]

export const ORBIT_WORDS = [
  { glyph: '文', english: 'HUMANITIES', orbit: 'equator', phase: 0.08, speed: 0.075 },
  { glyph: '理', english: 'SCIENCE', orbit: 'rising', phase: 1.38, speed: -0.062 },
  { glyph: '医', english: 'MEDICINE', orbit: 'cross', phase: 2.72, speed: 0.068 },
  { glyph: '工', english: 'ENGINEERING', orbit: 'deep', phase: 4.15, speed: -0.056 },
  { glyph: '农', english: 'AGRICULTURE', orbit: 'rising', phase: 5.42, speed: -0.048 },
]

