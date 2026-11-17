import { expect, test } from 'vitest'
import { formatPercent } from '@/ui/format'

test.each([[0.31234, '31.23%'], [1, '100.00%'], [0, '0.00%'], [-0, '0.00%'], [0.999999, '100.00%']])(
  'formatPercent(%s) は %s', (p, text) => { expect(formatPercent(p)).toBe(text) })
