export const dynamic = 'force-dynamic'

export default function SuspendedPage() {
  return (
    <div className="min-h-screen grid place-items-center bg-neutral-50 p-6 dark:bg-neutral-950">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/60 p-6 text-center shadow-xl backdrop-blur-md dark:border-neutral-800/60 dark:bg-neutral-900/60">
        <div className="mb-2 text-2xl font-semibold">Account Suspended</div>
        <p className="text-sm text-neutral-600 dark:text-neutral-300">
          Your account has been suspended. Please contact an administrator.
        </p>
        <form action="/api/auth/logout" method="post" className="mt-6">
          <button className="w-full rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2">
            Logout
          </button>
        </form>
      </div>
    </div>
  )
}
