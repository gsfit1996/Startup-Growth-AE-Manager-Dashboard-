import { describe, expect, it } from "vitest";

import { parseFilters } from "@/lib/filters";

describe("parseFilters", () => {
  it("applies defaults when params are missing", () => {
    const result = parseFilters({});

    expect(result.quarter).toBe("Q1");
    expect(result.segment).toBe("all");
    expect(result.region).toBe("all");
    expect(result.density).toBe("comfortable");
  });

  it("uses explicit URL params", () => {
    const result = parseFilters({
      quarter: "Q3",
      segment: "series_a",
      region: "emea",
      q: "alpha",
      density: "compact",
      sort: "arr",
      dir: "asc",
      view: "risk-focus",
    });

    expect(result).toMatchObject({
      quarter: "Q3",
      segment: "series_a",
      region: "emea",
      q: "alpha",
      density: "compact",
      sort: "arr",
      dir: "asc",
      view: "risk-focus",
    });
  });
});
