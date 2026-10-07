import { Card } from "./ui";
import type { PostStatus } from "@/lib/post-log";
import { DEFAULT_SCHEDULE as S } from "@/lib/config";
import { buildPlan, zonedToUtcIso } from "@/lib/schedule";

export type PlanRow = { n: number; time: string; status: PostStatus };

// Colour only, no status words: yellow = not posted yet, green = posted, red = failed.
const STYLE: Record<PostStatus, string> = {
  pending: "bg-amber-100 text-amber-900 dark:bg-amber-950/60 dark:text-amber-200",
  success: "bg-emerald-100 text-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-200",
  failed: "bg-red-100 text-red-900 dark:bg-red-950/60 dark:text-red-200",
};

const TIME = new Intl.DateTimeFormat("en-US", { timeZone: S.timeZone, hour: "numeric", minute: "2-digit" });

// The day's posts, grouped into one card per session. Post numbers run 1 to 25 across the day.
export function DaySessions({
  today,
  sessionTimes,
  staggerMinutes,
  statuses,
}: {
  today: string;
  sessionTimes: string[];
  staggerMinutes: number;
  statuses: Partial<Record<number, PostStatus>>;
}) {
  const plan = buildPlan({ ...S, sessionTimes, staggerMinutes }, today, 1); // already in time order
  return (
    <>
      {sessionTimes.map((sessionTime, session) => {
        const rows: PlanRow[] = plan
          .map((p, i) => ({ p, n: i + 1 }))
          .filter(({ p }) => p.session === session)
          .map(({ p, n }) => ({ n, time: TIME.format(new Date(p.publishAt)), status: statuses[n] ?? "pending" }));
        return (
          <Card key={sessionTime + session} title={`Session ${session + 1} · ${TIME.format(new Date(zonedToUtcIso(today, sessionTime, S.timeZone)))}`}>
            <ul className="space-y-2">
              {rows.map((r) => (
                <li key={r.n} className={`flex items-center justify-between gap-3 rounded-lg px-4 py-3 text-base ${STYLE[r.status]}`}>
                  <span className="font-semibold">Post {r.n}</span>
                  <span>{r.time}</span>
                </li>
              ))}
            </ul>
          </Card>
        );
      })}
    </>
  );
}
