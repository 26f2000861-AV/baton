/**
 * Static, server-rendered brand mark (zero client JavaScript).
 * Same geometry and hover behaviour as BatonMark, without the motion
 * dependency — used on the public landing page so the header adds no
 * bundle weight. Hover translation is pure CSS (group-hover).
 */
export default function BrandMark({ className = '' }: { className?: string }) {
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
        className="!w-[44px] !h-[31px] transition-transform duration-300 ease-out"
        shapeRendering="geometricPrecision"
      >
        <defs>
          <linearGradient id="baton-lead-grad" x1="8" y1="10" x2="41" y2="42" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="100%" stopColor="#D4D4D8" />
          </linearGradient>
          <linearGradient id="baton-transfer-grad" x1="66" y1="10" x2="33" y2="42" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#38BDF8" />
            <stop offset="100%" stopColor="#2DD4BF" />
          </linearGradient>
          <linearGradient id="baton-bridge-grad" x1="26" y1="26" x2="48" y2="26" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#E4E4E7" stopOpacity="0.85" />
            <stop offset="50%" stopColor="#A1A1AA" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#2DD4BF" stopOpacity="0.85" />
          </linearGradient>
        </defs>

        {/* Left handoff bracket (lead / leaver side) */}
        <g className="transition-transform duration-300 ease-out group-hover/baton:translate-x-[1.5px] motion-reduce:transform-none">
          <path d="M8.5 11h17.5l14.5 15-14.5 15H8.5z" stroke="url(#baton-lead-grad)" strokeWidth="3.2" />
        </g>

        {/* Right handoff bracket (successor / transfer side) */}
        <g className="transition-transform duration-300 ease-out group-hover/baton:-translate-x-[1.5px] motion-reduce:transform-none">
          <path d="M65.5 11H48L33.5 26 48 41h17.5z" stroke="url(#baton-transfer-grad)" strokeWidth="3.2" />
        </g>

        {/* Handoff connection axis */}
        <path
          d="M26 26h22"
          stroke="url(#baton-bridge-grad)"
          strokeWidth="2.2"
          className="transition-opacity duration-300 opacity-80 group-hover/baton:opacity-100"
        />

        {/* Handoff transfer pivot */}
        <g className="transition-all duration-300 ease-out origin-[37px_26px] group-hover/baton:scale-125 motion-reduce:transform-none">
          <circle cx="37" cy="26" r="4.5" fill="#2DD4BF" fillOpacity="0.22" />
          <circle cx="37" cy="26" r="2.5" fill="#2DD4BF" />
          <circle cx="37" cy="26" r="1" fill="#FFFFFF" fillOpacity="0.9" />
        </g>
      </svg>
    </span>
  )
}
