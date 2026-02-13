"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { formatCurrency } from "@/lib/format";

type PreviewAccount = {
  id: string;
  name: string;
  segment: string;
  region: string;
  arr: number;
  renewalDate: string;
  aiMaturity: string;
  healthScore: number;
  owner: string;
  paymentStatus: string;
  openPipeline: number;
  qbrStatus: string;
  accountPlanCompleteness: number;
};

export function AccountPreviewDrawer({
  account,
  open,
  onOpenChange,
}: {
  account: PreviewAccount | null;
  open: boolean;
  onOpenChange: (value: boolean) => void;
}) {
  if (!account) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{account.name}</DialogTitle>
          <DialogDescription>
            {account.segment} | {account.region} | Owner {account.owner}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg border border-[color:var(--border)] p-3 text-sm">
            <p className="text-[color:var(--muted)]">ARR</p>
            <p className="text-lg font-semibold">{formatCurrency(account.arr)}</p>
          </div>
          <div className="rounded-lg border border-[color:var(--border)] p-3 text-sm">
            <p className="text-[color:var(--muted)]">Open Pipeline</p>
            <p className="text-lg font-semibold">{formatCurrency(account.openPipeline)}</p>
          </div>
          <div className="rounded-lg border border-[color:var(--border)] p-3 text-sm">
            <p className="text-[color:var(--muted)]">Renewal Date</p>
            <p className="font-medium">{account.renewalDate}</p>
          </div>
          <div className="rounded-lg border border-[color:var(--border)] p-3 text-sm">
            <p className="text-[color:var(--muted)]">Plan Completeness</p>
            <p className="font-medium">{account.accountPlanCompleteness}%</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={account.healthScore >= 75 ? "success" : account.healthScore >= 60 ? "warning" : "danger"}>
            Health {account.healthScore}
          </Badge>
          <Badge variant="info">AI {account.aiMaturity}</Badge>
          <Badge variant={account.qbrStatus === "OVERDUE" ? "danger" : account.qbrStatus === "SCHEDULED" ? "warning" : "success"}>
            QBR {account.qbrStatus}
          </Badge>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button size="sm" variant="outline">
            Schedule QBR
          </Button>
          <Button size="sm" variant="outline">
            Exec Sponsor
          </Button>
          <Button size="sm" asChild>
            <Link href={`/accounts/${account.id}`}>
              Open Full Account
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

