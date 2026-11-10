export interface VerificationResult {
  isExactMatch: boolean
  charStart: number
  charEnd: number
  normalizedQuote: string
  suggestedStatus: 'quoted_verified' | 'quoted_unverified'
  explanation: string
}

/**
 * Deterministically checks whether a quoted snippet exists verbatim
 * inside the raw source text. No LLM required.
 */
export function verifyQuoteAgainstSource(
  sourceRawText: string,
  quoteSnippet: string
): VerificationResult {
  if (!sourceRawText || !quoteSnippet) {
    return {
      isExactMatch: false,
      charStart: -1,
      charEnd: -1,
      normalizedQuote: quoteSnippet || '',
      suggestedStatus: 'quoted_unverified',
      explanation: 'Empty source text or quote provided.',
    }
  }

  // Normalize CRLF to LF and trim leading/trailing whitespace
  const normalizedSource = sourceRawText.replace(/\r\n/g, '\n')
  const normalizedQuote = quoteSnippet.trim().replace(/\r\n/g, '\n')

  if (!normalizedQuote) {
    return {
      isExactMatch: false,
      charStart: -1,
      charEnd: -1,
      normalizedQuote,
      suggestedStatus: 'quoted_unverified',
      explanation: 'Quote contains only whitespace.',
    }
  }

  const charStart = normalizedSource.indexOf(normalizedQuote)

  if (charStart === -1) {
    // Attempt relaxed whitespace check to detect near-miss paraphrasing
    const squashedSource = normalizedSource.replace(/\s+/g, ' ')
    const squashedQuote = normalizedQuote.replace(/\s+/g, ' ')
    const isNearMiss = squashedSource.includes(squashedQuote)

    return {
      isExactMatch: false,
      charStart: -1,
      charEnd: -1,
      normalizedQuote,
      suggestedStatus: 'quoted_unverified',
      explanation: isNearMiss
        ? 'Quote failed exact matching; its whitespace differs from the source. Suggested label: unverified.'
        : 'Quote was not found verbatim in the source document. Suggested label: unverified.',
    }
  }

  return {
    isExactMatch: true,
    charStart,
    charEnd: charStart + normalizedQuote.length,
    normalizedQuote,
    suggestedStatus: 'quoted_verified',
    explanation: 'Verbatim character sequence found in the synthetic source.',
  }
}
