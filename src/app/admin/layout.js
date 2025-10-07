import Link from 'next/link'
import AdminNav from '@/components/AdminNav'
export default function AdminLayout({ children }) {
  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-64 flex-col gap-2 border-r border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-800 dark:bg-neutral-900 sm:flex">
        <div className="text-lg font-semibold">Admin</div>
        <AdminNav />
      </aside>
      <main className="flex-1 p-4 sm:p-8">{children}</main>
    </div>
  )
}
