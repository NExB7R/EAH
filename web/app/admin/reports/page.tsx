import AccountPageHeader from '@/components/account-page-header'
import { getReports } from '@/lib/data/admin'
import ReportList from './report-list'

export const dynamic = 'force-dynamic'

export default async function AdminReportsPage() {
  const reports = await getReports('all')

  const open = reports.filter((r) => r.status === 'pending' || r.status === 'reviewing').length

  return (
    <div>
      <AccountPageHeader
        title="الإبلاغات"
        description={`${open} إبلاغ بحاجة مراجعة من ${reports.length}`}
      />
      <ReportList reports={reports} />
    </div>
  )
}
