import { DEFAULT_SCHEDULE as S, todayIn } from "@/lib/config";
import { getPostStatuses, type PostStatus } from "@/lib/post-log";
import { buildPlan, zonedToUtcIso } from "@/lib/schedule";
import { Card, PageHeader } from "../ui";
import { SessionRows, type SessionView } from "./rows";

export const metadata = { title: "Schedule · Chigla Organic" };

const TIME = new Intl.DateTimeFormat("en-US", { timeZone: S.timeZone, hour: "numeric", minute: "2-digit" });
const DAY = new Intl.DateTimeFormat("en-US", { timeZone: S.timeZone, weekday: "long", day: "numeric", month: "long" });

export default async function SchedulePage() {
  const today = todayIn(S.timeZone);
  const plan = buildPlan(S, today, 1); // already in time order, so index + 1 is the post number
  const statuses = await getPostStatuses(today);

  const sessions: SessionView[] = S.sessionTimes.map((sessionTime, session) => ({
    title: `Session ${session + 1} · ${TIME.format(new Date(zonedToUtcIso(today, sessionTime, S.timeZone)))}`,
    rows: plan
      .map((p, i) => ({ p, n: i + 1 }))
      .filter(({ p }) => p.session === session)
      .map(({ p, n }) => ({
        n,
        time: TIME.format(new Date(p.publishAt)),
        status: (statuses[n] ?? "pending") as PostStatus,
      })),
  }));

  return (
    <>
      <PageHeader
        title="Schedule"
        sub={`${DAY.format(new Date())} · New York time. Yellow = not posted yet, green = posted, red = failed.`}
      />
      {sessions.map((s) => (
        <Card key={s.title} title={s.title}>
          <SessionRows rows={s.rows} />
        </Card>
      ))}
    </>
  );
}
