import type { Metadata } from 'next'
import Link from 'next/link'
import StructuredData from '@/components/StructuredData'
import SiteHeader from '@/components/SiteHeader'
import SiteFooter from '@/components/SiteFooter'

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
      'A structured, evidence-backed record of a role’s work: decision records with rationale, open work with owners, unresolved risks with review status, and the source excerpts behind each claim. It is built so a successor can review it — and challenge it — instead of trusting a stale document.',
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
    <>
      <StructuredData id="ld-site" data={siteGraph} />
      <StructuredData id="ld-faq" data={faqGraph} />

      <SiteHeader />

      <main className="landing-page bg-[#0b0b0b]">
        {/* ── Hero ─────────────────────────────────────────────────────── */}
        <section
          aria-labelledby="hero-title"
          className="mx-auto flex w-full max-w-[1200px] flex-col items-center px-4 pb-16 pt-16 text-center sm:px-6 sm:pb-20 sm:pt-24 lg:px-8"
        >
          <p className="mb-5 font-mono text-xs uppercase tracking-[0.2em] text-[#a2a2a2]">
            Engineering handovers, made reviewable
          </p>
          <h1
            id="hero-title"
            className="max-w-4xl text-balance text-[clamp(2.1rem,5vw,3.6rem)] font-bold leading-[1.1] tracking-tight text-[#eeeeee]"
          >
            Engineering handovers with evidence
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-7 text-[#b8b8b8] sm:text-lg">
            Baton is engineering handover software that keeps decision records, open work,
            ownership, and unresolved risks together in one reviewable handover — with source
            evidence attached to every claim.
          </p>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[#8d8d8d] sm:text-base">
            When ownership changes, the next owner opens a shared, verifiable work history instead
            of digging through scattered threads and stale wikis.
          </p>

          {/* CTAs */}
          <div className="mt-9 flex flex-col items-center gap-3 sm:flex-row">
            <Link
              href="/signin"
              className="rounded-full border border-orange-500/30 bg-[#18181c] px-6 py-3 text-sm font-medium text-[#f4f4f5] shadow-[0_2px_8px_rgba(0,0,0,0.5)] transition-all duration-300 hover:-translate-y-0.5 hover:border-orange-500/50 hover:bg-[#1d1d22] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400/70"
            >
              Open a sample handover
            </Link>
            <a
              href="#how-it-works"
              className="rounded-full border border-[#333333] px-6 py-3 text-sm font-medium text-[#a2a2a2] transition-colors duration-300 hover:border-[#4a4a4a] hover:text-[#eeeeee] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-400"
            >
              See how it works
            </a>
          </div>

          {/* Sample conflict card — static server HTML */}
          <div className="mt-14 w-full max-w-2xl text-left">
            <div className="grid gap-3 border border-[#3b3b3b] bg-[#111111]/95 p-4 shadow-[0_12px_36px_rgba(0,0,0,0.38)] sm:p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-[#b8b8b8]">
                  Sample conflict
                </span>
                <span className="border border-[#5b4725] bg-[#2c2010] px-2 py-1 text-[10px] font-medium text-[#fbbf24]">
                  Needs human review
                </span>
              </div>
              <div>
                <h2 className="text-sm font-semibold text-[#eeeeee]">Metrics read path</h2>
                <p className="mt-1 text-xs leading-5 text-[#b8b8b8]">
                  Two project records describe different states.
                </p>
              </div>
              <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-stretch gap-2">
                <div className="min-w-0 border border-[#303030] bg-[#171717] p-2.5">
                  <span className="block text-[10px] text-[#a2a2a2]">GitHub PR #155</span>
                  <strong className="mt-1 block text-xs leading-5 text-[#eeeeee]">
                    VM dual-write live
                  </strong>
                </div>
                <span className="self-center font-mono text-[10px] text-[#a2a2a2]" aria-hidden="true">
                  vs
                </span>
                <div className="min-w-0 border border-[#303030] bg-[#171717] p-2.5">
                  <span className="block text-[10px] text-[#a2a2a2]">Slack #helios-eng</span>
                  <strong className="mt-1 block text-xs leading-5 text-[#eeeeee]">
                    Thanos reads restored
                  </strong>
                </div>
              </div>
              <p className="text-[11px] leading-4 text-[#a2a2a2]">
                Synthetic records · no connected source systems
              </p>
              <p className="text-[11px] leading-4 text-[#b8b8b8]">
                Lead records why · successor reviews the handover
              </p>
            </div>
          </div>
        </section>

        {/* ── How it works ─────────────────────────────────────────────── */}
        <section
          id="how-it-works"
          aria-labelledby="how-it-works-title"
          className="scroll-mt-20 border-t border-[#262626] bg-[#121212]/60 px-4 py-16 sm:px-6 sm:py-20 lg:px-8"
        >
          <div className="mx-auto w-full max-w-[1200px]">
            <div className="max-w-2xl">
              <h2
                id="how-it-works-title"
                className="text-balance text-2xl font-semibold tracking-tight text-[#eeeeee] sm:text-3xl"
              >
                How engineering handovers work in Baton
              </h2>
              <p className="mt-3 max-w-xl text-sm leading-6 text-[#a2a2a2] sm:text-base">
                A Baton handover moves context from the person doing the work to the next owner —
                with decisions, uncertainty, and evidence left visible at every step.
              </p>
            </div>

            <ol className="mt-10 grid grid-cols-1 border-y border-[#333333] md:mt-14 md:grid-cols-3">
              <li className="py-6 md:border-r md:border-[#333333] md:py-2 md:pr-8">
                <p className="mb-5 font-mono text-[11px] uppercase tracking-[0.14em] text-[#a2a2a2]">
                  01 · Capture
                </p>
                <h3 className="text-lg font-medium text-[#eeeeee]">Record the choice and why</h3>
                <p className="mt-2 max-w-sm text-sm leading-6 text-[#a2a2a2]">
                  Add a decision with its rationale, next action, and source reference while the
                  work is fresh. Decision records stay linked to the pull request, incident, or
                  runbook they came from, so every claim carries its provenance.
                </p>
              </li>

              <li className="border-t border-[#333333] py-6 md:border-r md:border-t-0 md:px-8 md:py-2">
                <p className="mb-5 font-mono text-[11px] uppercase tracking-[0.14em] text-[#a2a2a2]">
                  02 · Review
                </p>
                <h3 className="text-lg font-medium text-[#eeeeee]">Compare conflicting sources</h3>
                <p className="mt-2 max-w-sm text-sm leading-6 text-[#a2a2a2]">
                  Baton places the excerpts side by side and keeps the disagreement open until a
                  lead records why. Conflicting records are never silently merged away — the
                  contradiction waits for human review.
                </p>
              </li>

              <li className="border-t border-[#333333] py-6 md:border-t-0 md:pl-8 md:py-2">
                <p className="mb-5 font-mono text-[11px] uppercase tracking-[0.14em] text-[#a2a2a2]">
                  03 · Handover
                </p>
                <h3 className="text-lg font-medium text-[#eeeeee]">Pass context to the next owner</h3>
                <p className="mt-2 max-w-sm text-sm leading-6 text-[#a2a2a2]">
                  The decision, open work, owner, and remaining question carry into the successor’s
                  next step, closing with a sign-off that shows the handover was actually reviewed.
                </p>
              </li>
            </ol>
          </div>
        </section>

        {/* ── Why standard documentation fails ─────────────────────────── */}
        <section
          aria-labelledby="why-title"
          className="border-t border-[#262626] bg-[#0b0b0b] px-4 py-16 sm:px-6 sm:py-20 lg:px-8"
        >
          <div className="mx-auto grid w-full max-w-[1200px] gap-10 md:grid-cols-2 md:items-start">
            <div>
              <h2
                id="why-title"
                className="text-balance text-2xl font-semibold tracking-tight text-[#eeeeee] sm:text-3xl"
              >
                Why standard documentation fails during ownership changes
              </h2>
              <p className="mt-4 max-w-xl text-sm leading-7 text-[#a2a2a2] sm:text-base">
                Slack threads drift, wikis go stale, and pull requests get re-skimmed instead of
                read. When a senior engineer leaves, the rationale behind live decisions walks out
                with them — and the successor inherits tickets without context.
              </p>
              <p className="mt-4 max-w-xl text-sm leading-7 text-[#a2a2a2] sm:text-base">
                Baton treats a handover as evidence, not prose. Every claim is pinned to its
                source, every unresolved risk stays visible until someone owns it, and the
                ownership transfer ends with an explicit sign-off instead of a shrug.
              </p>
            </div>
            <ul className="space-y-4">
              <li className="border-l-2 border-[#333333] pl-5">
                <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-[#8d8d8d]">
                  Before Baton
                </p>
                <p className="mt-1.5 text-sm leading-6 text-[#a2a2a2]">
                  “Check the wiki” — last edited two quarters ago, by someone who has already left.
                </p>
              </li>
              <li className="border-l-2 border-[#333333] pl-5">
                <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-[#8d8d8d]">
                  With Baton
                </p>
                <p className="mt-1.5 text-sm leading-6 text-[#a2a2a2]">
                  Open the handover: decisions with sources, open work with owners, risks with
                  review status — signed off by a real person.
                </p>
              </li>
              <li className="border-l-2 border-[#333333] pl-5">
                <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-[#8d8d8d]">
                  The bar
                </p>
                <p className="mt-1.5 text-sm leading-6 text-[#a2a2a2]">
                  If the next owner cannot review the evidence and challenge the claims, it is not
                  a handover — it is a download.
                </p>
              </li>
            </ul>
          </div>
        </section>

        {/* ── Core capabilities ────────────────────────────────────────── */}
        <section
          id="capabilities"
          aria-labelledby="capabilities-title"
          className="scroll-mt-20 border-t border-[#262626] bg-[#121212]/60 px-4 py-16 sm:px-6 sm:py-20 lg:px-8"
        >
          <div className="mx-auto w-full max-w-[1200px]">
            <div className="max-w-2xl">
              <h2
                id="capabilities-title"
                className="text-balance text-2xl font-semibold tracking-tight text-[#eeeeee] sm:text-3xl"
              >
                Core capabilities
              </h2>
              <p className="mt-3 max-w-xl text-sm leading-6 text-[#a2a2a2] sm:text-base">
                Four pillars keep a handover reviewable long after the people have moved on.
              </p>
            </div>

            <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="border border-[#2e2e2e] bg-[#111111]/95 p-5">
                <h3 className="text-base font-medium text-[#eeeeee]">Decision logs</h3>
                <p className="mt-2 text-sm leading-6 text-[#a2a2a2]">
                  Every decision record captures the choice, the why, and the next action — with
                  the source excerpt that supports it.
                </p>
              </div>
              <div className="border border-[#2e2e2e] bg-[#111111]/95 p-5">
                <h3 className="text-base font-medium text-[#eeeeee]">Risk registers</h3>
                <p className="mt-2 text-sm leading-6 text-[#a2a2a2]">
                  Unresolved risks and contradictions stay in a human-reviewed queue until a lead
                  settles them with a recorded rationale.
                </p>
              </div>
              <div className="border border-[#2e2e2e] bg-[#111111]/95 p-5">
                <h3 className="text-base font-medium text-[#eeeeee]">Ownership sign-offs</h3>
                <p className="mt-2 text-sm leading-6 text-[#a2a2a2]">
                  Leaver, lead, and successor each attest their part; the handover closes with an
                  accepted sign-off, not a silent assumption.
                </p>
              </div>
              <div className="border border-[#2e2e2e] bg-[#111111]/95 p-5">
                <h3 className="text-base font-medium text-[#eeeeee]">Audit trails</h3>
                <p className="mt-2 text-sm leading-6 text-[#a2a2a2]">
                  Imports, edits, sign-offs, and resets are logged, so the verifiable work history
                  can be replayed and reviewed later.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── FAQ ──────────────────────────────────────────────────────── */}
        <section
          id="faq"
          aria-labelledby="faq-title"
          className="scroll-mt-20 border-t border-[#262626] bg-[#0b0b0b] px-4 py-16 sm:px-6 sm:py-20 lg:px-8"
        >
          <div className="mx-auto w-full max-w-3xl">
            <h2
              id="faq-title"
              className="text-balance text-2xl font-semibold tracking-tight text-[#eeeeee] sm:text-3xl"
            >
              Frequently asked questions
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-6 text-[#a2a2a2] sm:text-base">
              Short answers about the engineering handover workflow, evidence, and privacy.
            </p>

            <div className="mt-8 space-y-3">
              {FAQ_ITEMS.map((item) => (
                <details
                  key={item.question}
                  className="group border border-[#2e2e2e] bg-[#111111]/95 px-5 py-4 [&_summary::-webkit-details-marker]:hidden"
                >
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-medium text-[#eeeeee] transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-400">
                    {item.question}
                    <span
                      aria-hidden="true"
                      className="font-mono text-xs text-[#8d8d8d] transition-transform duration-300 group-open:rotate-45"
                    >
                      +
                    </span>
                  </summary>
                  <p className="mt-3 text-sm leading-7 text-[#a2a2a2]">{item.answer}</p>
                </details>
              ))}
            </div>

            <p className="mt-10 text-center text-sm text-[#8d8d8d]">
              Ready to look around?{' '}
              <Link
                href="/signin"
                className="text-[#eeeeee] underline decoration-[#4a4a4a] underline-offset-4 transition-colors hover:decoration-[#eeeeee]"
              >
                Open a sample handover
              </Link>{' '}
              — pre-configured review seats, no setup required.
            </p>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  )
}
