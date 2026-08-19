import { Canvas } from '@react-three/fiber'
import { PerspectiveCamera } from '@react-three/drei'
import OrbitCore from './OrbitCore.jsx'
import OrbitRing from './OrbitRing.jsx'
import { ORBIT_CAMERA, ORBIT_RINGS, ORBIT_WORDS } from './orbitConfig.js'

function OrbitScene() {
  return (
    <>
      <PerspectiveCamera makeDefault {...ORBIT_CAMERA} />
      <ambientLight intensity={1.7} />
      <directionalLight position={[4, 6, 8]} intensity={2.2} />
      <directionalLight position={[-5, -2, 3]} intensity={0.7} color="#7eaa92" />
      {ORBIT_RINGS.map((ring) => (
        <OrbitRing
          config={ring}
          key={ring.id}
          words={ORBIT_WORDS.filter((word) => word.orbit === ring.id)}
        />
      ))}
      <OrbitCore />
    </>
  )
}

export default function DisciplineOrbit() {
  return (
    <div className="discipline-orbit-canvas" aria-label="文、理、医、工、农三维轨道系统">
      <Canvas
        dpr={[1, 1.5]}
        gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }}
      >
        <OrbitScene />
      </Canvas>
    </div>
  )
}
