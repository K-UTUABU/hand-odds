// 検算表（docs/acceptance/kensan.md）を写したテスト。
// 期待値は依頼者が手計算で求めた値の写し。作り手は依頼者の許可なく変えない。
// 一致の基準は検算表の「書き方」のとおり、厳密な計算との差が 0.000001 未満。
import { expect, test } from 'vitest'
import { exact } from '@/calc/exact'
import type { Condition, DeckInput, Group, Pattern } from '@/calc/types'

const group = (id: string, count: number): Group => ({ id, name: id, count })
const pattern = (id: string, conditions: Record<string, Condition>): Pattern => ({ id, name: id, conditions })
const atLeastOne: Condition = { min: 1, max: null }

const cases: { no: number; input: DeckInput; pattern: number | 'any'; expected: number }[] = [
  // 1. A 4枚を 1枚以上引く
  {
    no: 1,
    input: { deckSize: 40, handSize: 5, groups: [group('A', 4)], patterns: [pattern('p1', { A: atLeastOne })] },
    pattern: 0,
    expected: 0.427071,
  },
  // 2. A 10枚を 1枚も引かない
  {
    no: 2,
    input: { deckSize: 40, handSize: 5, groups: [group('A', 10)], patterns: [pattern('p1', { A: { min: 0, max: 0 } })] },
    pattern: 0,
    expected: 0.216572,
  },
  // 3. A 4枚・B 4枚をどちらも 1枚以上引く
  {
    no: 3,
    input: {
      deckSize: 40, handSize: 5,
      groups: [group('A', 4), group('B', 4)],
      patterns: [pattern('p1', { A: atLeastOne, B: atLeastOne })],
    },
    pattern: 0,
    expected: 0.160180,
  },
  // 4. A・B・C 各 4枚をすべて 1枚以上引く
  {
    no: 4,
    input: {
      deckSize: 40, handSize: 5,
      groups: [group('A', 4), group('B', 4), group('C', 4)],
      patterns: [pattern('p1', { A: atLeastOne, B: atLeastOne, C: atLeastOne })],
    },
    pattern: 0,
    expected: 0.049969,
  },
  // 5. 「A と B」または「A と C」のどれか1つでも成立する
  {
    no: 5,
    input: {
      deckSize: 40, handSize: 5,
      groups: [group('A', 4), group('B', 4), group('C', 4)],
      patterns: [pattern('p1', { A: atLeastOne, B: atLeastOne }), pattern('p2', { A: atLeastOne, C: atLeastOne })],
    },
    pattern: 'any',
    expected: 0.270392,
  },
]

test.each(cases)('検算表 $no', ({ input, pattern, expected }) => {
  const result = exact(input)
  const actual = pattern === 'any' ? result.any : result.patterns[pattern]
  expect(Math.abs(actual - expected)).toBeLessThan(0.000001)
})
