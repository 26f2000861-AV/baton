import test from 'node:test'
import assert from 'node:assert/strict'
import { getTenantDb } from '../src/lib/db.ts'

test('getTenantDb requires a non-empty string handoverId', () => {
  assert.throws(
    () => getTenantDb(''),
    /A valid handoverId is required/
  )
  assert.throws(
    () => getTenantDb(null as any),
    /A valid handoverId is required/
  )
})

test('getTenantDb returns an extended tenant-bound Prisma client', () => {
  const tenantClient = getTenantDb('cuid_1234567890abcdef')
  assert.ok(tenantClient)
  assert.equal(typeof tenantClient.claim, 'object')
  assert.equal(typeof tenantClient.workUpdate, 'object')
})
