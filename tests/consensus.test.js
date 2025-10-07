import { describe, it, expect } from 'vitest'
import { computeConsensus } from '../src/lib/consensus.js'

describe('computeConsensus', () => {
  it('returns true when yes >= 70%', () => {
    const { truth } = computeConsensus({ yes: 7, no: 3 })
    expect(truth).toBe(true)
  })
  it('returns false when no >= 70%', () => {
    const { truth } = computeConsensus({ yes: 2, no: 8 })
    expect(truth).toBe(false)
  })
  it('returns null when neither reaches 70%', () => {
    const { truth } = computeConsensus({ yes: 6, no: 4 })
    expect(truth).toBe(null)
  })
  it('returns null when total is 0', () => {
    const { truth } = computeConsensus({ yes: 0, no: 0 })
    expect(truth).toBe(null)
  })
})
