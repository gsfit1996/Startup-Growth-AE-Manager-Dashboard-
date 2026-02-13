"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, BookOpenCheck, Building2, ClipboardList, Home, Users, UserRound } from "lucide-react";

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
    <aside className="sticky top-0 hidden h-screen w-64 flex-shrink-0 border-r border-slate-800 bg-slate-950/90 px-4 py-6 lg:block">
      <div className="mb-8">
        <p className="text-xs uppercase tracking-[0.18em] text-teal-300">GTM Command Center</p>
        <h1 className="mt-2 text-lg font-semibold text-slate-100">Startup Growth AE Manager</h1>
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
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                active ? "bg-teal-600/20 text-teal-200" : "text-slate-300 hover:bg-slate-800 hover:text-slate-100",
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

