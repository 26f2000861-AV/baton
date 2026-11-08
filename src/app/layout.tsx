import type { Metadata } from 'next'
import localFont from 'next/font/local'
import { HandoverProvider } from '../lib/store'
import './globals.css'

const geistSans = localFont({
  src: '../../public/fonts/Geist[wght].ttf',
  variable: '--font-geist',
  display: 'swap',
})

const geistMono = localFont({
  src: '../../public/fonts/GeistMono[wght].ttf',
  variable: '--font-geist-mono',
  display: 'swap',
})

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
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="bg-[#F2F4F7] text-[#0A0A0A] antialiased selection:bg-[#1D5FBF]/20 selection:text-[#0A0A0A]">
        <HandoverProvider>{children}</HandoverProvider>
      </body>
    </html>
  )
}
