import type { InputError } from '@/calc/types'

/** NaN（空欄）は空文字で表示する */
const toText = (v: number | null) => (v === null || Number.isNaN(v) ? '' : v)

type NumberInputProps = {
  label: string
  value: number | null
  onChange: (v: number) => void
  errors: InputError[]
  field: string
}

/** 数値の入力欄。空欄は NaN として渡す */
export function NumberInput({ label, value, onChange, errors, field }: NumberInputProps) {
  return (
    <input
      type="number" inputMode="numeric" aria-label={label} aria-invalid={errors.some(e => e.field === field)}
      value={toText(value)}
      onChange={e => onChange(e.target.value === '' ? NaN : Number(e.target.value))}
      className="w-16 rounded border border-gray-400 px-1 py-0.5 aria-invalid:border-red-600"
    />
  )
}

/** 指定した欄の誤りを、role="alert" で出す */
export function FieldErrors({ errors, field }: { errors: InputError[]; field: string }) {
  return errors.filter(e => e.field === field).map(e => (
    <p key={e.message} role="alert" className="w-full text-sm text-red-700">{e.message}</p>
  ))
}

