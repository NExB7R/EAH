import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const migrationPath = join(
  __dirname,
  '../../docs/migrations/2026-10-11-harden-sensitive-rpc-execution.sql',
)
const phoneMigrationPath = join(
  __dirname,
  '../../docs/migrations/2026-10-11-harden-phone-lookup.sql',
)

function readMigration(path: string): string {
  return readFileSync(path, 'utf8')
}

function assertBalancedDollarQuotes(sql: string): void {
  const delimiters = sql.match(/\$\$|\$[A-Za-z_][A-Za-z0-9_]*\$/g) ?? []
  const counts = new Map<string, number>()

  for (const delimiter of delimiters) {
    counts.set(delimiter, (counts.get(delimiter) ?? 0) + 1)
  }

  for (const [delimiter, count] of counts) {
    expect(count, `unpaired SQL delimiter ${delimiter}`).toBeGreaterThan(0)
    expect(count % 2, `unbalanced SQL delimiter ${delimiter}`).toBe(0)
  }

  // A single dollar character is not a valid PostgreSQL dollar-quote delimiter.
  expect(sql).not.toMatch(/\bAS\s+\$(?!\$|[A-Za-z_])/i)
}

describe('security SQL migrations', () => {
  it('uses balanced PostgreSQL dollar-quote delimiters', () => {
    assertBalancedDollarQuotes(readMigration(migrationPath))
    assertBalancedDollarQuotes(readMigration(phoneMigrationPath))
  })

  it('keeps sensitive mutation RPCs away from public client roles', () => {
    const sql = readMigration(migrationPath)

    expect(sql).toContain(
      'revoke all on function public.award_trust_badge(text, uuid, text) from public, anon, authenticated',
    )
    expect(sql).toContain(
      'grant execute on function public.award_trust_badge(text, uuid, text) to service_role',
    )
    expect(sql).toContain(
      'revoke all on function public.is_phone_registered(text) from public, anon, authenticated',
    )
    expect(sql).toContain(
      'grant execute on function public.is_phone_registered(text) to service_role',
    )
    expect(sql).toContain(
      'revoke all on function public.reveal_contact(uuid, text, text) from public, anon, authenticated',
    )
    expect(sql).toContain(
      'grant execute on function public.reveal_contact(uuid, text, text) to service_role',
    )
    expect(sql).toContain(
      'revoke all on function public.count_accounts_from_ip(text, integer) from public, anon, authenticated',
    )
    expect(sql).toContain(
      'grant execute on function public.count_accounts_from_ip(text, integer) to service_role',
    )
    expect(sql).toContain(
      'revoke all on function public.check_social_badges(uuid) from public, anon',
    )
    expect(sql).toContain(
      'grant execute on function public.check_social_badges(uuid) to authenticated, service_role',
    )
  })

  it('validates ownership within SECURITY DEFINER badge checks', () => {
    const sql = readMigration(migrationPath)

    expect(sql.match(/auth\.uid\(\) = p_user_id/g)?.length ?? 0).toBeGreaterThanOrEqual(3)
    expect(sql.match(/not public\.is_admin\(\)/g)).toHaveLength(3)
    expect(sql.match(/auth\.jwt\(\) ->> 'role'/g)).toHaveLength(3)
  })

  it('authorizes the insights admin page before reading through service_role', () => {
    const pagePath = join(__dirname, '../app/admin/insights/page.tsx')
    const source = readFileSync(pagePath, 'utf8')
    const authIndex = source.indexOf('const session = await getUserSession()')
    const serviceQueryIndex = source.indexOf('const rows = await getStorageData()')

    expect(authIndex).toBeGreaterThanOrEqual(0)
    expect(serviceQueryIndex).toBeGreaterThan(authIndex)
    expect(source).toContain("session.role !== 'admin' && session.role !== 'super_admin'")
    expect(source).toContain('createServiceClient()')
  })

  it('authorizes fraud and health data helpers before sensitive reads', () => {
    const fraudPath = join(__dirname, './data/fraud.ts')
    const healthPath = join(__dirname, './data/health.ts')
    const fraudSource = readFileSync(fraudPath, 'utf8')
    const healthSource = readFileSync(healthPath, 'utf8')

    const guardedFunctions = [
      { source: fraudSource, name: 'getFlaggedReviews' },
      { source: fraudSource, name: 'getRecentTrustEvents' },
      { source: fraudSource, name: 'getFlaggedUsers' },
      { source: fraudSource, name: 'getFraudStats' },
      { source: fraudSource, name: 'getMultiAccountIps' },
      { source: healthSource, name: 'getHealthSummary' },
      { source: healthSource, name: 'getRecentErrors' },
    ]

    for (const { source, name } of guardedFunctions) {
      const start = source.indexOf(`export async function ${name}(`)
      expect(start, `missing data helper ${name}`).toBeGreaterThanOrEqual(0)
      const next = source.indexOf('\\nexport async function ', start + 1)
      const block = source.slice(start, next < 0 ? source.length : next)
      const authIndex = block.indexOf('await requireAdmin()')
      expect(authIndex, `${name} must authorize before reading`).toBeGreaterThanOrEqual(0)

      const serviceIndex = block.indexOf('createServiceClient()')
      if (serviceIndex >= 0) {
        expect(serviceIndex, `${name} must authorize before service role`).toBeGreaterThan(authIndex)
      }
    }
  })

  it('fails closed when the CRON_SECRET is missing', () => {
    const cronPaths = [
      '../app/api/cron/cleanup-errors/route.ts',
      '../app/api/cron/review-reminder/route.ts',
      '../app/api/cron/trial-notifications/route.ts',
      '../app/api/cron/trust-decay/route.ts',
    ]

    for (const relativePath of cronPaths) {
      const source = readFileSync(join(__dirname, relativePath), 'utf8')
      expect(source).toContain('const secret = process.env.CRON_SECRET')
      expect(source).toContain('if (!secret || auth !== `Bearer ${secret}`)')
    }
  })

  it('does not grant direct phone-lookup RPC access to public clients', () => {
    const sql = readMigration(phoneMigrationPath)

    expect(sql).toContain(
      'revoke all on function public.find_by_phone(text) from public, anon, authenticated',
    )
    expect(sql).toContain('grant execute on function public.find_by_phone(text) to service_role')
  })
})
