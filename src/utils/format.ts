/**
 * Formats a confidence score for display as a whole-number percentage.
 * Accepts either a 0–1 fraction (0.95) or an already-scaled 0–100 number (95)
 * and never double-multiplies a value that's already a percentage.
 *
 *   0.95  -> "95%"
 *   0.87  -> "87%"
 *   0.756 -> "76%"
 *   0.5   -> "50%"
 *   95    -> "95%"
 *   87    -> "87%"
 */
export function formatConfidence(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) return '—'
  const pct = value <= 1 ? value * 100 : value
  const clamped = Math.max(0, Math.min(100, pct))
  return `${Math.round(clamped)}%`
}
