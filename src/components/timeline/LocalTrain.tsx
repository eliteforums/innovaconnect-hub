import { useId } from "react";

/**
 * A 2D side-view model of a Mumbai suburban "local" (Western Railway EMU
 * livery): silver roof, white body with a magenta lower band and door frames,
 * open doorways, "WR" lettering, red pantograph and a yellow driving cab.
 * Facing right. Wheels carry the `train-wheel` class so CSS can spin them.
 */

const C = {
  magenta: "#B70DA2",
  magentaDark: "#8A0A7A",
  white: "#EEF0F2",
  whiteShade: "#D9DDE2",
  roof: "#BFC5CD",
  roofDark: "#8E96A1",
  roofBox: "#A3A6AD",
  yellow: "#F5C800",
  yellowDark: "#C9A200",
  glass: "#26303D",
  glassShine: "#5B6B7D",
  interior: "#1B2230",
  seat: "#2F5DA8",
  frame: "#9AA0A8",
  under: "#2B2523",
  bogie: "#3A2E28",
  rust: "#6B4A36",
  ink: "#171717",
  red: "#D62828",
  lamp: "#FFF4B8",
};

const CAR = 300; // car length
const PITCH = 306; // car + gangway
const DOORS = [22, 138, 254]; // doorway x positions within a car
const DOOR_W = 26;
const WINDOWS = [56, 92, 172, 208]; // window x positions within a car

function Wheel({ x, y }: { x: number; y: number }) {
  return (
    <g className="train-wheel">
      <circle cx={x} cy={y} r="9.5" fill={C.ink} />
      <circle cx={x} cy={y} r="6.5" fill="#4A4744" />
      <path d={`M${x - 6.5} ${y} H${x + 6.5} M${x} ${y - 6.5} V${y + 6.5}`} stroke="#8C8780" strokeWidth="1.6" />
      <circle cx={x} cy={y} r="2.2" fill="#B9B4AC" />
    </g>
  );
}

function Bogie({ x }: { x: number }) {
  return (
    <g>
      <rect x={x - 26} y="108" width="52" height="9" rx="2" fill={C.bogie} />
      <rect x={x - 20} y="104" width="40" height="5" fill={C.rust} />
      <path d={`M${x - 6} 110 v6 M${x + 6} 110 v6`} stroke={C.ink} strokeWidth="2" />
      <Wheel x={x - 15} y={118} />
      <Wheel x={x + 15} y={118} />
    </g>
  );
}

function Doorway({ x }: { x: number }) {
  return (
    <g>
      {/* Magenta frame, full height */}
      <rect x={x - 4} y="29" width={DOOR_W + 8} height="71" fill={C.magenta} />
      {/* Open doorway: interior, seats, grab pole */}
      <rect x={x} y="33" width={DOOR_W} height="67" fill={C.interior} />
      <rect x={x + 3} y="62" width="9" height="14" rx="1.5" fill={C.seat} />
      <rect x={x + 15} y="62" width="9" height="14" rx="1.5" fill={C.seat} opacity="0.75" />
      <path d={`M${x + DOOR_W / 2} 35 V98`} stroke={C.frame} strokeWidth="1.6" />
      <path d={`M${x} 98 H${x + DOOR_W}`} stroke="#5A5F66" strokeWidth="3" />
    </g>
  );
}

function Window({ x, w = 28 }: { x: number; w?: number }) {
  return (
    <g>
      <rect x={x} y="37" width={w} height="22" rx="3" fill={C.glass} stroke={C.frame} strokeWidth="2" />
      <path d={`M${x + 4} 55 L${x + 12} 41`} stroke={C.glassShine} strokeWidth="2.5" strokeLinecap="round" />
      <path d={`M${x + 2} 48 H${x + w - 2}`} stroke="#3B4552" strokeWidth="1.2" />
    </g>
  );
}

