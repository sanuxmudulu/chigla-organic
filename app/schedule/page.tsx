import { DEFAULT_SCHEDULE as S, todayIn } from "@/lib/config";
import { buildPlan, zonedToUtcIso } from "@/lib/schedule";
import { Card, PageHeader } from "../ui";
import { SessionRows, type SessionView } from "./rows";

const TIME = new Intl.DateTimeFormat("en-US", { timeZone: S.timeZone, hour: "numeric", minute: "2-digit" });
const DAY = new Intl.DateTimeFormat("en-US", { timeZone: S.timeZone, weekday: "long", day: "numeric", month: "long" });

export default function SchedulePage() {
  const today = todayIn(S.timeZone);
  const plan = buildPlan(S, today, 1); // already in time order, so index + 1 is the post number

  const sessions: SessionView[] = S.sessionTimes.map((sessionTime, session) => ({
    title: `Session ${session + 1} · ${TIME.format(new Date(zonedToUtcIso(today, sessionTime, S.timeZone)))}`,
    rows: plan
      .map((p, i) => ({ p, n: i + 1 }))
      .filter(({ p }) => p.session === session)
      .map(({ p, n }) => ({ n, publishAt: p.publishAt, time: TIME.format(new Date(p.publishAt)) })),
  }));

  return (
    <>
      <PageHeader
        title="Schedule"
        sub={`${DAY.format(new Date())} · New York time. A green row means that post has already gone out.`}
      />
      {sessions.map((s) => (
        <Card key={s.title} title={s.title}>
          <SessionRows rows={s.rows} />
        </Card>
      ))}
    </>
  );
}
