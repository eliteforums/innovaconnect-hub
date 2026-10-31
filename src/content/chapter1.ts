import type { Fact, Partner } from "./types";

/**
 * CHAPTER 1 — HISTORICAL ARCHIVE (2026)
 *
 * Kept separate from Chapter 2 configuration on purpose. Every figure carries
 * the status it had in the source material:
 *  - "reported"   → reported after the event (e.g. the post-event recap)
 *  - "advertised" → promoted before the event; not a verified outcome
 *
 * Source: the official Chapter 1 website (innovahack.eliteforums.in) and the
 * organizer's post-event recap, as supplied in the Chapter 2 brief.
 */

export type HistoricalMetric = Fact<string> & {
  label: string;
  caption: string;
};

export const chapter1 = {
  year: 2026,
  label: "Chapter 01 · 2026 · Inaugural edition",
  title: "InnovaHack Chapter 1 — The First Edition, 2026",
  location:
    "Mumbai, India, as named in the original Chapter 1 event materials.",

  /** Headline figures on the archive page. */
  metrics: [
    {
      value: "10,000+",
      label: "Applications",
      caption: "Applications reported for the first edition.",
      status: "reported",
    },
    {
      value: "170",
      label: "Finalist teams",
      caption: "Finalist teams reported in the Chapter 1 post-event recap.",
      status: "reported",
    },
    {
      value: "₹50 Lakh+",
      label: "Advertised total reward pool",
      caption:
        "Chapter 1's promoted overall prize and reward pool, including cash prizes and other benefits.",
      status: "advertised",
    },
    {
      value: "30 Hours",
      label: "Final hackathon",
      caption: "Advertised duration of the hybrid final hackathon.",
      status: "advertised",
    },
  ] satisfies HistoricalMetric[],

  /** Additional context on the archive page. */
  context: [
    {
      value: "24 Hours",
      label: "Online qualifier",
      caption:
        "Advertised duration of the online qualifying hackathon — a separate stage from the 30-hour final.",
      status: "advertised",
    },
    {
      value: "₹1 Crore+",
      label: "Startup funding opportunity",
      caption:
        "Advertised as an opportunity. This is not a record of funding invested or disbursed.",
      status: "advertised",
    },
    {
      value: "200–250",
      label: "Planned shortlist",
      caption:
        "The number of teams the original website planned to select. The reported finalist total was 170.",
      status: "advertised",
    },
  ] satisfies HistoricalMetric[],

  /** Domains as listed on the Chapter 1 tracks page. */
  domains: [
    {
      name: "Generative AI",
      description:
        "AI-powered applications, from LLM-based solutions to creative AI.",
    },
    {
      name: "FinTech",
      description: "Payments, lending, insurance and personal finance.",
    },
    {
      name: "Cybersecurity",
      description:
        "Threat detection, data protection, secure authentication and online safety.",
    },
    {
      name: "Agentic AI",
      description:
        "AI agents, multi-agent systems and intelligent automation.",
    },
    {
      name: "Startup Track (Open Innovation)",
      description: "Any innovative product or service, in any domain.",
    },
  ],
  domainsNote:
    "As listed on the Chapter 1 tracks page. Some earlier promotional copy listed HealthTech and Blockchain among the tracks.",

  /** Competition structure as advertised on the Chapter 1 website. */
  structure: [
    {
      title: "Application",
      description:
        "Participants applied with their skills, experience and what they wanted to build.",
    },
    {
      title: "24-hour online hackathon",
      description:
        "An online qualifying hackathon open to applicants from anywhere in India.",
    },
    {
      title: "Screening",
      description:
        "Submissions were screened to select finalist teams. The website planned a 200–250 team shortlist; 170 finalist teams were reported.",
    },
    {
      title: "30-hour hybrid hackathon",
      description:
        "Finalists competed in a 30-hour hybrid final — in person in Mumbai or online, as advertised.",
    },
    {
      title: "Demo day & winner declaration",
      description: "Presentations, winner announcement and award ceremony.",
    },
  ],

  /** Fill only with verified, organizer-approved records. */
  winners: [] as { team: string; award: string; project?: string }[],
  partners: [] as Partner[],
  judgesAndMentors: [] as { name: string; role: string }[],
  gallery: [] as { src: string; alt: string; credit: string }[],

  links: [
    {
      label: "Chapter 1 event page on Devnovate",
      url: "https://devnovate.co/event/innovahack-chapter-1",
    },
  ],

  /** What changes from Chapter 1 to Chapter 2 — structural facts only. */
  carriedForward: [
    {
      title: "From five tracks to two domains",
      body: "Chapter 1 ran several sector tracks. Chapter 2 focuses on two official domains — Artificial Intelligence, and Open Innovation / Startup — with sector themes living inside them.",
    },
    {
      title: "A national journey",
      body: "Chapter 2 is planned as a pan-India hybrid event: nationwide online participation and selection, followed by an offline national grand finale.",
    },
    {
      title: "Clear stages, clearly labelled",
      body: "Qualifier, sprint and finale are presented as separate stages, and every date and prize is published only once it is confirmed.",
    },
  ],
} as const;