function Car({ x, pantograph = false, cab = false }: { x: number; pantograph?: boolean; cab?: boolean }) {
  return (
    <g transform={`translate(${x} 0)`}>
      {/* Roof */}
      <rect x="1" y="18" width={CAR - 2} height="14" rx="7" fill={C.roof} stroke={C.roofDark} strokeWidth="1" />
      <path d={`M8 22 H${CAR - 8}`} stroke="#E3E7EC" strokeWidth="1.5" />
      <path d={`M8 27 H${CAR - 8}`} stroke={C.roofDark} strokeWidth="1" strokeDasharray="6 4" />
      <rect x="24" y="10" width="44" height="10" rx="2.5" fill={C.roofBox} stroke={C.roofDark} />
      <rect x={CAR - 68} y="10" width="44" height="10" rx="2.5" fill={C.roofBox} stroke={C.roofDark} />
      {pantograph && (
        <g stroke={C.red} strokeWidth="2.2" fill="none" strokeLinejoin="round">
          <path d="M126 16 L150 2 L174 16" />
          <path d="M132 16 L150 6 L168 16" />
          <path d="M150 2 L140 -6 M150 2 L160 -6" />
          <path d="M134 -7 H166" strokeWidth="3" />
          <path d="M126 16 H174" stroke={C.ink} strokeWidth="2" />
        </g>
      )}

      {/* Body */}
      <rect x="0" y="28" width={CAR} height="72" fill={C.white} />
      <rect x="0" y="28" width={CAR} height="4" fill={C.whiteShade} />
      {/* Magenta lower band and white sill */}
      <rect x="0" y="66" width={CAR} height="26" fill={C.magenta} />
      <rect x="0" y="92" width={CAR} height="8" fill={C.white} />
      <path d={`M0 92 H${CAR}`} stroke={C.magentaDark} strokeWidth="1" />
      {/* Full-height magenta panel, as on the real coaches */}
      <rect x="166" y="29" width="76" height="37" fill={C.magenta} />

      {WINDOWS.map((wx) => (
        <Window key={wx} x={wx} />
      ))}
      {DOORS.map((dx) => (
        <Doorway key={dx} x={dx} />
      ))}

      {/* Lettering */}
      <text x="70" y="88" fontFamily="Arial, Helvetica, sans-serif" fontWeight="700" fontSize="19" fill={C.white}>
        WR
      </text>
      <text x="182" y="88" fontFamily="Arial, Helvetica, sans-serif" fontWeight="700" fontSize="19" fill={C.white}>
        WR
      </text>
      <text x="64" y="32.5" fontFamily="Arial, Helvetica, sans-serif" fontWeight="700" fontSize="5" fill="#7C8590">
        III
      </text>

      {/* Underframe and equipment */}
      <rect x="2" y="100" width={CAR - 4} height="7" fill={C.under} />
      <rect x="86" y="105" width="34" height="9" rx="1" fill={C.bogie} />
      <rect x="128" y="105" width="22" height="8" rx="1" fill={C.rust} />
      <rect x="158" y="105" width="40" height="9" rx="1" fill={C.bogie} />
      <Bogie x={44} />
      <Bogie x={CAR - 44} />

      {cab && <Cab />}
      {/* Body outline */}
      <rect x="0" y="28" width={CAR} height="72" fill="none" stroke="#5A5F66" strokeWidth="1" />
    </g>
  );
}

