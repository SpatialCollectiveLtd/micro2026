import Skeleton from '@/components/Skeleton'

export default function Loading() {
  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <Skeleton className="h-8 w-48" />
      <div className="rounded-xl border border-white/10 bg-white/5 p-4 shadow-sm backdrop-blur-md dark:border-neutral-800/60 dark:bg-neutral-900/60">
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-9 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-9 w-full" />
          </div>
          <div className="flex items-end gap-2">
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-9 w-full" />
          </div>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-4 text-center">
          <div className="space-y-1">
            <Skeleton className="h-3 w-16 mx-auto" />
            <Skeleton className="h-6 w-12 mx-auto" />
          </div>
          <div className="space-y-1">
            <Skeleton className="h-3 w-10 mx-auto" />
            <Skeleton className="h-6 w-12 mx-auto" />
          </div>
          <div className="space-y-1">
            <Skeleton className="h-3 w-16 mx-auto" />
            <Skeleton className="h-6 w-16 mx-auto" />
          </div>
        </div>
      </div>
    </div>
  )
}
