import { useId } from "react";
import { C, a11y, type IllustrationProps } from "./palette";

const F = {
  pav: "#D9A35A",
  pavLight: "#EBC489",
  vada: "#C27A2C",
  chutney: "#5E8C31",
  garlic: "#B23A1F",
  chilli: "#4F7A28",
  bhaji: "#C4502A",
  butter: "#F6E08A",
  tari: "#B8361E",
  farsan: "#E0A030",
  steel: "#C4C1BA",
};

function Newsprint({ x, y, w, h, rotate = 0 }: { x: number; y: number; w: number; h: number; rotate?: number }) {
  const lines = Array.from({ length: Math.floor((h - 20) / 9) }, (_, i) => i);
  return (
    <g transform={`rotate(${rotate} ${x + w / 2} ${y + h / 2})`}>
      <rect x={x} y={y} width={w} height={h} fill={C.paper} stroke={C.ink} strokeWidth="2" />
      <rect x={x + 10} y={y + 8} width={w * 0.6} height="7" fill={C.ink} />
      {lines.map((i) => (
        <g key={i}>
          <path d={`M${x + 10} ${y + 24 + i * 9} L${x + w / 2 - 6} ${y + 24 + i * 9}`} stroke={C.rule} strokeWidth="3" />
          <path d={`M${x + w / 2 + 6} ${y + 24 + i * 9} L${x + w - 10} ${y + 24 + i * 9}`} stroke={C.rule} strokeWidth="3" />
        </g>
      ))}
    </g>
  );
}

function Crumbs({ cx, cy, r, color, count = 14 }: { cx: number; cy: number; r: number; color: string; count?: number }) {
  return (
    <g fill={color}>
      {Array.from({ length: count }, (_, i) => {
        const a = (i * 137.5 * Math.PI) / 180;
        const d = r * Math.sqrt((i + 0.5) / count);
        return <circle key={i} cx={cx + Math.cos(a) * d} cy={cy + Math.sin(a) * d * 0.6} r={1.8 + (i % 3) * 0.6} />;
      })}
    </g>
  );
}

