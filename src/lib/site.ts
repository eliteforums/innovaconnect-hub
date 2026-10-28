import { event } from "@/content/event";
import type { FactStatus, RegistrationStatus } from "@/content/types";

export const statusLabels: Record<FactStatus, string> = {
  confirmed: "Confirmed",
  planned: "Planned",
  proposed: "Proposed",
  target: "Target",
  advertised: "As advertised",
  reported: "Reported",
  unconfirmed: "To be announced",
};

export const registrationCopy: Record<
  RegistrationStatus,
  { headline: string; body: string; badge: string }
> = {
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
};

export function isRegistrationOpen() {
  return event.registration.status === "open";
}

export function interestListOpen() {
  return event.registration.status !== "open";
}

/** The primary site-wide call to action, based on the registration status. */
export function primaryCta() {
  if (isRegistrationOpen()) {
    return { label: "Register now", href: "/register" };
  }
  return { label: "Get event updates", href: "/register#updates" };
}

export function formatDate(iso: string | null) {
  if (!iso) return null;
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  }).format(new Date(iso));
}
