import { SkeletonTitle, SkeletonLine, SkeletonCard } from '@/components/ui/skeleton'

export default function Loading() {
  return (
    <div className="e-page" style={{ maxWidth: 900 }}>
      <SkeletonTitle />
      <SkeletonLine width="40%" />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12, marginTop: 24 }}>
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    </div>
  )
}
