import Link from 'next/link'
import AdminNav from '@/components/AdminNav'
import { ToastProvider } from '@/components/ui/toast'
import { requireAdminSession } from '@/lib/route-guards'

export default async function AdminLayout({ children }) {
  await requireAdminSession()
  return (
    <ToastProvider>
      <div className="flex min-h-screen">
        <aside className="hidden w-64 flex-col gap-2 border-r border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-800 dark:bg-neutral-900 sm:flex">
          <div className="text-lg font-semibold">Admin</div>
          <AdminNav />
          <form action="/api/auth/logout" method="post" className="mt-auto">
            <button className="mt-4 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700">Logout</button>
          </form>
        </aside>
        <main className="flex-1 p-4 sm:p-8">{children}</main>
      </div>
    </ToastProvider>
  )
}
