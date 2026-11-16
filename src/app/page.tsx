import type { Metadata } from 'next'
import HomeHero from '@/components/HomeHero'
import StructuredData from '@/components/StructuredData'

const SITE_URL = 'https://www.gitlostbaton.xyz'
const GITHUB_REPO = 'https://github.com/26f2000861-AV/baton'
const DESCRIPTION =
  'Keep engineering decisions, open work, ownership, and source records together so the next owner can review the handover with confidence.'

/**
 * Single source of truth for the FAQ: rendered as native <details> markup
 * (zero-JavaScript interactivity, keyboard and screen-reader accessible)
 * and mirrored into FAQPage JSON-LD for search engines and LLMs.
 */
const FAQ_ITEMS: { question: string; answer: string }[] = [
  {
    question: 'What is an engineering handover in Baton?',
    answer:
      'A structured, evidence-backed record of a role’s work: decision records with rationale, open work with owners, unresolved risks with review status, and the source excerpts behind each claim. It is built so a successor can review the handover — and challenge it — instead of trusting a stale document.',
  },
  {
    question: 'How does Baton verify claims?',
    answer:
      'Every claim in the ledger is pinned to source evidence — a pull request, incident, ticket, or runbook excerpt. Conflicts between sources are surfaced instead of hidden, and they stay open until a lead records why the disagreement exists.',
  },
  {
    question: 'Can I try Baton without connecting GitHub?',
    answer:
      'Yes. The walkthrough uses a synthetic sample case with pre-configured review seats — successor, lead, and leaver — cloned privately for you when you sign in. No setup is required, and your workspace, history, and sign-offs are saved on the server across devices.',
  },
  {
    question: 'What happens when two sources disagree?',
    answer:
      'The contradiction enters a human review queue instead of being averaged away. A lead settles it with a recorded rationale, and both the conflict and its resolution stay visible in the handover’s history.',
  },
  {
    question: 'Is my workspace data private?',
    answer:
      'Yes. Workspaces are reader-scoped: each seat sees the claims and sources relevant to its role. Nothing you do in the demo is shared with other visitors.',
  },
]

/** Organization / WebSite / SoftwareApplication identity graph (GEO + SEO). */
const siteGraph = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': `${SITE_URL}/#organization`,
      name: 'Baton',
      url: `${SITE_URL}/`,
      logo: `${SITE_URL}/icon.svg`,
      sameAs: [GITHUB_REPO],
      contactPoint: [
        {
          '@type': 'ContactPoint',
          contactType: 'technical support',
          url: `${GITHUB_REPO}/issues`,
          availableLanguage: ['en'],
        },
      ],
    },
    {
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      url: `${SITE_URL}/`,
      name: 'Baton',
      description: DESCRIPTION,
      publisher: { '@id': `${SITE_URL}/#organization` },
      inLanguage: 'en-US',
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Baton',
      applicationCategory: 'DeveloperApplication',
      operatingSystem: 'Web',
      url: `${SITE_URL}/`,
      description: DESCRIPTION,
      publisher: { '@id': `${SITE_URL}/#organization` },
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
}

const faqGraph = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: FAQ_ITEMS.map((item) => ({
    '@type': 'Question',
    name: item.question,
    acceptedAnswer: { '@type': 'Answer', text: item.answer },
  })),
}

export const metadata: Metadata = {
  alternates: { canonical: '/', languages: { 'en-US': '/' } },
}

