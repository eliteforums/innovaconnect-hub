import { photos } from "./media";
import type { ArticleBlock, MediaSlot } from "./types";

/**
 * PAGE COPY — every heading, paragraph and label shown on the site.
 *
 * All of it is editable in the admin dashboard. Strings support a small
 * markup, rendered by <Rich>:
 *   *text*          accent colour (e.g. the burgundy half of a headline)
 *   [text](/path)   a link
 *   new line        a line break
 * and placeholders filled from the event settings:
 *   {organizer} {fullName} {year} {chapter1Year}
 */

const meta = (title: string, description: string) => ({ title, description });

export const copy = {
  global: {
    seo: {
      title: "InnovaHack 2027 | AI & Startup Hackathon in India",
      description:
        "Explore InnovaHack Chapter 2, a pan-India AI and startup hackathon planned for 2027 by Elite Forums. See tracks, timeline, prizes and registration updates.",
      imageAlt: "InnovaHack Chapter 2, a planned pan-India hackathon for AI and startup innovation",
    },
    header: {
      wordmark: "INNOVAHACK",
      chapterTag: "Ch. 02",
      openMenu: "Open menu",
      closeMenu: "Close menu",
    },
    cta: {
      register: "Register now",
      updates: "Get event updates",
    },
    registration: {
      announcement: {
        headline: "Chapter 2 has been announced.",
        body: "Registration details will be published here once they are confirmed.",
        badge: "Announced",
      },
      interest: {
        headline: "Registration opening soon.",
        body: "Registration for Chapter 2 is not open yet. Join the update list and we will tell you as soon as it opens.",
        badge: "Registration opening soon",
      },
      soon: {
        headline: "Registration opening soon.",
        body: "Registration for Chapter 2 opens shortly. Join the update list to be notified the moment it does.",
        badge: "Registration opening soon",
      },
      open: {
        headline: "Registration is open.",
        body: "Form your team, choose your domain and submit your registration.",
        badge: "Registration open",
      },
      closed: {
        headline: "Registration has closed.",
        body: "Registration for Chapter 2 is closed. Join the update list to follow the competition.",
        badge: "Registration closed",
      },
    },
    statusLabels: {
      confirmed: "Confirmed",
      planned: "Planned",
      proposed: "Proposed",
      target: "Target",
      advertised: "As advertised",
      reported: "Reported",
      unconfirmed: "To be announced",
    },
    footer: {
      wordmark: "INNOVAHACK",
      organizedBy: "A national hackathon organized by {organizer}.",
      partnershipsLabel: "Partnerships:",
      copyright: "© {organizer}. InnovaHack is organized by {organizer}.",
      note: "Illustrations are original artwork inspired by Mumbai · Not a news publication",
      skylineAlt:
        "Ink illustration of Mumbai: the Marine Drive skyline, the Gateway of India, the BMC headquarters, a taxi, a BEST bus, a local train and the Bandra–Worli Sea Link.",
    },
    breadcrumbHome: "Front page",
    pageHeaderEdition: "InnovaHack · Chapter 02 · 2027",
    legalDraftNote:
      "*Draft for organizer and legal review.* This page describes how this website works today. It must be reviewed and approved before the site goes live.",
    notFound: {
      kicker: "Error 404 · Wrong stop",
      title: "This route doesn't run here.",
      body: "The page you were looking for doesn't exist or has moved. Let's get you back on the line.",
      primary: "Front page",
      secondary: "The tracks",
    },
  },

  home: {
    masthead: {
      wordmark: "INNOVAHACK",
      themes: ["Innovation", "Ideas", "Technology", "Startups", "For a brighter India"],
      ticketTop: "Chapter 02",
      ticketMain: "2027",
      ticketBottom: "A national hackathon\nby {organizer}",
      sideNote: "India's next generation of builders creating real impact.",
    },
    lead: {
      tag: "The lead story",
      headline: "*Mumbai*\nbuilds\nthe future.",
      subhead: "Two domains. One national stage.",
      primaryCta: "Explore the tracks",
      meta: ["India wide", "Hybrid format", "2027", "By {organizer}"],
    },
    collage: {
      note: "Mumbai\nMore than a city\nA mindset",
      themes: ["Ideas", "People", "Culture", "Technology", "A brighter India"],
      caption:
        "Collage · A taxi, a BEST bus and a suburban local train before the Brihanmumbai Municipal Corporation headquarters",
      buildingAlt:
        "The Brihanmumbai Municipal Corporation headquarters, a Victorian Gothic building with a tall central dome.",
      trainAlt: "A white, purple and yellow suburban local train.",
      busAlt: "A red BEST bus.",
      taxiAlt: "A black-and-yellow Premier Padmini taxi.",
    },
    coast: {
      heading: "Mumbai",
      footer: "Same streets.\nBigger dreams.",
    },
    stripLabel: "The city edition · Four stories",
    legacy: {
      title: "The foundation that started it all.",
      cta: "Explore Chapter 1",
      note: 'Historical Chapter 1 figures. "As advertised" figures were promoted before the event and are not records of cash paid out. They do not describe Chapter 2.',
    },
    rooted: {
      number: "02",
      kicker: "Mumbai inspires. India innovates.",
      title: "Rooted in Mumbai. *Built for India.*",
      body: "From the speed of its local trains to the ambition of its builders, Mumbai represents movement, resilience, diversity, and possibility. InnovaHack brings that spirit to a national platform for technology and entrepreneurship.",
      stops: ["Movement", "Resilience", "Diversity", "Possibility"],
      stopLabel: "Station",
      venueNote: "Chapter 2 is a pan-India event. The grand finale venue has not yet been announced.",
      tiles: [
        { illustration: "train", alt: "Illustration of a suburban local train.", credit: "Local train", photo: photos.localTrain },
        { illustration: "taxi", alt: "Illustration of a black-and-yellow taxi.", credit: "Taxi", photo: photos.bmcTaxi },
        { illustration: "bus", alt: "Illustration of a red city bus.", credit: "BEST bus", photo: photos.bestBuses },
        { illustration: "heritage", alt: "Illustration of Victorian Gothic architecture.", credit: "Heritage", photo: photos.csmt },
        {
          illustration: "workstation",
          alt: "Illustration of a laptop with code, a phone prototype and a glass of cutting chai.",
          credit: "Prototype",
          photo: photos.startupDomain,
        },
      ] as MediaSlot[],
      tilesCaption: "Local train · Taxi outside the BMC headquarters · BEST buses · CSMT · A prototype taking shape",
    },
    domains: {
      number: "03",
      kicker: "The official domains",
      title: "Two domains. *One national stage.*",
      deck: "Every team enters one of exactly two official competition domains. AI is welcome in both.",
      action: "Compare the tracks",
      areasLabel: "Potential areas",
      ruleTitle: "The two-domain rule",
      aiNote: "Intelligence\nfor a brighter\ntomorrow.",
      startupNote: "Ideas\nStartups\nReal impact",
    },
    more: {
      number: "04",
      kicker: "More than a hackathon",
      title: "Build. Collaborate. Create impact.",
      benefits: [
        { title: "Build practical projects", body: "Turn a real problem into a working solution you can demo." },
        { title: "Learn by exploring", body: "Push into new tools, models and frameworks under real constraints." },
        { title: "Work as a team", body: "Split the problem, divide the work and ship together." },
        { title: "Sharpen product thinking", body: "Practise deciding what to build — and what to leave out." },
        { title: "Explore real challenges", body: "Work on themes drawn from education, finance, climate, civic life and more." },
        { title: "Present your work", body: "Explain what you built, why it matters and how it works." },
        { title: "Meet mentors", body: "Engage with mentors where sessions are available during the event." },
        { title: "Find connections", body: "Explore industry and startup connections around the event." },
        { title: "Grow your portfolio", body: "Leave with a project that shows what you can do." },
      ],
      disclaimer:
        "Participation does not guarantee employment, funding, incubation or investment. Any partner opportunity will be published with its terms once it is confirmed.",
    },
    journey: {
      number: "05",
      kicker: "The competition journey",
      title: "From first idea to final stage.",
      deck: "The proposed Chapter 2 stages, subject to the organizer's final rules. Dates will be added as they are confirmed.",
      action: "Full timeline",
    },
    prizes: {
      number: "06",
      kicker: "Tiered cash awards",
      title: "Three tiers. *Eighteen winning teams.*",
      summary: "₹1,00,000 in tiered cash awards",
      body: "Each amount is awarded per winning team. Tier 1 has 3 teams, Tier 2 has 5, and Tier 3 has 10.",
      howTitle: "The three tiers",
      howBody: "Cash awards are paid per team, not per individual.",
      link: "Explore all tiers",
    },
    partners: {
      number: "07",
      kicker: "Partners & industry",
      title: "Real problems. Real builders.",
      action: "Partner with us",
      ctaKicker: "Chapter 2 partners",
      ctaTitle: "Partner with InnovaHack.",
      ctaBody:
        "Chapter 2 partners have not been announced yet. Organizations interested in shaping the edition can get in touch now.",
      ctaButton: "Start a partnership inquiry",
      optionLabel: "Option",
      options: [
        { title: "Set a challenge", body: "Bring a real problem statement for teams to work on within either domain." },
        { title: "Provide tools", body: "Offer APIs, platforms or credits that help teams build." },
        { title: "Mentor & judge", body: "Share expertise with teams during the build and evaluation." },
        { title: "Reach builders", body: "Connect with India's student and early-career builder community." },
      ],
    },
    city: {
      number: "08",
      kicker: "The Mumbai edition",
      title: "The city behind the inspiration.",
      deck: "The colours, routes and textures of this edition come from Mumbai's everyday life. These features are the inspiration for the design — not competition categories.",
    },
    national: {
      number: "09",
      kicker: "National participation",
      title: "Rooted in Mumbai. *Open to India.*",
      body: "The city on the map inspires this edition's identity — its trains, streets and shoreline. InnovaHack Chapter 2 itself is designed for builders from across the country, not only from Mumbai. Eligibility details will be published in the official rules.",
      mapTitle: "The city map · Mumbai",
      mapSubtitle: "Island city & suburbs",
      mapCaption:
        "Mumbai City and Mumbai Suburban districts. Rail lines are drawn station to station and positions are approximate. The Chapter 2 finale venue has not been announced and is not shown.",
      keyTitle: "Map key",
      seaLink: "Sea link",
      cityDistrict: "Mumbai City district",
      suburbanDistrict: "Mumbai Suburban district",
      figuresTitle: "Chapter 2 participation — live figures",
      metricHeading: "Metric",
      figureHeading: "Figure",
      notPublished: "Not yet published",
      figuresNote:
        "Figures appear here only once they are supported by real registration data. Targets are always labelled as targets.",
    },
    updatesBand: {
      title: "Be first to know.",
      body: "Updates are sent only when there is official news — dates, registration, domains and partners.",
    },
  },

  about: {
    meta: meta(
      "About the National Hackathon",
      "Learn about InnovaHack, the national hackathon organized by Elite Forums. Chapter 2 is planned as a pan-India hybrid event in 2027.",
    ),
    section: "The Story",
    title: "India's next generation of builders. *One national stage.*",
    article: [
      {
        type: "p",
        text: "InnovaHack is a national hackathon organized by {organizer}. Its first edition took place in {chapter1Year}. The second edition — Chapter 2 — is planned for {year} as a larger national platform for technology innovation, AI development, original products, startup ideas and practical problem-solving.",
      },
      {
        type: "p",
        text: "Chapter 2 combines nationwide online participation and selection with an offline national grand finale. It focuses on exactly two official competition domains: Artificial Intelligence, and Open Innovation / Startup Track.",
      },
      { type: "h2", text: "Why Mumbai?" },
      {
        type: "p",
        text: "This edition's visual identity is inspired by Mumbai — its black-and-yellow taxis, red BEST buses, local trains, heritage architecture, coastline, street food and creative culture. Mumbai was named in the original Chapter 1 event materials, and its energy shapes how this edition looks and feels.",
      },
      {
        type: "p",
        text: "The event itself is pan-India. Builders from across the country are welcome, and the grand finale venue has not yet been announced.",
      },
      { type: "h2", text: "About the design" },
      {
        type: "p",
        text: '"The Innovation Times" is the design concept behind this website: a special newspaper edition about India\'s innovators. It is not a separate news publication, and the illustrations are original artwork inspired by the city.',
      },
    ] as ArticleBlock[],
    factsTitle: "Edition facts",
    factLabels: {
      edition: "Edition",
      year: "Year",
      scope: "Scope",
      format: "Format",
      domains: "Official domains",
      domainsValue: "Two",
      venue: "Finale venue",
    },
    figure: {
      illustration: "station",
      alt: "Illustration of Victorian Gothic architecture.",
      credit: "Illustration inspired by Victorian Gothic architecture",
      photo: photos.bmcTaxi,
    } as MediaSlot,
    organizerNumber: "02",
    organizerKicker: "The organizer",
    organizerBody:
      "{organizer} is a community-driven organization that connects builders with opportunities through tech meetups, hackathons and industry events. InnovaHack is its national hackathon.",
    archiveCta: "The Chapter 1 archive",
    contactCta: "Contact us",
  },

  tracks: {
    meta: meta(
      "AI & Startup Hackathon Tracks 2027",
      "Explore the two InnovaHack Chapter 2 domains: Artificial Intelligence and Open Innovation / Startup. Both are planned for the 2027 pan-India hybrid hackathon.",
    ),
    section: "The Tracks",
    title: "Two domains. *One national stage.*",
    deck: "Every team enters one of exactly two official competition domains. AI may be used in both — the difference is what sits at the core of your innovation.",
    compareNumber: "03",
    compareKicker: "Side by side",
    compareTitle: "Which domain is yours?",
    compareHeading: "Compare",
    compareRows: [
      {
        label: "Core of the innovation",
        ai: "The AI itself — a model, agent or learning system",
        startup: "The product, service or business concept",
      },
      { label: "Use of AI", ai: "Required — AI is the heart of the solution", startup: "Permitted, never compulsory" },
      {
        label: "Typical output",
        ai: "An intelligent system applied to a real problem",
        startup: "An original product, platform or startup MVP",
      },
      {
        label: "Challenge themes",
        ai: "Education, Healthcare access, FinTech, Agriculture…",
        startup: "FinTech, Education, Agriculture, Civic & community tech…",
      },
    ],
  },

  domainDetail: {
    sectionSuffix: "Official competition domain",
    areasKicker: "What you can build",
    areasTitle: "Potential areas",
    chooseKicker: "Is this your domain?",
    chooseTitle: "Choose {shortName} if…",
    themesKicker: "Challenge themes",
    themesTitle: "Themes inside the domain",
    themesDeck: "Sector themes are welcome as the setting for your solution. They are not separate competition domains.",
    promptsKicker: "Starting points",
    promptsTitle: "Questions worth building on",
    promptsDeck:
      "Illustrative prompts to get your team thinking. They are not official problem statements — those will be published with the rules.",
    evalKicker: "Evaluation",
    evalTitle: "Judging criteria",
    evalBody: "Official evaluation criteria and weightings for this domain will be published in the competition rules.",
    ruleTitle: "The two-domain rule",
    otherLabel: "The other domain",
    compareLink: "Compare both domains",
  },

  chapter1Page: {
    meta: meta(
      "Chapter 1 Archive: 2026",
      "Explore the InnovaHack Chapter 1 archive, including historical competition structure and figures clearly labelled as reported or advertised.",
    ),
    title: "InnovaHack Chapter 1\n*The first edition, 2026*",
    deck: "The inaugural InnovaHack laid the foundation for everything Chapter 2 is building on. This archive records what was reported after the event and what was advertised before it — and labels each clearly.",
    figure: {
      illustration: "station",
      alt: "Illustration of Victorian Gothic architecture.",
      credit: "Illustration inspired by Victorian Gothic architecture",
      photo: photos.csmt,
    } as MediaSlot,
    recordKicker: "The record",
    recordTitle: "By the numbers",
    reportedLegend: "*Reported:* figures reported after the event, including the post-event recap.",
    advertisedLegend:
      "*As advertised:* figures promoted before the event. They are not records of cash paid out or funding invested.",
    applicationsNote: "Applications are not the same as individual participants or attendees. Location: {location}",
    domainsKicker: "Original competition domains",
    domainsTitle: "Five tracks in the first edition",
    trackLabel: "Track",
    structureKicker: "Original competition structure",
    structureTitle: "How Chapter 1 ran",
    structureDeck: "As advertised on the Chapter 1 website.",
    roundLabel: "Round",
    recordsKicker: "Results, partners, people & gallery",
    recordsTitle: "The verified record",
    recordsDeck: "Only verified, organizer-approved names, results and photographs are published in this archive.",
    recordTitles: {
      winners: "Results & winners",
      partners: "Historical partners",
      judges: "Judges & mentors",
      gallery: "Event gallery",
    },
    pendingKicker: "Awaiting verification",
    pendingBody: "Records for this section are awaiting verification and will be published once approved.",
    rosterNote: "The Chapter 1 partner roster is a historical record. It is not the Chapter 2 partner lineup.",
    forwardKicker: "Carried into Chapter 2",
    forwardTitle: "What changes next",
    transitionKicker: "Chapter 01 → Chapter 02",
    transitionTitle: "The first chapter built the foundation. *The next chapter builds what comes next.*",
    transitionBody:
      "Chapter 2 brings a sharper focus — two official domains, Artificial Intelligence and Open Innovation / Startup — on a pan-India hybrid stage.",
    enterCta: "Enter Chapter 2",
  },

  timeline: {
    meta: meta(
      "Hackathon Timeline 2027",
      "See the proposed InnovaHack Chapter 2 competition journey. Official dates will be published here once they are confirmed.",
    ),
    section: "Timeline",
    title: "From first idea to final stage.",
    deck: "These are the proposed Chapter 2 stages, subject to the organizer's final rules. No dates have been confirmed yet — each will be added here when it is.",
    statusKicker: "Current status",
    routeKicker: "The route",
    routeTitle: "The competition journey",
    datesKicker: "Official dates",
    datesTitle: "Key dates",
    opensLabel: "Registration opens",
    closesLabel: "Registration closes",
    milestoneHeading: "Milestone",
    dateHeading: "Date",
    istNote: "Times will be listed in Indian Standard Time (IST) once confirmed.",
    rail: {
      lineTag: "CH-02 Line",
      nowBoarding: "Now boarding:",
      stationsLabel: "{count} stations · Online → In person",
      trainTag: "CH-02 FAST · GRAND FINALE",
      terminusLabel: "Terminus",
      stopLabel: "Station",
      platformLabel: "PF",
      dateTba: "Date TBA",
      footnote: "Proposed stages, subject to the organizer's final rules. The train is decorative and does not show progress.",
    },
  },

  prizes: {
    meta: meta(
      "InnovaHack Chapter 2 Prize Pool",
      "Explore the InnovaHack Chapter 2 prize pool: three tiers of cash awards for 18 winning teams, from ₹4,000 to ₹10,000 per team.",
    ),
    section: "Prize Pool",
    title: "Three tiers. *Eighteen winning teams.*",
    deck: "₹1,00,000 in confirmed cash awards. Each amount is per team, and the winner counts below refer to teams.",
    pendingTitle: "Tier details are being updated.",
    pendingBody: "The three cash award tiers will be listed here.",
    eligibilityLabel: "Winning teams",
    conditionsLabel: "Per team",
    kindLabels: {
      cash: "Cash prize",
      "sponsor-benefit": "Sponsor-provided benefit",
      credits: "Software or cloud credits",
      hardware: "Hardware & products",
      mentorship: "Mentorship",
      "incubation-consideration": "Incubation consideration",
      "investor-introduction": "Investor introduction",
    },
    awardNote: "All amounts are per winning team. There are 18 winning teams across the three tiers.",
  },

  partners: {
    meta: meta(
      "Hackathon Sponsorship & Partnerships",
      "Explore sponsorship and partnership opportunities with InnovaHack Chapter 2, a planned pan-India hackathon for AI innovators and startup builders.",
    ),
    section: "Partners & industry",
    title: "Real problems. *Real builders.*",
    deck: "InnovaHack works with organizations that bring real challenges, tools and expertise to India's builders.",
    confirmedKicker: "Chapter 2 partners",
    confirmedTitle: "Confirmed partners",
    pendingTitle: "Chapter 2 partners will be announced here.",
    pendingBody:
      "No Chapter 2 partners have been announced yet. Partners from the first edition are part of the [Chapter 1 archive](/chapter-1) and are not assumed to be part of this edition.",
    waysKicker: "Ways to collaborate",
    waysTitle: "Shape the edition",
    waysDeck: "Partnership options are discussed individually with each organization.",
    inquiryKicker: "Partnership inquiry",
    inquiryTitle: "Partner with InnovaHack",
    inquiryBody:
      "Tell us about your organization and what you'd like to bring to Chapter 2. Inquiries are private and are only seen by the organizing team.",
    emailPrompt: "Prefer email?",
  },

  updates: {
    meta: meta(
      "Event Updates & Announcements",
      "Follow official InnovaHack Chapter 2 announcements, confirmed event details and guides for the planned 2027 AI and startup hackathon in India.",
    ),
    section: "Updates & announcements",
    crumb: "Build Log",
    title: "The Build Log",
    subtitle: "Stories from the innovation frontline.",
    deck: "Official milestones, announcements and stories from InnovaHack. Nothing here is press coverage or a media endorsement.",
    draftNote:
      "Entries marked *Draft* are internal drafts awaiting organizer approval. They contain only approved event information and have no publication date yet.",
    draftBadge: "Draft · pending approval",
    byLabel: "By",
    emptyKicker: "The Build Log",
    emptyTitle: "No updates have been published yet.",
    emptyBody: "Join the update list to hear when the first announcement goes live.",
    backLabel: "The Build Log",
    moreTitle: "More from the Build Log",
  },

  register: {
    meta: meta(
      "Registration & Event Updates",
      "Check InnovaHack Chapter 2 registration status and join the update list for official signup dates, rules and announcements for the planned 2027 hackathon.",
    ),
    section: "Registration",
    statusBoard: "Status board",
    rows: {
      status: "Registration status",
      teamSize: "Team-size rules",
      fee: "Participation fee",
      dates: "Registration dates",
    },
    teamSizeValue: "Up to {max}",
    teamSizeNoteFixed: "Teams can have up to {max} members, including the lead.",
    teamSizeNoteMin: "Minimum {min}.",
    teamSizeNoteOpen: "{note} The form accepts up to {max} members in total.",
    registerKicker: "Team registration",
    registerTitle: "Register your team",
    registerDeck: "Read the [official rules](/rules) before you start. Fields marked * are required.",
    updatesKicker: "Event updates",
    updatesTitle: "Get event updates",
    updatesBody:
      "Join the update list to hear about official news — registration opening, confirmed dates, rules, domains and partners. We only email when there is something official to share.",
  },

  contact: {
    meta: meta(
      "Contact the Organizers",
      "Contact Elite Forums about InnovaHack Chapter 2, the planned 2027 national hackathon, for event questions and partnership inquiries.",
    ),
    section: "Contact",
    title: "Get in touch.",
    deck: "Questions about InnovaHack Chapter 2? Send a message and the organizing team will reply by email.",
    generalTitle: "General inquiries",
    generalFallback: "Use the form on this page.",
    partnershipsTitle: "Partnerships & sponsorship",
    partnershipsBody: "Use the [partnership inquiry form](/partners#inquiry)",
    partnershipsEmail: "or write to",
    beforeTitle: "Before you write",
    beforeBody:
      "Many answers are in the [FAQ](/faq). The event dates, finale venue and full rules will appear here as they are confirmed.",
    followTitle: "Follow",
  },

  faq: {
    meta: meta(
      "Hackathon FAQs",
      "Get answers about InnovaHack Chapter 2 registration, eligibility, AI and startup tracks, prizes, partners and the planned 2027 event timeline.",
    ),
    section: "FAQ",
    title: "Questions, answered.",
    deck: "Everything we can confirm today about InnovaHack Chapter 2. Where something hasn't been decided yet, we say so.",
    stillTitle: "Still have a question?",
    stillCta: "Contact the organizers",
  },

  rules: {
    meta: meta(
      "Hackathon Rules & Eligibility",
      "Read confirmed competition principles for InnovaHack Chapter 2, including its Artificial Intelligence and Open Innovation / Startup domains. Full rules are pending.",
    ),
    section: "Official rules",
    title: "The rulebook.",
    deckPublished: "Version {version}, effective {effectiveFrom}.",
    deckPending:
      "The official Chapter 2 rulebook has not been published yet. It will appear here before registration opens. Below are the principles already confirmed.",
    confirmedKicker: "Confirmed",
    confirmedTitle: "Already confirmed",
    pendingKicker: "To be published",
    pendingTitle: "What the rulebook will cover",
    pendingDeck: "These topics will be set out in the official rules. Nothing below is a rule yet.",
    notifyCta: "Get notified when rules are published",
    faqCta: "Read the FAQ",
  },

  privacy: {
    meta: meta(
      "Privacy Notice",
      "What information the InnovaHack Chapter 2 website collects through its forms, and how it is used.",
    ),
    section: "Privacy",
    title: "Privacy notice.",
    deck: "How {organizer} handles the information you share through this website.",
    sections: [
      { title: "Who we are", body: [{ type: "p", text: "This website is operated by {organizer}, the organizer of {fullName}." }] },
      {
        title: "What we collect",
        body: [
          { type: "p", text: "We only collect what you enter into a form:" },
          {
            type: "list",
            items: [
              "Event updates: your name, email, and optionally your college or organization and area of interest.",
              "Registration (when open): team lead contact details, city and state, team name, team members' names and emails, your chosen domain, project details and optional links.",
              "Partnership inquiries: your organization, name, role, business email and the details of your inquiry.",
              "Contact messages: your name, email, topic and message.",
            ],
          },
          {
            type: "p",
            text: "We do not ask for sensitive personal information such as identity documents, financial details or health information.",
          },
        ],
      },
      {
        title: "How we use it",
        body: [
          {
            type: "p",
            text: "Your information is used to send the updates you asked for, to run the competition, to respond to your inquiry, and to keep the forms secure (for example, rate limiting repeated submissions).",
          },
          { type: "p", text: "Team leads must have their team members' permission before sharing their details." },
        ],
      },
      {
        title: "Who can see it",
        body: [
          {
            type: "p",
            text: "Submissions are stored privately and are only accessible to the organizing team. They are never shown publicly on this website.",
          },
          {
            type: "p",
            text: "If information is to be shared with partners — for example for hiring or mentoring — that will be stated clearly in the official rules and asked for separately.",
          },
        ],
      },
      {
        title: "Email",
        body: [
          {
            type: "p",
            text: "Update emails are sent only when there is official news. Every update email will include a way to unsubscribe.",
          },
        ],
      },
      {
        title: "Your choices",
        body: [
          {
            type: "p",
            text: "You can ask us to access, correct or delete your information, or to stop sending you updates, at any time using the contact page.",
          },
        ],
      },
      {
        title: "Retention",
        body: [
          {
            type: "p",
            text: "We keep submissions only as long as needed for the purpose they were collected for, after which they will be deleted. The specific retention period will be confirmed before launch.",
          },
        ],
      },
    ] as { title: string; body: ArticleBlock[] }[],
  },

  terms: {
    meta: meta("Terms & Conditions", "Terms for using the InnovaHack Chapter 2 website."),
    section: "Terms",
    title: "Terms & conditions.",
    deck: "The terms for using the {fullName} website.",
    sections: [
      {
        title: "About this website",
        body: [
          {
            type: "p",
            text: "This website provides information about {fullName}, organized by {organizer}. Competition participation is governed by the official rules, which will be published separately.",
          },
        ],
      },
      {
        title: "Information on this site",
        body: [
          {
            type: "p",
            text: "Details marked as planned, proposed or to be announced may change. Only details marked as confirmed are final.",
          },
          {
            type: "p",
            text: "Chapter 1 figures are historical. Figures marked “as advertised” were promoted before that event and are not records of cash paid out or funding invested.",
          },
        ],
      },
      {
        title: "Your submissions",
        body: [
          { type: "p", text: "You agree to provide accurate information and to submit only information you are entitled to share." },
          { type: "p", text: "Automated, abusive or fraudulent submissions are not permitted and may be blocked." },
        ],
      },
      {
        title: "Design and imagery",
        body: [
          {
            type: "p",
            text: "The newspaper styling of this website is a design concept. It is not a news publication, and nothing on it is press coverage.",
          },
          {
            type: "p",
            text: "Illustrations are original artwork inspired by Mumbai. Any photographs used are credited and licensed.",
          },
        ],
      },
      {
        title: "Changes",
        body: [{ type: "p", text: "These terms may be updated. The current version is always available on this page." }],
      },
    ] as { title: string; body: ArticleBlock[] }[],
  },
};

/** Named image slots used by page layouts. Values are media-library keys or upload URLs. */
export const siteImages = {
  heroBuilding: "cutout-bmc",
  heroTaxi: "cutout-taxi",
  heroBus: "cutout-bus",
  heroTrain: "cutout-train",
  heroSplashYellow: "cutout-splash-yellow",
  heroSplashRed: "cutout-splash-red",
  heroSkyline: "cutout-skyline",
  mastheadSketch: "cutout-gateway",
  domainAiArt: "cutout-ai",
  domainStartupArt: "cutout-bulb",
  footerSkyline: "footerSkyline",
};
