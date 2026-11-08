'use client'

import { RotateCcw, ShieldCheck, ChevronDown } from 'lucide-react'
import { useHandover } from '@/lib/store'
import { PersonaRole } from '@/lib/types'

export default function Header({ onInterview, onExposure }: { onInterview?: () => void; onExposure?: () => void }) {
  const { activePersona, setActivePersonaRole, resetDemoData, withheldCount } = useHandover()
  return (
    <header className="sticky top-0 z-30 border-b border-slate-800 bg-slate-950/90 px-5 py-4 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center gap-4">
        <div className="flex items-center gap-3"><div className="rounded-xl bg-indigo-500 p-2 text-xl font-black">B</div><div><div className="text-lg font-bold tracking-tight">Baton</div><div className="text-[10px] uppercase tracking-[.25em] text-slate-500">GIT LOST</div></div></div>
        <div className="hidden h-8 w-px bg-slate-800 md:block" />
        <div className="hidden rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs text-cyan-300 md:block">FinTrack / Payment Core</div>
        <div className="ml-auto flex items-center gap-2">
          {activePersona.role === 'leaver' && onInterview && <button onClick={onInterview} className="hidden rounded-lg border border-amber-400/30 px-3 py-2 text-xs text-amber-200 sm:block">Focus interview</button>}
          {activePersona.role === 'lead' && onExposure && <button onClick={onExposure} className="hidden rounded-lg border border-fuchsia-400/30 px-3 py-2 text-xs text-fuchsia-200 sm:block">Exposure diff ({withheldCount})</button>}
          <label className="flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs"><span>{activePersona.avatar}</span><select value={activePersona.role} onChange={(e) => setActivePersonaRole(e.target.value as PersonaRole)} className="bg-transparent text-slate-200 outline-none"><option value="successor">Successor · Priya</option><option value="leaver">Leaver · Alex</option><option value="lead">Lead · Vikram</option></select><ChevronDown size={13} /></label>
          <button title="Reset demo data" onClick={resetDemoData} className="rounded-lg border border-slate-700 p-2 text-slate-400 hover:text-white"><RotateCcw size={16} /></button>
        </div>
      </div>
    </header>
  )
}
