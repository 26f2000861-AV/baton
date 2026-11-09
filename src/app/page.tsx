import type { Metadata } from 'next'
import HomeHero from '@/components/HomeHero'

export const metadata: Metadata = {
  title: 'Baton | Payment Core handover',
  description: 'Review the Payment Core handover, resolve its routing conflict, and track successor acceptance.',
}

export default function LandingPage() {
  return (
    <main className="landing-page min-h-screen bg-[#0b0b0b]">
      <HomeHero />
    </main>
  )
}
