'use client'

import { RotateCcw, ChevronDown, MessageSquare, ShieldAlert } from 'lucide-react'
import { useHandover } from '@/lib/store'
import { PersonaRole } from '@/lib/types'
import BatonMark from './BatonMark'

export default function Header({
  onInterview,
  onExposure,
}: {
  onInterview?: () => void
  onExposure?: () => void
}) {
  const { activePersona, setActivePersonaRole, resetDemoData, withheldCount, questions } =
    useHandover()

  const pendingQuestionsCount = questions.filter((q) => q.status === 'pending_answer').length

  return (
    <header className="sticky top-0 z-20 border-b border-[#E6E6E6] bg-[#FFFFFF] px-4 py-3 sm:px-6">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
        {/* Left: Baton identity & scope */}
        <div className="flex items-center gap-3">
          <BatonMark />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold tracking-tight text-[#0A0A0A]">Baton</span>
              <span className="rounded bg-[#EEEEEE] px-1.5 py-0.5 text-[10px] font-semibold text-[#6B6B6B]">
                HANDOVER LEDGER
              </span>
            </div>
            <p className="text-xs text-[#6B6B6B]">FinTrack / Payment Core Service</p>
          </div>
        </div>

        {/* Right: Actions, Persona Switcher & Reset */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Leaver Focus Interview Action */}
          <button
            onClick={onInterview}
            className="min-hit flex items-center gap-1.5 rounded-[6px] border border-[#D4D4D4] bg-white px-3 py-2 text-xs font-medium text-[#0A0A0A] transition hover:bg-[#EEEEEE] hover:border-[#0A0A0A]"
            title="Open Gap-Driven Leaver Focus Interview"
            aria-label="Open Leaver Focus Interview"
          >
            <MessageSquare size={14} className="text-[#0A0A0A]" />
            <span className="hidden sm:inline">Leaver interview</span>
            {pendingQuestionsCount > 0 && (
              <span className="rounded-full bg-[#EEEEEE] px-1.5 py-0.2 text-[10px] font-bold text-[#0A0A0A]">
                {pendingQuestionsCount}
              </span>
            )}
          </button>

          {/* Clearance Exposure Diff Action */}
          <button
            onClick={onExposure}
            className="min-hit flex items-center gap-1.5 rounded-[6px] border border-[#D4D4D4] bg-white px-3 py-2 text-xs font-medium text-[#0A0A0A] transition hover:bg-[#EEEEEE] hover:border-[#0A0A0A]"
            title="Open Clearance Exposure Diff"
            aria-label="Open Clearance Exposure Diff"
          >
            <ShieldAlert size={14} className="text-[#0A0A0A]" />
            <span className="hidden sm:inline">Clearance diff</span>
            {withheldCount > 0 && (
              <span className="rounded-full bg-[#EEEEEE] px-1.5 py-0.2 text-[10px] font-bold text-[#0A0A0A]">
                {withheldCount}
              </span>
            )}
          </button>

          {/* Persona Switcher */}
          <div className="relative">
            <label
              htmlFor="persona-select"
              className="min-hit flex cursor-pointer items-center gap-2 rounded-[6px] border border-[#D4D4D4] bg-white px-3 py-2 text-xs text-[#0A0A0A] hover:border-[#0A0A0A]"
            >
              <span className="text-sm">{activePersona.avatar}</span>
              <select
                id="persona-select"
                value={activePersona.role}
                onChange={(e) => setActivePersonaRole(e.target.value as PersonaRole)}
                className="min-h-[44px] cursor-pointer appearance-none bg-transparent pr-4 font-medium text-[#0A0A0A] outline-none"
                aria-label="Select active persona"
              >
                <option value="successor">Successor · Priya</option>
                <option value="leaver">Leaver · Alex</option>
                <option value="lead">Lead · Vikram</option>
              </select>
              <ChevronDown size={13} className="pointer-events-none text-[#6B6B6B]" />
            </label>
          </div>

          {/* Reset Demo Data Button */}
          <button
            title="Reset demo data to initial state"
            aria-label="Reset demo data"
            onClick={resetDemoData}
            className="min-hit flex h-11 w-11 items-center justify-center rounded-[6px] border border-[#D4D4D4] bg-white text-[#6B6B6B] transition hover:border-[#0A0A0A] hover:text-[#0A0A0A]"
          >
            <RotateCcw size={15} />
          </button>
        </div>
      </div>
    </header>
  )
}
