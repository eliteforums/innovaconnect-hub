import { C, a11y, type IllustrationProps } from "./palette";

function Wheel({ x, y, r }: { x: number; y: number; r: number }) {
  return (
    <g>
      <circle cx={x} cy={y} r={r} fill={C.ink} />
      <circle cx={x} cy={y} r={r * 0.6} fill={C.chrome} stroke={C.ink} strokeWidth="2" />
      <circle cx={x} cy={y} r={r * 0.22} fill={C.ink} />
      <path
        d={`M ${x - r * 0.4} ${y - r * 0.15} A ${r * 0.45} ${r * 0.45} 0 0 1 ${x + r * 0.1} ${y - r * 0.42}`}
        stroke={C.paper}
        strokeWidth="2"
        fill="none"
        opacity="0.7"
      />
    </g>
  );
}

/** Classic black-and-yellow Mumbai taxi, side view, facing left. */
export function Taxi({ className, title }: IllustrationProps) {
  return (
    <svg viewBox="0 0 480 210" className={className} {...a11y(title)}>
      <ellipse cx="244" cy="198" rx="214" ry="7" fill={C.ink} opacity="0.18" />
      {/* Roof sign */}
      <rect x="234" y="36" width="44" height="14" rx="2" fill={C.taxi} stroke={C.ink} strokeWidth="2.5" />
      <text x="256" y="47" textAnchor="middle" fontFamily="monospace" fontWeight="700" fontSize="10" fill={C.ink}>
        TAXI
      </text>
      {/* Cabin */}
      <path d="M146 110 L190 62 Q197 53 209 53 L301 53 Q313 53 320 62 L350 110 Z" fill={C.ink} />
      {/* Yellow roof */}
      <path d="M184 68 L192 59 Q199 50 210 50 L300 50 Q312 50 319 59 L326 68 Z" fill={C.taxi} stroke={C.ink} strokeWidth="2.5" strokeLinejoin="round" />
      {/* Windows */}
      <path d="M162 106 L196 70 L249 70 L249 106 Z" fill={C.glass} stroke={C.ink} strokeWidth="2" />
      <path d="M258 106 L258 70 L312 70 L336 106 Z" fill={C.glass} stroke={C.ink} strokeWidth="2" />
      <path d="M178 104 L206 72 L214 72 L186 104 Z" fill={C.paper} opacity="0.6" />
      <path d="M272 104 L282 72 L288 72 L278 104 Z" fill={C.paper} opacity="0.5" />
      {/* Lower body */}
      <path
        d="M32 128 Q32 113 52 111 L150 105 L334 105 L440 109 Q458 111 458 128 L458 160 Q458 168 450 168 L398 168 A 38 38 0 0 0 322 168 L158 168 A 38 38 0 0 0 82 168 L40 168 Q32 168 32 160 Z"
        fill={C.ink}
      />
      <path d="M52 114 L150 108 L334 108 L438 112" stroke={C.paper} strokeWidth="1.5" opacity="0.35" fill="none" />
      {/* Chrome trim and doors */}
      <path d="M40 134 L452 134" stroke={C.chrome} strokeWidth="2.5" />
      <path d="M156 110 L156 162 M253 108 L253 164 M338 110 L338 160" stroke="#4a4a4a" strokeWidth="2" />
      <rect x="228" y="118" width="16" height="4" rx="2" fill={C.chrome} />
      <rect x="314" y="118" width="16" height="4" rx="2" fill={C.chrome} />
      {/* Lights and bumpers */}
      <circle cx="42" cy="124" r="7" fill="#FFF3C4" stroke={C.ink} strokeWidth="2" />
      <rect x="448" y="116" width="10" height="14" rx="2" fill={C.best} stroke={C.ink} strokeWidth="2" />
      <rect x="22" y="146" width="30" height="9" rx="4" fill={C.chrome} stroke={C.ink} strokeWidth="2" />
      <rect x="446" y="146" width="22" height="9" rx="4" fill={C.chrome} stroke={C.ink} strokeWidth="2" />
      {/* Yellow side stripe — a small nod to the roof */}
      <path d="M60 150 L430 150" stroke={C.taxi} strokeWidth="3" />
      <Wheel x={120} y={168} r={28} />
      <Wheel x={360} y={168} r={28} />
    </svg>
  );
}

