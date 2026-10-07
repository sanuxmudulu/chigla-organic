"use client";

import { useNow } from "../live";

export type SessionView = {
  title: string;
  rows: { n: number; publishAt: string; time: string }[];
};

export function SessionRows({ rows }: { rows: SessionView["rows"] }) {
  const now = useNow();
  return (
    <ul className="space-y-2">
      {rows.map((r) => {
        const done = now !== null && Date.parse(r.publishAt) <= now;
        return (
          <li
            key={r.n}
            className={`flex items-center justify-between rounded-lg px-4 py-3 text-base ${
              done ? "bg-emerald-100 text-emerald-900" : "bg-stone-50 text-stone-800"
            }`}
          >
            <span className="font-semibold">Post {r.n}</span>
            <span>{r.time}</span>
          </li>
        );
      })}
    </ul>
  );
}
