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
        if (who.status === 409) {
          window.location.href = '/session-conflict'
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
      if (who.status === 409) {
        window.location.href = '/session-conflict'
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
  <div className={`w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-6 shadow-[0_10px_50px_-10px_rgba(0,0,0,0.5)] backdrop-blur-md transition-opacity ${loading ? 'opacity-30' : ''}`}>
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
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-950">
            {/* Mapping the Path: minimal SVG animation */}
            <div className="relative w-[360px] sm:w-[480px]">
              <svg viewBox="0 0 360 240" className="h-auto w-full" aria-label="Connecting data points animation" role="img">
                {/* Background dots: faint, semi-random positions */}
                <g fill="white" fillOpacity="0.12">
                  <circle cx="28" cy="30" r="2" className="dot" />
                  <circle cx="90" cy="18" r="1.5" className="dot" />
                  <circle cx="150" cy="34" r="1.8" className="dot delay-1" />
                  <circle cx="210" cy="26" r="1.6" className="dot" />
                  <circle cx="300" cy="40" r="2" className="dot delay-2" />
                  <circle cx="40" cy="90" r="2" className="dot" />
                  <circle cx="110" cy="110" r="1.6" className="dot delay-3" />
                  <circle cx="180" cy="80" r="1.8" className="dot" />
                  <circle cx="250" cy="100" r="1.6" className="dot delay-2" />
                  <circle cx="320" cy="88" r="2" className="dot" />
                  <circle cx="70" cy="160" r="2" className="dot delay-1" />
                  <circle cx="140" cy="170" r="1.8" className="dot" />
                  <circle cx="200" cy="150" r="1.6" className="dot delay-3" />
                  <circle cx="270" cy="170" r="2" className="dot" />
                  <circle cx="330" cy="200" r="1.8" className="dot delay-2" />
                  <circle cx="40" cy="210" r="1.6" className="dot" />
                </g>

                {/* Guide path for motion (invisible) */}
                <path id="guide" d="M 40 190 C 100 120, 160 210, 220 140 S 330 60, 300 50" fill="none" stroke="none" pathLength="100" />
                {/* Visible trace path with glow trail */}
                <path id="trace-path" d="M 40 190 C 100 120, 160 210, 220 140 S 330 60, 300 50" fill="none" stroke="rgba(255,255,255,0.65)" strokeWidth="2.5" strokeLinecap="round" pathLength="100" className="trace" />

                {/* Tracer pulse moving along the path */}
                <g>
                  <circle r="4" fill="#fff" filter="url(#glow)">
                    <animateMotion dur="2.8s" repeatCount="indefinite">
                      <mpath href="#guide" />
                    </animateMotion>
                  </circle>
                </g>

                {/* Soft glow filter */}
                <defs>
                  <filter id="glow">
                    <feGaussianBlur stdDeviation="2.2" result="coloredBlur" />
                    <feMerge>
                      <feMergeNode in="coloredBlur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>
              </svg>
              <div className="mt-4 text-center text-sm text-neutral-300">Signing you in…</div>
            </div>
            <style jsx>{`
              /* Draw the path as a gentle loop */
              .trace {
                stroke-dasharray: 100 100;
                animation: draw 2.8s ease-in-out infinite;
              }
              @keyframes draw {
                0% { stroke-dashoffset: 100; opacity: 0.7; }
                30% { opacity: 1; }
                70% { opacity: 1; }
                100% { stroke-dashoffset: 0; opacity: 0.8; }
              }
              /* Subtle random dot glow */
              .dot { animation: dotGlow 2.4s ease-in-out infinite alternate; }
              .delay-1 { animation-delay: .4s }
              .delay-2 { animation-delay: .9s }
              .delay-3 { animation-delay: 1.3s }
              @keyframes dotGlow {
                from { opacity: 0.12; }
                to { opacity: 0.28; }
              }
              @media (prefers-reduced-motion: reduce) {
                .trace, .dot { animation: none !important; }
              }
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
