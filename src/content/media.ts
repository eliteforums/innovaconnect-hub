import type { MediaSlot } from "./types";

import aiDomain from "@/assets/photos/ai-domain.jpg";
import bestBuses from "@/assets/photos/best-buses.jpg";
import bmcTaxi from "@/assets/photos/bmc-taxi.jpg";
import csmt from "@/assets/photos/csmt.jpg";
import kalaGhodaHorse from "@/assets/photos/kala-ghoda-horse.jpg";
import localTrain from "@/assets/photos/local-train.jpg";
import marineDriveAerial from "@/assets/photos/marine-drive-aerial.jpg";
import marineDriveSunset from "@/assets/photos/marine-drive-sunset.jpg";
import misalPav from "@/assets/photos/misal-pav.jpg";
import pavBhaji from "@/assets/photos/pav-bhaji.jpg";
import startupDomain from "@/assets/photos/startup-domain.jpg";
import vadaPav from "@/assets/photos/vada-pav.jpg";
import autorickshaw from "@/assets/cutouts/autorickshaw.webp";

/**
 * Photographs supplied by the organizer for this edition.
 *
 * `license` is an internal record and is not shown on the page. Before launch,
 * confirm usage rights for every entry — in particular the two food photos
 * that carry third-party watermarks (credited in their captions).
 */

type Photo = NonNullable<MediaSlot["photo"]>;

const SUPPLIED = "Supplied by the organizer — usage rights to be confirmed";

export const photos = {
  bmcTaxi: {
    src: bmcTaxi,
    alt: "A black-and-yellow Premier Padmini taxi in front of the Brihanmumbai Municipal Corporation headquarters.",
    credit: "Photo · Taxi outside the BMC headquarters, Mumbai",
    license: SUPPLIED,
    approved: true,
    position: "50% 80%",
  },
  bestBuses: {
    src: bestBuses,
    alt: "A row of red BEST buses; their destination boards read Colaba bus station in Marathi.",
    credit: "Photo · BEST buses",
    license: SUPPLIED,
    approved: true,
  },
  localTrain: {
    src: localTrain,
    alt: "A white, purple and yellow suburban EMU local train in a carshed.",
    credit: "Photo · Suburban EMU local train",
    license: SUPPLIED,
    approved: true,
    position: "70% 50%",
  },
  csmt: {
    src: csmt,
    alt: "Chhatrapati Shivaji Maharaj Terminus lit up at dusk, with BEST buses passing in front.",
    credit: "Photo · Chhatrapati Shivaji Maharaj Terminus (CSMT) at dusk",
    license: SUPPLIED,
    approved: true,
  },
  marineDriveAerial: {
    src: marineDriveAerial,
    alt: "Aerial view of Marine Drive curving along the sea, with traffic, the promenade and the skyline beyond.",
    credit: "Photo · Marine Drive from above",
    license: SUPPLIED,
    approved: true,
    position: "50% 35%",
  },
  marineDriveSunset: {
    src: marineDriveSunset,
    alt: "Marine Drive at sunset: the curved seafront lined with streetlights and tall buildings.",
    credit: "Image · Marine Drive at sunset",
    license: SUPPLIED,
    approved: true,
    position: "72% 50%",
  },
  vadaPav: {
    src: vadaPav,
    alt: "A vada pav: a spiced potato fritter in a soft bread roll with chutney.",
    credit: "Photo · Vada pav",
    license: SUPPLIED,
    approved: true,
  },
  misalPav: {
    src: misalPav,
    alt: "A bowl of misal topped with farsan and onion, served with pav, lime and chutneys.",
    credit: "Photo · Misal pav · © Kannan's Kitchen",
    license: "Third-party watermark (Kannan's Kitchen) — permission required",
    approved: true,
    position: "50% 60%",
  },
  pavBhaji: {
    src: pavBhaji,
    alt: "Pav bhaji on a steel plate with buttered pav, chopped onion and lemon.",
    credit: "Photo · Pav bhaji · Shweta in the Kitchen",
    license: "Third-party watermark (Shweta in the Kitchen) — permission required",
    approved: true,
    position: "50% 45%",
  },
  kalaGhodaHorse: {
    src: kalaGhodaHorse,
    alt: "The black horse sculpture at Kala Ghoda on its stone plinth with a Marathi plaque.",
    credit: "Photo · The Kala Ghoda horse sculpture",
    license: SUPPLIED,
    approved: true,
    position: "50% 30%",
  },
  autorickshaw: {
    src: autorickshaw,
    alt: "A black-and-yellow autorickshaw.",
    credit: "Photo · Autorickshaw",
    license: SUPPLIED,
    approved: true,
    fit: "contain",
  },
  aiDomain: {
    src: aiDomain,
    alt: "Artwork of a human profile made of violet network lines, listing generative AI, ML, agents, computer vision and NLP.",
    credit: "Artwork · Artificial Intelligence domain",
    license: SUPPLIED,
    approved: true,
  },
  startupDomain: {
    src: startupDomain,
    alt: "A laptop, a coffee cup and hand-drawn app wireframes on a desk by a window.",
    credit: "Artwork · Open Innovation / Startup domain",
    license: SUPPLIED,
    approved: true,
  },
} satisfies Record<string, Photo>;
