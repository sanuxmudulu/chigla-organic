import { dbReady } from "@/lib/db";
import { getSettings } from "@/lib/settings";
import { Notice, PageHeader } from "../ui";
import { SettingsForm } from "./form";

export const metadata = { title: "Settings · Chigla Organic" };

export default async function SettingsPage() {
  const { settings, error } = await getSettings();
  return (
    <>
      <PageHeader title="Settings" sub="Posting times and defaults. Times are New York time." />
      {!dbReady() && <Notice>The database isn&apos;t connected yet. Changes can&apos;t be saved until it is.</Notice>}
      {error && dbReady() && <Notice>Couldn&apos;t load saved settings, showing the defaults: {error}</Notice>}
      <SettingsForm initial={settings} />
    </>
  );
}
