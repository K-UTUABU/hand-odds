import { useMemo, useState } from 'react'
import { margin, withinMargin } from '@/calc/compare'
import { exact } from '@/calc/exact'
import { simulate } from '@/calc/simulate'
import { LIMITS } from '@/calc/types'
import type { DeckInput, Probabilities } from '@/calc/types'
import { displayName } from '@/state/deckReducer'
import { formatPercent } from '@/ui/format'

type Props = {
  input: DeckInput
  hasErrors: boolean
  runSimulation?: typeof simulate
}

export default function ResultTable({ input, hasErrors, runSimulation = simulate }: Props) {
  // 入力が変わるたびに計算し直す。誤りがあるときは計算しない
  const exactResult = useMemo(() => (hasErrors ? null : exact(input)), [input, hasErrors])
  // シミュレーションの結果は、計算した入力と対にして持つ（入力が変わると参照が変わり、表示されなくなる）
  const [sim, setSim] = useState<{ input: DeckInput; result: Probabilities } | null>(null)
  const simulated = sim?.input === input ? sim.result : null

  const run = () => setSim({ input, result: runSimulation(input, { trials: LIMITS.trials, seed: Date.now() }) })

  const rows = exactResult && [
    ...input.patterns.map((p, i) => ({ key: p.id, label: displayName(p, i, 'パターン'), e: exactResult.patterns[i], s: simulated?.patterns[i] })),
    { key: 'any', label: 'どれか1つでも成立', e: exactResult.any, s: simulated?.any },
  ]

  return (
    <section>
      <h2 className="font-bold">結果</h2>
      {!rows ? (
        <p className="mt-2 text-sm text-gray-700">入力を直すと、確率が表示されます</p>
      ) : (
        <>
          <table className="mt-2 w-full text-left text-sm">
            <caption className="sr-only">厳密な計算と、シミュレーション（10万回）の結果</caption>
            <thead>
              <tr className="border-b">
                <th scope="col" className="py-1 pr-2 font-normal">パターン</th>
                <th scope="col" className="whitespace-nowrap px-2 py-1 font-normal">厳密</th>
                <th scope="col" className="whitespace-nowrap py-1 pl-2 font-normal">シミュレーション</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(({ key, label, e, s }) => (
                <tr key={key} className="border-b align-top">
                  <th scope="row" className="break-words py-1 pr-2 font-normal">{label}</th>
                  <td className="whitespace-nowrap px-2 py-1">{formatPercent(e)}</td>
                  <td className="whitespace-nowrap py-1 pl-2">
                    {s === undefined ? '—' : (
                      <>
                        <span>{formatPercent(s)}</span>
                        <span className="block text-xs">±{(margin(e, LIMITS.trials) * 100).toFixed(2)}</span>
                        {withinMargin(e, s, LIMITS.trials)
                          ? <span className="block text-xs">誤差の範囲内</span>
                          : <span role="alert" className="block text-xs text-red-700">厳密な計算と食い違っています</span>}
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <button type="button" onClick={run} className="mt-2 rounded border px-2 py-1">シミュレーションを実行</button>
        </>
      )}
    </section>
  )
}
