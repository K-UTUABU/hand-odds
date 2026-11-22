import { LIMITS } from '@/calc/types'
import type { Condition, DeckInput, Group, Pattern } from '@/calc/types'

export type Action =
  | { type: 'setDeckSize'; value: number }
  | { type: 'setHandSize'; value: number }
  | { type: 'addGroup' }
  | { type: 'removeGroup'; id: string }
  | { type: 'updateGroup'; id: string; patch: Partial<Pick<Group, 'name' | 'count'>> }
  | { type: 'addPattern' }
  | { type: 'removePattern'; id: string }
  | { type: 'renamePattern'; id: string; name: string }
  | { type: 'setCondition'; patternId: string; groupId: string; condition: Condition }

const newGroup = (): Group => ({ id: crypto.randomUUID(), name: '', count: 0 })
const newPattern = (): Pattern => ({ id: crypto.randomUUID(), name: '', conditions: {} })

export const initialState: DeckInput = {
  deckSize: 40, handSize: 5, groups: [newGroup()], patterns: [newPattern()],
}

/** 名前が空なら「グループ1」のような表示名を返す */
export function displayName(item: { name: string }, index: number, kind: 'グループ' | 'パターン'): string {
  return item.name.trim() === '' ? `${kind}${index + 1}` : item.name
}

/** 状態は検査前の入力をそのまま持つ。値の検査はしない（validate の仕事） */
export function deckReducer(state: DeckInput, action: Action): DeckInput {
  switch (action.type) {
    case 'setDeckSize':
      return { ...state, deckSize: action.value }
    case 'setHandSize':
      return { ...state, handSize: action.value }
    case 'addGroup':
      return state.groups.length >= LIMITS.groupMax
        ? state : { ...state, groups: [...state.groups, newGroup()] }
    case 'removeGroup': {
      if (state.groups.length <= 1 || !state.groups.some(g => g.id === action.id)) return state
      return {
        ...state,
        groups: state.groups.filter(g => g.id !== action.id),
        // 削除したグループへの条件を、全パターンから取り除く
        patterns: state.patterns.map(p => {
          const { [action.id]: _removed, ...conditions } = p.conditions
          return { ...p, conditions }
        }),
      }
    }
    case 'updateGroup':
      if (!state.groups.some(g => g.id === action.id)) return state
      return { ...state, groups: state.groups.map(g => (g.id === action.id ? { ...g, ...action.patch } : g)) }
    case 'addPattern':
      return state.patterns.length >= LIMITS.patternMax
        ? state : { ...state, patterns: [...state.patterns, newPattern()] }
    case 'removePattern':
      if (state.patterns.length <= 1 || !state.patterns.some(p => p.id === action.id)) return state
      return { ...state, patterns: state.patterns.filter(p => p.id !== action.id) }
    case 'renamePattern':
      if (!state.patterns.some(p => p.id === action.id)) return state
      return { ...state, patterns: state.patterns.map(p => (p.id === action.id ? { ...p, name: action.name } : p)) }
    case 'setCondition': {
      if (!state.groups.some(g => g.id === action.groupId)) return state
      if (!state.patterns.some(p => p.id === action.patternId)) return state
      return {
        ...state,
        patterns: state.patterns.map(p => p.id === action.patternId
          ? { ...p, conditions: { ...p.conditions, [action.groupId]: action.condition } } : p),
      }
    }
  }
}