/** Red BEST-style single-decker city bus, side view, facing left. No logos. */
export function Bus({ className, title }: IllustrationProps) {
  const windows = [0, 1, 2, 3, 4, 5];
  return (
    <svg viewBox="0 0 560 230" className={className} {...a11y(title)}>
      <ellipse cx="282" cy="218" rx="262" ry="7" fill={C.ink} opacity="0.18" />
      <rect x="16" y="32" width="528" height="160" rx="14" fill={C.best} stroke={C.ink} strokeWidth="3" />
      <path d="M30 32 L530 32 Q544 32 544 46 L544 48 L16 48 L16 46 Q16 32 30 32 Z" fill="#B51F22" stroke={C.ink} strokeWidth="3" />
      {/* Destination board (no text) */}
      <rect x="24" y="37" width="92" height="9" rx="1" fill={C.ink} />
      <path d="M30 41.5 L58 41.5 M64 41.5 L84 41.5 M90 41.5 L108 41.5" stroke={C.taxi} strokeWidth="2.5" />
      {/* Windscreen */}
      <path d="M22 58 L66 58 L66 124 L18 124 Z" fill={C.charcoal} stroke={C.ink} strokeWidth="2.5" />
      <path d="M28 64 L44 64 L30 118 L24 118 Z" fill={C.paper} opacity="0.3" />
      {/* Front door */}
      <rect x="74" y="58" width="38" height="128" fill={C.ink} />
      <rect x="77" y="61" width="15" height="118" fill={C.glass} stroke={C.ink} strokeWidth="1.5" />
      <rect x="94" y="61" width="15" height="118" fill={C.glass} stroke={C.ink} strokeWidth="1.5" />
      {/* Windows */}
      {windows.map((i) => {
        const x = 122 + i * 58;
        return (
          <g key={i}>
            <rect x={x} y="58" width="50" height="60" rx="3" fill={C.glass} stroke={C.ink} strokeWidth="2.5" />
            <path d={`M${x} 74 L${x + 50} 74`} stroke={C.ink} strokeWidth="2" />
            <path d={`M${x + 8} 112 L${x + 22} 80`} stroke={C.paper} strokeWidth="3" opacity="0.55" />
          </g>
        );
      })}
      {/* Rear door + last window */}
      <rect x="474" y="58" width="36" height="128" fill={C.ink} />
      <rect x="477" y="61" width="30" height="118" fill={C.glass} stroke={C.ink} strokeWidth="1.5" />
      <rect x="514" y="58" width="24" height="60" rx="3" fill={C.glass} stroke={C.ink} strokeWidth="2.5" />
      {/* Cream band */}
      <rect x="16" y="128" width="58" height="12" fill={C.paper} />
      <rect x="112" y="128" width="362" height="12" fill={C.paper} />
      <rect x="510" y="128" width="34" height="12" fill={C.paper} />
      <path d="M16 168 L74 168 M112 168 L474 168 M510 168 L544 168" stroke={C.ink} strokeWidth="2" />
      {/* Wheel arches */}
      <path d="M114 192 A 36 36 0 0 1 186 192 Z" fill={C.ink} />
      <path d="M384 192 A 36 36 0 0 1 456 192 Z" fill={C.ink} />
      <rect x="10" y="150" width="12" height="12" rx="2" fill="#FFF3C4" stroke={C.ink} strokeWidth="2" />
      <rect x="10" y="178" width="34" height="10" rx="3" fill={C.ink} />
      <rect x="538" y="148" width="8" height="16" rx="2" fill={C.burgundy} stroke={C.ink} strokeWidth="2" />
      <Wheel x={150} y={192} r={28} />
      <Wheel x={420} y={192} r={28} />
    </svg>
  );
}

