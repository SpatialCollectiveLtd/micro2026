import clsx from 'clsx'
import React from 'react'

const variants = {
  default: 'bg-red-600 text-white hover:bg-red-700',
  outline: 'border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800',
  ghost: 'hover:bg-neutral-100 dark:hover:bg-neutral-800',
}

export const Button = React.forwardRef(function Button({ className, variant = 'default', asChild, ...props }, ref) {
  const Comp = asChild ? 'span' : 'button'
  return (
    <Comp
      ref={ref}
      className={clsx(
        'inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 disabled:pointer-events-none',
        variants[variant],
        className
      )}
      {...props}
    />
  )
})

export default Button
