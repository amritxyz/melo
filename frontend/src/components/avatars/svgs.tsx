import type React from 'react'

interface SvgProps {
  className?: string
}

/** 1. Melo Neo - Cyberpunk VR Visor */
export const MeloNeoAvatar: React.FC<SvgProps> = ({
  className = 'w-full h-full',
}) => (
  <svg
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <defs>
      <linearGradient
        id="neo-bg"
        x1="0"
        y1="0"
        x2="100"
        y2="100"
        gradientUnits="userSpaceOnUse"
      >
        <stop offset="0%" stopColor="#180c38" />
        <stop offset="100%" stopColor="#3b0764" />
      </linearGradient>
      <linearGradient
        id="neo-visor"
        x1="20"
        y1="42"
        x2="80"
        y2="58"
        gradientUnits="userSpaceOnUse"
      >
        <stop offset="0%" stopColor="#06b6d4" />
        <stop offset="50%" stopColor="#8b5cf6" />
        <stop offset="100%" stopColor="#ec4899" />
      </linearGradient>
      <linearGradient
        id="neo-head"
        x1="30"
        y1="20"
        x2="70"
        y2="85"
        gradientUnits="userSpaceOnUse"
      >
        <stop offset="0%" stopColor="#e0e7ff" />
        <stop offset="100%" stopColor="#a5b4fc" />
      </linearGradient>
      <radialGradient
        id="neo-glow"
        cx="50"
        cy="50"
        r="45"
        gradientUnits="userSpaceOnUse"
      >
        <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.25" />
        <stop offset="100%" stopColor="#06b6d4" stopOpacity="0" />
      </radialGradient>
    </defs>
    {/* Background */}
    <rect width="100" height="100" rx="50" fill="url(#neo-bg)" />
    <circle cx="50" cy="50" r="46" fill="url(#neo-glow)" />

    {/* Comms Antenna */}
    <path
      d="M72 26 L80 14"
      stroke="#06b6d4"
      strokeWidth="3"
      strokeLinecap="round"
    />
    <circle
      cx="81"
      cy="13"
      r="3.5"
      fill="#22d3ee"
      filter="drop-shadow(0 0 4px #06b6d4)"
    />

    {/* Ears */}
    <circle cx="24" cy="46" r="9" fill="#818cf8" />
    <circle cx="76" cy="46" r="9" fill="#818cf8" />
    <circle cx="24" cy="46" r="5" fill="#06b6d4" opacity="0.8" />
    <circle cx="76" cy="46" r="5" fill="#06b6d4" opacity="0.8" />

    {/* Head */}
    <rect x="25" y="24" width="50" height="52" rx="25" fill="url(#neo-head)" />

    {/* Cyber Visor */}
    <rect x="22" y="40" width="56" height="18" rx="9" fill="url(#neo-visor)" />
    <rect
      x="24"
      y="42"
      width="52"
      height="4"
      rx="2"
      fill="#ffffff"
      fillOpacity="0.45"
    />
    <circle cx="34" cy="49" r="2.5" fill="#ffffff" />
    <circle cx="66" cy="49" r="2.5" fill="#ffffff" />
    {/* Visor scan lines */}
    <line
      x1="28"
      y1="53"
      x2="48"
      y2="53"
      stroke="#ffffff"
      strokeWidth="1"
      strokeOpacity="0.6"
    />
    <line
      x1="52"
      y1="53"
      x2="72"
      y2="53"
      stroke="#ffffff"
      strokeWidth="1"
      strokeOpacity="0.6"
    />

    {/* Smile */}
    <path
      d="M44 67 C48 70 52 70 56 67"
      stroke="#4338ca"
      strokeWidth="2.5"
      strokeLinecap="round"
    />

    {/* Cyber Collar */}
    <path
      d="M32 75 C38 80 62 80 68 75 L74 95 C62 99 38 99 26 95 Z"
      fill="#312e81"
    />
    <line
      x1="45"
      y1="80"
      x2="55"
      y2="80"
      stroke="#06b6d4"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
)

