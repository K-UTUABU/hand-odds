import { expect, test } from 'vitest'
import type { DeckInput } from '@/calc/types'
import { validate } from '@/calc/validate'

const base: DeckInput = {
  deckSize: 40, handSize: 5,
  groups: [{ id: 'g1', name: '初動', count: 9 }],
  patterns: [{ id: 'p1', name: '', conditions: { g1: { min: 1, max: null } } }],
}

test('正しい入力は誤りなし', () => { expect(validate(base)).toEqual([]) })

test.each([
  [{ deckSize: 0 }, 'deckSize'], [{ deckSize: 101 }, 'deckSize'],
  [{ deckSize: NaN }, 'deckSize'], [{ deckSize: 40.5 }, 'deckSize'],
  [{ handSize: 0 }, 'handSize'], [{ handSize: 11 }, 'handSize'], [{ handSize: NaN }, 'handSize'],
])('範囲外・空・小数は誤り：%o', (patch, field) => {
  expect(validate({ ...base, ...patch }).map(e => e.field)).toContain(field)
})

test('引く枚数がデッキ枚数より多い', () => {
  expect(validate({ ...base, deckSize: 4 })).toContainEqual(
    { field: 'handSize', message: '引く枚数はデッキ枚数以下にしてください' })
})

test('グループの合計がデッキ枚数を超える', () => {
  const groups = [{ id: 'g1', name: '', count: 30 }, { id: 'g2', name: '', count: 11 }]
  expect(validate({ ...base, groups })).toContainEqual(
    { field: 'groups', message: 'グループの合計（41枚）がデッキ枚数を超えています' })
})

test('グループの合計がデッキ枚数ちょうどは誤りではない', () => {
  expect(validate({ ...base, groups: [{ id: 'g1', name: '', count: 40 }] })).toEqual([])
})

test.each([-1, 1.5, NaN])('グループの枚数 %s は誤り', (count) => {
  expect(validate({ ...base, groups: [{ id: 'g1', name: '', count }] }).map(e => e.field)).toContain('group:g1')
})

test('最小が最大より大きい', () => {
  const patterns = [{ id: 'p1', name: '', conditions: { g1: { min: 3, max: 2 } } }]
  expect(validate({ ...base, patterns })).toContainEqual(
    { field: 'pattern:p1:g1', message: '「以上」は「以下」より大きくできません' })
})

test('成立しえない条件は誤りではない', () => {
  const patterns = [{ id: 'p1', name: '', conditions: { g1: { min: 10, max: null } } }]
  expect(validate({ ...base, patterns })).toEqual([])
})

test('条件の最小が負・小数・NaN は誤り', () => {
  for (const min of [-1, 1.5, NaN]) {
    const patterns = [{ id: 'p1', name: '', conditions: { g1: { min, max: null } } }]
    expect(validate({ ...base, patterns })).toContainEqual(
      { field: 'pattern:p1:g1', message: '条件は 0 以上の整数で入力してください' })
  }
})

test('存在しないグループの条件は無視する', () => {
  const patterns = [{ id: 'p1', name: '', conditions: { gone: { min: -1, max: null } } }]
  expect(validate({ ...base, patterns })).toEqual([])
})

test('デッキ枚数が不正でも他の誤りは返し、デッキ枚数との比較はしない', () => {
  const errors = validate({ ...base, deckSize: NaN, handSize: 0 })
  expect(errors.map(e => e.field)).toEqual(['deckSize', 'handSize'])
})
