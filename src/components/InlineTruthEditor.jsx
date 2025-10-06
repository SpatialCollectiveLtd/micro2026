"use client"
import { useState, useTransition } from 'react'
import Button from '@/components/ui/button'

export default function InlineTruthEditor({ id, initial }) {
  const [value, setValue] = useState(initial)
  const [isPending, startTransition] = useTransition()

  const update = (v) => {
    const prev = value
    setValue(v)
    startTransition(async () => {
      try {
        const res = await fetch(`/api/admin/images/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ groundTruth: v }) })
        if (!res.ok) throw new Error('failed')
      } catch {
        setValue(prev)
      }
    })
  }

  return (
    <div className="flex items-center gap-2 text-sm">
      <Button variant={value === true ? 'default' : 'outline'} disabled={isPending} onClick={() => update(true)}>Yes</Button>
      <Button variant={value === false ? 'default' : 'outline'} disabled={isPending} onClick={() => update(false)}>No</Button>
      {value == null && <span className="text-neutral-500">Unset</span>}
    </div>
  )
}
