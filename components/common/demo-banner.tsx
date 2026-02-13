import { AlertTriangle } from "lucide-react";

export function DemoBanner() {
  return (
    <div className="flex flex-wrap items-center gap-2 border-b border-amber-500/30 bg-amber-500/10 px-4 py-2 text-xs text-amber-200">
      <AlertTriangle className="h-3.5 w-3.5" />
      Synthetic data. For portfolio demonstration only.
      <span className="text-amber-300/90">Production demo writes are ephemeral per server instance.</span>
    </div>
  );
}