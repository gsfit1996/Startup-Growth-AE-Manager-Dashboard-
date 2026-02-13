"use client";

import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";

type PlaybookTemplate = {
  id: string;
  title: string;
  objective: string;
  checklist: string[];
};

const templates: PlaybookTemplate[] = [
  {
    id: "renewal-save",
    title: "At-risk renewal save plan (7-day sprint)",
    objective: "Recover executive alignment and lock a renewal path in one week.",
    checklist: [
      "Day 1: risk alignment call and stakeholder map refresh",
      "Day 2: product/CS escalation and usage root-cause summary",
      "Day 3: value recap and quantified ROI memo",
      "Day 4: commercial options with give/get matrix",
      "Day 5: exec sponsor call and final objection handling",
      "Day 6: legal/procurement acceleration",
      "Day 7: renewal close plan and post-renewal success checkpoint",
    ],
  },
  {
    id: "land-expand",
    title: "Expansion motion (land to expand) for AI startups",
    objective: "Expand from pilot workloads to org-wide production usage.",
    checklist: [
      "Define initial workload win criteria",
      "Map second and third use-cases by team",
      "Attach budget owner and timeline",
      "Run ROI workshop with technical + economic buyer",
      "Sequence expansion proposal by value milestone",
    ],
  },
  {
    id: "multithread",
    title: "Technical champion to economic buyer multi-threading checklist",
    objective: "Prevent single-thread risk and secure budget authority.",
    checklist: [
      "Champion influence validated",
      "Economic buyer identified and introduced",
      "Security/compliance stakeholder engaged",
      "Ops owner agrees success metrics",
      "Executive narrative rehearsed before QBR",
    ],
  },
  {
    id: "negotiation",
    title: "Deal negotiation framework (guardrails + give/get)",
    objective: "Protect margin while accelerating close confidence.",
    checklist: [
      "Confirm requested discount and driver",
      "Apply approval guardrail threshold",
      "Define give/get trade (term, scope, logo rights)",
      "Escalate exception path if needed",
      "Document final package and rationale",
    ],
  },
  {
    id: "qbr",
    title: "QBR agenda template (value, roadmap, adoption, success plan)",
    objective: "Run a repeatable value-centered quarterly review.",
    checklist: [
      "Business outcomes review",
      "Adoption and usage trajectory",
      "Roadmap and technical dependencies",
      "Risk review and mitigation owners",
      "Next-quarter success plan and milestones",
    ],
  },
];

function storageKey(id: string) {
  return `playbook-${id}`;
}

function loadStoredState() {
  if (typeof window === "undefined") {
    return {
      notes: {} as Record<string, string>,
      checks: {} as Record<string, Record<number, boolean>>,
    };
  }

  const nextNotes: Record<string, string> = {};
  const nextChecks: Record<string, Record<number, boolean>> = {};

  for (const template of templates) {
    const raw = window.localStorage.getItem(storageKey(template.id));
    if (!raw) continue;

    const parsed = JSON.parse(raw) as { notes: string; checks: Record<number, boolean> };
    nextNotes[template.id] = parsed.notes;
    nextChecks[template.id] = parsed.checks;
  }

  return {
    notes: nextNotes,
    checks: nextChecks,
  };
}

export function PlaybookTemplates() {
  const [activeId, setActiveId] = useState(templates[0].id);
  const [notes, setNotes] = useState<Record<string, string>>(() => loadStoredState().notes);
  const [checks, setChecks] = useState<Record<string, Record<number, boolean>>>(() => loadStoredState().checks);

  const active = useMemo(() => templates.find((template) => template.id === activeId)!, [activeId]);

  function persist(id: string, nextNotes: string, nextChecks: Record<number, boolean>) {
    window.localStorage.setItem(storageKey(id), JSON.stringify({ notes: nextNotes, checks: nextChecks }));
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
      <Card>
        <CardHeader>
          <CardTitle>Playbooks</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {templates.map((template) => (
            <Button
              key={template.id}
              variant={template.id === activeId ? "default" : "outline"}
              className="w-full justify-start text-left"
              onClick={() => setActiveId(template.id)}
            >
              {template.title}
            </Button>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{active.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-slate-300">{active.objective}</p>
          <div className="space-y-2">
            {active.checklist.map((item, idx) => {
              const checked = checks[active.id]?.[idx] ?? false;
              return (
                <label
                  key={item}
                  className="flex items-center gap-2 rounded-md border border-slate-800 px-3 py-2 text-sm text-slate-200"
                >
                  <Checkbox
                    checked={checked}
                    onChange={(event) => {
                      const nextChecks = {
                        ...(checks[active.id] ?? {}),
                        [idx]: event.target.checked,
                      };

                      setChecks((current) => ({
                        ...current,
                        [active.id]: nextChecks,
                      }));

                      persist(active.id, notes[active.id] ?? "", nextChecks);
                    }}
                  />
                  {item}
                </label>
              );
            })}
          </div>

          <label className="space-y-1 text-xs text-slate-400">
            Working Notes
            <Textarea
              value={notes[active.id] ?? ""}
              onChange={(event) => {
                const nextValue = event.target.value;
                setNotes((current) => ({ ...current, [active.id]: nextValue }));
                persist(active.id, nextValue, checks[active.id] ?? {});
              }}
            />
          </label>
        </CardContent>
      </Card>
    </div>
  );
}

