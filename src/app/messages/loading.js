import WorkerLayout from '@/app/(worker)/layout'
import Skeleton from '@/components/Skeleton'

export default function Loading() {
  return (
    <WorkerLayout>
      <div className="space-y-4">
        <div className="rounded-xl border border-white/10 bg-white/5 p-4 shadow-sm backdrop-blur-md dark:border-neutral-800/60 dark:bg-neutral-900/60">
          <Skeleton className="h-5 w-28" />
        </div>
        <div className="rounded-xl border border-white/10 bg-white/5 p-0 shadow-sm backdrop-blur-md dark:border-neutral-800/60 dark:bg-neutral-900/60">
          <ul className="divide-y divide-white/10">
            {Array.from({ length: 6 }).map((_, i) => (
              <li key={i} className="p-4">
                <Skeleton className="h-4 w-40" />
                <div className="mt-2">
                  <Skeleton className="h-3 w-64" />
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </WorkerLayout>
  )
}
