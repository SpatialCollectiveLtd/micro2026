"use client"
import { useState, useTransition } from 'react'
import Switch from '@/components/ui/switch'
import Badge from '@/components/ui/badge'

export default function CampaignActiveToggle({ id, initialActive, showBadge = true }) {
  const [active, setActive] = useState(initialActive)
  const [isPending, startTransition] = useTransition()

  const onToggle = (next) => {
    setActive(next)
    startTransition(async () => {
      try {
        const res = await fetch(`/api/admin/campaigns/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ active: next }) })
        if (!res.ok) throw new Error('Failed')
      } catch (e) {
        setActive(!next)
      }
    })
  }

  return (
    <div className="flex items-center gap-3">
      {showBadge && (
        <Badge className={active ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : ''}>
          {active ? 'Active' : 'Inactive'}
        </Badge>
      )}
      <Switch checked={active} onChange={onToggle} disabled={isPending} />
    </div>
  )
}
