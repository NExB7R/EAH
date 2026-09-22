/**
 * EAH — مستخدمي تست + تقييمات مربوطة بيهم + حساب تاجر تست
 * الاستخدام: cd 08-web && node ../scripts/seed-test-users-reviews.mjs ../data/TEST_BUSINESSES_2026_09_22.json
 *
 * - بيعمل 3 عملاء تست (تقييمات) + تاجر تست بيملك 3 أنشطة (واحد من كل نوع).
 * - Idempotent: لو المستخدمين موجودين بيستخدمهم، ولو النشاط عليه تقييمات بيتخطاها.
 * - البيانات معمولة عشان اختبار flows العميل/التاجر على بيئة حقيقية.
 */
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { createRequire } from 'node:module'

const require = createRequire(resolve(process.cwd(), 'package.json'))
const { createClient } = require('@supabase/supabase-js')

try {
  const envPath = resolve(process.cwd(), '.env.local')
  for (const line of readFileSync(envPath, 'utf-8').split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/)
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim()
  }
} catch { /* ignore */ }

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('Missing env vars')
  process.exit(1)
}

const fileArg = process.argv[2]
if (!fileArg) {
  console.error('Usage: node seed-test-users-reviews.mjs <data.json>')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } })

const TEST_PASSWORD = 'EahTest2026!'
const CUSTOMERS = [
  { phone: '201000000001', name: 'أحمد تست' },
  { phone: '201000000002', name: 'منى تست' },
  { phone: '201000000003', name: 'كريم تست' },
]
const MERCHANT = { phone: '201000000009', name: 'صاحب نشاط تست' }
// أنشطة يمتلكها التاجر (واحد من كل نوع)
const MERCHANT_SLUGS = ['test-koshary-eltahrir-shibin', 'test-pharmacy-elshefa', 'test-delivery-elbarq']

async function ensureUser({ phone, name }) {
  // موجود؟
  const { data: list } = await supabase.auth.admin.listUsers({ page: 1, perPage: 200 })
  const found = (list?.users ?? []).find((u) => u.phone === phone)
  if (found) return found.id

  const { data, error } = await supabase.auth.admin.createUser({
    phone,
    password: TEST_PASSWORD,
    phone_confirm: true,
  })
  if (error) throw new Error('createUser ' + phone + ': ' + error.message)

  // ظبط اسم العرض لو الـ profiles اتعملت أوتوماتيك
  try {
    const { error: pe } = await supabase
      .from('profiles')
      .update({ display_name: name })
      .eq('id', data.user.id)
    if (pe) {
      // يمكن الـ profile مش متعمل — نجرب insert
      await supabase.from('profiles').upsert({ id: data.user.id, display_name: name })
    }
  } catch { /* مش حرج */ }
  return data.user.id
}

async function main() {
  const file = JSON.parse(readFileSync(resolve(process.cwd(), fileArg), 'utf-8'))

  console.log('→ إنشاء/تأكيد مستخدمي التست...')
  const customerIds = []
  for (const c of CUSTOMERS) {
    const id = await ensureUser(c)
    customerIds.push(id)
    console.log('  customer: ' + c.name + ' (' + c.phone + ') = ' + id)
  }
  const merchantId = await ensureUser(MERCHANT)
  console.log('  merchant: ' + MERCHANT.name + ' (' + MERCHANT.phone + ') = ' + merchantId)

  console.log('→ ربط التقييمات + ملكية الأنشطة...')
  for (const b of file.businesses) {
    const { data: biz } = await supabase.from('businesses').select('id,slug').eq('slug', b.slug).maybeSingle()
    if (!biz) { console.log('  skip (مش موجود): ' + b.slug); continue }

    // التقييمات
    if (b.reviews?.length) {
      const { count } = await supabase
        .from('business_reviews')
        .select('id', { count: 'exact', head: true })
        .eq('business_id', biz.id)
      if (!count) {
        const rows = b.reviews.map((r, i) => ({
          business_id: biz.id,
          user_id: customerIds[i % customerIds.length],
          taste: r.taste ?? 5,
          value_for_money: r.value_for_money ?? 4,
          speed: r.speed ?? 4,
          experience: r.experience ?? 4,
          comment: r.comment ?? null,
          status: 'approved',
        }))
        const { error } = await supabase.from('business_reviews').insert(rows)
        if (error) console.log('  warn reviews ' + b.slug + ': ' + error.message)
        else console.log('  reviews OK: ' + b.slug + ' (' + rows.length + ')')
      }
    }

    // ملكية التاجر
    if (MERCHANT_SLUGS.includes(b.slug)) {
      const { error } = await supabase.from('businesses').update({ owner_profile_id: merchantId }).eq('id', biz.id)
      if (error) console.log('  warn owner ' + b.slug + ': ' + error.message)
      else console.log('  owner OK: ' + b.slug)
    }
  }

  console.log('')
  console.log('════ بيانات الدخول للاختبار ════')
  console.log('كلمة السر للكل: ' + TEST_PASSWORD)
  for (const c of CUSTOMERS) console.log('عميل: 0' + c.phone.slice(2) + '  (' + c.name + ')')
  console.log('تاجر: 0' + MERCHANT.phone.slice(2) + '  (' + MERCHANT.name + ' — بيملك 3 أنشطة)')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
