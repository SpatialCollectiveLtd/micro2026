import Link from 'next/link'
import { clsx } from 'clsx'

const tabs = [
  { href: '/dashboard', label: 'Dashboard', icon: '🏠' },
  { href: '/tasks', label: 'Tasks', icon: '📝' },
  { href: '/earnings', label: 'Earnings', icon: '💰' },
  { href: '/profile', label: 'Profile', icon: '👤' },
]

export default function WorkerLayout({ children }) {
  return (
    <div className="min-h-screen pb-20">
      <div className="mx-auto max-w-3xl px-4 py-4 sm:py-6">{children}</div>

      {/* Bottom tab bar */}
      <nav className="fixed inset-x-0 bottom-3 z-50 mx-auto w-[92%] max-w-md rounded-2xl border border-white/20 bg-white/70 p-2 shadow-lg backdrop-blur-md dark:border-white/10 dark:bg-neutral-900/70">
        <ul className="flex items-center justify-between">
          {tabs.map((t) => (
            <li key={t.href} className="flex-1">
              <Link
                href={t.href}
                className={clsx(
                  'flex h-12 flex-col items-center justify-center rounded-xl text-xs font-medium text-neutral-600 transition hover:bg-white/60 hover:text-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800/60 dark:hover:text-white',
                )}
              >
                <span className="text-lg" aria-hidden>
                  {t.icon}
                </span>
                <span>{t.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  )
}
