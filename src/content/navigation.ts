export const primaryNav = [
  { label: "The Story", href: "/about" },
  { label: "The Tracks", href: "/tracks" },
  { label: "Chapter 1", href: "/chapter-1" },
  { label: "Timeline", href: "/timeline" },
  { label: "Partners", href: "/partners" },
  { label: "FAQ", href: "/faq" },
  { label: "Contact", href: "/contact" },
] as const;

export const footerNav = [
  {
    title: "The edition",
    links: [
      { label: "The Story", href: "/about" },
      { label: "Timeline", href: "/timeline" },
      { label: "Prizes", href: "/prizes" },
      { label: "Build Log", href: "/updates" },
    ],
  },
  {
    title: "The tracks",
    links: [
      { label: "Both domains", href: "/tracks" },
      { label: "Artificial Intelligence", href: "/tracks/artificial-intelligence" },
      { label: "Open Innovation / Startup", href: "/tracks/open-innovation" },
      { label: "Rules", href: "/rules" },
    ],
  },
  {
    title: "Get involved",
    links: [
      { label: "Register", href: "/register" },
      { label: "Partners", href: "/partners" },
      { label: "Contact", href: "/contact" },
      { label: "FAQ", href: "/faq" },
    ],
  },
  {
    title: "Archive",
    links: [
      { label: "Chapter 1 · 2026", href: "/chapter-1" },
      { label: "Privacy", href: "/privacy" },
      { label: "Terms", href: "/terms" },
    ],
  },
] as const;
