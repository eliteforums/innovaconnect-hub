import { C, a11y, type IllustrationProps } from "./palette";

/** Neural-network and attention-grid diagram for the AI domain. */
export function AiDiagram({ className, title }: IllustrationProps) {
  const layers = [
    { x: 46, n: 4 },
    { x: 126, n: 6 },
    { x: 206, n: 6 },
    { x: 286, n: 3 },
  ];
  const nodeY = (n: number, i: number) => 150 + (i - (n - 1) / 2) * 34;
  const grid = Array.from({ length: 36 }, (_, i) => i);
  return (
    <svg viewBox="0 0 400 300" className={className} {...a11y(title)} preserveAspectRatio="xMidYMid slice">
      <rect width="400" height="300" fill={C.violetSoft} />
      {Array.from({ length: 21 }, (_, i) => (
        <path key={i} d={`M${i * 20} 0 L${i * 20} 300`} stroke={C.violet} strokeWidth="0.5" opacity="0.18" />
      ))}
      {Array.from({ length: 16 }, (_, i) => (
        <path key={i} d={`M0 ${i * 20} L400 ${i * 20}`} stroke={C.violet} strokeWidth="0.5" opacity="0.18" />
      ))}
      {/* Connections */}
      {layers.slice(0, -1).map((l, li) => {
        const next = layers[li + 1];
        return Array.from({ length: l.n }, (_, i) =>
          Array.from({ length: next.n }, (_, j) => (
            <path
              key={`${li}-${i}-${j}`}
              d={`M${l.x} ${nodeY(l.n, i)} L${next.x} ${nodeY(next.n, j)}`}
              stroke={(i + j + li) % 4 === 0 ? C.violet : C.ink}
              strokeWidth={(i + j + li) % 4 === 0 ? 1.6 : 0.6}
              opacity={(i + j + li) % 4 === 0 ? 0.9 : 0.35}
            />
          )),
        );
      })}
      {/* Nodes */}
      {layers.map((l, li) =>
        Array.from({ length: l.n }, (_, i) => (
          <circle
            key={`${li}-${i}`}
            cx={l.x}
            cy={nodeY(l.n, i)}
            r="8"
            fill={(i + li) % 3 === 0 ? C.violet : C.paper}
            stroke={C.ink}
            strokeWidth="2"
          />
        )),
      )}
      {/* Attention grid */}
      <g transform="translate(320 96)">
        {grid.map((i) => {
          const r = Math.floor(i / 6);
          const c = i % 6;
          const w = Math.max(0.08, 1 - Math.abs(r - c) * 0.28 - ((r * 7 + c * 3) % 5) * 0.05);
          return <rect key={i} x={c * 11} y={r * 11} width="10" height="10" fill={C.violet} opacity={w} />;
        })}
        <rect x="-2" y="-2" width="68" height="68" fill="none" stroke={C.ink} strokeWidth="1.5" />
      </g>
      <g fontFamily="monospace" fontSize="9" letterSpacing="1.5" fill={C.ink}>
        <text x="28" y="44">INPUT</text>
        <text x="150" y="44">MODEL</text>
        <text x="262" y="44">OUTPUT</text>
        <text x="320" y="182">ATTENTION</text>
      </g>
      <g fontFamily="monospace" fontSize="10" fill={C.paper}>
        {["idea", "→", "agent", "→", "impact"].map((t, i) => (
          <g key={i}>
            <rect x={28 + i * 66} y="252" width={t === "→" ? 22 : 54} height="20" fill={t === "→" ? "transparent" : C.ink} />
            <text x={t === "→" ? 34 + i * 66 : 36 + i * 66} y="266" fill={t === "→" ? C.ink : C.paper}>
              {t}
            </text>
          </g>
        ))}
      </g>
    </svg>
  );
}

