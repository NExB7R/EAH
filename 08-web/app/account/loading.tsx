import { SkeletonTitle, SkeletonLine, SkeletonCard } from '@/components/ui/skeleton'

export default function Loading() {
  return (
    <div className="e-page" style={{ maxWidth: 720 }}>
      <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 24 }}>
        <span className="e-skeleton" style={{ width: 64, height: 64, borderRadius: '50%' }} />
        <div style={{ flex: 1 }}>
          <SkeletonTitle />
          <SkeletonLine width="40%" />
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 20 }}>
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
      <SkeletonLine width="100%" />
      <SkeletonLine width="80%" />
      <SkeletonLine width="60%" />
    </div>
  )
}