export function VadaPav({ className, title }: IllustrationProps) {
  return (
    <svg viewBox="0 0 300 240" className={className} {...a11y(title)} preserveAspectRatio="xMidYMid slice">
      <rect width="300" height="240" fill={C.taxi} />
      <Newsprint x={30} y={60} w={240} h={170} rotate={-6} />
      {/* Bottom bun */}
      <path d="M70 168 Q150 206 232 168 L226 182 Q150 214 76 182 Z" fill={F.pav} stroke={C.ink} strokeWidth="3" strokeLinejoin="round" />
      {/* Vada */}
      <ellipse cx="150" cy="160" rx="78" ry="24" fill={F.vada} stroke={C.ink} strokeWidth="3" />
      <Crumbs cx={150} cy={160} r={64} color="#8E5418" count={22} />
      {/* Chutneys */}
      <path d="M86 158 Q100 172 112 160 Q124 176 138 162 Q150 176 164 162 Q178 174 190 160 Q204 172 214 158" stroke={F.chutney} strokeWidth="6" fill="none" strokeLinecap="round" />
      <path d="M100 152 L112 156 M150 150 L162 154 M196 152 L206 156" stroke={F.garlic} strokeWidth="5" strokeLinecap="round" />
      {/* Top bun */}
      <path d="M66 150 Q70 80 150 76 Q230 80 236 150 Q150 166 66 150 Z" fill={F.pav} stroke={C.ink} strokeWidth="3" strokeLinejoin="round" />
      <path d="M96 112 Q120 88 160 90" stroke={F.pavLight} strokeWidth="8" fill="none" strokeLinecap="round" />
      <path d="M70 140 Q150 152 232 140" stroke="#B27E3D" strokeWidth="2" fill="none" />
      {/* Fried green chilli */}
      <path d="M200 206 Q240 214 262 186 Q266 180 260 178 Q238 202 202 198 Z" fill={F.chilli} stroke={C.ink} strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M260 178 L268 168" stroke={C.ink} strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

export function PavBhaji({ className, title }: IllustrationProps) {
  const id = useId().replace(/:/g, "");
  return (
    <svg viewBox="0 0 300 240" className={className} {...a11y(title)} preserveAspectRatio="xMidYMid slice">
      <defs>
        <pattern id={`dots-${id}`} width="6" height="6" patternUnits="userSpaceOnUse">
          <circle cx="3" cy="3" r="1" fill={C.ink} opacity="0.18" />
        </pattern>
      </defs>
      <rect width="300" height="240" fill={C.rose} />
      <rect width="300" height="240" fill={`url(#dots-${id})`} />
      {/* Steel plate */}
      <ellipse cx="150" cy="132" rx="134" ry="86" fill={F.steel} stroke={C.ink} strokeWidth="3" />
      <ellipse cx="150" cy="132" rx="116" ry="72" fill="#D8D5CE" stroke={C.ink} strokeWidth="1.5" />
      {/* Bhaji */}
      <path d="M58 132 Q62 88 120 84 Q170 76 196 102 Q214 128 192 152 Q160 176 106 168 Q60 162 58 132 Z" fill={F.bhaji} stroke={C.ink} strokeWidth="3" />
      <Crumbs cx={128} cy={126} r={56} color="#8F3418" count={18} />
      <rect x="112" y="100" width="22" height="18" rx="3" fill={F.butter} stroke={C.ink} strokeWidth="2" transform="rotate(-10 123 109)" />
      {/* Onion and coriander */}
      {[[84, 140], [96, 150], [150, 152], [164, 140], [78, 124]].map(([x, y], i) => (
        <rect key={i} x={x} y={y} width="7" height="6" fill={C.paper} stroke={C.ink} strokeWidth="1" />
      ))}
      {[[100, 128], [140, 116], [170, 128], [124, 150], [90, 110]].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="3" fill={F.chilli} />
      ))}
      {/* Lemon */}
      <path d="M190 170 Q214 150 236 166 Z" fill={C.taxi} stroke={C.ink} strokeWidth="2.5" />
      {/* Pav pair */}
      {[0, 1].map((i) => (
        <g key={i} transform={`rotate(${-8 + i * 6} ${222 + i * 10} ${100 + i * 26})`}>
          <rect x={194 + i * 10} y={82 + i * 26} width="58" height="34" rx="12" fill={F.pav} stroke={C.ink} strokeWidth="3" />
          <path d={`M${202 + i * 10} ${92 + i * 26} Q${222 + i * 10} ${86 + i * 26} ${242 + i * 10} ${92 + i * 26}`} stroke={F.butter} strokeWidth="5" fill="none" strokeLinecap="round" />
        </g>
      ))}
    </svg>
  );
}

export function MisalPav({ className, title }: IllustrationProps) {
  return (
    <svg viewBox="0 0 300 240" className={className} {...a11y(title)} preserveAspectRatio="xMidYMid slice">
      <rect width="300" height="240" fill={C.deep} />
      {/* Steel bowl */}
      <path d="M40 104 Q44 200 140 206 Q236 200 240 104 Z" fill={F.steel} stroke={C.ink} strokeWidth="3" />
      <ellipse cx="140" cy="104" rx="100" ry="30" fill="#D8D5CE" stroke={C.ink} strokeWidth="3" />
      <ellipse cx="140" cy="106" rx="86" ry="22" fill={F.tari} stroke={C.ink} strokeWidth="2" />
      <Crumbs cx={140} cy={104} r={62} color={F.farsan} count={40} />
      {[[110, 100], [150, 96], [176, 108], [126, 114]].map(([x, y], i) => (
        <rect key={i} x={x} y={y} width="7" height="6" fill={C.paper} stroke={C.ink} strokeWidth="1" />
      ))}
      {[[100, 108], [160, 112], [140, 98]].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="3" fill={F.chilli} />
      ))}
      <path d="M60 140 Q140 160 220 140" stroke={C.paper} strokeWidth="4" fill="none" opacity="0.5" />
      {/* Pav */}
      <rect x="208" y="150" width="70" height="44" rx="16" fill={F.pav} stroke={C.ink} strokeWidth="3" />
      <path d="M218 164 Q242 156 266 164" stroke={F.pavLight} strokeWidth="6" fill="none" strokeLinecap="round" />
      {/* Lemon */}
      <path d="M30 200 Q50 178 76 196 Z" fill={C.taxi} stroke={C.ink} strokeWidth="2.5" />
    </svg>
  );
}
