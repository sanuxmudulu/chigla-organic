// Usage: node --env-file=.env.local scripts/check-drive.ts
import { findRootFolder, listClips } from "../lib/drive.ts";

const root = await findRootFolder();
console.log(`Root folder: ${root.name} (${root.id})`);
const clips = await listClips(root.id);
if (clips.length === 0) console.log("No clipN sub-folders found.");
for (const c of clips) {
  console.log(`\n${c.folderName}: ${c.videos.length} video(s)`);
  c.videos.forEach((v, i) =>
    console.log(`  hook ${i + 1}: ${v.name}  ${v.size ? (v.size / 1e6).toFixed(1) + " MB" : ""}`),
  );
}
const total = clips.reduce((n, c) => n + c.videos.length, 0);
console.log(`\nTotal: ${clips.length} clips, ${total} videos`);
