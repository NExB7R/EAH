'use client'
import { ReactNode } from 'react'

export default function PageShell({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        width: '100%',
        maxWidth: '100vw',
        overflowX: 'clip',
        position: 'relative',
      }}
    >
      {children}
    </div>
  )
}
