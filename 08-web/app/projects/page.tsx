import Link from 'next/link'
import FloatingCapsuleHeader from '@/components/floating-capsule'
import SiteFooter from '@/components/site-footer'
import BackToTop from '@/components/back-to-top'
import EahLogo from '@/components/eah-logo'
import ProjectsClient from '@/components/projects-client'
import { getPublishedBusinesses } from '@/lib/data'
import { rankBusinesses } from '@/lib/ranking'
import './projects.css'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'مشاريع جديدة — ادعمها',
  description: 'مشاريع جديدة على EAH — فرص لبناء حاجة من الأول. ادعم أصحابها وخلّيها تكبر.',
}

export default async function ProjectsPage() {
  const businesses = await getPublishedBusinesses(80)
  const ranked = rankBusinesses(businesses as any, { includeFeaturedBoost: false })

  // فلتر للمشاريع الجديدة بس
  const projects = ranked.filter((b: any) => b.is_new_project === true)

  return (
    <>
      <FloatingCapsuleHeader />
      <BackToTop />
      <main className="prj">
        <header className="prj__hero">
          <div className="prj__hero-glow" aria-hidden />
          <div className="prj__hero-logo">
            <EahLogo size="lg" variant="full" href="/" />
          </div>
          <span className="prj__hero-kicker">فرصتنا مع بعض</span>
          <h1 className="prj__hero-title">
            مشاريع <em>جديدة</em>
          </h1>
          <p className="prj__hero-lead">
            مشاريع مصرية بتبدأ من الأول — ادعمها، جرّبها، وخلّيها تكبر.
          </p>
        </header>

        <ProjectsClient businesses={projects as any} />
      </main>
      <SiteFooter />
    </>
  )
}