/** 2. Melo Astro - Cosmic Space Explorer */
export const MeloAstroAvatar: React.FC<SvgProps> = ({
  className = 'w-full h-full',
}) => (
  <svg
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <defs>
      <linearGradient
        id="astro-bg"
        x1="0"
        y1="0"
        x2="100"
        y2="100"
        gradientUnits="userSpaceOnUse"
      >
        <stop offset="0%" stopColor="#090d16" />
        <stop offset="100%" stopColor="#1e1b4b" />
      </linearGradient>
      <linearGradient
        id="astro-suit"
        x1="30"
        y1="70"
        x2="70"
        y2="100"
        gradientUnits="userSpaceOnUse"
      >
        <stop offset="0%" stopColor="#f1f5f9" />
        <stop offset="100%" stopColor="#cbd5e1" />
      </linearGradient>
      <linearGradient
        id="astro-helmet-rim"
        x1="20"
        y1="18"
        x2="80"
        y2="78"
        gradientUnits="userSpaceOnUse"
      >
        <stop offset="0%" stopColor="#fbbf24" />
        <stop offset="100%" stopColor="#f59e0b" />
      </linearGradient>
    </defs>
    <rect width="100" height="100" rx="50" fill="url(#astro-bg)" />
    {/* Tiny Stars */}
    <circle cx="20" cy="22" r="1" fill="#fef08a" />
    <circle cx="82" cy="28" r="1.5" fill="#fef08a" />
    <circle cx="15" cy="65" r="1.2" fill="#ffffff" />
    <circle cx="85" cy="72" r="1" fill="#ffffff" />
    <circle cx="75" cy="15" r="0.8" fill="#ffffff" />

    {/* Helmet Antenna */}
    <line
      x1="50"
      y1="20"
      x2="50"
      y2="9"
      stroke="#f59e0b"
      strokeWidth="3"
      strokeLinecap="round"
    />
    <circle
      cx="50"
      cy="8"
      r="4"
      fill="#fbbf24"
      filter="drop-shadow(0 0 3px #f59e0b)"
    />

    {/* Suit Body */}
    <path
      d="M26 78 C26 70 74 70 74 78 L80 100 L20 100 Z"
      fill="url(#astro-suit)"
    />
    <rect x="42" y="82" width="16" height="10" rx="3" fill="#0284c7" />
    <circle cx="46" cy="87" r="1.8" fill="#38bdf8" />
    <circle cx="54" cy="87" r="1.8" fill="#f43f5e" />

    {/* Helmet Outer */}
    <circle
      cx="50"
      cy="46"
      r="30"
      fill="#0f172a"
      stroke="url(#astro-helmet-rim)"
      strokeWidth="3.5"
    />

    {/* Inside Face */}
    <circle cx="50" cy="46" r="22" fill="#fed7aa" />
    {/* Starry Eyes */}
    <ellipse cx="43" cy="44" rx="3.5" ry="4.5" fill="#1e293b" />
    <circle cx="41.5" cy="42" r="1.5" fill="#ffffff" />
    <ellipse cx="57" cy="44" rx="3.5" ry="4.5" fill="#1e293b" />
    <circle cx="55.5" cy="42" r="1.5" fill="#ffffff" />
    {/* Cheerful mouth */}
    <path
      d="M46 52 C48 55 52 55 54 52"
      stroke="#ea580c"
      strokeWidth="2"
      strokeLinecap="round"
      fill="none"
    />
    {/* Cute pink cheeks */}
    <circle cx="39" cy="48" r="2.5" fill="#fb7185" opacity="0.6" />
    <circle cx="61" cy="48" r="2.5" fill="#fb7185" opacity="0.6" />

    {/* Helmet Glass Reflection */}
    <path
      d="M30 34 C36 24 64 24 70 34"
      stroke="#ffffff"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeOpacity="0.4"
    />
  </svg>
)

