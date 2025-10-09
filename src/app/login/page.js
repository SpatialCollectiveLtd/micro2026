"use client"
import Image from 'next/image'
import { useEffect, useMemo, useState } from 'react'
import Select from '@/components/ui/select'

export const dynamic = 'force-dynamic'

export default function LoginPage() {
  const [settlements, setSettlements] = useState([])
  const [phone, setPhone] = useState('')
  const [settlementId, setSettlementId] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    ;(async () => {
      const res = await fetch('/api/settlements')
      const data = await res.json().catch(() => ({ ok: false }))
      if (data?.ok) setSettlements(data.settlements)
    })()
  }, [])

  const formValid = phone.trim().length > 0 && settlementId.trim().length > 0 && !loading

  const settlementOptions = useMemo(() => settlements.map(s => ({ value: s.id, label: s.name })), [settlements])
  const selectedSettlement = useMemo(() => settlementOptions.find(o => o.value === settlementId) || null, [settlementOptions, settlementId])

  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!formValid) return
    setLoading(true)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ phone: phone.trim(), settlementId: settlementId.trim() }),
        redirect: 'manual',
        credentials: 'same-origin',
      })
      if (res.status === 0 || (res.status >= 300 && res.status < 400)) {
        // Cookie should be set by server response. Determine role via /api/dashboard and route accordingly.
        const who = await fetch('/api/dashboard', { credentials: 'same-origin' })
        if (who.ok) {
          const info = await who.json().catch(() => null)
          const role = info?.user?.role
          if (role === 'ADMIN') {
            window.location.href = '/admin/campaigns'
          } else {
            window.location.href = '/dashboard'
          }
          return
        }
        // fallback to worker dashboard if role fetch fails
        window.location.href = '/dashboard'
        return
      }
      const data = await res.json().catch(() => ({ ok: false, error: 'Unexpected server response' }))
      if (!res.ok || data?.ok === false) {
        setError(data?.error || 'Login failed')
        return
      }
      // If API returns JSON ok (non-redirect), resolve role via /api/dashboard and route
      const who = await fetch('/api/dashboard', { credentials: 'same-origin' })
      if (who.ok) {
        const info = await who.json().catch(() => null)
        const role = info?.user?.role
        window.location.href = role === 'ADMIN' ? '/admin/campaigns' : '/dashboard'
        return
      }
      window.location.href = '/dashboard'
    } catch (err) {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 relative overflow-hidden">
      {/* background glow */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(600px_300px_at_50%_-10%,rgba(239,68,68,0.25),transparent_60%)]" />
      <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12">
        {/* Glassmorphism card */}
        <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-6 shadow-[0_10px_50px_-10px_rgba(0,0,0,0.5)] backdrop-blur-md">
          <div className="mb-6 text-center">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-white/10">
              <Image src="/logos/spatial logo.jpg" alt="Spatial Collective" width={40} height={40} className="rounded-full object-cover" />
            </div>
            <h1 className="text-xl font-semibold tracking-tight">Digital Public Works Portal</h1>
            <p className="mt-1 text-sm text-neutral-300">Sign in to access your daily tasks.</p>
          </div>

          <form className="space-y-4" onSubmit={onSubmit}>
            <div>
              <label htmlFor="phone" className="mb-1 block text-sm font-medium">Phone Number</label>
              <input
                type="text"
                id="phone"
                name="phone"
                inputMode="tel"
                required
                placeholder="07XXXXXXXX"
                className="block w-full rounded-lg border border-white/10 bg-white/10 px-3 py-2 text-sm placeholder-neutral-400 outline-none transition focus:border-red-400 focus:ring-0"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
              {!phone.trim() && (
                <div className="mt-1 text-xs text-red-300">Phone number is required</div>
              )}
            </div>

            <div>
              <label htmlFor="settlementId" className="mb-1 block text-sm font-medium">Settlement</label>
              <Select
                value={selectedSettlement}
                onChange={(opt) => setSettlementId(opt?.value || '')}
                options={settlementOptions}
                placeholder="Select settlement"
              />
              {!settlementId.trim() && (
                <div className="mt-1 text-xs text-red-300">Settlement is required</div>
              )}
            </div>

            <button
              type="submit"
              className="mt-2 w-full rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-neutral-950"
              disabled={!formValid}
            >
              {loading ? 'Signing in…' : 'Sign In'}
            </button>

            {error && (
              <div className="rounded-md border border-red-400/30 bg-red-500/10 p-2 text-sm text-red-200">
                {error}
              </div>
            )}
          </form>
        </div>

        {loading && (
          <div className="fixed inset-0 z-50 grid place-items-center bg-neutral-950">
            {/* Animated gradient backdrop */}
            <div className="pointer-events-none absolute inset-0 opacity-60" style={{ background: 'radial-gradient(800px 400px at 50% -10%, rgba(239,68,68,0.25), transparent 60%), radial-gradient(600px 300px at 20% 110%, rgba(59,130,246,0.18), transparent 60%), radial-gradient(700px 350px at 80% 120%, rgba(34,197,94,0.18), transparent 60%)', filter: 'saturate(1.2)' }} />
            <div className="relative flex flex-col items-center">
              {/* Central orb */}
              <div className="relative h-40 w-40 sm:h-48 sm:w-48">
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-red-500 via-rose-400 to-orange-300 blur-[2px]" style={{ boxShadow: '0 0 80px 20px rgba(239,68,68,0.25)' }} />
                <div className="absolute inset-1 rounded-full bg-gradient-to-tr from-red-400/80 via-white/10 to-transparent backdrop-blur-[2px]" />
                {/* Rotating ring */}
                <div className="absolute inset-0 grid place-items-center">
                  <div className="h-[92%] w-[92%] rounded-full border-2 border-white/20 [animation:spin_3.5s_linear_infinite]" style={{ boxShadow: 'inset 0 0 30px rgba(255,255,255,0.1)' }} />
                </div>
                {/* Dots on the orbit */}
                <div className="absolute inset-0 grid place-items-center">
                  <div className="relative h-[92%] w-[92%]">
                    <span className="absolute -top-1 left-1/2 h-2 w-2 -translate-x-1/2 rounded-full bg-white/80 shadow-[0_0_10px_rgba(255,255,255,0.6)]" />
                    <span className="absolute top-1/2 -right-1 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-white/60 shadow-[0_0_8px_rgba(255,255,255,0.5)]" />
                  </div>
                </div>
              </div>
              <div className="mt-6 text-sm text-neutral-300">Signing you in…</div>
            </div>
            <style jsx>{`
              @keyframes spin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }
            `}</style>
          </div>
        )}

        {/* Footer */}
        <div className="mt-6 w-full max-w-3xl text-center px-4">
          <div className="text-sm text-neutral-300">Digital Public Works for Urban Resilience.</div>
        </div>
      </div>
    </div>
  )
}
