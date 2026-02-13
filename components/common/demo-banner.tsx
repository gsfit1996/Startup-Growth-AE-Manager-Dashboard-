import { AlertTriangle } from "lucide-react";

export function DemoBanner() {
  return (
    <div className="flex flex-wrap items-center gap-2 border-b border-[color:var(--accent-amber)]/30 bg-[color:var(--accent-amber)]/10 px-4 py-2 text-xs text-[color:var(--accent-amber)]">
      <AlertTriangle className="h-3.5 w-3.5" />
      Synthetic data. For portfolio demonstration only.
      <span className="text-[color:var(--accent-amber)]/80">Production demo writes are ephemeral per server instance.</span>
    </div>
  );
}