/** 3. Melo Beats - Music DJ */
export const MeloBeatsAvatar: React.FC<SvgProps> = ({
  className = 'w-full h-full',
}) => (
  <svg
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <defs>
      <linearGradient
        id="beats-bg"
        x1="0"
        y1="0"
        x2="100"
        y2="100"
        gradientUnits="userSpaceOnUse"
      >
        <stop offset="0%" stopColor="#064e3b" />
        <stop offset="100%" stopColor="#042f2e" />
      </linearGradient>
      <linearGradient
        id="beats-phones"
        x1="15"
        y1="20"
        x2="85"
        y2="80"
        gradientUnits="userSpaceOnUse"
      >
        <stop offset="0%" stopColor="#ec4899" />
        <stop offset="100%" stopColor="#8b5cf6" />
      </linearGradient>
    </defs>
    <rect width="100" height="100" rx="50" fill="url(#beats-bg)" />

    {/* Sound wave ripples in background */}
    <circle
      cx="50"
      cy="50"
      r="42"
      stroke="#10b981"
      strokeWidth="1"
      strokeDasharray="3 3"
      opacity="0.3"
    />
    <circle
      cx="50"
      cy="50"
      r="34"
      stroke="#34d399"
      strokeWidth="1"
      strokeDasharray="4 4"
      opacity="0.3"
    />

    {/* Headband of headphones */}
    <path
      d="M19 46 C19 18 81 18 81 46"
      stroke="url(#beats-phones)"
      strokeWidth="6"
      strokeLinecap="round"
    />

    {/* Head */}
    <rect x="27" y="27" width="46" height="48" rx="23" fill="#fbcfe8" />

    {/* Tuft of hair */}
    <path d="M44 24 C48 18 52 18 56 24" fill="#a855f7" />

    {/* Earcups */}
    <rect x="14" y="38" width="10" height="24" rx="5" fill="#f43f5e" />
    <rect
      x="16"
      y="42"
      width="6"
      height="16"
      rx="3"
      fill="#ffffff"
      opacity="0.7"
    />
    <rect x="76" y="38" width="10" height="24" rx="5" fill="#f43f5e" />
    <rect
      x="78"
      y="42"
      width="6"
      height="16"
      rx="3"
      fill="#ffffff"
      opacity="0.7"
    />

    {/* Groovy closed singing eyes (^^) */}
    <path
      d="M37 46 Q42 41 47 46"
      stroke="#4a044e"
      strokeWidth="3"
      strokeLinecap="round"
      fill="none"
    />
    <path
      d="M53 46 Q58 41 63 46"
      stroke="#4a044e"
      strokeWidth="3"
      strokeLinecap="round"
      fill="none"
    />

    {/* Sound bar cheek marks */}
    <line
      x1="33"
      y1="52"
      x2="33"
      y2="57"
      stroke="#10b981"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <line
      x1="36"
      y1="50"
      x2="36"
      y2="59"
      stroke="#10b981"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <line
      x1="64"
      y1="50"
      x2="64"
      y2="59"
      stroke="#10b981"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <line
      x1="67"
      y1="52"
      x2="67"
      y2="57"
      stroke="#10b981"
      strokeWidth="2"
      strokeLinecap="round"
    />

    {/* Open singing mouth */}
    <ellipse cx="50" cy="58" rx="5" ry="6" fill="#831843" />
    <path d="M47 59 Q50 63 53 59" fill="#f43f5e" />

    {/* Hoodie collar */}
    <path d="M28 75 C35 83 65 83 72 75 L78 98 L22 98 Z" fill="#0f172a" />
    <path
      d="M42 77 L42 88 M58 77 L58 88"
      stroke="#ec4899"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
)

/** 4. Melo Sprout - Eco / Botanist */
export const MeloSproutAvatar: React.FC<SvgProps> = ({
  className = 'w-full h-full',
}) => (
  <svg
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <defs>
      <linearGradient
        id="sprout-bg"
        x1="0"
        y1="0"
        x2="100"
        y2="100"
        gradientUnits="userSpaceOnUse"
      >
        <stop offset="0%" stopColor="#14532d" />
        <stop offset="100%" stopColor="#15803d" />
      </linearGradient>
    </defs>
    <rect width="100" height="100" rx="50" fill="url(#sprout-bg)" />

    {/* Twin Leaf Sprout on Head */}
    <path
      d="M50 25 C50 16 50 14 50 12"
      stroke="#22c55e"
      strokeWidth="3"
      strokeLinecap="round"
    />
    {/* Left Leaf */}
    <path d="M50 16 C42 12 38 18 48 20 Z" fill="#4ade80" />
    {/* Right Leaf */}
    <path d="M50 14 C58 10 64 16 52 19 Z" fill="#22c55e" />

    {/* Cute Ears */}
    <circle cx="23" cy="48" r="7" fill="#fed7aa" />
    <circle cx="77" cy="48" r="7" fill="#fed7aa" />

    {/* Head */}
    <rect x="25" y="24" width="50" height="52" rx="25" fill="#ffedd5" />

    {/* Wireframe Gold Glasses */}
    <circle
      cx="39"
      cy="48"
      r="9"
      stroke="#eab308"
      strokeWidth="2.5"
      fill="#ffffff"
      fillOpacity="0.25"
    />
    <circle
      cx="61"
      cy="48"
      r="9"
      stroke="#eab308"
      strokeWidth="2.5"
      fill="#ffffff"
      fillOpacity="0.25"
    />
    <line x1="48" y1="48" x2="52" y2="48" stroke="#eab308" strokeWidth="2.5" />

    {/* Happy Eyes inside glasses */}
    <circle cx="39" cy="48" r="3" fill="#1c1917" />
    <circle cx="38" cy="46.5" r="1" fill="#ffffff" />
    <circle cx="61" cy="48" r="3" fill="#1c1917" />
    <circle cx="60" cy="46.5" r="1" fill="#ffffff" />

    {/* Cheeks */}
    <circle cx="31" cy="54" r="3.5" fill="#f87171" opacity="0.6" />
    <circle cx="69" cy="54" r="3.5" fill="#f87171" opacity="0.6" />

    {/* Warm Smile */}
    <path
      d="M45 59 C47 63 53 63 55 59"
      stroke="#7c2d12"
      strokeWidth="2.5"
      strokeLinecap="round"
      fill="none"
    />

    {/* Overalls Straps */}
    <path d="M26 78 C34 85 66 85 74 78 L80 100 L20 100 Z" fill="#166534" />
    <rect x="34" y="78" width="6" height="22" fill="#14532d" />
    <rect x="60" y="78" width="6" height="22" fill="#14532d" />
    <circle cx="37" cy="84" r="1.5" fill="#eab308" />
    <circle cx="63" cy="84" r="1.5" fill="#eab308" />
  </svg>
)

