'use client'
import { useState } from 'react'

type Props = {
  businessName: string
  businessSlug: string
  rangeDays: number
  metrics: { label: string; value: string | number }[]
}

export default function ReportActions({ businessName, businessSlug, rangeDays, metrics }: Props) {
  const [msg, setMsg] = useState<string | null>(null)

  function printPdf() {
    window.print()
  }

  function shareWhatsapp() {
    const origin = window.location.origin
    const link = `${origin}/businesses/${businessSlug}`
    const lines = metrics.map((m) => `• ${m.label}: ${m.value}`).join('\n')
    const text =
      `تقرير ${businessName} — آخر ${rangeDays} يوم\n\n` +
      lines +
      `\n\nالرابط: ${link}\n— EAH`
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank')
  }

  function copySummary() {
    const lines = metrics.map((m) => `${m.label}: ${m.value}`).join('\n')
    navigator.clipboard.writeText(`تقرير ${businessName} — ${rangeDays} يوم\n\n${lines}`)
    setMsg('اتنسخ ✓')
    setTimeout(() => setMsg(null), 1500)
  }

  return (
    <div className="mreport-actions no-print">
      <button type="button" className="mreport-action mreport-action--pdf" onClick={printPdf}>
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 9V2h12v7"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>
          <rect x="6" y="14" width="12" height="8"/>
        </svg>
        حمّل PDF
      </button>

      <button type="button" className="mreport-action mreport-action--wa" onClick={shareWhatsapp}>
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
        </svg>
        ابعته واتساب
      </button>

      <button type="button" className="mreport-action" onClick={copySummary}>
        {msg ?? 'انسخ الملخص'}
      </button>
    </div>
  )
}
