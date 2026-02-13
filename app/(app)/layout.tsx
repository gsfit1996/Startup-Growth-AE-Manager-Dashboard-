import { Suspense } from "react";

import { DemoBanner } from "@/components/common/demo-banner";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { CommandPalette } from "@/components/layout/command-palette";
import { Sidebar } from "@/components/layout/sidebar";
import { TopbarFilters } from "@/components/layout/topbar-filters";

export default function AppShellLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen">
      <Sidebar />
      <div className="flex min-h-screen flex-1 flex-col">
        <DemoBanner />
        <Suspense fallback={<div className="h-[61px] border-b border-slate-800 bg-slate-950/85" />}>
          <TopbarFilters />
        </Suspense>
        <main className="flex-1 px-4 pb-6 pt-4 lg:px-6">
          <div className="mb-4 flex items-center justify-between gap-3">
            <Breadcrumbs />
            <div className="neo-pill hidden items-center gap-2 px-2 py-1 text-xs text-[color:var(--muted)] md:flex">
              <span className="rounded bg-white/[0.08] px-1.5 py-0.5">Ctrl/Cmd + K</span>
              Command Palette
            </div>
          </div>
          {children}
        </main>
      </div>
      <CommandPalette />
    </div>
  );
}
