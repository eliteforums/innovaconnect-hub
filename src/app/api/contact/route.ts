import { notifyOrganizer } from "@/lib/server/email";
import { createFormHandler, hash } from "@/lib/server/form-handler";
import { contactSchema } from "@/lib/validation";

export const POST = createFormHandler({
  schema: contactSchema,
  collection: "contact_messages",
  dedupeKey: (d) => hash(d.email, d.message),
  email: (d) => d.email,
  messages: {
    success: "Your message has been received and saved. We'll reply by email.",
    duplicate: "We've already received this message. We'll reply by email.",
  },
  onStored: async (d) => {
    await notifyOrganizer(`Contact: ${d.topic} — ${d.name}`, `${d.name} <${d.email}>\nTopic: ${d.topic}\n\n${d.message}`, d.email);
  },
});
