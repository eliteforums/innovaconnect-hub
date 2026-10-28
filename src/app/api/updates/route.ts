import { event } from "@/content/event";
import { notifyOrganizer, sendEmail } from "@/lib/server/email";
import { createFormHandler } from "@/lib/server/form-handler";
import { interestSchema } from "@/lib/validation";

export const POST = createFormHandler({
  schema: interestSchema,
  collection: "interest_signups",
  dedupeKey: (d) => d.email,
  email: (d) => d.email,
  messages: {
    success: "You're on the list. We'll email you when there is official news about InnovaHack Chapter 2.",
    duplicate: "This email is already on the update list — you don't need to sign up again.",
  },
  onStored: async (d) => {
    await sendEmail({
      to: d.email,
      subject: `You're on the ${event.fullName} update list`,
      text: `Hi ${d.name},\n\nThanks for joining the ${event.fullName} update list. We'll write when there is official news — such as registration opening, confirmed dates or partner announcements.\n\n— ${event.organizer}`,
    });
    await notifyOrganizer(`New update-list signup: ${d.name}`, `${d.name} <${d.email}>\nOrganization: ${d.organization ?? "—"}\nInterest: ${d.interest ?? "—"}`);
  },
});
