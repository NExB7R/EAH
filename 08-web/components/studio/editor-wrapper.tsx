'use client'
import dynamic from 'next/dynamic'
import type { DesignData } from './types'
import './editor.css'

const StudioEditor = dynamic(() => import('./editor'), {
  ssr: false,
  loading: () => (
    <div className="ed" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <div style={{ textAlign: 'center', color: '#A5A3B8' }}>
        <div style={{
          width: 44, height: 44, margin: '0 auto 16px',
          border: '3px solid rgba(139,92,246,.2)',
          borderTopColor: '#A855F7',
          borderRadius: '50%',
          animation: 'edSpin 0.8s linear infinite',
        }} />
        <style>{`@keyframes edSpin { to { transform: rotate(360deg); } }`}</style>
        <span>جاري تحميل الاستوديو...</span>
      </div>
    </div>
  ),
})

export default function StudioEditorWrapper({ initial }: { initial: DesignData }) {
  return <StudioEditor initial={initial} />
}
