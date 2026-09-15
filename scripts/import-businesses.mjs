import { createClient } from "@supabase/supabase-js"
import { readFileSync } from "node:fs"
import { resolve } from "node:path"

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

const fileArg = process.argv[2]

const supabase = createClient(URL, KEY, { auth: { persistSession: false } })

async function main() {
  const data = JSON.parse(readFileSync(resolve(process.cwd(), fileArg), "utf-8"))
    console.error("No businesses"); process.exit(1)
  }
  console.log("Found " + data.businesses.length + " businesses")
  let imported = 0, skipped = 0, failed = 0
  for (const b of data.businesses) {
    try {
      const { data: ex } = await supabase.from("businesses").select("id").eq("slug", b.slug).maybeSingle()
      if (ex) { console.log("  Skip: " + b.name); skipped++; continue }
      const { data: cr, error } = await supabase.from("businesses").insert({
        name: b.name, slug: b.slug, business_type: b.type,
        area: b.area, city: b.city || b.area,
        hook: b.hook || null, description: b.description || null,
        address_text: b.address_text || null, map_url: b.map_url || null,
        is_published: true, is_featured: false, is_open: true, working_hours: {},
      }).select("id").single()
      if (b.contacts?.length) {
        await supabase.from("business_contact_methods").insert(
          b.contacts.map((c) => ({
            business_id: cr.id, method_type: c.method_type, value: c.value,
            is_primary: c.is_primary || false, is_public: true,
          }))
        )
      }
      const media = []
      ;(b.gallery || []).forEach((url, i) => media.push({
        business_id: cr.id, media_type: "gallery", storage_path: url,
        alt_text: b.name + " - img " + (i+1), sort_order: i, is_published: true,
      }))
      ;(b.menu || []).forEach((url, i) => media.push({
        business_id: cr.id, media_type: "menu", storage_path: url,
        alt_text: b.name + " - menu " + (i+1), sort_order: i, is_published: true,
      }))
      if (media.length) await supabase.from("business_media").insert(media)
      console.log("  OK: " + b.name)
      imported++
    } catch (e) { console.log("  Err: " + b.name); failed++ }
  }
  console.log("")
  console.log("Imported: " + imported)
  console.log("Skipped: " + skipped)
  console.log("Failed: " + failed)
}
main().catch((e) => { console.error(e); process.exit(1) })
