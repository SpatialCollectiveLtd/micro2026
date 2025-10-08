"use client"
import clsx from 'clsx'

export default function TechLoader({ label = '', overlay = false, className = '' }) {
  const loader = (
    <div className={clsx("flex items-center gap-4 rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-sm shadow-[0_8px_30px_rgb(0_0_0_/_0.06)] backdrop-blur-md dark:border-neutral-800/60 dark:bg-neutral-900/60", className)}>
      <div className="flex h-6 items-end gap-1">
        <span className="h-2 w-1.5 animate-pulse-fast rounded bg-red-500 [animation-delay:-300ms]"></span>
        <span className="h-4 w-1.5 animate-pulse-fast rounded bg-red-400 [animation-delay:-150ms]"></span>
        <span className="h-5 w-1.5 animate-pulse-fast rounded bg-red-500"></span>
        <span className="h-3 w-1.5 animate-pulse-fast rounded bg-red-400 [animation-delay:-200ms]"></span>
        <span className="h-4 w-1.5 animate-pulse-fast rounded bg-red-500 [animation-delay:-100ms]"></span>
      </div>
      <span className="text-neutral-700 dark:text-neutral-200">{label}</span>
    </div>
  )
  if (!overlay) return loader
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40">
      {loader}
    </div>
  )
}

// Tailwind keyframes using utility classes
// Add global styles via a tiny style tag when loaded the first time
let injected = false
if (typeof document !== 'undefined' && !injected) {
  injected = true
  const style = document.createElement('style')
  style.innerHTML = `@keyframes pulse-fast { 0%, 100% { transform: scaleY(0.6); opacity: .6 } 50% { transform: scaleY(1); opacity: 1 } } .animate-pulse-fast { animation: pulse-fast .9s ease-in-out infinite; }`
  document.head.appendChild(style)
}
