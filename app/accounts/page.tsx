import { listProfiles, PLATFORMS, type Platform, type Profile } from "@/lib/uploadpost";
import { Card, PageHeader } from "../ui";
import { AccountsView, type ProfileRow } from "./table";
import { AddProfile } from "./add-profile";

export const metadata = { title: "Accounts · Chigla Organic" };

// One row per profile. Each cell is one platform account on that profile.
function toRows(profiles: Profile[]): ProfileRow[] {
  return profiles.map((p) => ({
    profile: p.username,
    cells: Object.fromEntries(
      PLATFORMS.map((platform: Platform) => {
        const acc = p.social_accounts?.[platform];
        if (!acc) return [platform, { state: "empty" as const, label: "" }];
        const label = acc.display_name || acc.handle || acc.username || "Connected";
        if (acc.reauth_required) return [platform, { state: "reauth" as const, label }];
        return [platform, { state: "connected" as const, label }];
      }),
    ) as ProfileRow["cells"],
  }));
}

const PLATFORM_NAME: Record<string, string> = {
  tiktok: "TikTok",
  instagram: "Instagram",
  youtube: "YouTube",
  facebook: "Facebook",
};

// Shown after she comes back from the platform's login page.
function resultBanner(sp: { connect_status?: string; platform?: string; error_code?: string; profile?: string }) {
  if (!sp.connect_status) return null;
  const who = `${PLATFORM_NAME[sp.platform ?? ""] ?? sp.platform ?? "Account"}${sp.profile ? ` on ${sp.profile}` : ""}`;
  if (sp.connect_status === "success")
    return { ok: true, text: `${who} is connected.` };
  if (sp.connect_status === "cancelled")
    return { ok: false, text: `Connecting ${who} was cancelled.` };
  return { ok: false, text: `Connecting ${who} failed${sp.error_code ? ` (${sp.error_code})` : ""}. Try again.` };
}

export default async function AccountsPage({
  searchParams,
}: {
  searchParams: Promise<{ connect_status?: string; platform?: string; error_code?: string; profile?: string }>;
}) {
  const banner = resultBanner(await searchParams);
  let rows: ProfileRow[] = [];
  let error: string | undefined;
  try {
    rows = toRows(await listProfiles());
  } catch (e) {
    error = (e as Error).message;
  }

  return (
    <>
      <PageHeader
        title="Accounts"
        sub="Each row is one profile and each column is one platform. Press Connect in an empty box to log in to that account."
      />

      {banner && (
        <p
          className={`rounded-xl p-4 text-base ${
            banner.ok ? "bg-emerald-50 text-emerald-900" : "bg-red-50 text-red-800"
          }`}
        >
          {banner.text}
        </p>
      )}

      <Card title="Add a profile">
        <AddProfile />
      </Card>

      {error ? (
        <Card>
          <p className="text-base text-red-600">Can&apos;t load profiles from Upload-Post: {error}</p>
        </Card>
      ) : (
        <AccountsView rows={rows} />
      )}
    </>
  );
}
