import { NextResponse } from 'next/server'
import { RAW_SOURCES } from '../../../data/rawSources'
import { checkClaimEntailmentWithGemini } from '../../../lib/gemini'
import { verifyQuoteAgainstSource } from '../../../lib/verifier'

export async function POST(req: Request) {
  try {
    const body: unknown = await req.json()
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Expected a JSON object.' }, { status: 400 })
    }
    const { sourceId, quoteSnippet, claimStatement } = body as Record<string, unknown>
    if (
      typeof sourceId !== 'string' || sourceId.length > 100 ||
      typeof quoteSnippet !== 'string' || quoteSnippet.length === 0 || quoteSnippet.length > 8000 ||
      (claimStatement !== undefined && (typeof claimStatement !== 'string' || claimStatement.length > 2000))
    ) {
      return NextResponse.json({ error: 'Invalid verification request.' }, { status: 400 })
    }

    const rawSource = Object.hasOwn(RAW_SOURCES, sourceId) ? RAW_SOURCES[sourceId] : undefined
    if (!rawSource) {
      return NextResponse.json(
        { error: `Source with id "${sourceId}" not found in repository.` },
        { status: 404 }
      )
    }

    // Step 1: Deterministic Substring Verification
    const deterministicCheck = verifyQuoteAgainstSource(
      rawSource.content,
      quoteSnippet
    )

    // Step 2: Optional Natural Language Entailment
    let entailmentResult = null
    if (deterministicCheck.isExactMatch && claimStatement) {
      entailmentResult = await checkClaimEntailmentWithGemini(
        claimStatement,
        quoteSnippet
      )
    }

    return NextResponse.json({
      deterministicCheck,
      entailmentResult,
      rawSourceMeta: {
        id: rawSource.id,
        title: rawSource.title,
        uri: rawSource.uri,
        author: rawSource.author,
        timestamp: rawSource.timestamp,
        requiredClearanceLevel: rawSource.requiredClearanceLevel,
      },
    })
  } catch {
    return NextResponse.json(
      { error: 'Verification request could not be processed.' },
      { status: 500 }
    )
  }
}
