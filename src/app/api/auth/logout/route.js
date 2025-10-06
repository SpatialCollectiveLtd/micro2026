export async function POST() {
  const headers = new Headers()
  headers.append('set-cookie', 'mt_session=; Path=/; HttpOnly; Max-Age=0; SameSite=Lax')
  headers.append('location', '/login')
  return new Response(null, { status: 302, headers })
}
