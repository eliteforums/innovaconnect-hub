import { io } from "next/cache";
import { getSiteContent } from "@/lib/content";
import { homepageLeaderboard } from "@/lib/server/finals-store";
import { LiveLeaderboard } from "@/components/finals/LiveLeaderboard";
import { Container, PendingNotice, Rich, SectionHeader, TextLink } from "@/components/ui";

/** Request-time preview, isolated so the rest of the homepage stays in its static shell. */
export async function HomeLeaderboard() {
  await io();
  const [state, content] = await Promise.all([
    homepageLeaderboard().catch((err) => {
      console.error("[leaderboard] homepage preview read failed", err);
      return { visible: false as const, board: null };
    }),
    getSiteContent(),
  ]);
  if (!state.visible) return null;

  const x = content.copy.leaderboard;

  return (
    <section aria-labelledby="home-leaderboard-title" className="mt-24">
      <Container>
        <SectionHeader
          kicker={x.section}
          id="home-leaderboard-title"
          title={x.homeTitle}
          deck={x.homeDeck}
          action={<TextLink href="/leaderboard">{x.homeLinkLabel}</TextLink>}
        />

        <div className="mt-8">
          <LiveLeaderboard
            initial={state.board}
            labels={x}
            domains={Object.fromEntries(content.domains.list.map((domain) => [domain.slug, domain.name]))}
            initialHomepageEnabled={state.visible}
            compact
            offNotice={
              <PendingNotice kicker={x.offKicker} title={x.offTitle} className="max-w-3xl">
                <p>
                  <Rich text={x.offBody} />
                </p>
              </PendingNotice>
            }
          />
        </div>
      </Container>
    </section>
  );
}
