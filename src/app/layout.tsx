import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Baton — Accountable Engineering Handover Ledger',
  description:
    'A source-backed claim ledger with open questions, ownership gaps, risk review, and successor sign-off. Built for CodersInPune Hackathon Round 2.',
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    shortcut: '/favicon.ico',
    apple: '/icon.svg',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased bg-[#0b0b0b] text-[#eeeeee]">
        {children}
      </body>
    </html>
  )
}
