/** 入力欄の文字を数にする。空欄と、途中の入力（badInput：「-」「1e」など）は NaN */
export const parseNumberInput = (value: string, badInput: boolean): number =>
  badInput || value === '' ? NaN : Number(value)

/** 最大の欄：本当の空欄だけを上限なし（null）にする。途中の入力は NaN のまま残して誤りにする */
export const maxFromInput = (v: number, badInput: boolean): number | null =>
  Number.isNaN(v) && !badInput ? null : v
