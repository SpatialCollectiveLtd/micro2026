"use client"
import { useState, useTransition } from 'react'
import Switch from '@/components/ui/switch'

export default function CampaignActiveToggle({ id, initialActive }) {
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

  return <Switch checked={active} onChange={onToggle} disabled={isPending} />
}
