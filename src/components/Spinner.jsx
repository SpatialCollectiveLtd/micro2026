"use client"
export default function Spinner({ size = 20, className = "" }) {
  const s = typeof size === 'number' ? `${size}px` : size
  return (
    <span
      aria-label="Loading"
      role="status"
      className={"inline-block animate-spin rounded-full border-2 border-neutral-300 border-t-neutral-900 dark:border-neutral-700 dark:border-t-white " + className}
      style={{ width: s, height: s }}
    />
  )
}
