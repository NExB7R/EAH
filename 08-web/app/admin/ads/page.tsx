import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase-server'

function n(v: unknown) { return typeof v === 'number' ? v : Number(v ?? 0) }

export default async function AdminAdsPage() {
  const supabase = await createClient()
  const [{ data: slots }, { data: campaigns }, { data: summary }] = await Promise.all([
    supabase.from('ad_slots').select('id,slot_key,name,placement,format,width,height,is_active,frequency_cap,cooldown_seconds').order('name'),
    supabase.from('ad_campaigns').select('id,name,status,starts_at,ends_at,business_id,pricing_model,budget,daily_budget,target_path_prefix').order('created_at', { ascending: false }),
    supabase.rpc('admin_ads_summary', { p_days: 30 }),
  ])

  async function createCampaign(formData: FormData) {
    'use server'
    const client = await createClient()
    const { data: auth } = await client.auth.getUser()
    if (!auth.user) throw new Error('يجب تسجيل الدخول.')
    const { data: role } = await client.from('user_roles').select('role').eq('user_id', auth.user.id).maybeSingle()
    if (role?.role !== 'super_admin') throw new Error('Super Admin فقط.')
    const name = String(formData.get('name') ?? '').trim()
    const headline = String(formData.get('headline') ?? '').trim()
    const destinationUrl = String(formData.get('destination_url') ?? '').trim()
    const slotId = String(formData.get('slot_id') ?? '')
    const body = String(formData.get('body') ?? '').trim() || null
    const cta = String(formData.get('cta_text') ?? '').trim() || null
    const imageUrl = String(formData.get('image_url') ?? '').trim() || null
    if (!name || !headline || !destinationUrl || !slotId) throw new Error('الاسم، العنوان، الرابط، ومساحة الإعلان مطلوبة.')
    if (!/^https?:\/\//i.test(destinationUrl)) throw new Error('رابط الإعلان لازم يبدأ بـ https:// أو http://')
    const { data: campaign, error } = await client.from('ad_campaigns').insert({ name, status: 'draft', created_by: auth.user.id }).select('id').single()
    if (error) throw new Error(error.message)
    const { error: creativeError } = await client.from('ad_creatives').insert({ campaign_id: campaign.id, slot_id: slotId, headline, body, cta_text: cta, destination_url: destinationUrl, image_url: imageUrl, alt_text: headline })
    if (creativeError) throw new Error(creativeError.message)
    revalidatePath('/admin/ads')
  }

  async function setStatus(formData: FormData) {
    'use server'
    const client = await createClient()
    const { data: auth } = await client.auth.getUser()
    if (!auth.user) throw new Error('يجب تسجيل الدخول.')
    const { data: role } = await client.from('user_roles').select('role').eq('user_id', auth.user.id).maybeSingle()
    if (role?.role !== 'super_admin') throw new Error('Super Admin فقط.')
    const id = String(formData.get('id') ?? '')
    const status = String(formData.get('status') ?? '')
    if (!['draft','active','paused','ended'].includes(status)) throw new Error('حالة غير صحيحة.')
    const { error } = await client.from('ad_campaigns').update({ status, updated_at: new Date().toISOString() }).eq('id', id)
    if (error) throw new Error(error.message)
    revalidatePath('/admin/ads')
  }

  const safe = summary ?? {}
  return (
    <section>
      <header className="eah-admin-header">
        <div><span className="eah-admin-kicker">AD MANAGER</span><h1>إدارة الإعلانات</h1><p>مساحات ثابتة، تكرار محدود، وقياس كامل للظهور والنقر وCTR بدون Pop-ups.</p></div>
      </header>

      <div className="eah-admin-stat-grid">
        <div className="eah-admin-stat-card"><span>حملات</span><strong>{n(safe.campaigns)}</strong><small>كل الحملات</small></div>
        <div className="eah-admin-stat-card"><span>حملات نشطة</span><strong>{n(safe.active_campaigns)}</strong><small>الآن</small></div>
        <div className="eah-admin-stat-card"><span>مرات ظهور</span><strong>{n(safe.impressions)}</strong><small>آخر 30 يوم</small></div>
        <div className="eah-admin-stat-card"><span>نقرات</span><strong>{n(safe.clicks)}</strong><small>آخر 30 يوم</small></div>
        <div className="eah-admin-stat-card"><span>CTR</span><strong>{n(safe.ctr)}%</strong><small>نقرات ÷ ظهور</small></div>
      </div>

      <div className="card" style={{ marginTop: 18, padding: 22 }}>
        <div className="section-head"><div><h2>مساحات الإعلانات</h2><span>دي الأماكن الوحيدة التي تسمح EAH بالإعلان فيها.</span></div></div>
        <div style={{ display: 'grid', gap: 10, marginTop: 14 }}>
          {(slots ?? []).map((slot) => <div key={slot.id} className="eah-admin-business-card"><div><strong>{slot.name}</strong><div className="eah-admin-business-sub">{slot.slot_key} • {slot.format} • {slot.width}×{slot.height} • مرة كل {slot.cooldown_seconds}s كحد أدنى للزائر</div></div><span className={`eah-admin-badge ${slot.is_active ? 'live' : ''}`}>{slot.is_active ? 'مفعلة' : 'موقوفة'}</span></div>)}
        </div>
      </div>

      <div className="card" style={{ marginTop: 18, padding: 22 }}>
        <div className="section-head"><div><h2>إضافة حملة</h2><span>تبدأ Draft؛ النشر يحتاج تشغيل صريح من لوحة الإدارة.</span></div></div>
        <form action={createCampaign} style={{ display: 'grid', gap: 12, marginTop: 14 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,minmax(0,1fr))', gap: 12 }}>
            <label>اسم الحملة<input name="name" placeholder="مطعم ... — حملة سبتمبر" required /></label>
            <label>مساحة الإعلان<select name="slot_id" required><option value="">اختار المساحة</option>{(slots ?? []).map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select></label>
          </div>
          <label>عنوان الإعلان<input name="headline" placeholder="عرض خاص النهارده" required /></label>
          <label>وصف مختصر<textarea name="body" rows={3} placeholder="سطر مفيد بدون إزعاج أو مبالغة." /></label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,minmax(0,1fr))', gap: 12 }}>
            <label>رابط الوجهة<input name="destination_url" type="url" placeholder="https://example.com" required /></label>
            <label>رابط الصورة<input name="image_url" type="url" placeholder="https://.../creative.webp" /></label>
          </div>
          <label>النص على الزر<input name="cta_text" placeholder="شوف العرض" /></label>
          <button className="eah-admin-btn primary" type="submit">حفظ كمسودة</button>
        </form>
      </div>

      <div className="card" style={{ marginTop: 18, padding: 22 }}>
        <div className="section-head"><div><h2>الحملات الحالية</h2><span>التحكم في التشغيل والإيقاف.</span></div></div>
        <div style={{ display: 'grid', gap: 10, marginTop: 14 }}>
          {(campaigns ?? []).map(c => <div key={c.id} className="eah-admin-business-card"><div><strong>{c.name}</strong><div className="eah-admin-business-sub">{c.pricing_model} • {c.target_path_prefix || 'كل المسارات'}</div></div><form action={setStatus} className="eah-admin-actions"><input type="hidden" name="id" value={c.id} /><button className="eah-admin-btn primary" name="status" value={c.status === 'active' ? 'paused' : 'active'}>{c.status === 'active' ? 'إيقاف' : 'تشغيل'}</button><button className="eah-admin-btn" name="status" value="ended">إنهاء</button><span className={`eah-admin-badge ${c.status === 'active' ? 'live' : ''}`}>{c.status}</span></form></div>)}
          {!campaigns?.length && <div className="eah-admin-business-sub">مفيش حملات لسه.</div>}
        </div>
      </div>
    </section>
  )
}
