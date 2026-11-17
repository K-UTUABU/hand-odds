import type { DeckInput, Group, Pattern, Probabilities } from '@/calc/types'

/** counts[i] は groups[i] を引いた枚数。条件のないグループ・groups にないキーは無視する */
export function matches(pattern: Pattern, groups: Group[], counts: number[]): boolean {
  return groups.every((g, i) => {
    const c = pattern.conditions[g.id]
    return c === undefined || (counts[i] >= c.min && (c.max === null || counts[i] <= c.max))
  })
}

const SCALE = 10n ** 15n

/** 前提：validate(input) が空。全内訳を再帰で列挙し、重みを BigInt で合計する */
export function exact({ deckSize, handSize, groups, patterns }: DeckInput): Probabilities {
  // 二項係数を一度だけ表にする（パスカルの三角形、BigInt）
  const binom: bigint[][] = [[1n]]
  for (let n = 1; n <= deckSize; n++) {
    binom.push(Array.from({ length: n + 1 }, (_, k) =>
      k === 0 || k === n ? 1n : binom[n - 1][k - 1] + binom[n - 1][k]))
  }
  const rest = deckSize - groups.reduce((s, g) => s + g.count, 0)
  const sums = patterns.map(() => 0n)
  let anySum = 0n
  const counts: number[] = new Array(groups.length).fill(0)
  // 条件を groups と同じ並びの数値配列にしておく（葉ごとの辞書引きとクロージャ生成を避ける）
  const mins = patterns.map(p => groups.map(g => p.conditions[g.id]?.min ?? 0))
  const maxs = patterns.map(p => groups.map(g => p.conditions[g.id]?.max ?? Infinity))
  const satisfies = (j: number): boolean => {
    for (let i = 0; i < counts.length; i++) {
      if (counts[i] < mins[j][i] || counts[i] > maxs[j][i]) return false
    }
    return true
  }

  const walk = (i: number, left: number, weight: bigint): void => {
    if (i === groups.length) {
      if (left > rest) return // その他の枚数 r = left は R 以下
      const w = weight * binom[rest][left]
      let hit = false
      for (let j = 0; j < sums.length; j++) {
        if (satisfies(j)) { sums[j] += w; hit = true }
      }
      if (hit) anySum += w // any は内訳ごとに1回だけ足す
      return
    }
    for (let k = 0; k <= Math.min(groups[i].count, left); k++) {
      counts[i] = k
      walk(i + 1, left - k, weight * binom[groups[i].count][k])
    }
  }
  walk(0, handSize, 1n)

  const total = binom[deckSize][handSize]
  const toP = (n: bigint) => Number((n * SCALE) / total) / Number(SCALE)
  return { patterns: sums.map(toP), any: toP(anySum) }
}
