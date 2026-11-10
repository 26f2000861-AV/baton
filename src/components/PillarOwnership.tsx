'use client'

import { Shield, KeyRound, User, MessageCircle, Calendar, Check, ExternalLink } from 'lucide-react'
import { OwnershipAsset } from '@/lib/types'

export default function PillarOwnership({
  assets,
  isAccepted,
  onInspect,
  onAccept,
  onUndo,
}: {
  assets: OwnershipAsset[]
  isAccepted: boolean
  onInspect: (claimId: string) => void
  onAccept: () => void
  onUndo: () => void
}) {
  return (
    <section id="ownership" className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-[#6B6B6B]">
            03 / Pillar
          </span>
          <h2 className="mt-0.5 text-xl font-semibold tracking-tight text-[#0A0A0A]">
            Ownership matrix
          </h2>
          <p className="mt-1 text-xs text-[#6B6B6B]">
            Who holds sole credentials, which assets have a truck factor of 1, and what access transfers by Nov 11?
          </p>
        </div>
        <button
          onClick={isAccepted ? onUndo : onAccept}
          className={`min-hit flex items-center gap-1.5 rounded-[6px] px-3 py-2 text-xs font-semibold transition ${
            isAccepted
              ? 'border border-[#E6E6E6] bg-[#EEEEEE] text-[#0A0A0A]'
              : 'border border-[#0A0A0A] bg-[#141414] text-white hover:bg-[#2a2a2a]'
          }`}
          aria-pressed={isAccepted}
          aria-label={isAccepted ? 'Undo ownership review' : 'Mark ownership reviewed'}
        >
          <Check size={14} />
          {isAccepted ? 'Undo review' : 'Mark reviewed'}
        </button>
      </div>

      {/* Critical Deadlines Callout - Strictly distinguishing Nov 10/11 transfer from Dec 1 rotation */}
      <div className="rounded-[8px] border border-[#E6E6E6] bg-[#FFFFFF] p-4">
        <div className="flex items-center gap-2 border-b border-[#F0F0F0] pb-2.5">
          <Calendar size={16} className="text-[#0A0A0A]" />
          <h3 className="text-sm font-semibold text-[#0A0A0A]">
            Access transfer deadlines vs. Credential rotation schedule
          </h3>
        </div>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <div className="rounded-[6px] border border-[#E6E6E6] bg-[#F2F4F7]/50 p-3">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#6B6B6B]">
              Handover Access Transfer Deadlines
            </span>
            <p className="mt-1 font-mono text-sm font-bold text-[#0A0A0A]">
              November 10 & 11, 2026
            </p>
            <p className="mt-1 text-xs text-[#6B6B6B]">
              Stripe admin IAM access transfers to Priya on Nov 10; Alex Chen offboarding completed on Nov 11.
            </p>
          </div>
          <div className="rounded-[6px] border border-[#E6E6E6] bg-[#F2F4F7]/50 p-3">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#6B6B6B]">
              Scheduled Credential Rotation Date
            </span>
            <p className="mt-1 font-mono text-sm font-bold text-[#0A0A0A]">
              December 1, 2026
            </p>
            <p className="mt-1 text-xs text-[#6B6B6B]">
              AWS Secrets Manager bi-annual Stripe webhook signing secret rotation (<code className="font-mono text-[11px]">prod/stripe/webhook_key</code>).
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {assets.map((asset) => {
          const isHighRiskTruckFactor = asset.ownershipIndex > 0.75
          return (
            <article
              key={asset.id}
              className="ledger-panel flex flex-col justify-between transition hover:border-[#0A0A0A]"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="rounded bg-[#EEEEEE] px-2 py-0.5 font-mono text-[11px] font-semibold text-[#0A0A0A]">
                      {asset.assetType.replaceAll('_', ' ')}
                    </span>
                    <h3 className="mt-2 text-base font-semibold text-[#0A0A0A]">
                      {asset.assetName}
                    </h3>
                  </div>
                  <div className="text-right">
                    <span className="monochrome-pill">
                      OCI {Math.round(asset.ownershipIndex * 100)}%
                    </span>
                    <span className="mt-1 block text-[10px] text-[#6B6B6B]">
                      {isHighRiskTruckFactor ? 'Truck factor 1.0 (Critical)' : 'Co-maintained'}
                    </span>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
                  <div className="rounded-[6px] border border-[#E6E6E6] bg-[#F2F4F7]/40 p-3">
                    <span className="text-[11px] font-semibold text-[#6B6B6B]">Current custodian</span>
                    <p className="mt-1 flex items-center gap-1.5 font-medium text-[#0A0A0A]">
                      <User size={14} className="text-[#6B6B6B]" />
                      {asset.currentOwner.name} ({asset.currentOwner.status})
                    </p>
                  </div>
                  <div className="rounded-[6px] border border-[#E6E6E6] bg-[#F2F4F7]/40 p-3">
                    <span className="text-[11px] font-semibold text-[#6B6B6B]">Escalation / Who to ask</span>
                    <p className="mt-1 flex items-center gap-1.5 font-medium text-[#0A0A0A]">
                      <MessageCircle size={14} className="text-[#6B6B6B]" />
                      {asset.escalationContact.name} ({asset.escalationContact.slackChannel})
                    </p>
                  </div>
                </div>

                {asset.credentialsAndAccess.adminAccessRequiresTransfer && (
                  <div className="mt-3 rounded-[6px] border border-[#363636] bg-[#181818] p-3 text-xs text-[#eeeeee]">
                    <div className="flex items-center gap-2 font-semibold">
                      <KeyRound size={14} className="text-[#0A0A0A]" />
                      <span>Admin access transfer deadline: {asset.credentialsAndAccess.transferDeadlineDate}</span>
                    </div>
                    <p className="mt-1 font-mono text-[11px] text-[#6B6B6B]">
                      Vault: {asset.credentialsAndAccess.credentialVaultPath}
                    </p>
                  </div>
                )}
              </div>

              {/* Baton pass line */}
              <div className="mt-5 pt-3 border-t border-[#F0F0F0]">
                <div className="baton-pass-line">
                  <span className="text-xs text-[#6B6B6B]">
                    {asset.id === 'own_01' ? 'Secrets Manager' : 'Service maintainers'}
                  </span>
                  <div className="pass-rule" />
                  <button
                    onClick={() => onInspect(asset.associatedClaimId)}
                    className="min-hit flex items-center gap-1 font-mono text-xs text-[#0A0A0A] hover:underline"
                    aria-label={`Inspect evidence for ${asset.assetName}`}
                  >
                    <span>{asset.id === 'own_01' ? 'aws_secrets' : 'pr_189'}</span>
                    <ExternalLink size={12} className="text-[#6B6B6B]" />
                  </button>
                </div>
              </div>
            </article>
          )
        })}

        {/* Contact Routing Matrix */}
        <article className="ledger-panel lg:col-span-2 flex flex-col justify-between transition hover:border-[#0A0A0A]">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#6B6B6B]">
                Contact Routing & Escalation Directory
              </span>
              <span className="monochrome-pill">Stated by leaver</span>
            </div>
            <h3 className="mt-2 text-sm font-semibold text-[#0A0A0A]">
              Routing table for unmonitored infrastructure domains
            </h3>
            <div className="mt-3 grid gap-3 sm:grid-cols-2 text-xs">
              <div className="rounded-[6px] border border-[#E6E6E6] bg-[#F2F4F7]/40 p-3">
                <span className="font-semibold text-[#0A0A0A]">Redis caching & cluster eviction queries:</span>
                <p className="mt-1 text-[#6B6B6B]">
                  Route directly to <strong className="text-[#0A0A0A]">Dev Patel (Staff SRE)</strong> in <code className="font-mono text-[11px]">#sre-infra</code>. Decommissioned for payment transactions per ADR-004.
                </p>
              </div>
              <div className="rounded-[6px] border border-[#E6E6E6] bg-[#F2F4F7]/40 p-3">
                <span className="font-semibold text-[#0A0A0A]">Database replication & skip locked:</span>
                <p className="mt-1 text-[#6B6B6B]">
                  Postgres pool concurrency capped at 16 threads per pod; escalation contact is <strong className="text-[#0A0A0A]">Vikram Malhotra</strong> in <code className="font-mono text-[11px]">#payment-eng</code>.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#F0F0F0]">
            <div className="baton-pass-line">
              <span className="text-xs text-[#6B6B6B]">Routing attested</span>
              <div className="pass-rule" />
              <button
                onClick={() => onInspect('claim_08')}
                className="min-hit flex items-center gap-1 font-mono text-xs text-[#0A0A0A] hover:underline"
                aria-label="Inspect routing provenance"
              >
                <span>claim_08</span>
                <ExternalLink size={12} className="text-[#6B6B6B]" />
              </button>
            </div>
          </div>
        </article>
      </div>
    </section>
  )
}
