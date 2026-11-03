import { createClient } from '@supabase/supabase-js'
import { loadEnvConfig } from '@next/env'
import { randomBytes } from 'node:crypto'
import { chmodSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const scriptDirectory = dirname(fileURLToPath(import.meta.url))
loadEnvConfig(resolve(scriptDirectory, '..'))
const credentialsPath = resolve(scriptDirectory, '../.qa-test-credentials.local.json')
const enabled = process.env.EAH_ALLOW_QA_ACCOUNT_SEED === 'yes'
const supabaseUrl = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SERVICE_KEY
const allowedProjectRef = process.env.EAH_QA_ALLOWED_PROJECT_REF?.trim()

if (!enabled) {
  throw new Error(
    'Refusing to create QA accounts. Set EAH_ALLOW_QA_ACCOUNT_SEED=yes explicitly after reviewing this script.',
  )
}
if (!supabaseUrl || !serviceRoleKey) {
  throw new Error(
    'Missing SUPABASE_URL/NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. Load the project .env.local first.',
  )
}

let targetProjectRef
try {
  const targetUrl = new URL(supabaseUrl)
  if (targetUrl.protocol !== 'https:') throw new Error('HTTPS required')
  targetProjectRef = targetUrl.hostname.split('.')[0]
} catch {
  throw new Error('QA seeding requires a valid HTTPS Supabase project URL.')
}

if (targetProjectRef === 'npmpiivmdksdirrumbmt') {
  throw new Error('Refusing to seed QA accounts or activities into the EAH production project.')
}
if (!allowedProjectRef || allowedProjectRef !== targetProjectRef) {
  throw new Error(
    `Refusing to seed an unapproved project. Set EAH_QA_ALLOWED_PROJECT_REF=${targetProjectRef} only after confirming this is the dedicated non-production test project.`,
  )
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})

const qaAccounts = [
  {
    email: 'eah.qa.admin@example.com',
    role: 'super_admin',
    displayName: 'أدمن اختبار EAH',
  },
  {
    email: 'eah.qa.buyer@example.com',
    role: 'customer',
    displayName: 'مشتري اختبار EAH',
  },
  {
    email: 'eah.qa.seller@example.com',
    role: 'merchant',
    displayName: 'بايع اختبار EAH',
  },
]

function makePassword() {
  return randomBytes(24).toString('base64url')
}

async function findExistingUser(email) {
  let page = 1
  while (page <= 10) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 1000 })
    if (error) throw new Error(`Could not list Auth users: ${error.message}`)
    const match = data.users.find((user) => user.email?.toLowerCase() === email.toLowerCase())
    if (match) return match
    if (data.users.length < 1000) return null
    page += 1
  }
  throw new Error('Stopped after 10 Auth pages; refusing to create duplicates without a full email check.')
}

async function ensureQaAccount(account) {
  const existing = await findExistingUser(account.email)
  const password = makePassword()
  const metadata = {
    ...(existing?.user_metadata ?? {}),
    full_name: account.displayName,
    display_name: account.displayName,
    eah_qa_account: true,
    eah_qa_role: account.role,
  }

  let user
  if (existing) {
    if (existing.user_metadata?.eah_qa_account !== true) {
      throw new Error(
        `Refusing to modify existing non-QA account ${account.email}. Choose a different reserved test email.`,
      )
    }
    const { data, error } = await supabase.auth.admin.updateUserById(existing.id, {
      password,
      email_confirm: true,
      user_metadata: metadata,
    })
    if (error || !data.user) throw new Error(`Could not reset QA password: ${error?.message ?? 'no user returned'}`)
    user = data.user
  } else {
    const { data, error } = await supabase.auth.admin.createUser({
      email: account.email,
      password,
      email_confirm: true,
      user_metadata: metadata,
    })
    if (error || !data.user) throw new Error(`Could not create QA account: ${error?.message ?? 'no user returned'}`)
    user = data.user
  }

  const { data: profile, error: profileLookupError } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', user.id)
    .maybeSingle()
  if (profileLookupError) throw new Error(`Could not verify QA profile: ${profileLookupError.message}`)
  if (!profile) {
    const { error } = await supabase.from('profiles').insert({
      id: user.id,
      display_name: account.displayName,
    })
    if (error) throw new Error(`Could not create QA profile: ${error.message}`)
  } else {
    const { error } = await supabase
      .from('profiles')
      .update({ display_name: account.displayName })
      .eq('id', user.id)
    if (error) throw new Error(`Could not update QA display name: ${error.message}`)
  }

  const { error: roleError } = await supabase
    .from('user_roles')
    .upsert({ user_id: user.id, role: account.role }, { onConflict: 'user_id' })
  if (roleError) throw new Error(`Could not assign the QA role: ${roleError.message}`)

  return {
    email: account.email,
    password,
    role: account.role,
    userId: user.id,
    displayName: account.displayName,
  }
}

