import { FieldErrors, NumberInput, type SectionProps } from '@/ui/fields'

export default function DeckFields({ state, errors, dispatch }: SectionProps) {
  return (
    <section className="flex flex-wrap items-center gap-x-4 gap-y-1">
      <span className="flex items-center gap-1">
        デッキ
        <NumberInput label="デッキ枚数" value={state.deckSize} errors={errors} field="deckSize"
          onChange={value => dispatch({ type: 'setDeckSize', value })} />
        枚
      </span>
      <span className="flex items-center gap-1">
        引く枚数
        <NumberInput label="引く枚数" value={state.handSize} errors={errors} field="handSize"
          onChange={value => dispatch({ type: 'setHandSize', value })} />
        枚
      </span>
      <FieldErrors errors={errors} field="deckSize" />
      <FieldErrors errors={errors} field="handSize" />
    </section>
  )
}
