import Link from 'next/link'
import { clsx } from 'clsx'
import { FiHome, FiCheckSquare, FiMail, FiUser } from 'react-icons/fi'

const tabs = [
  { href: '/dashboard', label: 'Dashboard', icon: FiHome },
  { href: '/tasks', label: 'Tasks', icon: FiCheckSquare },
  { href: '/messages', label: 'Messages', icon: FiMail },
  { href: '/profile', label: 'Profile', icon: FiUser },
]

export default function WorkerLayout({ children }) {
  return (
    <div className="min-h-screen pb-20">
      <div className="mx-auto max-w-3xl px-4 py-4 sm:py-6">{children}</div>

      {/* Bottom tab bar */}
      <nav className="fixed inset-x-0 bottom-3 z-50 mx-auto w-[92%] max-w-md rounded-2xl border border-black/10 bg-white/65 p-2 shadow-[0_8px_30px_rgb(0_0_0_/_0.06)] backdrop-blur-lg dark:border-white/10 dark:bg-neutral-900/60">
        <ul className="flex items-center justify-between">
          {tabs.map((t) => (
            <li key={t.href} className="flex-1">
              <Link
                href={t.href}
                className={clsx(
                  'flex h-12 flex-col items-center justify-center rounded-xl text-xs font-medium text-neutral-600 transition hover:bg-white/70 hover:text-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800/60 dark:hover:text-white',
                )}
              >
                <span className="text-lg" aria-hidden>
                  {t.icon && <t.icon />}
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
