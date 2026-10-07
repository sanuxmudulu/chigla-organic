"use client";

import { useState } from "react";
import { Card } from "../ui";

type Platform = "tiktok" | "instagram" | "youtube" | "facebook";
const PLATFORM_LABEL: Record<Platform, string> = {
  tiktok: "TikTok",
  instagram: "Instagram",
  youtube: "YouTube",
  facebook: "Facebook",
};
const ORDER: Platform[] = ["tiktok", "instagram", "youtube", "facebook"];

type Cell = { state: "connected" | "empty" | "reauth"; label: string };
export type ProfileRow = { profile: string; cells: Record<Platform, Cell> };

const chip: Record<Cell["state"], string> = {
  connected: "bg-emerald-100 text-emerald-800",
  empty: "bg-stone-100 text-stone-500",
  reauth: "bg-amber-100 text-amber-800",
};
const chipText: Record<Cell["state"], string> = {
  connected: "Connected",
  empty: "Not connected",
  reauth: "Needs reconnecting",
};

export function AccountsView({ rows }: { rows: ProfileRow[] }) {
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function connect(profile: string, platform: Platform) {
    setError(null);
    setBusy(`${profile}:${platform}`);
    // Open the window now, while the click still counts as a user action, then send it to the link.
    const win = window.open("", "_blank");
    try {
      const res = await fetch("/api/profiles/connect", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ username: profile, platform }),
      });
      const j = await res.json();
      if (!res.ok || !j.url) throw new Error(j.error ?? "Could not create the connect link.");
      (win ?? window).location.assign(j.url);
    } catch (e) {
      win?.close();
      setError((e as Error).message);
    } finally {
      setBusy(null);
    }
  }

  return (
    <>
      {error && <p className="rounded-xl bg-red-50 p-4 text-base text-red-800">{error}</p>}

      <Card className="overflow-x-auto">
        {rows.length === 0 ? (
          <p className="text-base text-stone-600">No profiles yet. Add one above, then connect its accounts.</p>
        ) : (
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="text-stone-500">
                <th className="py-2 pr-4 font-semibold">Profile</th>
                {ORDER.map((p) => (
                  <th key={p} className="py-2 pr-4 font-semibold">
                    {PLATFORM_LABEL[p]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.profile} className="border-t border-stone-200 align-top">
                  <td className="py-4 pr-4 font-semibold text-stone-900">{row.profile}</td>
                  {ORDER.map((platform) => {
                    const cell = row.cells[platform];
                    const key = `${row.profile}:${platform}`;
                    return (
                      <td key={platform} className="py-4 pr-4">
                        <div className="space-y-2">
                          <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${chip[cell.state]}`}>
                            {chipText[cell.state]}
                          </span>
                          {cell.state !== "empty" && <div className="text-stone-700">{cell.label}</div>}
                          {cell.state !== "connected" && (
                            <button
                              disabled={busy !== null}
                              onClick={() => connect(row.profile, platform)}
                              className="rounded-full bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-50"
                            >
                              {busy === key
                                ? "Opening..."
                                : cell.state === "empty"
                                  ? `Connect ${PLATFORM_LABEL[platform]} account`
                                  : "Reconnect"}
                            </button>
                          )}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </>
  );
}