async function linkSellerQaActivity(sellerId) {
  const qaSlug = 'eah-qa-test-multi-contact-20261030'
  const qaMarker = '[EAH QA FIXTURE — NONPRODUCTION ONLY]'
  let { data: business, error: lookupError } = await supabase
    .from('businesses')
    .select('id, owner_profile_id, description, source')
    .eq('slug', qaSlug)
    .maybeSingle()
  if (lookupError) {
    throw new Error(`Could not inspect the QA seller activity: ${lookupError.message}`)
  }
  if (!business) {
    const { data: created, error: createError } = await supabase
      .from('businesses')
      .insert({
        name: 'نشاط اختبار EAH',
        slug: qaSlug,
        business_type: 'misc',
        custom_business_type: 'نشاط اختبار',
        business_type_status: 'approved',
        source: 'admin',
        description: qaMarker,
        is_open: true,
        is_published: false,
      })
      .select('id, owner_profile_id, description, source')
      .single()
    if (createError || !created) {
      throw new Error(`Could not create the isolated QA activity: ${createError?.message ?? 'no row returned'}`)
    }
    business = created
  }
  if (business.description !== qaMarker || business.source !== 'admin') {
    throw new Error('Refusing to link a seller to a business that is not the isolated QA fixture.')
  }
  if (business.owner_profile_id && business.owner_profile_id !== sellerId) {
    const { data: existingOwner, error } = await supabase.auth.admin.getUserById(business.owner_profile_id)
    if (error || existingOwner.user?.user_metadata?.eah_qa_account !== true) {
      throw new Error('Refusing to replace a non-QA owner on the QA activity.')
    }
  }

  const { error: settingsError } = await supabase.from('merchant_order_settings').upsert(
    {
      business_id: business.id,
      orders_enabled: true,
      deadline_minutes: 10,
      delivery_eta_minutes: 30,
      offline_mode: false,
      offline_until: null,
      auto_accept: false,
      suspended_until: null,
      suspension_reason: null,
    },
    { onConflict: 'business_id' },
  )
  if (settingsError) {
    throw new Error(`Could not prepare isolated QA order settings: ${settingsError.message}`)
  }

  const { data: updated, error: updateError } = await supabase
    .from('businesses')
    .update({
      owner_profile_id: sellerId,
      accepts_orders: true,
      accepts_whatsapp_orders: false,
    })
    .eq('id', business.id)
    .select('id')
    .maybeSingle()
  if (updateError || !updated) {
    await supabase
      .from('merchant_order_settings')
      .update({ orders_enabled: false })
      .eq('business_id', business.id)
    throw new Error(`Could not link seller to QA activity: ${updateError?.message ?? 'no row updated'}`)
  }
}

async function main() {
  const accounts = []
  for (const account of qaAccounts) accounts.push(await ensureQaAccount(account))
  const seller = accounts.find((account) => account.role === 'merchant')
  if (!seller) throw new Error('Seller QA account was not created.')
  await linkSellerQaActivity(seller.userId)

  const credentials = {
    warning: 'Temporary QA credentials only. Never commit this file or use these accounts for real activity.',
    generatedAt: new Date().toISOString(),
    app: process.env.NEXT_PUBLIC_APP_URL ?? 'https://eah-sq.vercel.app',
    accounts,
    linkedSellerActivitySlug: 'eah-qa-test-multi-contact-20261030',
  }
  writeFileSync(credentialsPath, JSON.stringify(credentials, null, 2), { encoding: 'utf8', mode: 0o600 })
  chmodSync(credentialsPath, 0o600)
  console.log(`QA buyer and seller accounts are ready. Credentials were written locally to: ${credentialsPath}`)
  console.log('The seller is linked only to the clearly labeled QA activity; online ordering is enabled for the QA activity, while WhatsApp contacts remain available without enabling WhatsApp orders.')
}

main().catch((error) => {
  console.error('[qa-seed] Failed safely:', error instanceof Error ? error.message : String(error))
  process.exitCode = 1
})
