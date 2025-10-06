"use client"
import { useState } from 'react'
import Button from '@/components/ui/button'
import Input from '@/components/ui/input'

export default function PaymentsPage() {
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [summary, setSummary] = useState(null)
  const [busy, setBusy] = useState(false)

  const generate = async () => {
    if (!from || !to) return
    setBusy(true)
    try {
      const res = await fetch(`/api/admin/payments?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`)
      const data = await res.json()
      if (data.ok) setSummary(data.summary)
    } finally { setBusy(false) }
  }

  const downloadCsv = () => {
    if (!from || !to) return
    const url = `/api/admin/payments?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}&format=csv`
    window.location.href = url
  }

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <h1 className="text-2xl font-semibold">Payment Reports</h1>
      <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
        <div className="grid gap-3 sm:grid-cols-3">
          <div>
            <div className="text-xs text-neutral-500 mb-1">From</div>
            <Input type="datetime-local" value={from} onChange={(e) => setFrom(e.target.value)} />
          </div>
          <div>
            <div className="text-xs text-neutral-500 mb-1">To</div>
            <Input type="datetime-local" value={to} onChange={(e) => setTo(e.target.value)} />
          </div>
          <div className="flex items-end gap-2">
            <Button onClick={generate} disabled={busy} className="w-full">{busy ? 'Generating…' : 'Generate'}</Button>
            <Button variant="outline" onClick={downloadCsv} className="w-full">Download CSV</Button>
          </div>
        </div>
        {summary && (
          <div className="mt-4 grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-xs text-neutral-500">Total Tasks</div>
              <div className="text-xl font-semibold">{summary.totalTasks}</div>
            </div>
            <div>
              <div className="text-xs text-neutral-500">Rate</div>
              <div className="text-xl font-semibold">{summary.rate}</div>
            </div>
            <div>
              <div className="text-xs text-neutral-500">Total Paid</div>
              <div className="text-xl font-semibold">{summary.totalPaid}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
