import { Suspense } from "react";

import { DemoBanner } from "@/components/common/demo-banner";
import { Sidebar } from "@/components/layout/sidebar";
import { TopbarFilters } from "@/components/layout/topbar-filters";

export default function AppShellLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex min-h-screen flex-1 flex-col">
        <DemoBanner />
        <Suspense fallback={<div className="h-[61px] border-b border-slate-800 bg-slate-950/85" />}>
          <TopbarFilters />
        </Suspense>
        <main className="flex-1 p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
