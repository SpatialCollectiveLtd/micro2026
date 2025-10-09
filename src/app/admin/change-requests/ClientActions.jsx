"use client"
import { useState, useTransition } from 'react'
import { useToast } from '@/components/ui/toast'

export default function ClientActions({ id, status, referer }) {
  const { push } = useToast() || { push: ()=>{} }
  const [cur, setCur] = useState(status)
  const [isPending, startTransition] = useTransition()
  async function update(next) {
    if (cur === next) return
    const prev = cur
    setCur(next)
    try {
      const res = await fetch(`/api/admin/change-requests/${id}`, {
        method: 'POST',
        body: new URLSearchParams({ status: next }),
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      })
      if (res.ok) {
        push?.(`Status set to ${next}`, 'success')
      } else {
        setCur(prev)
        push?.('Failed to update status', 'error')
      }
    } catch {
      setCur(prev)
      push?.('Failed to update status', 'error')
    }
  }
  return (
    <div className="inline-flex items-center gap-2">
      <button className="rounded border px-2 py-1 disabled:opacity-50" disabled={cur==='IN_PROGRESS' || cur==='RESOLVED' || isPending} onClick={() => startTransition(() => update('IN_PROGRESS'))}>Start</button>
      <button className="rounded bg-green-600 px-2 py-1 text-white disabled:opacity-50" disabled={cur==='RESOLVED' || isPending} onClick={() => startTransition(() => update('RESOLVED'))}>Resolve</button>
    </div>
  )
}
