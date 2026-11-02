/** Form option lists — kept free of zod so client components can import them. */

export const interestCategories = [
  "Participating",
  "Artificial Intelligence domain",
  "Open Innovation / Startup domain",
  "Mentoring or judging",
  "Partnering or sponsoring",
  "Campus or community outreach",
] as const;

export const partnerCategories = [
  "Company",
  "Startup",
  "Investor or incubator",
  "Educational institution",
  "Community",
  "Government or non-profit",
  "Other",
] as const;

export const partnershipInterests = [
  "Sponsorship",
  "Domain challenge",
  "Technology / credits partner",
  "Mentors & judges",
  "Hiring & talent",
  "Community or campus partner",
  "Other",
] as const;

export const contactTopics = ["General question", "Participation", "Press & media", "Accessibility", "Other"] as const;

export const domainValues = ["artificial-intelligence", "open-innovation"] as const;
