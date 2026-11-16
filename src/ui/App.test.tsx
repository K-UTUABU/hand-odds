import { render, screen } from '@testing-library/react'
import { expect, test } from 'vitest'
import App from '@/ui/App'

test('表題が表示される', () => {
  render(<App />)
  expect(screen.getByRole('heading', { level: 1, name: '初手の確率計算' })).toBeInTheDocument()
})
