import type { Fact, Partner, RegistrationStatus } from "./types";

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
  scope: { value: "Pan-India", status: "planned" } satisfies Fact<string>,
  format: {
    value: "Hybrid national hackathon",
    status: "planned",
    note: "Nationwide online participation and selection, followed by an offline national grand finale.",
  } satisfies Fact<string>,
  tagline: "Rooted in Mumbai. Built for India. Designed for the future.",
  description:
    "InnovaHack Chapter 2 brings India's builders, AI innovators, and aspiring founders together to turn ambitious ideas into meaningful real-world solutions.",

  /** Strip at the very top of every page. */
  announcement: ["Elite Forums presents", "India", "Chapter 02", "2027"],
  /** Compact strip on the homepage masthead. */
  editionLine: ["India", "2027", "Hybrid national hackathon"],

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
      value: null,
      status: "unconfirmed",
      note: "Any participation fee will be published in the official rules before registration opens.",
    } as Fact<string>,
  },

  venue: {
    value: null,
    status: "unconfirmed",
    note: "The grand finale venue has not been announced.",
  } as Fact<string>,

  teamSize: {
    min: null as number | null,
    max: null as number | null,
    status: "unconfirmed" as Fact<number>["status"],
    note: "Team-size rules will be published in the official rules.",
  },

  /** Hard technical limit on team rows in the form, used only while `teamSize.max` is unset. */
  formTeamMemberLimit: 8,

  prizePool: {
    value: null,
    status: "unconfirmed",
    note: "Chapter 2 prize details to be announced.",
  } as Fact<string>,

  /**
   * Published awards. Keep cash, sponsor benefits, credits, hardware,
   * mentorship, incubation consideration and investor introductions separate.
   */
  awards: [] as {
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
    eligibility: string;
    conditions: string;
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
      title: "Registration & team formation",
      description:
        "Sign up, form your team and choose one of the two official domains.",
      mode: "Online",
      date: null as string | null,
      status: "proposed" as const,
    },
    {
      id: "idea",
      title: "Idea submission",
      description:
        "Submit the problem you are solving and the approach you plan to take.",
      mode: "Online",
      date: null as string | null,
      status: "proposed" as const,
    },
    {
      id: "screening",
      title: "Screening & evaluation",
      description:
        "Submissions are reviewed against the published evaluation criteria.",
      mode: "Online",
      date: null as string | null,
      status: "proposed" as const,
    },
    {
      id: "sprint",
      title: "Online build sprint & mentor interactions",
      description:
        "Shortlisted teams build their solutions, with mentor sessions where available.",
      mode: "Online",
      date: null as string | null,
      status: "proposed" as const,
    },
    {
      id: "semifinal",
      title: "Semifinal selection",
      description: "Teams are selected to advance to the national finale.",
      mode: "Online",
      date: null as string | null,
      status: "proposed" as const,
    },
    {
      id: "finale",
      title: "Offline national grand finale",
      description:
        "Finalists build, demo and present in person. Venue to be announced.",
      mode: "In person",
      date: null as string | null,
      status: "proposed" as const,
    },
    {
      id: "follow-up",
      title: "Post-event follow-up & opportunities",
      description:
        "Results, recognition and any partner opportunities that are confirmed for the edition.",
      mode: "Hybrid",
      date: null as string | null,
      status: "proposed" as const,
    },
  ],

  /**
   * National participation metrics. Leave `value` null until real data
   * exists. Planning targets must use status "target".
   */
  participation: [
    { label: "Registrations", value: null, status: "unconfirmed" },
    { label: "Team registrations", value: null, status: "unconfirmed" },
    { label: "Completed submissions", value: null, status: "unconfirmed" },
    { label: "Colleges represented", value: null, status: "unconfirmed" },
    { label: "States & UTs represented", value: null, status: "unconfirmed" },
    { label: "Finalist teams", value: null, status: "unconfirmed" },
    { label: "Confirmed partners", value: null, status: "unconfirmed" },
  ] as { label: string; value: string | null; status: Fact<string>["status"] }[],

  /** Show internal-draft articles (clearly stamped) until real updates are published. */
  showDraftArticles: process.env.HIDE_DRAFT_ARTICLES !== "true",
} as const;

export const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000")
).replace(/\/$/, "");

export const chapter1Website = "https://innovahack.eliteforums.in/";