/** 5. Melo Bot - Friendly Retro Mecha */
export const MeloBotAvatar: React.FC<SvgProps> = ({
  className = 'w-full h-full',
}) => (
  <svg
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <defs>
      <linearGradient
        id="bot-bg"
        x1="0"
        y1="0"
        x2="100"
        y2="100"
        gradientUnits="userSpaceOnUse"
      >
        <stop offset="0%" stopColor="#1e293b" />
        <stop offset="100%" stopColor="#0f172a" />
      </linearGradient>
      <linearGradient
        id="bot-body"
        x1="25"
        y1="20"
        x2="75"
        y2="75"
        gradientUnits="userSpaceOnUse"
      >
        <stop offset="0%" stopColor="#38bdf8" />
        <stop offset="100%" stopColor="#0284c7" />
      </linearGradient>
    </defs>
    <rect width="100" height="100" rx="50" fill="url(#bot-bg)" />

    {/* Spring Antenna */}
    <path
      d="M50 20 L50 12"
      stroke="#94a3b8"
      strokeWidth="3"
      strokeLinecap="round"
    />
    <circle
      cx="50"
      cy="10"
      r="4.5"
      fill="#f59e0b"
      filter="drop-shadow(0 0 4px #f59e0b)"
    />

    {/* Side Bolts */}
    <rect x="19" y="42" width="6" height="12" rx="2" fill="#94a3b8" />
    <rect x="75" y="42" width="6" height="12" rx="2" fill="#94a3b8" />

    {/* Robot Head */}
    <rect
      x="25"
      y="22"
      width="50"
      height="50"
      rx="14"
      fill="url(#bot-body)"
      stroke="#0369a1"
      strokeWidth="2"
    />

    {/* Visor Screen */}
    <rect x="30" y="32" width="40" height="22" rx="7" fill="#0f172a" />

    {/* Glowing Pixel Eyes */}
    <rect
      x="36"
      y="39"
      width="8"
      height="8"
      rx="2"
      fill="#38bdf8"
      filter="drop-shadow(0 0 3px #38bdf8)"
    />
    <rect
      x="56"
      y="39"
      width="8"
      height="8"
      rx="2"
      fill="#38bdf8"
      filter="drop-shadow(0 0 3px #38bdf8)"
    />

    {/* Cheerful Robot Mouth (Equalizer bars) */}
    <line
      x1="42"
      y1="62"
      x2="58"
      y2="62"
      stroke="#e0f2fe"
      strokeWidth="3"
      strokeLinecap="round"
      strokeDasharray="3 2"
    />

    {/* Mecha Neck & Body */}
    <rect x="42" y="72" width="16" height="6" fill="#64748b" />
    <path d="M26 78 C35 84 65 84 74 78 L80 100 L20 100 Z" fill="#0284c7" />
    <circle cx="50" cy="88" r="4" fill="#f59e0b" />
  </svg>
)

