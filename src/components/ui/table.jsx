export function Table({ children }) {
  return (
    <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
      <table className="w-full text-left text-sm">{children}</table>
    </div>
  )
}

export function THead({ children }) {
  return (
    <thead className="border-b border-neutral-200 bg-neutral-50 text-neutral-500 dark:border-neutral-800 dark:bg-neutral-900">
      {children}
    </thead>
  )
}

export function TR({ children }) {
  return (
    <tr className="group border-t border-neutral-200 transition hover:bg-neutral-50 dark:border-neutral-800 dark:hover:bg-neutral-900">
      {children}
    </tr>
  )
}

export function TH({ children }) { return <th className="px-4 py-3">{children}</th> }
export function TD({ children, className = '' }) { return <td className={`px-4 py-3 ${className}`}>{children}</td> }
