import { listHashtags } from "@/lib/content";
import { dbReady } from "@/lib/db";
import { getSettings } from "@/lib/settings";
import { Card, Notice, PageHeader } from "../ui";
import { HashtagsEditor } from "./editor";

export const metadata = { title: "Hashtags · Chigla Organic" };

export default async function HashtagsPage() {
  let tags: Awaited<ReturnType<typeof listHashtags>> = [];
  let error: string | undefined;
  if (dbReady()) {
    try {
      tags = await listHashtags();
    } catch (e) {
      error = (e as Error).message;
    }
  }
  const { settings } = await getSettings();

  return (
    <>
      <PageHeader
        title="Hashtags"
        sub="Tags are grouped by clip. Each post gets a random selection from its clip's tags (plus any tags set to All clips), on each platform that is ticked. How many per platform is set in Settings."
      />
      {!dbReady() && <Notice>The database isn&apos;t connected yet, so hashtags can&apos;t be saved.</Notice>}
      {error && <Notice>{error}</Notice>}
      <HashtagsEditor tags={tags} perPlatform={settings.tagsPerPlatform} />
      <Card title="Tip">
        <p className="text-base text-stone-600">Use &quot;All clips&quot; for general tags, and a clip number for tags that match that clip&apos;s video.</p>
      </Card>
    </>
  );
}
