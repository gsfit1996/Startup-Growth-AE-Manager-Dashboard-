"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Command } from "cmdk";
import { CommandIcon, LayoutDashboard, Users, Building2, BarChart3, ClipboardList, FileText } from "lucide-react";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

type CommandItem = {
  id: string;
  label: string;
  hint?: string;
  href: string;
  icon: React.ReactNode;
};

const navItems: CommandItem[] = [
  { id: "dashboard", label: "Dashboard", hint: "Executive snapshot", href: "/dashboard", icon: <LayoutDashboard className="h-4 w-4" /> },
  { id: "accounts", label: "Accounts", hint: "Health and risk", href: "/accounts", icon: <Building2 className="h-4 w-4" /> },
  { id: "pipeline", label: "Pipeline", hint: "Scenario builder", href: "/pipeline", icon: <BarChart3 className="h-4 w-4" /> },
  { id: "team", label: "Team", hint: "Coaching", href: "/team", icon: <Users className="h-4 w-4" /> },
  { id: "playbooks", label: "Playbooks", hint: "Operating frameworks", href: "/playbooks", icon: <ClipboardList className="h-4 w-4" /> },
  { id: "resume", label: "Resume", hint: "Candidate profile", href: "/resume", icon: <FileText className="h-4 w-4" /> },
];

const actionItems: CommandItem[] = [
  { id: "act1", label: "Open at-risk accounts", href: "/accounts?q=risk", icon: <CommandIcon className="h-4 w-4" /> },
  { id: "act2", label: "Open deal desk approvals", href: "/pipeline?q=pending", icon: <CommandIcon className="h-4 w-4" /> },
  { id: "act3", label: "Open coaching flags", href: "/dashboard?q=coaching", icon: <CommandIcon className="h-4 w-4" /> },
];

export function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const isShortcut = (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k";
      if (!isShortcut) return;
      event.preventDefault();
      setOpen((value) => !value);
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  function run(item: CommandItem) {
    setOpen(false);
    setSearch("");
    router.push(item.href);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-xl p-0">
        <DialogHeader className="border-b border-[color:var(--border)] px-4 py-3">
          <DialogTitle className="text-sm uppercase tracking-[0.14em] text-[color:var(--muted)]">Command Palette</DialogTitle>
          <DialogDescription>Jump to pages and manager workflows.</DialogDescription>
        </DialogHeader>
        <Command label="Command Palette" className="p-2">
          <Command.Input
            value={search}
            onValueChange={setSearch}
            placeholder="Search commands..."
            className="neo-focus mb-2 h-10 w-full rounded-lg border border-[color:var(--border)] bg-[color:var(--surface-0)] px-3 text-sm text-[color:var(--foreground)] outline-none"
          />
          <Command.List className="max-h-[340px] overflow-y-auto">
            <Command.Empty className="px-3 py-4 text-sm text-[color:var(--muted)]">No commands found.</Command.Empty>
            <Command.Group heading="Navigation" className="px-2 py-1 text-xs text-[color:var(--muted)]">
              {navItems.map((item) => (
                <Command.Item
                  key={item.id}
                  value={`${item.label} ${item.hint ?? ""}`}
                  onSelect={() => run(item)}
                  className="mt-1 flex cursor-pointer items-center justify-between rounded-md px-2 py-2 text-sm text-[color:var(--foreground)] data-[selected=true]:bg-white/[0.07]"
                >
                  <span className="flex items-center gap-2">
                    {item.icon}
                    {item.label}
                  </span>
                  {item.hint ? <span className="text-xs text-[color:var(--muted)]">{item.hint}</span> : null}
                </Command.Item>
              ))}
            </Command.Group>
            <Command.Group heading="Manager Actions" className="px-2 py-1 text-xs text-[color:var(--muted)]">
              {actionItems.map((item) => (
                <Command.Item
                  key={item.id}
                  value={item.label}
                  onSelect={() => run(item)}
                  className="mt-1 flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-sm text-[color:var(--foreground)] data-[selected=true]:bg-white/[0.07]"
                >
                  {item.icon}
                  {item.label}
                </Command.Item>
              ))}
            </Command.Group>
          </Command.List>
          <div className="flex items-center justify-between border-t border-[color:var(--border)] px-3 py-2 text-xs text-[color:var(--muted)]">
            <span>Press Enter to open</span>
            <span className="neo-pill px-2 py-0.5">Ctrl/Cmd + K</span>
          </div>
        </Command>
      </DialogContent>
    </Dialog>
  );
}
