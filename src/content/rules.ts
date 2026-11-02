/**
 * Competition rules.
 *
 * `published` stays false until the organizer approves the official rulebook.
 * While unpublished, the site shows the confirmed principles plus the list of
 * topics the official rules will cover — it never invents rules.
 */

export const rules = {
  published: false,
  version: null as string | null,
  effectiveFrom: null as string | null,

  /** Rules already confirmed by the Chapter 2 brief. */
  confirmed: [
    "InnovaHack Chapter 2 has exactly two official competition domains: Artificial Intelligence, and Open Innovation / Startup Track.",
    "Each team enters one domain.",
    "AI may be used in both domains. In the Open Innovation / Startup Track, AI is permitted but not compulsory.",
    "Sector themes (for example FinTech, education, agriculture, cybersecurity, climate and civic technology) are challenge themes within the two domains, not additional domains.",
    "Teams can have up to 4 people, including the team lead.",
    "Round 1 is free to enter. Round 2, the hybrid final, costs ₹1,000 per team.",
  ],

  /** Topics the official rulebook will cover once published. */
  pendingTopics: [
    { title: "Eligibility", body: "Who can take part, and any age, student or residency requirements." },
    { title: "Teams", body: "Any minimum team size, and whether changes are allowed after registration." },
    { title: "Fees", body: "How and when the Round 2 fee is paid, and any refund terms." },
    { title: "Stages & deadlines", body: "Dates, submission requirements and advancement for each stage of the journey." },
    { title: "Original work", body: "What may be built before the event, use of open-source code, third-party APIs and AI tools." },
    { title: "Evaluation", body: "Judging criteria and weightings for each domain." },
    { title: "Intellectual property", body: "Who owns what teams build, and any licensing expectations." },
    { title: "Conduct", body: "The code of conduct and how concerns are reported and handled." },
    { title: "Awards", body: "Award categories, eligibility, conditions and how prizes are delivered." },
  ],
};
