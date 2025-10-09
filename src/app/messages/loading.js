import WorkerLayout from '@/app/(worker)/layout'

export default function Loading() {
  return (
    <WorkerLayout>
      <div className="space-y-4">
        <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
          <div className="h-5 w-28 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800" />
        </div>
        <div className="rounded-xl border border-neutral-200 bg-white p-0 shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
          <ul className="divide-y divide-neutral-200 dark:divide-neutral-800">
            {Array.from({ length: 6 }).map((_, i) => (
              <li key={i} className="p-4">
                <div className="h-4 w-40 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800" />
                <div className="mt-2 h-3 w-64 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800" />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </WorkerLayout>
  )
}
