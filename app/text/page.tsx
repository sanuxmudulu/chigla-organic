import { listCaptions, listHashtags } from "@/lib/content";
import { dbReady } from "@/lib/db";
import { Notice, PageHeader } from "../ui";
import { CaptionsCard } from "./captions";
import { HashtagsCard } from "./hashtags";

export const metadata = { title: "Text · CHIGLA" };

export default async function TextPage() {
  let captions: Awaited<ReturnType<typeof listCaptions>> = [];
  let tags: Awaited<ReturnType<typeof listHashtags>> = [];
  let error: string | undefined;
  if (dbReady()) {
    try {
      [captions, tags] = await Promise.all([listCaptions(), listHashtags()]);
    } catch (e) {
      error = (e as Error).message;
    }
  }

  return (
    <>
      <PageHeader title="Text" />
      {!dbReady() && <Notice>The database isn&apos;t connected yet, so nothing can be saved here.</Notice>}
      {error && <Notice>{error}</Notice>}
      <div className="grid gap-6 lg:grid-cols-2">
        <CaptionsCard captions={captions} />
        <HashtagsCard tags={tags} />
      </div>
    </>
  );
}
