import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, test } from 'vitest'
import App from '@/ui/App'

test('表題が表示される', () => {
  render(<App />)
  expect(screen.getByRole('heading', { level: 1, name: '初手の確率計算' })).toBeInTheDocument()
})
test('初期表示：デッキ 40、引く 5、その他 40 枚', () => {
  render(<App />)
  expect(screen.getByLabelText('デッキ枚数')).toHaveValue(40)
  expect(screen.getByLabelText('引く枚数')).toHaveValue(5)
  expect(screen.getByText('その他 40 枚（自動）')).toBeInTheDocument()
})
test('グループの枚数を入れると、その他が減る', async () => {
  render(<App />)
  await userEvent.type(screen.getByLabelText('グループ1の枚数'), '9') // 初期値 0 に続けて入力 → 9
  expect(screen.getByText('その他 31 枚（自動）')).toBeInTheDocument()
})
test('グループを追加すると、パターンにも行が増える', async () => {
  render(<App />)
  await userEvent.click(screen.getByRole('button', { name: 'グループを追加' }))
  expect(screen.getByLabelText('パターン1：グループ2の最小')).toHaveValue(0)
})
test('デッキ枚数を空にすると、誤りが出る', async () => {
  render(<App />)
  await userEvent.clear(screen.getByLabelText('デッキ枚数'))
  expect(screen.getByRole('alert')).toHaveTextContent('デッキ枚数は 1〜100 の整数で入力してください')
})
test('合計が超えると、誤りが出て、その他は表示されない', async () => {
  render(<App />)
  const count = screen.getByLabelText('グループ1の枚数')
  await userEvent.clear(count); await userEvent.type(count, '41')
  expect(screen.getByRole('alert')).toHaveTextContent('グループの合計（41枚）がデッキ枚数を超えています')
  expect(screen.queryByText(/その他 .* 枚（自動）/)).not.toBeInTheDocument()
})
test('グループが 10 個になると、追加ボタンを押せない', async () => {
  render(<App />)
  const add = screen.getByRole('button', { name: 'グループを追加' })
  for (let i = 0; i < 9; i++) await userEvent.click(add)
  expect(add).toBeDisabled()
})
test('条件の最大を空のままにすると上限なし、入れると値が入る', async () => {
  render(<App />)
  const max = screen.getByLabelText('パターン1：グループ1の最大')
  expect(max).toHaveValue(null)
  await userEvent.type(max, '3')
  expect(max).toHaveValue(3)
  await userEvent.clear(max)
  expect(max).toHaveValue(null)
  expect(screen.queryByRole('alert')).not.toBeInTheDocument()
})
test('最小が最大より大きいと、条件の行の下に誤りが出る', async () => {
  render(<App />)
  const min = screen.getByLabelText('パターン1：グループ1の最小')
  await userEvent.clear(min); await userEvent.type(min, '5')
  await userEvent.type(screen.getByLabelText('パターン1：グループ1の最大'), '2')
  expect(screen.getByRole('alert')).toHaveTextContent('「以上」は「以下」より大きくできません')
  expect(min).toHaveAttribute('aria-invalid', 'true')
})
test('グループを削除すると、パターンの行も消える', async () => {
  render(<App />)
  await userEvent.click(screen.getByRole('button', { name: 'グループを追加' }))
  await userEvent.click(screen.getByRole('button', { name: 'グループ1を削除' }))
  expect(screen.queryByLabelText('パターン1：グループ2の最小')).not.toBeInTheDocument()
  expect(screen.getByLabelText('パターン1：グループ1の最小')).toBeInTheDocument()
})
test('グループが 1 つだけのとき、削除ボタンは押せない', () => {
  render(<App />)
  expect(screen.getByRole('button', { name: 'グループ1を削除' })).toBeDisabled()
  expect(screen.getByRole('button', { name: 'パターン1を削除' })).toBeDisabled()
})
test('入力が正しいと結果の表が出て、誤ると案内に変わる', async () => {
  render(<App />)
  expect(screen.getByRole('heading', { level: 2, name: '結果' })).toBeInTheDocument()
  expect(screen.getByRole('table')).toBeInTheDocument()
  await userEvent.clear(screen.getByLabelText('デッキ枚数'))
  expect(screen.getByText('入力を直すと、確率が表示されます')).toBeInTheDocument()
  expect(screen.queryByRole('table')).not.toBeInTheDocument()
})
