"use client"
import React from 'react'
import { Button } from '@/components/ui/button'

export default function SessionConflictPage() {
  const [submitting, setSubmitting] = React.useState(false)
  const [error, setError] = React.useState('')
  const buttonRef = React.useRef(null)

  React.useEffect(() => {
    // Set initial focus to main action for accessibility
    buttonRef.current?.focus()
  }, [])

  async function resolveConflict() {
    setSubmitting(true)
    setError('')
    try {
      const res = await fetch('/api/auth/resolve-conflict', { method: 'POST' })
      const data = await res.json().catch(() => ({}))
      if (!res.ok || !data?.ok) throw new Error(data?.error || 'Failed to resolve session')
      // Redirect based on role if provided, else dashboard
      const to = data.redirectTo || '/dashboard'
      window.location.assign(to)
    } catch (e) {
      setError(e.message || 'Something went wrong')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-neutral-50 to-neutral-100 dark:from-neutral-900 dark:to-neutral-950 p-6">
      <div className="w-full max-w-md rounded-2xl border border-neutral-200/60 dark:border-neutral-800/60 bg-white/70 dark:bg-neutral-900/70 backdrop-blur p-6 shadow-lg">
        <h1 className="text-2xl font-semibold mb-2">You’re signed in elsewhere</h1>
        <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-6">
          Your account is currently active on another device or browser. To continue here, we’ll log out the other session and refresh yours.
        </p>
        {error ? (
          <div className="mb-4 text-sm text-red-600">{error}</div>
        ) : null}
        <Button ref={buttonRef} disabled={submitting} onClick={resolveConflict} className="w-full">
          {submitting ? 'Resolving…' : 'Log out other device and continue'}
        </Button>
        {submitting ? (
          <div className="mt-3 text-xs text-neutral-500" role="status" aria-live="polite">
            Working… this usually takes a second.
          </div>
        ) : null}
        <p className="mt-4 text-xs text-neutral-500">
          If this wasn’t you, consider changing your password or contacting an administrator.
        </p>
      </div>
    </div>
  )
}
