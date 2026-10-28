import type { MediaKind } from "@/content/types";
import { Coast, Heritage, KalaGhoda } from "./places";
import { MisalPav, PavBhaji, VadaPav } from "./food";
import { AiDiagram, StartupSketch, Workstation } from "./tech";
import { Auto, Bus, Taxi, Train } from "./vehicles";

export { Auto, Bus, Taxi, Train } from "./vehicles";
export { Coast, Heritage, KalaGhoda } from "./places";
export { MisalPav, PavBhaji, VadaPav } from "./food";
export { AiDiagram, StartupSketch, Workstation } from "./tech";

/**
 * Full-bleed "scene" versions of each illustration, for use in framed
 * editorial figures. Vehicles get a backdrop; scenes already have one.
 */
export function Illustration({
  kind,
  className = "",
  title,
}: {
  kind: MediaKind;
  className?: string;
  title?: string;
}) {
  const fill = "h-full w-full";
  switch (kind) {
    case "taxi":
      return (
        <Backdrop className={className} tone="taxi" title={title}>
          <Taxi className="w-[88%]" />
        </Backdrop>
      );
    case "bus":
      return (
        <Backdrop className={className} tone="paper" title={title}>
          <Bus className="w-[90%]" />
        </Backdrop>
      );
    case "train":
      return (
        <Backdrop className={className} tone="deep" title={title}>
          <Train className="w-[130%] max-w-none" />
        </Backdrop>
      );
    case "auto":
      return (
        <Backdrop className={className} tone="deep" title={title}>
          <Auto className="w-[74%]" />
        </Backdrop>
      );
    case "heritage":
    case "station":
      return (
        <Backdrop className={className} tone="paper" title={title} align="end">
          <Heritage className="h-[92%] w-auto" />
        </Backdrop>
      );
    case "coast":
      return <Coast className={`${fill} ${className}`} title={title} />;
    case "kalaGhoda":
      return <KalaGhoda className={`${fill} ${className}`} title={title} />;
    case "vadaPav":
      return <VadaPav className={`${fill} ${className}`} title={title} />;
    case "pavBhaji":
      return <PavBhaji className={`${fill} ${className}`} title={title} />;
    case "misalPav":
      return <MisalPav className={`${fill} ${className}`} title={title} />;
    case "ai":
      return <AiDiagram className={`${fill} ${className}`} title={title} />;
    case "startup":
      return <StartupSketch className={`${fill} ${className}`} title={title} />;
    case "workstation":
      return <Workstation className={`${fill} ${className}`} title={title} />;
  }
}

const tones = {
  taxi: "bg-taxi",
  paper: "bg-paper-white",
  deep: "bg-paper-deep",
} as const;

function Backdrop({
  children,
  tone,
  className,
  title,
  align = "center",
}: {
  children: React.ReactNode;
  tone: keyof typeof tones;
  className: string;
  title?: string;
  align?: "center" | "end";
}) {
  return (
    <div
      className={`relative flex h-full w-full justify-center overflow-hidden ${align === "end" ? "items-end" : "items-center"} ${tones[tone]} ${className}`}
      {...(title ? { role: "img", "aria-label": title } : { "aria-hidden": true })}
    >
      <div className="halftone absolute inset-0 opacity-60" />
      <div className="absolute inset-x-0 bottom-0 h-1/4 bg-ink/5" />
      <div className="relative flex w-full justify-center">{children}</div>
    </div>
  );
}
