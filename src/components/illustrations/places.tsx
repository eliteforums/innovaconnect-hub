import { useId } from "react";
import { C, a11y, type IllustrationProps } from "./palette";

/** A pointed (Gothic) arch window path. */
function gothicArch(x: number, y: number, w: number, h: number) {
  const mid = x + w / 2;
  const spring = y + w * 0.55;
  return `M${x} ${y + h} L${x} ${spring} Q${x} ${y + w * 0.1} ${mid} ${y - w * 0.25} Q${x + w} ${y + w * 0.1} ${x + w} ${spring} L${x + w} ${y + h} Z`;
}

/** A round (Romanesque) arch window path. */
function roundArch(x: number, y: number, w: number, h: number) {
  const r = w / 2;
  return `M${x} ${y + h} L${x} ${y + r} A ${r} ${r} 0 0 1 ${x + w} ${y + r} L${x + w} ${y + h} Z`;
}

function Halftone({ id, color = C.ink, size = 6, opacity = 0.22 }: { id: string; color?: string; size?: number; opacity?: number }) {
  return (
    <pattern id={id} width={size} height={size} patternUnits="userSpaceOnUse">
      <circle cx={size / 2} cy={size / 2} r={size * 0.18} fill={color} opacity={opacity} />
    </pattern>
  );
}

function Turret({ x, y, w }: { x: number; y: number; w: number }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={34} fill={C.deep} stroke={C.ink} strokeWidth="2.5" />
      <path d={`M${x - 3} ${y} Q${x + w / 2} ${y - w * 1.3} ${x + w + 3} ${y} Z`} fill={C.stone} stroke={C.ink} strokeWidth="2.5" />
      <path d={`M${x + w / 2} ${y - w * 0.65} L${x + w / 2} ${y - w * 1.1}`} stroke={C.ink} strokeWidth="2.5" />
      <path d={gothicArch(x + w * 0.3, y + 10, w * 0.4, 20)} fill={C.ink} />
    </g>
  );
}

/**
 * Victorian Gothic railway / civic building. Inspired by the style; does not
 * depict a specific building.
 */
export function Heritage({ className, title }: IllustrationProps) {
  const id = useId().replace(/:/g, "");
  const wingWindows = [0, 1, 2, 3];
  return (
    <svg viewBox="0 -28 520 432" className={className} {...a11y(title)}>
      <defs>
        <Halftone id={`ht-${id}`} />
      </defs>
      {/* Wings */}
      {[40, 320].map((wx) => (
        <g key={wx}>
          <rect x={wx} y="196" width="160" height="204" fill={C.deep} stroke={C.ink} strokeWidth="3" />
          <rect x={wx} y="196" width="160" height="12" fill={C.stone} stroke={C.ink} strokeWidth="2.5" />
          <path d={`M${wx} 280 L${wx + 160} 280 M${wx} 340 L${wx + 160} 340`} stroke={C.burgundy} strokeWidth="5" opacity="0.55" />
          {wingWindows.map((i) => (
            <g key={i}>
              <path d={gothicArch(wx + 14 + i * 37, 222, 22, 46)} fill={C.ink} />
              <path d={gothicArch(wx + 14 + i * 37, 296, 22, 34)} fill={C.ink} />
              <path d={roundArch(wx + 12 + i * 37, 356, 26, 44)} fill={C.charcoal} />
            </g>
          ))}
          <Turret x={wx === 40 ? 34 : 456} y={164} w={30} />
        </g>
      ))}
      {/* Central block */}
      <rect x="196" y="140" width="128" height="260" fill={C.paper} stroke={C.ink} strokeWidth="3" />
      <rect x="196" y="140" width="128" height="260" fill={`url(#ht-${id})`} />
      <path d="M196 236 L324 236 M196 312 L324 312" stroke={C.burgundy} strokeWidth="6" opacity="0.6" />
      {/* Clock */}
      <circle cx="260" cy="186" r="24" fill={C.paper} stroke={C.ink} strokeWidth="3" />
      <circle cx="260" cy="186" r="18" fill="none" stroke={C.ink} strokeWidth="1" />
      <path d="M260 186 L260 172 M260 186 L270 190" stroke={C.ink} strokeWidth="2.5" strokeLinecap="round" />
      {/* Tall gothic windows */}
      {[212, 250, 288].map((x) => (
        <path key={x} d={gothicArch(x, 250, 22, 54)} fill={C.ink} />
      ))}
      {/* Grand entrance */}
      <path d={gothicArch(228, 334, 64, 66)} fill={C.ink} />
      <path d={gothicArch(238, 344, 44, 56)} fill="#2b2b2b" stroke={C.taxi} strokeWidth="2" />
      {/* Gable and drum */}
      <path d="M190 142 L260 96 L330 142 Z" fill={C.stone} stroke={C.ink} strokeWidth="3" strokeLinejoin="round" />
      <rect x="216" y="80" width="88" height="34" fill={C.deep} stroke={C.ink} strokeWidth="3" />
      {[224, 244, 264, 284].map((x) => (
        <path key={x} d={gothicArch(x, 90, 12, 20)} fill={C.ink} />
      ))}
      {/* Ribbed dome */}
      <path d="M206 82 Q206 10 260 4 Q314 10 314 82 Z" fill={C.stone} stroke={C.ink} strokeWidth="3" />
      <path d="M206 82 Q206 10 260 4 Q314 10 314 82 Z" fill={`url(#ht-${id})`} />
      <path d="M232 82 Q234 26 260 6 M288 82 Q286 26 260 6 M260 6 L260 82" stroke={C.ink} strokeWidth="2" fill="none" />
      <path d="M260 4 L260 -18" stroke={C.ink} strokeWidth="3" />
      <circle cx="260" cy="-20" r="4" fill={C.taxi} stroke={C.ink} strokeWidth="2" />
      {/* Ground */}
      <path d="M0 400 L520 400" stroke={C.ink} strokeWidth="4" />
    </svg>
  );
}