/** 6. Melo Ninja - Stealth Trader */
export const MeloNinjaAvatar: React.FC<SvgProps> = ({
  className = 'w-full h-full',
}) => (
  <svg
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <defs>
      <linearGradient
        id="ninja-bg"
        x1="0"
        y1="0"
        x2="100"
        y2="100"
        gradientUnits="userSpaceOnUse"
      >
        <stop offset="0%" stopColor="#18181b" />
        <stop offset="100%" stopColor="#27272a" />
      </linearGradient>
    </defs>
    <rect width="100" height="100" rx="50" fill="url(#ninja-bg)" />

    {/* Red Moon Aura */}
    <circle
      cx="50"
      cy="50"
      r="44"
      stroke="#dc2626"
      strokeWidth="1.5"
      opacity="0.35"
    />

    {/* Ninja Cowl / Head Base */}
    <rect
      x="25"
      y="24"
      width="50"
      height="52"
      rx="25"
      fill="#18181b"
      stroke="#3f3f46"
      strokeWidth="2"
    />

    {/* Forehead Protector / Bandana */}
    <rect x="22" y="27" width="56" height="16" rx="4" fill="#b91c1c" />
    {/* Metal Plate */}
    <rect x="36" y="29" width="28" height="12" rx="3" fill="#cbd5e1" />
    {/* Melo Star / Coin insignia on metal plate */}
    <circle cx="50" cy="35" r="3.5" fill="#dc2626" />
    <polygon points="50,32 52,38 47,34 53,34 48,38" fill="#ffffff" />

    {/* Eye Opening Slit */}
    <rect x="28" y="44" width="44" height="14" rx="4" fill="#fed7aa" />

    {/* Intense Glowing Ninja Eyes */}
    <ellipse cx="38" cy="50" rx="4.5" ry="3" fill="#1c1917" />
    <circle cx="38" cy="50" r="1.8" fill="#facc15" />
    <ellipse cx="62" cy="50" rx="4.5" ry="3" fill="#1c1917" />
    <circle cx="62" cy="50" r="1.8" fill="#facc15" />

    {/* Brow Line */}
    <path
      d="M33 46 L43 49"
      stroke="#78350f"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <path
      d="M67 46 L57 49"
      stroke="#78350f"
      strokeWidth="1.5"
      strokeLinecap="round"
    />

    {/* Mask Wrap folds */}
    <path
      d="M28 58 C38 64 62 64 72 58"
      stroke="#3f3f46"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <path
      d="M30 65 C40 71 60 71 70 65"
      stroke="#3f3f46"
      strokeWidth="2"
      strokeLinecap="round"
    />

    {/* Shoulders */}
    <path d="M22 78 C32 84 68 84 78 78 L84 100 L16 100 Z" fill="#09090b" />
    <path d="M50 78 L50 96" stroke="#b91c1c" strokeWidth="2" />
  </svg>
)

/** 7. Melo Sleuth - Vintage Detective */
export const MeloSleuthAvatar: React.FC<SvgProps> = ({
  className = 'w-full h-full',
}) => (
  <svg
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <defs>
      <linearGradient
        id="sleuth-bg"
        x1="0"
        y1="0"
        x2="100"
        y2="100"
        gradientUnits="userSpaceOnUse"
      >
        <stop offset="0%" stopColor="#451a03" />
        <stop offset="100%" stopColor="#78350f" />
      </linearGradient>
    </defs>
    <rect width="100" height="100" rx="50" fill="url(#sleuth-bg)" />

    {/* Head */}
    <rect x="27" y="30" width="46" height="48" rx="23" fill="#fed7aa" />

    {/* Eyes & Smirk */}
    <ellipse cx="40" cy="50" rx="3.5" ry="4" fill="#1c1917" />
    <circle cx="39" cy="49" r="1.2" fill="#ffffff" />
    {/* Right Eye Monocle */}
    <circle
      cx="60"
      cy="50"
      r="7.5"
      stroke="#eab308"
      strokeWidth="2"
      fill="#ffffff"
      fillOpacity="0.2"
    />
    <circle cx="60" cy="50" r="3" fill="#1c1917" />
    <circle cx="59" cy="49" r="1" fill="#ffffff" />
    {/* Monocle Chain */}
    <path
      d="M66 54 C70 64 68 76 64 82"
      stroke="#eab308"
      strokeWidth="1"
      strokeDasharray="1.5 1.5"
    />

    {/* Knowing Smirk */}
    <path
      d="M46 62 C50 64 56 63 58 60"
      stroke="#78350f"
      strokeWidth="2.5"
      strokeLinecap="round"
      fill="none"
    />

    {/* Detective Fedora Hat */}
    {/* Hat Crown */}
    <path d="M30 32 C33 16 67 16 70 32 Z" fill="#292524" />
    {/* Hat Crease indent */}
    <path
      d="M44 20 C48 24 52 24 56 20"
      stroke="#1c1917"
      strokeWidth="2"
      strokeLinecap="round"
    />
    {/* Hat Ribbon */}
    <rect x="30" y="28" width="40" height="5" fill="#b45309" />
    {/* Hat Brim */}
    <path
      d="M18 33 C30 29 70 29 82 33 C84 36 78 37 50 37 C22 37 16 36 18 33 Z"
      fill="#44403c"
    />

    {/* Trenchcoat Collar */}
    <path
      d="M24 76 L36 98 L64 98 L76 76 L62 72 L50 82 L38 72 Z"
      fill="#d97706"
    />
    <polygon points="38,72 50,82 42,98 24,76" fill="#b45309" />
    <polygon points="62,72 50,82 58,98 76,76" fill="#92400e" />
  </svg>
)

