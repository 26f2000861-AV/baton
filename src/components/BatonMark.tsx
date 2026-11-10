export default function BatonMark({
  compact = false,
  size = 'default',
  className = '',
}: {
  compact?: boolean
  size?: 'compact' | 'medium' | 'default'
  className?: string
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
      className={`brand-mark border-0 !bg-transparent p-0 ${className}`.trim()}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 74 52"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        focusable="false"
        className={svgSizeClasses}
      >
        {/* Left handoff bracket (lead / leaver side) */}
        <path
          d="M8 10h18l15 16-15 16H8z"
          stroke="var(--text, #eeeeee)"
          strokeWidth="3.5"
        />
        {/* Right handoff bracket (successor / transfer side in teal) */}
        <path
          d="M66 10H48L33 26l15 16h18z"
          stroke="#1B6C80"
          strokeWidth="3.5"
        />
        {/* Handoff connection axis */}
        <path
          d="M27 26h20"
          stroke="var(--text, #eeeeee)"
          strokeWidth="2"
        />
        {/* Handoff transfer pivot */}
        <circle cx="37" cy="26" r="4" fill="#1B6C80" stroke="none" />
      </svg>
    </span>
  )
}
