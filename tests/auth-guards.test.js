import { describe, it, expect } from 'vitest'
import { isAdminSession, shouldRedirectFromAdmin } from '../src/lib/auth-guards.js'

describe('auth guards', () => {
  it('allows admin sessions', () => {
    const s = { id: 'u1', role: 'ADMIN' }
    expect(isAdminSession(s)).toBe(true)
    expect(shouldRedirectFromAdmin(s)).toBe(false)
  })
  it('rejects worker sessions for admin routes', () => {
    const s = { id: 'u2', role: 'WORKER' }
    expect(isAdminSession(s)).toBe(false)
    expect(shouldRedirectFromAdmin(s)).toBe(true)
  })
  it('rejects missing sessions for admin routes', () => {
    const s = null
    expect(isAdminSession(s)).toBe(false)
    expect(shouldRedirectFromAdmin(s)).toBe(true)
  })
})
