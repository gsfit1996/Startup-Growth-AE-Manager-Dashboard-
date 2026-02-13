export default function Loading() {
  return (
    <div className="space-y-3">
      <div className="h-8 w-64 animate-pulse rounded-md bg-white/[0.08]" />
      <div className="h-40 animate-pulse rounded-xl border border-[color:var(--border)] bg-white/[0.04]" />
      <div className="h-72 animate-pulse rounded-xl border border-[color:var(--border)] bg-white/[0.04]" />
    </div>
  );
}
