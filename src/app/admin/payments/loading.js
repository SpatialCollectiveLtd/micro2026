export default function Loading() {
  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <div className="h-8 w-48 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800" />
      <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="space-y-2">
            <div className="h-4 w-20 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800" />
            <div className="h-9 w-full animate-pulse rounded bg-neutral-200 dark:bg-neutral-800" />
          </div>
          <div className="space-y-2">
            <div className="h-4 w-12 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800" />
            <div className="h-9 w-full animate-pulse rounded bg-neutral-200 dark:bg-neutral-800" />
          </div>
          <div className="flex items-end gap-2">
            <div className="h-9 w-full animate-pulse rounded bg-neutral-200 dark:bg-neutral-800" />
            <div className="h-9 w-full animate-pulse rounded bg-neutral-200 dark:bg-neutral-800" />
          </div>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-4 text-center">
          <div className="space-y-1">
            <div className="h-3 w-16 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800 mx-auto" />
            <div className="h-6 w-12 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800 mx-auto" />
          </div>
          <div className="space-y-1">
            <div className="h-3 w-10 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800 mx-auto" />
            <div className="h-6 w-12 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800 mx-auto" />
          </div>
          <div className="space-y-1">
            <div className="h-3 w-16 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800 mx-auto" />
            <div className="h-6 w-16 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800 mx-auto" />
          </div>
        </div>
      </div>
    </div>
  )
}
