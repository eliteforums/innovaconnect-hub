import type { SiteContent } from "@/lib/content";

/** Copy for the current registration state (headline, body, badge). */
export function registrationState(c: SiteContent) {
  return c.copy.global.registration[c.event.registration.status];
}

export function isRegistrationOpen(c: SiteContent) {
  return c.event.registration.status === "open";
}

/** The primary site-wide call to action, based on the registration status. */
export function primaryCta(c: SiteContent) {
  if (isRegistrationOpen(c)) return { label: c.copy.global.cta.register, href: "/register" };
  return { label: c.copy.global.cta.updates, href: "/register#updates" };
}

/** Values available to {placeholders} in editable copy. */
export function contentVars(c: SiteContent): Record<string, string | number | null | undefined> {
  return {
    organizer: c.event.organizer,
    fullName: c.event.fullName,
    year: c.event.year.value,
    chapter1Year: c.chapter1.year,
    location: c.chapter1.location,
  };
}

/** Replaces {name} placeholders. Unknown placeholders are left as written. */
export function fill(text: string | null | undefined, vars: Record<string, string | number | null | undefined>) {
  if (!text) return "";
  return text.replace(/\{(\w+)\}/g, (m, k: string) => (vars[k] === undefined || vars[k] === null ? m : String(vars[k])));
}

/** Fills placeholders from the site content. */
export function t(c: SiteContent, text: string | null | undefined, extra: Record<string, string | number | null | undefined> = {}) {
  return fill(text, { ...contentVars(c), ...extra });
}

export function formatDate(iso: string | null | undefined) {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  }).format(d);
}
