import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Baton — Accountable Engineering Handover Ledger',
  description:
    'A source-backed claim ledger with open questions, ownership gaps, risk review, and successor sign-off. Built for CodersInPune Hackathon Round 2.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  )
}
