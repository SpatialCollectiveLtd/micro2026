export default function Badge({ children, className = '' }) {
  return (
    <span className={`inline-flex items-center rounded bg-neutral-100 px-2 py-1 text-xs dark:bg-neutral-800 ${className}`}>
      {children}
    </span>
  )
}
