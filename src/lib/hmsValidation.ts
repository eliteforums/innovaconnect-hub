import { z } from "zod";

// --- Primitive Schemas ---

export const teamIdSchema = z.string().regex(/^IH-\d{4}$/, "Team ID must be in format IH-XXXX");

export const passwordSchema = z.string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Must contain at least one uppercase letter")
  .regex(/[a-z]/, "Must contain at least one lowercase letter")
  .regex(/\d/, "Must contain at least one digit")
  .regex(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/, "Must contain at least one special character");

export const tempPasswordSchema = passwordSchema.refine(
  (val) => val.length >= 12,
  "Temporary password must be at least 12 characters"
);

export const emailSchema = z.string().email().max(254);

export const phoneSchema = z.string()
  .regex(/^\+?[\d\s\-]+$/, "Phone must contain only digits, spaces, hyphens, or leading +")
  .refine(
    (val) => {
      const digits = val.replace(/\D/g, "");
      return digits.length >= 7 && digits.length <= 15;
    },
    "Phone must have between 7 and 15 digits"
  );

export const githubUrlSchema = z.string()
  .max(2048)
  .regex(
    /^https:\/\/github\.com\/[a-zA-Z0-9\-_.]+\/[a-zA-Z0-9\-_.]+\/?$/,
    "Must be a valid GitHub repository URL"
  );

export const videoUrlSchema = z.string().url().refine(
  (url) => {
    try {
      const hostname = new URL(url).hostname.replace("www.", "");
      return ["youtube.com", "youtu.be", "vimeo.com", "drive.google.com"].includes(hostname);
    } catch {
      return false;
    }
  },
  "Must be a YouTube, Vimeo, or Google Drive URL"
);

// --- Object Schemas ---

export const problemStatementSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().min(1).max(5000),
  domain: z.string().min(1),
  release_at: z.string().refine(
    (val) => new Date(val) > new Date(),
    "Release time must be in the future"
  ),
  deadline: z.string().optional(),
});

export const notificationSchema = z.object({
  title: z.string().min(1).max(200),
  message: z.string().min(1).max(5000),
  audience_type: z.enum(["all", "domain", "team"]),
  audience_value: z.string().nullable(),
  scheduled_at: z.string().nullable(),
});

export const flagReasonSchema = z.string().min(10).max(500);

export const csvFileSchema = z.object({
  headers: z.array(z.string()).refine(
    (h) => h.includes("email"),
    "CSV must have an 'email' column"
  ),
  rows: z.array(z.any())
    .max(1000, "CSV must not exceed 1,000 rows")
    .min(1, "CSV must have at least one data row"),
});

// --- Helper Functions ---

const UPPERCASE = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const LOWERCASE = "abcdefghijklmnopqrstuvwxyz";
const DIGITS = "0123456789";
const SPECIAL = "!@#$%^&*()_+-=[]{}|;:,.<>?";
const ALL_CHARS = UPPERCASE + LOWERCASE + DIGITS + SPECIAL;

/**
 * Generates a random temporary password that meets the tempPasswordSchema requirements:
 * - At least 12 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one digit
 * - At least one special character
 */
export function generateTempPassword(length: number = 16): string {
  if (length < 12) {
    length = 12;
  }

  const randomChar = (charset: string): string =>
    charset[Math.floor(Math.random() * charset.length)];

  // Ensure at least one of each required character type
  const required = [
    randomChar(UPPERCASE),
    randomChar(LOWERCASE),
    randomChar(DIGITS),
    randomChar(SPECIAL),
  ];

  // Fill the rest with random characters from the full set
  const remaining = Array.from({ length: length - required.length }, () =>
    randomChar(ALL_CHARS)
  );

  // Combine and shuffle using Fisher-Yates
  const chars = [...required, ...remaining];
  for (let i = chars.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }

  return chars.join("");
}
