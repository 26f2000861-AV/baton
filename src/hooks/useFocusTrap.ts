'use client'

import { useEffect, type RefObject } from 'react'

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'textarea:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ')

interface UseFocusTrapOptions {
  containerRef: RefObject<HTMLElement | null>
  initialFocusRef?: RefObject<HTMLElement | null>
  isActive?: boolean
  onClose?: () => void
}

export function useFocusTrap({
  containerRef,
  initialFocusRef,
  isActive = true,
  onClose,
}: UseFocusTrapOptions) {
  useEffect(() => {
    if (!isActive) return

    const container = containerRef.current
    if (!container) return

    // Save previous active element to restore focus when overlay closes
    const previousActiveElement = document.activeElement as HTMLElement | null

    // Set initial focus
    const frameId = window.requestAnimationFrame(() => {
      if (initialFocusRef?.current) {
        initialFocusRef.current.focus()
      } else {
        const focusable = container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
        if (focusable.length > 0) {
          focusable[0].focus()
        } else {
          container.focus()
        }
      }
    })

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (onClose) {
          event.stopPropagation()
          onClose()
        }
        return
      }

      if (event.key !== 'Tab') return

      const focusable = Array.from(
        container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
      ).filter((element) => {
        // Exclude elements that are hidden or detached
        return element.offsetParent !== null || element.getClientRects().length > 0
      })

      if (focusable.length === 0) {
        event.preventDefault()
        return
      }

      const firstElement = focusable[0]
      const lastElement = focusable[focusable.length - 1]

      if (event.shiftKey) {
        if (document.activeElement === firstElement || !container.contains(document.activeElement)) {
          event.preventDefault()
          lastElement.focus()
        }
      } else {
        if (document.activeElement === lastElement || !container.contains(document.activeElement)) {
          event.preventDefault()
          firstElement.focus()
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.cancelAnimationFrame(frameId)
      window.removeEventListener('keydown', handleKeyDown)
      if (
        previousActiveElement &&
        typeof previousActiveElement.focus === 'function' &&
        document.contains(previousActiveElement)
      ) {
        previousActiveElement.focus()
      }
    }
  }, [containerRef, initialFocusRef, isActive, onClose])
}
