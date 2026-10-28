import { event } from "@/content/event";
import { domainBySlug } from "@/content/domains";
import { notifyOrganizer, sendEmail } from "@/lib/server/email";
import { createFormHandler } from "@/lib/server/form-handler";
import { registrationCopy } from "@/lib/site";
import { registrationSchema } from "@/lib/validation";

export const POST = createFormHandler({
  schema: registrationSchema,
  collection: "registrations",
  rate: { limit: 4, windowMs: 10 * 60_000 },
  guard: () =>
    event.registration.status === "open"
      ? null
      : { ok: false, message: registrationCopy[event.registration.status].body },
  refine: (d) => {
    const size = d.team.members.length + 1;
    const { min, max } = event.teamSize;
    const cap = max ?? event.formTeamMemberLimit;
    if (size > cap) return { "team.members": `Teams can have at most ${cap} members, including the lead.` };
    if (min && size < min) return { "team.members": `Teams need at least ${min} members, including the lead.` };
    return null;
  },
  dedupeKey: (d) => d.lead.email,
  email: (d) => d.lead.email,
  messages: {
    success: (d, id) => `Registration for team "${d.team.name}" has been received and saved. Your reference is ${id.slice(0, 8).toUpperCase()}.`,
    duplicate: "A registration already exists for this team lead's email address. Contact the organizers if you need to change it.",
  },
  onStored: async (d, id) => {
    const domain = domainBySlug(d.domain)?.name ?? d.domain;
    await sendEmail({
      to: d.lead.email,
      subject: `${event.fullName}: registration received`,
      text: `Hi ${d.lead.fullName},\n\nWe've received the registration for team "${d.team.name}" in the ${domain} domain.\nReference: ${id}\n\nWatch your inbox for next steps.\n\n— ${event.organizer}`,
    });
    await notifyOrganizer(
      `New registration: ${d.team.name} (${domain})`,
      `Team: ${d.team.name}\nLead: ${d.lead.fullName} <${d.lead.email}>\nMembers: ${d.team.members.length + 1}\nProject: ${d.project.title}\nReference: ${id}`,
    );
  },
});
