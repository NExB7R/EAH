import { describe, expect, it } from 'vitest'
import { buildCsv } from './csv'

describe('buildCsv', () => {
  it('neutralizes formula-like prefixes in untrusted text cells', () => {
    const csv = buildCsv(
      [
        { value: '=1+1' },
        { value: '  =1+1' },
        { value: '\t=1+1' },
        { value: '+SUM(A1:A2)' },
        { value: '@SUM(A1:A2)' },
        { value: '-cmd' },
      ],
      [{ key: 'value', label: 'value' }],
    )

    expect(csv.replace(/^\uFEFF/, '').split('\r\n')).toEqual([
      'value',
      "'=1+1",
      "'  =1+1",
      "'\t=1+1",
      "'+SUM(A1:A2)",
      "'@SUM(A1:A2)",
      "'-cmd",
    ])
  })

  it('keeps numeric values numeric and preserves CSV quoting', () => {
    const csv = buildCsv(
      [{ value: 'a, "b"', amount: -12 }],
      [
        { key: 'value', label: 'value' },
        { key: 'amount', label: 'amount' },
      ],
    )

    expect(csv.replace(/^\uFEFF/, '')).toBe('value,amount\r\n"a, ""b""",-12')
  })
})
