import { useEffect, useRef, useState } from 'react'

const EDGE_GAP = 10

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), Math.max(min, max))
}

export default function PoemLauncher({ onOpen }) {
  const buttonRef = useRef(null)
  const dragRef = useRef(null)
  const [position, setPosition] = useState(null)

  useEffect(() => {
    function keepLauncherInView() {
      setPosition((current) => {
        if (!current || !buttonRef.current) return current
        const { width, height } = buttonRef.current.getBoundingClientRect()
        return {
          x: clamp(current.x, EDGE_GAP, window.innerWidth - width - EDGE_GAP),
          y: clamp(current.y, EDGE_GAP, window.innerHeight - height - EDGE_GAP),
        }
      })
    }

    window.addEventListener('resize', keepLauncherInView)
    return () => window.removeEventListener('resize', keepLauncherInView)
  }, [])

  function handlePointerDown(event) {
    if (event.button !== 0) return
    const rect = event.currentTarget.getBoundingClientRect()
    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      originX: rect.left,
      originY: rect.top,
      moved: false,
    }
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  function handlePointerMove(event) {
    const drag = dragRef.current
    if (!drag || drag.pointerId !== event.pointerId) return
    const deltaX = event.clientX - drag.startX
    const deltaY = event.clientY - drag.startY
    if (!drag.moved && Math.hypot(deltaX, deltaY) < 5) return

    drag.moved = true
    const { width, height } = event.currentTarget.getBoundingClientRect()
    setPosition({
      x: clamp(drag.originX + deltaX, EDGE_GAP, window.innerWidth - width - EDGE_GAP),
      y: clamp(drag.originY + deltaY, EDGE_GAP, window.innerHeight - height - EDGE_GAP),
    })
  }

  function finishPointer(event, cancelled = false) {
    const drag = dragRef.current
    if (!drag || drag.pointerId !== event.pointerId) return
    dragRef.current = null
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
    if (!cancelled && !drag.moved) onOpen()
  }

  return (
    <button
      ref={buttonRef}
      className="poem-launcher"
      type="button"
      aria-label="打开小诗，可拖动"
      title="拖动小诗封面 · 点击打开"
      data-button-feedback="custom"
      style={position ? { left: position.x, top: position.y, right: 'auto' } : undefined}
      onClick={(event) => { if (event.detail === 0) onOpen() }}
      onDragStart={(event) => event.preventDefault()}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={(event) => finishPointer(event)}
      onPointerCancel={(event) => finishPointer(event, true)}
    >
      <img src="/poem/poem-title-calligraphy.jpg" alt="" draggable="false" />
    </button>
  )
}
