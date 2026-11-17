/** 厳密な値 p に対する、試行 trials 回の割合の許容幅（標準誤差の3倍） */
export function margin(p: number, trials: number): number {
  return 3 * Math.sqrt(p * (1 - p) / trials)
}

export function withinMargin(exactValue: number, simulated: number, trials: number): boolean {
  return Math.abs(exactValue - simulated) <= margin(exactValue, trials) + 1e-12
}
