export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-neutral-50 to-neutral-100 dark:from-neutral-900 dark:to-neutral-950 p-6">
      <div className="w-full max-w-md rounded-2xl border border-neutral-200/60 dark:border-neutral-800/60 bg-white/70 dark:bg-neutral-900/70 backdrop-blur p-6 shadow-lg">
        <div className="h-6 w-40 bg-neutral-200/70 dark:bg-neutral-800/70 rounded mb-3" />
        <div className="h-4 w-full bg-neutral-200/70 dark:bg-neutral-800/70 rounded mb-2" />
        <div className="h-4 w-5/6 bg-neutral-200/70 dark:bg-neutral-800/70 rounded mb-6" />
        <div className="h-10 w-full bg-neutral-200/70 dark:bg-neutral-800/70 rounded" />
      </div>
    </div>
  )
}
