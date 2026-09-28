import { Card, PageHeader } from "../ui";

const platforms = ["TikTok", "Instagram", "YouTube", "Facebook"];

export default function AccountsPage() {
  return (
    <>
      <PageHeader title="Accounts" sub="Skeleton. Will show the 5 Upload-Post profiles and which platforms are connected." />
      <Card>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-zinc-500">
              <th className="py-2 pr-4 font-medium">Profile</th>
              {platforms.map((p) => (
                <th key={p} className="py-2 pr-4 font-medium">
                  {p}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[1, 2, 3, 4, 5].map((n) => (
              <tr key={n} className="border-t border-zinc-200 dark:border-zinc-800">
                <td className="py-2 pr-4">Account {n}</td>
                {platforms.map((p) => (
                  <td key={p} className="py-2 pr-4 text-zinc-400">
                    not connected
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </>
  );
}
