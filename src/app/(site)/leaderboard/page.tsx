import { Suspense } from "react";
import { connection } from "next/server";
import { getSiteContent } from "@/lib/content";
import { publicLeaderboard } from "@/lib/server/finals-store";
import { LiveLeaderboard } from "@/components/finals/LiveLeaderboard";
import { PageHeader } from "@/components/layout/PageHeader";
import { Container, PendingNotice, Rich } from "@/components/ui";
import { pageMeta } from "@/lib/seo";

export async function generateMetadata() {
  const { copy } = await getSiteContent();
  return pageMeta("/leaderboard", copy.leaderboard.seo.title, copy.leaderboard.seo.description);
}

export default async function LeaderboardPage() {
  const c = await getSiteContent();
  const x = c.copy.leaderboard;
  return (
    <>
      <PageHeader section={x.section} crumbs={[{ label: x.section, href: "/leaderboard" }]} title={x.title} deck={x.deck} />
      <Container className="mt-14">
        <Suspense fallback={<p className="kicker text-muted">{x.liveLabel}…</p>}>
          <Board />
        </Suspense>
      </Container>
    </>
  );
}

/** Reads the scores at request time; the client component then keeps them live. */
async function Board() {
  await connection();
  const c = await getSiteContent();
  const x = c.copy.leaderboard;
  const board = await publicLeaderboard().catch((err) => {
    console.error("[leaderboard] reading failed", err);
    return null;
  });
  const domains = Object.fromEntries(c.domains.list.map((d) => [d.slug, d.name]));
  return (
    <LiveLeaderboard
      initial={board}
      labels={x}
      domains={domains}
      offNotice={
        <PendingNotice kicker={x.offKicker} title={x.offTitle} className="max-w-3xl">
          <p>
            <Rich text={x.offBody} />
          </p>
        </PendingNotice>
      }
    />
  );
}
