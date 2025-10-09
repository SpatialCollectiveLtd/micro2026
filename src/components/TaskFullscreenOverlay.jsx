"use client"
import { useEffect } from 'react'
import ReactDOM from 'react-dom'
import Div100vh from 'react-div-100vh'

export default function TaskFullscreenOverlay({ open, onClose, progressText, question, children, topRight, bottomActions }) {
  // lock body scroll when open
  useEffect(() => {
    if (!open) return
    const prev = document.documentElement.style.overflow
    document.documentElement.style.overflow = 'hidden'
    return () => { document.documentElement.style.overflow = prev }
  }, [open])

  if (!open) return null
  const root = typeof window !== 'undefined' ? document.body : null
  if (!root) return null
  return ReactDOM.createPortal(
    <Div100vh className="fixed inset-0 z-[100] flex flex-col bg-black">
      {/* Top glass bar */}
      <div className="pointer-events-none absolute left-0 right-0 top-0 z-[110] p-2">
        <div className="pointer-events-auto mx-auto max-w-screen-sm rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-sm text-white backdrop-blur-md flex items-center justify-between">
          <div>{progressText}</div>
          <button onClick={onClose} className="rounded-md border border-white/20 px-2 py-1 text-xs text-white/90 hover:bg-white/10">✕</button>
        </div>
      </div>

      {/* Content area (viewer) */}
      <div className="relative z-[100] flex-1 min-h-0">
        {children}
      </div>

      {/* Bottom glass bar */}
      <div className="pointer-events-none absolute left-0 right-0 bottom-0 z-[110] p-2 pb-3">
        <div className="pointer-events-auto mx-auto max-w-screen-sm rounded-xl border border-white/10 bg-white/10 p-3 text-white backdrop-blur-md">
          {question && <div className="mb-2 text-center text-sm text-white/90">{question}</div>}
          {bottomActions}
        </div>
      </div>
    </Div100vh>,
    root
  )
}
