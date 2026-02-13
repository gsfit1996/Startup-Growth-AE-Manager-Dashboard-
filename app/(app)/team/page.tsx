import { AePerformanceCard } from "@/components/team/ae-performance-card";
import { parseFilters } from "@/lib/filters";
import { getTeamData } from "@/lib/dashboard-data";

export default async function TeamPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const filters = parseFilters(await searchParams);
  const profiles = await getTeamData(filters);

  return (
    <div className="space-y-4">
      {profiles.map((profile) => (
        <section key={profile.aeId} data-reveal="true">
          <AePerformanceCard profile={profile} />
        </section>
      ))}
    </div>
  );
}
