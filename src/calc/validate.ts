import { LIMITS, type DeckInput, type InputError } from '@/calc/types'

const isInt = (n: number) => Number.isInteger(n) // NaN は false になる
const isCount = (n: number) => isInt(n) && n >= 0

/** 入力の誤りを返す。誤りがなければ空の配列。成立しえない条件は誤りにしない */
export function validate(input: DeckInput): InputError[] {
  const errors: InputError[] = []
  const { deckSize, handSize, groups, patterns } = input

  const deckOk = isInt(deckSize) && deckSize >= 1 && deckSize <= LIMITS.deckMax
  if (!deckOk) {
    errors.push({ field: 'deckSize', message: `デッキ枚数は 1〜${LIMITS.deckMax} の整数で入力してください` })
  }

  const handOk = isInt(handSize) && handSize >= 1 && handSize <= LIMITS.handMax
  if (!handOk) {
    errors.push({ field: 'handSize', message: `引く枚数は 1〜${LIMITS.handMax} の整数で入力してください` })
  } else if (deckOk && handSize > deckSize) {
    errors.push({ field: 'handSize', message: '引く枚数はデッキ枚数以下にしてください' })
  }

  let total = 0
  let countsOk = true
  for (const g of groups) {
    if (isCount(g.count)) {
      total += g.count
    } else {
      countsOk = false
      errors.push({ field: `group:${g.id}`, message: '枚数は 0 以上の整数で入力してください' })
    }
  }
  if (deckOk && countsOk && total > deckSize) {
    errors.push({ field: 'groups', message: `グループの合計（${total}枚）がデッキ枚数を超えています` })
  }

  for (const p of patterns) {
    for (const g of groups) {
      const c = p.conditions[g.id] // 存在しないグループのキーは見ない
      if (!c) continue
      const field = `pattern:${p.id}:${g.id}`
      const maxOk = c.max === null || isCount(c.max)
      if (!isCount(c.min) || !maxOk) {
        errors.push({ field, message: '条件は 0 以上の整数で入力してください' })
      } else if (c.max !== null && c.min > c.max) {
        errors.push({ field, message: '「以上」は「以下」より大きくできません' })
      }
    }
  }
  return errors
}
