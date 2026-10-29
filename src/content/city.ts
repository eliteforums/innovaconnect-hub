import { photos } from "./media";
import type { MediaSlot } from "./types";

/**
 * Mumbai editorial features. These are cultural context for the visual
 * identity only — they are never competition domains, and they make no claim
 * about where Chapter 2 will be held.
 *
 * Photos come from the organizer-supplied set in `./media.ts`; each slot keeps
 * an original illustration as its fallback.
 */

export type CityFeature = {
  id: string;
  label: string;
  title: string;
  caption: string;
  /** Accurate place / subject context printed beside the feature. */
  context: string;
  href: string;
  media: MediaSlot;
};

/** The four sidebar stories beside the homepage hero. */
export const sidebarFeatures: CityFeature[] = [
  {
    id: "coastline",
    label: "The coastline",
    title: "The city that never stops building.",
    caption: "Along the coast, ideas keep moving.",
    context:
      "Marine Drive is the promenade curving along Back Bay in South Mumbai. Marine Lines is the nearby locality and railway station of the same name.",
    href: "/#the-city",
    media: {
      photo: photos.marineDriveSunset,
      illustration: "coast",
      alt: "Illustration of a curved seaside promenade lined with streetlights and low buildings at sunset, inspired by Marine Drive.",
      credit: "Illustration inspired by Marine Drive",
    },
  },  {
    id: "flavours",
    label: "The flavours",
    title: "Iconic flavours. Bolder ideas.",
    caption: "Different ingredients. One unforgettable identity.",
    context:
      "Vada pav, misal pav and pav bhaji — three of the street-food staples Mumbai is known for.",
    href: "/#the-city",
    media: {
      photo: photos.vadaPav,
      illustration: "vadaPav",
      alt: "Illustration of a vada pav: a fried potato fritter in a soft bread roll with chutney and a green chilli.",
      credit: "Illustration · vada pav",
    },
  },  {
    id: "streets",
    label: "The streets",
    title: "Same streets. New solutions.",
    caption: "Familiar ingredients, new combinations.",
    context: "Pav bhaji — buttery vegetable mash with toasted pav, a Mumbai street-food staple.",
    href: "/#the-city",
    media: {
      photo: photos.pavBhaji,
      illustration: "pavBhaji",
      alt: "Illustration of pav bhaji.",
      credit: "Illustration · pav bhaji",
    },
  },  {
    id: "culture",
    label: "Kala Ghoda",
    title: "A city of creators.",
    caption: "Where ideas meet art and imagination.",
    context:
      "Kala Ghoda is South Mumbai's art precinct, home to galleries, museums and an annual arts festival.",
    href: "/#the-city",
    media: {
      photo: photos.kalaGhodaHorse,
      illustration: "kalaGhoda",
      alt: "Illustration of a heritage gallery facade with arched windows, an artist's easel and festival bunting.",
      credit: "Illustration inspired by the Kala Ghoda art precinct",
    },
  },];

/** The "City behind the inspiration" editorial grid. */
export const cityFeatures: CityFeature[] = [
  {
    id: "taxi",
    label: "The kaali-peeli",
    title: "The journey never stops.",
    caption:
      "The black-and-yellow taxi is Mumbai's most recognizable symbol — and the source of the taxi-yellow accents used throughout this site.",
    context:
      "The classic Premier Padmini taxis were phased out of service in 2023; their colours remain on the city's taxis today.",
    href: "/#the-city",
    media: {
      photo: photos.bmcTaxi,
      illustration: "taxi",
      alt: "Illustration of a classic black-and-yellow Mumbai taxi in side view.",
      credit: "Illustration · black-and-yellow taxi",
    },
  },
  {
    id: "bus",
    label: "BEST",
    title: "Moving a city. Moving ideas.",
    caption:
      "The red buses of BEST — the city's municipal transport undertaking — carry Mumbai through its everyday rhythm.",
    context: "BEST: Brihanmumbai Electric Supply and Transport.",
    href: "/#the-city",
    media: {
      photo: photos.bestBuses,
      illustration: "bus",
      alt: "Illustration of a red single-decker city bus in side view.",
      credit: "Illustration · red city bus",
    },
  },
  {
    id: "train",
    label: "The local",
    title: "Connected by routes. United by ideas.",
    caption:
      "The suburban 'local' trains link the city along the Western, Central and Harbour lines.",
    context: "Mumbai Suburban Railway.",
    href: "/#the-city",
    media: {
      photo: photos.localTrain,
      illustration: "train",
      alt: "Illustration of a Mumbai suburban local train with open doorways, under overhead wires.",
      credit: "Illustration · suburban local train",
    },
  },
  {
    id: "stations",
    label: "Railway heritage",
    title: "Where every route begins.",
    caption:
      "Chhatrapati Shivaji Maharaj Terminus (CSMT), Mumbai Central and Marine Lines are three different stations, each with its own history.",
    context:
      "Pictured: CSMT, a UNESCO World Heritage Site in the Victorian Gothic style. The Chapter 2 venue has not been announced; InnovaHack is not being held at these stations.",
    href: "/#the-city",
    media: {
      photo: photos.csmt,
      illustration: "station",
      alt: "Illustration of a Victorian Gothic railway building with a central dome, pointed arches and a clock.",
      credit: "Illustration inspired by Victorian Gothic railway architecture",
    },
  },
  {
    id: "marine-drive",
    label: "Marine Drive",
    title: "Where the city meets the sea.",
    caption:
      "The promenade's curve of streetlights is known as the Queen's Necklace after dark.",
    context:
      "Marine Drive is the promenade; Marine Lines is the neighbouring locality and railway station.",
    href: "/#the-city",
    media: {
      photo: photos.marineDriveAerial,
      illustration: "coast",
      alt: "Illustration of a curved seaside promenade with streetlights and a skyline at dusk.",
      credit: "Illustration inspired by Marine Drive",
    },
  },
  {
    id: "kala-ghoda",
    label: "Kala Ghoda",
    title: "Where creativity takes the streets.",
    caption:
      "Galleries, museums and street-side art give the precinct its creative energy.",
    context:
      "Kala Ghoda — 'black horse' — is South Mumbai's art precinct.",
    href: "/#the-city",
    media: {
      photo: photos.kalaGhodaHorse,
      illustration: "kalaGhoda",
      alt: "Illustration of a heritage gallery facade with arched windows, an easel and festival bunting.",
      credit: "Illustration inspired by the Kala Ghoda art precinct",
    },
  },
  {
    id: "auto",
    label: "The autorickshaw",
    title: "Small rides. Big ideas.",
    caption:
      "Autorickshaws serve Mumbai's suburbs and the wider metropolitan region.",
    context:
      "They do not operate in the island city's southern areas, where taxis serve short trips instead.",
    href: "/#the-city",
    media: {
      photo: photos.autorickshaw,
      illustration: "auto",
      alt: "Illustration of a black-and-yellow autorickshaw in side view.",
      credit: "Illustration · autorickshaw",
    },
  },
];
