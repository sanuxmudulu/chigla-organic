import { listCaptions } from "@/lib/content";
import { dbReady } from "@/lib/db";
import { Card, Notice, PageHeader } from "../ui";
import { CaptionsEditor } from "./editor";

export const metadata = { title: "Captions · Chigla Organic" };

export default async function CaptionsPage() {
  let captions: Awaited<ReturnType<typeof listCaptions>> = [];
  let error: string | undefined;
  if (dbReady()) {
    try {
      captions = await listCaptions();
    } catch (e) {
      error = (e as Error).message;
    }
  }

  return (
    <>
      <PageHeader
        title="Captions"
        sub="The text that goes with each video. For every post, the app picks one active caption at random. Switch a caption off to pause it without deleting it."
      />
      {!dbReady() && <Notice>The database isn&apos;t connected yet, so captions can&apos;t be saved.</Notice>}
      {error && <Notice>{error}</Notice>}
      <CaptionsEditor captions={captions} />
      <Card title="Tip">
        <p className="text-base text-stone-600">TikTok captions can be up to 2,200 characters. Keep them short, with the call to action early.</p>
      </Card>
    </>
  );
}
