import prisma from '@/lib/prisma'

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
    <div className="min-h-screen bg-neutral-50 text-neutral-900 dark:bg-neutral-900 dark:text-neutral-100">
      <div className="flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md rounded-xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-semibold">Sign in</h1>
            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
              Use your phone number and select a settlement
            </p>
          </div>

          <form className="space-y-4" action="/api/auth/login" method="post">
            <div>
              <label htmlFor="phone" className="mb-1 block text-sm font-medium">
                Phone Number
              </label>
              <input
                type="text"
                id="phone"
                name="phone"
                inputMode="tel"
                required
                placeholder="07XXXXXXXX"
                className="block w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-neutral-500 focus:ring-0 dark:border-neutral-700 dark:bg-neutral-900"
              />
            </div>

            <div>
              <label htmlFor="settlementId" className="mb-1 block text-sm font-medium">
                Settlement
              </label>
              <select
                id="settlementId"
                name="settlementId"
                required
                className="block w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-neutral-500 focus:ring-0 dark:border-neutral-700 dark:bg-neutral-900"
              >
                <option value="" disabled selected>
                  Select settlement
                </option>
                {settlements.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              className="mt-2 w-full rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-neutral-900"
            >
              Sign In
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
