import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'

export default function OrbitCore() {
  const coreRef = useRef(null)

  useFrame((_, delta) => {
    if (!coreRef.current) return
    coreRef.current.rotation.x += delta * 0.055
    coreRef.current.rotation.y -= delta * 0.075
  })

  return (
    <group ref={coreRef}>
      <mesh>
        <icosahedronGeometry args={[0.72, 1]} />
        <meshToonMaterial color="#e8e5dc" />
      </mesh>
      <mesh scale={1.035}>
        <icosahedronGeometry args={[0.72, 1]} />
        <meshBasicMaterial color="#151616" wireframe transparent opacity={0.86} />
      </mesh>
      <mesh scale={0.42}>
        <sphereGeometry args={[0.72, 24, 24]} />
        <meshToonMaterial color="#006633" />
      </mesh>
    </group>
  )
}

