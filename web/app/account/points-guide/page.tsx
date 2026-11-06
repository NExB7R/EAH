import { getUserSession } from '@/lib/data/user';
import { redirect } from 'next/navigation';
import PointsGuide from './points-guide';

export const dynamic = 'force-dynamic';

export default async function PointsGuidePage() {
  const session = await getUserSession();
  if (!session) redirect('/auth?next=/account/points-guide');

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '16px' }}>
      <h1 style={{ color: '#fff', fontSize: '24px', marginBottom: '8px' }}>دليل النقاط والثقة</h1>
      <p style={{ color: '#a0a0a0', fontSize: '14px', marginBottom: '24px' }}>اعرف إزاي بتكسب وإزاي بتخسر</p>
      <PointsGuide />
    </div>
  );
}
