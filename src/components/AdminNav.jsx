"use client"
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import clsx from 'clsx'

const links = [
  { href: '/admin/campaigns', label: 'Campaigns' },
  { href: '/admin/users', label: 'Users' },
  { href: '/admin/notices', label: 'Notices' },
  { href: '/admin/flagged', label: 'Flagged Images' },
  { href: '/admin/payments', label: 'Payments' },
]

export default function AdminNav() {
  const pathname = usePathname()
  return (
    <nav className="mt-4 space-y-2 text-sm">
      {links.map(({ href, label }) => {
        const active = pathname?.startsWith(href)
        return (
          <Link
            key={href}
            href={href}
            className={clsx(
              'block rounded px-3 py-2 hover:bg-white dark:hover:bg-neutral-800',
              active && 'bg-white font-medium dark:bg-neutral-800'
            )}
          >
            {label}
          </Link>
        )
      })}
    </nav>
  )
}