/** Notebook, wireframes, sticky notes and a light bulb for the startup domain. */
export function StartupSketch({ className, title }: IllustrationProps) {
  return (
    <svg viewBox="0 0 400 300" className={className} {...a11y(title)} preserveAspectRatio="xMidYMid slice">
      <rect width="400" height="300" fill={C.rose} />
      {/* Notebook */}
      <g transform="rotate(-5 190 170)">
        <rect x="44" y="70" width="300" height="200" fill={C.paper} stroke={C.ink} strokeWidth="3" />
        <path d="M194 70 L194 270" stroke={C.ink} strokeWidth="2" />
        {Array.from({ length: 9 }, (_, i) => (
          <path key={i} d={`M52 ${96 + i * 20} L186 ${96 + i * 20} M202 ${96 + i * 20} L336 ${96 + i * 20}`} stroke={C.rule} strokeWidth="1" />
        ))}
        {/* Phone wireframe */}
        <rect x="80" y="88" width="66" height="128" rx="10" fill="none" stroke={C.burgundy} strokeWidth="2.5" />
        <rect x="90" y="104" width="46" height="26" fill={C.burgundy} opacity="0.2" />
        <path d="M90 140 L136 140 M90 150 L124 150 M90 160 L130 160" stroke={C.burgundy} strokeWidth="2" />
        <rect x="90" y="176" width="46" height="14" rx="3" fill={C.burgundy} />
        {/* Flow sketch */}
        <rect x="214" y="92" width="50" height="26" fill="none" stroke={C.ink} strokeWidth="2" />
        <rect x="274" y="140" width="52" height="26" fill="none" stroke={C.ink} strokeWidth="2" />
        <rect x="214" y="188" width="50" height="26" fill={C.taxi} stroke={C.ink} strokeWidth="2" />
        <path d="M264 106 Q300 108 300 138 M274 154 Q240 160 240 186" stroke={C.ink} strokeWidth="1.6" fill="none" strokeDasharray="4 3" />
        <text x="222" y="109" fontFamily="monospace" fontSize="9" fill={C.ink}>USER</text>
        <text x="282" y="157" fontFamily="monospace" fontSize="9" fill={C.ink}>PROBLEM</text>
        <text x="222" y="205" fontFamily="monospace" fontSize="9" fill={C.ink}>MVP</text>
      </g>
      {/* Sticky notes */}
      <rect x="300" y="30" width="64" height="60" fill={C.taxi} stroke={C.ink} strokeWidth="2" transform="rotate(8 332 60)" />
      <path d="M312 50 L350 54 M310 62 L344 66" stroke={C.ink} strokeWidth="1.5" transform="rotate(8 332 60)" />
      <rect x="24" y="22" width="58" height="54" fill={C.paper} stroke={C.ink} strokeWidth="2" transform="rotate(-10 53 49)" />
      <path d="M34 42 L68 38 M34 54 L62 50" stroke={C.burgundy} strokeWidth="1.8" transform="rotate(-10 53 49)" />
      {/* Light bulb */}
      <circle cx="196" cy="48" r="34" fill={C.taxi} opacity="0.55" />
      <path d="M182 68 Q166 54 170 38 Q176 18 196 18 Q216 18 222 38 Q226 54 210 68 Z" fill={C.paper} stroke={C.ink} strokeWidth="2.5" />
      <path d="M188 60 Q190 44 196 52 Q202 44 204 60" stroke={C.burgundy} strokeWidth="2" fill="none" />
      <rect x="184" y="68" width="24" height="12" fill={C.chrome} stroke={C.ink} strokeWidth="2" />
      {/* Pencil */}
      <g transform="rotate(32 320 230)">
        <rect x="270" y="222" width="100" height="14" fill={C.taxi} stroke={C.ink} strokeWidth="2" />
        <path d="M370 222 L388 229 L370 236 Z" fill={C.deep} stroke={C.ink} strokeWidth="2" />
        <rect x="262" y="222" width="10" height="14" fill={C.burgundy} stroke={C.ink} strokeWidth="2" />
      </g>
    </svg>
  );
}

/** Laptop with code, a prototype on a phone, and a glass of cutting chai. */
export function Workstation({ className, title }: IllustrationProps) {
  const code = [
    [0, 60, C.violet], [12, 90, C.ink], [12, 70, C.burgundy], [24, 110, C.ink],
    [24, 50, C.violet], [12, 80, C.ink], [0, 40, C.burgundy], [0, 96, C.ink],
  ] as const;
  return (
    <svg viewBox="0 0 400 300" className={className} {...a11y(title)} preserveAspectRatio="xMidYMid slice">
      <rect width="400" height="300" fill={C.deep} />
      <rect y="226" width="400" height="74" fill={C.stone} />
      <path d="M0 226 L400 226" stroke={C.ink} strokeWidth="2" />
      {/* Laptop */}
      <rect x="70" y="60" width="210" height="140" rx="6" fill={C.ink} />
      <rect x="80" y="70" width="190" height="120" fill={C.paper} />
      {code.map(([indent, len, color], i) => (
        <rect key={i} x={92 + indent} y={82 + i * 13} width={len} height="5" rx="2" fill={color} opacity="0.85" />
      ))}
      <path d="M48 200 L302 200 L318 222 L32 222 Z" fill={C.charcoal} stroke={C.ink} strokeWidth="2" />
      <rect x="150" y="206" width="50" height="6" rx="3" fill={C.ink} />
      {/* Phone */}
      <rect x="296" y="130" width="54" height="92" rx="8" fill={C.ink} transform="rotate(8 323 176)" />
      <rect x="302" y="138" width="42" height="74" rx="3" fill={C.taxi} transform="rotate(8 323 176)" />
      <rect x="308" y="150" width="30" height="16" fill={C.paper} transform="rotate(8 323 176)" />
      {/* Cutting chai */}
      <path d="M352 168 L384 168 L378 220 L358 220 Z" fill="#F3E3C6" stroke={C.ink} strokeWidth="2.5" />
      <path d="M354 182 L382 182 L378 220 L358 220 Z" fill="#B9773B" opacity="0.85" />
      <path d="M362 160 q4 -8 0 -14 M374 160 q4 -8 0 -14" stroke={C.ink} strokeWidth="1.5" fill="none" opacity="0.6" />
    </svg>
  );
}
