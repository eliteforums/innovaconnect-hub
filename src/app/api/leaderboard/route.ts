import { connection } from "next/server";
import { publicLeaderboardStatus } from "@/lib/server/finals-store";

/**
 * Public leaderboard JSON, polled every few seconds by /leaderboard during
 * the live final. Answers { enabled: false } while the admin has it off.
 * Contains no contact details or logins — only what the page displays.
 */
export async function GET(request: Request) {
  await connection();
  try {
    const preview = new URL(request.url).searchParams.has("homepage");
    const state = await publicLeaderboardStatus(preview);
    return Response.json(state, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (err) {
    console.error("[leaderboard] reading failed", err);
    return Response.json({ error: "The leaderboard is temporarily unavailable." }, { status: 503 });
  }
}
