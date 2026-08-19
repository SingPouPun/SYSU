import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { CanvasTexture, LinearFilter, SRGBColorSpace } from 'three'

function makeWordTexture(glyph, english) {
  const canvas = document.createElement('canvas')
  canvas.width = 320
  canvas.height = 320
  const context = canvas.getContext('2d')

  context.clearRect(0, 0, 320, 320)
  context.save()
  context.translate(160, 160)
  context.rotate(-0.045)
  context.fillStyle = '#151616'
  context.beginPath()
  context.moveTo(-118, -96)
  context.quadraticCurveTo(-128, -124, -92, -132)
  context.lineTo(111, -115)
  context.quadraticCurveTo(132, -105, 124, -72)
  context.lineTo(111, 100)
  context.quadraticCurveTo(98, 128, 63, 122)
  context.lineTo(-105, 112)
  context.quadraticCurveTo(-130, 94, -119, 61)
  context.closePath()
  context.fill()
  context.strokeStyle = '#f3f0e8'
  context.lineWidth = 10
  context.lineJoin = 'round'
  context.stroke()
  context.strokeStyle = '#006633'
  context.lineWidth = 5
  context.beginPath()
  context.moveTo(-102, 86)
  context.quadraticCurveTo(8, 105, 105, 82)
  context.stroke()

  context.fillStyle = '#f7f4ec'
  context.textAlign = 'center'
  context.textBaseline = 'middle'
  context.font = '900 136px "Microsoft YaHei", sans-serif'
  context.fillText(glyph, 0, -7)
  context.fillStyle = '#8fc3a7'
  context.font = '900 18px Arial, sans-serif'
  context.fillText(english, 0, 82)
  context.restore()

  const texture = new CanvasTexture(canvas)
  texture.colorSpace = SRGBColorSpace
  texture.minFilter = LinearFilter
  texture.magFilter = LinearFilter
  texture.needsUpdate = true
  return texture
}

export default function OrbitWord({ glyph, english, a, b, phase, speed }) {
  const spriteRef = useRef(null)
  const phaseRef = useRef(phase)
  const texture = useMemo(() => makeWordTexture(glyph, english), [english, glyph])

  useEffect(() => () => texture.dispose(), [texture])

  useFrame((_, delta) => {
    phaseRef.current += delta * speed
    const angle = phaseRef.current
    spriteRef.current?.position.set(a * Math.cos(angle), b * Math.sin(angle), 0)
  })

  return (
    <sprite ref={spriteRef} scale={[1.36, 1.36, 1]} renderOrder={4}>
      <spriteMaterial map={texture} transparent alphaTest={0.04} depthTest depthWrite toneMapped={false} />
    </sprite>
  )
}
