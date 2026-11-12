'use client'

import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import BatonMark from '@/components/BatonMark'

export default function WorkspaceLoadingScreen({ message }: { message: string }) {
  const reducedMotion = useReducedMotion()

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="workspace-loading"
        className="framed-app framed-app-single workspace-loading-shell"
        aria-busy="true"
        aria-label={message}
        initial={reducedMotion ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={reducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.985 }}
        transition={{ duration: 0.28, ease: 'easeOut' }}
      >
        <motion.div
          className="workspace-loading"
          initial={reducedMotion ? false : { opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={reducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.98 }}
          transition={{ type: 'spring', stiffness: 220, damping: 24 }}
        >
          <motion.div
            className="workspace-loading-logo"
            animate={reducedMotion ? undefined : { y: [0, -3, 0] }}
            transition={reducedMotion ? undefined : { duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
          >
            <BatonMark animated size="medium" />
          </motion.div>
          <div className="workspace-loading-copy">
            <AnimatePresence mode="wait" initial={false}>
              <motion.p
                key={message}
                initial={reducedMotion ? false : { opacity: 0, y: 7 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: -5 }}
                transition={{ duration: 0.28, ease: 'easeOut' }}
              >
                {message}
              </motion.p>
            </AnimatePresence>
            <span className="workspace-loading-subtitle">Securing the context for your next handoff</span>
          </div>
          <div className="workspace-loading-progress" aria-hidden="true">
            <motion.span
              animate={reducedMotion ? { x: '-30%' } : { x: ['-110%', '110%'] }}
              transition={reducedMotion ? undefined : { duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
            />
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
