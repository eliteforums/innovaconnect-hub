export type FaqItem = { q: string; a: string };
export type FaqGroup = { title: string; items: FaqItem[] };

export const faq: FaqGroup[] = [
  {
    title: "The event",
    items: [
      {
        q: "What is InnovaHack Chapter 2?",
        a: "The second edition of InnovaHack, an international hackathon organized by Elite Forums. It is planned for 2027 as a hybrid event in two rounds: a free online first round, then a hybrid final in which teams compete offline or online.",
      },
      {
        q: "Is InnovaHack only for people in Mumbai?",
        a: "No. Mumbai inspires the visual identity of this edition, but InnovaHack Chapter 2 is an international event, open to builders from around the world. The venue for the offline part of the final has not been announced.",
      },
      {
        q: "When and where is Chapter 2?",
        a: "Dates and the grand finale venue have not been confirmed yet. Once confirmed, they will be published on this site and announced to the update list.",
      },
      {
        q: "Who organizes InnovaHack?",
        a: "Elite Forums organizes InnovaHack. Chapter 1 took place in 2026.",
      },
    ],
  },
  {
    title: "Domains",
    items: [
      {
        q: "How many competition domains are there?",
        a: "Exactly two: Artificial Intelligence, and Open Innovation / Startup Track. Sector themes such as FinTech, education or climate are challenge themes within these two domains, not separate domains.",
      },
      {
        q: "Can I use AI in the Open Innovation / Startup Track?",
        a: "Yes. AI is permitted but not compulsory in the Open Innovation / Startup Track.",
      },
      {
        q: "Which domain should my team choose?",
        a: "Choose Artificial Intelligence when AI technology is the core of your innovation. Choose Open Innovation / Startup when the broader product, service or business concept is the core.",
      },
    ],
  },
  {
    title: "Participation",
    items: [
      {
        q: "Who can participate, and how big can teams be?",
        a: "Teams can have up to four members, including the lead. Other eligibility rules will be set out in the official rules before registration opens.",
      },
      {
        q: "Will InnovaHack Chapter 2 include hiring opportunities?",
        a: "Yes. Hiring opportunities are part of the ₹50 Lakh prize pool, but no hiring partners have been announced yet. Participation does not guarantee a job or internship, and each opportunity will be published with its terms once it is confirmed.",
      },
      {
        q: "Is there a participation fee?",
        a: "Round 1 is free. Teams that reach Round 2, the hybrid final, pay ₹1,000 per team. Nothing is charged to join the update list.",
      },
      {
        q: "How do I register?",
        a: "Registration is not open yet. Join the update list on the Register page and you will be notified when it opens.",
      },
    ],
  },
  {
    title: "Prizes & partners",
    items: [
      {
        q: "What are the Chapter 2 prizes?",
        a: "The prize pool is worth ₹50 Lakh, including ₹1,00,000 in cash, goodies, AI credits, workshops, incubation opportunities, hiring opportunities and certification courses. Cash goes to three tiers: 3 teams receive ₹10,000 each (2 offline, 1 online), 5 receive ₹6,000 each (3 offline, 2 online) and 10 receive ₹4,000 each (5 offline, 5 online).",
      },
      {
        q: "Are Chapter 1 sponsors part of Chapter 2?",
        a: "Only partners confirmed for Chapter 2 appear on the Partners page. Chapter 1 partners belong to the Chapter 1 archive.",
      },
      {
        q: "How can my organization partner with InnovaHack?",
        a: "Use the partnership inquiry form on the Partners page. The team will follow up with partnership options.",
      },
    ],
  },
];
