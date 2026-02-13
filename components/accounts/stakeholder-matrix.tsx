type Stakeholder = {
  id: string;
  name: string;
  role: string;
  seniority: string;
};

function roleScore(role: string) {
  if (role.toLowerCase().includes("economic")) return 5;
  if (role.toLowerCase().includes("finance")) return 4;
  if (role.toLowerCase().includes("procurement")) return 4;
  if (role.toLowerCase().includes("product")) return 3;
  if (role.toLowerCase().includes("technical")) return 3;
  return 2;
}

export function StakeholderMatrix({ stakeholders }: { stakeholders: Stakeholder[] }) {
  const sorted = [...stakeholders].sort((left, right) => roleScore(right.role) - roleScore(left.role));
  const avgInfluence = sorted.length > 0 ? sorted.reduce((acc, item) => acc + roleScore(item.role), 0) / sorted.length : 0;

  return (
    <div className="space-y-3">
      <div className="rounded-lg border border-[color:var(--border)] bg-white/[0.02] p-3">
        <p className="text-xs uppercase tracking-[0.1em] text-[color:var(--muted)]">Stakeholder Coverage</p>
        <p className="mt-1 text-sm text-[color:var(--foreground)]">
          {sorted.length} mapped stakeholders | Avg influence {avgInfluence.toFixed(1)}/5
        </p>
      </div>

      <div className="space-y-2">
        {sorted.map((stakeholder) => (
          <div key={stakeholder.id} className="rounded-md border border-[color:var(--border)] bg-white/[0.02] p-2 text-sm">
            <p className="font-medium text-[color:var(--foreground)]">{stakeholder.name}</p>
            <p className="text-xs text-[color:var(--muted)]">
              {stakeholder.role} | {stakeholder.seniority}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

