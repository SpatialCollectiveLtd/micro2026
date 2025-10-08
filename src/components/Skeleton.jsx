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
