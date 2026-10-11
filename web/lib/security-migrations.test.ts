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
  })

  it('validates ownership within SECURITY DEFINER badge checks', () => {
    const sql = readMigration(migrationPath)

    expect(sql.match(/auth\.uid\(\) = p_user_id/g)?.length ?? 0).toBeGreaterThanOrEqual(3)
    expect(sql.match(/not public\.is_admin\(\)/g)).toHaveLength(3)
    expect(sql.match(/auth\.jwt\(\) ->> 'role'/g)).toHaveLength(3)
  })

  it('does not grant direct phone-lookup RPC access to public clients', () => {
    const sql = readMigration(phoneMigrationPath)

    expect(sql).toContain(
      'revoke all on function public.find_by_phone(text) from public, anon, authenticated',
    )
    expect(sql).toContain(
      'grant execute on function public.find_by_phone(text) to service_role',
    )
  })
})
