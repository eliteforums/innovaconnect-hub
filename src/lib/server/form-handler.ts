import "server-only";
import { createHash } from "node:crypto";
import { after } from "next/server";
import type { z } from "zod";
import { antiSpam, fieldErrors } from "@/lib/validation";
import { insertRecord, type Collection } from "./store";
import { clientIp, rateLimit } from "./rate-limit";

export type FormResponse = {
  ok: boolean;
  message: string;
  errors?: Record<string, string>;
};

type Options<S extends z.ZodType> = {
  schema: S;
  collection: Collection;
  /** Records sharing a dedupe key are rejected as duplicates. */
  dedupeKey: (data: z.output<S>) => string;
  email: (data: z.output<S>) => string;
  /** Optional extra server-side gate, e.g. "registration must be open". */
  guard?: () => FormResponse | null;
  /** Extra validation that depends on server config. */
  refine?: (data: z.output<S>) => Record<string, string> | null;
  /** Side effects after a confirmed write (emails). Runs after the response. */
  onStored?: (data: z.output<S>, id: string) => Promise<void>;
  messages: { success: string | ((data: z.output<S>, id: string) => string); duplicate: string };
  rate?: { limit: number; windowMs: number };
};

const MAX_BODY_BYTES = 24 * 1024;
const MIN_FILL_MS = 1500;

function json(body: FormResponse, status: number, headers?: HeadersInit) {
  return Response.json(body, { status, headers: { "Cache-Control": "no-store", ...headers } });
}

export function hash(...parts: string[]) {
  return createHash("sha256").update(parts.join("\u0000")).digest("hex").slice(0, 40);
}

export function createFormHandler<S extends z.ZodType>(opts: Options<S>) {
  return async function POST(req: Request): Promise<Response> {
    // Same-origin check (defence in depth — JSON requests are already preflighted cross-origin).
    const origin = req.headers.get("origin");
    const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
    if (origin && host && new URL(origin).host !== host) {
      return json({ ok: false, message: "This request could not be verified." }, 403);
    }

    if (!req.headers.get("content-type")?.includes("application/json")) {
      return json({ ok: false, message: "Unsupported request format." }, 415);
    }

    const gate = opts.guard?.();
    if (gate) return json(gate, 403);

    const limit = rateLimit(`${opts.collection}:${clientIp(req)}`, opts.rate ?? { limit: 6, windowMs: 10 * 60_000 });
    if (!limit.allowed) {
      return json(
        { ok: false, message: "Too many submissions from this connection. Please wait a few minutes and try again." },
        429,
        { "Retry-After": String(limit.retryAfter) },
      );
    }

    const raw = await req.text();
    if (raw.length > MAX_BODY_BYTES) {
      return json({ ok: false, message: "This submission is too large." }, 413);
    }

    let body: unknown;
    try {
      body = JSON.parse(raw);
    } catch {
      return json({ ok: false, message: "This submission could not be read." }, 400);
    }

    const spam = antiSpam.safeParse(body);
    if (!spam.success || (spam.data.elapsedMs !== undefined && spam.data.elapsedMs < MIN_FILL_MS)) {
      return json({ ok: false, message: "This submission could not be verified. Please try again." }, 400);
    }

    const parsed = opts.schema.safeParse(body);
    if (!parsed.success) {
      return json(
        { ok: false, message: "Please check the highlighted fields.", errors: fieldErrors(parsed.error) },
        400,
      );
    }
    const data = parsed.data;

    const extra = opts.refine?.(data);
    if (extra) {
      return json({ ok: false, message: "Please check the highlighted fields.", errors: extra }, 400);
    }

    const result = await insertRecord(opts.collection, {
      dedupeKey: opts.dedupeKey(data),
      email: opts.email(data),
      payload: data,
    });

    if (result.ok) {
      if (opts.onStored) {
        const { onStored } = opts;
        after(() => onStored(data, result.id).catch((err) => console.error("[form] onStored failed", err)));
      }
      const { success } = opts.messages;
      return json({ ok: true, message: typeof success === "function" ? success(data, result.id) : success }, 201);
    }
    if (result.reason === "duplicate") {
      return json({ ok: false, message: opts.messages.duplicate }, 409);
    }
    if (result.reason === "unavailable") {
      return json(
        {
          ok: false,
          message:
            "Submissions are temporarily unavailable, so nothing was saved. Please try again later or contact the organizers.",
        },
        503,
      );
    }
    return json(
      { ok: false, message: "Something went wrong and your submission was not saved. Please try again." },
      500,
    );
  };
}
