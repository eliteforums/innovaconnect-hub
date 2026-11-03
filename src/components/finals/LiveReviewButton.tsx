"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Radio, Square } from "lucide-react";
import { setLiveReviewAction } from "@/app/portal/actions";

/** Puts this team "on stage" on the public leaderboard, or takes it off. */
export function LiveReviewButton({ teamId, live }: { teamId: string; live: boolean }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          const res = await setLiveReviewAction(live ? null : teamId);
          if (!res.ok) window.alert(res.message);
          router.refresh();
        })
      }
      className={`inline-flex min-h-11 items-center gap-2 border-2 border-ink px-4 label text-[0.75rem] disabled:opacity-60 ${
        live ? "bg-violet text-paper-white hover:bg-ink" : "bg-paper-white hover:bg-violet-soft"
      }`}
    >
      {pending ? (
        <Loader2 aria-hidden className="size-4 animate-spin" />
      ) : live ? (
        <Square aria-hidden className="size-4" />
      ) : (
        <Radio aria-hidden className="size-4" />
      )}
      {live ? "End live review" : "Show as live on leaderboard"}
    </button>
  );
}

export function EndLiveButton() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          await setLiveReviewAction(null);
          router.refresh();
        })
      }
      className="border-2 border-ink bg-paper-white px-3 py-1.5 text-sm font-semibold hover:bg-taxi disabled:opacity-60"
    >
      End live review
    </button>
  );
}
