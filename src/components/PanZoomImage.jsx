"use client"
import { useCallback, useEffect, useRef, useState } from 'react'

// A lightweight pan-and-zoom image viewer with mouse, touch, and wheel support.
// - Zoom with mouse wheel (or trackpad) centered on the cursor.
// - Pan by dragging (mouse or touch).
// - Double-click/tap to reset.
// - Gracefully handles container resizes.
export default function PanZoomImage({ src, alt = '', className = '', minScale = 1, maxScale = 6 }) {
  const containerRef = useRef(null)
  const imgRef = useRef(null)

  const [scale, setScale] = useState(1)
  const [translate, setTranslate] = useState({ x: 0, y: 0 })

  const pointers = useRef(new Map()) // pointerId -> {x, y}
  const lastGesture = useRef(null) // {distance, centerX, centerY, scale, translate}

  const clamp = (v, min, max) => Math.max(min, Math.min(max, v))

  // Fit image to container on first load and on container resize.
  const fitToContainer = useCallback(() => {
    const el = containerRef.current
    const img = imgRef.current
    if (!el || !img) return
    const cw = el.clientWidth
    const ch = el.clientHeight || 300
    const iw = img.naturalWidth || img.width
    const ih = img.naturalHeight || img.height
    if (!iw || !ih || !cw || !ch) return
    // cover height by default
    const scaleToFit = Math.min(cw / iw, ch / ih)
    const s = Math.max(minScale, Math.min(1, scaleToFit))
    setScale(s)
    // center the image
    const x = (cw - iw * s) / 2
    const y = (ch - ih * s) / 2
    setTranslate({ x, y })
  }, [minScale])

  useEffect(() => {
    const onResize = () => fitToContainer()
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [fitToContainer])

  const reset = useCallback(() => fitToContainer(), [fitToContainer])

  // Wheel zoom around cursor position
  const onWheel = useCallback((e) => {
    e.preventDefault()
    const el = containerRef.current
    const img = imgRef.current
    if (!el || !img) return
    const rect = el.getBoundingClientRect()
    const cx = e.clientX - rect.left
    const cy = e.clientY - rect.top

    const zoomIntensity = 0.0015 // lower = slower
    const nextScale = clamp(scale * (1 - e.deltaY * zoomIntensity), minScale, maxScale)
    const ratio = nextScale / scale

    // Translate to keep the point under cursor stationary
    const nx = cx - (cx - translate.x) * ratio
    const ny = cy - (cy - translate.y) * ratio

    setScale(nextScale)
    setTranslate({ x: nx, y: ny })
  }, [scale, translate, minScale, maxScale])

  // Pointer handlers (pan and pinch)
  const onPointerDown = useCallback((e) => {
    const el = containerRef.current
    if (!el) return
    el.setPointerCapture?.(e.pointerId)
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY })
    if (pointers.current.size === 2) {
      // Start pinch
      const pts = Array.from(pointers.current.values())
      const dx = pts[1].x - pts[0].x
      const dy = pts[1].y - pts[0].y
      const distance = Math.hypot(dx, dy)
      const centerX = (pts[0].x + pts[1].x) / 2
      const centerY = (pts[0].y + pts[1].y) / 2
      lastGesture.current = { distance, centerX, centerY, scale, translate }
    }
  }, [scale, translate])

  const onPointerMove = useCallback((e) => {
    if (!pointers.current.has(e.pointerId)) return
    const prev = pointers.current.get(e.pointerId)
    const curr = { x: e.clientX, y: e.clientY }
    pointers.current.set(e.pointerId, curr)

    const el = containerRef.current
    if (!el) return

    if (pointers.current.size === 2 && lastGesture.current) {
      // Pinch to zoom
      const pts = Array.from(pointers.current.values())
      const dx = pts[1].x - pts[0].x
      const dy = pts[1].y - pts[0].y
      const distance = Math.hypot(dx, dy)
      const centerX = (pts[0].x + pts[1].x) / 2
      const centerY = (pts[0].y + pts[1].y) / 2

      const { distance: startDist, centerX: sx, centerY: sy, scale: startScale, translate: startT } = lastGesture.current
      if (!startDist) return
      const nextScale = clamp((distance / startDist) * startScale, minScale, maxScale)
      const ratio = nextScale / startScale
      const nx = sx - (sx - startT.x) * ratio + (centerX - sx)
      const ny = sy - (sy - startT.y) * ratio + (centerY - sy)
      setScale(nextScale)
      setTranslate({ x: nx, y: ny })
      return
    }

    // Single pointer: pan
    const dx = curr.x - prev.x
    const dy = curr.y - prev.y
    setTranslate((t) => ({ x: t.x + dx, y: t.y + dy }))
  }, [minScale, maxScale])

  const onPointerUp = useCallback((e) => {
    pointers.current.delete(e.pointerId)
    if (pointers.current.size < 2) {
      lastGesture.current = null
    }
  }, [])

  const onDoubleClick = useCallback(() => {
    reset()
  }, [reset])

  // Initial fit when image loads
  const onImgLoad = useCallback(() => fitToContainer(), [fitToContainer])

  return (
    <div
      ref={containerRef}
      className={"relative select-none overflow-hidden bg-black " + className}
      onWheel={onWheel}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onDoubleClick={onDoubleClick}
      role="img"
      aria-label={alt}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        decoding="async"
        loading="eager"
        draggable={false}
        onLoad={onImgLoad}
        onError={(e) => {
          const holder = document.createElement('div')
          holder.className = 'absolute inset-0 flex items-center justify-center text-sm text-red-300'
          holder.textContent = 'The image cannot be loaded'
          e.currentTarget.parentElement?.appendChild(holder)
          e.currentTarget.style.display = 'none'
        }}
        style={{
          transform: `translate(${translate.x}px, ${translate.y}px) scale(${scale})`,
          transformOrigin: '0 0',
          touchAction: 'none',
          userSelect: 'none',
          willChange: 'transform',
          // Start at natural size, scaled via transform
          maxWidth: 'none',
          maxHeight: 'none',
        }}
      />
    </div>
  )
}
