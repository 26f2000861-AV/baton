import type { Metadata } from 'next'
import { Analytics } from '@vercel/analytics/react'
import './globals.css'

const SITE_URL = 'https://www.gitlostbaton.xyz'
const TITLE = 'Baton | Engineering Handover Software & Decision Records'
const DESCRIPTION =
  'Keep engineering decisions, open work, ownership, and source records together so the next owner can review the handover with confidence.'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: TITLE,
    template: '%s | Baton',
  },
  description: DESCRIPTION,
  applicationName: 'Baton',
  alternates: {
    canonical: '/',
    languages: { 'en-US': '/' },
  },
  openGraph: {
    type: 'website',
    siteName: 'Baton',
    locale: 'en_US',
    url: SITE_URL,
    title: TITLE,
    description: DESCRIPTION,
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Baton — engineering handovers with evidence',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: DESCRIPTION,
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
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
        {/* Privacy-friendly analytics; loaded afterInteractive so it never
            contributes to Total Blocking Time. */}
        <Analytics />
      </body>
    </html>
  )
}
