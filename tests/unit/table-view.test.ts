import { describe, expect, it } from "vitest";

import { parseTableView, resolveDensity, serializeTableView } from "@/lib/table-view";

describe("table view state", () => {
  it("serializes and parses persisted table view", () => {
    const raw = serializeTableView({
      density: "compact",
      globalFilter: "acme",
      pageSize: 20,
      sorting: [{ id: "arr", desc: true }],
      columnVisibility: { owner: true, region: false },
    });

    const parsed = parseTableView(raw);
    expect(parsed).not.toBeNull();
    expect(parsed?.density).toBe("compact");
    expect(parsed?.globalFilter).toBe("acme");
    expect(parsed?.pageSize).toBe(20);
  });

  it("resolves density fallbacks safely", () => {
    expect(resolveDensity("compact")).toBe("compact");
    expect(resolveDensity("comfortable")).toBe("comfortable");
    expect(resolveDensity("invalid")).toBe("comfortable");
    expect(resolveDensity(undefined, "compact")).toBe("compact");
  });
});

