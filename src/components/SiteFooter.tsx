import Link from 'next/link'
import BrandMark from '@/components/BrandMark'
import ContactEmail from '@/components/ContactEmail'

const GITHUB_REPO = 'https://github.com/26f2000861-AV/baton'

/**
 * Public landing footer — fully server-rendered semantic <footer> with
 * in-HTML links (product anchors, access routes, project links) plus a
 * spam-resistant contact email island. External links carry
 * rel="noopener noreferrer".
 */
export default function SiteFooter() {
  return (
    <footer className="border-t border-[#262626] bg-[#0d0d0d]">
      <div className="mx-auto max-w-[1200px] px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)]">
          {/* Brand + description */}
          <div>
            <div className="flex items-center gap-2.5">
              <BrandMark />
              <span className="text-[16px] font-semibold tracking-[-0.025em] text-[#eeeeee]">Baton</span>
            </div>
            <p className="mt-4 max-w-sm text-sm leading-6 text-[#8d8d8d]">
              Engineering handover software that keeps decision records, open work, ownership, and
              unresolved risks together with source evidence — so the next owner can review the
              handover with confidence.
            </p>
            <div className="mt-5">
              <ContactEmail />
            </div>
          </div>

          {/* Product */}
          <nav aria-label="Product" className="text-sm">
            <h3 className="mb-3 font-mono text-[11px] uppercase tracking-[0.14em] text-[#8d8d8d]">
              Product
            </h3>
            <ul className="space-y-2.5">
              <li>
                <a href="/#how-it-works" className="text-[#a2a2a2] transition-colors hover:text-[#eeeeee]">
                  How it works
                </a>
              </li>
              <li>
                <a href="/#capabilities" className="text-[#a2a2a2] transition-colors hover:text-[#eeeeee]">
                  Core capabilities
                </a>
              </li>
              <li>
                <a href="/#faq" className="text-[#a2a2a2] transition-colors hover:text-[#eeeeee]">
                  FAQ
                </a>
              </li>
            </ul>
          </nav>

          {/* Access */}
          <nav aria-label="Access" className="text-sm">
            <h3 className="mb-3 font-mono text-[11px] uppercase tracking-[0.14em] text-[#8d8d8d]">
              Access
            </h3>
            <ul className="space-y-2.5">
              <li>
                <Link href="/signin" className="text-[#a2a2a2] transition-colors hover:text-[#eeeeee]">
                  Sign in
                </Link>
              </li>
              <li>
                <Link href="/workspace" className="text-[#a2a2a2] transition-colors hover:text-[#eeeeee]">
                  Open workspace
                </Link>
              </li>
              <li>
                <a
                  href={`${GITHUB_REPO}#readme`}
                  rel="noopener noreferrer"
                  target="_blank"
                  className="text-[#a2a2a2] transition-colors hover:text-[#eeeeee]"
                >
                  README &amp; docs
                </a>
              </li>
            </ul>
          </nav>

          {/* Project */}
          <nav aria-label="Project" className="text-sm">
            <h3 className="mb-3 font-mono text-[11px] uppercase tracking-[0.14em] text-[#8d8d8d]">
              Project
            </h3>
            <ul className="space-y-2.5">
              <li>
                <a
                  href={GITHUB_REPO}
                  rel="noopener noreferrer"
                  target="_blank"
                  className="text-[#a2a2a2] transition-colors hover:text-[#eeeeee]"
                >
                  GitHub repository
                </a>
              </li>
              <li>
                <a
                  href={`${GITHUB_REPO}/issues`}
                  rel="noopener noreferrer"
                  target="_blank"
                  className="text-[#a2a2a2] transition-colors hover:text-[#eeeeee]"
                >
                  Report an issue
                </a>
              </li>
            </ul>
          </nav>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-[#1e1e1e] pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-[#8d8d8d]">
            © 2026 Baton — engineering handovers with evidence. Built by Team GIT LOST for
            CodersInPune 2026.
          </p>
          <p className="font-mono text-xs text-[#666666]">gitlostbaton.xyz</p>
        </div>
      </div>
    </footer>
  )
}
