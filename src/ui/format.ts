/** 確率（0〜1）を百分率で小数第2位まで。-0 は 0.00% */
export function formatPercent(p: number): string {
  return `${(p * 100 + 0).toFixed(2)}%`
}
