import type { Fact, FactStatus, Partner, RegistrationStatus } from "./types";

/**
 * CHAPTER 2 — CENTRAL EVENT CONFIGURATION
 *
 * This is the single source of truth for InnovaHack Chapter 2. Components read
 * from here; never hard-code event details in a component.
 *
 * Anything that is not officially confirmed stays `null` with status
 * "unconfirmed". The UI renders an honest "to be announced" state for those.
 * Historical Chapter 1 data lives separately in `./chapter1.ts`.
 */

const registrationStatusFromEnv = process.env.REGISTRATION_STATUS as
  | RegistrationStatus
  | undefined;

const REGISTRATION_STATUSES: RegistrationStatus[] = [
  "announcement",
  "interest",
  "soon",
  "open",
  "closed",
];

export const event = {
  name: "InnovaHack",
  fullName: "InnovaHack Chapter 2",
  organizer: "Elite Forums",
  chapterNumber: 2,
  chapterLabel: "Chapter 02",
  year: { value: 2027, status: "planned" } satisfies Fact<number>,
  scope: { value: "International", status: "confirmed" } satisfies Fact<string>,
  format: {
    value: "Hybrid international hackathon",
    status: "confirmed",
    note: "Round 1 is online and free to enter. Round 2, the final, is a hybrid round with offline and online teams.",
  } satisfies Fact<string>,
  tagline: "Rooted in Mumbai. Open to the world. Designed for the future.",
  description:
    "InnovaHack Chapter 2 is a 2027 international AI and startup innovation hackathon for teams worldwide, with a ₹50 Lakh prize pool. It is building toward one of the biggest international hackathons and India's largest hackathon platform.",

  /** Strip at the very top of every page. */
  announcement: ["Elite Forums presents", "International", "Chapter 02", "2027"],
  /** Compact strip on the homepage masthead. */
  editionLine: ["International", "2027", "Hybrid international hackathon"],

  registration: {
    /**
     * Change this (or set the REGISTRATION_STATUS environment variable) to
     * move the whole site between states. "open" also requires the
     * registration API to have working storage — see README.
     */
    status: (registrationStatusFromEnv &&
    REGISTRATION_STATUSES.includes(registrationStatusFromEnv)
      ? registrationStatusFromEnv
      : "interest") as RegistrationStatus,
    opensOn: { value: null, status: "unconfirmed" } as Fact<string>,
    closesOn: { value: null, status: "unconfirmed" } as Fact<string>,
    fee: {
      value: "Round 1: free · Round 2 (final): ₹1,000 per team",
      status: "confirmed",
      note: "Round 1 is free to enter. Teams that reach Round 2, the hybrid final, pay ₹1,000 per team.",
    } as Fact<string>,
  },

  /** ISO dates of the event, e.g. "2027-02-20". With `venue`, these publish the Event search result. */
  dates: {
    start: { value: null, status: "unconfirmed" } as Fact<string>,
    end: { value: null, status: "unconfirmed" } as Fact<string>,
  },

  venue: {
    value: null,
    status: "unconfirmed",
    note: "The venue for the offline part of the final has not been announced.",
  } as Fact<string>,

  teamSize: {
    min: null as number | null,
    max: 4 as number | null,
    status: "confirmed" as Fact<number>["status"],
    note: "Teams may include up to 4 people, including the team lead.",
  },

  /** Hard technical limit on team rows in the form, used only while `teamSize.max` is unset. */
  formTeamMemberLimit: 4,

  prizePool: {
    value: "₹50 Lakh",
    status: "confirmed",
    note: "Total value of the prize pool, including ₹1,00,000 in cash awards.",
  } as Fact<string>,

  /** What the prize pool is made of. Cash amounts are listed per tier in `awards`. */
  prizePoolIncludes: [
    "Cash awards",
    "Goodies",
    "AI credits",
    "Workshops",
    "Incubation opportunities",
    "Hiring opportunities",
    "Certification courses",
  ],

  /**
   * Published awards. Keep cash, sponsor benefits, credits, hardware,
   * mentorship, incubation consideration and investor introductions separate.
   */
  awards: [
    {
      title: "Tier 1",
      kind: "cash",
      value: "₹10,000 per team",
      winnerCount: 3,
      split: { offline: 2, online: 1 },
      venue: "The Taj Mahal Palace",
      story: "A defining Mumbai landmark on the waterfront.",
      image: {
        src: "tajPalace",
        alt: "The Taj Mahal Palace in Mumbai, with its red domes and ornate waterfront facade.",
        position: "50% 60%",
      },
      eligibility: "3 winning teams: 2 offline and 1 online",
      conditions: "₹10,000 is awarded to each winning team.",
    },
    {
      title: "Tier 2",
      kind: "cash",
      value: "₹6,000 per team",
      winnerCount: 5,
      split: { offline: 3, online: 2 },
      venue: "Leopold Cafe",
      story:
        "Leopold Cafe in Colaba was among the places targeted during the [26/11 Mumbai attacks](https://www.pib.gov.in/newsite/erelcontent.aspx?lang=2&reg=48&relid=45446). Its [bullet marks](https://indianexpress.com/article/cities/mumbai/a-new-wing-at-leopold-for-extra-rush-since-attack/) became a reminder of those affected and of Mumbai's resilience.",
      image: {
        src: "leopoldCafe",
        alt: "The red Leopold Cafe and Bar sign above its entrance in Colaba, Mumbai.",
        position: "50% 35%",
      },
      eligibility: "5 winning teams: 3 offline and 2 online",
      conditions: "₹6,000 is awarded to each winning team.",
    },
    {
      title: "Tier 3",
      kind: "cash",
      value: "₹4,000 per team",
      winnerCount: 10,
      split: { offline: 5, online: 5 },
      venue: "Jain Chawal Wale · Juhu",
      story: "One of Juhu's best-known places for Mumbai street food.",
      image: {
        src: "jainChawalWale",
        alt: "The Jain Chawal Wale food stall in Juhu, Mumbai, lit up at night.",
        position: "50% 40%",
      },
      eligibility: "10 winning teams: 5 offline and 5 online",
      conditions: "₹4,000 is awarded to each winning team.",
    },
  ] as {
    title: string;
    kind:
      | "cash"
      | "sponsor-benefit"
      | "credits"
      | "hardware"
      | "mentorship"
      | "incubation-consideration"
      | "investor-introduction";
    value: string;
    winnerCount?: number;
    /** How many of the winning teams compete offline and online in the final. */
    split?: { offline: number; online: number };
    venue?: string;
    story?: string;
    image?: { src: string; alt: string; position?: string };
    eligibility?: string;
    conditions?: string;
  }[],

  /** Only confirmed Chapter 2 partners. Chapter 1 partners belong in chapter1.ts. */
  partners: [] as Partner[],

  contact: {
    general: {
      value: null,
      status: "unconfirmed",
    } as Fact<string>,
    partnerships: {
      value: "sponsors@eliteforums.in",
      status: "advertised",
      note: "Partnership address published on the Chapter 1 website.",
    } as Fact<string>,
  },

  social: [] as { label: string; url: string }[],

  /** The proposed competition journey. Dates stay null until officially set. */
  journey: [
    {
      id: "register",
      /** Short name for the station board on the timeline. */
      station: "Registration",
      title: "Registration & team formation",
      description:
        "Sign up, form a team of up to 4 people and choose one of the two official domains. Round 1 is free to enter.",
      mode: "Online",
      date: null as string | null,
      status: "proposed" as FactStatus,
    },
    {
      id: "idea",
      station: "Idea",
      title: "Idea submission",
      description:
        "Submit the problem you are solving and the approach you plan to take.",
      mode: "Online",
      date: null as string | null,
      status: "proposed" as FactStatus,
    },
    {
      id: "screening",
      station: "Screening",
      title: "Screening & evaluation",
      description:
        "Submissions are reviewed against the published evaluation criteria.",
      mode: "Online",
      date: null as string | null,
      status: "proposed" as FactStatus,
    },
    {
      id: "sprint",
      station: "Build Sprint",
      title: "Online build sprint & mentor interactions",
      description:
        "Shortlisted teams build their solutions, with mentor sessions where available.",
      mode: "Online",
      date: null as string | null,
      status: "proposed" as FactStatus,
    },
    {
      id: "semifinal",
      station: "Semifinal",
      title: "Semifinal selection",
      description: "Teams are selected to advance to Round 2, the final.",
      mode: "Online",
      date: null as string | null,
      status: "proposed" as FactStatus,
    },
    {
      id: "finale",
      station: "Grand Finale",
      title: "Round 2: hybrid grand finale",
      description:
        "Finalist teams build, demo and present, either in person or online. Entry is ₹1,000 per team. Venue to be announced.",
      mode: "Hybrid",
      date: null as string | null,
      status: "proposed" as FactStatus,
    },
    {
      id: "follow-up",
      station: "Follow-up",
      title: "Post-event follow-up & opportunities",
      description:
        "Results, recognition and any partner opportunities that are confirmed for the edition.",
      mode: "Hybrid",
      date: null as string | null,
      status: "proposed" as FactStatus,
    },
  ],

  /**
   * Participation metrics. Leave `value` null until real data
   * exists. Planning targets must use status "target".
   */
  participation: [
    { label: "Registrations", value: null, status: "unconfirmed" },
    { label: "Team registrations", value: null, status: "unconfirmed" },
    { label: "Completed submissions", value: null, status: "unconfirmed" },
    { label: "Colleges represented", value: null, status: "unconfirmed" },
    { label: "Countries represented", value: null, status: "unconfirmed" },
    { label: "States & UTs represented", value: null, status: "unconfirmed" },
    { label: "Finalist teams", value: null, status: "unconfirmed" },
    { label: "Confirmed partners", value: null, status: "unconfirmed" },
  ] as { label: string; value: string | null; status: Fact<string>["status"] }[],

  /** Show internal-draft articles (clearly stamped) until real updates are published. */
  showDraftArticles: process.env.HIDE_DRAFT_ARTICLES !== "true",
} as const;

const configuredSiteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();

export const siteUrl = (
  configuredSiteUrl ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "https://innovahack.eliteforums.in")
).replace(/\/+$/, "");

export const chapter1Website = "https://innovahack.eliteforums.in/";
