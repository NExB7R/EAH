/**
 * EAH business importer — بيانات كاملة
 * الاستخدام: cd 08-web && node ../scripts/import-businesses.mjs ../data/<file>.json
 *
 * بيدعم: businesses بكل الحقول + contacts + media + offers + menu_items + reviews.
 * Idempotent: بيتخطى أي slug موجود بالفعل.
 */
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { createRequire } from 'node:module'

// السكربت بيتنفذ من 08-web عشان يلاقي @supabase/supabase-js في node_modules بتاعها
const require = createRequire(resolve(process.cwd(), 'package.json'))
const { createClient } = require('@supabase/supabase-js')

// حمّل .env.local لو موجود (Next بيحمّلها لوحدها، بس node العادي لأ)
try {
  const envPath = resolve(process.cwd(), '.env.local')
  for (const line of readFileSync(envPath, 'utf-8').split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/)
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim()
  }
} catch { /* مفيش env file — نعتمد على env النظام */ }

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('Missing env vars: NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const fileArg = process.argv[2]
if (!fileArg) {
  console.error('Usage: node import-businesses.mjs <file.json>')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } })

const DAY = 24 * 60 * 60 * 1000
// أوقات عمل افتراضية لو النشاط مبعتش working_hours
const DEFAULT_HOURS = Object.fromEntries(
  ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'].map((d) => [d, { open: '09:00', close: '23:00' }])
)

async function main() {
  const data = JSON.parse(readFileSync(resolve(process.cwd(), fileArg), 'utf-8'))
  if (!Array.isArray(data.businesses) || data.businesses.length === 0) {
    console.error('No businesses in file')
    process.exit(1)
  }
  console.log('Found ' + data.businesses.length + ' businesses')

  let imported = 0, skipped = 0, failed = 0

  for (const b of data.businesses) {
    try {
      const { data: ex } = await supabase.from('businesses').select('id').eq('slug', b.slug).maybeSingle()
      if (ex) { console.log('  Skip (exists): ' + b.name); skipped++; continue }

      // ═══ النشاط ═══
      const { data: cr, error } = await supabase
        .from('businesses')
        .insert({
          name: b.name,
          slug: b.slug,
          business_type: b.type,
          area: b.area,
          city: b.city || b.area,
          hook: b.hook || null,
          description: b.description || null,
          address_text: b.address_text || null,
          map_url: b.map_url || null,
          latitude: typeof b.latitude === 'number' ? b.latitude : null,
          longitude: typeof b.longitude === 'number' ? b.longitude : null,
          is_published: true,
          is_featured: b.is_featured === true,
          is_open: b.is_open !== false,
          is_new_project: b.is_new_project === true,
          has_delivery: b.has_delivery === true,
          accepts_whatsapp_orders: b.accepts_whatsapp_orders === true,
          working_hours: b.working_hours && Object.keys(b.working_hours).length ? b.working_hours : DEFAULT_HOURS,
          cover_image_url: b.cover || null,
        })
        .select('id')
        .single()
      if (error || !cr) {
        console.log('  FAIL business ' + b.name + ': ' + (error?.message ?? 'no row'))
        failed++
        continue
      }
      const id = cr.id

      // ═══ طرق التواصل ═══
      if (b.contacts?.length) {
        const { error: e1 } = await supabase.from('business_contact_methods').insert(
          b.contacts.map((c) => ({
            business_id: id,
            method_type: c.method_type,
            value: c.value,
            is_primary: c.is_primary === true,
            is_public: true,
          }))
        )
        if (e1) console.log('    warn contacts: ' + e1.message)
      }

      // ═══ الميديا (gallery + menu صور) ═══
      const media = []
      ;(b.gallery || []).forEach((url, i) =>
        media.push({
          business_id: id,
          media_type: 'gallery',
          storage_path: url,
          alt_text: b.name + ' - صورة ' + (i + 1),
          sort_order: i,
          is_published: true,
        })
      )
      ;(b.menu || []).forEach((url, i) =>
        media.push({
          business_id: id,
          media_type: 'menu',
          storage_path: url,
          alt_text: b.name + ' - منيو ' + (i + 1),
          sort_order: i,
          is_published: true,
        })
      )
      if (media.length) {
        const { error: e2 } = await supabase.from('business_media').insert(media)
        if (e2) console.log('    warn media: ' + e2.message)
      }

      // ═══ العروض ═══
      if (b.offers?.length) {
        const { error: e3 } = await supabase.from('offers').insert(
          b.offers.map((o) => ({
            business_id: id,
            title: o.title,
            teaser_image_path: o.teaser_image_path ?? null,
            starts_at: o.starts_at ?? new Date(Date.now() - DAY).toISOString(),
            ends_at: o.ends_at ?? new Date(Date.now() + 90 * DAY).toISOString(),
            is_published: true,
          }))
        )
        if (e3) console.log('    warn offers: ' + e3.message)
      }

      // ═══ عناصر المنيو ═══
      if (b.menu_items?.length) {
        const { error: e4 } = await supabase.from('business_menu_items').insert(
          b.menu_items.map((m) => ({
            business_id: id,
            category: m.category ?? 'عام',
            name: m.name,
            description: m.description ?? null,
            price: typeof m.price === 'number' ? m.price : null,
            image_url: m.image_url ?? null,
            is_available: m.is_available !== false,
            sort_order: m.sort_order ?? 0,
          }))
        )
        if (e4) console.log('    warn menu_items: ' + e4.message)
      }

      // ═══ التقييمات ═══
      if (b.reviews?.length) {
        const { error: e5 } = await supabase.from('business_reviews').insert(
          b.reviews.map((r, i) => ({
            business_id: id,
            user_id: null,
            taste: r.taste ?? 5,
            value_for_money: r.value_for_money ?? 4,
            speed: r.speed ?? 4,
            experience: r.experience ?? 4,
            comment: r.comment ?? null,
            status: 'approved',
            created_at: new Date(Date.now() - (i + 2) * DAY).toISOString(),
          }))
        )
        if (e5) console.log('    warn reviews: ' + e5.message)
      }

      console.log('  OK: ' + b.name)
      imported++
    } catch (e) {
      console.log('  ERR ' + b.name + ': ' + (e instanceof Error ? e.message : e))
      failed++
    }
  }

  console.log('')
  console.log('Imported: ' + imported)
  console.log('Skipped:  ' + skipped)
  console.log('Failed:   ' + failed)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
