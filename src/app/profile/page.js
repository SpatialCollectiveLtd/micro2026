"use client"
import WorkerLayout from '@/app/(worker)/layout'
import { useEffect, useMemo, useState } from 'react'

export default function ProfilePage() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showCR, setShowCR] = useState(false)
  const [message, setMessage] = useState('')
  const [crStatus, setCrStatus] = useState({ type: '', text: '' })

  useEffect(() => {
    ;(async () => {
      try {
        const res = await fetch('/api/dashboard', { credentials: 'same-origin' })
        const data = await res.json().catch(() => ({ ok: false }))
        if (data?.ok) setUser(data.user)
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  const onSubmitCR = async (e) => {
    e.preventDefault()
    setCrStatus({ type: '', text: '' })
    const msg = message.trim()
    if (msg.length < 5) {
      setCrStatus({ type: 'error', text: 'Please provide a message (min 5 characters).' })
      return
    }
    try {
      const res = await fetch('/api/profile/change-request', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ message: msg }),
      })
      const data = await res.json().catch(() => ({ ok: false }))
      if (!res.ok || data?.ok === false) {
        setCrStatus({ type: 'error', text: data?.error || 'Failed to submit request.' })
        return
      }
      setCrStatus({ type: 'success', text: 'Request submitted. Our team will review it shortly.' })
      setMessage('')
      setShowCR(false)
    } catch (err) {
      setCrStatus({ type: 'error', text: 'Network error. Please try again.' })
    }
  }

  return (
    <WorkerLayout>
      <div className="space-y-4">
        <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
          <h1 className="text-xl font-semibold">Profile</h1>
          {loading ? (
            <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">Loading…</p>
          ) : user ? (
            <div className="mt-3 grid gap-2 text-sm">
              <div><span className="text-neutral-500">Name:</span> {user.name || '—'}</div>
              <div><span className="text-neutral-500">Phone:</span> {user.phone}</div>
              <div><span className="text-neutral-500">Role:</span> {user.role}</div>
            </div>
          ) : (
            <p className="mt-2 text-sm text-red-500">Unable to load profile.</p>
          )}

          <div className="mt-4 flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowCR(true)}
              className="rounded-md border border-neutral-300 px-3 py-1.5 text-sm hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800"
            >
              Request Change
            </button>
            <form action="/api/auth/logout" method="post">
              <button className="rounded-md bg-neutral-800 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-900 dark:bg-neutral-200 dark:text-neutral-900 dark:hover:bg-white">
                Logout
              </button>
            </form>
          </div>
        </div>

        {crStatus.text && (
          <div className={crStatus.type === 'success' ? 'rounded-md border border-green-400/30 bg-green-500/10 p-3 text-sm text-green-700' : 'rounded-md border border-red-400/30 bg-red-500/10 p-3 text-sm text-red-700'}>
            {crStatus.text}
          </div>
        )}
      </div>

      {showCR && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-xl border border-white/15 bg-white/90 p-6 shadow-2xl backdrop-blur-md dark:border-neutral-700 dark:bg-neutral-900/80">
            <h2 className="text-lg font-semibold">Request Profile Change</h2>
            <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">Describe what you’d like to update (e.g., name, phone, settlement).</p>
            <form className="mt-3 space-y-3" onSubmit={onSubmitCR}>
              <textarea
                rows={5}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full rounded-md border border-neutral-300 bg-white/90 p-2 text-sm outline-none focus:border-red-400 dark:border-neutral-700 dark:bg-neutral-800"
                placeholder="Your request…"
              />
              <div className="flex items-center justify-end gap-2">
                <button type="button" onClick={() => setShowCR(false)} className="rounded-md border border-neutral-300 px-3 py-1.5 text-sm hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800">Cancel</button>
                <button type="submit" className="rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700">Submit</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </WorkerLayout>
  )
}
