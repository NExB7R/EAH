import { getSession } from '@/lib/auth/session';
import { redirect } from 'next/navigation';
import PointsGuide from './points-guide';
import PageHeader from '@/components/page-header';

export const dynamic = 'force-dynamic';

export default async function PointsGuidePage() {
  const session = await getSession();
  if (!session) redirect('/auth?next=/account/points-guide');

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '16px' }}>
      <PageHeader title="دليل النقاط والثقة" subtitle="اعرف إزاي بتكسب وإزاي بتخسر" />
      <PointsGuide />
    </div>
  );
}
