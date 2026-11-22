import { expect, test } from 'vitest'
import { maxFromInput, parseNumberInput } from '@/ui/numberInput'

test('parseNumberInput は、途中の入力（badInput）と空欄を NaN にし、それ以外は数にする', () => {
  expect(parseNumberInput('', true)).toBeNaN()
  expect(parseNumberInput('', false)).toBeNaN()
  expect(parseNumberInput('3', false)).toBe(3)
})

test('maxFromInput は、本当の空欄だけを上限なし（null）にする', () => {
  expect(maxFromInput(NaN, false)).toBeNull()
  expect(maxFromInput(NaN, true)).toBeNaN()
  expect(maxFromInput(2, false)).toBe(2)
})
