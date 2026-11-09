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
      secondaryCta="Watch Handover Demo"
      demoSteps={[
        { label: "Ingest Sources", detail: "Extracting 8 GitHub PRs, Slack threads, and Linear tickets" },
        { label: "Ledger Claims", detail: "Cataloging 9 core architectural claims and routing commitments" },
        { label: "Conflict Queue", detail: "Surfaced open conflict: SQS FIFO vs RabbitMQ cluster" },
        { label: "Deterministic Check", detail: "Exact substring matching against immutable source commits" },
        { label: "Successor Sign-Off", detail: "Ready for Payment Core ownership transfer and sign-off" },
      ]}
      proof={{ before: "Trusted across", value: "14,200+", after: "engineering teams" }}
    />
  )
}

