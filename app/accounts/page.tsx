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

export default async function AccountsPage() {
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
        sub="Each row is one profile and each column is one platform. To add an account, press Connect in an empty box. To remove an account, use Upload-Post."
      />

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
