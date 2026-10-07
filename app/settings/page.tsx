import { dbProblem } from "@/lib/db";
import { getSettings } from "@/lib/settings";
import { Notice, PageHeader } from "../ui";
import { SettingsForm } from "./form";

export const metadata = { title: "Settings · CHIGLA" };

export default async function SettingsPage() {
  const { settings, error } = await getSettings();
  return (
    <>
      <PageHeader title="Settings" sub="Posting times and defaults. Times are New York time." />
      {dbProblem() && <Notice>{dbProblem()}</Notice>}
      {error && !dbProblem() && <Notice>Couldn&apos;t load saved settings, showing the defaults: {error}</Notice>}
      <SettingsForm initial={settings} />
    </>
  );
}