/** 8. Melo Gamer - Vaporwave 8-Bit */
export const MeloGamerAvatar: React.FC<SvgProps> = ({
  className = 'w-full h-full',
}) => (
  <svg
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <defs>
      <linearGradient
        id="gamer-bg"
        x1="0"
        y1="0"
        x2="100"
        y2="100"
        gradientUnits="userSpaceOnUse"
      >
        <stop offset="0%" stopColor="#831843" />
        <stop offset="50%" stopColor="#581c87" />
        <stop offset="100%" stopColor="#1e1b4b" />
      </linearGradient>
    </defs>
    <rect width="100" height="100" rx="50" fill="url(#gamer-bg)" />

    {/* Retro Sun in Background */}
    <circle cx="50" cy="40" r="28" fill="#f97316" opacity="0.6" />
    <line x1="25" y1="38" x2="75" y2="38" stroke="#581c87" strokeWidth="1.5" />
    <line x1="28" y1="44" x2="72" y2="44" stroke="#581c87" strokeWidth="2" />
    <line x1="32" y1="50" x2="68" y2="50" stroke="#581c87" strokeWidth="2.5" />

    {/* Headset Band */}
    <path
      d="M22 42 C22 18 78 18 78 42"
      stroke="#38bdf8"
      strokeWidth="4.5"
      strokeLinecap="round"
    />

    {/* Head */}
    <rect x="26" y="26" width="48" height="50" rx="24" fill="#ddd6fe" />

    {/* Headset Cushions */}
    <rect x="17" y="36" width="8" height="18" rx="4" fill="#0284c7" />
    <rect x="75" y="36" width="8" height="18" rx="4" fill="#0284c7" />
    {/* Boom Mic */}
    <path
      d="M21 48 Q21 64 36 64"
      stroke="#0284c7"
      strokeWidth="2.5"
      strokeLinecap="round"
      fill="none"
    />
    <circle cx="38" cy="64" r="2.5" fill="#f43f5e" />

    {/* 8-Bit Pixel Sunglasses */}
    <rect x="30" y="40" width="18" height="12" fill="#0f172a" />
    <rect x="52" y="40" width="18" height="12" fill="#0f172a" />
    <rect x="48" y="42" width="4" height="4" fill="#0f172a" />
    {/* White Pixel Glints */}
    <rect x="32" y="42" width="3" height="3" fill="#ffffff" />
    <rect x="35" y="45" width="3" height="3" fill="#ffffff" />
    <rect x="54" y="42" width="3" height="3" fill="#ffffff" />
    <rect x="57" y="45" width="3" height="3" fill="#ffffff" />

    {/* Confident Smile */}
    <path
      d="M44 60 C47 63 53 63 56 60"
      stroke="#6b21a8"
      strokeWidth="2.5"
      strokeLinecap="round"
      fill="none"
    />

    {/* Jacket */}
    <path d="M25 76 C35 83 65 83 75 76 L80 100 L20 100 Z" fill="#0f172a" />
    <path d="M50 78 L50 100" stroke="#f43f5e" strokeWidth="3" />
  </svg>
)

/** 9. Melo Mystic - Deal Magician */
export const MeloMysticAvatar: React.FC<SvgProps> = ({
  className = 'w-full h-full',
}) => (
  <svg
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <defs>
      <linearGradient
        id="mystic-bg"
        x1="0"
        y1="0"
        x2="100"
        y2="100"
        gradientUnits="userSpaceOnUse"
      >
        <stop offset="0%" stopColor="#1e1b4b" />
        <stop offset="100%" stopColor="#312e81" />
      </linearGradient>
    </defs>
    <rect width="100" height="100" rx="50" fill="url(#mystic-bg)" />

    {/* Starlight Aura */}
    <circle cx="20" cy="20" r="1.5" fill="#facc15" />
    <circle cx="80" cy="25" r="1.5" fill="#facc15" />
    <circle cx="18" cy="70" r="1" fill="#facc15" />
    <circle cx="82" cy="65" r="1" fill="#facc15" />

    {/* Head */}
    <rect x="27" y="32" width="46" height="46" rx="23" fill="#ede9fe" />

    {/* Mystic Star Eyes */}
    <path
      d="M39 46 L40 49 L43 50 L40 51 L39 54 L38 51 L35 50 L38 49 Z"
      fill="#7c3aed"
    />
    <path
      d="M61 46 L62 49 L65 50 L62 51 L61 54 L60 51 L57 50 L60 49 Z"
      fill="#7c3aed"
    />

    {/* Cheeks */}
    <circle cx="33" cy="56" r="3" fill="#c084fc" opacity="0.6" />
    <circle cx="67" cy="56" r="3" fill="#c084fc" opacity="0.6" />

    {/* Sweet Smile */}
    <path
      d="M46 60 C48 63 52 63 54 60"
      stroke="#4c1d95"
      strokeWidth="2.5"
      strokeLinecap="round"
      fill="none"
    />

    {/* Wizard Hat */}
    {/* Pointy Cone */}
    <path d="M28 36 L50 6 L72 36 Z" fill="#4338ca" />
    {/* Crescent Moon on Hat */}
    <path d="M48 18 C52 18 54 22 52 26 C47 25 46 21 48 18 Z" fill="#facc15" />
    <circle cx="56" cy="24" r="1.2" fill="#fde047" />
    {/* Hat Rim */}
    <ellipse cx="50" cy="36" rx="28" ry="7" fill="#312e81" />
    <ellipse
      cx="50"
      cy="36"
      rx="28"
      ry="7"
      stroke="#facc15"
      strokeWidth="1.5"
    />

    {/* Wizard Robe Collar */}
    <path d="M24 78 C35 84 65 84 76 78 L82 100 L18 100 Z" fill="#3730a3" />
    <circle cx="50" cy="85" r="3.5" fill="#facc15" />
  </svg>
)

