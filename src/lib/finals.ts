/**
 * The live final: finalist teams, moderators, scoring and the public
 * leaderboard. Types and pure helpers only — safe for client bundles.
 * Storage lives in ./server/finals-store.ts.
 */

export type TeamMode = "offline" | "online";
export type Tier = 1 | 2 | 3;
export const TIERS: Tier[] = [1, 2, 3];

export type Criterion = { key: string; label: string; max: number };

export type FinalsSettings = {
  /** The public /leaderboard page shows scores only while this is on. */
  leaderboardEnabled: boolean;
  /** A top-five leaderboard preview appears on the homepage while this is on. */
  homepageLeaderboardEnabled: boolean;
  /** Finalist teams can create and edit their solution only while this is on. */
  submissionsOpen: boolean;
  /** Tier 1/2/3 winners appear on the leaderboard only once published. */
  winnersPublished: boolean;
  /** Show each moderator's marks (not just the average) on the leaderboard. */
  showModeratorMarks: boolean;
  /** Team currently being reviewed live, highlighted on the leaderboard. */
  nowReviewing: string | null;
  criteria: Criterion[];
};

export const defaultCriteria: Criterion[] = [
  { key: "innovation", label: "Innovation & originality", max: 10 },
  { key: "execution", label: "Technical execution", max: 10 },
  { key: "impact", label: "Impact & feasibility", max: 10 },
  { key: "design", label: "User experience & design", max: 10 },
  { key: "presentation", label: "Presentation & demo", max: 10 },
];

export const defaultFinalsSettings: FinalsSettings = {
  leaderboardEnabled: false,
  homepageLeaderboardEnabled: false,
  submissionsOpen: true,
  winnersPublished: false,
  showModeratorMarks: true,
  nowReviewing: null,
  criteria: defaultCriteria,
};

// ── Stored rows ──────────────────────────────────────────────────────────────

export type TeamRow = {
  id: string;
  login_id: string;
  pass_hash: string;
  name: string;
  domain: string;
  mode: TeamMode;
  email: string;
  members: string;
  registration_id: string | null;
  tier: Tier | null;
  created_at: string;
};

export type ModeratorRow = {
  id: string;
  login_id: string;
  pass_hash: string;
  name: string;
  affiliation: string;
  created_at: string;
};

export type SolutionRow = {
  team_id: string;
  title: string;
  summary: string;
  tech_stack: string;
  repo_url: string;
  demo_url: string;
  video_url: string;
  deck_url: string;
  submitted_at: string;
  updated_at: string;
};

export type ScoreRow = {
  /** `${team_id}:${moderator_id}` — one score per moderator per team. */
  id: string;
  team_id: string;
  moderator_id: string;
  marks: Record<string, number>;
  comment: string;
  updated_at: string;
};

/** A team without its password hash, safe to pass to client components. */
export type TeamInfo = Omit<TeamRow, "pass_hash">;
export type ModeratorInfo = Omit<ModeratorRow, "pass_hash">;

function withoutPass<T extends { pass_hash: string }>(row: T): Omit<T, "pass_hash"> {
  const copy: Partial<T> = { ...row };
  delete copy.pass_hash;
  return copy as Omit<T, "pass_hash">;
}

export const teamInfo = (team: TeamRow): TeamInfo => withoutPass(team);
export const moderatorInfo = (moderator: ModeratorRow): ModeratorInfo => withoutPass(moderator);

// ── Scoring ──────────────────────────────────────────────────────────────────

export const maxTotal = (criteria: Criterion[]) => criteria.reduce((sum, c) => sum + c.max, 0);

/** Total of one score sheet, counting only the current criteria, each capped at its maximum. */
export function scoreTotal(marks: Record<string, number>, criteria: Criterion[]) {
  return criteria.reduce((sum, c) => sum + Math.min(Math.max(Number(marks[c.key]) || 0, 0), c.max), 0);
}

