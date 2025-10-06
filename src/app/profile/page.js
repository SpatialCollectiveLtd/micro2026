import WorkerLayout from '@/app/(worker)/layout'

export default function ProfilePage() {
  return (
    <WorkerLayout>
      <div className="space-y-4">
        <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
          <h1 className="text-xl font-semibold">Profile</h1>
          <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">User details coming soon...</p>
        </div>

        <form action="/api/auth/logout" method="post">
          <button className="rounded-md bg-neutral-800 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-900 dark:bg-neutral-200 dark:text-neutral-900 dark:hover:bg-white">
            Logout
          </button>
        </form>
      </div>
    </WorkerLayout>
  )
}
