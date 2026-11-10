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

  const sizeClasses = isMedium
    ? '!w-[42px] !h-[42px]'
    : isCompact
    ? 'compact'
    : ''

  const svgSizeClasses = isMedium
    ? '!w-[30px] !h-[30px]'
    : ''

  return (
    <span
      className={`brand-mark ${sizeClasses} ${className}`.trim()}
      aria-hidden="true"
    >
      <svg viewBox="0 0 72 70" focusable="false" className={svgSizeClasses}>
        <path
          className="relay-mark-outline"
          d="M18 5h22a14 14 0 0 1 0 28H18zM18 33h24a15 15 0 0 1 0 30H18z"
          fill="none"
          stroke="var(--text)"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path className="relay-mark-line" d="M6 33h60" fill="none" stroke="var(--accent)" strokeWidth="4" strokeLinecap="round" />
        <circle cx="66" cy="33" r="4" fill="var(--accent)" />
      </svg>
    </span>
  )
}
