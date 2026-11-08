import { NextResponse } from 'next/server'
import { RAW_SOURCES } from '../../../data/rawSources'
import { checkClaimEntailmentWithGemini } from '../../../lib/gemini'
import { verifyQuoteAgainstSource } from '../../../lib/verifier'

export async function POST(req: Request) {
  try {
    const { sourceId, quoteSnippet, claimStatement } = await req.json()

    const rawSource = RAW_SOURCES[sourceId]
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
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'Verification failure' },
      { status: 500 }
    )
  }
}
