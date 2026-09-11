'use client'

export default function PrintReportButton() {
  return <button type="button" className="pill" onClick={() => window.print()}>🖨️ اطبع التقرير</button>
}
