import { test } from "node:test";
import assert from "node:assert/strict";
import { buildPlan, zonedToUtcIso, type ScheduleConfig } from "./schedule.ts";

const cfg: ScheduleConfig = {
  accounts: 5,
  clips: 5,
  hooks: 5,
  sessionTimes: ["07:00", "10:00", "13:00", "18:00", "21:00"],
  staggerMinutes: 5,
  timeZone: "Australia/Sydney",
};

test("each of the 25 videos is used exactly once per day", () => {
  for (let d = 0; d < 10; d++) {
    const day = buildPlan(cfg, "2026-10-05", 1, d);
    const seen = new Set(day.map((s) => `${s.clip}-${s.hook}`));
    assert.equal(day.length, 25);
    assert.equal(seen.size, 25);
  }
});

test("no account posts the same clip twice in a row, including across days", () => {
  const plan = buildPlan(cfg, "2026-10-05", 14);
  for (let a = 0; a < 5; a++) {
    const seq = plan.filter((s) => s.account === a).map((s) => s.clip);
    for (let i = 1; i < seq.length; i++) assert.notEqual(seq[i], seq[i - 1]);
  }
});

test("accounts in one session post 5 different clips, hook is fresh each session", () => {
  const plan = buildPlan(cfg, "2026-10-05", 1);
  for (let s = 0; s < 5; s++) {
    const sess = plan.filter((x) => x.session === s);
    assert.equal(new Set(sess.map((x) => x.clip)).size, 5);
  }
  const hooksBySession = [0, 1, 2, 3, 4].map((s) => plan.find((x) => x.session === s)!.hook);
  assert.equal(new Set(hooksBySession).size, 5);
});

test("accounts are staggered 5 minutes apart", () => {
  const plan = buildPlan(cfg, "2026-10-05", 1);
  const first = plan.filter((x) => x.session === 0).map((x) => x.publishAt);
  const diffs = first.slice(1).map((t, i) => (Date.parse(t) - Date.parse(first[i])) / 60000);
  assert.deepEqual(diffs, [5, 5, 5, 5]);
});

test("timezone conversion handles Sydney DST (AEDT +11 in Oct after DST start, AEST +10 in Jul)", () => {
  assert.equal(zonedToUtcIso("2026-10-05", "07:00", "Australia/Sydney"), "2026-10-04T20:00:00Z");
  assert.equal(zonedToUtcIso("2026-07-01", "07:00", "Australia/Sydney"), "2026-06-30T21:00:00Z");
});
