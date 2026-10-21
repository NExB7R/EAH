// ═══════════════════════════════════════════════════════════
// EAH — CSV Builder (UTF-8 with BOM for Arabic in Excel)
// ═══════════════════════════════════════════════════════════

export type CsvColumn<T> = {
  key: keyof T | string
  label: string
}

/**
 * يبني ملف CSV جاهز للتنزيل
 * - BOM في الأول عشان Excel يقرأ العربي صح
 * - escape للفواصل والاقتباسات والأسطر
 * - حماية النصوص غير الموثوقة من Spreadsheet Formula Injection
 */
export function buildCsv<T extends Record<string, unknown>>(
  rows: T[],
  columns: CsvColumn<T>[],
): string {
  const header = columns.map((c) => escapeCsv(c.label)).join(',')
  const lines = rows.map((row) =>
    columns
      .map((c) => {
        const raw = row[c.key as keyof T]
        return escapeCsv(formatValue(raw), typeof raw === 'string')
      })
      .join(','),
  )
  return '\uFEFF' + [header, ...lines].join('\r\n')
}

function escapeCsv(value: string, untrustedText = false): string {
  if (value === '') return ''

  // Spreadsheet apps may execute cells beginning with formula operators.
  // Prefix an apostrophe for untrusted string cells, including those with
  // leading spaces/control characters before the operator. Numeric values
  // remain numeric so legitimate negative numbers are not altered.
  const safeValue =
    untrustedText &&
    (/^[\t\r\n]/.test(value) || /^[\u0000-\u0020\uFEFF]*[=+\-@]/.test(value))
      ? "'" + value
      : value

  if (
    safeValue.includes(',') ||
    safeValue.includes('"') ||
    safeValue.includes('\n') ||
    safeValue.includes('\r')
  ) {
    return '"' + safeValue.replace(/"/g, '""') + '"'
  }
  return safeValue
}

function formatValue(value: unknown): string {
  if (value === null || value === undefined) return ''
  if (typeof value === 'boolean') return value ? 'نعم' : 'لا'
  if (value instanceof Date) return value.toISOString()
  if (typeof value === 'object') return JSON.stringify(value)
  return String(value)
}

/**
 * يبني Response لتنزيل CSV
 */
export function csvResponse(csv: string, filename: string): Response {
  const safeName = filename.replace(/[^\w.-]/g, '_')
  return new Response(csv, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="' + safeName + '.csv"',
      'Cache-Control': 'no-store',
    },
  })
}
