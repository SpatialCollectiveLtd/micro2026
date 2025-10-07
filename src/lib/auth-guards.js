export function isAdminSession(session) {
  return !!session && session.role === 'ADMIN'
}

export function shouldRedirectFromAdmin(session) {
  // Redirect when not admin
  return !isAdminSession(session)
}