/** Mumbai suburban local train under overhead wires, side view. */
export function Train({ className, title }: IllustrationProps) {
  const doors = [104, 330, 556];
  const windows = [166, 208, 250, 292, 392, 434, 476, 518, 618, 660, 702];
  const droppers = Array.from({ length: 13 }, (_, i) => 20 + i * 60);
  return (
    <svg viewBox="0 0 760 230" className={className} {...a11y(title)}>
      {/* Overhead wires */}
      <path d="M0 10 L760 10" stroke={C.ink} strokeWidth="1.5" />
      <path d="M0 24 L760 24" stroke={C.ink} strokeWidth="1.2" />
      {droppers.map((x) => (
        <path key={x} d={`M${x} 10 L${x} 24`} stroke={C.ink} strokeWidth="1" />
      ))}
      {/* Pantograph */}
      <path d="M170 46 L190 30 L210 46 M178 30 L202 30 M190 30 L190 24" stroke={C.ink} strokeWidth="2.5" fill="none" strokeLinejoin="round" />
      {/* Roof */}
      <rect x="48" y="42" width="712" height="12" rx="5" fill={C.stone} stroke={C.ink} strokeWidth="2.5" />
      {/* Body */}
      <path d="M62 52 L760 52 L760 174 L40 174 Q20 174 20 150 L20 92 Q20 60 62 52 Z" fill="#F3EFE6" stroke={C.ink} strokeWidth="3" />
      {/* Cab */}
      <path d="M26 70 L60 64 L60 110 L22 112 Z" fill={C.charcoal} stroke={C.ink} strokeWidth="2.5" />
      <path d="M20 122 L48 122 L48 174 L40 174 Q20 174 20 150 Z" fill={C.taxi} stroke={C.ink} strokeWidth="2.5" />
      <circle cx="33" cy="140" r="5" fill="#FFF3C4" stroke={C.ink} strokeWidth="2" />
      {/* Livery bands */}
      <rect x="48" y="118" width="712" height="12" fill={C.burgundy} />
      <rect x="48" y="132" width="712" height="3" fill={C.taxi} />
      {/* Barred windows */}
      {windows.map((x) => (
        <g key={x}>
          <rect x={x} y="68" width="32" height="40" rx="3" fill={C.charcoal} stroke={C.ink} strokeWidth="2" />
          <path d={`M${x} 78 L${x + 32} 78 M${x} 88 L${x + 32} 88 M${x} 98 L${x + 32} 98`} stroke={C.chrome} strokeWidth="1.6" />
        </g>
      ))}
      {/* Open doorways with grab poles */}
      {doors.map((x) => (
        <g key={x}>
          <rect x={x} y="60" width="46" height="114" fill="#242424" stroke={C.ink} strokeWidth="2.5" />
          <path d={`M${x + 23} 64 L${x + 23} 172`} stroke={C.chrome} strokeWidth="3" />
          <path d={`M${x + 6} 66 L${x + 40} 66`} stroke={C.chrome} strokeWidth="2" />
        </g>
      ))}
      {/* Underframe & bogies */}
      <rect x="56" y="174" width="704" height="10" fill={C.charcoal} />
      {[150, 640].map((x) => (
        <g key={x}>
          <rect x={x - 40} y="182" width="80" height="10" rx="3" fill={C.ink} />
          <circle cx={x - 22} cy="196" r="10" fill={C.ink} />
          <circle cx={x + 22} cy="196" r="10" fill={C.ink} />
          <circle cx={x - 22} cy="196" r="4" fill={C.chrome} />
          <circle cx={x + 22} cy="196" r="4" fill={C.chrome} />
        </g>
      ))}
      {/* Rail */}
      <rect x="0" y="206" width="760" height="5" fill={C.ink} />
      {Array.from({ length: 26 }, (_, i) => (
        <rect key={i} x={i * 30 + 6} y="212" width="16" height="5" fill={C.charcoal} />
      ))}
    </svg>
  );
}

/** Black-and-yellow autorickshaw, side view, facing left. */
export function Auto({ className, title }: IllustrationProps) {
  return (
    <svg viewBox="0 0 300 220" className={className} {...a11y(title)}>
      <ellipse cx="156" cy="206" rx="132" ry="6" fill={C.ink} opacity="0.18" />
      {/* Canopy (yellow upper) */}
      <path d="M58 64 Q66 42 100 38 L232 38 Q262 40 266 68 L266 114 L196 114 L196 66 L112 66 L112 114 L58 114 Z" fill={C.taxi} stroke={C.ink} strokeWidth="3" strokeLinejoin="round" />
      {/* Windscreen */}
      <path d="M44 114 L58 60 L82 56 L82 114 Z" fill={C.glass} stroke={C.ink} strokeWidth="2.5" />
      <path d="M52 108 L62 64 L68 63 L58 108 Z" fill={C.paper} opacity="0.6" />
      {/* Open passenger side */}
      <rect x="112" y="66" width="84" height="48" fill={C.charcoal} />
      <rect x="150" y="78" width="40" height="34" rx="3" fill={C.burgundy} stroke={C.ink} strokeWidth="2" />
      <path d="M118 72 L118 112" stroke={C.chrome} strokeWidth="3" />
      {/* Driver area */}
      <rect x="82" y="66" width="30" height="48" fill="#2a2a2a" />
      <path d="M86 98 L104 92" stroke={C.chrome} strokeWidth="3" strokeLinecap="round" />
      {/* Lower body (black) */}
      <path
        d="M40 114 L266 114 Q280 118 280 142 L280 170 Q280 184 266 184 L246 184 A 26 26 0 0 0 194 184 L98 184 A 26 26 0 0 0 46 184 L42 184 Q34 150 40 114 Z"
        fill={C.ink}
      />
      <path d="M44 120 L264 120" stroke={C.paper} strokeWidth="1.5" opacity="0.35" />
      <circle cx="46" cy="134" r="7" fill="#FFF3C4" stroke={C.chrome} strokeWidth="2" />
      <rect x="272" y="132" width="8" height="14" rx="2" fill={C.best} />
      <Wheel x={72} y={184} r={22} />
      <Wheel x={220} y={184} r={22} />
    </svg>
  );
}
