import { useMemo } from 'react'
import { Line } from '@react-three/drei'
import { Vector3 } from 'three'
import OrbitWord from './OrbitWord.jsx'

function makeEllipsePoints(a, b, seed, sketched = false) {
  const segments = 220
  return Array.from({ length: segments + 1 }, (_, index) => {
    const angle = (index / segments) * Math.PI * 2
    const wobble = sketched
      ? 1 + Math.sin(angle * 7 + seed) * 0.006 + Math.sin(angle * 13 - seed) * 0.003
      : 1
    return new Vector3(a * Math.cos(angle) * wobble, b * Math.sin(angle) * wobble, 0)
  })
}

export default function OrbitRing({ config, words }) {
  const cleanPoints = useMemo(
    () => makeEllipsePoints(config.a, config.b, config.lineSeed),
    [config.a, config.b, config.lineSeed],
  )
  const sketchPoints = useMemo(
    () => makeEllipsePoints(config.a, config.b, config.lineSeed, true),
    [config.a, config.b, config.lineSeed],
  )

  return (
    <group rotation={config.rotation}>
      <Line points={sketchPoints} color="#171918" lineWidth={3.2} transparent opacity={0.56} />
      <Line points={cleanPoints} color="#d5d8cf" lineWidth={1.15} transparent opacity={0.98} />
      {words.map((word) => (
        <OrbitWord key={word.glyph} {...word} a={config.a} b={config.b} />
      ))}
    </group>
  )
}

