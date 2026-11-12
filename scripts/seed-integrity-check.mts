/**
 * Seed integrity check: every `exactSnippet` in seedCase.ts must appear
 * verbatim in the matching RAW_SOURCES content (claim_04's paraphrase is the
 * deliberate exception — it must NOT match, that is the point of its label).
 */
import { INITIAL_CLAIMS } from '../src/data/seedCase.ts'
import { RAW_SOURCES } from '../src/data/rawSources.ts'

let failures = 0
for (const claim of INITIAL_CLAIMS) {
  for (const quote of claim.sourceQuotes) {
    const source = RAW_SOURCES[quote.sourceId]
    if (!source) {
      console.log(`MISSING SOURCE: ${claim.id} -> ${quote.sourceId}`)
      failures++
      continue
    }
    const found = source.content.includes(quote.exactSnippet)
    const expected = claim.status !== 'quoted_unverified'
    if (found !== expected) {
      console.log(
        `${expected ? 'FAIL (not verbatim)' : 'FAIL (should not match but does)'}: ${claim.id} [${quote.sourceId}]`
      )
      failures++
    } else {
      console.log(`ok: ${claim.id} [${quote.sourceId}] ${found ? 'verbatim' : 'paraphrase (intended)'}`)
    }
  }
}
console.log(failures === 0 ? 'SEED CONSISTENT' : `${failures} FAILURES`)
process.exit(failures === 0 ? 0 : 1)
