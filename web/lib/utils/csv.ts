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
 */
export function buildCsv<T extends Record<string, unknown>>(
  rows: T[],
  columns: CsvColumn<T>[],
): string {
  const header = columns.map((c) => escapeCsv(c.label)).join(',')
  const lines = rows.map((row) =>
    columns.map((c) => escapeCsv(formatValue(row[c.key as keyof T]))).join(','),
  )
  return '﻿' + [header, ...lines].join('\r\n')
}

function escapeCsv(value: string): string {
  if (value === '') return ''
  // لو فيه فاصلة أو اقتباس أو سطر جديد → نلفّه بين اقتباسات
  if (value.includes(',') || value.includes('"') || value.includes('\n') || value.includes('\r')) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
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
      'Content-Disposition': `attachment; filename="${safeName}.csv"`,
      'Cache-Control': 'no-store',
    },
  })
}
