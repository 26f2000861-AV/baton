export const dynamic = 'force-dynamic'

/**
 * Liveness probe for the Round 3 reliability story.
 *
 * Intentionally unauthenticated so uptime monitors, deploy platforms, and
 * evaluators can poll it without a session. Leaks nothing internal: only
 * the service identity, an ISO-8601 timestamp, and a process uptime in
 * seconds. Uses the web-standard Response so the handler stays importable
 * and unit-testable outside the Next.js runtime (tests/health.test.mts).
 */
export async function GET() {
  return Response.json(
    {
      status: 'ok',
      service: 'baton',
      version: '0.1.0',
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.round(process.uptime()),
    },
    { headers: { 'Cache-Control': 'no-store' } }
  )
}
