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
