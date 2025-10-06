export function Card({ className = '', children }) {
  return (
    <div className={`rounded-xl border border-neutral-200 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-950 ${className}`}>
      {children}
    </div>
  )
}

export function CardHeader({ className = '', children }) {
  return <div className={`mb-2 flex items-center justify-between ${className}`}>{children}</div>
}

export function CardTitle({ className = '', children }) {
  return <h3 className={`text-sm font-medium text-neutral-700 dark:text-neutral-300 ${className}`}>{children}</h3>
}

export function CardContent({ className = '', children }) {
  return <div className={className}>{children}</div>
}