/** 10. Melo Chill - Cozy Beanie */
export const MeloChillAvatar: React.FC<SvgProps> = ({
  className = 'w-full h-full',
}) => (
  <svg
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <defs>
      <linearGradient
        id="chill-bg"
        x1="0"
        y1="0"
        x2="100"
        y2="100"
        gradientUnits="userSpaceOnUse"
      >
        <stop offset="0%" stopColor="#7c2d12" />
        <stop offset="100%" stopColor="#c2410c" />
      </linearGradient>
    </defs>
    <rect width="100" height="100" rx="50" fill="url(#chill-bg)" />

    {/* Head */}
    <rect x="26" y="28" width="48" height="48" rx="24" fill="#ffedd5" />

    {/* Relaxed Happy Closed Eyes (^_^) */}
    <path
      d="M36 48 C39 43 43 43 46 48"
      stroke="#431407"
      strokeWidth="3"
      strokeLinecap="round"
      fill="none"
    />
    <path
      d="M54 48 C57 43 61 43 64 48"
      stroke="#431407"
      strokeWidth="3"
      strokeLinecap="round"
      fill="none"
    />

    {/* Rosy Cheeks */}
    <circle cx="33" cy="54" r="3.5" fill="#fb7185" opacity="0.6" />
    <circle cx="67" cy="54" r="3.5" fill="#fb7185" opacity="0.6" />

    {/* Content Smile */}
    <path
      d="M46 56 C48 59 52 59 54 56"
      stroke="#7c2d12"
      strokeWidth="2.5"
      strokeLinecap="round"
      fill="none"
    />

    {/* Knit Beanie */}
    {/* Beanie Dome */}
    <path d="M26 36 C26 16 74 16 74 36 Z" fill="#d97706" />
    {/* Beanie Fold / Cuff */}
    <rect x="23" y="28" width="54" height="11" rx="5" fill="#b45309" />
    {/* Pom-pom on top */}
    <circle cx="50" cy="14" r="6" fill="#fef3c7" />

    {/* Cozy Striped Scarf */}
    <path
      d="M22 72 C32 80 68 80 78 72 C80 82 72 90 50 90 C28 90 20 82 22 72 Z"
      fill="#047857"
    />
    <line x1="36" y1="74" x2="38" y2="86" stroke="#fef3c7" strokeWidth="3" />
    <line x1="48" y1="76" x2="49" y2="88" stroke="#fef3c7" strokeWidth="3" />
    <line x1="60" y1="75" x2="61" y2="86" stroke="#fef3c7" strokeWidth="3" />
  </svg>
)

