import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, test, vi } from 'vitest'
import type { DeckInput } from '@/calc/types'
import ResultTable from '@/ui/ResultTable'

const input: DeckInput = { deckSize: 10, handSize: 5,
  groups: [{ id: 'a', name: '初動', count: 4 }],
  patterns: [{ id: 'p', name: '', conditions: { a: { min: 0, max: 0 } } }] }   // 6/252 = 2.38%

test('厳密な計算を表示し、シミュレーションは未実行', () => {
  render(<ResultTable input={input} hasErrors={false} />)
  const row = screen.getByRole('row', { name: /パターン1/ })
  expect(within(row).getByText('2.38%')).toBeInTheDocument()
  expect(within(row).getByText('—')).toBeInTheDocument()
  expect(screen.getByRole('row', { name: /どれか1つでも成立/ })).toBeInTheDocument()
})
test('ボタンを押すと、シミュレーションの値と誤差の目安が出る', async () => {
  const run = vi.fn().mockReturnValue({ patterns: [0.0240], any: 0.0240 })
  render(<ResultTable input={input} hasErrors={false} runSimulation={run} />)
  await userEvent.click(screen.getByRole('button', { name: 'シミュレーションを実行' }))
  expect(run).toHaveBeenCalledWith(input, { trials: 100_000, seed: expect.any(Number) })
  const row = screen.getByRole('row', { name: /パターン1/ })
  expect(within(row).getByText(/2\.40%/)).toBeInTheDocument()
  expect(within(row).getByText(/±0\.14/)).toBeInTheDocument()      // 3×√(p(1−p)/10万)×100、p = 6/252
  expect(within(row).getByText('誤差の範囲内')).toBeInTheDocument()
})
test('食い違うと警告が出る', async () => {
  const run = vi.fn().mockReturnValue({ patterns: [0.05], any: 0.05 })
  render(<ResultTable input={input} hasErrors={false} runSimulation={run} />)
  await userEvent.click(screen.getByRole('button', { name: 'シミュレーションを実行' }))
  expect(screen.getAllByRole('alert')[0]).toHaveTextContent('厳密な計算と食い違っています')
})
test('厳密な値が 0% のとき、シミュレーションも 0 なら警告は出ない', async () => {
  const zero = { ...input, patterns: [{ id: 'p', name: '', conditions: { a: { min: 5, max: null } } }] }
  const run = vi.fn().mockReturnValue({ patterns: [0], any: 0 })
  render(<ResultTable input={zero} hasErrors={false} runSimulation={run} />)
  await userEvent.click(screen.getByRole('button', { name: 'シミュレーションを実行' }))
  expect(screen.queryByRole('alert')).not.toBeInTheDocument()
})
test('入力が変わると、シミュレーションの結果が消える', async () => {
  const run = vi.fn().mockReturnValue({ patterns: [0.0240], any: 0.0240 })
  const { rerender } = render(<ResultTable input={input} hasErrors={false} runSimulation={run} />)
  await userEvent.click(screen.getByRole('button', { name: 'シミュレーションを実行' }))
  rerender(<ResultTable input={{ ...input, handSize: 4 }} hasErrors={false} runSimulation={run} />)
  expect(screen.queryByText('誤差の範囲内')).not.toBeInTheDocument()
})
test('誤りがあるときは確率を出さない', () => {
  render(<ResultTable input={input} hasErrors />)
  expect(screen.getByText('入力を直すと、確率が表示されます')).toBeInTheDocument()
  expect(screen.queryByRole('table')).not.toBeInTheDocument()
})
test('2回押すと、種が毎回変わる', async () => {
  const now = vi.spyOn(Date, 'now').mockReturnValue(111)
  const run = vi.fn().mockReturnValue({ patterns: [0.0240], any: 0.0240 })
  render(<ResultTable input={input} hasErrors={false} runSimulation={run} />)
  const button = screen.getByRole('button', { name: 'シミュレーションを実行' })
  await userEvent.click(button)
  now.mockReturnValue(222)
  await userEvent.click(button)
  expect(run.mock.calls.map(c => c[1].seed)).toEqual([111, 222])
  now.mockRestore()
})
test('編集して元の値に戻しても（等しい別オブジェクト）、古い結果は出ない', async () => {
  const run = vi.fn().mockReturnValue({ patterns: [0.0240], any: 0.0240 })
  const { rerender } = render(<ResultTable input={input} hasErrors={false} runSimulation={run} />)
  await userEvent.click(screen.getByRole('button', { name: 'シミュレーションを実行' }))
  rerender(<ResultTable input={{ ...input, handSize: 4 }} hasErrors={false} runSimulation={run} />)
  rerender(<ResultTable input={{ ...input }} hasErrors={false} runSimulation={run} />)
  expect(screen.queryByText('誤差の範囲内')).not.toBeInTheDocument()
  expect(screen.getAllByText('—').length).toBeGreaterThan(0)
})
