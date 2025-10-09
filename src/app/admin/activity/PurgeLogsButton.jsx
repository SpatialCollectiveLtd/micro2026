"use client"
import { useState } from 'react'
import { useToast } from '@/components/ui/toast'

export default function PurgeLogsButton() {
  const { push } = useToast() || { push: ()=>{} }
  const [busy, setBusy] = useState(false)
  async function purge(hours) {
    setBusy(true)
    try {
      const res = await fetch('/api/admin/reports/activity/purge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ olderThanHours: hours }),
      })
      const data = await res.json().catch(() => ({}))
      if (res.ok) push?.(`Deleted ${data.deleted ?? 0} logs`, 'success')
      else push?.(data.error || 'Failed to purge', 'error')
    } catch {
      push?.('Failed to purge', 'error')
    } finally {
      setBusy(false)
    }
  }
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-neutral-600 dark:text-neutral-400">Purge logs:</span>
      <button disabled={busy} className="rounded border px-2 py-1 text-sm" onClick={() => purge(24)}>older than 24h</button>
      <button disabled={busy} className="rounded border px-2 py-1 text-sm" onClick={() => purge(24*7)}>older than 7d</button>
    </div>
  )
}
