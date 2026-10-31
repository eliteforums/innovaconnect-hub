import { photos } from "./media";
import type { Article } from "./types";

/**
 * THE BUILD LOG — news and announcements.
 *
 * The entries below are internal drafts written only from approved event
 * information. They are stamped "Draft" on the site until the organizer sets
 * `draft: false` and a real `publishedOn` date.
 */

export const allArticles: Article[] = [
  {
    slug: "introducing-innovahack-chapter-2",
    headline: "Two domains. One national stage.",
    summary:
      "InnovaHack returns for its second edition as a pan-India hybrid hackathon focused on Artificial Intelligence and Open Innovation.",
    category: "Announcement",
    publishedOn: null,
    author: "Elite Forums",
    draft: true,
    media: {
      illustration: "taxi",
      photo: photos.bmcTaxi,
      alt: "Illustration of a black-and-yellow Mumbai taxi.",
      credit: "Illustration · black-and-yellow taxi",
    },
    body: [
      {
        type: "p",
        text: "InnovaHack, the national hackathon organized by Elite Forums, is planning its second edition for 2027. Chapter 2 is designed as a pan-India hybrid event: nationwide online participation and selection, followed by an offline national grand finale.",
      },
      { type: "h2", text: "Two official domains" },
      {
        type: "p",
        text: "Where Chapter 1 ran several sector tracks, Chapter 2 focuses on exactly two official competition domains:",
      },
      {
        type: "list",
        items: [
          "Domain 01 — Artificial Intelligence: for teams whose innovation is the AI itself, from generative AI and agents to computer vision and applied machine learning.",
          "Domain 02 — Open Innovation / Startup Track: for original products, platforms and startup ideas. AI is welcome but not required.",
        ],
      },
      {
        type: "p",
        text: "Themes such as FinTech, education, agriculture, climate and civic technology are welcome inside both domains as challenge themes.",
      },
      { type: "h2", text: "What is still to be announced" },
      {
        type: "p",
        text: "The event dates, grand finale venue, team-size rules and partners will be published once they are confirmed. Join the update list to hear first.",
      },
    ],
  },
  {
    slug: "choosing-your-domain",
    headline: "AI track or startup track? How to choose.",
    summary:
      "Both domains welcome AI. The difference is what sits at the core of your innovation.",
    category: "Guide",
    publishedOn: null,
    author: "Elite Forums",
    draft: true,
    media: {
      illustration: "ai",
      photo: photos.aiDomain,
      alt: "Illustration of a neural network diagram.",
      credit: "Illustration · InnovaHack design system",
    },
    body: [
      {
        type: "p",
        text: "Every Chapter 2 team enters one of two official domains. Because AI can be used in both, the choice comes down to a single question: what is the core of your innovation?",
      },
      { type: "h2", text: "Choose Artificial Intelligence if…" },
      {
        type: "list",
        items: [
          "a model, an agent or a learning system is the heart of your solution;",
          "your solution would not work without its AI component;",
          "you want to be evaluated on how well you apply AI to a real problem.",
        ],
      },
      { type: "h2", text: "Choose Open Innovation / Startup if…" },
      {
        type: "list",
        items: [
          "the product, service or business concept is the core of your innovation;",
          "AI is one ingredient — or not part of your solution at all;",
          "you want to be evaluated on the product as something others could adopt.",
        ],
      },
      {
        type: "quote",
        text: "AI is permitted but not compulsory in the Open Innovation / Startup Track.",
      },
      {
        type: "p",
        text: "Official evaluation criteria for each domain will be published in the competition rules.",
      },
    ],
  },
  {
    slug: "chapter-1-by-the-numbers",
    headline: "Chapter 1, by the numbers — and what they mean.",
    summary:
      "A careful look at the first edition's figures: what was reported, and what was advertised.",
    category: "Chapter 1",
    publishedOn: null,
    author: "Elite Forums",
    draft: true,
    media: {
      illustration: "station",
      photo: photos.csmt,
      alt: "Illustration of Victorian Gothic railway architecture.",
      credit: "Illustration inspired by Victorian Gothic railway architecture",
    },
    body: [
      {
        type: "p",
        text: "The first InnovaHack, in 2026, set the foundation for Chapter 2. Here is what the record shows — with each figure labelled for what it is.",
      },
      {
        type: "list",
        items: [
          "10,000+ applications were reported for the first edition. Applications are not the same as individual attendees.",
          "170 finalist teams were reported in the post-event recap. The original website had planned a 200–250 team shortlist.",
          "₹50 lakh+ was the advertised total reward pool, including cash prizes and other benefits — not a record of cash paid out.",
          "The final was advertised as a 30-hour hybrid hackathon, after a separate 24-hour online qualifier.",
        ],
      },
      {
        type: "p",
        text: "The full archive — including the original domains and competition structure — is on the Chapter 1 page.",
      },
    ],
  },
];
