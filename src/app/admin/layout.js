export default function AdminLayout({ children }) {
  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-64 flex-col gap-2 border-r border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-800 dark:bg-neutral-900 sm:flex">
        <div className="text-lg font-semibold">Admin</div>
        <nav className="mt-4 space-y-2 text-sm">
          <a className="block rounded px-3 py-2 hover:bg-white dark:hover:bg-neutral-800" href="/admin/campaigns">Campaigns</a>
        </nav>
      </aside>
      <main className="flex-1 p-4 sm:p-8">{children}</main>
    </div>
  )
}
