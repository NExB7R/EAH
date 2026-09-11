'use client'

import Link from 'next/link'
import { EahRender, type EahBusiness, type EahPageData } from '@/components/eah-page-builder-pro2'

export default function EahHomeClient({ businesses, data }: { businesses: EahBusiness[]; data: EahPageData }) {
  return (
    <div>
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          padding: '12px 16px',
          background: 'rgba(7,6,11,.86)',
          borderBottom: '1px solid rgba(255,255,255,.08)',
          backdropFilter: 'blur(14px)',
        }}
      >
        <Link
          href="/"
          style={{ color: '#F4F2FA', textDecoration: 'none', fontWeight: 800, letterSpacing: '.04em' }}
        >
          EAH
        </Link>
        <nav style={{ display: 'flex', alignItems: 'center', gap: 10 }} aria-label="التنقل الرئيسي">
          <Link
            href="/explore"
            style={{ color: '#A29DB5', textDecoration: 'none', fontSize: 14, padding: '8px 10px' }}
          >
            استكشف
          </Link>
          <Link
            href="/auth"
            style={{
              color: '#F4F2FA',
              textDecoration: 'none',
              fontSize: 14,
              fontWeight: 700,
              padding: '9px 14px',
              borderRadius: 12,
              background: '#8B5CF6',
            }}
          >
            دخول
          </Link>
        </nav>
      </header>
      <EahRender data={data} businesses={businesses} />
    </div>
  )
}
