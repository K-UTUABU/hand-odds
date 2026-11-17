import { matches } from '@/calc/exact'
import type { DeckInput, Probabilities } from '@/calc/types'

/** 種つきの乱数（0以上1未満） */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** 前提：validate(input) が空。毎回デッキを部分的に混ぜて handSize 枚引き、成立した割合を返す */
export function simulate(
  { deckSize, handSize, groups, patterns }: DeckInput,
  { trials, seed }: { trials: number; seed: number },
): Probabilities {
  const random = mulberry32(seed)
  // 各カードのグループ番号。その他は groups.length（counts の末尾の余り枠）
  const deck = new Int32Array(deckSize).fill(groups.length)
  let pos = 0
  groups.forEach((g, i) => { deck.fill(i, pos, pos + g.count); pos += g.count })

  const counts: number[] = new Array(groups.length + 1).fill(0)
  const hits = patterns.map(() => 0)
  let anyHits = 0
  for (let t = 0; t < trials; t++) {
    counts.fill(0)
    // Fisher–Yates の先頭 handSize 回だけ。配列は並べ替わったままでも、次の試行も一様な無作為抽出になる
    for (let i = 0; i < handSize; i++) {
      const j = i + Math.floor(random() * (deckSize - i))
      const tmp = deck[i]; deck[i] = deck[j]; deck[j] = tmp
      counts[deck[i]]++
    }
    let any = false
    patterns.forEach((pt, k) => {
      if (matches(pt, groups, counts)) { hits[k]++; any = true }
    })
    if (any) anyHits++
  }
  return { patterns: hits.map(h => h / trials), any: anyHits / trials }
}
