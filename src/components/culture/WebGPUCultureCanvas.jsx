import { Suspense, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { useProgress } from '@react-three/drei'
import { WebGPURenderer } from 'three/webgpu'

async function createCultureRenderer(props) {
  const renderer = new WebGPURenderer({
    ...props,
    alpha: true,
    antialias: true,
    powerPreference: 'high-performance',
  })

  // Three 会在 WebGPU 不可用时自动改用 WebGL2 backend。
  await renderer.init()
  return renderer
}

function CultureLoadingScreen({ rendererReady }) {
  const { active, progress } = useProgress()
  const visible = !rendererReady || active

  return (
    <div className={`culture-canvas-loading${visible ? ' is-visible' : ''}`} aria-hidden={!visible}>
      <span>中山大学</span>
      <i style={{ transform: `scaleX(${Math.max(0.04, progress / 100)})` }} />
      <small>LOADING CULTURE SCROLL</small>
    </div>
  )
}

export default function WebGPUCultureCanvas({ children }) {
  const [rendererReady, setRendererReady] = useState(false)

  return (
    <>
      <Canvas
        className="culture-three-canvas"
        dpr={[1, 1.5]}
        gl={createCultureRenderer}
        onCreated={({ gl }) => {
          gl.setClearColor(0x000000, 0)
          setRendererReady(true)
        }}
      >
        <Suspense fallback={null}>
          {children}
        </Suspense>
      </Canvas>
      <CultureLoadingScreen rendererReady={rendererReady} />
    </>
  )
}
