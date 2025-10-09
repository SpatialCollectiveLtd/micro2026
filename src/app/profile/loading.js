import WorkerLayout from '@/app/(worker)/layout'

export default function Loading() {
  return (
    <WorkerLayout>
      <div className="space-y-4">
        <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
          <div className="h-6 w-32 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800" />
          <div className="mt-4 grid gap-2">
            <div className="h-4 w-48 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800" />
            <div className="h-4 w-40 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800" />
            <div className="h-4 w-24 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800" />
          </div>
          <div className="mt-4 h-9 w-36 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800" />
        </div>
      </div>
    </WorkerLayout>
  )
}
