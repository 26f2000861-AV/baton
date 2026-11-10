import type { Metadata } from 'next'
import HomeHero from '@/components/HomeHero'

export const metadata: Metadata = {
  title: 'Baton | Engineering handovers with evidence',
  description: 'Keep decisions, open work, ownership, and unresolved risks together so the next owner can review the handover with confidence.',
}

export default function LandingPage() {
  return (
    <main className="landing-page min-h-screen bg-[#0b0b0b]">
      <HomeHero />
    </main>
  )
}
