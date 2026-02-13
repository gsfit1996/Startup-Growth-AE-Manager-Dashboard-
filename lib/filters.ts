import { z } from "zod";

export const filterSchema = z.object({
  quarter: z.enum(["Q1", "Q2", "Q3", "Q4"]).default("Q1"),
  segment: z.enum(["all", "seed", "series_a", "series_b_plus"]).default("all"),
  region: z.enum(["all", "emea", "na", "apac"]).default("all"),
  q: z.string().trim().default(""),
  density: z.enum(["compact", "comfortable"]).default("comfortable"),
  view: z.string().trim().default(""),
  sort: z.string().trim().default(""),
  dir: z.enum(["asc", "desc"]).default("desc"),
});

export type DashboardFilters = z.infer<typeof filterSchema>;

export function parseFilters(input: Record<string, string | string[] | undefined>): DashboardFilters {
  return filterSchema.parse({
    quarter: asString(input.quarter),
    segment: asString(input.segment),
    region: asString(input.region),
    q: asString(input.q),
    density: asString(input.density),
    view: asString(input.view),
    sort: asString(input.sort),
    dir: asString(input.dir),
  });
}

function asString(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) {
    return value[0];
  }
  return value;
}
