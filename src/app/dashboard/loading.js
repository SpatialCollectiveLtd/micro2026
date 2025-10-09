import WorkerLayout from '@/app/(worker)/layout'
import Skeleton from '@/components/Skeleton'

export default function Loading() {
  return (
    <WorkerLayout>
      <div className="space-y-4 px-4 py-8">
        <div className="rounded-xl border border-white/10 bg-white/5 p-5 shadow-sm backdrop-blur-md dark:border-neutral-800/60 dark:bg-neutral-900/60">
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-6 w-24" />
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <Skeleton className="h-20" />
            <Skeleton className="h-20" />
            <Skeleton className="h-20" />
          </div>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/5 p-0 shadow-sm backdrop-blur-md dark:border-neutral-800/60 dark:bg-neutral-900/60">
          <div className="border-b border-white/10 p-4">
            <Skeleton className="h-5 w-24" />
          </div>
          <ul className="divide-y divide-white/10 p-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <li key={i} className="py-3">
                <Skeleton className="h-4 w-64" />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </WorkerLayout>
  )
}
// Reduced motion respected via Skeleton component global style.
