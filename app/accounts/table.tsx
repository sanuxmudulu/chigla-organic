"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Card } from "../ui";
import { PLATFORM_STYLE, PlatformLogo, type PlatformKey } from "../platform-logos";
import { setFacebookPageAction } from "../actions";

type Platform = PlatformKey;
const LABEL: Record<Platform, string> = { tiktok: "TikTok", instagram: "Instagram", youtube: "YouTube", facebook: "Facebook" };
const ORDER: Platform[] = ["tiktok", "instagram", "youtube", "facebook"];

export type AccountView =
  | { state: "empty" }
  | { state: "connected" | "reauth"; name: string; username: string };

export type ProfileView = {
  profile: string;
  facebookPageId: string | null;
  accounts: Record<Platform, AccountView>;
};

const STATUS: Record<AccountView["state"], { text: string; cls: string }> = {
  connected: { text: "Connected", cls: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-200" },
  reauth: { text: "Needs reconnecting", cls: "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-200" },
  empty: { text: "Not connected", cls: "bg-stone-100 text-stone-500 dark:bg-stone-800 dark:text-stone-400" },
};

export function AccountsView({ profiles, dbReady }: { profiles: ProfileView[]; dbReady: boolean }) {
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  async function connect(profile: string, platform: Platform) {
    setError(null);
    setBusy(`${profile}:${platform}`);
    // Open the window now, while the click still counts as a user action, then send it to the login.
    const win = window.open("", "_blank");
    try {
      const res = await fetch("/api/profiles/connect", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ username: profile, platform }),
      });
      const j = await res.json();
      if (!res.ok || !j.url) throw new Error(j.error ?? "Could not create the login link.");
      (win ?? window).location.assign(j.url);
    } catch (e) {
      win?.close();
      setError((e as Error).message);
    } finally {
      setBusy(null);
    }
  }

  if (profiles.length === 0)
    return <Card><p className="text-base text-stone-600">No profiles yet. Add one above, then connect its accounts.</p></Card>;

  return (
    <>
      {error && <p className="rounded-xl bg-red-50 p-4 text-base text-red-800 dark:bg-red-950/40 dark:text-red-200">{error}</p>}
      {profiles.map((p) => (
        <Card key={p.profile} className="!p-0 overflow-x-auto">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-200 px-6 py-4">
            <h2 className="text-xl font-semibold text-stone-900">{p.profile}</h2>
          </div>
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-stone-200 text-stone-500">
                <th className="px-6 py-3 font-semibold">Platform</th>
                <th className="px-6 py-3 font-semibold">Name</th>
                <th className="px-6 py-3 font-semibold">Username</th>
                <th className="px-6 py-3 font-semibold">Status</th>
                <th className="px-6 py-3 font-semibold">Action</th>
              </tr>
            </thead>
            <tbody>
              {ORDER.map((platform) => {
                const a = p.accounts[platform];
                const style = PLATFORM_STYLE[platform];
                const status = STATUS[a.state];
                const key = `${p.profile}:${platform}`;
                return (
                  <tr key={platform} className="border-b border-stone-200 last:border-0">
                    <td className="px-6 py-4 font-semibold text-stone-900">{LABEL[platform]}</td>
                    <td className="px-6 py-4 text-stone-700">{a.state === "empty" ? "—" : a.name || "—"}</td>
                    <td className="px-6 py-4 text-stone-700">{a.state === "empty" ? "—" : a.username || "—"}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${status.cls}`}>{status.text}</span>
                    </td>
                    <td className="px-6 py-4">
                      {a.state !== "connected" && (
                        <button
                          disabled={busy !== null}
                          onClick={() => connect(p.profile, platform)}
                          className={`inline-flex items-center gap-2 rounded-full border-2 bg-white px-3.5 py-1.5 text-sm font-semibold text-stone-900 transition hover:shadow-md disabled:opacity-50 dark:bg-black dark:text-white ${style.border}`}
                        >
                          <PlatformLogo platform={platform} />
                          {busy === key ? "Opening..." : a.state === "empty" ? "Connect" : "Reconnect"}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <FacebookPageField profile={p.profile} current={p.facebookPageId} disabled={!dbReady} />
        </Card>
      ))}
    </>
  );
}

// Facebook posts need the Page ID of the Page the video goes to. Saved per profile.
function FacebookPageField({ profile, current, disabled }: { profile: string; current: string | null; disabled: boolean }) {
  const router = useRouter();
  const [value, setValue] = useState(current ?? "");
  const [msg, setMsg] = useState<string | null>(null);
  const [pending, start] = useTransition();
  return (
    <div className="flex flex-wrap items-center gap-3 border-t border-stone-200 px-6 py-4 text-sm">
      <span className="text-stone-600">Facebook Page ID</span>
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="digits only"
        disabled={disabled}
        className="w-56 rounded-xl border border-stone-300 bg-white px-3 py-2 outline-none focus:border-indigo-500"
      />
      <button
        disabled={disabled || pending || value.trim() === (current ?? "")}
        onClick={() =>
          start(async () => {
            const r = await setFacebookPageAction(profile, value);
            setMsg(r.ok ? "Saved." : r.error);
            if (r.ok) router.refresh();
          })
        }
        className="rounded-full border border-stone-300 px-4 py-1.5 font-medium text-stone-700 hover:bg-stone-100 disabled:opacity-50"
      >
        Save
      </button>
      {msg && <span className="text-stone-500">{msg}</span>}
    </div>
  );
}
