import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AccountsTable } from "@/components/tables/accounts-table";
import { parseFilters } from "@/lib/filters";
import { getAccountsData } from "@/lib/dashboard-data";

export default async function AccountsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const filters = parseFilters(await searchParams);
  const accounts = await getAccountsData(filters);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Accounts and Health</CardTitle>
        </CardHeader>
        <CardContent>
          <AccountsTable data={accounts} />
        </CardContent>
      </Card>
    </div>
  );
}
