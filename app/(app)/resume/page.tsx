import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ResumePage() {
  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">
            Ex-founder (~â‚¬500k ARR) | AI automation + GTM systems | Sales leadership
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <ul className="list-disc space-y-2 pl-5 text-sm text-slate-200">
            <li>Scaled founder-led venture from 0 to ~â‚¬500k ARR while owning full-cycle sales, retention, and expansion motions.</li>
            <li>Built AI-driven acquisition and delivery automations that cut manual operational load by an estimated 35%.</li>
            <li>Hired and coached cross-functional team members to support repeatable GTM execution and customer onboarding quality.</li>
            <li>Designed forecasting and pipeline review rhythms that improved weekly visibility across commit, best case, and upside.</li>
            <li>Advised clinic growth operations, contributing to measurable throughput gains and improved client conversion velocity.</li>
          </ul>

          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500">Core Skills</p>
            <p className="mt-1 text-sm text-slate-300">
              sales leadership, GTM ops, forecasting, account planning, AI tooling
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button asChild>
              <a href="/resume-placeholder.pdf" download>
                Download PDF
              </a>
            </Button>
            <Button asChild variant="outline">
              <Link href="/dashboard">View Dashboard</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
