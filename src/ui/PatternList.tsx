import { LIMITS } from '@/calc/types'
import type { Condition, DeckInput, InputError } from '@/calc/types'
import { displayName, type Action } from '@/state/deckReducer'
import { FieldErrors, NumberInput } from '@/ui/fields'

type Props = { state: DeckInput; errors: InputError[]; dispatch: React.Dispatch<Action> }

/** 条件が未設定のグループは、条件なし（0 枚以上・上限なし）として表示する */
const NO_CONDITION: Condition = { min: 0, max: null }

export default function PatternList({ state, errors, dispatch }: Props) {
  const { groups, patterns } = state
  return (
    <section>
      <div className="flex items-center justify-between">
        <h2 className="font-bold">パターン</h2>
        <button type="button" disabled={patterns.length >= LIMITS.patternMax}
          onClick={() => dispatch({ type: 'addPattern' })}
          className="rounded border px-2 py-1 disabled:opacity-40">パターンを追加</button>
      </div>
      {patterns.map((p, i) => {
        const pName = displayName(p, i, 'パターン')
        return (
          <div key={p.id} className="mt-2 rounded border p-2">
            <div className="flex flex-wrap items-center gap-2">
              <input type="text" aria-label={`パターン${i + 1}の名前`} placeholder={`パターン${i + 1}`}
                value={p.name} onChange={e => dispatch({ type: 'renamePattern', id: p.id, name: e.target.value })}
                className="w-40 rounded border border-gray-400 px-1 py-0.5" />
              <button type="button" aria-label={`${pName}を削除`} disabled={patterns.length <= 1}
                onClick={() => dispatch({ type: 'removePattern', id: p.id })}
                className="rounded border px-2 py-0.5 disabled:opacity-40">削除</button>
            </div>
            {groups.map((g, j) => {
              const gName = displayName(g, j, 'グループ')
              const field = `pattern:${p.id}:${g.id}`
              const c = p.conditions[g.id] ?? NO_CONDITION
              const set = (condition: Condition) =>
                dispatch({ type: 'setCondition', patternId: p.id, groupId: g.id, condition })
              return (
                <div key={g.id} className="flex flex-wrap items-center gap-1 py-1">
                  <span className="mr-1 w-24 truncate">{gName}</span>
                  <NumberInput label={`${pName}：${gName}の最小`} value={c.min} errors={errors} field={field}
                    onChange={min => set({ ...c, min })} />
                  枚以上
                  <NumberInput label={`${pName}：${gName}の最大`} value={c.max} errors={errors} field={field}
                    onChange={v => set({ ...c, max: Number.isNaN(v) ? null : v })} />
                  枚以下
                  <FieldErrors errors={errors} field={field} />
                </div>
              )
            })}
          </div>
        )
      })}
    </section>
  )
}