/** Curved seaside promenade at sunset, inspired by Marine Drive. */
export function Coast({ className, title }: IllustrationProps) {
  const id = useId().replace(/:/g, "");
  const blocks = [
    [40, 150, 26, 40],
    [70, 138, 30, 54],
    [104, 146, 24, 44],
    [132, 128, 34, 62],
    [170, 140, 28, 48],
    [202, 118, 22, 74],
    [228, 134, 36, 54],
    [268, 124, 30, 62],
    [302, 140, 40, 46],
    [346, 112, 26, 74],
    [376, 132, 30, 54],
  ];
  const lights = Array.from({ length: 16 }, (_, i) => {
    const t = i / 15;
    const x = (1 - t) * (1 - t) * -10 + 2 * (1 - t) * t * 110 + t * t * 410;
    const y = (1 - t) * (1 - t) * 300 + 2 * (1 - t) * t * 196 + t * t * 196;
    return { x, y };
  });
  return (
    <svg viewBox="0 0 400 300" className={className} {...a11y(title)} preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id={`sky-${id}`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#F2C9A0" />
          <stop offset="0.55" stopColor="#F6E2C0" />
          <stop offset="1" stopColor={C.cream} />
        </linearGradient>
        <Halftone id={`ht-${id}`} color={C.ink} size={5} opacity={0.25} />
      </defs>
      <rect width="400" height="300" fill={`url(#sky-${id})`} />
      <circle cx="96" cy="112" r="46" fill={C.taxi} opacity="0.9" />
      {/* Skyline */}
      {blocks.map(([x, y, w, h], i) => (
        <g key={i}>
          <rect x={x} y={y} width={w} height={h + 10} fill={i % 3 === 0 ? C.charcoal : "#4a4540"} />
          {Array.from({ length: Math.floor(h / 12) }, (_, r) => (
            <path key={r} d={`M${x + 4} ${y + 8 + r * 12} L${x + w - 4} ${y + 8 + r * 12}`} stroke="#F6D98A" strokeWidth="2" strokeDasharray="3 3" opacity="0.7" />
          ))}
        </g>
      ))}
      {/* Sea */}
      <path d="M-10 300 Q110 196 410 196 L410 300 Z" fill={C.paper} />
      <path d="M-10 300 Q110 200 410 200 L410 214 Q150 214 30 300 Z" fill={C.ink} />
      <path d="M0 300 L0 236 Q60 214 140 206 L410 206 L410 300 Z" fill={C.sea} opacity="0" />
      <path d="M-10 300 Q30 250 120 226 L120 300 Z" fill={C.sea} />
      <path d="M-10 300 Q30 250 120 226 L120 300 Z" fill={`url(#ht-${id})`} />
      {/* Promenade road */}
      <path d="M-10 300 Q110 196 410 196" stroke={C.ink} strokeWidth="10" fill="none" />
      <path d="M-10 300 Q110 196 410 196" stroke={C.paper} strokeWidth="1.5" strokeDasharray="8 8" fill="none" />
      {/* Queen's Necklace lights */}
      {lights.map(({ x, y }, i) => (
        <g key={i}>
          <path d={`M${x} ${y} L${x} ${y - 12}`} stroke={C.ink} strokeWidth="1.5" />
          <circle cx={x} cy={y - 13} r="3" fill={C.taxi} stroke={C.ink} strokeWidth="1" />
        </g>
      ))}
      {/* Waves */}
      {[244, 262, 280].map((y, i) => (
        <path key={y} d={`M${-10 + i * 10} ${y + 10} q 10 -6 20 0 t 20 0 t 20 0`} stroke={C.ink} strokeWidth="1.5" fill="none" opacity="0.6" />
      ))}
      {/* Sea wall tetrapods */}
      {[150, 186, 222, 258, 294, 330, 366].map((x) => (
        <path key={x} d={`M${x} 228 l8 -10 l8 10 l-8 4 Z`} fill={C.stone} stroke={C.ink} strokeWidth="1.5" />
      ))}
      <rect x="120" y="216" width="290" height="84" fill={C.sea} />
      <rect x="120" y="216" width="290" height="84" fill={`url(#ht-${id})`} />
      {[236, 256, 276].map((y, i) => (
        <path key={y} d={`M${150 + i * 40} ${y} q 12 -6 24 0 t 24 0 t 24 0`} stroke={C.ink} strokeWidth="1.5" fill="none" opacity="0.6" />
      ))}
    </svg>
  );
}

/** Arts-precinct street scene, inspired by Kala Ghoda. */
export function KalaGhoda({ className, title }: IllustrationProps) {
  const id = useId().replace(/:/g, "");
  const flags = [C.taxi, C.burgundy, C.best, C.violet, C.taxi, C.burgundy, C.best, C.violet, C.taxi];
  return (
    <svg viewBox="0 0 400 300" className={className} {...a11y(title)} preserveAspectRatio="xMidYMid slice">
      <defs>
        <Halftone id={`ht-${id}`} size={6} opacity={0.2} />
      </defs>
      <rect width="400" height="300" fill={C.cream} />
      {/* Facade */}
      <rect x="30" y="58" width="300" height="230" fill={C.deep} stroke={C.ink} strokeWidth="3" />
      <rect x="30" y="58" width="300" height="230" fill={`url(#ht-${id})`} />
      <rect x="22" y="48" width="316" height="14" fill={C.stone} stroke={C.ink} strokeWidth="2.5" />
      <path d="M30 150 L330 150" stroke={C.ink} strokeWidth="2" />
      {[48, 104, 216, 272].map((x) => (
        <g key={x}>
          <path d={roundArch(x, 78, 40, 60)} fill={C.ink} />
          <path d={`M${x + 20} 78 L${x + 20} 138 M${x} 108 L${x + 40} 108`} stroke={C.deep} strokeWidth="2" />
          <path d={roundArch(x, 172, 40, 70)} fill={C.charcoal} />
        </g>
      ))}
      {/* Gallery entrance */}
      <path d={roundArch(152, 160, 56, 128)} fill={C.ink} />
      <path d={roundArch(160, 168, 40, 120)} fill={C.taxi} opacity="0.85" />
      <rect x="168" y="196" width="24" height="30" fill={C.burgundy} />
      {/* Bunting */}
      <path d="M0 26 Q200 56 400 26" stroke={C.ink} strokeWidth="1.5" fill="none" />
      {flags.map((color, i) => {
        const t = (i + 0.5) / flags.length;
        const x = t * 400;
        const y = 26 + 4 * t * (1 - t) * 30;
        return <path key={i} d={`M${x - 11} ${y} L${x + 11} ${y} L${x} ${y + 20} Z`} fill={color} stroke={C.ink} strokeWidth="1.2" />;
      })}
      {/* Easel with canvas */}
      <path d="M318 296 L346 176 L374 296 M346 176 L346 300" stroke={C.ink} strokeWidth="4" strokeLinecap="round" />
      <rect x="306" y="176" width="80" height="66" fill={C.paper} stroke={C.ink} strokeWidth="3" transform="rotate(-4 346 209)" />
      <circle cx="334" cy="204" r="14" fill={C.taxi} />
      <path d="M318 232 Q344 210 374 226" stroke={C.best} strokeWidth="6" fill="none" strokeLinecap="round" />
      <path d="M352 196 l14 -6 l-4 14 Z" fill={C.violet} />
      {/* Paint splash */}
      <path d="M40 300 Q46 272 70 278 Q84 258 102 276 Q124 272 118 300 Z" fill={C.burgundy} opacity="0.9" />
    </svg>
  );
}
