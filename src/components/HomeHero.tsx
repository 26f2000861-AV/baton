"use client"

import { useRouter } from 'next/navigation'
import InkOrbitHero from '@/components/ui/ink-orbit-hero'

export default function HomeHero() {
  const router = useRouter()

  return (
    <InkOrbitHero
      theme="dark"
      titleTop="Accountable Handover With"
      titleAccent={[
        "Source-Backed Claims",
        "Deterministic Proofs",
        "Contradiction Resolvers",
        "Successor Sign-Offs",
      ]}
      description="Baton turns high-stakes engineering handovers into cryptographic, source-backed claim ledgers with zero unverified tribal knowledge."
      primaryCta="Enter Handover Workspace"
      onPrimary={() => router.push('/workspace')}
      secondaryCta={null}
      demoSteps={[]}
      proof={null}
      hud={false}
    />
  )
}

