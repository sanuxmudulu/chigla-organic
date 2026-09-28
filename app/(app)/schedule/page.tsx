import { Card, PageHeader } from "../ui";
import { DEFAULT_SCHEDULE as S } from "@/lib/config";
import { buildPlan } from "@/lib/schedule";

export default function SchedulePage() {
  const today = new Intl.DateTimeFormat("en-CA", { timeZone: S.timeZone }).format(new Date());
  const plan = buildPlan(S, today, 1);
  const time = new Intl.DateTimeFormat("en-AU", { timeZone: S.timeZone, hour: "numeric", minute: "2-digit" });
  return (
    <>
      <PageHeader
        title="Schedule"
        sub={`Preview of ${today} in ${S.timeZone}. Each row is one API call that posts to all 4 platforms. Session times are placeholders until the settings screen exists.`}
      />
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-zinc-500">
                {["Session", "Time", "Account", "Clip", "Hook"].map((h) => (
                  <th key={h} className="py-2 pr-4 font-medium">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {plan.map((p) => (
                <tr key={p.publishAt + p.account} className="border-t border-zinc-200 dark:border-zinc-800">
                  <td className="py-1.5 pr-4">{p.session + 1}</td>
                  <td className="py-1.5 pr-4">{time.format(new Date(p.publishAt))}</td>
                  <td className="py-1.5 pr-4">Account {p.account + 1}</td>
                  <td className="py-1.5 pr-4">Clip {p.clip + 1}</td>
                  <td className="py-1.5 pr-4">Hook {p.hook + 1}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}
