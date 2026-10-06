import { DEFAULT_SCHEDULE as S, todayIn } from "@/lib/config";
import { buildPlan, zonedToUtcIso } from "@/lib/schedule";
import { Card, PageHeader } from "../ui";

export default function SchedulePage() {
  const today = todayIn(S.timeZone);
  const plan = buildPlan(S, today, 1);
  const time = new Intl.DateTimeFormat("en-AU", { timeZone: S.timeZone, hour: "numeric", minute: "2-digit" });
  const day = new Intl.DateTimeFormat("en-AU", { timeZone: S.timeZone, weekday: "long", day: "numeric", month: "long" });

  return (
    <>
      <PageHeader
        title="Schedule"
        sub={`Today's posts, ${day.format(new Date())} (Sydney time). Every line below is one post to all four platforms.`}
      />

      {S.sessionTimes.map((sessionTime, session) => {
        const rows = plan.filter((p) => p.session === session);
        return (
          <Card key={sessionTime} title={`Session ${session + 1} · ${time.format(new Date(zonedToUtcIso(today, sessionTime, S.timeZone)))}`}>
            <ul className="divide-y divide-stone-100">
              {rows.map((p) => (
                <li key={p.account} className="flex flex-wrap items-center justify-between gap-2 py-3 text-base">
                  <span className="font-medium text-stone-800">Account {p.account + 1}</span>
                  <span className="text-stone-500">
                    Clip {p.clip + 1} · Hook {p.hook + 1}
                  </span>
                  <span className="text-stone-500">{time.format(new Date(p.publishAt))}</span>
                </li>
              ))}
            </ul>
          </Card>
        );
      })}
    </>
  );
}
