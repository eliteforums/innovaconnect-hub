/** Form option lists — kept free of zod so client components can import them. */

export const statesAndUts = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana",
  "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
  "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana",
  "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Andaman and Nicobar Islands", "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu", "Delhi",
  "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry",
] as const;

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
