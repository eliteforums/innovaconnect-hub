import { z } from "zod";
import {
  contactTopics,
  domainValues,
  interestCategories,
  partnerCategories,
  partnershipInterests,
  statesAndUts,
} from "./options";

export * from "./options";

/**
 * Server-side validation schemas for every public form. Client forms use
 * native constraint validation; the server is the source of truth.
 */

const name = z.string().trim().min(2, "Please enter your name.").max(120, "That name is too long.");
const email = z
  .string()
  .trim()
  .toLowerCase()
  .max(254, "That email is too long.")
  .pipe(z.email("Please enter a valid email address."));
const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max, `Please keep this under ${max} characters.`)
    .optional()
    .transform((v) => (v ? v : undefined));
const optionalUrl = z
  .string()
  .trim()
  .max(500)
  .optional()
  .transform((v) => (v ? v : undefined))
  .pipe(z.url({ protocol: /^https?$/, message: "Please enter a full link starting with https://" }).optional());
const consent = (message: string) => z.literal(true, { error: message });

/** Anti-spam fields shared by every public form. */
export const antiSpam = z.object({
  /** Honeypot — real users never fill it. */
  website: z.string().max(0).optional().or(z.literal("")),
  /** Milliseconds since the form was rendered. */
  elapsedMs: z.number().int().nonnegative().optional(),
});

export const interestSchema = z.object({
  name,
  email,
  organization: optionalText(160),
  interest: z.enum(interestCategories).optional(),
  consent: consent("Please confirm you agree to receive event updates."),
});

export const partnerSchema = z.object({
  organization: z.string().trim().min(2, "Please enter your organization's name.").max(160),
  contactName: name,
  contactRole: z.string().trim().min(2, "Please enter your role.").max(120),
  email,
  category: z.enum(partnerCategories, { error: "Please choose a category." }),
  interest: z.enum(partnershipInterests, { error: "Please choose an area of interest." }),
  contribution: optionalText(600),
  challenge: optionalText(1500),
  message: z.string().trim().min(10, "Please add a short message.").max(3000),
  consent: consent("Please confirm we may contact you about this inquiry."),
});

export const contactSchema = z.object({
  name,
  email,
  topic: z.enum(contactTopics, { error: "Please choose a topic." }),
  message: z.string().trim().min(10, "Please add a short message.").max(3000),
  consent: consent("Please confirm we may use your details to reply."),
});

const member = z.object({
  fullName: name,
  email,
});

export const registrationSchema = z
  .object({
    lead: z.object({
      fullName: name,
      email,
      phone: z
        .string()
        .trim()
        .regex(/^\+?[0-9\s-]{8,16}$/, "Please enter a valid phone number."),
      organization: z.string().trim().min(2, "Please enter your college or organization.").max(160),
      city: z.string().trim().min(2, "Please enter your city.").max(80),
      state: z.enum(statesAndUts, { error: "Please choose your state or union territory." }),
    }),
    team: z.object({
      name: z.string().trim().min(2, "Please enter a team name.").max(80),
      members: z.array(member).max(20),
    }),
    domain: z.enum(domainValues, { error: "Please choose one of the two official domains." }),
    project: z.object({
      title: z.string().trim().min(3, "Please enter a working title.").max(120),
      summary: z.string().trim().min(40, "Please describe your idea in at least 40 characters.").max(1500),
      repoUrl: optionalUrl,
      demoUrl: optionalUrl,
    }),
    consents: z.object({
      rules: consent("Please confirm you accept the official rules."),
      privacy: consent("Please confirm you have read the privacy notice."),
      updates: z.boolean().optional(),
    }),
  })
  .superRefine((val, ctx) => {
    const emails = [val.lead.email, ...val.team.members.map((m) => m.email)];
    const dupes = emails.filter((e, i) => emails.indexOf(e) !== i);
    if (dupes.length) {
      ctx.addIssue({
        code: "custom",
        path: ["team", "members"],
        message: "Each team member needs a different email address.",
      });
    }
  });

export type InterestInput = z.infer<typeof interestSchema>;
export type PartnerInput = z.infer<typeof partnerSchema>;
export type ContactInput = z.infer<typeof contactSchema>;
export type RegistrationInput = z.infer<typeof registrationSchema>;

/** Flatten zod issues into a { "a.b.c": message } map for forms. */
export function fieldErrors(error: z.ZodError) {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".");
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}
