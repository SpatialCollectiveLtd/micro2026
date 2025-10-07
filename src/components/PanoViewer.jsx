"use client"
import { useEffect, useRef, useState } from 'react'

export default function PanoViewer({ imageUrl }) {
  const containerRef = useRef(null)
  const rendererRef = useRef(null)
  const [error, setError] = useState('')

  useEffect(() => {
    let mounted = true
    let scene, camera, renderer, controls, animationId, texture

    async function setup() {
      try {
        const THREE = await import('three')
        const { OrbitControls } = await import('three/examples/jsm/controls/OrbitControls.js')
        if (!mounted || !containerRef.current) return

        const width = containerRef.current.clientWidth
        const height = containerRef.current.clientHeight || 400

        scene = new THREE.Scene()
        camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000)
        camera.position.set(0, 0, 0.1)

        renderer = new THREE.WebGLRenderer({ antialias: true })
        renderer.setSize(width, height)
        rendererRef.current = renderer
        containerRef.current.innerHTML = ''
        containerRef.current.appendChild(renderer.domElement)

        controls = new OrbitControls(camera, renderer.domElement)
        controls.enableZoom = true
        controls.enablePan = false
        controls.rotateSpeed = 0.3

        const geometry = new THREE.SphereGeometry(500, 60, 40)
        geometry.scale(-1, 1, 1)
        const loader = new THREE.TextureLoader()
        await new Promise((resolve, reject) => {
          loader.load(
            imageUrl,
            (tex) => {
              texture = tex
              const material = new THREE.MeshBasicMaterial({ map: texture })
              const mesh = new THREE.Mesh(geometry, material)
              scene.add(mesh)
              resolve()
            },
            undefined,
            (err) => reject(err)
          )
        })

        const animate = () => {
          if (!mounted) return
          controls.update()
          renderer.render(scene, camera)
          animationId = requestAnimationFrame(animate)
        }
        animate()

        // Handle resize
        const onResize = () => {
          if (!containerRef.current || !renderer) return
          const w = containerRef.current.clientWidth
          const h = containerRef.current.clientHeight || 400
          camera.aspect = w / h
          camera.updateProjectionMatrix()
          renderer.setSize(w, h)
        }
        window.addEventListener('resize', onResize)

        return () => window.removeEventListener('resize', onResize)
      } catch (e) {
        console.error('PanoViewer error:', e)
        if (mounted) setError('The panorama cannot be loaded')
      }
    }

    const cleanupResize = setup()

    return () => {
      mounted = false
      try {
        if (animationId) cancelAnimationFrame(animationId)
      } catch {}
      try { controls && controls.dispose && controls.dispose() } catch {}
      try { rendererRef.current && rendererRef.current.dispose && rendererRef.current.dispose() } catch {}
      try { texture && texture.dispose && texture.dispose() } catch {}
      try { renderer && renderer.dispose && renderer.dispose() } catch {}
      if (typeof cleanupResize === 'function') cleanupResize()
    }
  }, [imageUrl])

  return (
    <div className="relative">
      <div ref={containerRef} className="h-[50vh] w-full rounded-lg bg-black" />
      {error && (
        <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/70 text-sm text-red-300">
          {error}
        </div>
      )}
    </div>
  )
}
