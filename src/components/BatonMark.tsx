export default function BatonMark({ compact = false }: { compact?: boolean }) {
  return (
    <span className={`brand-mark${compact ? ' compact' : ''}`} aria-hidden="true">
      <svg viewBox="0 0 72 70" focusable="false">
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
