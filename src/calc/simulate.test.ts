import { expect, test } from 'vitest'
import { exact } from '@/calc/exact'
import { margin } from '@/calc/compare'
import { simulate } from '@/calc/simulate'
import type { DeckInput } from '@/calc/types'

const g = (id: string, count: number) => ({ id, name: id, count })
const p = (id: string, conditions: DeckInput['patterns'][number]['conditions']) => ({ id, name: id, conditions })

const inputs: DeckInput[] = [
  // 1グループ
  { deckSize: 40, handSize: 5, groups: [g('a', 8)], patterns: [p('p1', { a: { min: 1, max: null } })] },
  // 3グループの AND
  { deckSize: 40, handSize: 6, groups: [g('a', 6), g('b', 5), g('c', 4)],
    patterns: [p('p1', { a: { min: 1, max: null }, b: { min: 1, max: 2 }, c: { min: 1, max: null } })] },
  // 重なる2パターン
  { deckSize: 30, handSize: 5, groups: [g('a', 6), g('b', 6)],
    patterns: [p('p1', { a: { min: 1, max: null } }), p('p2', { a: { min: 1, max: null }, b: { min: 1, max: null } })] },
  // その他 0 枚
  { deckSize: 20, handSize: 5, groups: [g('a', 12), g('b', 8)],
    patterns: [p('p1', { a: { min: 2, max: 3 } }), p('p2', { b: { min: 3, max: null } })] },
]

test('同じ種なら同じ結果', () => {
  expect(simulate(inputs[0], { trials: 10_000, seed: 1 })).toEqual(simulate(inputs[0], { trials: 10_000, seed: 1 }))
})
test('種が違えば結果が変わる', () => {
  expect(simulate(inputs[0], { trials: 10_000, seed: 1 })).not.toEqual(simulate(inputs[0], { trials: 10_000, seed: 2 }))
})
test.each(inputs.flatMap((input, i) => [1, 2, 3].map(seed => ({ i, input, seed }))))(
  '入力 $i・種 $seed：厳密な計算と誤差の範囲で一致', ({ input, seed }) => {
    const e = exact(input)
    const s = simulate(input, { trials: 100_000, seed })
    // テストでは標準誤差の4倍まで許す（3倍だと、正しくても数百回に1回は外れるため）
    const ok = (a: number, b: number) => Math.abs(a - b) <= (4 / 3) * margin(a, 100_000) + 1e-12
    e.patterns.forEach((v, j) => expect(ok(v, s.patterns[j])).toBe(true))
    expect(ok(e.any, s.any)).toBe(true)
  })
test('成立しえない条件は 0 ちょうど、条件なしは 1 ちょうど', () => {
  const input: DeckInput = { deckSize: 40, handSize: 5, groups: [g('a', 4)], patterns: [
    p('p1', { a: { min: 5, max: null } }), p('p2', {})] }
  expect(simulate(input, { trials: 1_000, seed: 1 }).patterns).toEqual([0, 1])
})
