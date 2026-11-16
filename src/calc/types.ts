export const LIMITS = {
  deckMax: 100, handMax: 10, groupMax: 10, patternMax: 6, trials: 100_000,
} as const

export type Group = { id: string; name: string; count: number }
/** max が null のときは上限なし */
export type Condition = { min: number; max: number | null }
/** conditions のキーは Group.id。キーがないグループは条件なし（min 0, max null）として扱う */
export type Pattern = { id: string; name: string; conditions: Record<string, Condition> }
export type DeckInput = { deckSize: number; handSize: number; groups: Group[]; patterns: Pattern[] }

/** patterns[i] は DeckInput.patterns[i] の成立確率（0〜1）。any は「どれか1つでも成立」 */
export type Probabilities = { patterns: number[]; any: number }

/** field の例：'deckSize' / 'handSize' / 'groups' / `group:${id}` / `pattern:${patternId}:${groupId}` */
export type InputError = { field: string; message: string }
