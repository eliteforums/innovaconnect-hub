import type { Collection } from "@/lib/server/store";

/** Display configuration for each form-submission collection. */
export const collectionLabels: Record<
  Collection,
  { title: string; description: string; columns: { label: string; path: string }[] }
> = {
  registrations: {
    title: "Registrations",
    description: "Team registrations (only accepted while registration is open).",
    columns: [
      { label: "Team", path: "team.name" },
      { label: "Lead", path: "lead.fullName" },
      { label: "Email", path: "lead.email" },
      { label: "Domain", path: "domain" },
      { label: "Project", path: "project.title" },
      { label: "City", path: "lead.city" },
    ],
  },
  interest_signups: {
    title: "Update list",
    description: "People who asked for event updates.",
    columns: [
      { label: "Name", path: "name" },
      { label: "Email", path: "email" },
      { label: "Organization", path: "organization" },
      { label: "Interest", path: "interest" },
    ],
  },
  partner_inquiries: {
    title: "Partner inquiries",
    description: "Sponsorship and partnership inquiries.",
    columns: [
      { label: "Organization", path: "organization" },
      { label: "Contact", path: "contactName" },
      { label: "Email", path: "email" },
      { label: "Category", path: "category" },
      { label: "Interest", path: "interest" },
    ],
  },
  contact_messages: {
    title: "Contact messages",
    description: "Messages sent through the contact page.",
    columns: [
      { label: "Name", path: "name" },
      { label: "Email", path: "email" },
      { label: "Topic", path: "topic" },
      { label: "Message", path: "message" },
    ],
  },
};

export function getPath(obj: unknown, path: string): unknown {
  return path.split(".").reduce<unknown>((o, k) => (o && typeof o === "object" ? (o as Record<string, unknown>)[k] : undefined), obj);
}
