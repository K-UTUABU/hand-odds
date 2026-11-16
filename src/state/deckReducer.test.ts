import { expect, test } from 'vitest'
import { deckReducer, displayName, initialState } from '@/state/deckReducer'

test('初期状態', () => {
  expect(initialState).toMatchObject({ deckSize: 40, handSize: 5 })
  expect(initialState.groups).toHaveLength(1)
  expect(initialState.patterns).toHaveLength(1)
})
test('グループは 10 個まで', () => {
  let s = initialState
  for (let i = 0; i < 20; i++) s = deckReducer(s, { type: 'addGroup' })
  expect(s.groups).toHaveLength(10)
})
test('パターンは 6 個まで', () => {
  let s = initialState
  for (let i = 0; i < 20; i++) s = deckReducer(s, { type: 'addPattern' })
  expect(s.patterns).toHaveLength(6)
})
test('グループを削除すると、全パターンからその条件が消える', () => {
  let s = deckReducer(initialState, { type: 'addGroup' })
  const [g1, g2] = s.groups
  const p = s.patterns[0]
  s = deckReducer(s, { type: 'setCondition', patternId: p.id, groupId: g2.id, condition: { min: 1, max: null } })
  s = deckReducer(s, { type: 'removeGroup', id: g2.id })
  expect(s.groups.map(g => g.id)).toEqual([g1.id])
  expect(s.patterns[0].conditions).not.toHaveProperty(g2.id)
})
test('最後のグループ・最後のパターンは削除されない', () => {
  const s1 = deckReducer(initialState, { type: 'removeGroup', id: initialState.groups[0].id })
  const s2 = deckReducer(initialState, { type: 'removePattern', id: initialState.patterns[0].id })
  expect(s1.groups).toHaveLength(1)
  expect(s2.patterns).toHaveLength(1)
})
test('名前が空なら番号つきの名前', () => {
  expect(displayName({ name: '' }, 0, 'グループ')).toBe('グループ1')
  expect(displayName({ name: '初動' }, 0, 'グループ')).toBe('初動')
})
test('新しいグループ・パターンは空の名前、0枚、条件なし', () => {
  const s = deckReducer(deckReducer(initialState, { type: 'addGroup' }), { type: 'addPattern' })
  expect(s.groups[1]).toMatchObject({ name: '', count: 0 })
  expect(s.patterns[1]).toMatchObject({ name: '', conditions: {} })
})
test('updateGroup は名前と枚数を更新する（NaN も保持）', () => {
  const id = initialState.groups[0].id
  const s = deckReducer(initialState, { type: 'updateGroup', id, patch: { name: '初動', count: 9 } })
  expect(s.groups[0]).toEqual({ id, name: '初動', count: 9 })
  const s2 = deckReducer(s, { type: 'updateGroup', id, patch: { count: NaN } })
  expect(s2.groups[0].count).toBeNaN()
  expect(s2.groups[0].name).toBe('初動')
})
test('renamePattern はパターン名を変える', () => {
  const id = initialState.patterns[0].id
  expect(deckReducer(initialState, { type: 'renamePattern', id, name: '先攻' }).patterns[0].name).toBe('先攻')
})
test('setDeckSize / setHandSize', () => {
  let s = deckReducer(initialState, { type: 'setDeckSize', value: 60 })
  s = deckReducer(s, { type: 'setHandSize', value: NaN })
  expect(s.deckSize).toBe(60)
  expect(s.handSize).toBeNaN()
})
test('setCondition: 未知の id は状態を変えない', () => {
  const p = initialState.patterns[0].id
  const g = initialState.groups[0].id
  const c = { min: 1, max: null }
  expect(deckReducer(initialState, { type: 'setCondition', patternId: 'x', groupId: g, condition: c })).toBe(initialState)
  expect(deckReducer(initialState, { type: 'setCondition', patternId: p, groupId: 'x', condition: c })).toBe(initialState)
})
test('未知の id の更新・削除は状態を変えない', () => {
  const s = deckReducer(initialState, { type: 'addGroup' })
  expect(deckReducer(s, { type: 'updateGroup', id: 'x', patch: { count: 3 } })).toBe(s)
  expect(deckReducer(s, { type: 'renamePattern', id: 'x', name: 'a' })).toBe(s)
  expect(deckReducer(s, { type: 'removeGroup', id: 'x' })).toBe(s)
  expect(deckReducer(s, { type: 'removePattern', id: 'x' })).toBe(s)
})
test('前の状態を書き換えない', () => {
  let s = deckReducer(initialState, { type: 'addGroup' })
  s = deckReducer(s, { type: 'addPattern' })
  const [g1, g2] = s.groups
  s = deckReducer(s, { type: 'setCondition', patternId: s.patterns[0].id, groupId: g2.id, condition: { min: 1, max: 2 } })
  const frozen = structuredClone(s)
  const actions = [
    { type: 'setDeckSize', value: 50 }, { type: 'setHandSize', value: 6 },
    { type: 'addGroup' }, { type: 'removeGroup', id: g2.id },
    { type: 'updateGroup', id: g1.id, patch: { count: 7, name: 'a' } },
    { type: 'addPattern' }, { type: 'removePattern', id: s.patterns[1].id },
    { type: 'renamePattern', id: s.patterns[0].id, name: 'b' },
    { type: 'setCondition', patternId: s.patterns[0].id, groupId: g1.id, condition: { min: 0, max: 1 } },
  ] as const
  for (const a of actions) deckReducer(s, a)
  expect(s).toEqual(frozen)
})
