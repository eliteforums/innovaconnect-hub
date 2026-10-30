import { photos } from "./media";
import type { DomainSlug, MediaSlot } from "./types";

/**
 * The two — and only two — official Chapter 2 competition domains.
 * Sector themes (FinTech, education, climate…) live inside `challengeThemes`;
 * they are never separate domains.
 */

export type Domain = {
  slug: DomainSlug;
  number: "01" | "02";
  name: string;
  shortName: string;
  headline: string;
  summary: string;
  description: string;
  cta: string;
  accent: "violet" | "burgundy";
  areas: string[];
  challengeThemes: string[];
  chooseIf: string[];
  aiPolicy: string;
  /** Illustrative prompts to help teams think — not official problem statements. */
  prompts: string[];
  media: MediaSlot;
};

export const domains: [Domain, Domain] = [
  {
    slug: "artificial-intelligence",
    number: "01",
    name: "Artificial Intelligence",
    shortName: "AI Track",
    headline: "Build beyond the ordinary.",
    summary:
      "Create intelligent solutions using emerging AI capabilities to address meaningful real-world problems.",
    description:
      "In InnovaHack Chapter 2's AI hackathon track, teams build solutions where a model, agent or learning system is the core of the innovation and solves a real-world problem.",
    cta: "Explore the AI track",
    accent: "violet",
    areas: [
      "Generative AI",
      "Large language models",
      "AI agents & agentic workflows",
      "Machine learning",
      "Natural language processing",
      "Computer vision",
      "Multimodal AI",
      "Intelligent automation",
      "AI-powered enterprise applications",
      "Applied AI for real-world challenges",
    ],
    challengeThemes: [
      "Education",
      "Healthcare access",
      "FinTech",
      "Agriculture",
      "Civic services",
      "Cybersecurity",
      "Climate & sustainability",
      "Accessibility & Indian languages",
    ],
    chooseIf: [
      "An AI model, agent or learning system is the heart of your solution.",
      "Your solution would not work without its AI component.",
      "You want your work evaluated on how well it applies AI to a real problem.",
    ],
    aiPolicy: "AI is the core of every submission in this domain.",
    prompts: [
      "How could an agent take a repetitive, multi-step task off someone's plate — safely?",
      "Where would a model that understands Indian languages remove a real barrier?",
      "What decision could be made faster or fairer with better use of existing data?",
    ],
    media: {
      illustration: "ai",
      photo: photos.aiDomain,
      alt: "Editorial illustration of a neural network diagram with violet nodes and connecting lines.",
      credit: "Illustration · InnovaHack design system",
    },
  },
  {
    slug: "open-innovation",
    number: "02",
    name: "Open Innovation / Startup Track",
    shortName: "Startup Track",
    headline: "Turn ideas into reality.",
    summary:
      "Build original products, solve real-world problems, and transform ambitious ideas into practical, scalable innovations.",
    description:
      "In InnovaHack Chapter 2's startup hackathon track, teams build original products, services or business concepts. AI is welcome, but never required.",
    cta: "Explore the startup track",
    accent: "burgundy",
    areas: [
      "SaaS & software products",
      "Startup MVPs",
      "FinTech applications",
      "Civic technology",
      "Education technology",
      "Agriculture & climate solutions",
      "Business productivity",
      "Community problem-solving",
      "Novel technology products & business models",
    ],
    challengeThemes: [
      "FinTech",
      "Education",
      "Agriculture",
      "Civic & community tech",
      "Climate & sustainability",
      "Productivity",
      "Cybersecurity",
      "Small business tools",
    ],
    chooseIf: [
      "The product, service or business model is the core of your innovation.",
      "AI is one ingredient — or not part of your solution at all.",
      "You want your work evaluated as a product others could adopt.",
    ],
    aiPolicy: "AI is permitted but not compulsory in this domain.",
    prompts: [
      "What everyday process in your city still runs on paper, queues or phone calls?",
      "Which small business problem is too small for big companies but painful for millions?",
      "What would a first version look like if you had to ship it in a weekend?",
    ],
    media: {
      illustration: "startup",
      photo: photos.startupDomain,
      alt: "Editorial illustration of a notebook with product wireframes, sticky notes and a light bulb.",
      credit: "Illustration · InnovaHack design system",
    },
  },
];

export const domainBySlug = (slug: string) =>
  domains.find((d) => d.slug === slug);

export const domainRules = [
  "Chapter 2 has exactly two official competition domains.",
  "AI may be used in both domains.",
  "Choose Artificial Intelligence when AI technology is the core of your innovation.",
  "Choose Open Innovation / Startup when the broader product, service or business concept is the core. AI is optional.",
  "Sector themes such as FinTech, education, agriculture, cybersecurity, climate and civic technology are challenge themes within the two domains — not additional domains.",
];
