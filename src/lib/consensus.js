// Helper to compute truth using 70% threshold
// Input: counts { yes: number, no: number }
// Output: { truth: true|false|null, total: number, yesRatio: number, noRatio: number }
export function computeConsensus(counts) {
  const total = (counts?.yes || 0) + (counts?.no || 0)
  if (total === 0) return { truth: null, total, yesRatio: 0, noRatio: 0 }
  const yesRatio = (counts?.yes || 0) / total
  const noRatio = (counts?.no || 0) / total
  let truth = null
  if (yesRatio >= 0.7) truth = true
  else if (noRatio >= 0.7) truth = false
  return { truth, total, yesRatio, noRatio }
}
