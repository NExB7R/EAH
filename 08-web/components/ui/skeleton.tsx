export function SkeletonLine({ width }: { width?: string }) {
  return <span className="e-skeleton e-skeleton--line" style={{ width }} />
}
export function SkeletonTitle() { return <span className="e-skeleton e-skeleton--title" /> }
export function SkeletonCard() { return <span className="e-skeleton e-skeleton--card" /> }