const round1 = (n: number) => Math.round(n * 10) / 10;

export type LeaderboardEntry = {
  id: string;
  rank: number | null;
  name: string;
  domain: string;
  mode: TeamMode;
  title: string | null;
  submitted: boolean;
  reviews: number;
  /** Average of the moderators' totals, or null before the first review. */
  average: number | null;
  /** Average mark per criterion. */
  criteria: Record<string, number>;
  marks: { moderator: string; total: number; marks: Record<string, number>; updatedAt: string }[];
  tier: Tier | null;
};

export type Leaderboard = {
  updatedAt: string;
  criteria: Criterion[];
  maxTotal: number;
  nowReviewing: string | null;
  winnersPublished: boolean;
  entries: LeaderboardEntry[];
};

/**
 * Ranks every finalist team by the average of its moderators' totals
 * (standard competition ranking: equal averages share a rank). Teams without
 * a review yet are listed last, unranked.
 */
export function buildLeaderboard(input: {
  teams: TeamRow[];
  moderators: ModeratorRow[];
  solutions: SolutionRow[];
  scores: ScoreRow[];
  settings: FinalsSettings;
  /** Include tiers even when winners aren't published (admin view). */
  revealTiers?: boolean;
  /** Include each moderator's marks (admin view, or when enabled publicly). */
  includeMarks?: boolean;
}): Leaderboard {
  const { teams, moderators, solutions, scores, settings } = input;
  const criteria = settings.criteria;
  const moderatorName = new Map(moderators.map((m) => [m.id, m.name]));
  const solutionByTeam = new Map(solutions.map((s) => [s.team_id, s]));
  const showTiers = input.revealTiers || settings.winnersPublished;

  const entries: LeaderboardEntry[] = teams.map((team) => {
    // Ignore scores left behind by a moderator who has since been removed.
    const sheets = scores.filter((s) => s.team_id === team.id && moderatorName.has(s.moderator_id));
    const totals = sheets.map((s) => scoreTotal(s.marks, criteria));
    const perCriterion = Object.fromEntries(
      criteria.map((c) => [
        c.key,
        sheets.length
          ? round1(sheets.reduce((sum, s) => sum + Math.min(Math.max(Number(s.marks[c.key]) || 0, 0), c.max), 0) / sheets.length)
          : 0,
      ]),
    );
    const solution = solutionByTeam.get(team.id);
    return {
      id: team.id,
      rank: null,
      name: team.name,
      domain: team.domain,
      mode: team.mode,
      title: solution?.title || null,
      submitted: Boolean(solution),
      reviews: sheets.length,
      average: totals.length ? round1(totals.reduce((a, b) => a + b, 0) / totals.length) : null,
      criteria: perCriterion,
      marks: input.includeMarks
        ? sheets
            .map((s) => ({
              moderator: moderatorName.get(s.moderator_id)!,
              total: round1(scoreTotal(s.marks, criteria)),
              marks: s.marks,
              updatedAt: s.updated_at,
            }))
            .sort((a, b) => a.moderator.localeCompare(b.moderator))
        : [],
      tier: showTiers ? team.tier : null,
    };
  });

  entries.sort(
    (a, b) =>
      (b.average ?? -1) - (a.average ?? -1) || b.reviews - a.reviews || a.name.localeCompare(b.name),
  );
  let previous: number | null = null;
  let previousRank = 0;
  entries.forEach((e, i) => {
    if (e.average === null) return;
    e.rank = e.average === previous ? previousRank : i + 1;
    previous = e.average;
    previousRank = e.rank;
  });

  return {
    updatedAt: new Date().toISOString(),
    criteria,
    maxTotal: maxTotal(criteria),
    nowReviewing: settings.nowReviewing && teams.some((t) => t.id === settings.nowReviewing) ? settings.nowReviewing : null,
    winnersPublished: settings.winnersPublished,
    entries,
  };
}
