"use client"
import clsx from 'clsx'

export default function Skeleton({ className = '' }) {
  return (
    <div
      aria-hidden
      className={clsx(
        'animate-pulse rounded-md border border-white/10 bg-white/10 backdrop-blur-sm dark:border-neutral-800/60 dark:bg-neutral-900/40',
        className
      )}
    />
  )
}
// Reduced motion: Tailwind doesn\'t add prefers-reduced-motion for animate-pulse by default. Provide a CSS hint.
// Consumers can add rm:class utilities via plugin; here we keep it simple by lowering opacity via global style.
if (typeof window !== 'undefined') {
  const styleId = 'skeleton-reduced-motion'
  if (!document.getElementById(styleId)) {
    const style = document.createElement('style')
    style.id = styleId
    style.textContent = `@media (prefers-reduced-motion: reduce){ .animate-pulse{ animation: none !important; } }`
    document.head.appendChild(style)
  }
}
