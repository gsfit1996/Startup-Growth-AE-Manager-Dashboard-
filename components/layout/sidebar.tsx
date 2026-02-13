"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, BookOpenCheck, Building2, ClipboardList, Home, Users, UserRound, Sparkles } from "lucide-react";

import { cn } from "@/lib/utils";

const nav = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/accounts", label: "Accounts", icon: Building2 },
  { href: "/pipeline", label: "Pipeline", icon: BarChart3 },
  { href: "/team", label: "Team", icon: Users },
  { href: "/playbooks", label: "Playbooks", icon: ClipboardList },
  { href: "/resume", label: "Resume", icon: UserRound },
  { href: "/demo-notes", label: "Demo Notes", icon: BookOpenCheck },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 hidden h-screen w-72 flex-shrink-0 border-r border-[color:var(--border)] bg-[color:var(--base-1)]/90 px-4 py-6 lg:block">
      <div className="mb-7 space-y-3">
        <div className="flex items-center gap-2">
          <span className="rounded-xl border border-[color:var(--border)] bg-white/[0.03] p-2 text-[color:var(--accent-teal)]">
            <Sparkles className="h-4 w-4" />
          </span>
          <div>
            <p className="text-[11px] uppercase tracking-[0.2em] text-[color:var(--muted)]">GTM Command Center</p>
            <h1 className="text-base font-semibold text-[color:var(--foreground)]">Startup Growth AE Manager</h1>
          </div>
        </div>
        <div className="neo-panel rounded-lg p-3 text-xs text-[color:var(--muted)]">
          <p className="uppercase tracking-[0.14em]">Cadence</p>
          <p className="mt-1 text-[color:var(--foreground)]">Weekly forecast review and risk triage in one workspace.</p>
        </div>
      </div>
      <nav className="space-y-1">
        {nav.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition",
                active
                  ? "bg-[color:var(--accent-teal)]/12 text-[color:var(--foreground)]"
                  : "text-[color:var(--muted)] hover:bg-white/[0.04] hover:text-[color:var(--foreground)]",
              )}
            >
              <span
                className={cn(
                  "absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-transparent transition",
                  active ? "bg-[color:var(--accent-teal)]" : "group-hover:bg-white/[0.2]",
                )}
              />
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

