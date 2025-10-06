export default function Loading() {
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex items-center justify-between">
        <div className="h-8 w-64 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800" />
        <div className="h-6 w-24 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-24 animate-pulse rounded-xl bg-neutral-200 dark:bg-neutral-800" />
        ))}
      </div>
      <div className="h-64 animate-pulse rounded-xl bg-neutral-200 dark:bg-neutral-800" />
    </div>
  )
}
