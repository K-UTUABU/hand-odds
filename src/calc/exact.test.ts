import { expect, test } from 'vitest'
import { exact } from '@/calc/exact'
import type { Group, Pattern } from '@/calc/types'

const group = (id: string, count: number): Group => ({ id, name: '', count })
const pattern = (id: string, conditions: Pattern['conditions']): Pattern => ({ id, name: '', conditions })

test('条件なしのパターンは確率 1（全内訳の合計が 1）', () => {
  const input = { deckSize: 40, handSize: 5, groups: [group('a', 9), group('b', 6)], patterns: [pattern('p', {})] }
  expect(exact(input).patterns[0]).toBe(1)
})

test('成立しえない条件は 0', () => {
  const input = { deckSize: 40, handSize: 5, groups: [group('a', 4)],
    patterns: [pattern('p', { a: { min: 5, max: null } })] }
  expect(exact(input)).toEqual({ patterns: [0], any: 0 })
})

test('「1枚以上」と「0枚」は足して 1', () => {
  const groups = [group('a', 9)]
  const r = exact({ deckSize: 40, handSize: 5, groups, patterns: [
    pattern('p1', { a: { min: 1, max: null } }), pattern('p2', { a: { min: 0, max: 0 } })] })
  expect(r.patterns[0] + r.patterns[1]).toBeCloseTo(1, 9)
  expect(r.any).toBe(1)
})

test('重なるパターンの any は、足し合わせより小さく、どちらよりも小さくない', () => {
  const groups = [group('a', 9), group('b', 6), group('c', 6)]
  const r = exact({ deckSize: 40, handSize: 5, groups, patterns: [
    pattern('p1', { a: { min: 1, max: null }, b: { min: 1, max: null } }),
    pattern('p2', { a: { min: 1, max: null }, c: { min: 1, max: null } })] })
  expect(r.any).toBeLessThan(r.patterns[0] + r.patterns[1])
  expect(r.any).toBeGreaterThanOrEqual(Math.max(...r.patterns))
})

test('同じパターンを2つ並べても any は変わらない', () => {
  const groups = [group('a', 9)]
  const p = { a: { min: 1, max: null } }
  const r = exact({ deckSize: 40, handSize: 5, groups, patterns: [pattern('p1', p), pattern('p2', p)] })
  expect(r.any).toBe(r.patterns[0])
})

test('その他が 0 枚でも計算できる', () => {
  const input = { deckSize: 10, handSize: 5, groups: [group('a', 4), group('b', 6)],
    patterns: [pattern('p', { a: { min: 0, max: 0 } })] }
  // C(6,5) / C(10,5) = 6 / 252
  expect(exact(input).patterns[0]).toBeCloseTo(6 / 252, 12)
})

test('デッキを全部引くと、枚数どおりになる', () => {
  const input = { deckSize: 10, handSize: 10, groups: [group('a', 4)],
    patterns: [pattern('p1', { a: { min: 4, max: 4 } }), pattern('p2', { a: { min: 0, max: 3 } })] }
  expect(exact(input).patterns).toEqual([1, 0])
})

test('グループにないキーの条件は無視される', () => {
  const input = { deckSize: 10, handSize: 5, groups: [group('a', 4)],
    patterns: [pattern('p', { gone: { min: 9, max: 9 } })] }
  expect(exact(input).patterns[0]).toBe(1)
})

test('max を指定すると、ちょうどその枚数になる', () => {
  const input = { deckSize: 10, handSize: 5, groups: [group('a', 4)],
    patterns: [pattern('p', { a: { min: 1, max: 1 } })] }
  // C(4,1)·C(6,4) / C(10,5) = 60 / 252
  expect(exact(input).patterns[0]).toBeCloseTo(60 / 252, 12)
})

test('上限いっぱいの入力でも 1 秒以内で、合計が 1', () => {
  const groups = Array.from({ length: 10 }, (_, i) => group(`g${i}`, 9))
  const patterns = [pattern('all', {}),
    ...Array.from({ length: 5 }, (_, i) => pattern(`p${i}`, { [`g${i}`]: { min: 1, max: null } }))]
  const start = performance.now()
  const r = exact({ deckSize: 100, handSize: 10, groups, patterns })
  expect(performance.now() - start).toBeLessThan(1000)
  expect(r.patterns[0]).toBe(1)
})
