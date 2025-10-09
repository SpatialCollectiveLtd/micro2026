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
import WorkerLayout from '@/app/(worker)/layout'
import Spinner from '@/components/Spinner'

export default function Loading() {
  return (
    <WorkerLayout>
      <div className="flex items-center justify-center py-16">
        <div className="flex items-center gap-3 rounded-xl border border-black/10 bg-white/60 px-4 py-3 shadow-[0_8px_30px_rgb(0_0_0_/_0.06)] backdrop-blur-md dark:border-white/10 dark:bg-neutral-900/60">
          <Spinner />
          <span className="text-sm text-neutral-600 dark:text-neutral-300">Loading messages…</span>
        </div>
      </div>
    </WorkerLayout>
  )
}
