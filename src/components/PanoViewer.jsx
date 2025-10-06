"use client"
import { useEffect, useRef } from 'react'

export default function PanoViewer({ imageUrl }) {
  const containerRef = useRef(null)

  useEffect(() => {
    let viewer
    let mounted = true
    ;(async () => {
      const [{ Viewer }, THREE] = await Promise.all([
        import('photo-sphere-viewer'),
        import('three'),
      ])
      if (!mounted || !containerRef.current) return
      viewer = new Viewer({
        container: containerRef.current,
        panorama: imageUrl,
        touchmoveTwoFingers: true,
        mousewheel: true,
        navbar: false,
        defaultZoomLvl: 0,
      })
    })()
    return () => {
      mounted = false
      if (viewer) viewer.destroy()
    }
  }, [imageUrl])

  return <div ref={containerRef} className="h-[50vh] w-full rounded-lg bg-black" />
}
