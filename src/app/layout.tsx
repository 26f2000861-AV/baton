import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Baton — Accountable Engineering Handover Ledger',
  description:
    'A source-backed claim ledger with open questions, ownership gaps, risk review, and successor sign-off. Built for CodersInPune Hackathon Round 2.',
  icons: {
    icon: '/icon.svg',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark" style={{ backgroundColor: '#0b0b0b', colorScheme: 'dark' }}>
      <body className="antialiased bg-[#0b0b0b] text-[#eeeeee]" style={{ backgroundColor: '#0b0b0b', color: '#eeeeee' }}>
        {children}
      </body>
    </html>
  )
}
