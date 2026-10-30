import { getSiteContent } from "@/lib/content";
import { notifyOrganizer, sendEmail } from "@/lib/server/email";
import { createFormHandler } from "@/lib/server/form-handler";
import { registrationState } from "@/lib/site";
import { registrationSchema } from "@/lib/validation";

export const POST = createFormHandler({
  schema: registrationSchema,
  collection: "registrations",
  rate: { limit: 4, windowMs: 10 * 60_000 },
  guard: async () => {
    const c = await getSiteContent();
    return c.event.registration.status === "open" ? null : { ok: false, message: registrationState(c).body };
  },
  refine: async (d): Promise<Record<string, string> | null> => {
    const { event, domains } = await getSiteContent();
    if (!domains.list.some((x) => x.slug === d.domain)) return { domain: "Please choose one of the official domains." };
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
    const { event, domains } = await getSiteContent();
    const domain = domains.list.find((x) => x.slug === d.domain)?.name ?? d.domain;
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
