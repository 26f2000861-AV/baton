import type { Metadata } from 'next'
import { HandoverProvider } from '../lib/store'
import './globals.css'

export const metadata: Metadata = {
  title: 'Baton — Accountable Engineering Handover',
  description:
    'Turn scattered project activity into an accountable, verified claim ledger. CodersInPune Hackathon Round 2 by Team GIT LOST.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-slate-950 text-slate-100 antialiased selection:bg-indigo-500/30 selection:text-indigo-200">
        <HandoverProvider>{children}</HandoverProvider>
      </body>
    </html>
  )
}
