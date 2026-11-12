'use client'

import { motion } from 'motion/react'

export default function BatonMark({
  compact = false,
  size = 'default',
  className = '',
  animated = false,
}: {
  compact?: boolean
  size?: 'compact' | 'medium' | 'default'
  className?: string
  animated?: boolean
}) {
  const isCompact = compact || size === 'compact'
  const isMedium = size === 'medium'

  const svgSizeClasses = isMedium
    ? '!w-[44px] !h-[31px]'
    : isCompact
    ? '!w-[24px] !h-[17px]'
    : '!w-[30px] !h-[21px]'

  return (
    <span
      className={`brand-mark group/baton inline-flex items-center justify-center border-0 !bg-transparent p-0 ${className}`.trim()}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 74 52"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        focusable="false"
        className={`${svgSizeClasses} transition-transform duration-300 ease-out`}
        shapeRendering="geometricPrecision"
      >
        <defs>
          {/* Silver metallic sheen for origin/lead bracket */}
          <linearGradient id="baton-lead-grad" x1="8" y1="10" x2="41" y2="42" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="100%" stopColor="#D4D4D8" />
          </linearGradient>

          {/* Luminous high-contrast cyan-teal for successor bracket */}
          <linearGradient id="baton-transfer-grad" x1="66" y1="10" x2="33" y2="42" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#38BDF8" />
            <stop offset="100%" stopColor="#2DD4BF" />
          </linearGradient>

          {/* Handoff connection axis bridge */}
          <linearGradient id="baton-bridge-grad" x1="26" y1="26" x2="48" y2="26" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#E4E4E7" stopOpacity="0.85" />
            <stop offset="50%" stopColor="#A1A1AA" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#2DD4BF" stopOpacity="0.85" />
          </linearGradient>
        </defs>

        {/* Left handoff bracket (lead / leaver side) - subtle interactive slide on hover */}
        <motion.g
          className="transition-transform duration-300 ease-out group-hover/baton:translate-x-[1.5px] group-hover:translate-x-[1.5px] motion-reduce:transform-none"
          initial={animated ? { opacity: 0.55 } : undefined}
          animate={animated ? { opacity: 1 } : undefined}
          transition={animated ? { duration: 0.7, ease: 'easeOut' } : undefined}
        >
          <motion.path
            d="M8.5 11h17.5l14.5 15-14.5 15H8.5z"
            stroke="url(#baton-lead-grad)"
            strokeWidth="3.2"
            initial={animated ? { pathLength: 0 } : undefined}
            animate={animated ? { pathLength: 1 } : undefined}
            transition={animated ? { duration: 0.9, ease: 'easeInOut' } : undefined}
          />
        </motion.g>

        {/* Right handoff bracket (successor / transfer side in luminous teal) - subtle interactive slide on hover */}
        <motion.g
          className="transition-transform duration-300 ease-out group-hover/baton:-translate-x-[1.5px] group-hover:-translate-x-[1.5px] motion-reduce:transform-none"
          initial={animated ? { opacity: 0.55 } : undefined}
          animate={animated ? { opacity: 1 } : undefined}
          transition={animated ? { duration: 0.7, delay: 0.12, ease: 'easeOut' } : undefined}
        >
          <motion.path
            d="M65.5 11H48L33.5 26 48 41h17.5z"
            stroke="url(#baton-transfer-grad)"
            strokeWidth="3.2"
            initial={animated ? { pathLength: 0 } : undefined}
            animate={animated ? { pathLength: 1 } : undefined}
            transition={animated ? { duration: 0.9, delay: 0.12, ease: 'easeInOut' } : undefined}
          />
        </motion.g>

        {/* Handoff connection axis */}
        <motion.path
          d="M26 26h22"
          stroke="url(#baton-bridge-grad)"
          strokeWidth="2.2"
          className="transition-opacity duration-300 opacity-80 group-hover/baton:opacity-100 group-hover:opacity-100"
          initial={animated ? { pathLength: 0, opacity: 0 } : undefined}
          animate={animated ? { pathLength: 1, opacity: 0.8 } : undefined}
          transition={animated ? { duration: 0.45, delay: 0.78, ease: 'easeOut' } : undefined}
        />

        {/* Handoff transfer pivot / baton node with interactive aura */}
        <g className="transition-all duration-300 ease-out origin-[37px_26px] group-hover/baton:scale-125 group-hover:scale-125 motion-reduce:transform-none">
          {/* Subtle outer aura */}
          <circle cx="37" cy="26" r="4.5" fill="#2DD4BF" fillOpacity="0.22" />
          {/* Core pivot */}
          <circle cx="37" cy="26" r="2.5" fill="#2DD4BF" />
          {/* Center reflection */}
          <circle cx="37" cy="26" r="1" fill="#FFFFFF" fillOpacity="0.9" />
        </g>
      </svg>
    </span>
  )
}
