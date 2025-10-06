export default function Loading() {
  return (
    <div className="mx-auto max-w-5xl space-y-4">
      <div className="flex items-center justify-between">
        <div className="h-8 w-40 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800" />
        <div className="h-9 w-40 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800" />
      </div>
      <div className="h-64 animate-pulse rounded-xl bg-neutral-200 dark:bg-neutral-800" />
    </div>
  )
}
