/**
 * Shared content types.
 *
 * Every factual claim on the site carries a `status` so readers (and editors)
 * can tell confirmed Chapter 2 details apart from historical claims, planning
 * targets and items that are still to be announced.
 */

export type FactStatus =
  /** Officially confirmed by the organizer for Chapter 2. */
  | "confirmed"
  /** Part of the organizer's announced plan; subject to final rules. */
  | "planned"
  /** A proposal for Chapter 2 that has not been finalised. */
  | "proposed"
  /** A planning target, never an achieved result. */
  | "target"
  /** A historical figure as it was promoted (not a verified outcome). */
  | "advertised"
  /** A historical figure reported after the event. */
  | "reported"
  /** Not yet decided or announced. */
  | "unconfirmed";

export type Fact<T> = {
  value: T | null;
  status: FactStatus;
  /** Short context shown next to the value, e.g. a caveat. */
  note?: string;
};

export type RegistrationStatus =
  | "announcement" // Event announced, nothing to sign up for yet
  | "interest" // Interest list (event updates) open
  | "soon" // Registration opening soon; interest list still open
  | "open" // Registration open
  | "closed"; // Registration closed

export type DomainSlug = "artificial-intelligence" | "open-innovation";

export type MediaKind =
  | "taxi"
  | "bus"
  | "train"
  | "heritage"
  | "coast"
  | "vadaPav"
  | "pavBhaji"
  | "misalPav"
  | "kalaGhoda"
  | "auto"
  | "station"
  | "ai"
  | "startup"
  | "workstation";

/**
 * A media slot. Each slot renders an original illustration by default. To use
 * a photograph instead, set `photo` and flip `approved` to true once the
 * licence and the identity of the place shown have been verified.
 */
export type MediaSlot = {
  illustration: MediaKind;
  alt: string;
  /** Printed caption under the image. Must describe what is actually shown. */
  credit: string;
  photo?: {
    /** A media-library key (e.g. "bmcTaxi") or the URL of an uploaded image. */
    src: string;
    /** Describes the photograph; falls back to the slot's `alt`. */
    alt?: string;
    /** Printed under the image: subject and attribution. */
    credit: string;
    /** Internal licensing record — not shown on the page. */
    license: string;
    /** Only approved photos are rendered. */
    approved: boolean;
    /** CSS object-position for the crop, e.g. "50% 30%". */
    position?: string;
    /** "contain" for cutouts on a transparent background. */
    fit?: "cover" | "contain";
  };
};

export type ArticleBlock =
  | { type: "p"; text: string }
  | { type: "h2"; text: string }
  | { type: "quote"; text: string; cite?: string }
  | { type: "list"; items: string[] };

export type Article = {
  slug: string;
  headline: string;
  summary: string;
  category: string;
  /** ISO date. Null while the article is an unpublished draft. */
  publishedOn: string | null;
  author: string | null;
  /** Drafts are clearly marked on the page until the organizer approves them. */
  draft: boolean;
  media: MediaSlot;
  body: ArticleBlock[];
};

export type Partner = {
  name: string;
  category: string;
  url?: string;
  logo?: string;
  challenge?: string;
  /** Only verified partners are rendered. */
  verified: boolean;
};
