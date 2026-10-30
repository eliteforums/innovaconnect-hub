import { chapter1 } from "@/content/chapter1";
import { cityFeatures, sidebarFeatures } from "@/content/city";
import { copy, siteImages } from "@/content/copy";
import { domainRules, domains } from "@/content/domains";
import { event } from "@/content/event";
import { faq } from "@/content/faq";
import { interchanges, landmarks, placeLabels, railLines, seaLink } from "@/content/mumbai-map";
import { footerNav, primaryNav } from "@/content/navigation";
import { rules } from "@/content/rules";
import { allArticles } from "@/content/updates";

/**
 * Every editable content section. The values here are the built-in defaults;
 * anything saved in the admin dashboard is stored per section and overrides
 * them (see ./index.ts).
 */

export const sectionDefaults = {
  event,
  domains: { list: domains, rules: domainRules },
  chapter1,
  articles: allArticles,
  faq,
  rules,
  city: { sidebar: sidebarFeatures, features: cityFeatures },
  map: { railLines, interchanges, landmarks, seaLink, placeLabels },
  images: siteImages,
  navigation: { primary: primaryNav, footer: footerNav },
  "copy.global": copy.global,
  "copy.home": copy.home,
  "copy.about": copy.about,
  "copy.tracks": copy.tracks,
  "copy.domainDetail": copy.domainDetail,
  "copy.chapter1Page": copy.chapter1Page,
  "copy.timeline": copy.timeline,
  "copy.prizes": copy.prizes,
  "copy.partners": copy.partners,
  "copy.updates": copy.updates,
  "copy.register": copy.register,
  "copy.contact": copy.contact,
  "copy.faq": copy.faq,
  "copy.rules": copy.rules,
  "copy.privacy": copy.privacy,
  "copy.terms": copy.terms,
};

export type SectionKey = keyof typeof sectionDefaults;

export const sectionKeys = Object.keys(sectionDefaults) as SectionKey[];

export function isSectionKey(key: string): key is SectionKey {
  return Object.prototype.hasOwnProperty.call(sectionDefaults, key);
}

/** Labels and grouping for the dashboard sidebar. */
export const sectionInfo: Record<SectionKey, { label: string; group: string; description: string }> = {
  event: {
    label: "Event settings",
    group: "Event",
    description:
      "Registration status, dates, venue, team size, fee, prize pool, awards, partners, contact details, the competition journey and participation figures.",
  },
  domains: { label: "Competition domains", group: "Event", description: "The two official domains and the two-domain rule." },
  articles: { label: "Build Log articles", group: "Event", description: "News, announcements and guides. Set draft to false and a date to publish." },
  faq: { label: "FAQ", group: "Event", description: "Question groups shown on the FAQ page." },
  rules: { label: "Rules", group: "Event", description: "Confirmed principles and the topics the rulebook will cover." },
  chapter1: { label: "Chapter 1 archive", group: "Event", description: "Historical figures, domains, structure, winners, partners, judges and gallery." },
  city: { label: "Mumbai stories", group: "Mumbai & media", description: "The hero sidebar stories and the city feature grid." },
  map: { label: "Mumbai map", group: "Mumbai & media", description: "Rail lines, stations, landmarks and labels on the Section 09 map." },
  images: { label: "Layout images", group: "Mumbai & media", description: "Hero collage layers, domain artwork, timeline train and footer skyline." },
  navigation: { label: "Navigation", group: "Site", description: "Header menu and footer link columns." },
  "copy.global": { label: "Global text & SEO", group: "Site", description: "Header, footer, registration messages, status labels, SEO and the 404 page." },
  "copy.home": { label: "Homepage", group: "Page text", description: "Every heading, paragraph and label on the homepage." },
  "copy.about": { label: "The Story (About)", group: "Page text", description: "About page text and figure." },
  "copy.tracks": { label: "The Tracks", group: "Page text", description: "Tracks overview page and comparison table." },
  "copy.domainDetail": { label: "Domain pages", group: "Page text", description: "Shared labels on both domain detail pages." },
  "copy.chapter1Page": { label: "Chapter 1 page", group: "Page text", description: "Chapter 1 archive page text." },
  "copy.timeline": { label: "Timeline", group: "Page text", description: "Timeline page and railway journey labels." },
  "copy.prizes": { label: "Prizes", group: "Page text", description: "Prizes page text and award labels." },
  "copy.partners": { label: "Partners", group: "Page text", description: "Partners page text." },
  "copy.updates": { label: "Updates", group: "Page text", description: "Build Log listing and article page labels." },
  "copy.register": { label: "Register", group: "Page text", description: "Registration page text." },
  "copy.contact": { label: "Contact", group: "Page text", description: "Contact page text." },
  "copy.faq": { label: "FAQ page", group: "Page text", description: "FAQ page heading and labels." },
  "copy.rules": { label: "Rules page", group: "Page text", description: "Rules page heading and labels." },
  "copy.privacy": { label: "Privacy", group: "Page text", description: "Privacy notice." },
  "copy.terms": { label: "Terms", group: "Page text", description: "Terms & conditions." },
};
