import { notifyOrganizer } from "@/lib/server/email";
import { createFormHandler, hash } from "@/lib/server/form-handler";
import { partnerSchema } from "@/lib/validation";

export const POST = createFormHandler({
  schema: partnerSchema,
  collection: "partner_inquiries",
  dedupeKey: (d) => hash(d.email, d.organization.toLowerCase(), d.message),
  email: (d) => d.email,
  messages: {
    success: "Thank you — your partnership inquiry has been received and saved. The team will be in touch.",
    duplicate: "We've already received this inquiry. The team will be in touch.",
  },
  onStored: async (d) => {
    await notifyOrganizer(
      `Partnership inquiry: ${d.organization}`,
      `${d.contactName} (${d.contactRole}) <${d.email}>\nOrganization: ${d.organization} — ${d.category}\nInterest: ${d.interest}\nContribution: ${d.contribution ?? "—"}\nChallenge: ${d.challenge ?? "—"}\n\n${d.message}`,
      d.email,
    );
  },
});
