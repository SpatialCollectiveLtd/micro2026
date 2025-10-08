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

        {/* Footer */}
        <div className="mt-6 w-full max-w-3xl text-center px-4">
          <div className="text-sm text-neutral-300">Digital Public Works for Urban Resilience.</div>
          <div className="mx-auto mt-3 w-full max-w-xl rounded-xl border border-white/30 bg-white/90 p-2 shadow-[0_6px_24px_-12px_rgba(0,0,0,0.35)] backdrop-blur-md backdrop-saturate-150">
            <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
              <Image src="/logos/World Bank.jpg" alt="World Bank" width={72} height={26} className="object-contain" sizes="(max-width: 640px) 60px, 72px" />
              <Image src="/logos/EU Logo.jpg" alt="EU" width={56} height={36} className="object-contain" sizes="(max-width: 640px) 48px, 56px" />
              <Image src="/logos/GoK Coat of Arms.png" alt="Govt of Kenya" width={40} height={40} className="object-contain" sizes="(max-width: 640px) 36px, 40px" />
              <Image src="/logos/KISIP-LOGO.png" alt="KISIP" width={66} height={26} className="object-contain" sizes="(max-width: 640px) 56px, 66px" />
              <Image src="/logos/AFD logo.png" alt="AFD" width={60} height={26} className="object-contain" sizes="(max-width: 640px) 52px, 60px" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
