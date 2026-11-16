/**
 * Seed script — ensures the Baton sample template handover exists.
 * Run with: bun prisma/seed-template.ts   (or `npm run db:seed`)
 * Idempotent: safe to run repeatedly.
 */
import { ensureTemplate, TEMPLATE_KEY } from '../src/lib/handoverService'
import { prisma } from '../src/lib/db'

async function main() {
  const templateId = await ensureTemplate()
  const [sources, claims] = await Promise.all([
    prisma.sourceRecord.count({ where: { handoverId: templateId } }),
    prisma.claim.count({ where: { handoverId: templateId } }),
  ])
  console.log(
    `[seed] template "${TEMPLATE_KEY}" ready (${templateId}) — ${sources} sources, ${claims} claims`
  )
}

main()
  .catch((error) => {
    console.error('[seed] failed', error)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
