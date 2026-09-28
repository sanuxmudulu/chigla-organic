import type { ScheduleConfig } from "./schedule.ts";

// Placeholder settings until the settings screen + database exist.
export const DEFAULT_SCHEDULE: ScheduleConfig = {
  accounts: 5,
  clips: 5,
  hooks: 5,
  sessionTimes: ["07:00", "10:00", "13:00", "18:00", "21:00"],
  staggerMinutes: 5,
  timeZone: "Australia/Sydney",
};
