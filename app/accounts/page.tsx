import { listProfileDetails } from "@/lib/content";
import { dbReady } from "@/lib/db";
import { listProfiles, PLATFORMS, type Profile } from "@/lib/uploadpost";
import { Card, Notice, PageHeader } from "../ui";
import { AccountsView, type ProfileView } from "./table";
import { AddProfile } from "./add-profile";

export const metadata = { title: "Accounts · Chigla Organic" };

// Turn Upload-Post's profile data into one view per profile, one entry per platform.
function toViews(profiles: Profile[], pageIds: Record<string, string | null>): ProfileView[] {
  return profiles.map((p) => ({
    profile: p.username,
    facebookPageId: pageIds[p.username] ?? null,
    accounts: Object.fromEntries(
      PLATFORMS.map((platform) => {
        const acc = p.social_accounts?.[platform];
        if (!acc) return [platform, { state: "empty" as const }];
        return [
          platform,
          {
            state: acc.reauth_required ? ("reauth" as const) : ("connected" as const),
            name: acc.display_name ?? "",
            username: acc.handle || acc.username || "",
          },
        ];
      }),
    ) as ProfileView["accounts"],
  }));
}

export default async function AccountsPage({
  searchParams,
}: {
  searchParams: Promise<{ connect_status?: string; platform?: string; error_code?: string; profile?: string }>;
}) {
  const sp = await searchParams;
  let views: ProfileView[] = [];
  let error: string | undefined;
  let dbNote: string | undefined;
  try {
    const profiles = await listProfiles();
    let pageIds: Record<string, string | null> = {};
    if (dbReady()) {
      try {
        pageIds = Object.fromEntries((await listProfileDetails()).map((d) => [d.username, d.facebook_page_id]));
      } catch (e) {
        dbNote = `Facebook Page IDs couldn't be loaded: ${(e as Error).message}`;
      }
    }
    views = toViews(profiles, pageIds);
  } catch (e) {
    error = (e as Error).message;
  }

  const banner = bannerFor(sp);

  return (
    <>
      <PageHeader
        title="Accounts"
        sub="One table per profile. Each row is a platform. Press Connect on an empty row to log in to that account."
      />

      {banner && (
        <p className={`rounded-xl p-4 text-base ${banner.ok ? "bg-emerald-50 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200" : "bg-red-50 text-red-800 dark:bg-red-950/40 dark:text-red-200"}`}>
          {banner.text}
        </p>
      )}
      {dbNote && <Notice>{dbNote}</Notice>}

      <Card title="Add a profile">
        <AddProfile />
      </Card>

      {error ? (
        <Card>
          <p className="text-base text-red-600">Can&apos;t load profiles from Upload-Post: {error}</p>
        </Card>
      ) : (
        <AccountsView profiles={views} dbReady={dbReady()} />
      )}
    </>
  );
}

const PLATFORM_NAME: Record<string, string> = { tiktok: "TikTok", instagram: "Instagram", youtube: "YouTube", facebook: "Facebook" };

// Shown after she comes back from the platform's login page.
function bannerFor(sp: { connect_status?: string; platform?: string; error_code?: string; profile?: string }) {
  if (!sp.connect_status) return null;
  const who = `${PLATFORM_NAME[sp.platform ?? ""] ?? sp.platform ?? "Account"}${sp.profile ? ` on ${sp.profile}` : ""}`;
  if (sp.connect_status === "success") return { ok: true, text: `${who} is connected.` };
  if (sp.connect_status === "cancelled") return { ok: false, text: `Connecting ${who} was cancelled.` };
  return { ok: false, text: `Connecting ${who} failed${sp.error_code ? ` (${sp.error_code})` : ""}. Try again.` };
}
