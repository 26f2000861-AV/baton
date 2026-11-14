import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') {
  // Reuse the client across hot reloads in development.
  globalForPrisma.prisma = prisma
}

const TENANT_MODELS = new Set([
  'claim',
  'sourceRecord',
  'architecturalDecision',
  'unfinishedWorkItem',
  'ownershipAsset',
  'contradiction',
  'leaverInterviewQuestion',
  'successorQuery',
  'sectionState',
  'workUpdate',
  'activityLog',
  'importJob',
])

/**
 * Creates a tenant-isolated Prisma client scoped strictly to a single handoverId.
 * Guarantees that all queries and mutations on tenant resources (Claims, Sources,
 * Contradictions, Work Updates, etc.) automatically enforce the specified handoverId,
 * preventing cross-tenant leakage by design (Remediation for SEC-07).
 */
export function getTenantDb(handoverId: string) {
  if (!handoverId || typeof handoverId !== 'string') {
    throw new Error('A valid handoverId is required to instantiate a tenant-scoped database client.')
  }

  return prisma.$extends({
    query: {
      $allModels: {
        async $allOperations({ model, operation, args, query }) {
          const modelKey = model.charAt(0).toLowerCase() + model.slice(1)
          if (TENANT_MODELS.has(modelKey)) {
            const extendedArgs = (args ?? {}) as {
              where?: Record<string, unknown>
              data?: Record<string, unknown>
            }

            if (['findFirst', 'findMany', 'count', 'aggregate', 'deleteMany', 'updateMany'].includes(operation)) {
              extendedArgs.where = {
                ...extendedArgs.where,
                handoverId,
              }
            }

            if (operation === 'create') {
              extendedArgs.data = {
                ...extendedArgs.data,
                handoverId,
              }
            }
            return query(extendedArgs as typeof args)
          }
          return query(args)
        },
      },
    },
  })
}
