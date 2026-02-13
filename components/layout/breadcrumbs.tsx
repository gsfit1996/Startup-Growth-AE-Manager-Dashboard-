"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";

const labelMap: Record<string, string> = {
  dashboard: "Dashboard",
  accounts: "Accounts",
  pipeline: "Pipeline",
  team: "Team",
  playbooks: "Playbooks",
  resume: "Resume",
  "demo-notes": "Demo Notes",
};

function segmentLabel(segment: string) {
  if (labelMap[segment]) {
    return labelMap[segment];
  }
  if (segment.length > 20) {
    return `Account ${segment.slice(0, 8)}`;
  }
  return segment.replaceAll("-", " ");
}

export function Breadcrumbs() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  return (
    <div className="flex items-center gap-1 overflow-x-auto text-xs text-[color:var(--muted)]">
      <Link href="/dashboard" className="hover:text-[color:var(--foreground)]">
        Command Center
      </Link>
      {segments.map((segment, index) => {
        const href = `/${segments.slice(0, index + 1).join("/")}`;
        return (
          <div key={href} className="flex items-center gap-1">
            <ChevronRight className="h-3 w-3" />
            <Link href={href} className="whitespace-nowrap capitalize hover:text-[color:var(--foreground)]">
              {segmentLabel(segment)}
            </Link>
          </div>
        );
      })}
    </div>
  );
}

