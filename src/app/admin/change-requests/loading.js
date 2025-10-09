export default function Loading() {
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="h-8 w-48 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800" />
      <div className="h-10 w-full animate-pulse rounded bg-neutral-200 dark:bg-neutral-800" />
      <div className="h-64 w-full animate-pulse rounded bg-neutral-200 dark:bg-neutral-800" />
    </div>
  )
}
