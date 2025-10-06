import clsx from 'clsx'
export default function Input({ className, ...props }) {
  return (
    <input
      className={clsx(
        'block w-full rounded-md border border-neutral-300 px-3 py-2 text-sm shadow-sm outline-none transition focus:border-red-500 dark:border-neutral-700 dark:bg-neutral-900',
        className
      )}
      {...props}
    />
  )
}
