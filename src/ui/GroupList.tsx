import { LIMITS } from '@/calc/types'
import type { DeckInput, InputError } from '@/calc/types'
import { displayName, type Action } from '@/state/deckReducer'
import { FieldErrors, NumberInput } from '@/ui/fields'

type Props = { state: DeckInput; errors: InputError[]; dispatch: React.Dispatch<Action> }

export default function GroupList({ state, errors, dispatch }: Props) {
  const { groups, deckSize } = state
  // デッキ枚数・各枚数・合計がすべて正しいときだけ、その他の枚数を出す
  const showOther = !errors.some(e => e.field === 'deckSize' || e.field === 'groups' || e.field.startsWith('group:'))
  const other = deckSize - groups.reduce((sum, g) => sum + g.count, 0)
  return (
    <section>
      <div className="flex items-center justify-between">
        <h2 className="font-bold">グループ</h2>
        <button type="button" disabled={groups.length >= LIMITS.groupMax}
          onClick={() => dispatch({ type: 'addGroup' })}
          className="rounded border px-2 py-1 disabled:opacity-40">グループを追加</button>
      </div>
      {groups.map((g, i) => {
        const name = displayName(g, i, 'グループ')
        return (
          <div key={g.id} className="flex flex-wrap items-center gap-2 py-1">
            <input type="text" aria-label={`グループ${i + 1}の名前`} placeholder={`グループ${i + 1}`}
              value={g.name} onChange={e => dispatch({ type: 'updateGroup', id: g.id, patch: { name: e.target.value } })}
              className="w-32 rounded border border-gray-400 px-1 py-0.5" />
            <NumberInput label={`${name}の枚数`} value={g.count} errors={errors} field={`group:${g.id}`}
              onChange={count => dispatch({ type: 'updateGroup', id: g.id, patch: { count } })} />
            枚
            <button type="button" aria-label={`${name}を削除`} disabled={groups.length <= 1}
              onClick={() => dispatch({ type: 'removeGroup', id: g.id })}
              className="rounded border px-2 py-0.5 disabled:opacity-40">削除</button>
            <FieldErrors errors={errors} field={`group:${g.id}`} />
          </div>
        )
      })}
      {showOther && <p>{`その他 ${other} 枚（自動）`}</p>}
      <FieldErrors errors={errors} field="groups" />
    </section>
  )
}