/** 11. Melo Pilot - Sky Explorer */
export const MeloPilotAvatar: React.FC<SvgProps> = ({
  className = 'w-full h-full',
}) => (
  <svg
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <defs>
      <linearGradient
        id="pilot-bg"
        x1="0"
        y1="0"
        x2="100"
        y2="100"
        gradientUnits="userSpaceOnUse"
      >
        <stop offset="0%" stopColor="#0369a1" />
        <stop offset="100%" stopColor="#38bdf8" />
      </linearGradient>
    </defs>
    <rect width="100" height="100" rx="50" fill="url(#pilot-bg)" />

    {/* Aviator Helmet (Ear flaps) */}
    <path d="M24 38 L22 62 C22 66 26 66 28 62 L28 42" fill="#78350f" />
    <path d="M76 38 L78 62 C78 66 74 66 72 62 L72 42" fill="#78350f" />

    {/* Head */}
    <rect x="26" y="28" width="48" height="48" rx="24" fill="#fed7aa" />

    {/* Aviator Cap Top */}
    <path d="M26 38 C26 20 74 20 74 38 Z" fill="#92400e" />

    {/* Brass Goggles pushed up on forehead */}
    <rect x="22" y="26" width="56" height="5" rx="2.5" fill="#451a03" />
    {/* Left Goggle */}
    <circle
      cx="38"
      cy="28"
      r="8"
      fill="#d97706"
      stroke="#b45309"
      strokeWidth="2"
    />
    <circle cx="38" cy="28" r="5.5" fill="#bae6fd" />
    <line
      x1="35"
      y1="25"
      x2="41"
      y2="31"
      stroke="#ffffff"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    {/* Right Goggle */}
    <circle
      cx="62"
      cy="28"
      r="8"
      fill="#d97706"
      stroke="#b45309"
      strokeWidth="2"
    />
    <circle cx="62" cy="28" r="5.5" fill="#bae6fd" />
    <line
      x1="59"
      y1="25"
      x2="65"
      y2="31"
      stroke="#ffffff"
      strokeWidth="1.5"
      strokeLinecap="round"
    />

    {/* Eyes & Grin */}
    <ellipse cx="39" cy="48" rx="3" ry="4" fill="#1c1917" />
    <circle cx="38" cy="46.5" r="1.2" fill="#ffffff" />
    <ellipse cx="61" cy="48" rx="3" ry="4" fill="#1c1917" />
    <circle cx="60" cy="46.5" r="1.2" fill="#ffffff" />

    {/* Band-aid on Cheek */}
    <rect
      x="30"
      y="56"
      width="10"
      height="4"
      rx="1.5"
      fill="#fdba74"
      transform="rotate(-15 30 56)"
    />

    {/* Adventurous Grin */}
    <path
      d="M45 57 C48 62 54 62 57 57"
      stroke="#78350f"
      strokeWidth="2.5"
      strokeLinecap="round"
      fill="none"
    />

    {/* Bomber Jacket Shearling Collar */}
    <path d="M22 76 C32 84 68 84 78 76 L84 100 L16 100 Z" fill="#78350f" />
    <ellipse cx="36" cy="80" rx="9" ry="6" fill="#fef3c7" />
    <ellipse cx="64" cy="80" rx="9" ry="6" fill="#fef3c7" />
  </svg>
)

/** 12. Melo Spark - Radiant Star Mascot */
export const MeloSparkAvatar: React.FC<SvgProps> = ({
  className = 'w-full h-full',
}) => (
  <svg
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <defs>
      <linearGradient
        id="spark-bg"
        x1="0"
        y1="0"
        x2="100"
        y2="100"
        gradientUnits="userSpaceOnUse"
      >
        <stop offset="0%" stopColor="#f59e0b" />
        <stop offset="100%" stopColor="#ea580c" />
      </linearGradient>
    </defs>
    <rect width="100" height="100" rx="50" fill="url(#spark-bg)" />

    {/* Sunburst Halo Spokes */}
    <circle
      cx="50"
      cy="50"
      r="44"
      stroke="#fef08a"
      strokeWidth="2"
      strokeDasharray="6 6"
      opacity="0.5"
    />

    {/* Round Bear/Mascot Ears */}
    <circle
      cx="27"
      cy="28"
      r="9"
      fill="#fde047"
      stroke="#eab308"
      strokeWidth="2"
    />
    <circle cx="27" cy="28" r="5" fill="#f472b6" />
    <circle
      cx="73"
      cy="28"
      r="9"
      fill="#fde047"
      stroke="#eab308"
      strokeWidth="2"
    />
    <circle cx="73" cy="28" r="5" fill="#f472b6" />

    {/* Head */}
    <rect x="25" y="24" width="50" height="52" rx="25" fill="#fef08a" />

    {/* Star Forehead Crest */}
    <polygon
      points="50,19 52,24 57,24 53,27 55,32 50,29 45,32 47,27 43,24 48,24"
      fill="#f59e0b"
    />

    {/* Left Eye: Star, Right Eye: Winking Smile */}
    <path
      d="M38 43 L39 46 L42 47 L39 48 L38 51 L37 48 L34 47 L37 46 Z"
      fill="#854d0e"
    />
    <path
      d="M57 48 Q62 44 67 48"
      stroke="#854d0e"
      strokeWidth="3"
      strokeLinecap="round"
      fill="none"
    />

    {/* Lightning Bolt Cheek Mark */}
    <polygon
      points="34,54 38,54 36,58 40,58 35,65 37,60 33,60"
      fill="#f43f5e"
    />
    <circle cx="67" cy="56" r="3.5" fill="#f472b6" opacity="0.6" />

    {/* Happy Wide Smile */}
    <path
      d="M46 58 Q50 64 54 58"
      stroke="#713f12"
      strokeWidth="2.5"
      strokeLinecap="round"
      fill="none"
    />

    {/* Sparkle Cape */}
    <path d="M26 78 C36 84 64 84 74 78 L80 100 L20 100 Z" fill="#db2777" />
    <circle cx="50" cy="85" r="3" fill="#fde047" />
  </svg>
)