/** Yellow driving cab at the front (right) of the leading car. */
function Cab() {
  return (
    <g>
      <path
        d={`M${CAR - 2} 28 H${CAR + 24} Q${CAR + 40} 30 ${CAR + 42} 46 L${CAR + 44} 98 Q${CAR + 44} 101 ${CAR + 40} 101 H${CAR - 2} Z`}
        fill={C.yellow}
        stroke={C.yellowDark}
        strokeWidth="1.2"
      />
      {/* Cab roof cap and headcode lamps */}
      <path d={`M${CAR - 2} 18 H${CAR + 18} Q${CAR + 32} 20 ${CAR + 34} 30 H${CAR - 2} Z`} fill={C.roof} stroke={C.roofDark} />
      <rect x={CAR + 14} y="12" width="12" height="8" rx="2" fill={C.yellow} stroke={C.yellowDark} />
      {/* Windscreen and cab side window */}
      <path d={`M${CAR + 22} 35 L${CAR + 37} 38 L${CAR + 40} 60 L${CAR + 22} 60 Z`} fill={C.glass} stroke={C.ink} strokeWidth="1.5" />
      <path d={`M${CAR + 26} 56 L${CAR + 31} 41`} stroke={C.glassShine} strokeWidth="2" strokeLinecap="round" />
      <rect x={CAR + 3} y="36" width="14" height="22" rx="2" fill={C.glass} stroke={C.frame} strokeWidth="1.5" />
      {/* Indian Railways emblem (simplified, red) */}
      <g stroke={C.red} strokeWidth="1.6" fill="none">
        <path d={`M${CAR + 22} 70 h12 M${CAR + 28} 66 v12 M${CAR + 23} 76 l10 -9`} />
      </g>
      {/* Headlights */}
      <rect x={CAR + 30} y="84" width="12" height="7" rx="2" fill={C.ink} />
      <circle cx={CAR + 34} cy={87.5} r="2.3" fill={C.lamp} />
      <circle cx={CAR + 39} cy={87.5} r="2.3" fill={C.lamp} />
      {/* Coupler, buffer beam and cowcatcher */}
      <rect x={CAR + 40} y="100" width="12" height="5" rx="1" fill={C.ink} />
      <circle cx={CAR + 52} cy={102.5} r="3" fill={C.ink} />
      <path d={`M${CAR + 18} 101 H${CAR + 46} L${CAR + 42} 116 H${CAR + 20} Z`} fill={C.ink} />
      <path
        d={`M${CAR + 24} 103 v11 M${CAR + 29} 103 v11 M${CAR + 34} 103 v11 M${CAR + 39} 103 v11`}
        stroke="#5A5550"
        strokeWidth="1.2"
      />
    </g>
  );
}

export const LOCAL_TRAIN_VIEWBOX = { width: 3 * PITCH + 52, height: 138 };

export function LocalTrain({ className = "" }: { className?: string }) {
  const id = useId().replace(/:/g, "");
  const { width, height } = LOCAL_TRAIN_VIEWBOX;
  return (
    <svg viewBox={`0 -10 ${width} ${height}`} className={className} aria-hidden focusable="false">
      <defs>
        {/* The tail fades out, like the motion blur on the photographed train. */}
        <linearGradient id={`fade-${id}`} x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor="#fff" stopOpacity="0" />
          <stop offset="0.16" stopColor="#fff" stopOpacity="1" />
          <stop offset="1" stopColor="#fff" stopOpacity="1" />
        </linearGradient>
        <mask id={`mask-${id}`} maskUnits="userSpaceOnUse" x="0" y="-10" width={width} height={height}>
          <rect x="0" y="-10" width={width} height={height} fill={`url(#fade-${id})`} />
        </mask>
      </defs>
      <g mask={`url(#mask-${id})`}>
        {/* Gangways between cars */}
        {[1, 2].map((i) => (
          <rect key={i} x={i * PITCH - 7} y="32" width="8" height="66" fill="#2A2A2A" />
        ))}
        <Car x={0} />
        <Car x={PITCH} pantograph />
        <Car x={2 * PITCH} cab />
      </g>
      {/* Speed lines at the tail */}
      <g stroke="#9C958A" strokeWidth="1.5" strokeLinecap="round" opacity="0.55">
        <path d="M4 44 H70" />
        <path d="M14 72 H96" />
        <path d="M0 96 H58" />
      </g>
    </svg>
  );
}
