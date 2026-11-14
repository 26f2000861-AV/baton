'use client'

import { useCallback, useState } from 'react'

/**
 * Spam-resistant contact email for the landing footer.
 *
 * The HTML source never contains a clear-text address (no user@domain
 * pattern and no mailto: string for harvesters). The visible label uses
 * the [at] / [dot] convention, and the real address is assembled in
 * memory only when the visitor clicks.
 */
const LOCAL_PART = 'adityaverma200911'
const DOMAIN = 'gmail'
const TLD = 'com'

export default function ContactEmail() {
  // Re-assembled on click; never present as one string in the bundle.
  const [opened, setOpened] = useState(false)

  const handleClick = useCallback(() => {
    const address = `${LOCAL_PART}@${DOMAIN}.${TLD}`
    setOpened(true)
    window.location.href = `mailto:${address}`
  }, [])

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label="Email the Baton team"
      title={opened ? 'Opening your mail client…' : 'Click to email the team'}
      className="inline-flex items-center gap-1.5 text-xs text-[#8d8d8d] transition-colors duration-200 hover:text-[#eeeeee] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#c9c9c9]"
    >
      <span aria-hidden="true">✉</span>
      <span>
        {LOCAL_PART.slice(0, 6)}
        …[at]{DOMAIN}[dot]{TLD}
      </span>
    </button>
  )
}
