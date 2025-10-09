import WorkerLayout from '@/app/(worker)/layout'
import Skeleton from '@/components/Skeleton'

export default function Loading() {
  return (
    <WorkerLayout>
      <div className="space-y-4">
        <div className="rounded-xl border border-white/10 bg-white/5 p-5 shadow-sm backdrop-blur-md dark:border-neutral-800/60 dark:bg-neutral-900/60">
          <Skeleton className="h-6 w-32" />
          <div className="mt-4 grid gap-2">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-4 w-24" />
          </div>
          <div className="mt-4">
            <Skeleton className="h-9 w-36" />
          </div>
        </div>
      </div>
    </WorkerLayout>
  )
}
