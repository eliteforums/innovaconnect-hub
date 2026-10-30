import type { StaticImageData } from "next/image";

import aiDomain from "@/assets/photos/ai-domain.jpg";
import bestBuses from "@/assets/photos/best-buses.jpg";
import bmcTaxi from "@/assets/photos/bmc-taxi.jpg";
import csmt from "@/assets/photos/csmt.jpg";
import footerSkyline from "@/assets/photos/footer-skyline.webp";
import kalaGhodaHorse from "@/assets/photos/kala-ghoda-horse.jpg";
import localTrain from "@/assets/photos/local-train.jpg";
import marineDriveAerial from "@/assets/photos/marine-drive-aerial.jpg";
import marineDriveSunset from "@/assets/photos/marine-drive-sunset.jpg";
import misalPav from "@/assets/photos/misal-pav.jpg";
import pavBhaji from "@/assets/photos/pav-bhaji.jpg";
import startupDomain from "@/assets/photos/startup-domain.jpg";
import vadaPav from "@/assets/photos/vada-pav.jpg";
import cutoutAi from "@/assets/cutouts/ai.webp";
import cutoutAuto from "@/assets/cutouts/autorickshaw.webp";
import cutoutBmc from "@/assets/cutouts/bmc.webp";
import cutoutBulb from "@/assets/cutouts/bulb.webp";
import cutoutBus from "@/assets/cutouts/bus.webp";
import cutoutGateway from "@/assets/cutouts/gateway.webp";
import cutoutSkyline from "@/assets/cutouts/skyline.webp";
import cutoutSplashRed from "@/assets/cutouts/splash-red.webp";
import cutoutSplashYellow from "@/assets/cutouts/splash-yellow.webp";
import cutoutTaxi from "@/assets/cutouts/taxi.webp";
import cutoutTrain from "@/assets/cutouts/train.webp";
import cutoutTrainCr from "@/assets/cutouts/train-cr.webp";

/**
 * Built-in images, addressed by a stable key. Content refers to images by key
 * (e.g. "bmcTaxi") or by URL for images uploaded through the admin dashboard,
 * so editing content never depends on build-specific file names.
 */
export const mediaLibrary: Record<string, { file: StaticImageData; label: string; group: "Photo" | "Cutout" }> = {
  bmcTaxi: { file: bmcTaxi, label: "Taxi outside BMC headquarters", group: "Photo" },
  bestBuses: { file: bestBuses, label: "BEST buses", group: "Photo" },
  localTrain: { file: localTrain, label: "Local train", group: "Photo" },
  csmt: { file: csmt, label: "CSMT at dusk", group: "Photo" },
  marineDriveAerial: { file: marineDriveAerial, label: "Marine Drive from above", group: "Photo" },
  marineDriveSunset: { file: marineDriveSunset, label: "Marine Drive at sunset", group: "Photo" },
  vadaPav: { file: vadaPav, label: "Vada pav", group: "Photo" },
  misalPav: { file: misalPav, label: "Misal pav", group: "Photo" },
  pavBhaji: { file: pavBhaji, label: "Pav bhaji", group: "Photo" },
  kalaGhodaHorse: { file: kalaGhodaHorse, label: "Kala Ghoda horse", group: "Photo" },
  aiDomain: { file: aiDomain, label: "AI domain artwork", group: "Photo" },
  startupDomain: { file: startupDomain, label: "Startup domain artwork", group: "Photo" },
  footerSkyline: { file: footerSkyline, label: "Footer skyline", group: "Photo" },
  autorickshaw: { file: cutoutAuto, label: "Autorickshaw (cutout)", group: "Cutout" },
  "cutout-bmc": { file: cutoutBmc, label: "BMC building (cutout)", group: "Cutout" },
  "cutout-taxi": { file: cutoutTaxi, label: "Taxi (cutout)", group: "Cutout" },
  "cutout-bus": { file: cutoutBus, label: "BEST bus (cutout)", group: "Cutout" },
  "cutout-train": { file: cutoutTrain, label: "Local train (cutout)", group: "Cutout" },
  "cutout-train-cr": { file: cutoutTrainCr, label: "Central Railway local, side view (cutout)", group: "Cutout" },
  "cutout-gateway": { file: cutoutGateway, label: "Gateway sketch (cutout)", group: "Cutout" },
  "cutout-skyline": { file: cutoutSkyline, label: "Skyline sketch (cutout)", group: "Cutout" },
  "cutout-splash-yellow": { file: cutoutSplashYellow, label: "Yellow brush (cutout)", group: "Cutout" },
  "cutout-splash-red": { file: cutoutSplashRed, label: "Red brush (cutout)", group: "Cutout" },
  "cutout-ai": { file: cutoutAi, label: "AI artwork (cutout)", group: "Cutout" },
  "cutout-bulb": { file: cutoutBulb, label: "Light bulb artwork (cutout)", group: "Cutout" },
};

/** Resolves an image reference: a library key, or a URL/path for uploads. */
export function resolveImage(ref: string | null | undefined): StaticImageData | string | null {
  if (!ref) return null;
  const entry = mediaLibrary[ref];
  if (entry) return entry.file;
  if (ref.startsWith("/") || /^https?:\/\//.test(ref)) return ref;
  return null;
}

/** For the admin picker: key, label, group and preview URL of every built-in image. */
export function libraryOptions() {
  return Object.entries(mediaLibrary).map(([key, v]) => ({ key, label: v.label, group: v.group, preview: v.file.src }));
}
