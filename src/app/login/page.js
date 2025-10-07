import prisma from '@/lib/prisma'
import Image from 'next/image'

export const dynamic = 'force-dynamic'

async function getSettlements() {
  try {
    const settlements = await prisma.settlement.findMany({
      orderBy: { name: 'asc' },
      select: { id: true, name: true },
    })
    return settlements
  } catch (e) {
    return []
  }
}

export default async function LoginPage() {
  const settlements = await getSettlements()

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

          <form className="space-y-4" action="/api/auth/login" method="post">
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
              />
            </div>

            <div>
              <label htmlFor="settlementId" className="mb-1 block text-sm font-medium">Settlement</label>
              <select
                id="settlementId"
                name="settlementId"
                required
                className="block w-full rounded-lg border border-white/10 bg-white/10 px-3 py-2 text-sm outline-none transition focus:border-red-400 focus:ring-0"
                defaultValue=""
              >
                <option value="" disabled>
                  Select settlement
                </option>
                {settlements.map((s) => (
                  <option key={s.id} value={s.id} className="bg-neutral-900">
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              className="mt-2 w-full rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-neutral-950"
            >
              Sign In
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="mt-8 w-full max-w-3xl text-center">
          <div className="text-sm text-neutral-300">Digital Public Works for Urban Resilience.</div>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-5 opacity-90">
            <Image src="/logos/spatial logo.jpg" alt="Spatial Collective" width={36} height={36} className="rounded object-cover" />
            <Image src="/logos/World Bank.jpg" alt="World Bank" width={80} height={30} className="object-contain" />
            <Image src="/logos/EU Logo.jpg" alt="EU" width={60} height={40} className="object-contain" />
            <Image src="/logos/GoK Coat of Arms.png" alt="Govt of Kenya" width={40} height={40} className="object-contain" />
            <Image src="/logos/KISIP-LOGO.png" alt="KISIP" width={70} height={30} className="object-contain" />
            <Image src="/logos/AFD logo.png" alt="AFD" width={60} height={30} className="object-contain" />
          </div>
        </div>
      </div>
    </div>
  )
}
