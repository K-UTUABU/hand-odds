import { useReducer } from 'react'
import { validate } from '@/calc/validate'
import { deckReducer, initialState } from '@/state/deckReducer'
import DeckFields from '@/ui/DeckFields'
import GroupList from '@/ui/GroupList'
import PatternList from '@/ui/PatternList'
import ResultTable from '@/ui/ResultTable'

export default function App() {
  const [state, dispatch] = useReducer(deckReducer, initialState)
  const errors = validate(state)
  const props = { state, errors, dispatch }
  return (
    <main className="mx-auto max-w-xl space-y-4 p-4">
      <h1 className="text-xl font-bold">初手の確率計算</h1>
      <DeckFields {...props} />
      <GroupList {...props} />
      <PatternList {...props} />
      <ResultTable input={state} hasErrors={errors.length > 0} />
    </main>
  )
}
