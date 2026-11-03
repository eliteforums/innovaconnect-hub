"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { deleteScoreAction } from "@/app/admin/finals-actions";

export function DeleteScoreButton({ id }: { id: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      aria-label="Remove these marks"
      onClick={() => {
        if (!window.confirm("Remove these marks? The leaderboard updates straight away.")) return;
        startTransition(async () => {
          const res = await deleteScoreAction(id);
          if (!res.ok) window.alert(res.message);
          router.refresh();
        });
      }}
      className="grid size-7 shrink-0 place-items-center hover:bg-best/10 disabled:opacity-50"
    >
      <Trash2 aria-hidden className="size-4" />
    </button>
  );
}
