import Link from 'next/link'
import BrandMark from '@/components/BrandMark'
import EntryCta from '@/components/EntryCta'

/**
 * Public landing header — fully server-rendered. The only client island
 * is <EntryCta />, which upgrades the CTA for signed-in visitors after
 * hydration. Everything else (brand, anchor links) ships in the static HTML.
 */
export default function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 w-full border-b border-white/[0.07] bg-[#0b0b0b]/80 backdrop-blur-xl transition-colors">
      <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand */}
        <Link
          href="/"
          aria-label="Baton home"
          className="group/baton inline-flex items-center gap-2.5 rounded-lg py-1.5 px-2 -ml-2 transition-all duration-200 hover:bg-white/[0.03] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-400"
        >
          <BrandMark />
          <span className="text-[16px] font-semibold tracking-[-0.025em] text-[#eeeeee] transition-colors duration-200 group-hover/baton:text-white">
            Baton
          </span>
        </Link>

        {/* Anchor navigation (public content sections) */}
        <nav aria-label="Landing sections" className="hidden md:flex items-center gap-6 text-sm">
          <a
            href="#how-it-works"
            className="text-[#a2a2a2] transition-colors duration-200 hover:text-[#eeeeee] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-400"
          >
            How it works
          </a>
          <a
            href="#capabilities"
            className="text-[#a2a2a2] transition-colors duration-200 hover:text-[#eeeeee] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-400"
          >
            Capabilities
          </a>
          <a
            href="#faq"
            className="text-[#a2a2a2] transition-colors duration-200 hover:text-[#eeeeee] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-400"
          >
            FAQ
          </a>
        </nav>

        {/* Session-aware CTA island */}
        <div className="flex items-center gap-3 sm:gap-5">
          <EntryCta />
        </div>
      </div>
    </header>
  )
}
