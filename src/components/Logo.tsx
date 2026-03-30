interface LogoProps {
  /** Size of the icon in px */
  size?: number
  /** Show the "GutTrigger" wordmark next to the icon */
  showText?: boolean
  className?: string
}

export default function Logo({ size = 32, showText = true, className = '' }: LogoProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        {/* Green G arc, ~300° span, opening on right */}
        <path
          d="M 69.5,16.2 A 39,39 0 1,0 69.5,83.8"
          fill="none"
          stroke="#5DBD5A"
          strokeWidth="15"
          strokeLinecap="butt"
        />
        {/* G crossbar */}
        <line
          x1="57" y1="50" x2="80" y2="50"
          stroke="#5DBD5A"
          strokeWidth="15"
          strokeLinecap="round"
        />
        {/* Blue wave */}
        <path
          d="M 13,50 C 36,22 62,78 88,50"
          fill="none"
          stroke="#29ABE2"
          strokeWidth="11"
          strokeLinecap="round"
        />
      </svg>
      {showText && (
        <span className="font-bold text-stone-900 tracking-tight" style={{ fontSize: size * 0.55 }}>
          GutTrigger
        </span>
      )}
    </div>
  )
}
