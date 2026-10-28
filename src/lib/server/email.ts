import "server-only";

/**
 * Optional transactional email via Resend's HTTP API.
 * Configure RESEND_API_KEY and EMAIL_FROM; NOTIFY_EMAIL receives organizer
 * notifications. Without configuration, emails are skipped (and logged in
 * development). Emails are only ever sent after a submission is persisted.
 */

type Mail = { to: string; subject: string; text: string; replyTo?: string };

export function emailConfigured() {
  return Boolean(process.env.RESEND_API_KEY && process.env.EMAIL_FROM);
}

export async function sendEmail(mail: Mail) {
  if (!emailConfigured()) {
    if (process.env.NODE_ENV !== "production") {
      console.info(`[email] skipped (not configured): "${mail.subject}" → ${mail.to}`);
    }
    return false;
  }
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM,
        to: [mail.to],
        subject: mail.subject,
        text: mail.text,
        reply_to: mail.replyTo,
      }),
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) console.error(`[email] provider responded ${res.status}`);
    return res.ok;
  } catch (err) {
    console.error("[email] send failed", err);
    return false;
  }
}

export async function notifyOrganizer(subject: string, text: string, replyTo?: string) {
  const to = process.env.NOTIFY_EMAIL;
  if (!to) return false;
  return sendEmail({ to, subject, text, replyTo });
}