export default function LandingPage() {
  return (
    <main className="landing-page min-h-screen bg-[#0b0b0b]">
      <StructuredData id="ld-site" data={siteGraph} />
      <StructuredData id="ld-faq" data={faqGraph} />

      {/* Interactive hero, workflow section and footer (client-rendered). */}
      <HomeHero>
        {/*
         * Server-rendered crawlable content between the interactive workflow
         * section and the footer: what the handover tracks, and the FAQ.
         * Ships as plain HTML in the initial response so search engines and
         * answer engines can read it without executing any JavaScript.
         */}
        <section
          id="capabilities"
          aria-labelledby="capabilities-title"
          className="border-t border-white/[0.06] bg-[#0b0b0b] py-16 sm:py-20"
        >
          <div className="mx-auto w-full max-w-[1200px] px-4 sm:px-6 lg:px-8">
            <p className="mb-3 font-mono text-xs uppercase tracking-[0.2em] text-[#a2a2a2]">
              The four pillars
            </p>
            <h2
              id="capabilities-title"
              className="max-w-2xl text-balance text-2xl font-semibold tracking-tight text-[#eeeeee] sm:text-3xl"
            >
              What every engineering handover tracks
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-[#a2a2a2] sm:text-base">
              An engineering handover in Baton is a ledger, not a document: every entry about
              ownership, open work, or unresolved risk carries its source evidence and its
              review status, so the next owner can audit it claim by claim.
            </p>

            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              <div className="border border-white/[0.07] bg-white/[0.02] p-5 sm:p-6">
                <h3 className="text-base font-medium text-[#eeeeee]">
                  Decision records with rationale
                </h3>
                <p className="mt-2 text-sm leading-6 text-[#a2a2a2]">
                  Every decision record keeps the choice, the alternatives considered, and a
                  confidence rating — captured while working, not reconstructed months later.
                </p>
              </div>
              <div className="border border-white/[0.07] bg-white/[0.02] p-5 sm:p-6">
                <h3 className="text-base font-medium text-[#eeeeee]">
                  Open work and technical debt
                </h3>
                <p className="mt-2 text-sm leading-6 text-[#a2a2a2]">
                  Open work items arrive with severity, impact, and a first-30-days triage
                  roadmap the successor can adopt directly into their own queue.
                </p>
              </div>
              <div className="border border-white/[0.07] bg-white/[0.02] p-5 sm:p-6">
                <h3 className="text-base font-medium text-[#eeeeee]">
                  Ownership and contact routing
                </h3>
                <p className="mt-2 text-sm leading-6 text-[#a2a2a2]">
                  A living ownership matrix maps each system asset to its active owner,
                  designated successor, transfer date, and escalation contact.
                </p>
              </div>
              <div className="border border-white/[0.07] bg-white/[0.02] p-5 sm:p-6">
                <h3 className="text-base font-medium text-[#eeeeee]">
                  Unresolved risk and contradictions
                </h3>
                <p className="mt-2 text-sm leading-6 text-[#a2a2a2]">
                  When two sources disagree, the unresolved risk lands in a human review queue
                  with the evidence on both sides — settled by a lead, never averaged away.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section
          id="evidence"
          aria-labelledby="evidence-title"
          className="border-t border-white/[0.06] bg-[#0b0b0b] py-16 sm:py-20"
        >
          <div className="mx-auto w-full max-w-[1200px] px-4 sm:px-6 lg:px-8">
            <p className="mb-3 font-mono text-xs uppercase tracking-[0.2em] text-[#a2a2a2]">
              Provenance, not prose
            </p>
            <h2
              id="evidence-title"
              className="max-w-2xl text-balance text-2xl font-semibold tracking-tight text-[#eeeeee] sm:text-3xl"
            >
              Evidence attached to every claim
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-[#a2a2a2] sm:text-base">
              Each statement in a handover links back to the record that produced it, with a
              character-precise excerpt a successor can open and read in context.
            </p>
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <div className="border border-white/[0.07] bg-white/[0.02] p-5">
                <h3 className="text-sm font-medium text-[#eeeeee]">Pull requests and commits</h3>
                <p className="mt-2 text-sm leading-6 text-[#a2a2a2]">
                  Imported straight from GitHub, with author, date, and a link back to the origin
                  record.
                </p>
              </div>
              <div className="border border-white/[0.07] bg-white/[0.02] p-5">
                <h3 className="text-sm font-medium text-[#eeeeee]">Tickets and incidents</h3>
                <p className="mt-2 text-sm leading-6 text-[#a2a2a2]">
                  Quoted verbatim with offsets, so a summary can never drift from what the source
                  actually said.
                </p>
              </div>
              <div className="border border-white/[0.07] bg-white/[0.02] p-5">
                <h3 className="text-sm font-medium text-[#eeeeee]">Runbooks and threads</h3>
                <p className="mt-2 text-sm leading-6 text-[#a2a2a2]">
                  Captured while the work happens, then verified — not reconstructed from memory
                  after the owner has left.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section
          id="faq"
          aria-labelledby="faq-title"
          className="border-t border-white/[0.06] bg-[#0b0b0b] py-16 sm:py-20"
        >
          <div className="mx-auto w-full max-w-[900px] px-4 sm:px-6 lg:px-8">
            <p className="mb-3 font-mono text-xs uppercase tracking-[0.2em] text-[#a2a2a2]">
              Questions engineers ask
            </p>
            <h2
              id="faq-title"
              className="text-balance text-2xl font-semibold tracking-tight text-[#eeeeee] sm:text-3xl"
            >
              Frequently asked questions
            </h2>

            <div className="mt-8 divide-y divide-white/[0.06] border-y border-white/[0.06]">
              {FAQ_ITEMS.map((item) => (
                <details key={item.question} className="group py-4">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-left text-sm font-medium text-[#eeeeee] transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-400 sm:text-base">
                    <h3 className="text-base font-medium text-inherit sm:text-[15px]">{item.question}</h3>
                    <span
                      aria-hidden="true"
                      className="mt-0.5 shrink-0 text-lg leading-none text-[#a2a2a2] transition-transform duration-200 group-open:rotate-45"
                    >
                      +
                    </span>
                  </summary>
                  <p className="mt-3 max-w-3xl text-sm leading-6 text-[#a2a2a2]">
                    {item.answer}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section
          aria-labelledby="cta-title"
          className="border-t border-white/[0.06] bg-[#0b0b0b] py-16 sm:py-20"
        >
          <div className="mx-auto flex w-full max-w-[900px] flex-col items-center px-4 text-center sm:px-6">
            <h2
              id="cta-title"
              className="text-balance text-2xl font-semibold tracking-tight text-[#eeeeee] sm:text-3xl"
            >
              Review a sample handover in under a minute
            </h2>
            <p className="mt-4 max-w-xl text-sm leading-6 text-[#a2a2a2] sm:text-base">
              Open the pre-configured successor seat and walk a real handover end to end — decisions,
              open work, ownership, and the contradictions waiting for a human call.
            </p>
            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
              <a
                href="/signin"
                className="rounded-full border border-orange-500/30 bg-[#18181c] px-6 py-3 text-sm font-medium text-[#f4f4f5] shadow-[0_2px_8px_rgba(0,0,0,0.5)] transition-all duration-300 hover:-translate-y-0.5 hover:border-orange-500/50 hover:bg-[#1d1d22] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400/70"
              >
                Open a sample handover
              </a>
            </div>
          </div>
        </section>
      </HomeHero>
    </main>
  )
}
