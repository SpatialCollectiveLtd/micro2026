import prisma from '@/lib/prisma'

function badRequest(message) {
  return Response.json({ ok: false, error: message }, { status: 400 })
}

export async function POST(request) {
  let phone, settlementId
  const contentType = request.headers.get('content-type') || ''

  try {
    if (contentType.includes('application/json')) {
      const body = await request.json()
      phone = (body.phone || '').trim()
      settlementId = (body.settlementId || '').trim()
    } else {
      const form = await request.formData()
      phone = (form.get('phone') || '').toString().trim()
      settlementId = (form.get('settlementId') || '').toString().trim()
    }
  } catch (e) {
    return badRequest('Invalid request body')
  }

  if (!phone) return badRequest('Phone is required')
  if (!settlementId) return badRequest('Settlement is required')

  try {
    const user = await prisma.user.findFirst({
      where: {
        phone,
        OR: [
          { settlementId }, // worker login
          { role: 'ADMIN', settlementId: null }, // admin can login without settlement
        ],
      },
      select: { id: true, role: true, settlementId: true },
    })

    if (!user) {
      return Response.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
    }

    // Minimal session cookie (signed sessions recommended later)
    const cookieValue = Buffer.from(
      JSON.stringify({ id: user.id, role: user.role, sid: crypto.randomUUID() })
    ).toString('base64')

    const headers = new Headers({ 'content-type': 'application/json' })
    headers.append(
      'set-cookie',
      `mt_session=${cookieValue}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${60 * 60 * 24 * 7}` // 7 days
    )

    return new Response(JSON.stringify({ ok: true }), { status: 200, headers })
  } catch (e) {
    return Response.json({ ok: false, error: 'Server error' }, { status: 500 })
  }
}
