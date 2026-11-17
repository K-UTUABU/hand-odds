import { expect, test } from 'vitest'
import { margin, withinMargin } from '@/calc/compare'

test('margin は標準誤差の3倍', () => {
  expect(margin(0.5, 100_000)).toBeCloseTo(3 * Math.sqrt(0.25 / 100_000), 12)
})
test('厳密な値が 0 か 1 のとき margin は 0 で、同じ値なら範囲内', () => {
  expect(margin(0, 100_000)).toBe(0)
  expect(withinMargin(1, 1, 100_000)).toBe(true)
  expect(withinMargin(0, 0.001, 100_000)).toBe(false)
})
