import { useId } from "react";
import type { SiteContent } from "@/lib/content";
import { cityDistrictPath, frame, suburbanDistrictPath } from "./mumbai-boundary";

const INK = "#171717";
const PAPER = "#FFFDF7";
const LAND = "#EBE3D3";
const CITY = "#DFD2B8";
const TAXI = "#F4C430";
const MUTED = "#5A5348";

/** Equirectangular projection matching scripts/mumbai-map/generate.py. */
function p(lat: number, lon: number): [number, number] {
  return [(lon - frame.lon0) * frame.kx * frame.scale, (frame.lat1 - lat) * frame.scale];
}

const pxPerKm = frame.scale / 111.32;

/**
 * Editorial map of Mumbai: OpenStreetMap district outlines, the three
 * suburban railway lines, and numbered landmarks keyed in the page.
 */
export function MumbaiMap({ className = "", map }: { className?: string; map: SiteContent["map"] }) {
  const { interchanges, landmarks, placeLabels, railLines, seaLink } = map;
  const id = useId().replace(/:/g, "");
  const titleId = `map-title-${id}`;
  const descId = `map-desc-${id}`;
  const { width: w, height: h } = frame;

  const labelled = new Set<string>();

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      className={className}
      role="img"
      aria-labelledby={`${titleId} ${descId}`}
    >
      <title id={titleId}>Map of Mumbai</title>
      <desc id={descId}>
        Outline of Mumbai City and Mumbai Suburban districts with the Western, Central and Harbour suburban railway
        lines and nine numbered landmarks, listed in the key beside the map.
      </desc>
      <defs>
        <pattern id={`dots-${id}`} width="6" height="6" patternUnits="userSpaceOnUse">
          <circle cx="3" cy="3" r="0.9" fill={INK} opacity="0.16" />
        </pattern>
        <pattern id={`waves-${id}`} width="28" height="14" patternUnits="userSpaceOnUse">
          <path d="M0 9 q7 -5 14 0 t14 0" fill="none" stroke={INK} strokeWidth="0.8" opacity="0.18" />
        </pattern>
      </defs>

      {/* Sea texture, west of the coast only */}
      <rect x="0" y="0" width={w * 0.24} height={h} fill={`url(#waves-${id})`} />
      <rect x="0" y={h * 0.86} width={w * 0.55} height={h * 0.14} fill={`url(#waves-${id})`} />

      {/* Graticule */}
      <g stroke={INK} strokeWidth="0.6" strokeDasharray="2 5" opacity="0.35">
        {[18.9, 19.0, 19.1, 19.2].map((lat) => {
          const [, y] = p(lat, frame.lon0);
          return <path key={lat} d={`M0 ${y} H${w}`} />;
        })}
        {[72.8, 72.9].map((lon) => {
          const [x] = p(frame.lat0, lon);
          return <path key={lon} d={`M${x} 0 V${h}`} />;
        })}
      </g>
      <g fontFamily="var(--font-plex-mono), monospace" fontSize="10" fill={MUTED} letterSpacing="1">
        {[18.9, 19.0, 19.1, 19.2].map((lat) => (
          <text key={lat} x={6} y={p(lat, frame.lon0)[1] - 4}>
            {lat.toFixed(1)}°N
          </text>
        ))}
        {[72.8, 72.9].map((lon) => (
          <text key={lon} x={p(frame.lat0, lon)[0] + 4} y={14}>
            {lon.toFixed(1)}°E
          </text>
        ))}
      </g>

      {/* Land: print-style offset shadow, fill, halftone, outline */}
      <g transform="translate(5 5)" fill={INK} opacity="0.12">
        <path d={cityDistrictPath} />
        <path d={suburbanDistrictPath} />
      </g>
      <g stroke={INK} strokeWidth="1.4" strokeLinejoin="round">
        <path d={suburbanDistrictPath} fill={LAND} />
        <path d={cityDistrictPath} fill={CITY} />
      </g>
      <g fill={`url(#dots-${id})`}>
        <path d={suburbanDistrictPath} />
        <path d={cityDistrictPath} />
      </g>

      {/* Place and water labels */}
      {placeLabels.map((l) => {
        const [x, y] = p(l.lat, l.lon);
        const water = l.kind === "water";
        const leader = l.leader ? p(...l.leader) : null;
        return (
          <g key={l.text}>
            {leader && (
              <path d={`M${x - 62} ${y - 4} L${leader[0]} ${leader[1]}`} stroke={INK} strokeWidth="1" opacity="0.6" />
            )}
          <text
            x={x}
            y={y}
            textAnchor="middle"
            transform={l.rotate ? `rotate(${l.rotate} ${x} ${y})` : undefined}
            fontFamily={water ? "var(--font-playfair), serif" : "var(--font-plex-mono), monospace"}
            fontStyle={water ? "italic" : undefined}
            fontSize={water ? 17 : 11}
            letterSpacing={water ? 1 : 3}
            fill={l.kind === "outside" ? MUTED : INK}
            opacity={l.kind === "area" ? 0.75 : 1}
          >
            {water ? l.text : l.text.toUpperCase()}
          </text>
          </g>
        );
      })}

      {/* Bandra–Worli Sea Link */}
      <path
        d={`M${p(...seaLink[0]).join(" ")} L${p(...seaLink[1]).join(" ")}`}
        stroke={INK}
        strokeWidth="3"
        strokeDasharray="5 3"
        fill="none"
      />

      {/* Rail lines: paper casing, coloured line, continuation beyond city limits */}
      {railLines.map((line) => {
        const pts = line.stations.map((s) => p(s.lat, s.lon));
        const d = `M${pts.map((pt) => pt.join(" ")).join(" L")}`;
        const last = pts[pts.length - 1];
        const cont = p(line.continues.lat, line.continues.lon);
        return (
          <g key={line.id}>
            <path d={d} fill="none" stroke={PAPER} strokeWidth="9" strokeLinejoin="round" strokeLinecap="round" />
            <path d={d} fill="none" stroke={line.colour} strokeWidth="5" strokeLinejoin="round" strokeLinecap="round" />
            <path
              d={`M${last.join(" ")} L${cont.join(" ")}`}
              fill="none"
              stroke={line.colour}
              strokeWidth="3"
              strokeDasharray="4 4"
            />
            <text
              x={cont[0] + (line.id === "western" ? 8 : -4)}
              y={cont[1] + (line.id === "western" ? 12 : -8)}
              textAnchor={line.id === "western" ? "start" : "end"}
              fontFamily="var(--font-plex-mono), monospace"
              fontSize="10"
              letterSpacing="1"
              fill={line.colour}
            >
              {line.continues.label.toUpperCase()}
            </text>
          </g>
        );
      })}

      {/* Stations and labels */}
      {railLines.flatMap((line) =>
        line.stations.map((s) => {
          const [x, y] = p(s.lat, s.lon);
          const big = interchanges.includes(s.name);
          const showLabel = s.label && !labelled.has(s.name);
          if (showLabel) labelled.add(s.name);
          const major = big || ["Andheri", "Churchgate", "Borivali", "Bandra"].includes(s.name);
          return (
            <g key={`${line.id}-${s.name}`}>
              <circle cx={x} cy={y} r={big ? 5.5 : 3.2} fill={PAPER} stroke={INK} strokeWidth={big ? 2.2 : 1.5} />
              {showLabel && (
                <text
                  x={x + (s.label === "left" ? -10 : 10)}
                  y={y + 4}
                  textAnchor={s.label === "left" ? "end" : "start"}
                  fontFamily="var(--font-inter), sans-serif"
                  fontSize={major ? 13 : 11.5}
                  fontWeight={major ? 700 : 500}
                  fill={INK}
                  stroke={LAND}
                  strokeWidth="3"
                  paintOrder="stroke"
                  className={major ? undefined : "max-sm:hidden"}
                >
                  {s.name}
                </text>
              )}
            </g>
          );
        }),
      )}

      {/* Numbered landmarks */}
      {landmarks.map((l) => {
        const [x, y] = p(l.lat, l.lon);
        const [dx, dy] = l.offset ?? [0, 0];
        const mx = x + dx;
        const my = y + dy;
        const offset = dx !== 0 || dy !== 0;
        return (
          <g key={l.n}>
            <title>{`${l.n}. ${l.name}`}</title>
            {offset && <path d={`M${x} ${y} L${mx} ${my}`} stroke={INK} strokeWidth="1.2" />}
            {offset && <circle cx={x} cy={y} r="2" fill={INK} />}
            <rect x={mx - 10} y={my - 10} width="20" height="20" fill={TAXI} stroke={INK} strokeWidth="2" />
            <text
              x={mx}
              y={my + 4.5}
              textAnchor="middle"
              fontFamily="var(--font-plex-mono), monospace"
              fontSize="13"
              fontWeight="700"
              fill={INK}
            >
              {l.n}
            </text>
          </g>
        );
      })}

      {/* Compass and scale, in the open sea south-west of Colaba */}
      <g transform={`translate(${w - 56} ${h - 128})`}>
        <circle r="26" fill={PAPER} stroke={INK} strokeWidth="1.5" />
        <path d="M0 -22 L7 4 L0 0 L-7 4 Z" fill={INK} />
        <path d="M0 22 L7 -4 L0 0 L-7 -4 Z" fill="none" stroke={INK} strokeWidth="1.2" />
        <text y="-32" textAnchor="middle" fontFamily="var(--font-playfair), serif" fontWeight="800" fontSize="16" fill={INK}>
          N
        </text>
      </g>
      <g transform={`translate(${w - 40 - 5 * pxPerKm} ${h - 52})`} fontFamily="var(--font-plex-mono), monospace" fontSize="10" fill={INK}>
        {[0, 1, 2, 3, 4].map((i) => (
          <rect key={i} x={i * pxPerKm} y="0" width={pxPerKm} height="6" fill={i % 2 ? PAPER : INK} stroke={INK} strokeWidth="1" />
        ))}
        <text x="0" y="20">0</text>
        <text x={5 * pxPerKm} y="20" textAnchor="middle">
          5 km
        </text>
      </g>
    </svg>
  );
}
